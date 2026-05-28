import type { Metadata } from 'next';
import TalentPartnerSettingsPage from '@/features/talent-partner/settings/TalentPartnerSettingsPage';

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Manage Talent Partner profile, workspace, members, billing, API, and notification settings.',
};

export default function SettingsPage() {
  return <TalentPartnerSettingsPage />;
}
