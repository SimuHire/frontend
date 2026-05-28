import { fireEvent, render, screen } from '@testing-library/react';
import EdgeStatesClient from '@/app/qa/edge-states/EdgeStatesClient';
import QaEdgeStatesPage from '@/app/qa/edge-states/page';
import { qaEdgeStatesEnabled } from '@/app/qa/edge-states/qaEdgeStatesGate';
import { NotificationsProvider } from '@/shared/notifications';

const mockGet = jest.fn();
const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useSearchParams: () => ({ get: mockGet }),
}));

describe('QA edge states', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalQaFlag = process.env.NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES;

  const setNodeEnv = (value: string) =>
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      configurable: true,
    });

  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockReturnValue(null);
    mockNotFound.mockReset();
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    delete process.env.NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES;
    setNodeEnv(originalNodeEnv);
  });

  afterAll(() => {
    setNodeEnv(originalNodeEnv);
    if (originalQaFlag === undefined) {
      delete process.env.NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES;
    } else {
      process.env.NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES = originalQaFlag;
    }
  });

  it('enables the route gate in local and test environments', () => {
    expect(qaEdgeStatesEnabled({ NODE_ENV: 'development' })).toBe(true);
    expect(qaEdgeStatesEnabled({ NODE_ENV: 'test' })).toBe(true);
    expect(qaEdgeStatesEnabled()).toBe(true);
  });

  it('returns not-found behavior in production', () => {
    setNodeEnv('production');

    expect(() => QaEdgeStatesPage()).toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it('keeps production closed when the public QA flag is set', () => {
    expect(
      qaEdgeStatesEnabled({
        NODE_ENV: 'production',
        NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES: '1',
        VERCEL_ENV: 'preview',
      }),
    ).toBe(false);

    expect(
      qaEdgeStatesEnabled({
        NODE_ENV: 'production',
        NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES: '1',
        VERCEL_ENV: 'production',
      }),
    ).toBe(false);
  });

  it('triggers success, error, and warning toasts through the real provider', () => {
    render(
      <NotificationsProvider>
        <EdgeStatesClient />
      </NotificationsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Success toast' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error toast' }));
    fireEvent.click(screen.getByRole('button', { name: 'Warning toast' }));

    expect(screen.getByText('Invite link copied')).toBeInTheDocument();
    expect(screen.getByText('Unable to send invite')).toBeInTheDocument();
    expect(screen.getByText('Report still calibrating')).toBeInTheDocument();
  });

  it('renders the branded 500 state when requested', () => {
    mockGet.mockReturnValue('500');

    render(
      <NotificationsProvider>
        <EdgeStatesClient />
      </NotificationsProvider>,
    );

    expect(
      screen.getByText('Something went wrong on our end.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We've been notified. Try again in a moment./i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByText('Service status: recovering')).toBeInTheDocument();
  });
});
