import React from "react";
import { ProcessedSubtitle, SubtitleRenderContext } from "./SubtitleModels";
import { SubtitleTokenRenderer } from "./SubtitleTokenRenderer";

interface SubtitleLineRendererProps {
  processedSubtitle: ProcessedSubtitle;
  context: SubtitleRenderContext;
}

export const SubtitleLineRenderer: React.FC<SubtitleLineRendererProps> = ({ processedSubtitle, context }) => {
  // Render each token deterministically, keeping track of global character index
  let currentCharIndex = 0;
  const renderedTokens = processedSubtitle.tokens.map((token, idx) => {
    const charIndex = currentCharIndex;
    currentCharIndex += token.text.length;
    return (
      <SubtitleTokenRenderer 
        key={idx} 
        index={idx} 
        charIndex={charIndex}
        token={token} 
        fullText={processedSubtitle.original.text}
        context={context} 
      />
    );
  });

  // Construct the main line layout using CSS Grid for perfect Dual-Layer overlap
  const hasFurigana = context.enableFurigana && processedSubtitle.furigana && processedSubtitle.furigana.length > 0;
  
  const mainLine = (
    <div 
      className={`grid text-center leading-[1.8] tracking-wide ${hasFurigana ? 'pt-[0.6em]' : ''}`} 
      style={{ fontSize: `${context.sttFontSize ?? 20}px` }}
    >
      {/* Layer 1: Base KTV Layer (Absolute STT timing truth) */}
      <div className="col-start-1 row-start-1 text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 whitespace-nowrap">
        {renderedTokens}
      </div>

      {/* Layer 2: Furigana Overlay Layer (Absolute morphological truth) */}
      {hasFurigana && (
        <div className="col-start-1 row-start-1 pointer-events-none z-20 whitespace-nowrap" aria-hidden="true">
          {processedSubtitle.furigana!.map((f, i) => (
            <span key={i} className="relative inline-block invisible">
              {f.surface}
              {f.reading && (
                <span 
                  className="absolute left-1/2 -translate-x-1/2 bottom-full visible text-white/90 font-semibold tracking-widest text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                  style={{ fontSize: '0.45em', lineHeight: '1', paddingBottom: '0.1em' }}
                >
                  {f.reading}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // If translation is available, construct the full layout (Main + Translation)
  if (processedSubtitle.original.translation != null && processedSubtitle.original.translation.length > 0) {
    return (
      <div className="flex flex-col items-center w-full" style={{ gap: `${context.subtitleSpacing ?? 6}px` }}>
        {mainLine}
        <p 
          className="text-[#facc15] font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-relaxed tracking-wide"
          style={{ fontSize: `${context.translationFontSize ?? 18}px` }}
        >
          {processedSubtitle.original.translation}
        </p>
      </div>
    );
  }

  // Fallback to just the main line
  return (
    <div className="flex flex-col items-center w-full" style={{ gap: `${context.subtitleSpacing ?? 6}px` }}>
      {mainLine}
    </div>
  );
};
