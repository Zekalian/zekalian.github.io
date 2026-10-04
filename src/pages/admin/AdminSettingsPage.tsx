import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, ShieldAlert, ExternalLink, MessageCircle, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, currentUser, addToast } = useApp();

  const [form, setForm] = useState({
    agency_name: settings.agency_name,
    official_email: settings.official_email,
    admin_whatsapp_number: settings.admin_whatsapp_number,
    whatsapp_prefilled_message: settings.whatsapp_prefilled_message,
    studio_address: settings.studio_address,
    instagram_url: settings.instagram_url,
    linkedin_url: settings.linkedin_url,
    logo_light_url: settings.logo_light_url || '/assets/Logo Utama Rata Kiri.png',
    logo_dark_url: settings.logo_dark_url || '/assets/logo-text-putih.png',
    favicon_url: settings.favicon_url || '/assets/Favicon.png',
  });

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleFileUpload = (field: 'logo_light_url' | 'logo_dark_url' | 'favicon_url', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Harap unggah file gambar (PNG / JPG / WEBP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran file maksimal 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setForm((prev) => ({ ...prev, [field]: result }));
        addToast('Logo berhasil dimuat. Klik "Simpan Perubahan" untuk menyimpan permanen ke database Firestore.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addToast('Pengaturan agensi & kontak berhasil disimpan!', 'success');
  };

  const cleanWaNumber = form.admin_whatsapp_number.replace(/[^0-9]/g, '');
  const previewWaUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    form.whatsapp_prefilled_message
  )}`;

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
          <Settings className="w-4 h-4" />
          <span>Super Admin Access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Kontak Agensi &amp; Branding
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola informasi kontak agensi, nomor WhatsApp admin, tautan sosial media, serta file logo &amp; favicon utama secara real-time.
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

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Branding & Logo Upload Section */}
        <div className="border-b border-slate-100 pb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-[#005DDD]" />
            <span>Unggah File Logo &amp; Favicon Agensi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Logo Utama */}
            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                Logo Utama (Terang / Navbar)
              </label>
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                {form.logo_light_url ? (
                  <div className="relative flex flex-col items-center">
                    <img src={form.logo_light_url} alt="Logo Utama" className="h-12 object-contain mb-2" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logo_light_url: '' })}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Logo
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-500 font-medium block">Pilih File PNG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={!isSuperAdmin}
                  onChange={(e) => handleFileUpload('logo_light_url', e)}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">Rekomendasi: 200 x 60 px (Transparan)</p>
            </div>

            {/* Logo Gelap */}
            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                Logo Gelap (Dark Mode)
              </label>
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-900 relative group">
                {form.logo_dark_url ? (
                  <div className="relative flex flex-col items-center">
                    <img src={form.logo_dark_url} alt="Logo Gelap" className="h-12 object-contain mb-2" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logo_dark_url: '' })}
                      className="text-[10px] text-rose-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Logo
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium block">Pilih File PNG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={!isSuperAdmin}
                  onChange={(e) => handleFileUpload('logo_dark_url', e)}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">Rekomendasi: 200 x 60 px (Transparan)</p>
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                Favicon Tab Browser
              </label>
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                {form.favicon_url ? (
                  <div className="relative flex flex-col items-center">
                    <img src={form.favicon_url} alt="Favicon" className="w-10 h-10 object-contain mb-2" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, favicon_url: '' })}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Favicon
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-500 font-medium block">Pilih File PNG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={!isSuperAdmin}
                  onChange={(e) => handleFileUpload('favicon_url', e)}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">Rekomendasi: 64 x 64 px (Kotak)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Agency Name */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Nama Agensi
            </label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={form.agency_name}
              onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Email Resmi Studio
            </label>
            <input
              type="email"
              disabled={!isSuperAdmin}
              value={form.official_email}
              onChange={(e) => setForm({ ...form, official_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
            />
          </div>

          {/* Admin WhatsApp Number */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Nomor WhatsApp Admin (Format Internasional)
            </label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              placeholder="+6283188998633"
              value={form.admin_whatsapp_number}
              onChange={(e) => setForm({ ...form, admin_whatsapp_number: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60 font-mono"
            />
          </div>

          {/* Studio Address */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Alamat Studio Fisik
            </label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={form.studio_address}
              onChange={(e) => setForm({ ...form, studio_address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
            />
          </div>

          {/* Instagram URL */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              URL Profil Instagram
            </label>
            <input
              type="url"
              disabled={!isSuperAdmin}
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              URL Halaman LinkedIn
            </label>
            <input
              type="url"
              disabled={!isSuperAdmin}
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
            />
          </div>
        </div>

        {/* WhatsApp Prefilled Message */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
            Draf Pesan Otomatis WhatsApp (Prefilled Message)
          </label>
          <textarea
            rows={3}
            disabled={!isSuperAdmin}
            value={form.whatsapp_prefilled_message}
            onChange={(e) => setForm({ ...form, whatsapp_prefilled_message: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#005DDD] disabled:opacity-60"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Uji coba tautan WhatsApp langsung:</span>
            <a
              href={previewWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Buka Tautan Preview</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
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
