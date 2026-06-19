export default function Topbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-24 items-center justify-between border-b border-line bg-white px-8">
      <button className="grid h-10 w-10 place-items-center rounded-md text-2xl text-slate-700 hover:bg-slate-50" aria-label="Menu">
        ≡
      </button>
      <div className="flex items-center gap-6 text-slate-700">
        <button className="grid h-10 w-10 place-items-center rounded-md text-xl hover:bg-slate-50" aria-label="Notifications">
          ♧
        </button>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-lg text-slate-700">A</div>
          <span className="font-medium text-ink">Admin⌄</span>
        </div>
      </div>
    </header>
  );
}
