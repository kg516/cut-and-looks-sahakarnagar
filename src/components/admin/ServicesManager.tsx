'use client';

import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  X,
  Loader2,
  Tag,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: number;
}

interface Service {
  id: string;
  category_id: string | null;
  category_name?: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price_inr: number | null;
  starting_price_inr: number | null;
  duration_minutes: number | null;
  is_active: number;
  display_order: number;
}

interface ServicesManagerProps {
  initialCategories: Category[];
  initialServices: Service[];
}

export default function ServicesManager({
  initialCategories,
  initialServices,
}: ServicesManagerProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [services, setServices] = useState<Service[]>(initialServices);

  // Service Edit / Add Modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcImage, setSvcImage] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcStartPrice, setSvcStartPrice] = useState('');
  const [svcDuration, setSvcDuration] = useState('30');
  const [svcActive, setSvcActive] = useState(true);
  const [svcOrder, setSvcOrder] = useState('0');

  // Category Edit / Add Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState('0');
  const [catActive, setCatActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reloadData = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetch('/api/categories?all=true'),
        fetch('/api/services?all=true'),
      ]);
      const [catData, svcData] = await Promise.all([catRes.json(), svcRes.json()]);
      if (catData.categories) setCategories(catData.categories);
      if (svcData.services) setServices(svcData.services);
    } catch (err) {
      console.error('Error reloading services:', err);
    }
  };

  const openServiceModal = (svc?: Service) => {
    setMessage(null);
    if (svc) {
      setEditingService(svc);
      setIsNewService(false);
      setSvcName(svc.name);
      setSvcCategory(svc.category_id || '');
      setSvcDesc(svc.description || '');
      setSvcImage(svc.image_url || '');
      setSvcPrice(svc.price_inr !== null && svc.price_inr !== undefined ? String(svc.price_inr) : '');
      setSvcStartPrice(svc.starting_price_inr !== null && svc.starting_price_inr !== undefined ? String(svc.starting_price_inr) : '');
      setSvcDuration(String(svc.duration_minutes || 30));
      setSvcActive(Boolean(svc.is_active));
      setSvcOrder(String(svc.display_order || 0));
    } else {
      setEditingService({} as Service);
      setIsNewService(true);
      setSvcName('');
      setSvcCategory(categories[0]?.id || '');
      setSvcDesc('');
      setSvcImage('');
      setSvcPrice('');
      setSvcStartPrice('');
      setSvcDuration('30');
      setSvcActive(true);
      setSvcOrder(String(services.length + 1));
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name: svcName.trim(),
      category_id: svcCategory || null,
      description: svcDesc.trim(),
      image_url: svcImage.trim() || null,
      price_inr: svcPrice ? parseFloat(svcPrice) : null,
      starting_price_inr: svcStartPrice ? parseFloat(svcStartPrice) : null,
      duration_minutes: parseInt(svcDuration, 10) || 30,
      is_active: svcActive ? 1 : 0,
      display_order: parseInt(svcOrder, 10) || 0,
    };

    try {
      const url = '/api/services';
      const method = isNewService ? 'POST' : 'PUT';
      const body = isNewService ? payload : { ...payload, id: editingService?.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Service ${isNewService ? 'created' : 'updated'} successfully.` });
        await reloadData();
        setEditingService(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save service.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Historical booking records will preserve this service snapshot.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await reloadData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Toggle active service
  const handleToggleActiveService = async (svc: Service) => {
    try {
      await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: svc.id,
          is_active: svc.is_active ? 0 : 1,
        }),
      });
      await reloadData();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-salon-cardBorder/60">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-salon-gold font-semibold">
            Salon Catalogue
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Services & Pricing Menu
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => openServiceModal()}
            className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-3 border-b border-salon-cardBorder/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'services'
              ? 'bg-salon-card text-salon-gold border border-salon-cardBorder'
              : 'text-salon-muted hover:text-salon-cream'
          }`}
        >
          Services ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'categories'
              ? 'bg-salon-card text-salon-gold border border-salon-cardBorder'
              : 'text-salon-muted hover:text-salon-cream'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Services Table */}
      {activeTab === 'services' && (
        <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-dark text-salon-muted uppercase font-semibold border-b border-salon-cardBorder/60">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price Display</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {services.map((svc) => {
                  let priceText = 'Contact us for pricing';
                  if (svc.price_inr !== null && svc.price_inr !== undefined) {
                    priceText = `Fixed: ₹${svc.price_inr}`;
                  } else if (svc.starting_price_inr !== null && svc.starting_price_inr !== undefined) {
                    priceText = `Starting: ₹${svc.starting_price_inr}`;
                  }

                  return (
                    <tr key={svc.id} className="hover:bg-salon-dark/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {svc.image_url ? (
                            <img
                              src={svc.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-salon-cardBorder"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-salon-dark flex items-center justify-center text-salon-gold flex-shrink-0 border border-salon-cardBorder">
                              <Scissors className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-salon-cream">{svc.name}</p>
                            <p className="text-[11px] text-salon-muted max-w-xs truncate">{svc.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-salon-dark border border-salon-cardBorder text-[10px] text-salon-gold font-medium">
                          {svc.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-salon-gold">
                        {priceText}
                      </td>
                      <td className="py-3.5 px-4 text-salon-cream/80">
                        {svc.duration_minutes ? `~${svc.duration_minutes} mins` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActiveService(svc)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            svc.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {svc.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{svc.is_active ? 'Live' : 'Hidden'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openServiceModal(svc)}
                          className="p-1.5 bg-salon-dark hover:bg-salon-cardBorder text-salon-gold rounded border border-salon-cardBorder"
                          title="Edit Service"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(svc.id, svc.name)}
                          className="p-1.5 bg-salon-dark hover:bg-red-950/40 text-salon-muted hover:text-red-400 rounded border border-salon-cardBorder"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-salon-card rounded-2xl border border-salon-cardBorder overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-dark text-salon-muted uppercase font-semibold border-b border-salon-cardBorder/60">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-cardBorder/40 text-salon-cream/90">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-salon-dark/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-salon-cream">{cat.name}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-salon-gold">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-salon-muted max-w-sm truncate">{cat.description || '—'}</td>
                    <td className="py-3.5 px-4">{cat.display_order}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cat.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Add / Edit Modal */}
      {editingService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingService(null)}
        >
          <div
            className="bg-salon-card border border-salon-cardBorder rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-salon-cardBorder/60 pb-4">
              <h3 className="font-serif text-2xl font-bold text-salon-cream">
                {isNewService ? 'Add New Salon Service' : `Edit: ${svcName}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-2 text-salon-muted hover:text-salon-cream rounded-lg hover:bg-salon-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="text-xs text-salon-muted block mb-1">
                  Service Name <span className="text-salon-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="e.g. Classic Men's Precision Haircut"
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-salon-muted block mb-1">Category</label>
                  <select
                    value={svcCategory}
                    onChange={(e) => setSvcCategory(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-salon-muted block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={svcDuration}
                    onChange={(e) => setSvcDuration(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-salon-muted block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  placeholder="Detailed explanation of the haircut, styling steps, or haircare benefits..."
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-salon-muted block mb-1">
                    Fixed Price in INR (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  />
                  <p className="text-[10px] text-salon-muted mt-1">Leave empty if price varies or is unconfirmed.</p>
                </div>

                <div>
                  <label className="text-xs text-salon-muted block mb-1">
                    Starting Price in INR (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 600 (shows 'Starting from ₹600')"
                    value={svcStartPrice}
                    onChange={(e) => setSvcStartPrice(e.target.value)}
                    className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                  />
                  <p className="text-[10px] text-salon-muted mt-1">If both are empty, &ldquo;Contact us for pricing&rdquo; displays.</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-salon-muted block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={svcImage}
                  onChange={(e) => setSvcImage(e.target.value)}
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="svcActive"
                  checked={svcActive}
                  onChange={(e) => setSvcActive(e.target.checked)}
                  className="rounded bg-salon-dark border-salon-cardBorder text-salon-gold focus:ring-salon-gold"
                />
                <label htmlFor="svcActive" className="text-xs text-salon-cream font-medium">
                  Publish this service on public menu and booking selector
                </label>
              </div>

              <div className="border-t border-salon-cardBorder/60 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded text-xs font-semibold text-salon-muted hover:text-salon-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-salon-gold hover:bg-salon-goldLight text-salon-dark font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
