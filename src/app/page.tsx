import React from 'react';
import { query } from '@/lib/db';
import { getBusinessSettings } from '@/lib/settings';
import {
  Calendar,
  Sparkles,
  Scissors,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  ExternalLink,
  Shield,
  Smile,
  HeartHandshake,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0; // Live database fetching on each request

export default async function HomePage() {
  const settings = await getBusinessSettings();

  // Fetch active categories and services from real database
  const categories = await query(
    'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC LIMIT 6'
  );

  const featuredServices = await query(`
    SELECT s.*, c.name as category_name
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.is_active = 1
    ORDER BY s.display_order ASC
    LIMIT 6
  `);

  // Fetch preview gallery images
  const galleryPreview = await query(
    'SELECT * FROM gallery_images WHERE is_published = 1 ORDER BY display_order ASC LIMIT 6'
  );

  const businessName = settings?.business_name || 'Cut & Looks Sahakar Nagar';
  const phone = settings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const mapsUrl = settings?.google_maps_url || 'https://www.google.com/maps/place/Cut+%26+Looks+Sahakar+Nagar/data=!4m2!3m1!1s0x0:0x385d0adee88321ee';
  const reviewsUrl = settings?.google_reviews_url || 'https://www.google.com/search?q=Cut+%26+Looks+Sahakar+Nagar+Google+reviews';

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-salon-darker overflow-hidden">
        {/* Hero Background Image with Subtle Luxury Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=2000&q=85"
            alt="Cut & Looks Sahakar Nagar Ambiance"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-salon-dark via-salon-dark/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center space-x-2 bg-salon-card/90 border border-salon-gold/30 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-salon-gold" />
            <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-sans font-medium">
              Premium Unisex Hair & Beauty Care
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-salon-cream mb-6 leading-[1.15]">
            Your Style. Your Confidence.{' '}
            <span className="gold-gradient-text block sm:inline font-serif italic">Your Salon.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-salon-cream/80 leading-relaxed font-sans font-normal mb-10">
            Discover professional hair styling, grooming, and beauty services at Cut & Looks Sahakar Nagar. Enjoy a personalised salon experience designed around your style.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <a
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <Calendar className="w-4 h-4 text-salon-dark" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-card/80 hover:bg-salon-card text-salon-cream border border-salon-cardBorder hover:border-salon-gold/50 font-medium text-sm tracking-wider px-8 py-4 rounded-md transition-all duration-200"
            >
              <Scissors className="w-4 h-4 text-salon-gold" />
              <span>Explore Our Services</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. QUICK INFORMATION STRIP */}
      <section className="bg-salon-card border-y border-salon-cardBorder relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Salon Name & Locality */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-salon-dark rounded-lg text-salon-gold border border-salon-cardBorder">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-salon-muted font-medium">Location</p>
                <p className="text-sm font-semibold text-salon-cream">{businessName}</p>
                <p className="text-xs text-salon-muted">Sahakar Nagar, Bengaluru</p>
              </div>
            </div>

            {/* Telephone Call */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-salon-dark rounded-lg text-salon-gold border border-salon-cardBorder">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-salon-muted font-medium">Contact Phone</p>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-sm font-semibold text-salon-cream hover:text-salon-gold transition-colors"
                >
                  {phone}
                </a>
                <p className="text-xs text-salon-muted">Click to call salon</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-salon-dark rounded-lg text-salon-gold border border-salon-cardBorder">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-salon-muted font-medium">Reported Closing</p>
                <p className="text-sm font-semibold text-salon-cream">Open Daily until 9:00 PM</p>
                <p className="text-xs text-salon-muted">Confirmed closing time</p>
              </div>
            </div>

            {/* Directions Action */}
            <div className="flex sm:justify-end">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-dark hover:bg-salon-darker text-salon-cream text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded border border-salon-gold/40 hover:border-salon-gold transition-all"
              >
                <Compass className="w-4 h-4 text-salon-gold" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 text-salon-muted" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT PREVIEW SECTION */}
      <section className="py-20 lg:py-24 bg-salon-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image Collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-salon-cardBorder">
                <img
                  src="https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80"
                  alt="Styling at Cut & Looks Sahakar Nagar"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-salon-darker/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-salon-card/90 backdrop-blur-md rounded-xl border border-salon-cardBorder/80">
                  <p className="text-xs font-medium text-salon-gold uppercase tracking-widest mb-1">
                    Unisex Hair & Beauty
                  </p>
                  <p className="text-sm text-salon-cream font-medium">
                    Personalised styling consultations tailored to your routine and preference.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Text Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 text-salon-gold text-xs uppercase tracking-[0.2em] font-semibold">
                <Scissors className="w-3.5 h-3.5" />
                <span>About Our Salon</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-salon-cream leading-tight">
                A Salon Experience Designed Around You
              </h2>

              <p className="text-salon-cream/80 text-base sm:text-lg leading-relaxed">
                At Cut & Looks Sahakar Nagar, we want every visit to feel comfortable, personal, and focused on your style. Explore our services, discuss your preferred look, and request an appointment with our team.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-3 p-3.5 bg-salon-card/40 rounded-lg border border-salon-cardBorder/50">
                  <CheckCircle2 className="w-4 h-4 text-salon-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-salon-cream/90 font-medium">
                    Attentive consultation before every cut or treatment
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3.5 bg-salon-card/40 rounded-lg border border-salon-cardBorder/50">
                  <CheckCircle2 className="w-4 h-4 text-salon-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-salon-cream/90 font-medium">
                    Clean, welcoming workstations & professional care
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-4">
                <a
                  href="/about"
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-salon-gold hover:text-salon-goldLight group"
                >
                  <span>Learn more about our salon</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SERVICES SECTION */}
      <section className="py-20 lg:py-24 bg-salon-darker border-t border-salon-cardBorder/60" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold mb-3 block">
              Curated Offerings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-salon-cream mb-4">
              Featured Salon Services
            </h2>
            <p className="text-salon-muted text-sm sm:text-base">
              Explore our core styling, hair care, and grooming options. Prices and durations reflect owner-approved settings.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service: any) => {
              // Pricing display logic adhering strictly to prompt requirements
              let priceDisplay = 'Contact us for pricing';
              if (service.price_inr !== null && service.price_inr !== undefined) {
                priceDisplay = `₹${service.price_inr}`;
              } else if (service.starting_price_inr !== null && service.starting_price_inr !== undefined) {
                priceDisplay = `Starting from ₹${service.starting_price_inr}`;
              }

              return (
                <div
                  key={service.id}
                  className="bg-salon-card rounded-xl overflow-hidden border border-salon-cardBorder hover:border-salon-gold/50 transition-all duration-300 flex flex-col group shadow-md hover:shadow-xl"
                >
                  {/* Service Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-salon-dark">
                    <img
                      src={service.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {service.category_name && (
                      <span className="absolute top-3 left-3 bg-salon-dark/85 backdrop-blur-sm text-salon-gold border border-salon-gold/30 text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                        {service.category_name}
                      </span>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-salon-cream group-hover:text-salon-gold transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-salon-muted leading-relaxed mt-2 line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-salon-cardBorder/60 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-salon-muted uppercase font-medium">Pricing</p>
                        <p className="text-sm font-semibold text-salon-gold">
                          {priceDisplay}
                        </p>
                      </div>

                      {service.duration_minutes && (
                        <div className="text-right">
                          <p className="text-[11px] text-salon-muted uppercase font-medium">Duration</p>
                          <p className="text-xs font-medium text-salon-cream/80">
                            ~{service.duration_minutes} mins
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Book This Service Button */}
                    <a
                      href={`/book?service=${service.id}`}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-salon-dark hover:bg-salon-gold text-salon-cream hover:text-salon-dark text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded border border-salon-cardBorder transition-all duration-200"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book This Service</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/services"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-salon-gold hover:text-salon-goldLight border-b border-salon-gold pb-1 transition-colors"
            >
              <span>View complete services catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-20 lg:py-24 bg-salon-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold mb-3 block">
              The Cut & Looks Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-salon-cream mb-4">
              Why Visit Cut & Looks
            </h2>
            <p className="text-salon-muted text-sm sm:text-base">
              A comfortable environment where personal style, precision cutting, and friendly attention come together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Scissors,
                title: 'Personalised Styling Consultation',
                desc: 'Every service begins by understanding your desired look, hair texture, and styling preferences.',
              },
              {
                icon: Sparkles,
                title: 'Service Options for Every Style',
                desc: 'From classic men haircuts and beard lines to creative women layering, hair spas, and hair colour.',
              },
              {
                icon: Calendar,
                title: 'Convenient Appointment Requests',
                desc: 'Select your preferred day and time slot online or contact us directly on phone or WhatsApp.',
              },
              {
                icon: HeartHandshake,
                title: 'Customer-Focused Experience',
                desc: 'We strive to provide a relaxed, hygienic, and attentive experience from reception to final finish.',
              },
              {
                icon: MapPin,
                title: 'Easy Location & Access',
                desc: 'Conveniently situated on 14th Main Road in Sahakar Nagar, Bengaluru with easy access.',
              },
              {
                icon: Shield,
                title: 'Verified Business Standards',
                desc: 'Transparent pricing policies, client privacy protection, and genuine salon care.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-salon-card/50 p-8 rounded-xl border border-salon-cardBorder/60 hover:border-salon-gold/40 transition-all duration-300 space-y-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-salon-dark flex items-center justify-center text-salon-gold border border-salon-cardBorder">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-salon-cream">{feature.title}</h3>
                  <p className="text-xs text-salon-muted leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. GALLERY PREVIEW */}
      <section className="py-20 lg:py-24 bg-salon-darker border-t border-salon-cardBorder/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold mb-2 block">
                Visual Showcase
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
                Salon Gallery & Styles
              </h2>
            </div>
            <a
              href="/gallery"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-salon-gold hover:text-salon-goldLight transition-colors"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPreview.map((item: any) => (
              <div
                key={item.id}
                className="group relative h-48 sm:h-56 rounded-lg overflow-hidden border border-salon-cardBorder/80 bg-salon-dark"
              >
                <img
                  src={item.image_url}
                  alt={item.alt_text || item.caption || 'Cut & Looks Sahakar Nagar'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-salon-darker via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] text-salon-gold font-medium uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-xs text-salon-cream font-medium truncate">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS PREVIEW */}
      <section className="py-20 bg-salon-dark border-t border-salon-cardBorder/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-1 text-salon-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-salon-gold" />
            ))}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
            Client Feedback & Reviews
          </h2>

          <p className="text-base text-salon-cream/80 leading-relaxed">
            Cut & Looks Sahakar Nagar has received over <strong className="text-salon-cream">193 customer reviews on Google</strong>. We invite every visitor to share their genuine styling experience and help others discover our salon.
          </p>

          <p className="text-sm text-salon-muted italic font-serif">
            &ldquo;Have you visited us? Share your experience on Google.&rdquo;
          </p>

          <div className="pt-2">
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-salon-card hover:bg-salon-cardBorder text-salon-cream text-xs uppercase tracking-wider font-semibold px-6 py-3.5 rounded border border-salon-cardBorder hover:border-salon-gold/50 transition-all shadow-sm"
            >
              <span>Read Verified Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 text-salon-gold" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. APPOINTMENT CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-b from-salon-darker to-salon-dark border-t border-salon-cardBorder/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold block">
            Plan Your Visit
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-salon-cream">
            Ready for Your Next Look?
          </h2>
          <p className="text-salon-muted text-base max-w-xl mx-auto">
            Tell us which service you&apos;re interested in and request a convenient appointment time.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-xs uppercase tracking-wider px-8 py-4 rounded shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4 text-salon-dark" />
              <span>Book Your Appointment</span>
            </a>

            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-card hover:bg-salon-cardBorder text-salon-cream text-xs uppercase tracking-wider font-semibold px-6 py-4 rounded border border-salon-cardBorder transition-all"
            >
              <Phone className="w-4 h-4 text-salon-gold" />
              <span>Call +91 84313 57154</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
