import { create } from 'zustand';

interface AppStore {
  activeView: 'player' | 'settings';
  setActiveView: (view: 'player' | 'settings') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeView: 'player',
  setActiveView: (view) => set({ activeView: view }),
}));

