import React from 'react';
import { getBusinessSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsManager from '@/components/admin/SettingsManager';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const settings = await getBusinessSettings();

  return <SettingsManager initialSettings={settings} />;
}
