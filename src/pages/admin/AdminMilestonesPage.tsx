import React from 'react';
import { Flag, ArrowRight, FolderKanban } from 'lucide-react';
import { ProjectMilestonesView } from '../../components/admin/ProjectMilestonesView';

interface AdminMilestonesPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminMilestonesPage: React.FC<AdminMilestonesPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Flag className="w-4 h-4" />
            <span>Documents &amp; Production</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Milestones Proyek &amp; Progres Klien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualisasikan tahapan kerja (Briefing, Konsep, Produksi, Review, Delivery), checklist butir deliverable, persentase progres, dan pratinjau dokumen klien.
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/admin/projects')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <FolderKanban className="w-4 h-4 text-[#005DDD]" />
            <span>Buka Portofolio Proyek</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Main Milestones Visualization & Interactive Management */}
      <ProjectMilestonesView onNavigateToCaseStudies={() => onNavigate?.('/admin/projects')} />
    </div>
  );
};
