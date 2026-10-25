import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-salon-gold text-xs uppercase tracking-[0.2em] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Customer Privacy Statement</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-salon-cream">
            Privacy Policy
          </h1>
          <p className="text-salon-muted text-sm max-w-xl mx-auto">
            How Cut & Looks Sahakar Nagar collects, protects, and handles your personal information.
          </p>
        </div>

        <div className="bg-salon-card rounded-2xl border border-salon-cardBorder p-8 sm:p-12 space-y-8 text-sm text-salon-muted leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              1. Information We Collect
            </h2>
            <p>
              When you use our website to book an appointment or submit an enquiry, we collect only the necessary information to serve your request:
            </p>
            <ul className="list-disc list-inside space-y-1 text-salon-cream/90 pl-2">
              <li>Full Name</li>
              <li>Mobile Telephone Number</li>
              <li>Optional Email Address</li>
              <li>Selected Service, Preferred Date, and Time</li>
              <li>Preferred Stylist and Special Message / Styling Notes</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              2. How Your Information Is Used
            </h2>
            <p>
              We collect this information strictly for the following operational purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-salon-cream/90 pl-2">
              <li>To schedule, confirm, reschedule, or cancel your salon appointment.</li>
              <li>To answer customer queries submitted through our contact form.</li>
              <li>To prevent conflicting double-bookings and maintain orderly salon queue management.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data to any third-party marketing companies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              3. Data Security & Storage
            </h2>
            <p>
              All customer appointment records and contact enquiries are stored within a secure, access-controlled database. Only authorized salon administrators have access to customer booking records. Passwords for administrator logins are cryptographically hashed using industry-standard bcrypt algorithms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-salon-cream">
              4. Your Rights & Data Inquiries
            </h2>
            <p>
              You have the right to request access to the information we hold about you, request corrections, or request deletion of historical appointment records. To make such a request, please contact our salon management directly at <strong>+91 84313 57154</strong> or visit us at our Sahakar Nagar salon.
            </p>
          </section>

          <section className="space-y-3 border-t border-salon-cardBorder/60 pt-6">
            <p className="text-xs text-salon-muted">
              Last updated: October 2026 • Cut & Looks Sahakar Nagar, Bengaluru.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
