export const profile = {
  name: 'Francis Garcia',
  title: 'Computer Engineering · Robotics, Full-Stack & Applied ML',
  /** Bold one-liner for the hero. */
  statement: 'I make machines move and software think.',
  /** Short supporting line — less text, more impact. */
  tagline: 'Robotics engineer and builder turning hardware, code, and AI into systems that ship.',
  location: 'Edmonton, Alberta',
  email: 'fgarcia@ualberta.ca',
  phone: '403-550-7058',
  links: {
    github: 'https://github.com/fgarcia06',
    linkedin: 'https://linkedin.com/in/fgarcia06',
    resume: '/resume.md',
  },
  portrait: '/images/self_pic.png',
} as const

export const highlights = [
  { value: '60%', label: 'Faster QA cycles from automated Python test pipelines at TRICCA' },
  { value: '>92%', label: 'Detection mAP on a real-time multi-object tracking system' },
  { value: '<5%', label: 'Model error reconstructing system ODEs with a SINDy pipeline' },
] as const
