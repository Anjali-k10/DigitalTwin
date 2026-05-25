import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiInsightBulb from '../assets/ai-insight-bulb.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const fallbackProfile = {
  behavioralAnalysis: {
    focusAreas: ['productivity', 'finance', 'health'],
  },
  integrations: {
    github: { status: 'connected', username: 'anjali-dev' },
    leetcode: { status: 'connected', username: 'anjali-codes' },
    fitbit: { status: 'skipped', profileLink: '' },
    linkedin: { status: 'connected', profileLink: 'linkedin' },
    banking: { status: 'skipped', profileLink: '' },
  },
  lifestyle: {
    gender: '',
    sleepHours: 6,
    studyHours: 5,
    exerciseFrequency: 2,
    spendingStyle: 'balanced',
    smokingHabits: 'no',
    periodTracking: 'not_now',
    genderSpecificHealthContext: 'not_now',
  },
  financialPatterns: {
    monthlyIncome: '52000',
    monthlyExpenditure: '34000',
    savingsHabits: 'moderate',
    financialStressLevel: 5,
  },
};

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(() => getStoredDashboardData());
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const user = getStoredUser();
  const firstName = user?.firstName || 'Anjali';
  const profile = useMemo(() => normalizeProfile(dashboardData?.profile || getStoredProfile()), [dashboardData]);
  const insights = useMemo(() => buildInsights(profile, dashboardData), [profile, dashboardData]);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoadingDashboard(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData(response.data.data);
        localStorage.setItem('digitalTwinDashboardData', JSON.stringify(response.data.data));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex h-screen min-w-0 flex-1 overflow-hidden bg-[#fbf9f8] text-[#1b1c1c]">
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader today={today} firstName={firstName} onSearchClick={() => navigate('/copilot')} />

        <main className="dashboard-scrollbar flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <section className="mb-6 animate-[fadeIn_280ms_ease-out]">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5f8fa0]/70">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#416f82]">Overview</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c1c]">Morning, {firstName}.</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#596467]">
              Your health, finance, and career signals are in{' '}
              <span className="font-semibold text-[#416f82]">{insights.alignmentLabel}</span> today.
              {isLoadingDashboard && <span className="ml-2 text-sm text-[#7b8581]">Refreshing profile...</span>}
            </p>
          </section>

          <section className="grid grid-cols-12 gap-6">
            <HealthScoreCard insights={insights} onOpen={() => navigate('/health')} />
            <FinanceTrajectory insights={insights} onOpen={() => navigate('/finance')} />
            <LifeBalance insights={insights} />
            <DailyRituals insights={insights} />
            <AdaptiveRecommendations insights={insights} />
          </section>
        </main>
      </section>

      <AiFeed insights={insights} />
    </div>
  );
}

