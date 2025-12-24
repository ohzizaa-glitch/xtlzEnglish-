
import React from 'react';
import { Card, Rule, UserProfile, CardStatus, ItemType, ReviewMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  cards: Card[];
  rules: Rule[];
  profile: UserProfile;
  onStartReview: (mode: ReviewMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cards, rules, profile, onStartReview }) => {
  const counts = {
    words: cards.filter(c => c.type === ItemType.Word).length,
    phrases: cards.filter(c => c.type === ItemType.Phrase).length,
    rules: rules.length,
    known: cards.filter(c => c.status === CardStatus.Known).length,
    weak: cards.filter(c => c.status === CardStatus.Weak).length,
    learning: cards.filter(c => c.status === CardStatus.Learning).length,
    new: cards.filter(c => c.status === CardStatus.New).length
  };

  const today = new Date().toISOString().split('T')[0];
  const todayStat = profile.stats.find(s => s.date === today) || { addedCount: 0, repeatedCount: 0 };
  const dailyGoal = 15; // cards per day goal
  const progressPercent = Math.min(100, Math.round((todayStat.repeatedCount / dailyGoal) * 100));

  const chartData = profile.stats.slice(-7).map(s => ({
    name: s.date.split('-').slice(1).reverse().join('/'),
    repeated: s.repeatedCount,
    added: s.addedCount
  }));

  const wordOfTheDay = cards.length > 0 ? cards[Math.floor(Math.random() * cards.length)] : null;
  const weakCards = cards.filter(c => c.status === CardStatus.Weak).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_0_40px_rgba(56,189,248,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-colors duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left w-full">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200">
              Привет, {profile.name}!
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base">Готов прокачать свой уровень?</p>
            
            <div className="mt-4 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md max-w-md">
               <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-cyan-300">
                 <span>Цель дня</span>
                 <span>{progressPercent}%</span>
               </div>
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button 
          onClick={() => onStartReview('flashcards')}
          className="group relative p-6 glass-panel rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-cyan-500/20 hover:shadow-2xl text-left border-cyan-500/20"
        >
          <div className="absolute top-4 right-4 text-3xl group-hover:scale-110 transition-transform">🎴</div>
          <h3 className="text-xl font-bold text-white mb-2">Карточки</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Классический режим. Смотришь слово — вспоминаешь перевод. Идеально для расширения словаря.</p>
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Начать <span className="text-lg">→</span>
          </div>
        </button>

        <button 
          onClick={() => onStartReview('writing')}
          className="group relative p-6 glass-panel rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-purple-500/20 hover:shadow-2xl text-left border-purple-500/20"
        >
          <div className="absolute top-4 right-4 text-3xl group-hover:scale-110 transition-transform">✍️</div>
          <h3 className="text-xl font-bold text-white mb-2">Правописание</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Хардкор. Тебе дается перевод, ты пишешь оригинал вручную. Закрепляет написание.</p>
          <div className="mt-4 flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Начать <span className="text-lg">→</span>
          </div>
        </button>

        <button 
          onClick={() => onStartReview('grammar')}
          className="group relative p-6 glass-panel rounded-[2rem] hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-amber-500/20 hover:shadow-2xl text-left border-amber-500/20"
        >
          <div className="absolute top-4 right-4 text-3xl group-hover:scale-110 transition-transform">🧠</div>
          <h3 className="text-xl font-bold text-white mb-2">ИИ Тренер</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Тренировка правил. ИИ создает тесты, просит перевести предложения и задает вопросы.</p>
          <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Начать <span className="text-lg">→</span>
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Слова', val: counts.words, color: 'text-cyan-400' },
          { label: 'Фразы', val: counts.phrases, color: 'text-purple-400' },
          { label: 'Правила', val: counts.rules, color: 'text-amber-400' },
          { label: 'Выучено', val: counts.known, color: 'text-emerald-400' }
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 rounded-3xl flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{s.label}</span>
            <span className={`text-2xl font-extrabold ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass-panel p-8 rounded-[2.5rem]">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            Активность
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', color: '#fff' }}
                />
                <Bar dataKey="repeated" name="Повторы" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="added" name="Новые" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          {weakCards.length > 0 && (
            <div className="glass-panel p-8 rounded-[2.5rem] border-red-500/20">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">⚠️</span> Слабые места
              </h2>
              <div className="space-y-3">
                {weakCards.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    <span className="font-bold text-red-200 text-sm">{c.front}</span>
                    <span className="text-xs text-red-300/80 font-medium">{c.back}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordOfTheDay && (
            <div className="glass-panel p-8 rounded-[2.5rem] border-amber-500/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-amber-400 font-bold uppercase text-xs tracking-[0.2em]">Слово дня</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full font-bold border border-amber-500/20">{wordOfTheDay.level}</span>
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-2xl font-black text-white mb-2">{wordOfTheDay.front}</span>
                <span className="text-amber-200/80 text-base mb-4">{wordOfTheDay.back}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
