'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface EnquiryManagerProps {
  initialEnquiries: Enquiry[];
}

export default function EnquiryManager({ initialEnquiries }: EnquiryManagerProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Selected enquiry for modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reloadEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/enquiries?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error('Error reloading enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadEnquiries();
  }, [statusFilter, searchQuery]);

  const openModal = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditStatus(enq.status);
    setEditAdminNotes(enq.admin_notes || '');
    setFeedback(null);
  };

  const handleSave = async (newStatus?: string) => {
    if (!selectedEnquiry) return;
    setSaving(true);
    setFeedback(null);

    const statusToSave = newStatus || editStatus;

    try {
      const res = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEnquiry.id,
          status: statusToSave,
          admin_notes: editAdminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback('Enquiry status updated successfully.');
        await reloadEnquiries();
        setSelectedEnquiry({
          ...selectedEnquiry,
          status: statusToSave,
          admin_notes: editAdminNotes,
        });
      }
    } catch (err) {
      console.error('Enquiry save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-salon-cardBorder/60">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold">
            Communications
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Customer Enquiries
          </h1>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-salon-card p-4 rounded-xl border border-salon-cardBorder">
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg px-3 py-2 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
          >
            <option value="all">All Enquiries</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-salon-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sender, phone, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg pl-9 pr-3 py-2 text-xs text-salon-cream placeholder-salon-muted focus:outline-none focus:border-salon-gold"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-salon-gold flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading enquiries...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-16 text-center text-xs text-salon-muted space-y-2">
            <MessageSquare className="w-8 h-8 text-salon-muted/60 mx-auto" />
            <p className="font-semibold text-salon-cream text-sm">No Enquiries Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-dark text-salon-muted uppercase font-semibold border-b border-salon-cardBorder/60">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-salon-dark/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-salon-muted">
                      {new Date(enq.created_at).toLocaleDateString('en-IN')}
                    </td>
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
                      <button
                        type="button"
                        onClick={() => openModal(enq)}
                        className="bg-salon-dark hover:bg-salon-cardBorder text-salon-gold px-3 py-1.5 rounded border border-salon-cardBorder text-[11px] font-semibold uppercase tracking-wider"
                      >
                        View & Triage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-salon-card border border-salon-cardBorder rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-salon-cardBorder/60 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-salon-gold font-semibold">
                  Enquiry Review
                </span>
                <h3 className="font-serif text-2xl font-bold text-salon-cream">
                  {selectedEnquiry.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-salon-muted hover:text-salon-cream rounded-lg hover:bg-salon-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{feedback}</span>
              </div>
            )}

            <div className="bg-salon-dark/60 p-4 rounded-xl border border-salon-cardBorder/60 space-y-1 text-xs">
              <p className="text-sm font-semibold text-salon-cream">{selectedEnquiry.customer_name}</p>
              <p className="text-salon-gold">
                <a href={`tel:${selectedEnquiry.customer_phone}`} className="hover:underline">
                  {selectedEnquiry.customer_phone}
                </a>
              </p>
              {selectedEnquiry.customer_email && (
                <p className="text-salon-muted">{selectedEnquiry.customer_email}</p>
              )}
            </div>

            <div className="p-4 bg-salon-dark/40 rounded-xl border border-salon-cardBorder/40 text-xs space-y-1">
              <span className="text-[10px] text-salon-muted uppercase font-semibold block">Full Message:</span>
              <p className="text-salon-cream/90 leading-relaxed whitespace-pre-wrap">{selectedEnquiry.message}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-salon-muted block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-salon-muted block mb-1">
                  Private Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Record follow-up calls or resolution notes..."
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>
            </div>

            <div className="border-t border-salon-cardBorder/60 pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded text-xs font-semibold text-salon-muted hover:text-salon-cream"
              >
                Close
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
