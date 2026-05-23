export type ProjectBriefSection = {
  id: string;
  title: string;
  body: string;
};

const SECTION_ORDER = [
  'context',
  'problem',
  'users',
  'functional requirements',
  'non-functional requirements',
  'out of scope',
  'what done looks like',
] as const;

const SECTION_TITLES: Record<string, string> = {
  context: 'Context',
  problem: 'Problem',
  users: 'Users',
  'functional requirements': 'Functional Requirements',
  'non-functional requirements': 'Non-Functional Requirements',
  'out of scope': 'Out of Scope',
  'what done looks like': 'What Done Looks Like',
};

function normalizeHeading(line: string): string {
  return line
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase();
}

function sectionIdFromTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-');
}

function parseMarkdownHeadings(markdown: string): ProjectBriefSection[] | null {
  const lines = markdown.split('\n');
  const sections: ProjectBriefSection[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle) return;
    const body = currentBody.join('\n').trim();
    if (!body) return;
    sections.push({
      id: sectionIdFromTitle(currentTitle),
      title: currentTitle,
      body,
    });
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,2})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      flush();
      const normalized = normalizeHeading(headingMatch[2]);
      currentTitle = SECTION_TITLES[normalized] ?? headingMatch[2].trim();
      currentBody = [];
      continue;
    }
    if (currentTitle) currentBody.push(line);
  }
  flush();

  if (sections.length < 2) return null;
  return sections;
}

function fallbackSections(markdown: string): ProjectBriefSection[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];
  const paragraphs = trimmed.split(/\n\n+/);
  if (paragraphs.length >= 2) {
    return [
      {
        id: 'context',
        title: 'Context',
        body: paragraphs[0].trim(),
      },
      {
        id: 'requirements',
        title: 'Requirements',
        body: paragraphs.slice(1).join('\n\n').trim(),
      },
    ];
  }
  return [
    {
      id: 'full-brief',
      title: 'Full Project Brief',
      body: trimmed,
    },
  ];
}

export function parseProjectBriefSections(
  markdown: string,
): ProjectBriefSection[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const parsed = parseMarkdownHeadings(trimmed);
  if (parsed && parsed.length > 0) {
    const known = new Set(
      SECTION_ORDER.map((key) => SECTION_TITLES[key].toLowerCase()),
    );
    const ordered = SECTION_ORDER.flatMap((key) => {
      const title = SECTION_TITLES[key];
      return parsed.filter(
        (section) => section.title.toLowerCase() === title.toLowerCase(),
      );
    });
    const extras = parsed.filter(
      (section) => !known.has(section.title.toLowerCase()),
    );
    const merged = [...ordered, ...extras];
    if (merged.length > 0) return merged;
  }

  return fallbackSections(trimmed);
}

export function defaultOpenBriefSectionIds(
  sections: ProjectBriefSection[],
): Set<string> {
  const ids = new Set<string>();
  for (const section of sections) {
    const key = section.title.toLowerCase();
    if (key === 'context' || key === 'problem') ids.add(section.id);
  }
  if (!ids.size && sections[0]) ids.add(sections[0].id);
  return ids;
}
