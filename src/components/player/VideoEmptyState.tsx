import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { VideoLoaderService } from '../../services/videoLoaderService';

export const VideoEmptyState: React.FC = () => {
  const handleOpenFileDialog = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Video',
          extensions: ['mp4', 'webm', 'mkv']
        }]
      });

      if (selected && typeof selected === 'string') {
        VideoLoaderService.loadVideoFromPath(selected);
      }
    } catch (error) {
      console.error("Failed to open file dialog", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-black/40">
      <motion.button
        onClick={handleOpenFileDialog}
        className="group relative flex flex-col items-center justify-center focus:outline-none"
        whileHover="hover"
        whileTap="tap"
        initial="initial"
      >
        {/* The Big Icon Container with tight glow and animation */}
        <motion.div
          className="relative flex items-center justify-center w-28 h-28 rounded-full bg-[#111111] border border-white/5 shadow-2xl mb-8 transition-colors duration-300 group-hover:bg-[#161616]"
          variants={{
            initial: { scale: 1, boxShadow: "0px 10px 30px rgba(0,0,0,0.5)" },
            hover: { 
              scale: 1.05,
              boxShadow: "0px 20px 40px rgba(0,0,0,0.6), 0px 0px 0px 1px rgba(250,204,21,0.4), 0px 0px 30px rgba(250,204,21,0.25)"
            },
            tap: { scale: 0.95 }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Inner Icon bounce and glow */}
          <motion.div
            variants={{
              initial: { y: 0 },
              hover: { y: -4 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Upload 
              size={44} 
              strokeWidth={2} 
              className="text-gray-400 group-hover:text-[#facc15] transition-colors duration-300 drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" 
            />
          </motion.div>
        </motion.div>

        {/* Text Area */}
        <div className="flex flex-col items-center pointer-events-none">
          <motion.h2 
            className="text-3xl font-bold mb-4 text-white tracking-tight drop-shadow-md"
            variants={{
              initial: { opacity: 0.9 },
              hover: { opacity: 1, textShadow: "0px 0px 12px rgba(255,255,255,0.4)" },
            }}
          >
            Drop Video Here
          </motion.h2>
          <motion.p 
            className="text-sm text-gray-400 tracking-[0.2em] uppercase font-semibold"
            variants={{
              initial: { opacity: 0.6 },
              hover: { opacity: 0.9 },
            }}
          >
            Supports MP4, WEBM, MKV
          </motion.p>
          
          <motion.p
            className="text-xs text-[#facc15]/80 mt-6 tracking-widest font-bold uppercase"
            variants={{
              initial: { opacity: 0, y: 10 },
              hover: { opacity: 1, y: 0 },
            }}
          >
            Click to browse files
          </motion.p>
        </div>
      </motion.button>
    </div>
  );
};
