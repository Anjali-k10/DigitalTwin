const healthMetrics = [
  { label: 'Recovery', value: 88, status: 'Stable', tone: 'primary', icon: HeartPulseIcon },
  { label: 'Sleep Quality', value: 92, status: 'Peak', tone: 'warm', icon: MoonIcon },
  { label: 'Stress', value: 58, status: 'Moderate', tone: 'neutral', icon: BalanceIcon },
  { label: 'Hydration', value: 75, status: 'Needs attention', tone: 'sky', icon: DropIcon },
  { label: 'Movement', value: 82, status: 'Active', tone: 'primary', icon: RunIcon },
];

const tobaccoBars = [80, 65, 90, 50, 40, 30, 25];
const consistencyDays = [
  'bg-[#416f82]/90', 'bg-[#416f82]/55', 'bg-[#d98b72]/65', 'bg-[#416f82]/75', 'bg-[#416f82]/25', 'bg-[#416f82]/70', 'bg-[#d98b72]/80',
  'bg-[#416f82]/35', 'bg-[#416f82]/80', 'bg-[#416f82]/65', 'bg-[#d98b72]/45', 'bg-[#416f82]/90', 'bg-[#416f82]/50', 'bg-[#416f82]/20',
  'bg-[#416f82]/75', 'bg-[#d98b72]/60', 'bg-[#416f82]/85', 'bg-[#416f82]/55', 'bg-[#416f82]/35', 'bg-[#d98b72]/75', 'bg-[#416f82]/90',
  'bg-[#416f82]/45', 'bg-[#416f82]/70', 'bg-[#d98b72]/45', 'bg-[#416f82]/80', 'bg-[#416f82]/60', 'bg-[#416f82]/30', 'bg-[#d98b72]/70',
  'bg-[#416f82]/85', 'bg-[#416f82]/50', 'bg-[#416f82]/75',
];
const glassCardClass = 'rounded-lg border border-[#d8e5ea] bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur transition hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]';

