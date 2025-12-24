
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ReviewItem, CardStatus, ItemType, Rule } from '../types';

interface SRSViewProps {
  items: ReviewItem[];
  onComplete: (results: { id: string; remembered: boolean }[]) => void;
  onCancel: () => void;
  onInfiniteReview?: () => void;
}

type ReviewMode = 'standard' | 'writing' | 'grammar';
type FeedbackStatus = 'idle' | 'correct' | 'wrong';

interface GrammarQuizData {
  question: string;
  correctAnswer: string;
  maskedSentence: string;
  options: string[];
  correctIndex: number;
}

const SRSView: React.FC<SRSViewProps> = ({ items, onComplete, onCancel, onInfiniteReview }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ id: string; remembered: boolean }[]>([]);
  
  // Modes
  const [mode, setMode] = useState<ReviewMode>('standard');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackStatus>('idle');
  
  // AI Grammar Quiz State
  const [quizData, setQuizData] = useState<GrammarQuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [showTheory, setShowTheory] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!currentItem) return;

    setFeedback('idle');
    setInputValue('');
    setIsFlipped(false);
    setShowTheory(true);
    setQuizData(null);
    setQuizError(null);

    // DETERMINE MODE
    if (currentItem.type === ItemType.Rule) {
      setMode('grammar');
    } else {
      // Logic for cards: Writing mode only for cards that are NOT 'New'.
      // 33% chance of writing mode.
      const shouldWrite = currentItem.status !== CardStatus.New && Math.random() > 0.66;
      setMode(shouldWrite ? 'writing' : 'standard');
      
      if (shouldWrite) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [currentIndex, currentItem]);

  const handleAnswer = (remembered: boolean) => {
    const newResults = [...sessionResults, { id: currentItem.id, remembered }];
    setSessionResults(newResults);
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResults);
    }
  };

  const handleWritingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'writing') return;

    if (feedback !== 'idle') {
        if (feedback === 'wrong') handleAnswer(false);
        return;
    }

    // Safe cast since we know it's a card in writing mode
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

  const generateQuiz = async () => {
    if (mode !== 'grammar' || !currentItem) return;
    
    setQuizLoading(true);
    setQuizError(null);
    setShowTheory(false);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key не найден. Убедитесь, что вы добавили его в настройки.");
      }

      const rule = currentItem as Rule;
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Create a grammar quiz for the English rule: "${rule.title}".
        Explanation: "${rule.explanation}".
        
        1. Create a simple sentence in Russian that requires this grammar rule to be translated correctly.
        2. Create the correct English translation using the rule.
        3. Create a 'masked' version of the English sentence where the key grammatical part is missing (replaced by underscores).
        4. Provide 3 options for the missing part (1 correct, 2 common mistakes).
        
        Return ONLY a JSON object:
        {
          "question": "Russian sentence",
          "correctAnswer": "Full English sentence",
          "maskedSentence": "I _____ to the store yesterday.",
          "options": ["go", "went", "gone"],
          "correctIndex": 1
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        setQuizData(JSON.parse(response.text));
      } else {
        throw new Error("Пустой ответ от ИИ");
      }
    } catch (e: any) {
      console.error(e);
      setQuizError(e.message || "Ошибка при генерации теста");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSelection = (index: number) => {
    if (!quizData || feedback !== 'idle') return;

    if (index === quizData.correctIndex) {
      setFeedback('correct');
      setTimeout(() => handleAnswer(true), 2000);
    } else {
      setFeedback('wrong');
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-[2.5rem] text-center max-w-lg mx-auto mt-10 space-y-6">
        <div className="text-7xl mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">🎉</div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">Все готово!</h2>
        <p className="text-slate-400 text-lg">На данный момент карточки закончились.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto pt-4">
          {onInfiniteReview && (
            <button 
              onClick={onInfiniteReview}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>♾️</span> Тренироваться дальше
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

  // --- RENDERING HELPERS ---

  const renderProgressBar = () => (
    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-8">
      <div 
        className="bg-cyan-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
        style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
      />
    </div>
  );

  const renderHeader = () => (
    <div className="flex justify-between items-center px-2 mb-4">
      <div className="flex flex-col">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Прогресс</span>
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

  // --- MODE: GRAMMAR ---
  if (mode === 'grammar') {
    const rule = currentItem as Rule;
    return (
      <div className="max-w-xl mx-auto pb-20 animate-in fade-in duration-500">
        {renderHeader()}
        {renderProgressBar()}

        <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 border border-amber-500/20 relative overflow-hidden min-h-[500px] flex flex-col">
           {/* Background Deco */}
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 flex-grow flex flex-col">
              <span className="text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 w-fit">
                 Грамматика • {rule.level}
              </span>

              {quizError ? (
                // ERROR VIEW
                <div className="flex flex-col h-full items-center justify-center text-center animate-in fade-in">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Не удалось создать тест</h3>
                  <p className="text-slate-400 mb-8 max-w-xs">{quizError}</p>
                  
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={generateQuiz}
                      className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all"
                    >
                      Повторить
                    </button>
                    <button 
                      onClick={() => handleAnswer(true)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                    >
                      Пропустить
                    </button>
                  </div>
                </div>
              ) : showTheory ? (
                // THEORY VIEW
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-3xl font-black text-white mb-6 leading-tight">{rule.title}</h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-8 flex-grow">{rule.explanation}</p>
                  
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
                // LOADING VIEW
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-pulse">
                   <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                   <p className="text-amber-200 font-bold uppercase tracking-widest text-sm">ИИ придумывает ситуацию...</p>
                </div>
              ) : quizData ? (
                // QUIZ VIEW
                <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Переведите фразу:</h4>
                  <p className="text-2xl font-bold text-white mb-8">{quizData.question}</p>
                  
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8 text-center">
                    <p className="text-xl text-amber-100 font-medium">
                      {quizData.maskedSentence.split('_____').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block min-w-[60px] border-b-2 border-amber-500/50 mx-1 text-amber-400 px-2">
                              {feedback !== 'idle' && feedback === 'correct' ? quizData.options[quizData.correctIndex] : '?'}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>

                  <div className="grid gap-3 mt-auto">
                    {quizData.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizSelection(idx)}
                        disabled={feedback !== 'idle'}
                        className={`p-4 rounded-xl font-bold border-2 transition-all text-left
                           ${feedback === 'idle' 
                             ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50' 
                             : idx === quizData.correctIndex
                               ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                               : feedback === 'wrong' && idx !== quizData.correctIndex
                                 ? 'bg-white/5 border-white/10 opacity-50' // incorrect ones fade out
                                 : 'bg-white/5 border-white/10'
                            }
                           ${feedback === 'wrong' && idx === quizData.correctIndex ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : ''} 
                        `}
                      >
                         {option}
                      </button>
                    ))}
                  </div>
                  
                  {feedback === 'wrong' && (
                     <div className="mt-4 text-center">
                       <button onClick={() => handleAnswer(false)} className="text-red-400 font-bold underline">Продолжить (повторим позже)</button>
                     </div>
                  )}
                </div>
              ) : null}
           </div>
        </div>
      </div>
    );
  }

  // --- MODE: STANDARD & WRITING (Cards) ---
  const card = currentItem as any; // Cast to access card-specific props safely inside JSX if needed, though most match SRSFields

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {renderHeader()}
      {renderProgressBar()}

      {mode === 'standard' ? (
        <>
          {/* STANDARD FLASHCARD VIEW */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative perspective-1000 h-[450px] cursor-pointer group"
          >
            <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden glass-panel rounded-[3rem] flex flex-col items-center justify-center p-12 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-8">
                    {currentItem.status === CardStatus.Weak ? (
                      <span className="bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        Слабое место
                      </span>
                    ) : (
                      <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        English
                      </span>
                    )}
                 </div>
                 
                 <h3 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 text-center leading-tight tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                    {card.front}
                 </h3>
                 
                 <div className="absolute bottom-10 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                   Нажми, чтобы открыть
                 </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[3rem] flex flex-col items-center justify-center p-12 border border-white/20 shadow-[0_20px_50px_rgba(34,211,238,0.15)] bg-gradient-to-br from-cyan-900/80 to-blue-900/80 backdrop-blur-2xl">
                 <span className="text-cyan-200/50 text-[10px] font-black uppercase tracking-[0.2em] mb-8 absolute top-8">Перевод</span>
                 
                 <h3 className="text-4xl font-bold text-white text-center leading-tight mb-8 drop-shadow-md">
                    {card.back}
                 </h3>
                 
                 {card.example && (
                   <div className="bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-full">
                     <p className="text-cyan-100 text-lg italic text-center leading-relaxed font-serif">"{card.example}"</p>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Actions */}
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
          {/* WRITING MODE VIEW */}
          <div className="glass-panel rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden">
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
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default SRSView;
