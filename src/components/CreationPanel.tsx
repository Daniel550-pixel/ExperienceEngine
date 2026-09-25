import React, { useState } from 'react';
import { Project, Experiment } from '../types';
import { MarsRoverSimulation } from '../simulations/MarsRoverSimulation';
import { GenericSimulation } from '../simulations/GenericSimulation';
import {
  Play,
  Pause,
  RotateCcw,
  Code,
  Activity,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Sliders,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CreationPanelProps {
  project: Project;
  activeExperiment: Experiment;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onVerifyExperiment: (resultMessage: string) => void;
  onAddLog: (log: string) => void;
  onAdvanceExperiment: () => void;
  onParameterChange: (key: string, value: number) => void;
}

type WorkspaceTab = 'workspace' | 'specs' | 'code' | 'telemetry';

export const CreationPanel: React.FC<CreationPanelProps> = ({
  project,
  activeExperiment,
  isRunning,
  onTogglePlay,
  onReset,
  onVerifyExperiment,
  onAddLog,
  onAdvanceExperiment,
  onParameterChange,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isMarsRover = project.category === 'mars-rover';

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Creation Header & View Switcher */}
      <div className="h-13 min-h-[52px] px-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            RIGHT — SYSTEM CREATION
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-mono hidden sm:inline truncate max-w-[200px]">
            {project.title}
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            WRITING LIVE
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'workspace'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Experiment Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>
        </div>
      </div>

      {/* Main Creation Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* 1. LIVE WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 relative">
              {isMarsRover ? (
                <MarsRoverSimulation
                  project={project}
                  activeExperiment={activeExperiment}
                  isRunning={isRunning}
                  onVerifyExperiment={onVerifyExperiment}
                  onAddLog={onAddLog}
                  onParameterChange={onParameterChange}
                />
              ) : (
                <GenericSimulation
                  project={project}
                  activeExperiment={activeExperiment}
                  isRunning={isRunning}
                  onVerifyExperiment={onVerifyExperiment}
                  onAddLog={onAddLog}
                />
              )}
            </div>
          </div>
        )}

        {/* 2. EXPERIMENT SPECS TAB (Matching Prompt Canonical Test Spec) */}
        {activeTab === 'specs' && (
          <div className="h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto custom-scrollbar font-mono text-xs">
            {/* Project Header Card */}
            <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  PROJECT SPECIFICATION
                </span>
                <span className="text-slate-500 text-[11px]">Category: {project.category}</span>
              </div>
              <h2 className="font-display font-bold text-slate-100 text-lg">
                {project.title}
              </h2>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Objective
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {project.objective}
                </p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Summary
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {project.summary}
                </p>
              </div>
            </div>

            {/* Active Experiment Run Card */}
            <div className="border border-cyan-500/30 rounded-xl p-5 bg-slate-900/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                    EXPERIMENT 0{activeExperiment.number}
                  </span>
                  <span className="text-slate-100 font-semibold text-sm">
                    {activeExperiment.title}
                  </span>
                </div>
                {activeExperiment.verified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                ) : (
                  <span className="text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded text-xs">
                    PENDING EXECUTION
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Specific Objective
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {activeExperiment.objective}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Hypothesis
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {activeExperiment.hypothesis}
                </p>
              </div>

              {/* [ BUILD / RUN ] Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('workspace');
                    if (!isRunning) onTogglePlay();
                    onAddLog(`[BUILD / RUN] Experiment 0${activeExperiment.number} executed in workspace.`);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 active:from-emerald-700 active:to-cyan-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>[ BUILD / RUN ]</span>
                </button>
              </div>

              {/* RESULT SECTION */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>RESULT</span>
                  {activeExperiment.verified && (
                    <span className="text-emerald-400 font-bold">100% PASS</span>
                  )}
                </div>
                <p className="text-emerald-300 text-xs leading-relaxed">
                  {activeExperiment.actualResult || activeExperiment.expectedResult}
                </p>
              </div>

              {/* NEXT EXPERIMENT */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    NEXT EXPERIMENT
                  </div>
                  <p className="text-slate-200 text-xs mt-0.5">
                    {activeExperiment.nextExperimentHint}
                  </p>
                </div>
                {project.activeExperimentIndex < project.experiments.length - 1 && (
                  <button
                    type="button"
                    onClick={onAdvanceExperiment}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors"
                  >
                    <span>Advance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. CODE & ARCHITECTURE TAB */}
        {activeTab === 'code' && (
          <div className="h-full overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-slate-100 text-sm">
                  System-generated code
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  The system writes and revises this code from the idea on the left.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="relative h-[calc(100%-72px)] min-h-[420px] rounded-xl border border-emerald-500/20 bg-[#080d12] shadow-xl overflow-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  generated.ts
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  LIVE
                </span>
              </div>
              <pre className="p-5 font-mono text-[12px] text-cyan-100/90 leading-6 whitespace-pre-wrap">
                <code>{project.codeSnippet || '// Waiting for an idea...'}</code>
              </pre>
            </div>

            {/* Markdown representation (project.txt) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-semibold text-slate-200 text-xs">
                  Markdown Specification (project.txt)
                </h4>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {project.markdownDoc}
              </div>
            </div>
          </div>
        )}

        {/* 4. TELEMETRY & LOGS TAB */}
        {activeTab === 'telemetry' && (
          <div className="h-full overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto custom-scrollbar font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200">EXPERIMENT LOG STREAM</span>
              </div>
              <span className="text-[11px] text-slate-500">Live Telemetry & Milestones</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 shadow-inner min-h-[300px]">
              {activeExperiment.logs.length === 0 ? (
                <div className="text-slate-500 italic py-8 text-center">
                  No logs recorded yet. Drive the rover or run the simulation to produce telemetry.
                </div>
              ) : (
                activeExperiment.logs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-500 font-bold select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