function Health() {
  return (
    <div className="min-h-full bg-[#fbf9f8] px-5 py-6 text-[#1b1c1c] sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          {/* <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5f8fa0]/75">
            <span>Health</span>
            <span>/</span>
            <span className="text-[#416f82]">Intelligence</span>
          </div> */}
          <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c1c]">Health Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596467]">
            Recovery, sleep, stress, movement, and adaptive wellness signals for today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill icon={ThermoIcon} label="Bio-status: Restoring" />
          <StatusPill icon={CloudIcon} label="22°C local weather" />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {healthMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} xl:col-span-8`}>
          <div className="relative overflow-hidden rounded-lg border border-[#d8e5ea] bg-gradient-to-br from-[#eef6f8] via-white to-[#fbf9f8] p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-56 w-56 -translate-y-16 translate-x-16 rounded-full bg-[#b8d1da]/30 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#416f82] opacity-70" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#416f82]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#416f82]">Adaptive wellness mode active</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#1b1c1c] lg:text-4xl">
                Today’s focus has been recalibrated for recovery.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#596467]">
                Your recovery trend indicates early fatigue. Study target shifts from <span className="text-[#9a9f9c] line-through">8h</span> to{' '}
                <span className="font-semibold text-[#416f82]">5h</span> to protect long-term balance.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MiniPill icon={AutoIcon} label="Auto-goal shifting" />
                <MiniPill icon={MindIcon} label="Burnout awareness" />
                <MiniPill icon={RepeatIcon} label="Cycle support" />
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#efcfc5] bg-[#fff1ed] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)] xl:col-span-4">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#8b4e3f]">Period Wellness</h3>
            <FemaleIcon className="h-5 w-5 text-[#8b4e3f]" />
          </div>
          <div className="space-y-4">
            <WellnessLine icon={LowImpactIcon} text="Avoid high-intensity workouts today; prioritize mobility." />
            <WellnessLine icon={DropIcon} text="Increase hydration target to 3L to manage retention." />
            <WellnessLine icon={MealIcon} text="Prioritize iron-rich foods for energy stability." />
          </div>
          <div className="mt-6 rounded-lg border border-white/70 bg-white/55 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b4e3f]/70">Next phase</p>
            <p className="mt-1 text-base font-semibold text-[#380d04]">Follicular phase in 3 days</p>
          </div>
        </article>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-4`}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tobacco Reduction</h3>
            <span className="rounded-md bg-[#ddf5e5] px-2 py-1 text-[10px] font-bold text-[#247044]">-15% WK</span>
          </div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold">3</span>
            <span className="text-sm text-[#596467]">units / avg daily</span>
          </div>
          <div className="mb-5 flex h-32 items-end gap-2">
            {tobaccoBars.map((height, index) => (
              <div key={height + index} className="flex-1 rounded-t-lg bg-[#416f82]/20">
                <div
                  className="w-full rounded-t-lg bg-[#416f82]"
                  style={{ height: `${height}%`, opacity: 0.35 + index * 0.08 }}
                />
              </div>
            ))}
          </div>
          <Observation text="Late-night stress periods increase frequency. Aim for tea instead." />
        </article>

        <article className={`${glassCardClass} relative overflow-hidden p-6 xl:col-span-8`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(65,111,130,0.14),transparent_34%),linear-gradient(135deg,rgba(34,57,70,0.05),transparent_60%)]" />
          <div className="relative">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Sleep Intelligence</h3>
                <p className="mt-1 text-sm text-[#596467]">Last night: 7h 42m • Deep sleep 22%</p>
              </div>
              <button className="w-fit rounded-lg bg-[#e6f1f4] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#416f82]" type="button">
                Analyze trends
              </button>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <ProgressStat label="Consistency" value="85%" width="85%" tone="#8b4e3f" />
              <ProgressStat label="REM recovery" value="72%" width="72%" tone="#416f82" />
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">Bedtime drift</p>
                <div className="flex items-center gap-2 text-[#8b4e3f]">
                  <WarningIcon className="h-4 w-4" />
                  <span className="font-semibold">+42m</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg border border-[#d8e5ea] bg-white/70 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#ffdad2]/70 text-[#8b4e3f]">
                <MoonIcon className="h-6 w-6" />
              </div>
              <p className="text-sm italic leading-6 text-[#424842]">
                Late-night coding sessions after 11 PM are reducing REM recovery quality by 18%. Switch to non-screen activities by 10:30 PM tonight.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-7`}>
          <h3 className="mb-5 text-lg font-semibold">Future Recovery Trajectory</h3>
          <div className="relative mb-5 h-52 overflow-hidden rounded-lg border border-[#d8e5ea] bg-[#f7fbfc]">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 640 220">
              <path d="M0 120 Q110 92 210 132 T430 170 T640 188" fill="none" opacity="0.5" stroke="#8b4e3f" strokeDasharray="8 8" strokeWidth="3" />
              <path d="M0 126 Q120 82 225 66 T430 48 T640 32" fill="none" stroke="#416f82" strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute right-4 top-4 space-y-2 text-xs font-medium">
              <Legend color="#416f82" label="Recommended path" />
              <Legend color="#8b4e3f" label="Current path" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <PathCard tone="primary" title="Recovery path" text="Balanced recovery, stable productivity, and stronger metabolic health." />
            <PathCard tone="warm" title="Current path" text="Rising fatigue and possible burnout pressure by next Thursday." />
          </div>
        </article>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <article className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-[#2f83b7] shadow-sm">
                  <DropIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2f83b7]">Hydration</p>
                  <p className="text-xl font-semibold">2.2L / 3.0L</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-[#1d5f86]">Hot weather detected.</p>
                <p className="text-[#2f83b7]">Drink +800ml today.</p>
              </div>
            </div>
          </article>

          <article className={`${glassCardClass} flex-1 p-6`}>
            <h3 className="mb-4 text-lg font-semibold">Wellness Recommendations</h3>
            <div className="space-y-3">
              <Recommendation icon={StretchIcon} title="Posture Correction" detail="3 min stretch for lower back" />
              <Recommendation icon={AirIcon} title="Breathing Exercise" detail="Calm focus: 4-7-8 method" />
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-8`}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Observations Feed</h3>
            <SparkIcon className="h-5 w-5 text-[#416f82]" />
          </div>
          <div className="space-y-5">
            <FeedItem color="#416f82" title="Recovery Pattern" text="Your physical recovery score improves by 12% on days when midnight deep-work sessions are reduced." />
            <FeedItem color="#8b4e3f" title="Mood Correlation" text="Higher hydration levels correlate with a lower self-reported evening stress score." />
          </div>
        </article>

        <article className={`${glassCardClass} p-6 xl:col-span-4`}>
          <h3 className="mb-5 text-lg font-semibold">Daily Consistency</h3>
          <div className="grid grid-cols-7 gap-2">
            {consistencyDays.map((className, index) => (
              <div key={index} className={`aspect-square rounded-md ${className}`} />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-[#416f82]" />
              <span className="text-sm font-semibold">14 Day Streak</span>
            </div>
            <button className="text-xs font-bold uppercase tracking-[0.12em] text-[#416f82] underline" type="button">
              View calendar
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const tone = getTone(metric.tone);

  return (
    <article className="rounded-lg border border-[#d8e5ea] bg-white/80 p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur transition hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
      <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-[#f0eded]">
        <ProgressRing value={metric.value} color={tone.color} />
      </div>
      <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: tone.bg, color: tone.color }}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#596467]">{metric.label}</h3>
      <p className="mt-1 text-sm font-semibold" style={{ color: tone.color }}>{metric.status}</p>
    </article>
  );
}

function ProgressRing({ value, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" fill="none" r={radius} stroke="#e4e2e1" strokeWidth="7" />
        <circle cx="44" cy="44" fill="none" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="7" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{value}%</div>
    </div>
  );
}

function StatusPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#d8e5ea] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#416f82] shadow-sm">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function MiniPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#d8e5ea] bg-white/70 px-4 py-2 text-sm font-medium text-[#424842]">
      <Icon className="h-4 w-4 text-[#416f82]" />
      <span>{label}</span>
    </div>
  );
}

