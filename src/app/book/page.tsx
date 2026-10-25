import React, { Suspense } from 'react';
import { query } from '@/lib/db';
import { getBusinessSettings } from '@/lib/settings';
import BookingForm from '@/components/BookingForm';
import { Calendar, Phone, Clock, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function BookAppointmentPage() {
  const settings = await getBusinessSettings();

  const services = await query(`
    SELECT s.*, c.name as category_name
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.is_active = 1
    ORDER BY s.display_order ASC, s.name ASC
  `);

  const businessPhone = settings?.phone || '+91 84313 57154';
  const cleanPhone = businessPhone.replace(/[^\d+]/g, '');

  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen">
      {/* Header Banner */}
      <section className="relative py-16 sm:py-20 bg-salon-darker border-b border-salon-cardBorder/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            Online Appointment Request
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Book an Appointment
          </h1>
          <p className="max-w-2xl mx-auto text-salon-muted text-base">
            Choose your service, pick an available slot, and submit your request. Our salon team will confirm your booking.
          </p>
        </div>
      </section>

      {/* Main Booking Container */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-20 text-salon-gold">Loading booking system...</div>}>
          <BookingForm
            services={services}
            businessPhone={businessPhone}
          />
        </Suspense>

        {/* Support Note */}
        <div className="mt-12 text-center text-xs text-salon-muted space-y-2">
          <p>
            Prefer speaking to our receptionist directly? Call{' '}
            <a href={`tel:${cleanPhone}`} className="text-salon-gold hover:underline font-semibold">
              {businessPhone}
            </a>
          </p>
          <p>Sahakar Nagar, Bengaluru • Unisex Hair & Beauty Salon</p>
        </div>
      </section>
    </div>
  );
}
