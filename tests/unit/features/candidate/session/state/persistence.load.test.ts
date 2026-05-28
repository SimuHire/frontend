import { loadPersistedState } from '@/features/candidate/session/state/persistence.load';
import { STORAGE_KEY } from '@/features/candidate/session/state/state';

describe('loadPersistedState', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, '', '/candidate/session/pre-day-token');
  });

  it('ignores persisted task data while a scheduled session is still locked', () => {
    const dispatch = jest.fn();
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inviteToken: 'pre-day-token',
        candidateSessionId: 75,
        bootstrap: {
          candidateSessionId: 75,
          status: 'in_progress',
          trial: { title: 'Staff Engineer Trial', role: 'Staff Engineer' },
          scheduledStartAt: '2099-01-01T14:00:00Z',
          candidateTimezone: 'America/New_York',
          dayWindows: [
            {
              dayIndex: 1,
              windowStartAt: '2099-01-01T14:00:00Z',
              windowEndAt: '2099-01-01T22:00:00Z',
            },
          ],
          currentDayWindow: {
            dayIndex: 1,
            windowStartAt: '2099-01-01T14:00:00Z',
            windowEndAt: '2099-01-01T22:00:00Z',
            state: 'upcoming',
          },
        },
        started: true,
        taskState: {
          isComplete: false,
          completedAt: null,
          completedTaskIds: [],
          currentTask: {
            id: 999001,
            dayIndex: 1,
            title: 'Stale task',
            type: 'design',
            description: 'Do not restore before start',
          },
        },
      }),
    );

    loadPersistedState(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INVITE_TOKEN',
      inviteToken: 'pre-day-token',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_CANDIDATE_SESSION_ID',
      candidateSessionId: 75,
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_BOOTSTRAP' }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_STARTED',
      started: true,
    });
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TASK_LOADED' }),
    );
  });
});
