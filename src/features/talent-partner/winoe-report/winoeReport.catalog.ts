const normalizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '');

type DimensionDefinition = {
  key: string;
  label: string;
  aliases: string[];
  description: string;
};

const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'architecture_and_design',
    label: 'Architecture & Design',
    aliases: [
      'architecture',
      'architectural_coherence',
      'architecture_coherence',
      'project_scaffolding_quality',
      'scaffolding',
    ],
    description:
      'How clearly the solution shape, boundaries, and data flow were established.',
  },
  {
    key: 'problem_understanding',
    label: 'Problem Understanding',
    aliases: [
      'problem_understanding',
      'scope_control',
      'functional_requirements',
      'non_functional_requirements',
      'scope_realism',
    ],
    description:
      'How well the candidate framed the actual problem, constraints, and success path.',
  },
  {
    key: 'implementation_quality',
    label: 'Implementation Quality',
    aliases: [
      'implementation_quality',
      'implementation_discipline',
      'implementation',
      'build_quality',
      'delivery_quality',
    ],
    description:
      'How effectively the feature was delivered and refined across the Trial.',
  },
  {
    key: 'code_quality',
    label: 'Code Quality',
    aliases: ['code_quality', 'quality', 'code', 'implementation_code_quality'],
    description: 'How readable, maintainable, and consistent the code landed.',
  },
  {
    key: 'testing_discipline',
    label: 'Testing Discipline',
    aliases: ['testing', 'testing_discipline', 'tests', 'coverage'],
    description:
      'How consistently the candidate added or improved tests and verification signals.',
  },
  {
    key: 'development_process',
    label: 'Development Process',
    aliases: [
      'process',
      'development_process',
      'commit_history',
      'commit_history_analysis',
    ],
    description:
      'How the commit trail, iteration sequence, and build progression were managed.',
  },
  {
    key: 'communication',
    label: 'Communication',
    aliases: [
      'communication',
      'communication_handoff_demo',
      'handoff',
      'handoff_demo',
      'presentation',
      'demo',
      'transcript',
    ],
    description:
      'How clearly the candidate explained the work, tradeoffs, and next steps.',
  },
  {
    key: 'reflection_ownership',
    label: 'Reflection & Ownership',
    aliases: [
      'reflection',
      'reflection_essay',
      'reflection_self_awareness',
      'self_awareness',
      'ownership',
      'growth_orientation',
    ],
    description:
      'How honestly the candidate described tradeoffs, mistakes, and areas for improvement.',
  },
];

const DIMENSION_LOOKUP = new Map<string, DimensionDefinition>();
for (const dimension of DIMENSIONS) {
  DIMENSION_LOOKUP.set(normalizeKey(dimension.key), dimension);
  DIMENSION_LOOKUP.set(normalizeKey(dimension.label), dimension);
  dimension.aliases.forEach((alias) =>
    DIMENSION_LOOKUP.set(normalizeKey(alias), dimension),
  );
}

const DAY_LABELS: Record<number, string> = {
  1: 'Design Doc',
  2: 'Implementation Kickoff',
  3: 'Implementation Wrap-Up',
  4: 'Handoff + Demo',
  5: 'Reflection',
};

const EVIDENCE_KIND_LABELS: Record<string, string> = {
  commit: 'Commit evidence',
  commit_range: 'Commit range evidence',
  design_doc: 'Design doc evidence',
  design_doc_section: 'Design doc evidence',
  rubric: 'Design doc evidence',
  file_creation_timeline: 'File timeline evidence',
  file_timeline: 'File timeline evidence',
  code_structure: 'Code structure evidence',
  file_reference: 'Code structure evidence',
  test: 'Test evidence',
  tests: 'Test evidence',
  test_result: 'Test evidence',
  coverage: 'Coverage progression evidence',
  coverage_progression: 'Coverage progression evidence',
  dependency_choice: 'Dependency choice evidence',
  readme: 'README/documentation evidence',
  documentation: 'README/documentation evidence',
  doc: 'README/documentation evidence',
  transcript: 'Handoff + Demo transcript',
  handoff_transcript: 'Handoff + Demo transcript',
  demo_transcript: 'Handoff + Demo transcript',
  supplemental_material: 'Supplemental material evidence',
  reflection: 'Reflection excerpt',
  reflection_excerpt: 'Reflection excerpt',
  submission: 'Reflection excerpt',
  sub_agent_report: 'Sub-agent report excerpt',
  reviewer_report: 'Sub-agent report excerpt',
};

export type WinoeDimensionDefinition = DimensionDefinition;

export function formatDayLabel(dayIndex: number): string {
  return DAY_LABELS[dayIndex] ?? `Day ${dayIndex}`;
}

export function getDimensionDefinition(
  value: string | null,
): DimensionDefinition | null {
  if (!value) return null;
  return DIMENSION_LOOKUP.get(normalizeKey(value)) ?? null;
}

export function humanizeKey(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatEvidenceKindLabel(kind: string | null): string {
  if (!kind) return 'Evidence';
  const normalized = normalizeKey(kind);
  return EVIDENCE_KIND_LABELS[normalized] ?? `${humanizeKey(kind)} evidence`;
}

export function getDayLabel(
  dayIndex: number | null | undefined,
): string | null {
  if (typeof dayIndex !== 'number' || !Number.isFinite(dayIndex)) return null;
  return formatDayLabel(dayIndex);
}

export function getDimensionCatalog(): DimensionDefinition[] {
  return DIMENSIONS;
}
