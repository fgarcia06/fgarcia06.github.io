export interface Project {
  id: string
  title: string
  label: string
  dates: string
  /** Accent hex used by the project's interactive visual and chips. */
  accent: string
  /** Drives which generated visual the card renders. */
  visual: 'fitness' | 'tracking'
  /** Punchy one-liner shown on the card. */
  tagline: string
  summary: string
  metrics: { value: string; label: string }[]
  points: string[]
  tags: string[]
}

export const projects: Project[] = [
  {
    id: 'ai-fitness',
    title: 'AI Fitness Coaching App',
    label: 'React Native · Next.js · Supabase · OpenAI',
    dates: 'Jan 2026 – Apr 2026',
    accent: '#c79a6a',
    visual: 'fitness',
    tagline: 'An AI coach that rewrites your workout as you get stronger.',
    summary:
      'A cross-platform AI fitness coach that generates adaptive workout plans from your logged performance — secured behind a backend proxy and a closed-loop data pipeline.',
    metrics: [
      { value: 'iOS + Android', label: 'cross-platform' },
      { value: '0', label: 'client-side API keys exposed' },
    ],
    points: [
      'Reduced onboarding friction with a responsive cross-platform UI (iOS/Android) in React Native (Expo) and TypeScript, backed by Supabase JWT authentication.',
      'Eliminated client-side API key exposure by architecting a secure Next.js backend proxy for all OpenAI calls, enabling dynamic workout-plan generation that adapts to logged performance.',
      'Improved personalization over time with a closed-loop pipeline that persists session metrics to PostgreSQL and queries prior performance each cycle to drive progressive-overload recommendations.',
    ],
    tags: ['React Native', 'Expo', 'TypeScript', 'Next.js', 'Supabase', 'PostgreSQL', 'OpenAI API', 'JWT'],
  },
  {
    id: 'object-tracking',
    title: 'Real-Time Multi-Object Tracking System',
    label: 'Python · TensorFlow · OpenCV · NumPy',
    dates: 'May 2023 – Aug 2023',
    accent: '#9caa7b',
    visual: 'tracking',
    tagline: "Tracks 10+ objects at 60fps without losing who's who.",
    summary:
      'A real-time computer-vision pipeline that fuses YOLOv5 detections with Kalman motion estimates to hold stable identities across many simultaneous objects at 60 fps.',
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
    tags: ['Python', 'TensorFlow', 'OpenCV', 'NumPy', 'YOLOv5', 'ONNX', 'Kalman Filter'],
  },
]
