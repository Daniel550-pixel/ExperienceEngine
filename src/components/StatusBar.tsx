import React from 'react';
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Database } from 'lucide-react';

interface StatusBarProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  category: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  category,
}) => {
  return (
    <footer className="h-10 min-h-[40px] border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 font-mono text-[11px] select-none z-20">
      {/* Left: System Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">EXPERIENCE:</span>
          <span className="text-emerald-400">ONLINE</span>
        </div>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>Local Storage: Synced</span>
        </div>
      </div>

      {/* Center: Play / Pause & Reset Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors shadow-sm cursor-pointer ${
            isRunning
              ? 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
          }`}
          title={isRunning ? 'Pause Simulation' : 'Run Simulation'}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-amber-300" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              <span>Run</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Reset Simulation State"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Right: Key Hints & FPS */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[10px]">
          {category === 'mars-rover' ? (
            <>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">W A S D</span>
              <span>Drive</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Space</span>
              <span>Brake</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Click</span>
              <span>Waypoint</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">E</span>
              <span>Drill</span>
            </>
          ) : (
            <span>Click canvas to interact</span>
          )}
        </div>
        <span className="text-slate-700 hidden lg:inline">|</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">{isRunning ? '60' : '0'} FPS</span>
        </div>
      </div>
    </footer>
  );
};
