import { Moon, Scissors, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "../api/services/auth.service";


export const Navbar = ({ user, setUser, isDark, setIsDark, setIsSignInOpen, isAuthLoading }: { user: { email: string; username?: string } | null; setUser: (user: { email: string; username?: string } | null) => void; isDark: boolean; setIsDark: (isDark: boolean) => void; setIsSignInOpen: (isOpen: boolean) => void; isAuthLoading: boolean }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  async function onLogout() {
    try {
      await logout();
      setUser(null);
      setDropdownOpen(false);
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  }
  return (
    <header className="relative z-20 border-b border-slate-200/70 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/35">
            <Scissors size={16} />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Shorten</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setIsDark(!isDark)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAuthLoading ? (
            <div className="rounded-full border border-slate-300/90 bg-white/70 px-5 py-1.5 text-base font-medium text-slate-500 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-slate-300">
              Loading...
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="cursor-pointer rounded-full border border-slate-300/90 bg-white/70 px-5 py-1.5 text-base font-medium text-slate-900 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
              >
                {user.username || user.email}
              </div>

              {dropdownOpen && (
                <div className="absolute overflow-hidden right-0 mt-2 w-36 rounded-lg border border-slate-200/70 bg-white shadow-lg dark:border-white/15 dark:bg-[#0f1327] z-50">
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    My Links
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="rounded-full border border-slate-300/90 bg-white/70 px-5 py-1.5 text-base font-medium text-slate-900 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}