'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, User, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please enter a subject.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    if (!privacyConsent) {
      setErrorMessage('Please accept the privacy policy to submit your enquiry.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message || 'Your enquiry has been received successfully!');
        setFullName('');
        setPhone('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to submit enquiry. Please try again or call us directly.');
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-salon-card rounded-2xl border border-salon-cardBorder p-6 sm:p-8 space-y-6 shadow-xl">
      <div>
        <h3 className="font-serif text-2xl font-bold text-salon-cream">
          Send Us an Enquiry
        </h3>
        <p className="text-xs text-salon-muted mt-1">
          Have a question about a hairstyle, bridal package, or salon service? Write to us below.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl flex items-start space-x-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-start space-x-3 text-emerald-200 text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs text-salon-muted block mb-1">
            Full Name <span className="text-salon-gold">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Your Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Mobile Number <span className="text-salon-gold">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="+91 or 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-salon-muted block mb-1">
              Email Address <span className="text-salon-muted/60">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-salon-muted block mb-1">
            Subject <span className="text-salon-gold">*</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Hair colouring enquiry or slot question"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-4 py-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-salon-muted block mb-1">
            Your Message <span className="text-salon-gold">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Write your enquiry here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-3 text-xs text-salon-cream focus:outline-none focus:border-salon-gold transition-colors"
          />
        </div>

        <div className="flex items-start space-x-2.5">
          <input
            type="checkbox"
            id="contactConsent"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-1 rounded bg-salon-dark border-salon-cardBorder text-salon-gold focus:ring-salon-gold"
          />
          <label htmlFor="contactConsent" className="text-xs text-salon-muted leading-relaxed">
            I consent to Cut & Looks Sahakar Nagar storing this enquiry in their database to respond to my query.
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-xs uppercase tracking-widest shadow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Enquiry Message</span>
          </>
        )}
      </button>
    </form>
  );
}
