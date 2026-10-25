import React from 'react';
import { query } from '@/lib/db';
import ServicesCatalogue from '@/components/ServicesCatalogue';
import { Sparkles, Calendar, Phone } from 'lucide-react';
import { getBusinessSettings } from '@/lib/settings';

export const revalidate = 0; // Dynamic database fetching

export default async function ServicesPage() {
  const settings = await getBusinessSettings();

  const categories = await query(
    'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
  );

  const services = await query(`
    SELECT s.*, c.name as category_name, c.slug as category_slug
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.is_active = 1
    ORDER BY s.display_order ASC, s.name ASC
  `);

  const phone = settings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen">
      {/* Banner */}
      <section className="relative py-20 bg-salon-darker border-b border-salon-cardBorder/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            Salon Menu & Pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Our Services & Care
          </h1>
          <p className="max-w-2xl mx-auto text-salon-muted text-base sm:text-lg">
            Explore our unisex haircut, styling, coloring, and grooming offerings. Select any service to request your preferred appointment date and time.
          </p>
        </div>
      </section>

      {/* Main Interactive Catalogue */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesCatalogue
          initialCategories={categories}
          initialServices={services}
        />
      </section>

      {/* Custom Consultation Callout */}
      <section className="py-16 bg-salon-darker border-t border-salon-cardBorder/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Sparkles className="w-8 h-8 text-salon-gold mx-auto" />
          <h2 className="font-serif text-3xl font-bold text-salon-cream">
            Need a Custom Styling Consultation?
          </h2>
          <p className="text-sm text-salon-muted max-w-xl mx-auto leading-relaxed">
            Unsure which hair colour technique or hair spa treatment is right for your texture? Speak directly with our styling team or visit our salon in Sahakar Nagar.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider px-8 py-3.5 rounded shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Book An Appointment</span>
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-card hover:bg-salon-cardBorder text-salon-cream border border-salon-cardBorder text-xs uppercase tracking-wider font-semibold px-6 py-3.5 rounded"
            >
              <Phone className="w-4 h-4 text-salon-gold" />
              <span>Call {phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
