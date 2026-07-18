import React, { useState, useRef, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      let dx = 0;
      let dy = 0;
      
      const PADDING = 12; // Screen padding

      if (rect.right > window.innerWidth - PADDING) {
        dx = window.innerWidth - PADDING - rect.right;
      } else if (rect.left < PADDING) {
        dx = PADDING - rect.left;
      }

      if (rect.bottom > window.innerHeight - PADDING) {
        dy = window.innerHeight - PADDING - rect.bottom;
      } else if (rect.top < PADDING) {
        dy = PADDING - rect.top;
      }

      if (dx !== 0 || dy !== 0) {
        setOffset({ x: dx, y: dy });
      }
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [isVisible, content, position]);

  const getPositionClasses = () => {
    switch (position) {
      case "top": return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "bottom": return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left": return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right": return "left-full top-1/2 -translate-y-1/2 ml-2";
      default: return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <div className={`absolute ${getPositionClasses()} z-[100] pointer-events-none`}>
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.9, x: offset.x, y: offset.y }}
              animate={{ opacity: 1, scale: 1, x: offset.x, y: offset.y }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="px-2 py-1 bg-[#2a2a2a] border border-[rgba(255,255,255,0.1)] text-white text-xs rounded whitespace-nowrap shadow-lg"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

