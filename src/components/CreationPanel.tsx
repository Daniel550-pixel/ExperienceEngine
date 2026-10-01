import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Project, Experiment } from '../types';
import { MarsRoverSimulation } from '../simulations/MarsRoverSimulation';
import { GenericSimulation } from '../simulations/GenericSimulation';
import {
  Play,
  Pause,
  RotateCcw,
  Code2,
  Activity,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  FileText,
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  LayoutTemplate,
  MousePointer2,
  Smartphone,
  Monitor,
  Tablet,
  WandSparkles,
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
  onCodeChange: (code: string) => void;
}

type WorkspaceTab = 'code' | 'design' | 'workspace' | 'specs' | 'telemetry';
type CodeFile = { id: string; name: string; language: string; content: string; generated: boolean };

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
  onCodeChange,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeFileId, setActiveFileId] = useState('generated');
  const [designViewport, setDesignViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [designMode, setDesignMode] = useState<'preview' | 'system'>('preview');

  const code = project.codeSnippet || '// Waiting for your idea...';
  const extension = project.codeLanguage?.extension || 'ts';
  const languageName = project.codeLanguage?.name || 'TypeScript';
  const files = useMemo<CodeFile[]>(() => [
    {
      id: 'generated',
      name: `generated.${extension}`,
      language: languageName,
      content: code,
      generated: true,
    },
    {
      id: 'spec',
      name: 'SPEC.md',
      language: 'Markdown',
      content: `# ${project.title}\n\n${project.objective}\n\n## Intention\n${project.intention}\n\n## Summary\n${project.summary}`,
      generated: true,
    },
  ], [code, extension, languageName, project.title, project.objective, project.intention, project.summary]);

  const activeFile = files.find((file) => file.id === activeFileId) || files[0];
  const [codeDraft, setCodeDraft] = useState(code);
  const [codeDirty, setCodeDirty] = useState(false);
  const codeDraftRef = useRef(code);
  const lastSavedCodeRef = useRef(code);
  const activeContent = activeFile.id === 'generated' ? codeDraft : activeFile.content;
  const lines = useMemo(() => activeContent.split('\n'), [activeContent]);

  useEffect(() => {
    // AI generation can update the project while the user is typing. Never
    // overwrite an unsaved manual edit with a background generation result.
    if (!codeDirty) {
      setCodeDraft(code);
      codeDraftRef.current = code;
      lastSavedCodeRef.current = code;
    }
  }, [code, codeDirty]);

  const saveCode = () => {
    const nextCode = codeDraftRef.current;
    if (nextCode === lastSavedCodeRef.current) return;
    onCodeChange(nextCode);
    lastSavedCodeRef.current = nextCode;
    setCodeDirty(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCodeChange]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      setCopiedCode(false);
    }
  };

  const isMarsRover = project.category === 'mars-rover';

  const tabClass = (tab: WorkspaceTab) =>
    `px-2.5 py-1.5 rounded-md text-[10px] font-mono flex items-center gap-1.5 transition-colors ${
      activeTab === tab
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
    }`;

  return (
    <div className={`h-full flex flex-col bg-[#070b10] overflow-hidden ${expanded ? 'fixed inset-0 z-50' : ''}`}>
      <header className="min-h-[52px] px-3 md:px-4 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] md:text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase shrink-0">
            RIGHT — CREATION
          </span>
          <span className="text-slate-700">/</span>
          <span className="text-[10px] font-mono text-slate-400 truncate">
            {activeFile.name} · {activeFile.language}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => setActiveTab('code')} className={tabClass('code')}>
            <Code2 className="w-3.5 h-3.5" /> Code
          </button>
          <button type="button" onClick={() => setActiveTab('design')} className={tabClass('design')}>
            <Palette className="w-3.5 h-3.5" /> Design
          </button>
          <button type="button" onClick={() => setActiveTab('workspace')} className={tabClass('workspace')}>
            <Activity className="w-3.5 h-3.5" /> Run
          </button>
          <button type="button" onClick={() => setActiveTab('specs')} className={tabClass('specs')}>
            <Sparkles className="w-3.5 h-3.5" /> Specs
          </button>
          <button type="button" onClick={() => setActiveTab('telemetry')} className={tabClass('telemetry')}>
            <Terminal className="w-3.5 h-3.5" /> Logs
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-1 p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-900"
            title={expanded ? 'Exit focus mode' : 'Focus code'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full flex flex-col min-w-0">
            <div className="flex items-center border-b border-slate-800/70 bg-[#080d13] shrink-0 overflow-x-auto">
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    if (file.id === activeFileId) return;
                    saveCode();
                    setActiveFileId(file.id);
                    setCopiedCode(false);
                  }}
                  className={`px-3 py-2 text-[10px] font-mono border-r border-slate-800 flex items-center gap-2 whitespace-nowrap ${
                    file.id === activeFileId ? 'bg-[#0a1017] text-slate-100 border-t border-t-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  {file.name}
                  {file.id === 'generated' && <span className="text-[8px] text-emerald-400">AI</span>}
                </button>
              ))}
              <span className="ml-auto px-3 text-[9px] font-mono text-slate-600 whitespace-nowrap">{files.length} FILES</span>
            </div>

            <div className="px-3 md:px-4 py-2.5 border-b border-slate-800/70 bg-[#0a1017] flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    {activeFile.id === 'generated' ? 'Live implementation' : 'Project specification'}
                  </span>
                  {codeDirty && activeFile.id === 'generated' && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-300">UNSAVED</span>}
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-300">
                    {activeFile.id === 'generated' ? 'LIVE' : 'READ ONLY'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                  {activeFile.id === 'generated'
                    ? 'AI generation updates this file without overwriting unsaved edits.'
                    : 'Generated project specification derived from the current intention.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-mono text-slate-600">{activeContent.length.toLocaleString()} chars</span>
                {codeDirty && activeFile.id === 'generated' && (
                  <button
                    type="button"
                    onClick={saveCode}
                    className="px-2 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[10px] font-mono flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 text-[10px] font-mono flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto bg-[#05080c]">
              <div className="flex min-h-full min-w-max font-mono text-[12px] md:text-[13px] leading-6">
                <div className="w-12 shrink-0 select-none text-right pr-3 text-slate-700 bg-[#05080c] border-r border-slate-900">
                  {lines.map((_, index) => <div key={index} className="h-6">{index + 1}</div>)}
                </div>
                <textarea
                  readOnly={activeFile.id !== 'generated'}
                  value={activeContent}
                  onChange={(event) => {
                    if (activeFile.id !== 'generated') return;
                    const nextCode = event.target.value;
                    setCodeDraft(nextCode);
                    codeDraftRef.current = nextCode;
                    setCodeDirty(nextCode !== lastSavedCodeRef.current);
                  }}
                  onBlur={saveCode}
                  spellCheck={false}
                  wrap="off"
                  aria-label={activeFile.id === 'generated' ? 'Editable generated code' : 'Project specification'}
                  className="min-w-[calc(100vw-540px)] min-h-full resize-none outline-none border-0 bg-transparent text-slate-200 px-4 py-0 leading-6 whitespace-pre overflow-visible caret-emerald-400 read-only:text-slate-400"
                />
              </div>
            </div>

            <div className="h-7 shrink-0 border-t border-slate-800/70 bg-slate-950 flex items-center justify-between px-3 text-[9px] font-mono text-slate-600">
              <span>{codeDirty ? 'LOCAL EDIT · PRESS CTRL+S TO SAVE' : 'EXPERIENCE ENGINE · GENERATION STREAM'}</span>
              <span>{project.promptStats?.estimatedTokens?.toLocaleString() || '—'} est. prompt tokens</span>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="h-full flex flex-col bg-[#05080c] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/70 bg-[#0a1017] flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-300" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-slate-100 uppercase">Professional UI / UX Studio</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-mono text-cyan-300">AI DESIGN</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Design, validate and refine the experience before implementation.</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button type="button" onClick={() => setDesignMode('preview')} className={designMode === 'preview' ? 'px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-mono' : 'px-2 py-1 rounded text-slate-500 text-[9px] font-mono'}>Preview</button>
                <button type="button" onClick={() => setDesignMode('system')} className={designMode === 'system' ? 'px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-mono' : 'px-2 py-1 rounded text-slate-500 text-[9px] font-mono'}>Design System</button>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/70 bg-slate-950 shrink-0">
              <div className="flex items-center gap-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((viewport) => {
                  const Icon = viewport === 'desktop' ? Monitor : viewport === 'tablet' ? Tablet : Smartphone;
                  return <button key={viewport} type="button" onClick={() => setDesignViewport(viewport)} className={designViewport === viewport ? 'px-2 py-1.5 rounded bg-slate-800 text-slate-100 flex items-center gap-1.5 text-[9px] font-mono' : 'px-2 py-1.5 rounded text-slate-500 hover:text-slate-200 flex items-center gap-1.5 text-[9px] font-mono'}><Icon className="w-3 h-3" />{viewport}</button>;
                })}
              </div>
              <span className="text-[9px] font-mono text-slate-600">RESPONSIVE DESIGN VALIDATION</span>
            </div>

            {designMode === 'preview' ? (
              <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
                <div className={`mx-auto h-full min-h-[520px] rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden transition-all ${designViewport === 'desktop' ? 'w-full' : designViewport === 'tablet' ? 'w-[min(768px,100%)]' : 'w-[min(390px,100%)]'}`}>
                  <div className="h-9 border-b border-slate-800 bg-[#0b1118] flex items-center px-3 gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400/70" /><span className="w-2 h-2 rounded-full bg-amber-400/70" /><span className="w-2 h-2 rounded-full bg-emerald-400/70" />
                    <div className="ml-3 flex-1 h-5 rounded bg-slate-900 border border-slate-800 text-[8px] text-slate-600 font-mono flex items-center px-2">experience-engine.local / {project.title.toLowerCase().replace(/\\s+/g, '-')}</div>
                  </div>
                  <div className="p-5 md:p-8 space-y-5 bg-gradient-to-br from-slate-950 via-[#09121a] to-slate-950 h-[calc(100%-36px)]">
                    <div className="flex items-center justify-between gap-3">
                      <div><div className="text-[9px] font-mono tracking-[0.2em] text-cyan-400 uppercase">Experience Engine</div><h2 className="text-xl md:text-2xl font-bold text-white mt-1">{project.title}</h2></div>
                      <button type="button" className="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold flex items-center gap-1.5"><WandSparkles className="w-3 h-3" /> CREATE</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 min-h-[170px]"><div className="text-[8px] font-mono text-slate-500 uppercase">Primary experience</div><div className="mt-3 h-4 w-2/3 rounded bg-slate-800" /><div className="mt-2 h-3 w-full rounded bg-slate-900" /><div className="mt-2 h-3 w-5/6 rounded bg-slate-900" /><div className="mt-6 flex gap-2"><div className="h-8 w-24 rounded-lg bg-cyan-500/80" /><div className="h-8 w-20 rounded-lg border border-slate-700" /></div></div>
                      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"><div className="text-[8px] font-mono text-cyan-300 uppercase">UX signal</div><div className="text-2xl font-bold text-white mt-3">{designViewport === 'desktop' ? '98' : designViewport === 'tablet' ? '94' : '91'}%</div><div className="text-[9px] font-mono text-slate-500 mt-1">layout consistency</div><div className="mt-5 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full w-[94%] bg-cyan-400 rounded-full" /></div></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{['Hierarchy','Navigation','Accessibility','Responsive'].map((item) => <div key={item} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"><div className="text-[8px] font-mono text-slate-500 uppercase">{item}</div><div className="mt-2 text-[10px] text-emerald-300 font-mono">READY</div></div>)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['Layout','12-column responsive grid'],['Typography','Display / body / mono'],['Spacing','4px base rhythm'],['Interaction','Hover / focus / active']].map(([label,value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="text-[8px] font-mono text-cyan-400 uppercase">{label}</div><div className="text-[11px] text-slate-200 mt-2">{value}</div></div>)}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 font-bold uppercase"><LayoutTemplate className="w-3.5 h-3.5 text-cyan-300" /> Component architecture</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">{['Navigation','Hero / Workspace','Action Bar','Data Card','Form Controls','Status / Feedback','Modal / Overlay','Empty State'].map((item) => <div key={item} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-[9px] font-mono text-slate-400 flex items-center gap-2"><MousePointer2 className="w-3 h-3 text-slate-600" />{item}</div>)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/70 bg-slate-950 shrink-0">
              <span className="text-[10px] font-mono text-slate-400">EXECUTION WORKSPACE</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={onReset} className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-slate-200"><RotateCcw className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={onTogglePlay} className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                  {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isRunning ? 'Pause' : 'Run'}
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {isMarsRover ? (
                <MarsRoverSimulation project={project} activeExperiment={activeExperiment} isRunning={isRunning} onVerifyExperiment={onVerifyExperiment} onAddLog={onAddLog} onParameterChange={onParameterChange} />
              ) : (
                <GenericSimulation project={project} activeExperiment={activeExperiment} isRunning={isRunning} onVerifyExperiment={onVerifyExperiment} onAddLog={onAddLog} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar font-mono text-xs">
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-3">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">PROJECT SPECIFICATION</span>
              <h2 className="font-display font-bold text-slate-100 text-lg">{project.title}</h2>
              <p className="text-slate-300 leading-relaxed">{project.objective}</p>
              <p className="text-slate-500 leading-relaxed">{project.summary}</p>
            </div>
            <div className="border border-cyan-500/20 rounded-xl p-4 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-bold">EXPERIMENT 0{activeExperiment.number}</span>
                {activeExperiment.verified && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED</span>}
              </div>
              <div><div className="text-[9px] text-slate-500 uppercase">Objective</div><p className="text-slate-200 mt-1">{activeExperiment.objective}</p></div>
              <div><div className="text-[9px] text-slate-500 uppercase">Hypothesis</div><p className="text-slate-300 mt-1">{activeExperiment.hypothesis}</p></div>
              <button
                type="button"
                onClick={() => { setActiveTab('workspace'); if (!isRunning) onTogglePlay(); onAddLog(`[BUILD / RUN] Experiment 0${activeExperiment.number} executed.`); }}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> BUILD / RUN
              </button>
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                <div className="text-[9px] text-slate-500 uppercase">Result</div>
                <p className="text-emerald-300 mt-1">{activeExperiment.actualResult || activeExperiment.expectedResult}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="h-full overflow-y-auto p-4 md:p-6 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-200">EXPERIMENT LOG STREAM</span>
              <span className="text-[10px] text-slate-600">LIVE TELEMETRY</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 min-h-[300px]">
              {activeExperiment.logs.length === 0 ? (
                <div className="text-slate-600 text-center py-10">No logs recorded yet.</div>
              ) : activeExperiment.logs.map((log, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed flex gap-2">
                  <span className="text-cyan-500">&gt;</span><span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
