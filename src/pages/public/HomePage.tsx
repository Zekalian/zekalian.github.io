import React from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Layers,
  Video,
  Share2,
  Clock,
  Star,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWhatsAppTracker } from '../../hooks/useWhatsAppTracker';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { clientLogos, projects, articles, testimonials, settings } = useApp();
  const { currentVariant, handleWhatsAppClick, getVariantMessage } = useWhatsAppTracker();

  const featuredProjects = projects.filter((p) => p.status === 'PUBLISHED' && p.is_featured).slice(0, 3);
  const activeTestimonials = testimonials.filter((t) => t.is_active);
  const latestArticles = articles.filter((a) => a.status === 'PUBLISHED').slice(0, 3);

  const dynamicMessage = getVariantMessage({
    variantId: currentVariant.id,
    currentPath: '/',
    fallbackMessage: settings.whatsapp_prefilled_message,
  });

  const cleanWaNumber = settings.admin_whatsapp_number.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(dynamicMessage)}`;

  // CMS Settings with Fallbacks
  const heroPrefix = settings.hero_title_prefix || 'Building';
  const heroAccent = settings.hero_title_accent || 'authentic';
  const heroSuffix = settings.hero_title_suffix || 'brands, concept to execution.';
  const heroSubtitle = settings.hero_subtitle || 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.';
  const heroCtaPrimary = settings.hero_cta_primary || 'Hubungi Zekalian';
  const heroCtaSecondary = settings.hero_cta_secondary || 'Lihat Portofolio';

  const servicesSubtitle = settings.services_subtitle || 'Layanan Agensi';
  const servicesTitle = settings.services_title || 'Solusi Kreatif Menyeluruh untuk Skala Bisnis Anda';
  const servicesDesc = settings.services_desc || 'Dari strategi positioning hingga eksekusi visual di lapangan, kami memberikan kualitas craftsmanship tanpa kompromi.';
  
  const defaultServices = [
    {
      number: '01',
      title: 'Branding & Visual Identity',
      desc: 'Membangun identitas merek yang kokoh dan berkarakter unik. Mulai dari perumusan brand DNA, logo system, tipografi, palet warna, hingga buku panduan desain komprehensif.',
    },
    {
      number: '02',
      title: 'Production House & Media',
      desc: 'Eksekusi produksi audio visual sinematik standar bioskop untuk iklan komersial, film dokumenter korporat, dan kampanye digital berdaya pikat tinggi.',
    },
    {
      number: '03',
      title: 'Social Media Management',
      desc: 'Pengelolaan konten multimedia terstruktur berbasis data tren dan visual storytelling otentik guna melipatgandakan retensi dan interaksi audiens bisnis.',
    },
  ];
  const servicesList = settings.services_list && settings.services_list.length > 0 ? settings.services_list : defaultServices;
  const serviceIcons = [Layers, Video, Share2];

  const workflowSubtitle = settings.workflow_subtitle || 'Our Methodology';
  const workflowTitle = settings.workflow_title || 'Alur Kerja 4 Fase Terstruktur';
  const workflowDesc = settings.workflow_desc || 'Menjamin transparansi tenggat waktu, kejelasan ekspektasi teknis, dan presisi hasil akhir.';

  const defaultWorkflow = [
    {
      number: '01',
      title: 'Discovery & Brief',
      color: '#005DDD',
      desc: 'Membedah tujuan bisnis, profil audiens sasaran, dan lanskap kompetitor untuk merumuskan fondasi strategi kreatif yang terukur.',
    },
    {
      number: '02',
      title: 'Creative Direction',
      color: '#018EE3',
      desc: 'Penyusunan moodboard, skrip naratif, storyboard visual, serta panduan estetika sebelum melangkah ke tahap eksekusi teknis.',
    },
    {
      number: '03',
      title: 'Production & Craft',
      color: '#00B7E8',
      desc: 'Sesi pengambilan gambar beresolusi tinggi, desain grafis presisi, tata suara, dan pewarnaan sinematik (color grading) berstandar profesional.',
    },
    {
      number: '04',
      title: 'Final Delivery',
      color: '#0F172A',
      desc: 'Pemberian paket aset siap tayang dalam berbagai format digital, dokumentasi lisensi, serta panduan penerapan berkala.',
    },
  ];
  const workflowList = settings.workflow_list && settings.workflow_list.length > 0 ? settings.workflow_list : defaultWorkflow;

  const ctaBannerTitle = settings.cta_banner_title || 'Siap Mengangkat Identitas Brand Anda ke Level Berikutnya?';
  const ctaBannerDesc = settings.cta_banner_desc || 'Kami siap berdiskusi secara terbuka mengenai sasaran bisnis, kebutuhan visual, dan alokasi timeline proyek Anda.';
  const ctaBannerBtnText = settings.cta_banner_btn_text || 'Hubungi Zekalian';

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.03em] text-slate-950 leading-[1.08]">
            {heroPrefix}{' '}
            <span className="font-accent-script font-semibold text-[#005DDD] px-1">
              {heroAccent}
            </span>{' '}
            {heroSuffix}
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-[#334155] leading-relaxed max-w-2xl mx-auto font-normal">
            {heroSubtitle}
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-slate-900/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{heroCtaPrimary}</span>
              <ArrowUpRight className="w-5 h-5 text-sky-400" />
            </button>

            <button
              onClick={() => onNavigate('/projects')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-sm transition-all hover:border-slate-300 active:scale-[0.98]"
            >
              <span>{heroCtaSecondary}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Trusted Client Logos Showcase */}
      <section className="py-12 border-y border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase font-bold tracking-widest text-slate-400 mb-8">
            Dipercaya Oleh Brand &amp; Institusi Terkemuka
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20">
            {clientLogos
              .filter((l) => l.is_active)
              .map((logo) => (
                <div
                  key={logo.id}
                  className="group flex items-center justify-center transition-all duration-300"
                >
                  <img
                    src={logo.logo_url}
                    alt={logo.brand_name}
                    title={logo.brand_name}
                    className="h-8 sm:h-10 w-auto object-contain opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 3. Our Services (CMS Editable) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{servicesSubtitle}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
            {servicesTitle}
          </h2>
          <p className="mt-4 text-base text-[#334155] leading-relaxed">
            {servicesDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map((item, idx) => {
            const Icon = serviceIcons[idx % serviceIcons.length];
            return (
              <div
                key={item.number || idx}
                className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:border-[#005DDD]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#005DDD]/10 text-[#005DDD] font-extrabold text-lg flex items-center justify-center mb-6 group-hover:bg-[#005DDD] group-hover:text-white transition-all">
                    {item.number || `0${idx + 1}`}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#005DDD] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('/services')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005DDD] group-hover:underline"
                  >
                    <span>Pelajari Rincian</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Icon className="w-5 h-5 text-slate-300 group-hover:text-[#005DDD] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Projects Grid */}
      <section className="py-20 bg-slate-50/60 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/70 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-3">
                <span>Featured Works</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
                Karya Pilihan &amp; Studi Kasus
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/projects')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#005DDD] hover:text-[#018EE3] transition-colors group"
            >
              <span>Lihat Semua Proyek</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => {
              const thumbnail =
                project.media?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80';

              return (
                <div
                  key={project.id}
                  onClick={() => onNavigate(`/projects/${project.slug}`)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#005DDD] text-xs font-bold shadow-sm">
                      {project.client_name}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors leading-snug line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#334155] line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="uppercase tracking-wider">
                        {project.media_type === 'VIDEO' ? 'Video Case Study' : 'Visual Identity'}
                      </span>
                      <span className="text-[#005DDD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore Case <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Workflow / Process (CMS Editable) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
            <span>{workflowSubtitle}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
            {workflowTitle}
          </h2>
          <p className="mt-4 text-base text-[#334155] leading-relaxed">
            {workflowDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowList.map((phase, idx) => (
            <div
              key={phase.number || idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="w-2 h-2 rounded-full mb-6"
                style={{ backgroundColor: phase.color || '#005DDD' }}
              />
              <div>
                <span
                  className="text-xs font-black tracking-wider uppercase block mb-1"
                  style={{ color: phase.color || '#005DDD' }}
                >
                  Phase {phase.number || `0${idx + 1}`}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {phase.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#334155]">
                  {phase.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Client Stories */}
      {activeTestimonials.length > 0 && (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00B7E8] mb-3">
                Client Voices
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em]">
                Apa Kata Mitra Kerja Kami
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {activeTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-slate-700/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-6">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-slate-200 font-accent-script text-lg sm:text-xl leading-relaxed italic mb-8">
                      &ldquo;{t.testimonial_text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700/60">
                    <div className="w-11 h-11 rounded-full bg-[#005DDD] text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {t.client_name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {t.client_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t.client_company_or_brand}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Latest Articles & Insights */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Insights &amp; Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
              Wawasan Industri &amp; Ide Kreatif
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/articles')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#005DDD] hover:text-[#018EE3] transition-colors group"
          >
            <span>Buka Semua Artikel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => onNavigate(`/articles/${art.slug}`)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={art.cover_image_url}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                    <span>
                      {new Date(art.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {art.reading_time || '4 min read'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors line-clamp-2 mb-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-[#334155] line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005DDD] group-hover:translate-x-1 transition-transform">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 8. Big CTA Banner (CMS Editable) */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl bg-[#0F172A] text-white p-8 sm:p-14 md:p-18 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#005DDD]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#48CCEF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-tight">
              {ctaBannerTitle}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {ctaBannerDesc}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{ctaBannerBtnText}</span>
                <ArrowUpRight className="w-5 h-5 text-[#005DDD]" />
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="homepage-cta-whatsapp-btn"
                onClick={() =>
                  handleWhatsAppClick({
                    placement: 'home_hero',
                    customMessage: dynamicMessage,
                    variantId: currentVariant.id,
                    ctaText: currentVariant.short_label,
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-base transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>{currentVariant.short_label}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
