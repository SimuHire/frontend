import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  getTaskDraftErrorCode,
  putCandidateTaskDraft,
  type CandidateTaskDraftPayload,
} from '@/features/candidate/session/api/taskDraftsApi';
import { normalizeApiError } from '@/platform/errors/errors';
import {
  extractTaskWindowClosedOverride,
  formatComeBackMessage,
} from '@/features/candidate/session/lib/windowState';
import {
  normalizePayload,
  payloadFingerprint,
} from './useTaskDraftAutosavePayload';

type PersistStatus = 'idle' | 'restoring' | 'saving' | 'saved' | 'error';
type PersistReason = 'debounce' | 'hidden' | 'beforeunload' | 'manual';

const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000];
const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type CreateTaskDraftPersistNowArgs<TValue> = {
  taskId: number;
  candidateSessionId: number | null;
  isDisabled: boolean;
  onTaskWindowClosed?: (err: unknown) => void;
  setInternalStatus: Dispatch<SetStateAction<PersistStatus>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setPersistentFailure: Dispatch<SetStateAction<boolean>>;
  setAutosaveLocked: Dispatch<SetStateAction<boolean>>;
  setLastSavedAt: Dispatch<SetStateAction<number | null>>;
  serializeRef: MutableRefObject<(value: TValue) => CandidateTaskDraftPayload>;
  valueRef: MutableRefObject<TValue>;
  onSavedAtRef: MutableRefObject<((savedAtMs: number) => void) | undefined>;
  inFlightRef: MutableRefObject<Promise<boolean> | null>;
  lastSavedFingerprintRef: MutableRefObject<string | null>;
  serverUpdatedAtRef: MutableRefObject<string | null>;
};

export function createTaskDraftPersistNow<TValue>({
  taskId,
  candidateSessionId,
  isDisabled,
  onTaskWindowClosed,
  setInternalStatus,
  setError,
  setPersistentFailure,
  setAutosaveLocked,
  setLastSavedAt,
  serializeRef,
  valueRef,
  onSavedAtRef,
  inFlightRef,
  lastSavedFingerprintRef,
  serverUpdatedAtRef,
}: CreateTaskDraftPersistNowArgs<TValue>) {
  return async (_reason: PersistReason): Promise<boolean> => {
    if (candidateSessionId === null || !taskId || isDisabled) return false;
    if (inFlightRef.current) return inFlightRef.current;
    let payload: CandidateTaskDraftPayload;
    try {
      payload = normalizePayload(serializeRef.current(valueRef.current));
    } catch {
      if (!isDisabled) {
        setInternalStatus('error');
        setError('Unable to prepare your draft for autosave.');
        setPersistentFailure(true);
      }
      return false;
    }

    const fingerprint = payloadFingerprint(payload);
    if (fingerprint === lastSavedFingerprintRef.current) return true;
    const run = (async () => {
      setInternalStatus('saving');
      setError(null);
      setPersistentFailure(false);

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
          const response = await putCandidateTaskDraft({
            taskId,
            candidateSessionId,
            payload,
          });
          const savedAtMs = Date.parse(response.updatedAt);
          if (Number.isFinite(savedAtMs)) {
            setLastSavedAt(savedAtMs);
            onSavedAtRef.current?.(savedAtMs);
          }
          serverUpdatedAtRef.current = response.updatedAt;
          lastSavedFingerprintRef.current = fingerprint;
          setInternalStatus('saved');
          setPersistentFailure(false);
          return true;
        } catch (err) {
          const windowClosed = extractTaskWindowClosedOverride(err);
          if (windowClosed) {
            setAutosaveLocked(true);
            setError(formatComeBackMessage(windowClosed));
            onTaskWindowClosed?.(err);
            return false;
          }
          if (getTaskDraftErrorCode(err) === 'DRAFT_FINALIZED') {
            setAutosaveLocked(true);
            setError('Draft finalized. This day is now read-only.');
            return false;
          }
          const normalized = normalizeApiError(
            err,
            'Autosave failed. Keep editing and we will retry.',
          );
          if (normalized.status === 409) {
            setError(
              'A newer draft was saved elsewhere. Your latest edits are kept here.',
            );
            setInternalStatus('error');
            setPersistentFailure(true);
            return false;
          }
          if (attempt < MAX_ATTEMPTS - 1) {
            await sleep(RETRY_DELAYS_MS[attempt] ?? 2000);
            continue;
          }
          setError(normalized.message);
          setInternalStatus('error');
          setPersistentFailure(true);
          return false;
        }
      }
      return false;
    })();

    inFlightRef.current = run;
    return run;
  };
}
