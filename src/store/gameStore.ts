import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Menu {
  id: string;
  name: string; // User defined name for the creation
  baseId: string;
  ingredientIds: string[];
  concept: string;
  tasteScore: number;
  visualScore: number;
  flameRisk: number;
  trendMatchBonus: number;
  price: number;
  reviewComment: string;
  imagePrompt: string;
  imageUrl?: string;
  createdAtDay?: number;
  baseId?: string;
  ingredientIds?: string[];
}

export interface ActiveMenu {
  menu: Menu;
  daysActive: number; // 0 means just added today
  customPrice: number;
}

interface GameState {
  funds: number;
  followers: number;
  day: number;
  flameGauge: number; // 0 to 100
  unlockedBases: string[];
  unlockedIngredients: string[];
  activeMenus: ActiveMenu[]; // Max 3
  gallery: Menu[];
  isGameOver: boolean;
  bankruptcyDays: number; // Days spent in negative funds
  hasSeenTutorial: boolean;
  dailyTrend: { type: 'base' | 'ingredient', id: string } | null;
  pendingMorningEvent: string | null;
  weatherMultiplier: number;
  isGeneratingMenu: boolean;
  latestGeneratedMenu: Menu | null;
  
  // Actions
  advanceDay: () => void;
  addFunds: (amount: number) => void;
  addFollowers: (amount: number) => void;
  increaseFlameGauge: (amount: number) => void;
  addMenuToGallery: (menu: Menu) => void;
  addToShowcase: (menu: Menu, customPrice?: number) => void;
  updateMenuPrice: (menuId: string, newPrice: number) => void;
  removeFromShowcase: (menuId: string) => void;
  unlockBase: (baseId: string, cost: number) => void;
  unlockIngredient: (ingredientId: string, cost: number) => void;
  resetGame: () => void;
  completeTutorial: () => void;
  showTutorial: () => void;
  resolveMorningEvent: () => void;
  setIsGeneratingMenu: (val: boolean) => void;
  setLatestGeneratedMenu: (menu: Menu | null) => void;
}

const initialState = {
  funds: 20000, // 20,000 JPY
  followers: 200,
  day: 1,
  flameGauge: 0,
  unlockedBases: ['pancake'], // Initial base
  unlockedIngredients: ['strawberry', 'cream', 'chocolate'], // Initial ingredients
  activeMenus: [],
  gallery: [],
  isGameOver: false,
  bankruptcyDays: 0,
  hasSeenTutorial: false,
  dailyTrend: null,
  pendingMorningEvent: null,
  weatherMultiplier: 1.0,
  isGeneratingMenu: false,
  latestGeneratedMenu: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      advanceDay: () => set((state) => {
        // 1. Check bankruptcy condition
        let newBankruptcyDays = state.bankruptcyDays;
        let gameOver = false;
        if (state.funds < 0) {
          newBankruptcyDays += 1;
          if (newBankruptcyDays >= 3) {
            gameOver = true;
          }
        } else {
          newBankruptcyDays = 0; // Reset if funds are positive
        }

        // 2. Age the active menus
        const agedMenus = state.activeMenus.map(am => ({
          ...am,
          daysActive: am.daysActive + 1
        }));

        // 3. Assign new Daily Trend
        let newTrend: { type: 'base' | 'ingredient', id: string } | null = state.dailyTrend;
        const unlockedBases = state.unlockedBases;
        const unlockedIngredients = state.unlockedIngredients;
        const isBaseTrend = Math.random() > 0.5;
        if (isBaseTrend && unlockedBases.length > 0) {
          newTrend = { type: 'base', id: unlockedBases[Math.floor(Math.random() * unlockedBases.length)] };
        } else if (unlockedIngredients.length > 0) {
          newTrend = { type: 'ingredient', id: unlockedIngredients[Math.floor(Math.random() * unlockedIngredients.length)] };
        }

        // 4. Assign Morning Event (35% chance)
        let newPendingEvent = null;
        if (Math.random() < 0.35) {
          const events = ['influencer', 'sponsor', 'bad_weather', 'fridge_broken', 'tv_feature', 'ingredient_loss'];
          newPendingEvent = events[Math.floor(Math.random() * events.length)];
        }

        return {
          day: state.day + 1,
          activeMenus: agedMenus,
          bankruptcyDays: newBankruptcyDays,
          isGameOver: gameOver || state.flameGauge >= 100, // Also game over if flame gauge is maxed out at end of day
          dailyTrend: newTrend,
          pendingMorningEvent: newPendingEvent,
          weatherMultiplier: 1.0, // Reset multiplier every day
        };
      }),

      addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
      
      addFollowers: (amount) => set((state) => ({ 
        followers: Math.max(0, state.followers + amount) 
      })),
      
      increaseFlameGauge: (amount) => set((state) => ({ 
        flameGauge: Math.min(100, Math.max(0, state.flameGauge + amount)) 
      })),

      addMenuToGallery: (menu) => set((state) => ({
        gallery: [menu, ...state.gallery]
      })),

      addToShowcase: (menu, customPrice) => set((state) => {
        if (state.activeMenus.length >= 3) return state; // Max 3
        return {
          activeMenus: [...state.activeMenus, { menu, daysActive: 0, customPrice: customPrice ?? menu.price }]
        };
      }),

      updateMenuPrice: (menuId, newPrice) => set((state) => ({
        activeMenus: state.activeMenus.map(am => 
          am.menu.id === menuId ? { ...am, customPrice: newPrice } : am
        )
      })),

      removeFromShowcase: (menuId) => set((state) => ({
        activeMenus: state.activeMenus.filter(am => am.menu.id !== menuId)
      })),

      unlockBase: (baseId, cost) => set((state) => {
        if (state.funds < cost || state.unlockedBases.includes(baseId)) return state;
        return {
          funds: state.funds - cost,
          unlockedBases: [...state.unlockedBases, baseId]
        };
      }),

      unlockIngredient: (ingredientId, cost) => set((state) => {
        if (state.funds < cost || state.unlockedIngredients.includes(ingredientId)) return state;
        return {
          funds: state.funds - cost,
          unlockedIngredients: [...state.unlockedIngredients, ingredientId]
        };
      }),

      resetGame: () => {
        const state = get();
        const initialTrend = { type: 'base' as const, id: 'pancake' };
        set({ ...initialState, dailyTrend: initialTrend });
      },

      completeTutorial: () => set({ hasSeenTutorial: true }),
      showTutorial: () => set({ hasSeenTutorial: false }),
      setIsGeneratingMenu: (val) => set({ isGeneratingMenu: val }),
      setLatestGeneratedMenu: (menu) => set({ latestGeneratedMenu: menu }),

      resolveMorningEvent: () => set((state) => {
        if (!state.pendingMorningEvent) return state;
        
        let newFunds = state.funds;
        let newWeatherMultiplier = state.weatherMultiplier;
        let newActiveMenus = [...state.activeMenus];

        switch (state.pendingMorningEvent) {
          case 'influencer':
            newWeatherMultiplier = 2.0;
            break;
          case 'sponsor':
            newFunds += 10000;
            break;
          case 'bad_weather':
            newWeatherMultiplier = 0.5;
            break;
          case 'fridge_broken':
            newActiveMenus = newActiveMenus.map(am => ({ ...am, daysActive: am.daysActive + 1 }));
            break;
          case 'tv_feature':
            newWeatherMultiplier = 1.5;
            break;
          case 'ingredient_loss':
            newFunds -= 5000;
            break;
        }

        return {
          pendingMorningEvent: null,
          funds: newFunds,
          weatherMultiplier: newWeatherMultiplier,
          activeMenus: newActiveMenus
        };
      }),
    }),
    {
      name: 'bae-cafe-game-storage', // key in localStorage
    }
  )
);
