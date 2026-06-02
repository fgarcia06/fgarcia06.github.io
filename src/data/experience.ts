export const education = {
  school: 'University of Alberta',
  location: 'Edmonton, AB',
  degree: 'Bachelor of Science in Computer Engineering — Software Co-op Option',
  dates: 'Sept 2021 – April 2026',
  coursework:
    'Software Requirements Engineering, Software Testing and Maintenance Engineering, Software Systems Design, Operating System Concepts, Computer Organization and Architecture, Data Communication Networks, and Reliable and Secure Systems Design.',
} as const

export interface Job {
  role: string
  org: string
  location: string
  dates: string
  points: string[]
}

export const experience: Job[] = [
  {
    role: 'Software Intern',
    org: 'TRICCA Technologies',
    location: 'Edmonton, AB',
    dates: 'Jan 2024 – Aug 2024, May 2025 – Dec 2025',
    points: [
      'Designed and implemented Python and C++ components to automate laboratory robotic workflows.',
      'Built structured test cases and quantitative evaluation methods for system accuracy and repeatability.',
      'Analyzed test data in Python, Excel, and Google Sheets to identify trends and readiness risks.',
      'Executed verification and validation by running real assay workflows with chemistry stakeholders.',
      'Applied iterative Agile-style feedback cycles to prioritize issues and refine behavior.',
    ],
  },
  {
    role: 'Process Control Lab Assistant',
    org: 'University of Alberta',
    location: 'Edmonton, AB',
    dates: 'May 2023 – Aug 2023',
    points: [
      'Supported real-time experimental control system design with a multidisciplinary team.',
      'Applied SINDy system identification methods in Python to model dynamic behavior.',
      'Performed technical validation on experimental results against expected outcomes.',
      'Prepared technical reports and presentations to communicate design rationale and findings.',
    ],
  },
]
