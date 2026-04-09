import { X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { login, register } from "../api/services/auth.service"

export const LoginModal = ({ setIsSignInOpen, setUser }: { setIsSignInOpen: (isOpen: boolean) => void; setUser: (user: { email: string; username?: string }) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");

const submit = async () => {
  try {
    if (mode === "register") {
      const data = await register({ email, password, fullName });
      setUser({ email: data.user.email, username: data.user.fullName ?? undefined });
      toast.success("Account created successfully!");
    } else {
      const data = await login({ email, password });
      setUser({ email: data.user.email, username: data.user.fullName ?? undefined });
      toast.success("Signed in successfully!");
    }

    setIsSignInOpen(false);
  } catch (err: unknown) {
    const errorMessage = (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error
      || (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.message
      || (err as { message?: string })?.message
      || "Something went wrong. Please try again.";
    toast.error(errorMessage);
  }
};
  return (
   <div
      role="presentation"
      onClick={() => setIsSignInOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-5 py-8 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Sign in" : "Sign up"}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#151a33]"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300/70">
              {mode === "login"
                ? "Continue to access your shortened links."
                : "Create an account to start shortening links."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setIsSignInOpen(false)}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {mode === "register" && (
            <>
              <label
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-white/15 dark:bg-[#0f1327] dark:text-slate-100"
              />
            </>
          )}

          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-white/15 dark:bg-[#0f1327] dark:text-slate-100"
          />

          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-white/15 dark:bg-[#0f1327] dark:text-slate-100"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-2.5">
          <button
            type="button"
            className="rounded-xl mt-3 w-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            onClick={submit}
          >
            {mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-300/70">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={() => setMode("register")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </section>
    </div>
  )
}