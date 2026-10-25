import { NextResponse } from 'next/server';
import { getBusinessSettings, logAudit } from '@/lib/settings';
import { execute } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getBusinessSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      business_name,
      description,
      address,
      phone,
      email,
      logo_url,
      google_maps_url,
      google_reviews_url,
      opening_hours,
      social_links,
      booking_settings,
      seo_title,
      seo_description,
    } = body;

    const current = await getBusinessSettings();
    if (!current) {
      return NextResponse.json({ error: 'Business settings record not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    await execute(
      `UPDATE business_settings SET
        business_name = ?,
        description = ?,
        address = ?,
        phone = ?,
        email = ?,
        logo_url = ?,
        google_maps_url = ?,
        google_reviews_url = ?,
        opening_hours = ?,
        social_links = ?,
        booking_settings = ?,
        seo_title = ?,
        seo_description = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        business_name || current.business_name,
        description || current.description,
        address || current.address,
        phone || current.phone,
        email !== undefined ? email : current.email,
        logo_url !== undefined ? logo_url : current.logo_url,
        google_maps_url || current.google_maps_url,
        google_reviews_url || current.google_reviews_url,
        typeof opening_hours === 'object' ? JSON.stringify(opening_hours) : (opening_hours || JSON.stringify(current.opening_hours)),
        typeof social_links === 'object' ? JSON.stringify(social_links) : (social_links || JSON.stringify(current.social_links)),
        typeof booking_settings === 'object' ? JSON.stringify(booking_settings) : (booking_settings || JSON.stringify(current.booking_settings)),
        seo_title || current.seo_title,
        seo_description || current.seo_description,
        now,
        current.id,
      ]
    );

    await logAudit(admin.id, 'UPDATE_SETTINGS', 'business_settings', current.id, { updated_by: admin.email });
    const updated = await getBusinessSettings();

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Settings PUT error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
