import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CandidateSessionPage from '@/features/candidate/session/CandidateSessionPage';
import { CandidateSessionProvider } from '@/features/candidate/session/CandidateSessionProvider';
import {
  HttpError,
  getCandidateCurrentTask,
  resolveCandidateInviteToken,
  verifyCandidateSessionEmail,
} from '@/lib/api/candidate';

jest.mock('@/lib/api/candidate', () => {
  const actual = jest.requireActual('@/lib/api/candidate');
  return {
    __esModule: true,
    ...actual,
    resolveCandidateInviteToken: jest.fn(),
    getCandidateCurrentTask: jest.fn(),
    verifyCandidateSessionEmail: jest.fn(),
  };
});

jest.mock('@auth0/nextjs-auth0/client', () => ({
  getAccessToken: jest.fn(),
  useUser: () => ({ user: { email: 'user@example.com' } }),
}));

const routerMock = {
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}));

const resolveMock = resolveCandidateInviteToken as unknown as jest.Mock;
const currentTaskMock = getCandidateCurrentTask as unknown as jest.Mock;
const verifyMock = verifyCandidateSessionEmail as unknown as jest.Mock;
const getAccessTokenMock = jest.requireMock('@auth0/nextjs-auth0/client')
  .getAccessToken as jest.Mock;

function renderWithProvider(ui: React.ReactNode) {
  return render(<CandidateSessionProvider>{ui}</CandidateSessionProvider>);
}

async function completeVerification(email = 'user@example.com') {
  const emailField = await screen.findByLabelText(/Email address/i);
  fireEvent.change(emailField, { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  await waitFor(() => expect(verifyMock).toHaveBeenCalled());
}

describe('CandidateSessionPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.values(routerMock).forEach((fn) => fn.mockReset());
    sessionStorage.clear();
    getAccessTokenMock.mockResolvedValue('auth-token');
    verifyMock.mockResolvedValue({
      candidateSessionId: 123,
      status: 'in_progress',
      simulation: { title: 'Sim', role: 'Backend' },
    });
  });

  it('loads bootstrap, verifies email, and starts current task', async () => {
    resolveMock.mockResolvedValue({
      candidateSessionId: 123,
      status: 'in_progress',
      simulation: { title: 'Backend Engineer Simulation', role: 'Backend' },
    });
    currentTaskMock.mockResolvedValue({
      isComplete: false,
      completedTaskIds: [],
      currentTask: {
        id: 1,
        dayIndex: 1,
        type: 'design',
        title: 'Day 1 — Architecture',
        description: 'Plan it',
      },
    });

    renderWithProvider(<CandidateSessionPage token="VALID_TOKEN" />);

    expect(
      await screen.findByText('Backend Engineer Simulation'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Role:\s*Backend/i)).toBeInTheDocument();

    await completeVerification();
    fireEvent.click(
      await screen.findByRole('button', { name: /start simulation/i }),
    );

    expect(await screen.findByText('Day 1 — Architecture')).toBeInTheDocument();
    expect(currentTaskMock).toHaveBeenCalledWith(123, 'auth-token');
  });

  it('shows verify form when bootstrap needs verification', async () => {
    resolveMock.mockRejectedValue(new HttpError(401, 'verify'));

    renderWithProvider(<CandidateSessionPage token="VALID_TOKEN" />);

    expect(await screen.findByLabelText(/Email address/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /start simulation/i }),
    ).not.toBeInTheDocument();
  });

  it('renders verify error when backend rejects email', async () => {
    resolveMock.mockResolvedValue({
      candidateSessionId: 123,
      status: 'in_progress',
      simulation: { title: 'Sim', role: 'Backend' },
    });
    verifyMock.mockRejectedValue(new HttpError(403, 'No match'));

    renderWithProvider(<CandidateSessionPage token="VALID_TOKEN" />);
    await completeVerification('wrong@example.com');

    expect(
      await screen.findByText(/does not match this invite/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /start simulation/i }),
    ).not.toBeInTheDocument();
  });

  it('shows auth session error when access token load fails', async () => {
    getAccessTokenMock.mockRejectedValueOnce(new Error('No session'));
    resolveMock.mockResolvedValue({
      candidateSessionId: 123,
      status: 'in_progress',
      simulation: { title: 'Sim', role: 'Backend' },
    });

    renderWithProvider(<CandidateSessionPage token="VALID_TOKEN" />);

    expect(
      await screen.findByText(/Unable to load your login session/i),
    ).toBeInTheDocument();
  });
});
