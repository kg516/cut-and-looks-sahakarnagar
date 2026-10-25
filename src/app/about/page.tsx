import React from 'react';
import { getBusinessSettings } from '@/lib/settings';
import {
  Scissors,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Compass,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0;

export default async function AboutPage() {
  const settings = await getBusinessSettings();

  const businessName = settings?.business_name || 'Cut & Looks Sahakar Nagar';
  const address = settings?.address || '3H5V+G4C, 2, 14th Main Road, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092, India';
  const phone = settings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const mapsUrl = settings?.google_maps_url || 'https://www.google.com/maps/place/Cut+%26+Looks+Sahakar+Nagar/data=!4m2!3m1!1s0x0:0x385d0adee88321ee';
  const description = settings?.description || 'Cut & Looks Sahakar Nagar is a premium unisex hair and beauty salon located in Sahakar Nagar, Bengaluru.';

  return (
    <div className="bg-salon-dark text-salon-cream">
      {/* Page Header Banner */}
      <section className="relative py-20 bg-salon-darker border-b border-salon-cardBorder/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            About Our Salon
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Welcome to {businessName}
          </h1>
          <p className="max-w-2xl mx-auto text-salon-muted text-base sm:text-lg">
            Dedicated to precision haircuts, personal styling, and rejuvenating hair and beauty care in Sahakar Nagar, Bengaluru.
          </p>
        </div>
      </section>

      {/* Main Introduction & Philosophy */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-salon-gold text-xs uppercase tracking-[0.2em] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
              Personalised Styling & Dedicated Care
            </h2>

            <p className="text-salon-cream/80 text-base leading-relaxed">
              At Cut & Looks Sahakar Nagar, we believe a great haircut and styling experience begins with attentive listening. Whether you are maintaining a signature classic look, exploring a bold new fade, or seeking restorative treatment for damaged hair, we focus on what complements your facial contours and personal lifestyle.
            </p>

            <p className="text-salon-cream/80 text-base leading-relaxed">
              Our salon welcomes men, women, and families seeking professional hair and beauty services in a clean, hygienic, and relaxed environment. We value honest advice, comfortable seating, and thorough execution from wash to styling.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-salon-card/60 rounded-lg border border-salon-cardBorder">
                <h4 className="text-sm font-semibold text-salon-gold font-sans mb-1">Unisex Expertise</h4>
                <p className="text-xs text-salon-muted">Comprehensive grooming and styling services for all genders and hair types.</p>
              </div>

              <div className="p-4 bg-salon-card/60 rounded-lg border border-salon-cardBorder">
                <h4 className="text-sm font-semibold text-salon-gold font-sans mb-1">Hygienic Environment</h4>
                <p className="text-xs text-salon-muted">Sanitised tools, clean workstations, and attentive salon etiquette.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-salon-cardBorder">
              <img
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"
                alt="Styling in progress at Cut & Looks"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-salon-darker/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-salon-card/95 backdrop-blur-md rounded-xl border border-salon-cardBorder">
                <div className="flex items-center space-x-2 text-salon-gold text-xs font-semibold uppercase mb-1">
                  <Star className="w-3.5 h-3.5 fill-salon-gold" />
                  <span>Verified Client Community</span>
                </div>
                <p className="text-xs text-salon-cream font-medium">
                  Cut & Looks Sahakar Nagar has 193 reported Google reviews from satisfied patrons in Sahakar Nagar and North Bengaluru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Banner */}
      <section className="py-16 bg-salon-darker border-y border-salon-cardBorder/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold mb-2 block">
              What We Do
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
              Comprehensive Haircare & Grooming
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3">
              <Scissors className="w-6 h-6 text-salon-gold" />
              <h3 className="font-serif text-xl font-bold text-salon-cream">Haircuts & Precision Styling</h3>
              <p className="text-xs text-salon-muted leading-relaxed">
                Taper fades, classic cuts, scissor work, women&apos;s layered blowouts, fringes, and textured finishes suited to your routine.
              </p>
            </div>

            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3">
              <Sparkles className="w-6 h-6 text-salon-gold" />
              <h3 className="font-serif text-xl font-bold text-salon-cream">Hair Colour & Spa Treatments</h3>
              <p className="text-xs text-salon-muted leading-relaxed">
                Global hair coloring, root touch-ups, highlights, deep nourishing hair spas, anti-dandruff care, and keratin smoothing.
              </p>
            </div>

            <div className="p-6 bg-salon-card rounded-xl border border-salon-cardBorder space-y-3">
              <ShieldCheck className="w-6 h-6 text-salon-gold" />
              <h3 className="font-serif text-xl font-bold text-salon-cream">Men&apos;s Grooming & Skin Care</h3>
              <p className="text-xs text-salon-muted leading-relaxed">
                Beard sculpting, razor outlining, charcoal detan cleanups, refreshing facials, and scalp massages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Strip */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-salon-card rounded-2xl p-8 sm:p-12 border border-salon-cardBorder grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold block">
              Visit Us Today
            </span>
            <h2 className="font-serif text-3xl font-bold text-salon-cream">
              Conveniently Located in Sahakar Nagar
            </h2>
            <p className="text-sm text-salon-cream/80 leading-relaxed">
              {address}
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-salon-muted">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-salon-gold" />
                <span>Closing Time: 9:00 PM Daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-salon-gold" />
                <a href={`tel:${cleanPhone}`} className="hover:text-salon-cream text-salon-gold">
                  {phone}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <a
              href="/book"
              className="inline-flex items-center justify-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded shadow transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-salon-dark hover:bg-salon-darker text-salon-cream border border-salon-cardBorder text-xs uppercase tracking-wider font-semibold py-3.5 px-6 rounded transition-all"
            >
              <Compass className="w-4 h-4 text-salon-gold" />
              <span>Google Maps Directions</span>
              <ExternalLink className="w-3 h-3 text-salon-muted" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
