import React from "react";
import { useVideoStore } from "../../store/videoStore";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { formatTime } from "../../utils/time";

export const VideoControls: React.FC = () => {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    setIsPlaying, 
    setCurrentTime,
    setVolume 
  } = useVideoStore();

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleVolumeChange = (value: number[]) => setVolume(value[0]);
  
  const handleTimeChange = (value: number[]) => setCurrentTime(value[0]);

  const skipTime = (amount: number) => {
    const newTime = Math.max(0, Math.min(currentTime + amount, duration));
    setCurrentTime(newTime);
  };

  const skipFrame = (frames: number) => {
    const frameTime = 1 / 30;
    skipTime(frames * frameTime);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-transparent border-t border-white/5">
      <div className="flex items-center gap-4" onWheel={handleWheel}>
        <span className="text-xs font-mono text-gray-300 w-12 text-right drop-shadow-md">
          {formatTime(currentTime)}
        </span>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5 group"
          value={[currentTime]}
          max={duration}
          step={0.01}
          onValueChange={handleTimeChange}
        >
          <Slider.Track className="bg-white/30 relative grow rounded-full h-1 transition-all group-hover:h-1.5">
            <Slider.Range className="absolute bg-[#facc15] rounded-full h-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </Slider.Track>
          <Slider.Thumb 
            className="block w-3.5 h-3.5 bg-white shadow-md rounded-full hover:bg-[#facc15] focus:outline-none transition-transform scale-0 group-hover:scale-100 cursor-pointer" 
            aria-label="Progress" 
          />
        </Slider.Root>
        <span className="text-xs font-mono text-gray-300 w-12 drop-shadow-md">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => skipFrame(-1)} className="p-1.5 text-gray-300 hover:text-white transition-colors rounded hover:bg-white/10" title="Previous Frame">
              <SkipBack size={16} />
            </button>
            <button onClick={() => skipTime(-1)} className="text-xs font-mono text-gray-300 hover:text-[#facc15] transition-colors" title="-1 Second">
              -1s
            </button>
          </div>

          <button 
            onClick={handlePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-[#facc15] text-black rounded-full hover:bg-white hover:scale-105 transition-all active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.4)]"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => skipTime(1)} className="text-xs font-mono text-gray-300 hover:text-[#facc15] transition-colors" title="+1 Second">
              +1s
            </button>
            <button onClick={() => skipFrame(1)} className="p-1.5 text-gray-300 hover:text-white transition-colors rounded hover:bg-white/10" title="Next Frame">
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-24 group/vol">
          <button 
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-4"
            value={[volume]}
            max={1}
            step={0.05}
            onValueChange={handleVolumeChange}
          >
            <Slider.Track className="bg-white/30 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-white rounded-full h-full group-hover/vol:bg-[#facc15] transition-colors" />
            </Slider.Track>
            <Slider.Thumb className="block w-2.5 h-2.5 bg-white shadow-md rounded-full scale-0 group-hover/vol:scale-100 transition-transform" />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
};

