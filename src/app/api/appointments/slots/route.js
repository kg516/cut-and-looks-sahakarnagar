import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getBusinessSettings } from '@/lib/settings';
import { validateAppointmentDate } from '@/lib/validation';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !validateAppointmentDate(date)) {
      return NextResponse.json({ error: 'Valid future or current appointment date is required' }, { status: 400 });
    }

    const settings = await getBusinessSettings();
    const openingHours = settings?.opening_hours || {};
    const bookingSettings = settings?.booking_settings || {};
    const intervalMinutes = bookingSettings.slot_interval_minutes || 30;

    // Determine day of week
    const targetDate = new Date(`${date}T12:00:00Z`);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[targetDate.getUTCDay()];
    const dayConfig = openingHours[dayName];

    if (!dayConfig || dayConfig.isOpen === false) {
      return NextResponse.json({
        success: true,
        date,
        isClosed: true,
        message: 'The salon is closed on this day.',
        slots: [],
      });
    }

    const openTime = dayConfig.open || '09:30';
    const closeTime = dayConfig.close || '21:00';

    // Parse open and close into minutes from midnight
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    // Fetch existing active bookings for this date
    const bookedAppointments = await query(
      `SELECT start_time FROM appointments 
       WHERE appointment_date = ? AND status IN ('Pending', 'Confirmed')`,
      [date]
    );
    const bookedTimes = new Set(bookedAppointments.map((a) => a.start_time));

    // Check if requested date is today to block past hours
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;
    const currentNow = new Date();
    const currentMinutesFromMidnight = currentNow.getHours() * 60 + currentNow.getMinutes();

    const slots = [];
    for (let m = openTotal; m < closeTotal; m += intervalMinutes) {
      const h = Math.floor(m / 60);
      const mins = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      // Format 12-hour display e.g. "10:00 AM"
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayTime = `${displayH}:${String(mins).padStart(2, '0')} ${period}`;

      const isAlreadyBooked = bookedTimes.has(timeStr);
      const isPastTime = isToday && (m <= currentMinutesFromMidnight + 30); // 30 min buffer

      slots.push({
        time: timeStr,
        display: displayTime,
        available: !isAlreadyBooked && !isPastTime,
        reason: isAlreadyBooked ? 'Booked' : isPastTime ? 'Past slot' : 'Available',
      });
    }

    return NextResponse.json({
      success: true,
      date,
      dayName,
      openTime,
      closeTime,
      slots,
    });
  } catch (err) {
    console.error('Slots error:', err);
    return NextResponse.json({ error: 'Failed to compute appointment slots' }, { status: 500 });
  }
}
