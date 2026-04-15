import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { tokenStorage } from './api/baseClient';
import { getCurrentUser } from './api/services/auth.service';
import type { AppUser } from './types/user';

const THEME_STORAGE_KEY = 'theme';

function App() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) === 'dark',
  );
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const hasStoredTokens = Boolean(
        tokenStorage.getAccessToken() || tokenStorage.getRefreshToken(),
      );

      if (!hasStoredTokens) {
        if (isMounted) {
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser({
            email: currentUser.email,
            username: currentUser.fullName ?? undefined,
          });
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f3f4f8] text-slate-900 transition-colors duration-300 dark:bg-[#0d1020] dark:text-slate-100">
      <div className="soft-glow soft-glow-left pointer-events-none" />
      <div className="soft-glow soft-glow-right pointer-events-none" />

      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        setIsSignInOpen={setIsSignInOpen}
        user={user}
        setUser={setUser}
        isAuthLoading={isAuthLoading}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
      </Routes>

      <footer className="relative z-10 border-t border-slate-200/70 py-7 text-center dark:border-white/10">
        <p className="text-lg text-indigo-950/55 dark:text-indigo-100/55">
          © 2026 Shorten. Built with precision.
        </p>
      </footer>

      {isSignInOpen && (
        <LoginModal setIsSignInOpen={setIsSignInOpen} setUser={setUser} />
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
