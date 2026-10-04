import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Share2,
  Eye,
  MessageCircle,
  Copy,
  Smartphone,
  Monitor,
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Flame,
  Award,
  BarChart3,
  Calendar,
  Bot,
  Lightbulb,
  Target,
  ListChecks,
  Check,
} from 'lucide-react';

interface AdminAnalyticsPageProps {
  onNavigate?: (route: string) => void;
}

interface AiSeoAnalysisData {
  executive_summary: string;
  viral_content_analysis: string;
  recommended_articles: Array<{
    title: string;
    target_keyword: string;
    rationale: string;
  }>;
  cro_recommendations: string[];
  action_plan_7_days: string[];
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = ({ onNavigate }) => {
  const {
    pageViews,
    shareEvents,
    whatsappClicks,
    inquiries,
    articles,
    projects,
    settings,
  } = useApp();

  const [dateRange, setDateRange] = useState<'all' | '30d' | '7d' | 'today'>('all');
  const [contentTab, setContentTab] = useState<'all' | 'articles' | 'projects'>('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Gemini AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AiSeoAnalysisData | null>(() => {
    try {
      const saved = localStorage.getItem('zekalian_ai_seo_analysis_cache');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(() => {
    return localStorage.getItem('zekalian_ai_seo_analysis_time') || null;
  });

  // Date filtering logic
  const filteredPageViews = useMemo(() => {
    const now = Date.now();
    return pageViews.filter((pv) => {
      const time = new Date(pv.created_at).getTime();
      if (dateRange === 'today') return now - time <= 86400000;
      if (dateRange === '7d') return now - time <= 86400000 * 7;
      if (dateRange === '30d') return now - time <= 86400000 * 30;
      return true;
    });
  }, [pageViews, dateRange]);

  const filteredShares = useMemo(() => {
    const now = Date.now();
    return shareEvents.filter((sh) => {
      const time = new Date(sh.created_at).getTime();
      if (dateRange === 'today') return now - time <= 86400000;
      if (dateRange === '7d') return now - time <= 86400000 * 7;
      if (dateRange === '30d') return now - time <= 86400000 * 30;
      return true;
    });
  }, [shareEvents, dateRange]);

  // Aggregate Top Visited Pages
  const topVisitedPages = useMemo(() => {
    const map = new Map<string, { path: string; title: string; count: number; mobile: number; desktop: number }>();

    filteredPageViews.forEach((pv) => {
      const existing = map.get(pv.path) || {
        path: pv.path,
        title: pv.title,
        count: 0,
        mobile: 0,
        desktop: 0,
      };
      existing.count += 1;
      if (pv.device_type === 'mobile') existing.mobile += 1;
      else existing.desktop += 1;
      map.set(pv.path, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredPageViews]);

  // Aggregate Content Share Performance
  const contentShareStats = useMemo(() => {
    const map = new Map<
      string,
      {
        title: string;
        type: 'article' | 'project' | 'page';
        slug?: string;
        totalShares: number;
        copyLink: number;
        whatsapp: number;
        linkedin: number;
        other: number;
      }
    >();

    filteredShares.forEach((sh) => {
      const key = `${sh.item_type}_${sh.item_title}`;
      const existing = map.get(key) || {
        title: sh.item_title,
        type: sh.item_type,
        slug: sh.item_slug,
        totalShares: 0,
        copyLink: 0,
        whatsapp: 0,
        linkedin: 0,
        other: 0,
      };

      existing.totalShares += 1;
      if (sh.action === 'copy_link') existing.copyLink += 1;
      else if (sh.action === 'share_whatsapp') existing.whatsapp += 1;
      else if (sh.action === 'share_linkedin') existing.linkedin += 1;
      else existing.other += 1;

      map.set(key, existing);
    });

    let list = Array.from(map.values()).sort((a, b) => b.totalShares - a.totalShares);

    if (contentTab !== 'all') {
      list = list.filter((item) => (contentTab === 'articles' ? item.type === 'article' : item.type === 'project'));
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }

    return list;
  }, [filteredShares, contentTab, filterSearch]);

  // Device breakdown
  const deviceStats = useMemo(() => {
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;

    filteredPageViews.forEach((pv) => {
      if (pv.device_type === 'mobile') mobile += 1;
      else if (pv.device_type === 'tablet') tablet += 1;
      else desktop += 1;
    });

    const total = Math.max(1, mobile + desktop + tablet);
    return {
      mobile,
      desktop,
      tablet,
      mobilePct: Math.round((mobile / total) * 100),
      desktopPct: Math.round((desktop / total) * 100),
      tabletPct: Math.round((tablet / total) * 100),
      total,
    };
  }, [filteredPageViews]);

  // Traffic Source breakdown
  const referrerStats = useMemo(() => {
    const map = new Map<string, number>();

    filteredPageViews.forEach((pv) => {
      let ref = pv.referrer || 'Direct / Langsung';
      if (ref.includes('google')) ref = 'Google Search';
      else if (ref.includes('instagram')) ref = 'Instagram';
      else if (ref.includes('tiktok')) ref = 'TikTok';
      else if (ref.includes('linkedin')) ref = 'LinkedIn';
      else if (ref.includes('whatsapp') || ref.includes('wa.me')) ref = 'WhatsApp';
      else if (ref === 'direct' || !ref) ref = 'Direct (Langsung)';

      map.set(ref, (map.get(ref) || 0) + 1);
    });

    const total = Math.max(1, filteredPageViews.length);
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPageViews]);

  // Lead Conversion Stats
  const totalLeads = (whatsappClicks?.length || 0) + (inquiries?.length || 0);
  const conversionRate =
    filteredPageViews.length > 0
      ? ((totalLeads / filteredPageViews.length) * 100).toFixed(1)
      : '0.0';

  // SEO Health Checklist calculation
  const seoHealth = useMemo(() => {
    let score = 0;
    const checks = [
      {
        id: 'title',
        name: 'Meta Title Global',
        passed: !!settings.seo_site_title && settings.seo_site_title.length >= 20,
        tip: 'Judul situs terisi dan memenuhi standar 20-70 karakter.',
      },
      {
        id: 'desc',
        name: 'Meta Description Optimal',
        passed: !!settings.seo_meta_description && settings.seo_meta_description.length >= 50,
        tip: 'Deskripsi meta terisi dan memberikan rangkuman jelas bagi Google.',
      },
      {
        id: 'og_img',
        name: 'OpenGraph Social Card Image',
        passed: !!settings.seo_og_image_url,
        tip: 'Banner kartu pratinjau WhatsApp & medsos sudah terpasang.',
      },
      {
        id: 'schema',
        name: 'Schema.org JSON-LD Structured Data',
        passed: !!settings.seo_schema_type,
        tip: 'Format schema ProfessionalService/Organization aktif.',
      },
      {
        id: 'articles_count',
        name: 'Katalog Wawasan & Portofolio Aktif',
        passed: articles.length > 0 && projects.length > 0,
        tip: 'Konten portofolio dan artikel siap diindeks mesin pencari.',
      },
    ];

    checks.forEach((c) => {
      if (c.passed) score += 20;
    });

    return { score, checks };
  }, [settings, articles, projects]);

  const handleGenerateAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const payload = {
        topPages: topVisitedPages.slice(0, 10),
        topShares: contentShareStats.slice(0, 10),
        deviceStats,
        referrerStats,
        agencySettings: {
          agency_name: settings.agency_name,
          seo_site_title: settings.seo_site_title,
          seo_meta_description: settings.seo_meta_description,
          seo_keywords: settings.seo_keywords,
        },
      };

      const res = await fetch('/api/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses data dengan Gemini.');
      }

      setAiAnalysis(json.data);
      setLastGeneratedAt(json.generated_at);
      localStorage.setItem('zekalian_ai_seo_analysis_cache', JSON.stringify(json.data));
      localStorage.setItem('zekalian_ai_seo_analysis_time', json.generated_at);
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan saat memanggil Gemini AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>SEO Intelligence &amp; Performance Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analitik Trafik &amp; Kinerja Konten
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau artikel &amp; portofolio paling sering di-share, halaman paling sering dikunjungi, serta kesehatan SEO website Zekalian.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl self-start md:self-auto">
          {(['all', '30d', '7d', 'today'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === 'all' && 'Semua Waktu'}
              {range === '30d' && '30 Hari'}
              {range === '7d' && '7 Hari'}
              {range === 'today' && 'Hari Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Pageviews */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pageviews
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#005DDD] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {filteredPageViews.length.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">
              {deviceStats.mobilePct}% Mobile
            </span>
            <span>&bull;</span>
            <span>{deviceStats.desktopPct}% Desktop</span>
          </p>
        </div>

        {/* Total Content Shares */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Shares &amp; Copy Link
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {filteredShares.length.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Interaksi salin link &amp; share medsos
          </p>
        </div>

        {/* Inquiries & WhatsApp Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Leads &amp; Konversi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalLeads}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {conversionRate}% Rasio dari total kunjungan
          </p>
        </div>

        {/* SEO Health Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Skor Kesehatan SEO
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {seoHealth.score}%
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            {seoHealth.score === 100 ? 'Audit Optimal' : 'Perlu Optimasi'}
          </p>
        </div>
      </div>

      {/* Gemini AI SEO & Growth Strategist Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-indigo-900/50 relative z-10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#005DDD] via-indigo-600 to-pink-500 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  AI SEO &amp; Content Strategist
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kecerdasan buatan yang menganalisis virilitas konten, pola share pengunjung, dan merumuskan strategi SEO.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiAnalysis}
            disabled={isAiLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#005DDD] to-indigo-600 hover:from-[#004bb5] hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto shrink-0"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Menganalisis Data...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-sky-300" />
                <span>{aiAnalysis ? 'Perbarui Analisis AI' : 'Minta Analisis AI Gemini'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Error message if any */}
        {aiError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{aiError}</span>
            </div>
            <button
              onClick={handleGenerateAiAnalysis}
              className="px-3 py-1 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-white font-bold text-[11px] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isAiLoading && (
          <div className="py-8 space-y-4 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mb-2 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Gemini 3.8 Flash sedang menganalisis telemetri website Zekalian...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Mengevaluasi ranking share artikel, demografi pembaca mobile/desktop, dan merumuskan ide konten baru berpotensi viral.
            </p>
            <div className="w-48 h-1.5 bg-indigo-950 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Empty State before first generation */}
        {!aiAnalysis && !isAiLoading && !aiError && (
          <div className="py-8 text-center space-y-3 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-1">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              Analisis Pertumbuhan AI Belum Dijalankan
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Klik tombol <strong>&ldquo;Minta Analisis AI Gemini&rdquo;</strong> di atas untuk mendapatkan bedah mendalam mengapa konten Anda di-share, ide 3 artikel baru yang dicari calon klien, dan strategi optimasi lead WhatsApp.
            </p>
          </div>
        )}

        {/* Rendered AI Analysis Results */}
        {aiAnalysis && !isAiLoading && (
          <div className="space-y-6 relative z-10">
            {lastGeneratedAt && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2">
                <span>
                  Wawasan dihasilkan secara *real-time* berdasarkan metrik kunjungan &amp; share terkini.
                </span>
                <span className="font-mono text-indigo-300">
                  {new Date(lastGeneratedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            )}

            {/* Row 1: Executive Summary & Viral Content Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <BarChart3 className="w-4 h-4" />
                  <span>Ringkasan Eksekutif Trafik</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiAnalysis.executive_summary}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-pink-300 text-xs font-bold">
                  <Flame className="w-4 h-4" />
                  <span>Mengapa Konten Anda Viral &amp; Sering Di-Share?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiAnalysis.viral_content_analysis}
                </p>
              </div>
            </div>

            {/* Row 2: 3-4 Recommended New Articles & SEO Keywords */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Lightbulb className="w-4 h-4" />
                <span>Rekomendasi Topik Artikel Baru (Peluang Kata Kunci Google)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiAnalysis.recommended_articles.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-indigo-900/20 border border-indigo-800/40 hover:border-indigo-600 transition-colors space-y-2.5"
                  >
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#005DDD]/30 text-sky-300 border border-[#005DDD]/40">
                      SEO: {item.target_keyword}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: CRO WhatsApp & 7-Days Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Target className="w-4 h-4" />
                  <span>Taktik Optimasi Konversi (Lead WhatsApp CRO)</span>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.cro_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-sky-950/40 border border-sky-800/40 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <ListChecks className="w-4 h-4" />
                  <span>Rencana Aksi 7 Hari ke Depan</span>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.action_plan_7_days.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Content Share Leaderboard & Top Visited Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Shared Articles & Projects (PRD Core Focus) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Konten Paling Sering Di-Share &amp; Disalin
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringkat artikel dan studi kasus yang paling banyak disebarkan oleh pengunjung
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setContentTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    contentTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setContentTab('articles')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    contentTab === 'articles' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Artikel
                </button>
                <button
                  onClick={() => setContentTab('projects')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    contentTab === 'projects' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Portofolio
                </button>
              </div>
            </div>
          </div>

          {/* Search box for content */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul artikel atau proyek..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005DDD] focus:border-transparent outline-none"
            />
          </div>

          {/* Share Leaderboard Table */}
          {contentShareStats.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada data share yang tercatat pada rentang waktu ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 w-12 text-center">Rank</th>
                    <th className="pb-3">Judul Konten</th>
                    <th className="pb-3 w-28 text-center">Kategori</th>
                    <th className="pb-3 w-24 text-center">Copy Link</th>
                    <th className="pb-3 w-24 text-center">WhatsApp</th>
                    <th className="pb-3 w-24 text-right">Total Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contentShareStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 text-center font-bold">
                        {idx === 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">🥇</span>}
                        {idx === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs">🥈</span>}
                        {idx === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 text-xs">🥉</span>}
                        {idx > 2 && <span className="text-slate-400">#{idx + 1}</span>}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="font-bold text-slate-900 block truncate max-w-sm sm:max-w-md">
                          {item.title}
                        </span>
                        {item.slug && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            /{item.type === 'article' ? 'articles' : 'projects'}/{item.slug}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.type === 'article'
                              ? 'bg-sky-50 text-[#005DDD]'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {item.type === 'article' ? 'Wawasan' : 'Portofolio'}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-semibold text-slate-600">
                        {item.copyLink}
                      </td>
                      <td className="py-3.5 text-center font-semibold text-emerald-600">
                        {item.whatsapp}
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                        {item.totalShares}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Traffic Sources & Device Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Traffic Sources */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#005DDD]" />
                <span>Saluran Trafik (Traffic Sources)</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              {referrerStats.map((ref, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{ref.name}</span>
                    <span className="font-bold text-slate-900">{ref.pct}% ({ref.count})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#005DDD] rounded-full transition-all duration-500"
                      style={{ width: `${ref.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device & Browser Telemetry */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Distribusi Perangkat Pengunjung</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                <Smartphone className="w-5 h-5 text-[#005DDD] mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-500 block">Smartphone</span>
                <span className="text-xl font-black text-slate-900">{deviceStats.mobilePct}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{deviceStats.mobile} Kunjungan</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <Monitor className="w-5 h-5 text-slate-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-500 block">Desktop / Laptop</span>
                <span className="text-xl font-black text-slate-900">{deviceStats.desktopPct}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{deviceStats.desktop} Kunjungan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section: Top Visited Pages */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#005DDD]" />
              <span>Halaman Paling Sering Dikunjungi (Top Visited Pages)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Frekuensi kunjungan URL publik berdasarkan data penjelajahan pengunjung
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 w-48">URL Path</th>
                <th className="pb-3">Judul Halaman</th>
                <th className="pb-3 w-32 text-center">Mobile vs PC</th>
                <th className="pb-3 w-28 text-right">Kunjungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topVisitedPages.slice(0, 10).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-mono text-[11px] text-[#005DDD] font-semibold">
                    {p.path}
                  </td>
                  <td className="py-3 pr-2 font-medium text-slate-800 truncate max-w-lg">
                    {p.title}
                  </td>
                  <td className="py-3 text-center text-[11px] text-slate-500 font-medium">
                    <span className="text-indigo-600 font-bold">{p.mobile}</span> M / <span className="text-slate-700 font-bold">{p.desktop}</span> D
                  </td>
                  <td className="py-3 text-right font-black text-slate-900 text-sm">
                    {p.count.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
