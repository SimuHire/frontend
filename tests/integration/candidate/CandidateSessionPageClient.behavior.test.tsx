import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CandidateSessionPage from '@/features/candidate/session/CandidateSessionPage';
import { renderCandidateWithProviders } from '../../setup';
import { jsonResponse } from '../../setup/responseHelpers';

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

jest.mock('@auth0/nextjs-auth0/client', () => ({
  getAccessToken: jest.fn().mockResolvedValue('auth-token'),
  useUser: () => ({ user: { email: 'prefill@example.com' } }),
}));

const fetchMock = jest.fn();
const realFetch = global.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  Object.values(routerMock).forEach((fn) => fn.mockReset());
  sessionStorage.clear();
});

afterAll(() => {
  global.fetch = realFetch;
});

describe('CandidateSessionPage (auth flow)', () => {
  it('renders claim form with simulation details after bootstrap', async () => {
    fetchMock.mockImplementationOnce(async () =>
      jsonResponse({
        candidateSessionId: 321,
        status: 'in_progress',
        simulation: { title: 'Infra Simulation', role: 'Backend Engineer' },
      }),
    );

    renderCandidateWithProviders(<CandidateSessionPage token="valid-token" />);

    expect(await screen.findByText('Infra Simulation')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toHaveValue(
      'prefill@example.com',
    );
  });

  it('submits verify call with email and redirects to dashboard', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    fetchMock
      .mockImplementationOnce(async () =>
        jsonResponse({
          candidateSessionId: 321,
          status: 'in_progress',
          simulation: { title: 'Infra Simulation', role: 'Backend Engineer' },
        }),
      )
      .mockImplementationOnce(async (_input, init) => {
        const body = JSON.parse((init?.body as string) ?? '{}') as {
          email?: string;
        };
        return jsonResponse({
          candidateSessionId: 321,
          status: 'in_progress',
          simulation: { title: 'Infra Simulation', role: 'Backend Engineer' },
          receivedEmail: body.email,
        });
      });

    renderCandidateWithProviders(<CandidateSessionPage token="valid-token" />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/candidate/session/valid-token',
        expect.anything(),
      ),
    );

    await user.click(await screen.findByRole('button', { name: /continue/i }));

    await act(async () => {
      jest.runAllTimers();
    });

    const verifyCall = fetchMock.mock.calls[1];
    expect(verifyCall?.[0]).toContain('/candidate/session/valid-token/verify');
    expect(JSON.parse((verifyCall?.[1]?.body as string) ?? '{}')).toMatchObject(
      { email: 'prefill@example.com' },
    );
    expect(routerMock.push).toHaveBeenCalledWith('/candidate/dashboard');
  });
});
