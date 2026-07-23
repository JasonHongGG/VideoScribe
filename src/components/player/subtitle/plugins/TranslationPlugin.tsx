import React from "react";
import { SubtitlePlugin, SubtitlePluginContext } from "../plugin_types";

export const TranslationPlugin: SubtitlePlugin = {
  id: "translation",

  isEnabled: (context: SubtitlePluginContext) => {
    return context.subtitle.translation != null && context.subtitle.translation.length > 0;
  },

  renderLine: (_renderedTokens: React.ReactNode[], context: SubtitlePluginContext, children: React.ReactNode) => {
    return (
      <div className="flex flex-col items-center" style={{ gap: `${context.subtitleSpacing ?? 6}px` }}>
        {children}
        <p 
          className="text-[#facc15] font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-relaxed tracking-wide"
          style={{ fontSize: `${context.translationFontSize ?? 18}px` }}
        >
          {context.subtitle.translation}
        </p>
      </div>
    );
  }
};
