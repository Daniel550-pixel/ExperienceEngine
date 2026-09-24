import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Project, Experiment } from '../types';
import {
  Compass,
  Battery,
  Gauge,
  Radio,
  Crosshair,
  ShieldAlert,
  Pickaxe,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface MarsRoverSimulationProps {
  project: Project;
  activeExperiment: Experiment;
  isRunning: boolean;
  onVerifyExperiment: (resultMessage: string) => void;
  onAddLog: (log: string) => void;
  onParameterChange?: (key: string, value: number) => void;
}

interface RockHazard {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'crater' | 'boulder' | 'mineral';
  mineralName?: string;
  collected?: boolean;
}

export const MarsRoverSimulation: React.FC<MarsRoverSimulationProps> = ({
  project,
  activeExperiment,
  isRunning,
  onVerifyExperiment,
  onAddLog,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rover state refs (for 60fps physics loop without React re-render lag)
  const roverRef = useRef({
    x: 340,
    y: 280,
    angle: -Math.PI / 2, // Facing up
    speed: 0,
    steeringAngle: 0,
    battery: 98.5,
    distanceTraveled: 0,
    samples: [] as string[],
    tracks: [] as { x: number; y: number; angle: number; age: number }[],
    lidarRays: [] as { angle: number; distance: number; hit: boolean }[],
    lidarSweepAngle: 0,
    waypoint: null as { x: number; y: number } | null,
    drilling: false,
    drillProgress: 0,
    nearestHazardDistance: 999,
    hazardAlert: false,
  });

  // User input controls state
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  // UI state for telemetry HUD
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    heading: 0,
    battery: 98.5,
    distance: 0,
    samplesCount: 0,
    hazardDistance: 999,
    hazardAlert: false,
    waypointActive: false,
    drilling: false,
  });

  // Static Martian terrain obstacles & science sample sites
  const hazardsRef = useRef<RockHazard[]>([
    { id: 'c1', x: 180, y: 160, radius: 48, type: 'crater' },
    { id: 'c2', x: 550, y: 190, radius: 60, type: 'crater' },
    { id: 'c3', x: 220, y: 440, radius: 55, type: 'crater' },
    { id: 'c4', x: 620, y: 430, radius: 45, type: 'crater' },
    { id: 'b1', x: 380, y: 120, radius: 20, type: 'boulder' },
    { id: 'b2', x: 490, y: 320, radius: 24, type: 'boulder' },
    { id: 'b3', x: 140, y: 320, radius: 18, type: 'boulder' },
    { id: 'b4', x: 360, y: 460, radius: 22, type: 'boulder' },
    { id: 'm1', x: 460, y: 150, radius: 16, type: 'mineral', mineralName: 'Hematite Core (Fe₂O₃)' },
    { id: 'm2', x: 280, y: 180, radius: 16, type: 'mineral', mineralName: 'Olivine Crystal (Mg,Fe)₂SiO₄' },
    { id: 'm3', x: 580, y: 330, radius: 16, type: 'mineral', mineralName: 'Hydrated Silica' },
    { id: 'm4', x: 440, y: 430, radius: 16, type: 'mineral', mineralName: 'Basaltic Volcanic Regolith' },
  ]);

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keysRef.current.forward = true;
        roverRef.current.waypoint = null; // Manual override cancels autonomous waypoint
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        keysRef.current.backward = true;
        roverRef.current.waypoint = null;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (e.code === 'Space') {
        keysRef.current.brake = true;
        e.preventDefault();
      }
      if (e.code === 'KeyE') {
        attemptCollectSample();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.forward = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.backward = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.brake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Collect mineral sample function
  const attemptCollectSample = useCallback(() => {
    const rover = roverRef.current;
    if (rover.drilling) return;

    // Find closest mineral
    let target: RockHazard | null = null;
    let minDist = 45;

    for (const h of hazardsRef.current) {
      if (h.type === 'mineral' && !h.collected) {
        const dx = h.x - rover.x;
        const dy = h.y - rover.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          minDist = dist;
          target = h;
        }
      }
    }

    if (target && target.mineralName) {
      rover.drilling = true;
      rover.drillProgress = 0;
      onAddLog(`[Drill] Commencing rotary-percussive sample extraction: ${target.mineralName}`);

      const interval = setInterval(() => {
        rover.drillProgress += 20;
        if (rover.drillProgress >= 100) {
          clearInterval(interval);
          rover.drilling = false;
          target.collected = true;
          rover.samples.push(target.mineralName!);
          onAddLog(`[Sample Secured] Extracted ${target.mineralName}. Cached in internal hermetic carousel.`);
          if (!activeExperiment.verified && activeExperiment.number === 3) {
            onVerifyExperiment('Autonomous traversal & sample core extraction successfully completed!');
          }
        }
      }, 300);
    } else {
      onAddLog('[Drill Alert] No geological sample site in drill reach (move within 40m).');
    }
  }, [activeExperiment, onAddLog, onVerifyExperiment]);

  // Click on canvas to set waypoint for autonomous navigation (Experiment 03)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const targetX = (e.clientX - rect.left) * scaleX;
    const targetY = (e.clientY - rect.top) * scaleY;

    roverRef.current.waypoint = { x: targetX, y: targetY };
    onAddLog(`[Waypoint Transmitted] Target coordinates set: X=${Math.round(targetX)}, Y=${Math.round(targetY)}`);
  };

  // Main simulation & rendering loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCounter = 0;

    const enginePower = project.parameters.enginePower?.value ?? 3.5;
    const steerSpeed = project.parameters.steerSpeed?.value ?? 0.05;
    const friction = project.parameters.terrainFriction?.value ?? 0.88;
    const sensorRange = project.parameters.sensorRange?.value ?? 120;
    const solarEfficiency = project.parameters.solarEfficiency?.value ?? 1.2;

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      frameCounter++;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx && isRunning) {
        const rover = roverRef.current;
        const keys = keysRef.current;

        // 1. AUTONOMOUS WAYPOINT BEHAVIOR
        if (rover.waypoint && !rover.drilling) {
          const dx = rover.waypoint.x - rover.x;
          const dy = rover.waypoint.y - rover.y;
          const distToWaypoint = Math.hypot(dx, dy);

          if (distToWaypoint < 15) {
            rover.waypoint = null;
            rover.speed *= 0.3;
            onAddLog('[Autonomy] Destination reached. Station-keeping engaged.');
          } else {
            const targetAngle = Math.atan2(dy, dx);
            let angleDiff = targetAngle - rover.angle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // Turn toward waypoint
            if (Math.abs(angleDiff) > 0.08) {
              rover.angle += Math.sign(angleDiff) * steerSpeed * 0.9;
            }
            // Accelerate forward if reasonably aligned
            if (Math.abs(angleDiff) < 0.6) {
              rover.speed += enginePower * 0.4 * dt;
            } else {
              rover.speed *= 0.95; // slow down for tight turn
            }
          }
        } else if (!rover.drilling) {
          // 2. MANUAL DRIVE LOGIC
          if (keys.forward) {
            rover.speed += enginePower * dt;
          }
          if (keys.backward) {
            rover.speed -= enginePower * 0.6 * dt;
          }
          if (keys.brake) {
            rover.speed *= 0.82;
          }

          // Steering (rate depends on motion)
          const effectiveSpeed = Math.abs(rover.speed);
          const turnMultiplier = keys.forward || keys.backward ? 1.0 : (effectiveSpeed > 0.1 ? 0.8 : 0.4);
          if (keys.left) {
            rover.angle -= steerSpeed * turnMultiplier;
            rover.steeringAngle = -0.3;
          } else if (keys.right) {
            rover.angle += steerSpeed * turnMultiplier;
            rover.steeringAngle = 0.3;
          } else {
            rover.steeringAngle *= 0.8;
          }
        }

        // Apply regolith soil drag
        rover.speed *= Math.pow(friction, dt * 50);

        // Cap max speed
        const maxSpeed = 4.2;
        rover.speed = Math.max(-maxSpeed * 0.5, Math.min(maxSpeed, rover.speed));

        // Integrate position
        const moveX = Math.cos(rover.angle) * rover.speed;
        const moveY = Math.sin(rover.angle) * rover.speed;
        rover.x += moveX;
        rover.y += moveY;
        rover.distanceTraveled += Math.hypot(moveX, moveY) * 0.2;

        // Keep inside canvas bounds
        rover.x = Math.max(30, Math.min(canvas.width - 30, rover.x));
        rover.y = Math.max(30, Math.min(canvas.height - 30, rover.y));

        // Battery logic
        const drain = Math.abs(rover.speed) * 0.05 * dt + (rover.drilling ? 0.3 * dt : 0);
        const recharge = 0.015 * solarEfficiency * dt;
        rover.battery = Math.max(0, Math.min(100, rover.battery - drain + recharge));

        // Automatic experiment 1 verification check
        if (activeExperiment.number === 1 && !activeExperiment.verified && rover.distanceTraveled > 25) {
          onVerifyExperiment('Rover successfully moves through environment.');
        }

        // 3. SOIL TREAD MARKS
        if (Math.abs(rover.speed) > 0.3 && frameCounter % 4 === 0) {
          rover.tracks.push({
            x: rover.x - Math.cos(rover.angle) * 12,
            y: rover.y - Math.sin(rover.angle) * 12,
            angle: rover.angle,
            age: 1.0,
          });
          if (rover.tracks.length > 80) rover.tracks.shift();
        }
        // Fade tracks
        rover.tracks.forEach((t) => (t.age = Math.max(0, t.age - dt * 0.03)));

        // 4. LIDAR SENSOR SWEEP & HAZARD DETECTION
        rover.lidarSweepAngle = (rover.lidarSweepAngle + dt * 4.5) % (Math.PI * 2);
        rover.lidarRays = [];
        let nearestDist = 999;

        const rayCount = 24;
        for (let i = 0; i < rayCount; i++) {
          const rayAngle = rover.angle - 0.7 + (1.4 * i) / (rayCount - 1);
          let rayDist = sensorRange;
          let hit = false;

          for (const h of hazardsRef.current) {
            const hdx = h.x - rover.x;
            const hdy = h.y - rover.y;
            const centerDist = Math.hypot(hdx, hdy);

            // Check if within ray cone
            const angleToHazard = Math.atan2(hdy, hdx);
            let diff = angleToHazard - rayAngle;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;

            if (Math.abs(diff) < 0.08 && centerDist < sensorRange) {
              rayDist = Math.min(rayDist, Math.max(10, centerDist - h.radius));
              hit = true;
              if (centerDist - h.radius < nearestDist) {
                nearestDist = centerDist - h.radius;
              }
            }
          }
          rover.lidarRays.push({ angle: rayAngle, distance: rayDist, hit });
        }

        rover.nearestHazardDistance = nearestDist;
        rover.hazardAlert = nearestDist < 35;

        // Verify Experiment 02 if hazards detected near rover
        if (activeExperiment.number === 2 && !activeExperiment.verified && rover.hazardAlert) {
          onVerifyExperiment('Obstacles detected in real-time; proximity HUD displays distance and hazard alerts.');
        }

        // 5. COLLISION BOUNCE (boulders & craters)
        for (const h of hazardsRef.current) {
          if (h.type === 'boulder' || h.type === 'crater') {
            const dx = rover.x - h.x;
            const dy = rover.y - h.y;
            const dist = Math.hypot(dx, dy);
            const minDist = h.radius + 16;
            if (dist < minDist) {
              // Push rover back
              const overlap = minDist - dist;
              const pushAngle = Math.atan2(dy, dx);
              rover.x += Math.cos(pushAngle) * overlap;
              rover.y += Math.sin(pushAngle) * overlap;
              rover.speed *= -0.3; // bounce
            }
          }
        }

        // ================= DRAWING =================
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. Martian Regolith Background
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#2b1008');
        grad.addColorStop(0.5, '#3b160b');
        grad.addColorStop(1, '#1f0b06');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Terrain texture / contour grid
        ctx.strokeStyle = 'rgba(217, 119, 74, 0.08)';
        ctx.lineWidth = 1;
        const gridStep = 40;
        for (let x = 0; x < canvas.width; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // B. Wheel tracks
        rover.tracks.forEach((t) => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.angle);
          ctx.fillStyle = `rgba(18, 6, 3, ${t.age * 0.45})`;
          // Left and right wheel tracks
          ctx.fillRect(-4, -10, 8, 3);
          ctx.fillRect(-4, 7, 8, 3);
          ctx.restore();
        });

        // C. Draw Hazards & Terrain Features
        hazardsRef.current.forEach((h) => {
          if (h.type === 'crater') {
            // Crater rim shadow & depression
            const craterGrad = ctx.createRadialGradient(h.x, h.y, h.radius * 0.2, h.x, h.y, h.radius);
            craterGrad.addColorStop(0, '#140603');
            craterGrad.addColorStop(0.7, '#240d07');
            craterGrad.addColorStop(1, '#5a2211');
            ctx.fillStyle = craterGrad;
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();

            // Rim highlight
            ctx.strokeStyle = 'rgba(235, 130, 88, 0.35)';
            ctx.lineWidth = 3;
            ctx.stroke();
          } else if (h.type === 'boulder') {
            // Rugged rock boulder
            ctx.save();
            ctx.fillStyle = '#422117';
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();
            // Boulder shadow
            ctx.strokeStyle = '#6b3626';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Core highlight
            ctx.fillStyle = '#8f4a35';
            ctx.beginPath();
            ctx.arc(h.x - h.radius * 0.25, h.y - h.radius * 0.25, h.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (h.type === 'mineral') {
            // Scientific Mineral Site
            if (!h.collected) {
              const pulse = Math.sin(currentTime * 0.005) * 4;
              ctx.save();
              ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
              ctx.beginPath();
              ctx.arc(h.x, h.y, h.radius + 8 + pulse, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.5;
              ctx.setLineDash([3, 3]);
              ctx.stroke();

              // Mineral crystal icon
              ctx.fillStyle = '#0284c7';
              ctx.beginPath();
              ctx.arc(h.x, h.y, h.radius * 0.6, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#e0f2fe';
              ctx.font = '10px "JetBrains Mono", monospace';
              ctx.textAlign = 'center';
              ctx.fillText('SAMPLE', h.x, h.y - h.radius - 8);
              ctx.restore();
            } else {
              // Drilled core borehole mark
              ctx.fillStyle = '#110502';
              ctx.beginPath();
              ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });

        // D. Waypoint indicator
        if (rover.waypoint) {
          const wp = rover.waypoint;
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(rover.x, rover.y);
          ctx.lineTo(wp.x, wp.y);
          ctx.stroke();

          // Target reticle
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.restore();
        }

        // E. LIDAR Raycast Cone (Experiments 02 & 03)
        if (activeExperiment.number >= 2) {
          rover.lidarRays.forEach((ray) => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(rover.x, rover.y);
            const rx = rover.x + Math.cos(ray.angle) * ray.distance;
            const ry = rover.y + Math.sin(ray.angle) * ray.distance;
            ctx.lineTo(rx, ry);
            ctx.strokeStyle = ray.hit ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.18)';
            ctx.lineWidth = ray.hit ? 1.8 : 0.8;
            ctx.stroke();

            if (ray.hit) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(rx, ry, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });
        }

        // F. Rover Headlight Beam
        ctx.save();
        ctx.translate(rover.x, rover.y);
        ctx.rotate(rover.angle);

        const lightGrad = ctx.createRadialGradient(0, 0, 10, 80, 0, 140);
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
        lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(12, -8);
        ctx.lineTo(130, -50);
        ctx.lineTo(130, 50);
        ctx.lineTo(12, 8);
        ctx.closePath();
        ctx.fill();

        // G. Draw Rover Body & Mechanical Parts
        // 6 Rocker-bogie wheels
        const wheelCoords = [
          { x: 14, y: -16 },
          { x: 0, y: -17 },
          { x: -14, y: -16 },
          { x: 14, y: 16 },
          { x: 0, y: 17 },
          { x: -14, y: 16 },
        ];

        wheelCoords.forEach((wc) => {
          ctx.save();
          ctx.translate(wc.x, wc.y);
          // Front wheels steer with angle
          if (wc.x > 5) ctx.rotate(rover.steeringAngle);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-6, -3, 12, 6);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.strokeRect(-6, -3, 12, 6);
          ctx.restore();
        });

        // Rocker bogie titanium arms
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-12, -15);
        ctx.lineTo(0, -12);
        ctx.lineTo(12, -15);
        ctx.moveTo(-12, 15);
        ctx.lineTo(0, 12);
        ctx.lineTo(12, 15);
        ctx.stroke();

        // Rover Main Deck / Chassis
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-18, -12, 34, 24);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -12, 34, 24);

        // Solar Panels (Gold / Dark Blue photovoltaic cells)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-16, -10, 14, 20);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.strokeRect(-16, -10, 14, 20);

        // Mast Camera head
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(10, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        // High-gain Parabolic Antenna dish
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-8, -4, 5, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        // Robotic drill arm animation
        if (rover.drilling) {
          ctx.save();
          ctx.translate(14, 6);
          const drillShake = Math.sin(currentTime * 0.1) * 3;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(10 + drillShake, 6);
          ctx.stroke();
          // Drill spark particle
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(10 + drillShake, 6, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore(); // End rover transform

        // Telemetry HUD throttle (update state every 10 frames)
        if (frameCounter % 6 === 0) {
          const headingDeg = Math.round(((rover.angle * 180) / Math.PI + 360) % 360);
          setTelemetry({
            speed: Math.abs(Number(rover.speed.toFixed(2))),
            heading: headingDeg,
            battery: Math.round(rover.battery),
            distance: Math.round(rover.distanceTraveled),
            samplesCount: rover.samples.length,
            hazardDistance: Math.round(rover.nearestHazardDistance),
            hazardAlert: rover.hazardAlert,
            waypointActive: Boolean(rover.waypoint),
            drilling: rover.drilling,
          });
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [project, activeExperiment, isRunning, onAddLog, onVerifyExperiment]);

  // On-screen control helpers
  const handleTouchControl = (key: keyof typeof keysRef.current, state: boolean) => {
    keysRef.current[key] = state;
    if (state && (key === 'forward' || key === 'backward')) {
      roverRef.current.waypoint = null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden">
      {/* HUD Bar on top of Canvas */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Telemetry Cluster */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 pointer-events-auto text-xs font-mono shadow-lg">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>SPEED:</span>
            <span className="text-cyan-300 font-semibold">{telemetry.speed} m/s</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>HDG:</span>
            <span className="text-amber-300">{telemetry.heading}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Battery className={`w-3.5 h-3.5 ${telemetry.battery < 25 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
            <span>PWR:</span>
            <span className={telemetry.battery < 25 ? 'text-red-300 font-bold' : 'text-emerald-300'}>{telemetry.battery}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Pickaxe className="w-3.5 h-3.5 text-sky-400" />
            <span>CORES:</span>
            <span className="text-sky-300">{telemetry.samplesCount}/4</span>
          </div>
        </div>

        {/* Hazard & Autonomy Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {telemetry.hazardAlert && (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/80 text-red-300 px-2.5 py-1 rounded-md text-xs font-mono animate-pulse shadow-lg">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>HAZARD ALERT: {telemetry.hazardDistance}m</span>
            </div>
          )}
          {telemetry.waypointActive && (
            <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/70 text-sky-300 px-2.5 py-1 rounded-md text-xs font-mono shadow-lg">
              <Navigation className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span>AUTONAV ACTIVE</span>
            </div>
          )}
          {telemetry.drilling && (
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/70 text-amber-300 px-2.5 py-1 rounded-md text-xs font-mono shadow-lg animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DRILLING SAMPLE...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full min-h-[380px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={560}
          onClick={handleCanvasClick}
          className="w-full h-full object-cover block"
        />

        {/* Experiment Context Banner overlay */}
        <div className="absolute bottom-3 left-3 z-10 max-w-sm pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-cyan-400 font-semibold">EXPERIMENT {activeExperiment.number}:</span>
              {activeExperiment.verified ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              ) : (
                <span className="text-amber-400 animate-pulse">TEST IN PROGRESS</span>
              )}
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed line-clamp-2">
              {activeExperiment.objective}
            </p>
          </div>
        </div>

        {/* Floating Manual Cockpit Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-2 shadow-2xl">
          <div className="text-[10px] font-mono text-slate-400 mb-0.5 uppercase tracking-wider">Rover Controls</div>
          <button
            type="button"
            onMouseDown={() => handleTouchControl('forward', true)}
            onMouseUp={() => handleTouchControl('forward', false)}
            onTouchStart={() => handleTouchControl('forward', true)}
            onTouchEnd={() => handleTouchControl('forward', false)}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold text-xs shadow transition-colors"
            title="Accelerate Forward (W / Up Arrow)"
          >
            ▲
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={() => handleTouchControl('left', true)}
              onMouseUp={() => handleTouchControl('left', false)}
              onTouchStart={() => handleTouchControl('left', true)}
              onTouchEnd={() => handleTouchControl('left', false)}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold text-xs shadow transition-colors"
              title="Steer Left (A / Left Arrow)"
            >
              ◀
            </button>
            <button
              type="button"
              onMouseDown={() => handleTouchControl('backward', true)}
              onMouseUp={() => handleTouchControl('backward', false)}
              onTouchStart={() => handleTouchControl('backward', true)}
              onTouchEnd={() => handleTouchControl('backward', false)}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold text-xs shadow transition-colors"
              title="Reverse (S / Down Arrow)"
            >
              ▼
            </button>
            <button
              type="button"
              onMouseDown={() => handleTouchControl('right', true)}
              onMouseUp={() => handleTouchControl('right', false)}
              onTouchStart={() => handleTouchControl('right', true)}
              onTouchEnd={() => handleTouchControl('right', false)}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold text-xs shadow transition-colors"
              title="Steer Right (D / Right Arrow)"
            >
              ▶
            </button>
          </div>
          <div className="flex items-center gap-1 mt-1 w-full">
            <button
              type="button"
              onMouseDown={() => handleTouchControl('brake', true)}
              onMouseUp={() => handleTouchControl('brake', false)}
              onTouchStart={() => handleTouchControl('brake', true)}
              onTouchEnd={() => handleTouchControl('brake', false)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-rose-600 border border-slate-700 text-slate-300 text-[10px] font-mono font-semibold text-center transition-colors"
            >
              BRAKE
            </button>
            <button
              type="button"
              onClick={attemptCollectSample}
              className="flex-1 py-1.5 px-2 rounded-lg bg-sky-950 hover:bg-sky-900 active:bg-sky-700 border border-sky-600/60 text-sky-200 text-[10px] font-mono font-semibold text-center transition-colors flex items-center justify-center gap-1"
            >
              <Pickaxe className="w-3 h-3 text-sky-400" />
              DRILL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
