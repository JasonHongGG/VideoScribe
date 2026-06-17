import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow, getAllWebviewWindows } from "@tauri-apps/api/webviewWindow";
import { Minus, Square, X, Maximize, FileVideo, Command, Settings, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { open } from "@tauri-apps/plugin-dialog";
import { useVideoStore } from "../../store/videoStore";
import { useSTTStore } from "../../store/sttStore";
import { useNotifyStore } from "../../store/notifyStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import { STTService } from "../../services/sttService";

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  const { videoUrl, setVideo } = useVideoStore();
  const { isPanelOpen, togglePanel, status, setPanelOpen } = useSTTStore();
  const { show } = useNotifyStore();

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

  const handleOpenVideo = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "Video",
          extensions: ["mp4", "mkv", "webm"]
        }]
      });
      
      if (selected && typeof selected === "string") {
        const url = convertFileSrc(selected);
        const fileName = selected.split("\\").pop() || selected.split("/").pop() || "video";
        const file = new File([], fileName);
        setVideo(file, url, selected);
        show("Video loaded successfully", "success");
      }
    } catch (error) {
      console.error("Failed to open video", error);
      show("Failed to open video", "error");
    }
  };

  const handleRunSTT = async () => {
    const path = useVideoStore.getState().videoPath;
    
    if (!videoUrl || !path) {
      show("Please load a video from the file dialog first", "warning");
      return;
    }

    if (status !== "idle" && status !== "completed" && status !== "error") {
      show("STT is already running", "warning");
      return;
    }

    setPanelOpen(true);
    
    // Delegate complex STT flow to STTService
    STTService.startSTT(path, "medium");
  };

  const handleOpenSettings = async () => {
    try {
      const windows = await getAllWebviewWindows();
      const existingWindow = windows.find(w => w.label === "settings");
      
      if (existingWindow) {
        await existingWindow.setFocus();
      } else {
        const webview = new WebviewWindow("settings", {
          url: "/#/settings",
          title: "Settings",
          width: 800,
          height: 600,
          decorations: false,
          transparent: true,
          resizable: true,
          minWidth: 600,
          minHeight: 400
        });

        webview.once('tauri://error', function (e) {
          console.error("Error creating settings window", e);
          show("Failed to open settings window. Check permissions.", "error");
        });
      }
    } catch (e) {
      console.error("Failed to check windows or create window", e);
      show("Failed to open settings window.", "error");
    }
  };

  return (
    <div 
      data-tauri-drag-region 
      className="h-[48px] w-full flex justify-between items-center bg-transparent backdrop-blur-md select-none border-b border-white/5 z-50 absolute top-0 left-0"
    >
      <div className="flex items-center pl-4 pr-6 pointer-events-none border-r border-white/5 h-full">
        <span className="text-sm font-bold text-[#facc15] tracking-widest drop-shadow-md">VIDEOSCRIBE</span>
      </div>
      
      <div className="flex flex-1 items-center px-4 gap-2" data-tauri-drag-region>
        <Tooltip content="Open Video" position="bottom">
          <button 
            onClick={handleOpenVideo}
            className={`p-2 rounded-lg transition-all group flex items-center gap-2 ${videoUrl ? "text-[#facc15] bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
          >
            <FileVideo size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium tracking-wide">Open</span>
          </button>
        </Tooltip>
        
        <div className="w-px h-4 bg-white/10 mx-2"></div>

        <Tooltip content="Run Transcription" position="bottom">
          <button 
            onClick={handleRunSTT}
            className="p-2 px-3 rounded-lg text-[#121212] bg-[#facc15] hover:bg-white transition-all group flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 font-medium"
          >
            <Command size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold tracking-wider">RUN STT</span>
          </button>
        </Tooltip>
        
        <div className="w-px h-4 bg-white/10 mx-2"></div>

        <Tooltip content={isPanelOpen ? "Hide Subtitles" : "Show Subtitles"} position="bottom">
          <button 
            onClick={togglePanel}
            className={`p-2 rounded-lg transition-all group flex items-center gap-2 ${
              isPanelOpen 
                ? "text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/20" 
                : "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            {isPanelOpen ? (
              <PanelRightClose size={18} className="group-hover:scale-110 transition-transform" />
            ) : (
              <PanelRightOpen size={18} className="group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-medium tracking-wide">Panel</span>
          </button>
        </Tooltip>

        <div className="flex-1" data-tauri-drag-region></div>

        <Tooltip content="Settings" position="bottom">
          <button 
            onClick={handleOpenSettings}
            className="p-2 rounded-lg transition-all group mr-2 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center pr-4 h-full gap-1 cursor-default" data-tauri-drag-region="false" onMouseDown={(e) => e.stopPropagation()}>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all outline-none"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <Minus size={16} />
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all outline-none"
          onClick={handleToggleMaximize}
          aria-label="Maximize"
        >
          {isMaximized ? <Square size={14} /> : <Maximize size={14} />}
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white text-gray-400 transition-all outline-none ml-1"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

