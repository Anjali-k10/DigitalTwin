import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import BackgroundBeams from '../components/BackgroundBeams';
import DigitalTwinLogo from '../components/DigitalTwinLogo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const signalStats = [
  { label: 'Health', value: 84, bar: 92 },
  { label: 'Finance', value: 71, bar: 74 },
  { label: 'Career', value: 78, bar: 82 },
];

const nextBestMoves = [
  'Protect a 45-minute focus block before noon.',
  'Reduce late-night screen exposure tonight.',
  'Maintain current productivity rhythm.',
  'Financial stress levels remain stable.',
];

const morphingWords = ['Health', 'Finance', 'Career', 'Digital Twin'];

function MorphingText({ words = morphingWords, duration = 2800, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % words.length);
    }, duration);

    return () => window.clearInterval(interval);
  }, [duration, words.length]);

  return (
    <div className={`relative inline-block min-h-[4.75rem] perspective-[900px] ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9, rotateX: -85 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.08, rotateX: 85 }}
          transition={{
            duration: 0.75,
            ease: [0.25, 0.46, 0.45, 0.94],
            filter: { duration: 0.55 },
            scale: { duration: 0.55 },
            rotateX: { duration: 0.75 },
          }}
          className="whitespace-nowrap bg-gradient-to-r from-[#f7fbfc] via-[#b9d5de] to-[#6f9bad] bg-clip-text text-5xl font-bold leading-tight text-transparent xl:text-6xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {words[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(signalStats.map(() => 0));
  const [barsReady, setBarsReady] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const duration = 2200;
    const startTime = performance.now();
    let animationFrame;

    const animateCounters = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats(signalStats.map((stat) => Math.round(stat.value * easedProgress)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCounters);
      }
    };

    animationFrame = requestAnimationFrame(animateCounters);
    const barTimer = window.setTimeout(() => setBarsReady(true), 420);
    const suggestionTimer = window.setInterval(() => {
      setSuggestionIndex((current) => (current + 1) % nextBestMoves.length);
    }, 3600);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(barTimer);
      window.clearInterval(suggestionTimer);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters');
      return false;
    }

    if (lastName.trim().length < 2) {
      toast.error('Last name must be at least 2 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      const { token, user } = response.data.data;

      toast.success('Account created successfully!');
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setTimeout(() => {
        navigate('/onboarding');
      }, 500);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#223946] px-5 py-5 text-zinc-950">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            style: {
              background: '#10b981',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
      <BackgroundBeams className="opacity-90" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-5xl grid-cols-1 overflow-hidden rounded-[24px] border border-white/16 bg-white/[0.003] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_22px_58px_rgba(0,0,0,0.22)] ring-1 ring-white/5 backdrop-blur-[5px] lg:grid-cols-[0.78fr_1.22fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-6 pb-20 pt-6 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-[#223946]/10" />
          <div className="relative z-20">
            <Link to="/" className="mb-4 flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 shadow-xl shadow-black/20 backdrop-blur">
              <DigitalTwinLogo className="h-8 w-8 rounded-full shadow-sm" />
              <span className="text-xs font-semibold">DigitalTwin</span>
            </Link>

            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c7dde5]">
              Signal intelligence
            </p>
            <h1 className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-tight">
              Your profile starts by connecting real life patterns.
            </h1>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[43%] z-10 flex -translate-y-1/2 justify-center px-6 text-center">
            <MorphingText />
          </div>

          <div className="relative z-20 grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              {signalStats.map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/12 bg-white/[0.08] p-2 text-left shadow-xl shadow-black/15 backdrop-blur-xl"
                >
                  <p className="text-[11px] text-[#d9e8ed]">{item.label}</p>
                  <p className="mt-0.5 text-base font-semibold tabular-nums text-white">
                    {animatedStats[index]}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all duration-[2200ms] ease-out"
                      style={{
                        width: barsReady ? `${item.bar}%` : '0%',
                        transitionDelay: `${index * 140}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/12 bg-white/[0.08] p-3 text-left shadow-xl shadow-black/15 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white">Next best move</p>
                <span className="h-2 w-2 rounded-full bg-[#b7f7d4] shadow-[0_0_18px_rgba(183,247,212,0.8)]" />
              </div>
              <p key={suggestionIndex} className="mt-1 min-h-8 text-xs leading-4 text-[#d9e8ed] signup-suggestion-fade">
                {nextBestMoves[suggestionIndex]}
              </p>
            </div>
          </div>

        </section>

        <section className="flex items-center justify-center px-5 py-5 sm:px-7">
          <div className="w-full max-w-[30rem] rounded-[22px] border border-[#e5e7eb] bg-[white] p-5 text-zinc-950 shadow-2xl shadow-black/25 sm:p-6">
            <div className="w-full">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3 lg:hidden">
                <DigitalTwinLogo className="h-10 w-10 rounded-full border border-[#d8e5ea] shadow-sm" />
                <span className="font-semibold">DigitalTwin</span>
              </Link>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-[#416f82]">Create your account</p>
              <h2 className="mt-1.5 text-[2rem] font-semibold leading-none tracking-tight">
                Get started
              </h2>
              <p className="mt-2 text-sm text-stone-700">Set up your private workspace in seconds.</p>
            </div>

            <form className="space-y-2.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    First Name
                  </span>
                  <input
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Anjali"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Last Name
                  </span>
                  <input
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Kumari"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Password
                  </span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="8+ characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Confirm
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword}
                className="w-full rounded-xl bg-[#5f8fa0] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5f8fa0]/30 transition hover:-translate-y-0.5 hover:bg-[#416f82] focus:outline-none focus:ring-4 focus:ring-[#7aa6b5]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-xs font-medium uppercase text-zinc-400">or</span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-[white] focus:outline-none focus:ring-4 focus:ring-[#7aa6b5]/15"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs font-bold">
                G
              </span>
              Continue with Google
            </button>

            <p className="mt-3 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/" className="font-semibold text-[#416f82] transition hover:text-[#2f5362]">
                Log in
              </Link>
            </p>

            <p className="mt-2 text-center text-xs leading-5 text-zinc-400">
              By signing up, you agree to DigitalTwin&apos;s Terms and Privacy Policy.
            </p>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;
