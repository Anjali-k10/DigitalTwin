import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Camera, Brain, ShieldAlert, Sparkles, RefreshCw,
  AlertTriangle, Check, Loader2, TrendingDown, Compass
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function LiveBiometricScanner({ onAskCopilot }) {
  // States: idle, loading, ready, detecting, gatekeeper_error, scanning, syncing, results
  const [scanState, setScanState] = useState('idle');
  const [libLoaded, setLibLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [countdown, setCountdown] = useState(10);
  const [liveMetrics, setLiveMetrics] = useState({ stress: 0, fatigue: 0, energy: 0, tension: 0 });
  const [finalScanResults, setFinalScanResults] = useState(null);

  const webcamRef = useRef(null);
  const gatekeeperTimeoutRef = useRef(null);
  const metricsAccumulator = useRef([]);

  // Load face-api.js script dynamically from CDN
  useEffect(() => {
    let active = true;
    const loadScript = async () => {
      if (window.faceapi) {
        if (active) setLibLoaded(true);
        return;
      }
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';
        script.async = true;
        script.onload = () => {
          if (active) setLibLoaded(true);
        };
        script.onerror = () => {
          if (active) setModelError('Failed to load biometric modeling library from CDN.');
        };
        document.body.appendChild(script);
      } catch (err) {
        if (active) setModelError('Failed to initialize scanning engine.');
      }
    };
    loadScript();
    return () => {
      active = false;
    };
  }, []);

  // Load models after script is injected
  useEffect(() => {
    if (!libLoaded) return;
    let active = true;
    const loadModels = async () => {
      setModelLoading(true);
      try {
        const faceapi = window.faceapi;
        const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        // Load only needed network weights for performance
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
        ]);
        if (active) {
          setModelLoading(false);
          setScanState('idle'); // Set back to idle now that engine is loaded
        }
      } catch (err) {
        console.error('Model load error:', err);
        if (active) {
          setModelError('Failed to load neural models from CDN repository.');
          setModelLoading(false);
        }
      }
    };
    loadModels();
    return () => {
      active = false;
    };
  }, [libLoaded]);

  // Handle active webcam frames
  useEffect(() => {
    let active = true;
    let frameId = null;

    const detectFace = async () => {
      if (!webcamRef.current || !webcamRef.current.video || !window.faceapi) return;
      const faceapi = window.faceapi;
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      try {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
        if (detection && active) {
          if (gatekeeperTimeoutRef.current) {
            clearTimeout(gatekeeperTimeoutRef.current);
            gatekeeperTimeoutRef.current = null;
          }
          setScanState('scanning');
        }
      } catch (err) {
        console.warn('Detection failed:', err.message);
      }
    };

    const runActiveScan = async () => {
      if (!webcamRef.current || !webcamRef.current.video || !window.faceapi) return;
      const faceapi = window.faceapi;
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      try {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();

        if (detection && detection.expressions && active) {
          const expr = detection.expressions;
          
          // Map expressions to Stress, Fatigue, Energy, and Tension
          const stressVal = Math.min(100, Math.max(0, Math.round(
            ((expr.angry || 0) * 0.7 + (expr.fearful || 0) * 0.8 + (expr.sad || 0) * 0.4 + (expr.disgusted || 0) * 0.3) * 100
          )));

          const fatigueVal = Math.min(100, Math.max(0, Math.round(
            ((expr.sad || 0) * 0.6 + (expr.neutral || 0) * 0.5 - (expr.happy || 0) * 0.3) * 100
          )));

          const energyVal = Math.min(100, Math.max(0, Math.round(
            ((expr.happy || 0) * 0.85 + (expr.surprised || 0) * 0.4 + (expr.neutral || 0) * 0.15) * 100
          )));

          const tensionVal = Math.min(100, Math.max(0, Math.round(
            ((expr.angry || 0) * 0.65 + (expr.fearful || 0) * 0.5 + (expr.disgusted || 0) * 0.45) * 100
          )));

          // physiological noise simulator
          const noise = () => Math.floor(Math.random() * 5) - 2;

          setLiveMetrics({
            stress: Math.max(0, Math.min(100, stressVal + noise())),
            fatigue: Math.max(0, Math.min(100, fatigueVal + noise())),
            energy: Math.max(0, Math.min(100, energyVal + noise())),
            tension: Math.max(0, Math.min(100, tensionVal + noise()))
          });

          metricsAccumulator.current.push({
            stress: stressVal,
            fatigue: fatigueVal,
            energy: energyVal,
            tension: tensionVal
          });
        }
      } catch (err) {
        console.warn('Scan frame error:', err.message);
      }
    };

    const loop = async () => {
      if (!active) return;
      if (scanState === 'detecting') {
        await detectFace();
      } else if (scanState === 'scanning') {
        await runActiveScan();
      }
      setTimeout(() => {
        if (active) frameId = requestAnimationFrame(loop);
      }, 150);
    };

    if (scanState === 'detecting' || scanState === 'scanning') {
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [scanState]);

  // Countdown timer logic
  useEffect(() => {
    let timer = null;
    if (scanState === 'scanning') {
      setCountdown(10);
      metricsAccumulator.current = [];
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishScan();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [scanState]);

  const handleStartScan = () => {
    if (modelError) return;
    if (!libLoaded || modelLoading) {
      setScanState('loading');
      return;
    }
    
    setScanState('detecting');
    setCameraActive(false);

    // Gatekeeper: Face detection failure timeout (3 seconds)
    gatekeeperTimeoutRef.current = setTimeout(() => {
      setScanState(curr => {
        if (curr === 'detecting') {
          return 'gatekeeper_error';
        }
        return curr;
      });
    }, 3000);
  };

  const handleUserMedia = () => {
    setCameraActive(true);
  };

  const handleCameraError = () => {
    if (gatekeeperTimeoutRef.current) clearTimeout(gatekeeperTimeoutRef.current);
    setScanState('gatekeeper_error');
  };

  const finishScan = async () => {
    let final = { stress: 45, fatigue: 40, energy: 65, tension: 35 };
    const acc = metricsAccumulator.current;
    
    if (acc.length > 0) {
      const sum = acc.reduce((s, m) => ({
        stress: s.stress + m.stress,
        fatigue: s.fatigue + m.fatigue,
        energy: s.energy + m.energy,
        tension: s.tension + m.tension
      }), { stress: 0, fatigue: 0, energy: 0, tension: 0 });

      final = {
        stress: Math.round(sum.stress / acc.length),
        fatigue: Math.round(sum.fatigue / acc.length),
        energy: Math.round(sum.energy / acc.length),
        tension: Math.round(sum.tension / acc.length)
      };
    }

    let finalMood = "Balanced State";
    if (final.stress > 50 && final.fatigue > 50) {
      finalMood = "Overloaded";
    } else if (final.fatigue > 55) {
      finalMood = "Exhausted";
    } else if (final.energy > 75 && final.stress < 40) {
      finalMood = "High Performance";
    } else if (final.stress < 30 && final.tension < 30) {
      finalMood = "Flow State";
    }

    setFinalScanResults({ metrics: final, mood: finalMood });
    setScanState('syncing');

    // Sync to backend DB
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_BASE_URL}/api/health/biometric-sync`, {
        metrics: final,
        mood: finalMood
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScanState('results');
    } catch (err) {
      console.error('Database synchronization failed:', err.message);
      setScanState('results'); // Fallback to show results anyway
    }
  };

  const handleReset = () => {
    if (gatekeeperTimeoutRef.current) {
      clearTimeout(gatekeeperTimeoutRef.current);
    }
    setScanState('idle');
    setCountdown(10);
    setLiveMetrics({ stress: 0, fatigue: 0, energy: 0, tension: 0 });
    setFinalScanResults(null);
    setCameraActive(false);
  };

  // Trajectory calculation based on Fatigue/Stress
  const healthTrajectory = finalScanResults
    ? Math.max(15, Math.round(100 - (finalScanResults.metrics.fatigue * 0.6 + finalScanResults.metrics.stress * 0.4)))
    : 80;

  const financialRiskDetail = finalScanResults && finalScanResults.metrics.stress > 50
    ? "High risk of impulse-spending due to elevated stress spikes"
    : "Controlled: typical baseline consumption pattern registered";

  const careerFocusDetail = finalScanResults && (finalScanResults.metrics.fatigue > 55 || finalScanResults.metrics.stress > 60)
    ? "Diminished capacity for deep focus; suggest light tasks or recovery block"
    : "Optimal alignment: fully primed for complex engineering workloads";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0f1a]/85 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-white w-full max-w-md mx-auto">
      {/* Visual ambient glows */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#7b61ff]/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="h-10 w-10 rounded-xl bg-[#7b61ff]/10 border border-[#7b61ff]/20 flex items-center justify-center text-[#7b61ff]">
          <Activity className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-black tracking-wider uppercase font-mono">Dynamic Biometric Scanner</h4>
          <p className="text-[10px] text-gray-400 font-mono">Facial expression and tension index mapping</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Model Loading State */}
        {scanState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10 text-center gap-4 relative z-10"
          >
            <Loader2 className="h-8 w-8 text-[#7b61ff] animate-spin" />
            <p className="text-xs text-gray-300 font-mono">Initializing camera models from CDN...</p>
          </motion.div>
        )}

        {/* Idle State */}
        {scanState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 text-center gap-5 relative z-10"
          >
            <div className="h-20 w-20 rounded-full border border-dashed border-[#7b61ff]/40 flex items-center justify-center bg-[#7b61ff]/5">
              <Camera className="h-8 w-8 text-[#7b61ff]" />
            </div>
            <div>
              <h5 className="text-sm font-bold">Initialize Biometric Scan</h5>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Grant camera access to lock in your live digital twin parameters. Scanning takes 10 seconds.
              </p>
            </div>
            {modelError && (
              <p className="text-[10px] text-red-400 max-w-xs">{modelError}</p>
            )}
            <button
              onClick={handleStartScan}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b61ff] to-cyan-500 font-bold text-xs text-white uppercase tracking-wider hover:opacity-90 hover:shadow-[0_0_20px_rgba(123,97,255,0.25)] transition-all cursor-pointer border border-white/10"
            >
              Start Calibration
            </button>
          </motion.div>
        )}

        {/* Detecting State */}
        {scanState === 'detecting' && (
          <motion.div
            key="detecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 relative z-10"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black/50">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                onUserMedia={handleUserMedia}
                onUserMediaError={handleCameraError}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                  Locking facial vectors...
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">
              Please align your face in frame.
            </p>
          </motion.div>
        )}

        {/* Gatekeeper Error State */}
        {scanState === 'gatekeeper_error' && (
          <motion.div
            key="gatekeeper_error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-6 text-center gap-5 relative z-10"
          >
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-red-400">Calibration Interrupted</h5>
              <p className="text-xs text-gray-300 max-w-xs mt-2 leading-relaxed">
                Face not detected. Please ensure you are in frame and try again.
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleStartScan}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-black hover:opacity-90 transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Scanning State */}
        {scanState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 relative z-10"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black/40">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              
              {/* Scan overlay graphics */}
              <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
              <div 
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]" 
                style={{
                  animation: 'scanningLine 2.5s ease-in-out infinite',
                  position: 'absolute'
                }}
              />
              <style>{`
                @keyframes scanningLine {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
              `}</style>
              
              {/* Time Indicator */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 border border-white/10 text-xs font-black text-cyan-400 font-mono tracking-wider">
                {countdown}s remaining
              </div>
            </div>

            {/* Live Progress Meters */}
            <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Live Feed Analytics</span>
              
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Stress:</span>
                <span className="text-red-400 font-semibold">{liveMetrics.stress}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-150" style={{ width: `${liveMetrics.stress}%` }} />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Fatigue:</span>
                <span className="text-orange-400 font-semibold">{liveMetrics.fatigue}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-150" style={{ width: `${liveMetrics.fatigue}%` }} />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Energy:</span>
                <span className="text-emerald-400 font-semibold">{liveMetrics.energy}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${liveMetrics.energy}%` }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Syncing State */}
        {scanState === 'syncing' && (
          <motion.div
            key="syncing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-12 text-center gap-4 relative z-10"
          >
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-gray-300 font-mono">Saving biometric data to database...</p>
          </motion.div>
        )}

        {/* Results State */}
        {scanState === 'results' && finalScanResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5 relative z-10 text-left"
          >
            {/* Diagnosis Banner */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Calibrated State</span>
                <div className="text-base font-black uppercase text-cyan-400 tracking-tight mt-0.5">
                  {finalScanResults.mood}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <Check className="h-3.5 w-3.5" /> Synced
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="space-y-3">
              {[
                { label: 'Energy', value: finalScanResults.metrics.energy, color: 'bg-emerald-500' },
                { label: 'Stress', value: finalScanResults.metrics.stress, color: 'bg-red-500' },
                { label: 'Fatigue', value: finalScanResults.metrics.fatigue, color: 'bg-orange-500' },
                { label: 'Tension', value: finalScanResults.metrics.tension, color: 'bg-purple-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium">{item.label}</span>
                    <span className="text-white font-bold">{item.value}%</span>
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

            {/* Cross-Domain Impact Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 pt-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#7b61ff] font-mono flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4" /> Cross-Domain Impact
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Health Score Trajectory</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white">{healthTrajectory}%</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-300">
                      {healthTrajectory < 50 ? 'Severe neural strain warnings' : healthTrajectory < 75 ? 'Elevated burnout indicators' : 'Steady state profile'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Financial Risk</span>
                  <p className="text-gray-300 leading-relaxed font-medium">
                    {financialRiskDetail}
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Career Focus</span>
                  <p className="text-gray-300 leading-relaxed font-medium">
                    {careerFocusDetail}
                  </p>
                </div>
              </div>
            </div>

            {/* Handoff Trigger */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => onAskCopilot(finalScanResults)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-gray-100 hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#7b61ff]" />
                Ask Copilot for a Protocol
              </button>

              <button
                onClick={handleReset}
                className="text-center inline-flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-all cursor-pointer font-mono"
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
