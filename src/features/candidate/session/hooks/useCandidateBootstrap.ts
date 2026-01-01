import { useCallback, useRef, useState } from 'react';
import {
  resolveCandidateInviteToken,
  type CandidateSessionBootstrapResponse,
} from '@/lib/api/candidate';
import { friendlyBootstrapError } from '../utils/errorMessages';

type BootstrapState = 'idle' | 'loading' | 'ready' | 'error';

type Params = {
  inviteToken: string | null;
  authToken: string | null;
  onResolved: (data: CandidateSessionBootstrapResponse) => void;
  onSetInviteToken?: (token: string) => void;
};

export function useCandidateBootstrap({
  inviteToken,
  authToken,
  onResolved,
  onSetInviteToken,
}: Params) {
  const [state, setState] = useState<BootstrapState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const inFlightRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!authToken) {
      return;
    }

    if (!inviteToken) {
      setState('error');
      setErrorMessage('Missing invite token.');
      setErrorStatus(null);
      return;
    }

    if (inFlightRef.current && lastTokenRef.current === inviteToken) return;

    inFlightRef.current = true;
    lastTokenRef.current = inviteToken;
    setState('loading');
    setErrorMessage(null);
    setErrorStatus(null);

    try {
      if (onSetInviteToken) onSetInviteToken(inviteToken);
      const data = await resolveCandidateInviteToken(inviteToken, authToken);
      onResolved(data);
      setState('ready');
    } catch (err) {
      setErrorMessage(friendlyBootstrapError(err));
      const status =
        typeof (err as { status?: unknown })?.status === 'number'
          ? ((err as { status: number }).status ?? null)
          : null;
      setErrorStatus(status);
      setState('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [authToken, inviteToken, onResolved, onSetInviteToken]);

  return { state, errorMessage, errorStatus, load };
}
