import React from "react";
import { SubtitlePlugin, SubtitlePluginContext, SubtitleToken } from "../plugin_types";

export const DictionaryPlugin: SubtitlePlugin = {
  id: "dictionary",

  isEnabled: (context: SubtitlePluginContext) => {
    return context.enableDictionary;
  },

  // Note: we need to pass setHoverText and hoverText somehow.
  // We can just add them to the plugin context or use a global event/store.
  // Let's assume we add them to SubtitlePluginContext.
  
  renderToken: (token: SubtitleToken, context: SubtitlePluginContext, idx: number, children: React.ReactNode) => {
    const isHovered = (context as any).hoverText?.startIndex === idx;
    
    return (
      <span
        key={`dict-${idx}`}
        className={`rounded px-px cursor-pointer transition-colors ${
          isHovered 
            ? "text-yellow-400 bg-yellow-500/20" 
            : "hover:text-yellow-400 hover:bg-white/10"
        }`}
        onMouseEnter={(e) => {
          const setHoverText = (context as any).setHoverText;
          const hoverTimeoutRef = (context as any).hoverTimeoutRef;
          
          if (!setHoverText) return;
          if (hoverTimeoutRef?.current) window.clearTimeout(hoverTimeoutRef.current);
          
          setHoverText({
            text: token.text,
            x: e.clientX,
            y: e.clientY,
            startIndex: idx
          });
        }}
      >
        {children}
      </span>
    );
  }
};
