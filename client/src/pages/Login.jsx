import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import BackgroundBeams from '../components/BackgroundBeams';
import DigitalTwinLogo from '../components/DigitalTwinLogo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      const { token, user } = response.data.data;

      toast.success('Login successful!');
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#223946] text-slate-950">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            borderRadius: '0.5rem',
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
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-[#223946] px-4 py-4 text-white sm:px-6">
        <BackgroundBeams />

        <div className="relative z-10 flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/18 bg-white/[0.015] px-5 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-white/10 backdrop-blur-[3px] sm:px-8">
          <div className="mx-auto mb-3 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 shadow-xl shadow-black/20 backdrop-blur">
            <DigitalTwinLogo className="h-8 w-8 rounded-full shadow-sm" />
            <span className="text-sm font-medium text-slate-200">DigitalTwin</span>
          </div>

          <h1 className="mx-auto mb-2 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Welcome back
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            Continue into your adaptive DigitalTwin dashboard for health, finance, career, wellness, and daily intelligence.
          </p>

          <div className="mx-auto mt-5 w-full max-w-xl rounded-2xl border border-[#e5e7eb] bg-[white] p-5 text-left shadow-xl shadow-black/25 sm:p-6">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Sign in to DigitalTwin</h2>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#6f9aaa] focus:bg-[white] focus:ring-4 focus:ring-[#7aa6b5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#3f6f82] focus:ring-[#7aa6b5]"
                  />
                  Remember me
                </label>
                <a href="#forgot-password" className="font-medium text-[#416f82] hover:text-[#2f5362]">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5f8fa0] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5f8fa0]/30 transition hover:bg-[#416f82] focus:outline-none focus:ring-4 focus:ring-[#7aa6b5]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#fbfbfb] px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-[white] focus:outline-none focus:ring-4 focus:ring-[#7aa6b5]/15"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-bold text-slate-700">
                G
              </span>
              Sign in with Google
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              New to DigitalTwin?{' '}
              <Link to="/signup" className="font-semibold text-[#416f82] hover:text-[#2f5362]">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
