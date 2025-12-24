
import React from 'react';
import { Card, Rule, UserProfile, CardStatus, ItemType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  cards: Card[];
  rules: Rule[];
  profile: UserProfile;
  onStartReview: () => void;
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
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-[0_0_40px_rgba(56,189,248,0.15)] group">
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-colors duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-400/30 transition-colors duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              Привет, {profile.name}!
            </h1>
            <p className="text-blue-100/80 text-lg">Твой разум готов к новым знаниям.</p>
            
            <div className="mt-6 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md">
               <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-cyan-300">
                 <span>Цель дня</span>
                 <span>{progressPercent}%</span>
               </div>
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
               </div>
               <div className="text-right mt-1 text-xs text-slate-400">{todayStat.repeatedCount} / {dailyGoal}</div>
            </div>
          </div>
          
          <button 
            onClick={onStartReview}
            className="group relative px-10 py-5 bg-white/5 border border-white/20 rounded-[2rem] font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 text-white">
              <span>НАЧАТЬ</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Слова', val: counts.words, color: 'text-cyan-400' },
          { label: 'Фразы', val: counts.phrases, color: 'text-purple-400' },
          { label: 'Правила', val: counts.rules, color: 'text-amber-400' },
          { label: 'Выучено', val: counts.known, color: 'text-emerald-400' }
        ].map((s, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors group">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 group-hover:text-white transition-colors">{s.label}</span>
            <span className={`text-4xl font-extrabold ${s.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>{s.val}</span>
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
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
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
                  <div key={c.id} className="flex justify-between items-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    <span className="font-bold text-red-200">{c.front}</span>
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
                <span className="text-3xl font-black text-white mb-2">{wordOfTheDay.front}</span>
                <span className="text-amber-200/80 text-lg mb-4">{wordOfTheDay.back}</span>
                {wordOfTheDay.example && (
                  <p className="p-4 bg-black/20 rounded-2xl text-sm italic text-slate-300 border border-white/5">
                    "{wordOfTheDay.example}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
