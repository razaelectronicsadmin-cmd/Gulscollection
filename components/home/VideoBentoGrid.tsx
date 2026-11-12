'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Video Data Mapping based on your files
const videos = [
  {
    id: 'vid-3',
    src: '/videos/guls-vid-3.mp4',
    title: 'The Visual Journey',
    subtitle: 'Immersive Experience',
    // Featured video: Spans 2 cols and 2 rows on desktop, full width on mobile
    gridClass: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2', 
  },
  {
    id: 'vid-1',
    src: '/videos/guls-vid-1.mp4',
    title: 'Guls Laizon',
    subtitle: 'Eau De Parfum',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 'vid-2',
    src: '/videos/guls-vid-2.mp4',
    title: 'Oud Edition',
    subtitle: 'Luxury Crafted',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 'vid-4',
    src: '/videos/guls-vid-4.mp4',
    title: 'Gen Z',
    subtitle: 'Modern Scents',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 'vid-5',
    src: '/videos/guls-vid-5.mp4',
    title: 'Gen X',
    subtitle: 'Classic Aura',
    gridClass: 'col-span-1 row-span-1',
  },
];

export default function VideoBentoGrid() {
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedVideo]);

  return (
    <section className="w-full py-8 md:py-12 px-6 md:px-14 bg-[#F7F7F5] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-6 md:mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#C9A66B] mb-2">
            Behind the Craft
          </span>
          <h2 className="text-2xl md:text-4xl font-serif text-[#183629] font-bold uppercase tracking-wide">
            The Art of Perfumery
          </h2>
        </div>

        {/* Bento Grid Layout - Viewport Locked */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-2 md:gap-4 w-full h-[65vh] md:h-[60vh] min-h-[400px] max-h-[600px] md:max-h-[700px]">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              layoutId={`video-container-${video.id}`}
              className={cn(
                "relative group overflow-hidden rounded-xl cursor-pointer bg-black h-full w-full",
                video.gridClass
              )}
              onClick={() => setSelectedVideo(video)}
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Auto-playing muted background video */}
              <video
                src={video.src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />

              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#183629]/90 via-[#183629]/20 to-transparent pointer-events-none" />

              {/* Hover Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#F3E9D7]/20 backdrop-blur-md flex items-center justify-center border border-[#C9A66B]/50">
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-[#F3E9D7] ml-1" />
                </div>
              </div>

              {/* Text Content */}
              <motion.div 
                layoutId={`video-text-${video.id}`}
                className="absolute bottom-0 left-0 p-4 md:p-6"
              >
                <p className="text-[9px] md:text-[11px] text-[#C9A66B] uppercase tracking-[0.2em] font-bold mb-1">
                  {video.subtitle}
                </p>
                <h3 className="text-xs md:text-lg font-serif text-[#F3E9D7] font-medium tracking-wide">
                  {video.title}
                </h3>
              </motion.div>

              {/* Expand Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 className="w-3 h-3 md:w-4 md:h-4 text-[#F3E9D7]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      

      {/* Expand/Push Modal (Premium Glassmorphism) */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0">
            {/* Dark Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-[#0c1410]/80 backdrop-blur-xl cursor-pointer"
              onClick={() => setSelectedVideo(null)}
            />

            {/* Modal Content */}
            <motion.div
              layoutId={`video-container-${selectedVideo.id}`}
              className="relative w-full max-w-4xl aspect-[9/16] md:aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#C9A66B]/20 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[#F3E9D7] hover:bg-[#C9A66B] hover:text-[#183629] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Active Video with Controls & Sound */}
              <video
                src={selectedVideo.src}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Persistent Text inside Modal */}
              <motion.div 
                layoutId={`video-text-${selectedVideo.id}`}
                className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"
              >
                <p className="text-xs md:text-sm text-[#C9A66B] uppercase tracking-[0.2em] font-bold mb-1 md:mb-2">
                  {selectedVideo.subtitle}
                </p>
                <h3 className="text-2xl md:text-4xl font-serif text-[#F3E9D7] font-medium tracking-wide">
                  {selectedVideo.title}
                </h3>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}