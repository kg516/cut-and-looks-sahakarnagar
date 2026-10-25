'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Loader2,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface Appointment {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_id: string | null;
  service_name_snapshot: string;
  service_price_snapshot: number | null;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  preferred_stylist: string | null;
  customer_message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
}

interface AppointmentManagerProps {
  initialAppointments: Appointment[];
  initialSearch?: string;
}

export default function AppointmentManager({
  initialAppointments,
  initialSearch = '',
}: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Active modal for detail / edit
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch updated appointments
  const reloadAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (dateFilter) params.set('date', dateFilter);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAppointments();
  }, [statusFilter, searchQuery, dateFilter]);

  const openApptModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setEditStatus(appt.status);
    setEditAdminNotes(appt.admin_notes || '');
    setEditDate(appt.appointment_date);
    setEditTime(appt.start_time);
    setFeedbackMsg(null);
  };

  const handleUpdate = async (newStatusOverride?: string) => {
    if (!selectedAppt) return;
    setSaving(true);
    setFeedbackMsg(null);

    const statusToSave = newStatusOverride || editStatus;

    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppt.id,
          status: statusToSave,
          admin_notes: editAdminNotes,
          appointment_date: editDate,
          start_time: editTime,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: `Appointment ${statusToSave.toLowerCase()} successfully.` });
        await reloadAppointments();
        // Update local selectedAppt
        setSelectedAppt({
          ...selectedAppt,
          status: statusToSave,
          admin_notes: editAdminNotes,
          appointment_date: editDate,
          start_time: editTime,
        });
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update appointment.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-salon-cardBorder/60">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold">
            Booking Queue
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Appointment Management
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/appointments/export"
            className="inline-flex items-center space-x-2 bg-salon-dark hover:bg-salon-card text-salon-cream border border-salon-cardBorder text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded transition-all shadow"
          >
            <Download className="w-4 h-4 text-salon-gold" />
            <span>Export to CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-salon-card p-4 rounded-xl border border-salon-cardBorder">
        {/* Status Filter */}
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-3 py-2 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-3 py-2 text-xs text-salon-cream focus:outline-none focus:border-salon-gold [color-scheme:dark]"
            placeholder="Filter by date"
          />
        </div>

        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, or CNL-ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-3 py-2 text-xs text-salon-cream placeholder-salon-muted focus:outline-none focus:border-salon-gold"
          />
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-salon-gold flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center text-xs text-salon-muted space-y-2">
            <Calendar className="w-8 h-8 text-salon-muted/60 mx-auto" />
            <p className="font-semibold text-salon-cream text-sm">No Appointments Found</p>
            <p>Try resetting your status filter, search query, or date range.</p>
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
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {appointments.map((appt) => {
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
                        <p className="font-medium max-w-[180px] truncate">{appt.service_name_snapshot}</p>
                        {appt.service_price_snapshot && (
                          <span className="text-[10px] text-salon-gold">₹{appt.service_price_snapshot}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium">{appt.appointment_date}</p>
                        <p className="text-[11px] text-salon-muted">{appt.start_time} - {appt.end_time || ''}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[140px] truncate text-salon-muted text-[11px]">
                        {appt.admin_notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openApptModal(appt)}
                          className="bg-salon-dark hover:bg-salon-cardBorder text-salon-gold px-3 py-1.5 rounded border border-salon-cardBorder text-[11px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details & Status Modal */}
      {selectedAppt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedAppt(null)}
        >
          <div
            className="bg-salon-card border border-salon-cardBorder rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-salon-cardBorder/60 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-salon-gold font-semibold">
                  Booking Details
                </span>
                <h3 className="font-mono text-2xl font-bold text-salon-cream">
                  {selectedAppt.booking_reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="p-2 text-salon-muted hover:text-salon-cream rounded-lg hover:bg-salon-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3.5 rounded-lg text-xs flex items-center space-x-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border border-red-800 text-red-200'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Customer Details Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-salon-dark/60 p-4 rounded-xl border border-salon-cardBorder/60 text-xs">
              <div>
                <span className="text-salon-muted block uppercase text-[10px] font-medium">Customer</span>
                <p className="text-sm font-semibold text-salon-cream mt-0.5">{selectedAppt.customer_name}</p>
                <a
                  href={`tel:${selectedAppt.customer_phone}`}
                  className="text-salon-gold hover:underline mt-0.5 inline-block"
                >
                  {selectedAppt.customer_phone}
                </a>
                {selectedAppt.customer_email && (
                  <p className="text-salon-muted text-[11px] mt-0.5">{selectedAppt.customer_email}</p>
                )}
              </div>

              <div>
                <span className="text-salon-muted block uppercase text-[10px] font-medium">Service Requested</span>
                <p className="text-sm font-semibold text-salon-cream mt-0.5">{selectedAppt.service_name_snapshot}</p>
                {selectedAppt.service_price_snapshot && (
                  <p className="text-xs text-salon-gold font-medium mt-0.5">₹{selectedAppt.service_price_snapshot}</p>
                )}
                {selectedAppt.preferred_stylist && (
                  <p className="text-xs text-salon-muted mt-1">
                    Prefers: <strong className="text-salon-cream">{selectedAppt.preferred_stylist}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Customer Message */}
            {selectedAppt.customer_message && (
              <div className="p-3 bg-salon-dark/40 rounded-lg border border-salon-cardBorder/40 text-xs">
                <span className="text-salon-muted block uppercase text-[10px] font-semibold mb-1">
                  Customer Message:
                </span>
                <p className="text-salon-cream/90 italic">&ldquo;{selectedAppt.customer_message}&rdquo;</p>
              </div>
            )}

            {/* Rescheduling & Status Controls */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-salon-gold">
                Status & Rescheduling Controls
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-salon-muted block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-salon-muted block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2 text-xs text-salon-cream focus:outline-none focus:border-salon-gold [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-salon-muted block mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2 text-xs text-salon-cream focus:outline-none focus:border-salon-gold [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Quick Status Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdate('Confirmed')}
                  className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-[11px] font-semibold uppercase px-3 py-1.5 rounded transition-colors"
                >
                  ✓ Confirm Slot
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate('Completed')}
                  className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-700/60 text-[11px] font-semibold uppercase px-3 py-1.5 rounded transition-colors"
                >
                  Mark Completed
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate('Cancelled')}
                  className="bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/60 text-[11px] font-semibold uppercase px-3 py-1.5 rounded transition-colors"
                >
                  Cancel Booking
                </button>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-[11px] text-salon-muted block mb-1">
                  Private Administrator Notes (Not visible to customer)
                </label>
                <textarea
                  rows={2}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Add internal notes e.g., confirmed on phone, hair coloring patch test done..."
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-salon-cardBorder/60 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-salon-muted">
                Created: {new Date(selectedAppt.created_at).toLocaleString('en-IN')}
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 rounded text-xs font-semibold text-salon-muted hover:text-salon-cream"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdate()}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
