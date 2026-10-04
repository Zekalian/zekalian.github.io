import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, Save, ShieldAlert, Plus, Trash2, FileText } from 'lucide-react';
import { ServiceItem, WorkflowItem } from '../../types/database';

export const AdminHomepageContentPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useApp();

  const [form, setForm] = useState({
    hero_title_prefix: settings.hero_title_prefix || 'Building',
    hero_title_accent: settings.hero_title_accent || 'authentic',
    hero_title_suffix: settings.hero_title_suffix || 'brands, concept to execution.',
    hero_subtitle: settings.hero_subtitle || 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.',
    hero_cta_primary: settings.hero_cta_primary || 'Hubungi Zekalian',
    hero_cta_secondary: settings.hero_cta_secondary || 'Lihat Portofolio',

    services_subtitle: settings.services_subtitle || 'Layanan Agensi',
    services_title: settings.services_title || 'Solusi Kreatif Menyeluruh untuk Skala Bisnis Anda',
    services_desc: settings.services_desc || 'Dari strategi positioning hingga eksekusi visual di lapangan, kami memberikan kualitas craftsmanship tanpa kompromi.',
    services_list: settings.services_list && settings.services_list.length > 0 ? settings.services_list : [
      { number: '01', title: 'Branding & Visual Identity', desc: 'Membangun identitas merek yang kokoh.' },
      { number: '02', title: 'Production House & Media', desc: 'Eksekusi produksi audio visual sinematik.' },
      { number: '03', title: 'Social Media Management', desc: 'Pengelolaan konten multimedia terstruktur.' },
    ],

    workflow_subtitle: settings.workflow_subtitle || 'Our Methodology',
    workflow_title: settings.workflow_title || 'Alur Kerja 4 Fase Terstruktur',
    workflow_desc: settings.workflow_desc || 'Menjamin transparansi tenggat waktu, kejelasan ekspektasi teknis, dan presisi hasil akhir.',
    workflow_list: settings.workflow_list && settings.workflow_list.length > 0 ? settings.workflow_list : [
      { number: '01', title: 'Discovery & Brief', color: '#005DDD', desc: 'Membedah tujuan bisnis.' },
      { number: '02', title: 'Creative Direction', color: '#018EE3', desc: 'Penyusunan moodboard & skrip.' },
      { number: '03', title: 'Production & Craft', color: '#00B7E8', desc: 'Sesi pengambilan gambar.' },
      { number: '04', title: 'Final Delivery', color: '#0F172A', desc: 'Pemberian paket aset siap tayang.' },
    ],

    cta_banner_title: settings.cta_banner_title || 'Siap Mengangkat Identitas Brand Anda ke Level Berikutnya?',
    cta_banner_desc: settings.cta_banner_desc || 'Kami siap berdiskusi secara terbuka mengenai sasaran bisnis, kebutuhan visual, dan alokasi timeline proyek Anda.',
    cta_banner_btn_text: settings.cta_banner_btn_text || 'Hubungi Zekalian',
  });

  const [savedStatus, setSavedStatus] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  // Service list handlers
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...form.services_list];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, services_list: updated });
  };

  const handleAddService = () => {
    const nextNum = String(form.services_list.length + 1).padStart(2, '0');
    setForm({
      ...form,
      services_list: [...form.services_list, { number: nextNum, title: 'Layanan Baru', desc: 'Deskripsi layanan baru agensi.' }]
    });
  };

  const handleRemoveService = (index: number) => {
    const updated = form.services_list.filter((_, i) => i !== index);
    setForm({ ...form, services_list: updated });
  };

  // Workflow list handlers
  const handleWorkflowChange = (index: number, field: keyof WorkflowItem, value: string) => {
    const updated = [...form.workflow_list];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, workflow_list: updated });
  };

  const handleAddWorkflow = () => {
    const nextNum = String(form.workflow_list.length + 1).padStart(2, '0');
    setForm({
      ...form,
      workflow_list: [...form.workflow_list, { number: nextNum, title: 'Fase Baru', color: '#005DDD', desc: 'Deskripsi fase baru.' }]
    });
  };

  const handleRemoveWorkflow = (index: number) => {
    const updated = form.workflow_list.filter((_, i) => i !== index);
    setForm({ ...form, workflow_list: updated });
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
          <FileText className="w-4 h-4" />
          <span>Pengelolaan Teks &amp; Konten</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Halaman Utama (Homepage)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola copywriting Hero, daftar layanan (jasa), alur kerja, hingga banner CTA di halaman utama secara real-time.
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

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-12">
        {/* 1. Hero Section Copywriting */}
        <div className="border-b border-slate-100 pb-10 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#005DDD]" />
            <span>1. Hero Section</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prefix Judul</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.hero_title_prefix}
                onChange={(e) => setForm({ ...form, hero_title_prefix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teks Aksen (Warna Biru)</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.hero_title_accent}
                onChange={(e) => setForm({ ...form, hero_title_accent: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Suffix Judul</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.hero_title_suffix}
                onChange={(e) => setForm({ ...form, hero_title_suffix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul Hero</label>
            <textarea
              rows={2}
              disabled={!isSuperAdmin}
              value={form.hero_subtitle}
              onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol Utama</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.hero_cta_primary}
                onChange={(e) => setForm({ ...form, hero_cta_primary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol Sekunder</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.hero_cta_secondary}
                onChange={(e) => setForm({ ...form, hero_cta_secondary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Services Section Copywriting & List */}
        <div className="border-b border-slate-100 pb-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#005DDD]" />
              <span>2. Layanan Agensi (Services)</span>
            </h3>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleAddService}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-[#005DDD] hover:bg-sky-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Layanan</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul Section</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.services_subtitle}
                onChange={(e) => setForm({ ...form, services_subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Utama Section</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.services_title}
                onChange={(e) => setForm({ ...form, services_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Section</label>
            <textarea
              rows={2}
              disabled={!isSuperAdmin}
              value={form.services_desc}
              onChange={(e) => setForm({ ...form, services_desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Jasa / Layanan</h4>
            {form.services_list.map((srv, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 relative">
                {isSuperAdmin && form.services_list.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={srv.number}
                      onChange={(e) => handleServiceChange(idx, 'number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-10">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Layanan</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={srv.title}
                      onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    disabled={!isSuperAdmin}
                    value={srv.desc}
                    onChange={(e) => handleServiceChange(idx, 'desc', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Workflow Section Copywriting & List */}
        <div className="border-b border-slate-100 pb-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#005DDD]" />
              <span>3. Alur Kerja (Methodology)</span>
            </h3>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleAddWorkflow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-[#005DDD] hover:bg-sky-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fase</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul Section</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.workflow_subtitle}
                onChange={(e) => setForm({ ...form, workflow_subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Utama Section</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={form.workflow_title}
                onChange={(e) => setForm({ ...form, workflow_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Section</label>
            <textarea
              rows={2}
              disabled={!isSuperAdmin}
              value={form.workflow_desc}
              onChange={(e) => setForm({ ...form, workflow_desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Fase Alur Kerja</h4>
            {form.workflow_list.map((wf, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 relative">
                {isSuperAdmin && form.workflow_list.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkflow(idx)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={wf.number}
                      onChange={(e) => handleWorkflowChange(idx, 'number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Judul Fase</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={wf.title}
                      onChange={(e) => handleWorkflowChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Warna Aksen</label>
                    <input
                      type="color"
                      disabled={!isSuperAdmin}
                      value={wf.color || '#005DDD'}
                      onChange={(e) => handleWorkflowChange(idx, 'color', e.target.value)}
                      className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer p-1 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deskripsi Fase</label>
                  <textarea
                    rows={2}
                    disabled={!isSuperAdmin}
                    value={wf.desc}
                    onChange={(e) => handleWorkflowChange(idx, 'desc', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CTA Banner Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#005DDD]" />
            <span>4. Banner Call to Action (CTA) Bawah</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Banner CTA</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={form.cta_banner_title}
              onChange={(e) => setForm({ ...form, cta_banner_title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Banner CTA</label>
            <textarea
              rows={2}
              disabled={!isSuperAdmin}
              value={form.cta_banner_desc}
              onChange={(e) => setForm({ ...form, cta_banner_desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol Banner CTA</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={form.cta_banner_btn_text}
              onChange={(e) => setForm({ ...form, cta_banner_btn_text: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
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
