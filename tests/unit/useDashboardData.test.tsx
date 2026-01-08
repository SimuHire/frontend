import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDashboardData } from '@/features/recruiter/dashboard/hooks/useDashboardData';
import { responseHelpers } from '../setup';
import type { SimulationListItem } from '@/types/recruiter';

jest.mock('@/lib/api/recruiter', () => {
  const actual = jest.requireActual('@/lib/api/recruiter');
  return { ...actual, listSimulations: jest.fn() };
});

const listSimulationsMock = jest.requireMock('@/lib/api/recruiter')
  .listSimulations as jest.Mock;

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function TestDashboard({ fetchOnMount = true }: { fetchOnMount?: boolean }) {
  const {
    profile,
    simulations,
    loadingProfile,
    loadingSimulations,
    profileError,
    simError,
    refresh,
  } = useDashboardData({ fetchOnMount });

  return (
    <div>
      <div data-testid="profile-loading">{String(loadingProfile)}</div>
      <div data-testid="sim-loading">{String(loadingSimulations)}</div>
      <div data-testid="profile-name">{profile?.name ?? ''}</div>
      <div data-testid="sim-count">{simulations.length}</div>
      <div data-testid="profile-error">{profileError ?? ''}</div>
      <div data-testid="sim-error">{simError ?? ''}</div>
      <button
        onClick={() => void refresh(false)}
        data-testid="refresh"
        type="button"
      >
        refresh
      </button>
    </div>
  );
}

describe('useDashboardData', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    listSimulationsMock.mockReset();
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('fetches profile and simulations and surfaces results', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      responseHelpers.jsonResponse({
        name: 'Recruiter',
        email: 'r@test.com',
        role: 'Hiring',
      }) as unknown as Response,
    );
    listSimulationsMock.mockResolvedValueOnce([
      { id: '1', title: 'Sim', role: 'Eng', createdAt: '2024-01-01' },
    ]);

    render(<TestDashboard />);

    expect(screen.getByTestId('profile-loading').textContent).toBe('true');
    expect(screen.getByTestId('sim-loading').textContent).toBe('true');

    await waitFor(() =>
      expect(screen.getByTestId('profile-name').textContent).toBe('Recruiter'),
    );

    expect(screen.getByTestId('sim-count').textContent).toBe('1');
    expect(screen.getByTestId('profile-loading').textContent).toBe('false');
    expect(screen.getByTestId('sim-loading').textContent).toBe('false');
    expect(screen.getByTestId('profile-error').textContent).toBe('');
    expect(screen.getByTestId('sim-error').textContent).toBe('');
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
    expect(listSimulationsMock).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent refresh calls and keeps previous data while reloading', async () => {
    const profileDeferred = deferred<Response>();
    const simsDeferred = deferred<SimulationListItem[]>();

    (global.fetch as jest.Mock).mockReturnValueOnce(
      profileDeferred.promise as unknown as Promise<Response>,
    );
    listSimulationsMock.mockReturnValueOnce(
      simsDeferred.promise as unknown as Promise<unknown>,
    );

    render(<TestDashboard fetchOnMount={false} />);

    const refreshButton = screen.getByTestId('refresh');
    fireEvent.click(refreshButton);
    fireEvent.click(refreshButton);

    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
    expect(listSimulationsMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('profile-loading').textContent).toBe('true');

    profileDeferred.resolve(
      responseHelpers.jsonResponse({
        name: 'R',
        email: 'r@test.com',
      }) as unknown as Response,
    );
    simsDeferred.resolve([
      { id: '1', title: 'Sim', role: 'Eng', createdAt: '2024-01-01' },
      { id: '2', title: 'Sim 2', role: 'Eng', createdAt: '2024-01-02' },
    ]);

    await waitFor(() =>
      expect(screen.getByTestId('sim-count').textContent).toBe('2'),
    );
    expect(screen.getByTestId('profile-loading').textContent).toBe('false');
    expect(screen.getByTestId('sim-loading').textContent).toBe('false');
  });
});
