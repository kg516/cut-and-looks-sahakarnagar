'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category_name?: string | null;
  price_inr?: number | null;
  starting_price_inr?: number | null;
  duration_minutes?: number | null;
}

interface Slot {
  time: string;
  display: string;
  available: boolean;
  reason?: string;
}

interface BookingFormProps {
  services: Service[];
  businessPhone: string;
}

export default function BookingForm({ services, businessPhone }: BookingFormProps) {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams?.get('service') || '';

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [preferredStylist, setPreferredStylist] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(true);

  // Slot calculation & loading states
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsMessage, setSlotsMessage] = useState<string>('');
  const [isSalonClosed, setIsSalonClosed] = useState<boolean>(false);

  // Submission states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Set min date to today YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch slots whenever appointmentDate changes
  useEffect(() => {
    if (!appointmentDate) {
      setSlots([]);
      setSlotsMessage('');
      setIsSalonClosed(false);
      return;
    }

    async function fetchSlots() {
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedTimeSlot('');
      setSlotsMessage('');
      setIsSalonClosed(false);

      try {
        const res = await fetch(`/api/appointments/slots?date=${appointmentDate}`);
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.isClosed) {
            setIsSalonClosed(true);
            setSlotsMessage(data.message || 'The salon is closed on this day.');
            setSlots([]);
          } else {
            setSlots(data.slots || []);
            if (!data.slots || data.slots.length === 0) {
              setSlotsMessage('No available slots for this date.');
            }
          }
        } else {
          setSlotsMessage(data.error || 'Failed to check slot availability.');
        }
      } catch (err) {
        setSlotsMessage('Network error while checking slot availability.');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [appointmentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }

    if (!appointmentDate) {
      setErrorMessage('Please choose your preferred appointment date.');
      return;
    }

    if (!selectedTimeSlot) {
      setErrorMessage('Please choose an available time slot.');
      return;
    }

    if (!privacyConsent) {
      setErrorMessage('Please accept the privacy consent to submit your booking.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        service_id: selectedServiceId || null,
        appointment_date: appointmentDate,
        start_time: selectedTimeSlot,
        preferred_stylist: preferredStylist.trim() || null,
        customer_message: customerMessage.trim() || null,
        privacy_consent: privacyConsent,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBookingSuccess(data.appointment);
      } else {
        setErrorMessage(data.error || 'Failed to submit appointment request. Please try again.');
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully booked, render confirmation screen
  if (bookingSuccess) {
    const cleanBusinessPhone = businessPhone.replace(/[^\d]/g, '');
    const waText = encodeURIComponent(
      `Hello Cut & Looks Sahakar Nagar, I have submitted an appointment request with Reference: ${bookingSuccess.bookingReference} for ${bookingSuccess.serviceName} on ${bookingSuccess.appointmentDate} at ${bookingSuccess.startTime}.`
    );
    const waUrl = `https://wa.me/${cleanBusinessPhone}?text=${waText}`;

    return (
      <div className="bg-salon-card rounded-2xl border border-salon-gold/50 p-8 sm:p-12 max-w-2xl mx-auto shadow-2xl animate-fade-in text-center space-y-6">
        <div className="w-16 h-16 bg-salon-gold/20 text-salon-gold rounded-full flex items-center justify-center mx-auto border border-salon-gold/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            Appointment Request Received
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
            Thank You, {bookingSuccess.customerName}!
          </h2>
          <p className="text-sm text-salon-muted max-w-md mx-auto">
            Your appointment request has been recorded in our system. Our team will verify and confirm your slot shortly.
          </p>
        </div>

        {/* Booking Reference Card */}
        <div className="bg-salon-dark p-6 rounded-xl border border-salon-cardBorder text-left space-y-3">
          <div className="flex justify-between items-center border-b border-salon-cardBorder/60 pb-3">
            <span className="text-xs text-salon-muted uppercase font-medium">Booking Reference</span>
            <span className="text-base font-mono font-bold text-salon-gold">
              {bookingSuccess.bookingReference}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-salon-cream/90">
            <span className="text-salon-muted">Selected Service:</span>
            <span className="font-medium text-right">{bookingSuccess.serviceName}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-salon-cream/90">
            <span className="text-salon-muted">Date:</span>
            <span className="font-medium">{bookingSuccess.appointmentDate}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-salon-cream/90">
            <span className="text-salon-muted">Requested Time:</span>
            <span className="font-medium">{bookingSuccess.startTime}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-salon-muted">Current Status:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pending Salon Confirmation
            </span>
          </div>
        </div>

        {/* WhatsApp & Call Action Strip */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow"
          >
            <span>Notify on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setBookingSuccess(null);
              setAppointmentDate('');
              setSelectedTimeSlot('');
              setFullName('');
              setPhone('');
              setEmail('');
              setCustomerMessage('');
            }}
            className="flex-1 inline-flex items-center justify-center space-x-2 bg-salon-dark hover:bg-salon-cardBorder text-salon-cream border border-salon-cardBorder py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>Book Another Appointment</span>
          </button>
        </div>
      </div>
    );
  }

  const selectedServiceObj = services.find((s) => s.id === selectedServiceId);

  return (
    <form onSubmit={handleSubmit} className="bg-salon-card rounded-2xl border border-salon-cardBorder p-6 sm:p-10 shadow-2xl space-y-8">
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl flex items-start space-x-3 text-red-200 text-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
          <div className="flex-grow">
            <p className="font-semibold text-sm">Please Check Your Details</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Step 1: Select Service */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-salon-gold flex items-center space-x-2">
          <Scissors className="w-4 h-4" />
          <span>1. Select Desired Service</span>
        </label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-4 py-3 text-sm text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
        >
          <option value="">General Hair Styling & Consultation (30 mins)</option>
          {services.map((srv) => {
            let priceNote = 'Contact for pricing';
            if (srv.price_inr) priceNote = `₹${srv.price_inr}`;
            else if (srv.starting_price_inr) priceNote = `From ₹${srv.starting_price_inr}`;
            return (
              <option key={srv.id} value={srv.id}>
                {srv.name} — {priceNote} ({srv.duration_minutes || 30} mins)
              </option>
            );
          })}
        </select>
        {selectedServiceObj && (
          <p className="text-xs text-salon-muted bg-salon-dark/50 p-2.5 rounded border border-salon-cardBorder/40">
            Selected: <strong className="text-salon-cream">{selectedServiceObj.name}</strong> • Duration: ~{selectedServiceObj.duration_minutes || 30} mins
          </p>
        )}
      </div>

      {/* Step 2: Choose Appointment Date */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-salon-gold flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4" />
          <span>2. Select Preferred Date</span>
        </label>
        <input
          type="date"
          min={todayStr}
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-4 py-3 text-sm text-salon-cream focus:outline-none focus:border-salon-gold transition-colors [color-scheme:dark]"
          required
        />
        <p className="text-[11px] text-salon-muted">
          Our salon operates daily until 9:00 PM. Book up to 14 days in advance.
        </p>
      </div>

      {/* Step 3: Choose Time Slot */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-salon-gold flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>3. Choose Available Time Slot</span>
        </label>

        {!appointmentDate ? (
          <div className="p-6 bg-salon-dark/50 rounded-xl border border-dashed border-salon-cardBorder text-center text-xs text-salon-muted">
            Please pick a date first to view real-time available time slots.
          </div>
        ) : loadingSlots ? (
          <div className="p-8 bg-salon-dark/50 rounded-xl border border-salon-cardBorder text-center space-y-2">
            <Loader2 className="w-6 h-6 text-salon-gold animate-spin mx-auto" />
            <p className="text-xs text-salon-muted">Checking salon opening hours and booked slots...</p>
          </div>
        ) : isSalonClosed ? (
          <div className="p-6 bg-amber-950/30 border border-amber-800/40 rounded-xl text-center space-y-2 text-amber-200 text-xs">
            <p className="font-semibold text-sm">Salon Closed on this Day</p>
            <p>{slotsMessage}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 bg-salon-dark/50 rounded-xl border border-salon-cardBorder text-center text-xs text-salon-muted">
            {slotsMessage || 'No slots available for this date. Please choose another date.'}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTimeSlot(slot.time)}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  selectedTimeSlot === slot.time
                    ? 'bg-salon-gold text-salon-dark border-salon-gold shadow-md'
                    : slot.available
                    ? 'bg-salon-dark text-salon-cream border-salon-cardBorder hover:border-salon-gold hover:text-salon-gold'
                    : 'bg-salon-dark/40 text-salon-muted/40 border-salon-cardBorder/30 cursor-not-allowed line-through'
                }`}
                title={slot.reason || slot.display}
              >
                {slot.display}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 4: Customer Contact Details */}
      <div className="space-y-4 pt-4 border-t border-salon-cardBorder/60">
        <label className="text-xs uppercase tracking-wider font-semibold text-salon-gold flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>4. Your Contact Details</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Full Name <span className="text-salon-gold">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Mobile Number (WhatsApp) <span className="text-salon-gold">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Email Address <span className="text-salon-muted/60">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Preferred Stylist <span className="text-salon-muted/60">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Any available stylist"
              value={preferredStylist}
              onChange={(e) => setPreferredStylist(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-salon-muted block mb-1">
            Special Requests / Message <span className="text-salon-muted/60">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Tell us if you have any hair sensitivity, styling reference, or preference..."
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-3 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
          />
        </div>

        {/* Privacy Policy Consent */}
        <div className="flex items-start space-x-3 pt-2">
          <input
            type="checkbox"
            id="privacyConsent"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-1 rounded bg-salon-dark border-salon-cardBorder text-salon-gold focus:ring-salon-gold"
          />
          <label htmlFor="privacyConsent" className="text-xs text-salon-muted leading-relaxed">
            I agree to the <a href="/privacy-policy" className="text-salon-gold underline">Privacy Policy</a> and allow Cut & Looks Sahakar Nagar to process my contact details to manage and confirm this appointment request.
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Request...</span>
          </>
        ) : (
          <>
            <CalendarIcon className="w-4 h-4" />
            <span>Confirm & Request Appointment</span>
          </>
        )}
      </button>
    </form>
  );
}
