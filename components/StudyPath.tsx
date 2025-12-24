
import React, { useState } from 'react';
import { StudyTopic } from '../types';
import { CURRICULUM } from '../constants';

interface StudyPathProps {
  completedTopicIds: string[];
  onSelectTopic: (topic: StudyTopic) => void;
  onBack: () => void;
  onToggleCompletion: (topicId: string) => void;
}

const StudyPath: React.FC<StudyPathProps> = ({ completedTopicIds, onSelectTopic, onBack, onToggleCompletion }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Updated Levels
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  
  const isTopicLocked = (topic: StudyTopic) => {
    if (topic.order === 1) return false;
    const prevTopic = CURRICULUM.find(t => t.order === topic.order - 1);
    return prevTopic && !completedTopicIds.includes(prevTopic.id);
  };

  const isTopicCompleted = (id: string) => completedTopicIds.includes(id);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={onBack} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-3xl font-black text-white">Карта Знаний</h1>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-black/30 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-all w-full md:w-auto justify-between md:justify-start">
                <span className={`text-sm font-bold uppercase tracking-wider ${isEditMode ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isEditMode ? 'Я знаю это (Edit)' : 'Режим обучения'}
                </span>
                <div className="relative w-12 h-6 bg-slate-800 rounded-full border border-white/20 transition-colors">
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-md ${isEditMode ? 'bg-emerald-500 translate-x-6' : 'bg-slate-400'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={isEditMode} onChange={() => setIsEditMode(!isEditMode)} />
            </label>
        </div>

        {isEditMode && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-8 animate-in slide-in-from-top-4 text-center">
                <p className="text-emerald-300 font-bold text-sm">Включен режим редактирования. Нажмите на любой урок, чтобы отметить его как пройденный или сбросить прогресс.</p>
            </div>
        )}

        <div className="space-y-12 relative">
            {levels.map((level) => {
                const topicsInLevel = CURRICULUM.filter(t => t.level === level);
                if (topicsInLevel.length === 0) return null;

                return (
                    <div key={level} className="relative z-10">
                        <div className="sticky top-24 z-20 flex justify-center mb-8">
                             <span className="px-6 py-2 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-xl shadow-lg">
                                 {level}
                             </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                            {topicsInLevel.map((topic, index) => {
                                const locked = isTopicLocked(topic);
                                const completed = isTopicCompleted(topic.id);
                                
                                return (
                                    <div 
                                        key={topic.id}
                                        onClick={() => {
                                            if (isEditMode) {
                                                onToggleCompletion(topic.id);
                                            } else {
                                                if (!locked) onSelectTopic(topic);
                                            }
                                        }}
                                        className={`
                                            relative p-6 rounded-[2rem] border transition-all duration-300 flex items-center gap-6 group
                                            ${isEditMode 
                                                ? 'cursor-pointer hover:scale-[1.01] hover:border-emerald-500/50' 
                                                : locked 
                                                    ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed grayscale' 
                                                    : completed 
                                                        ? 'bg-emerald-900/20 border-emerald-500/30 cursor-pointer hover:bg-emerald-900/30' 
                                                        : 'bg-slate-800/40 border-cyan-500/30 cursor-pointer hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-[1.02]'
                                            }
                                            ${isEditMode && completed ? 'bg-emerald-900/20 border-emerald-500/50' : ''}
                                            ${isEditMode && !completed ? 'bg-slate-800/40 border-white/10' : ''}
                                        `}
                                    >
                                        {/* Status Icon */}
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold border-2 shrink-0 transition-all
                                            ${isEditMode 
                                                ? completed 
                                                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                                                    : 'border-slate-600 bg-slate-800 text-slate-500 group-hover:border-emerald-400 group-hover:text-emerald-400'
                                                : locked 
                                                    ? 'border-white/10 bg-white/5 text-slate-500' 
                                                    : completed 
                                                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                                                        : 'border-cyan-500 bg-cyan-900/50 text-cyan-400 animate-pulse-slow'
                                            }
                                        `}>
                                            {isEditMode 
                                                ? (completed ? '✓' : '○') 
                                                : (locked ? '🔒' : completed ? '✓' : topic.order)
                                            }
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border 
                                                    ${completed ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-300' : 'bg-white/10 border-white/10 text-slate-400'}`}>
                                                    {topic.category}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-white/5 px-2 py-0.5 rounded-full">
                                                    {topic.vocabCount} слов
                                                </span>
                                            </div>
                                            <h3 className={`text-xl font-bold mb-1 ${completed ? 'text-emerald-100' : 'text-white'}`}>{topic.title}</h3>
                                            <p className="text-sm text-slate-400 leading-snug">{topic.description}</p>
                                        </div>

                                        {!isEditMode && !locked && !completed && (
                                            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                        )}
                                        
                                        {isEditMode && (
                                            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-400 transition-all">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default StudyPath;
