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
  Save,
  RefreshCw,
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
  onDesignChange: (designSystem: NonNullable<Project['designSystem']>) => void;
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
  onDesignChange,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeFileId, setActiveFileId] = useState('generated');
  const [designViewport, setDesignViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [designMode, setDesignMode] = useState<'preview' | 'system'>('preview');
  const defaultDesign = {
    theme: 'midnight' as const,
    accent: 'cyan' as const,
    radius: 'rounded' as const,
    density: 'comfortable' as const,
    layout: 'dashboard' as const,
    typography: 'modern' as const,
    primaryComponent: 'workspace' as const,
    updatedAt: Date.now(),
  };
  const [designSystem, setDesignSystem] = useState<NonNullable<Project['designSystem']>>(project.designSystem || defaultDesign);
  const [isDesignGenerating, setIsDesignGenerating] = useState(false);
  const [designStatus, setDesignStatus] = useState('LOCAL DESIGN STATE');

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

  useEffect(() => {
    setDesignSystem(project.designSystem || defaultDesign);
  }, [project.id, project.designSystem]);

  const updateDesign = <K extends keyof typeof designSystem>(key: K, value: typeof designSystem[K]) => {
    const next = { ...designSystem, [key]: value, updatedAt: Date.now() };
    setDesignSystem(next);
    onDesignChange(next);
    setDesignStatus('SAVED TO PROJECT');
  };

  const designPrompt = `Create the implementation for this product idea.

PRODUCT INTENTION:
${project.intention}

PROJECT OBJECTIVE:
${project.objective}

DESIGN SPECIFICATION:
- Theme: ${designSystem.theme}
- Accent: ${designSystem.accent}
- Corner style: ${designSystem.radius}
- Density: ${designSystem.density}
- Layout: ${designSystem.layout}
- Typography: ${designSystem.typography}
- Primary experience: ${designSystem.primaryComponent}

Generate the actual application implementation, not a mockup. Reflect the design specification in the UI structure, component hierarchy, responsive behavior and styling. Preserve the product intent.`;

  const generateFromDesign = async () => {
    if (!project.intention.trim() || isDesignGenerating) return;
    setIsDesignGenerating(true);
    setDesignStatus('GENERATING IMPLEMENTATION');
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: designPrompt }),
      });
      if (!response.ok) throw new Error('Generation request failed');
      const data = await response.json();
      if (typeof data.code === 'string') {
        onCodeChange(data.code);
        setDesignStatus(data.fallback ? 'IMPLEMENTATION GENERATED · FALLBACK' : 'IMPLEMENTATION GENERATED');
        setActiveTab('code');
      } else {
        throw new Error('No implementation returned');
      }
    } catch {
      setDesignStatus('GENERATION FAILED · TRY AGAIN');
    } finally {
      setIsDesignGenerating(false);
    }
  };

  const accentClass = {
    cyan: 'bg-cyan-500 text-slate-950 border-cyan-400',
    violet: 'bg-violet-500 text-white border-violet-400',
    emerald: 'bg-emerald-500 text-slate-950 border-emerald-400',
    amber: 'bg-amber-400 text-slate-950 border-amber-300',
  }[designSystem.accent];

  const accentSoftClass = {
    cyan: 'text-cyan-300 border-cyan-500/20 bg-cyan-500/5',
    violet: 'text-violet-300 border-violet-500/20 bg-violet-500/5',
    emerald: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5',
    amber: 'text-amber-300 border-amber-500/20 bg-amber-500/5',
  }[designSystem.accent];

  const radiusClass = { sharp: 'rounded-md', rounded: 'rounded-xl', pill: 'rounded-3xl' }[designSystem.radius];
  const densityPadding = { compact: 'p-3', comfortable: 'p-4', spacious: 'p-6' }[designSystem.density];
  const previewBackground = designSystem.theme === 'light'
    ? 'bg-slate-100 text-slate-900'
    : 'bg-slate-950 text-white';

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
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-mono text-cyan-300">FUNCTIONAL</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Edit the design contract, persist it, then generate implementation from the exact state.</p>
              </div>
              <button type="button" onClick={generateFromDesign} disabled={isDesignGenerating || !project.intention.trim()} className="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold flex items-center gap-1.5 disabled:opacity-40">
                {isDesignGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <WandSparkles className="w-3 h-3" />}
                {isDesignGenerating ? 'GENERATING' : 'GENERATE IMPLEMENTATION'}
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/70 bg-slate-950 shrink-0">
              <div className="flex items-center gap-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((viewport) => {
                  const Icon = viewport === 'desktop' ? Monitor : viewport === 'tablet' ? Tablet : Smartphone;
                  return <button key={viewport} type="button" onClick={() => setDesignViewport(viewport)} className={designViewport === viewport ? 'px-2 py-1.5 rounded bg-slate-800 text-slate-100 flex items-center gap-1.5 text-[9px] font-mono' : 'px-2 py-1.5 rounded text-slate-500 hover:text-slate-200 flex items-center gap-1.5 text-[9px] font-mono'}><Icon className="w-3 h-3" />{viewport}</button>;
                })}
              </div>
              <span className="text-[9px] font-mono text-slate-600">{designStatus}</span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-4 md:p-5">
              <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 h-full min-h-[620px]">
                <aside className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-4 overflow-y-auto">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Design contract</div>

                  {[
                    ['Theme', 'theme', ['midnight','light']],
                    ['Accent', 'accent', ['cyan','violet','emerald','amber']],
                    ['Corners', 'radius', ['sharp','rounded','pill']],
                    ['Density', 'density', ['compact','comfortable','spacious']],
                    ['Layout', 'layout', ['dashboard','split','focused']],
                    ['Typography', 'typography', ['modern','technical','editorial']],
                    ['Primary experience', 'primaryComponent', ['hero','workspace','dashboard','form']],
                  ].map(([label, key, values]) => (
                    <div key={String(key)} className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">{label}</label>
                      <select
                        value={String(designSystem[key as keyof typeof designSystem])}
                        onChange={(event) => updateDesign(key as keyof typeof designSystem, event.target.value as never)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-2 text-[10px] font-mono text-slate-200 outline-none focus:border-cyan-500"
                      >
                        {(values as string[]).map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-800 text-[9px] font-mono text-slate-600 leading-relaxed">
                    Changes persist with the project. The implementation generator receives this complete design contract.
                  </div>
                </aside>

                <section className="min-w-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-mono tracking-[0.2em] text-cyan-400 uppercase">Live design preview</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">Viewport: {designViewport} · {designSystem.layout} · {designSystem.density}</div>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-300 flex items-center gap-1"><Save className="w-3 h-3" /> PERSISTED</div>
                  </div>

                  <div className={`mx-auto flex-1 w-full ${designViewport === 'desktop' ? 'max-w-none' : designViewport === 'tablet' ? 'max-w-[768px]' : 'max-w-[390px]'} ${radiusClass} border border-slate-700/80 overflow-hidden shadow-2xl transition-all ${previewBackground}`}>
                    <div className="h-9 border-b border-slate-800 bg-slate-900 flex items-center px-3 gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400/70" /><span className="w-2 h-2 rounded-full bg-amber-400/70" /><span className="w-2 h-2 rounded-full bg-emerald-400/70" />
                      <div className="ml-3 flex-1 h-5 rounded bg-slate-950 border border-slate-800 text-[8px] text-slate-600 font-mono flex items-center px-2">experience-engine.local</div>
                    </div>

                    <div className={`min-h-[500px] ${densityPadding} space-y-5 ${designSystem.layout === 'focused' ? 'max-w-3xl mx-auto' : ''}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[9px] font-mono tracking-[0.2em] text-cyan-500 uppercase">Experience Engine</div>
                          <h2 className="text-xl md:text-2xl font-bold mt-1">{project.title}</h2>
                        </div>
                        <button type="button" className={`px-3 py-2 ${radiusClass} border text-[9px] font-mono font-bold flex items-center gap-1.5 ${accentClass}`}>
                          <WandSparkles className="w-3 h-3" /> CREATE
                        </button>
                      </div>

                      <div className={designSystem.layout === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
                        <div className={`${radiusClass} border border-slate-700 bg-slate-900/60 ${densityPadding} min-h-[190px]`}>
                          <div className="text-[8px] font-mono text-slate-500 uppercase">{designSystem.primaryComponent}</div>
                          <h3 className="text-lg font-semibold mt-3">{project.objective || 'Define the primary experience.'}</h3>
                          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{project.summary || 'The design workspace will evolve this surface from your intention.'}</p>
                          <div className="mt-6 flex gap-2">
                            <div className={`h-8 w-24 ${radiusClass} ${accentClass}`} />
                            <div className={`h-8 w-20 ${radiusClass} border border-slate-700`} />
                          </div>
                        </div>
                        <div className={`${radiusClass} border ${accentSoftClass} ${densityPadding}`}>
                          <div className="text-[8px] font-mono uppercase">UX signal</div>
                          <div className="text-2xl font-bold mt-3">LIVE</div>
                          <div className="text-[9px] font-mono text-slate-500 mt-1">contract-driven preview</div>
                          <div className="mt-5 grid grid-cols-2 gap-2 text-[9px] font-mono">
                            <div className="border border-slate-800 rounded p-2">Responsive<br/><span className="text-emerald-300">READY</span></div>
                            <div className="border border-slate-800 rounded p-2">Hierarchy<br/><span className="text-emerald-300">READY</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['Navigation','Primary action','Feedback','Responsive'].map((item) => (
                          <div key={item} className={`${radiusClass} border border-slate-800 bg-slate-900/50 px-3 py-3 text-[9px] font-mono text-slate-400`}>
                            {item}<div className="text-emerald-300 mt-1">READY</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
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
