
import React, { useState, useEffect } from 'react';
import { Card, Rule, UserProfile, CardStatus, ItemType } from './types';
import { INITIAL_CARDS, INITIAL_RULES } from './constants';
import Dashboard from './components/Dashboard';
import SRSView from './components/SRSView';
import CollectionManager from './components/CollectionManager';
import { getNextReviewBatch, updateCardSRS } from './lib/srs';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'review' | 'collection'>('home');
  const [cards, setCards] = useState<Card[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Пользователь',
    level: 'B1',
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    stats: []
  });

  // Load from LocalStorage
  useEffect(() => {
    const savedCards = localStorage.getItem('lm_cards');
    const savedRules = localStorage.getItem('lm_rules');
    const savedProfile = localStorage.getItem('lm_profile');

    if (savedCards) setCards(JSON.parse(savedCards));
    else setCards(INITIAL_CARDS);

    if (savedRules) setRules(JSON.parse(savedRules));
    else setRules(INITIAL_RULES);

    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      const today = new Date().toISOString().split('T')[0];
      if (p.lastActiveDate !== today) {
        const lastDate = new Date(p.lastActiveDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() !== yesterday.toDateString() && lastDate.toDateString() !== today) {
           p.streak = p.streak > 0 ? p.streak : 1; 
        }
      }
      setProfile(p);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (cards.length > 0) localStorage.setItem('lm_cards', JSON.stringify(cards));
    if (rules.length > 0) localStorage.setItem('lm_rules', JSON.stringify(rules));
    localStorage.setItem('lm_profile', JSON.stringify(profile));
  }, [cards, rules, profile]);

  const handleCompleteReview = (results: { cardId: string; remembered: boolean }[]) => {
    const updatedCards = cards.map(card => {
      const result = results.find(r => r.cardId === card.id);
      if (result) {
        return updateCardSRS(card, result.remembered);
      }
      return card;
    });

    setCards(updatedCards);
    updateStats(0, results.length);
    setActiveView('home');
  };

  const updateStats = (added: number, repeated: number) => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      const newStats = [...prev.stats];
      const todayStatIndex = newStats.findIndex(s => s.date === today);
      
      if (todayStatIndex >= 0) {
        newStats[todayStatIndex].addedCount += added;
        newStats[todayStatIndex].repeatedCount += repeated;
      } else {
        newStats.push({ date: today, addedCount: added, repeatedCount: repeated });
      }

      return {
        ...prev,
        lastActiveDate: today,
        stats: newStats,
        streak: prev.lastActiveDate !== today ? prev.streak + 1 : prev.streak
      };
    });
  };

  const handleAddCard = (data: any) => {
    const newCard: Card = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: CardStatus.New,
      viewCount: 0,
      successCount: 0,
      errorCount: 0,
      lastShownDate: null,
      consecutiveSuccesses: 0
    };
    setCards([newCard, ...cards]);
    updateStats(1, 0);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const handleAddRule = (data: any) => {
    const newRule: Rule = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    setRules([newRule, ...rules]);
  };

  const handleUpdateRule = (updatedRule: Rule) => {
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const currentReviewBatch = getNextReviewBatch(cards);

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans">
      {/* Top Navigation - Floating Glass */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <div className="glass-panel rounded-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('home')}>
             <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">X</div>
             <span className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Xtlz English</span>
          </div>
          
          <div className="hidden md:flex bg-black/20 rounded-full p-1 border border-white/5">
            {[
              { id: 'home', label: 'Обзор' },
              { id: 'collection', label: 'Библиотека' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)} 
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeView === tab.id ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-200 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
               <span className="text-orange-400">🔥</span> {profile.streak}
             </div>
             <div className="w-9 h-9 bg-slate-800 rounded-full border border-white/20 overflow-hidden hidden xs:block shadow-lg">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt="Avatar" />
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 pt-32">
        {activeView === 'home' && (
          <Dashboard 
            cards={cards} 
            rules={rules} 
            profile={profile} 
            onStartReview={() => setActiveView('review')} 
          />
        )}

        {activeView === 'review' && (
          <SRSView 
            cards={currentReviewBatch} 
            onComplete={handleCompleteReview}
            onCancel={() => setActiveView('home')}
          />
        )}

        {activeView === 'collection' && (
          <CollectionManager 
            cards={cards}
            rules={rules}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={(id) => setRules(rules.filter(r => r.id !== id))}
          />
        )}
      </main>

      {/* Mobile Nav Bar - Bottom Glass */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
        <div className="glass-panel rounded-[2rem] px-6 py-4 flex justify-between items-center shadow-2xl">
          <button onClick={() => setActiveView('home')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'home' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          
          <button 
            onClick={() => setActiveView('review')} 
            className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white -mt-10 shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-[#0a0a0a] hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          
          <button onClick={() => setActiveView('collection')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'collection' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
