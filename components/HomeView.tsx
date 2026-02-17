import React, { useEffect, useState } from 'react';
import { InventoryItem, CleaningTask, Recipe, UserGameStats } from '../types';
import { generateSmartMealSuggestion } from '../services/geminiService';

interface Props {
  inventory: InventoryItem[];
  tasks: CleaningTask[];
  stats: UserGameStats;
  userName: string;
  onLikeRecipe: (recipe: Recipe) => void;
  onDislikeRecipe: (recipe: Recipe) => void;
}

const HomeView: React.FC<Props> = ({ inventory, tasks, stats, userName, onLikeRecipe, onDislikeRecipe }) => {
  const [smartRecipe, setSmartRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeFeedback, setRecipeFeedback] = useState<'none' | 'liked' | 'disliked'>('none');

  // Stats
  const criticalItems = inventory.filter(i => {
     const diffDays = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (86400000));
     return diffDays <= 3 && i.location !== 'Ménager';
  });
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    // Generate meal suggestion on mount if we have critical items
    const fetchSuggestion = async () => {
        if (criticalItems.length > 0) {
            setLoadingRecipe(true);
            const recipe = await generateSmartMealSuggestion(inventory, stats.preferences);
            setSmartRecipe(recipe);
            setLoadingRecipe(false);
        }
    };
    
    // Only fetch if we haven't given feedback yet or if it's empty
    if (!smartRecipe && recipeFeedback === 'none') {
        fetchSuggestion();
    }
  }, [inventory, stats.preferences]); // Re-run if preferences change

  const handleDislike = () => {
      if (smartRecipe) {
          onDislikeRecipe(smartRecipe);
          setRecipeFeedback('disliked');
          setSmartRecipe(null); // Clear it
      }
  };

  const handleLike = () => {
      if (smartRecipe) {
          onLikeRecipe(smartRecipe);
          setRecipeFeedback('liked');
      }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Bonjour, {userName.split(' ')[0]} !
            </h1>
            <p className="text-slate-500 font-medium">Tout est sous contrôle aujourd'hui.</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <i className="fas fa-exclamation-triangle text-5xl text-red-500"></i>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Stock Critique</h3>
              <p className="text-3xl font-bold text-slate-800">{criticalItems.length}</p>
              <p className="text-xs text-red-500 font-medium mt-1">
                  {criticalItems.length > 0 ? 'À consommer rapidement !' : 'Frigo sain'}
              </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <i className="fas fa-sparkles text-5xl text-purple-500"></i>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ménage</h3>
              <div className="flex items-end gap-1">
                 <p className="text-3xl font-bold text-slate-800">{completedTasks}/{totalTasks}</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
          </div>
      </div>

      {/* Smart Meal Suggestion Card */}
      <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl blur opacity-25"></div>
          <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                          <i className="fas fa-utensils"></i>
                      </div>
                      <span className="font-bold text-orange-800">Suggestion Anti-Gaspi</span>
                  </div>
                  {loadingRecipe && <i className="fas fa-circle-notch fa-spin text-orange-400"></i>}
              </div>

              <div className="p-6">
                 {loadingRecipe ? (
                     <div className="py-8 text-center text-slate-400">
                         <p className="animate-pulse">Hope cherche la recette parfaite...</p>
                     </div>
                 ) : recipeFeedback === 'disliked' ? (
                     <div className="py-8 text-center">
                         <i className="fas fa-check-circle text-4xl text-slate-300 mb-2"></i>
                         <p className="text-slate-600 font-medium">Compris ! Je ne proposerai plus ce genre de recette.</p>
                     </div>
                 ) : smartRecipe ? (
                     <>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{smartRecipe.title}</h2>
                        <p className="text-slate-500 text-sm mb-4 italic">"{smartRecipe.description}"</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {smartRecipe.ingredientsUsed.map((ing, i) => (
                                <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                    <i className="fas fa-check text-[10px]"></i> {ing}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est-ce que ça te tente ?</span>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDislike}
                                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center text-lg"
                                >
                                    <i className="fas fa-thumbs-down"></i>
                                </button>
                                <button 
                                    onClick={handleLike}
                                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg shadow-lg shadow-green-500/30 ${
                                        recipeFeedback === 'liked' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    }`}
                                >
                                    <i className="fas fa-thumbs-up"></i>
                                </button>
                            </div>
                        </div>
                     </>
                 ) : (
                     <div className="py-8 text-center text-slate-400">
                         <p>Pas assez d'ingrédients critiques pour une suggestion spéciale.</p>
                     </div>
                 )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomeView;