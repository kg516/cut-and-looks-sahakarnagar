import React from 'react';
import { getBusinessSettings } from '@/lib/settings';
import { Star, ExternalLink, MessageSquare, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function ReviewsPage() {
  const settings = await getBusinessSettings();
  const businessName = settings?.business_name || 'Cut & Looks Sahakar Nagar';
  const reviewsUrl = settings?.google_reviews_url || 'https://www.google.com/search?q=Cut+%26+Looks+Sahakar+Nagar+Google+reviews';

  return (
    <div className="bg-salon-dark text-salon-cream min-h-screen">
      {/* Banner */}
      <section className="relative py-20 bg-salon-darker border-b border-salon-cardBorder/60 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center space-x-1 text-salon-gold justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-salon-gold" />
            ))}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-salon-cream">
            Customer Reviews & Ratings
          </h1>
          <p className="text-salon-muted text-base sm:text-lg max-w-2xl mx-auto">
            Honest feedback from our clients in Sahakar Nagar and Bengaluru. We take pride in building lasting relationships through quality styling.
          </p>
        </div>
      </section>

      {/* Google Reviews Spotlight */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-salon-card rounded-2xl border border-salon-cardBorder p-8 sm:p-12 text-center space-y-8 shadow-xl">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-salon-gold font-semibold">
              Verified Public Listing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-salon-cream">
              193 Reported Google Reviews
            </h2>
            <p className="text-sm text-salon-muted max-w-xl mx-auto leading-relaxed">
              In accordance with our strict transparency policy, all customer reviews for Cut & Looks Sahakar Nagar are hosted directly on Google. We do not curate, fabricate, or manipulate customer testimonials.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-xs uppercase tracking-wider px-8 py-4 rounded-lg shadow-lg transition-all"
            >
              <span>Explore All Reviews on Google</span>
              <ExternalLink className="w-4 h-4 text-salon-dark" />
            </a>

            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-salon-dark hover:bg-salon-darker text-salon-cream border border-salon-cardBorder text-xs uppercase tracking-wider font-semibold px-6 py-4 rounded-lg transition-all"
            >
              <MessageSquare className="w-4 h-4 text-salon-gold" />
              <span>Write a Google Review</span>
            </a>
          </div>

          <div className="border-t border-salon-cardBorder/60 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-salon-dark/50 rounded-xl border border-salon-cardBorder/50 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-salon-gold" />
              <h4 className="text-xs font-semibold text-salon-cream uppercase tracking-wider font-sans">
                Genuine Client Experiences
              </h4>
              <p className="text-xs text-salon-muted">
                Feedback reflects real salon visits, haircuts, beard trimming, hair spas, and coloring sessions.
              </p>
            </div>

            <div className="p-4 bg-salon-dark/50 rounded-xl border border-salon-cardBorder/50 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-salon-gold" />
              <h4 className="text-xs font-semibold text-salon-cream uppercase tracking-wider font-sans">
                Continuous Improvement
              </h4>
              <p className="text-xs text-salon-muted">
                We review client suggestions regularly to enhance salon cleanliness, service timing, and styling comfort.
              </p>
            </div>

            <div className="p-4 bg-salon-dark/50 rounded-xl border border-salon-cardBorder/50 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-salon-gold" />
              <h4 className="text-xs font-semibold text-salon-cream uppercase tracking-wider font-sans">
                Community Focused
              </h4>
              <p className="text-xs text-salon-muted">
                Proud to serve Sahakar Nagar, Byatarayanapura, Kodigehalli, and surrounding North Bengaluru neighbourhoods.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
