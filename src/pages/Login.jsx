import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/patients");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-6 text-ink">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-line bg-white p-10 shadow-soft">
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-brand text-brand shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </span>
            Aster Medcare
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4.5 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        <label className="field-label" htmlFor="email">
          Email Address
        </label>
        <input 
          id="email" 
          type="email"
          className="input mb-5" 
          placeholder="Enter email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input 
          id="password" 
          type="password" 
          className="input mb-8" 
          placeholder="Enter password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="button-primary w-full flex items-center justify-center" type="submit" disabled={loading}>
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </main>
  );
}
