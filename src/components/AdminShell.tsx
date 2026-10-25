'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, don't show admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/services', label: 'Services & Menu', icon: Scissors },
    { href: '/admin/enquiries', label: 'Customer Enquiries', icon: MessageSquare },
    { href: '/admin/gallery', label: 'Photo Gallery', icon: ImageIcon },
    { href: '/admin/settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-salon-dark text-salon-cream flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-salon-darker border-b border-salon-cardBorder px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-salon-gold" />
          <span className="font-serif text-lg font-bold text-salon-cream">
            Cut & Looks Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-salon-cream hover:text-salon-gold"
          aria-label="Toggle Navigation"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-salon-darker border-r border-salon-cardBorder flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo / Header */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-salon-gold" />
              <span className="font-serif text-xl font-bold tracking-wider text-salon-cream">
                CUT & LOOKS
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-salon-muted font-sans font-medium">
              Admin Management Suite
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-salon-gold text-salon-dark shadow'
                      : 'text-salon-muted hover:text-salon-cream hover:bg-salon-card'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-salon-dark' : 'text-salon-gold'}`} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-6 border-t border-salon-cardBorder/60 space-y-3">
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-salon-dark flex items-center justify-center text-salon-gold border border-salon-cardBorder">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-salon-cream truncate">{user?.full_name}</p>
              <p className="text-[10px] text-salon-muted truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded bg-salon-card hover:bg-salon-cardBorder text-salon-cream text-[11px] font-medium border border-salon-cardBorder transition-colors"
              title="Open public website in new tab"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3 text-salon-muted" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center p-2 rounded bg-salon-card hover:bg-red-950/40 text-salon-muted hover:text-red-400 border border-salon-cardBorder transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
