import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Appointment stats
    const totalAppointments = (await queryOne('SELECT count(*) as count FROM appointments'))?.count || 0;
    const pendingAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Pending'"))?.count || 0;
    const confirmedAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Confirmed'"))?.count || 0;
    const completedAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Completed'"))?.count || 0;
    const cancelledAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status IN ('Cancelled', 'Rejected')"))?.count || 0;

    // Enquiry stats
    const totalEnquiries = (await queryOne('SELECT count(*) as count FROM enquiries'))?.count || 0;
    const newEnquiries = (await queryOne("SELECT count(*) as count FROM enquiries WHERE status = 'New'"))?.count || 0;

    // Catalogue & Gallery stats
    const activeServices = (await queryOne('SELECT count(*) as count FROM services WHERE is_active = 1'))?.count || 0;
    const totalGalleryImages = (await queryOne('SELECT count(*) as count FROM gallery_images WHERE is_published = 1'))?.count || 0;

    // Recent items for quick preview
    const recentAppointments = await query(
      'SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5'
    );
    const recentEnquiries = await query(
      'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5'
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalEnquiries,
        newEnquiries,
        activeServices,
        totalGalleryImages,
      },
      recentAppointments,
      recentEnquiries,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to compute dashboard statistics' }, { status: 500 });
  }
}
