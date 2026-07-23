import React, { useEffect, useState } from "react";
import { STTResult } from "../../../types/bindings";
import { SubtitleToken, SubtitlePluginContext, SubtitlePlugin } from "./plugin_types";

interface SubtitleRendererProps {
  subtitle: STTResult;
  context: SubtitlePluginContext;
  plugins: SubtitlePlugin[];
}

export const SubtitleRenderer: React.FC<SubtitleRendererProps> = ({ subtitle, context, plugins }) => {
  const [tokens, setTokens] = useState<SubtitleToken[]>([]);

  useEffect(() => {
    let active = true;

    const processPipeline = async () => {
      // 1. Initial Tokens
      let currentTokens: SubtitleToken[] = [];
      
      if (subtitle.words && subtitle.words.length > 0) {
        currentTokens = subtitle.words.map(w => ({
          text: w.text,
          start: w.start ?? undefined,
          end: w.end ?? undefined,
        }));
      } else {
        // Fallback: entire text as one token, or split by character if CJK
        if (context.language === "ja" || context.language === "zh" || context.language === "zh-TW") {
          currentTokens = Array.from(subtitle.text).map(char => ({ text: char }));
        } else {
          currentTokens = [{ text: subtitle.text }];
        }
      }

      // 2. Run through all enabled plugins' processTokens
      for (const plugin of plugins) {
        if (plugin.isEnabled(context) && plugin.processTokens) {
          const result = plugin.processTokens(currentTokens, context);
          currentTokens = result instanceof Promise ? await result : result;
        }
      }

      if (active) {
        setTokens(currentTokens);
      }
    };

    processPipeline();

    return () => {
      active = false;
    };
  }, [subtitle, context, plugins]);

  // 3. Render Tokens
  let renderedContent: React.ReactNode[] = tokens.map((token, idx) => {
    let node: React.ReactNode = <span key={idx}>{token.text}</span>;
    
    // Apply token rendering from plugins
    for (const plugin of plugins) {
      if (plugin.isEnabled(context) && plugin.renderToken) {
        node = plugin.renderToken(token, context, idx, node);
      }
    }
    return <React.Fragment key={idx}>{node}</React.Fragment>;
  });

  // 4. Render Line level wrappers
  let finalLine: React.ReactNode = (
    <p 
      className="text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-relaxed tracking-wide flex flex-wrap justify-center items-end"
      style={{ fontSize: `${context.sttFontSize ?? 20}px` }}
    >
      {renderedContent}
    </p>
  );

  for (const plugin of plugins) {
    if (plugin.isEnabled(context) && plugin.renderLine) {
      finalLine = plugin.renderLine(renderedContent, context, finalLine);
    }
  }

  return (
    <div className="flex flex-col items-center w-full" style={{ gap: `${context.subtitleSpacing ?? 6}px` }}>
      {finalLine}
    </div>
  );
};
