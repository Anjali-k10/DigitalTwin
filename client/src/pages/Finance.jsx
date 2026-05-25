const glassCardClass = 'rounded-lg border border-[#d8e5ea] bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur transition hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]';

const overviewMetrics = [
  {
    label: 'Financial Stability',
    value: '82%',
    detail: '+2.4% this month',
    tone: 'primary',
    icon: ShieldIcon,
    ring: 82,
  },
  {
    label: 'Savings Consistency',
    value: 'Peak',
    detail: '12-day active streak',
    tone: 'primary',
    bar: 100,
  },
  {
    label: 'Spending Balance',
    value: 'Balanced',
    detail: 'Allocated: $3,420 / $4,500',
    tone: 'neutral',
    segments: true,
  },
  {
    label: 'Stress Spending',
    value: 'Rising',
    detail: 'Anomaly detected',
    tone: 'warm',
    spark: [18, 42, 34, 66, 78, 92],
  },
];

const consistencyDays = [
  'bg-[#416f82]', 'bg-[#416f82]', 'bg-[#e4e2e1]', 'bg-[#416f82]', 'bg-[#d98b72]', 'bg-[#416f82]', 'bg-[#416f82]/70',
  'bg-[#416f82]/80', 'bg-[#416f82]', 'bg-[#416f82]/60', 'bg-[#d98b72]', 'bg-[#416f82]', 'bg-[#e4e2e1]', 'bg-[#416f82]/80',
  'bg-[#416f82]', 'bg-[#416f82]/70', 'bg-[#d98b72]/80', 'bg-[#416f82]', 'bg-[#416f82]', 'bg-[#416f82]/60', 'bg-[#e4e2e1]',
  'bg-[#416f82]/80', 'bg-[#d98b72]', 'bg-[#416f82]', 'bg-[#416f82]/70', 'bg-[#416f82]', 'bg-[#e4e2e1]', 'bg-[#416f82]',
];

