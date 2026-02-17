export enum StorageLocation {
  FRIDGE = 'Réfrigérateur',
  FREEZER = 'Congélateur',
  PANTRY = 'Garde-manger',
  HOUSEHOLD = 'Ménager',
}

export enum Department {
  PRODUCE = 'Fruits & Légumes',
  DAIRY = 'Produits Laitiers',
  MEAT = 'Viandes & Poissons',
  BAKERY = 'Boulangerie',
  FROZEN = 'Surgelés',
  GROCERY = 'Épicerie Salée',
  SWEET = 'Épicerie Sucrée',
  DRINKS = 'Boissons',
  HOUSEHOLD = 'Produits Ménagers',
  HYGIENE = 'Hygiène & Beauté',
  OTHER = 'Divers'
}

export enum Unit {
  PIECE = 'pcs',
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  LITERS = 'L',
  MILLILITERS = 'ml',
  PACK = 'paquet'
}

export interface InventoryItem {
  id: string;
  name: string;
  location: StorageLocation;
  quantity: number;
  unit: Unit;
  expiryDate: string; // ISO Date string YYYY-MM-DD
  addedDate: string;
  userId: string; // Simulating multi-user
}

export interface ShoppingItem {
  id: string;
  name: string;
  department: Department;
  checked: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  instructions: string[];
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  prepTime: string;
}

export interface CleaningTask {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  coinsReward: number;
  isWeekly: boolean;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface AvatarItem {
  id: string;
  type: 'base' | 'clothing' | 'top' | 'accessories';
  name: string;
  value: string; // Dicebear value
  price: number;
  icon?: string;
}

export interface AvatarConfig {
  base: string; // seed name
  clothing: string;
  top: string;
  accessories: string;
}

export interface UserPreferences {
  allergies: string[];
  dislikedRecipes: string[]; // List of recipe titles or keywords to avoid
}

export interface UserGameStats {
  coins: number;
  streak: number;
  level: number; // For difficulty adjustment
  xp: number;
  lastCleanDate: string | null; // YYYY-MM-DD
  inventory: {
    freeze: number; // Item to save streak
  };
  unlockedThemes: string[];
  activeTheme: string;
  unlockedAvatarItems: string[]; // Array of AvatarItem IDs
  avatar: AvatarConfig;
  preferences: UserPreferences;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewState = 'home' | 'inventory' | 'shopping' | 'add' | 'recipes' | 'coach' | 'settings';