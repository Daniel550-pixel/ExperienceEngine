import { Project, Experiment } from '../types';
import { MARS_ROVER_PROJECT, GRAVITY_PROJECT, CELLULAR_PROJECT } from '../data/presetProjects';

export async function generateProjectFromIdea(idea: string): Promise<Project> {
  const normalized = idea.toLowerCase().trim();

  // 1. Check for canonical presets first for instant, high-fidelity experience
  if (normalized.includes('mars') || normalized.includes('rover')) {
    return {
      ...MARS_ROVER_PROJECT,
      id: `mars-rover-${Date.now()}`,
      intention: idea,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  if (normalized.includes('gravity') || normalized.includes('orbit') || normalized.includes('solar system') || normalized.includes('celestial')) {
    return {
      ...GRAVITY_PROJECT,
      id: `gravity-${Date.now()}`,
      intention: idea,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  if (normalized.includes('cellular') || normalized.includes('conway') || normalized.includes('game of life') || normalized.includes('automata')) {
    return {
      ...CELLULAR_PROJECT,
      id: `cellular-${Date.now()}`,
      intention: idea,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // 2. Try calling server-side Gemini API endpoint
  try {
    const response = await fetch('/api/generate-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.fallback && data.title && Array.isArray(data.experiments)) {
        return {
          id: `proj-${Date.now()}`,
          title: data.title,
          intention: idea,
          objective: data.objective || `Create an interactive working prototype for: ${idea}`,
          category: 'simulation',
          summary: data.summary || `Exploratory project to build and test: ${idea}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          activeExperimentIndex: 0,
          makerLevel: 'Student',
          experiments: data.experiments.map((exp: any, idx: number): Experiment => ({
            id: `exp-${idx + 1}`,
            number: exp.number || idx + 1,
            title: exp.title || `Experiment 0${idx + 1}`,
            objective: exp.objective || 'Verify core system behavior.',
            hypothesis: exp.hypothesis || 'System will stabilize under nominal initial parameters.',
            testPlan: exp.testPlan || 'Run simulation tick loop and observe interaction.',
            expectedResult: exp.expectedResult || 'System behaves predictably according to physical/logical rules.',
            actualResult: idx === 0 ? 'Initial execution validated in live working area.' : '',
            verified: idx === 0,
            nextExperimentHint: exp.nextExperimentHint || 'Add environmental hazards and sensory feedback.',
            logs: [`[Init] Experiment 0${idx + 1} initialized.`],
            parameters: exp.parameters || {},
          })),
          codeSnippet: data.codeSnippet || `// Interactive Simulation Engine for: ${idea}\nexport class Engine {\n  update(dt: number) {\n    // Simulation logic\n  }\n}`,
          markdownDoc: data.markdownProject || `# ${data.title}\nIntention: ${idea}\nObjective: ${data.objective}`,
          parameters: {
            speed: {
              label: 'Simulation Velocity',
              value: 1.0,
              min: 0.2,
              max: 3.0,
              step: 0.1,
              unit: 'x',
              description: 'Time step multiplier for the physics integrator.',
            },
            density: {
              label: 'Entity Density',
              value: 30,
              min: 5,
              max: 80,
              step: 5,
              unit: 'units',
              description: 'Number of active interacting simulation agents.',
            },
          },
        };
      }
    }
  } catch (err) {
    console.warn('API generation failed or offline, synthesizing local project:', err);
  }

  // 3. Robust client-side fallback synthesis if offline
  const cleanedTitle = idea
    .replace(/^(i want to build|i want to make|i want to explore|i want to simulate|create a|build a|simulate a)/i, '')
    .trim();
  const title = cleanedTitle ? cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1) : 'Exploratory Experiment';

  return {
    id: `custom-${Date.now()}`,
    title: title,
    intention: idea,
    objective: `Design, construct, and evaluate a functioning prototype for ${title.toLowerCase()}.`,
    category: 'custom',
    summary: `Curiosity-driven experiment sandbox exploring the mechanical and computational principles of ${title.toLowerCase()}.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeExperimentIndex: 0,
    makerLevel: 'Student',
    parameters: {
      speed: {
        label: 'Simulation Velocity',
        value: 1.0,
        min: 0.2,
        max: 3.0,
        step: 0.1,
        unit: 'x',
        description: 'Physics update frequency and velocity multiplier.',
      },
      particleCount: {
        label: 'Active Agent Count',
        value: 35,
        min: 10,
        max: 80,
        step: 5,
        unit: 'agents',
        description: 'Number of interacting entities in workspace.',
      },
    },
    experiments: [
      {
        id: 'custom-exp-01',
        number: 1,
        title: 'Core Kinematics & Agent Interactions',
        objective: `Establish a controllable base model for ${title.toLowerCase()}.`,
        hypothesis: 'Entities will navigate the workspace boundary and respond to click interactions.',
        testPlan: '1. Launch simulation.\n2. Observe velocity vectors.\n3. Click canvas to deploy agents.',
        expectedResult: 'System achieves steady state motion and user input responds in real-time.',
        actualResult: 'Workspace initialized and responsive to user input events.',
        verified: true,
        nextExperimentHint: 'Integrate dynamic obstacles, threshold limits, and feedback loops.',
        logs: ['[Init] Core simulation loop mounted.', '[Result] Verified: Workspace operational.'],
        parameters: { speed: 1.0 },
      },
      {
        id: 'custom-exp-02',
        number: 2,
        title: 'Environmental Constraints & Resistance',
        objective: 'Introduce boundary friction, collision repulsion, and state decay.',
        hypothesis: 'Energy dissipation prevents infinite acceleration.',
        testPlan: 'Measure velocity dissipation over 10 seconds.',
        expectedResult: 'Entity velocities normalize to target dynamic equilibrium.',
        actualResult: '',
        verified: false,
        nextExperimentHint: 'Autonomous goal-seeking behavior & automated telemetry recording.',
        logs: ['[Setup] Preparing secondary experiment parameters.'],
        parameters: { speed: 1.2 },
      },
      {
        id: 'custom-exp-03',
        number: 3,
        title: 'Autonomous Goal Seeking & Optimization',
        objective: 'Implement path finding or feedback loops to reach equilibrium.',
        hypothesis: 'Agents self-organize without manual intervention.',
        testPlan: 'Deploy target attractor and record time to convergence.',
        expectedResult: 'Convergence achieved within 500 frames.',
        actualResult: '',
        verified: false,
        nextExperimentHint: 'Full system synthesis and deployment.',
        logs: ['[Autonomy] Goal seeking state machine ready.'],
        parameters: { speed: 1.5 },
      },
    ],
    codeSnippet: `// Simulation Kinematics Engine for: ${title}
export class SimulationEngine {
  entities = [];

  update(dt: number, params: { speed: number }) {
    for (const entity of this.entities) {
      entity.x += entity.vx * params.speed * dt;
      entity.y += entity.vy * params.speed * dt;
      // Collision and bounds check
      this.checkBounds(entity);
    }
  }
}`,
    markdownDoc: `# ${title}\n**Intention:** ${idea}\n**Objective:** Design and test an interactive simulation.`,
  };
}
