import React from "react";
import { SubtitlePlugin, SubtitlePluginContext, SubtitleToken } from "../plugin_types";

export const KaraokePlugin: SubtitlePlugin = {
  id: "karaoke",

  isEnabled: (context: SubtitlePluginContext) => {
    // Only enabled if Karaoke mode is turned on AND we have word timestamps
    return context.enableKaraokeMode && context.subtitle.words != null && context.subtitle.words.length > 0;
  },

  renderToken: (token: SubtitleToken, context: SubtitlePluginContext, idx: number, children: React.ReactNode) => {
    if (token.start === undefined || token.end === undefined) {
      return children;
    }

    // Calculate progress for this specific token
    const duration = token.end - token.start;
    let progress = 0;
    
    if (context.currentTime >= token.end) {
      progress = 100;
    } else if (context.currentTime > token.start) {
      progress = ((context.currentTime - token.start) / duration) * 100;
    }

    // Apply background-clip: text with linear gradient
    return (
      <span
        key={`karaoke-${idx}`}
        style={{
          background: `linear-gradient(to right, #facc15 ${progress}%, rgba(255, 255, 255, 0.8) ${progress}%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
          display: "inline-block", // Required for gradient to work on spans sometimes
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </span>
    );
  }
};
