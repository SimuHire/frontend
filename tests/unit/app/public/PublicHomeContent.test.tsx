import { render, screen } from '@testing-library/react';
import MarketingHomePage from '@/features/marketing/home/MarketingHomePage';

describe('PublicHomeContent', () => {
  it('shows signed-in welcome band and landing content without request access CTA', () => {
    render(<MarketingHomePage user={{ name: 'Ada Lovelace' }} />);

    expect(screen.getByText('Welcome back, Ada Lovelace.')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Go to dashboard' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Reveal the real hire. Prove it with work.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Request access' }),
    ).not.toBeInTheDocument();
  });

  it('shows signed-out landing page content', () => {
    render(<MarketingHomePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Reveal the real hire. Prove it with work.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Request access' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:support@winoe.ai'),
    );
  });

  it('handles user without a name gracefully', () => {
    render(<MarketingHomePage user={{ name: null }} />);

    expect(screen.getByText('Welcome back.')).toBeInTheDocument();
  });
});
