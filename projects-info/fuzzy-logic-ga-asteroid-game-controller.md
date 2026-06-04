# Fuzzy Logic & Genetic Algorithm Controller for Kessler Asteroid Game

**Course:** ECE 449 — Intelligent Systems Engineering, Winter 2026  
**Team:** ECE449 Group XFC — Francis Garcia  
**Language:** Python 3.x  
**Source:** `examples/francis_controller_fuzzy.py`, `examples/francis_controller_ga.py`  
**Engine:** `src/kesslergame/` (Kessler Game Framework — Thales)

---

## What This Project Is About

ECE 449's group project uses the **Kessler Game** — a Python-based Asteroids-style simulation framework — as a testbed for intelligent control systems. The ship is an autonomous agent flying in a 2D toroidal map (objects wrap around edges). Asteroids fly across the map at various speeds and sizes; the ship must survive and destroy as many as possible using bullets and mines.

The student task is to implement a `KesslerController` subclass that drives the ship each game tick by returning four control outputs: `(thrust, turn_rate, fire, drop_mine)`. The controller receives a snapshot of the full game state — all asteroid positions/velocities, all ship states, all bullet states, current time — and must decide in real time.

**Two controllers were implemented:**

1. **`francis_controller_fuzzy.py`** — A hand-crafted Mamdani fuzzy inference system that targets the nearest asteroid, computes a leading intercept angle using quadratic trajectory prediction, and uses fuzzy rules to decide turn rate, fire decision, and thrust.

2. **`francis_controller_ga.py`** — The same fuzzy architecture with all membership function shape parameters exposed as a tuneable vector, then optimized offline using a **Genetic Algorithm (GA)**. The GA runs multiple game simulations as a fitness function and evolves better parameter sets, saving the best result to `optimized_params.npy` for reuse.

---

## Hardware / Runtime Components

| Component | Role |
|-----------|------|
| Python 3.x | Runtime |
| `scikit-fuzzy` (`skfuzzy`) | Fuzzy sets, membership functions, Mamdani inference engine |
| `pyeasyga` | Genetic algorithm framework (selection, crossover, mutation, elitism) |
| `numpy` | Numeric arrays, `.npy` parameter persistence |
| Kessler Game Engine (`kesslergame`) | Physics simulation, collision detection, scoring, graphics |
| `TrainerEnvironment` | No-graphics, max-speed game variant used during GA fitness evaluation |
| Unreal Engine 5 (`kessler_graphics/`) | Optional high-fidelity 3D visualization backend |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        KesslerGame.run()                         │
│                   30 Hz simulation loop                          │
│                                                                  │
│  Each tick:                                                      │
│  1. Build immutable game_state snapshot                          │
│     (asteroids, ships, bullets, mines, map_size, time)          │
│  2. Call controller.actions(ship_state, game_state)              │
│  3. Apply returned (thrust, turn_rate, fire, drop_mine)         │
│  4. Update physics (position, velocity, heading, drag)           │
│  5. Detect collisions (bullet-asteroid, mine-ast, ship-ast)      │
│  6. Spawn child asteroids on destruction                         │
│  7. Update score and graphics                                    │
│  8. Check stop conditions                                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │ game_state + ship_state (read-only)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              FrancisController.actions()                         │
│                                                                  │
│  Step 1 — Target Selection                                       │
│    find closest asteroid by Euclidean distance                   │
│                                                                  │
│  Step 2 — Ballistic Intercept Calculation                        │
│    Solve quadratic for bullet travel time t:                     │
│    |asteroid_pos + asteroid_vel*t - ship_pos| = bullet_speed*t   │
│    → bullet_t (time to hit)                                      │
│    → intercept point (x,y)                                       │
│    → desired_angle = atan2(intercept_y, intercept_x)             │
│    → angle_diff (θ_delta): heading error, normalized to [-π, π]  │
│                                                                  │
│  Step 3 — Fuzzy Inference                                        │
│    Inputs:  bullet_time ∈ [0, 1.0]   (S / M / L)               │
│             theta_delta ∈ [-π, π]    (NL/NS/Z/PS/PL)            │
│                                                                  │
│    Outputs: ship_turn   ∈ [-180, 180] deg/s                     │
│             ship_fire   ∈ [0, 1]      → threshold 0.5           │
│             thrust      ∈ [-200, 0]   m/s²                      │
│                                                                  │
│    Rules (example):                                              │
│      IF bullet_time=S AND theta_delta=Z  → turn=Z, fire=Y, thrust=ReverseHigh  │
│      IF bullet_time=L AND theta_delta=Z  → fire=Y, thrust=Zero  │
│      IF theta_delta=NL                   → turn=NL              │
│      IF theta_delta=Z                    → fire=Y               │
│      IF NOT theta_delta=Z                → fire=N               │
│                                                                  │
│  Step 4 — Defuzzification (centroid)                             │
│    → thrust (float), turn_rate (float), fire (bool)             │
└──────────────────────────────────────────────────────────────────┘

