'use client';

import { useState } from 'react';
import Button from '@/shared/ui/Button';
import { initCandidateWorkspace } from '@/features/candidate/session/api';
import {
  isValidGithubUsername,
  normalizeGithubUsername,
} from '@/features/candidate/session/utils/githubUsername';
import { normalizeApiError } from '@/platform/api-client/errors/errors';

type Props = {
  open: boolean;
  candidateSessionId: number;
  taskId: number;
  onSaved: (githubUsername: string) => void;
};

export function GithubUsernamePromptModal({
  open,
  candidateSessionId,
  taskId,
  onSaved,
}: Props) {
  const [githubUsername, setGithubUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const normalizedUsername = normalizeGithubUsername(githubUsername);
  const isValid = isValidGithubUsername(normalizedUsername);

  const handleSubmit = async () => {
    const username = normalizeGithubUsername(githubUsername);
    if (!username || !isValidGithubUsername(username)) {
      setError('Enter a valid GitHub username, for example octocat.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await initCandidateWorkspace({
        taskId,
        candidateSessionId,
        githubUsername: username,
      });
      onSaved(username);
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        'Unable to connect your GitHub username right now.',
      );
      setError(normalized.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-github-title"
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wheat-700">
          Day 2 access
        </p>
        <h2 id="connect-github-title" className="mt-2 text-2xl font-semibold">
          Connect your GitHub
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          Winoe AI uses your GitHub username to grant access to your Codespace.
          Once saved, you can open the workspace and continue your Trial.
        </p>

        <label
          htmlFor="github-username"
          className="mt-5 block text-sm font-medium text-gray-900"
        >
          GitHub username
        </label>
        <input
          id="github-username"
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-wheat-500 focus:ring-2 focus:ring-wheat-100"
          placeholder="e.g., octocat"
          value={githubUsername}
          onChange={(event) => {
            setGithubUsername(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby="github-username-help github-username-error"
          disabled={submitting}
        />
        <p id="github-username-help" className="mt-2 text-xs text-gray-500">
          Use the GitHub account that will be added to the candidate repo.
        </p>
        {error ? (
          <p id="github-username-error" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        ) : !isValid && normalizedUsername ? (
          <p className="mt-2 text-sm text-amber-700">
            Use a valid GitHub username, for example octocat.
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
