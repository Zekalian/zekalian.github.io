import { WhatsAppSplitVariant, WhatsAppSplitVariantId } from '../types/database';

export const WA_SPLIT_VARIANTS: Record<WhatsAppSplitVariantId, WhatsAppSplitVariant> = {
  variant_a: {
    id: 'variant_a',
    name: 'Variant A — Konsultasi Ide Kreatif (Consultative)',
    tagline: 'Pendekatan kurasi ide & eksplorasi konsep kreatif',
    short_label: 'Konsultasi Ide Proyek',
    tooltip_text: 'Diskusi & Konsultasi Ide',
    badge_text: 'Diskusi Konsep Gratis',
    default_message:
      'Halo Tim Zekalian, saya tertarik berdiskusi dan ingin konsultasi mengenai ide proyek branding & media kami.',
  },
  variant_b: {
    id: 'variant_b',
    name: 'Variant B — Estimasi Penawaran & Biaya (Direct Quote)',
    tagline: 'Pendekatan transparan & percepatan penawaran harga',
    short_label: 'Minta Penawaran Cepat',
    tooltip_text: 'Cek Estimasi Harga & Jadwal',
    badge_text: 'Estimasi Biaya & Jadwal',
    default_message:
      'Halo Tim Zekalian, boleh minta info rate card dan estimasi penawaran biaya untuk kebutuhan produksi & media kami?',
  },
};

const STORAGE_KEY = 'zekalian_wa_ab_variant';

/**
 * Gets the finalized official WhatsApp CTA configuration (Variant A: Konsultasi Kreatif).
 */
export function getVisitorSplitVariant(): WhatsAppSplitVariant {
  return WA_SPLIT_VARIANTS.variant_a;
}

/**
 * Kept for backward compatibility
 */
export function setVisitorSplitVariant(_variantId: WhatsAppSplitVariantId) {
  // Finalized to Variant A
}

/**
 * Generates context-aware WhatsApp prefilled message tailored to the split test variant.
 */
export function getVariantMessage(options: {
  variantId: WhatsAppSplitVariantId;
  currentPath: string;
  projectContext?: { title?: string; client?: string };
  articleContext?: { title?: string };
  fallbackMessage?: string;
}): string {
  const { variantId, currentPath, projectContext, articleContext, fallbackMessage } = options;

  if (variantId === 'variant_b') {
    // Variant B: Direct Quote / Rate Card / Commercial focus
    if (projectContext?.title) {
      return `Halo Tim Zekalian, saya tertarik dengan standar produksi karya "${projectContext.title}" (${projectContext.client || 'Klien'}). Boleh minta estimasi budget dan timeline produksi untuk proyek sejenis?`;
    }
    if (articleContext?.title) {
      return `Halo Tim Zekalian, saya baru membaca artikel "${articleContext.title}". Apakah bisa minta informasi paket layanan dan rate card Zekalian?`;
    }
    if (currentPath === '/services') {
      return 'Halo Tim Zekalian, boleh minta price list dan paket layanan produksi video & branding yang tertera di website?';
    }
    if (currentPath === '/contact') {
      return 'Halo Tim Zekalian, kami ingin meminta estimasi penawaran harga & ketersediaan jadwal syuting untuk project kami.';
    }
    return (
      fallbackMessage ||
      'Halo Tim Zekalian, boleh minta info rate card dan estimasi penawaran biaya untuk kebutuhan produksi & media kami?'
    );
  }

  // Variant A (Default): Consultative / Ideation focus
  if (projectContext?.title) {
    return `Halo Tim Zekalian, saya melihat portofolio "${projectContext.title}" (${projectContext.client || 'Klien'}) di website dan ingin konsultasi ide serupa untuk brand kami.`;
  }
  if (articleContext?.title) {
    return `Halo Tim Zekalian, saya baru membaca artikel insight "${articleContext.title}" dan ingin berdiskusi lebih lanjut mengenai strategi konten.`;
  }
  if (currentPath === '/services') {
    return 'Halo Tim Zekalian, saya tertarik berdiskusi dan konsultasi mengenai layanan kreatif & produksi video di website.';
  }
  if (currentPath === '/contact') {
    return 'Halo Tim Zekalian, saya ingin mendiskusikan kebutuhan produksi dan jadwal kolaborasi untuk brand kami.';
  }
  return (
    fallbackMessage ||
    'Halo Tim Zekalian, saya tertarik berdiskusi dan ingin konsultasi mengenai ide proyek branding & media kami.'
  );
}
