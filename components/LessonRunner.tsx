
import React, { useState, useEffect, useRef } from 'react';
import { StudyTopic, GeneratedLesson, Card, Rule, ItemType } from '../types';
import { createAIClient, getFriendlyErrorMessage } from '../lib/gemini';

interface LessonRunnerProps {
  topic: StudyTopic;
  onComplete: () => void;
  onSaveContent: (rules: Partial<Rule>[], cards: Partial<Card>[]) => void;
  onBack: () => void;
}

type LessonPhase = 'loading' | 'content' | 'quiz' | 'practice' | 'evaluation' | 'success';

const LessonRunner: React.FC<LessonRunnerProps> = ({ topic, onComplete, onSaveContent, onBack }) => {
  const [phase, setPhase] = useState<LessonPhase>('loading');
  const [lessonData, setLessonData] = useState<GeneratedLesson | null>(null);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  
  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Practice State
  const [userResponse, setUserResponse] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{ passed: boolean; message: string; correction?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateLesson();
  }, [topic]);

  const generateLesson = async () => {
    setPhase('loading');
    setError(null);
    try {
      const ai = createAIClient();
      const prompt = `
        Create an English lesson for the topic: "${topic.title}" (Level ${topic.level}).
        Grammar Focus: ${topic.description}.
        
        CRITICAL INSTRUCTIONS:
        1. Explain the grammar rule clearly in Russian.
        2. Provide 2-3 English examples for the rule.
        3. GENERATE EXACTLY ${topic.vocabCount} NEW WORDS/PHRASES related to: "${topic.vocabTheme}".
        4. Generate a QUIZ with exactly 5 multiple-choice questions testing this grammar/vocabulary.
        5. Write a short context/intro for a practice dialog.

        Return ONLY JSON:
        {
          "rule": { "title": "...", "explanation": "...", "examples": ["...", "..."] },
          "words": [ { "front": "English", "back": "Russian", "type": "Word" or "Phrase", "example": "Sentence" }, ... ], 
          "quiz": [ 
            { "question": "Sentence with missing part or question", "options": ["opt1", "opt2", "opt3"], "correctIndex": 0 }, 
            ... (5 items)
          ],
          "dialogIntro": "Context description for practice"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setLessonData(data);
        // Select all words by default
        setSelectedWords(new Set(data.words.map((_: any, i: number) => i)));
        setPhase('content');
      } else {
        throw new Error("No data received");
      }
    } catch (e: any) {
      console.error(e);
      setError(getFriendlyErrorMessage(e));
    }
  };

  const toggleWordSelection = (index: number) => {
      const newSet = new Set(selectedWords);
      if (newSet.has(index)) {
          newSet.delete(index);
      } else {
          newSet.add(index);
      }
      setSelectedWords(newSet);
  };

  const handleSaveAndStartQuiz = () => {
    if (!lessonData) return;
    
    // Save Content
    const newRule: Partial<Rule> = {
        title: lessonData.rule.title,
        explanation: lessonData.rule.explanation,
        examples: lessonData.rule.examples,
        level: topic.level,
        type: ItemType.Rule
    };

    // Filter only selected words
    const wordsToSave = lessonData.words.filter((_, i) => selectedWords.has(i));

    const newCards: Partial<Card>[] = wordsToSave.map(w => ({
        front: w.front,
        back: w.back,
        example: w.example,
        type: w.type === 'Phrase' ? ItemType.Phrase : ItemType.Word,
        level: topic.level,
        tags: ['Lesson', topic.level, topic.category]
    }));

    onSaveContent([newRule], newCards);
    setPhase('quiz');
  };

  const handleQuizOptionClick = (index: number) => {
    if (isQuizAnswered) return;
    setQuizSelection(index);
    setIsQuizAnswered(true);
    if (index === lessonData?.quiz[currentQuizIndex].correctIndex) {
        setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
      if (!lessonData) return;
      if (currentQuizIndex < lessonData.quiz.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setQuizSelection(null);
          setIsQuizAnswered(false);
      } else {
          setPhase('practice');
      }
  };

  const submitPractice = async () => {
    if (!userResponse.trim() || !lessonData) return;
    setPhase('evaluation');

    try {
      const ai = createAIClient();
      const prompt = `
        Topic: ${topic.title}. 
        Rule taught: ${lessonData.rule.title}.
        Context: ${lessonData.dialogIntro}.
        
        User wrote: "${userResponse}".

        Evaluate if the user understood the topic and used the grammar/vocabulary correctly.
        Return ONLY JSON:
        {
          "passed": boolean,
          "message": "Feedback in Russian",
          "correction": "Corrected English version if needed"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setAiFeedback(result);
        if (result.passed) {
             setPhase('success');
             setTimeout(onComplete, 3000); 
        }
      }
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
      setPhase('practice'); // Go back to allow retry
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Генерация урока...</h2>
             <p className="text-slate-400">Тема: {topic.title}</p>
             <p className="text-emerald-400 text-sm font-bold mt-2">ИИ подбирает слова и готовит тест...</p>
        </div>
        {error && (
            <div className="text-red-300 bg-red-500/10 p-6 rounded-2xl max-w-md mx-auto border border-red-500/20">
                <p className="font-bold mb-2">Ошибка</p>
                <p className="mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onBack} className="text-slate-400 hover:text-white underline text-sm">Назад</button>
                    <button onClick={generateLesson} className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-bold transition-colors">Повторить</button>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (phase === 'content' && lessonData) {
      return (
          <div className="max-w-2xl mx-auto pb-20 animate-in slide-in-from-right-8 duration-500">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h2 className="text-3xl font-black text-white">{lessonData.rule.title}</h2>
                  <div className="flex gap-2">
                     <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase">{topic.level}</span>
                     <span className="bg-white/10 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase">{topic.vocabCount} слов</span>
                  </div>
              </div>

              <div className="space-y-6 mb-8">
                  {/* Rule Section */}
                  <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-l-amber-500">
                      <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-3">Грамматика</h3>
                      <p className="text-lg text-slate-200 leading-relaxed whitespace-pre-line mb-4">{lessonData.rule.explanation}</p>
                      <div className="space-y-2">
                          {lessonData.rule.examples.map((ex, i) => (
                              <div key={i} className="bg-black/30 p-3 rounded-xl text-emerald-100 font-medium border border-white/5">
                                  {ex}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Words Section */}
                  <div className="glass-panel p-6 rounded-[2rem]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Новые слова</h3>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg text-slate-300">
                            Выбрано: {selectedWords.size} / {lessonData.words.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                          {lessonData.words.map((w, i) => {
                              const isSelected = selectedWords.has(i);
                              return (
                                  <div 
                                      key={i} 
                                      onClick={() => toggleWordSelection(i)}
                                      className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                                          isSelected 
                                          ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20' 
                                          : 'bg-white/5 border-white/5 opacity-60 hover:opacity-80 hover:bg-white/10'
                                      }`}
                                  >
                                      <div className="flex items-center gap-4">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                              isSelected 
                                              ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                              : 'border-slate-600 group-hover:border-slate-400'
                                          }`}>
                                              {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                          </div>
                                          <div>
                                              <p className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-400'}`}>{w.front}</p>
                                              <p className="text-xs text-slate-500">{w.example}</p>
                                          </div>
                                      </div>
                                      <p className={`font-medium text-right transition-colors ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>{w.back}</p>
                                  </div>
                              );
                          })}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => {
                                if (selectedWords.size === lessonData.words.length) {
                                    setSelectedWords(new Set());
                                } else {
                                    setSelectedWords(new Set(lessonData.words.map((_, i) => i)));
                                }
                            }}
                            className="text-xs text-slate-500 hover:text-white underline"
                        >
                            {selectedWords.size === lessonData.words.length ? 'Снять выделение' : 'Выбрать все'}
                        </button>
                      </div>
                  </div>
              </div>

              <button 
                onClick={handleSaveAndStartQuiz}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all"
              >
                  Сохранить ({selectedWords.size}) и пройти Тест →
              </button>
          </div>
      );
  }

  if (phase === 'quiz' && lessonData) {
      const question = lessonData.quiz[currentQuizIndex];
      return (
          <div className="max-w-xl mx-auto pb-20 animate-in slide-in-from-right-8">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Тест</h3>
                  <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Вопрос {currentQuizIndex + 1} / {lessonData.quiz.length}
                  </span>
              </div>

              <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden min-h-[400px] flex flex-col">
                  <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-300" style={{ width: `${((currentQuizIndex + 1) / lessonData.quiz.length) * 100}%` }}></div>
                  
                  <div className="flex-grow flex flex-col justify-center">
                      <h4 className="text-xl font-bold text-white mb-8 text-center">{question.question}</h4>
                      
                      <div className="space-y-3">
                          {question.options.map((opt, idx) => {
                              let btnClass = "bg-white/5 border-white/10 hover:bg-white/10";
                              if (isQuizAnswered) {
                                  if (idx === question.correctIndex) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                                  else if (idx === quizSelection && idx !== question.correctIndex) btnClass = "bg-red-500/20 border-red-500 text-red-300 opacity-50";
                                  else btnClass = "bg-white/5 border-white/10 opacity-30";
                              }

                              return (
                                  <button
                                      key={idx}
                                      onClick={() => handleQuizOptionClick(idx)}
                                      disabled={isQuizAnswered}
                                      className={`w-full p-4 rounded-xl border font-bold text-left transition-all ${btnClass}`}
                                  >
                                      {opt}
                                  </button>
                              );
                          })}
                      </div>
                  </div>

                  {isQuizAnswered && (
                      <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                          <button 
                            onClick={handleNextQuizQuestion}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                          >
                              {currentQuizIndex < lessonData.quiz.length - 1 ? 'Следующий вопрос →' : 'Перейти к Практике →'}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (phase === 'practice' || phase === 'evaluation' || phase === 'success') {
      return (
          <div className="max-w-xl mx-auto pb-20 animate-in slide-in-from-right-8">
              <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-white">Практика</h3>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
                          Тест: {quizScore}/{lessonData?.quiz.length}
                      </span>
                  </div>
                  
                  <p className="text-slate-300 mb-6">{lessonData?.dialogIntro}</p>

                  <div className="bg-white/5 p-4 rounded-2xl mb-6 border border-white/10">
                      <p className="text-sm text-slate-400 uppercase font-bold mb-2">Задание:</p>
                      <p className="text-white">Напишите диалог или предложение, используя правило <strong>{lessonData?.rule.title}</strong> и новые слова.</p>
                  </div>

                  <textarea 
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    disabled={phase !== 'practice'}
                    className="w-full h-40 bg-black/30 border border-white/20 rounded-2xl p-5 text-white focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] outline-none resize-none transition-all"
                    placeholder="Начните писать здесь..."
                  />

                  {error && (
                       <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                           {error}
                       </div>
                  )}

                  {aiFeedback && (
                      <div className={`mt-6 p-6 rounded-2xl border ${aiFeedback.passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} animate-in fade-in`}>
                          <h4 className={`font-bold text-lg mb-2 ${aiFeedback.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                              {aiFeedback.passed ? 'Отлично! 🎉' : 'Нужно доработать 🧐'}
                          </h4>
                          <p className="text-slate-200 mb-2">{aiFeedback.message}</p>
                          {aiFeedback.correction && (
                              <div className="mt-3 bg-black/20 p-3 rounded-xl">
                                  <p className="text-xs text-slate-500 uppercase font-bold">Коррекция:</p>
                                  <p className="text-white">{aiFeedback.correction}</p>
                              </div>
                          )}
                      </div>
                  )}

                  <div className="mt-8 flex gap-4">
                      {phase === 'success' ? (
                          <button onClick={onComplete} className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl">
                              Завершить урок
                          </button>
                      ) : (
                          <button 
                            onClick={submitPractice}
                            disabled={phase === 'evaluation'}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                          >
                             {phase === 'evaluation' ? 'Проверка...' : 'Проверить'}
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

export default LessonRunner;
