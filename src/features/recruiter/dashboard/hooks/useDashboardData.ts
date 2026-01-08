import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildLoginUrl,
  buildNotAuthorizedUrl,
  buildReturnTo,
} from '@/lib/auth/routing';
import { listSimulations } from '@/lib/api/recruiter';
import { toUserMessage } from '@/lib/utils/errors';
import type { RecruiterProfile, SimulationListItem } from '@/types/recruiter';

type Options = {
  initialProfile?: RecruiterProfile | null;
  initialProfileError?: string | null;
  fetchOnMount?: boolean;
};

type Inflight = {
  profile?: Promise<RecruiterProfile | null>;
  simulations?: Promise<SimulationListItem[]>;
};

type Controllers = {
  profile?: AbortController;
  simulations?: AbortController;
};

function isAbortError(err: unknown) {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err &&
      typeof err === 'object' &&
      (err as { name?: unknown }).name === 'AbortError')
  );
}

export function useDashboardData(options?: Options) {
  const [profile, setProfile] = useState<RecruiterProfile | null>(
    options?.initialProfile ?? null,
  );
  const [profileError, setProfileError] = useState<string | null>(
    options?.initialProfileError ?? null,
  );
  const [simulations, setSimulations] = useState<SimulationListItem[]>([]);
  const [simError, setSimError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(
    options?.fetchOnMount !== false,
  );
  const [loadingSimulations, setLoadingSimulations] = useState(
    options?.fetchOnMount !== false,
  );

  const inflightRef = useRef<Inflight>({});
  const controllersRef = useRef<Controllers>({});
  const requestIdRef = useRef(0);

  const fetchProfile = useCallback((force = false) => {
    if (!force && inflightRef.current.profile) {
      return inflightRef.current.profile;
    }

    controllersRef.current.profile?.abort();
    const controller = new AbortController();
    controllersRef.current.profile = controller;

    const promise = (async () => {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
        signal: controller.signal,
      });
      const parsed: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const status = res.status;
        if (
          typeof window !== 'undefined' &&
          (status === 401 || status === 403)
        ) {
          const returnTo = buildReturnTo();
          const mode = 'recruiter';
          const destination =
            status === 401
              ? buildLoginUrl(mode, returnTo)
              : buildNotAuthorizedUrl(mode, returnTo);
          window.location.assign(destination);
        }
        const error = new Error(
          toUserMessage(parsed, 'Unable to load your profile right now.', {
            includeDetail: true,
          }),
        ) as Error & { status?: number };
        error.status = status;
        throw error;
      }

      return parsed as RecruiterProfile;
    })().finally(() => {
      if (inflightRef.current.profile === promise) {
        inflightRef.current.profile = undefined;
      }
    });

    inflightRef.current.profile = promise;
    return promise;
  }, []);

  const fetchSimulations = useCallback((force = false) => {
    if (!force && inflightRef.current.simulations) {
      return inflightRef.current.simulations;
    }

    controllersRef.current.simulations?.abort();
    const controller = new AbortController();
    controllersRef.current.simulations = controller;

    const promise = listSimulations({
      signal: controller.signal,
      cache: 'no-store',
    }).finally(() => {
      if (inflightRef.current.simulations === promise) {
        inflightRef.current.simulations = undefined;
      }
    });

    inflightRef.current.simulations = promise;
    return promise;
  }, []);

  const refresh = useCallback(
    (force = true) => {
      const requestId = ++requestIdRef.current;
      setLoadingProfile(true);
      setLoadingSimulations(true);
      setProfileError(null);
      setSimError(null);

      const profilePromise = fetchProfile(force);
      const simsPromise = fetchSimulations(force);

      profilePromise
        .then((result) => {
          if (requestIdRef.current !== requestId) return;
          setProfile(result ?? null);
          setProfileError(null);
        })
        .catch((err: unknown) => {
          if (isAbortError(err) || requestIdRef.current !== requestId) return;
          const status =
            err && typeof err === 'object'
              ? (err as { status?: unknown }).status
              : null;
          if (status === 401 || status === 403) return;
          setProfileError(
            toUserMessage(err, 'Unable to load your profile right now.', {
              includeDetail: true,
            }),
          );
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setLoadingProfile(false);
        });

      simsPromise
        .then((result) => {
          if (requestIdRef.current !== requestId) return;
          setSimulations(Array.isArray(result) ? result : []);
          setSimError(null);
        })
        .catch((err: unknown) => {
          if (isAbortError(err) || requestIdRef.current !== requestId) return;
          const status =
            err && typeof err === 'object'
              ? (err as { status?: unknown }).status
              : null;
          if (status === 401) {
            window.location.assign(buildLoginUrl('recruiter', buildReturnTo()));
            return;
          }
          if (status === 403) {
            window.location.assign(
              buildNotAuthorizedUrl('recruiter', buildReturnTo()),
            );
            return;
          }
          setSimError(
            toUserMessage(err, 'Failed to load simulations.', {
              includeDetail: true,
            }),
          );
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setLoadingSimulations(false);
        });

      return Promise.allSettled([profilePromise, simsPromise]);
    },
    [fetchProfile, fetchSimulations],
  );

  useEffect(() => {
    const controllers = controllersRef.current;
    if (options?.fetchOnMount === false) {
      return () => {
        controllers.profile?.abort();
        controllers.simulations?.abort();
      };
    }

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      void refresh(false);
    });

    return () => {
      active = false;
      controllers.profile?.abort();
      controllers.simulations?.abort();
    };
  }, [controllersRef, options?.fetchOnMount, refresh]);

  return {
    profile,
    profileError,
    simulations,
    simError,
    loadingProfile,
    loadingSimulations,
    refresh,
  };
}
