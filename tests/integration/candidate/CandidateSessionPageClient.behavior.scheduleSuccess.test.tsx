import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  baseSession,
  fetchMock,
  fillScheduleAndContinue,
  renderSessionPage,
  resetBehaviorEnv,
  restoreFetch,
  routerMock,
  sampleWindows,
} from './CandidateSessionPageClient.behavior.testlib';
import { jsonResponse } from '../../setup/responseHelpers';

jest.setTimeout(15000);

describe('CandidateSessionPage auth flow schedule success', () => {
  beforeEach(() => {
    resetBehaviorEnv('valid-token');
  });

  afterAll(() => {
    restoreFetch();
  });

  it('shows scheduling flow, confirms schedule, and routes to the portal', async () => {
    let scheduleRequestBody: Record<string, unknown> | null = null;
    fetchMock.mockImplementation(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);
        if (path.endsWith('/candidate/session/valid-token'))
          return jsonResponse(baseSession());
        if (
          path.endsWith('/candidate/session/valid-token/schedule') &&
          init?.method === 'POST'
        ) {
          scheduleRequestBody = init?.body
            ? (JSON.parse(String(init.body)) as Record<string, unknown>)
            : null;
          return jsonResponse(
            baseSession({
              scheduledStartAt: '2099-01-01T14:00:00Z',
              candidateTimezone: 'America/New_York',
              githubUsername: 'octocat',
              dayWindows: sampleWindows,
              scheduleLockedAt: '2098-12-01T14:00:00Z',
            }),
          );
        }
        throw new Error(`Unexpected fetch ${path}`);
      },
    );

    const user = userEvent.setup();
    renderSessionPage('valid-token');
    await fillScheduleAndContinue(user);
    expect(
      await screen.findByText(/5-day schedule preview/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /Confirm and lock in/i }),
    );
    expect(scheduleRequestBody).toMatchObject({
      candidateTimezone: 'America/New_York',
      githubUsername: 'octocat',
    });
    expect(scheduleRequestBody?.scheduledStartAt).toEqual(expect.any(String));
    await waitFor(() =>
      expect(routerMock.push).toHaveBeenCalledWith('/candidate/portal'),
    );
    expect(screen.queryByText(/Project Brief/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Codespace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Repository URL/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Day 1 editor/i)).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/current_task'),
      ),
    ).toBeUndefined();
  });
});
