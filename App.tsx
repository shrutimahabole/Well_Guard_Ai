import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { PredictGuard } from './pages/PredictGuard';
import { FitGuard } from './pages/FitGuard';
import { MindGuard } from './pages/MindGuard';
import { RescueGuard } from './pages/RescueGuard';
import { FundGuard } from './pages/FundGuard';
import { Login } from './pages/Login';
import { PageType } from './types';
import { supabase } from './utils/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(error.message);
        setUser(data.session?.user ?? null);
      })
      .catch((error: unknown) => {
        if (active) {
          setAuthError(error instanceof Error ? error.message : 'Unable to restore your sign-in session.');
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Restoring your session...
      </div>
    );
  }

  if (!user) return <Login authError={authError} />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'predict-guard':
        return <PredictGuard />;
      
      case 'fit-guard':
        return <FitGuard />;
      case 'mind-guard':
        return <MindGuard />;
     
      case 'rescue-guard':
        return <RescueGuard />;
     
      case 'fund-guard':
        return <FundGuard />;
     
    
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="lg:ml-64">
        <Navbar
          email={user.email ?? 'Member'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSignOut={handleSignOut}
        />

        <main className="pt-20 px-4 lg:px-8 pb-12">
          {authError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </p>
          )}
          <div className="animate-fadeIn">{renderPage()}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
