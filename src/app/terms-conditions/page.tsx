import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-salon-gold text-xs uppercase tracking-[0.2em] font-semibold">
            <FileText className="w-4 h-4" />
            <span>Salon Policies</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-salon-cream">
            Terms & Conditions
          </h1>
          <p className="text-salon-muted text-sm max-w-xl mx-auto">
            Booking guidelines, salon etiquette, and service policies for Cut & Looks Sahakar Nagar.
          </p>
        </div>

        <div className="bg-salon-card rounded-2xl border border-salon-cardBorder p-8 sm:p-12 space-y-8 text-sm text-salon-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              1. Appointment Requests & Confirmation
            </h2>
            <p>
              Submitting an appointment request on our website registers your preferred service, date, and slot in our system as <strong>&ldquo;Pending&rdquo;</strong>. While we endeavor to honour your selected slot, all bookings are subject to confirmation by the salon based on stylist availability and actual salon floor queues.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              2. Arrival Time & Rescheduling
            </h2>
            <p>
              We kindly ask clients to arrive at least 5 to 10 minutes prior to their confirmed appointment. In case of unexpected delays, please call us at <strong>+91 84313 57154</strong>. If an arrival is delayed by more than 15 minutes without notice, we may offer the slot to waiting clients or reschedule your visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              3. Service Pricing & Consultation
            </h2>
            <p>
              Prices displayed on this website represent confirmed starting prices or fixed rates set by the salon management. Certain chemical treatments, such as global hair coloring, balayage, highlights, and keratin smoothing, may vary based on hair length, density, texture, and product consumption. Our stylists will confirm final pricing during your pre-service consultation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              4. Cancellations
            </h2>
            <p>
              If you need to cancel or modify your appointment, please notify the salon at least 2 hours in advance via telephone or WhatsApp so we can accommodate other patrons.
            </p>
          </section>

          <section className="space-y-3 border-t border-salon-cardBorder/60 pt-6">
            <p className="text-xs text-salon-muted">
              Effective Date: October 2026 • Cut & Looks Sahakar Nagar, Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
