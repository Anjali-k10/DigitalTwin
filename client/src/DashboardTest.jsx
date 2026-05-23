import React, { useState } from 'react';

export default function DashboardTest() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            DigitalTwin Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tailwind CSS Configuration Test
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
          {['overview', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: AI Models */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                AI Models
              </h3>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse-soft"></div>
            </div>
            <p className="text-3xl font-bold text-primary-500 mb-2">12</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active models running
            </p>
            <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 rounded px-3 py-2">
              <span className="text-xs font-medium text-primary-600 dark:text-primary-300">
                ✓ All systems operational
              </span>
            </div>
          </div>

          {/* Card 2: Data Processed */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Data Processed
              </h3>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              2.4M
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Records this month
            </p>
            <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary-600 rounded-full"></div>
            </div>
          </div>

          {/* Card 3: Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Performance
              </h3>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              98.5%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uptime this week
            </p>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 bg-green-200 dark:bg-green-900/40 rounded-sm hover:bg-green-300 dark:hover:bg-green-800/60 transition-colors"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feature Showcase Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Tailwind Features Demo
          </h2>

          {/* Button Styles */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              Button Styles
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                Primary Button
              </button>
              <button className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
                Secondary Button
              </button>
              <button className="px-6 py-2 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors font-medium">
                Outline Button
              </button>
              <button className="px-6 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors font-medium">
                Text Button
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              Color Palette
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { name: 'Primary', color: 'bg-primary-500' },
                { name: 'Dark 700', color: 'bg-slate-700' },
                { name: 'Dark 800', color: 'bg-slate-800' },
                { name: 'Slate 400', color: 'bg-slate-400' },
                { name: 'Green', color: 'bg-green-500' },
                { name: 'Blue', color: 'bg-blue-500' },
                { name: 'Red', color: 'bg-red-500' },
              ].map((palette) => (
                <div key={palette.name} className="flex flex-col items-center">
                  <div className={`w-full aspect-square ${palette.color} rounded-lg shadow-md mb-2`}></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {palette.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive Grid Demo */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              Responsive Layout
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Column 1', 'Column 2', 'Column 3', 'Column 4'].map((col, i) => (
                <div
                  key={i}
                  className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700/50 text-center font-medium text-primary-600 dark:text-primary-400"
                >
                  {col}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-primary-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">🎉 Tailwind CSS is Ready!</h3>
          <p className="text-primary-100 mb-4">
            Your DigitalTwin SaaS dashboard is now powered by Tailwind CSS with full utility support, dark mode, and modern SaaS styling.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
              ✓ Responsive Design
            </span>
            <span className="inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
              ✓ Dark Mode Support
            </span>
            <span className="inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
              ✓ Custom Colors & Shadows
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
