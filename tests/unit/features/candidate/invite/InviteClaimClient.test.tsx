import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InviteClaimClient } from '@/features/candidate/invite/InviteClaimClient';
import { fetchInvitePublicSummary } from '@/features/candidate/invite/invitePublicApi';
import { claimCandidateInvite } from '@/features/candidate/session/api/invitesApi';
import {
  INVITE_ALREADY_CLAIMED_MESSAGE,
  INVITE_INVALID_MESSAGE,
} from '@/platform/copy/invite';
import { HttpError } from '@/platform/api-client/errors/errors';

jest.mock('@/features/candidate/invite/invitePublicApi', () => ({
  fetchInvitePublicSummary: jest.fn(),
}));

jest.mock('@/features/candidate/session/api/invitesApi', () => ({
  claimCandidateInvite: jest.fn(),
}));

jest.mock('@/features/auth/authPaths', () => ({
  buildLoginHref: jest.fn(
    (returnTo: string) =>
      `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
  ),
}));

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: jest.fn() }),
}));

const fetchInvitePublicSummaryMock = fetchInvitePublicSummary as jest.Mock;
const claimCandidateInviteMock = claimCandidateInvite as jest.Mock;

function renderInvite(props: { token: string; signedInEmail: string | null }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <InviteClaimClient {...props} />
    </QueryClientProvider>,
  );
}

describe('InviteClaimClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    fetchInvitePublicSummaryMock.mockResolvedValue({
      state: 'ready',
      role: 'Engineer',
      company: 'Acme',
      talentPartnerName: 'Alex',
    });
  });

  it('renders setup form for signed-out valid invite', async () => {
    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/preferred display name/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue/i }),
    ).toBeInTheDocument();
  });

  it('saves pending claim and routes to login when signed out submits', async () => {
    const assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, href: '', assign: assignMock },
    });

    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    fireEvent.change(await screen.findByLabelText(/full name/i), {
      target: { value: 'Jane Candidate' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() =>
      expect(
        sessionStorage.getItem(
          'winoe:invite_pending_claim:invite-token-abc1234567890',
        ),
      ).toContain('Jane Candidate'),
    );
    expect(window.location.href).toContain('/api/auth/login');
  });

  it('auto-claims pending payload after sign-in return', async () => {
    sessionStorage.setItem(
      'winoe:invite_pending_claim:invite-token-abc1234567890',
      JSON.stringify({
        fullName: 'Jane Candidate',
        preferredDisplayName: 'Jane',
        candidateTimezone: 'America/New_York',
      }),
    );
    claimCandidateInviteMock.mockResolvedValue({
      candidateSessionId: 1,
      trial: { id: 1 },
    });

    renderInvite({
      token: 'invite-token-abc1234567890',
      signedInEmail: 'jane@example.com',
    });

    await waitFor(() => expect(claimCandidateInviteMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith('/candidate/portal'),
    );
    expect(
      sessionStorage.getItem(
        'winoe:invite_pending_claim:invite-token-abc1234567890',
      ),
    ).toBeNull();
  });

  it('shows distinct copy for expired invite', async () => {
    fetchInvitePublicSummaryMock.mockRejectedValue(
      Object.assign(new HttpError(410, 'expired'), {
        details: { talentPartnerName: 'Alex' },
      }),
    );
    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    expect(await screen.findByText(/invite expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex/)).toBeInTheDocument();
  });

  it('shows expired copy when API returns a plain 410 error object', async () => {
    fetchInvitePublicSummaryMock.mockRejectedValue({
      message: 'Invite token expired',
      status: 410,
      details: { details: { talentPartnerName: 'Alex' } },
    });
    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    expect(await screen.findByText(/invite expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex/)).toBeInTheDocument();
  });

  it('shows distinct copy for claimed invite with sign-in CTA', async () => {
    fetchInvitePublicSummaryMock.mockRejectedValue(
      new HttpError(409, 'claimed'),
    );
    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    expect(
      await screen.findByText(INVITE_ALREADY_CLAIMED_MESSAGE),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in to continue/i }),
    ).toBeInTheDocument();
  });

  it('shows invalid invite copy', async () => {
    fetchInvitePublicSummaryMock.mockRejectedValue(
      new HttpError(404, 'missing'),
    );
    renderInvite({ token: 'invite-token-abc1234567890', signedInEmail: null });
    expect(await screen.findByText(INVITE_INVALID_MESSAGE)).toBeInTheDocument();
  });
});
