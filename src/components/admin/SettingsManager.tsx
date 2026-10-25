'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  Calendar,
} from 'lucide-react';

interface SettingsManagerProps {
  initialSettings: any;
}

export default function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [businessName, setBusinessName] = useState(initialSettings?.business_name || '');
  const [description, setDescription] = useState(initialSettings?.description || '');
  const [address, setAddress] = useState(initialSettings?.address || '');
  const [phone, setPhone] = useState(initialSettings?.phone || '');
  const [email, setEmail] = useState(initialSettings?.email || '');
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url || '');
  const [mapsUrl, setMapsUrl] = useState(initialSettings?.google_maps_url || '');
  const [reviewsUrl, setReviewsUrl] = useState(initialSettings?.google_reviews_url || '');
  const [seoTitle, setSeoTitle] = useState(initialSettings?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialSettings?.seo_description || '');

  // Opening hours state
  const [hours, setHours] = useState<any>(initialSettings?.opening_hours || {
    monday: { open: '09:30', close: '21:00', isOpen: true },
    tuesday: { open: '09:30', close: '21:00', isOpen: true },
    wednesday: { open: '09:30', close: '21:00', isOpen: true },
    thursday: { open: '09:30', close: '21:00', isOpen: true },
    friday: { open: '09:30', close: '21:00', isOpen: true },
    saturday: { open: '09:30', close: '21:00', isOpen: true },
    sunday: { open: '09:30', close: '21:00', isOpen: true },
  });

  // Booking settings
  const [slotInterval, setSlotInterval] = useState(
    String(initialSettings?.booking_settings?.slot_interval_minutes || 30)
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleHourChange = (day: string, field: string, val: any) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [field]: val,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const bookingSettings = {
      ...(initialSettings?.booking_settings || {}),
      slot_interval_minutes: parseInt(slotInterval, 10) || 30,
    };

    const payload = {
      business_name: businessName.trim(),
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      logo_url: logoUrl.trim() || null,
      google_maps_url: mapsUrl.trim(),
      google_reviews_url: reviewsUrl.trim(),
      opening_hours: hours,
      booking_settings: bookingSettings,
      seo_title: seoTitle.trim(),
      seo_description: seoDescription.trim(),
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Business settings updated and published successfully to the website!' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-salon-cardBorder/60">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold">
            Salon Configuration
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Business Settings
          </h1>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-lg shadow transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center space-x-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-red-950/60 border-red-800 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Core Business Information */}
      <div className="bg-salon-card p-6 sm:p-8 rounded-2xl border border-salon-cardBorder space-y-5">
        <h3 className="font-serif text-xl font-bold text-salon-cream flex items-center space-x-2">
          <Settings className="w-5 h-5 text-salon-gold" />
          <span>Core Business Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Business Name <span className="text-salon-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Contact Telephone Number <span className="text-salon-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Official Business Email <span className="text-salon-muted/60">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. contact@cutandlooks.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Official Logo URL <span className="text-salon-muted/60">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://... logo image link"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-salon-muted block mb-1">
            Physical Salon Address <span className="text-salon-gold">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
          />
        </div>

        <div>
          <label className="text-xs text-salon-muted block mb-1">Salon Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
          />
        </div>
      </div>

      {/* 2. Google Business & Maps Links */}
      <div className="bg-salon-card p-6 sm:p-8 rounded-2xl border border-salon-cardBorder space-y-5">
        <h3 className="font-serif text-xl font-bold text-salon-cream flex items-center space-x-2">
          <Globe className="w-5 h-5 text-salon-gold" />
          <span>Google Listings & External Links</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Google Maps Listing URL <span className="text-salon-gold">*</span>
            </label>
            <input
              type="url"
              required
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Google Reviews Search URL <span className="text-salon-gold">*</span>
            </label>
            <input
              type="url"
              required
              value={reviewsUrl}
              onChange={(e) => setReviewsUrl(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Opening Hours Configuration */}
      <div className="bg-salon-card p-6 sm:p-8 rounded-2xl border border-salon-cardBorder space-y-5">
        <h3 className="font-serif text-xl font-bold text-salon-cream flex items-center space-x-2">
          <Clock className="w-5 h-5 text-salon-gold" />
          <span>Daily Opening Hours (Reported Closing: 9:00 PM)</span>
        </h3>

        <div className="divide-y divide-salon-cardBorder/40">
          {days.map((day) => {
            const dayData = hours[day] || { open: '09:30', close: '21:00', isOpen: true };
            return (
              <div key={day} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <span className="capitalize font-semibold text-salon-cream w-28">
                  {day}
                </span>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Boolean(dayData.isOpen)}
                      onChange={(e) => handleHourChange(day, 'isOpen', e.target.checked)}
                      className="rounded bg-salon-dark border-salon-cardBorder text-salon-gold focus:ring-salon-gold"
                    />
                    <span className="text-salon-muted">Open</span>
                  </label>

                  {dayData.isOpen && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={dayData.open || '09:30'}
                        onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                        className="bg-salon-dark border border-salon-cardBorder rounded p-1.5 text-xs text-salon-cream [color-scheme:dark]"
                      />
                      <span className="text-salon-muted">to</span>
                      <input
                        type="time"
                        value={dayData.close || '21:00'}
                        onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                        className="bg-salon-dark border border-salon-cardBorder rounded p-1.5 text-xs text-salon-cream [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="text-xs text-salon-muted block mb-1">
            Appointment Slot Interval (Minutes)
          </label>
          <select
            value={slotInterval}
            onChange={(e) => setSlotInterval(e.target.value)}
            className="w-48 bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
          >
            <option value="15">15 Minutes</option>
            <option value="20">20 Minutes</option>
            <option value="30">30 Minutes (Recommended)</option>
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
          </select>
        </div>
      </div>

      {/* 4. Local SEO Configuration */}
      <div className="bg-salon-card p-6 sm:p-8 rounded-2xl border border-salon-cardBorder space-y-5">
        <h3 className="font-serif text-xl font-bold text-salon-cream flex items-center space-x-2">
          <Globe className="w-5 h-5 text-salon-gold" />
          <span>Local SEO Configuration</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-salon-muted block mb-1">SEO Page Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">SEO Meta Description</label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>
    </form>
  );
}
