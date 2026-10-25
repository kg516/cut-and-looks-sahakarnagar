import React from 'react';
import { getBusinessSettings } from '@/lib/settings';
import ContactForm from '@/components/ContactForm';
import { MapPin, Phone, Clock, Compass, ExternalLink, Calendar, MessageSquare } from 'lucide-react';

export const revalidate = 0;

export default async function ContactPage() {
  const settings = await getBusinessSettings();

  const businessName = settings?.business_name || 'Cut & Looks Sahakar Nagar';
  const address = settings?.address || '3H5V+G4C, 2, 14th Main Road, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092, India';
  const phone = settings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const mapsUrl = settings?.google_maps_url || 'https://www.google.com/maps/place/Cut+%26+Looks+Sahakar+Nagar/data=!4m2!3m1!1s0x0:0x385d0adee88321ee';

  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen">
      {/* Banner */}
      <section className="relative py-20 bg-salon-darker border-b border-salon-cardBorder/60 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Contact & Directions
          </h1>
          <p className="text-salon-muted text-base sm:text-lg max-w-2xl mx-auto">
            Visit our salon in Sahakar Nagar, Bengaluru, or reach out to our team via telephone, online booking, or contact enquiry.
          </p>
        </div>
      </section>

      {/* Main Grid: Details + Form */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address Card */}
            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3 shadow-md">
              <div className="flex items-center space-x-2 text-salon-gold text-xs uppercase font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Our Address</span>
              </div>
              <p className="text-sm text-salon-cream leading-relaxed">{address}</p>
              <div className="pt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-salon-dark hover:bg-salon-cardBorder text-salon-gold px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider border border-salon-cardBorder transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Telephone Call Card */}
            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3 shadow-md">
              <div className="flex items-center space-x-2 text-salon-gold text-xs uppercase font-semibold">
                <Phone className="w-4 h-4" />
                <span>Telephone Contact</span>
              </div>
              <p className="text-xs text-salon-muted">
                Call our salon front desk for quick scheduling or enquiry:
              </p>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-block text-xl font-serif font-bold text-salon-cream hover:text-salon-gold transition-colors"
              >
                {phone}
              </a>
              <p className="text-[11px] text-salon-muted">Clickable phone call on mobile</p>
            </div>

            {/* Operating Hours Card */}
            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3 shadow-md">
              <div className="flex items-center space-x-2 text-salon-gold text-xs uppercase font-semibold">
                <Clock className="w-4 h-4" />
                <span>Salon Hours</span>
              </div>
              <div className="text-xs space-y-1.5 text-salon-muted">
                <div className="flex justify-between py-1 border-b border-salon-cardBorder/40">
                  <span className="text-salon-cream font-medium">Monday – Sunday</span>
                  <span className="text-salon-gold font-semibold">Closing at 9:00 PM</span>
                </div>
                <p className="text-[11px] pt-1">
                  *Official reported closing time is 9:00 PM. Please book appointments in advance to secure your preferred slot.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Database-backed Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
