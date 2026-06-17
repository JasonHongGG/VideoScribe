import React from "react";

export const SettingsPanel: React.FC = () => {
  return (
    <div className="w-full h-full p-8 text-white overflow-y-auto custom-scrollbar bg-[#121212]">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-[#facc15] tracking-tight">Settings</h2>
        
        <div className="space-y-8">
          <section className="space-y-5 bg-[#1a1a1a]/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#facc15] rounded-full"></span>
              Speech-to-Text Engine
            </h3>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm text-gray-400 font-medium">Model Size</label>
              <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all cursor-pointer appearance-none" defaultValue="medium">
                <option value="tiny">Tiny (Fastest, least accurate)</option>
                <option value="base">Base</option>
                <option value="small">Small</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="large-v3">Large V3 (Slowest, most accurate)</option>
              </select>
              <p className="text-xs text-gray-500">Larger models require more RAM and take longer to process, but yield better results.</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-sm text-gray-400 font-medium">Language Detection</label>
              <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all cursor-pointer appearance-none" defaultValue="auto">
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
              <p className="text-xs text-gray-500">Manually setting the language can improve accuracy if auto-detect fails.</p>
            </div>
          </section>

          <section className="space-y-5 bg-[#1a1a1a]/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#facc15] rounded-full"></span>
              Display
            </h3>
            
            <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <div>
                <label className="text-base text-gray-200 font-medium cursor-pointer">Subtitle Overlay</label>
                <p className="text-xs text-gray-500 mt-1">Show generated subtitles directly on the video player</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\x27\x27] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

