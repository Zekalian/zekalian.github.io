import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BugReport } from '../../types/database';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Terminal,
  Trash2,
  Check,
  MessageSquare,
  User,
} from 'lucide-react';

export const AdminBugReportsPage: React.FC = () => {
  const { bugReports, saveBugReport, deleteBugReport, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('General Dashboard');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const filteredBugs = bugReports.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getTargetDepartment = (moduleName: string) => {
    if (['Artikel & Wawasan', 'Testimoni Klien', 'Logo Klien'].includes(moduleName)) {
      return 'Tim Copywriting & Marketing';
    }
    if (['Portofolio Proyek'].includes(moduleName)) {
      return 'Tim Produksi & Editor';
    }
    if (['Generator Invoice', 'Generator Proposal'].includes(moduleName)) {
      return 'Tim Finance & Administrasi';
    }
    return 'Tim Programming & Backend';
  };

  const handleCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const targetDept = getTargetDepartment(module);
    const newBug: BugReport = {
      id: `bug-${Date.now()}`,
      title,
      description,
      module,
      severity,
      status: 'open',
      reported_by: currentUser?.full_name || 'System Admin',
      reported_at: new Date().toISOString(),
      department_notified: targetDept,
    };

    saveBugReport(newBug);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const canResolveBug = (role: string, moduleName: string) => {
    if (role === 'super_admin' || role === 'admin') return true;
    if (role === 'programmer') {
      return ['General Dashboard', 'Generator Proposal', 'Generator Invoice', 'Kelola User (RBAC)', 'Pengaturan SEO'].includes(moduleName);
    }
    if (role === 'marketing') {
      return ['Artikel & Wawasan', 'Testimoni Klien', 'Logo Klien', 'Pengaturan SEO'].includes(moduleName);
    }
    if (role === 'finance') {
      return ['Generator Invoice', 'Generator Proposal'].includes(moduleName);
    }
    if (role === 'producer' || role === 'editor') {
      return ['Portofolio Proyek', 'Artikel & Wawasan', 'Testimoni Klien'].includes(moduleName);
    }
    return false;
  };

  const updateStatus = (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const bug = bugReports.find((b) => b.id === id);
    if (!bug || !currentUser) return;

    if ((newStatus === 'resolved' || newStatus === 'in_progress') && !canResolveBug(currentUser.role, bug.module)) {
      alert(`Maaf, role ${currentUser.role} tidak memiliki kewenangan untuk menangani atau menyelesaikan isu pada modul "${bug.module}". Isu ini ditangani oleh departemen terkait.`);
      return;
    }

    saveBugReport({ ...bug, status: newStatus, assigned_to: currentUser?.full_name });
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-bold text-[10px]">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">Low</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'resolved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-[11px] border border-sky-200">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Open
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" /> System Engineering &amp; Quality Assurance
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pelaporan Bug &amp; Isu Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pusat pemantauan bug, anomali kode, dan tiket perbaikan untuk Super Admin, Admin, dan Tim Programmer.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#004bb5] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Laporkan Bug Baru</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Isu Dilaporkan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{bugReports.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#005DDD]/10 text-[#005DDD] flex items-center justify-center">
            <Bug className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Open / Pending</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {bugReports.filter((b) => b.status === 'open' || b.status === 'in_progress').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terkoreksi (Resolved)</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {bugReports.filter((b) => b.status === 'resolved').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul bug atau modul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#005DDD]"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#005DDD]"
          >
            <option value="all">Semua Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Bug List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Daftar Tiket &amp; Isu Sistem</h3>
          <span className="text-xs font-bold text-slate-400">{filteredBugs.length} tiket ditemukan</span>
        </div>

        {filteredBugs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🛡️
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada bug atau isu ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sistem berjalan dengan stabil dan belum ada laporan isu baru yang sesuai dengan filter pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBugs.map((bug) => (
              <div key={bug.id} className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {bug.module}
                    </span>
                    {getSeverityBadge(bug.severity)}
                    {getStatusBadge(bug.status)}
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{bug.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{bug.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Dilaporkan oleh: <strong className="text-slate-700">{bug.reported_by}</strong>
                    </span>
                    <span>•</span>
                    <span>{new Date(bug.reported_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {bug.department_notified && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          🔔 Notifikasi ke: {bug.department_notified}
                        </span>
                      </>
                    )}
                    {bug.assigned_to && (
                      <>
                        <span>•</span>
                        <span className="text-[#005DDD] font-semibold">Ditangani: {bug.assigned_to}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {bug.status !== 'open' && (
                    <button
                      onClick={() => updateStatus(bug.id, 'open')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Set Open
                    </button>
                  )}
                  {bug.status !== 'in_progress' && (
                    <button
                      onClick={() => updateStatus(bug.id, 'in_progress')}
                      className="px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 text-xs font-semibold bg-sky-50/50 hover:bg-sky-100 transition-colors"
                    >
                      Proses
                    </button>
                  )}
                  {bug.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(bug.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      Selesaikan
                    </button>
                  )}
                  <button
                    onClick={() => deleteBugReport(bug.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Tiket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create Bug */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Laporkan Isu atau Bug Sistem</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul Isu / Bug</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tombol export PDF error di halaman proposal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Modul Terkait</label>
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#005DDD]"
                  >
                    <option value="General Dashboard">General Dashboard</option>
                    <option value="Generator Proposal">Generator Proposal</option>
                    <option value="Generator Invoice">Generator Invoice</option>
                    <option value="Kelola User (RBAC)">Kelola User (RBAC)</option>
                    <option value="Portofolio Proyek">Portofolio Proyek</option>
                    <option value="Pengaturan SEO">Pengaturan SEO</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Keparahan (Severity)</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#005DDD]"
                  >
                    <option value="low">Low (Minor)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical (Blocking)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Detail &amp; Langkah Reproduksi</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan apa yang terjadi dan bagaimana error tersebut muncul..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#004bb5] transition-colors shadow-sm"
                >
                  Kirim Laporan Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
