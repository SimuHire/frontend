import { render, screen } from '@testing-library/react';
import { AppNav } from '@/shared/layout/AppNav';
import { MarketingHomeSignedIn } from '@/features/marketing/home/MarketingHomeSignedIn';

describe('auth navigation links', () => {
  it('renders logout as an anchor in the app nav', () => {
    render(<AppNav isAuthed permissions={['talent_partner:access']} />);
    const logout = screen.getByText('Logout');
    expect(logout.tagName).toBe('A');
    expect(logout).toHaveAttribute('href', '/auth/logout');
  });

  it('uses public returnTo for candidate logout', () => {
    render(
      <AppNav
        isAuthed
        navScope="candidate"
        permissions={['candidate:access']}
      />,
    );
    const logout = screen.getByText('Logout');
    expect(logout).toHaveAttribute('href', '/auth/logout');
  });

  it('renders greeting in the marketing signed-in view', () => {
    render(<MarketingHomeSignedIn name="Tester" />);
    expect(screen.getByText('Welcome back, Tester.')).toBeInTheDocument();
  });
});
