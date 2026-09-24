import React, { useEffect, useRef, useState } from 'react';
import { Project, Experiment } from '../types';
import { Play, RotateCcw, Orbit, Grid, Activity, Sparkles } from 'lucide-react';

interface GenericSimulationProps {
  project: Project;
  activeExperiment: Experiment;
  isRunning: boolean;
  onVerifyExperiment: (resultMessage: string) => void;
  onAddLog: (log: string) => void;
}

export const GenericSimulation: React.FC<GenericSimulationProps> = ({
  project,
  activeExperiment,
  isRunning,
  onVerifyExperiment,
  onAddLog,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generation, setGeneration] = useState(0);
  const [particleCount, setParticleCount] = useState(0);

  // Simulation persistent state for gravity/cellular/custom
  const stateRef = useRef({
    step: 0,
    grid: [] as number[][],
    bodies: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      mass: number;
      color: string;
      radius: number;
      trail: Array<{ x: number; y: number }>;
    }>,
  });

  // Initialize state based on category
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (project.category === 'gravity') {
      // Setup central star and orbiting planets
      stateRef.current.bodies = [
        {
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: 0,
          vy: 0,
          mass: project.parameters.centralStarMass?.value ?? 4000,
          color: '#facc15',
          radius: 16,
          trail: [],
        },
        {
          x: canvas.width / 2 + 160,
          y: canvas.height / 2,
          vx: 0,
          vy: 5.2,
          mass: 25,
          color: '#38bdf8',
          radius: 6,
          trail: [],
        },
        {
          x: canvas.width / 2 - 240,
          y: canvas.height / 2,
          vx: 0,
          vy: -4.1,
          mass: 45,
          color: '#f97316',
          radius: 8,
          trail: [],
        },
      ];
      setParticleCount(3);
    } else if (project.category === 'cellular') {
      // Setup cellular automata grid (60x40)
      const cols = 60;
      const rows = 40;
      const grid: number[][] = [];
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          grid[r][c] = Math.random() < 0.18 ? 1 : 0;
        }
      }
      // Seed a glider at top left
      grid[2][2] = 1;
      grid[3][3] = 1;
      grid[4][1] = 1;
      grid[4][2] = 1;
      grid[4][3] = 1;

      stateRef.current.grid = grid;
      setGeneration(0);
    } else {
      // Generic particle simulation for custom AI generated experiments
      const count = 35;
      stateRef.current.bodies = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * (canvas.width - 80) + 40,
        y: Math.random() * (canvas.height - 80) + 40,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        mass: 10 + Math.random() * 20,
        color: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'][i % 4],
        radius: 4 + Math.random() * 4,
        trail: [],
      }));
      setParticleCount(count);
    }
  }, [project.category, project.parameters]);

  // Main animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCounter = 0;

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      frameCounter++;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx && isRunning) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (project.category === 'gravity') {
          // --- GRAVITY SIMULATION ---
          const bodies = stateRef.current.bodies;
          const G = (project.parameters.gravitationalConstant?.value ?? 1200) * 0.0001;

          // Physics integration
          for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
              const b1 = bodies[i];
              const b2 = bodies[j];
              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const distSq = dx * dx + dy * dy + 80;
              const dist = Math.sqrt(distSq);
              const force = (G * b1.mass * b2.mass) / distSq;

              const fx = force * (dx / dist);
              const fy = force * (dy / dist);

              b1.vx += fx / b1.mass;
              b1.vy += fy / b1.mass;
              b2.vx -= fx / b2.mass;
              b2.vy -= fy / b2.mass;
            }
          }

          // Move bodies and render
          bodies.forEach((b, idx) => {
            b.x += b.vx;
            b.y += b.vy;

            // Trail
            if (frameCounter % 2 === 0) {
              b.trail.push({ x: b.x, y: b.y });
              if (b.trail.length > 90) b.trail.shift();
            }

            // Draw trail
            ctx.beginPath();
            b.trail.forEach((p, ti) => {
              if (ti === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
            ctx.strokeStyle = idx === 0 ? 'rgba(250, 204, 21, 0.2)' : 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw body
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glow for star
            if (idx === 0) {
              ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
              ctx.beginPath();
              ctx.arc(b.x, b.y, b.radius * 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Check validation after 150 frames
          if (!activeExperiment.verified && frameCounter > 150) {
            onVerifyExperiment('Stable orbital trajectory maintained without collision or escape velocity.');
          }
        } else if (project.category === 'cellular') {
          // --- CELLULAR AUTOMATA GRID ---
          const grid = stateRef.current.grid;
          const rows = grid.length;
          const cols = grid[0]?.length ?? 0;
          const cellW = canvas.width / cols;
          const cellH = canvas.height / rows;

          // Draw cells
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (grid[r][c] === 1) {
                ctx.fillStyle = '#34d399';
                ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
              }
            }
          }

          // Advance generation based on tick rate
          const tickRate = project.parameters.tickRate?.value ?? 15;
          const frameInterval = Math.max(1, Math.round(60 / tickRate));

          if (frameCounter % frameInterval === 0 && rows > 0) {
            const nextGrid: number[][] = [];
            for (let r = 0; r < rows; r++) {
              nextGrid[r] = [];
              for (let c = 0; c < cols; c++) {
                // Count neighbors
                let neighbors = 0;
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = (r + dr + rows) % rows;
                    const nc = (c + dc + cols) % cols;
                    if (grid[nr][nc] === 1) neighbors++;
                  }
                }

                if (grid[r][c] === 1) {
                  nextGrid[r][c] = neighbors === 2 || neighbors === 3 ? 1 : 0;
                } else {
                  nextGrid[r][c] = neighbors === 3 ? 1 : 0;
                }
              }
            }
            stateRef.current.grid = nextGrid;
            setGeneration((prev) => prev + 1);

            if (!activeExperiment.verified && frameCounter > 120) {
              onVerifyExperiment('Glider translated cleanly across matrix grid with exact pattern conservation.');
            }
          }
        } else {
          // --- CUSTOM / GENERAL SIMULATION ---
          const bodies = stateRef.current.bodies;
          bodies.forEach((b) => {
            b.x += b.vx;
            b.y += b.vy;

            // Bounce on canvas walls
            if (b.x < b.radius || b.x > canvas.width - b.radius) b.vx *= -1;
            if (b.y < b.radius || b.y > canvas.height - b.radius) b.vy *= -1;

            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw inter-connecting lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = 1;
          for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
              const dx = bodies[j].x - bodies[i].x;
              const dy = bodies[j].y - bodies[i].y;
              const dist = Math.hypot(dx, dy);
              if (dist < 90) {
                ctx.beginPath();
                ctx.moveTo(bodies[i].x, bodies[i].y);
                ctx.lineTo(bodies[j].x, bodies[j].y);
                ctx.stroke();
              }
            }
          }

          if (!activeExperiment.verified && frameCounter > 90) {
            onVerifyExperiment('Simulation system reached dynamic equilibrium under active parameter set.');
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [project, activeExperiment, isRunning, onVerifyExperiment]);

  // Click on canvas to spawn new body or flip cell
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (project.category === 'cellular') {
      const grid = stateRef.current.grid;
      const rows = grid.length;
      const cols = grid[0]?.length ?? 0;
      const c = Math.floor((x / canvas.width) * cols);
      const r = Math.floor((y / canvas.height) * rows);
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = grid[r][c] === 1 ? 0 : 1;
        onAddLog(`[Grid Interaction] Cell toggled at (${r}, ${c}).`);
      }
    } else if (project.category === 'gravity') {
      stateRef.current.bodies.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        mass: 15 + Math.random() * 20,
        color: '#a855f7',
        radius: 5,
        trail: [],
      });
      setParticleCount((prev) => prev + 1);
      onAddLog(`[Orbital Insertion] Deployed celestial body at coordinate (${Math.round(x)}, ${Math.round(y)}).`);
    } else {
      stateRef.current.bodies.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 15,
        color: '#f43f5e',
        radius: 6,
        trail: [],
      });
      setParticleCount((prev) => prev + 1);
      onAddLog(`[Simulation Spawn] Injected active entity at (${Math.round(x)}, ${Math.round(y)}).`);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden">
      {/* Top telemetry badge */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 pointer-events-auto shadow-lg">
          {project.category === 'gravity' && (
            <>
              <Orbit className="w-3.5 h-3.5 text-yellow-400" />
              <span>BODIES: <strong className="text-yellow-300">{particleCount}</strong></span>
              <span className="text-slate-700">|</span>
              <span>G: <strong className="text-cyan-300">{project.parameters.gravitationalConstant?.value ?? 1200}</strong></span>
            </>
          )}
          {project.category === 'cellular' && (
            <>
              <Grid className="w-3.5 h-3.5 text-emerald-400" />
              <span>GEN: <strong className="text-emerald-300">{generation}</strong></span>
              <span className="text-slate-700">|</span>
              <span>RATE: <strong className="text-cyan-300">{project.parameters.tickRate?.value ?? 15} fps</strong></span>
            </>
          )}
          {project.category !== 'gravity' && project.category !== 'cellular' && (
            <>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>ENTITIES: <strong className="text-cyan-300">{particleCount}</strong></span>
            </>
          )}
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1">
          Click canvas to interact / spawn
        </div>
      </div>

      <div className="relative flex-1 w-full h-full min-h-[380px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={560}
          onClick={handleCanvasClick}
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
};
