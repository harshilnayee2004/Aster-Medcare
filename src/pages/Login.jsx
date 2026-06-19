import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/patients");
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

        <label className="field-label" htmlFor="username">
          Username
        </label>
        <input id="username" className="input mb-5" placeholder="Enter username" />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input id="password" type="password" className="input mb-8" placeholder="Enter password" />

        <button className="button-primary w-full" type="submit">
          Login
        </button>
      </form>
    </main>
  );
}
