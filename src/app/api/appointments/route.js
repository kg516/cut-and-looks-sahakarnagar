import { NextResponse } from 'next/server';
import { query, queryOne, execute, newUUID, generateBookingReference } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { validatePhone, validateEmail, validateAppointmentDate } from '@/lib/validation';
import { logAudit } from '@/lib/settings';

// Public booking submission
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      appointment_date,
      start_time,
      preferred_stylist,
      customer_message,
      privacy_consent,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!customer_phone || !validatePhone(customer_phone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    if (customer_email && !validateEmail(customer_email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!appointment_date || !validateAppointmentDate(appointment_date)) {
      return NextResponse.json({ error: 'Please select a valid future or today appointment date' }, { status: 400 });
    }

    if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
      return NextResponse.json({ error: 'Please select an appointment time slot' }, { status: 400 });
    }

    if (!privacy_consent) {
      return NextResponse.json({ error: 'Please accept the privacy policy to proceed with booking' }, { status: 400 });
    }

    // Verify service snapshot
    let serviceNameSnapshot = 'General Consultation & Hair Styling';
    let servicePriceSnapshot = null;
    let durationMinutes = 30;

    if (service_id) {
      const srv = await queryOne('SELECT * FROM services WHERE id = ?', [service_id]);
      if (srv) {
        if (!srv.is_active) {
          return NextResponse.json({ error: 'The selected service is currently unavailable for booking' }, { status: 400 });
        }
        serviceNameSnapshot = srv.name;
        servicePriceSnapshot = srv.price_inr !== null ? srv.price_inr : srv.starting_price_inr;
        durationMinutes = srv.duration_minutes || 30;
      }
    }

    // Compute end time based on duration
    const [sh, sm] = start_time.split(':').map(Number);
    const endMinutes = sh * 60 + sm + durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Anti-double-booking check: ensure slot is not already taken
    const conflict = await queryOne(
      `SELECT id, booking_reference FROM appointments
       WHERE appointment_date = ? AND start_time = ? AND status IN ('Pending', 'Confirmed')`,
      [appointment_date, start_time]
    );

    if (conflict) {
      return NextResponse.json({
        error: 'The selected time slot has just been requested or booked by another client. Please select another slot.',
      }, { status: 409 });
    }

    const id = newUUID();
    const bookingReference = generateBookingReference();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO appointments (
        id, booking_reference, customer_name, customer_phone, customer_email,
        service_id, service_name_snapshot, service_price_snapshot,
        appointment_date, start_time, end_time, preferred_stylist,
        customer_message, status, admin_notes, privacy_consent,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NULL, 1, ?, ?)`,
      [
        id,
        bookingReference,
        customer_name.trim(),
        customer_phone.trim(),
        customer_email ? customer_email.trim() : null,
        service_id || null,
        serviceNameSnapshot,
        servicePriceSnapshot,
        appointment_date,
        start_time,
        endTime,
        preferred_stylist ? preferred_stylist.trim() : null,
        customer_message ? customer_message.trim() : null,
        now,
        now,
      ]
    );

    return NextResponse.json({
      success: true,
      bookingReference,
      appointment: {
        bookingReference,
        customerName: customer_name.trim(),
        serviceName: serviceNameSnapshot,
        appointmentDate: appointment_date,
        startTime: start_time,
        endTime,
        status: 'Pending',
      },
    });
  } catch (err) {
    console.error('Appointment booking error:', err);
    return NextResponse.json({ error: 'Failed to process appointment booking request. Please try again.' }, { status: 500 });
  }
}

// Admin appointment listing with filters & search
export async function GET(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND appointment_date = ?';
      params.push(date);
    } else if (startDate && endDate) {
      sql += ' AND appointment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (search && search.trim()) {
      sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR booking_reference LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY appointment_date DESC, start_time DESC, created_at DESC';

    const appointments = await query(sql, params);
    return NextResponse.json({ success: true, appointments });
  } catch (err) {
    console.error('Appointments GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// Admin appointment status updates, rescheduling, and internal notes
export async function PUT(request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, admin_notes, appointment_date, start_time } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const current = await queryOne('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!current) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    let confirmedAt = current.confirmed_at;
    let cancelledAt = current.cancelled_at;

    if (status === 'Confirmed' && current.status !== 'Confirmed') {
      confirmedAt = now;
    } else if ((status === 'Cancelled' || status === 'Rejected') && current.status !== 'Cancelled' && current.status !== 'Rejected') {
      cancelledAt = now;
    }

    await execute(
      `UPDATE appointments SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        appointment_date = COALESCE(?, appointment_date),
        start_time = COALESCE(?, start_time),
        confirmed_at = ?,
        cancelled_at = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        status || null,
        admin_notes !== undefined ? admin_notes : null,
        appointment_date || null,
        start_time || null,
        confirmedAt,
        cancelledAt,
        now,
        id,
      ]
    );

    await logAudit(admin.id, `UPDATE_APPOINTMENT_${status || 'EDIT'}`, 'appointments', id, {
      reference: current.booking_reference,
      previous_status: current.status,
      new_status: status || current.status,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Appointments PUT error:', err);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
