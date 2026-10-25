import React from 'react';
import { getSessionUser } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <AdminShell user={user || { id: '', full_name: '', email: '', role: '' }}>
      {children}
    </AdminShell>
  );
}
