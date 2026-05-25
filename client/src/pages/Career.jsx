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

const githubDays = [
  0.2, 0.45, 0.82, 0.6, 0.15, 0.75, 0.35,
  0.92, 0.55, 0.25, 0.7, 0.88, 0.4, 0.18,
  0.5, 0.78, 0.95, 0.62, 0.3, 0.72, 0.42,
  0.86, 0.2, 0.68, 0.9, 0.48, 0.32, 0.8,
  0.58, 0.22, 0.74, 0.96, 0.52, 0.28, 0.65,
];

const focusBars = [20, 30, 78, 100, 88, 42, 20];

function Career() {
  return (
    <div className="min-h-full bg-[#fbf9f8] px-5 py-6 text-[#1b1c1c] sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c1c]">Career Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596467]">
            Optimizing professional growth through recovery, productivity, and learning alignment.
          </p>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-lg bg-[#416f82] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#b8d1da]/50 transition hover:bg-[#2f5362]" type="button">
          <SparkIcon className="h-4 w-4" />
          Analyze Next Step
        </button>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careerMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <article className={`${glassCardClass} p-6 sm:p-8`}>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">AI Learning Roadmap</h2>
                <p className="mt-1 text-sm text-[#596467]">Frontend developer path - Advanced React focus</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#596467]">Adaptive Mode</span>
                <button className="relative h-6 w-12 rounded-full bg-[#c8dbe2] p-1" type="button" aria-label="Adaptive mode enabled">
                  <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#416f82]" />
                </button>
              </div>
            </div>

            <div className="relative overflow-x-auto pb-2">
              <div className="absolute left-12 right-12 top-6 h-1 bg-[#e4e2e1]" />
              <div className="absolute left-12 top-6 h-1 w-[45%] bg-[#416f82]" />
              <div className="relative z-10 grid min-w-[560px] grid-cols-3 gap-8">
                {roadmapSteps.map((step) => (
                  <RoadmapStep key={step.label} step={step} />
                ))}
              </div>
            </div>
          </article>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-[#efcfc5] border-l-4 border-l-[#8b4e3f] bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#8b4e3f]">Burnout Warning</h2>
                  <p className="mt-1 text-sm text-[#596467]">Detected high intensity cycle</p>
                </div>
                <WarningIcon className="h-6 w-6 text-[#8b4e3f]" />
              </div>
              <div className="mb-6 rounded-lg border border-[#efcfc5] bg-[#fff1ed] p-4">
                <p className="text-sm italic leading-6 text-[#7a4032]">
                  Late-night coding detected for 4 consecutive days. Your cognitive recovery is down 14%.
                </p>
              </div>
              <ProgressBar label="Fatigue Accumulation" value="68%" width="68%" color="#8b4e3f" />
              <button className="mt-6 w-full rounded-lg border border-[#8b4e3f] px-4 py-3 text-sm font-semibold text-[#8b4e3f] transition hover:bg-[#fff1ed]" type="button">
                Schedule Recovery Block
              </button>
            </article>

            <article className={`${glassCardClass} p-6`}>
              <h2 className="mb-6 text-xl font-semibold">GitHub Consistency</h2>
              <div className="grid grid-cols-7 gap-2">
                {githubDays.map((opacity, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-sm bg-[#416f82]"
                    style={{ opacity: opacity < 0.25 ? 0.08 : opacity }}
                  />
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <StatBlock label="Avg. Study Hours" value="4.2" suffix="h/day" />
                <StatBlock label="Lines of Logic" value="1.8k" suffix="w/avg" />
              </div>
            </article>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">AI Observations</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ObservationCard icon={MoonIcon} title="Sleep consistency improving coding efficiency" detail="Observed last 7 days" />
              <ObservationCard icon={BookIcon} title="Project-based learning improves retention" detail="Confidence up 22%" />
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <article className={`${glassCardClass} p-6`}>
            <h2 className="mb-6 text-xl font-semibold">Peak Focus Zone</h2>
            <div className="mb-4 flex h-32 items-end justify-between gap-1">
              {focusBars.map((height, index) => (
                <div
                  key={height}
                  className={`w-full rounded-t-sm ${index === 3 ? 'bg-[#416f82] shadow-[0_-4px_10px_rgba(65,111,130,0.2)]' : index === 2 || index === 4 ? 'bg-[#c8dbe2]' : 'bg-[#e4e2e1]'}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-[#596467]">
              <span>8 AM</span>
              <span className="text-[#416f82]">10 AM - 1 PM</span>
              <span>4 PM</span>
            </div>
            <p className="mt-6 border-t border-[#d8e5ea] pt-6 text-sm leading-6 text-[#424842]">
              Your cognitive load is most resilient during these hours. Protect this time for deep architecture work.
            </p>
          </article>

          <article className="rounded-lg border border-[#416f82] bg-[#416f82] p-6 text-white shadow-[0_10px_30px_rgba(65,111,130,0.22)]">
            <h2 className="mb-6 text-xl font-semibold">AI Recommendations</h2>
            <div className="space-y-6">
              <Recommendation icon={LightIcon} title="Prioritize Portfolio" detail="Shift focus from certificates to building 2 complex React projects." />
              <Recommendation icon={LeafIcon} title="Micro-Breaks" detail="Insert a 5-minute walk every 90 minutes to sustain output after 3 PM." />
            </div>
          </article>

          <article className={`${glassCardClass} p-6`}>
            <h2 className="mb-6 text-xl font-semibold">Future Trajectory</h2>
            <div className="relative h-48 overflow-hidden rounded-lg border border-[#d8e5ea] bg-[#f7fbfc]">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 420 210">
                <line x1="0" x2="420" y1="178" y2="178" stroke="#e4e2e1" strokeWidth="1" />
                <line x1="22" x2="22" y1="0" y2="210" stroke="#e4e2e1" strokeWidth="1" />
                <path d="M0 160 Q100 120 200 140 T420 184" fill="none" stroke="#8b4e3f" strokeDasharray="7 7" strokeWidth="3" />
                <path d="M0 160 Q145 138 315 42" fill="none" stroke="#416f82" strokeLinecap="round" strokeWidth="4" />
              </svg>
              <div className="absolute right-4 top-5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                <p className="text-[#416f82]">Balanced Path</p>
                <p className="mt-12 text-[#8b4e3f]">Burnout Risk</p>
              </div>
            </div>
            <div className="mt-6">
              <ProgressBar label="Sustainable Growth" value="+34%" width="85%" color="#416f82" />
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const tone = getTone(metric.tone);

  return (
    <article className={`${glassCardClass} p-5 text-center`}>
      <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center">
        <ProgressRing value={metric.value} color={tone.color} />
        <Icon className="absolute h-5 w-5" style={{ color: tone.color }} />
      </div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">{metric.label}</p>
      <p className="text-sm font-semibold" style={{ color: tone.color }}>{metric.status}</p>
    </article>
  );
}

function RoadmapStep({ step }) {
  const Icon = step.icon;
  const isLocked = step.state === 'locked';

  return (
    <div className={`flex flex-col items-center text-center ${isLocked ? 'opacity-45 grayscale' : ''}`}>
      <div className={`mb-4 grid h-12 w-12 place-items-center rounded-full ring-8 ring-[#fbf9f8] ${isLocked ? 'bg-[#e4e2e1] text-[#596467]' : 'bg-[#416f82] text-white'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold">{step.label}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]/60">{step.detail}</p>
      <span className={`mt-2 text-[10px] font-bold uppercase tracking-[0.12em] ${isLocked ? 'text-[#596467]' : 'text-[#416f82]'}`}>
        {step.status}
      </span>
    </div>
  );
}

function ProgressRing({ value, color }) {
  const radius = 28;
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
        <div className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function StatBlock({ label, value, suffix }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]/70">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        <span className="ml-1 text-sm font-medium text-[#596467]">{suffix}</span>
      </p>
    </div>
  );
}

function ObservationCard({ icon: Icon, title, detail }) {
  return (
    <article className={`${glassCardClass} flex items-start gap-4 p-5`}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e6f1f4] text-[#416f82]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-6">{title}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]/60">{detail}</p>
      </div>
    </article>
  );
}

function Recommendation({ icon: Icon, title, detail }) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-75" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 opacity-80">{detail}</p>
      </div>
    </div>
  );
}

function getTone(tone) {
  if (tone === 'warm') return { color: '#8b4e3f' };
  if (tone === 'neutral') return { color: '#5e5e5b' };
  return { color: '#416f82' };
}

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

function BookIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M8 7h8M8 11h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
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

function LeafIcon({ className }) {
  return <IconBase className={className}><path d="M5 19c9 1 14-4 15-14C10 6 5 10 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 19c3-5 7-8 12-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}

export default Career;
