
import React, { useState, useEffect, useRef } from 'react';
import { StudyTopic, Card, Rule, ItemType } from '../types';
import { LESSON_CONTENT } from '../lib/static-content';

interface LessonRunnerProps {
  topic: StudyTopic;
  onComplete: () => void;
  onSaveContent: (rules: Partial<Rule>[], cards: Partial<Card>[]) => void;
  onBack: () => void;
}

const LessonRunner: React.FC<LessonRunnerProps> = ({ topic, onComplete, onSaveContent, onBack }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Exercise State (Queue based)
  const [exerciseQueue, setExerciseQueue] = useState<any[]>([]);
  const [exerciseFeedback, setExerciseFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [scrambleInput, setScrambleInput] = useState<string[]>([]);
  const [textInput, setTextInput] = useState(''); // New state for input exercises
  
  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load lesson
  const lesson = LESSON_CONTENT[topic.id];

  // Initialize queue when slide changes to exercise
  useEffect(() => {
    if (lesson && lesson.slides[currentSlideIndex].type === 'exercise') {
      // Create a fresh copy of exercises for the queue
      setExerciseQueue([...lesson.slides[currentSlideIndex].content.exercises]);
      setExerciseFeedback('idle');
      setScrambleInput([]);
      setTextInput('');
    }
  }, [currentSlideIndex, lesson]);

  // Focus input on load if exercise is input type
  useEffect(() => {
    if (exerciseQueue.length > 0 && exerciseQueue[0].type === 'input') {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [exerciseQueue]);

  // If no static content found, show coming soon
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h2 className="text-3xl font-bold text-white mb-4">Урок в разработке</h2>
        <p className="text-slate-400 mb-8">Мы готовим контент для этого урока. Попробуйте "Lesson 1".</p>
        <button onClick={onBack} className="px-6 py-3 bg-white/10 rounded-2xl hover:bg-white/20 text-white font-bold">Назад</button>
      </div>
    );
  }

  const currentSlide = lesson.slides[currentSlideIndex];

  // --- HELPERS ---

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const nextSlide = () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      // Reset inner states
      setExerciseFeedback('idle');
      setScrambleInput([]);
      setTextInput('');
      setCurrentQuizIndex(0);
      setQuizAnswered(false);
    } else {
      onComplete();
    }
  };

  const saveVocab = () => {
    if (currentSlide.type === 'vocab') {
      const items = currentSlide.content.items;
      const cardsToSave: Partial<Card>[] = items
        .filter((w: any) => selectedWords.has(w.front))
        .map((w: any) => ({
           front: w.front,
           back: w.back,
           example: w.example,
           type: w.type === 'Phrase' ? ItemType.Phrase : ItemType.Word,
           level: topic.level,
           tags: ['Lesson', topic.level]
        }));
      
      onSaveContent([], cardsToSave);
      nextSlide();
    }
  };

  const validateInput = (input: string, correct: string): boolean => {
    const normalize = (s: string) => s
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:()]/g, '')
        .replace(/\s+/g, ' '); // Replace multiple spaces with one
        
    const inputClean = normalize(input);
    const correctOptions = correct.split('|').map(opt => normalize(opt));
    
    return correctOptions.some(opt => opt === inputClean);
  };

  const handleExerciseSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
        setExerciseFeedback('correct');
        // Play success sound logic could go here
        setTimeout(() => {
            // Remove the completed exercise from queue
            const newQueue = exerciseQueue.slice(1);
            if (newQueue.length === 0) {
                // Queue empty, section done
                nextSlide();
            } else {
                // Move to next in queue
                setExerciseQueue(newQueue);
                setExerciseFeedback('idle');
                setScrambleInput([]);
                setTextInput('');
            }
        }, isAdminMode ? 100 : 1200); // Faster transition in admin mode
    } else {
        setExerciseFeedback('wrong');
        setTimeout(() => {
            // Move the failed exercise to the end of the queue
            const failedItem = exerciseQueue[0];
            const newQueue = [...exerciseQueue.slice(1), failedItem];
            
            setExerciseQueue(newQueue);
            setExerciseFeedback('idle');
            setScrambleInput([]);
            setTextInput('');
        }, 2000); 
    }
  };

  const handleScrambleClick = (letter: string) => {
      setScrambleInput([...scrambleInput, letter]);
  };
  
  const resetScramble = () => setScrambleInput([]);

  // --- TEXT PARSER ---
  const renderMarkdown = (text: string) => {
      if (!text) return null;
      // 1. Handle bold: **text** -> <strong>text</strong> (colored)
      let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-bold">$1</strong>');
      
      // 2. Handle italics: *text* -> <em>text</em> (colored differently)
      html = html.replace(/\*(.*?)\*/g, '<em class="text-purple-300 not-italic">$1</em>');

      // 3. Handle line breaks
      html = html.replace(/\n/g, '<br />');

      return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // --- RENDERERS ---

  const renderIntro = (content: any) => (
    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] animate-in slide-in-from-right-8">
       <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">{currentSlide.title}</h1>
       <div className="text-xl text-slate-200 leading-relaxed space-y-4">
           {content.text.split('\n\n').map((paragraph: string, i: number) => (
               <p key={i}>{renderMarkdown(paragraph)}</p>
           ))}
       </div>
       <button onClick={nextSlide} className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-white transition-all">Продолжить</button>
    </div>
  );

  const renderTable = (content: any) => (
    <div className="glass-panel p-6 rounded-[2rem] animate-in slide-in-from-right-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 p-2 rounded-lg text-sm">ABC</span> 
            {currentSlide.title}
        </h2>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-sm uppercase tracking-wider sticky top-0 bg-slate-900 z-10 shadow-lg">
                        {content.headers.map((h: string, i: number) => <th key={i} className="pb-4 pt-2 px-2 first:rounded-tl-lg last:rounded-tr-lg">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="text-lg">
                    {content.rows.map((row: string[], i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-2 font-black text-cyan-300">{renderMarkdown(row[0])}</td>
                            {row.slice(1).map((cell: string, j: number) => (
                                <td key={j} className="py-4 px-2 text-slate-300">{renderMarkdown(cell)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {content.note && (
            <div className="mt-6 p-4 bg-white/5 border-l-2 border-cyan-500 rounded-r-xl">
                <p className="text-sm text-slate-400 italic">{renderMarkdown(content.note)}</p>
            </div>
        )}
        <button onClick={nextSlide} className="mt-8 w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20">Понятно</button>
    </div>
  );

  const renderList = (content: any) => (
    <div className="glass-panel p-8 rounded-[2.5rem] animate-in slide-in-from-right-8">
        <h2 className="text-2xl font-bold mb-4">{currentSlide.title}</h2>
        {content.description && <p className="text-slate-400 mb-6">{renderMarkdown(content.description)}</p>}
        
        <ul className="space-y-2 mb-8">
            {content.items.map((item: string, i: number) => {
                // Extract text for audio: **Text**
                const match = item.match(/\*\*(.*?)\*\*/);
                const audioText = match ? match[1] : null;

                return (
                    <li 
                        key={i} 
                        onClick={() => audioText && playAudio(audioText)}
                        className={`flex items-start gap-3 text-lg p-3 rounded-2xl transition-all ${audioText ? 'cursor-pointer hover:bg-white/5 hover:scale-[1.01] active:scale-95' : ''}`}
                    >
                        <span className="text-cyan-400 mt-1.5 text-xs">●</span>
                        <div className="flex-grow">
                            {renderMarkdown(item)}
                        </div>
                         {audioText && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playAudio(audioText);
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-cyan-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0"
                            >
                                🔊
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>

        {content.examples && (
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Примеры:</h4>
                <div className="space-y-2">
                    {content.examples.map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 rounded-lg" onClick={() => playAudio(ex.text)}>
                            <span className="font-bold text-white">{ex.text}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-slate-400 text-sm">{ex.trans}</span>
                                <span className="text-cyan-400">🔊</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        <button onClick={nextSlide} className="mt-8 w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-bold text-white shadow-lg">Далее</button>
    </div>
  );

  const renderVocab = (content: any) => (
    <div className="animate-in slide-in-from-right-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{currentSlide.title}</h2>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{selectedWords.size} выбрано</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-h-[60vh] overflow-y-auto pr-2">
            {content.items.map((word: any, i: number) => {
                const isSel = selectedWords.has(word.front);
                return (
                    <div 
                        key={i}
                        onClick={() => {
                            const newSet = new Set(selectedWords);
                            if (newSet.has(word.front)) newSet.delete(word.front);
                            else newSet.add(word.front);
                            setSelectedWords(newSet);
                        }} 
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group
                            ${isSel ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                        `}
                    >
                        <div>
                             <h4 className={`font-bold text-lg ${isSel ? 'text-white' : 'text-slate-400'}`}>{word.front}</h4>
                             <p className="text-xs text-slate-500 mb-1">{word.back}</p>
                             <p className="text-[10px] text-slate-600 italic">"{word.example}"</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); playAudio(word.front); }} className="w-8 h-8 rounded-full bg-white/5 hover:bg-cyan-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                🔊
                            </button>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                                {isSel && <span className="text-white text-xs">✓</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="flex gap-4">
             <button onClick={() => {
                 const newSet = new Set<string>();
                 content.items.forEach((w: any) => newSet.add(w.front));
                 setSelectedWords(newSet);
             }} className="flex-1 py-4 bg-white/10 rounded-2xl font-bold text-slate-300 hover:bg-white/20">Выбрать все</button>
             
             <button onClick={saveVocab} className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
                 Выучить ({selectedWords.size}) слов →
             </button>
        </div>
    </div>
  );

  const renderExercise = (content: any) => {
      if (exerciseQueue.length === 0) return null;
      const ex = exerciseQueue[0];
      const totalExercises = content.exercises.length;
      const currentProgress = totalExercises - exerciseQueue.length;

      return (
        <div className={`glass-panel p-8 rounded-[2.5rem] animate-in slide-in-from-right-8 min-h-[400px] flex flex-col relative transition-all duration-300 ${exerciseFeedback === 'correct' ? 'shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-500/30 scale-[1.02]' : ''}`}>
            {exerciseFeedback === 'correct' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                     <div className="text-9xl animate-bounce drop-shadow-[0_0_50px_rgba(16,185,129,0.8)] filter">🎉</div>
                </div>
            )}
            
            {isAdminMode && (
                <button
                    onClick={() => handleExerciseSubmit(true)}
                    className="absolute top-6 right-6 z-20 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/30 hover:bg-red-500/30"
                >
                    SKIP (WIN) ⏭
                </button>
            )}

            <div className="flex justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                    Задание {Math.min(currentProgress + 1, totalExercises)} / {totalExercises}
                </span>
                <div className="flex gap-1">
                    {Array.from({ length: totalExercises }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < currentProgress ? 'bg-emerald-500' : i === currentProgress ? 'bg-purple-500' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 text-center">{renderMarkdown(ex.question)}</h3>

            <div className="flex-grow flex flex-col justify-center items-center w-full">
                {/* MATCH / SELECT / AUDIO */}
                {(ex.type === 'match' || ex.type === 'select' || ex.type === 'audio_select') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {ex.type === 'audio_select' && (
                             <button onClick={() => playAudio(ex.audioText)} className="col-span-full mx-auto w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center text-3xl transition-all mb-6 animate-bounce">
                                 🔊
                             </button>
                        )}
                        {ex.options.map((opt: string, i: number) => (
                            <button 
                                key={i}
                                onClick={() => handleExerciseSubmit(validateInput(opt, ex.correctAnswer))}
                                disabled={exerciseFeedback !== 'idle'}
                                className={`p-6 rounded-2xl font-bold text-lg border-2 transition-all duration-300
                                    ${exerciseFeedback === 'idle' 
                                        ? 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10 hover:scale-[1.02]' 
                                        : validateInput(opt, ex.correctAnswer) 
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                            : 'opacity-30 border-transparent grayscale'
                                    }
                                `}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* SCRAMBLE */}
                {ex.type === 'scramble' && (
                    <div className="w-full text-center">
                        <div className="min-h-[80px] flex gap-2 justify-center items-center flex-wrap mb-8 p-4 bg-black/20 rounded-2xl border border-white/10 shadow-inner">
                            {scrambleInput.map((l, i) => (
                                <span key={i} className="px-3 py-2 bg-white text-black font-bold text-lg rounded-lg animate-in zoom-in">{l}</span>
                            ))}
                            {scrambleInput.length === 0 && <span className="text-slate-500 text-sm">Нажимай на слова...</span>}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 justify-center">
                             {ex.scrambleLetters.map((l: string, i: number) => (
                                 <button 
                                     key={i} 
                                     onClick={() => handleScrambleClick(l)}
                                     disabled={exerciseFeedback !== 'idle'}
                                     className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-base border border-white/10 active:scale-95 transition-all"
                                 >
                                     {l}
                                 </button>
                             ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-8">
                             <button onClick={resetScramble} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">Сброс</button>
                             <button 
                                onClick={() => {
                                    const inputStr = scrambleInput.join('');
                                    handleExerciseSubmit(validateInput(inputStr, ex.correctAnswer));
                                }}
                                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105"
                             >
                                 Проверить
                             </button>
                        </div>
                    </div>
                )}

                {/* INPUT */}
                {ex.type === 'input' && (
                    <div className="w-full max-w-sm">
                        <input
                            ref={inputRef}
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && exerciseFeedback === 'idle' && textInput.trim().length > 0) {
                                    handleExerciseSubmit(validateInput(textInput, ex.correctAnswer));
                                }
                            }}
                            disabled={exerciseFeedback !== 'idle'}
                            className={`w-full bg-black/30 border-2 rounded-2xl px-6 py-5 text-xl font-bold text-center text-white placeholder-slate-600 focus:outline-none transition-all
                                ${exerciseFeedback === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                                exerciseFeedback === 'wrong' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                                'border-white/10 focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.3)]'}`}
                            placeholder="Введите перевод..."
                            autoComplete="off"
                        />
                        {exerciseFeedback === 'idle' && (
                            <button 
                                onClick={() => {
                                    if (textInput.trim().length === 0) return;
                                    handleExerciseSubmit(validateInput(textInput, ex.correctAnswer));
                                }}
                                className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-white transition-all"
                            >
                                Проверить
                            </button>
                        )}
                        {exerciseFeedback === 'wrong' && (
                             <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-red-300 uppercase font-bold mb-1">Правильный ответ:</p>
                                <p className="text-lg font-black text-white">{ex.correctAnswer.split('|')[0].trim()}</p>
                             </div>
                        )}
                    </div>
                )}
            </div>

            {exerciseFeedback !== 'idle' && (
                <div className={`mt-6 text-center font-bold text-lg animate-in fade-in ${exerciseFeedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {exerciseFeedback === 'correct' ? 'Верно!' : 'Неверно, запомни правильный ответ.'}
                </div>
            )}
        </div>
      );
  };

  const renderQuiz = (content: any) => {
      const q = content.questions[currentQuizIndex];
      return (
        <div className="glass-panel p-8 rounded-[2.5rem] animate-in slide-in-from-right-8 min-h-[400px] flex flex-col relative">
             {isAdminMode && !quizAnswered && (
                <button
                    onClick={() => {
                         setQuizAnswered(true);
                         setQuizScore(prev => prev + 1);
                    }}
                    className="absolute top-6 right-6 z-20 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/30 hover:bg-red-500/30"
                >
                    AUTO-SOLVE ⏭
                </button>
            )}

             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Тест</h2>
                <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {currentQuizIndex + 1} / {content.questions.length}
                </span>
            </div>

            <div className="flex-grow">
                 <h3 className="text-xl font-bold text-center mb-8">{q.question}</h3>
                 <div className="space-y-3">
                     {q.options.map((opt: string, i: number) => {
                         let style = "bg-white/5 border-white/10 hover:bg-white/10";
                         if (quizAnswered) {
                             if (i === q.correctIndex) style = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                             else style = "opacity-30";
                         }
                         return (
                            <button 
                                key={i}
                                onClick={() => {
                                    if (quizAnswered) return;
                                    setQuizAnswered(true);
                                    if (i === q.correctIndex) setQuizScore(prev => prev + 1);
                                }}
                                className={`w-full p-4 rounded-xl border font-bold text-left transition-all ${style}`}
                            >
                                {opt}
                            </button>
                         );
                     })}
                 </div>
            </div>
            
            {quizAnswered && (
                <button 
                    onClick={() => {
                        if (currentQuizIndex < content.questions.length - 1) {
                            setCurrentQuizIndex(prev => prev + 1);
                            setQuizAnswered(false);
                        } else {
                            nextSlide();
                        }
                    }}
                    className="mt-8 w-full py-4 bg-white text-black font-bold rounded-2xl"
                >
                    {currentQuizIndex < content.questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                </button>
            )}
        </div>
      );
  };

  const renderFinish = (content: any) => {
      const totalQuestions = lesson.slides.reduce((acc, slide) => {
        if (slide.type === 'quiz') return acc + slide.content.questions.length;
        return acc;
      }, 0);

      return (
        <div className="glass-panel p-12 rounded-[2.5rem] text-center animate-in zoom-in duration-300">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-3xl font-black text-white mb-4">Урок пройден!</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-md mx-auto">{renderMarkdown(content.text)}</p>
            {totalQuestions > 0 && (
                <div className="bg-white/5 p-4 rounded-2xl mb-8 inline-block px-8 border border-white/10">
                    <span className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Результат теста</span>
                    <span className="text-4xl font-black text-emerald-400">
                        {quizScore} 
                        <span className="text-xl text-slate-500 font-bold ml-2">/ {totalQuestions}</span>
                    </span>
                </div>
            )}
            <button onClick={onComplete} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-white shadow-lg">
                Вернуться к карте
            </button>
        </div>
      );
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden flex-grow mr-4">
            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentSlideIndex + 1) / lesson.slides.length) * 100}%` }}></div>
         </div>
         <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
            <input 
                type="checkbox" 
                checked={isAdminMode} 
                onChange={(e) => setIsAdminMode(e.target.checked)} 
                className="w-4 h-4 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-slate-800"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin</span>
         </label>
      </div>

      {currentSlide.type === 'intro' && renderIntro(currentSlide.content)}
      {currentSlide.type === 'table' && renderTable(currentSlide.content)}
      {currentSlide.type === 'list' && renderList(currentSlide.content)}
      {currentSlide.type === 'vocab' && renderVocab(currentSlide.content)}
      {currentSlide.type === 'exercise' && renderExercise(currentSlide.content)}
      {currentSlide.type === 'quiz' && renderQuiz(currentSlide.content)}
      {currentSlide.type === 'finish' && renderFinish(currentSlide.content)}
      
      {currentSlide.type !== 'finish' && currentSlide.type !== 'intro' && (
          <div className="mt-8 flex justify-center">
              <button onClick={onBack} className="text-slate-500 text-sm hover:text-white">Выйти из урока</button>
          </div>
      )}
    </div>
  );
};

export default LessonRunner;
