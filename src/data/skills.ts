export interface SkillGroup {
  title: string
  tags: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    tags: ['Python', 'C++', 'C', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'MATLAB'],
  },
  {
    title: 'Frameworks & Libraries',
    tags: ['React Native (Expo)', 'Next.js', 'Node.js', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas'],
  },
  {
    title: 'Embedded & Hardware',
    tags: ['Arduino', 'Raspberry Pi', 'I²C / SPI / UART', 'GPIO', 'PWM', 'Klipper', 'Fusion 360', '3D Printing'],
  },
  {
    title: 'Backend & Databases',
    tags: ['Supabase', 'PostgreSQL', 'REST APIs', 'JWT Auth', 'Secure API Proxy Design'],
  },
  {
    title: 'DevOps & Tools',
    tags: ['Git / GitHub', 'Linux', 'CI/CD', 'Jupyter', 'Anaconda', 'VS Code', 'Android Studio'],
  },
  {
    title: 'AI & ML',
    tags: ['YOLO', 'TensorFlow / ONNX', 'Kalman Filtering', 'MPC', 'SINDy', 'RL', 'LLM APIs (OpenAI, Claude)'],
  },
]
