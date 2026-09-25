/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Project, Experiment, MakerLevel } from './types';
import { MARS_ROVER_PROJECT } from './data/presetProjects';
import {
  loadProjects,
  saveProjects,
  getActiveProjectId,
  setActiveProjectId,
} from './utils/storage';
import { generateProjectFromIdea } from './utils/projectGenerator';
import { TopBar } from './components/TopBar';
import { IntentionPanel } from './components/IntentionPanel';
import { CreationPanel } from './components/CreationPanel';
import { StatusBar } from './components/StatusBar';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => getActiveProjectId());
  const [isRunning, setIsRunning] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Current active project
  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects[0] || MARS_ROVER_PROJECT;

  // Active experiment within the project
  const activeExpIndex = Math.min(
    Math.max(0, currentProject.activeExperimentIndex ?? 0),
    currentProject.experiments.length - 1
  );
  const activeExperiment: Experiment = currentProject.experiments[activeExpIndex] || {
    id: 'exp-1',
    number: 1,
    title: 'Baseline Test',
    objective: 'Initial test of the simulated environment.',
    hypothesis: 'System behaves nominally.',
    testPlan: 'Run simulation ticks.',
    expectedResult: 'Simulation runs successfully.',
    actualResult: '',
    verified: false,
    nextExperimentHint: 'Iterate parameters.',
    logs: [],
    parameters: {},
  };

  // Sync projects to localStorage on change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync active project id
  useEffect(() => {
    setActiveProjectId(currentProjectId);
  }, [currentProjectId]);

  // Update a single project in the projects array
  const updateCurrentProject = useCallback((updater: (prev: Project) => Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === currentProjectId ? updater(p) : p))
    );
  }, [currentProjectId]);

  // Update the code being generated live from the user's current idea.
  const handleLiveCodeChange = useCallback((code: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      codeSnippet: code,
      updatedAt: Date.now(),
    }));
  }, [updateCurrentProject]);

  // Start creating / iterate project from idea
  const handleStartCreating = async (ideaText: string) => {
    setIsGenerating(true);
    try {
      const newProject = await generateProjectFromIdea(ideaText);
      setProjects((prev) => {
        const existingIdx = prev.findIndex((p) => p.id === newProject.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newProject;
          return updated;
        }
        return [newProject, ...prev];
      });
      setCurrentProjectId(newProject.id);
      setIsRunning(true);
    } catch (err) {
      console.warn('Project creation fallback handled:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Switch to an existing project
  const handleSelectProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setIsRunning(true);
  };

  // Create empty new project
  const handleCreateNewProject = () => {
    const emptyProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'Untitled Experiment',
      intention: '',
      objective: 'Define what you want to explore or build.',
      category: 'custom',
      summary: 'New experimental workspace.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activeExperimentIndex: 0,
      makerLevel: 'Student',
      parameters: {
        speed: {
          label: 'System Velocity',
          value: 1.0,
          min: 0.1,
          max: 3.0,
          step: 0.1,
          unit: 'x',
          description: 'Simulation tick speed.',
        },
      },
      experiments: [
        {
          id: 'exp-1',
          number: 1,
          title: 'Initial Concept Validation',
          objective: 'Test fundamental hypothesis of the idea.',
          hypothesis: 'Prototype responds predictably to inputs.',
          testPlan: 'Observe state progression.',
          expectedResult: 'System achieves steady state.',
          actualResult: '',
          verified: false,
          nextExperimentHint: 'Add sensory feedback & environmental rules.',
          logs: ['[Init] Project workspace mounted.'],
          parameters: {},
        },
      ],
      codeSnippet: `// Baseline Experiment Logic\nexport class Workspace {\n  run() {\n    console.log("Experiment active");\n  }\n}`,
      markdownDoc: `# Untitled Experiment\nType an idea in the Intention panel to generate experiments.`,
    };

    setProjects((prev) => [emptyProj, ...prev]);
    setCurrentProjectId(emptyProj.id);
  };

  // Update project title
  const handleUpdateTitle = (newTitle: string) => {
    updateCurrentProject((prev) => ({
      ...prev,
      title: newTitle,
      updatedAt: Date.now(),
    }));
  };

  // Switch active experiment index
  const handleSelectExperiment = (index: number) => {
    updateCurrentProject((prev) => ({
      ...prev,
      activeExperimentIndex: index,
      updatedAt: Date.now(),
    }));
  };

  // Advance to next experiment in line
  const handleAdvanceExperiment = () => {
    const nextIdx = activeExpIndex + 1;
    if (nextIdx < currentProject.experiments.length) {
      updateCurrentProject((prev) => {
        // Evaluate maker level progression
        let newLevel: MakerLevel = prev.makerLevel;
        if (nextIdx >= 2) newLevel = 'Developer';
        else if (nextIdx >= 1) newLevel = 'Maker';

        return {
          ...prev,
          activeExperimentIndex: nextIdx,
          makerLevel: newLevel,
          updatedAt: Date.now(),
        };
      });
      setIsRunning(true);
    }
  };

  // Verify active experiment with a result message
  const handleVerifyExperiment = (resultMessage: string) => {
    updateCurrentProject((prev) => {
      const experiments = prev.experiments.map((exp, idx) => {
        if (idx === prev.activeExperimentIndex) {
          return {
            ...exp,
            verified: true,
            actualResult: resultMessage,
            logs: [...exp.logs, `[Result Verified] ${resultMessage}`],
          };
        }
        return exp;
      });

      // Calculate new maker level
      const verifiedCount = experiments.filter((e) => e.verified).length;
      let newLevel: MakerLevel = prev.makerLevel;
      if (verifiedCount >= 3) newLevel = 'Specialist';
      else if (verifiedCount >= 2) newLevel = 'Developer';
      else if (verifiedCount >= 1) newLevel = 'Maker';

      return {
        ...prev,
        experiments,
        makerLevel: newLevel,
        updatedAt: Date.now(),
      };
    });
  };

  // Add a log message to active experiment
  const handleAddLog = (logMessage: string) => {
    updateCurrentProject((prev) => {
      const experiments = prev.experiments.map((exp, idx) => {
        if (idx === prev.activeExperimentIndex) {
          return {
            ...exp,
            logs: [...exp.logs.slice(-40), logMessage],
          };
        }
        return exp;
      });
      return { ...prev, experiments };
    });
  };

  // Update user observation notes
  const handleUpdateObservation = (text: string) => {
    updateCurrentProject((prev) => {
      const experiments = prev.experiments.map((exp, idx) => {
        if (idx === prev.activeExperimentIndex) {
          return {
            ...exp,
            actualResult: text,
          };
        }
        return exp;
      });
      return { ...prev, experiments, updatedAt: Date.now() };
    });
  };

  // Change simulation parameter in project
  const handleParameterChange = (key: string, value: number) => {
    updateCurrentProject((prev) => {
      if (!prev.parameters[key]) return prev;
      return {
        ...prev,
        parameters: {
          ...prev.parameters,
          [key]: {
            ...prev.parameters[key],
            value,
          },
        },
        updatedAt: Date.now(),
      };
    });
  };

  // Export Markdown project (project.txt format)
  const handleExportMarkdown = () => {
    const content = `# Project: ${currentProject.title}
Intention: ${currentProject.intention}
Objective: ${currentProject.objective}
Maker Level: ${currentProject.makerLevel}
Timestamp: ${new Date().toISOString()}

---
## Summary
${currentProject.summary}

---
## Experiments Pipeline
${currentProject.experiments
  .map(
    (exp) => `### Experiment 0${exp.number}: ${exp.title}
- Objective: ${exp.objective}
- Hypothesis: ${exp.hypothesis}
- Expected Result: ${exp.expectedResult}
- Actual Result: ${exp.actualResult || 'In progress'}
- Verified: ${exp.verified ? 'YES' : 'NO'}
- Next Step: ${exp.nextExperimentHint}
`
  )
  .join('\n')}

---
## Code & Architecture
\`\`\`typescript
${currentProject.codeSnippet}
\`\`\`
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-project.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset simulation state
  const handleReset = () => {
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
      handleAddLog('[Reset] Simulation re-initialized to origin coordinates.');
    }, 50);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* 1. TOP BAR */}
      <TopBar
        currentProject={currentProject}
        allProjects={projects}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleCreateNewProject}
        onUpdateTitle={handleUpdateTitle}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* 2 & 3. PERSISTENT SPLIT-SCREEN WORKSPACE */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* LEFT SIDE — INTENTION (The Human) */}
        <section
          aria-label="Intention Workspace"
          className="w-full md:w-[420px] lg:w-[460px] xl:w-[490px] h-1/2 md:h-full flex-shrink-0"
        >
          <IntentionPanel
            project={currentProject}
            activeExperiment={activeExperiment}
            isGenerating={isGenerating}
            onStartCreating={handleStartCreating}
            onLiveCodeChange={handleLiveCodeChange}
            onAdvanceToNextExperiment={handleAdvanceExperiment}
            onSelectExperiment={handleSelectExperiment}
            onUpdateObservation={handleUpdateObservation}
            onParameterChange={handleParameterChange}
          />
        </section>

        {/* RIGHT SIDE — CREATION (The Tangible Creation) */}
        <section
          aria-label="Creation Workspace"
          className="w-full md:flex-1 h-1/2 md:h-full min-h-0 min-w-0"
        >
          <CreationPanel
            project={currentProject}
            activeExperiment={activeExperiment}
            isRunning={isRunning}
            onTogglePlay={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            onVerifyExperiment={handleVerifyExperiment}
            onAddLog={handleAddLog}
            onAdvanceExperiment={handleAdvanceExperiment}
            onParameterChange={handleParameterChange}
          />
        </section>
      </main>

      {/* 4. EXPERIENCE / STATUS (Bottom Bar) */}
      <StatusBar
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        category={currentProject.category}
      />
    </div>
  );
}
