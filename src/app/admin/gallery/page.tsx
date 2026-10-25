import React from 'react';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GalleryManager from '@/components/admin/GalleryManager';

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const images = await query(
    'SELECT * FROM gallery_images ORDER BY display_order ASC, created_at DESC'
  );

  return <GalleryManager initialImages={images} />;
}
