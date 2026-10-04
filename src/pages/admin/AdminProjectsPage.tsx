import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectCrew, ProjectMedia } from '../../types/database';
import { uploadFileToStorage } from '../../lib/firebase';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Video,
  Image as ImageIcon,
  Check,
  Star,
  ExternalLink,
  Users,
  Flag,
  ArrowRight,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Globe,
  UserCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ImgbbGuideModal } from '../../components/admin/ImgbbGuideModal';

interface AdminProjectsPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminProjectsPage: React.FC<AdminProjectsPageProps> = ({ onNavigate }) => {
  const { projects, categories, teamMembers, adminUsers, saveProject, deleteProject, currentUser } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isImgbbGuideOpen, setIsImgbbGuideOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [progressStage, setProgressStage] = useState<'DISCOVERY' | 'DESIGN' | 'DEVELOPMENT' | 'REVIEW' | 'COMPLETED'>('DEVELOPMENT');
  const [completionPercentage, setCompletionPercentage] = useState<number>(75);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');

  // Media Collage list
  const [mediaList, setMediaList] = useState<Array<{ image_url: string; caption?: string }>>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  // Drag-and-drop & Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crew assignments state
  interface AssignedCrewItem {
    id?: string;
    team_member_id?: string;
    member_name: string;
    custom_role_in_project: string;
    is_external?: boolean;
  }

  const [assignedCrews, setAssignedCrews] = useState<AssignedCrewItem[]>([]);
  const [crewSourceMode, setCrewSourceMode] = useState<'internal' | 'external'>('internal');
  const [selectedInternalCrewId, setSelectedInternalCrewId] = useState('');
  const [externalCrewName, setExternalCrewName] = useState('');
  const [selectedCrewRole, setSelectedCrewRole] = useState('DIRECTOR');

