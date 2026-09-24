import { Project } from '../types';

export const MARS_ROVER_PROJECT: Project = {
  id: 'mars-rover-v1',
  title: 'Mars Rover Simulation',
  intention: 'I want to build a Mars rover simulation.',
  objective: 'Create a basic simulated rover capable of traversing simulated planetary terrain.',
  category: 'mars-rover',
  summary: 'A physics-grounded Martian rover exploration environment featuring differential wheel steering, surface regolith drag, lidar hazard detection, and autonomous waypoint navigation.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activeExperimentIndex: 0,
  makerLevel: 'Student',
  parameters: {
    enginePower: {
      label: 'Drive Motor Power',
      value: 3.5,
      min: 1.0,
      max: 8.0,
      step: 0.5,
      unit: 'kW',
      description: 'Torque applied to the 6 independently driven rover hub motors.',
    },
    steerSpeed: {
      label: 'Steering Rate',
      value: 0.05,
      min: 0.02,
      max: 0.12,
      step: 0.01,
      unit: 'rad/s',
      description: 'Angular yaw velocity during steer commands.',
    },
    terrainFriction: {
      label: 'Regolith Friction',
      value: 0.88,
      min: 0.70,
      max: 0.98,
      step: 0.02,
      unit: 'μ',
      description: 'Drag coefficient of the Martian fine-grain soil.',
    },
    sensorRange: {
      label: 'LIDAR Sensor Range',
      value: 120,
      min: 50,
      max: 250,
      step: 10,
      unit: 'm',
      description: 'Optical distance detection cone for hazard mapping.',
    },
    solarEfficiency: {
      label: 'Solar Array Absorption',
      value: 1.2,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      unit: 'x',
      description: 'Battery recharge rate from ambient Martian daylight.',
    },
  },
  experiments: [
    {
      id: 'mars-exp-01',
      number: 1,
      title: 'Controllable Rover in Simulated Environment',
      objective: 'Create a controllable rover inside a simulated environment.',
      hypothesis: 'Rover will respond to directional drive and steering inputs with simulated planetary inertia.',
      testPlan: '1. Initialize rover at coordinates (X: 300, Y: 250).\n2. Apply forward / reverse throttle and left / right steering.\n3. Verify velocity integration, wheel turning, and regolith tread marks.',
      expectedResult: 'Rover successfully moves through environment.',
      actualResult: 'Rover successfully moves through environment. Differential kinematics verified; wheel tracks rendered smoothly in Martian soil.',
      verified: true,
      nextExperimentHint: 'Add terrain / sensors / navigation.',
      logs: [
        '[Telemetry] Rover chassis initialized at origin [300, 250].',
        '[Powertrain] 6 hub actuators online, telemetry link nominal.',
        '[Mobility Test] Throttle forward applied: velocity peaked at 2.4 m/s.',
        '[Result] Verified: Rover moves smoothly across simulated regolith.',
      ],
      parameters: {
        enginePower: 3.5,
        terrainFriction: 0.88,
      },
    },
    {
      id: 'mars-exp-02',
      number: 2,
      title: 'Terrain Craters & LIDAR Hazard Detection',
      objective: 'Add terrain topography, impact craters, and proximity sensors to detect impassable boulders.',
      hypothesis: 'LIDAR distance sweeps will detect obstacle boundaries within 120m, preventing high-speed chassis collisions.',
      testPlan: '1. Populate Jezero Crater terrain with boulders, crater rims, and mineral deposits.\n2. Enable real-time LIDAR raycast sweep.\n3. Pilot toward hazards and verify acoustic/visual proximity warnings.',
      expectedResult: 'Obstacles detected in real-time; proximity HUD displays distance and hazard alerts.',
      actualResult: 'Sensors detected 5 crater rims and 8 boulder fields with zero false positives. Hazard avoidance buffer active.',
      verified: false,
      nextExperimentHint: 'Autonomous waypoint navigation & rock sample collection.',
      logs: [
        '[Terrain] Synthesized Martian topography with 6 crater rings and 14 boulder clusters.',
        '[Sensors] 360-degree pulsed LIDAR active at 120m sweep radius.',
        '[Safety] Proximity warning threshold set to 35m.',
      ],
      parameters: {
        sensorRange: 120,
        steerSpeed: 0.06,
      },
    },
    {
      id: 'mars-exp-03',
      number: 3,
      title: 'Autonomous Waypoint Navigation & Rock Core Drilling',
      objective: 'Implement autonomous path planning to click-selected coordinates with scientific sample extraction.',
      hypothesis: 'Autonomous steering vector computation will guide rover to destination coordinates while circumnavigating hazards.',
      testPlan: '1. Click anywhere on Martian surface to transmit waypoint coordinate.\n2. Autonomous nav-loop computes course angle and adjusts steering.\n3. Upon reaching mineral target, deploy robotic drill arm to extract scientific core.',
      expectedResult: 'Autonomous traversal successfully navigates to waypoint and collects sample core.',
      actualResult: '',
      verified: false,
      nextExperimentHint: 'Long-range seismic survey & sample return vehicle rendezvous.',
      logs: [
        '[Autonomy] Pathfinding state machine mounted.',
        '[Science] Spectrometer and rotary-percussive drill ready for rock sampling.',
      ],
      parameters: {
        enginePower: 4.0,
        sensorRange: 150,
      },
    },
  ],
  codeSnippet: `// Mars Rover Kinematics & Physics Engine (V1)
export class MarsRover {
  x: number = 300;
  y: number = 250;
  angle: number = -Math.PI / 2; // facing upwards
  speed: number = 0;
  steering: number = 0;
  battery: number = 100.0;
  samples: string[] = [];

  update(dt: number, inputs: RoverInputs, env: MartianEnvironment) {
    // 1. Throttle & Motor power
    if (inputs.forward) this.speed += env.enginePower * dt;
    if (inputs.backward) this.speed -= env.enginePower * 0.7 * dt;
    if (inputs.brake) this.speed *= 0.85;

    // 2. Soil drag / friction
    this.speed *= Math.pow(env.friction, dt * 60);

    // 3. Angular steering with speed scaling
    if (inputs.steerLeft) this.angle -= env.steerSpeed * (this.speed > 0 ? 1 : -0.8);
    if (inputs.steerRight) this.angle += env.steerSpeed * (this.speed > 0 ? 1 : -0.8);

    // 4. Position integration
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // 5. Battery discharge & solar recharge
    const motorDrain = Math.abs(this.speed) * 0.04 * dt;
    const solarRecharge = 0.02 * env.solarMultiplier * dt;
    this.battery = Math.min(100, Math.max(0, this.battery - motorDrain + solarRecharge));

    // 6. Hazard detection (Exp 02 & 03)
    this.lidarSweep(env.hazards);
  }
}`,
  markdownDoc: `# Mars Rover Simulation
**Intention:** I want to build a Mars rover simulation.
**Objective:** Create a basic simulated rover capable of traversing simulated planetary terrain.

## Experiment 01 — Basic Rover Motion
- **Objective:** Create a controllable rover inside a simulated environment.
- **Hypothesis:** Rover responds to directional drive and steering inputs with simulated planetary inertia.
- **[ BUILD / RUN ]** → **Result:** Rover successfully moves through environment.
- **Next Experiment:** Add terrain / sensors / navigation.

## Experiment 02 — Terrain & Hazards
- **Objective:** Add craters, rocks, and LIDAR sensors.
- **Result:** Proximity warnings prevent wheel entrapment.

## Experiment 03 — Autonomous Navigation
- **Objective:** Click-to-drive waypoint planning and mineral extraction.
`,
};

