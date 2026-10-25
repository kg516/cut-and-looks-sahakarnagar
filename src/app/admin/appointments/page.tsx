import React from 'react';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppointmentManager from '@/components/admin/AppointmentManager';

export const revalidate = 0;

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams?: { search?: string; status?: string };
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const search = searchParams?.search || '';
  const appointments = await query(
    'SELECT * FROM appointments ORDER BY appointment_date DESC, start_time DESC, created_at DESC'
  );

  return (
    <AppointmentManager
      initialAppointments={appointments}
      initialSearch={search}
    />
  );
}
