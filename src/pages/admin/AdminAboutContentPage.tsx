import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, ShieldAlert, Plus, Trash2, Info } from 'lucide-react';
import { ValueItem } from '../../types/database';
import { RichEditor } from '../../components/admin/RichEditor';

export const AdminAboutContentPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useApp();

  const [form, setForm] = useState({
    about_subtitle: settings.about_subtitle || 'About Studio',
    about_title_prefix: settings.about_title_prefix || 'Menghubungkan Brand dan Audiens Melalui Karya Visual yang',
    about_title_accent: settings.about_title_accent || 'Jujur.',
    about_desc: settings.about_desc || 'Zekalian adalah agensi kreatif independen yang berfokus pada perumusan identitas merek, produksi multimedia sinematik, dan strategi visual berorientasi dampak nyata.',
    about_philosophy_title: settings.about_philosophy_title || 'Filosofi Kerja Kami',
    about_philosophy_content: settings.about_philosophy_content || '<p>Di tengah derasnya arus konten instan yang seragam dan tak bernyawa, kami meyakini bahwa manusia senantiasa tergerak oleh keaslian. Sebuah visual yang kuat tidak sekadar menarik mata, melainkan menumbuhkan rasa percaya dan ikatan emosional yang bertahan lama.</p><p>Beroperasi dari basis studio kami di Pekanbaru — Payakumbuh, Indonesia, kami menggabungkan kekayaan perspektif lokal dengan standar produksi multimedia bertaraf internasional. Kami merangkul setiap tantangan kreatif dengan pendekatan eksploratif yang kritis namun terukur.</p><p>Bagi kami, kesuksesan sebuah kampanye tidak hanya diukur dari angka impresi di layar, melainkan dari sejauh mana karya tersebut memperkuat posisi dan reputasi bisnis klien di dunia nyata.</p>',
    about_vision_title: settings.about_vision_title || 'Visi Jangka Panjang',
    about_vision_desc: settings.about_vision_desc || 'Menjadi katalis utama transformasi identitas visual bagi merek-merek progresif di Indonesia.',
    about_values_subtitle: settings.about_values_subtitle || 'Fundamental',
    about_values_title: settings.about_values_title || 'Nilai-Nilai Agensi',
    about_values_list: settings.about_values_list && settings.about_values_list.length > 0 ? settings.about_values_list : [
      { title: 'Autentisitas Murni', desc: 'Kami menolak klise visual generik.' },
      { title: 'Disiplin Ketelitian', desc: 'Craftsmanship sejati hadir dalam detail mikro.' },
      { title: 'Kemitraan Transparan', desc: 'Kami bekerja sebagai perpanjangan tim Anda.' },
    ],
  });

  const [savedStatus, setSavedStatus] = useState(false);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const handleValueChange = (index: number, field: keyof ValueItem, value: string) => {
    const updated = [...form.about_values_list];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, about_values_list: updated });
  };

  const handleAddValue = () => {
    setForm({
      ...form,
      about_values_list: [...form.about_values_list, { title: 'Nilai Baru', desc: 'Deskripsi nilai agensi baru.' }]
    });
  };

  const handleRemoveValue = (index: number) => {
    const updated = form.about_values_list.filter((_, i) => i !== index);
    setForm({ ...form, about_values_list: updated });
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
          <Info className="w-4 h-4" />
          <span>Pengelolaan Teks &amp; Konten</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Halaman Tentang Kami (About)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola copywriting, filosofi kerja, visi jangka panjang, dan nilai-nilai agensi di halaman Tentang Kami secara real-time.
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Anda saat ini login sebagai <strong>{currentUser?.role?.toUpperCase()}</strong>. Halaman ini diproteksi khusus untuk <strong>Super Admin</strong>.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul Atas</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.about_subtitle}
                onChange={(e) => setForm({ ...form, about_subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prefix Judul Utama</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.about_title_prefix}
                onChange={(e) => setForm({ ...form, about_title_prefix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teks Aksen (Warna Biru)</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.about_title_accent}
                onChange={(e) => setForm({ ...form, about_title_accent: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Pengantar Halaman Tentang</label>
            <textarea
              rows={2}
              disabled={!isSuperAdmin}
              value={form.about_desc}
              onChange={(e) => setForm({ ...form, about_desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Filosofi &amp; Visi Kerja</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Filosofi</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={form.about_philosophy_title}
                  onChange={(e) => setForm({ ...form, about_philosophy_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Visi</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={form.about_vision_title}
                  onChange={(e) => setForm({ ...form, about_vision_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Filosofi Kerja
              </label>
              {isSuperAdmin ? (
                <RichEditor
                  content={form.about_philosophy_content}
                  onChange={(html) => setForm({ ...form, about_philosophy_content: html })}
                />
              ) : (
                <div
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.about_philosophy_content }}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Visi Jangka Panjang</label>
              <textarea
                rows={3}
                disabled={!isSuperAdmin}
                value={form.about_vision_desc}
                onChange={(e) => setForm({ ...form, about_vision_desc: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nilai-Nilai Agensi (Core Values)</h4>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleAddValue}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-[#005DDD] hover:bg-sky-100 font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Nilai</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul Nilai</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={form.about_values_subtitle}
                  onChange={(e) => setForm({ ...form, about_values_subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Utama Nilai</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={form.about_values_title}
                  onChange={(e) => setForm({ ...form, about_values_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            {form.about_values_list.map((val, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 relative">
                {isSuperAdmin && form.about_values_list.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Judul Nilai</label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={val.title}
                    onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deskripsi Nilai</label>
                  <textarea
                    rows={2}
                    disabled={!isSuperAdmin}
                    value={val.desc}
                    onChange={(e) => handleValueChange(idx, 'desc', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {isSuperAdmin && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedStatus ? (
              <span className="text-xs font-bold text-emerald-600 animate-pulse">
                ✓ Perubahan berhasil disimpan
              </span>
            ) : <span />}
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#005DDD] hover:bg-[#018EE3] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
