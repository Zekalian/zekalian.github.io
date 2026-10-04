import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Testimonial } from '../../types/database';
import { MessageSquareQuote, Plus, Trash2, Edit2, Star, Check } from 'lucide-react';

export const AdminTestimonialsPage: React.FC = () => {
  const { testimonials, saveTestimonial, deleteTestimonial, currentUser } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [companyOrTitle, setCompanyOrTitle] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const isAnalyst = currentUser?.role === 'analyst';

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setClientName('');
    setCompanyOrTitle('');
    setQuote('');
    setRating(5);
    setOrderIndex(testimonials.length + 1);
    setIsActive(true);
  };

  const handleStartEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setClientName(t.client_name);
    setCompanyOrTitle(t.company_or_title || t.client_company_or_brand || '');
    setQuote(t.quote || t.testimonial_text || '');
    setRating(t.rating);
    setOrderIndex(t.order_index || 1);
    setIsActive(t.is_active);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !quote.trim()) return;

    saveTestimonial({
      id: editingId || undefined,
      client_name: clientName,
      client_company_or_brand: companyOrTitle,
      testimonial_text: quote,
      company_or_title: companyOrTitle,
      quote,
      rating: Number(rating),
      order_index: Number(orderIndex),
      is_active: isActive,
    });

    resetForm();
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Testimonial Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Testimoni Klien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ulasan kepuasan mitra brand dan korporat yang ditampilkan di halaman utama.
          </p>
        </div>

        {!isAnalyst && !isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Testimoni Baru</span>
          </button>
        )}
      </div>

      {/* Form Drawer */}
      {isAdding && !isAnalyst && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900">
            {editingId ? 'Edit Data Testimoni' : 'Tambah Testimoni Klien Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Nama Klien *
              </label>
              <input
                type="text"
                required
                placeholder="Ir. Dimas Wicaksono"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Jabatan &amp; Perusahaan *
              </label>
              <input
                type="text"
                required
                placeholder="Head of Corporate Affairs, PT Perta Daya Gas"
                value={companyOrTitle}
                onChange={(e) => setCompanyOrTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Rating Bintang (1 - 5)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#005DDD]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                <option value={3}>⭐⭐⭐ (3 Bintang)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
              Kutipan Testimoni *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Zekalian berhasil menerjemahkan narasi teknis menjadi karya sinematik..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#005DDD] w-4 h-4"
              />
              <span>Aktif ditampilkan di Halaman Beranda</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3]"
            >
              {editingId ? 'Simpan Pembaruan' : 'Tambahkan Testimoni'}
            </button>
          </div>
        </form>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Urutan: #{t.order_index || 1}
                </span>
              </div>

              <blockquote className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;{t.quote || t.testimonial_text}&rdquo;
              </blockquote>

              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900">{t.client_name}</h4>
                <p className="text-xs text-slate-500">{t.company_or_title || t.client_company_or_brand}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  t.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {t.is_active ? 'Aktif' : 'Disembunyikan'}
              </span>

              {!isAnalyst && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-[#005DDD]"
                    title="Edit Testimoni"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus testimoni dari ${t.client_name}?`)) {
                        deleteTestimonial(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Hapus Testimoni"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
