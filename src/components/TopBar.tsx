import React, { useState } from 'react';
import { Project, MakerLevel } from '../types';
import {
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  Download,
  Terminal,
  Award,
  BookOpen,
} from 'lucide-react';
import { PRESET_PROJECTS } from '../data/presetProjects';

interface TopBarProps {
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onExportMarkdown: () => void;
}

const MAKER_STAGES: Record<MakerLevel, { label: string; color: string; desc: string }> = {
  Student: { label: 'Student', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', desc: 'Exploring fundamentals' },
  Maker: { label: 'Maker', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', desc: 'Building working prototypes' },
  Developer: { label: 'Developer', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', desc: 'Engineering modular systems' },
  Specialist: { label: 'Specialist', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', desc: 'Domain optimization & autonomy' },
  Founder: { label: 'Founder', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: 'Synthesizing novel technologies' },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentProject,
  allProjects,
  onSelectProject,
  onCreateNewProject,
  onUpdateTitle,
  onExportMarkdown,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentProject.title);

  const activeStage = MAKER_STAGES[currentProject.makerLevel] || MAKER_STAGES.Student;

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-13 min-h-[52px] border-b border-slate-800 bg-slate-950/95 px-4 flex items-center justify-between gap-4 select-none z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold tracking-wider text-slate-100 text-sm">
            EXPERIENCE
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            V1.0
          </span>
        </div>

        <span className="text-slate-700 font-light">/</span>

        {/* Project Selector & Inline Renaming */}
        <div className="relative flex items-center">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => {
                  onUpdateTitle(titleInput);
                  setIsEditingTitle(false);
                }}
                className="bg-slate-900 border border-cyan-500 rounded px-2 py-0.5 text-xs font-mono text-cyan-200 outline-none w-56"
              />
            </form>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span className="text-xs text-slate-400 font-mono">Project:</span>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-900 text-xs font-mono font-medium text-slate-200 transition-colors"
              >
                <span>{currentProject.title || 'Untitled'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform" />
              </button>
            </div>
          )}

          {/* Switcher Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-1.5 z-50 font-mono text-xs">
                <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
                  Switch or Load Project
                </div>
                {allProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(p);
                      setTitleInput(p.title);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      p.id === currentProject.id ? 'bg-cyan-950/60 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="text-[10px] text-slate-500">Exp {p.activeExperimentIndex + 1}/{p.experiments.length}</span>
                  </button>
                ))}

                <div className="my-1 border-t border-slate-800" />

                <button
                  type="button"
                  onClick={() => {
                    onCreateNewProject();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-cyan-400 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Empty Project</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Stage Badge & Export */}
      <div className="flex items-center gap-3">
        {/* Learning Journey Stage Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Level:</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${activeStage.color}`}>
            {activeStage.label}
          </span>
        </div>

        {/* Active Experiment Tag */}
        <div className="hidden md:flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
          <span className="text-cyan-400 font-semibold">
            EXP {currentProject.activeExperimentIndex + 1}/{currentProject.experiments.length}:
          </span>
          <span className="text-slate-300 truncate max-w-[160px]">
            {currentProject.experiments[currentProject.activeExperimentIndex]?.title || 'Ready'}
          </span>
        </div>

        {/* Export project.txt Markdown */}
        <button
          type="button"
          onClick={onExportMarkdown}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono transition-colors shadow-sm"
          title="Export Markdown representation (project.txt)"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">project.txt</span>
        </button>
      </div>
    </header>
  );
};
