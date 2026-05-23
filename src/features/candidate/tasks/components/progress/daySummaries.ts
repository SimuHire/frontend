export type DayStatus = 'completed' | 'current' | 'locked';

export const DAY_SUMMARIES = [
  {
    title: 'Planning & Design Doc',
    detail: 'Understand the prompt and outline your approach.',
    hint: 'Submit your written response.',
  },
  {
    title: 'Implementation Kickoff',
    detail: 'Implement the feature in your workspace.',
    hint: 'Workspace + tests.',
  },
  {
    title: 'Implementation Wrap-Up',
    detail: 'Finish the build, improve tests, optimize, and document.',
    hint: 'Workspace + tests.',
  },
  {
    title: 'Handoff + Demo',
    detail: 'Upload a short walkthrough of your work and decisions.',
    hint: 'Demo video.',
  },
  {
    title: 'Reflection Essay',
    detail: 'Capture your experience in a final markdown reflection.',
    hint: 'Markdown editor.',
  },
];
