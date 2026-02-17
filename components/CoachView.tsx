import React, { useState } from 'react';
import { CleaningTask, UserGameStats, AvatarItem } from '../types';

interface Props {
  tasks: CleaningTask[];
  stats: UserGameStats;
  avatarCatalog: AvatarItem[];
  onCompleteTask: (taskId: string) => void;
  onBuyItem: (itemType: string, itemId: string, cost: number) => void;
  onGacha: () => Promise<void>;
  onRefreshTasks: () => void;
  onEquipTheme: (themeId: string) => void;
}

const CoachView: React.FC<Props> = ({ tasks, stats, avatarCatalog, onCompleteTask, onBuyItem, onGacha, onRefreshTasks, onEquipTheme }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'shop'>('tasks');
  const [shopCategory, setShopCategory] = useState<'boosts' | 'themes' | 'avatar'>('boosts');
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [gachaResult, setGachaResult] = useState<{type: 'coins' | 'item', value: string} | null>(null);

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    setGachaResult(null);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await onGacha();
    setIsWatchingAd(false);
    setGachaResult({ type: 'coins', value: 'Récompense récupérée !' });
    setTimeout(() => setGachaResult(null), 3000);
  };

  const dailyTasks = tasks.filter(t => !t.isWeekly);
  const weeklyTasks = tasks.filter(t => t.isWeekly);
  const totalDuration = tasks.filter(t => !t.completed).reduce((acc, t) => acc + t.duration, 0);

  // Filter avatar items: only show those NOT owned
  const shopAvatarItems = avatarCatalog.filter(item => !stats.unlockedAvatarItems.includes(item.id) && item.price > 0);

  // Themes Data
  const themes = [
    { id: 'default', name: 'Classique', cost: 0, preview: 'bg-slate-100', animated: false },
    { id: 'sunset', name: 'Sunset Vibe', cost: 500, preview: 'bg-gradient-to-r from-orange-400 to-pink-500', animated: true },
    { id: 'midnight', name: 'Midnight', cost: 800, preview: 'bg-slate-900', animated: false },
    { id: 'forest', name: 'Zen Forest', cost: 600, preview: 'bg-gradient-to-t from-green-300 to-yellow-100', animated: false },
  ];

  // Event Data (Simulated)
  const eventDaysLeft = 12;

  return (
    <div className="pb-24 animate-fade-in relative z-10">
      
      {/* Coach Header / Stats */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-b-[2rem] shadow-lg mb-6 -mx-4 -mt-6 pt-10 text-slate-800">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden border-2 border-white/50">
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.avatar.base}&clothing=${stats.avatar.clothing}&top=${stats.avatar.top}&accessories=${stats.avatar.accessories}`} 
                 className="w-full h-full object-cover"
                 alt="Avatar"
               />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-white/50 px-2 rounded-lg backdrop-blur-sm inline-block">Niveau {stats.level}</h2>
              <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(stats.xp % 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
               <i className="fas fa-fire text-orange-500 animate-pulse"></i>
               <span className="font-bold text-slate-800">{stats.streak}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
               <i className="fas fa-coins text-yellow-500"></i>
               <span className="font-bold text-slate-800">{stats.coins}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl backdrop-blur-sm">
           <button 
             onClick={() => setActiveTab('tasks')}
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Objectifs
           </button>
           <button 
             onClick={() => setActiveTab('shop')}
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'shop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Boutique
           </button>
        </div>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Motivation Banner */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-xl flex gap-4 items-center shadow-sm">
             <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <i className="fas fa-stopwatch text-xl"></i>
             </div>
             <div>
                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Temps estimé</p>
                <p className="text-slate-800 font-bold text-2xl">{totalDuration} min</p>
             </div>
             <button onClick={onRefreshTasks} className="ml-auto w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-indigo-400 hover:text-indigo-600 hover:rotate-180 transition-all">
                <i className="fas fa-sync-alt"></i>
             </button>
          </div>

          <div>
             <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2 px-1">
               <span className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center text-orange-500"><i className="fas fa-sun text-xs"></i></span> Quotidien
             </h3>
             <div className="space-y-3">
                {dailyTasks.map(task => (
                    <TaskCard key={task.id} task={task} onComplete={() => onCompleteTask(task.id)} />
                ))}
                {dailyTasks.length === 0 && <p className="text-slate-500 text-sm italic text-center py-4 bg-white/30 rounded-xl border border-dashed border-slate-300">Tout est propre ! ✨</p>}
             </div>
          </div>

          <div>
             <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2 px-1">
               <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-500"><i className="fas fa-calendar-week text-xs"></i></span> Hebdomadaire
             </h3>
             <div className="space-y-3">
                {weeklyTasks.map(task => (
                    <TaskCard key={task.id} task={task} onComplete={() => onCompleteTask(task.id)} />
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6">
           
           {/* Event Banner */}
           <div className="bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">EVENT</span>
                      <span className="text-xs text-indigo-200"><i className="far fa-clock"></i> {eventDaysLeft} jours restants</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Cyber-Clean 2077</h3>
                  <p className="text-indigo-200 text-xs max-w-[60%]">Débloque des tenues futuristes et des thèmes néons exclusifs !</p>
              </div>
              <i className="fas fa-vr-cardboard absolute bottom-2 right-4 text-6xl text-white opacity-10 group-hover:scale-110 transition-transform"></i>
           </div>

           {/* Ad Gacha */}
           <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Tirage Chanceux</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Gratuit</span>
              </div>
              <button 
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {isWatchingAd ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play"></i>}
                {isWatchingAd ? 'Visionnage...' : 'Regarder pub (Récompense)'}
              </button>
              {gachaResult && <div className="text-center text-green-600 font-bold mt-2 text-sm animate-bounce">{gachaResult.value}</div>}
           </div>

           {/* Shop Categories */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
               {['boosts', 'themes', 'avatar'].map((cat) => (
                   <button
                     key={cat}
                     onClick={() => setShopCategory(cat as any)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${shopCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                   >
                     {cat}
                   </button>
               ))}
           </div>

           {/* Shop Items List */}
           <div className="space-y-3">
              {shopCategory === 'boosts' && (
                  <>
                    <ShopItem title="Gel de Streak" desc="Protège votre série." price={50} icon="fa-snowflake" color="text-blue-500 bg-blue-100" canAfford={stats.coins >= 50} onBuy={() => onBuyItem('boost', 'freeze', 50)} />
                    <ShopItem title="Boost XP" desc="XP x2 pendant 24h." price={100} icon="fa-bolt" color="text-yellow-600 bg-yellow-100" canAfford={stats.coins >= 100} onBuy={() => onBuyItem('boost', 'xp', 100)} />
                  </>
              )}
              
              {shopCategory === 'themes' && (
                  <div className="grid grid-cols-2 gap-3">
                      {themes.map(theme => {
                          const isUnlocked = stats.unlockedThemes.includes(theme.id);
                          const isActive = stats.activeTheme === theme.id;
                          return (
                              <div key={theme.id} className={`bg-white p-3 rounded-xl border-2 ${isActive ? 'border-green-500' : 'border-slate-100'} shadow-sm flex flex-col`}>
                                  <div className={`h-20 rounded-lg mb-3 ${theme.preview} ${theme.animated ? 'animate-gradient-x' : ''}`}></div>
                                  <h4 className="font-bold text-sm text-slate-800">{theme.name}</h4>
                                  <div className="mt-auto pt-2">
                                      {isUnlocked ? (
                                          <button 
                                            onClick={() => onEquipTheme(theme.id)}
                                            disabled={isActive}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                          >
                                            {isActive ? 'Actif' : 'Équiper'}
                                          </button>
                                      ) : (
                                          <button 
                                            onClick={() => onBuyItem('theme', theme.id, theme.cost)}
                                            disabled={stats.coins < theme.cost}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${stats.coins >= theme.cost ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                                          >
                                            {theme.cost} <i className="fas fa-coins text-[9px]"></i>
                                          </button>
                                      )}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}

              {shopCategory === 'avatar' && (
                  <div className="space-y-3">
                      {shopAvatarItems.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 bg-white/50 rounded-xl">
                              <p>Vous avez tout débloqué pour le moment !</p>
                          </div>
                      ) : (
                          shopAvatarItems.map(item => (
                            <ShopItem 
                                key={item.id}
                                title={item.name} 
                                desc={item.type === 'clothing' ? 'Tenue stylée' : item.type === 'top' ? 'Coiffure / Chapeau' : 'Accessoire'} 
                                price={item.price} 
                                icon={item.icon || 'fa-shirt'} 
                                color="text-purple-600 bg-purple-100" 
                                canAfford={stats.coins >= item.price} 
                                onBuy={() => onBuyItem('avatar', item.id, item.price)} 
                            />
                          ))
                      )}
                  </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const ShopItem: React.FC<{ title: string, desc: string, price: number, icon: string, color: string, canAfford: boolean, onBuy: () => void }> = ({ title, desc, price, icon, color, canAfford, onBuy }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 leading-tight">{desc}</p>
            </div>
            <button 
                onClick={onBuy}
                disabled={!canAfford}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-all ${
                    canAfford 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/30' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                {price} <i className="fas fa-coins text-[10px]"></i>
            </button>
        </div>
    )
}

const TaskCard: React.FC<{ task: CleaningTask; onComplete: () => void }> = ({ task, onComplete }) => {
    return (
        <div className={`p-4 rounded-xl border transition-all duration-300 ${task.completed ? 'bg-white/40 border-slate-200 opacity-60' : 'bg-white border-white/60 shadow-sm hover:scale-[1.02]'}`}>
            <div className="flex items-start gap-4">
                <button 
                    onClick={onComplete}
                    disabled={task.completed}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-slate-300 text-transparent hover:border-green-500 bg-white'
                    }`}
                >
                    <i className="fas fa-check text-sm"></i>
                </button>
                <div className="flex-1">
                    <h4 className={`font-bold text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            <i className="far fa-clock mr-1"></i>{task.duration} min
                        </span>
                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                             <i className="fas fa-coins mr-1"></i>+{task.coinsReward}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CoachView;