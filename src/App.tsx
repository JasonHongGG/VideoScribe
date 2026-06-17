import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { Notify } from "./components/ui/Notify";
import { Dropzone } from "./components/ui/Dropzone";
import { VideoPlayer } from "./components/player/VideoPlayer";
import { STTPanel } from "./components/stt/STTPanel";
import { SettingsPanel } from "./components/layout/SettingsPanel";
import { useAppStore } from "./store/appStore";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const { activeView } = useAppStore();

  return (
    <div className="flex flex-col w-screen h-screen bg-transparent text-white overflow-hidden rounded-lg">
      <TitleBar />
      <Notify />
      <Dropzone />
      
      <div className="flex flex-1 overflow-hidden relative glass-panel border-t-0 rounded-b-lg">
        <Sidebar />
        
        <main className="flex-1 relative overflow-hidden bg-black/60 flex">
          <AnimatePresence mode="wait">
            {activeView === "player" ? (
              <motion.div
                key="player"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex"
              >
                <VideoPlayer />
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <SettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <STTPanel />
      </div>
    </div>
  );
}

export default App;

