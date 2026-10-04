import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types/database';
import { YouTubeEmbed } from '../../components/public/YouTubeEmbed';
import { ImageLightbox } from '../../components/public/ImageLightbox';
import { CrewModal } from '../../components/public/CrewModal';
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Share2,
  Calendar,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MessageCircle,
  Link2,
  Check,
} from 'lucide-react';
import { useWhatsAppTracker } from '../../hooks/useWhatsAppTracker';
import { createShareEventPayload } from '../../utils/analytics';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

// Random vibrant avatar colors specified in PRD 4.3
const AVATAR_COLORS = ['#EF4444', '#F59E0B', '#0284C7', '#EC4899', '#10B981', '#6366F1'];

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const { projects, categories, teamMembers, addToast, settings, recordShareEvent } = useApp();
  const { currentVariant, handleWhatsAppClick, getVariantMessage } = useWhatsAppTracker();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const [selectedCrew, setSelectedCrew] = useState<{
    member: TeamMember;
    customRole: string;
  } | null>(null);

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Studi kasus proyek yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan.
        </p>
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#005DDD] text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portofolio</span>
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === project.category_id);
  const otherProjects = projects.filter((p) => p.id !== project.id && p.status === 'PUBLISHED');

  const photos = project.media && project.media.length > 0 ? project.media : [];

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      addToast('Tautan proyek berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);

      // Record share telemetry
      recordShareEvent(
        createShareEventPayload({
          item_type: 'project',
          item_id: project.id,
          item_title: project.title,
          item_slug: project.slug,
          action: 'copy_link',
          path: window.location.pathname,
        })
      );
    } catch {
      addToast('Gagal menyalin tautan.', 'error');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} | Zekalian`,
          text: project.description?.slice(0, 140) || project.title,
          url,
        });
        recordShareEvent(
          createShareEventPayload({
            item_type: 'project',
            item_id: project.id,
            item_title: project.title,
            item_slug: project.slug,
            action: 'share_native',
            path: window.location.pathname,
          })
        );
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="py-10 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back to catalog & Actions */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#005DDD] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portofolio</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Copy Link Button using Clipboard API */}
          <button
            onClick={handleCopyLink}
            aria-label="Copy project link"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tautan Tersalin!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            aria-label="Share project"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
        </div>
      </div>

      {/* Case Header */}
      <div className="max-w-3xl mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3.5 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider">
            {category?.name || 'Creative Production'}
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {project.client_name}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-[-0.02em] leading-tight">
          {project.title}
        </h1>
      </div>

      {/* Media Showcase (PRD 4.3: YouTube Player 16:9 or Photo Collage) */}
      <div className="mb-14">
        {project.media_type === 'VIDEO' && project.youtube_video_id ? (
          <div className="space-y-6">
            <YouTubeEmbed
              videoId={project.youtube_video_id}
              title={project.title}
              aspectRatio={project.video_aspect_ratio || '16:9'}
              className="shadow-2xl"
            />
            {photos.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">
                  Production Stills &amp; BTS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((pic, idx) => (
                    <div
                      key={pic.id || idx}
                      onClick={() => handleOpenLightbox(idx)}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={pic.image_url}
                        alt={pic.caption || 'BTS Still'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* High-res Image Collage */
          <div className="space-y-4">
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {photos.map((pic, index) => {
                  const isPrimary = index === 0;
                  return (
                    <div
                      key={pic.id || index}
                      onClick={() => handleOpenLightbox(index)}
                      className={`group relative rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${
                        isPrimary ? 'md:col-span-12 aspect-[16/9]' : 'md:col-span-6 aspect-[4/3]'
                      }`}
                    >
                      <img
                        src={pic.image_url}
                        alt={pic.caption || project.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div className="flex items-center justify-between w-full text-white">
                          <span className="text-xs font-medium truncate pr-4">
                            {pic.caption || 'Klik untuk perbesar'}
                          </span>
                          <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                Tidak ada aset media kolase tambahan.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Case Description & Project Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-200">
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
            Narasi &amp; Ruang Lingkup Proyek
          </h2>
          <div className="text-base text-[#334155] leading-relaxed space-y-4">
            <p className="whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        {/* Project Meta Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Detail Informasi
          </h3>

          <div>
            <span className="text-xs text-slate-400 block">Klien Resmi</span>
            <span className="text-sm font-bold text-slate-800">{project.client_name}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Kategori Pekerjaan</span>
            <span className="text-sm font-bold text-[#005DDD]">{category?.name || 'Creative Service'}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Format Utama</span>
            <span className="text-sm font-bold text-slate-800">
              {project.media_type === 'VIDEO'
                ? project.video_aspect_ratio === '9:16'
                  ? 'Vertical Video (9:16 Reels / Shorts / TikTok)'
                  : 'Cinema Video (16:9 Landscape)'
                : 'Visual Design & High-Res Collage'}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Tahun Produksi</span>
            <span className="text-sm font-bold text-slate-800">
              {new Date(project.created_at).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Project Crew Section (PRD 4.3: 2-column layout with random vibrant initial avatars) */}
      <div className="py-16 border-b border-slate-200">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Production Credits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kru Terlibat dalam Proyek Ini
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Klik nama anggota tim untuk melihat spesialisasi dan profil media sosial profesional mereka.
          </p>
        </div>

        {project.crews && project.crews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {project.crews.map((crewItem, idx) => {
              const matchedMember = teamMembers.find((m) => m.id === crewItem.team_member_id);
              if (!matchedMember) return null;

              const avatarBgColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <div
                  key={crewItem.id || idx}
                  onClick={() =>
                    setSelectedCrew({
                      member: matchedMember,
                      customRole: crewItem.custom_role_in_project,
                    })
                  }
                  className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#005DDD]/40 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {/* Vibrant Initial Avatar */}
                    <div
                      className="w-13 h-13 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: avatarBgColor }}
                    >
                      {matchedMember.initials}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors">
                        {matchedMember.full_name}
                      </h4>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#005DDD]">
                        {crewItem.custom_role_in_project}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#005DDD] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl text-xs text-slate-500 text-center">
            Informasi daftar kru spesifik belum ditambahkan pada studi kasus ini.
          </div>
        )}
      </div>

      {/* Project-Specific WhatsApp Consultation Banner */}
      {(() => {
        const dynamicMessage = getVariantMessage({
          variantId: currentVariant.id,
          currentPath: `/projects/${project.slug}`,
          projectContext: {
            title: project.title,
            client: project.client_name,
          },
        });
        const cleanWaNumber = (settings.admin_whatsapp_number || '').replace(/[^0-9]/g, '');

        return (
          <div className="my-12 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-700/50">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Kolaborasi Proyek Serupa
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {currentVariant.badge_text}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Tertarik memproduksi visual seperti &ldquo;{project.title}&rdquo; untuk brand Anda?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {dynamicMessage}
              </p>
            </div>

            <a
              href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(dynamicMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              id="project-detail-whatsapp-cta"
              onClick={() =>
                handleWhatsAppClick({
                  placement: 'project_detail',
                  projectContext: {
                    id: project.id,
                    title: project.title,
                    category: category?.name || 'Showcase',
                    client: project.client_name,
                  },
                  customMessage: dynamicMessage,
                  customPath: `/projects/${project.slug}`,
                  variantId: currentVariant.id,
                  ctaText: currentVariant.short_label,
                })
              }
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>{currentVariant.short_label}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        );
      })()}

      {/* Other Projects Carousel / Slider (PRD 4.3) */}
      {otherProjects.length > 0 && (
        <div className="pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Studi Kasus Lainnya
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Eksplorasi ragam portofolio Zekalian lainnya
              </p>
            </div>
            <button
              onClick={() => onNavigate('/projects')}
              className="text-xs font-bold text-[#005DDD] hover:underline"
            >
              Lihat Semua Portofolio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {otherProjects.slice(0, 3).map((item) => {
              const itemThumb =
                item.media?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(`/projects/${item.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={itemThumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.client_name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-xs text-[#005DDD] font-semibold flex items-center gap-1 mt-3">
                      Buka Kasus <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox & Crew Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={photos}
        currentIndex={activePhotoIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setActivePhotoIndex((prev) => (prev + 1) % photos.length)}
        onPrev={() => setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
      />

      <CrewModal
        isOpen={!!selectedCrew}
        member={selectedCrew?.member || null}
        customRole={selectedCrew?.customRole}
        onClose={() => setSelectedCrew(null)}
      />
    </div>
  );
};
