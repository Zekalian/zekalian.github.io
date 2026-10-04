import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Article } from '../../types/database';
import { RichEditor } from '../../components/admin/RichEditor';
import { uploadFileToStorage, isWebPFile } from '../../lib/firebase';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Eye,
  ExternalLink,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  UploadCloud,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';

export const AdminArticlesPage: React.FC = () => {
  const { articles, saveArticle, deleteArticle, currentUser } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth(); // 0-11

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState('Branding, Strategi');
  const [readingTime, setReadingTime] = useState('4 min read');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [contentHtml, setContentHtml] = useState('');

  const isAnalyst = currentUser?.role === 'analyst';

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setCoverImageUrl('');
    setTags('Branding, Strategi');
    setReadingTime('4 min read');
    setStatus('PUBLISHED');
    setContentHtml('');
  };

  const handleStartCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (art: Article) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setExcerpt(art.excerpt);
    setCoverImageUrl(art.cover_image_url);
    setTags(art.tags || '');
    setReadingTime(art.reading_time || '4 min read');
    setStatus(art.status);
    setContentHtml(art.content_html);
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleCoverFileUpload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      alert('Format file ditolak: Sistem hanya menerima file gambar format WebP (.webp). Mohon unggah file berekstensi .webp atau gunakan tautan URL gambar.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingCover(true);
    setUploadProgressText('Mengunggah file WebP ke storage...');
    try {
      const url = await uploadFileToStorage(file, 'articles');
      setCoverImageUrl(url);
    } catch (err: any) {
      console.error('Upload article cover failed:', err);
      alert('Gagal mengunggah gambar cover: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploadingCover(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    saveArticle({
      id: editingArticle?.id,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt,
      cover_image_url:
        coverImageUrl ||
        'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
      tags,
      reading_time: readingTime,
      content_html: contentHtml,
      status,
      published_at: editingArticle?.published_at || new Date().toISOString(),
    });

    resetForm();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <FileText className="w-4 h-4" />
            <span>Editorial &amp; Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Artikel &amp; Wawasan Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tulis panduan visual, strategi branding, dan ulasan kreatif dengan editor teks kaya (Rich Block Editor).
          </p>
        </div>

        {!isAnalyst && !isFormOpen && (
          <button
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </button>
        )}
      </div>

      {/* Article Editor Form */}
      {isFormOpen && !isAnalyst && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingArticle ? 'Edit Konten Artikel' : 'Tulis Draf Artikel Baru'}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Judul Artikel *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Menakar Bobot Brand Identity di Era AI"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="menakar-bobot-brand-identity"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="block text-xs uppercase font-bold text-slate-700">
                  Cover Image Artikel (Rasio 16:9)
                </label>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005DDD] font-bold border border-blue-200/80 px-2.5 py-0.5 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]"></span>
                  <span>Wajib Format .WebP atau Gunakan Tautan Link (URL)</span>
                </div>
              </div>

              {/* Live Preview if coverImageUrl exists */}
              {coverImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-[16/9] max-h-56 w-full flex items-center justify-center">
                  <img
                    src={coverImageUrl}
                    alt="Preview Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#005DDD]" />
                      <span>Ganti File .WebP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dual Upload / URL Input Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Option 1: File Upload (.webp strictly) */}
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingCover(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingCover(false); }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation(); setIsDraggingCover(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleCoverFileUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => !isUploadingCover && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                    isDraggingCover
                      ? 'border-[#005DDD] bg-sky-50'
                      : isUploadingCover
                      ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-sky-50/30 hover:border-[#005DDD]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/webp,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleCoverFileUpload(e.target.files);
                      }
                    }}
                  />
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 className="w-5 h-5 text-[#005DDD] animate-spin" />
                      <span className="text-xs font-bold text-[#005DDD]">{uploadProgressText || 'Mengunggah WebP...'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud className="w-5 h-5 text-[#005DDD]" />
                      <p className="text-xs font-bold text-slate-800">
                        Unggah Berkas <span className="text-[#005DDD]">.WEBP</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Tarik &amp; lepas atau klik untuk memilih file .webp
                      </p>
                    </div>
                  )}
                </div>

                {/* Option 2: Direct URL Input */}
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-white flex flex-col justify-center">
                  <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-[#005DDD]" />
                    <span>Atau Masukkan Tautan / Link Gambar (URL):</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... atau URL gambar"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD] focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Mendukung tautan gambar eksternal (Unsplash, CDN, atau server web).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Tagar / Kategori (Pisahkan Koma)
              </label>
              <input
                type="text"
                placeholder="Branding, Desain, Panduan"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
              Kutipan Ringkas (Excerpt / Lead Paragraf) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ringkasan 2-3 baris untuk kartu artikel dan meta description..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
            />
          </div>

          {/* Rich Editor Component with Inline Image & YouTube Embed tools */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 mb-2">
              Badan Artikel (Rich Content) *
            </label>
            <RichEditor content={contentHtml} onChange={setContentHtml} />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Status Publikasi:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Estimasi Baca:</span>
              <input
                type="text"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs w-28"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white text-xs font-bold shadow-sm"
            >
              {editingArticle ? 'Simpan Pembaruan Artikel' : 'Publikasikan Artikel'}
            </button>
          </div>
        </form>
      )}

      {/* View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabel Daftar ({articles.length})</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'calendar'
                ? 'bg-white text-[#005DDD] shadow-xs'
                : 'text-slate-500 hover:text-[#005DDD]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Editorial</span>
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="min-w-[140px] text-center font-extrabold text-slate-900">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* Conditional View: Table or Calendar */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">Judul Artikel</th>
                  <th className="py-4 px-6">Tagar</th>
                  <th className="py-4 px-6">Waktu Baca</th>
                  <th className="py-4 px-6">Tanggal Rilis</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="max-w-md">
                        <span className="font-bold text-slate-900 block text-sm line-clamp-1">
                          {art.title}
                        </span>
                        <span className="text-slate-400 text-[11px] line-clamp-1">{art.excerpt}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[#005DDD] font-semibold">{art.tags || '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{art.reading_time || '4 min read'}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(art.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isAnalyst ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(art)}
                            className="p-1.5 text-slate-400 hover:text-[#005DDD]"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus artikel "${art.title}"?`)) {
                                deleteArticle(art.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[110px] bg-slate-50/50 rounded-2xl border border-slate-100/60 opacity-40" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              
              // Find articles published on this date
              const dayArticles = articles.filter((art) => {
                const artDate = new Date(art.published_at);
                return (
                  artDate.getFullYear() === year &&
                  artDate.getMonth() === month &&
                  artDate.getDate() === dayNum
                );
              });

              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === dayNum;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[120px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-[#005DDD] bg-sky-50/30 shadow-xs ring-1 ring-[#005DDD]/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black font-mono w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-[#005DDD] text-white' : 'text-slate-700 bg-slate-100'
                    }`}>
                      {dayNum}
                    </span>
                    {dayArticles.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-[#005DDD]">
                        {dayArticles.length} artikel
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 my-1.5 overflow-y-auto max-h-[80px] scrollbar-none">
                    {dayArticles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleStartEdit(art)}
                        className={`p-1.5 rounded-xl text-[11px] font-bold cursor-pointer truncate transition-all shadow-2xs hover:scale-[1.02] ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title={`${art.title} (${art.status})`}
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle bg-current" />
                        {art.title}
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] text-slate-400 text-right">
                    {dayArticles.length === 0 ? '-' : 'Terjadwal'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
