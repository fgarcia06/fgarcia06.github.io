/** Keys that select which generated visual a project card renders. */
export type VisualKind =
  | 'fitness'
  | 'tracking'
  | 'poker'
  | 'crypto'
  | 'lottery'
  | 'asteroid'
  | 'voice'
  | 'database'
  | 'motor'
  | 'roulette'

/** Top-level grouping used by the project filter. */
export type Category = 'AI / ML' | 'Embedded' | 'Full-Stack' | 'Security' | 'Data'

/** Order the filter chips appear in. */
export const categoryOrder: Category[] = ['AI / ML', 'Embedded', 'Full-Stack', 'Security', 'Data']

/** One stage in a project's architecture / data-flow pipeline. */
export interface FlowStage {
  label: string
  detail: string
}

export interface Project {
  id: string
  title: string
  /** Tech-stack / language line shown under the title in the case overlay. */
  label: string
  /** Course + term, or date range — the small kicker above the title. */
  context: string
  /** Accent hex used by the project's interactive visual and chips. */
  accent: string
  /** Drives which generated visual the card renders. */
  visual: VisualKind
  /** Filter bucket. */
  category: Category
  /** Punchy one-liner shown on the card. */
  tagline: string
  /** Phrases inside the tagline to emphasize in the accent color. */
  highlights: string[]
  summary: string
  /** Single strongest engineering insight — shown as a callout. */
  takeaway: string
  metrics: { value: string; label: string }[]
  points: string[]
  /** Architecture pipeline, rendered as an interactive flow in the overlay. */
  flow: FlowStage[]
  tags: string[]
}

