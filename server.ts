import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { CODE_LANGUAGE_LIBRARY, CODE_LANGUAGE_LIBRARY_VERSION, buildLanguageSystemPrompt } from './src/data/codeLanguageLibrary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Rate-limit tracking and caching
  let geminiQuotaCooldownUntil = 0;
  const codeCache = new Map<string, string>();

  function inferCodeLanguage(idea: string, code: string): { id: string; name: string; extension: string } {
    const lower = idea.toLowerCase();
    const explicit = CODE_LANGUAGE_LIBRARY.find((language) =>
      [language.id, language.name, ...language.extensions, ...language.runtimes]
        .some((term) => term && lower.includes(term.toLowerCase()))
    );

    if (explicit) {
      return {
        id: explicit.id,
        name: explicit.name,
        extension: explicit.extensions[0]?.replace(/^\./, '') || explicit.id,
      };
    }

    if (/^\s*(interface|type|export|import|const|let|class)\b/m.test(code) || code.includes("Record<string")) {
      return { id: "typescript", name: "TypeScript", extension: "ts" };
    }

    return { id: "typescript", name: "TypeScript", extension: "ts" };
  }

  function generateIntelligentFallbackCode(idea: string): string {
    const lower = idea.toLowerCase();
    const cleanIdea = idea.replace(/"/g, "'").trim();

    if (lower.includes('mars') || lower.includes('rover')) {
      return `/**
 * Mars Surface Exploration Rover — Autonomous Kinematics
 * Intention: "${cleanIdea}"
 */

export interface RoverTelemetry {
  heading: number; // degrees
  velocity: number; // m/s
  wheelTorque: [number, number, number, number];
  batteryLevel: number; // percentage
  terrainGrade: number; // inclination angle
  hazardDistance: number; // lidar range (m)
}

export class MarsRoverController {
  private x = 0;
  private y = 0;
  private heading = 0;
  private velocity = 0;
  private maxSpeed = 1.8;

  constructor(public missionId = 'Perseverance-Alpha') {}

  steer(targetAngle: number, dt: number): void {
    const diff = targetAngle - this.heading;
    this.heading += Math.max(-45, Math.min(45, diff)) * dt * 0.5;
  }

  drive(throttle: number, dt: number): void {
    const accel = throttle * 0.8;
    this.velocity = Math.max(0, Math.min(this.maxSpeed, this.velocity + accel * dt));
    const rad = (this.heading * Math.PI) / 180;
    this.x += Math.cos(rad) * this.velocity * dt;
    this.y += Math.sin(rad) * this.velocity * dt;
  }

  getTelemetry(): RoverTelemetry {
    return {
      heading: Math.round(this.heading * 10) / 10,
      velocity: Math.round(this.velocity * 100) / 100,
      wheelTorque: [12.4, 12.1, 12.5, 12.2],
      batteryLevel: 94.2,
      terrainGrade: 3.8,
      hazardDistance: 8.5,
    };
  }
}

export const rover = new MarsRoverController();
rover.steer(15, 0.16);
rover.drive(0.8, 0.16);
`;
    }

    if (lower.includes('gravity') || lower.includes('orbit') || lower.includes('solar system') || lower.includes('celestial') || lower.includes('planet')) {
      return `/**
 * Gravitational N-Body Orbital Integrator
 * Intention: "${cleanIdea}"
 */

export interface CelestialBody {
  id: string;
  name: string;
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export class OrbitalSystem {
  readonly G = 6.674e-11;
  public bodies: CelestialBody[] = [];

  constructor() {
    this.initDefaultSystem();
  }

  initDefaultSystem() {
    this.bodies = [
      { id: 'sun', name: 'Primary Star', mass: 12000, x: 0, y: 0, vx: 0, vy: 0, radius: 14, color: '#f59e0b' },
      { id: 'inner', name: 'Inner Planet', mass: 12, x: 120, y: 0, vx: 0, vy: 2.8, radius: 5, color: '#38bdf8' },
      { id: 'outer', name: 'Gas Giant', mass: 90, x: 260, y: 0, vx: 0, vy: 1.9, radius: 9, color: '#a855f7' },
    ];
  }

  step(dt: number) {
    // Symplectic velocity verlet step
    for (let i = 0; i < this.bodies.length; i++) {
      let fx = 0;
      let fy = 0;
      const b1 = this.bodies[i];

      for (let j = 0; j < this.bodies.length; j++) {
        if (i === j) continue;
        const b2 = this.bodies[j];
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy + 150;
        const dist = Math.sqrt(distSq);
        const force = (0.5 * b1.mass * b2.mass) / distSq;
        fx += force * (dx / dist);
        fy += force * (dy / dist);
      }

      b1.vx += (fx / b1.mass) * dt;
      b1.vy += (fy / b1.mass) * dt;
      b1.x += b1.vx * dt;
      b1.y += b1.vy * dt;
    }
  }
}

export const orbitalSimulation = new OrbitalSystem();
orbitalSimulation.step(0.016);
`;
    }

    if (lower.includes('cellular') || lower.includes('conway') || lower.includes('automata') || lower.includes('life')) {
      return `/**
 * Cellular Automata Lattice Engine
 * Intention: "${cleanIdea}"
 */

export class CellularAutomaton {
  private width: number;
  private height: number;
  private grid: Uint8Array;
  private nextGrid: Uint8Array;

  constructor(width = 64, height = 64) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
    this.seedRandom(0.18);
  }

  seedRandom(density = 0.2) {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = Math.random() < density ? 1 : 0;
    }
  }

  step(): void {
    const { width, height, grid, nextGrid } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + width) % width;
            const ny = (y + dy + height) % height;
            neighbors += grid[ny * width + nx];
          }
        }
        const idx = y * width + x;
        const current = grid[idx];
        nextGrid[idx] = (current === 1 && (neighbors === 2 || neighbors === 3)) || (current === 0 && neighbors === 3) ? 1 : 0;
      }
    }
    this.grid.set(nextGrid);
  }

  getPopulation(): number {
    return this.grid.reduce((acc, v) => acc + v, 0);
  }
}

export const automaton = new CellularAutomaton();
automaton.step();
`;
    }

    if (lower.includes('drone') || lower.includes('flight') || lower.includes('quadcopter') || lower.includes('uav')) {
      return `/**
 * Autonomous Quadcopter Flight Controller (PID Stabilization)
 * Intention: "${cleanIdea}"
 */

export interface DroneState {
  altitude: number; // m
  pitch: number;    // deg
  roll: number;     // deg
  yaw: number;      // deg
  battery: number;  // %
}

export class QuadcopterController {
  private state: DroneState = { altitude: 0, pitch: 0, roll: 0, yaw: 0, battery: 100 };
  private targetAltitude = 12.0;

  update(dt: number) {
    // Altitude PID error
    const err = this.targetAltitude - this.state.altitude;
    const thrust = Math.min(100, Math.max(0, 50 + err * 4.2));
    this.state.altitude += (thrust - 50) * 0.05 * dt;
    this.state.battery = Math.max(0, this.state.battery - dt * 0.02);
  }

  getState(): DroneState {
    return { ...this.state };
  }
}

export const drone = new QuadcopterController();
drone.update(0.016);
`;
    }

    if (lower.includes('uae') || lower.includes('twin') || lower.includes('city') || lower.includes('traffic') || lower.includes('grid')) {
      return `/**
 * UAE Smart Infrastructure & Urban Digital Twin Node
 * Intention: "${cleanIdea}"
 */

export interface InfrastructureNode {
  id: string;
  name: string;
  coordinates: [number, number];
  powerLoadMW: number;
  transitThroughput: number;
  status: 'nominal' | 'elevated' | 'critical';
}

export class DigitalTwinEngine {
  private nodes: InfrastructureNode[] = [
    { id: 'dxb-downtown', name: 'Downtown Hub', coordinates: [25.1972, 55.2744], powerLoadMW: 420, transitThroughput: 8400, status: 'nominal' },
    { id: 'auh-masdar', name: 'Masdar Clean Grid', coordinates: [24.4267, 54.6171], powerLoadMW: 180, transitThroughput: 3100, status: 'nominal' },
    { id: 'jebel-ali', name: 'Jebel Ali Logistics', coordinates: [24.9857, 55.0272], powerLoadMW: 650, transitThroughput: 12200, status: 'nominal' },
  ];

  assessGridState(): { totalLoadMW: number; resilienceIndex: number } {
    const totalLoadMW = this.nodes.reduce((acc, n) => acc + n.powerLoadMW, 0);
    return {
      totalLoadMW,
      resilienceIndex: 0.985,
    };
  }
}

export const twin = new DigitalTwinEngine();
`;
    }

    // Default universal clean TypeScript executable model
    const classWords = cleanIdea
      .split(/[^a-zA-Z0-9]/)
      .filter((w) => w.length > 2)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const className = classWords.length > 0 ? `${classWords.join('')}System` : 'ExperimentSystem';

    return `/**
 * EXPERIENCE Live System Scaffold
 * Intention: "${cleanIdea}"
 */

export interface SystemState {
  step: number;
  active: boolean;
  intensity: number;
  metrics: Record<string, number>;
}

export class ${className} {
  readonly intention = "${cleanIdea}";
  private state: SystemState = {
    step: 0,
    active: true,
    intensity: 1.0,
    metrics: { efficiency: 0.94, latencyMs: 12.4 },
  };

  /** Update system dynamics based on simulation delta */
  update(dt: number = 0.016): SystemState {
    this.state.step += 1;
    this.state.intensity = 1.0 + Math.sin(this.state.step * 0.05) * 0.15;
    this.state.metrics.efficiency = Math.min(1.0, 0.90 + (this.state.step % 100) * 0.001);
    return { ...this.state };
  }

  inspect(): string {
    return \`[\${this.intention}] Step: \${this.state.step}, Efficiency: \${(this.state.metrics.efficiency * 100).toFixed(1)}%\`;
  }
}

export const system = new ${className}();
system.update();
console.log(system.inspect());
`;
  }

  // API Route: Generate project from user idea
  app.post('/api/generate-project', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({ error: 'Please provide an idea string' });
      }

      // If in cooldown or no AI, use built-in generator fallback
      if (Date.now() < geminiQuotaCooldownUntil || !ai) {
        return res.json({ fallback: true, message: 'Built-in generator active' });
      }

      try {
        const systemPrompt = `You are the creation engine for EXPERIENCE, a workspace where people learn and build through experiments.
Given the user's idea or curiosity, decompose it into a structured, executable project with sequential experiments.

Follow this exact JSON structure:
{
  "title": "Short descriptive project name",
  "objective": "Clear high-level objective (1-2 sentences)",
  "category": "simulation | physics | game | visualization | audio | data",
  "summary": "Brief summary of what this builds",
  "experiments": [
    {
      "id": "exp-1",
      "number": 1,
      "title": "First fundamental experiment title",
      "objective": "What is the specific goal of Experiment 01?",
      "hypothesis": "What do we expect to see or verify?",
      "testPlan": "Concrete steps to test",
      "expectedResult": "Success criteria (e.g. 'Rover successfully moves through environment')",
      "nextExperimentHint": "What comes next after this succeeds (e.g. 'Add terrain / sensors / navigation')",
      "parameters": {
        "speed": 5,
        "sensitivity": 1.0
      }
    },
    {
      "id": "exp-2",
      "number": 2,
      "title": "Second iteration experiment",
      "objective": "Goal of Experiment 02",
      "hypothesis": "Hypothesis for Experiment 02",
      "testPlan": "Concrete test steps",
      "expectedResult": "Success criteria for Exp 02",
      "nextExperimentHint": "What comes next",
      "parameters": {
        "speed": 6,
        "obstacleDensity": 12
      }
    },
    {
      "id": "exp-3",
      "number": 3,
      "title": "Third iteration experiment",
      "objective": "Goal of Experiment 03",
      "hypothesis": "Hypothesis for Experiment 03",
      "testPlan": "Concrete test steps",
      "expectedResult": "Success criteria for Exp 03",
      "nextExperimentHint": "Long term advancement",
      "parameters": {
        "autonomous": 1
      }
    }
  ],
  "codeSnippet": "// Core algorithm / logic snippet",
  "markdownProject": "Markdown representation in project.txt format"
}

Ensure the output is valid JSON only. Keep the experiment progression realistic: Experiment 01 is minimal viable test, Experiment 02 adds interaction/environment, Experiment 03 adds automation/complexity.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Idea: "${idea}"\nCreate the project structure.`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (geminiErr: any) {
        if (geminiErr?.message?.includes('429') || geminiErr?.message?.includes('RESOURCE_EXHAUSTED')) {
          geminiQuotaCooldownUntil = Date.now() + 60000;
          console.warn('[Gemini Quota Notice] Rate limit reached. Seamlessly activating built-in project synthesizer.');
        } else {
          console.warn('[Gemini Notice] Project generation fallback:', geminiErr?.message?.slice(0, 100));
        }
        return res.json({ fallback: true, message: 'Built-in project synthesizer active.' });
      }
    } catch (err: any) {
      console.warn('Error in /api/generate-project route, falling back to local synthesizer:', err?.message);
      return res.json({ fallback: true, message: 'Built-in project synthesizer active.' });
    }
  });


  // API Route: Generate code continuously from the user's current idea.
  app.post('/api/generate-code', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({ error: 'Please provide an idea string' });
      }

      const cacheKey = idea.trim().toLowerCase();
      if (codeCache.has(cacheKey)) {
        const cachedCode = codeCache.get(cacheKey)!;
        const language = inferCodeLanguage(idea, cachedCode);
        return res.json({ code: cachedCode, language, cached: true });
      }

      // Check if in Gemini API cooldown
      if (Date.now() < geminiQuotaCooldownUntil || !ai) {
        const fallbackCode = generateIntelligentFallbackCode(idea);
        codeCache.set(cacheKey, fallbackCode);
        const language = inferCodeLanguage(idea, fallbackCode);
        return res.json({ code: fallbackCode, language, fallback: true });
      }

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: idea,
          config: {
            systemInstruction: buildLanguageSystemPrompt() + `
You are the live code-generation engine inside ExperienceEngine.
The user is typing an idea on the left side of a split-screen creation environment.
Your job is to continuously turn the current idea into a useful implementation on the right side.

The language library above is injected directly into your generation context.
Treat it as the application's built-in code-language knowledge layer.
Your own LLM programming knowledge remains available for syntax, APIs, algorithms, architecture, debugging and implementation details.

Return ONLY source code. No markdown fences. No explanation.
Preserve the user's intent.
Choose the appropriate language from the library instead of defaulting blindly to JavaScript.
If the idea explicitly names a language, use that language.
If the idea implies a platform, use its natural language/toolchain when practical.
When the idea is incomplete, write a sensible scaffold that can evolve as more text arrives.
Do not invent unrelated features.
Use idiomatic syntax, standard libraries and established package/tooling conventions for the selected language.
The output should look like code that is actively being written by the system, not a tutorial.
`,
          },
        });

        const generatedCode = response.text?.trim() || generateIntelligentFallbackCode(idea);
        // Strip markdown fences if any slipped through
        const cleanCode = generatedCode.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
        codeCache.set(cacheKey, cleanCode);
        const language = inferCodeLanguage(idea, cleanCode);
        return res.json({ code: cleanCode, language });
      } catch (geminiErr: any) {
        // Handle 429 Quota or rate limit without 500 error or alarming logs
        if (geminiErr?.message?.includes('429') || geminiErr?.message?.includes('RESOURCE_EXHAUSTED')) {
          geminiQuotaCooldownUntil = Date.now() + 60000;
          console.warn('[Gemini Quota Notice] Rate limit reached. Seamlessly serving built-in code engine.');
        } else {
          console.warn('[Gemini Notice] Code generation fallback active:', geminiErr?.message?.slice(0, 100));
        }

        const fallbackCode = generateIntelligentFallbackCode(idea);
        codeCache.set(cacheKey, fallbackCode);
        const language = inferCodeLanguage(idea, fallbackCode);
        return res.json({ code: fallbackCode, language, fallback: true });
      }
    } catch (err: any) {
      console.warn('Handling code generation fallback:', err?.message);
      const fallbackCode = generateIntelligentFallbackCode(typeof req.body?.idea === 'string' ? req.body.idea : '');
      const language = inferCodeLanguage(typeof req.body?.idea === 'string' ? req.body.idea : '', fallbackCode);
      return res.json({ code: fallbackCode, language, fallback: true });
    }
  });

  // Expose the injected language library to the creation environment.
  app.get('/api/languages', (_req, res) => {
    res.json({
      version: CODE_LANGUAGE_LIBRARY_VERSION,
      count: CODE_LANGUAGE_LIBRARY.length,
      languages: CODE_LANGUAGE_LIBRARY,
    });
  });

  // API Route: Generate next experiment
  app.post('/api/next-experiment', async (req, res) => {
    try {
      const { projectTitle, currentExperiment, observation } = req.body;
      if (ai && Date.now() >= geminiQuotaCooldownUntil) {
        try {
          const prompt = `Project: "${projectTitle}". Current Experiment: ${JSON.stringify(currentExperiment)}. User observation: "${observation}". Propose the next experiment in JSON format with fields: number, title, objective, hypothesis, testPlan, expectedResult, nextExperimentHint, parameters.`;
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
          const text = response.text?.trim() || '';
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (geminiErr: any) {
          if (geminiErr?.message?.includes('429') || geminiErr?.message?.includes('RESOURCE_EXHAUSTED')) {
            geminiQuotaCooldownUntil = Date.now() + 60000;
            console.warn('[Gemini Quota Notice] Rate limit reached. Using local experiment advancement.');
          }
          return res.json({ fallback: true });
        }
      }
      return res.json({ fallback: true });
    } catch (err: any) {
      console.warn('Next experiment notice, using fallback:', err?.message);
      return res.json({ fallback: true });
    }
  });

  // Health / Status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString(),
    });
  });

  // Setup Vite in Dev or serve static in Prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXPERIENCE app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
