import { NextResponse } from 'next/server';
import { query, queryOne, execute, newUUID } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { validatePhone, validateEmail } from '@/lib/validation';
import { logAudit } from '@/lib/settings';

// Public contact enquiry submission
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_email, subject, message } = body;

    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json({ error: 'Your full name is required' }, { status: 400 });
    }

    if (!customer_phone || !validatePhone(customer_phone)) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit mobile number' }, { status: 400 });
    }

    if (customer_email && !validateEmail(customer_email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: 'Please enter an enquiry subject' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Please enter your message' }, { status: 400 });
    }

    const id = newUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO enquiries (id, customer_name, customer_phone, customer_email, subject, message, status, admin_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'New', NULL, ?, ?)`,
      [
        id,
        customer_name.trim(),
        customer_phone.trim(),
        customer_email ? customer_email.trim() : null,
        subject.trim(),
        message.trim(),
        now,
        now,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out to Cut & Looks Sahakar Nagar. Your enquiry has been received and our salon team will contact you shortly.',
    });
  } catch (err) {
    console.error('Enquiries POST error:', err);
    return NextResponse.json({ error: 'Failed to submit enquiry. Please call us directly at +91 84313 57154.' }, { status: 500 });
  }
}

// Admin listing
export async function GET(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM enquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR subject LIKE ? OR message LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const enquiries = await query(sql, params);
    return NextResponse.json({ success: true, enquiries });
  } catch (err) {
    console.error('Enquiries GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

// Admin update status and notes
export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Enquiry ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    await execute(
      `UPDATE enquiries SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = ?
      WHERE id = ?`,
      [status || null, admin_notes !== undefined ? admin_notes : null, now, id]
    );

    await logAudit(admin.id, 'UPDATE_ENQUIRY', 'enquiries', id, { status, admin_notes });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Enquiries PUT error:', err);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
