import React from 'react';
import { query } from '@/lib/db';
import GalleryView from '@/components/GalleryView';
import { Calendar } from 'lucide-react';

export const revalidate = 0;

export default async function GalleryPage() {
  const images = await query(
    'SELECT * FROM gallery_images WHERE is_published = 1 ORDER BY display_order ASC, created_at DESC'
  );

  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen">
      {/* Banner */}
      <section className="relative py-20 bg-salon-darker border-b border-salon-cardBorder/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
            Visual Portfolio
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Salon Gallery & Hair Work
          </h1>
          <p className="max-w-2xl mx-auto text-salon-muted text-base sm:text-lg">
            Browse our work featuring modern men&apos;s haircuts and fades, women&apos;s styling, dimensional hair colors, and salon interiors.
          </p>
        </div>
      </section>

      {/* Main Gallery Grid with Lightbox */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryView initialImages={images} />
      </section>

      {/* Booking Callout */}
      <section className="py-16 bg-salon-darker border-t border-salon-cardBorder/60 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          <h2 className="font-serif text-3xl font-bold text-salon-cream">
            Inspired by a Style in Our Gallery?
          </h2>
          <p className="text-sm text-salon-muted leading-relaxed">
            Show your preferred hairstyle or treatment photo to our styling team during your visit. Request an appointment time today.
          </p>
          <div className="pt-2">
            <a
              href="/book"
              className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider px-8 py-3.5 rounded shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
