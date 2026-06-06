import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGamification } from '../context/GamificationContext';

const globalToastedSignatures = new Set();

export default function ToastOverlay() {
  const { toast } = useGamification();
  const lastToastRef = useRef(null);

  // If there's a toast, calculate a unique signature
  let toastSig = null;
  if (toast) {
    if (toast.type === 'xp') {
      toastSig = `${toast.type}-${toast.amount}-${toast.activity}`;
    } else if (toast.type === 'badge') {
      toastSig = `${toast.type}-${toast.badge?.badgeId || toast.badge?.title}`;
    }
  }

  // If the signature matches the last rendered signature or is in the global lock, skip
  const isDuplicate = toastSig && (lastToastRef.current === toastSig || globalToastedSignatures.has(toastSig));
  if (toastSig && !isDuplicate) {
    lastToastRef.current = toastSig;
    globalToastedSignatures.add(toastSig);
    // Cleanup signature after 10 seconds to allow future valid triggers
    setTimeout(() => {
      globalToastedSignatures.delete(toastSig);
    }, 10000);
  }

  const activeToast = isDuplicate ? null : toast;

  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-[9999] flex flex-col gap-4">
      <AnimatePresence>
        {activeToast && activeToast.type === 'xp' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex items-center gap-4 rounded-2xl border border-[#10c7a1]/30 bg-[#0a0e17]/95 px-6 py-4 shadow-[0_0_30px_rgba(16,199,161,0.2)] backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10c7a1]/20 text-xl shadow-[inset_0_0_10px_rgba(16,199,161,0.5)]">
              ⚡
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10c7a1]">Action Logged</p>
              <p className="text-lg font-bold text-white">+{activeToast.amount} XP Earned</p>
            </div>
          </motion.div>
        )}

        {activeToast && activeToast.type === 'badge' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex items-center gap-4 rounded-2xl border border-[#c8a84b]/40 bg-[#0a0e17]/95 px-6 py-4 shadow-[0_0_40px_rgba(200,168,75,0.25)] backdrop-blur-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8a84b]/20 text-3xl shadow-[inset_0_0_15px_rgba(200,168,75,0.6)]">
              {activeToast.badge?.icon || '🏆'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a84b]">Badge Unlocked!</p>
              <p className="text-lg font-bold text-white">{activeToast.badge?.name || activeToast.badge?.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}