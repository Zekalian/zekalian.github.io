import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WhatsAppButtonPlacement, WhatsAppClickLog, WhatsAppSplitVariant } from '../types/database';
import { getVisitorSplitVariant, getVariantMessage, WA_SPLIT_VARIANTS } from '../utils/splitTest';

interface TrackWhatsAppOptions {
  placement?: WhatsAppButtonPlacement;
  customMessage?: string;
  projectContext?: WhatsAppClickLog['project_context'];
  customPath?: string;
  variantId?: WhatsAppClickLog['split_test_variant'];
  ctaText?: string;
}

export function useWhatsAppTracker() {
  const { settings } = useApp();
  const [currentVariant] = useState<WhatsAppSplitVariant>(() => getVisitorSplitVariant());

  const getWhatsAppUrl = (customMessage?: string) => {
    const cleanWaNumber = (settings.admin_whatsapp_number || '').replace(/[^0-9]/g, '');
    const message =
      customMessage ||
      currentVariant.default_message ||
      settings.whatsapp_prefilled_message ||
      'Halo Zekalian, saya ingin berkonsultasi mengenai proyek branding dan media kreatif.';
    return `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = (options: TrackWhatsAppOptions = {}) => {
    const targetUrl = getWhatsAppUrl(options.customMessage);
    return { targetUrl };
  };

  return {
    currentVariant,
    getWhatsAppUrl,
    handleWhatsAppClick,
    getVariantMessage,
  };
}
