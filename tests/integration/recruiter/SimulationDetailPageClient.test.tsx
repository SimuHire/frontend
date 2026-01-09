import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecruiterSimulationDetailPage from '@/features/recruiter/simulation-detail/RecruiterSimulationDetailPage';
import { jsonResponse } from '../../setup/responseHelpers';

const params = { id: 'sim-1' };

jest.mock('next/navigation', () => ({
  useParams: () => params,
}));

const fetchMock = jest.fn();
const realFetch = global.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  params.id = 'sim-1';
});

afterAll(() => {
  global.fetch = realFetch;
});

describe('RecruiterSimulationDetailPage', () => {
  it('renders candidate rows with status badges', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: '11',
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          inviteEmailStatus: 'rate_limited',
          verificationStatus: 'pending',
          progressSummary: { currentDay: '2', totalDays: '5' },
          startedAt: '2025-01-01T00:00:00Z',
          completedAt: null,
          hasReport: false,
        },
        {
          candidateSessionId: 22,
          inviteEmail: 'b@example.com',
          candidateName: 'Blake',
          status: 'completed',
          verificationStatus: 'awaiting_email',
          startedAt: '2025-01-02T00:00:00Z',
          completedAt: '2025-01-03T00:00:00Z',
          hasReport: true,
        },
      ]),
    );

    render(<RecruiterSimulationDetailPage />);

    expect(
      await screen.findByText(/Simulation ID: sim-1/i),
    ).toBeInTheDocument();
    expect(await screen.findByText('Alex')).toBeInTheDocument();
    expect(await screen.findByText('Blake')).toBeInTheDocument();
    expect(await screen.findByText(/In progress/i)).toBeInTheDocument();
    expect(await screen.findByText('Pending')).toBeInTheDocument();
    expect(await screen.findByText('Rate limited')).toBeInTheDocument();
    expect(await screen.findByText('awaiting email')).toBeInTheDocument();
    expect(await screen.findByText('2 / 5')).toBeInTheDocument();
    const completed = await screen.findAllByText(/Completed/i);
    expect(completed.length).toBeGreaterThanOrEqual(2);
  });

  it('creates an invite and refreshes the list', async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        candidateSessionId: '99',
        token: 'invite-token',
        inviteUrl: 'https://example.com/candidate/session/invite-token',
      }),
    );
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 99,
          inviteEmail: 'new@example.com',
          candidateName: 'New Person',
          status: 'not_started',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    render(<RecruiterSimulationDetailPage />);

    await screen.findByText(/No candidates yet/i);
    await user.click(screen.getByRole('button', { name: /Invite candidate/i }));

    await user.type(screen.getByLabelText(/Candidate name/i), 'New Person');
    await user.type(
      screen.getByLabelText(/Candidate email/i),
      'new@example.com',
    );

    await user.click(screen.getByRole('button', { name: /Create invite/i }));

    expect(await screen.findByText(/Invite created for/i)).toBeInTheDocument();

    expect(await screen.findByText('New Person')).toBeInTheDocument();
  });

  it('shows invite errors for 409, 422, and 429 responses', async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Already invited' }, 409),
    );

    render(<RecruiterSimulationDetailPage />);

    await user.click(screen.getByRole('button', { name: /Invite candidate/i }));
    await user.type(screen.getByLabelText(/Candidate name/i), 'Alex');
    await user.type(
      screen.getByLabelText(/Candidate email/i),
      'alex@example.com',
    );
    await user.click(screen.getByRole('button', { name: /Create invite/i }));

    expect(await screen.findByText(/already invited/i)).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Invalid email' }, 422),
    );
    await user.click(screen.getByRole('button', { name: /Create invite/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Rate limited' }, 429),
    );
    await user.click(screen.getByRole('button', { name: /Create invite/i }));

    expect(await screen.findByText(/too many invites/i)).toBeInTheDocument();
  });

  it('resends invites and handles rate limits with cooldown', async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 11,
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          inviteEmailStatus: 'sent',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ inviteEmailStatus: 'sent' }),
    );

    render(<RecruiterSimulationDetailPage />);

    const resendButton = await screen.findByRole('button', {
      name: /Resend invite/i,
    });
    await user.click(resendButton);
    await user.click(resendButton);

    expect(await screen.findByText(/Invite resent/i)).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ inviteEmailStatus: 'rate_limited' }, 429, {
        'retry-after': '12',
      }),
    );

    await user.click(
      await screen.findByRole('button', { name: /Resend invite/i }),
    );

    expect(await screen.findByText(/Retry in 12s/i)).toBeInTheDocument();
  });

  it('ignores non-numeric retry-after headers safely', async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 11,
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          inviteEmailStatus: 'sent',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ inviteEmailStatus: 'rate_limited' }, 429, {
        'retry-after': 'Wed, 21 Oct 2025 07:28:00 GMT',
      }),
    );

    render(<RecruiterSimulationDetailPage />);

    await user.click(
      await screen.findByRole('button', { name: /Resend invite/i }),
    );

    expect(await screen.findByText(/Retry in 30s/i)).toBeInTheDocument();
  });

  it('avoids creating duplicate cooldown timers', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const intervalSpy = jest.spyOn(window, 'setInterval');

    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 11,
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          inviteEmailStatus: 'sent',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ inviteEmailStatus: 'rate_limited' }, 429),
    );

    render(<RecruiterSimulationDetailPage />);

    await user.click(
      await screen.findByRole('button', { name: /Resend invite/i }),
    );

    await screen.findByText(/Retry in 30s/i);

    expect(intervalSpy).toHaveBeenCalledTimes(1);

    intervalSpy.mockRestore();
    jest.useRealTimers();
  });

  it('copies invite links and shows manual fallback when clipboard fails', async () => {
    const user = userEvent.setup();

    const clipboardWrite = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    });

    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 11,
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          inviteUrl: 'https://example.com/invite',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    render(<RecruiterSimulationDetailPage />);

    await user.click(
      await screen.findByRole('button', { name: /Copy invite link/i }),
    );

    expect(clipboardWrite).toHaveBeenCalled();
    const copiedMessages = await screen.findAllByText(/Invite link copied/i);
    expect(copiedMessages.length).toBeGreaterThan(0);

    clipboardWrite.mockRejectedValueOnce(new Error('nope'));
    await user.click(
      screen.getByRole('button', { name: /Copied|Copy invite link/i }),
    );

    expect(
      await screen.findByLabelText(/Manual invite link/i),
    ).toBeInTheDocument();
  });

  it('renders safe defaults when optional fields are missing', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          candidateSessionId: 11,
          inviteEmail: 'a@example.com',
          candidateName: 'Alex',
          status: 'in_progress',
          startedAt: null,
          completedAt: null,
          hasReport: false,
        },
      ]),
    );

    render(<RecruiterSimulationDetailPage />);

    expect(await screen.findByText('Not verified')).toBeInTheDocument();
    const dashes = await screen.findAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no candidates', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    params.id = 'sim-empty';

    render(<RecruiterSimulationDetailPage />);

    expect(await screen.findByText(/No candidates yet/i)).toBeInTheDocument();
  });

  it('renders error message when the backend call fails', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Auth failed' }, 500),
    );
    params.id = 'sim-err';

    render(<RecruiterSimulationDetailPage />);

    expect(await screen.findByText(/Auth failed/i)).toBeInTheDocument();
  });
});
