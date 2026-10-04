import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  FileText,
  Inbox,
  Image,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Share2,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const {
    projects,
    articles,
    inquiries,
    clientLogos,
    testimonials,
    currentUser,
    pageViews,
    shareEvents,
  } = useApp();

  const activeProjects = projects.filter((p) => p.status === 'PUBLISHED').length;
  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED').length;
  const newInquiries = inquiries.filter((i) => i.status === 'NEW').length;
  const totalInquiries = inquiries.length;

  const statusColors = {
    NEW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    IN_DISCUSSION: 'bg-sky-50 text-sky-700 border-sky-200',
    RESOLVED: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Dashboard Utama
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Selamat datang, <strong>{currentUser?.full_name}</strong>. Berikut status terkini platform Zekalian.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => onNavigate('/admin/analytics')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm hover:bg-purple-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analitik &amp; SEO Traffic</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/inquiries')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-colors"
          >
            <Inbox className="w-4 h-4" />
            <span>Kotak Masuk ({newInquiries} Baru)</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('/admin/projects')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Proyek Portofolio
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#005DDD]/10 text-[#005DDD] flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeProjects}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari total {projects.length} proyek tersimpan
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/articles')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Artikel Publikasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{publishedArticles}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari total {articles.length} draf wawasan
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/inquiries')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pesan Prospek Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{newInquiries}</span>
            <span className="text-xs font-bold text-emerald-600">Baru (Unread)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total {totalInquiries} brief kontak tercatat
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/logos')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Klien &amp; Brand
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Image className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{clientLogos.length}</span>
            <span className="text-xs font-bold text-purple-600">Partner Terverifikasi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {testimonials.length} ulasan &amp; testimoni aktif
          </p>
        </div>
      </div>

      {/* Quick Action & Agency Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('/admin/analytics')}
          className="bg-gradient-to-br from-purple-50/80 to-white p-6 rounded-3xl border border-purple-100 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
            Analitik &amp; SEO Traffic
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pantau artikel &amp; portofolio paling sering di-share ({shareEvents.length} share) dan total {pageViews.length} pageviews.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/schedule')}
          className="bg-gradient-to-br from-blue-50/80 to-white p-6 rounded-3xl border border-blue-100 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#005DDD] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#005DDD] transition-colors">
            Jadwal Produksi &amp; Timeline
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Koordinasikan jadwal hari syuting, tenggat waktu editing, review klien, dan penyerahan master video produksi.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/milestones')}
          className="bg-gradient-to-br from-emerald-50/80 to-white p-6 rounded-3xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Milestones Proyek Aktif
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pantau persentase penyelesaian proyek kreatif dan berikan transparansi tahapan produksi kepada klien resmi.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/inquiries')}
          className="bg-gradient-to-br from-sky-50/80 to-white p-6 rounded-3xl border border-sky-100 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
            Konversi Kontak Prospek
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tinjau {newInquiries} brief prospek baru yang masuk dari form publik dan tindak lanjuti langsung via WhatsApp atau Email.
          </p>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pesan Brief Terbaru (/contact Inquiries)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulir kontak masuk dari calon klien yang membutuhkan tindak lanjut
            </p>
          </div>
          <button
            onClick={() => onNavigate('/admin/inquiries')}
            className="text-xs font-bold text-[#005DDD] hover:underline flex items-center gap-1"
          >
            <span>Semua Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {inquiries.slice(0, 4).map((inq) => (
            <div
              key={inq.id}
              onClick={() => onNavigate('/admin/inquiries')}
              className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-slate-900">{inq.name}</h4>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      statusColors[inq.status]
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{inq.email}</p>
                <p className="text-xs text-slate-700 line-clamp-1 italic max-w-xl">
                  &ldquo;{inq.project_vision}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(inq.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}

          {inquiries.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada pesan brief masuk dari form kontak.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
