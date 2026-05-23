import { render, screen } from '@testing-library/react';
import { CandidateSessionView } from '@/features/candidate/session/CandidateSessionView';
import { buildCandidateSessionViewProps } from './CandidateSessionView.windowGating.testProps';

describe('CandidateSessionView window gating', () => {
  it('renders closed-session copy and disables submit', () => {
    render(<CandidateSessionView {...buildCandidateSessionViewProps()} />);
    expect(screen.getByText(/Day 1 is closed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your saved Day 1 work stays locked in/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Come back at/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /submit & continue to day 2/i }),
    ).not.toBeInTheDocument();
  });
});
