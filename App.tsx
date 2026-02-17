import React, { useState, useEffect } from 'react';
import { InventoryItem, ViewState, StorageLocation, Unit, CleaningTask, UserGameStats, Recipe, AvatarItem, ShoppingItem, Department } from './types';
import InventoryItemCard from './components/InventoryItemCard';
import AddItemForm from './components/AddItemForm';
import RecipeView from './components/RecipeView';
import CoachView from './components/CoachView';
import HomeView from './components/HomeView';
import ShoppingListView from './components/ShoppingListView';
import Navigation from './components/Navigation';
import ChatWithHope from './components/ChatWithHope';
import { generateCleaningTasks } from './services/geminiService';

// Define Avatar Catalog
const AVATAR_CATALOG: AvatarItem[] = [
    // Base items (Free)
    { id: 'base_felix', type: 'base', name: 'Felix', value: 'Felix', price: 0 },
    { id: 'base_aneka', type: 'base', name: 'Aneka', value: 'Aneka', price: 0 },
    { id: 'base_jocelyn', type: 'base', name: 'Jocelyn', value: 'Jocelyn', price: 0 },
    
    // Clothing (Free Start)
    { id: 'cloth_blazer', type: 'clothing', name: 'Blazer', value: 'blazerAndShirt', price: 0, icon: 'fa-user-tie' },
    { id: 'cloth_shirt', type: 'clothing', name: 'Chemise', value: 'shirtCrewNeck', price: 0, icon: 'fa-tshirt' },
    
    // Clothing (Shop)
    { id: 'cloth_hoodie', type: 'clothing', name: 'Hoodie Cool', value: 'hoodie', price: 150, icon: 'fa-user-ninja' },
    { id: 'cloth_overall', type: 'clothing', name: 'Salopette', value: 'overall', price: 200, icon: 'fa-user-astronaut' },
    { id: 'cloth_graphic', type: 'clothing', name: 'T-shirt Graphique', value: 'graphicShirt', price: 100, icon: 'fa-shirt' },

    // Tops/Hats/Hair (Free)
    { id: 'top_short', type: 'top', name: 'Court', value: 'shortHairShortFlat', price: 0, icon: 'fa-user' },
    { id: 'top_long', type: 'top', name: 'Long', value: 'longHairMiaWallace', price: 0, icon: 'fa-user-long-hair' },
    
    // Tops/Hats/Hair (Shop)
    { id: 'top_beanie', type: 'top', name: 'Bonnet Hiver', value: 'winterHat1', price: 120, icon: 'fa-hat-winter' },
    { id: 'top_cowboy', type: 'top', name: 'Chapeau Cowboy', value: 'hatCowboy', price: 250, icon: 'fa-hat-cowboy' },
    { id: 'top_big_hair', type: 'top', name: 'Volume Max', value: 'longHairBigHair', price: 180, icon: 'fa-user-punk' },

    // Accessories (Shop)
    { id: 'acc_glasses', type: 'accessories', name: 'Lunettes', value: 'prescription02', price: 80, icon: 'fa-glasses' },
    { id: 'acc_shades', type: 'accessories', name: 'Lunettes Soleil', value: 'sunglasses', price: 150, icon: 'fa-sunglasses' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home'); // Default to home
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<StorageLocation | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeUser, setActiveUser] = useState("Famille Martin");
  
  // Settings/Wardrobe State
  const [avatarTab, setAvatarTab] = useState<'base'|'clothing'|'top'|'accessories'>('clothing');

  // Coach & Game State
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [gameStats, setGameStats] = useState<UserGameStats>({
    coins: 100,
    streak: 0,
    level: 1,
    xp: 0,
    lastCleanDate: null,
    inventory: { freeze: 1 },
    unlockedThemes: ['default'],
    activeTheme: 'default',
    unlockedAvatarItems: ['base_felix', 'base_aneka', 'base_jocelyn', 'cloth_blazer', 'cloth_shirt', 'top_short', 'top_long'], // Default unlocked
    avatar: { base: 'Felix', clothing: 'blazerAndShirt', top: 'shortHairShortFlat', accessories: 'none' },
    preferences: {
        allergies: [],
        dislikedRecipes: []
    }
  });

  // Load Data
  useEffect(() => {
    const savedInv = localStorage.getItem('frigosmart_inventory');
    if (savedInv) setInventory(JSON.parse(savedInv));
    else {
         // Default items
         setInventory([
            { id: '1', name: 'Lait demi-écrémé', location: StorageLocation.FRIDGE, quantity: 1, unit: Unit.LITERS, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], addedDate: new Date().toISOString(), userId: '1' },
            { id: '2', name: 'Spray Nettoyant', location: StorageLocation.HOUSEHOLD, quantity: 1, unit: Unit.PIECE, expiryDate: '2025-12-31', addedDate: new Date().toISOString(), userId: '1' },
         ]);
    }

    const savedList = localStorage.getItem('frigosmart_shopping');
    if (savedList) setShoppingList(JSON.parse(savedList));

    const savedStats = localStorage.getItem('frigosmart_stats');
    if (savedStats) {
        const parsed = JSON.parse(savedStats);
        // Migration helper: ensure new avatar structure exists if loading old data
        if (!parsed.avatar.clothing) {
            parsed.avatar = { base: parsed.avatar.base, clothing: 'blazerAndShirt', top: 'shortHairShortFlat', accessories: 'none' };
            parsed.unlockedAvatarItems = ['base_felix', 'base_aneka', 'base_jocelyn', 'cloth_blazer', 'cloth_shirt', 'top_short', 'top_long'];
        }
        setGameStats(parsed);
    }

    const savedTasks = localStorage.getItem('frigosmart_tasks');
    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (parsedTasks.length > 0 && parsedTasks[0].date === new Date().toISOString().split('T')[0]) {
             setTasks(parsedTasks);
        } else {
            refreshTasks();
        }
    } else {
        refreshTasks();
    }
  }, []);

  // Persistence
  useEffect(() => localStorage.setItem('frigosmart_inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('frigosmart_shopping', JSON.stringify(shoppingList)), [shoppingList]);
  useEffect(() => localStorage.setItem('frigosmart_stats', JSON.stringify(gameStats)), [gameStats]);
  useEffect(() => localStorage.setItem('frigosmart_tasks', JSON.stringify(tasks)), [tasks]);

  // Actions
  const handleAddItem = (item: Omit<InventoryItem, 'id' | 'addedDate' | 'userId'>) => {
    const newItem: InventoryItem = { ...item, id: Date.now().toString(), addedDate: new Date().toISOString(), userId: 'currentUser' };
    setInventory((prev) => [newItem, ...prev]);
    setView('inventory');
  };

  const handleDeleteItem = (id: string) => setInventory((prev) => prev.filter((item) => item.id !== id));

  // Shopping List Actions
  const handleAddToShoppingList = (name: string, department: Department) => {
      const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name,
          department,
          checked: false
      };
      setShoppingList(prev => [...prev, newItem]);
  };

  const handleToggleShoppingItem = (id: string) => {
      setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleDeleteShoppingItem = (id: string) => {
      setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearShoppingList = () => {
      setShoppingList(prev => prev.filter(item => !item.checked));
  };

  // Coach Actions
  const refreshTasks = async () => {
    const newTasks = await generateCleaningTasks(gameStats.level);
    setTasks(newTasks);
  };

  const handleCompleteTask = (taskId: string) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.completed) return;

      const today = new Date().toISOString().split('T')[0];
      const isNewDay = gameStats.lastCleanDate !== today;

      setGameStats(prev => {
          let newXp = prev.xp + 20;
          let newLevel = prev.level;
          if (newXp >= 100) { newXp -= 100; newLevel += 1; }
          
          return {
              ...prev,
              coins: prev.coins + task.coinsReward,
              streak: isNewDay ? prev.streak + 1 : prev.streak,
              lastCleanDate: today,
              xp: newXp,
              level: newLevel
          };
      });
  };

  const handleBuyItem = (itemType: string, itemId: string, cost: number) => {
      if (gameStats.coins >= cost) {
          setGameStats(prev => {
              const newState = { ...prev, coins: prev.coins - cost };
              if (itemType === 'boost' && itemId === 'freeze') newState.inventory.freeze += 1;
              if (itemType === 'theme') {
                  newState.unlockedThemes.push(itemId);
                  newState.activeTheme = itemId;
              }
              if (itemType === 'avatar') {
                  newState.unlockedAvatarItems.push(itemId);
                  // Auto equip if it's an avatar item? No, just unlock.
              }
              return newState;
          });
      }
  };

  const handleEquipTheme = (themeId: string) => {
      setGameStats(prev => ({ ...prev, activeTheme: themeId }));
  };

  const handleGacha = async () => {
      const reward = Math.floor(Math.random() * 50) + 10;
      setGameStats(prev => ({ ...prev, coins: prev.coins + reward }));
  };

  const handleEquipAvatarItem = (item: AvatarItem) => {
      if (!gameStats.unlockedAvatarItems.includes(item.id)) return;
      
      setGameStats(prev => ({
          ...prev,
          avatar: {
              ...prev.avatar,
              [item.type]: item.value
          }
      }));
  };

  const handleUnequipAccessory = () => {
       setGameStats(prev => ({
          ...prev,
          avatar: { ...prev.avatar, accessories: 'none' }
      }));
  }

  // Recipe Feedback Logic
  const handleLikeRecipe = (recipe: Recipe) => {
      console.log("Liked recipe:", recipe.title);
  };

  const handleDislikeRecipe = (recipe: Recipe) => {
      setGameStats(prev => ({
          ...prev,
          preferences: {
              ...prev.preferences,
              dislikedRecipes: [...prev.preferences.dislikedRecipes, recipe.title]
          }
      }));
  };
  
  const toggleAllergy = (allergy: string) => {
      setGameStats(prev => {
          const current = prev.preferences.allergies || [];
          const newAllergies = current.includes(allergy) 
             ? current.filter(a => a !== allergy)
             : [...current, allergy];
          return {
              ...prev,
              preferences: { ...prev.preferences, allergies: newAllergies }
          }
      });
  };

  // Theme Class Resolver
  const getThemeClass = () => {
      switch(gameStats.activeTheme) {
          case 'sunset': return 'bg-theme-sunset';
          case 'midnight': return 'bg-theme-midnight';
          case 'forest': return 'bg-theme-forest';
          default: return 'bg-theme-default';
      }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesLoc = filter === 'ALL' || item.location === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesLoc && matchesSearch;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Helper for avatar URL
  const getAvatarUrl = () => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${gameStats.avatar.base}&clothing=${gameStats.avatar.clothing}&top=${gameStats.avatar.top}&accessories=${gameStats.avatar.accessories}`;
  }

  return (
    <div className={`min-h-screen font-sans pb-safe transition-colors duration-500 ${getThemeClass()} ${gameStats.activeTheme === 'midnight' ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center shadow-sm">
        <button onClick={() => setView('home')} className="text-left">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-sm">
            Hope
            </h1>
            <div className={`flex items-center gap-1 text-xs font-medium ${gameStats.activeTheme === 'midnight' ? 'text-slate-300' : 'text-slate-500'}`}>
                Niveau {gameStats.level} • {gameStats.coins} <i className="fas fa-coins text-yellow-500"></i>
            </div>
        </button>
        <div className="flex gap-3">
            <button 
                className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30 animate-pulse"
                onClick={() => setIsChatOpen(true)}
            >
               <i className="fas fa-comment-dots"></i>
            </button>
            <button 
                className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden"
                onClick={() => setView('settings')}
            >
                <img src={getAvatarUrl()} className="w-full h-full object-cover" />
            </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        
        {view === 'home' && (
            <HomeView 
                inventory={inventory} 
                tasks={tasks} 
                stats={gameStats}
                userName={activeUser}
                onLikeRecipe={handleLikeRecipe}
                onDislikeRecipe={handleDislikeRecipe}
            />
        )}

        {view === 'inventory' && (
          <div className="animate-fade-in">
            {/* Search & Filter */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 focus:border-primary-500 outline-none shadow-sm transition-all text-slate-800"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors backdrop-blur-sm ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white/50 border border-white/30 text-slate-600'}`}
                >
                  Tout
                </button>
                {Object.values(StorageLocation).map((loc) => (
                  <button 
                    key={loc}
                    onClick={() => setFilter(loc)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors backdrop-blur-sm ${filter === loc ? 'bg-primary-600 text-white' : 'bg-white/50 border border-white/30 text-slate-600'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
                {filteredInventory.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-box-open text-6xl mb-4"></i>
                        <p>Aucun produit trouvé.</p>
                    </div>
                ) : (
                    filteredInventory.map((item) => (
                        <InventoryItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
                    ))
                )}
            </div>
          </div>
        )}

        {view === 'add' && (
          <AddItemForm onAdd={handleAddItem} onCancel={() => setView('inventory')} />
        )}

        {view === 'shopping' && (
           <ShoppingListView 
              items={shoppingList}
              onAddItem={handleAddToShoppingList}
              onToggleItem={handleToggleShoppingItem}
              onClearCompleted={handleClearShoppingList}
              onDeleteItem={handleDeleteShoppingItem}
           />
        )}

        {view === 'coach' && (
            <CoachView 
                tasks={tasks} 
                stats={gameStats}
                avatarCatalog={AVATAR_CATALOG}
                onCompleteTask={handleCompleteTask}
                onBuyItem={handleBuyItem}
                onGacha={handleGacha}
                onRefreshTasks={refreshTasks}
                onEquipTheme={handleEquipTheme}
            />
        )}

        {view === 'recipes' && (
          <div className="animate-fade-in">
            <RecipeView inventory={inventory} preferences={gameStats.preferences} />
          </div>
        )}

        {view === 'settings' && (
             <div className="animate-fade-in space-y-6">
                 {/* Wardrobe Section */}
                 <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden text-slate-800">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex justify-center items-center relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/20">
                            <img src={getAvatarUrl()} className="w-full h-full" />
                        </div>
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                            <i className="fas fa-coins mr-1 text-yellow-300"></i> {gameStats.coins}
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-bold text-center mb-4">Personnalisation</h3>
                        
                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                            {[
                                { id: 'base', icon: 'fa-user', label: 'Corps' },
                                { id: 'clothing', icon: 'fa-tshirt', label: 'Tenue' },
                                { id: 'top', icon: 'fa-hat-cowboy', label: 'Tête' },
                                { id: 'accessories', icon: 'fa-glasses', label: 'Acc.' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setAvatarTab(tab.id as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${avatarTab === tab.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                >
                                    <i className={`fas ${tab.icon}`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {avatarTab === 'accessories' && (
                                <button 
                                    onClick={handleUnequipAccessory}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all ${gameStats.avatar.accessories === 'none' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                                >
                                    <i className="fas fa-ban text-slate-400 text-xl"></i>
                                    <span className="text-[10px] font-bold text-slate-500">Aucun</span>
                                </button>
                            )}

                            {AVATAR_CATALOG.filter(item => item.type === avatarTab).map(item => {
                                const isOwned = gameStats.unlockedAvatarItems.includes(item.id);
                                const isEquipped = gameStats.avatar[item.type] === item.value;
                                
                                return (
                                    <button 
                                        key={item.id}
                                        disabled={!isOwned}
                                        onClick={() => handleEquipAvatarItem(item)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all relative ${
                                            isEquipped 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : isOwned 
                                                ? 'border-slate-100 bg-white hover:border-indigo-200' 
                                                : 'border-slate-100 bg-slate-50 opacity-60 grayscale'
                                        }`}
                                    >
                                        {!isOwned && <i className="fas fa-lock absolute top-2 right-2 text-xs text-slate-400"></i>}
                                        {item.icon && <i className={`fas ${item.icon} text-2xl ${isEquipped ? 'text-indigo-600' : 'text-slate-600'}`}></i>}
                                        <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-4 text-center">
                             <button 
                                onClick={() => setView('coach')} 
                                className="text-xs text-indigo-500 font-bold hover:underline"
                             >
                                 Voir la boutique pour plus d'items <i className="fas fa-arrow-right ml-1"></i>
                             </button>
                        </div>
                    </div>
                 </div>

                 {/* Dietary Preferences */}
                 <div className="p-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl text-slate-800">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                         <i className="fas fa-utensils text-primary-500"></i> Préférences Alimentaires
                     </h3>
                     <p className="text-sm text-slate-500 mb-4">Hope prendra en compte ces restrictions pour vos recettes.</p>
                     
                     <div className="flex flex-wrap gap-2">
                         {['Gluten', 'Lactose', 'Arachides', 'Végétarien', 'Vegan'].map(allergy => {
                             const isActive = gameStats.preferences?.allergies?.includes(allergy);
                             return (
                                 <button
                                    key={allergy}
                                    onClick={() => toggleAllergy(allergy)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                        isActive 
                                        ? 'bg-red-500 text-white border-red-600' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                 >
                                     {isActive && <i className="fas fa-check mr-1"></i>} {allergy}
                                 </button>
                             )
                         })}
                     </div>
                 </div>
             </div>
        )}

      </main>

      <Navigation currentView={view} setView={setView} inventoryCount={inventory.length} />
      
      {/* Floating Chat Modal */}
      <ChatWithHope isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} inventory={inventory} />
    </div>
  );
};

export default App;