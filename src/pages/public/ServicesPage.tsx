import React from 'react';
import { Layers, Video, Share2, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ServicesPageProps {
  onNavigate: (route: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { settings } = useApp();

  const defaultServices = [
    {
      number: '01',
      title: 'Branding & Visual Identity',
      desc: 'Menciptakan sistem identitas visual menyeluruh yang membedakan bisnis Anda dari kebisingan pasar. Kami memastikan brand Anda berbicara dengan nada yang konsisten di semua titik temu konsumen.',
      deliverables: [
        'Perumusan Brand Archetype, Visi & Tone of Voice',
        'Desain Logo Primer, Sekunder, dan Sub-mark',
        'Sistem Tipografi & Hierarki Rupa Huruf Eksklusif',
        'Palet Warna Terkalibrasi (Digital & Cetak CMYK/Pantone)',
        'Brand Guidelines Manual (PDF 50+ Halaman)',
        'Desain Kemasan (Packaging) & Merchandise Resmi',
      ],
    },
    {
      number: '02',
      title: 'Production House & Media',
      desc: 'Produksi video komersial dan foto resolusi tinggi dengan standar bioskop. Dari penyusunan naskah hingga pewarnaan akhir (color grading), setiap adegan dikerjakan dengan presisi artistik.',
      deliverables: [
        'Film Iklan Komersial TVC & Digital Ads',
        'Video Dokumenter & Company Profile Korporat',
        'Foto Produk Komersial dengan Editorial Studio Lighting',
        'Penulisan Naskah (Scriptwriting) & Storyboard',
        'Penyewaan Kamera Sinema Format Besar & Tata Lampu Profesional',
        'Color Grading Standar Bioskop & Sound Design',
      ],
    },
    {
      number: '03',
      title: 'Social Media Management',
      desc: 'Pengelolaan kanal media sosial secara strategis dengan aset visual yang terencana. Mengubah pengikut pasif menjadi pelanggan loyal melalui storytelling yang konsisten.',
      deliverables: [
        'Penyusunan Content Pillar & Kalender Editorial Bulanan',
        'Produksi Konten Video Pendek Kinetik (Reels / TikTok)',
        'Desain Carousel Edukatif Berdaya Simpan Tinggi',
        'Pengelolaan Tata Letak Feed Instagram Harmonis',
        'Copywriting Persuasif & Riset Tagar Tertarget',
        'Laporan Analisis Kinerja & Rekomendasi Pertumbuhan',
      ],
    },
  ];

  const servicesList = settings.services_list && settings.services_list.length > 0
    ? settings.services_list.map((srv, idx) => ({
        number: srv.number || String(idx + 1).padStart(2, '0'),
        title: srv.title,
        desc: srv.desc,
        deliverables: [
          `Perencanaan strategis & eksekusi profesional untuk ${srv.title}`,
          `Penyusunan standar kualitas tinggi sesuai brief agensi`,
          `Pengujian dan penyempurnaan aset akhir siap tayang`,
          `Konsultasi langsung bersama tim kreatif spesialis`,
        ],
      }))
    : defaultServices;

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-16 sm:mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <span>{settings.services_subtitle || 'Our Capabilities'}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          {settings.services_title || 'Ruang Lingkup Layanan & Deliverables'}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[#334155] leading-relaxed">
          {settings.services_desc || 'Kami menyediakan ekosistem terpadu untuk merancang, memproduksi, dan menyebarkan pesan visual brand Anda dengan standar tertinggi.'}
        </p>
      </div>

      {/* Services Breakdown */}
      <div className="space-y-16 sm:space-y-24 mb-24">
        {servicesList.map((srv, idx) => {
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/80 shadow-sm relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-[#005DDD]/10 text-[#005DDD] font-black text-lg flex items-center justify-center font-mono">
                      {srv.number}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#005DDD]">
                      Layanan Utama Agensi
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {srv.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                    {srv.desc}
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => onNavigate('/contact')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                      <span>Konsultasikan Kebutuhan Ini</span>
                      <ArrowRight className="w-4 h-4 text-sky-400" />
                    </button>
                  </div>
                </div>

                {/* Deliverables List Card */}
                <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200/70">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#005DDD]" />
                    <span>Daftar Deliverables Konkret</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {srv.deliverables.map((item, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Collaboration Approach */}
      <div className="rounded-3xl bg-[#005DDD] text-white p-8 sm:p-14 overflow-hidden relative shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest text-sky-200 block mb-3">
            Flexible &amp; Collaborative
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pendekatan Diskusi Anggaran yang Transparan
          </h2>
          <p className="mt-4 text-sm sm:text-base text-sky-100 leading-relaxed">
            Kami tidak membatasi nilai anggaran secara kaku. Kami mengedepankan negosiasi terbuka berdasarkan timeline pengerjaan, beban hari kerja kru di lapangan, kebutuhan peralatan teknis, dan skala akhir proyek Anda.
          </p>
          <div className="mt-8">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-8 py-3.5 rounded-full bg-white text-[#005DDD] hover:bg-slate-50 font-bold text-sm shadow-md transition-all"
            >
              Mulai Diskusi Brief Bersama Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
