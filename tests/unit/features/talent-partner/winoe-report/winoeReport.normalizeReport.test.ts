import { normalizeReport } from '@/features/talent-partner/winoe-report/winoeReport.normalizeReport';

describe('normalizeReport', () => {
  it('preserves an explicit eight-dimension report without inflating it from day-level inference', () => {
    const report = normalizeReport({
      overallWinoeScore: 0.78,
      recommendation: 'strong_hire',
      dimensionScores: [
        {
          key: 'architecture_and_design',
          label: 'Architecture & Design',
          score: 0.88,
          justification: 'The Day 1 design doc keeps the scope small.',
          evidence: [
            {
              kind: 'design_doc',
              ref: 'day1-design-doc.md:L1-L20',
              dayIndex: 1,
              excerpt:
                'Use a small FastAPI service with one core domain module.',
            },
          ],
        },
        {
          key: 'problem_understanding',
          label: 'Problem Understanding',
          score: 0.86,
          justification:
            'The brief and setup stay aligned to the real problem.',
        },
        {
          key: 'implementation_quality',
          label: 'Implementation Quality',
          score: 0.89,
          justification: 'The Day 2 and Day 3 commits show steady progress.',
        },
        {
          key: 'code_quality',
          label: 'Code Quality',
          score: 0.88,
          justification:
            'The repository stays readable, compact, and easy to audit.',
        },
        {
          key: 'testing_discipline',
          label: 'Testing Discipline',
          score: 0.87,
          justification:
            'The day-by-day test evidence shows deliberate validation.',
        },
        {
          key: 'development_process',
          label: 'Development Process',
          score: 0.86,
          justification:
            'The implementation cadence and docs point in the same direction.',
        },
        {
          key: 'communication',
          label: 'Communication',
          score: 0.88,
          justification: 'The Day 4 handoff and demo keep the story specific.',
          evidence: [
            {
              kind: 'transcript',
              ref: 'handoff-demo-transcript.txt:02:14-02:48',
              dayIndex: 4,
              startMs: 134000,
              endMs: 148000,
              excerpt: 'Demo transcript with architecture and next steps.',
            },
          ],
        },
        {
          key: 'reflection_ownership',
          label: 'Reflection & Ownership',
          score: 0.84,
          justification: 'The reflection is candid about tradeoffs and edges.',
        },
      ],
      dayScores: [
        {
          dayIndex: 1,
          score: 0.7,
          rubricBreakdown: {
            architecture_and_design: 0.88,
            problem_understanding: 0.86,
          },
          evidence: [
            {
              kind: 'commit',
              ref: 'commit-1',
              dayIndex: 1,
              dimensionKey: 'architecture_and_design',
              excerpt: 'Repository scaffolding commit.',
            },
          ],
        },
        {
          dayIndex: 4,
          score: 0.79,
          rubricBreakdown: {
            communication: 0.88,
          },
          evidence: [
            {
              kind: 'transcript',
              ref: 'handoff-demo-transcript.txt:02:14-02:48',
              dayIndex: 4,
              startMs: 134000,
              endMs: 148000,
              dimensionKey: 'communication',
              excerpt: 'Demo transcript with architecture and next steps.',
            },
          ],
        },
      ],
      reviewerSummaries: [],
      disabledDayIndexes: [],
    });

    expect(report).not.toBeNull();
    expect(report?.dimensionScores).toHaveLength(8);
    expect(report?.dimensionScores.map((item) => item.label)).toEqual([
      'Architecture & Design',
      'Problem Understanding',
      'Implementation Quality',
      'Code Quality',
      'Testing Discipline',
      'Development Process',
      'Communication',
      'Reflection & Ownership',
    ]);
    expect(report?.dimensionScores[0]?.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ref: 'commit-1',
          dimensionKey: 'architecture_and_design',
        }),
        expect.objectContaining({
          kind: 'design_doc',
          ref: 'day1-design-doc.md:L1-L20',
          excerpt: 'Use a small FastAPI service with one core domain module.',
        }),
      ]),
    );
    expect(report?.dimensionScores[6]?.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ref: 'handoff-demo-transcript.txt:02:14-02:48',
          dimensionKey: 'communication',
        }),
      ]),
    );
  });

  it('merges backend report-level citation payloads into matching dimensions', () => {
    const report = normalizeReport({
      overallWinoeScore: 0.78,
      recommendation: 'positive_signal',
      confidence: 0.74,
      dimensions: [
        {
          name: 'Architecture & Design',
          score: 8.8,
          justification: 'The Day 1 design doc keeps the scope small.',
        },
      ],
      citations: [
        {
          dimension: 'Architecture & Design',
          artifact_type: 'design_doc',
          artifact_ref: 'day1-design-doc.md:L1-L20',
          excerpt: 'Use a small FastAPI service with one core domain module.',
        },
      ],
      dayScores: [],
      reviewerReports: [],
      disabledDayIndexes: [],
    });

    const architecture = report?.dimensionScores.find(
      (item) => item.key === 'architecture_and_design',
    );

    expect(architecture).toMatchObject({
      label: 'Architecture & Design',
      summary: 'The Day 1 design doc keeps the scope small.',
      evidenceCount: 1,
      linkedArtifactCount: 1,
    });
    expect(architecture?.score).toBeCloseTo(0.88);
    expect(architecture?.evidence).toEqual([
      expect.objectContaining({
        kind: 'design_doc',
        ref: 'day1-design-doc.md:L1-L20',
        excerpt: 'Use a small FastAPI service with one core domain module.',
        dimensionKey: 'architecture_and_design',
        dimensionLabel: 'Architecture & Design',
      }),
    ]);
  });

  it('merges explicit backend dimensions, derived day-level dimensions, and canonical from-scratch dimensions', () => {
    const report = normalizeReport({
      overallWinoeScore: 0.82,
      recommendation: 'strong_hire',
      dimensionScores: [
        {
          key: 'communication_handoff_demo',
          label: 'Communication / Handoff + Demo',
          score: 0.88,
          summary: 'Explicit backend dimension should win.',
          evidence: [
            {
              kind: 'transcript',
              ref: 'transcript-4',
              dayIndex: 4,
              startMs: 15000,
              endMs: 19000,
              excerpt: 'Handoff and demo transcript evidence.',
              dimensionKey: 'communication_handoff_demo',
            },
          ],
        },
        {
          key: 'custom_dimension',
          label: 'Custom dimension',
          score: 0.44,
          summary: 'Unknown backend dimensions should trail the canonical set.',
          evidence: [],
        },
      ],
      dayScores: [
        {
          dayIndex: 1,
          score: 0.7,
          rubricBreakdown: {
            project_scaffolding_quality: 0.72,
            architectural_coherence: 0.68,
          },
          evidence: [
            {
              kind: 'commit',
              ref: 'commit-1',
              dayIndex: 1,
              dimensionKey: 'project_scaffolding_quality',
              excerpt: 'Repository scaffolding commit.',
            },
          ],
        },
        {
          dayIndex: 2,
          score: 0.8,
          rubricBreakdown: {
            development_process: 0.84,
            testing_discipline: 0.8,
          },
          evidence: [
            {
              kind: 'commit_range',
              ref: 'commit-range-2',
              dayIndex: 2,
              dimensionKey: 'development_process',
              excerpt: 'Commit range evidence for process.',
            },
          ],
        },
        {
          dayIndex: 4,
          score: 0.79,
          rubricBreakdown: {
            communication_handoff_demo: 0.12,
          },
          evidence: [],
        },
        {
          dayIndex: 5,
          score: 0.77,
          rubricBreakdown: {
            reflection_self_awareness: 0.77,
          },
          evidence: [
            {
              kind: 'reflection',
              ref: 'day5-reflection.md:L8-L22',
              dayIndex: 5,
              dimensionKey: 'reflection_self_awareness',
              excerpt: 'Reflection essay about tradeoffs and follow-up work.',
            },
          ],
        },
      ],
      reviewerSummaries: [],
      disabledDayIndexes: [],
    });

    expect(report).not.toBeNull();
    expect(report?.dimensionScores.map((item) => item.key)).toEqual([
      'architecture_and_design',
      'problem_understanding',
      'implementation_quality',
      'code_quality',
      'testing_discipline',
      'development_process',
      'communication',
      'reflection_ownership',
      'custom_dimension',
    ]);
    expect(
      report?.dimensionScores.find((item) => item.key === 'communication')
        ?.score,
    ).toBe(0.88);
    expect(
      report?.dimensionScores.find(
        (item) => item.key === 'architecture_and_design',
      ),
    ).toMatchObject({
      evidence: expect.arrayContaining([
        expect.objectContaining({
          ref: 'commit-1',
          dimensionKey: 'architecture_and_design',
        }),
      ]),
    });
    expect(
      report?.dimensionScores.find(
        (item) => item.key === 'architecture_and_design',
      )?.score,
    ).toBe(0.7);
    expect(
      report?.dimensionScores.find(
        (item) => item.key === 'reflection_ownership',
      ),
    ).toMatchObject({
      evidence: expect.arrayContaining([
        expect.objectContaining({
          ref: 'day5-reflection.md:L8-L22',
          dimensionKey: 'reflection_ownership',
        }),
      ]),
      score: 0.77,
    });
    expect(
      report?.dimensionScores.find((item) => item.key === 'custom_dimension'),
    ).toMatchObject({
      label: 'Custom dimension',
    });
    expect(
      report?.dimensionScores.find((item) => item.key === 'custom_dimension')
        ?.score,
    ).toBe(0.44);
  });

  it('keeps unknown dimensions after the canonical set when no catalog match exists', () => {
    const report = normalizeReport({
      overallWinoeScore: 0.7,
      recommendation: 'lean_hire',
      dimensionScores: [
        {
          key: 'zeta_custom',
          label: 'Zeta custom',
          score: 0.61,
          evidence: [],
        },
      ],
      dayScores: [],
      reviewerSummaries: [],
      disabledDayIndexes: [],
    });

    expect(report?.dimensionScores.at(-1)?.key).toBe('zeta_custom');
    expect(report?.dimensionScores[0]?.key).toBe('architecture_and_design');
  });

  it('normalizes scores without collapsing ten-point dimension inputs', () => {
    const report = normalizeReport({
      overallWinoeScore: 67.31,
      recommendation: 'strong_hire',
      dimensionScores: [
        {
          key: 'communication_handoff_demo',
          label: 'Communication / Handoff + Demo',
          score: 7.4,
          summary:
            'Display-scale dimension score should survive normalization.',
          evidence: [],
        },
      ],
      dayScores: [
        {
          dayIndex: 4,
          score: 74,
          rubricBreakdown: {},
          evidence: [],
        },
      ],
      reviewerSummaries: [],
      disabledDayIndexes: [],
    });

    expect(report?.overallWinoeScore).toBeCloseTo(0.6731, 4);
    expect(
      report?.dimensionScores.find((item) => item.key === 'communication')
        ?.score,
    ).toBeCloseTo(0.74, 2);
    expect(report?.dayScores[0]?.score).toBeCloseTo(0.74, 2);
  });
});
