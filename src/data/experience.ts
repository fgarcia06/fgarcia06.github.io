export const education = {
  school: 'University of Alberta',
  location: 'Edmonton, AB',
  degree: 'Bachelor of Science in Computer Engineering',
  dates: 'Sept 2021 – April 2026',
} as const

export interface Job {
  role: string
  org: string
  location: string
  dates: string
  /** Punchy headline shown on the surface. */
  headline: string
  /** One-line blurb — the impact in a sentence. */
  blurb: string
  metrics: { value: string; label: string }[]
  points: string[]
}

export const experience: Job[] = [
  {
    role: 'Junior Robotics Engineer',
    org: 'TRICCA Technologies',
    location: 'Edmonton, AB',
    dates: '2024 – 2025',
    headline: 'Shipped a lab robot to production.',
    blurb:
      'Owned an automated pipetting system end to end — firmware over I²C/SPI, real-time control, test pipelines, and the browser UI techs actually use.',
    metrics: [
      { value: '60%', label: 'faster QA' },
      { value: '3', label: 'techs enabled' },
      { value: '100%', label: 'manual steps removed' },
    ],
    points: [
      'Delivered a production-ready automated pipetting system for a University of Alberta chemistry lab, eliminating all manual liquid-handling steps and achieving full regulatory sign-off.',
      'Engineered Python and C++ control modules over I²C, SPI, GPIO, and serial protocols, integrated with a Klipper/Moonraker/Mainsail firmware stack for real-time robotic actuator control.',
      'Reduced QA cycle time by 60% by building automated Python test pipelines that run full lab protocols and validate positional accuracy and pipetting correctness against acceptance criteria.',
      'Enabled browser-based remote operation for 3 lab technicians by shipping a full-stack web app (PyShiny, REST API, HTML/CSS) with a responsive, mobile-first UI on a customized KlipperScreen interface.',
      'Accelerated hardware iteration by designing custom mechanical components in Fusion 360 and fabricating them in-house on a 3D printer, removing third-party part dependencies.',
    ],
  },
  {
    role: 'Process Control Lab Assistant',
    org: 'University of Alberta — Research Lab',
    location: 'Edmonton, AB',
    dates: '2023',
    headline: 'Taught models to predict physics.',
    blurb:
      'Reconstructed governing equations from raw sensor data and tightened closed-loop control with Kalman, PID, and MPC.',
    metrics: [
      { value: '<5%', label: 'model error' },
      { value: '4', label: 'control methods' },
    ],
    points: [
      'Achieved <5% model error by implementing a SINDy pipeline in Python to reconstruct governing ODEs from experimental time-series sensor data.',
      'Improved closed-loop control fidelity with Kalman filtering, PID tuning, and MPC in Python, reducing simulated-to-physical discrepancy and validating parameters across benchmark datasets.',
      'Prototyped reinforcement learning and transformer-based models in TensorFlow to evaluate data-driven approaches to dynamic system identification and control.',
      'Maintained stakeholder alignment with structured weekly reports and standup slides covering results, model metrics, and recommended next steps.',
    ],
  },
]
