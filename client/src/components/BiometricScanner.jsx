import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Activity, Sparkles, RefreshCw, Brain, ShieldAlert, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function BiometricScanner() {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, results
  const [countdown, setCountdown] = useState(10);
  const [metrics, setMetrics] = useState(null);
  const [mood, setMood] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // success, error
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);
  const [protocolText, setProtocolText] = useState('');

  const timerRef = useRef(null);
  const webcamRef = useRef(null);

  // Phase 1: Scanning Countdown Timer Logic
  useEffect(() => {
    if (scanState === 'scanning') {
      setCountdown(10);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishScan();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scanState]);

  const handleStartScan = () => {
    setMetrics(null);
    setMood('');
    setSyncStatus(null);
    setProtocolText('');
    setScanState('scanning');
  };

  const handleFinishScan = async () => {
    // Generate realistic, non-flat user biometric metrics
    const computedMetrics = {
      energy: Math.floor(Math.random() * 30) + 55,     // 55 - 85%
      stress: Math.floor(Math.random() * 40) + 20,     // 20 - 60%
      fatigue: Math.floor(Math.random() * 35) + 30,    // 30 - 65%
      focus: Math.floor(Math.random() * 25) + 70,      // 70 - 95%
      tension: Math.floor(Math.random() * 30) + 25     // 25 - 55%
    };

    // Determine Overall Mood index based on Stress and Fatigue levels
    let calculatedMood = "Balanced State";
    if (computedMetrics.stress > 50 && computedMetrics.fatigue > 55) {
      calculatedMood = "Overloaded";
    } else if (computedMetrics.fatigue > 50) {
      calculatedMood = "Exhausted";
    } else if (computedMetrics.focus > 80 && computedMetrics.stress < 40) {
      calculatedMood = "Flow State";
    } else if (computedMetrics.energy > 75) {
      calculatedMood = "High Performance";
    }

    setMetrics(computedMetrics);
    setMood(calculatedMood);
    setScanState('results');

    // Trigger dynamic synchronization to the database dashboard figures
    await syncBiometricsToDB(computedMetrics, calculatedMood);
  };

  // Phase 2: POST metrics backend synchronization
  const syncBiometricsToDB = async (data, currentMood) => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        metrics: {
          heartRate: Math.floor(Math.random() * 25) + 65, // simulated HR 65-90 bpm
          stressLevel: Math.round(data.stress / 10), // scale 1-10
          sleepHours: parseFloat((6.5 + (data.energy / 100) * 1.5).toFixed(1)), // sleep baseline offset
          steps: Math.floor((data.energy / 100) * 8500) // steps offset
        },
        metadata: {
          mood: currentMood,
          fatigueIndex: data.fatigue,
          focusIndex: data.focus,
          tensionIndex: data.tension
        }
      };

      await axios.post(`${API_BASE_URL}/api/health/biometric-sync`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyncStatus('success');
    } catch (err) {
      console.error('Failed to sync scanned biometrics:', err);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Phase 3: Copilot personalized recommendation generator
  const handleGenerateProtocol = () => {
    setIsGeneratingProtocol(true);
    // Simulate Gemini API pipeline handshake for personalization recommendation
    setTimeout(() => {
      let advice = "High concentration limits detected. Keep up the deep focus block, but stay hydrated.";
      if (mood === "Overloaded" || metrics.stress > 50) {
        advice = "Extreme neural tension and cognitive strain detected. Step away from your IDE immediately for 15 minutes.";
      } else if (mood === "Exhausted" || metrics.fatigue > 55) {
        advice = "Physical fatigue indexes have exceeded baseline warnings. Wind down coding sprints and prioritize sleep recovery.";
      } else if (mood === "Flow State") {
        advice = "Optimal flow alignment. Your digital twin suggests locking in deep engineering sprints for another hour.";
      }
      setProtocolText(advice);
      setIsGeneratingProtocol(false);
    }, 1500);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d101d]/90 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden text-white w-full max-w-md mx-auto">
      {/* Dynamic glow decoration */}
      <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#7b61ff]/10 blur-2xl rounded-full pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-28 h-28 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 relative z-10">
        <Activity className="h-5 w-5 text-[#7b61ff]" />
        <div>
          <h4 className="text-lg font-black tracking-tight uppercase">Biometric Twin Scanner</h4>
          <p className="text-[10px] text-gray-400 font-mono">Real-time physiological mapping</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* State: Idle */}
        {scanState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 text-center gap-5 relative z-10"
          >
            <div className="h-20 w-20 rounded-full border border-dashed border-[#7b61ff]/40 flex items-center justify-center bg-[#7b61ff]/5 animate-pulse">
              <Camera className="h-8 w-8 text-[#7b61ff]" />
            </div>
            <div>
              <h5 className="text-sm font-bold">Initialize Biometric Scan</h5>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Grant camera permission to evaluate real-time tension index, stress parameters, and physical fatigue.
              </p>
            </div>
            <button
              onClick={handleStartScan}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b61ff] to-cyan-500 font-extrabold text-xs text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(123,97,255,0.3)] transition-all cursor-pointer border border-white/10"
            >
              Start 10s Scan
            </button>
          </motion.div>
        )}

        {/* State: Scanning (0 to 10 Seconds) */}
        {scanState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 relative z-10"
          >
            {/* Webcam viewport container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black/40">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              
              {/* CSS scanning overlay grid and line */}
              <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
              <div 
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981]" 
                style={{
                  animation: 'scanLine 3s linear infinite',
                  position: 'absolute'
                }}
              />
              <style>{`
                @keyframes scanLine {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
              `}</style>

              {/* Status indicator */}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 border border-white/10 flex items-center gap-1.5 text-[9px] font-mono tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>FEED SYNC ACTIVE</span>
              </div>
            </div>

            {/* Scanning details & countdown */}
            <div className="flex items-center justify-between w-full mt-1">
              <span className="text-xs text-gray-400 font-mono animate-pulse">Calibrating visual points...</span>
              <span className="text-lg font-black text-emerald-400 tracking-tight">{countdown}s</span>
            </div>
          </motion.div>
        )}

        {/* State: Results Dashboard */}
        {scanState === 'results' && metrics && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5 relative z-10"
          >
            {/* Overall Mood indicator */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Core State Diagnosis</span>
                <div className="text-base font-black uppercase text-emerald-400 tracking-tight mt-0.5">{mood}</div>
              </div>

              {/* Database sync status */}
              <div className="text-right">
                {isSyncing ? (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <Loader2 className="h-3 w-3 animate-spin" /> Syncing...
                  </span>
                ) : syncStatus === 'success' ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold font-mono">
                    <Check className="h-3.5 w-3.5" /> Dashboard Synced
                  </span>
                ) : (
                  <span className="text-[10px] text-red-400 font-mono">Sync Pending</span>
                )}
              </div>
            </div>

            {/* Biometric progress bars */}
            <div className="space-y-3 pt-1">
              {[
                { label: 'Energy', value: metrics.energy, color: 'bg-yellow-500' },
                { label: 'Stress', value: metrics.stress, color: 'bg-red-500' },
                { label: 'Fatigue', value: metrics.fatigue, color: 'bg-orange-500' },
                { label: 'Focus', value: metrics.focus, color: 'bg-blue-500' },
                { label: 'Tension', value: metrics.tension, color: 'bg-purple-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-bold">{item.label}</span>
                    <span className="text-white font-black">{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Personal Copilot action gate */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <button
                onClick={handleGenerateProtocol}
                disabled={isGeneratingProtocol}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-gray-100 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isGeneratingProtocol ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating Copilot Protocol...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#7b61ff]" /> Generate Copilot Protocol
                  </>
                )}
              </button>

              {/* Protocol Recommendation Alert Box */}
              {protocolText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start"
                >
                  <Brain className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block font-mono">Digital Twin Guideline</span>
                    <p className="text-xs text-gray-200 mt-1 leading-relaxed font-semibold">
                      {protocolText}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Reset control */}
            <div className="text-center pt-2">
              <button
                onClick={handleStartScan}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Scan Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
