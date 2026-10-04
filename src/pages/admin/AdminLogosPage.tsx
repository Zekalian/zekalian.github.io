import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientLogo } from '../../types/database';
import { Image, Plus, Trash2, Edit2, Check, X, Eye, EyeOff } from 'lucide-react';

export const AdminLogosPage: React.FC = () => {
  const { clientLogos, saveClientLogo, deleteClientLogo, currentUser } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const isAnalyst = currentUser?.role === 'analyst';

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setBrandName('');
    setLogoUrl('');
    setOrderIndex(clientLogos.length + 1);
    setIsActive(true);
  };

  const handleStartEdit = (logo: ClientLogo) => {
    setEditingId(logo.id);
    setBrandName(logo.brand_name);
    setLogoUrl(logo.logo_url);
    setOrderIndex(logo.order_index);
    setIsActive(logo.is_active);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    saveClientLogo({
      id: editingId || undefined,
      brand_name: brandName,
      logo_url: logoUrl || 'https://dummyimage.com/160x50/000/fff&text=' + encodeURIComponent(brandName),
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
            <Image className="w-4 h-4" />
            <span>Social Proof Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Logo Klien &amp; Brand
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur urutan tampilan logo klien pada halaman utama dan kontrol visibilitas aktif/sembunyi.
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
            <span>Tambah Logo Klien</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && !isAnalyst && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900">
            {editingId ? 'Edit Data Logo Klien' : 'Tambah Logo Klien Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Nama Brand / Perusahaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Perta Daya Gas"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                URL Logo (PNG / SVG Transparan)
              </label>
              <input
                type="text"
                placeholder="https://.../logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Indeks Urutan Tampil (Numerik)
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#005DDD] focus:ring-0 w-4 h-4"
                />
                <span>Tampilkan di Halaman Beranda (Aktif)</span>
              </label>
            </div>
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
              {editingId ? 'Simpan Pembaruan' : 'Tambahkan Logo'}
            </button>
          </div>
        </form>
      )}

      {/* Logos List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clientLogos.map((logo) => (
          <div
            key={logo.id}
            className={`bg-white p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between ${
              logo.is_active ? 'border-slate-200/80' : 'border-dashed border-slate-300 opacity-60'
            }`}
          >
            <div>
              <div className="h-16 bg-slate-50 rounded-xl flex items-center justify-center p-3 mb-4">
                <img
                  src={logo.logo_url}
                  alt={logo.brand_name}
                  className="max-h-10 max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {logo.brand_name}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  #{logo.order_index}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  logo.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {logo.is_active ? 'Aktif' : 'Disembunyikan'}
              </span>

              {!isAnalyst && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      saveClientLogo({ id: logo.id, is_active: !logo.is_active })
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700"
                    title={logo.is_active ? 'Sembunyikan' : 'Aktifkan'}
                  >
                    {logo.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleStartEdit(logo)}
                    className="p-1.5 text-slate-400 hover:text-[#005DDD]"
                    title="Edit Data"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus logo ${logo.brand_name}?`)) {
                        deleteClientLogo(logo.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Hapus Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
