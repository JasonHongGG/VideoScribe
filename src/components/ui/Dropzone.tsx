import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { VideoLoaderService } from '../../services/videoLoaderService';

export function Dropzone() {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        let unlisten: (() => void) | undefined;
        let isMounted = true;

        const setupDragDrop = async () => {
            try {
                const { getCurrentWindow } = await import("@tauri-apps/api/window");

                const handler = await getCurrentWindow().onDragDropEvent((event) => {
                    if (!isMounted) return;

                    if (event.payload.type === 'enter' || event.payload.type === 'over') {
                        setIsDragging(true);
                    } else if (event.payload.type === 'drop') {
                        setIsDragging(false);
                        
                        const paths = event.payload.paths;
                        if (paths && paths.length > 0) {
                            VideoLoaderService.loadVideoFromPath(paths[0]);
                        }
                    } else {
                        setIsDragging(false);
                    }
                });
                
                if (isMounted) {
                    unlisten = handler;
                } else {
                    handler();
                }
            } catch (e) {
                console.error("Failed to setup Tauri drag drop", e);
            }
        };

        setupDragDrop();

        return () => {
            isMounted = false;
            if (unlisten) unlisten();
        };
    }, []);

    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/80 backdrop-blur-sm pointer-events-auto outline-5 outline-[#facc15] -outline-offset-[5px]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center bg-black/40 p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <UploadCloud className="w-20 h-20 text-[#facc15] mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                            Drop Video Here
                        </h2>
                        <p className="text-gray-400 font-medium text-lg tracking-wider uppercase text-sm">
                            SUPPORTED FORMATS: MP4, MKV, WEBM
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
