import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Eye,
  Plus,
  Trash2,
  Check,
  Copy,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Users,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckSquare,
  Building,
} from 'lucide-react';
import { Project, ProjectMilestoneItem, MilestoneStage } from '../../types/database';
import { useApp } from '../../context/AppContext';
import {
  STAGE_CONFIG,
  ORDERED_STAGES,
  calculateMilestoneProgress,
  generateDefaultMilestones,
  generateClientStatusMessage,
} from '../../utils/milestoneDefaults';
import { ClientMilestonePreviewModal } from './ClientMilestonePreviewModal';

interface ProjectMilestonesViewProps {
  onNavigateToCaseStudies?: () => void;
}

export const ProjectMilestonesView: React.FC<ProjectMilestonesViewProps> = ({
  onNavigateToCaseStudies,
}) => {
  const { projects, categories, teamMembers, saveProject, addToast, currentUser } = useApp();
  const isAnalyst = currentUser?.role === 'analyst';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Active Project for Detailed Milestone Editing
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Client Preview Modal State
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  // New task form state inside editor
  const [newTaskStage, setNewTaskStage] = useState<MilestoneStage>('PRODUCTION');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  // Helper to ensure every project has milestones initialized
  const getProjectMilestones = (p: Project): ProjectMilestoneItem[] => {
    if (p.milestones && p.milestones.length > 0) {
      return p.milestones;
    }
    return generateDefaultMilestones(p.id, p.client_name);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase());

    const milestones = getProjectMilestones(p);
    const { activeStage } = calculateMilestoneProgress(milestones);
    const matchesStage = stageFilter === 'ALL' || activeStage === stageFilter;

    const matchesCategory = categoryFilter === 'ALL' || p.category_id === categoryFilter;

    return matchesSearch && matchesStage && matchesCategory;
  });

  // Calculate high-level KPIs across all projects
  const allProjectsWithMilestones = projects.map((p) => ({
    project: p,
    stats: calculateMilestoneProgress(getProjectMilestones(p)),
  }));

  const totalProjects = projects.length;
  const avgCompletion =
    totalProjects > 0
      ? Math.round(
          allProjectsWithMilestones.reduce((acc, curr) => acc + curr.stats.completionPercentage, 0) /
            totalProjects
        )
      : 0;

  const inProductionCount = allProjectsWithMilestones.filter(
    (item) => item.stats.activeStage === 'PRODUCTION'
  ).length;

  const inReviewOrDeliveryCount = allProjectsWithMilestones.filter(
    (item) => item.stats.activeStage === 'REVIEW' || item.stats.activeStage === 'DELIVERY'
  ).length;

  // Selected Project for Editing
  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) || null
    : null;

  const selectedMilestones: ProjectMilestoneItem[] = selectedProject
    ? getProjectMilestones(selectedProject)
    : [];

  const selectedStats = selectedProject
    ? calculateMilestoneProgress(selectedMilestones)
    : null;

  // Handlers for Milestone Modification
  const handleToggleTask = (stageKey: MilestoneStage, taskId: string) => {
    if (!selectedProject || isAnalyst) return;

    const currentMilestones = getProjectMilestones(selectedProject);
    const updatedMilestones = currentMilestones.map((m) => {
      if (m.stage !== stageKey) return m;

      const updatedChecklist = m.checklist.map((c) => {
        if (c.id !== taskId) return c;
        const nowCompleted = !c.completed;
        return {
          ...c,
          completed: nowCompleted,
          completed_at: nowCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      });

      // Update milestone status based on checklist
      const allDone = updatedChecklist.every((item) => item.completed);
      const someDone = updatedChecklist.some((item) => item.completed);
      const newStatus: ProjectMilestoneItem['status'] = allDone
        ? 'COMPLETED'
        : someDone
        ? 'IN_PROGRESS'
        : 'PENDING';

      return {
        ...m,
        status: newStatus,
        checklist: updatedChecklist,
      };
    });

    const newStats = calculateMilestoneProgress(updatedMilestones);

    saveProject({
      ...selectedProject,
      milestones: updatedMilestones,
      progress_stage: newStats.activeStage,
      completion_percentage: newStats.completionPercentage,
    });

    addToast('Status butir tugas berhasil diperbarui.', 'info');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim() || isAnalyst) return;

    const currentMilestones = getProjectMilestones(selectedProject);
    const updatedMilestones = currentMilestones.map((m) => {
      if (m.stage !== newTaskStage) return m;

      const newTask = {
        id: `${selectedProject.id}-${m.stage}-c${Date.now()}`,
        title: newTaskTitle.trim(),
        completed: false,
        assigned_to: newTaskAssignedTo.trim() || undefined,
      };

      return {
        ...m,
        checklist: [...(m.checklist || []), newTask],
      };
    });

    const newStats = calculateMilestoneProgress(updatedMilestones);

    saveProject({
      ...selectedProject,
      milestones: updatedMilestones,
      progress_stage: newStats.activeStage,
      completion_percentage: newStats.completionPercentage,
    });

    setNewTaskTitle('');
    setNewTaskAssignedTo('');
    addToast('Tugas baru berhasil ditambahkan ke milestone.', 'success');
  };

  const handleDeleteTask = (stageKey: MilestoneStage, taskId: string) => {
    if (!selectedProject || isAnalyst) return;

    const currentMilestones = getProjectMilestones(selectedProject);
    const updatedMilestones = currentMilestones.map((m) => {
      if (m.stage !== stageKey) return m;
      return {
        ...m,
        checklist: m.checklist.filter((c) => c.id !== taskId),
      };
    });

    const newStats = calculateMilestoneProgress(updatedMilestones);

    saveProject({
      ...selectedProject,
      milestones: updatedMilestones,
      progress_stage: newStats.activeStage,
      completion_percentage: newStats.completionPercentage,
    });

    addToast('Butir tugas berhasil dihapus.', 'info');
  };

  const handleUpdateStageStatus = (stageKey: MilestoneStage, newStatus: ProjectMilestoneItem['status']) => {
    if (!selectedProject || isAnalyst) return;

    const currentMilestones = getProjectMilestones(selectedProject);
    const updatedMilestones = currentMilestones.map((m) => {
      if (m.stage !== stageKey) return m;
      return {
        ...m,
        status: newStatus,
      };
    });

    const newStats = calculateMilestoneProgress(updatedMilestones);

    saveProject({
      ...selectedProject,
      milestones: updatedMilestones,
      progress_stage: newStats.activeStage,
      completion_percentage: newStats.completionPercentage,
    });

    addToast(`Status tahapan ${stageKey} diperbarui ke ${newStatus}.`, 'success');
  };

  const handleUpdateTargetDate = (dateVal: string) => {
    if (!selectedProject || isAnalyst) return;
    saveProject({
      ...selectedProject,
      target_delivery_date: dateVal,
    });
    addToast('Target tanggal delivery berhasil diperbarui.', 'success');
  };

  const handleResetToStandardMilestones = () => {
    if (!selectedProject || isAnalyst) return;
    if (confirm('Atur ulang seluruh tahapan milestone proyek ini ke template standar 5-tahap Zekalian?')) {
      const freshMilestones = generateDefaultMilestones(selectedProject.id, selectedProject.client_name);
      const newStats = calculateMilestoneProgress(freshMilestones);
      saveProject({
        ...selectedProject,
        milestones: freshMilestones,
        progress_stage: newStats.activeStage,
        completion_percentage: newStats.completionPercentage,
      });
      addToast('Milestone berhasil diatur ulang ke template standar.', 'success');
    }
  };

  const handleCopyWhatsAppUpdate = (p: Project) => {
    const milestones = getProjectMilestones(p);
    const message = generateClientStatusMessage(p.title, p.client_name, milestones, p.target_delivery_date);
    navigator.clipboard?.writeText(message);
    addToast(`Laporan progres untuk klien "${p.client_name}" disalin ke clipboard!`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Proyek Terpantau</span>
            <FolderKanban className="w-4 h-4 text-[#005DDD]" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totalProjects}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Dalam pipeline produksi studio</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata Kemajuan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono text-emerald-600">
            {avgCompletion}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tahap Produksi</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#005DDD] animate-pulse" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono text-[#005DDD]">
            {inProductionCount}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Sedang proses syuting / eksekusi</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Review &amp; Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono text-amber-600">
            {inReviewOrDeliveryCount}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Menunggu evaluasi / serah terima</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul proyek atau nama klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStageFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                stageFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua ({projects.length})
            </button>
            {ORDERED_STAGES.map((stg) => {
              const meta = STAGE_CONFIG[stg];
              const count = allProjectsWithMilestones.filter((p) => p.stats.activeStage === stg).length;
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => setStageFilter(stg)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    stageFilter === stg
                      ? 'bg-white text-[#005DDD] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {meta.shortLabel} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#005DDD]"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Projects Grid & Interactive Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Project Cards List (Left Side - 7 Cols) */}
        <div className={`${selectedProject ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Daftar Proyek &amp; Indikator Milestone ({filteredProjects.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Klik kartu untuk kelola checklist detail
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
              <FolderKanban className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Tidak ada proyek yang sesuai filter</p>
              <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter tahapan.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${selectedProject ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {filteredProjects.map((p) => {
                const milestones = getProjectMilestones(p);
                const {
                  completionPercentage,
                  completedTasks,
                  totalTasks,
                  activeStage,
                  completedStages,
                  totalStages,
                } = calculateMilestoneProgress(milestones);

                const activeMeta = STAGE_CONFIG[activeStage] || STAGE_CONFIG.PRODUCTION;
                const isSelected = selectedProjectId === p.id;
                const cat = categories.find((c) => c.id === p.category_id);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                    className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer relative group flex flex-col justify-between shadow-2xs hover:shadow-md ${
                      isSelected
                        ? 'border-[#005DDD] ring-2 ring-[#005DDD]/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#005DDD] bg-blue-50 px-2.5 py-1 rounded-xl truncate max-w-[160px]">
                          {cat?.name || 'Kreatif'}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${activeMeta.badgeBg} ${activeMeta.badgeText} border ${activeMeta.borderCol}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${activeMeta.dotCol}`} />
                          <span>{activeMeta.shortLabel}</span>
                        </span>
                      </div>

                      {/* Client & Title */}
                      <div className="space-y-1 mb-4">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          {p.client_name}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#005DDD] transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </h4>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Kemajuan Pengerjaan:</span>
                          <span className="font-mono text-sm font-black text-[#005DDD]">
                            {completionPercentage}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#005DDD] to-cyan-400 transition-all duration-500"
                            style={{ width: `${Math.max(4, completionPercentage)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                          <span>{completedTasks} / {totalTasks} Butir Tugas Selesai</span>
                          <span>{completedStages} / {totalStages} Tahap</span>
                        </div>
                      </div>

                      {/* Target Date Pill */}
                      {p.target_delivery_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-4">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target Delivery: <strong className="text-slate-800">{p.target_delivery_date}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#005DDD] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Tutup Detail' : 'Kelola Checklist'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyWhatsAppUpdate(p)}
                          className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Salin Update Format WhatsApp untuk Klien"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewProject(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="Buka Pratinjau Tampilan Klien"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#005DDD]" />
                          <span className="hidden sm:inline">Pratinjau Klien</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Milestone Workspace Drawer (Right Side - 7 Cols when selected) */}
        {selectedProject && selectedStats && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 sticky top-20">
            {/* Drawer Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005DDD] text-[10px] font-black uppercase tracking-wider">
                    Editor Milestone Proyek
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs font-semibold text-slate-500">{selectedProject.client_name}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {selectedProject.title}
                </h3>
              </div>

              {/* Action Buttons Top */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewProject(selectedProject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau Klien</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyWhatsAppUpdate(selectedProject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Salin Update Format WhatsApp"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salin WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Tutup Panel Detail"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Stepped Interactive Stage Tracker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Alur Tahapan Pengerjaan (Stepped Progress):</span>
                <span className="text-[#005DDD] font-mono">
                  {selectedStats.completionPercentage}% Selesai ({selectedStats.completedTasks}/{selectedStats.totalTasks} Tugas)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#005DDD] via-cyan-400 to-emerald-400 transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.max(4, selectedStats.completionPercentage)}%` }}
                />
              </div>

              {/* Stage Step Nodes */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {ORDERED_STAGES.map((stg, idx) => {
                  const meta = STAGE_CONFIG[stg];
                  const stageMilestone = selectedMilestones.find((m) => m.stage === stg);
                  const isComplete =
                    stageMilestone &&
                    stageMilestone.checklist?.length > 0 &&
                    stageMilestone.checklist.every((c) => c.completed);
                  const isActive = selectedStats.activeStage === stg;

                  return (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => handleUpdateStageStatus(stg, isComplete ? 'IN_PROGRESS' : 'COMPLETED')}
                      disabled={isAnalyst}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isComplete
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isActive
                          ? 'bg-blue-50 border-[#005DDD] text-[#005DDD] font-black ring-1 ring-[#005DDD]/30 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                      title={`Klik untuk ubah status tahapan ${meta.shortLabel}`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        {isComplete ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold truncate">{meta.shortLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Delivery Date & Global Reset Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#005DDD] shrink-0" />
                <span className="font-bold text-slate-700">Target Tanggal Delivery:</span>
                <input
                  type="text"
                  placeholder="Contoh: 15 Oktober 2026"
                  value={selectedProject.target_delivery_date || ''}
                  onChange={(e) => handleUpdateTargetDate(e.target.value)}
                  disabled={isAnalyst}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              {!isAnalyst && (
                <button
                  type="button"
                  onClick={handleResetToStandardMilestones}
                  className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  title="Kembalikan butir tugas ke default 5 tahapan Zekalian"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Template</span>
                </button>
              )}
            </div>

            {/* Add New Custom Task Form */}
            {!isAnalyst && (
              <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#005DDD]" />
                    <span>Tambah Butir Tugas / Deliverable Baru</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    value={newTaskStage}
                    onChange={(e) => setNewTaskStage(e.target.value as MilestoneStage)}
                    className="sm:col-span-4 px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#005DDD]"
                  >
                    {ORDERED_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {STAGE_CONFIG[stg].label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Judul deliverable atau butir tugas..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="sm:col-span-5 px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs focus:outline-none focus:border-[#005DDD]"
                  />

                  <input
                    type="text"
                    placeholder="Penanggung Jawab"
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs focus:outline-none focus:border-[#005DDD]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    + Tambahkan ke Checklist
                  </button>
                </div>
              </form>
            )}

            {/* Stage Milestone Cards & Checklist Tasks */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedMilestones.map((m) => {
                const meta = STAGE_CONFIG[m.stage] || STAGE_CONFIG.PRODUCTION;
                const mDone = m.checklist?.filter((c) => c.completed).length || 0;
                const mTotal = m.checklist?.length || 0;
                const isAllDone = mTotal > 0 && mDone === mTotal;

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isAllDone
                        ? 'border-emerald-200 bg-white'
                        : m.stage === selectedStats.activeStage
                        ? 'border-blue-200 bg-blue-50/15'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${meta.badgeBg} ${meta.badgeText} border ${meta.borderCol}`}
                        >
                          {meta.shortLabel}
                        </span>
                        <div className="truncate">
                          <h5 className="font-extrabold text-slate-900 text-xs truncate">
                            {m.title}
                          </h5>
                        </div>
                      </div>

                      {/* Right Stage Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {mDone} / {mTotal}
                        </span>

                        <select
                          value={m.status}
                          onChange={(e) => handleUpdateStageStatus(m.stage, e.target.value as any)}
                          disabled={isAnalyst}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-extrabold uppercase focus:outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="IN_REVIEW">IN REVIEW</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    </div>

                    {/* Task Checklist Items */}
                    <div className="p-3 divide-y divide-slate-100">
                      {m.checklist && m.checklist.length > 0 ? (
                        m.checklist.map((item) => (
                          <div
                            key={item.id}
                            className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleTask(m.stage, item.id)}
                                disabled={isAnalyst}
                                className="mt-0.5 rounded text-[#005DDD] w-4 h-4 accent-[#005DDD] cursor-pointer"
                              />
                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-semibold block transition-colors ${
                                    item.completed
                                      ? 'line-through text-slate-400 font-normal'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  {item.assigned_to && (
                                    <span>PIC: <strong className="text-slate-600">{item.assigned_to}</strong></span>
                                  )}
                                  {item.completed && item.completed_at && (
                                    <span className="text-emerald-600 font-mono">
                                      &bull; Selesai {item.completed_at}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>

                            {!isAnalyst && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(m.stage, item.id)}
                                className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Hapus butir tugas ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 italic py-1 text-center">
                          Belum ada tugas pada tahap ini. Gunakan form di atas untuk menambahkan.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Client Preview Modal */}
      {previewProject && (
        <ClientMilestonePreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </div>
  );
};
