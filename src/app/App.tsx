import { WorldMap } from "@/features/map/WorldMap";

export function App() {
  return (
    <main className="flex h-full flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h1 className="font-semibold text-lg tracking-tight">Capitaloc</h1>
        <span className="text-slate-500 text-sm">Setup preview</span>
      </header>
      <div className="relative flex-1">
        <WorldMap />
      </div>
    </main>
  );
}
