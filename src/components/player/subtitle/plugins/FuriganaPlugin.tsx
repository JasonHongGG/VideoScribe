import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { SubtitlePlugin, SubtitlePluginContext, SubtitleToken } from "../plugin_types";

export const FuriganaPlugin: SubtitlePlugin = {
  id: "furigana",

  isEnabled: (context: SubtitlePluginContext) => {
    return context.language === "ja" && (context.enableFurigana || context.enableDictionary);
  },

  processTokens: async (tokens: SubtitleToken[], context: SubtitlePluginContext) => {
    try {
      if (tokens.length > 0 && tokens[0].start !== undefined) {
         // We have Whisper word timestamps. Let's process furigana per word token.
         const newTokens: SubtitleToken[] = [];
         
         // To avoid many IPC calls, we could call once and align, but this is simpler and fine for small arrays.
         for (const t of tokens) {
             const fRes = await invoke<{surface: string, reading?: string}[]>("get_furigana", { text: t.text });
             
             if (fRes.length === 0) {
                 newTokens.push(t);
                 continue;
             }
             
             // distribute time equally among sub-tokens for Karaoke fallback within the word
             const duration = (t.end! - t.start!) / fRes.length;
             fRes.forEach((f, i) => {
                 newTokens.push({
                     text: f.surface,
                     reading: f.reading,
                     start: t.start! + i * duration,
                     end: t.start! + (i + 1) * duration,
                 });
             });
         }
         return newTokens;
      } else {
         // No word timestamps. Just return Furigana tokens.
         const res = await invoke<{surface: string, reading?: string}[]>("get_furigana", { text: context.subtitle.text });
         return res.map(f => ({
            text: f.surface,
            reading: f.reading
         }));
      }
    } catch (e) {
      console.error("FuriganaPlugin error:", e);
      return tokens;
    }
  },

  renderToken: (token: SubtitleToken, context: SubtitlePluginContext, _idx: number, children: React.ReactNode) => {
    if (!context.enableFurigana) return children;

    return (
      <ruby className="group/ruby leading-none" style={{ rubyPosition: "over" }}>
        {children}
        {token.reading ? (
          <rt className="text-[#facc15] font-semibold tracking-widest text-center pointer-events-none pb-1 select-none" style={{ fontSize: `${(context.sttFontSize ?? 20) * 0.45}px` }}>
            {token.reading}
          </rt>
        ) : (
          <rt className="pointer-events-none select-none pb-1" style={{ fontSize: `${(context.sttFontSize ?? 20) * 0.45}px` }}></rt>
        )}
      </ruby>
    );
  }
};
