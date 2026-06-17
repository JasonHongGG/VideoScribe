import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Maximize } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    checkMaximized();

    const unlisten = appWindow.onResized(() => {
      checkMaximized();
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleToggleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <div 
      data-tauri-drag-region 
      className="h-[32px] w-full flex justify-between items-center bg-[#121212] select-none border-b border-[rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center pl-3 pointer-events-none">
        <span className="text-xs font-semibold text-[#facc15] tracking-wider">VIDEOSCRIBE</span>
      </div>
      
      <div className="flex h-full">
        <Tooltip content="Minimize" position="bottom">
          <div 
            className="h-full w-12 flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
            onClick={handleMinimize}
          >
            <Minus size={16} className="text-gray-400" />
          </div>
        </Tooltip>
        
        <Tooltip content={isMaximized ? "Restore" : "Maximize"} position="bottom">
          <div 
            className="h-full w-12 flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
            onClick={handleToggleMaximize}
          >
            {isMaximized ? <Square size={14} className="text-gray-400" /> : <Maximize size={14} className="text-gray-400" />}
          </div>
        </Tooltip>
        
        <Tooltip content="Close" position="bottom">
          <div 
            className="h-full w-12 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            onClick={handleClose}
          >
            <X size={16} className="text-gray-400 hover:text-white" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