GA Optimization Loop (offline, run once):
┌──────────────────────────────────────────────────────────────────┐
│  pyeasyga.GeneticAlgorithm                                       │
│    population_size = 10                                          │
│    generations     = 5                                           │
│    crossover_prob  = 0.8  (uniform gene-swap)                    │
│    mutation_prob   = 0.2  (±10% perturbation per gene)           │
│    elitism         = True                                        │
│                                                                  │
│  Chromosome = flat list of all MF shape parameters (~50 floats)  │
│    [bt_S_params, bt_M_params, bt_L_params,                       │
│     td_NL..PL_params, st_NL..PL_params,                          │
│     sf_N/Y_params, thrust_params...]                             │
│                                                                  │
│  Fitness function:                                               │
│    → Instantiate FrancisController(skip_optimization=True)       │
│    → Apply chromosome as MF parameters                           │
│    → Run 60s scenario (7 asteroids, no-graphics, max speed)      │
│    → Return score.teams[0].asteroids_hit                         │
│                                                                  │
│  Output: best_individual saved to optimized_params.npy           │
│  Subsequent runs load .npy and skip GA entirely                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Project Components (Source Files)

```
ECE449_XFC-main/
├── examples/
│   ├── francis_controller_fuzzy.py     — Hand-tuned fuzzy controller (full thrust range)
│   ├── francis_controller_ga.py        — GA-optimized fuzzy controller (reverse thrust only)
│   ├── optimized_params.npy            — Saved best GA parameter vector
│   ├── original_timings.csv            — Baseline timing benchmark data
│   ├── scenario_test.py                — Single-ship scenario with Tkinter graphics
│   ├── scenario_test_multi.py          — Multi-ship scenario test
│   ├── scenario_timing_test_nographics.py — 5000-run headless timing benchmark
│   ├── human_scenario_test.py          — Gamepad-driven human controller test
│   ├── graphics_both.py                — Dual graphics backend helper
│   └── test_controller.py / test_controller2.py — Baseline reference controllers
│
├── src/kesslergame/
│   ├── kessler_game.py     — Main simulation loop, KesslerGame + TrainerEnvironment
│   ├── controller.py       — KesslerController abstract base class
│   ├── ship.py             — Ship physics, fire/mine mechanics, respawn
│   ├── asteroid.py         — Asteroid physics, momentum-based child spawning
│   ├── bullet.py           — Bullet kinematics
│   ├── mines.py            — Mine blast radius and force calculations
│   ├── collisions.py       — circle_line_collision (Heron's formula)
│   ├── scenario.py         — Scenario definition (map, asteroids, ships, time limit)
│   ├── score.py            — Per-team statistics aggregation
│   ├── team.py             — Team record (accuracy, eval times)
│   └── graphics/
│       ├── graphics_tk.py  — Tkinter real-time display
│       ├── graphics_plt.py — Matplotlib display
│       ├── graphics_ue.py  — Unreal Engine 5 bridge
│       └── graphics_base.py / graphics_handler.py
│
└── kessler_graphics/       — Unreal Engine 5 project (optional 3D visualization)
    ├── Content/KesslerGame/Blueprints/  — Ship, game mode, score UI actors
    └── Source/                          — UE C++ module stubs
```

---

## Fuzzy System Design Details

### Inputs

| Variable | Universe | Membership Functions | Semantics |
|----------|----------|---------------------|-----------|
| `bullet_time` | [0, 1.0] s | S (short), M (medium), L (long: s-curve) | Time for bullet to reach intercept point |
| `theta_delta` | [−π, π] rad | NL, NS, Z (narrow), PS, PL | Heading error to intercept point |

### Outputs

| Variable | Universe | MFs | Semantics |
|----------|----------|-----|-----------|
| `ship_turn` | [−180, 180] deg/s | NL, NS, Z, PS, PL | Angular velocity command |
| `ship_fire` | [0, 1] | N (sigmoid), Y (sigmoid) | Fire decision |
| `thrust` | [−200, 0] m/s² | ReverseHigh/Medium/Low, Zero | Evasive reverse thrust |

### Key Rules

