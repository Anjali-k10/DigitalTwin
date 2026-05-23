import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function MainLayout() {
  const location = useLocation();
  const hasDashboardHeader = location.pathname === '/dashboard';

  return (
    <main className="h-screen overflow-hidden bg-[#edf4f7] text-zinc-950">
      <div className="flex h-screen">
        <Sidebar />
        <section className="h-screen min-w-0 flex-1 overflow-y-auto">
          {!hasDashboardHeader && <Navbar />}
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default MainLayout;
