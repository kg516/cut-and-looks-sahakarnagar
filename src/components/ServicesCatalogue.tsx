'use client';

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, Scissors, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface Service {
  id: string;
  category_id: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price_inr: number | null;
  starting_price_inr: number | null;
  duration_minutes: number | null;
  is_active: number;
}

interface ServicesCatalogueProps {
  initialCategories: Category[];
  initialServices: Service[];
}

export default function ServicesCatalogue({
  initialCategories,
  initialServices,
}: ServicesCatalogueProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = useMemo(() => {
    return initialServices.filter((service) => {
      // Category check
      if (selectedCategory !== 'all') {
        const matchesCategory =
          service.category_slug === selectedCategory ||
          service.category_id === selectedCategory;
        if (!matchesCategory) return false;
      }

      // Search term check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = service.name.toLowerCase().includes(query);
        const matchesDesc = (service.description || '').toLowerCase().includes(query);
        const matchesCat = (service.category_name || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [initialServices, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-salon-cardBorder/60">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-salon-gold text-salon-dark shadow'
                : 'bg-salon-card text-salon-muted hover:text-salon-cream hover:bg-salon-cardBorder'
            }`}
          >
            All Services ({initialServices.length})
          </button>

          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-salon-gold text-salon-dark shadow'
                  : 'bg-salon-card text-salon-muted hover:text-salon-cream hover:bg-salon-cardBorder'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-salon-card border border-salon-cardBorder rounded-lg pl-10 pr-4 py-2 text-xs text-salon-cream placeholder-salon-muted focus:outline-none focus:border-salon-gold transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-salon-card/40 rounded-2xl border border-salon-cardBorder/60 space-y-4">
          <Scissors className="w-10 h-10 text-salon-muted/60 mx-auto" />
          <h3 className="font-serif text-2xl text-salon-cream">No Services Found</h3>
          <p className="text-xs text-salon-muted max-w-sm mx-auto">
            We couldn&apos;t find any service matching &ldquo;{searchQuery}&rdquo;. Try another search keyword or switch categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs uppercase tracking-wider text-salon-gold hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            // Pricing display logic
            let priceDisplay = 'Contact us for pricing';
            if (service.price_inr !== null && service.price_inr !== undefined) {
              priceDisplay = `₹${service.price_inr}`;
            } else if (
              service.starting_price_inr !== null &&
              service.starting_price_inr !== undefined
            ) {
              priceDisplay = `Starting from ₹${service.starting_price_inr}`;
            }

            return (
              <div
                key={service.id}
                className="bg-salon-card rounded-xl overflow-hidden border border-salon-cardBorder hover:border-salon-gold/50 transition-all duration-300 flex flex-col justify-between group shadow-md hover:shadow-xl"
              >
                {/* Service Visual */}
                <div className="relative h-52 w-full overflow-hidden bg-salon-dark">
                  <img
                    src={
                      service.image_url ||
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {service.category_name && (
                    <span className="absolute top-3 left-3 bg-salon-dark/85 backdrop-blur-sm text-salon-gold border border-salon-gold/30 text-[10px] uppercase font-semibold px-2.5 py-1 rounded">
                      {service.category_name}
                    </span>
                  )}
                </div>

                {/* Details & Description */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-salon-cream group-hover:text-salon-gold transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-salon-muted leading-relaxed mt-2">
                      {service.description}
                    </p>
                  </div>

                  {/* Price & Duration */}
                  <div className="pt-4 border-t border-salon-cardBorder/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-salon-muted block font-medium">
                        Pricing
                      </span>
                      <span className="text-sm font-semibold text-salon-gold">
                        {priceDisplay}
                      </span>
                    </div>

                    {service.duration_minutes && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-salon-muted block font-medium">
                          Duration
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-salon-cream/80 font-medium">
                          <Clock className="w-3 h-3 text-salon-gold" />
                          <span>~{service.duration_minutes} mins</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking CTA */}
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
      )}
    </div>
  );
}
