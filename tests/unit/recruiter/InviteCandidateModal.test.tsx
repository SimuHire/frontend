import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteCandidateModal } from '@/features/recruiter/invitations/InviteCandidateModal';
import { listSimulationCandidates } from '@/lib/api/recruiter';

jest.mock('@/lib/api/recruiter', () => ({
  listSimulationCandidates: jest.fn(),
}));

const mockedListSimulationCandidates =
  listSimulationCandidates as jest.MockedFunction<
    typeof listSimulationCandidates
  >;

describe('InviteCandidateModal', () => {
  beforeEach(() => {
    mockedListSimulationCandidates.mockReset();
  });

  it('passes string values to submit handler', () => {
    const onSubmit = jest.fn();
    render(
      <InviteCandidateModal
        open
        title="Test Simulation"
        state={{ status: 'idle' }}
        onClose={() => undefined}
        onSubmit={onSubmit}
        onResend={() => undefined}
        initialName=""
        initialEmail=""
      />,
    );

    fireEvent.change(screen.getByLabelText(/Candidate name/i), {
      target: { value: '  Jane Doe  ' },
    });
    fireEvent.change(screen.getByLabelText(/Candidate email/i), {
      target: { value: '  JANE@EXAMPLE.COM  ' },
    });

    fireEvent.click(screen.getByText('Create invite'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [name, email] = onSubmit.mock.calls[0] as [unknown, unknown];
    expect(typeof name).toBe('string');
    expect(typeof email).toBe('string');
    expect(name).toBe('  Jane Doe  ');
    expect(email).toBe('  JANE@EXAMPLE.COM  ');
  });

  it('coerces numeric simulationId when loading invites', async () => {
    mockedListSimulationCandidates.mockResolvedValueOnce([]);
    render(
      <InviteCandidateModal
        open
        title="Test Simulation"
        simulationId={123}
        state={{ status: 'idle' }}
        onClose={() => undefined}
        onSubmit={() => undefined}
        onResend={() => undefined}
        initialName=""
        initialEmail=""
      />,
    );

    await waitFor(() => {
      expect(mockedListSimulationCandidates).toHaveBeenCalledWith('123');
    });
  });

  it('keeps loading cleared when typing after candidates load', async () => {
    const user = userEvent.setup();
    let resolveCandidates: (value: unknown) => void = () => undefined;
    const pending = new Promise((resolve) => {
      resolveCandidates = resolve;
    });

    mockedListSimulationCandidates
      .mockReturnValueOnce(
        pending as Promise<
          Awaited<ReturnType<typeof listSimulationCandidates>>
        >,
      )
      .mockReturnValueOnce(Promise.resolve([]));

    render(
      <StrictMode>
        <InviteCandidateModal
          open
          title="Test Simulation"
          simulationId="sim-1"
          state={{ status: 'idle' }}
          onClose={() => undefined}
          onSubmit={() => undefined}
          onResend={() => undefined}
          initialName=""
          initialEmail=""
        />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(mockedListSimulationCandidates).toHaveBeenCalled();
    });

    resolveCandidates([]);
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading existing invites/i),
      ).not.toBeInTheDocument();
    });
    const callsBeforeTyping = mockedListSimulationCandidates.mock.calls.length;

    await user.type(screen.getByLabelText(/Candidate name/i), 'Jane Doe');
    await user.type(
      screen.getByLabelText(/Candidate email/i),
      'jane@example.com',
    );

    expect(
      screen.queryByText(/Loading existing invites/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create invite/i }),
    ).not.toBeDisabled();
    expect(mockedListSimulationCandidates).toHaveBeenCalledTimes(
      callsBeforeTyping,
    );
  });
});
