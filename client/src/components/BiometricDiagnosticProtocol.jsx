import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertTriangle, Activity, ShieldAlert, Sparkles, RefreshCw, TrendingDown, Compass, Brain, Check, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BiometricDiagnosticProtocol({ isOpen, onClose }) {
  // exact phase states: idle, detecting_hardware, acquiring_target, error, scanning, results
  const [phase, setPhase] = useState('idle'); 
  const [countdown, setCountdown] = useState(10);
  const [hasUserMedia, setHasUserMedia] = useState(false);

  const countdownTimerRef = useRef(null);
  const hardwareTimeoutRef = useRef(null);
  const webcamRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (hardwareTimeoutRef.current) clearTimeout(hardwareTimeoutRef.current);
    };
  }, []);

  // PHASE 0: User clicks "Start Calibration"
  const handleStartCalibration = () => {
    setPhase('detecting_hardware');
    setHasUserMedia(false);
    
    // Set 5-second failure timeout for hardware detection gatekeeper
    hardwareTimeoutRef.current = setTimeout(() => {
      setPhase(curr => {
        if (curr === 'detecting_hardware' && !hasUserMedia) {
          return 'error';
        }
        return curr;
      });
    }, 5000);
  };

  // Webcam acquired - proceed to Face Detection Gatekeeper
  const handleUserMediaActive = () => {
    setHasUserMedia(true);
    if (hardwareTimeoutRef.current) clearTimeout(hardwareTimeoutRef.current);
    
    // State: acquiring_target -> Simulated 1.5s delay to lock face
    setPhase('acquiring_target');
    
    setTimeout(() => {
      setPhase('scanning');
      startScanningTimer();
    }, 1500);
  };

  // Camera access error handler
  const handleUserMediaError = () => {
    if (hardwareTimeoutRef.current) clearTimeout(hardwareTimeoutRef.current);
    setPhase('error');
  };

  // PHASE 1: 10s Active Scan Countdown timer
  const startScanningTimer = () => {
    setCountdown(10);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetScan = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (hardwareTimeoutRef.current) clearTimeout(hardwareTimeoutRef.current);
    setPhase('idle');
    setCountdown(10);
    setHasUserMedia(false);
  };

  const handleAcceptProtocol = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_BASE_URL}/api/health/biometric-sync`, {
        metrics: {
          heartRate: 85,
          stressLevel: 9,
          sleepHours: 5.2,
          steps: 1200
        },
        metadata: {
          mood: "Overloaded",
          protocolStatus: "Accepted"
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Sync failed:', err.message);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Decide if webcam should be mounted in current phase
  const shouldShowWebcam = ['detecting_hardware', 'acquiring_target', 'scanning'].includes(phase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020308]/96 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-8">
        
        {/* Glow styling */}
        <div className="absolute -right-20 -top-20 w-44 h-44 bg-[#7b61ff]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Modal close '✕' button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer z-50"
          title="Dismiss Scan"
        >
          <X className="h-4 w-4" />
        </button>

        <AnimatePresence mode="wait">
          {/* Phase 0: Idle state */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center py-10 gap-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-[#7b61ff]/10 border border-[#7b61ff]/20 flex items-center justify-center text-[#7b61ff]">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white">Biometric Diagnostic Protocol</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Start the digital twin physical calibration loop. We will scan facial metrics to diagnose neural fatigue and stress levels.
                </p>
              </div>
              <button
                onClick={handleStartCalibration}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#7b61ff] to-[#10c7a1] font-black text-xs text-white uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer border border-white/15"
              >
                Start Calibration
              </button>
            </motion.div>
          )}

          {/* Phase 0: Error state */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-10 gap-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-red-500">Hardware Access Denied</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
                  Face not detected. Please scan again.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResetScan}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  Retry Scan
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-black transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}

          {/* Active Camera Scan View (detecting, acquiring, scanning) */}
          {shouldShowWebcam && (
            <motion.div
              key="camera_view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black/50 max-w-lg shadow-xl">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  onUserMedia={handleUserMediaActive}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                />

                {/* State: Detecting Hardware Spinner */}
                {phase === 'detecting_hardware' && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Detecting Hardware...</span>
                  </div>
                )}

                {/* State: Acquiring Target (1.5s lock) */}
                {phase === 'acquiring_target' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                    <div className="h-8 w-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Detecting Face...</span>
                  </div>
                )}

                {/* State: Scanning (Crosshair scan line overlays) */}
                {phase === 'scanning' && (
                  <>
                    <div className="absolute inset-0 border border-[#7b61ff]/15 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 border border-[#7b61ff]/30 rounded-full flex items-center justify-center pointer-events-none">
                      <div className="h-2 w-2 rounded-full bg-[#7b61ff] animate-ping" />
                    </div>
                    <div
                      className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7b61ff] to-transparent shadow-[0_0_15px_#7b61ff]"
                      style={{
                        animation: 'diagScanLine 2.5s ease-in-out infinite',
                        position: 'absolute'
                      }}
                    />
                    <style>{`
                      @keyframes diagScanLine {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>
                  </>
                )}
              </div>

              {/* Status metrics footer */}
              <div className="flex items-center justify-between w-full max-w-lg">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider flex items-center gap-1.5 uppercase font-bold">
                  {phase === 'detecting_hardware' && 'Initializing hardware feed'}
                  {phase === 'acquiring_target' && 'Locking facial parameters'}
                  {phase === 'scanning' && 'Analyzing biometric calibration'}
                </span>
                {phase === 'scanning' && (
                  <span className="text-2xl font-black text-[#7b61ff] tracking-tight">{countdown}s</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Phase 2 & 3: Calibration Complete Report */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Phase 2: Completion Header Flash */}
              <div className="text-center py-2 border-b border-white/10">
                <h2 className="text-lg font-black tracking-widest text-[#10c7a1] uppercase flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#10c7a1] animate-bounce" />
                  DIGITAL TWIN CALIBRATION COMPLETE
                </h2>
              </div>

              {/* Phase 3: Results Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. CURRENT STATE */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#7b61ff] font-mono flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" /> Current State
                  </div>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Stress:</span>
                      <span className="text-red-500 font-black">High</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Energy:</span>
                      <span className="text-yellow-500 font-black">Low</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Focus:</span>
                      <span className="text-blue-500 font-black">Medium</span>
                    </div>
                  </div>
                </div>

                {/* 2. CROSS-DOMAIN IMPACT */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-red-500 font-mono flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" /> Domain Bleeding
                  </div>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-white/60">Career Readiness:</span>
                      <span className="text-red-500 font-black">-6%</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-white/60">Learning Flow:</span>
                      <span className="text-red-500 font-black">-12%</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-white/60">Decision quality:</span>
                        <span className="text-red-500 font-black">-4%</span>
                      </div>
                      <div className="text-[9px] text-red-400/80 leading-tight italic font-semibold">
                        "High correlation with stress-spending"
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PREDICTED TOMORROW */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Predicted Tomorrow
                  </div>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Burnout Risk:</span>
                      <span className="text-amber-500 font-black">Rising</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Interview Flow:</span>
                      <span className="text-red-500 font-black">Reduced</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Productivity:</span>
                      <span className="text-red-500 font-black">Below Avg</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. MESSAGE FROM TWIN */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#7b61ff]/15 to-red-500/5 border border-white/10 text-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#7b61ff] to-red-500" />
                <Brain className="h-6 w-6 text-[#7b61ff] mx-auto mb-2 animate-pulse" />
                <blockquote className="text-sm sm:text-base font-black text-white leading-relaxed max-w-lg mx-auto">
                  "You are not underperforming because of skill limitations. Your current limitation is recovery capacity."
                </blockquote>
              </div>

              {/* 5. ADAPTIVE PROTOCOL */}
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-[#10c7a1]" />
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight">Immediate Grounding Protocol</h4>
                    <p className="text-[9px] text-[#10c7a1] font-bold font-mono uppercase tracking-wider">Human Intervention Guideline</p>
                  </div>
                </div>

                {/* Empathetic Grounding guidelines */}
                <ul className="space-y-3 pl-1 text-xs">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded bg-[#10c7a1]/10 text-[#10c7a1] flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">1</div>
                    <span className="text-gray-300 font-medium leading-relaxed">
                      Close the IDE and go for a 15-minute walk without your phone.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded bg-[#10c7a1]/10 text-[#10c7a1] flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">2</div>
                    <span className="text-gray-300 font-medium leading-relaxed">
                      Your stress is spiking your financial friction. Do not order takeout tonight.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded bg-[#10c7a1]/10 text-[#10c7a1] flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">3</div>
                    <span className="text-gray-300 font-medium leading-relaxed">
                      Call your mother or listen to your ambient playlist.
                    </span>
                  </li>
                </ul>

                {/* Action Gate buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptProtocol}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs tracking-wider transition-all cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-1 animate-pulse"
                  >
                    Accept Protocol
                  </button>
                </div>
              </div>

              {/* Reset controls */}
              <div className="text-center">
                <button
                  onClick={handleResetScan}
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-all cursor-pointer font-mono"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Scan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
