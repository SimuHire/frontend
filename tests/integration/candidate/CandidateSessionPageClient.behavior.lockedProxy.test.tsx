import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  baseSession,
  fetchMock,
  renderSessionPage,
  resetBehaviorEnv,
  restoreFetch,
  sampleWindows,
} from './CandidateSessionPageClient.behavior.testlib';
import { STORAGE_KEY } from '@/features/candidate/session/state/state';
import { jsonResponse } from '../../setup/responseHelpers';

describe('CandidateSessionPage auth flow locked bootstrap and backend proxy', () => {
  beforeEach(() => {
    resetBehaviorEnv('valid-token');
  });

  afterAll(() => {
    restoreFetch();
  });

  it('renders locked bootstrap state and blocks task autoload', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo | URL) => {
      const path = String(url);
      if (path.endsWith('/candidate/session/locked-token')) {
        return jsonResponse(
          baseSession({
            candidateSessionId: 654,
            status: 'not_started',
            scheduledStartAt: '2099-01-01T14:00:00Z',
            candidateTimezone: 'America/New_York',
            dayWindows: sampleWindows,
            scheduleLockedAt: '2098-12-01T14:00:00Z',
          }),
        );
      }
      throw new Error(`Unexpected fetch ${path}`);
    });
    renderSessionPage('locked-token');
    expect(
      await screen.findByText(/Almost there — your Trial is scheduled/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/5-day schedule preview/i)).toBeInTheDocument();
    expect(screen.queryByText(/Project Brief/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Repository URL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Codespace/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Day 1 editor/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start trial/i })).toBeNull();
    expect(
      fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/current_task'),
      ),
    ).toBeUndefined();
  });

  it('renders scheduled pre-day state for in-progress bootstrap without surfacing current-task 409', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inviteToken: 'pre-day-token',
        candidateSessionId: 655,
        bootstrap: null,
        started: true,
        taskState: {
          isComplete: false,
          completedAt: null,
          completedTaskIds: [],
          currentTask: {
            id: 10,
            dayIndex: 1,
            type: 'design',
            title: 'Stale Day 1 task',
            description: 'Persisted from an earlier local run',
            recordedSubmission: null,
            cutoffCommitSha: null,
            cutoffAt: null,
          },
        },
      }),
    );
    fetchMock.mockImplementation(async (url: RequestInfo | URL) => {
      const path = String(url);
      if (path.endsWith('/candidate/session/pre-day-token')) {
        return jsonResponse(
          baseSession({
            candidateSessionId: 655,
            status: 'in_progress',
            scheduledStartAt: '2099-01-01T14:00:00Z',
            candidateTimezone: 'America/New_York',
            dayWindows: sampleWindows,
            scheduleLockedAt: '2098-12-01T14:00:00Z',
            currentDayWindow: {
              ...sampleWindows[0],
              state: 'upcoming',
            },
          }),
        );
      }
      if (path.includes('/current_task')) {
        return jsonResponse(
          {
            detail: 'Trial has not started yet.',
            errorCode: 'SCHEDULE_NOT_STARTED',
            retryable: true,
            details: {
              startAt: '2099-01-01T14:00:00Z',
              windowStartAt: '2099-01-01T14:00:00Z',
              windowEndAt: '2099-01-01T22:00:00Z',
            },
          },
          409,
        );
      }
      throw new Error(`Unexpected fetch ${path}`);
    });
    renderSessionPage('pre-day-token');
    expect(
      await screen.findByText(/Almost there — your Trial is scheduled/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Staff Engineer Trial|Infra Trial/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/5-day schedule preview/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unable to load trial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Project Brief/i)).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/current_task'),
      ),
    ).toBeUndefined();
  });

  it('loads trial through /api/backend proxy and then loads current task', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo | URL) => {
      if (String(url).endsWith('/candidate/session/valid-token')) {
        return jsonResponse(
          baseSession({
            scheduledStartAt: '2024-01-01T14:00:00Z',
            candidateTimezone: 'America/New_York',
            status: 'not_started',
            dayWindows: [
              {
                dayIndex: 1,
                windowStartAt: '2024-01-01T14:00:00Z',
                windowEndAt: '2024-01-01T22:00:00Z',
              },
            ],
            scheduleLockedAt: '2023-12-31T12:00:00Z',
            currentDayWindow: {
              dayIndex: 1,
              windowStartAt: '2024-01-01T14:00:00Z',
              windowEndAt: '2024-01-01T22:00:00Z',
              state: 'closed',
            },
          }),
        );
      }
      if (String(url).includes('/current_task')) {
        return jsonResponse({
          isComplete: false,
          completedTaskIds: [],
          currentTask: {
            id: 10,
            dayIndex: 1,
            type: 'design',
            title: 'Task One',
            description: 'Do it',
          },
        });
      }
      throw new Error(`Unexpected fetch ${String(url)}`);
    });
    const user = userEvent.setup();
    renderSessionPage('valid-token');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/backend/candidate/session/valid-token',
      expect.objectContaining({ method: 'GET' }),
    );
    await user.click(
      await screen.findByRole('button', { name: /Start trial/i }),
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/backend/candidate/session/321/current_task',
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-candidate-session-id': '321' }),
        }),
      ),
    );
    expect(
      await screen.findByRole('heading', {
        name: /Day 1 — Planning & Design Doc/i,
      }),
    ).toBeInTheDocument();
  });
});
