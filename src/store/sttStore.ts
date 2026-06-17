import { create } from 'zustand';

interface STTResult {
  start: number;
  end: number;
  text: string;
}

type STTStatus = 'idle' | 'loading_model' | 'transcribing' | 'completed' | 'error';

interface STTStore {
  isPanelOpen: boolean;
  status: STTStatus;
  progress: number;
  results: STTResult[];
  
  togglePanel: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  setStatus: (status: STTStatus, progress?: number) => void;
  setResults: (results: STTResult[]) => void;
  appendResult: (result: STTResult) => void;
  reset: () => void;
}

export const useSTTStore = create<STTStore>((set) => ({
  isPanelOpen: false,
  status: 'idle',
  progress: 0,
  results: [],

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  setStatus: (status, progress = 0) => set({ status, progress }),
  setResults: (results) => set({ results }),
  appendResult: (result) => set((state) => ({ results: [...state.results, result] })),
  reset: () => set({ status: 'idle', progress: 0, results: [] }),
}));
