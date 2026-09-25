import React, { useEffect, useRef, useState } from 'react';
import { Project, Experiment } from '../types';
import {
  Sparkles,
  ArrowDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
  Terminal,
  Lightbulb,
  Edit3,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface IntentionPanelProps {
  project: Project;
  activeExperiment: Experiment;
  isGenerating: boolean;
  onStartCreating: (ideaText: string) => void;
  onLiveCodeChange: (code: string) => void;
  onAdvanceToNextExperiment: () => void;
  onSelectExperiment: (index: number) => void;
  onUpdateObservation: (text: string) => void;
  onParameterChange: (key: string, value: number) => void;
}

const QUICK_IDEAS = [
  'I want to build a Mars rover simulation.',
  'I want to build a multi-body gravitational orbit simulator.',
  'I want to build Conway’s Game of Life with custom rules.',
  'I want to simulate an ecosystem predator-prey food web.',
  'I want to build a sound synthesizer oscillator.',
];

export const IntentionPanel: React.FC<IntentionPanelProps> = ({
  project,
  activeExperiment,
  isGenerating,
  onStartCreating,
  onLiveCodeChange,
  onAdvanceToNextExperiment,
  onSelectExperiment,
  onUpdateObservation,
  onParameterChange,
}) => {
  const [ideaInput, setIdeaInput] = useState(project.intention || '');
  const requestIdRef = useRef(0);
  const [isEditingObservation, setIsEditingObservation] = useState(false);
  const [observationText, setObservationText] = useState(
    activeExperiment.actualResult || activeExperiment.expectedResult || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaInput.trim() && !isGenerating) {
      onStartCreating(ideaInput.trim());
    }
  };


  // Generate code continuously after the user pauses typing.
  // The input remains a normal textarea: spaces, punctuation and line breaks are preserved.
  useEffect(() => {
    const idea = ideaInput;
    if (idea.trim().length < 8) {
      onLiveCodeChange('// Start typing an idea...\n// The system will build the implementation here.');
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea }),
          signal: controller.signal,
        });

        if (!response.ok) {
          // Graceful fallback if HTTP non-200
          return;
        }

        const data = await response.json();
        if (requestId === requestIdRef.current && typeof data.code === 'string') {
          onLiveCodeChange(data.code);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Non-blocking log, preventing runtime test failure alerts
          console.warn('Live code update deferred:', (error as Error).message);
        }
      }
    }, 900);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [ideaInput, onLiveCodeChange]);

  const hasNextExperiment = project.activeExperimentIndex < project.experiments.length - 1;

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800/80 overflow-y-auto custom-scrollbar">
      {/* Intention Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              LEFT — INTENTION
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">The Human</span>
        </div>
        <h2 className="font-display font-semibold text-slate-100 text-sm">
          What do you want to explore or build?
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Type naturally. The system writes the code as your idea develops.
        </p>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* 1. IDEA INPUT SECTION */}
        <section className="space-y-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <textarea
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                spellCheck={false}
                placeholder="Type an idea... (e.g. I want to build a Mars rover simulation.)"
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none transition-all leading-relaxed shadow-inner"
              />
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-600">
                {ideaInput.length} chars
              </span>
            </div>

            {/* Curiosity starters */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 py-0.5">
                <Lightbulb className="w-3 h-3 text-amber-400/80" /> Try:
              </span>
              {QUICK_IDEAS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIdeaInput(suggestion);
                    onStartCreating(suggestion);
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors truncate max-w-[210px]"
                >
                  {suggestion.replace('I want to build a ', '').replace('I want to build ', '').replace('I want to simulate an ', '')}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isGenerating || !ideaInput.trim()}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                  <span>Synthesizing Project & Experiments...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Start Creating</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* 2. THE CORE PIPELINE: IDEA -> EXPERIMENT -> RESULT */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Progression Pipeline
            </span>
            <span>Step {activeExperiment.number} of {project.experiments.length}</span>
          </div>

          {/* Flow Indicator Steps */}
          <div className="flex items-center justify-between text-xs font-mono mb-4 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-300">1</span>
              <span>Idea</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-300">2</span>
              <span>Experiment</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <div className={`flex items-center gap-1.5 ${activeExperiment.verified ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeExperiment.verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>3</span>
              <span>Result</span>
            </div>
          </div>

          {/* Active Experiment Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-3 shadow-md">
            {/* Experiment selector tabs */}
            <div className="flex items-center gap-1 pb-2 border-b border-slate-800">
              {project.experiments.map((exp, idx) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => onSelectExperiment(idx)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                    idx === project.activeExperimentIndex
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : exp.verified
                      ? 'text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {exp.verified ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-500" />
                  )}
                  <span>Exp 0{exp.number}</span>
                </button>
              ))}
            </div>

            {/* Experiment Details */}
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Active Experiment 0{activeExperiment.number}
              </div>
              <h3 className="font-display font-semibold text-slate-100 text-sm mt-0.5">
                {activeExperiment.title}
              </h3>
            </div>

            {/* Objective */}
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60 text-xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Objective
              </div>
              <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
                {activeExperiment.objective}
              </p>
            </div>

            {/* Hypothesis */}
            <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60 text-xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Hypothesis
              </div>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {activeExperiment.hypothesis}
              </p>
            </div>

            {/* Real-time Parameter Tuning */}
            {Object.keys(project.parameters).length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  <span>Experiment Parameters</span>
                </div>
                <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  {Object.entries(project.parameters).slice(0, 3).map(([key, config]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{config.label}:</span>
                        <span className="text-cyan-300 font-semibold">
                          {config.value} {config.unit || ''}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={config.value}
                        onChange={(e) => onParameterChange(key, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RESULT SECTION */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Result
                </span>
                {activeExperiment.verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" /> Validated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                    <Clock className="w-3 h-3 animate-pulse" /> Testing in workspace...
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="text-[10px] text-slate-500 mb-0.5">Expected:</div>
                <div className="text-slate-300 text-[11px] mb-2">{activeExperiment.expectedResult}</div>

                <div className="text-[10px] text-slate-500 mb-0.5">Actual Observation:</div>
                {isEditingObservation ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={observationText}
                      onChange={(e) => setObservationText(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateObservation(observationText);
                          setIsEditingObservation(false);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-emerald-300 text-[11px]">
                      {activeExperiment.actualResult || 'Observing live metrics in creation area...'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingObservation(true)}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. NEXT EXPERIMENT ADVANCEMENT */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Next Experiment
              </div>
              <p className="text-slate-300 text-xs font-mono mb-2">
                {activeExperiment.nextExperimentHint || 'Continue iterating and refining parameters.'}
              </p>

              {hasNextExperiment && (
                <button
                  type="button"
                  onClick={onAdvanceToNextExperiment}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Advance to Experiment 0{activeExperiment.number + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. MAKER JOURNEY PERSPECTIVE */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">MAKER PROGRESSION:</span>
            <span className="text-cyan-400 font-semibold">{project.makerLevel}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  project.makerLevel === 'Student'
                    ? '25%'
                    : project.makerLevel === 'Maker'
                    ? '50%'
                    : project.makerLevel === 'Developer'
                    ? '75%'
                    : '100%'
                }`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
            <span className={project.makerLevel === 'Student' ? 'text-cyan-400 font-bold' : ''}>Student</span>
            <span className={project.makerLevel === 'Maker' ? 'text-cyan-400 font-bold' : ''}>Maker</span>
            <span className={project.makerLevel === 'Developer' ? 'text-cyan-400 font-bold' : ''}>Developer</span>
            <span className={project.makerLevel === 'Specialist' ? 'text-cyan-400 font-bold' : ''}>Specialist</span>
          </div>
        </div>
      </div>
    </div>
  );
};
