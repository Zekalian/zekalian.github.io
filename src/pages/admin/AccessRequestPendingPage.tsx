import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/database';
import {
  ShieldAlert,
  Clock,
  Send,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Briefcase,
  User,
  FileText,
} from 'lucide-react';

interface AccessRequestPendingPageProps {
  onNavigate: (route: string) => void;
}

export const AccessRequestPendingPage: React.FC<AccessRequestPendingPageProps> = ({ onNavigate }) => {
  const { currentUser, logout, submitAccessRequest, refreshCurrentUser, addToast } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [department, setDepartment] = useState(currentUser?.request_department || 'Kru Produksi & Videografi');
  const [requestedRole, setRequestedRole] = useState<UserRole>(currentUser?.requested_role || 'editor');
  const [reason, setReason] = useState(
    currentUser?.request_reason || 'Membutuhkan akses untuk pengelolaan portofolio proyek dan pembaruan artikel studio.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!currentUser) return null;

  const isRejected = currentUser.account_status === 'REJECTED';
  const isPending = currentUser.account_status === 'PENDING_APPROVAL' || currentUser.role === 'pending';

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !department.trim()) {
      addToast('Mohon lengkapi nama dan departemen Anda.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitAccessRequest({
        full_name: fullName.trim(),
        request_department: department.trim(),
        requested_role: requestedRole,
        request_reason: reason.trim(),
      });
      if (success) {
        addToast('Permohonan akses berhasil diperbarui dan dikirim ke Super Admin.', 'success');
      } else {
        addToast('Gagal menyimpan permohonan akses.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      if (refreshCurrentUser) {
        await refreshCurrentUser();
      }
      addToast('Status akun berhasil diperiksa ulang.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#005DDD] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#005DDD]/20">
            Z
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Manajemen Internal Zekalian
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sistem Keamanan Akun &amp; Pembatasan Hak Akses Data
          </p>
        </div>

        {/* Status Notice Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-sm ${
            isRejected
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isRejected
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isRejected ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {isRejected
                    ? 'Permohonan Akses Belum Disetujui'
                    : 'Menunggu Persetujuan Hak Akses (Pending Approval)'}
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isRejected
                      ? 'bg-rose-200 text-rose-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {isRejected ? 'DITOLAK' : 'MENUNGGU VERIFIKASI'}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                {isRejected
                  ? 'Akun Google Anda belum diberikan izin akses ke panel internal Zekalian. Jika Anda merupakan anggota tim atau kru aktif, silakan ajukan permohonan ulang dengan mencantumkan divisi kerja Anda atau hubungi Super Admin langsung.'
                  : 'Demi menjaga kerahasiaan data internal studio, analitik prospek, kotak masuk klien, dan kontrol portofolio, setiap akun Google baru harus melalui verifikasi otorisasi terlebih dahulu oleh Super Admin (zakikey.works@gmail.com).'}
              </p>
            </div>
          </div>
        </div>

        {/* User Identity Details & Request Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Authenticated Identity Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Akun Google Terhubung
                </span>
                <h3 className="text-sm font-bold text-slate-900">{currentUser.full_name}</h3>
                <span className="text-xs text-slate-500 font-mono">{currentUser.email}</span>
              </div>
            </div>

            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              title="Periksa status persetujuan terbaru"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#005DDD] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cek Status</span>
            </button>
          </div>

          {/* Form to submit / edit access request */}
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Formulir Pengajuan Otorisasi Tim</h3>
              <p className="text-xs text-slate-500">
                Lengkapi identitas peran Anda agar Super Admin dapat segera menyetujui akun Anda.
              </p>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                Nama Lengkap &amp; Panggilan *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Zaki Fadhillah (Zaki)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Departemen / Posisi */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                Departemen / Posisi di Zekalian Studio *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Video Editor, DOP / Sinematografer, Content Strategist"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Pilihan Peran yang Diminta */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                Tingkat Akses yang Dibutuhkan
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all font-medium"
              >
                <option value="producer">Producer — Fokus Produksi Visual, Shotlist &amp; Brief</option>
                <option value="finance">Finance — Fokus Keuangan, Invoice &amp; Proposal</option>
                <option value="marketing">Marketing &amp; SEO — Fokus Optimasi SEO &amp; Jurnal Artikel</option>
                <option value="editor">Content Editor — Kelola Portofolio, Artikel, &amp; Media</option>
                <option value="analyst">Analyst — Hanya Pantau Analitik &amp; Data Leads (Read-Only)</option>
                <option value="admin">Admin — Kelola Kru Tim &amp; Seluruh Konten Studio</option>
              </select>
            </div>

            {/* Alasan Permohonan */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                Alasan / Keperluan Akses Panel
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan kebutuhan tugas Anda dalam mengakses panel ini..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#005DDD] hover:bg-[#018EE3] text-white font-bold text-xs shadow-md shadow-[#005DDD]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Kirim / Perbarui Permohonan Akses'}</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto py-3 px-6 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info card footer */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 flex items-start gap-3 shadow-2xs">
          <HelpCircle className="w-4 h-4 text-[#005DDD] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Data akses Anda terlindungi oleh sistem keamanan berstandar agensi. Selama status permohonan Anda belum disetujui, akun ini belum memiliki akses ke data internal studio, portofolio, maupun manajemen sistem.
          </p>
        </div>
      </div>
    </div>
  );
};
