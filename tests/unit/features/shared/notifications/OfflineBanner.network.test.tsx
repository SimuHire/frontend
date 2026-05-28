import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { NotificationsProvider } from '@/shared/notifications';

const OFFLINE_COPY =
  "You're offline. Your work is being saved locally and will sync when you reconnect.";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => value,
  });
}

describe('OfflineBanner network state', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('renders while offline and shows a success toast after reconnect', async () => {
    setOnline(true);
    render(
      <NotificationsProvider>
        <div>Candidate workspace shell</div>
      </NotificationsProvider>,
    );

    expect(screen.queryByText(OFFLINE_COPY)).not.toBeInTheDocument();

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(await screen.findByText(OFFLINE_COPY)).toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() =>
      expect(screen.queryByText(OFFLINE_COPY)).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Back online')).toBeInTheDocument();
    expect(
      screen.getByText('Your saved work can sync now.'),
    ).toBeInTheDocument();
  });
});
