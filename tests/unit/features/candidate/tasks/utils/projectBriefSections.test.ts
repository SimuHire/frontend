import {
  defaultOpenBriefSectionIds,
  parseProjectBriefSections,
} from '@/features/candidate/tasks/utils/projectBriefSections';

describe('parseProjectBriefSections', () => {
  it('recognizes Context, Problem, and Users headings', () => {
    const sections = parseProjectBriefSections(
      '# Context\n\nTrial context.\n\n## Problem\n\nSolve intake.\n\n## Users\n\nHiring teams.',
    );
    expect(sections.map((s) => s.title)).toEqual([
      'Context',
      'Problem',
      'Users',
    ]);
  });

  it('orders known sections according to product order', () => {
    const sections = parseProjectBriefSections(
      '## What Done Looks Like\n\nDone.\n\n# Context\n\nCtx.\n\n## Problem\n\nProb.\n\n## Users\n\nUsr.',
    );
    expect(sections.map((s) => s.title)).toEqual([
      'Context',
      'Problem',
      'Users',
      'What Done Looks Like',
    ]);
  });

  it('falls back to Context and Requirements when markdown has paragraphs but no headings', () => {
    const sections = parseProjectBriefSections(
      'First paragraph context.\n\nSecond paragraph requirements.',
    );
    expect(sections).toEqual([
      { id: 'context', title: 'Context', body: 'First paragraph context.' },
      {
        id: 'requirements',
        title: 'Requirements',
        body: 'Second paragraph requirements.',
      },
    ]);
  });

  it('falls back to Full Project Brief for a one-block brief', () => {
    const sections = parseProjectBriefSections('Single block brief text.');
    expect(sections).toEqual([
      {
        id: 'full-brief',
        title: 'Full Project Brief',
        body: 'Single block brief text.',
      },
    ]);
  });

  it('defaults Context and Problem open when present', () => {
    const sections = parseProjectBriefSections(
      '# Context\n\nCtx.\n\n## Problem\n\nProb.\n\n## Users\n\nUsr.',
    );
    const open = defaultOpenBriefSectionIds(sections);
    expect(open.has('context')).toBe(true);
    expect(open.has('problem')).toBe(true);
    expect(open.has('users')).toBe(false);
  });
});
