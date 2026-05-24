import { render, screen } from '@testing-library/react';
import { WorkspacePanelBody } from '@/features/candidate/tasks/components/WorkspacePanelBody';
import { WorkspacePanelHeader } from '@/features/candidate/tasks/components/WorkspacePanelHeader';

const workspace = {
  repoName: 'demo-repo',
  repoFullName: 'winoe/demo-repo',
  codespaceUrl: 'https://codespaces.new/winoe/demo-repo',
  codespaceState: 'available',
};

describe('WorkspacePanel copy', () => {
  it('shows the Day 2 from-scratch Codespace guidance', () => {
    const { container } = render(
      <WorkspacePanelHeader
        dayIndex={2}
        loading={false}
        refreshing={false}
        readOnly={false}
        onRefresh={jest.fn()}
      />,
    );
    render(
      <WorkspacePanelBody
        dayIndex={2}
        workspace={workspace}
        loading={false}
        error={null}
        notice={null}
        refreshing={false}
        onRefresh={jest.fn()}
        message="Codespace ready"
        readOnly={false}
        readOnlyReason={null}
      />,
    );

    expect(
      screen.getByText(/Day 2 — Implementation Kickoff/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Build from scratch in your Codespace\. AI tools welcome\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/What's in your Codespace/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /No starter code\. You build the application from scratch\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Open Codespace/i }),
    ).toHaveAttribute('href', 'https://codespaces.new/winoe/demo-repo');
    expect(screen.getByText('available')).toBeInTheDocument();
    expect(container.textContent ?? '').not.toMatch(
      /Tenon|recruiter|simulation|fit profile|fit score|clone locally|offline work|local clone/i,
    );
  });

  it('shows the Day 3 same-workspace wrap-up guidance', () => {
    render(
      <WorkspacePanelHeader
        dayIndex={3}
        loading={false}
        refreshing={false}
        readOnly={false}
        onRefresh={jest.fn()}
      />,
    );
    render(
      <WorkspacePanelBody
        dayIndex={3}
        workspace={workspace}
        loading={false}
        error={null}
        notice={null}
        refreshing={false}
        onRefresh={jest.fn()}
        message="Codespace ready"
        readOnly={false}
        readOnlyReason={null}
      />,
    );

    expect(
      screen.getByText(/Day 3 — Implementation Wrap-Up/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Continue in the same Codespace\. Polish and finalize\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Today's focus/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Refactor for clarity, not cleverness\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Repo: winoe\/demo-repo/i)).toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toMatch(
      /Tenon|recruiter|simulation|fit profile|fit score|clone locally|offline work|local clone/i,
    );
  });
});
