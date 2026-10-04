import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InquiryStatus, Inquiry } from '../../types/database';
import { Inbox, Mail, MessageCircle, Clock, CheckCircle2, Search, Filter, ArrowUpRight, Download } from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const { inquiries, updateInquiryStatus, currentUser, addToast, settings, archiveOutgoingWhatsAppMessage } = useApp();

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const isAnalyst = currentUser?.role === 'analyst';

  const statusColors: Record<InquiryStatus, { bg: string; text: string; label: string }> = {
    NEW: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Baru (Unread)' },
    IN_DISCUSSION: { bg: 'bg-sky-50 border-sky-200', text: 'text-[#005DDD]', label: 'Dalam Diskusi' },
    RESOLVED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Selesai (Deal/Archived)' },
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchStatus = filterStatus === 'ALL' || inq.status === filterStatus;
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchSearch =
      !cleanSearch ||
      inq.name.toLowerCase().includes(cleanSearch) ||
      inq.email.toLowerCase().includes(cleanSearch) ||
      inq.project_vision.toLowerCase().includes(cleanSearch);

    return matchStatus && matchSearch;
  });

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      addToast('Tidak ada data prospek untuk diexport.', 'error');
      return;
    }
    const headers = ['ID', 'Nama', 'Email', 'Visi Proyek', 'Status', 'Tanggal'];
    const rows = inquiries.map((i) => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.project_vision.replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${new Date(i.created_at).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zekalian_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Data prospek berhasil diexport ke CSV!', 'success');
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Inbox className="w-4 h-4" />
            <span>Lead Generation Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kotak Masuk Prospek &amp; Brief Proyek
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar prospek dan calon mitra yang telah mengirimkan formulir kontak dari situs web.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#005DDD]" />
          <span>Export CSV Prospek</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            {['ALL', 'NEW', 'IN_DISCUSSION', 'RESOLVED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === s
                    ? 'bg-[#005DDD] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari prospek atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005DDD]"
          />
        </div>
      </div>

      {/* Inquiries Table & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              const meta = statusColors[inq.status];

              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected ? 'bg-sky-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{inq.name}</h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text}`}
                        >
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{inq.email}</p>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inq.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 italic leading-relaxed">
                    &ldquo;{inq.project_vision}&rdquo;
                  </p>
                </div>
              );
            })}

            {filteredInquiries.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                Tidak ada data pesan prospek yang sesuai kriteria.
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-5">
          {selectedInquiry ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Rincian Pesan Calon Mitra
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    statusColors[selectedInquiry.status].bg
                  } ${statusColors[selectedInquiry.status].text}`}
                >
                  {selectedInquiry.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedInquiry.name}
                </h3>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="text-xs font-semibold text-[#005DDD] hover:underline flex items-center gap-1 mt-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedInquiry.email}</span>
                </a>
                <p className="text-[11px] text-slate-400 mt-2">
                  Diterima: {new Date(selectedInquiry.created_at).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">
                  Visi &amp; Deskripsi Proyek
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedInquiry.project_vision}
                </div>
              </div>

              {/* Status Update Control */}
              <div className="pt-2">
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                  Perbarui Status Prospek:
                </label>
                <select
                  disabled={isAnalyst}
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const next = e.target.value as InquiryStatus;
                    updateInquiryStatus(selectedInquiry.id, next);
                    setSelectedInquiry({ ...selectedInquiry, status: next });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#005DDD] disabled:opacity-60"
                >
                  <option value="NEW">NEW (Baru Masuk)</option>
                  <option value="IN_DISCUSSION">IN_DISCUSSION (Sedang Dihubungi/Negosiasi)</option>
                  <option value="RESOLVED">RESOLVED (Deal / Selesai)</option>
                </select>
                {isAnalyst && (
                  <span className="text-[10px] text-slate-400 mt-1 block italic">
                    Peran Analyst hanya memiliki hak baca.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    'Tanggapan Brief Proyek - Zekalian Agency'
                  )}`}
                  className="flex-1 py-3 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kirim Email Balasan</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const waNum = settings.admin_whatsapp_number.replace(/[^0-9]/g, '');
                    const replyText = `Halo ${selectedInquiry.name}, terima kasih telah menghubungi Zekalian Agency mengenai proyek Anda ("${selectedInquiry.project_vision.slice(0, 60)}..."). Kami siap berdiskusi lebih lanjut!`;
                    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(replyText)}`;
                    archiveOutgoingWhatsAppMessage?.({
                      message: replyText,
                      recipient: settings.admin_whatsapp_number,
                      placement: 'admin_inquiry_reply',
                      projectContext: {
                        id: selectedInquiry.id,
                        title: `Inquiry Brief: ${selectedInquiry.name}`,
                        client: selectedInquiry.name,
                        category: 'Inquiry Response',
                      },
                      customPath: '/admin/inquiries',
                      targetUrl: waUrl,
                    });
                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                    addToast('Membuka WhatsApp & pesan berhasil diarsipkan ke Chat Logs Firestore.', 'success');
                  }}
                  className="flex-1 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>Balas via WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p>Pilih pesan di sebelah kiri untuk melihat rincian lengkap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