  // Unified list of all internal members (team profiles + registered user accounts)
  const availableInternalCrew = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      subtext: string;
      originalId: string;
      type: 'team' | 'user';
    }> = [];
    const seenNames = new Set<string>();

    // 1. Registered Team Members (Public Profiles)
    teamMembers.forEach((tm) => {
      seenNames.add(tm.full_name.toLowerCase().trim());
      list.push({
        id: `tm-${tm.id}`,
        name: tm.full_name,
        subtext: `${tm.default_role} (Profil Tim)`,
        originalId: tm.id,
        type: 'team',
      });
    });

    // 2. Registered Admin Users / Studio Staff (Accounts)
    (adminUsers || []).forEach((au) => {
      const name = au.full_name || au.username;
      if (!seenNames.has(name.toLowerCase().trim())) {
        seenNames.add(name.toLowerCase().trim());
        list.push({
          id: `au-${au.id}`,
          name: name,
          subtext: `${au.email} • Staff (${au.role.toUpperCase()})`,
          originalId: au.id,
          type: 'user',
        });
      }
    });

    return list;
  }, [teamMembers, adminUsers]);

  useEffect(() => {
    if (!selectedInternalCrewId && availableInternalCrew.length > 0) {
      setSelectedInternalCrewId(availableInternalCrew[0].id);
    }
  }, [availableInternalCrew, selectedInternalCrewId]);

  const isAnalyst = currentUser?.role === 'analyst';

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setClientName('');
    setDescription('');
    setMediaType('IMAGE');
    setVideoAspectRatio('16:9');
    setYoutubeVideoId('');
    setIsFeatured(false);
    setStatus('PUBLISHED');
    setProgressStage('DEVELOPMENT');
    setCompletionPercentage(75);
    setTargetDeliveryDate('');
    setMediaList([]);
    setAssignedCrews([]);
    setExternalCrewName('');
    setCrewSourceMode('internal');
    if (availableInternalCrew.length > 0) {
      setSelectedInternalCrewId(availableInternalCrew[0].id);
    }
  };

  const handleStartCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategoryId(p.category_id);
    setClientName(p.client_name);
    setDescription(p.description);
    setMediaType(p.media_type);
    setVideoAspectRatio(p.video_aspect_ratio || '16:9');
    setYoutubeVideoId(p.youtube_video_id || '');
    setIsFeatured(p.is_featured);
    setStatus(p.status);
    setProgressStage((p.progress_stage as any) || 'DEVELOPMENT');
    setCompletionPercentage(p.completion_percentage ?? 75);
    setTargetDeliveryDate(p.target_delivery_date || '');
    setMediaList(
      p.media?.map((m) => ({ image_url: m.image_url, caption: m.caption })) || []
    );
    setAssignedCrews(
      p.crews?.map((c) => {
        const tm = teamMembers.find((m) => m.id === c.team_member_id);
        const au = adminUsers?.find((u) => u.id === c.team_member_id);
        const memberName = c.member_name || tm?.full_name || au?.full_name || 'Kru Proyek';
        return {
          id: c.id,
          team_member_id: c.team_member_id || '',
          member_name: memberName,
          custom_role_in_project: c.custom_role_in_project,
          is_external: c.is_external || (!c.team_member_id && !!c.member_name),
        };
      }) || []
    );
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingProject) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddMediaImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/') && !trimmed.startsWith('/')) {
      alert('Mohon masukkan tautan URL gambar yang valid (dimulai dengan https:// atau http://).');
      return;
    }

    if (trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/')) {
      if (confirm('Peringatan: Tautan yang Anda masukkan terdeteksi sebagai Viewer Link ImgBB (ibb.co/...). Foto TIDAK AKAN MUNCUL di website dengan tautan ini.\n\nWebsite membutuhkan Direct Link (i.ibb.co/...). Klik OK untuk membuka petunjuk cara mengambil Direct Link, atau Batal untuk tetap memasukkan tautan ini.')) {
        setIsImgbbGuideOpen(true);
        return;
      }
    }

    setMediaList([...mediaList, { image_url: trimmed, caption: newImageCaption.trim() }]);
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveMediaImage = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index: number, newCaption: string) => {
    setMediaList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption: newCaption } : item))
    );
  };

  const handleProcessAndUploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const validWebpFiles = fileList.filter(
      (file) => file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')
    );
    const invalidFiles = fileList.filter(
      (file) => file.type !== 'image/webp' && !file.name.toLowerCase().endsWith('.webp')
    );

    if (invalidFiles.length > 0 && validWebpFiles.length === 0) {
      alert('Format file ditolak: Semua foto yang diunggah wajib berformat WebP (.webp). Mohon unggah file berekstensi .webp atau gunakan input tautan link gambar (URL).');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} file diabaikan karena bukan berformat .webp. Sistem hanya memproses file .webp atau tautan link.`);
    }

    if (validWebpFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgressText(`Mengunggah langsung file WebP asli (${validWebpFiles.length} file)...`);

    try {
      const uploadPromises = validWebpFiles.map(async (file) => {
        const url = await uploadFileToStorage(file, 'portfolio');
        return {
          image_url: url,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        };
      });

      const newItems = await Promise.all(uploadPromises);
      if (newItems.length > 0) {
        setMediaList((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Failed uploading files:', err);
      alert('Gagal mengunggah beberapa file. Pastikan file valid.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddCrew = () => {
    const roleTrimmed = selectedCrewRole.trim().toUpperCase() || 'CREW';

    if (crewSourceMode === 'internal') {
      if (!selectedInternalCrewId) {
        alert('Silakan pilih anggota kru internal terlebih dahulu.');
        return;
      }
      const targetOption = availableInternalCrew.find((c) => c.id === selectedInternalCrewId);
      if (!targetOption) return;

      // prevent duplicate
      if (assignedCrews.some((c) => c.team_member_id === targetOption.originalId)) {
        alert('Anggota kru ini sudah ditugaskan pada proyek.');
        return;
      }

      setAssignedCrews([
        ...assignedCrews,
        {
          team_member_id: targetOption.originalId,
          member_name: targetOption.name,
          custom_role_in_project: roleTrimmed,
          is_external: false,
        },
      ]);
    } else {
      // External / freelance crew
      const extName = externalCrewName.trim();
      if (!extName) {
        alert('Silakan masukkan nama lengkap kru eksternal atau freelancer.');
        return;
      }

      if (assignedCrews.some((c) => c.member_name.toLowerCase() === extName.toLowerCase())) {
        alert('Nama kru eksternal ini sudah ada dalam daftar tugas.');
        return;
      }

      setAssignedCrews([
        ...assignedCrews,
        {
          team_member_id: '',
          member_name: extName,
          custom_role_in_project: roleTrimmed,
          is_external: true,
        },
      ]);
      setExternalCrewName('');
    }
  };

  const handleRemoveCrew = (index: number) => {
    setAssignedCrews(assignedCrews.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    const formattedMedia: ProjectMedia[] = mediaList.map((m, idx) => ({
      id: 'media-' + Date.now() + '-' + idx,
      project_id: editingProject?.id || '',
      image_url: m.image_url,
      caption: m.caption,
      order_index: idx + 1,
    }));

    const formattedCrews: ProjectCrew[] = assignedCrews.map((c, idx) => ({
      id: c.id || ('crew-' + Date.now() + '-' + idx),
      project_id: editingProject?.id || '',
      team_member_id: c.team_member_id || undefined,
      member_name: c.member_name,
      is_external: c.is_external || false,
      custom_role_in_project: c.custom_role_in_project.toUpperCase(),
    }));

    saveProject({
      id: editingProject?.id,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: categoryId,
      client_name: clientName,
      description,
      media_type: mediaType,
      video_aspect_ratio: mediaType === 'VIDEO' ? videoAspectRatio : undefined,
      youtube_video_id: youtubeVideoId,
      is_featured: isFeatured,
      status,
      progress_stage: progressStage,
      completion_percentage: Number(completionPercentage),
      target_delivery_date: targetDeliveryDate.trim() || undefined,
      milestones: editingProject?.milestones,
      media: formattedMedia,
      crews: formattedCrews,
    });

    resetForm();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Content &amp; Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Portofolio Proyek
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publikasikan karya studi kasus agensi dengan format video bioskop 16:9 atau kolase gambar resolusi tinggi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/admin/milestones')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Flag className="w-4 h-4 text-[#005DDD]" />
              <span>Milestones &amp; Progres Klien</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {!isAnalyst && !isFormOpen && (
            <button
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Proyek Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* CRUD Form Modal / Drawer */}
      {isFormOpen && !isAnalyst && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-md space-y-8 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingProject ? 'Edit Studi Kasus Proyek' : 'Entri Proyek Portofolio Baru'}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Judul Proyek *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Specta Education: Rebranding"
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
                placeholder="specta-education-rebranding"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Kategori Layanan *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#005DDD]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Nama Klien Resmi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Perta Daya Gas"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
          </div>

          {/* Milestone & Progress Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-sky-50/40 border border-sky-100">
            <div>
              <label className="block text-xs uppercase font-bold text-sky-900 mb-1">
                Tahap Milestone Proyek
              </label>
              <select
                value={progressStage}
                onChange={(e) => setProgressStage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#005DDD]"
              >
                <option value="BRIEF">1. Briefing &amp; Kickoff</option>
                <option value="CONCEPT">2. Konsep &amp; Storyboard</option>
                <option value="PRODUCTION">3. Produksi &amp; Syuting</option>
                <option value="REVIEW">4. Review Draf &amp; Revisi</option>
                <option value="DELIVERY">5. Delivery &amp; Serah Terima</option>
                <option value="COMPLETED">6. Selesai &amp; Diarsipkan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-sky-900 mb-1">
                Target Tanggal Delivery
              </label>
              <input
                type="text"
                placeholder="Contoh: 15 Oktober 2026"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-sky-900 mb-1">
                Persentase Penyelesaian ({completionPercentage}%)
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                  className="w-full accent-[#005DDD]"
                />
                <span className="text-xs font-black text-sky-950 font-mono">{completionPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Media Format Radio Switch (PRD 4.3 & 5) */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700">
              Format Media Utama
            </h4>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                <input
                  type="radio"
                  name="mediaType"
                  value="IMAGE"
                  checked={mediaType === 'IMAGE'}
                  onChange={() => setMediaType('IMAGE')}
                  className="text-[#005DDD] focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Kolase Foto Resolusi Tinggi</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-800">
                <input
                  type="radio"
                  name="mediaType"
                  value="VIDEO"
                  checked={mediaType === 'VIDEO'}
                  onChange={() => setMediaType('VIDEO')}
                  className="text-[#005DDD] focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-600" />
                  <span>Video YouTube / Shorts</span>
                </span>
              </label>
            </div>

            {mediaType === 'VIDEO' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Orientasi Aspek Rasio Video
                  </label>
                  <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      videoAspectRatio === '16:9'
                        ? 'border-[#005DDD] bg-sky-50 text-[#005DDD]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="videoAspectRatio"
                        value="16:9"
                        checked={videoAspectRatio === '16:9'}
                        onChange={() => setVideoAspectRatio('16:9')}
                        className="sr-only"
                      />
                      <span>Landscape Bioskop (16:9)</span>
                    </label>

                    <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      videoAspectRatio === '9:16'
                        ? 'border-[#005DDD] bg-sky-50 text-[#005DDD]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="videoAspectRatio"
                        value="9:16"
                        checked={videoAspectRatio === '9:16'}
                        onChange={() => setVideoAspectRatio('9:16')}
                        className="sr-only"
                      />
                      <span>Vertical / Reels / TikTok (9:16)</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {videoAspectRatio === '9:16'
                      ? 'Format 9:16 akan ditampilkan dalam frame smartphone vertikal yang presisi untuk konten Reels, Shorts, dan TikTok.'
                      : 'Format 16:9 akan ditampilkan dalam pemutar bioskop lanskap standar TVC & Web.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    YouTube Video ID atau URL Lengkap (Mendukung /watch, /shorts, youtu.be)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: ysz5S6PUM-U atau https://www.youtube.com/shorts/..."
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>
            ) : null}

            {/* Collage Photos Management with Drag and Drop Upload */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Daftar Foto Kolase Portofolio ({mediaList.length} Foto)
                </label>
                
                {/* Mandatory WebP Badge */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005DDD] font-bold border border-blue-200/80 p-1 px-3 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]"></span>
                  <span>Wajib Format .WebP atau Tautan Link (URL)</span>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#005DDD] bg-sky-50/80 scale-[1.01]'
                    : isUploading
                    ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-80'
                    : 'border-slate-200 bg-white hover:border-[#005DDD] hover:bg-sky-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/webp,.webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessAndUploadFiles(e.target.files);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-[#005DDD] animate-spin" />
                      <p className="text-xs font-bold text-[#005DDD] animate-pulse">
                        {uploadProgressText || 'Mengunggah file WebP ke Firebase Storage...'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#005DDD] flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Tarik &amp; Lepas file <span className="text-[#005DDD]">.WEBP</span> ke sini, atau <span className="text-[#005DDD] underline">Pilih dari Komputer</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Hanya menerima file format <strong className="text-slate-800 font-bold">.WEBP</strong> (Langsung diunggah utuh tanpa proses konversi)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Manual URL Input Alternative */}
              <div className="pt-2 border-t border-slate-200/60 mt-2 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#005DDD]" />
                    <span>Atau masukkan URL foto eksternal (ImgBB / Cloud Hosting):</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsImgbbGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#005DDD] hover:text-[#004bb5] bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer w-fit"
                    title="Petunjuk cara upload foto & dapatkan direct link di imgbb.com"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#005DDD]" />
                    <span>Petunjuk Upload Foto ImgBB &amp; Direct Link</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tempel Direct Link (contoh: https://i.ibb.co/XyZ123/foto.jpg)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl bg-white border text-xs focus:outline-none transition-colors ${
                        newImageUrl.includes('ibb.co/') && !newImageUrl.includes('i.ibb.co/')
                          ? 'border-amber-400 focus:border-amber-500 bg-amber-50/30'
                          : 'border-slate-200 focus:border-[#005DDD]'
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Caption foto (opsional)"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMediaImage}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shrink-0 hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah URL</span>
                  </button>
                </div>

                {/* Instant Alert if user pastes ibb.co viewer link */}
                {newImageUrl.includes('ibb.co/') && !newImageUrl.includes('i.ibb.co/') && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <strong>Tautan terdeteksi sebagai Viewer Link (ibb.co/...).</strong> Foto tidak akan muncul di website dengan link ini. Anda harus menggunakan <strong>Direct Link (i.ibb.co/...)</strong>.{' '}
                      <button
                        type="button"
                        onClick={() => setIsImgbbGuideOpen(true)}
                        className="text-[#005DDD] font-bold underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
                      >
                        Buka Petunjuk Direct Link &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Photos Grid with Caption Editing */}
              {mediaList.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-600 mb-2">
                    Foto Terpasang ({mediaList.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mediaList.map((m, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs group flex flex-col"
                      >
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                          <img
                            src={m.image_url}
                            alt={m.caption || `Foto ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaImage(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm transition-all cursor-pointer"
                            title="Hapus foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-2.5 bg-slate-50/50 flex-1">
                          <input
                            type="text"
                            placeholder="Tulis caption foto..."
                            value={m.caption || ''}
                            onChange={(e) => handleCaptionChange(idx, e.target.value)}
                            className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#005DDD]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Crew Assignment (PRD Section 5) */}
          <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#005DDD]" />
                  <span>Penugasan Kru &amp; Kredit Proyek (Project Credits)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tugaskan anggota tim internal, akun staf terdaftar, maupun kolaborator eksternal/freelancer.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCrewSourceMode('internal')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    crewSourceMode === 'internal'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#005DDD]" />
                  <span>Kru Internal ({availableInternalCrew.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCrewSourceMode('external')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    crewSourceMode === 'external'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ Kru Eksternal / Freelance</span>
                </button>
              </div>
            </div>

            {/* Input Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              {crewSourceMode === 'internal' ? (
                <select
                  value={selectedInternalCrewId}
                  onChange={(e) => setSelectedInternalCrewId(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#005DDD]"
                >
                  {availableInternalCrew.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.subtext}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nama Lengkap Kru Eksternal / Kolaborator (misal: Dimas Yoga, Soundscape Studio)"
                  value={externalCrewName}
                  onChange={(e) => setExternalCrewName(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              )}

              <input
                type="text"
                placeholder="Peran khusus (misal: DIRECTOR, DOP, COLORIST)"
                value={selectedCrewRole}
                onChange={(e) => setSelectedCrewRole(e.target.value)}
                className="w-full sm:w-64 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase text-slate-800 focus:outline-none focus:border-[#005DDD]"
              />

              <button
                type="button"
                onClick={handleAddCrew}
                className="px-5 py-2.5 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tugaskan Kru</span>
              </button>
            </div>

            {/* Quick Role Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Preset Peran:
              </span>
              {[
                'DIRECTOR',
                'DOP',
                'PRODUCER',
                'EDITOR',
                'COLORIST',
                'SOUND DESIGNER',
                'DRONE PILOT',
                'TALENT / MODEL',
                'MUA / STYLIST',
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedCrewRole(role)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    selectedCrewRole.toUpperCase() === role
                      ? 'bg-[#005DDD] text-white border-[#005DDD]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Assigned Crews List (Chips) */}
            {assignedCrews.length > 0 && (
              <div className="pt-2 border-t border-sky-100/80">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  Kru Ditugaskan ({assignedCrews.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {assignedCrews.map((c, idx) => {
                    const isExt = c.is_external;
                    return (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-2xs ${
                          isExt
                            ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <span className="font-bold">{c.member_name}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isExt
                              ? 'bg-amber-200/60 text-amber-900'
                              : 'bg-sky-50 text-[#005DDD]'
                          }`}
                        >
                          {c.custom_role_in_project}
                        </span>
                        {isExt && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-white/80 border border-amber-300 px-1 rounded">
                            Eksternal
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCrew(idx)}
                          className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer font-bold"
                          title="Hapus penugasan kru"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Visibility Toggles */}
          <div className="flex items-center gap-8 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-[#005DDD] w-4 h-4"
              />
              <span>Tampilkan di Beranda (Featured Work)</span>
            </label>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span>Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
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
              {editingProject ? 'Simpan Perubahan' : 'Publikasikan Proyek'}
            </button>
          </div>
        </form>
      )}

      {/* Projects Table List */}
      {!isFormOpen && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">Proyek &amp; Klien</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Milestone Progress</th>
                  <th className="py-4 px-6">Format Media</th>
                  <th className="py-4 px-6">Featured</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {projects.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  const progressPct = p.completion_percentage ?? 75;
                  const stage = p.progress_stage || 'DEVELOPMENT';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{p.title}</span>
                          <span className="text-slate-400 text-[11px]">{p.client_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#005DDD] font-semibold">{cat?.name || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-[150px]">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-600 truncate">{stage}</span>
                            <span className="font-mono text-[#005DDD]">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#005DDD] to-cyan-400 h-full rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {p.media_type === 'VIDEO' ? (
                            <Video className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                          )}
                          <span>{p.media_type}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {p.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>Ya</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Tidak</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isAnalyst ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-[#005DDD] cursor-pointer"
                              title="Edit Proyek"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus proyek ${p.title}?`)) {
                                  deleteProject(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Hapus Proyek"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Read-Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ImgBB Upload & Direct Link Guide Modal */}
      <ImgbbGuideModal
        isOpen={isImgbbGuideOpen}
        onClose={() => setIsImgbbGuideOpen(false)}
        onOpenFullPage={() => onNavigate?.('/admin/guide/imgbb')}
      />
    </div>
  );
};
