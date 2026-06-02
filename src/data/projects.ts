export interface Project {
  title: string
  label: string
  dates: string
  image: string
  summary: string
  points: string[]
  tags: string[]
}

export const projects: Project[] = [
  {
    title: 'Lottery Event Android Mobile App',
    label: 'Android + Firebase',
    dates: 'October 2024 – December 2024',
    image: '/images/project-android.svg',
    summary:
      'Engineered a full-stack Android application for lottery event management with Firebase integration for real-time data synchronization and user management.',
    points: [
      'Designed and optimized UI/UX in XML with OSMdroid for interactive location-based functionality.',
      'Implemented unit and UI test coverage using JUnit and Espresso for scalable behavior validation.',
    ],
    tags: ['Java', 'C++', 'Android Studio', 'Firebase', 'JUnit', 'Espresso'],
  },
  {
    title: 'Object Tracking for Camera',
    label: 'YOLO + TensorFlow',
    dates: 'May 2023 – August 2023',
    image: '/images/project-tracking.svg',
    summary:
      'Built a real-time object tracking pipeline combining deep learning detection with predictive filtering for more stable tracking in dynamic scenes.',
    points: [
      'Implemented Kalman filtering to improve motion prediction and robustness during occlusions.',
      'Integrated YOLO with TensorFlow for high-accuracy object identification.',
      'Optimized processing to reduce latency by approximately 50% on high-frame-rate streams.',
    ],
    tags: ['Python', 'C++', 'TensorFlow', 'YOLO', 'VS Code'],
  },
]