export const projects: Project[] = [
  {
    id: 'ai-fitness',
    title: 'AI Fitness Coaching App',
    label: 'React Native · Next.js · Supabase · OpenAI',
    context: 'Jan 2026 – Apr 2026',
    accent: '#6c8cff',
    visual: 'fitness',
    category: 'Full-Stack',
    tagline: 'An AI coach that rewrites your workout as you get stronger.',
    highlights: ['AI coach', 'rewrites your workout'],
    summary:
      'A cross-platform AI fitness coach that generates adaptive workout plans from your logged performance — secured behind a backend proxy and a closed-loop data pipeline.',
    takeaway:
      'Keeping the model key server-side turns “just call an API” into a real authentication and data-pipeline design problem.',
    metrics: [
      { value: 'iOS + Android', label: 'cross-platform' },
      { value: '0', label: 'client-side API keys exposed' },
    ],
    points: [
      'Reduced onboarding friction with a responsive cross-platform UI (iOS/Android) in React Native (Expo) and TypeScript, backed by Supabase JWT authentication.',
      'Eliminated client-side API key exposure by architecting a secure Next.js backend proxy for all OpenAI calls, enabling dynamic workout-plan generation that adapts to logged performance.',
      'Improved personalization over time with a closed-loop pipeline that persists session metrics to PostgreSQL and queries prior performance each cycle to drive progressive-overload recommendations.',
    ],
    flow: [
      { label: 'Expo app', detail: 'A React Native client logs every set and renders plans on iOS and Android.' },
      { label: 'Next.js proxy', detail: 'A backend route holds the OpenAI key — no secret ever ships to the device.' },
      { label: 'OpenAI', detail: 'Generates the next adaptive plan from the athlete’s logged history.' },
      { label: 'PostgreSQL', detail: 'Supabase persists every session metric behind JWT auth.' },
      { label: 'Progressive overload', detail: 'Each cycle queries prior performance to push the right weight next time.' },
    ],
    tags: ['React Native', 'Expo', 'TypeScript', 'Next.js', 'Supabase', 'PostgreSQL', 'OpenAI API', 'JWT'],
  },
  {
    id: 'object-tracking',
    title: 'Real-Time Multi-Object Tracking System',
    label: 'Python · TensorFlow · OpenCV · NumPy',
    context: 'May 2023 – Aug 2023',
    accent: '#45c4b0',
    visual: 'tracking',
    category: 'AI / ML',
    tagline: "Tracks 10+ objects at 60fps without losing who's who.",
    highlights: ['10+ objects', '60fps'],
    summary:
      'A real-time computer-vision pipeline that fuses YOLOv5 detections with Kalman motion estimates to hold stable identities across many simultaneous objects at 60 fps.',
    takeaway:
      'Detection alone flickers — fusing each frame with a motion prediction is what actually holds an object’s identity.',
    metrics: [
      { value: '10+', label: 'simultaneous tracked objects' },
      { value: '>92%', label: 'detection mAP' },
      { value: '~50%', label: 'lower pipeline latency' },
    ],
    points: [
      'Maintained stable identity across 10+ simultaneous objects with a Kalman-filter tracker in Python/NumPy that fuses bounding-box detections with motion-state estimates.',
      'Achieved >92% detection mAP on benchmark test sets by integrating a YOLOv5 inference pipeline with a TensorFlow/ONNX backend into the end-to-end tracking system.',
      'Reduced end-to-end latency by ~50% on 60 fps streams by profiling the decode → inference → track → display loop and applying batched inference and adaptive frame-skipping.',
    ],
    flow: [
      { label: 'Decode', detail: 'Pull frames off a 60 fps video stream.' },
      { label: 'YOLOv5', detail: 'Detect every object per frame at >92% mAP on a TensorFlow/ONNX backend.' },
      { label: 'Kalman filter', detail: 'Predict each track’s next position from its motion state.' },
      { label: 'Associate', detail: 'Match detections to tracks so IDs stay stable across 10+ objects.' },
      { label: 'Render', detail: 'Draw boxes + IDs; batched inference and frame-skipping cut latency ~50%.' },
    ],
    tags: ['Python', 'TensorFlow', 'OpenCV', 'NumPy', 'YOLOv5', 'ONNX', 'Kalman Filter'],
  },
  {
    id: 'rust-poker',
    title: 'Rust Multiplayer Poker',
    label: 'Rust · tokio · egui · MongoDB · TCP',
    context: 'ECE 421 · Project 3',
    accent: '#e58f73',
    visual: 'poker',
    category: 'Full-Stack',
    tagline: 'A networked poker room — three variants, dealt in pure Rust.',
    highlights: ['networked poker room', 'pure Rust', 'three variants'],
    summary:
      "A fully networked multiplayer poker application written end-to-end in Rust: a headless tokio TCP server deals Five Card Draw, Seven Card Stud, and Texas Hold'em to egui desktop clients, with authentication, live spectating, and persistent stats in MongoDB.",
    takeaway:
      'Mixing std::thread for long-lived I/O with tokio for the game loops taught me where each concurrency model actually earns its place.',
    metrics: [
      { value: '3', label: 'poker variants' },
      { value: '2-crate', label: 'server + GUI client' },
      { value: 'JSON/TCP', label: 'wire protocol' },
    ],
    points: [
      'Built a headless TCP server in Rust that authenticates players, spawns an async tokio game task per table, and broadcasts JSON game state to every connected client.',
      'Implemented a complete poker hand evaluator in deck.rs — ranking every hand from High Card to Royal Flush, including ace-low wheel straights — shared across all three variants.',
      'Wrote an egui immediate-mode desktop client driven by an AppState state machine (Auth → Ready → InGame / Stats / Spectator), bridging a background networking thread to the UI through mpsc channels.',
      'Coordinated turn-taking over the network by using MongoDB documents as a polling bus, and persisted players, live games, lobbies, and completed history across four collections.',
    ],
    flow: [
      { label: 'egui client', detail: 'An immediate-mode desktop UI driven by an AppState machine.' },
      { label: 'TCP / JSON', detail: 'Every message is JSON framed over a TCP socket.' },
      { label: 'tokio server', detail: 'Authenticates players and spawns an async game task per table.' },
      { label: 'Hand evaluator', detail: 'Ranks High Card → Royal Flush, shared by all three variants.' },
      { label: 'MongoDB', detail: 'Players, live games, lobbies and history across four collections.' },
    ],
    tags: ['Rust', 'tokio', 'egui', 'MongoDB', 'serde_json', 'TCP Sockets', 'Arc<Mutex>', 'State Machines'],
  },
  {
    id: 'secure-fs',
    title: 'Encrypted Secure File System',
    label: 'Python · AES-256-GCM · PBKDF2 · HMAC',
    context: 'ECE 422 · Winter 2026',
    accent: '#4fc3e8',
    visual: 'crypto',
    category: 'Security',
    tagline: 'A Unix shell where even the filenames are ciphertext.',
    highlights: ['Unix shell', 'filenames are ciphertext'],
    summary:
      'A simulated secure file system that presents a familiar Unix-style shell (ls, cd, cat, chmod) while encrypting every file body, every byte of metadata, and even the filenames at rest with AES-256-GCM — so an attacker with raw disk access sees only HMAC names and authenticated ciphertext.',
    takeaway:
      'Binding each ciphertext to its path with GCM associated data makes a file-swap attack fail authentication for free — no extra HMAC needed.',
    metrics: [
      { value: 'AES-256', label: 'GCM at rest' },
      { value: '390k', label: 'PBKDF2 iterations' },
      { value: '0', label: 'plaintext bytes on disk' },
    ],
    points: [
      'Encrypted all file contents, metadata stores, and the client–server channel with AES-256-GCM, deriving four purpose-isolated subkeys (content, metadata, channel, names) from one master key via HMAC-SHA256.',
      'Protected filenames at rest by mapping each logical path to base64url(HMAC-SHA256(path)) — deterministic for lookups, unreadable without the master key.',
      'Bound each file to its location with a per-file integrity_reference passed as GCM associated data, so tampering with or swapping a ciphertext fails authentication on the next read.',
      'Enforced a three-level discretionary access-control model (user / group / all) server-side, and ran an IntegrityMonitor at every login to detect external modification of owned files.',
    ],
    flow: [
      { label: 'CLI shell', detail: 'Familiar ls / cd / cat / chmod behind a login prompt.' },
      { label: 'SecureChannel', detail: 'Requests are sealed with AES-256-GCM before they reach the server.' },
      { label: 'CryptoManager', detail: 'One master key derives content, metadata, channel and name subkeys.' },
      { label: 'HMAC names', detail: 'Logical paths map to base64url(HMAC) — unreadable on disk.' },
      { label: 'IntegrityMonitor', detail: 'Every login re-scans owned files for tampering or swaps.' },
    ],
    tags: ['Python', 'AES-256-GCM', 'PBKDF2-HMAC', 'HMAC-SHA256', 'Cryptography', 'Access Control', 'Threat Modeling', 'pytest'],
  },
  {
    id: 'event-lottery',
    title: 'Android Event Lottery App',
    label: 'Java · Android SDK · Firebase · ML Kit',
    context: 'CMPUT 301 · Fall 2024',
    accent: '#a78bfa',
    visual: 'lottery',
    category: 'Full-Stack',
    tagline: 'Fair event sign-ups — scan a QR, win the draw, not the race.',
    highlights: ['Fair event sign-ups', 'scan a QR', 'win the draw'],
    summary:
      'A full Android app that replaces first-come-first-served event registration with a fair lottery: entrants scan a QR code to join a waitlist, and organizers run a random draw to select attendees. Built by a team of five over five Agile sprints on a Firebase backend.',
    takeaway:
      'A QR code used as a deep link turns an anonymous scan into a one-tap signup — no search, no account hunt in between.',
    metrics: [
      { value: '3', label: 'user roles' },
      { value: '5', label: 'agile sprints' },
      { value: 'QR → draw', label: 'fair selection' },
    ],
    points: [
      'Shipped three role-based experiences (Entrant, Organizer, Admin) in Java on an MVC + Repository architecture backed by Firebase Firestore, Storage, and Cloud Messaging.',
      'Implemented the core lottery as a random shuffle over the waitlist — marking winners selected and pushing FCM notifications to chosen and non-chosen entrants alike.',
      'Built live QR scanning with CameraX + ML Kit and QR generation with ZXing, encoding eventapp://event/{id} deep links so one scan routes an entrant straight to a signup page.',
      'Added opt-in geolocation that pins each entrant on an osmdroid map, and delivered across five sprints with CRC cards, UML, and a GitHub Actions CI build.',
    ],
    flow: [
      { label: 'Scan QR', detail: 'CameraX + ML Kit decode an eventapp://event/{id} deep link.' },
      { label: 'Join waitlist', detail: 'The entrant is written to Firestore with status “waiting”.' },
      { label: 'Draw', detail: 'The organizer triggers a random shuffle that marks winners “selected”.' },
      { label: 'Notify', detail: 'Cloud Messaging pushes results to chosen and non-chosen entrants alike.' },
      { label: 'Confirm', detail: 'Declines trigger an automatic re-draw from the remaining pool.' },
    ],
    tags: ['Java', 'Android SDK', 'Firebase', 'Firestore', 'Cloud Messaging', 'CameraX', 'ML Kit', 'ZXing', 'Agile'],
  },
  {
    id: 'fuzzy-asteroid',
    title: 'Fuzzy Logic & GA Asteroid Controller',
    label: 'Python · scikit-fuzzy · pyeasyga · NumPy',
    context: 'ECE 449 · Winter 2026',
    accent: '#e5b567',
    visual: 'asteroid',
    category: 'AI / ML',
    tagline: 'An autonomous ship that leads its shots — then evolves its own aim.',
    highlights: ['autonomous ship', 'leads its shots', 'evolves its own aim'],
    summary:
      'Two intelligent controllers for the Kessler Asteroids simulation: a hand-built Mamdani fuzzy system that computes a ballistic lead angle to intercept moving asteroids, and a genetic-algorithm variant that evolves every membership-function parameter by running the game itself as a fitness function.',
    takeaway:
      'Fuzzy rules stay human-readable where a neural net wouldn’t — you can literally read why the ship chose to fire.',
    metrics: [
      { value: '30 Hz', label: 'real-time control loop' },
      { value: '~50', label: 'evolved MF parameters' },
      { value: '2', label: 'controllers: fuzzy + GA' },
    ],
    points: [
      'Designed a Mamdani fuzzy inference system (scikit-fuzzy) that maps bullet-time and heading-error inputs to turn, fire, and reverse-thrust commands through human-readable rules.',
      'Solved a quadratic time-of-flight equation each tick to lead the nearest asteroid — firing at the predicted intercept point instead of where the target currently is.',
      'Encoded all ~50 membership-function shape parameters into a chromosome and optimized them with a genetic algorithm (selection, uniform crossover, mutation, elitism) via pyeasyga.',
      'Wrapped the headless TrainerEnvironment as the fitness function — each evaluation runs a full 60-second game at max speed — and cached the best evolved vector to optimized_params.npy.',
    ],
    flow: [
      { label: 'Game state', detail: 'A 30 Hz snapshot of every asteroid, bullet and ship.' },
      { label: 'Target', detail: 'Pick the nearest asteroid by Euclidean distance.' },
      { label: 'Lead intercept', detail: 'Solve a quadratic for where to shoot, not where it is.' },
      { label: 'Fuzzy inference', detail: 'Mamdani rules map bullet-time + heading error to turn / fire / thrust.' },
      { label: 'GA tuning', detail: 'A genetic algorithm evolves ~50 membership-function params offline.' },
    ],
    tags: ['Python', 'scikit-fuzzy', 'Genetic Algorithms', 'pyeasyga', 'NumPy', 'Mamdani Inference', 'Control Systems'],
  },
  {
    id: 'voice-fan',
    title: 'Voice-Controlled Fan',
    label: 'C / C++ · TensorFlow Lite Micro · RP2040',
    context: 'ECE 407 · Project 3',
    accent: '#818cf8',
    visual: 'voice',
    category: 'Embedded',
    tagline: 'Say "yes" and the fan spins — wake-word inference on a $4 microcontroller.',
    highlights: ['Say "yes"', 'wake-word inference', '$4 microcontroller'],
    summary:
      'An embedded system that runs a TensorFlow Lite Micro wake-word model directly on an RP2040 to voice-control a DC fan. An INMP441 microphone streams audio through PIO + DMA into the inference pipeline; saying "yes" turns the fan on, "no" turns it off.',
    takeaway:
      'A model’s output is a noisy sensor, not a switch — the cooldown and threshold are what make voice control actually usable.',
    metrics: [
      { value: '16 kHz', label: 'on-device inference' },
      { value: '2', label: 'wake words (yes / no)' },
      { value: '1800 ms', label: 'command cooldown' },
    ],
    points: [
      'Captured 16 kHz I2S audio from an INMP441 MEMS microphone with a custom PIO program and a DMA ring buffer, decoupling hardware-rate capture from the inference loop with zero dropped samples.',
      'Fed the live audio into a pre-trained micro_speech TFLite Micro model, integrating the GetAudioSamples / RespondToCommand callbacks rather than the model internals.',
      'Tamed noisy ML output with three filtering layers — a confidence threshold, a new-command gate, and an 1800 ms cooldown — so a single spoken word triggers exactly one action.',
      'Bridged the C++ TFLite runtime to plain-C motor, LED-ring, and control modules through extern "C", reusing the Project 2 potentiometer/PWM drivers for fine speed control.',
    ],
    flow: [
      { label: 'INMP441 mic', detail: 'An I²S MEMS microphone captures 16 kHz audio.' },
      { label: 'PIO + DMA', detail: 'A PIO program clocks I²S; DMA streams frames with zero CPU stalls.' },
      { label: 'TFLite Micro', detail: 'A wake-word model scores every 30 ms window on-device.' },
      { label: 'Filter', detail: 'Threshold + new-command gate + 1800 ms cooldown reject noise.' },
      { label: 'Actuate', detail: 'An accepted “yes / no” drives the H-bridge motor and LED ring.' },
    ],
    tags: ['C', 'C++', 'TensorFlow Lite Micro', 'RP2040', 'PIO', 'DMA', 'I2S', 'Keyword Spotting', 'Embedded ML'],
  },
  {
    id: 'mongo-twitter-cli',
    title: 'MongoDB Twitter Dataset CLI',
    label: 'Python · pymongo · MongoDB',
    context: 'CMPUT 291 · Fall 2023',
    accent: '#6fcf97',
    visual: 'database',
    category: 'Data',
    tagline: 'A million tweets, five queries, one document database.',
    highlights: ['A million tweets', 'five queries', 'document database'],
    summary:
      'A command-line application that bulk-loads a large JSONL Twitter/X dataset into MongoDB and exposes five query workloads — searching tweets and users, composing tweets, and ranking by engagement and followers — each with its own indexing strategy.',
    takeaway:
      'Embedding vs referencing is the core NoSQL trade-off: no JOINs needed, but the same user is duplicated across thousands of documents.',
    metrics: [
      { value: '5', label: 'query operations' },
      { value: '4', label: 'parallel load threads' },
      { value: '1k', label: 'docs per batch insert' },
    ],
    points: [
      'Ingested the JSONL dataset with a producer/consumer pipeline — a 1000-document batcher feeding a 4-worker ThreadPoolExecutor that runs insert_many in parallel.',
      'Implemented five menu-driven operations over nested tweet documents, modelling users as embedded sub-documents and de-duplicating them in application code.',
      'Designed a per-operation indexing strategy, creating and dropping indexes around each query to work within MongoDB’s single-text-index-per-collection limit.',
      'Built whole-word, case-insensitive keyword search with $regex word-boundary anchors and re.escape, rather than naive substring matching, for correct results.',
    ],
    flow: [
      { label: 'JSONL', detail: 'A raw scraped-tweet file, one JSON document per line.' },
      { label: 'Batcher', detail: 'Accumulates the stream into 1,000-document batches.' },
      { label: 'ThreadPool', detail: 'Four workers run insert_many in parallel.' },
      { label: 'MongoDB', detail: 'Tweets stored with their author as an embedded sub-document.' },
      { label: 'Indexed queries', detail: 'Per-operation indexes are built and dropped around five workloads.' },
    ],
    tags: ['Python', 'MongoDB', 'pymongo', 'NoSQL Modeling', 'Indexing', 'Regex', 'ThreadPoolExecutor', 'JSONL'],
  },
  {
    id: 'dc-motor-controller',
    title: 'Open-Loop DC Motor Controller',
    label: 'C · RP2040 · PWM · WS2812',
    context: 'ECE 407 · Project 2',
    accent: '#e59866',
    visual: 'motor',
    category: 'Embedded',
    tagline: 'One potentiometer drives speed, direction, and a glowing tachometer.',
    highlights: ['One potentiometer', 'speed, direction', 'glowing tachometer'],
    summary:
      "An open-loop DC motor speed controller on the RP2040: a potentiometer's position maps to PWM duty into an H-bridge, with its midpoint as the forward/reverse boundary. A 12-pixel WS2812 ring displays speed and direction as a live HSV-gradient tachometer.",
    takeaway:
      'Open-loop means the controller commands a voltage and simply trusts it — there’s no feedback to correct for load or stall.',
    metrics: [
      { value: '1 kHz', label: 'PWM frequency' },
      { value: '12', label: 'WS2812 tachometer LEDs' },
      { value: '3', label: 'direction zones' },
    ],
    points: [
      'Read a 10 kΩ potentiometer on the 12-bit ADC and mapped it to a 1000-step PWM duty cycle at 1 kHz, driving a TC1508A H-bridge.',
      "Used the pot's midpoint as a direction boundary with a centered dead-zone — left reverses, right runs forward, center stops — eliminating motor jitter from ADC noise.",
      'Rendered a real-time tachometer on a 12-LED WS2812 ring, mapping speed 0→100% across an HSV hue sweep (green → yellow → red) with an integer HSV→RGB conversion.',
      'Drove the ring over a PIO state machine at 800 kHz to free the CPU from timing-critical bit-banging, and prototyped the whole system in Wokwi before the hardware build.',
    ],
    flow: [
      { label: 'Potentiometer', detail: 'The 12-bit ADC reads the knob position.' },
      { label: 'Classify', detail: 'Midpoint + dead-zone split it into reverse / stop / forward.' },
      { label: 'PWM', detail: 'Position maps to a 1000-step duty cycle at 1 kHz.' },
      { label: 'H-bridge', detail: 'A TC1508A drives the DC motor in either direction.' },
      { label: 'Tachometer', detail: 'A 12-LED ring fills green→red over a PIO at 800 kHz.' },
    ],
    tags: ['C', 'RP2040', 'Pico SDK', 'PWM', 'ADC', 'H-Bridge', 'WS2812', 'PIO', 'HSV'],
  },
  {
    id: 'russian-roulette-hmi',
    title: 'Russian Roulette HMI',
    label: 'C · RP2040 · Rotary Encoder · WS2812',
    context: 'ECE 407 · Project 1',
    accent: '#e0706b',
    visual: 'roulette',
    category: 'Embedded',
    tagline: 'A six-chamber game played entirely on one glowing knob.',
    highlights: ['six-chamber game', 'one glowing knob'],
    summary:
      'A human-machine interface on the RP2040 themed as a six-chamber Russian roulette game. A single rotary encoder is the only input and a 12-LED WS2812 ring the only display — spin to arm the PRNG, rotate to pick a chamber, press to fire.',
    takeaway:
      'Every animation tracks time_us_64() deltas instead of sleeping, so the input loop never stalls mid-spin.',
    metrics: [
      { value: '6', label: 'revolver chambers' },
      { value: '5', label: 'state-machine states' },
      { value: '12', label: 'WS2812 ring LEDs' },
    ],
    points: [
      'Built the whole experience around one rotary encoder and a 12-LED ring, driving a five-state machine (Idle → Arming → Ready → Reveal → Game Over).',
      'Decoded the quadrature encoder with a 4×4 transition table and distinguished short vs. long button presses in software with timestamp-based debouncing.',
      'Seeded an xorshift32 PRNG from elapsed time plus user "spin energy" so the loaded chamber is genuinely unpredictable each round.',
      'Wrote non-blocking, timestamp-driven animations (idle breathe, arming spinner, reveal) over a PIO-driven WS2812 ring, debugging live state over SWD with OpenOCD + GDB.',
    ],
    flow: [
      { label: 'Encoder', detail: 'A 4×4 quadrature transition table decodes every detent.' },
      { label: 'Arm', detail: 'Spin energy plus elapsed time seed an xorshift32 PRNG.' },
      { label: 'Select', detail: 'Rotation moves a cursor across the six chambers.' },
      { label: 'Fire', detail: 'A debounced button press — short vs long — commits the shot.' },
      { label: 'Reveal', detail: 'A non-blocking LED animation shows a safe chamber or the zap.' },
    ],
    tags: ['C', 'RP2040', 'Pico SDK', 'Rotary Encoder', 'Quadrature', 'WS2812', 'PIO', 'State Machine', 'GDB'],
  },
]
