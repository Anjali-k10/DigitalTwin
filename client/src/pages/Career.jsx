import React from 'react';

const glassCardClass = 'rounded-lg border border-[#d8e5ea] bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur transition hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]';

const careerMetrics = [
  { label: 'Career Stability', value: 88, status: 'Resilient', icon: ShieldIcon, tone: 'primary' },
  { label: 'Productivity Balance', value: 76, status: 'Balanced', icon: BalanceIcon, tone: 'neutral' },
  { label: 'Burnout Risk', value: 24, status: 'Low', icon: PulseIcon, tone: 'primary' },
  { label: 'Roadmap Progress', value: 42, status: 'Phase 2', icon: RouteIcon, tone: 'warm' },
];

const roadmapSteps = [
  { label: 'Month 1', detail: 'HTML/CSS', status: 'Completed', icon: CheckIcon, state: 'done' },
  { label: 'Month 2', detail: 'JavaScript', status: 'In Progress', icon: PlayIcon, state: 'active' },
  { label: 'Month 3', detail: 'React & Next.js', status: 'Upcoming', icon: LockIcon, state: 'locked' },
];

function Career() {
  return (
    <div className="min-h-full bg-[#fbf9f8] px-5 py-6 text-[#1b1c1c] sm:px-6 lg:px-8">
      {/* 1. Dashboard Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c1c]">Career Intelligence</h1>
        <p className="mt-2 text-sm text-[#596467]">
          Monitoring structural risk vectors, milestone velocity, and cross-disciplinary trajectory.
        </p>
      </header>

      {/* 2. Target Metrics Row */}
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careerMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {/* 3. Mid-Section: Roadmap, Warnings, and Cross-Domain Cards */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12 mb-6">
        
        {/* Left Sub-Column (Roadmap + Burnout) */}
        <div className="space-y-6 xl:col-span-8 flex flex-col justify-between">
          {/* AI Learning Roadmap */}
          <article className={`${glassCardClass} p-6 flex-1 flex flex-col justify-between`}>
            <h2 className="text-xl font-semibold mb-8">AI Learning Roadmap</h2>
            <div className="relative flex items-center justify-between w-full px-4 sm:px-12 pb-4">
              <div className="absolute left-16 right-16 top-6 h-1 bg-[#e4e2e1] z-0" />
              <div className="absolute left-16 top-6 h-1 w-[40%] bg-[#416f82] z-0" />
              
              {roadmapSteps.map((step) => (
                <RoadmapStep key={step.label} step={step} />
              ))}
            </div>
          </article>

          {/* Burnout Warning */}
          <article className="rounded-lg border border-[#efcfc5] border-l-4 border-l-[#8b4e3f] bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#8b4e3f]">Burnout Warning</h2>
                <p className="mt-1 text-sm text-[#596467]">Detected anomalous high intensity cycle</p>
              </div>
              <WarningIcon className="h-6 w-6 text-[#8b4e3f] shrink-0" />
            </div>
            <div className="mb-5 rounded-lg border border-[#efcfc5] bg-[#fff1ed] p-4">
              <p className="text-sm italic leading-6 text-[#7a4032]">
                Late-night coding detected for 4 consecutive days. Your cognitive recovery capacity is down 14%.
              </p>
            </div>
            <ProgressBar label="Fatigue Accumulation" value="68%" width="68%" color="#8b4e3f" />
          </article>
        </div>

        {/* Right Sub-Column: Dedicated AI Observation, Suggestion, and Cross-Domain Cards */}
        <aside className="space-y-4 xl:col-span-4 flex flex-col justify-between">
          <ObservationCard 
            icon={MoonIcon} 
            title="AI Observation" 
            detail="Sleep consistency is directly improving coding block speed and structural logic accuracy." 
          />
          <ObservationCard 
            icon={LightIcon} 
            title="AI Suggestion" 
            detail="Shift focus to raw project architecture over certificates to secure market velocity." 
          />
          
          {/* Enhanced Cross-Domain Impact Analysis Card */}
          <article className="rounded-lg border border-[#d8e5ea] bg-white/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)] border-l-4 border-l-[#416f82]">
            <div className="flex items-center gap-2 text-[#416f82] mb-2">
              <SparkIcon className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-[0.14em]">Cross-Domain Analysis</h3>
            </div>
            <p className="text-sm font-semibold text-[#1b1c1c] mb-2">Systemic Ripple Effect Detected</p>
            <p className="text-xs leading-relaxed text-[#596467]">
              Pushing <span className="font-semibold text-[#8b4e3f]">12-hour study blocks</span> forces a high career roadmap velocity, but risks a critical drop in <span className="font-semibold text-amber-700">Health capacity</span> (Sleep debt/Cognitive strain) and drops long-term <span className="font-semibold text-emerald-700">Finance performance</span> due to immediate medical or recovery overhead risks.
            </p>
          </article>
        </aside>
      </section>

      {/* 4. Full-Width Macro Future Trajectory at the very bottom */}
      <section className="w-full">
        <article className={`${glassCardClass} p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Future Trajectory Model</h2>
            <p className="text-sm text-[#596467] mt-1">Predictive matrix showing projected milestones over sustainable vs high-fatigue routes.</p>
          </div>
          <div className="relative h-64 overflow-hidden rounded-lg border border-[#d8e5ea] bg-[#f7fbfc]">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 240">
              {/* Grid Lines */}
              <line x1="0" x2="800" y1="200" y2="200" stroke="#e4e2e1" strokeWidth="1" />
              <line x1="40" x2="40" y1="0" y2="240" stroke="#e4e2e1" strokeWidth="1" />
              
              {/* Trajectory Paths */}
              <path d="M0 180 Q200 130 400 150 T800 210" fill="none" stroke="#8b4e3f" strokeDasharray="7 7" strokeWidth="3" />
              <path d="M0 180 Q250 150 550 60 T800 30" fill="none" stroke="#416f82" strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute right-6 top-6 text-right text-[11px] font-bold uppercase tracking-[0.12em] space-y-1">
              <p className="text-[#416f82] flex items-center justify-end gap-2">
                <span className="h-1.5 w-6 bg-[#416f82] rounded-full inline-block" /> Balanced Growth Path
              </p>
              <p className="text-[#8b4e3f] flex items-center justify-end gap-2 pt-2">
                <span className="h-1.5 w-6 border-b-2 border-dashed border-[#8b4e3f] inline-block" /> Fatigue/Burnout Trajectory
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar label="Sustainable Career Outlook" value="+34%" width="85%" color="#416f82" />
          </div>
        </article>
      </section>
    </div>
  );
}

{/* --- Pure Layout & Structural Sub-Components --- */}

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const tone = metric.tone === 'warm' ? '#8b4e3f' : metric.tone === 'neutral' ? '#5e5e5b' : '#416f82';

  return (
    <article className={`${glassCardClass} p-5 flex flex-col items-center justify-center`}>
      <div className="relative mb-3 h-14 w-14 flex items-center justify-center">
        <ProgressRing value={metric.value} color={tone} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-5 w-5" style={{ color: tone }} />
        </div>
      </div>
      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">{metric.label}</p>
      <p className="text-sm font-semibold" style={{ color: tone }}>{metric.status}</p>
    </article>
  );
}

function RoadmapStep({ step }) {
  const Icon = step.icon;
  const isLocked = step.state === 'locked';

  return (
    <div className={`relative z-10 flex flex-col items-center text-center ${isLocked ? 'opacity-45' : ''}`}>
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ring-8 ring-[#fbf9f8] ${isLocked ? 'bg-[#e4e2e1] text-[#596467]' : 'bg-[#416f82] text-white'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold text-[#1b1c1c]">{step.label}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#596467]/80 mt-0.5">{step.detail}</p>
      <span className={`mt-2 text-[10px] font-bold uppercase tracking-[0.12em] ${isLocked ? 'text-[#596467]' : 'text-[#416f82]'}`}>
        {step.status}
      </span>
    </div>
  );
}

function ProgressRing({ value, color }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
      <circle cx="32" cy="32" fill="none" r={radius} stroke="#e4e2e1" strokeWidth="4" />
      <circle cx="32" cy="32" fill="none" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function ProgressBar({ label, value, width, color }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e4e2e1]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ObservationCard({ icon: Icon, title, detail }) {
  return (
    <article className={`${glassCardClass} flex gap-4 p-4 items-start flex-1 w-full`}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e6f1f4] text-[#416f82]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]/70 mb-0.5">{title}</p>
        <p className="text-xs font-medium leading-relaxed text-[#1b1c1c]">{detail}</p>
      </div>
    </article>
  );
}

{/* --- SVGs --- */}

function IconBase({ className, style, children }) {
  return (
    <svg aria-hidden="true" className={className} style={style} viewBox="0 0 24 24" fill="none">
      {children}
    </svg>
  );
}

function ShieldIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function BalanceIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M12 4v16M5 7h14M7 7l-4 7h8L7 7ZM17 7l-4 7h8l-4-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function PulseIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M4 13h4l2-6 4 10 2-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function RouteIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" /><path d="M8.5 13.5 15.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}

function SparkIcon({ className }) {
  return <IconBase className={className}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function CheckIcon({ className }) {
  return <IconBase className={className}><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function PlayIcon({ className }) {
  return <IconBase className={className}><path d="m8 5 11 7-11 7V5Z" fill="currentColor" /></IconBase>;
}

function LockIcon({ className }) {
  return <IconBase className={className}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function WarningIcon({ className }) {
  return <IconBase className={className}><path d="M12 9v4M12 17h.01M10.3 4.4 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function MoonIcon({ className }) {
  return <IconBase className={className}><path d="M20 15.3A8 8 0 0 1 8.7 4 8.5 8.5 0 1 0 20 15.3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function LightIcon({ className }) {
  return <IconBase className={className}><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1.2.8-1.5 1.8-1.5 3h-5c0-1.2-.3-2.2-1.5-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

export default Career;