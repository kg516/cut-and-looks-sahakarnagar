'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  alt_text: string | null;
  display_order: number;
}

interface GalleryViewProps {
  initialImages: GalleryImage[];
}

export default function GalleryView({ initialImages }: GalleryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(initialImages.map((img) => img.category || 'General').filter(Boolean)))];

  const filteredImages = selectedCategory === 'All'
    ? initialImages
    : initialImages.filter((img) => (img.category || 'General') === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredImages.length : 0
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredImages.length]);

  const activeImage = activeLightboxIndex !== null ? filteredImages[activeLightboxIndex] : null;

  return (
    <div className="space-y-10">
      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setActiveLightboxIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-salon-gold text-salon-dark shadow'
                : 'bg-salon-card text-salon-muted hover:text-salon-cream hover:bg-salon-cardBorder'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Images */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-20 bg-salon-card/40 rounded-xl border border-salon-cardBorder text-salon-muted text-sm">
          No images available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className="group relative h-64 sm:h-72 rounded-xl overflow-hidden cursor-pointer bg-salon-dark border border-salon-cardBorder hover:border-salon-gold/60 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              <img
                src={img.image_url}
                alt={img.alt_text || img.caption || 'Cut & Looks Sahakar Nagar'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient & Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-salon-darker via-salon-darker/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="p-2 bg-salon-dark/80 backdrop-blur-sm rounded-full text-salon-gold">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  {img.category && (
                    <span className="text-[10px] uppercase font-bold text-salon-gold tracking-widest block mb-1">
                      {img.category}
                    </span>
                  )}
                  {img.caption && (
                    <p className="text-xs font-medium text-salon-cream line-clamp-2">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Lightbox Modal */}
      {activeImage && activeLightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex(null);
            }}
            className="absolute top-6 right-6 p-3 rounded-full bg-salon-card/80 text-salon-cream hover:text-salon-gold hover:bg-salon-card transition-colors z-20"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex(
                (activeLightboxIndex - 1 + filteredImages.length) % filteredImages.length
              );
            }}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-salon-card/80 text-salon-cream hover:text-salon-gold hover:bg-salon-card transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Modal Content */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.image_url}
              alt={activeImage.alt_text || activeImage.caption || 'Cut & Looks Sahakar Nagar'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-salon-cardBorder"
            />

            <div className="mt-4 text-center space-y-1">
              {activeImage.category && (
                <span className="text-[11px] uppercase tracking-widest text-salon-gold font-semibold">
                  {activeImage.category}
                </span>
              )}
              {activeImage.caption && (
                <p className="text-sm text-salon-cream font-medium max-w-xl">
                  {activeImage.caption}
                </p>
              )}
              <p className="text-[10px] text-salon-muted pt-1">
                Image {activeLightboxIndex + 1} of {filteredImages.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex(
                (activeLightboxIndex + 1) % filteredImages.length
              );
            }}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-salon-card/80 text-salon-cream hover:text-salon-gold hover:bg-salon-card transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
