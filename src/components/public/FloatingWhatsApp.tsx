import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWhatsAppTracker } from '../../hooks/useWhatsAppTracker';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, projects, articles } = useApp();
  const { currentVariant, handleWhatsAppClick, getVariantMessage } = useWhatsAppTracker();
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Otomatis sembunyikan popup bubble setelah 20 detik (pause saat kursor membaca)
  useEffect(() => {
    if (isBubbleDismissed || isHovered) return;

    const timer = setTimeout(() => {
      setIsBubbleDismissed(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [isBubbleDismissed, isHovered]);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Identify context if browsing a specific project or article
  let projectContext: { id?: string; title?: string; category?: string; client?: string } | undefined;
  let articleContext: { title?: string } | undefined;

  if (currentPath.startsWith('/projects/')) {
    const slug = currentPath.replace('/projects/', '');
    const matchedProject = projects.find((p) => p.slug === slug);
    if (matchedProject) {
      projectContext = {
        id: matchedProject.id,
        title: matchedProject.title,
        category: matchedProject.category?.name || 'Showcase',
        client: matchedProject.client_name,
      };
    }
  } else if (currentPath.startsWith('/articles/')) {
    const slug = currentPath.replace('/articles/', '');
    const matchedArticle = articles.find((a) => a.slug === slug);
    if (matchedArticle) {
      articleContext = {
        title: matchedArticle.title,
      };
    }
  }

  // Generate dynamic message based on split-test variant and page context
  const dynamicMessage = getVariantMessage({
    variantId: currentVariant.id,
    currentPath,
    projectContext,
    articleContext,
    fallbackMessage: settings.whatsapp_prefilled_message,
  });

  const cleanWaNumber = (settings.admin_whatsapp_number || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(dynamicMessage)}`;

  const onClickWhatsApp = () => {
    handleWhatsAppClick({
      placement: 'floating_widget',
      customMessage: dynamicMessage,
      projectContext,
      customPath: currentPath,
      variantId: currentVariant.id,
      ctaText: currentVariant.short_label,
    });
  };

  return (
    <aside aria-label="WhatsApp Chat Widget" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {/* Dynamic Split-Test Prompt Bubble */}
      {!isBubbleDismissed && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative max-w-xs bg-white text-slate-900 rounded-2xl p-3 shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <button
            onClick={() => setIsBubbleDismissed(true)}
            aria-label="Tutup pesan"
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs shadow-sm transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-emerald-600 mb-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{currentVariant.badge_text}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
            {dynamicMessage}
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClickWhatsApp}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 group/link"
          >
            <span>{currentVariant.short_label}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClickWhatsApp}
        aria-label={`Hubungi WhatsApp Zekalian - ${currentVariant.short_label}`}
        id="floating-whatsapp-btn"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 animate-ping pointer-events-none" />
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20 relative z-10" />

        {/* Hover Tooltip showing Variant Action */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          {currentVariant.tooltip_text}
        </span>
      </a>
    </aside>
  );
};
