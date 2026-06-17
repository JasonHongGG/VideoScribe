import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../../store/videoStore";
import { useSTTStore } from "../../store/sttStore";
import { formatTime } from "../../utils/time";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const STTPanel: React.FC = () => {
  const { isPanelOpen, results, status, progress } = useSTTStore();
  const { currentTime, setCurrentTime, setIsPlaying } = useVideoStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const item = activeItemRef.current;
      
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.clientHeight;
      const containerScrollTop = container.scrollTop;
      const containerScrollBottom = containerScrollTop + container.clientHeight;

      if (itemTop < containerScrollTop || itemBottom > containerScrollBottom) {
        item.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, isPanelOpen]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full bg-[#1a1a1a]/95 backdrop-blur-md border-l border-white/5 flex flex-col overflow-hidden shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="p-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
            <h2 className="font-bold text-[#facc15] tracking-widest text-xs">TRANSCRIPTION</h2>
            
            {status !== "idle" && status !== "completed" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#facc15] font-mono">
                  {status === "loading_model" ? "Loading..." : `${progress}%`}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#facc15] animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              </div>
            )}
          </div>

          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scrollbar p-3 relative"
          >
            {status !== "idle" && status !== "completed" && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#facc15] animate-spin mb-4 shadow-[0_0_15px_rgba(250,204,21,0.2)]" />
                <p className="text-[#facc15] font-medium text-sm mb-2">Processing Audio</p>
                
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#eab308] to-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  />
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="flex flex-col gap-2 pb-4">
                {results.map((result, idx) => {
                  const isActive = currentTime >= result.start && currentTime <= result.end;
                  
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeItemRef : null}
                      onClick={() => handleSeek(result.start)}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? "bg-[#facc15]/15 border border-[#facc15]/40 shadow-[0_0_15px_rgba(250,204,21,0.15)] scale-[1.02]" 
                          : "bg-white/5 hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-mono tracking-wider ${isActive ? "text-[#facc15] drop-shadow-md" : "text-gray-500"}`}>
                          {formatTime(result.start)}
                        </span>
                        <div className={`flex-1 h-px ${isActive ? "bg-gradient-to-r from-[#facc15]/50 to-transparent" : "bg-white/5"}`}></div>
                        <Play 
                          size={14} 
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-[#facc15]" : "text-gray-400"}`} 
                        />
                      </div>
                      
                      <p className={`text-sm leading-relaxed ${isActive ? "text-white font-medium drop-shadow-sm" : "text-gray-400 group-hover:text-gray-200"}`}>
                        {result.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              status === "idle" && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Play size={24} className="text-gray-600 ml-1" />
                  </div>
                  <p className="text-sm text-gray-400">Run STT to generate transcription.</p>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

