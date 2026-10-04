import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Save,
  ShieldAlert,
  Search,
  Share2,
  Code,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { ImgbbGuideButton, ImgbbViewerLinkWarning } from '../../components/admin/ImgbbGuideButton';

export const AdminSeoPage: React.FC = () => {
  const { settings, updateSettings, currentUser, addToast } = useApp();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [form, setForm] = useState({
    seo_site_title: settings.seo_site_title || 'Zekalian — Authentic Branding & Media Creative Production',
    seo_meta_description: settings.seo_meta_description || 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.',
    seo_og_image_url: settings.seo_og_image_url || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=85',
    seo_keywords: settings.seo_keywords || 'zekalian, creative agency, branding indonesia, video production, multimedia showcase, digital campaign',
    seo_twitter_card: settings.seo_twitter_card || 'summary_large_image',
    seo_schema_type: settings.seo_schema_type || 'ProfessionalService',
    seo_page_overrides: settings.seo_page_overrides || {
      home: { title: 'Zekalian — Authentic Branding & Media Creative Production', desc: 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.' },
      projects: { title: 'Portofolio & Studi Kasus', desc: 'Jelajahi studi kasus komersial, kampanye visual, dan video sinematik yang telah kami kerjakan untuk brand terkemuka.' },
      articles: { title: 'Wawasan & Opini Industri Kreatif', desc: 'Refleksi mendalam, panduan produksi videografi, dan strategi narasi visual dari studio Zekalian.' },
      about: { title: 'Tentang Zekalian — Cerita, Visi & Filosofi Kreatif', desc: 'Mengenal perjalanan Zekalian dalam membangun narasi visual autentik yang berkarakter dan berdampak.' },
      contact: { title: 'Hubungi & Mulai Kolaborasi Proyek', desc: 'Konsultasikan ide kampanye, jadwal syuting, atau tanyakan estimasi anggaran proyek bersama tim Zekalian.' },
    },
  });

  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'schema' | 'preview'>('general');
  const [previewPage, setPreviewPage] = useState<'home' | 'projects' | 'articles' | 'about' | 'contact'>('home');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addToast('Pengaturan SEO & OpenGraph berhasil disimpan!', 'success');
  };

  const getOverrides = (page: 'home' | 'projects' | 'articles' | 'about' | 'contact') => {
    const defaultData = {
      home: { title: 'Zekalian — Authentic Branding', desc: 'Partner kreatif terpercaya.' },
      projects: { title: 'Portofolio', desc: 'Studi kasus komersial.' },
      articles: { title: 'Wawasan', desc: 'Artikel industri.' },
      about: { title: 'Tentang', desc: 'Cerita dan visi.' },
      contact: { title: 'Kontak', desc: 'Hubungi kami.' },
    };
    return form.seo_page_overrides?.[page] || defaultData[page];
  };

  const currentPreviewData = () => {
    return getOverrides(previewPage);
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Globe className="w-4 h-4" />
            <span>Search Engine Optimization &amp; Social Cards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen SEO &amp; OpenGraph Metadata
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kontrol penuh atas kehadiran mesin pencari, kartu pratinjau media sosial (WhatsApp, Twitter, LinkedIn), serta Schema.org JSON-LD terstruktur.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-[#005DDD] text-white hover:bg-[#004bb5] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan SEO</span>
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Anda login sebagai <strong>{currentUser?.role?.toUpperCase()}</strong>. Pengaturan SEO tingkat lanjut ini dioptimalkan untuk Super Admin.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center bg-slate-200/70 p-1.5 rounded-2xl max-w-fit flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'general' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO &amp; OpenGraph Utama</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Override Per Halaman</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'schema' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Schema.org (JSON-LD)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Pratinjau Snippet &amp; Sosmed</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'general' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Globe className="w-4 h-4 text-[#005DDD]" />
              <span>Konfigurasi Utama Mesin Pencari &amp; Social Share</span>
            </h3>

            {/* Site Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                  Judul Website Utama (`&lt;title&gt;` &amp; `og:title`)
                </label>
                <span className={`text-[11px] font-bold ${form.seo_site_title.length >= 30 && form.seo_site_title.length <= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {form.seo_site_title.length} karakter (Rekomendasi: 30-60)
                </span>
              </div>
              <input
                type="text"
                value={form.seo_site_title}
                onChange={(e) => setForm({ ...form, seo_site_title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD]"
                placeholder="Contoh: Zekalian — Authentic Branding & Media Agency"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                  Deskripsi Meta (`&lt;meta name="description"&gt;`)
                </label>
                <span className={`text-[11px] font-bold ${form.seo_meta_description.length >= 120 && form.seo_meta_description.length <= 160 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {form.seo_meta_description.length} karakter (Rekomendasi: 120-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={form.seo_meta_description}
                onChange={(e) => setForm({ ...form, seo_meta_description: e.target.value })}
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] leading-relaxed"
                placeholder="Ringkasan persuasif tentang layanan agensi Anda..."
              />
            </div>

            {/* OpenGraph Image */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#005DDD]" />
                  <span>URL Gambar Pratinjau Sosial (`og:image` / `twitter:image`)</span>
                </label>
                <ImgbbGuideButton size="xs" />
              </div>
              <input
                type="url"
                value={form.seo_og_image_url}
                onChange={(e) => setForm({ ...form, seo_og_image_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD]"
                placeholder="https://i.ibb.co/... atau https://images.unsplash.com/..."
              />
              <ImgbbViewerLinkWarning url={form.seo_og_image_url} />
              <p className="text-[11px] text-slate-400">Rekomendasi ukuran gambar: 1200 x 630 piksel berformat JPG, WEBP, atau PNG.</p>
            </div>

            {/* Keywords & Twitter Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                  Kata Kunci Pencarian (`meta keywords`)
                </label>
                <input
                  type="text"
                  value={form.seo_keywords}
                  onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD]"
                  placeholder="zekalian, creative agency, branding..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                  Tipe Kartu Twitter (`twitter:card`)
                </label>
                <select
                  value={form.seo_twitter_card}
                  onChange={(e) => setForm({ ...form, seo_twitter_card: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] bg-white"
                >
                  <option value="summary_large_image">Summary Large Image (Rekomendasi Utama)</option>
                  <option value="summary">Summary (Kompak)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[#005DDD]" />
              <span>Override Metadata Khusus Per Halaman Publik</span>
            </h3>
            <p className="text-xs text-slate-500">
              Sesuaikan judul dan deskripsi meta spesifik untuk setiap halaman utama agar penelusuran Google lebih tertarget.
            </p>

            <div className="space-y-6 divide-y divide-slate-100">
              {/* Home */}
              <div className="pt-6 first:pt-0 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]" /> Halaman Utama (Home - `/`)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('home').title}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, home: { ...getOverrides('home'), title: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Deskripsi Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('home').desc}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, home: { ...getOverrides('home'), desc: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]" /> Portofolio &amp; Studi Kasus (`/projects`)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('projects').title}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, projects: { ...getOverrides('projects'), title: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Deskripsi Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('projects').desc}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, projects: { ...getOverrides('projects'), desc: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]" /> Artikel &amp; Wawasan (`/articles`)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('articles').title}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, articles: { ...getOverrides('articles'), title: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Deskripsi Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('articles').desc}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, articles: { ...getOverrides('articles'), desc: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]" /> Tentang Kami (`/about`)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('about').title}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, about: { ...getOverrides('about'), title: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Deskripsi Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('about').desc}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, about: { ...getOverrides('about'), desc: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]" /> Kontak &amp; Kolaborasi (`/contact`)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('contact').title}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, contact: { ...getOverrides('contact'), title: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-600 mb-1">Deskripsi Halaman</label>
                    <input
                      type="text"
                      value={getOverrides('contact').desc}
                      onChange={(e) => setForm({
                        ...form,
                        seo_page_overrides: { ...form.seo_page_overrides, contact: { ...getOverrides('contact'), desc: e.target.value } }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Code className="w-4 h-4 text-[#005DDD]" />
              <span>Schema.org Structured Data (JSON-LD)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Skema terstruktur JSON-LD membantu mesin pencari Google memahami entitas bisnis dan agensi Anda untuk hasil cuplikan kaya (*rich snippets*).
            </p>

            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                Pilih Tipe Entitas Schema.org
              </label>
              <select
                value={form.seo_schema_type}
                onChange={(e) => setForm({ ...form, seo_schema_type: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] bg-white"
              >
                <option value="ProfessionalService">ProfessionalService (Agensi Kreatif &amp; Konsultan)</option>
                <option value="WebApplication">WebApplication (Aplikasi Platform SaaS)</option>
                <option value="Organization">Organization (Organisasi Umum)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                Pratinjau Kode JSON-LD Tergenerate (`&lt;script type="application/ld+json"&gt;`)
              </label>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "${form.seo_schema_type}",
  "name": "${settings.agency_name} Creative Agency",
  "url": "${window.location.origin}",
  "logo": "${settings.logo_light_url || '/assets/Logo Utama Rata Kiri.png'}",
  "image": "${form.seo_og_image_url}",
  "description": "${form.seo_meta_description}",
  "telephone": "${settings.admin_whatsapp_number}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${settings.studio_address}",
    "addressCountry": "ID"
  },
  "sameAs": [
    "${settings.instagram_url}",
    "${settings.linkedin_url}"
  ]
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#005DDD]" />
                  <span>Pratinjau Hasil Tampilan Mesin Pencari &amp; Sosmed</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Simulasi nyata bagaimana tautan web Anda tampil saat dibagikan atau diindeks.</p>
              </div>

              {/* Page selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
                {(['home', 'projects', 'articles', 'about', 'contact'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreviewPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      previewPage === p ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              {/* Google Search Snippet Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#005DDD]" /> Pratinjau Hasil Pencarian Google
                </h4>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 font-sans">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">Z</span>
                    <span className="truncate">{window.location.origin} › {previewPage === 'home' ? '' : previewPage}</span>
                  </div>
                  <h5 className="text-[#1a0dab] font-medium text-base hover:underline cursor-pointer truncate">
                    {currentPreviewData()?.title}
                  </h5>
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {currentPreviewData()?.desc}
                  </p>
                </div>
              </div>

              {/* OpenGraph Social Card Preview (WhatsApp / LinkedIn / Twitter) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#005DDD]" /> Pratinjau Kartu Berbagi Sosial (WhatsApp / Twitter)
                </h4>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs max-w-sm">
                  <div className="aspect-[1200/630] w-full bg-slate-200 relative overflow-hidden">
                    <img
                      src={form.seo_og_image_url}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 bg-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 uppercase">{window.location.hostname}</span>
                    <h5 className="text-xs font-extrabold text-slate-900 line-clamp-1">{currentPreviewData()?.title}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{currentPreviewData()?.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
