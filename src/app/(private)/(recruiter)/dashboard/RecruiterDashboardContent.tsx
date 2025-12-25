'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  inviteCandidate,
  listSimulations,
  type SimulationListItem,
} from '@/lib/recruiterApi';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import { errorToMessage } from '@/features/recruiter/helpers';
import {
  InviteCandidateModal,
  type InviteUiState,
} from '@/features/recruiter/InviteCandidateModal';
import { InviteToast, type ToastState } from '@/features/recruiter/InviteToast';
import { SimulationList } from '@/features/recruiter/SimulationList';

export type RecruiterProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type RecruiterDashboardContentProps = {
  profile: RecruiterProfile | null;
  error: string | null;
};

type InviteModalState = {
  open: boolean;
  simulationId: string;
  simulationTitle: string;
};
export default function RecruiterDashboardContent({
  profile,
  error,
}: RecruiterDashboardContentProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<SimulationListItem[]>([]);
  const [simError, setSimError] = useState<string | null>(null);

  const [modal, setModal] = useState<InviteModalState>({
    open: false,
    simulationId: '',
    simulationTitle: '',
  });

  const [inviteState, setInviteState] = useState<InviteUiState>({
    status: 'idle',
  });

  const [toast, setToast] = useState<ToastState>({ open: false });
  const [copied, setCopied] = useState(false);

  const toastTimerRef = useRef<number | null>(null);
  const copiedTimerRef = useRef<number | null>(null);

  function dismissToast() {
    setToast({ open: false });
    setCopied(false);
  }

  function showToast(next: Omit<Extract<ToastState, { open: true }>, 'open'>) {
    setToast({ open: true, ...next });
    setCopied(false);

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      dismissToast();
      toastTimerRef.current = null;
    }, 6500);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setSimError(null);
        const sims = await listSimulations();
        if (!cancelled) setSimulations(Array.isArray(sims) ? sims : []);
      } catch (e: unknown) {
        const message = errorToMessage(e, 'Failed to load simulations.');
        if (!cancelled) setSimError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function openInviteModal(sim: SimulationListItem) {
    setInviteState({ status: 'idle' });
    setModal({
      open: true,
      simulationId: sim.id,
      simulationTitle: sim.title,
    });
  }

  function closeInviteModal() {
    setModal({ open: false, simulationId: '', simulationTitle: '' });
    setInviteState({ status: 'idle' });
  }

  async function submitInvite(candidateName: string, inviteEmail: string) {
    setInviteState({ status: 'loading' });

    try {
      const res = await inviteCandidate(
        modal.simulationId,
        candidateName,
        inviteEmail,
      );

      closeInviteModal();

      const displayName = candidateName.trim();
      const displayEmail = inviteEmail.trim();
      const who = displayName
        ? `${displayName} (${displayEmail})`
        : displayEmail;

      showToast({
        kind: 'success',
        message: `Invite created for ${who}.`,
        inviteUrl: res.inviteUrl,
      });

      try {
        const sims = await listSimulations();
        setSimulations(Array.isArray(sims) ? sims : []);
      } catch {}

      setInviteState({ status: 'idle' });
    } catch (e: unknown) {
      const message = errorToMessage(e, 'Failed to invite candidate.');
      setInviteState({ status: 'error', message });
    }
  }

  return (
    <main className="flex flex-col gap-4 py-8">
      <PageHeader
        title="Dashboard"
        actions={
          <Button
            type="button"
            onClick={() => router.push('/dashboard/simulations/new')}
          >
            New Simulation
          </Button>
        }
      />

      <InviteToast
        toast={toast}
        copied={copied}
        onDismiss={dismissToast}
        onCopyStateChange={(next) => {
          setCopied(next);
          if (copiedTimerRef.current)
            window.clearTimeout(copiedTimerRef.current);
          if (next) {
            copiedTimerRef.current = window.setTimeout(() => {
              setCopied(false);
              copiedTimerRef.current = null;
            }, 1800);
          }
        }}
      />

      {profile ? (
        <div className="rounded border border-gray-200 p-4">
          <p className="font-medium">{profile.name}</p>
          <p className="text-sm text-gray-600">{profile.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
            Role: {profile.role}
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Simulations</h2>

        {loading ? (
          <p className="text-sm text-gray-600">Loading simulations…</p>
        ) : null}

        {!loading && simError ? (
          <div className="rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">
              Couldn’t load simulations
            </p>
            <p className="text-sm text-red-700">{simError}</p>
          </div>
        ) : null}

        {!loading && !simError ? (
          <SimulationList
            simulations={simulations}
            onInvite={openInviteModal}
          />
        ) : null}
      </section>

      <InviteCandidateModal
        open={modal.open}
        title={modal.simulationTitle}
        state={inviteState}
        onClose={closeInviteModal}
        onSubmit={submitInvite}
        initialName=""
        initialEmail=""
      />
    </main>
  );
}
