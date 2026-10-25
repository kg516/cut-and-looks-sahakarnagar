import React from 'react';
import { query, queryOne } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Scissors,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Calculate live statistics directly from SQLite database
  const totalAppointments = (await queryOne('SELECT count(*) as count FROM appointments'))?.count || 0;
  const pendingAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Pending'"))?.count || 0;
  const confirmedAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Confirmed'"))?.count || 0;
  const completedAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status = 'Completed'"))?.count || 0;
  const cancelledAppointments = (await queryOne("SELECT count(*) as count FROM appointments WHERE status IN ('Cancelled', 'Rejected')"))?.count || 0;

  const totalEnquiries = (await queryOne('SELECT count(*) as count FROM enquiries'))?.count || 0;
  const newEnquiries = (await queryOne("SELECT count(*) as count FROM enquiries WHERE status = 'New'"))?.count || 0;

  const activeServices = (await queryOne('SELECT count(*) as count FROM services WHERE is_active = 1'))?.count || 0;
  const totalGallery = (await queryOne('SELECT count(*) as count FROM gallery_images WHERE is_published = 1'))?.count || 0;

  // Recent 5 appointments
  const recentAppointments = await query(
    'SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5'
  );

  // Recent 5 enquiries
  const recentEnquiries = await query(
    'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5'
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-salon-cardBorder/60">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold">
            Operational Overview
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/admin/appointments"
            className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Bookings</span>
          </a>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Pending Appointments */}
        <div className="bg-salon-card p-5 rounded-xl border border-salon-cardBorder space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Bookings</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-bold text-salon-cream">{pendingAppointments}</p>
          <p className="text-[11px] text-salon-muted">Awaiting confirmation</p>
        </div>

        {/* Confirmed Appointments */}
        <div className="bg-salon-card p-5 rounded-xl border border-salon-cardBorder space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-bold text-salon-cream">{confirmedAppointments}</p>
          <p className="text-[11px] text-salon-muted">Scheduled client visits</p>
        </div>

        {/* Total Appointments */}
        <div className="bg-salon-card p-5 rounded-xl border border-salon-cardBorder space-y-2">
          <div className="flex items-center justify-between text-salon-gold">
            <span className="text-xs font-medium uppercase tracking-wider">Total Requests</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-bold text-salon-cream">{totalAppointments}</p>
          <p className="text-[11px] text-salon-muted">{completedAppointments} completed • {cancelledAppointments} cancelled</p>
        </div>

        {/* New Enquiries */}
        <div className="bg-salon-card p-5 rounded-xl border border-salon-cardBorder space-y-2">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-medium uppercase tracking-wider">New Enquiries</span>
            <MessageSquare className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-bold text-salon-cream">{newEnquiries}</p>
          <p className="text-[11px] text-salon-muted">Total {totalEnquiries} enquiries</p>
        </div>
      </div>

      {/* Catalogue & Content Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-salon-card/50 p-4 rounded-xl border border-salon-cardBorder flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-salon-dark rounded-lg text-salon-gold border border-salon-cardBorder">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-salon-muted uppercase font-medium">Active Catalogue Services</p>
              <p className="text-sm font-semibold text-salon-cream">{activeServices} services published</p>
            </div>
          </div>
          <a href="/admin/services" className="text-xs text-salon-gold hover:underline font-medium">
            Manage &rarr;
          </a>
        </div>

        <div className="bg-salon-card/50 p-4 rounded-xl border border-salon-cardBorder flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-salon-dark rounded-lg text-salon-gold border border-salon-cardBorder">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-salon-muted uppercase font-medium">Published Gallery Photos</p>
              <p className="text-sm font-semibold text-salon-cream">{totalGallery} images live</p>
            </div>
          </div>
          <a href="/admin/gallery" className="text-xs text-salon-gold hover:underline font-medium">
            Manage &rarr;
          </a>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
        <div className="p-6 border-b border-salon-cardBorder/60 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-salon-cream">
              Recent Appointment Requests
            </h2>
            <p className="text-xs text-salon-muted">Latest client submissions recorded in database</p>
          </div>
          <a
            href="/admin/appointments"
            className="text-xs uppercase tracking-wider text-salon-gold hover:text-salon-goldLight font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-salon-muted">
            No appointment requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-dark text-salon-muted uppercase font-semibold border-b border-salon-cardBorder/60">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {recentAppointments.map((appt: any) => {
                  let statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  if (appt.status === 'Confirmed') statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  else if (appt.status === 'Completed') statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                  else if (appt.status === 'Cancelled' || appt.status === 'Rejected') statusBadge = 'bg-red-500/20 text-red-300 border-red-500/30';

                  return (
                    <tr key={appt.id} className="hover:bg-salon-dark/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-salon-gold">
                        {appt.booking_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-salon-cream">{appt.customer_name}</p>
                        <p className="text-[11px] text-salon-muted">{appt.customer_phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="truncate max-w-[180px]">{appt.service_name_snapshot}</p>
                        {appt.service_price_snapshot && (
                          <span className="text-[10px] text-salon-gold">₹{appt.service_price_snapshot}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium">{appt.appointment_date}</p>
                        <p className="text-[11px] text-salon-muted">{appt.start_time}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/admin/appointments?search=${appt.booking_reference}`}
                          className="text-xs text-salon-gold hover:underline font-medium"
                        >
                          Manage
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
        <div className="p-6 border-b border-salon-cardBorder/60 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-salon-cream">
              Recent Customer Enquiries
            </h2>
            <p className="text-xs text-salon-muted">Messages from the contact form</p>
          </div>
          <a
            href="/admin/enquiries"
            className="text-xs uppercase tracking-wider text-salon-gold hover:text-salon-goldLight font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-salon-muted">
            No customer enquiries submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-dark text-salon-muted uppercase font-semibold border-b border-salon-cardBorder/60">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {recentEnquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-salon-dark/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-salon-cream">{enq.customer_name}</p>
                      <p className="text-[11px] text-salon-muted">{enq.customer_phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-salon-cream max-w-[150px] truncate">
                      {enq.subject}
                    </td>
                    <td className="py-3.5 px-4 max-w-[250px] truncate text-salon-muted">
                      {enq.message}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-salon-dark border-salon-cardBorder text-salon-gold">
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href="/admin/enquiries"
                        className="text-xs text-salon-gold hover:underline font-medium"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
