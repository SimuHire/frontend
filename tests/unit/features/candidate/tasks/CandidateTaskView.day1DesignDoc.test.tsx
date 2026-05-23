import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import {
  baseTask,
  primeDraftMocks,
  putCandidateTaskDraftMock,
  renderTaskView,
} from './CandidateTaskView.testlib';

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: jest.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe('CandidateTaskView Day 1 design document workspace', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    primeDraftMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const settleInitialRestore = async () => {
    await act(async () => {
      jest.advanceTimersByTime(0);
      await Promise.resolve();
    });
  };

  it('shows Project Brief sections and markdown editor', async () => {
    renderTaskView({
      task: {
        ...baseTask,
        description:
          '# Context\n\nTrial context.\n\n## Problem\n\nSolve intake.\n\n## Users\n\nHiring teams.',
        cutoffAt: new Date(Date.now() + 60_000).toISOString(),
      },
    });

    await waitFor(() =>
      expect(screen.getAllByText(/Project Brief/i).length).toBeGreaterThan(0),
    );
    expect(screen.getByText(/^Context$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Problem$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /markdown editor/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit & continue/i }),
    ).toBeInTheDocument();
  });

  it('shows unavailable state when Project Brief is missing', async () => {
    renderTaskView({
      task: {
        ...baseTask,
        description: ' ',
      },
    });

    await waitFor(() =>
      expect(
        screen.getByText(/Project Brief is unavailable/i),
      ).toBeInTheDocument(),
    );
  });

  it('requires confirmation before Day 1 submission', async () => {
    const onSubmit = jest.fn().mockResolvedValue({
      submissionId: 1,
      taskId: 1,
      candidateSessionId: 22,
      submittedAt: '2026-03-07T12:00:00.000Z',
      progress: { completed: 1, total: 5 },
      isComplete: false,
    });
    renderTaskView({ onSubmit });
    await settleInitialRestore();
    fireEvent.change(
      screen.getByRole('textbox', { name: /markdown editor/i }),
      {
        target: { value: 'Final Day 1 design document' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: /submit & continue/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: /submit day 1/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/empty Codespace will be ready in 60 seconds/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit day 1/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        contentText: 'Final Day 1 design document',
      }),
    );
  });

  it('autosaves after 8 seconds for Day 1', async () => {
    renderTaskView();
    await settleInitialRestore();
    fireEvent.change(
      screen.getByRole('textbox', { name: /markdown editor/i }),
      {
        target: { value: 'Autosave me' },
      },
    );
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });
    await waitFor(() => expect(putCandidateTaskDraftMock).toHaveBeenCalled());
  });

  it('shows persistent save warning after repeated autosave failures', async () => {
    putCandidateTaskDraftMock.mockRejectedValue(new Error('network down'));
    renderTaskView();
    await settleInitialRestore();
    fireEvent.change(
      screen.getByRole('textbox', { name: /markdown editor/i }),
      {
        target: { value: 'Draft with failures' },
      },
    );
    await act(async () => {
      await jest.advanceTimersByTimeAsync(8000);
      await jest.advanceTimersByTimeAsync(30000);
    });
    await waitFor(() =>
      expect(screen.getAllByText(/check connection/i).length).toBeGreaterThan(
        0,
      ),
    );
    expect(
      screen.getByRole('textbox', { name: /markdown editor/i }),
    ).toHaveValue('Draft with failures');
  });
});
