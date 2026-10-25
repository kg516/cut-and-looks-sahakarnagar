import React from 'react';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EnquiryManager from '@/components/admin/EnquiryManager';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const enquiries = await query(
    'SELECT * FROM enquiries ORDER BY created_at DESC'
  );

  return <EnquiryManager initialEnquiries={enquiries} />;
}
