import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useWhatsAppTracker } from '../../hooks/useWhatsAppTracker';
import { Mail, MessageCircle, Send, MapPin, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { settings, submitInquiry } = useApp();
  const { currentVariant, handleWhatsAppClick, getVariantMessage } = useWhatsAppTracker();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [vision, setVision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dynamicMessage = getVariantMessage({
    variantId: currentVariant.id,
    currentPath: '/contact',
    fallbackMessage: settings.whatsapp_prefilled_message,
  });

  const cleanWaNumber = settings.admin_whatsapp_number.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(dynamicMessage)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await submitInquiry(name, email, vision);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setName('');
      setEmail('');
      setVision('');
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat mengirimkan formulir.');
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <span>Let's Build Together</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          Mulai Diskusi Proyek Bersama Zekalian
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[#334155] leading-relaxed">
          Kami siap mendengar tujuan merek Anda. Sampaikan gambaran visi awal atau hubungi kami langsung via WhatsApp untuk respon cepat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Interactive Project Brief Form (PRD 4.5) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Pesan Brief Anda Telah Diterima!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Terima kasih telah mempercayakan ide proyek Anda kepada Zekalian. Tim produser kami akan meninjau dan merespon melalui email atau WhatsApp dalam 1x24 jam kerja.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  Kirim Brief Proyek Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Formulir Brief Proyek
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Harap isi detail ringkas di bawah ini agar kami dapat mempersiapkan estimasi teknis yang tepat.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Input Name */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
                  Nama Lengkap / Brand *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Input Email */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
                  Alamat Email Resmi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Textarea Project Vision */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
                  Visi Proyek &amp; Sasaran *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us about your goals... (Contoh: Kami butuh rebrand logo & sistem kemasan produk kopi siap saji, target rilis November 2026)"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Collaborative Budget Disclaimer (PRD 4.5) */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-[#005DDD] leading-relaxed">
                <strong>Pendekatan Diskusi Kolaboratif:</strong> Kami tidak membatasi nilai anggaran secara kaku, melainkan mengedepankan negosiasi transparan berdasarkan timeline, beban hari kerja kru, peralatan, dan skala teknis proyek.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#0F172A] hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Mengirimkan Brief...</span>
                ) : (
                  <>
                    <span>Kirim Brief Proyek ke Zekalian</span>
                    <Send className="w-4 h-4 text-sky-400" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Studio Presence */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct WhatsApp Card */}
          <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200/60 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Respon Cepat
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {currentVariant.badge_text}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              WhatsApp Resmi Agensi
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {dynamicMessage}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="contact-page-whatsapp-btn"
              onClick={() =>
                handleWhatsAppClick({
                  placement: 'contact_page',
                  customMessage: dynamicMessage,
                  customPath: '/contact',
                  variantId: currentVariant.id,
                  ctaText: currentVariant.short_label,
                })
              }
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>{currentVariant.short_label} ({settings.admin_whatsapp_number})</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Studio Details Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kanal Resmi
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Surat Elektronik (Email)
              </h4>
              <a
                href={`mailto:${settings.official_email}`}
                className="text-sm font-semibold text-[#005DDD] hover:underline flex items-center gap-2 mt-1"
              >
                <Mail className="w-4 h-4" />
                <span>{settings.official_email}</span>
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Studio Fisik
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#005DDD] shrink-0 mt-0.5" />
                <span>{settings.studio_address || 'Pekanbaru — Payakumbuh, Indonesia'}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Waktu Operasional
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Senin – Sabtu: 09:00 – 18:00 WIB</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
