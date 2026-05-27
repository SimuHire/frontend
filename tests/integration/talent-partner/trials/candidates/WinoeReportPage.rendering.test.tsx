import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  READY_PAYLOAD,
  jsonResponse,
  renderWinoeReportPage,
  resetWinoeReportTest,
  setFetchForWinoeReport,
  textResponse,
} from './WinoeReportPage.testlib';

describe('WinoeReportPage rendering', () => {
  beforeEach(() => resetWinoeReportTest());
  afterEach(() => {
    jest.useRealTimers();
    document.body.classList.remove('winoe-report-print-mode');
  });

  it('renders exactly eight top-level dimensions for the seeded Sarah Chen report shape', async () => {
    const user = userEvent.setup();
    setFetchForWinoeReport(async (url) =>
      url === '/api/candidate_sessions/2/winoe_report'
        ? jsonResponse({
            status: 'ready',
            generatedAt: '2026-03-11T18:00:00.000Z',
            report: {
              overallWinoeScore: 0.78,
              recommendation: 'strong_hire',
              confidence: 0.74,
              verdictOneLiner:
                "Sarah's Trial is cohesive, evidence-backed, and easy to explain without overclaiming.",
              narrativeAssessment:
                'The report is backed by linked artifacts across the Trial timeline.',
              cohortContext:
                'This completed Trial has the densest evidence trail in the seeded demo set.',
              dimensionScores: [
                {
                  key: 'architecture_and_design',
                  label: 'Architecture & Design',
                  score: 0.88,
                  summary: 'The Day 1 design doc keeps the scope small.',
                  evidence: [],
                },
                {
                  key: 'problem_understanding',
                  label: 'Problem Understanding',
                  score: 0.86,
                  summary:
                    'The brief and setup stay aligned to the real problem.',
                  evidence: [],
                },
                {
                  key: 'implementation_quality',
                  label: 'Implementation Quality',
                  score: 0.89,
                  summary: 'The Day 2 and Day 3 commits show steady progress.',
                  evidence: [],
                },
                {
                  key: 'code_quality',
                  label: 'Code Quality',
                  score: 0.88,
                  summary:
                    'The repository stays readable, compact, and easy to audit.',
                  evidence: [],
                },
                {
                  key: 'testing_discipline',
                  label: 'Testing Discipline',
                  score: 0.87,
                  summary: 'The test story shows deliberate validation.',
                  evidence: [],
                },
                {
                  key: 'development_process',
                  label: 'Development Process',
                  score: 0.86,
                  summary:
                    'The implementation cadence and docs point the same way.',
                  evidence: [],
                },
                {
                  key: 'communication',
                  label: 'Communication',
                  score: 0.88,
                  summary:
                    'The Day 4 handoff and demo keep the story specific.',
                  evidence: [],
                },
                {
                  key: 'reflection_ownership',
                  label: 'Reflection & Ownership',
                  score: 0.84,
                  summary:
                    'The reflection is candid about tradeoffs and edges.',
                  evidence: [],
                },
              ],
              reviewerSummaries: [
                {
                  reviewerName: 'Design Doc Reviewer',
                  dayIndexes: [1],
                  score: 0.81,
                  summary: 'The design doc frames the API clearly.',
                  strengths: [],
                  concerns: [],
                  evidence: [],
                  sourceLabel: 'Design Doc Reviewer',
                },
              ],
              dayScores: [
                {
                  dayIndex: 1,
                  score: 0.7,
                  rubricBreakdown: { architecture_and_design: 0.88 },
                  evidence: [],
                },
                {
                  dayIndex: 2,
                  score: 0.82,
                  rubricBreakdown: { implementation_quality: 0.89 },
                  evidence: [],
                },
                {
                  dayIndex: 3,
                  score: 0.84,
                  rubricBreakdown: { code_quality: 0.88 },
                  evidence: [],
                },
                {
                  dayIndex: 4,
                  score: 0.79,
                  rubricBreakdown: { communication: 0.88 },
                  evidence: [
                    {
                      kind: 'transcript',
                      ref: 'transcript-4',
                      excerpt:
                        'Candidate describes architecture and follow-up items.',
                      startMs: 15000,
                      endMs: 19000,
                      dayIndex: 4,
                    },
                  ],
                },
                {
                  dayIndex: 5,
                  score: 0.77,
                  rubricBreakdown: { reflection_ownership: 0.84 },
                  evidence: [],
                },
              ],
              citations: [
                {
                  dimension: 'Architecture & Design',
                  artifact_type: 'design_doc',
                  artifact_ref: 'day1-design-doc.md:L1-L20',
                  excerpt:
                    'Use a small FastAPI service with one core domain module.',
                },
              ],
            },
          })
        : textResponse('Not found', 404),
    );

    renderWinoeReportPage();

    expect(await screen.findByText(/Winoe Score/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('view-evidence-button')).toHaveLength(8);
    expect(
      screen.getAllByText(/Architecture & Design/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Reflection & Ownership/i).length,
    ).toBeGreaterThan(0);

    await user.click(screen.getAllByTestId('view-evidence-button')[0]);
    const drawer = await screen.findByRole('dialog', {
      name: /Evidence Trail · Architecture & Design/i,
    });
    expect(
      within(drawer).queryByText(/Evidence is unavailable/i),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).getByText(/day1-design-doc\.md:L1-L20/i),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText(
        /Use a small FastAPI service with one core domain module/i,
      ),
    ).toBeInTheDocument();
  });

  it('toggles print-mode class while mounted', () => {
    setFetchForWinoeReport(async (url) =>
      url === '/api/candidate_sessions/2/winoe_report'
        ? jsonResponse({ status: 'not_started' })
        : textResponse('Not found', 404),
    );
    const { unmount } = renderWinoeReportPage();
    expect(document.body.classList.contains('winoe-report-print-mode')).toBe(
      true,
    );
    unmount();
    expect(document.body.classList.contains('winoe-report-print-mode')).toBe(
      false,
    );
  });

  it('renders ready report from 200 payload', async () => {
    const user = userEvent.setup();
    const readyPayload = {
      ...READY_PAYLOAD,
      report: {
        ...READY_PAYLOAD.report,
        dimensionScores: READY_PAYLOAD.report.dimensionScores.map(
          (dimension, index) =>
            index === 0
              ? {
                  ...dimension,
                  evidence: [
                    {
                      ...dimension.evidence[0],
                      url: 'https://github.com/org/repo/commit/abc123',
                    },
                  ],
                }
              : dimension,
        ),
      },
    };
    setFetchForWinoeReport(async (url) =>
      url === '/api/candidate_sessions/2/winoe_report'
        ? jsonResponse(readyPayload)
        : textResponse('Not found', 404),
    );
    renderWinoeReportPage();
    expect(
      (await screen.findAllByText(/Architecture & Design/i)).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Winoe Score/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^Winoe Report$/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Footer Actions/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Candidate's Work/i)).toBeInTheDocument();
    expect(screen.getByText(/Narrative Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Disagree\? Send feedback →/i)).toBeInTheDocument();
    expect(document.querySelector('.prose-narrative')).toHaveStyle({
      fontFamily: 'var(--font-serif)',
    });
    expect(
      screen.getAllByText(/Architecture & Design/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Repository structure was established early/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /View evidence/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByTestId('view-evidence-button')[0]).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: /Download PDF/i }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: /Share with team/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Open Benchmarks/i }),
    ).toHaveAttribute('href', '/talent-partner/trials/1/benchmarks');
    expect(
      screen.getByRole('link', { name: /View raw submission/i }),
    ).toHaveAttribute(
      'href',
      '/talent-partner/trials/1/candidates/2/submission',
    );
    await user.click(
      screen.getAllByRole('button', { name: /View evidence/i })[0],
    );
    const drawer = screen.getByRole('dialog', {
      name: /Evidence Trail · Architecture & Design/i,
    });
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText(/Dimension score/i)).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Architecture & Design/i),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByRole('heading', {
        name: /Day 2\/3 — Code/i,
        level: 4,
      }),
    ).toBeInTheDocument();
    expect(within(drawer).getAllByText('abc123').length).toBeGreaterThan(0);
    expect(
      within(drawer).getByText(/Repository structure was established early/i),
    ).toBeInTheDocument();
    expect(
      within(drawer).getAllByRole('link', { name: /Open evidence link/i })
        .length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Share with team/i }));
    expect(
      await screen.findByRole('dialog', { name: /Share this report/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Secure team sharing is not enabled yet/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy link/i })).toBeDisabled();
    expect(screen.queryByLabelText(/Link expiry/i)).not.toBeInTheDocument();
  });

  it('renders AI-disabled day cards as human-review-required placeholders', async () => {
    setFetchForWinoeReport(async (url) =>
      url === '/api/candidate_sessions/2/winoe_report'
        ? jsonResponse({
            status: 'ready',
            generatedAt: '2026-03-11T18:00:00.000Z',
            report: {
              overallWinoeScore: 0.62,
              recommendation: 'lean_hire',
              confidence: 0.58,
              disabledDayIndexes: [2, 3],
              dayScores: [
                {
                  dayIndex: 1,
                  score: 0.71,
                  rubricBreakdown: { communication: 0.8 },
                  evidence: [],
                },
                {
                  dayIndex: 3,
                  score: null,
                  status: 'human_review_required',
                  reason: 'ai_eval_disabled_for_day',
                  rubricBreakdown: {},
                  evidence: [],
                },
              ],
            },
          })
        : textResponse('Not found', 404),
    );
    renderWinoeReportPage();
    expect(
      await screen.findByText('Day 2 — Code (Implementation Kickoff)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Day 3 — Code (Implementation Wrap-Up)'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/AI evaluation disabled for this day\./i).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText(/Human review required\./i).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('renders warning banner when payload includes warnings', async () => {
    setFetchForWinoeReport(async (url) =>
      url === '/api/candidate_sessions/2/winoe_report'
        ? jsonResponse({
            ...READY_PAYLOAD,
            warnings: ['Some artifacts were unavailable during evaluation.'],
          })
        : textResponse('Not found', 404),
    );
    renderWinoeReportPage();
    expect(await screen.findByText(/Report warnings/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Some artifacts were unavailable during evaluation./i),
    ).toBeInTheDocument();
  });
});
