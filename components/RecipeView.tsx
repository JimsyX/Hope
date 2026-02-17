import React, { useState } from 'react';
import { InventoryItem, Recipe, UserPreferences } from '../types';
import { generateRecipesFromInventory } from '../services/geminiService';

interface Props {
  inventory: InventoryItem[];
  preferences: UserPreferences;
}

const RecipeView: React.FC<Props> = ({ inventory, preferences }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const generated = await generateRecipesFromInventory(inventory, preferences);
      setRecipes(generated);
    } catch (e) {
      setError("Impossible de générer des recettes pour le moment. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRecipe(expandedRecipe === id ? null : id);
  };

  if (inventory.length < 3) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-shopping-basket text-3xl text-slate-300"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Pas assez d'ingrédients</h3>
              <p className="text-slate-500">Ajoutez au moins 3 produits à votre inventaire pour que l'IA puisse vous proposer des recettes magiques !</p>
          </div>
      )
  }

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-8 shadow-xl shadow-primary-900/20 relative overflow-hidden">
        <i className="fas fa-carrot absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12"></i>
        <h2 className="text-2xl font-bold mb-2 relative z-10">Chef IA</h2>
        <p className="opacity-90 mb-6 text-sm relative z-10">
          Laissez l'intelligence artificielle analyser votre frigo et créer des recettes anti-gaspillage.
        </p>
        
        {preferences.allergies.length > 0 && (
            <div className="relative z-10 mb-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-2 text-xs flex items-center gap-2">
                 <i className="fas fa-shield-alt"></i>
                 <span>Allergies prises en compte: {preferences.allergies.join(', ')}</span>
            </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="relative z-10 w-full bg-white text-primary-700 font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-primary-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i> Réflexion en cours...
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles"></i> Suggérer des recettes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl mb-6 border border-danger-100 flex items-center gap-3">
          <i className="fas fa-exclamation-triangle"></i>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {recipes.map((recipe, index) => (
          <div 
            key={recipe.id} 
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
                className="p-5 cursor-pointer"
                onClick={() => toggleExpand(recipe.id)}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight flex-1 pr-4">{recipe.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        recipe.difficulty === 'Facile' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {recipe.difficulty}
                    </span>
                </div>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                        <i className="far fa-clock"></i> {recipe.prepTime}
                    </span>
                    <span className="flex items-center gap-1 text-primary-600">
                        <i className="fas fa-check"></i> {recipe.ingredientsUsed.length} ingrédients utilisés
                    </span>
                </div>
            </div>

            {/* Expandable Content */}
            <div className={`border-t border-slate-50 bg-slate-50/50 transition-all duration-300 ease-in-out overflow-hidden ${expandedRecipe === recipe.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5">
                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Ingrédients</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                            {recipe.ingredientsUsed.map((ing, i) => (
                                <li key={`used-${i}`} className="flex items-center gap-2">
                                    <i className="fas fa-check-circle text-primary-500 text-xs"></i> {ing}
                                </li>
                            ))}
                            {recipe.missingIngredients.map((ing, i) => (
                                <li key={`missing-${i}`} className="flex items-center gap-2 text-slate-400">
                                    <i className="fas fa-plus-circle text-slate-300 text-xs"></i> {ing} (Manquant)
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Instructions</h4>
                        <ol className="text-sm text-slate-600 space-y-3 list-decimal pl-4">
                            {recipe.instructions.map((step, i) => (
                                <li key={i} className="pl-1">{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeView;