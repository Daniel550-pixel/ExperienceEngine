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

  // API Route: Generate project from user idea
  app.post('/api/generate-project', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({ error: 'Please provide an idea string' });
      }

      // If AI client is available, generate structured project using gemini-3.8-flash
      if (ai) {
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
      }

      // Fallback if no API key is provided
      return res.json({ fallback: true, message: 'No API key configured, using built-in generator.' });
    } catch (err: any) {
      console.error('Error generating project:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate project' });
    }
  });


  // API Route: Generate code continuously from the user's current idea.
  app.post('/api/generate-code', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({ error: 'Please provide an idea string' });
      }

      if (ai) {
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

        return res.json({ code: response.text?.trim() || '// No code generated yet.' });
      }

      const safeIdea = idea.replace(/\\/g, '\\\\').replace(/\`/g, '\\\`');
      return res.json({
        code: `// ExperienceEngine — live generated scaffold
// Current idea:
// ${safeIdea}

export class Creation {
  readonly idea = ${JSON.stringify(idea)};

  run() {
    console.log("Building:", this.idea);
  }
}

const creation = new Creation();
creation.run();
`,
      });
    } catch (err: any) {
      console.error('Error generating live code:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate code' });
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
      if (ai) {
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
      }
      return res.json({ fallback: true });
    } catch (err: any) {
      console.error('Error proposing next experiment:', err);
      return res.status(500).json({ error: err.message || 'Failed to propose experiment' });
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
