import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await query(
      `SELECT * FROM appointments ORDER BY appointment_date DESC, start_time DESC`
    );

    const headers = [
      'Booking Reference',
      'Customer Name',
      'Mobile Number',
      'Email',
      'Service',
      'Price Snapshot (INR)',
      'Appointment Date',
      'Start Time',
      'End Time',
      'Stylist',
      'Status',
      'Customer Message',
      'Admin Internal Notes',
      'Created At',
      'Confirmed At',
      'Cancelled At',
    ];

    const rows = appointments.map((a) => [
      escapeCsvField(a.booking_reference),
      escapeCsvField(a.customer_name),
      escapeCsvField(a.customer_phone),
      escapeCsvField(a.customer_email),
      escapeCsvField(a.service_name_snapshot),
      escapeCsvField(a.service_price_snapshot !== null ? `₹${a.service_price_snapshot}` : 'Not Specified'),
      escapeCsvField(a.appointment_date),
      escapeCsvField(a.start_time),
      escapeCsvField(a.end_time || ''),
      escapeCsvField(a.preferred_stylist || 'Any Stylist'),
      escapeCsvField(a.status),
      escapeCsvField(a.customer_message || ''),
      escapeCsvField(a.admin_notes || ''),
      escapeCsvField(a.created_at),
      escapeCsvField(a.confirmed_at || ''),
      escapeCsvField(a.cancelled_at || ''),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Cut_Looks_Appointments_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export CSV error:', err);
    return NextResponse.json({ error: 'Failed to export appointments' }, { status: 500 });
  }
}
