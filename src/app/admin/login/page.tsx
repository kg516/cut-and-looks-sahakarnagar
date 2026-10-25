'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      setErrorMessage('Network error during authentication. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-salon-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-salon-card rounded-2xl border border-salon-cardBorder p-8 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-salon-dark text-salon-gold rounded-xl flex items-center justify-center mx-auto border border-salon-cardBorder">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-salon-cream">
            Admin Portal
          </h1>
          <p className="text-xs text-salon-muted">
            Cut & Looks Sahakar Nagar Management System
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-lg flex items-center space-x-2.5 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs text-salon-muted uppercase tracking-wider block mb-1.5 font-medium">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cutandlooks.com"
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-10 pr-4 py-2.5 text-xs text-salon-cream placeholder-salon-muted/60 focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-salon-muted uppercase tracking-wider block mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-10 pr-4 py-2.5 text-xs text-salon-cream placeholder-salon-muted/60 focus:outline-none focus:border-salon-gold transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-semibold text-xs uppercase tracking-widest shadow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-salon-cardBorder/60">
          <a
            href="/"
            className="text-xs text-salon-muted hover:text-salon-gold transition-colors"
          >
            &larr; Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
