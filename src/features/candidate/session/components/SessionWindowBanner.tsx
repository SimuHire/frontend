import type { DerivedWindowState } from '../lib/windowState';
import { SessionWindowClosedBanner } from './SessionWindowBannerClosed';
import {
  SessionWindowClosedBeforeStartBanner,
  SessionWindowOpenBanner,
} from './SessionWindowBannerStates';

type Props = {
  windowState: DerivedWindowState;
  started: boolean;
  lastDraftSavedAt: number | null;
  lastSubmissionAt: string | null;
  lastSubmissionId: number | null;
};

export function SessionWindowBanner({
  windowState,
  started,
  lastDraftSavedAt,
  lastSubmissionAt,
  lastSubmissionId,
}: Props) {
  if (windowState.phase === 'unknown' || windowState.dayIndex === null)
    return null;

  if (windowState.phase === 'open')
    return <SessionWindowOpenBanner windowState={windowState} />;

  if (windowState.phase === 'closed_before_start')
    return (
      <SessionWindowClosedBeforeStartBanner
        windowState={windowState}
        started={started}
        lastDraftSavedAt={lastDraftSavedAt}
        lastSubmissionAt={lastSubmissionAt}
        lastSubmissionId={lastSubmissionId}
      />
    );

  return (
    <SessionWindowClosedBanner
      windowState={windowState}
      lastDraftSavedAt={lastDraftSavedAt}
      lastSubmissionAt={lastSubmissionAt}
      lastSubmissionId={lastSubmissionId}
    />
  );
}
