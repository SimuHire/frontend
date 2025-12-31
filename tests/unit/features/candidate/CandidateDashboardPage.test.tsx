import { fireEvent, render, screen } from '@testing-library/react';
import CandidateDashboardPage from '@/features/candidate/dashboard/CandidateDashboardPage';
import { CandidateSessionProvider } from '@/features/candidate/session/CandidateSessionProvider';

jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: { email: 'dash@example.com' } }),
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

function renderPage() {
  return render(
    <CandidateSessionProvider>
      <CandidateDashboardPage />
    </CandidateSessionProvider>,
  );
}

describe('CandidateDashboardPage', () => {
  beforeEach(() => {
    Object.values(routerMock).forEach((fn) => fn.mockReset());
  });

  it('shows signed-in email and invite input', () => {
    renderPage();

    expect(
      screen.getByText(/Signed in as dash@example.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Paste invite link or token/i),
    ).toBeInTheDocument();
  });

  it('navigates to token when continuing invite', () => {
    renderPage();

    const input = screen.getByLabelText(/Paste invite link or token/i);
    fireEvent.change(input, {
      target: { value: 'https://app.test/candidate-sessions/INV123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue invite/i }));

    expect(routerMock.push).toHaveBeenCalledWith('/candidate-sessions/INV123');
  });
});
