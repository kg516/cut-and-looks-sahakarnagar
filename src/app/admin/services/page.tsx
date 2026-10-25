import React from 'react';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ServicesManager from '@/components/admin/ServicesManager';

export const revalidate = 0;

export default async function AdminServicesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const categories = await query(
    'SELECT * FROM service_categories ORDER BY display_order ASC, name ASC'
  );

  const services = await query(`
    SELECT s.*, c.name as category_name
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    ORDER BY s.display_order ASC, s.name ASC
  `);

  return (
    <ServicesManager
      initialCategories={categories}
      initialServices={services}
    />
  );
}
