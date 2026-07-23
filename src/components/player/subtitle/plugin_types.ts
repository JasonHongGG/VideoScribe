import { STTResult } from "../../../types/bindings";

export interface SubtitleToken {
  text: string;
  start?: number;
  end?: number;
  reading?: string; // For Furigana
  isHovered?: boolean; // For Dictionary
}

export interface SubtitlePluginContext {
  subtitle: STTResult;
  currentTime: number;
  language: string;
  sttFontSize: number;
  translationFontSize: number;
  subtitleSpacing: number;
  enableFurigana: boolean;
  enableDictionary: boolean;
  enableKaraokeMode: boolean; // We will add this to settings
  
  hoverText?: any;
  setHoverText?: (hover: any) => void;
  hoverTimeoutRef?: React.MutableRefObject<number | null>;
}

export interface SubtitlePlugin {
  id: string;
  
  // Decide if this plugin should run
  isEnabled: (context: SubtitlePluginContext) => boolean;

  // Step 1: Transform STTResult into Tokens (can be async)
  // If multiple plugins implement this, they chain sequentially.
  processTokens?: (
    tokens: SubtitleToken[], 
    context: SubtitlePluginContext
  ) => Promise<SubtitleToken[]> | SubtitleToken[];

  // Step 2: Render a specific token
  renderToken?: (
    token: SubtitleToken, 
    context: SubtitlePluginContext, 
    idx: number,
    children: React.ReactNode
  ) => React.ReactNode;

  // Step 3: Render the whole line (e.g. for translation or layout wrappers)
  renderLine?: (
    renderedTokens: React.ReactNode[], 
    context: SubtitlePluginContext,
    children: React.ReactNode
  ) => React.ReactNode;
}