function DashboardHeader({ today, firstName, onSearchClick }) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#dbe2df]/80 bg-[#fbf9f8]/80 px-6 backdrop-blur-xl lg:px-8">
      <div className="max-w-xl flex-1">
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7774]" />
          <input
            type="text"
            placeholder="Ask DigitalTwin AI"
            onClick={onSearchClick}
            onFocus={onSearchClick}
            readOnly
            className="w-full rounded-2xl border-0 bg-[#f0eded] py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#8b9490] focus:bg-white focus:ring-2 focus:ring-[#8db9c5]/30"
          />
        </label>
      </div>

      <div className="ml-6 flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-[#dbe2df] bg-white px-4 py-2 text-xs font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:flex">
          <CalendarIcon className="h-4 w-4 text-[#416f82]" />
          {today}
        </div>
        <button className="relative grid h-10 w-10 place-items-center rounded-full text-[#596467] transition hover:bg-[#f0eded]" type="button" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ba4a40]" />
        </button>
        <button className="rounded-full bg-[#1b1c1c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#416f82]" type="button">
          Get Report
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#dbecef] text-sm font-bold text-[#416f82]">
          {firstName.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

function HealthScoreCard({ insights, onOpen }) {
  const [displayedScore, setDisplayedScore] = useState(insights.healthScore);
  const [ringReplayKey, setRingReplayKey] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const score = insights.healthScore;
  const dashOffset = circumference - (score / 100) * circumference;
  const healthStyle = getVisualState(insights.healthState.colorState);
  const burnoutStyle = getVisualState(insights.thresholds.burnout.colorState);
  const wellnessStyle = getVisualState(insights.thresholds.wellness.colorState);

  useEffect(() => {
    setDisplayedScore(score);
  }, [score]);

  const replayHealthScore = () => {
    const duration = 850;
    const startTime = performance.now();
    setDisplayedScore(0);
    setRingReplayKey((key) => key + 1);

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(score * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const openFromKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      className={`dashboard-card-enter col-span-12 flex cursor-pointer flex-col rounded-2xl border bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-4 focus:ring-[#d7e9ef] xl:col-span-4 ${healthStyle.card}`}
      onClick={onOpen}
      onKeyDown={openFromKeyboard}
      role="button"
      tabIndex={0}
      aria-label="Open health page"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Health Score</h3>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${healthStyle.text}`}>{healthStyle.label} vitals</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${healthStyle.icon}`}>
          <HeartIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <div className="dashboard-health-score-group relative h-36 w-36 cursor-default rounded-full" onMouseEnter={replayHealthScore}>
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r={radius} stroke="#f0eded" strokeWidth="6" />
            <circle
              key={ringReplayKey}
              className="dashboard-health-ring"
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke={healthStyle.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="6"
              style={{
                '--ring-offset': dashOffset,
                '--ring-length': circumference,
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          </svg>
          <div className="dashboard-health-score-label absolute inset-0 flex flex-col items-center justify-center rounded-full">
            <span className={`text-4xl font-semibold ${healthStyle.text}`}>{displayedScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7b8581]">{healthStyle.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <MiniMetric label="Burnout" value={`${insights.burnoutRisk}%`} state={burnoutStyle} />
        <MiniMetric label="Recovery" value={`${insights.recoveryScore}%`} state={wellnessStyle} />
      </div>
    </article>
  );
}

function FinanceTrajectory({ insights, onOpen }) {
  const [selectedRange, setSelectedRange] = useState('1M');
  const activeChart = insights.financeRanges[selectedRange];
  const financeStyle = getVisualState(insights.thresholds.financial.colorState);

  const openFromKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      className={`dashboard-card-enter col-span-12 cursor-pointer rounded-2xl border bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-4 focus:ring-[#d7e9ef] xl:col-span-8 ${financeStyle.card}`}
      onClick={onOpen}
      onKeyDown={openFromKeyboard}
      role="button"
      tabIndex={0}
      aria-label="Open finance page"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Financial Trajectory</h3>
          <p className={`text-sm ${financeStyle.text}`}>{activeChart.summary}</p>
        </div>
        <div className="flex gap-1.5">
          {['1W', '1M'].map((range) => (
            <button
              key={range}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedRange(range);
              }}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
                selectedRange === range
                  ? 'bg-[#1b1c1c] text-white'
                  : 'bg-[#f0eded] text-[#596467] hover:bg-[#e4e2e1]'
              }`}
              type="button"
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div key={selectedRange} className="dashboard-finance-chart relative mb-6 h-56 overflow-hidden rounded-2xl border border-[#e4e2e1] bg-[#fbf9f8] px-5 pb-8 pt-5">
        <div className="absolute inset-x-5 top-5 bottom-8 grid grid-rows-4">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="border-t border-[#e4e2e1]/80" />
          ))}
        </div>

        <div className="absolute inset-x-5 bottom-8 top-5 flex items-end gap-3">
          {activeChart.bars.map((height, index) => (
            <div key={`${height}-${index}`} className="flex h-full flex-1 items-end">
              <div
                className="dashboard-finance-bar w-full rounded-t-xl bg-[#b9d5de]"
                style={{
                  '--bar-height': `${height}%`,
                  backgroundColor: financeStyle.softStroke,
                  '--bar-hover-color': financeStyle.stroke,
                  animationDelay: `${index * 80}ms`,
                  opacity: 0.3 + index * (0.62 / Math.max(activeChart.bars.length - 1, 1)),
                }}
              />
            </div>
          ))}
        </div>

        <svg className="pointer-events-none absolute inset-x-5 bottom-8 top-5 h-[calc(100%-52px)] w-[calc(100%-40px)] overflow-visible" viewBox="0 0 368 140" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={activeChart.linePoints} fill="none" stroke={financeStyle.stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="dashboard-finance-line" />
          {activeChart.pointData.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#fbf9f8"
              stroke={financeStyle.stroke}
              strokeWidth="3"
              className="dashboard-finance-dot"
              style={{ animationDelay: `${900 + index * 70}ms` }}
            />
          ))}
        </svg>

        <div className="absolute inset-x-5 bottom-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8581]">
          {activeChart.labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#e4e2e1] pt-5">
        <div className="flex gap-8">
          <AnimatedMetricBlock label="Savings Rate" value={insights.savingsRate} suffix="%" state={getVisualState(insights.savingsState.colorState)} />
          <AnimatedMetricBlock label="Monthly Buffer" value={insights.monthlyBufferValue} formatter={formatMoney} fallback="Add data" state={getVisualState(insights.bufferState.colorState)} />
        </div>
      </div>
    </article>
  );
}

function LifeBalance({ insights }) {
  const points = `${50},${100 - insights.healthScore * 0.82} ${50 + insights.financeScore * 0.38},${50 - insights.financeScore * 0.13} ${50 + insights.productivityScore * 0.23},${50 + insights.productivityScore * 0.31} ${50 - insights.recoveryScore * 0.23},${50 + insights.recoveryScore * 0.31} ${50 - insights.burnoutRisk * 0.28},${50 - insights.burnoutRisk * 0.1}`;

  return (
    <article className="dashboard-card-enter col-span-12 flex flex-col items-center rounded-2xl border border-[#dbe2df] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.035)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] md:col-span-6">
      <h3 className="mb-8 self-start text-lg font-semibold">Life Balance</h3>
      <div className="relative my-3 h-56 w-56">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <polygon className="dashboard-radar-grid" fill="none" points="50,10 88,37 73,81 27,81 12,37" stroke="#e4e2e1" strokeWidth="1" />
          <polygon className="dashboard-radar-grid dashboard-radar-grid-delay-1" fill="none" points="50,30 73,47 64,74 36,74 27,47" stroke="#e4e2e1" strokeWidth="1" />
          <polygon className="dashboard-radar-grid dashboard-radar-grid-delay-2" fill="none" points="50,50 62,57 58,67 42,67 38,57" stroke="#e4e2e1" strokeWidth="1" />
          <line className="dashboard-radar-spoke" stroke="#e4e2e1" x1="50" x2="50" y1="50" y2="10" />
          <line className="dashboard-radar-spoke" stroke="#e4e2e1" x1="50" x2="88" y1="50" y2="37" />
          <line className="dashboard-radar-spoke" stroke="#e4e2e1" x1="50" x2="73" y1="50" y2="81" />
          <line className="dashboard-radar-spoke" stroke="#e4e2e1" x1="50" x2="27" y1="50" y2="81" />
          <line className="dashboard-radar-spoke" stroke="#e4e2e1" x1="50" x2="12" y1="50" y2="37" />
          <polygon className="dashboard-radar-area" fill="rgba(141,185,197,0.32)" points={points} stroke="#5f8fa0" strokeWidth="2" />
        </svg>
        <RadarLabel className="left-1/2 top-[-10px] -translate-x-1/2" label="Health" />
        <RadarLabel className="right-[-28px] top-[35%]" label="Finance" />
        <RadarLabel className="bottom-[-12px] right-0" label="Career" />
        <RadarLabel className="bottom-[-12px] left-0" label="Recovery" />
        <RadarLabel className="left-[-24px] top-[35%]" label="Stress" />
      </div>
    </article>
  );
}

function DailyRituals({ insights }) {
  const [now, setNow] = useState(() => new Date());
  const ritualCalendar = useMemo(() => buildRitualCalendar(now, insights), [now, insights]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <article className="dashboard-card-enter col-span-12 rounded-2xl border border-[#dbe2df] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] md:col-span-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1b1c1c]">Day {ritualCalendar.today}</p>
          <p className="mt-0.5 font-mono text-[11px] text-[#7b8581]">{formatTimeLeft(now)} left</p>
          {ritualCalendar.streakStarted && (
            <p className="mt-1 text-[11px] font-semibold text-[#4f8f73]">{ritualCalendar.currentStreak} day streak</p>
          )}
        </div>
        <div className="relative h-14 w-14 rotate-45 rounded-[14px] border border-[#8db9c5]/70 bg-[#eaf4f6] shadow-[0_12px_30px_rgba(65,111,130,0.16)]">
          <div className="absolute inset-1.5 rounded-[12px] border border-[#416f82]/25" />
          <div className="flex h-full -rotate-45 flex-col items-center justify-center">
            <span className="text-lg font-bold text-[#416f82]">{ritualCalendar.today}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7b8581]">{ritualCalendar.monthShort}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="text-center text-xs font-semibold text-[#7b8581]">{day}</div>
        ))}

        {ritualCalendar.days.map((day) => (
          <div key={day.key} className="grid h-7 place-items-center">
            {day.type === 'blank' ? (
              <span />
            ) : (
              <RitualDay day={day} />
            )}
          </div>
        ))}
      </div>

      {!ritualCalendar.streakStarted && (
        <p className="mt-3 rounded-xl bg-[#f5f8f8] px-3 py-2 text-xs font-medium text-[#596467]">
          Complete today's goals to begin streak tracking.
        </p>
      )}
    </article>
  );
}

function RitualDay({ day }) {
  if (day.state === 'today-complete') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#4f8f73] text-sm font-bold text-white shadow-[0_10px_24px_rgba(79,143,115,0.28)]">
        {day.value}
      </span>
    );
  }

  if (day.state === 'today') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full border border-[#8db9c5] bg-white text-sm font-bold text-[#416f82]">
        {day.value}
      </span>
    );
  }

  if (day.state === 'done') {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#4f8f73] text-[#4f8f73]">
        <CheckIcon className="h-4 w-4" />
      </span>
    );
  }

  if (day.state === 'missed') {
    return (
      <span className="relative grid h-7 w-7 place-items-center text-sm font-medium text-[#596467]">
        {day.value}
        <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#ff0000]" />
      </span>
    );
  }

  return <span className="text-sm font-medium text-[#596467]">{day.value}</span>;
}

function AdaptiveRecommendations({ insights }) {
  return (
    <section className="relative col-span-12 overflow-hidden rounded-2xl border border-[#8db9c5]/20 bg-[#eaf4f6]/70 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
      <div className="relative z-10">
        <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-[#8db9c5]/30 bg-white/55 px-3 py-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#416f82]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#416f82]">Deep Sync Active</span>
        </div>
        <h2 className="mb-6 text-2xl font-semibold">Adaptive Recommendations</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {insights.recommendations.slice(0, 3).map((item) => {
            const state = getVisualState(item.colorState);
            return (
              <article key={item.title} className={`dashboard-recommendation-card relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur ${state.card}`}>
                <span className="dashboard-recommendation-glow absolute inset-0 opacity-0" style={{ backgroundColor: state.stroke }} />
                <div className="relative z-10 border-b border-[#dbe2df]/70 px-5 py-4">
                  <h4 className={`text-sm font-bold ${state.text}`}>{item.title}</h4>
                </div>
                <div className="relative z-10 px-5 py-4">
                  <p className="text-xs leading-5 text-[#596467]">{item.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-[#8db9c5]/20 blur-3xl" />
    </section>
  );
}

function AiFeed({ insights }) {
  return (
    <aside className="hidden h-screen w-80 shrink-0 flex-col overflow-hidden border-l border-[#dbe2df]/80 bg-[#fbf9f8]/85 backdrop-blur-xl xl:flex">
      <div className="flex h-20 shrink-0 items-center border-b border-[#dbe2df]/80 px-8">
        <img src={aiInsightBulb} alt="" className="mr-3 h-7 w-7 object-contain opacity-80" />
        <h3 className="text-lg font-semibold">AI Insight</h3>
      </div>

      <div className="dashboard-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
        <section className="space-y-4">
          {insights.feed.map((item) => {
            const state = getVisualState(item.colorState);
            const isHarmful = item.sentiment === 'negative' || normalizeColorState(item.colorState) === 'red';
            const textState = isHarmful ? getVisualState('red') : state;

            return (
              <article key={item.title} className={`dashboard-ai-insight-card space-y-3 rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)] ${state.card}`}>
                <div className="flex items-start">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${state.badge}`}>{item.label}</span>
                </div>
                <p className={`text-sm font-medium leading-6 ${isHarmful ? textState.text : 'text-[#1b1c1c]'}`}>
                  {item.title}
                </p>
              </article>
            );
          })}
        </section>

        <section>
          <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7b8581]">Historical Alignment</h4>
          <div className="rounded-2xl border border-[#dbe2df] bg-[#f5f3f2] p-4">
            <div className="flex h-24 items-end gap-1 px-2">
              {insights.alignmentBars.map((height, index) => {
                const state = getVisualState(alignmentColorState(height));

                return (
                  <div
                    key={`${height}-${index}`}
                    className="dashboard-alignment-bar flex-1 rounded-t"
                    style={{
                      height: `${height}%`,
                      backgroundColor: state.stroke,
                      '--bar-hover-color': state.softStroke,
                      opacity: 0.72 + index * 0.04,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-[0.14em] text-[#7b8581]">
              <span>Mon</span>
              <span>Today</span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function MiniMetric({ label, value, state = getVisualState('green') }) {
  return (
    <div className={`rounded-xl p-3 ${state.surface}`}>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8581]">{label}</p>
      <p className={`dashboard-value-hover text-base font-bold ${state.text}`}>{value}</p>
    </div>
  );
}

function MetricBlock({ label, value, state = null }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8581]">{label}</p>
      <p className={`text-lg font-bold ${state ? state.text : 'text-[#1b1c1c]'}`}>{value}</p>
    </div>
  );
}

function AnimatedMetricBlock({ label, value, state = null, suffix = '', formatter = null, fallback = '' }) {
  const numericValue = Number(value);
  const hasValue = Number.isFinite(numericValue);
  const [displayValue, setDisplayValue] = useState(hasValue ? 0 : value);

  useEffect(() => {
    if (!hasValue) {
      setDisplayValue(value || fallback);
      return undefined;
    }

    const duration = 850;
    const startTime = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    setDisplayValue(0);
    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fallback, hasValue, numericValue, value]);

  const renderedValue = hasValue
    ? `${formatter ? formatter(displayValue) : displayValue}${suffix}`
    : displayValue || fallback;

  return (
    <div>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8581]">{label}</p>
      <p className={`dashboard-value-hover text-lg font-bold ${state ? state.text : 'text-[#1b1c1c]'}`}>{renderedValue}</p>
    </div>
  );
}

function HighlightedInsightText({ text, terms = [], colorState = 'green' }) {
  const validTerms = Array.isArray(terms) ? terms.filter(Boolean) : [];
  if (validTerms.length === 0) return text;

  const escapedTerms = validTerms.map((term) => escapeRegExp(term));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = String(text).split(regex);
  const highlightClass = getVisualState(colorState).text;

  return parts.map((part, index) => {
    const isHighlight = validTerms.some((term) => term.toLowerCase() === part.toLowerCase());
    return isHighlight ? (
      <span key={`${part}-${index}`} className={`font-semibold ${highlightClass}`}>
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

function RadarLabel({ label, className }) {
  return <span className={`absolute text-[9px] font-bold uppercase tracking-[0.12em] text-[#7b8581] ${className}`}>{label}</span>;
}

function getStoredProfile() {
  try {
    const stored = localStorage.getItem('lifetwinOnboardingProfile');
    return stored ? JSON.parse(stored) : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
}

function getStoredDashboardData() {
  try {
    const stored = localStorage.getItem('digitalTwinDashboardData');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function normalizeProfile(rawProfile) {
  if (!rawProfile) return fallbackProfile;

  if (rawProfile.lifestyle && rawProfile.financialPatterns) {
    return rawProfile;
  }

  return {
    behavioralAnalysis: {
      focusAreas: rawProfile.selectedSignals || [],
    },
    integrations: {
      github: { status: rawProfile.githubUsername ? 'connected' : 'skipped', username: rawProfile.githubUsername || '' },
      leetcode: { status: rawProfile.leetcodeUsername ? 'connected' : 'skipped', username: rawProfile.leetcodeUsername || '' },
      fitbit: { status: rawProfile.fitbitProfile ? 'connected' : 'skipped', profileLink: rawProfile.fitbitProfile || '' },
      googleCalendar: { status: rawProfile.calendarProfile ? 'connected' : 'skipped', profileLink: rawProfile.calendarProfile || '' },
      linkedin: { status: rawProfile.linkedinProfile ? 'connected' : 'skipped', profileLink: rawProfile.linkedinProfile || '' },
      banking: { status: rawProfile.bankingProfile ? 'connected' : 'skipped', profileLink: rawProfile.bankingProfile || '' },
    },
    lifestyle: {
      gender: rawProfile.gender || '',
      sleepHours: rawProfile.sleepHours ?? 7,
      studyHours: rawProfile.studyHours ?? 4,
      exerciseFrequency: rawProfile.exerciseFrequency ?? 2,
      spendingStyle: rawProfile.spendingStyle || 'balanced',
      smokingHabits: rawProfile.smokingHabit || 'no',
      periodTracking: rawProfile.periodTracking || 'not_now',
      genderSpecificHealthContext: rawProfile.genderSpecificHealthContext || 'not_now',
    },
    financialPatterns: {
      monthlyIncome: rawProfile.monthlyIncome ?? 0,
      monthlyExpenditure: rawProfile.monthlyExpenditure ?? 0,
      savingsHabits: rawProfile.savingsHabit || 'moderate',
      financialStressLevel: rawProfile.financialStressLevel ?? 5,
    },
    aiScores: {
      burnoutRisk: rawProfile.burnoutRisk,
      productivityScore: rawProfile.productivityScore,
      financialHealth: rawProfile.financialHealth,
      wellnessBalance: rawProfile.wellnessBalance,
    },
  };
}

function buildInsights(profile, dashboardData = null) {
  const sleepHours = Number(profile.lifestyle.sleepHours || 7);
  const studyHours = Number(profile.lifestyle.studyHours || 4);
  const exerciseFrequency = Number(profile.lifestyle.exerciseFrequency || 2);
  const stressLevel = Number(profile.financialPatterns.financialStressLevel || 4);
  const income = Number(profile.financialPatterns.monthlyIncome || 0);
  const expenditure = Number(profile.financialPatterns.monthlyExpenditure || 0);
  const rawSavingsRate = income > 0 ? Math.round(((income - expenditure) / income) * 100) : 0;
  const savingsRate = income > 0 ? Math.max(0, rawSavingsRate) : 28;
  const connectedCount = Object.values(profile.integrations || {}).filter((item) => item.status === 'connected').length;
  const monthlyBufferValue = income > 0 ? income - expenditure : null;
  const monthlyBuffer = monthlyBufferValue !== null ? formatMoney(monthlyBufferValue) : 'Add data';
  const hasGithub = profile.integrations?.github?.status === 'connected';
  const hasLeetcode = profile.integrations?.leetcode?.status === 'connected';
  const smokingHabit = profile.lifestyle.smokingHabits || 'no';
  const gender = profile.lifestyle.gender || '';
  const genderThresholds = getGenderThresholds(gender);
  const periodRecoveryLoad = gender === 'female' && profile.lifestyle.periodTracking === 'irregular' ? 5 : 0;
  const maleRecoveryCredit = gender === 'male' && profile.lifestyle.genderSpecificHealthContext !== 'not_now' && exerciseFrequency >= 3 ? 3 : 0;

  const calculatedBurnout = clamp(Math.round(42 + Math.max(0, genderThresholds.idealSleepHours - sleepHours) * 8 + Math.max(0, studyHours - genderThresholds.heavyStudyHours) * 5 + stressLevel * 2 - exerciseFrequency * 3 + (smokingHabit === 'yes' ? 8 : 0) + periodRecoveryLoad - maleRecoveryCredit), 18, 95);
  const calculatedProductivity = clamp(Math.round(58 + studyHours * 5 + connectedCount * 3 + (hasGithub ? 4 : 0) + (hasLeetcode ? 3 : 0) - Math.max(0, genderThresholds.idealSleepHours - sleepHours) * 3 - Math.max(0, stressLevel - 6) * 3), 30, 98);
  const calculatedRecovery = clamp(Math.round(54 + sleepHours * 4 + exerciseFrequency * genderThresholds.exerciseWeight - stressLevel * 3 - (smokingHabit === 'yes' ? 10 : 0) - periodRecoveryLoad), 18, 96);
  const calculatedFinance = clamp(Math.round(50 + rawSavingsRate * 0.8 - stressLevel * 2 - (expenditure > income && income > 0 ? 18 : 0)), 8, 98);

  const analytics = dashboardData?.analytics || profile.aiScores || {};
  const burnoutRisk = clamp(Number.isFinite(Number(analytics.burnoutRisk)) ? Number(analytics.burnoutRisk) : calculatedBurnout, 0, 100);
  const productivityScore = clamp(Number.isFinite(Number(analytics.productivityScore)) ? Number(analytics.productivityScore) : calculatedProductivity, 0, 100);
  const recoveryScore = clamp(Number.isFinite(Number(analytics.wellnessBalance)) ? Number(analytics.wellnessBalance) : calculatedRecovery, 0, 100);
  const financeScore = clamp(Number.isFinite(Number(analytics.financialHealth)) ? Number(analytics.financialHealth) : calculatedFinance, 0, 100);
  const healthScore = clamp(Math.round((100 - burnoutRisk) * 0.35 + recoveryScore * 0.65), 35, 96);
  const thresholds = normalizeThresholds(dashboardData?.thresholds || analytics.thresholds, {
    sleepHours,
    stressLevel,
    burnoutRisk,
    financeScore,
    recoveryScore,
    productivityScore,
    income,
    expenditure,
    gender,
  });
  const healthState = deriveHealthState({ healthScore, burnoutState: thresholds.burnout, wellnessState: thresholds.wellness });
  const metricStates = dashboardData?.metricStates || dashboardData?.analytics?.metricStates || {};
  const savingsState = metricStates.savingsRate || deriveSavingsState({ rawSavingsRate });
  const bufferState = metricStates.savingsBuffer || deriveBufferState({ income, expenditure });
  const financeRanges = buildFinanceRanges({ income, expenditure, stressLevel, savingsRate: rawSavingsRate, financeScore });
  const recommendations = normalizeRecommendations(dashboardData?.recommendations, {
    sleepHours,
    studyHours,
    savingsRate,
    rawSavingsRate,
    burnoutRisk,
    stressLevel,
    exerciseFrequency,
    smokingHabit,
    hasGithub,
    hasLeetcode,
  });
  const feed = buildFeed(dashboardData?.aiInsights, {
    exerciseFrequency,
    savingsRate,
    rawSavingsRate,
    sleepHours,
    burnoutRisk,
    stressLevel,
    productivityScore,
    studyHours,
    smokingHabit,
    hasGithub,
    hasLeetcode,
    financeScore,
    recoveryScore,
  });
  const streak = normalizeStreak(dashboardData?.streak || dashboardData?.profile);

  return {
    burnoutRisk,
    productivityScore,
    recoveryScore,
    financeScore,
    healthScore,
    sleepHours,
    studyHours,
    exerciseFrequency,
    stressLevel,
    streak,
    thresholds,
    healthState,
    savingsState,
    bufferState,
    savingsRate,
    monthlyBufferValue,
    monthlyBuffer,
    financeTrend: rawSavingsRate < 0 ? '-3.8% spending pressure' : rawSavingsRate > 25 ? '+2.4% growth' : '+0.6% stabilizing',
    financeTone: rawSavingsRate < 0 ? '#ff0000' : '#416f82',
    financeRanges,
    alignmentBars: buildAlignmentBars({
      sleepHours,
      studyHours,
      exerciseFrequency,
      stressLevel,
      rawSavingsRate,
      healthScore,
      financeScore,
      productivityScore,
      recoveryScore,
      burnoutRisk,
      hasGithub,
      hasLeetcode,
    }),
    alignmentLabel: burnoutRisk > 70 ? 'active recovery mode' : rawSavingsRate < 0 ? 'financial caution mode' : 'optimal alignment',
    recommendations,
    feed,
  };
}

function normalizeRecommendations(apiRecommendations, context) {
  const source = mergeByTitle([
    ...buildFallbackRecommendations(context),
    ...(Array.isArray(apiRecommendations) ? apiRecommendations : []),
  ]);

  return source
    .map((item, index) => ({
      title: item.title,
      detail: item.detail || item.message || 'Personalized from your latest onboarding signals.',
      icon: iconForCategory(item.category || item.title),
      severity: item.severity || 'low',
      colorState: normalizeColorState(item.colorState || colorStateFromSeverity(item.severity)),
      originalIndex: index,
    }))
    .sort((first, second) => recommendationPriority(second) - recommendationPriority(first) || first.originalIndex - second.originalIndex)
    .slice(0, 4);
}

function buildFallbackRecommendations({ sleepHours, studyHours, savingsRate, rawSavingsRate, burnoutRisk, stressLevel, exerciseFrequency, smokingHabit, hasGithub, hasLeetcode }) {
  const items = [];
  const lowSleepHighStudy = sleepHours < 5 && studyHours > 8;
  const highExerciseLowStress = exerciseFrequency >= 4 && stressLevel <= 3;

  if (lowSleepHighStudy) {
    items.push({
      title: 'Prioritize 7+ hours of sleep',
      detail: 'Protect the next 3 nights with an earlier wind-down window.',
      category: 'wellness',
      severity: 'high',
      colorState: 'red',
    });
  } else if (sleepHours < 7) {
    items.push({
      title: 'Early Recharge',
      detail: 'Move bedtime 45 minutes earlier to improve tomorrow recovery.',
      category: 'wellness',
      severity: 'medium',
      colorState: 'orange',
    });
  } else if (highExerciseLowStress) {
    items.push({
      title: 'Maintain current health rhythm',
      detail: 'Keep the same workout cadence for the next week.',
      category: 'health',
      severity: 'low',
      colorState: 'green',
    });
  }

  if (rawSavingsRate < 0) {
    items.push({
      title: 'Reduce discretionary spending this week',
      detail: 'Pause flexible purchases and review recurring expenses.',
      category: 'finance',
      severity: 'high',
      colorState: 'red',
    });
  } else if (savingsRate > 25) {
    items.push({
      title: 'Increase long-term savings allocation',
      detail: 'Move a small surplus into savings while income stays ahead of expenditure.',
      category: 'finance',
      severity: 'low',
      colorState: 'green',
    });
  }

  if (burnoutRisk > 65 || stressLevel > 7) {
    items.push({
      title: 'Recovery Break',
      detail: 'Schedule a 20-minute reset before the next deep-work block.',
      category: 'health',
      severity: burnoutRisk > 70 ? 'high' : 'medium',
      colorState: burnoutRisk > 70 ? 'red' : 'orange',
    });
  }

  if (smokingHabit === 'yes') {
    items.push({
      title: 'Reduce recovery friction',
      detail: 'Pair one craving window with a short walk or breathing reset.',
      category: 'health',
      severity: 'medium',
      colorState: 'orange',
    });
  }

  if (hasGithub || hasLeetcode) {
    items.push({
      title: 'Protect coding momentum',
      detail: 'Keep one focused coding or practice block active today.',
      category: 'career',
      severity: 'low',
      colorState: 'green',
    });
  } else {
    items.push({
      title: 'Add a coding signal',
      detail: 'Connect GitHub or LeetCode to make career intelligence more specific.',
      category: 'career',
      severity: 'low',
      colorState: 'green',
    });
  }

  return items;
}

function buildFeed(apiInsights, context) {
  const behavioralFeed = buildBehaviorFeed(context);
  const aiFeed = Array.isArray(apiInsights) ? apiInsights.map((item, index) => ({
      label: item.label || 'Insight',
      time: index === 0 ? 'Now' : index === 1 ? '12m ago' : '28m ago',
      title: item.message || item.title || 'Digital Twin insight updated from your profile.',
      colorState: normalizeColorState(item.colorState || colorStateFromSeverity(item.severity) || 'green'),
      sentiment: item.sentiment || sentimentFromColorState(item.colorState || colorStateFromSeverity(item.severity)),
      highlightedProblemTags: item.highlightedProblemTags || [],
    })) : [];

  return mergeFeed([...behavioralFeed, ...aiFeed]).slice(0, 3);
}

function buildBehaviorFeed(context) {
  const items = [];
  const lowSleepHighStudy = context.sleepHours < 5 && context.studyHours > 8;
  const highExerciseLowStress = context.exerciseFrequency >= 4 && context.stressLevel <= 3;

  if (lowSleepHighStudy) {
    items.push({
      label: 'Burnout',
      time: 'Now',
      title: 'Late-night study patterns may increase burnout risk because recovery time is reduced.',
      colorState: 'red',
      sentiment: 'negative',
      highlightedProblemTags: ['Late-night study patterns', 'burnout risk', 'recovery time is reduced'],
    });
    items.push({
      label: 'Wellness',
      time: '4m ago',
      title: 'Reduced sleep consistency is impacting recovery stability.',
      colorState: 'orange',
      sentiment: 'negative',
      highlightedProblemTags: ['Reduced sleep consistency', 'recovery stability'],
    });
  } else if (highExerciseLowStress) {
    items.push({
      label: 'Recovery',
      time: 'Now',
      title: 'Exercise frequency is improving recovery rhythm and focus stability.',
      colorState: 'green',
      sentiment: 'positive',
      highlightedProblemTags: [],
    });
    items.push({
      label: 'Productivity',
      time: '9m ago',
      title: 'Wellness consistency is positively impacting productivity confidence.',
      colorState: 'green',
      sentiment: 'positive',
      highlightedProblemTags: [],
    });
  } else {
    items.push({
      label: 'Biometric',
      time: 'Now',
      title: context.exerciseFrequency > 2 ? 'Workout consistency is improving recovery confidence.' : 'A short mobility block today would improve recovery confidence.',
      colorState: context.exerciseFrequency > 2 ? 'green' : 'orange',
      sentiment: context.exerciseFrequency > 2 ? 'positive' : 'neutral',
      highlightedProblemTags: context.exerciseFrequency > 2 ? [] : ['short mobility block'],
    });
  }

  if (context.rawSavingsRate < 0) {
    items.push({
      label: 'Finance',
      time: '11m ago',
      title: 'Financial stress indicators are increasing because spending trajectory exceeds income stability.',
      colorState: 'red',
      sentiment: 'negative',
      highlightedProblemTags: ['Financial stress indicators', 'spending trajectory exceeds income stability'],
    });
  } else if (context.savingsRate > 25) {
    items.push({
      label: 'Finance',
      time: '18m ago',
      title: 'Financial discipline is currently stable as income stays ahead of expenditure.',
      colorState: 'green',
      sentiment: 'positive',
      highlightedProblemTags: [],
    });
  }

  if (context.hasGithub || context.hasLeetcode) {
    items.push({
      label: 'Career',
      time: '24m ago',
      title: 'GitHub or LeetCode signals strengthen the career momentum pattern.',
      colorState: 'green',
      sentiment: 'positive',
      highlightedProblemTags: [],
    });
  }

  if (context.smokingHabit === 'yes') {
    items.push({
      label: 'Wellness',
      time: '31m ago',
      title: 'Smoking habit is adding recovery friction to the wellness model.',
      colorState: 'red',
      sentiment: 'negative',
      highlightedProblemTags: ['Smoking habit', 'recovery friction'],
    });
  }

  return items;
}

function mergeByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.title || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeFeed(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.label}-${item.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeThresholds(apiThresholds, context) {
  const genderThresholds = getGenderThresholds(context.gender);

  return {
    sleep: apiThresholds?.sleep || thresholdState(context.sleepHours < genderThresholds.criticalSleepHours ? 'critical' : context.sleepHours < genderThresholds.idealSleepHours ? 'warning' : 'healthy', context.sleepHours),
    stress: apiThresholds?.stress || thresholdState(context.stressLevel >= 7 ? 'critical' : context.stressLevel >= 5 ? 'warning' : 'healthy', context.stressLevel),
    burnout: apiThresholds?.burnout || thresholdState(context.burnoutRisk > genderThresholds.criticalBurnout ? 'critical' : context.burnoutRisk >= genderThresholds.warningBurnout ? 'warning' : 'healthy', context.burnoutRisk),
    financial: apiThresholds?.financial || thresholdState(savingsStatusFromRate(context.income > 0 ? ((context.income - context.expenditure) / context.income) * 100 : 0), context.financeScore),
    wellness: apiThresholds?.wellness || thresholdState(context.recoveryScore < genderThresholds.criticalWellness ? 'critical' : context.recoveryScore < genderThresholds.warningWellness ? 'warning' : 'healthy', context.recoveryScore),
    productivity: apiThresholds?.productivity || thresholdState(context.productivityScore < 45 ? 'critical' : context.productivityScore < 65 ? 'warning' : 'healthy', context.productivityScore),
  };
}

function getGenderThresholds(gender) {
  if (gender === 'female') {
    return {
      idealSleepHours: 7.5,
      criticalSleepHours: 5.5,
      heavyStudyHours: 6,
      warningBurnout: 38,
      criticalBurnout: 68,
      warningWellness: 67,
      criticalWellness: 47,
      exerciseWeight: 5.5,
    };
  }

  return {
    idealSleepHours: 7,
    criticalSleepHours: 5,
    heavyStudyHours: 7,
    warningBurnout: 42,
    criticalBurnout: 72,
    warningWellness: 63,
    criticalWellness: 43,
    exerciseWeight: 6,
  };
}

function thresholdState(status, score) {
  return {
    score,
    status,
    severity: status === 'critical' ? 'high' : status === 'warning' ? 'medium' : 'low',
    colorState: status === 'critical' ? 'red' : status === 'warning' ? 'orange' : 'green',
  };
}

function deriveHealthState({ healthScore, burnoutState, wellnessState }) {
  if (burnoutState.status === 'critical' || wellnessState.status === 'critical' || healthScore < 45) {
    return thresholdState('critical', healthScore);
  }

  if (burnoutState.status === 'warning' || wellnessState.status === 'warning' || healthScore < 65) {
    return thresholdState('warning', healthScore);
  }

  return thresholdState('healthy', healthScore);
}

function deriveSavingsState({ rawSavingsRate }) {
  return thresholdState(savingsStatusFromRate(rawSavingsRate), rawSavingsRate);
}

function deriveBufferState({ income, expenditure }) {
  if (income <= 0) return thresholdState('warning', 0);
  const bufferRate = ((income - expenditure) / income) * 100;
  return thresholdState(savingsStatusFromRate(bufferRate), bufferRate);
}

function savingsStatusFromRate(savingsRate) {
  if (savingsRate <= 33) return 'critical';
  if (savingsRate <= 66) return 'warning';
  return 'healthy';
}

function colorStateFromSeverity(severity) {
  if (severity === 'high') return 'red';
  if (severity === 'medium') return 'orange';
  return 'green';
}

function recommendationPriority(item) {
  if (normalizeColorState(item.colorState) === 'red' || item.severity === 'high') return 3;
  if (normalizeColorState(item.colorState) === 'orange' || item.severity === 'medium') return 2;
  return 1;
}

function alignmentColorState(value) {
  if (value <= 33) return 'red';
  if (value <= 66) return 'orange';
  return 'green';
}

function sentimentFromColorState(colorState) {
  return normalizeColorState(colorState) === 'red' ? 'negative' : 'neutral';
}

function normalizeColorState(colorState = 'green') {
  const legacyMap = {
    healthy: 'green',
    warning: 'orange',
    danger: 'red',
    critical: 'red',
  };

  return legacyMap[colorState] || colorState || 'green';
}

function getVisualState(colorState = 'green') {
  const normalizedColorState = normalizeColorState(colorState);
  const states = {
    green: {
      label: 'Healthy',
      stroke: '#4f8f73',
      softStroke: '#b8d8c5',
      text: 'text-[#3f735d]',
      card: 'border-[#cfe3da]',
      icon: 'bg-[#e8f5ee] text-[#4f8f73]',
      badge: 'bg-[#e8f5ee] text-[#3f735d]',
      surface: 'bg-[#f2f8f5]',
    },
    orange: {
      label: 'Warning',
      stroke: '#c58a35',
      softStroke: '#ead0a2',
      text: 'text-[#9a6a24]',
      card: 'border-[#ead0a2] shadow-[0_14px_34px_rgba(197,138,53,0.08)]',
      icon: 'bg-[#fbf0d9] text-[#9a6a24]',
      badge: 'bg-[#fbf0d9] text-[#9a6a24]',
      surface: 'bg-[#fff8ea]',
    },
    red: {
      label: 'Critical',
      stroke: '#ff0000',
      softStroke: '#ffb3b3',
      text: 'text-[#ff0000]',
      card: 'border-[#ffb3b3] shadow-[0_16px_38px_rgba(255,0,0,0.12)]',
      icon: 'bg-[#ffe6e6] text-[#ff0000]',
      badge: 'bg-[#ffe6e6] text-[#ff0000]',
      surface: 'bg-[#fff0f0]',
    },
  };

  return states[normalizedColorState] || states.green;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function iconForCategory(category = '') {
  const text = String(category).toLowerCase();
  if (text.includes('finance') || text.includes('spending') || text.includes('saving')) return WalletIcon;
  if (text.includes('career') || text.includes('product') || text.includes('learning')) return BriefIcon;
  return MoonIcon;
}

function buildFinanceRanges({ income, expenditure, stressLevel, savingsRate, financeScore }) {
  const weeklySeries = buildFinanceSeries({
    income,
    expenditure,
    stressLevel,
    savingsRate,
    financeScore,
    points: 7,
    volatility: 7,
    rangeWeight: 0.65,
  });
  const monthlySeries = buildFinanceSeries({
    income,
    expenditure,
    stressLevel,
    savingsRate,
    financeScore,
    points: 12,
    volatility: 4.5,
    rangeWeight: 1,
  });
  const pressure = income > 0 && expenditure > income;
  const stable = savingsRate >= 20;

  return {
    '1W': {
      bars: weeklySeries,
      linePoints: buildLinePoints(weeklySeries),
      pointData: buildPointData(weeklySeries),
      labels: ['Mon', 'Thu', 'Today'],
      summary: pressure
        ? 'Weekly cashflow is dipping under spending pressure'
        : stable
          ? 'Weekly cashflow is holding a healthy surplus'
          : 'Weekly cashflow is stabilizing near baseline',
    },
    '1M': {
      bars: monthlySeries,
      linePoints: buildLinePoints(monthlySeries),
      pointData: buildPointData(monthlySeries),
      labels: ['Last Month', 'Baseline', 'Today'],
      summary: pressure
        ? '-3.8% monthly spending pressure against baseline'
        : stable
          ? '+2.4% monthly growth against baseline'
          : '+0.6% monthly stabilization against baseline',
    },
  };
}

function buildFinanceSeries({ income, expenditure, stressLevel, savingsRate, financeScore, points, volatility, rangeWeight }) {
  const pressure = income > 0 && expenditure > income;
  const trendDirection = pressure ? -1 : savingsRate > 25 ? 1 : 0.35;
  const base = clamp(financeScore - trendDirection * 22 * rangeWeight - stressLevel, 12, 82);

  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin(index * 0.9 + stressLevel * 0.2) * volatility;
    const trend = index * (trendDirection * 5.5 * rangeWeight);
    const expenseDrag = pressure ? index * 2.8 * rangeWeight : 0;
    return clamp(base + trend + wave - expenseDrag, 10, 96);
  });
}

function buildLinePoints(series) {
  return buildPointData(series).map((point) => `${point.x},${point.y}`).join(' ');
}

function buildPointData(series) {
  const step = 352 / Math.max(series.length - 1, 1);
  return series.map((value, index) => ({
    x: 8 + index * step,
    y: 140 - value * 1.25,
  }));
}

function buildAlignmentBars({
  sleepHours,
  studyHours,
  exerciseFrequency,
  stressLevel,
  rawSavingsRate,
  healthScore,
  financeScore,
  productivityScore,
  recoveryScore,
  burnoutRisk,
  hasGithub,
  hasLeetcode,
}) {
  const sleepAlignment = clamp(35 + sleepHours * 7 - Math.max(0, studyHours - 7) * 4, 8, 96);
  const stressAlignment = clamp(100 - stressLevel * 8 + exerciseFrequency * 4, 8, 96);
  const financeAlignment = clamp(55 + rawSavingsRate * 0.75 - stressLevel * 2, 8, 96);
  const careerAlignment = clamp(productivityScore + (hasGithub ? 4 : 0) + (hasLeetcode ? 4 : 0) - Math.max(0, 6 - sleepHours) * 3, 8, 96);
  const recoveryAlignment = clamp((recoveryScore + sleepAlignment + stressAlignment) / 3, 8, 96);
  const twinAlignment = clamp((healthScore + financeScore + careerAlignment + recoveryAlignment + (100 - burnoutRisk)) / 5, 8, 96);

  return [
    recoveryAlignment,
    sleepAlignment,
    careerAlignment,
    financeAlignment,
    stressAlignment,
    twinAlignment,
  ];
}

function buildRitualCalendar(date, insights) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const shortFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const streak = insights.streak || normalizeStreak();
  const completedDates = new Set(streak.completedDailyGoals.map((entry) => entry.date));

  const blanks = Array.from({ length: firstDay }, (_, index) => ({
    key: `blank-${index}`,
    type: 'blank',
  }));

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const value = index + 1;
    const isToday = value === today;
    const isFuture = value > today;
    const dateKey = formatDateKey(year, month, value);
    const completed = completedDates.has(dateKey);

    return {
      key: `day-${value}`,
      type: 'day',
      value,
      state: isToday && completed
        ? 'today-complete'
        : isToday
          ? 'today'
          : isFuture
            ? 'future'
            : completed
              ? 'done'
              : streak.streakStarted
                ? 'missed'
                : 'empty',
    };
  });

  return {
    today,
    monthShort: shortFormatter.format(date),
    currentStreak: streak.currentStreak,
    streakStarted: streak.streakStarted,
    days: [...blanks, ...days],
  };
}

function normalizeStreak(rawStreak = {}) {
  return {
    currentStreak: Number(rawStreak.currentStreak || 0),
    streakStarted: Boolean(rawStreak.streakStarted),
    lastGoalCompletionDate: rawStreak.lastGoalCompletionDate || '',
    completedDailyGoals: Array.isArray(rawStreak.completedDailyGoals) ? rawStreak.completedDailyGoals : [],
  };
}

function formatDateKey(year, month, day) {
  const safeMonth = String(month + 1).padStart(2, '0');
  const safeDay = String(day).padStart(2, '0');
  return `${year}-${safeMonth}-${safeDay}`;
}

function formatTimeLeft(date) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const secondsLeft = Math.max(0, Math.floor((endOfDay.getTime() - date.getTime()) / 1000));
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatMoney(value) {
  if (Number.isNaN(value)) return 'Add data';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function SearchIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function CalendarIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function BellIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function HeartIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.4-9-9.2C1.4 7 3.8 4 7.1 4c1.9 0 3.4 1 4.2 2.3C12.1 5 13.6 4 15.5 4 18.8 4 21.2 7 19.6 10.8 17.7 15.6 12 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function WalletIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="2" /><path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="2" /></svg>;
}

function MoonIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function BriefIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M9 7V5h6v2m-9 3h12m-14 0h18v10H4V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}

function CheckIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function LightbulbIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M9 18h6m-5 3h4m3-10a5 5 0 1 0-8.7 3.4c.7.8 1.2 1.6 1.2 2.6h5c0-1 .5-1.8 1.2-2.6A5 5 0 0 0 17 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default Dashboard;
