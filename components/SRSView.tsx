
import React, { useState, useEffect, useRef } from 'react';
import { ReviewItem, CardStatus, ItemType, Rule, ReviewMode } from '../types';
import { createAIClient, getFriendlyErrorMessage } from '../lib/gemini';

interface SRSViewProps {
  items: ReviewItem[];
  mode: ReviewMode;
  onComplete: (results: { id: string; remembered: boolean }[]) => void;
  onCancel: () => void;
  onInfiniteReview?: () => void;
}

type FeedbackStatus = 'idle' | 'correct' | 'wrong' | 'revealed';

interface GrammarQuizData {
  type: 'choice' | 'translate' | 'question';
  instruction: string; // The text shown to user (e.g. "Translate this")
  question: string; // The content (e.g. Russian sentence)
  correctAnswer: string; // The expected English output
  options?: string[]; // For choice type
  correctIndex?: number; // For choice type
}

const SRSView: React.FC<SRSViewProps> = ({ items, mode, onComplete, onCancel, onInfiniteReview }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ id: string; remembered: boolean }[]>([]);
  
  // State for Writing and AI modes
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackStatus>('idle');
  
  // AI Grammar Quiz State
  const [quizData, setQuizData] = useState<GrammarQuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [showTheory, setShowTheory] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!currentItem) return;

    setFeedback('idle');
    setInputValue('');
    setIsFlipped(false);
    setShowTheory(true);
    setQuizData(null);
    setQuizError(null);

    // Focus input if in writing mode
    if (mode === 'writing') {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, currentItem, mode]);

  const handleAnswer = (remembered: boolean) => {
    const newResults = [...sessionResults, { id: currentItem.id, remembered }];
    setSessionResults(newResults);
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResults);
    }
  };

  // --- WRITING MODE LOGIC ---
  const handleWritingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'writing') return;

    if (feedback !== 'idle') {
        if (feedback === 'wrong') handleAnswer(false);
        return;
    }

    const card = currentItem as any; 
    const cleanInput = inputValue.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = card.front.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    if (cleanInput === cleanTarget) {
      setFeedback('correct');
      setTimeout(() => handleAnswer(true), 1500);
    } else {
      setFeedback('wrong');
    }
  };

  // --- AI GRAMMAR LOGIC ---
  const generateQuiz = async () => {
    if (!mode.startsWith('grammar') || !currentItem) return;
    
    setQuizLoading(true);
    setQuizError(null);
    setShowTheory(false);

    try {
      const rule = currentItem as Rule;
      const ai = createAIClient();
      
      let promptTask = "";
      
      if (mode === 'grammar_choice') {
        promptTask = `
        Create a 'choice' type quiz.
        1. Create a 'masked' English sentence where the key grammar part is missing (replaced by _____).
        2. Provide 3 options (1 correct, 2 common mistakes).
        3. Instruction: "Choose the correct form."
        `;
      } else if (mode === 'grammar_translate') {
        promptTask = `
        Create a 'translate' type quiz.
        1. Create a simple Russian sentence that MUST use this grammar rule when translated.
        2. Provide the correct English translation.
        3. Instruction: "Translate into English."
        `;
      } else if (mode === 'grammar_question') {
         promptTask = `
         Create a 'question' type quiz.
         1. Ask a question in English that forces the user to use this rule in their answer.
         2. Provide an example of a good correct answer.
         3. Instruction: "Answer the question in English."
         `;
      }

      const prompt = `
        You are an English teacher. Create a grammar exercise for the rule: "${rule.title}".
        Explanation: "${rule.explanation}".
        
        ${promptTask}
        
        Return ONLY a JSON object:
        {
          "type": "choice" | "translate" | "question",
          "instruction": "Instruction string",
          "question": "The question text (Russian sentence, or English question, or masked sentence)",
          "correctAnswer": "The full correct English sentence or answer",
          "options": ["opt1", "opt2", "opt3"], // Only for 'choice' type
          "correctIndex": 0 // Only for 'choice' type
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        setQuizData(JSON.parse(response.text));
        // Auto-focus text area if not choice
        if (mode !== 'grammar_choice') {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (e: any) {
      console.error(e);
      setQuizError(getFriendlyErrorMessage(e));
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizChoice = (index: number) => {
    if (!quizData || quizData.type !== 'choice' || feedback !== 'idle') return;

    if (index === quizData.correctIndex) {
      setFeedback('correct');
      setTimeout(() => handleAnswer(true), 2000);
    } else {
      setFeedback('wrong');
    }
  };

  const handleQuizReveal = () => {
      setFeedback('revealed');
  };

  // --- RENDERERS ---

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-[2.5rem] text-center max-w-lg mx-auto mt-10 space-y-6">
        <div className="text-7xl mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">🎉</div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">Сессия завершена!</h2>
        <p className="text-slate-400 text-lg">
            {mode === 'flashcards' ? 'Слова повторены.' : mode === 'writing' ? 'Навык письма прокачан.' : 'Правила закреплены.'}
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto pt-4">
          {onInfiniteReview && (
            <button 
              onClick={onInfiniteReview}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>♾️</span> Продолжить
            </button>
          )}

          <button 
            onClick={onCancel} 
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const renderProgressBar = () => (
    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-8">
      <div 
        className="bg-cyan-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
        style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
      />
    </div>
  );

  const renderHeader = () => {
    let title = "";
    if (mode === 'flashcards') title = 'Карточки';
    else if (mode === 'writing') title = 'Правописание';
    else if (mode === 'grammar_choice') title = 'Вставить слово';
    else if (mode === 'grammar_translate') title = 'Перевод';
    else if (mode === 'grammar_question') title = 'Ответ на вопрос';

    return (
      <div className="flex justify-between items-center px-2 mb-4">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
              {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{currentIndex + 1}</span>
            <span className="text-slate-600 text-xl">/</span>
            <span className="text-slate-500 font-bold text-lg">{items.length}</span>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
          title="Выйти"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    );
  };

  // === MODE 1: GRAMMAR (AI TUTOR) ===
  if (mode.startsWith('grammar')) {
    const rule = currentItem as Rule;
    return (
      <div className="max-w-xl mx-auto pb-20 animate-in fade-in duration-500">
        {renderHeader()}
        {renderProgressBar()}

        <div className="glass-panel rounded-[2.5rem] p-6 md:p-10 border border-amber-500/20 relative overflow-hidden min-h-[500px] flex flex-col">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 flex-grow flex flex-col">
              <span className="text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 w-fit">
                 {rule.title} • {rule.level}
              </span>

              {quizError ? (
                <div className="flex flex-col h-full items-center justify-center text-center animate-in fade-in">
                  <p className="text-red-400 mb-6">{quizError}</p>
                  <button onClick={generateQuiz} className="px-6 py-3 bg-cyan-600 rounded-xl font-bold">Повторить</button>
                  <button onClick={() => handleAnswer(true)} className="mt-4 text-sm text-slate-400 underline">Пропустить</button>
                </div>
              ) : showTheory ? (
                // THEORY PHASE
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                  <p className="text-lg text-slate-300 leading-relaxed mb-8 flex-grow whitespace-pre-line">{rule.explanation}</p>
                  {rule.examples?.[0] && (
                    <div className="bg-black/30 p-6 rounded-2xl border border-white/5 mb-8">
                       <p className="text-amber-100 italic">"{rule.examples[0]}"</p>
                    </div>
                  )}
                  <button 
                    onClick={generateQuiz}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-bold text-white text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>⚡️</span> Тренировать с ИИ
                  </button>
                </div>
              ) : quizLoading ? (
                // LOADING PHASE
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-pulse">
                   <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                   <p className="text-amber-200 font-bold uppercase tracking-widest text-sm">ИИ готовит задание...</p>
                </div>
              ) : quizData ? (
                // QUIZ PHASE
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">{quizData.instruction}</h4>
                  
                  {/* The Question/Prompt Area */}
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-6 text-center">
                    {quizData.type === 'choice' ? (
                        <p className="text-xl text-amber-100 font-medium">
                        {quizData.question.split('_____').map((part, i, arr) => (
                            <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className="inline-block min-w-[60px] border-b-2 border-amber-500/50 mx-1 text-amber-400 px-2 font-bold">
                                {feedback === 'correct' ? quizData.options?.[quizData.correctIndex!] : '?'}
                                </span>
                            )}
                            </React.Fragment>
                        ))}
                        </p>
                    ) : (
                        <p className="text-xl font-bold text-white">{quizData.question}</p>
                    )}
                  </div>

                  {/* INTERACTION AREA */}
                  {quizData.type === 'choice' ? (
                      // Multiple Choice Buttons
                      <div className="grid gap-3 mt-auto">
                        {quizData.options?.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuizChoice(idx)}
                            disabled={feedback !== 'idle'}
                            className={`p-4 rounded-xl font-bold border-2 transition-all text-left
                            ${feedback === 'idle' 
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50' 
                                : idx === quizData.correctIndex
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : feedback === 'wrong' && idx !== quizData.correctIndex
                                    ? 'bg-white/5 border-white/10 opacity-30'
                                    : 'bg-white/5 border-white/10'
                                }
                            `}
                        >
                            {option}
                        </button>
                        ))}
                        {feedback === 'wrong' && (
                            <button onClick={() => handleAnswer(false)} className="mt-2 text-red-400 font-bold underline">Далее (Повторить позже)</button>
                        )}
                      </div>
                  ) : (
                      // Text Input Area for Translate/Question
                      <div className="flex flex-col flex-grow">
                          <textarea 
                             ref={textareaRef}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-amber-500/50 outline-none mb-4"
                             rows={3}
                             placeholder="Type your answer here..."
                             disabled={feedback === 'revealed'}
                          />
                          
                          {feedback === 'revealed' && (
                              <div className="animate-in fade-in slide-in-from-top-4 mb-4">
                                  <div className="text-xs text-emerald-400 font-bold uppercase mb-1">Возможный ответ ИИ:</div>
                                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-100 font-bold">
                                      {quizData.correctAnswer}
                                  </div>
                              </div>
                          )}

                          <div className="mt-auto">
                             {feedback === 'idle' ? (
                                 <button 
                                   onClick={handleQuizReveal}
                                   className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-white transition-all"
                                 >
                                   Проверить
                                 </button>
                             ) : (
                                 <div className="grid grid-cols-2 gap-4">
                                     <button onClick={() => handleAnswer(false)} className="py-4 bg-red-500/20 border border-red-500/30 text-red-300 font-bold rounded-2xl hover:bg-red-500/30">
                                         Я ошибся
                                     </button>
                                     <button onClick={() => handleAnswer(true)} className="py-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold rounded-2xl hover:bg-emerald-500/30">
                                         Я был прав
                                     </button>
                                 </div>
                             )}
                          </div>
                      </div>
                  )}
                </div>
              ) : null}
           </div>
        </div>
      </div>
    );
  }

  // === CARD BASED MODES (FLASHCARDS & WRITING) ===
  const card = currentItem as any; 

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {renderHeader()}
      {renderProgressBar()}

      {mode === 'flashcards' ? (
        <>
          {/* FLASHCARDS VIEW (Simple Flip) */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative perspective-1000 h-[450px] cursor-pointer group"
          >
            <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden safari-front bg-slate-950 rounded-[3rem] flex flex-col items-center justify-center p-12 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-8">
                      <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        English
                      </span>
                 </div>
                 
                 <h3 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 text-center leading-tight tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                    {card.front}
                 </h3>
                 
                 <div className="absolute bottom-10 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                   Нажми, чтобы открыть
                 </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden safari-back rounded-[3rem] flex flex-col items-center justify-center p-12 border border-white/20 shadow-[0_20px_50px_rgba(34,211,238,0.15)] bg-slate-950">
                 <span className="text-cyan-200/50 text-[10px] font-black uppercase tracking-[0.2em] mb-8 absolute top-8">Перевод</span>
                 
                 <h3 className="text-4xl font-bold text-white text-center leading-tight mb-8 drop-shadow-md">
                    {card.back}
                 </h3>
                 
                 {card.example && (
                   <div className="bg-black/40 p-6 rounded-3xl border border-white/10 w-full">
                     <p className="text-cyan-100 text-lg italic text-center leading-relaxed font-serif">"{card.example}"</p>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-6 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
              className="py-5 bg-red-500/10 border border-red-500/30 text-red-400 font-black rounded-[2rem] hover:bg-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all active:scale-95"
            >
              ЗАБЫЛ
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
              className="py-5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black rounded-[2rem] hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all active:scale-95"
            >
              ПОМНЮ
            </button>
          </div>
        </>
      ) : (
        <>
          {/* WRITING MODE VIEW (Strict Input) */}
          <div className="glass-panel rounded-[3rem] p-8 md:p-12 border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
             
             <span className="text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
               Напиши перевод
             </span>

             <h3 className="text-3xl font-bold text-white text-center mb-10 drop-shadow-md">
                {card.back}
             </h3>

             <form onSubmit={handleWritingSubmit} className="w-full max-w-sm space-y-6">
               <div className="relative">
                 <input
                   ref={inputRef}
                   type="text"
                   value={inputValue}
                   onChange={(e) => setFeedback('idle') || setInputValue(e.target.value)}
                   disabled={feedback !== 'idle'}
                   autoComplete="off"
                   className={`w-full bg-black/30 border-2 rounded-2xl px-6 py-5 text-xl font-bold text-center text-white placeholder-slate-500 focus:outline-none transition-all
                     ${feedback === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                       feedback === 'wrong' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                       'border-white/10 focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.3)]'}`}
                   placeholder="На английском..."
                 />
                 {feedback === 'correct' && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-2xl animate-bounce">✓</div>
                 )}
               </div>

               {feedback === 'wrong' && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-top-2">
                   <p className="text-xs text-red-300 uppercase font-bold mb-1">Правильный ответ:</p>
                   <p className="text-xl font-black text-white">{card.front}</p>
                 </div>
               )}

               {feedback === 'idle' ? (
                 <button 
                   type="submit"
                   className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-white transition-all active:scale-95"
                 >
                   Проверить
                 </button>
               ) : feedback === 'wrong' ? (
                 <button 
                   type="button"
                   onClick={() => handleAnswer(false)}
                   className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
                 >
                   Далее (Запомнить ошибку)
                 </button>
               ) : (
                 <div className="w-full py-4 text-center text-emerald-400 font-bold uppercase tracking-widest">
                   Отлично!
                 </div>
               )}
             </form>
          </div>
        </>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; -webkit-perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; -webkit-transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .safari-front { transform: rotateY(0deg) translateZ(1px); -webkit-transform: rotateY(0deg) translateZ(1px); }
        .safari-back { transform: rotateY(180deg) translateZ(1px); -webkit-transform: rotateY(180deg) translateZ(1px); }
        .rotate-y-180 { transform: rotateY(180deg); -webkit-transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default SRSView;
