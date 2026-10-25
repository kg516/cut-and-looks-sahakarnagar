import React from 'react';
import { MapPin, Phone, Clock, Star, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';

interface FooterProps {
  businessSettings?: {
    business_name?: string;
    address?: string;
    phone?: string;
    email?: string | null;
    google_maps_url?: string;
    google_reviews_url?: string;
    opening_hours?: any;
  };
}

export default function Footer({ businessSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const businessName = businessSettings?.business_name || 'Cut & Looks Sahakar Nagar';
  const address = businessSettings?.address || '3H5V+G4C, 2, 14th Main Road, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092, India';
  const phone = businessSettings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const mapsUrl = businessSettings?.google_maps_url || 'https://www.google.com/maps/place/Cut+%26+Looks+Sahakar+Nagar/data=!4m2!3m1!1s0x0:0x385d0adee88321ee';
  const reviewsUrl = businessSettings?.google_reviews_url || 'https://www.google.com/search?q=Cut+%26+Looks+Sahakar+Nagar+Google+reviews';

  return (
    <footer className="bg-salon-darker text-salon-muted border-t border-salon-cardBorder/60 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Salon Identity */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-wider text-salon-cream">
                CUT <span className="text-salon-gold font-normal">&</span> LOOKS
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-salon-muted font-sans font-medium -mt-1">
                Sahakar Nagar • Unisex Salon
              </span>
            </div>
            <p className="text-sm text-salon-muted leading-relaxed">
              Professional unisex hair and beauty salon in Sahakar Nagar, Bengaluru. Dedicated to precision haircuts, modern styling, restorative hair spas, and personalized grooming.
            </p>
            <div className="pt-2">
              <a
                href={reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-medium text-salon-gold hover:text-salon-goldLight transition-colors bg-salon-card/80 px-3 py-1.5 rounded border border-salon-cardBorder"
              >
                <Star className="w-3.5 h-3.5 fill-salon-gold text-salon-gold" />
                <span>193 Reported Google Reviews</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-salon-cream mb-4 font-sans">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/', label: 'Home Page' },
                { href: '/about', label: 'About Our Salon' },
                { href: '/services', label: 'Services & Pricing' },
                { href: '/gallery', label: 'Hairstyle & Salon Gallery' },
                { href: '/reviews', label: 'Customer Reviews' },
                { href: '/contact', label: 'Contact & Directions' },
                { href: '/book', label: 'Book an Appointment' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex items-center space-x-1.5 text-salon-muted hover:text-salon-cream transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-salon-gold/60 group-hover:text-salon-gold group-hover:translate-x-0.5 transition-all" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-salon-cream mb-4 font-sans">
              Location & Contact
            </h4>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-4 h-4 text-salon-gold mt-1 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-salon-cream/90">{address}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-salon-gold hover:underline font-medium pt-1"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <Phone className="w-4 h-4 text-salon-gold flex-shrink-0" />
              <div>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-salon-cream font-medium hover:text-salon-gold transition-colors"
                >
                  {phone}
                </a>
                <p className="text-xs text-salon-muted">Clickable phone call</p>
              </div>
            </div>
          </div>

          {/* Column 4: Salon Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-salon-cream mb-4 font-sans">
              Business Hours
            </h4>
            <div className="bg-salon-card/50 rounded-lg p-4 border border-salon-cardBorder space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-salon-gold font-medium mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Reported Salon Hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-salon-cardBorder/40 text-salon-cream/80">
                <span>Monday – Friday</span>
                <span className="font-medium text-salon-cream">9:30 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-salon-cardBorder/40 text-salon-cream/80">
                <span>Saturday – Sunday</span>
                <span className="font-medium text-salon-cream">9:30 AM – 9:00 PM</span>
              </div>
              <p className="text-[11px] text-salon-muted pt-1">
                *Confirmed closing time: 9:00 PM. Specific daily schedules can be confirmed directly with the salon.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-salon-cardBorder/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <p className="text-salon-muted">
            &copy; {currentYear} Cut & Looks Sahakar Nagar. All rights reserved.
          </p>

          <div className="flex items-center space-x-6">
            <a href="/privacy-policy" className="hover:text-salon-cream transition-colors">
              Privacy Policy
            </a>
            <span className="text-salon-cardBorder">•</span>
            <a href="/terms-conditions" className="hover:text-salon-cream transition-colors">
              Terms & Conditions
            </a>
            <span className="text-salon-cardBorder">•</span>
            <a
              href="/admin/login"
              className="text-salon-muted/60 hover:text-salon-gold transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