export const GRAVITY_PROJECT: Project = {
  id: 'gravity-sim-v1',
  title: 'Solar Orbit & Gravity Lab',
  intention: 'I want to build a multi-body gravitational orbit simulator.',
  objective: 'Simulate Newtonian celestial gravity, elliptical orbits, and slingshot trajectory dynamics.',
  category: 'gravity',
  summary: 'Interactive N-body orbital physics simulator where users launch satellites, adjust gravitational constants, and test orbital resonance.',
  createdAt: Date.now() - 100000,
  updatedAt: Date.now(),
  activeExperimentIndex: 0,
  makerLevel: 'Maker',
  parameters: {
    gravitationalConstant: {
      label: 'Gravitational Constant (G)',
      value: 1200,
      min: 200,
      max: 3000,
      step: 100,
      unit: 'm³/(kg·s²)',
      description: 'Attractive force multiplier between orbiting bodies.',
    },
    centralStarMass: {
      label: 'Central Star Mass',
      value: 4000,
      min: 1000,
      max: 10000,
      step: 500,
      unit: 'M☉',
      description: 'Mass of the primary gravitational anchor.',
    },
    trailLength: {
      label: 'Orbital Path History',
      value: 80,
      min: 20,
      max: 200,
      step: 10,
      unit: 'steps',
      description: 'Number of past trajectory vectors retained for visualization.',
    },
  },
  experiments: [
    {
      id: 'grav-exp-01',
      number: 1,
      title: 'Stable Circular Orbit Equilibrium',
      objective: 'Launch a satellite with precise tangential velocity to achieve a closed circular orbit.',
      hypothesis: 'Centripetal acceleration balancing gravitational pull creates steady eccentricity (e ≈ 0).',
      testPlan: 'Set velocity vector perpendicular to radial vector: v = sqrt(G * M / r).',
      expectedResult: 'Satellite completes 3 stable orbits without spiraling into the star or escaping.',
      actualResult: 'Stable orbit maintained. Orbital period measured at 4.2 seconds.',
      verified: true,
      nextExperimentHint: 'Add secondary moon to test Lagrange points and gravitational slingshots.',
      logs: [
        '[Simulation] Central star seeded with mass 4000 M☉.',
        '[Orbital Mechanics] Satellite launched at radius r=160, velocity v=5.47.',
        '[Result] Stable orbital closure verified.',
      ],
      parameters: {
        gravitationalConstant: 1200,
        centralStarMass: 4000,
      },
    },
    {
      id: 'grav-exp-02',
      number: 2,
      title: 'Gravitational Slingshot & Velocity Boost',
      objective: 'Perform a hyperbolic flyby around a gas giant to boost satellite velocity toward deep space.',
      hypothesis: 'Passing behind an orbiting planetary body transfers angular momentum to the probe.',
      testPlan: 'Trajectory intercept timed at trailing edge of gas giant orbit.',
      expectedResult: 'Probe velocity increases by >40% post-encounter.',
      actualResult: '',
      verified: false,
      nextExperimentHint: 'Three-body chaotic resonance & stable asteroid belt generation.',
      logs: [
        '[Orbital Lab] Gas giant placed at r=240.',
        '[Flyby] Preparing probe launch vector.',
      ],
      parameters: {
        gravitationalConstant: 1500,
      },
    },
  ],
  codeSnippet: `// N-Body Gravitational Acceleration
function calculateGravity(body1: Body, body2: Body, G: number) {
  const dx = body2.x - body1.x;
  const dy = body2.y - body1.y;
  const distSq = dx * dx + dy * dy + 100; // softening factor
  const dist = Math.sqrt(distSq);
  const force = (G * body1.mass * body2.mass) / distSq;
  return {
    fx: force * (dx / dist),
    fy: force * (dy / dist),
  };
}`,
  markdownDoc: `# Solar Orbit & Gravity Lab
**Intention:** I want to build a multi-body gravitational orbit simulator.
**Objective:** Simulate Newtonian celestial gravity and orbital mechanics.`,
};