function WellnessLine({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#8b4e3f]" />
      <p className="text-sm leading-6 text-[#6f3729]">{text}</p>
    </div>
  );
}

function Observation({ text }) {
  return (
    <div className="rounded-lg bg-[#f0eded] p-4">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#596467]">
        <LightIcon className="h-4 w-4" />
        Observation
      </div>
      <p className="text-sm leading-6 text-[#596467]">{text}</p>
    </div>
  );
}

function ProgressStat({ label, value, width, tone }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e4e2e1]">
          <div className="h-full rounded-full" style={{ width, backgroundColor: tone }} />
        </div>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-[#596467]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function PathCard({ tone, title, text }) {
  const styles = tone === 'primary'
    ? 'border-[#c8dbe2] bg-[#eef6f8] text-[#416f82]'
    : 'border-[#efcfc5] bg-[#fff1ed] text-[#8b4e3f]';

  return (
    <div className={`rounded-lg border p-4 ${styles}`}>
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">{title}</h4>
      <p className="text-sm leading-6 text-[#596467]">{text}</p>
    </div>
  );
}

function Recommendation({ icon: Icon, title, detail }) {
  return (
    <button className="group flex w-full items-center gap-4 rounded-lg p-3 text-left transition hover:bg-[#f0eded]" type="button">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f1f4] text-[#416f82]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-[#596467]">{detail}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-[#596467] opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

function FeedItem({ color, title, text }) {
  return (
    <div className="flex gap-4">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <p className="text-sm leading-6 text-[#596467]">
        <span className="font-semibold text-[#1b1c1c]">{title}:</span> {text}
      </p>
    </div>
  );
}

function getTone(tone) {
  const tones = {
    primary: { color: '#416f82', bg: '#e6f1f4' },
    warm: { color: '#8b4e3f', bg: '#ffdad2' },
    neutral: { color: '#596467', bg: '#f0eded' },
    sky: { color: '#2f83b7', bg: '#e0f2fe' },
  };

  return tones[tone] || tones.primary;
}

function IconBase({ className, children }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
      {children}
    </svg>
  );
}

function HeartPulseIcon({ className }) {
  return <IconBase className={className}><path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6A4.4 4.4 0 0 1 11 5.8l1 1.1 1-1.1a4.4 4.4 0 0 1 7.8 2.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M7 12h2l1.2-2.5 2.2 5 1.5-2.5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function MoonIcon({ className }) {
  return <IconBase className={className}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a7 7 0 1 0 11.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function BalanceIcon({ className }) {
  return <IconBase className={className}><path d="M12 4v16M6 7h12M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function DropIcon({ className }) {
  return <IconBase className={className}><path d="M12 3s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function RunIcon({ className }) {
  return <IconBase className={className}><path d="M13 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 22l1-5-3-2-2 3M18 22l-3-5 1-5-3-2-2 3-4-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ThermoIcon({ className }) {
  return <IconBase className={className}><path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}

function CloudIcon({ className }) {
  return <IconBase className={className}><path d="M7 18h10a4 4 0 0 0 .4-7.98A6 6 0 0 0 6.1 8.2 5 5 0 0 0 7 18Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function AutoIcon({ className }) {
  return <IconBase className={className}><path d="m12 3 1.7 4.6L18 9.3l-4.3 1.7L12 16l-1.7-5L6 9.3l4.3-1.7L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function MindIcon({ className }) {
  return <IconBase className={className}><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1.2.8-1.5 1.8-1.5 3h-5c0-1.2-.3-2.2-1.5-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function RepeatIcon({ className }) {
  return <IconBase className={className}><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function FemaleIcon({ className }) {
  return <IconBase className={className}><path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 13v8M8.5 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}

function LowImpactIcon({ className }) {
  return <IconBase className={className}><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /></IconBase>;
}

function MealIcon({ className }) {
  return <IconBase className={className}><path d="M6 3v8M9 3v8M6 7h3M17 3v18M14 7c0-2.2 1.4-4 3-4v8c-1.6 0-3-1.8-3-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function LightIcon({ className }) {
  return <IconBase className={className}><path d="M9 18h6M10 22h4M8.5 14.5a5.5 5.5 0 1 1 7 0c-.9.7-1.2 1.4-1.3 2.5H9.8c-.1-1.1-.4-1.8-1.3-2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function WarningIcon({ className }) {
  return <IconBase className={className}><path d="M12 9v4M12 17h.01M10.3 4.4 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function StretchIcon({ className }) {
  return <IconBase className={className}><path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 22l3-7 3-3 4 3 2 7M3 12l5-2 3 2 3-4 5 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function AirIcon({ className }) {
  return <IconBase className={className}><path d="M4 8h10a3 3 0 1 0-3-3M4 14h14a3 3 0 1 1-3 3M4 20h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}

function ChevronRightIcon({ className }) {
  return <IconBase className={className}><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function SparkIcon({ className }) {
  return <IconBase className={className}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function BoltIcon({ className }) {
  return <IconBase className={className}><path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

export default Health;
