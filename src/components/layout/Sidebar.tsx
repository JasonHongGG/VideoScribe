import { Settings, FileVideo, Command, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { open } from "@tauri-apps/plugin-dialog";
import { useVideoStore } from "../../store/videoStore";
import { useSTTStore } from "../../store/sttStore";
import { useNotifyStore } from "../../store/notifyStore";
import { useAppStore } from "../../store/appStore";
import { convertFileSrc } from "@tauri-apps/api/core";

export const Sidebar: React.FC = () => {
  const { videoUrl, setVideo } = useVideoStore();
  const { isPanelOpen, togglePanel, setStatus, setResults, status, setPanelOpen } = useSTTStore();
  const { show } = useNotifyStore();
  const { activeView, setActiveView } = useAppStore();

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
        const fileName = selected.split("\\\\").pop() || selected.split("/").pop() || "video";
        const file = new File([], fileName);
        setVideo(file, url, selected);
        show("Video loaded successfully", "success");
        setActiveView("player");
      }
    } catch (error) {
      console.error("Failed to open video", error);
      show("Failed to open video", "error");
    }
  };

  const handleRunSTT = async () => {
    // Check if we have the video URL, but more importantly, the raw path
    const path = useVideoStore.getState().videoPath;
    
    if (!videoUrl || !path) {
      show("Please load a video from the file dialog first", "warning");
      return;
    }

    if (status !== "idle" && status !== "completed" && status !== "error") {
      show("STT is already running", "warning");
      return;
    }

    setActiveView("player");
    setPanelOpen(true);
    setResults([]); // Clear previous results
    setStatus("loading_model", 0);
    show("Starting Speech-to-Text process...", "info");

    try {
      // Dynamic import to avoid SSR issues if we had them
      const { invoke } = await import("@tauri-apps/api/core");
      const { listen } = await import("@tauri-apps/api/event");

      const unlisten = await listen<string>("stt-progress", (event) => {
        try {
          const data = JSON.parse(event.payload);
          if (data.type === "progress") {
            setStatus(data.status, data.progress);
            if (data.status === "completed") {
              show("STT processing completed", "success");
              unlisten();
            }
          } else if (data.type === "result") {
            useSTTStore.getState().appendResult({ start: data.start, end: data.end, text: data.text });
          } else if (data.type === "error") {
            setStatus("error");
            show(data.message, "error");
            unlisten();
          }
        } catch (e) {
          console.error("Failed to parse STT event", e);
        }
      });

      // Assuming model size is retrieved from somewhere, or default to medium
      await invoke("run_stt", { videoPath: path, modelSize: "medium" });

    } catch (e: any) {
      console.error(e);
      setStatus("error");
      show(`Failed to start STT: ${e.toString()}`, "error");
    }
  };

  return (
    <div className="w-14 h-full bg-[#1a1a1a]/80 backdrop-blur-md border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10 shrink-0">
      
      <Tooltip content="Open Video" position="right">
        <button 
          onClick={handleOpenVideo}
          className={`p-3 rounded-xl transition-all group ${activeView === "player" && videoUrl ? "text-[#facc15] bg-white/5" : "text-gray-400 hover:text-[#facc15] hover:bg-white/5"}`}
        >
          <FileVideo size={22} className="group-hover:scale-110 transition-transform" />
        </button>
      </Tooltip>
      
      <div className="w-6 h-px bg-white/10 my-2"></div>

      <Tooltip content="Run STT" position="right">
        <button 
          onClick={handleRunSTT}
          className="p-3 rounded-xl text-gray-400 hover:text-[#facc15] hover:bg-[#facc15]/10 transition-all group relative"
        >
          <Command size={22} className="group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-[#facc15]/0 group-hover:ring-[#facc15]/50 transition-all"></div>
        </button>
      </Tooltip>
      
      <Tooltip content={isPanelOpen ? "Hide STT Panel" : "Show STT Panel"} position="right">
        <button 
          onClick={togglePanel}
          className={`p-3 rounded-xl transition-all group ${
            isPanelOpen 
              ? "text-[#facc15] bg-[#facc15]/10" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {isPanelOpen ? (
            <PanelRightClose size={22} className="group-hover:scale-110 transition-transform" />
          ) : (
            <PanelRightOpen size={22} className="group-hover:scale-110 transition-transform" />
          )}
        </button>
      </Tooltip>
      
      <div className="mt-auto">
        <Tooltip content="Settings" position="right">
          <button 
            onClick={() => setActiveView(activeView === "settings" ? "player" : "settings")}
            className={`p-3 rounded-xl transition-all group ${activeView === "settings" ? "text-[#facc15] bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Settings size={22} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </Tooltip>
      </div>

    </div>
  );
};

