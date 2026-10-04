import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Share2,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Project, ProjectMilestoneItem } from '../../types/database';
import {
  STAGE_CONFIG,
  ORDERED_STAGES,
  calculateMilestoneProgress,
  generateClientStatusMessage,
} from '../../utils/milestoneDefaults';
import { ZekalianLogo } from '../ZekalianLogo';
import { useApp } from '../../context/AppContext';

interface ClientMilestonePreviewModalProps {
  project: Project;
  onClose: () => void;
}

export const ClientMilestonePreviewModal: React.FC<ClientMilestonePreviewModalProps> = ({
  project,
  onClose,
}) => {
  const { addToast, settings } = useApp();
  const [copied, setCopied] = useState(false);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const milestones: ProjectMilestoneItem[] =
    project.milestones && project.milestones.length > 0 ? project.milestones : [];

  const {
    completionPercentage,
    completedTasks,
    totalTasks,
    activeStage,
    completedStages,
    totalStages,
  } = calculateMilestoneProgress(milestones);

  const activeStageMeta = STAGE_CONFIG[activeStage] || STAGE_CONFIG.PRODUCTION;

  const handleCopyWhatsApp = () => {
    const message = generateClientStatusMessage(
      project.title,
      project.client_name,
      milestones,
      project.target_delivery_date
    );
    navigator.clipboard?.writeText(message);
    setCopied(true);
    addToast('Laporan progres untuk klien berhasil disalin!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp direct link for client
  const waNumber = (settings?.admin_whatsapp_number || '6281234567890').replace(/[^0-9]/g, '');
  const waClientUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Tim Zekalian Agency, saya ingin berdiskusi mengenai update progres proyek ${project.title} (${project.client_name}).`
  )}`;

  const visibleMilestones = milestones.filter(
    (m) => m.client_visible !== false && (filterStage === 'ALL' || m.stage === filterStage)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls (Bar Atas) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#005DDD] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pratinjau Tampilan Klien</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Format presentasi transparansi progres untuk pihak klien
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Salin Pesan Update WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Pesan WA'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Cetak atau Simpan PDF Laporan"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Client Document Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white print:p-0">
          {/* Agency & Client Branding Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="mb-2">
                <ZekalianLogo size="md" />
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Laporan Progres Pengerjaan Karya &amp; Transparansi Tahapan Proyek
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                Klien Resmi
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {project.client_name}
              </h2>
              <div className="flex items-center sm:justify-end gap-2 mt-1 text-xs text-slate-500">
                <Building className="w-3.5 h-3.5 text-[#005DDD]" />
                <span className="font-semibold text-slate-700">{project.title}</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#005DDD] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold tracking-wide uppercase">
                    Tahap: {activeStageMeta.shortLabel}
                  </span>
                  {project.target_delivery_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/80">
                      <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Target: {project.target_delivery_date}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                  {activeStageMeta.description}
                </p>
              </div>

              {/* Big Percentage Radial / Counter */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:px-6 sm:py-5 flex items-center justify-between md:flex-col md:justify-center gap-2 shrink-0">
                <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-cyan-300">
                  {completionPercentage}%
                </span>
                <span className="text-[11px] font-semibold text-white/90">
                  {completedTasks} dari {totalTasks} Tugas Selesai
                </span>
              </div>
            </div>

            {/* Glowing Big Progress Bar */}
            <div className="mt-6 pt-5 border-t border-white/15 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-white/80">
                <span>Kemajuan Keseluruhan Proyek</span>
                <span className="font-mono">{completedStages} dari {totalStages} Tahap Tuntas</span>
              </div>
              <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.max(5, completionPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Visual Step Tracker (Stepped Timeline) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tahapan Utama Pengerjaan (Timeline Stages)
              </h4>
              <span className="text-xs text-slate-400">
                Status: <strong className="text-slate-800">{activeStageMeta.label}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {ORDERED_STAGES.map((stg, index) => {
                const meta = STAGE_CONFIG[stg];
                const stageMilestone = milestones.find((m) => m.stage === stg);
                const isStageComplete =
                  stageMilestone &&
                  stageMilestone.checklist?.length > 0 &&
                  stageMilestone.checklist.every((c) => c.completed);
                const isStageActive = activeStage === stg;

                return (
                  <div
                    key={stg}
                    className={`p-3.5 rounded-2xl border transition-all text-left ${
                      isStageComplete
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : isStageActive
                        ? 'bg-blue-50 border-[#005DDD] text-blue-950 shadow-sm ring-1 ring-[#005DDD]/30'
                        : 'bg-slate-50 border-slate-200/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                        0{index + 1}
                      </span>
                      {isStageComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isStageActive ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#005DDD] animate-pulse shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-extrabold text-xs tracking-tight line-clamp-1">
                      {meta.shortLabel}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {isStageComplete ? 'Selesai' : isStageActive ? 'Sedang Berjalan' : 'Menunggu'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Checklist Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Checklist Detail &amp; Transparansi Deliverables
                </h4>
                <p className="text-xs text-slate-500">
                  Daftar butir pekerjaan yang dikerjakan oleh tim Zekalian Agency untuk proyek ini
                </p>
              </div>

              {/* Quick Filter */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterStage('ALL')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStage === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({totalTasks})
                </button>
                {ORDERED_STAGES.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setFilterStage(stg)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      filterStage === stg
                        ? 'bg-[#005DDD] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {STAGE_CONFIG[stg].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Cards & Task Checklist */}
            <div className="space-y-5">
              {visibleMilestones.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Tidak ada butir checklist yang ditampilkan untuk filter ini.
                </div>
              ) : (
                visibleMilestones.map((m) => {
                  const meta = STAGE_CONFIG[m.stage] || STAGE_CONFIG.PRODUCTION;
                  const mDoneCount = m.checklist?.filter((c) => c.completed).length || 0;
                  const mTotalCount = m.checklist?.length || 0;
                  const isStageComplete = mTotalCount > 0 && mDoneCount === mTotalCount;

                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl border overflow-hidden transition-all ${
                        isStageComplete
                          ? 'border-emerald-200 bg-white shadow-xs'
                          : m.stage === activeStage
                          ? 'border-blue-200 bg-blue-50/20 shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Milestone Header */}
                      <div className="p-4 sm:px-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${meta.badgeBg} ${meta.badgeText} border ${meta.borderCol}`}
                          >
                            {meta.shortLabel}
                          </span>
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm">{m.title}</h5>
                            {m.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
                          {m.target_date && (
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{m.target_date}</span>
                            </span>
                          )}
                          <span
                            className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              isStageComplete
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200/80 text-slate-700'
                            }`}
                          >
                            {mDoneCount} / {mTotalCount} Selesai
                          </span>
                        </div>
                      </div>

                      {/* Checklist Items */}
                      <div className="p-4 sm:p-6 divide-y divide-slate-100">
                        {m.checklist && m.checklist.length > 0 ? (
                          m.checklist.map((item) => (
                            <div
                              key={item.id}
                              className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 group"
                            >
                              <div className="pt-0.5 shrink-0">
                                {item.completed ? (
                                  <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-lg border-2 border-slate-300 flex items-center justify-center bg-white" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs sm:text-sm font-semibold ${
                                    item.completed
                                      ? 'text-slate-900'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                                  {item.assigned_to && (
                                    <span>Penanggung Jawab: <strong className="text-slate-600">{item.assigned_to}</strong></span>
                                  )}
                                  {item.completed && item.completed_at && (
                                    <span className="text-emerald-700 font-semibold">
                                      Diselesaikan pada: {item.completed_at}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic py-2">
                            Belum ada butir tugas terdaftar pada tahap ini.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Client Assurance & CTA Footer */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-900 text-sm">
                  Komitmen Transparansi Berkala Zekalian
                </h5>
                <p className="text-xs text-slate-500">
                  Hubungi kami kapan saja jika ada revisi konsep atau pertanyaan mengenai jadwal produksi.
                </p>
              </div>
            </div>

            <a
              href={waClientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Diskusi via WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Proyek: <strong>{project.title}</strong> &bull; Status: <strong className="text-[#005DDD]">{completionPercentage}% Selesai</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
