export interface SkillGroup {
  title: string
  tags?: string[]
  items?: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming Languages',
    tags: ['Python', 'C', 'C++', 'Java', 'Bash', 'SQL', 'MATLAB', 'Assembly'],
  },
  {
    title: 'Systems and Environments',
    tags: ['Linux', 'Embedded Systems', 'Microcontrollers', 'Android'],
  },
  {
    title: 'Development Tools',
    tags: ['Git', 'VS Code', 'Vim', 'PyCharm', 'Android Studio', 'Eclipse'],
  },
  {
    title: 'Software Engineering Practices',
    items: [
      'Software automation for laboratory workflows',
      'Verification and validation test planning',
      'Computer vision and object tracking optimization',
      'Mobile app development and testing',
      'Iterative Agile-style development with stakeholder feedback',
      'Technical documentation and engineering reporting',
    ],
  },
  {
    title: 'Testing and Quality Engineering',
    tags: [
      'Test Case Design',
      'Verification and Validation',
      'Unit Testing (JUnit)',
      'UI Testing (Espresso)',
      'Quantitative Performance Evaluation',
      'Assay Workflow Validation',
    ],
  },
  {
    title: 'Data and Analysis Skills',
    tags: [
      'Python Data Analysis',
      'Excel',
      'Google Sheets',
      'Trend Analysis',
      'System Readiness Assessment',
      'SINDy Modeling',
    ],
  },
  {
    title: 'Core CS and Software Foundations',
    items: [
      'Software requirements engineering and software systems design',
      'Software testing and maintenance engineering',
      'Operating system concepts and computer architecture',
      'Reliable and secure systems design',
      'Data communication networks and microprocessor interfacing',
    ],
  },
]
