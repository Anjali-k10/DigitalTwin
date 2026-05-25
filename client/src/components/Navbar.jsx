import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Your Digital Twin dashboard',
  '/health': 'Health signals',
  '/finance': 'Financial patterns',
  '/career': 'Career',
  '/intelligence': 'Cross-domain intelligence',
  '/simulation': 'Scenario simulation',
  '/copilot': 'Twin Copilot',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

function Navbar() {
  const location = useLocation();
  const user = getStoredUser();
  const firstName = user?.firstName || 'Anjali';
  const pageTitle = pageTitles[location.pathname] || 'DigitalTwin workspace';

  return (
    <header className="sticky top-0 z-10 border-b border-[#d8e5ea] bg-[#fbfdfe]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#416f82]">Good Evening, {firstName}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c8dbe2] bg-white text-[#405965] transition hover:bg-[#f3f8fa]" type="button" aria-label="Notifications">
            <BellIcon className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#416f82] text-sm font-semibold text-white" type="button" aria-label="Profile">
            {firstName.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function BellIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default Navbar;