export const CELLULAR_PROJECT: Project = {
  id: 'cellular-life-v1',
  title: 'Emergent Cellular Automata',
  intention: 'I want to build Conway’s Game of Life with custom mutation and seed rules.',
  objective: 'Explore emergent complex patterns from simple localized cell neighbor rules.',
  category: 'cellular',
  summary: 'A high-speed interactive grid simulation demonstrating Conway’s Game of Life, glider guns, oscillators, and custom biological growth algorithms.',
  createdAt: Date.now() - 200000,
  updatedAt: Date.now(),
  activeExperimentIndex: 0,
  makerLevel: 'Maker',
  parameters: {
    tickRate: {
      label: 'Generation Speed',
      value: 15,
      min: 1,
      max: 60,
      step: 1,
      unit: 'fps',
      description: 'Generations evaluated per second.',
    },
    cellSize: {
      label: 'Grid Resolution',
      value: 12,
      min: 6,
      max: 24,
      step: 2,
      unit: 'px',
      description: 'Visual width of each microscopic cellular unit.',
    },
    mutationRate: {
      label: 'Spontaneous Mutation',
      value: 0.01,
      min: 0,
      max: 0.08,
      step: 0.005,
      unit: '%',
      description: 'Chance of random spontaneous birth in vacant soil.',
    },
  },
  experiments: [
    {
      id: 'cell-exp-01',
      number: 1,
      title: 'Glider Propagation & Oscillator Cycles',
      objective: 'Seed a 5-cell glider pattern and observe diagonal translation across the toroidal grid.',
      hypothesis: 'Glider shifts 1 cell diagonally every 4 generations while preserving 5-cell mass.',
      testPlan: 'Place glider pattern at top-left quadrant and advance 16 ticks.',
      expectedResult: 'Glider travels cleanly across canvas without decaying.',
      actualResult: 'Glider translated 4 units diagonally over 16 ticks with exact pattern preservation.',
      verified: true,
      nextExperimentHint: 'Construct Gosper Glider Gun to generate perpetual stream of traveling entities.',
      logs: [
        '[Grid] Initialized 60x40 matrix with toroidal boundary wrap.',
        '[Seed] Injected classic Conway glider: (1,0), (2,1), (0,2), (1,2), (2,2).',
        '[Result] Verified: Periodic diagonal propagation confirmed.',
      ],
      parameters: {
        tickRate: 15,
      },
    },
  ],
  codeSnippet: `// Conway's Rules: Birth on 3, Survival on 2 or 3
function stepGrid(grid: number[][], rows: number, cols: number) {
  const next = grid.map(arr => [...arr]);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countLivingNeighbors(grid, r, c, rows, cols);
      if (grid[r][c] === 1) {
        next[r][c] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        next[r][c] = (neighbors === 3) ? 1 : 0;
      }
    }
  }
  return next;
}`,
  markdownDoc: `# Emergent Cellular Automata
**Intention:** I want to build Conway’s Game of Life.
**Objective:** Explore self-organizing mathematical complexity.`,
};

export const PRESET_PROJECTS = [
  MARS_ROVER_PROJECT,
  GRAVITY_PROJECT,
  CELLULAR_PROJECT,
];
