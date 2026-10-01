export type MakerLevel = 'Student' | 'Maker' | 'Developer' | 'Specialist' | 'Founder';

export interface DesignSystem {
  theme: 'midnight' | 'light';
  accent: 'cyan' | 'violet' | 'emerald' | 'amber';
  radius: 'sharp' | 'rounded' | 'pill';
  density: 'compact' | 'comfortable' | 'spacious';
  layout: 'dashboard' | 'split' | 'focused';
  typography: 'modern' | 'technical' | 'editorial';
  primaryComponent: 'hero' | 'workspace' | 'dashboard' | 'form';
  updatedAt: number;
}

export interface ParameterConfig {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description?: string;
}

export interface Experiment {
  id: string;
  number: number;
  title: string;
  objective: string;
  hypothesis: string;
  testPlan: string;
  expectedResult: string;
  actualResult?: string;
  verified: boolean;
  nextExperimentHint: string;
  logs: string[];
  parameters: Record<string, number>;
}

export interface Project {
  id: string;
  title: string;
  intention: string;
  objective: string;
  category: 'mars-rover' | 'gravity' | 'cellular' | 'synth' | 'simulation' | 'custom';
  summary: string;
  createdAt: number;
  updatedAt: number;
  experiments: Experiment[];
  activeExperimentIndex: number;
  codeSnippet: string;
  promptStats?: {
    characterCount: number;
    estimatedTokens: number;
    lastGeneratedAt?: number;
  };
  codeLanguage?: {
    id: string;
    name: string;
    extension: string;
  };
  markdownDoc: string;
  parameters: Record<string, ParameterConfig>;
  makerLevel: MakerLevel;
  designSystem?: DesignSystem;
}

export interface TelemetryReading {
  timestamp: number;
  speed: number;
  heading: number;
  battery: number;
  distance: number;
  hazardDetected: boolean;
  samplesCollected: number;
  message?: string;
}
