'use client';

import { useMemo, useState } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { cn } from '@/shared/ui/classnames';

type SectionId =
  | 'profile'
  | 'workspace'
  | 'members'
  | 'billing'
  | 'api'
  | 'notifications';

type Section = {
  id: SectionId;
  label: string;
  kicker: string;
  heading: string;
  description: string;
};

const SECTIONS: Section[] = [
  {
    id: 'profile',
    label: 'Profile',
    kicker: 'Talent Partner identity',
    heading: 'Profile',
    description:
      'Keep the name and contact details Winoe uses on candidate invites and Trial updates.',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    kicker: 'Company context',
    heading: 'Workspace',
    description:
      'Set the workspace details that appear across Trial setup, candidate portals, and Winoe Reports.',
  },
  {
    id: 'members',
    label: 'Members',
    kicker: 'Decision team',
    heading: 'Members',
    description:
      'Control who can create Trials, review Evidence Trails, and manage workspace settings.',
  },
  {
    id: 'billing',
    label: 'Billing',
    kicker: 'Plan and invoices',
    heading: 'Billing',
    description:
      'Review Trial capacity, invoice contacts, and billing ownership for this workspace.',
  },
  {
    id: 'api',
    label: 'API',
    kicker: 'Integrations',
    heading: 'API',
    description:
      'Manage integration access for applicant tracking systems and internal Talent Partner workflows.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    kicker: 'Signal delivery',
    heading: 'Notifications',
    description:
      'Choose when Winoe sends candidate progress, Evidence Trail, and Winoe Report updates.',
  },
];

export default function TalentPartnerSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [dirty, setDirty] = useState(false);
  const section = useMemo(
    () => SECTIONS.find((item) => item.id === activeSection) ?? SECTIONS[0],
    [activeSection],
  );

  const markDirty = () => setDirty(true);
  const save = () => setDirty(false);

  return (
    <main className="min-h-screen bg-primary px-4 py-8 text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-wheat-700 dark:text-wheat-300">
            Workspace controls
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary">
            Tune the account details, collaboration rules, and delivery signals
            Winoe uses to keep every Trial reviewable and audit-ready.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav
            className="rounded-lg border border-strong bg-elevated p-2 shadow-sm"
            aria-label="Settings sections"
          >
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex w-full flex-col rounded-md px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-wheat-500',
                  activeSection === item.id
                    ? 'bg-wheat-50 text-wheat-900 dark:bg-wheat-950 dark:text-wheat-100'
                    : 'text-secondary hover:bg-secondary',
                )}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="mt-1 text-xs text-tertiary">
                  {item.kicker}
                </span>
              </button>
            ))}
          </nav>

          <section className="rounded-lg border border-strong bg-elevated shadow-sm">
            <div className="border-b border-strong px-5 py-5 sm:px-6">
              <p className="text-sm font-medium text-wheat-700 dark:text-wheat-300">
                {section.kicker}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{section.heading}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
                {section.description}
              </p>
            </div>
            <div className="px-5 py-6 sm:px-6">
              <SettingsSection section={activeSection} onChange={markDirty} />
            </div>
          </section>
        </div>
      </div>

      {dirty ? (
        <div className="sticky bottom-0 mt-8 border-t border-strong bg-primary/95 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary">
              You have unsaved settings changes.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDirty(false)}>
                Discard
              </Button>
              <Button onClick={save}>Save changes</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SettingsSection({
  section,
  onChange,
}: {
  section: SectionId;
  onChange: () => void;
}) {
  if (section === 'profile') {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Display name"
          defaultValue="Maya Chen"
          onChange={onChange}
        />
        <Field
          label="Work email"
          defaultValue="maya@northstar.example"
          onChange={onChange}
        />
        <Field
          label="Invite signature"
          defaultValue="Maya, Talent Partner"
          onChange={onChange}
        />
        <Field
          label="Timezone"
          defaultValue="America/New_York"
          onChange={onChange}
        />
      </div>
    );
  }

  if (section === 'workspace') {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Workspace name"
          defaultValue="Northstar Product"
          onChange={onChange}
        />
        <Field
          label="Company domain"
          defaultValue="northstar.example"
          onChange={onChange}
        />
        <Field
          label="Default Trial length"
          defaultValue="5 work days"
          onChange={onChange}
        />
        <Field
          label="Report language"
          defaultValue="Evidence-first, decision-ready"
          onChange={onChange}
        />
      </div>
    );
  }

  if (section === 'members') {
    return (
      <div className="space-y-4">
        {['Owner', 'Trial editor', 'Report reviewer'].map((role) => (
          <div
            key={role}
            className="flex flex-col gap-3 rounded-md border border-strong p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{role}</p>
              <p className="mt-1 text-sm text-secondary">
                Controls access to Calibration, candidate artifacts, and Winoe
                Reports.
              </p>
            </div>
            <Button variant="secondary" onClick={onChange}>
              Configure
            </Button>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'billing') {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Plan"
          defaultValue="Tech Trial pilot"
          onChange={onChange}
        />
        <Field
          label="Invoice email"
          defaultValue="finance@northstar.example"
          onChange={onChange}
        />
        <Field
          label="Trial capacity"
          defaultValue="25 active Trials"
          onChange={onChange}
        />
        <Field
          label="Billing owner"
          defaultValue="Maya Chen"
          onChange={onChange}
        />
      </div>
    );
  }

  if (section === 'api') {
    return (
      <div className="space-y-5">
        <Field
          label="Webhook endpoint"
          defaultValue="https://northstar.example/winoe"
          onChange={onChange}
        />
        <div className="rounded-md border border-strong bg-secondary p-4">
          <p className="font-medium">Integration scope</p>
          <p className="mt-1 text-sm text-secondary">
            Read Trial status, receive Winoe Report readiness events, and sync
            Evidence Trail links into your hiring workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[
        'Candidate starts a Trial',
        'Day 4 Handoff + Demo is ready',
        'Winoe Report is generated',
        'Evidence Trail needs review',
      ].map((label) => (
        <label
          key={label}
          className="flex items-start gap-3 rounded-md border border-strong p-4"
        >
          <input
            type="checkbox"
            defaultChecked
            onChange={onChange}
            className="mt-1 h-4 w-4 rounded border-strong text-wheat-600 focus:ring-wheat-500"
          />
          <span>
            <span className="block font-medium">{label}</span>
            <span className="mt-1 block text-sm text-secondary">
              Send a concise update to Talent Partners with direct links to the
              relevant Trial evidence.
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: string;
  onChange: () => void;
}) {
  return (
    <label className="block text-sm font-medium text-primary">
      {label}
      <Input className="mt-2" defaultValue={defaultValue} onChange={onChange} />
    </label>
  );
}
