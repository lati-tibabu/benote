import { Link, Outlet } from "react-router-dom";

function AuthPages() {
  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-900"
      style={{ fontFamily: "'Sora', 'Manrope', 'Segoe UI', sans-serif" }}
    >
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/rect19.png" alt="Benote logo" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-semibold tracking-wide">Benote</span>
          </Link>

        </header>

        <main className="grid flex-1 grid-cols-1 items-center gap-8 py-8 lg:grid-cols-12 lg:py-12">
          <aside className="hidden rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm lg:col-span-5 lg:block">
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-900">
              Keep your work, study, and team execution in one place.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Sign in to continue where you left off, or create your account to launch
              a focused productivity workspace.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="rounded-lg bg-slate-50 px-3 py-2">Plan tasks with structure</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">Generate AI summaries instantly</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">Collaborate with team context</li>
            </ul>
          </aside>

          <section className="lg:col-span-7">
            <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AuthPages;
