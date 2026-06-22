import { render, screen } from '@testing-library/react';
import { MarketingTopBar } from '@/features/marketing/components/MarketingTopBar';

describe('MarketingTopBar', () => {
  it('shows signed-out auth links and request access CTA', () => {
    render(<MarketingTopBar isAuthed={false} />);

    expect(
      screen.getByRole('link', { name: 'Talent Partner login' }),
    ).toHaveAttribute(
      'href',
      '/auth/start?returnTo=%2Fdashboard&mode=talent_partner',
    );
    expect(
      screen.getByRole('link', { name: 'Candidate portal' }),
    ).toHaveAttribute(
      'href',
      '/auth/start?returnTo=%2Fcandidate%2Fportal&mode=candidate',
    );
    expect(
      screen.getByRole('link', { name: 'Request access' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:support@winoe.ai'),
    );
    expect(
      screen.queryByRole('link', { name: 'Talent Partner login' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Logout' }),
    ).not.toBeInTheDocument();
  });

  it('shows signed-in app links without misleading login CTAs', () => {
    render(<MarketingTopBar isAuthed userName="Ada Lovelace" />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(
      screen.getByRole('link', { name: 'Candidate portal' }),
    ).toHaveAttribute('href', '/candidate/portal');
    expect(screen.getByRole('link', { name: 'Logout' })).toHaveAttribute(
      'href',
      '/auth/logout',
    );
    expect(
      screen.queryByRole('link', { name: 'Talent Partner login' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Request access' }),
    ).not.toBeInTheDocument();
  });
});