function Finance() {
  return (
    <div className="min-h-full bg-[#fbf9f8] px-5 py-6 text-[#1b1c1c] sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          {/* <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5f8fa0]/75">
            <span>Finance</span>
            <span>/</span>
            <span className="text-[#416f82]">Intelligence</span>
          </div> */}
          <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c1c]">Finance Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596467]">
            Spending behavior, savings rhythm, stress purchases, and future financial trajectory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill icon={WalletIcon} label="Savings shield active" />
          <StatusPill icon={TrendIcon} label="Cashflow stable" />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <OverviewCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-8`}>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Unusual Spending Spike Detector</h2>
              <p className="mt-1 text-sm text-[#596467]">AI behavioral anomaly detection</p>
            </div>
            <span className="w-fit rounded-full bg-[#ffdad2] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a4032]">
              Action recommended
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-[#8b4e3f] bg-[#f5f3f2] p-4">
                <div className="flex items-start gap-3">
                  <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#8b4e3f]" />
                  <div>
                    <p className="text-base font-semibold">Weekend food delivery spending increased 28%</p>
                    <p className="mt-1 text-sm leading-6 text-[#596467]">
                      This spike correlates with a 15% reduction in sleep consistency during the same period.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <MiniStat label="Avg. delivery cost" value="$42.50" delta="+12.40" />
                <MiniStat label="Trigger window" value="11 PM - 1 AM" />
              </div>
            </div>

            <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-lg border border-[#d8e5ea] bg-[#f0eded]">
              <div className="absolute inset-4 flex items-end justify-between gap-2">
                {[40, 35, 45, 85, 38].map((height, index) => (
                  <div
                    key={height + index}
                    className={`w-full rounded-sm ${index === 3 ? 'bg-[#8b4e3f]' : 'bg-[#416f82]/20'}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="absolute bottom-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#596467]">Activity variance</p>
            </div>
          </div>
        </article>

        <article className={`${glassCardClass} flex flex-col p-6 xl:col-span-4`}>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Market Context</h2>
            <p className="mt-1 text-sm text-[#596467]">Global intelligence overlay</p>
          </div>
          <div className="flex-1 space-y-5">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffdad2]/65 text-[#8b4e3f]">
                <DownTrendIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Tech hiring slowdown detected</p>
                <p className="mt-1 text-sm leading-6 text-[#596467]">Strengthen portfolio momentum during market uncertainty.</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#c8dbe2] bg-[#eef6f8] p-4">
              <p className="text-sm italic leading-6 text-[#2f5362]">
                Preserve liquidity for the next 90 days. Focus on skill consolidation instead of certification purchases.
              </p>
            </div>
          </div>
          <button className="mt-6 rounded-lg bg-[#416f82] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f5362]" type="button">
            Adjust Savings Shield
          </button>
        </article>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Stress-Spending Correlation</h2>
            <p className="mt-1 text-sm text-[#596467]">Cross-domain behavior mapping</p>
          </div>
          <div className="relative py-8">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <CorrelationNode icon={CodeIcon} label="Late-night coding stress" tone="primary" />
              <div className="relative h-0.5 flex-1 bg-gradient-to-r from-[#416f82]/30 via-[#8b4e3f]/60 to-[#8b4e3f]/30">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#d8e5ea] bg-[#fbf9f8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#596467]">
                  0.82 correl.
                </span>
              </div>
              <CorrelationNode icon={CoffeeIcon} label="Snack and caffeine" tone="warm" />
            </div>
            <svg className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" viewBox="0 0 520 180">
              <path d="M70 92 Q260 154 450 92" fill="none" stroke="#416f82" strokeDasharray="6 6" strokeWidth="2" />
              <path d="M70 112 Q260 34 450 112" fill="none" stroke="#8b4e3f" strokeDasharray="6 6" strokeWidth="2" />
            </svg>
          </div>
          <p className="mt-3 text-center text-sm leading-6 text-[#596467]">
            Improving sleep consistency could save approximately <span className="font-semibold text-[#1b1c1c]">$140/mo</span> in stress purchases.
          </p>
        </article>

        <article className={`${glassCardClass} p-6 xl:col-span-6`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Consistency Calendar</h2>
              <p className="mt-1 text-sm text-[#596467]">Financial wellness streak</p>
            </div>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#416f82]" title="Balanced day" />
              <span className="h-3 w-3 rounded-full bg-[#d98b72]" title="Spike day" />
              <span className="h-3 w-3 rounded-full bg-[#e4e2e1]" title="No data" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
              <div key={day} className="py-1 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">
                {day}
              </div>
            ))}
            {consistencyDays.map((className, index) => (
              <div key={index} className={`aspect-square rounded-md opacity-85 transition hover:opacity-100 ${className}`} />
            ))}
          </div>
        </article>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className={`${glassCardClass} p-6 xl:col-span-8`}>
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Financial Trajectory</h2>
              <p className="mt-1 text-sm text-[#596467]">AI projection based on current habits</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Legend color="#d98b72" label="Current path" />
              <Legend color="#416f82" label="Stable path" />
            </div>
          </div>
          <div className="relative h-72">
            <svg className="h-full w-full" viewBox="0 0 800 240" preserveAspectRatio="none">
              <line stroke="#e4e2e1" strokeWidth="1" x1="0" x2="800" y1="205" y2="205" />
              <line stroke="#e4e2e1" strokeWidth="1" x1="0" x2="800" y1="145" y2="145" />
              <line stroke="#e4e2e1" strokeWidth="1" x1="0" x2="800" y1="85" y2="85" />
              <path d="M0 168 Q200 178 400 194 T800 226" fill="none" opacity="0.55" stroke="#8b4e3f" strokeDasharray="8 6" strokeWidth="3" />
              <path d="M0 168 Q200 152 400 120 T800 48" fill="none" stroke="#416f82" strokeLinecap="round" strokeWidth="4" />
              <circle cx="400" cy="120" fill="#416f82" r="7" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">
              <span>Current</span>
              <span>6 months</span>
              <span>1 year</span>
              <span>2 years</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg border border-[#d8e5ea] bg-[#f5f3f2] p-4">
            <p className="text-sm text-[#596467]">Projected difference in 24 months:</p>
            <span className="text-xl font-semibold text-[#416f82]">+$18,450.00</span>
          </div>
        </article>

        <article className={`${glassCardClass} space-y-5 p-6 xl:col-span-4`}>
          <h2 className="text-xl font-semibold">Cross Analysis</h2>
          <RecommendationCard
            icon={WarningIcon}
            title="Overspending can raise stress"
            detail="When spending climbs above the usual budget, money pressure can increase stress and weaken recovery."
            tone="warm"
          />
          <RecommendationCard
            icon={MindIcon}
            title="Stress can affect health"
            detail="Higher stress may reduce sleep consistency, increase fatigue, and make healthy routines harder to maintain."
            tone="primary"
          />
        </article>
      </section>

      <section className={`${glassCardClass} p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Intelligence Feed</h2>
          <button className="text-sm font-semibold text-[#416f82] underline" type="button">View historical feed</button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeedCard icon={BoltIcon} text={<span>Stress spending reduced after improving sleep consistency by <strong>20%</strong>.</span>} tone="primary" />
          <FeedCard icon={VerifiedIcon} text={<span>Savings consistency is improving <strong>recovery stability</strong> during high-workload weeks.</span>} tone="primary" />
          <FeedCard icon={MindIcon} text={<span>Identified <strong>impulse purchase trigger</strong>: 10 PM social media scrolling.</span>} tone="warm" />
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ metric }) {
  const Icon = metric.icon;
  const tone = metric.tone === 'warm' ? '#8b4e3f' : '#416f82';

  return (
    <article className={`${glassCardClass} relative overflow-hidden p-5`}>
      <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-10 rounded-full bg-[#d98b72]/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">{metric.label}</p>
          <h3 className="text-2xl font-semibold" style={{ color: tone }}>{metric.value}</h3>
          <p className="mt-2 flex items-center gap-1 text-sm text-[#596467]">
            {metric.tone === 'primary' && <ArrowUpIcon className="h-4 w-4 text-[#416f82]" />}
            {metric.detail}
          </p>
        </div>
        {metric.ring && (
          <div className="relative h-16 w-16 shrink-0">
            <ProgressRing value={metric.ring} color={tone} />
            <Icon className="absolute inset-0 m-auto h-5 w-5" style={{ color: tone }} />
          </div>
        )}
      </div>

      {metric.bar && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4e2e1]">
          <div className="h-full rounded-full bg-[#416f82]" style={{ width: `${metric.bar}%` }} />
        </div>
      )}

      {metric.segments && (
        <div className="mt-4 flex h-3 gap-1">
          <div className="flex-1 rounded-l-full bg-[#416f82]" />
          <div className="flex-1 bg-[#416f82]" />
          <div className="flex-1 bg-[#416f82]/40" />
          <div className="flex-1 rounded-r-full bg-[#e4e2e1]" />
        </div>
      )}

      {metric.spark && (
        <div className="mt-4 flex h-9 items-end gap-1">
          {metric.spark.map((height, index) => (
            <div key={height + index} className="w-2 rounded-t-sm bg-[#8b4e3f]" style={{ height: `${height}%`, opacity: 0.2 + index * 0.13 }} />
          ))}
        </div>
      )}
    </article>
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

function StatusPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#d8e5ea] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#416f82] shadow-sm">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function MiniStat({ label, value, delta }) {
  return (
    <div className="rounded-lg border border-[#d8e5ea] bg-white/55 p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#596467]">{label}</p>
      <p className="text-lg font-semibold">
        {value} {delta && <span className="text-sm text-[#8b4e3f]">{delta}</span>}
      </p>
    </div>
  );
}

function CorrelationNode({ icon: Icon, label, tone }) {
  const warm = tone === 'warm';

  return (
    <div className="w-28 text-center">
      <div className={`mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full border-2 ${warm ? 'border-[#efcfc5] bg-[#fff1ed] text-[#8b4e3f]' : 'border-[#c8dbe2] bg-[#eef6f8] text-[#416f82]'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium leading-5">{label}</p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-[#596467]">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function RecommendationCard({ icon: Icon, title, detail, tone }) {
  const warm = tone === 'warm';

  return (
    <button className={`group w-full rounded-lg border p-4 text-left transition ${warm ? 'border-[#efcfc5] hover:bg-[#fff1ed]' : 'border-[#c8dbe2] bg-[#eef6f8]/60 hover:bg-[#eef6f8]'}`} type="button">
      <div className="mb-3 flex items-start justify-between">
        <Icon className={`h-5 w-5 ${warm ? 'text-[#8b4e3f]' : 'text-[#416f82]'}`} />
        <ArrowRightIcon className="h-4 w-4 text-[#596467]/50 transition group-hover:text-[#416f82]" />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#596467]">{detail}</p>
    </button>
  );
}

function FeedCard({ icon: Icon, text, tone }) {
  const warm = tone === 'warm';

  return (
    <div className="flex items-start gap-4 rounded-lg border border-[#eef0ef] bg-white/70 p-4">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${warm ? 'bg-[#ffdad2]/60 text-[#8b4e3f]' : 'bg-[#e6f1f4] text-[#416f82]'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm leading-6 text-[#424842]">{text}</p>
    </div>
  );
}

function IconBase({ className, style, children }) {
  return (
    <svg aria-hidden="true" className={className} style={style} viewBox="0 0 24 24" fill="none">
      {children}
    </svg>
  );
}

function WalletIcon({ className }) {
  return <IconBase className={className}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="2" /><path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="2" /></IconBase>;
}

function TrendIcon({ className }) {
  return <IconBase className={className}><path d="m4 16 5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ShieldIcon({ className, style }) {
  return <IconBase className={className} style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ArrowUpIcon({ className }) {
  return <IconBase className={className}><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function WarningIcon({ className }) {
  return <IconBase className={className}><path d="M12 9v4M12 17h.01M10.3 4.4 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function DownTrendIcon({ className }) {
  return <IconBase className={className}><path d="m4 8 5 5 4-4 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 16h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function CodeIcon({ className }) {
  return <IconBase className={className}><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function CoffeeIcon({ className }) {
  return <IconBase className={className}><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM16 10h2a2 2 0 1 1 0 4h-2M6 3v2M10 3v2M14 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ArrowRightIcon({ className }) {
  return <IconBase className={className}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function BoltIcon({ className }) {
  return <IconBase className={className}><path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}

function VerifiedIcon({ className }) {
  return <IconBase className={className}><path d="M20 7 9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function MindIcon({ className }) {
  return <IconBase className={className}><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1.2.8-1.5 1.8-1.5 3h-5c0-1.2-.3-2.2-1.5-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

export default Finance;
