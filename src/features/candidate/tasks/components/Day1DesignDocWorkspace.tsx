'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Button from '@/shared/ui/Button';
import { MarkdownPreview } from '@/shared/ui/Markdown';
import { Day1DeadlineCard } from './Day1DeadlineCard';
import { Day1MarkdownEditor } from './Day1MarkdownEditor';
import { DraftSaveStatus } from './DraftSaveStatus';
import type { TaskDraftAutosaveStatus } from '../hooks/useTaskDraftAutosave';
import {
  defaultOpenBriefSectionIds,
  parseProjectBriefSections,
} from '../utils/projectBriefSections';

const DAY_LABELS: Record<number, string> = {
  1: 'Planning & Design Doc',
  2: 'Implementation Kickoff',
  3: 'Implementation Wrap-Up',
  4: 'Handoff + Demo',
  5: 'Reflection Essay',
};

const HELP_COPY =
  'Use Day 1 to explain how you plan to approach the build. Winoe is looking for your decisions, tradeoffs, and clarity — not a perfect answer.';

function candidateInitials(name: string | null | undefined): string {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return 'C';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type Day1DesignDocWorkspaceProps = {
  role: string;
  candidateName?: string | null;
  projectBrief: string;
  value: string;
  disabled: boolean;
  readOnly: boolean;
  readOnlyReason: string | null;
  draftError: string | null;
  draftPersistentFailure?: boolean;
  draftAutosaveStatus: TaskDraftAutosaveStatus;
  savedAt: number | null;
  draftRestoreApplied: boolean;
  cutoffAt?: string | null;
  editorKey: string;
  onChange: (value: string) => void;
  onFlushDraft?: () => void;
  onSaveDraft?: () => void;
  onSubmit: () => void | Promise<unknown>;
  submitDisabled: boolean;
  submitLabel: string;
  actionStatus: 'idle' | 'submitting' | 'submitted';
};

export function Day1DesignDocWorkspace({
  role,
  candidateName,
  projectBrief,
  value,
  disabled,
  readOnly,
  readOnlyReason,
  draftError,
  draftPersistentFailure = false,
  draftAutosaveStatus,
  savedAt,
  draftRestoreApplied,
  cutoffAt,
  editorKey,
  onChange,
  onFlushDraft,
  onSaveDraft,
  onSubmit,
  submitDisabled,
  submitLabel,
  actionStatus,
}: Day1DesignDocWorkspaceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [timerFired, setTimerFired] = useState(false);

  const hasContent = value.trim().length > 0;
  const showPrompts = !readOnly && !hasContent && timerFired;

  useEffect(() => {
    if (readOnly || hasContent) return;
    const timerId = window.setTimeout(() => setTimerFired(true), 60_000);
    return () => window.clearTimeout(timerId);
  }, [hasContent, readOnly]);

  const briefSections = useMemo(
    () => parseProjectBriefSections(projectBrief),
    [projectBrief],
  );
  const [openSections, setOpenSections] = useState<Set<string>>(() =>
    defaultOpenBriefSectionIds(briefSections),
  );

  const placeholder =
    'Type / for headings, lists, quotes, and code blocks — or just begin writing.';

  const handleSubmitClick = () => {
    if (submitDisabled || actionStatus !== 'idle') return;
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (confirmPending || submitDisabled || actionStatus !== 'idle') return;
    setConfirmPending(true);
    setConfirmOpen(false);
    Promise.resolve(onSubmit()).finally(() => setConfirmPending(false));
  };

  const displayName = candidateName?.trim() || 'Candidate';
  const initials = candidateInitials(candidateName);

  const statusNode: ReactNode = (
    <DraftSaveStatus
      status={draftAutosaveStatus}
      lastSavedAt={savedAt}
      restoreApplied={draftRestoreApplied}
      error={draftError}
    />
  );

  return (
    <div className="mt-6 grid min-h-[min(720px,calc(100vh-12rem))] min-w-0 grid-cols-1 gap-6 overflow-x-hidden lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,20rem)] lg:items-stretch">
      <aside className="flex w-full min-w-0 flex-col border border-gray-200 bg-white lg:col-start-1 lg:row-start-1 lg:rounded-md lg:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-wheat-700">
          Your Trial
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-950">{role}</p>
        <nav aria-label="Trial days" className="mt-4 space-y-2">
          {([1, 2, 3, 4, 5] as const).map((day) => (
            <div
              key={day}
              className={`rounded-md px-3 py-2 text-sm ${
                day === 1
                  ? 'border border-wheat-200 bg-wheat-50 font-medium text-wheat-950'
                  : 'border border-transparent text-gray-500'
              }`}
              aria-current={day === 1 ? 'step' : undefined}
            >
              <span className="sr-only">
                {day === 1 ? 'Current day. ' : 'Locked. '}
              </span>
              Day {day} — {DAY_LABELS[day]}
              {day > 1 ? (
                <span className="block text-xs font-normal text-gray-500">
                  Locked
                </span>
              ) : (
                <span className="block text-xs font-normal text-wheat-800">
                  Active
                </span>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wheat-100 text-sm font-semibold text-wheat-900"
              aria-hidden
            >
              {initials}
            </div>
            <div className="text-sm font-medium text-gray-950">
              {displayName}
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-20 flex min-w-0 flex-col lg:col-start-2 lg:row-start-1 lg:min-h-0">
        <header className="relative z-10 flex min-w-0 flex-col gap-3 border-b border-gray-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-lg font-semibold text-gray-950">
            Day 1 — Planning & Design Doc
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[8rem]">{statusNode}</div>
            <Day1DeadlineCard
              cutoffAt={cutoffAt}
              isClosed={readOnly}
              variant="inline"
            />
            {!readOnly ? (
              <>
                <Button onClick={handleSubmitClick} disabled={submitDisabled}>
                  {actionStatus === 'submitting' ? 'Submitting…' : submitLabel}
                </Button>
                <div className="relative">
                  <button
                    type="button"
                    className="rounded-md border border-gray-200 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    More
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                          onSaveDraft?.();
                          setMenuOpen(false);
                        }}
                      >
                        Save as draft
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                          setHelpOpen(true);
                          setMenuOpen(false);
                        }}
                      >
                        Help
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </header>

        <main className="relative z-10 flex min-w-0 flex-1 flex-col lg:min-h-0">
          {draftPersistentFailure && draftError ? (
            <div
              role="alert"
              className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              Couldn&apos;t save — check connection. {draftError}
            </div>
          ) : null}

          {readOnly ? (
            <section
              aria-labelledby="day1-readonly-heading"
              className="rounded-md border border-gray-200 bg-white p-5"
            >
              <h2
                id="day1-readonly-heading"
                className="text-lg font-semibold text-gray-950"
              >
                Day 1 design document locked
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {readOnlyReason ??
                  'This Day 1 design document is read-only after submit or when the window closes.'}
              </p>
              <div className="mt-4">
                <MarkdownPreview
                  content={value}
                  emptyPlaceholder="No saved Day 1 design document is available."
                />
              </div>
            </section>
          ) : (
            <>
              {showPrompts ? (
                <div className="mb-3 rounded-md border border-wheat-100 bg-wheat-50 p-3 text-sm text-wheat-950">
                  <p className="font-medium">Helpful prompts to consider:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>What tech stack will you use and why?</li>
                    <li>How will you structure the project?</li>
                    <li>What&apos;s your validation strategy?</li>
                    <li>Where do you anticipate the hardest decisions?</li>
                  </ul>
                </div>
              ) : null}
              <div className="mx-auto w-full max-w-[720px] flex-1">
                <Day1MarkdownEditor
                  editorKey={editorKey}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder={placeholder}
                  onBlurDocument={onFlushDraft}
                />
              </div>
              {draftError && !draftPersistentFailure ? (
                <p className="mt-3 text-sm font-medium text-red-800">
                  Couldn&apos;t save — check connection. {draftError}
                </p>
              ) : null}
            </>
          )}
        </main>
      </div>

      <aside className="relative z-0 min-w-0 w-full border border-gray-200 bg-white lg:col-start-3 lg:row-start-1 lg:max-h-[min(720px,calc(100vh-12rem))] lg:max-w-[20rem] lg:overflow-y-auto lg:rounded-md lg:p-4">
        <h2 className="text-sm font-semibold text-gray-950">Project Brief</h2>
        {briefSections.length ? (
          <div className="mt-3 space-y-2">
            {briefSections.map((section) => (
              <details
                key={section.id}
                className="rounded-md border border-gray-100"
                open={openSections.has(section.id)}
                onToggle={(event) => {
                  const open = (event.target as HTMLDetailsElement).open;
                  setOpenSections((prev) => {
                    const next = new Set(prev);
                    if (open) next.add(section.id);
                    else next.delete(section.id);
                    return next;
                  });
                }}
              >
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-gray-900">
                  {section.title}
                </summary>
                <div className="border-t border-gray-100 px-3 py-2 text-sm text-gray-700">
                  <MarkdownPreview content={section.body} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-red-700">
            Project Brief is unavailable. Contact Winoe AI before writing your
            Day 1 design document.
          </p>
        )}
      </aside>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-day1-confirm-title"
            className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"
          >
            <h2
              id="submit-day1-confirm-title"
              className="text-lg font-semibold text-gray-950"
            >
              Submit Day 1?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Submitting will lock your Day 1 Design Doc and unlock Day 2 — your
              empty Codespace will be ready in 60 seconds. You can still view
              your design doc in read-only mode.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={confirmPending}
                onClick={() => setConfirmOpen(false)}
              >
                Keep working
              </Button>
              <Button
                type="button"
                disabled={
                  confirmPending || submitDisabled || actionStatus !== 'idle'
                }
                onClick={handleConfirmSubmit}
              >
                Submit Day 1
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setHelpOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="day1-help-title"
            className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="day1-help-title"
              className="text-lg font-semibold text-gray-950"
            >
              Day 1 help
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">{HELP_COPY}</p>
            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={() => setHelpOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
