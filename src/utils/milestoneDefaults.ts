import { MilestoneStage, ProjectMilestoneItem } from '../types/database';

export interface StageMeta {
  key: MilestoneStage;
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
  dotCol: string;
  gradient: string;
}

export const STAGE_CONFIG: Record<MilestoneStage, StageMeta> = {
  BRIEF: {
    key: 'BRIEF',
    label: '1. Briefing & Analisis Sasaran',
    shortLabel: 'Brief',
    description: 'Penyelarasan kebutuhan kreatif, KPI kampanye, audiens, dan approval Creative Brief.',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderCol: 'border-purple-200',
    dotCol: 'bg-purple-500',
    gradient: 'from-purple-500 to-indigo-600',
  },
  CONCEPT: {
    key: 'CONCEPT',
    label: '2. Konsep & Pre-Produksi',
    shortLabel: 'Konsep',
    description: 'Penyusunan naskah narasi, visual moodboard, storyboard, lokasi, & jadwal produksi.',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    borderCol: 'border-cyan-200',
    dotCol: 'bg-cyan-500',
    gradient: 'from-cyan-500 to-blue-600',
  },
  PRODUCTION: {
    key: 'PRODUCTION',
    label: '3. Produksi & Eksekusi Lapangan',
    shortLabel: 'Produksi',
    description: 'Sesi syuting sinematik, pemotretan resolusi tinggi, tata suara, dan backup raw footage.',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-[#005DDD]',
    borderCol: 'border-blue-200',
    dotCol: 'bg-[#005DDD]',
    gradient: 'from-[#005DDD] to-[#018EE3]',
  },
  REVIEW: {
    key: 'REVIEW',
    label: '4. Pasca-Produksi & Review Klien',
    shortLabel: 'Review',
    description: 'Perakitan rough cut, pewarnaan sinematik, sound mastering, & putaran revisi klien.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    borderCol: 'border-amber-200',
    dotCol: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
  },
  DELIVERY: {
    key: 'DELIVERY',
    label: '5. Pengiriman Akhir & Serah Terima',
    shortLabel: 'Delivery',
    description: 'Penyerahan master 4K, berkas digital multi-rasio, lisensi materi, & penutupan proyek.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    borderCol: 'border-emerald-200',
    dotCol: 'bg-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Selesai & Diarsipkan',
    shortLabel: 'Selesai',
    description: 'Seluruh tahap pengerjaan telah rampung dan disetujui klien.',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderCol: 'border-slate-300',
    dotCol: 'bg-slate-600',
    gradient: 'from-slate-700 to-slate-900',
  },
};

export const ORDERED_STAGES: MilestoneStage[] = [
  'BRIEF',
  'CONCEPT',
  'PRODUCTION',
  'REVIEW',
  'DELIVERY',
];

/**
 * Generate standard creative milestones for a project
 */
export const generateDefaultMilestones = (projectId: string, clientName: string): ProjectMilestoneItem[] => {
  return [
    {
      id: `${projectId}-m1`,
      stage: 'BRIEF',
      title: 'Briefing & Penyelarasan Sasaran Kreatif',
      description: `Sesi kickoff bersama ${clientName}, perumusan target audiens, dan persetujuan ruang lingkup karya.`,
      target_date: 'Minggu ke-1',
      status: 'COMPLETED',
      client_visible: true,
      checklist: [
        {
          id: `${projectId}-m1-c1`,
          title: 'Kickoff meeting & pengumpulan ekspektasi kampanye',
          completed: true,
          completed_at: '2026-08-14',
          assigned_to: 'Account Executive',
        },
        {
          id: `${projectId}-m1-c2`,
          title: 'Penyusunan & penandatanganan Creative Brief dokumen',
          completed: true,
          completed_at: '2026-08-16',
          assigned_to: 'Creative Director',
        },
        {
          id: `${projectId}-m1-c3`,
          title: 'Pengumpulan aset logo vektor, font korporat & brand guidelines',
          completed: true,
          completed_at: '2026-08-17',
          assigned_to: 'Brand Designer',
        },
      ],
    },
    {
      id: `${projectId}-m2`,
      stage: 'CONCEPT',
      title: 'Pengembangan Konsep, Naskah & Storyboard',
      description: 'Penyusunan alur cerita visual, moodboard estetika, jadwal call sheet, dan scouting lokasi.',
      target_date: 'Minggu ke-2',
      status: 'COMPLETED',
      client_visible: true,
      checklist: [
        {
          id: `${projectId}-m2-c1`,
          title: 'Penyusunan visual moodboard & palet warna arahan seni',
          completed: true,
          completed_at: '2026-08-20',
          assigned_to: 'Art Director',
        },
        {
          id: `${projectId}-m2-c2`,
          title: 'Penulisan naskah narasi & storyboard adegan per frame',
          completed: true,
          completed_at: '2026-08-23',
          assigned_to: 'Copywriter & Director',
        },
        {
          id: `${projectId}-m2-c3`,
          title: 'Persetujuan klien atas naskah dan alur storyboard',
          completed: true,
          completed_at: '2026-08-25',
          assigned_to: 'Client Liaison',
        },
        {
          id: `${projectId}-m2-c4`,
          title: 'Scouting lokasi, casting talent, & finalisasi Call Sheet',
          completed: true,
          completed_at: '2026-08-28',
          assigned_to: 'Producer',
        },
      ],
    },
    {
      id: `${projectId}-m3`,
      stage: 'PRODUCTION',
      title: 'Eksekusi Hari Produksi & Syuting Sinematik',
      description: 'Pengambilan gambar di lapangan dengan kamera bioskop, tata cahaya sinematik, dan perekaman audio multi-kanal.',
      target_date: 'Minggu ke-3',
      status: 'IN_PROGRESS',
      client_visible: true,
      checklist: [
        {
          id: `${projectId}-m3-c1`,
          title: 'Eksekusi syuting utama (Principal Photography) sesuai shotlist',
          completed: true,
          completed_at: '2026-09-02',
          assigned_to: 'Director & DOP',
        },
        {
          id: `${projectId}-m3-c2`,
          title: 'Perekaman audio sinkron lapangan & ambience sound',
          completed: true,
          completed_at: '2026-09-02',
          assigned_to: 'Sound Engineer',
        },
        {
          id: `${projectId}-m3-c3`,
          title: 'Backup ganda raw footage (redundansi studio SSD & NAS)',
          completed: true,
          completed_at: '2026-09-03',
          assigned_to: 'DIT / Tech Lead',
        },
        {
          id: `${projectId}-m3-c4`,
          title: 'Logging footage, metadata, & pembuatan file proxy offline',
          completed: false,
          assigned_to: 'Assistant Editor',
        },
      ],
    },
    {
      id: `${projectId}-m4`,
      stage: 'REVIEW',
      title: 'Pasca-Produksi, Pewarnaan & Review Draf Klien',
      description: 'Penyuntingan video rough cut, pewarnaan sinematik (color grading), sound design, dan putaran revisi.',
      target_date: 'Minggu ke-4',
      status: 'PENDING',
      client_visible: true,
      checklist: [
        {
          id: `${projectId}-m4-c1`,
          title: 'Penyusunan draf awal (Rough Cut v1) & review internal studio',
          completed: false,
          assigned_to: 'Lead Editor',
        },
        {
          id: `${projectId}-m4-c2`,
          title: 'Pewarnaan sinematik (Color Grading) & audio mixing/mastering',
          completed: false,
          assigned_to: 'Colorist',
        },
        {
          id: `${projectId}-m4-c3`,
          title: 'Pengiriman tautan preview video online beresolusi terenkripsi ke klien',
          completed: false,
          assigned_to: 'Account Manager',
        },
        {
          id: `${projectId}-m4-c4`,
          title: 'Penyempurnaan catatan revisi klien (Revisi Putaran 1 & 2)',
          completed: false,
          assigned_to: 'Post Production Team',
        },
      ],
    },
    {
      id: `${projectId}-m5`,
      stage: 'DELIVERY',
      title: 'Pengiriman Master Resolusi Penuh & Serah Terima',
      description: 'Penyediaan master file ProRes / MP4 4K, adaptasi rasio 9:16 untuk media sosial, dan penutupan dokumen.',
      target_date: 'Minggu ke-5',
      status: 'PENDING',
      client_visible: true,
      checklist: [
        {
          id: `${projectId}-m5-c1`,
          title: 'Ekspor Master File 4K UHD, 1080p, dan variasi vertikal 9:16',
          completed: false,
          assigned_to: 'Post Supervisor',
        },
        {
          id: `${projectId}-m5-c2`,
          title: 'Unggah paket aset digital lengkap ke Google Drive / Dropbox klien',
          completed: false,
          assigned_to: 'Digital Asset Manager',
        },
        {
          id: `${projectId}-m5-c3`,
          title: 'Pemberian sertifikat hak tayang, lisensi musik & aset',
          completed: false,
          assigned_to: 'Legal & Producer',
        },
        {
          id: `${projectId}-m5-c4`,
          title: 'Penerbitan Berita Acara Serah Terima (BAST) & testimoni klien',
          completed: false,
          assigned_to: 'Account Lead',
        },
      ],
    },
  ];
};

/**
 * Calculate completion percentage and current active stage based on checklist items
 */
export const calculateMilestoneProgress = (
  milestones: ProjectMilestoneItem[]
): {
  completionPercentage: number;
  completedTasks: number;
  totalTasks: number;
  activeStage: MilestoneStage;
  completedStages: number;
  totalStages: number;
} => {
  if (!milestones || milestones.length === 0) {
    return {
      completionPercentage: 0,
      completedTasks: 0,
      totalTasks: 0,
      activeStage: 'BRIEF',
      completedStages: 0,
      totalStages: 0,
    };
  }

  let completedTasks = 0;
  let totalTasks = 0;
  let completedStages = 0;
  let detectedActiveStage: MilestoneStage = milestones[0]?.stage || 'BRIEF';

  // Check stage by stage
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const mTotal = m.checklist?.length || 0;
    const mCompleted = m.checklist?.filter((c) => c.completed).length || 0;

    totalTasks += mTotal;
    completedTasks += mCompleted;

    if (mTotal > 0 && mCompleted === mTotal) {
      completedStages++;
    } else if (detectedActiveStage === milestones[0]?.stage && mCompleted < mTotal) {
      detectedActiveStage = m.stage;
    }
  }

  if (completedStages === milestones.length && totalTasks > 0 && completedTasks === totalTasks) {
    detectedActiveStage = 'COMPLETED';
  }

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    completionPercentage,
    completedTasks,
    totalTasks,
    activeStage: detectedActiveStage,
    completedStages,
    totalStages: milestones.length,
  };
};