- `bullet_time=S AND theta_delta=Z` → fire, reverse hard (asteroid is close and aligned — shoot and back away)
- `bullet_time=L AND theta_delta=Z` → fire, zero thrust (asteroid is far and aligned — shoot, hold position)
- `bullet_time=L AND NOT theta_delta=Z` → no fire (far but not aimed — don't waste ammo)
- `theta_delta=NL/NS/Z/PS/PL` → corresponding left/right turn command (pure PD heading control)

### Intercept Geometry

The firing lead angle is calculated by solving the quadratic that finds the time `t` at which a bullet travelling at 800 px/s meets the asteroid travelling at its current velocity:

```
a·t² + b·t + c = 0
where:
  a = |v_ast|² - bullet_speed²
  b = 2·(Δpos · v_ast)
  c = |Δpos|²
```

Taking the smallest positive root gives the minimum-time intercept. This avoids shooting where the asteroid currently is and instead leads the target — a critical accuracy improvement over naïve angle-to-current-position.

---

## GA Chromosome Encoding

All membership function shape parameters are flattened into a single real-valued vector (~50 floats):

```
[bt_S(3), bt_M(3), bt_L(2),
 td_NL(2), td_NS(3), td_Z(3), td_PS(3), td_PL(2),
 st_NL(3), st_NS(3), st_Z(3), st_PS(3), st_PL(3),
 sf_N(2), sf_Y(2),
 thrust_RH(3), thrust_RM(3), thrust_RL(3), thrust_Z(3)]
```

Each gene is initialized with ±50% random perturbation from the hand-tuned baseline. Mutation perturbs each gene by ±10% of its current value. Crossover is uniform (per-gene coin flip between two parents). Elitism carries the best individual forward every generation unchanged.

---

## Learning Takeaways

- **Fuzzy logic is interpretable where neural nets are not.** Each rule has a direct human-readable meaning ("if the asteroid is close and I'm aimed at it, fire and reverse"). This makes tuning and debugging tractable — you can read the rules and understand why the ship behaves as it does.
- **Leading the target is non-negotiable for shooting accuracy.** A controller that aims at the current position misses every moving asteroid. The quadratic intercept calculation lifts accuracy dramatically and is the single most impactful change to the shooting logic.
- **Fuzzy membership function shape matters as much as rule structure.** A fuzzy system with good rules but poorly placed membership functions (e.g. a `Z` range that is too wide fires too early; too narrow fires too rarely) performs poorly. This is what the GA is tuning.
- **Wrapping the simulation as a fitness function unlocks automated parameter search.** Once the game engine can run headless at maximum speed (`TrainerEnvironment`), it becomes a black-box optimizer target. Any optimization method — GA, particle swarm, Bayesian optimization — can be dropped in.
- **GA convergence with small population and few generations is shallow.** 10 individuals over 5 generations explores a small fraction of the search space. It can find local improvements but not global optima. Larger runs, better fitness function design (multi-scenario averaging), or a different optimizer would yield more robust results.
- **Caching optimized parameters to disk is essential.** GA runs are expensive (each fitness evaluation is a full game simulation). Saving to `.npy` and reloading on subsequent runs means you pay the optimization cost only once.
- **The `TrainerEnvironment` vs `KesslerGame` distinction is a key design pattern.** Development uses the graphical environment for observation and debugging; training uses the headless maximum-speed environment. Same code, different settings object.
- **Membership function overlap determines the smoothness of the output.** Overlapping functions produce smooth, gradual transitions in thrust/turn behavior. Non-overlapping functions produce sharp jumps — jarring and often suboptimal.

---

## Skills Learned

- **Fuzzy inference systems:** Mamdani architecture, antecedent/consequent design, triangular/sigmoid/s-curve/z-curve membership functions, centroid defuzzification
- **`scikit-fuzzy`:** `ctrl.Antecedent`, `ctrl.Consequent`, `ctrl.Rule`, `ctrl.ControlSystem`, `ctrl.ControlSystemSimulation`
- **Ballistic intercept math:** quadratic formula for time-of-flight, 2D leading shot geometry, angle normalization to [−π, π]
- **Genetic algorithms:** chromosome encoding for real-valued parameters, fitness function design, selection/crossover/mutation/elitism, `pyeasyga` API
- **Simulation-as-optimizer:** wrapping a game simulation as a fitness function, running headless for speed
- **Kessler Game framework:** `KesslerController` interface, `Scenario` definition, `KesslerGame` / `TrainerEnvironment`, `Score` / `Team` statistics, `GraphicsType` selection
- **Parameter persistence:** `numpy.save` / `numpy.load` for caching evolved solutions
- **Profiling simulation performance:** `time.perf_counter`, per-frame timing breakdown (`controller_times`, `physics_update`, `collisions_check`), multi-run statistics via `scenario_timing_test_nographics.py`

## Skills Needed to Go Deeper

- Larger GA population and more generations, or switching to CMA-ES / Bayesian optimization for higher-dimensional parameter spaces
- Multi-scenario fitness evaluation (averaging score across diverse asteroid configurations for robustness)
- Adding evasion as a separate fuzzy system layer: one system for targeting, one for obstacle avoidance, combined via output arbitration
- Type-2 fuzzy logic for handling uncertainty in asteroid trajectory prediction
- Reinforcement learning (PPO, DQN) as an alternative to fuzzy+GA — directly learns from simulation reward signal without manual rule design
- Multi-agent scenarios: cooperative team strategies where multiple ships divide asteroid targeting
- Unreal Engine 5 integration: connecting the Python game state to the UE5 visualization backend via the `graphics_ue.py` bridge
