'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  alt_text: string | null;
  display_order: number;
  is_published: number;
  created_at: string;
}

interface GalleryManagerProps {
  initialImages: GalleryImage[];
}

export default function GalleryManager({ initialImages }: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);

  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgCategory, setImgCategory] = useState("Men's Hairstyles");
  const [imgAlt, setImgAlt] = useState('');
  const [imgOrder, setImgOrder] = useState('0');
  const [imgPublished, setImgPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reloadImages = async () => {
    try {
      const res = await fetch('/api/gallery?all=true');
      const data = await res.json();
      if (res.ok && data.images) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Error reloading gallery:', err);
    }
  };

  const openModal = (img?: GalleryImage) => {
    setMessage(null);
    if (img) {
      setEditingImage(img);
      setIsNew(false);
      setImgUrl(img.image_url);
      setImgCaption(img.caption || '');
      setImgCategory(img.category || "Men's Hairstyles");
      setImgAlt(img.alt_text || '');
      setImgOrder(String(img.display_order || 0));
      setImgPublished(Boolean(img.is_published));
    } else {
      setEditingImage({} as GalleryImage);
      setIsNew(true);
      setImgUrl('');
      setImgCaption('');
      setImgCategory("Men's Hairstyles");
      setImgAlt('');
      setImgOrder(String(images.length + 1));
      setImgPublished(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrl.trim()) return;

    setSaving(true);
    setMessage(null);

    const payload = {
      image_url: imgUrl.trim(),
      caption: imgCaption.trim() || null,
      category: imgCategory.trim() || 'General',
      alt_text: imgAlt.trim() || imgCaption.trim() || 'Cut & Looks Sahakar Nagar',
      display_order: parseInt(imgOrder, 10) || 0,
      is_published: imgPublished ? 1 : 0,
    };

    try {
      const method = isNew ? 'POST' : 'PUT';
      const body = isNew ? payload : { ...payload, id: editingImage?.id };

      const res = await fetch('/api/gallery', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await reloadImages();
        setEditingImage(null);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await reloadImages();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTogglePublish = async (img: GalleryImage) => {
    try {
      await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: img.id,
          is_published: img.is_published ? 0 : 1,
        }),
      });
      await reloadImages();
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
            Visual Media
          </span>
          <h1 className="font-serif text-3xl font-bold text-salon-cream">
            Gallery Photo Management
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 bg-salon-gold hover:bg-salon-goldLight text-salon-dark text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Photo</span>
        </button>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-salon-card rounded-xl border border-salon-cardBorder overflow-hidden flex flex-col justify-between shadow"
          >
            <div className="relative h-48 bg-salon-dark">
              <img
                src={img.image_url}
                alt={img.alt_text || ''}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-salon-dark/85 backdrop-blur-sm text-[10px] text-salon-gold font-semibold border border-salon-gold/30 uppercase">
                {img.category || 'General'}
              </span>
            </div>

            <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-xs text-salon-cream font-medium line-clamp-2">
                  {img.caption || 'No caption provided'}
                </p>
                <p className="text-[10px] text-salon-muted mt-1">Display order: {img.display_order}</p>
              </div>

              <div className="pt-3 border-t border-salon-cardBorder/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(img)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    img.is_published
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {img.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{img.is_published ? 'Published' : 'Draft'}</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => openModal(img)}
                    className="p-1.5 bg-salon-dark hover:bg-salon-cardBorder text-salon-gold rounded border border-salon-cardBorder"
                    title="Edit Photo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 bg-salon-dark hover:bg-red-950/40 text-salon-muted hover:text-red-400 rounded border border-salon-cardBorder"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingImage(null)}
        >
          <div
            className="bg-salon-card border border-salon-cardBorder rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-salon-cardBorder/60 pb-4">
              <h3 className="font-serif text-2xl font-bold text-salon-cream">
                {isNew ? 'Add Gallery Image' : 'Edit Image Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="p-2 text-salon-muted hover:text-salon-cream rounded-lg hover:bg-salon-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-salon-muted block mb-1">
                  Image URL <span className="text-salon-gold">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div>
                <label className="text-xs text-salon-muted block mb-1">Category</label>
                <select
                  value={imgCategory}
                  onChange={(e) => setImgCategory(e.target.value)}
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                >
                  <option value="Men's Hairstyles">Men&apos;s Hairstyles</option>
                  <option value="Women's Hairstyles">Women&apos;s Hairstyles</option>
                  <option value="Hair Colour">Hair Colour</option>
                  <option value="Hair Treatments">Hair Treatments</option>
                  <option value="Salon Interior">Salon Interior</option>
                  <option value="Other Work">Other Work</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-salon-muted block mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Modern fade cut with textured pompadour"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div>
                <label className="text-xs text-salon-muted block mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  placeholder="e.g. Precision men haircut with modern taper fade"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  className="w-full bg-salon-dark border border-salon-cardBorder rounded-lg p-2.5 text-xs text-salon-cream focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="imgPub"
                  checked={imgPublished}
                  onChange={(e) => setImgPublished(e.target.checked)}
                  className="rounded bg-salon-dark border-salon-cardBorder text-salon-gold focus:ring-salon-gold"
                />
                <label htmlFor="imgPub" className="text-xs text-salon-cream font-medium">
                  Publish this photo on the public gallery page
                </label>
              </div>

              <div className="border-t border-salon-cardBorder/60 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
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
                  <span>Save Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