/**
 * Generate formatted WhatsApp status message for clients
 */
export const generateClientStatusMessage = (
  projectTitle: string,
  clientName: string,
  milestones: ProjectMilestoneItem[],
  targetDeliveryDate?: string
): string => {
  const { completionPercentage, activeStage, completedTasks, totalTasks } = calculateMilestoneProgress(milestones);
  const stageInfo = STAGE_CONFIG[activeStage] || STAGE_CONFIG.PRODUCTION;

  const completedList = milestones
    .flatMap((m) => m.checklist || [])
    .filter((c) => c.completed)
    .slice(-4)
    .map((c) => `  ✓ ${c.title}`)
    .join('\n');

  const pendingList = milestones
    .flatMap((m) => m.checklist || [])
    .filter((c) => !c.completed)
    .slice(0, 3)
    .map((c) => `  ⏳ ${c.title}`)
    .join('\n');

  return `*UPDATE PROGRES PROYEK | ZEKALIAN CREATIVE AGENCY*
----------------------------------------
Klien: *${clientName}*
Proyek: *${projectTitle}*
Tahap Saat Ini: *${stageInfo.label}*
Kemajuan: *${completionPercentage}% Selesai* (${completedTasks}/${totalTasks} butir tugas)
${targetDeliveryDate ? `Target Delivery: *${targetDeliveryDate}*\n` : ''}
*Tahapan Terakhir Selesai:*
${completedList || '  - Memulai tahap perencanaan'}

*Fokus Pengerjaan Saat Ini:*
${pendingList || '  - Seluruh tahapan telah rampung'}
----------------------------------------
Terima kasih atas kerja samanya. Tim kami senantiasa menjaga standar karya tertinggi untuk Anda.`;
};
