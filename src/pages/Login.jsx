import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Welcome overlay states
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      setWelcomeUser(user);
      setShowWelcome(true);
      
      // Deliberate delay for the premium welcome interstitial
      setTimeout(() => {
        navigate("/patients");
      }, 1500);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  }

  const getWelcomeMessage = () => {
    if (!welcomeUser) return "Welcome to Aster Medcare";
    const name = welcomeUser.name || "User";
    const role = welcomeUser.role;
    if (role === "admin") {
      return `Welcome back, System Administrator`;
    }
    if (role === "doctor") {
      return `Welcome, ${name}`;
    }
    return `Welcome back, ${name}`;
  };

  if (showWelcome) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white p-8">
        <div className="text-center space-y-6 animate-scale-up">
          <div className="flex justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shadow-soft animate-pulse">
              <svg className="h-9.5 w-9.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Signing in to workspace...</p>
          </div>
          <div className="flex justify-center pt-4">
            <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-900 font-sans w-full">
      {/* Left side panel - split layout */}
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Abstract background shapes for premium look */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-soft">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </span>
          <span className="font-extrabold tracking-tight">Aster Medcare</span>
        </div>

        <div className="space-y-8 max-w-lg z-10">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-brand/20 border border-brand/30 rounded-full text-xxs font-bold uppercase tracking-wider text-brand">Industrial Health Suite</span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">Digitizing Industrial Health Checkups</h2>
          </div>
          
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <span className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-brand text-white shrink-0 mt-0.5 shadow-sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div>
                <p className="font-bold text-sm text-slate-100">Fast Form Filling</p>
                <p className="text-xs text-slate-400 mt-0.5">Automated workflows tailored for rapid data capture and diagnostics entry.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-brand text-white shrink-0 mt-0.5 shadow-sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </span>
              <div>
                <p className="font-bold text-sm text-slate-100">Cloud Sync & Storage</p>
                <p className="text-xs text-slate-400 mt-0.5">Real-time sync ensures diagnostics and files are saved and synced instantly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-brand text-white shrink-0 mt-0.5 shadow-sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div>
                <p className="font-bold text-sm text-slate-100">24 Medical Forms</p>
                <p className="text-xs text-slate-400 mt-0.5">Full support for the complete suite of factory and diagnostic medical reports.</p>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 font-medium">© 2026 Aster Medcare. All rights reserved.</p>
      </section>

      {/* Right side form panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl border border-line p-8 sm:p-10 shadow-soft animate-fade-in">
          <div className="mb-8">
            <span className="lg:hidden flex items-center gap-2 mb-6 text-brand font-bold text-lg">
              <span className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-brand text-white shadow-soft">
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </span>
              Aster Medcare
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">Please sign in to access your workspace</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-semibold flex items-start gap-2.5">
              <svg className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5 mb-8">
            <div>
              <label className="field-label" htmlFor="email">
                Email Address
              </label>
              <input 
                id="email" 
                type="email"
                className="input" 
                placeholder="name@astermedcare.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  className="input pr-11" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition flex items-center justify-center"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button className="button-primary w-full flex items-center justify-center shadow-md font-bold" type="submit" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying credentials...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
