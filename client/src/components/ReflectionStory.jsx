import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Sparkles, Share2, Compass, Award, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getPatternStyles = (slideId) => {
  // Return different premium visual pattern styling based on slideId
  switch (slideId) {
    case 0: // Verdict
      return {
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
        backgroundSize: '100% 100%',
      };
    case 1: // Exchanges
      return {
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };
    case 2: // Catalyst
      return {
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 20%, transparent 20%, transparent 40%, rgba(255, 255, 255, 0.01) 40%, rgba(255, 255, 255, 0.01) 60%, transparent 60%)',
        backgroundSize: '30px 30px',
      };
    case 3: // System
      return {
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      };
    case 4: // Final Word
      return {
        backgroundImage: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    default:
      return {};
  }
};

export default function ReflectionStory({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);

  const token = localStorage.getItem('authToken');

  // Load reflection data
  useEffect(() => {
    if (!isOpen) return;

    const fetchReflection = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/intelligence/reflection`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          setData(res.data.data);
          setCurrentIndex(0);
          setProgress(0);
          setIsPaused(false);
        }
      } catch (err) {
        console.error('Failed to load twin reflection:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReflection();
  }, [isOpen, token]);

  // PROGRESS LOOP: Runs only if not paused and not on the last slide
  useEffect(() => {
    if (!isOpen || !data?.slides || data.slides.length === 0 || loading) return;
    if (isPaused) return;

    // Freeze loop permanently on Slide 5 (currentIndex === 4) and hold progress at 100%
    if (currentIndex === 4) {
      setProgress(100);
      return;
    }

    const duration = 6000; // 6 seconds per slide
    const intervalTime = 50;
    const step = (100 / (duration / intervalTime));

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          handleNext();
          return 100;
        }
        return p + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, data, currentIndex, loading, isPaused]);

  const handleNext = () => {
    if (data?.slides && currentIndex < data.slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleShareClick = () => {
    if (!data) return;
    console.log('📤 Shared Reflection Payload:', data);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  if (!isOpen) return null;

  const slides = data?.slides || [];
  const currentSlide = slides[currentIndex];
  const accent = currentSlide?.theme?.accent || '#a855f7';
  const bgGradient = currentSlide?.theme?.bg || 'from-[#0a051b] via-[#12072b] to-[#04020d]';
  const patternStyle = currentSlide ? getPatternStyles(currentIndex) : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020308]/98 p-0 sm:p-4">
      {/* Background Gradient (staggered transition) */}
      <AnimatePresence mode="wait">
        {currentSlide && (
          <motion.div
            key={`bg-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-tr ${bgGradient} transition-all duration-700`}
          />
        )}
      </AnimatePresence>

      {/* Main viewport story container */}
      <div
        className="relative w-full max-w-[460px] aspect-[9/16] max-h-[100vh] sm:max-h-[90vh] border rounded-none sm:rounded-[2.5rem] overflow-hidden flex flex-col justify-between shadow-2xl p-6 z-10 bg-[#000000]/20 backdrop-blur-sm transition-all duration-500"
        style={{ borderColor: `${accent}25` }}
      >
        {/* Dynamic Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-35 pointer-events-none transition-all duration-500 z-0"
          style={patternStyle}
        />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 relative z-10">
            <span className="h-10 w-10 border-2 border-white/20 border-t-white rounded-full animate-spin" style={{ borderTopColor: accent }} />
            <h3 className="text-lg font-bold text-white tracking-tight animate-pulse">
              Synchronizing Twin Reflection...
            </h3>
            <p className="text-xs text-gray-500 font-mono">Applying 100% real-data parameters</p>
          </div>
        ) : !currentSlide ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4 relative z-10">
            <AlertTriangle className="h-10 w-10 text-amber-500 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Awaiting Digital Twin Data</h3>
            <p className="text-xs text-gray-400">Please record steps, study goals, or expenses to trigger reflection cycles.</p>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all text-xs cursor-pointer">Close</button>
          </div>
        ) : (
          <>
            {/* Top segmented progress bars */}
            <div className="flex gap-1 w-full mb-6 pointer-events-none relative z-30">
              {slides.map((slide, idx) => (
                <div key={slide.slideId} className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                      background: accent,
                      transitionDuration: !isPaused && idx === currentIndex ? '50ms' : '0ms'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Slide Header with persistent Close button */}
            <div className="flex items-center justify-between w-full relative z-40">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/50">
                <Sparkles className="h-3.5 w-3.5" style={{ color: accent }} /> Digital Twin Reflection
              </span>

              {/* Persistent Exit button */}
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Close"
              >
                <X className="h-4 w-4 font-bold" />
              </button>
            </div>

            {/* Central Play/Pause Toggle button */}
            <div className="absolute top-16 right-6 z-40">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="h-3.5 w-3.5 fill-white" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Slide Body */}
            <div className="flex-1 flex flex-col justify-center relative my-4 z-20">
              {/* Left/Right click zones */}
              <div
                className="absolute inset-y-0 left-0 w-[30%] cursor-w-resize z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-[70%] cursor-e-resize z-30"
                onClick={(e) => {
                  // Ensure navigation click is not captured on Slide 5 action buttons
                  const isButton = e.target.closest('button');
                  if (!isButton) {
                    handleNext();
                  }
                }}
              />

              <div className="space-y-6 select-none relative z-10 px-2 text-center">
                {/* Chapter metadata (fades in) */}
                <motion.div
                  key={`chapter-${currentIndex}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-1"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 font-mono">
                    {currentSlide.chapter}
                  </span>
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-tight" style={{ color: accent }}>
                    {currentSlide.heading}
                  </span>
                </motion.div>

                {/* Primary Slide text content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${currentIndex}`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="py-4"
                  >
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tighter drop-shadow-md">
                      "{currentSlide.text}"
                    </h2>
                  </motion.div>
                </AnimatePresence>

                {/* SHARING & TERMINATION MODULE (Only on the final Slide 5) */}
                {currentIndex === 4 && (
                  <motion.div
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-4 shadow-xl z-40 relative text-left"
                  >
                    {/* Share static placeholder */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-300 font-semibold flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-amber-400" />
                        Share Core Identity to Socials
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShareClick}
                          className="h-7 w-7 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center justify-center transition-all cursor-pointer"
                          title="Share Link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {shareSuccess && (
                      <p className="text-[10px] text-center text-amber-400 font-mono animate-pulse">
                        Identity payload successfully copied to developer log!
                      </p>
                    )}

                    {/* End Journey Button */}
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-black/20 cursor-pointer"
                    >
                      End Journey
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Slide Footer */}
            <div className="flex justify-between items-center w-full relative z-40 border-t border-white/5 pt-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider transition-all ${currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'text-white/50 hover:text-white cursor-pointer'}`}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>

              <span className="text-[9px] font-mono text-white/30">
                {currentIndex + 1} of 5 {currentIndex === 4 ? '• FINISHED' : isPaused ? '• PAUSED' : ''}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === 4}
                className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider transition-all ${currentIndex === 4 ? 'opacity-20 cursor-not-allowed' : 'text-white/50 hover:text-white cursor-pointer'}`}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
