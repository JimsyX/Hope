import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Recipe, CleaningTask, ChatMessage, UserPreferences } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const generateRecipesFromInventory = async (items: InventoryItem[], preferences?: UserPreferences): Promise<Recipe[]> => {
  if (items.length === 0) return [];

  const availableIngredients = items.map(item => `${item.name} (${item.quantity} ${item.unit}, expire le ${item.expiryDate})`).join(', ');
  
  const allergies = preferences?.allergies?.join(', ');
  const dislikes = preferences?.dislikedRecipes?.join(', ');

  const systemInstruction = `
    Je suis Hope, ton assistante culinaire.
    Mon but est de t'aider à cuisiner sans gaspillage.
    Suggère des recettes basées sur l'inventaire. Priorise les dates courtes.

    RÈGLES STRICTES DE SÉCURITÉ ALIMENTAIRE :
    1. L'utilisateur a les allergies suivantes : ${allergies || 'Aucune'}. TU NE DOIS JAMAIS suggérer une recette contenant ces ingrédients ou leurs dérivés.
    2. Si l'inventaire contient un allergène, IGNORE-LE complètement pour la recette.
    3. Évite aussi les recettes que l'utilisateur n'aime pas : ${dislikes || 'Aucune'}.

    Réponds en JSON uniquement.
  `;

  const prompt = `
    Inventaire : ${availableIngredients}
    Trouve 3 recettes créatives et sûres.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredientsUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              missingIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              difficulty: { type: Type.STRING, enum: ['Facile', 'Moyen', 'Difficile'] },
              prepTime: { type: Type.STRING }
            },
            required: ["id", "title", "description", "ingredientsUsed", "instructions", "difficulty", "prepTime"]
          }
        }
      }
    });

    if (response.text) {
      const recipes = JSON.parse(response.text) as Recipe[];
      return recipes.map((r, index) => ({ ...r, id: `recipe-${Date.now()}-${index}` }));
    }
    return [];

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
};

export const generateSmartMealSuggestion = async (
  items: InventoryItem[], 
  preferences: UserPreferences
): Promise<Recipe | null> => {
  if (items.length === 0) return null;

  // Identify critical items
  const today = new Date();
  const criticalItems = items.filter(item => {
    const expiry = new Date(item.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && item.location !== 'Ménager';
  });

  const criticalSummary = criticalItems.map(i => i.name).join(', ');
  const allIngredients = items.filter(i => i.location !== 'Ménager').map(i => i.name).join(', ');
  const allergies = preferences.allergies.join(', ');
  const dislikes = preferences.dislikedRecipes.join(', ');

  const systemInstruction = `
    Tu es Hope, une IA intelligente qui gère le gaspillage alimentaire.
    Ta mission : Trouver LA recette parfaite pour ce soir.
    1. Utilise impérativement le plus possible d'ingrédients critiques (qui périment bientôt).
    2. ATTENTION : Respecte strictement les allergies : ${allergies || 'Aucune'}. C'est vital.
    3. Évite absolument les plats similaires à ceux que l'utilisateur n'aime pas : ${dislikes || 'Aucun'}.
    4. La recette doit être réconfortante et simple.
    5. Explique dans la description pourquoi tu as choisi cette recette (ex: "J'ai choisi ça pour sauver tes tomates !").
    Réponds en JSON uniquement.
  `;

  const prompt = `
    Ingrédients critiques (URGENT) : ${criticalSummary}
    Reste de l'inventaire : ${allIngredients}
    Suggère UNE SEULE recette idéale et sans danger.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING, enum: ['Facile', 'Moyen', 'Difficile'] },
              prepTime: { type: Type.STRING }
            },
            required: ["id", "title", "description", "ingredientsUsed", "instructions", "difficulty", "prepTime"]
        }
      }
    });

    if (response.text) {
      const recipe = JSON.parse(response.text) as Recipe;
      return { ...recipe, id: `smart-recipe-${Date.now()}` };
    }
    return null;
  } catch (error) {
    console.error("Error generating smart recipe:", error);
    return null;
  }
};

export const generateCleaningTasks = async (userLevel: number): Promise<CleaningTask[]> => {
  // Hope adjusts difficulty based on level
  let difficultyModifier = "des tâches simples et rapides pour débuter";
  if (userLevel > 5) difficultyModifier = "des tâches un peu plus poussées pour maintenir la propreté";
  if (userLevel > 10) difficultyModifier = "des tâches de niveau expert pour un foyer impeccable";

  const systemInstruction = `
    Je suis Hope, ton coach de ménage boosté à l'IA. Je suis là pour te motiver !
    Génère une liste de tâches pour aujourd'hui.
    Le niveau de l'utilisateur est ${userLevel}, donc propose ${difficultyModifier}.
    Il doit y avoir 3 tâches "Quotidiennes" et 1 tâche "Hebdomadaire".
    Réponds en JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Donne-moi mes missions du jour, Hope !",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              isWeekly: { type: Type.BOOLEAN },
            },
            required: ["title", "description", "duration", "isWeekly"]
          }
        }
      }
    });

    if (response.text) {
      const tasksData = JSON.parse(response.text);
      return tasksData.map((t: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: t.title,
        description: t.description,
        duration: t.duration,
        coinsReward: t.isWeekly ? 50 + (userLevel * 2) : 15 + userLevel, // Reward scales with level
        isWeekly: t.isWeekly,
        completed: false,
        date: new Date().toISOString().split('T')[0]
      }));
    }
    return [];
  } catch (error) {
    return [
      { id: 'f1', title: 'Nettoyage Rapide', description: 'Coup d\'éponge sur les surfaces.', duration: 5, coinsReward: 15, isWeekly: false, completed: false, date: new Date().toISOString().split('T')[0] },
      { id: 'f2', title: 'Rangement 5 min', description: 'Range 5 objets qui traînent.', duration: 5, coinsReward: 15, isWeekly: false, completed: false, date: new Date().toISOString().split('T')[0] },
      { id: 'f3', title: 'Sols', description: 'Aspirateur rapide.', duration: 10, coinsReward: 20, isWeekly: false, completed: false, date: new Date().toISOString().split('T')[0] },
      { id: 'f4', title: 'Grand Nettoyage', description: 'Salle de bain complète.', duration: 30, coinsReward: 60, isWeekly: true, completed: false, date: new Date().toISOString().split('T')[0] },
    ];
  }
};

export const chatWithHope = async (history: ChatMessage[], newMessage: string, inventoryContext: InventoryItem[]): Promise<string> => {
  const inventorySummary = inventoryContext.map(i => i.name).join(', ');
  
  const systemInstruction = `
    Ton nom est Hope. Tu es l'IA qui gère la maison dans l'application FrigoSmart.
    Tu es amicale, tutoyante, très enthousiaste et parfois tu fais des blagues sur le ménage ou la nourriture.
    Tu es efficace et rapide.
    Tu connais l'inventaire de l'utilisateur : ${inventorySummary}.
    Si l'utilisateur demande une idée de repas, utilise l'inventaire.
    Si l'utilisateur manque de motivation, encourage-le pour son ménage.
    Fais des réponses courtes (max 2-3 phrases) pour un chat mobile.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Désolée, j'ai eu un petit bug ! On réessaie ?";
  } catch (error) {
    console.error("Chat error:", error);
    return "Je ne suis pas joignable pour le moment, réessaie plus tard !";
  }
};