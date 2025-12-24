
import React, { useState } from 'react';
import { Card, Rule, ItemType, CardStatus } from '../types';
import { LEVELS } from '../constants';
import { generateText, getFriendlyErrorMessage } from '../lib/gemini';

interface CollectionManagerProps {
  cards: Card[];
  rules: Rule[];
  onAddCard: (card: Omit<Card, 'id' | 'status' | 'viewCount' | 'successCount' | 'errorCount' | 'lastShownDate' | 'consecutiveSuccesses'>) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onAddRule: (rule: Omit<Rule, 'id' | 'status' | 'viewCount' | 'successCount' | 'errorCount' | 'lastShownDate' | 'consecutiveSuccesses'>) => void;
  onUpdateRule: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
}

const CollectionManager: React.FC<CollectionManagerProps> = ({ 
  cards, rules, onAddCard, onUpdateCard, onDeleteCard, onAddRule, onUpdateRule, onDeleteRule 
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'rules'>('cards');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Card | Rule | null>(null);
  const [filterFavorite, setFilterFavorite] = useState(false);

  // Form states
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [level, setLevel] = useState('B1');
  const [type, setType] = useState<ItemType>(ItemType.Word);
  const [explanation, setExplanation] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  
  // AI Loading State
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredCards = cards.filter(c => {
    const matchesSearch = c.front.toLowerCase().includes(search.toLowerCase()) || c.back.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = filterFavorite ? c.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = filterFavorite ? r.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleAiGenerate = async () => {
    if (!front) return;
    
    setIsAiLoading(true);
    try {
      const prompt = `
        Translate the English word/phrase "${front}" into Russian.
        Determine its CEFR level (A1, A2, B1, B2, C1, C2).
        Determine if it is a single "Word" or a "Phrase".
        Provide a short, simple example sentence in English containing the word.
        
        Return ONLY a JSON object with this structure:
        {
          "translation": "Russian translation",
          "level": "Level",
          "type": "Word or Phrase",
          "example": "Example sentence"
        }
      `;

      // Use the universal function
      const text = await generateText(prompt, true);
      
      if (text) {
        const data = JSON.parse(text);
        setBack(data.translation);
        setLevel(data.level);
        setExample(data.example);
        setType(data.type === 'Phrase' ? ItemType.Phrase : ItemType.Word);
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'cards') {
      const cardType = type as ItemType.Word | ItemType.Phrase;
      if (editingItem && 'front' in editingItem) {
        onUpdateCard({ ...editingItem, front, back, example, level, type: cardType });
      } else {
        onAddCard({ front, back, example, level, type: cardType, tags: [], isFavorite: false, relatedRuleIds: [] });
      }
    } else {
      if (editingItem && 'title' in editingItem) {
        onUpdateRule({ ...editingItem, title: ruleTitle, explanation, level, examples: example ? [example] : [] });
      } else {
        onAddRule({ 
            title: ruleTitle, 
            explanation, 
            level, 
            isFavorite: false, 
            examples: example ? [example] : [],
            type: ItemType.Rule
        });
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setFront(''); setBack(''); setExample(''); setRuleTitle(''); setExplanation('');
    setEditingItem(null); setShowForm(false);
  };

  const startEditCard = (card: Card) => {
    setActiveTab('cards');
    setEditingItem(card);
    setFront(card.front);
    setBack(card.back);
    setExample(card.example || '');
    setLevel(card.level);
    setType(card.type);
    setShowForm(true);
  };

  const startEditRule = (rule: Rule) => {
    setActiveTab('rules');
    setEditingItem(rule);
    setRuleTitle(rule.title);
    setExplanation(rule.explanation);
    setExample(rule.examples?.[0] || '');
    setLevel(rule.level);
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-1 p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
          <button 
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'cards' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Карточки
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'rules' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Правила
          </button>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
           <div className="relative flex-grow group">
              <input 
                type="text" 
                placeholder="Поиск..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-input rounded-2xl transition-all"
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <button 
             onClick={() => setFilterFavorite(!filterFavorite)}
             className={`p-3 rounded-2xl border transition-all ${filterFavorite ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-black/20 border-white/10 text-slate-500 hover:text-white'}`}
             title="Избранное"
           >
             ❤️
           </button>
           <button 
             onClick={() => setShowForm(true)}
             className="px-6 py-3 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all active:scale-95 border border-cyan-400/20"
           >
             + Добавить
           </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-[2.5rem] w-full max-w-lg p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
               {editingItem ? 'Редактировать' : 'Добавить'} {activeTab === 'cards' ? 'карточку' : 'правило'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === 'cards' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Фраза (EN)</label>
                    <div className="relative">
                      <input 
                        required 
                        value={front} 
                        onChange={e => setFront(e.target.value)} 
                        className="w-full pl-5 pr-24 py-4 glass-input rounded-2xl" 
                        placeholder="Например: Serendipity" 
                      />
                      <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={isAiLoading || !front}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isAiLoading ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <span>✨</span> Авто
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Перевод (RU)</label>
                    <input required value={back} onChange={e => setBack(e.target.value)} className="w-full px-5 py-4 glass-input rounded-2xl" placeholder="Значение..." />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Название правила</label>
                    <input required value={ruleTitle} onChange={e => setRuleTitle(e.target.value)} className="w-full px-5 py-4 glass-input rounded-2xl" placeholder="Например: Past Continuous" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Объяснение</label>
                    <textarea required value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full px-5 py-4 glass-input rounded-2xl" rows={3} placeholder="Как это работает..." />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Пример</label>
                <textarea value={example} onChange={e => setExample(e.target.value)} className="w-full px-5 py-4 glass-input rounded-2xl" rows={2} placeholder="Пример использования..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Уровень</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-5 py-4 glass-input rounded-2xl appearance-none cursor-pointer">
                    {LEVELS.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                </div>
                {activeTab === 'cards' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Тип</label>
                    <select value={type} onChange={e => setType(e.target.value as ItemType)} className="w-full px-5 py-4 glass-input rounded-2xl appearance-none cursor-pointer">
                      <option value={ItemType.Word} className="bg-slate-900">Слово</option>
                      <option value={ItemType.Phrase} className="bg-slate-900">Фраза</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={resetForm} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-colors">Отмена</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeTab === 'cards' ? (
          filteredCards.map(card => (
            <div key={card.id} className="glass-panel p-6 rounded-[2rem] flex flex-col group relative transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${card.type === ItemType.Word ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' : 'bg-purple-500/20 text-purple-300 border border-purple-500/20'}`}>
                    {card.type === ItemType.Word ? 'Слово' : 'Фраза'}
                  </span>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-bold uppercase border border-white/5">{card.level}</span>
                  {card.status === CardStatus.Weak && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(248,113,113,0.2)]">СЛАБОЕ</span>}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => onUpdateCard({ ...card, isFavorite: !card.isFavorite })}
                     className={`p-1.5 rounded-lg transition-colors ${card.isFavorite ? 'text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' : 'text-slate-600 hover:text-pink-400'}`}
                   >
                     {card.isFavorite ? '❤️' : '🤍'}
                   </button>
                   <button 
                     onClick={() => startEditCard(card)}
                     className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                   <button 
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{card.front}</h4>
              <p className="text-slate-400 text-sm font-medium">{card.back}</p>
              {card.example && <p className="mt-4 text-xs italic text-slate-500 bg-black/20 p-3 rounded-xl border border-white/5">"{card.example}"</p>}
            </div>
          ))
        ) : (
          filteredRules.map(rule => (
            <div key={rule.id} className="glass-panel p-6 rounded-[2rem] group transition-all hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300 border border-amber-500/20 font-bold uppercase tracking-wider">{rule.level}</span>
                   <h4 className="text-xl font-bold text-white mt-2">{rule.title}</h4>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                     onClick={() => onUpdateRule({ ...rule, isFavorite: !rule.isFavorite })}
                     className={`p-1.5 rounded-lg transition-colors ${rule.isFavorite ? 'text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' : 'text-slate-600 hover:text-pink-400'}`}
                   >
                     {rule.isFavorite ? '❤️' : '🤍'}
                   </button>
                   <button 
                     onClick={() => startEditRule(rule)}
                     className="p-1.5 text-slate-600 hover:text-cyan-400 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                  <button onClick={() => onDeleteRule(rule.id)} className="p-1.5 text-slate-600 hover:text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{rule.explanation}</p>
              {rule.examples?.[0] && (
                 <div className="bg-amber-500/10 border-l-2 border-amber-500/50 p-3 rounded-r-xl">
                   <p className="text-xs font-bold text-amber-200/80 italic">"{rule.examples[0]}"</p>
                 </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {activeTab === 'cards' && filteredCards.length === 0 && (
        <div className="py-20 text-center space-y-4 opacity-50">
          <div className="text-6xl grayscale">🔍</div>
          <p className="text-slate-500 font-medium">В пустоте ничего не найдено.</p>
        </div>
      )}
    </div>
  );
};

export default CollectionManager;
