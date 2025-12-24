
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardStatus } from '../types';

interface SRSViewProps {
  cards: Card[];
  onComplete: (results: { cardId: string; remembered: boolean }[]) => void;
  onCancel: () => void;
}

type ReviewMode = 'standard' | 'writing';
type FeedbackStatus = 'idle' | 'correct' | 'wrong';

const SRSView: React.FC<SRSViewProps> = ({ cards, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ cardId: string; remembered: boolean }[]>([]);
  
  // New states for writing mode
  const [mode, setMode] = useState<ReviewMode>('standard');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackStatus>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = cards[currentIndex];

  // Determine mode when card changes
  useEffect(() => {
    if (!currentCard) return;

    // Logic: Writing mode only for cards that are NOT 'New'.
    // 33% chance of writing mode.
    const shouldWrite = currentCard.status !== CardStatus.New && Math.random() > 0.66;
    
    setMode(shouldWrite ? 'writing' : 'standard');
    setIsFlipped(false);
    setInputValue('');
    setFeedback('idle');

    // Auto-focus input if in writing mode
    if (shouldWrite) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, currentCard]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-[2.5rem] text-center max-w-lg mx-auto mt-10">
        <div className="text-7xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">🎉</div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 mb-4">Все готово!</h2>
        <p className="text-slate-400 mb-10 text-lg">На данный момент карточки закончились. Отличная работа!</p>
        <button 
          onClick={onCancel} 
          className="px-12 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
        >
          На главную
        </button>
      </div>
    );
  }

  const handleAnswer = (remembered: boolean) => {
    const newResults = [...sessionResults, { cardId: currentCard.id, remembered }];
    setSessionResults(newResults);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResults);
    }
  };

  const handleWritingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== 'idle') {
        // If already showing result, pressing enter moves to next
        if (feedback === 'wrong') handleAnswer(false);
        return;
    }

    const cleanInput = inputValue.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanTarget = currentCard.front.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    if (cleanInput === cleanTarget) {
      setFeedback('correct');
      // Auto advance after short delay
      setTimeout(() => handleAnswer(true), 1500);
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Прогресс</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{currentIndex + 1}</span>
            <span className="text-slate-600 text-xl">/</span>
            <span className="text-slate-500 font-bold text-lg">{cards.length}</span>
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

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-cyan-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

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
                    {currentCard.status === CardStatus.Weak ? (
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
                    {currentCard.front}
                 </h3>
                 
                 <div className="absolute bottom-10 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                   Нажми, чтобы открыть
                 </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[3rem] flex flex-col items-center justify-center p-12 border border-white/20 shadow-[0_20px_50px_rgba(34,211,238,0.15)] bg-gradient-to-br from-cyan-900/80 to-blue-900/80 backdrop-blur-2xl">
                 <span className="text-cyan-200/50 text-[10px] font-black uppercase tracking-[0.2em] mb-8 absolute top-8">Перевод</span>
                 
                 <h3 className="text-4xl font-bold text-white text-center leading-tight mb-8 drop-shadow-md">
                    {currentCard.back}
                 </h3>
                 
                 {currentCard.example && (
                   <div className="bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-full">
                     <p className="text-cyan-100 text-lg italic text-center leading-relaxed font-serif">"{currentCard.example}"</p>
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
                {currentCard.back}
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
                   <p className="text-xl font-black text-white">{currentCard.front}</p>
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
