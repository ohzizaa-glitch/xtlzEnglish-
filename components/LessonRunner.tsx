
import React, { useState, useEffect, useRef } from 'react';
import { StudyTopic, GeneratedLesson, Card, Rule, ItemType } from '../types';
import { createAIClient } from '../lib/gemini';

interface LessonRunnerProps {
  topic: StudyTopic;
  onComplete: () => void;
  onSaveContent: (rules: Partial<Rule>[], cards: Partial<Card>[]) => void;
  onBack: () => void;
}

type LessonPhase = 'loading' | 'content' | 'practice' | 'evaluation' | 'success';

const LessonRunner: React.FC<LessonRunnerProps> = ({ topic, onComplete, onSaveContent, onBack }) => {
  const [phase, setPhase] = useState<LessonPhase>('loading');
  const [lessonData, setLessonData] = useState<GeneratedLesson | null>(null);
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
        3. GENERATE EXACTLY ${topic.vocabCount} NEW WORDS/PHRASES.
        4. The vocabulary MUST be related to the theme: "${topic.vocabTheme}".
        5. Write a short context/intro for a practice dialog (e.g., "Imagine you are...").

        Return ONLY JSON:
        {
          "rule": { "title": "...", "explanation": "...", "examples": ["...", "..."] },
          "words": [ { "front": "English", "back": "Russian", "type": "Word" or "Phrase", "example": "Sentence" }, ... ], // Must have ${topic.vocabCount} items
          "dialogIntro": "Context description for practice"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setLessonData(data);
        setPhase('content');
      } else {
        throw new Error("No data received");
      }
    } catch (e: any) {
      setError("Ошибка генерации урока. Попробуйте еще раз.");
      console.error(e);
    }
  };

  const handleSaveAndContinue = () => {
    if (!lessonData) return;
    
    // Save Content
    const newRule: Partial<Rule> = {
        title: lessonData.rule.title,
        explanation: lessonData.rule.explanation,
        examples: lessonData.rule.examples,
        level: topic.level,
        type: ItemType.Rule
    };

    const newCards: Partial<Card>[] = lessonData.words.map(w => ({
        front: w.front,
        back: w.back,
        example: w.example,
        type: w.type === 'Phrase' ? ItemType.Phrase : ItemType.Word,
        level: topic.level,
        tags: ['Lesson', topic.level, topic.category]
    }));

    onSaveContent([newRule], newCards);
    setPhase('practice');
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
        model: 'gemini-3-flash-preview',
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
      setError("Ошибка проверки.");
      setPhase('practice');
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Генерация урока...</h2>
             <p className="text-slate-400">Тема: {topic.title}</p>
             <p className="text-emerald-400 text-sm font-bold mt-2">ИИ подбирает {topic.vocabCount} слов по теме "{topic.vocabTheme}"</p>
        </div>
        {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-xl">
                {error} <button onClick={generateLesson} className="underline ml-2">Повторить</button>
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
                      <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4">Новые слова ({lessonData.words.length})</h3>
                      <div className="grid grid-cols-1 gap-3">
                          {lessonData.words.map((w, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                  <div>
                                      <p className="font-bold text-white">{w.front}</p>
                                      <p className="text-xs text-slate-500">{w.example}</p>
                                  </div>
                                  <p className="text-slate-300 font-medium text-right">{w.back}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <button 
                onClick={handleSaveAndContinue}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all"
              >
                  Сохранить в библиотеку и Практиковаться →
              </button>
          </div>
      );
  }

  if (phase === 'practice' || phase === 'evaluation' || phase === 'success') {
      return (
          <div className="max-w-xl mx-auto pb-20 animate-in slide-in-from-right-8">
              <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Практика</h3>
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
