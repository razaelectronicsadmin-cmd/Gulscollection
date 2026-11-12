'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share } from 'lucide-react';
import Image from 'next/image';

export default function PwaBanner() {
  const [isShowing, setIsShowing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Initialize state cleanly without calling setState inside useEffect
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  });

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    if (isIOS) {
      const timer = setTimeout(() => setIsShowing(true), 3000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsShowing(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsShowing(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isShowing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 w-full z-[100] p-3 md:hidden"
      >
        <div className="bg-[#183629] border border-[#C9A66B]/30 rounded-xl shadow-2xl p-3 flex items-center justify-between gap-3 relative overflow-hidden">
          
          <button onClick={() => setIsShowing(false)} className="absolute top-1 right-1 p-1 text-[#F5F5F0]/50 hover:text-[#F5F5F0]">
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <Image src="/icons/icon-192x192.png" alt="App Icon" width={44} height={44} className="rounded-lg shadow-md" />
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold text-[#F3E9D7]">Gul&apos;s Collection</span>
              <span className="text-[10px] text-[#C9A66B] uppercase tracking-wider">Premium Experience</span>
            </div>
          </div>

          {isIOS ? (
            <div className="text-[9px] text-[#F3E9D7] flex flex-col items-center text-center bg-[#C9A66B]/10 px-2 py-1 rounded-md">
              <span className="flex items-center gap-1"><Share size={10} /> Tap Share</span>
              <span>then &apos;Add to Home Screen&apos;</span>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="bg-[#C9A66B] text-[#183629] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-transform mr-4"
            >
              Install
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}