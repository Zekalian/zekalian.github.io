import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Tag,
  MessageCircle,
  Linkedin,
  Twitter,
  Link2,
  Check,
} from 'lucide-react';
import { YouTubeEmbed } from '../../components/public/YouTubeEmbed';
import { createShareEventPayload } from '../../utils/analytics';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, onNavigate }) => {
  const { articles, addToast, recordShareEvent } = useApp();
  const [copied, setCopied] = useState(false);

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Artikel yang Anda tuju mungkin belum dipublikasikan atau telah dipindahkan.
        </p>
        <button
          onClick={() => onNavigate('/articles')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#005DDD] text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Wawasan</span>
        </button>
      </div>
    );
  }

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
      addToast('Tautan artikel berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);

      // Record share telemetry
      recordShareEvent(
        createShareEventPayload({
          item_type: 'article',
          item_id: article.id,
          item_title: article.title,
          item_slug: article.slug,
          action: 'copy_link',
          path: window.location.pathname,
        })
      );
    } catch {
      addToast('Gagal menyalin tautan.', 'error');
    }
  };

  const shareToWa = () => {
    const text = `${article.title} - Baca artikel dari Zekalian: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    recordShareEvent(
      createShareEventPayload({
        item_type: 'article',
        item_id: article.id,
        item_title: article.title,
        item_slug: article.slug,
        action: 'share_whatsapp',
        path: window.location.pathname,
      })
    );
  };

  const shareToLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    );
    recordShareEvent(
      createShareEventPayload({
        item_type: 'article',
        item_id: article.id,
        item_title: article.title,
        item_slug: article.slug,
        action: 'share_linkedin',
        path: window.location.pathname,
      })
    );
  };

  const shareToTwitter = () => {
    const text = `${article.title} via @zekalian`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        window.location.href
      )}`,
      '_blank'
    );
    recordShareEvent(
      createShareEventPayload({
        item_type: 'article',
        item_id: article.id,
        item_title: article.title,
        item_slug: article.slug,
        action: 'share_twitter',
        path: window.location.pathname,
      })
    );
  };

  return (
    <article className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Ergonomic layout centered with max-w-3xl (PRD 4.4) */}
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('/articles')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#005DDD] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Semua Artikel</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Copy Link Button using Clipboard API */}
            <button
              onClick={handleCopyLink}
              aria-label="Copy article link"
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
              onClick={shareToWa}
              className="p-2 rounded-full border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={shareToLinkedin}
              className="p-2 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-[#0077B5] transition-colors"
              title="Bagikan ke LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          {article.tags && (
            <div className="flex flex-wrap gap-2">
              {article.tags.split(',').map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-[-0.02em] leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(article.published_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.reading_time || '4 min read'}
            </span>
            <span>&bull;</span>
            <span className="font-semibold text-slate-700">Oleh Tim Kreatif Zekalian</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 mb-10 aspect-video bg-slate-900">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Excerpt Lead */}
        {article.excerpt && (
          <p className="text-lg sm:text-xl font-medium text-slate-700 leading-relaxed italic border-l-4 border-[#005DDD] pl-5 mb-10">
            {article.excerpt}
          </p>
        )}

        {/* HTML / Rich Content Body */}
        <div
          className="prose prose-slate max-w-none text-base text-[#334155] leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />

        {/* Footer Share & CTA */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Suka dengan ulasan ini?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagikan wawasan ini kepada tim atau jejaring profesional Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={shareToWa}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={shareToLinkedin}
              className="px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={handleCopyLink}
              aria-label="Copy article link"
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
