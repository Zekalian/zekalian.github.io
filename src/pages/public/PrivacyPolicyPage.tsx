import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ZekalianLogo } from '../../components/ZekalianLogo';

interface PrivacyPolicyPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <div className="flex items-center gap-3 mb-4">
            <ZekalianLogo size="md" />
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Legal & Dokumen Resmi
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Terakhir diperbarui: 4 Oktober 2026 • Berlaku untuk Zekalian Agency (zekalian.web.id)
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Privasi Anda adalah prioritas utama kami. Dokumen ini menjelaskan bagaimana Zekalian mengumpulkan,
              menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan dan platform kami.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami hanya mengumpulkan informasi yang diperlukan untuk menyediakan layanan branding, media kreatif, dan akses administratif. Ini meliputi:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Informasi Kontak:</strong> Nama, alamat email, nomor telepon/WhatsApp, dan nama perusahaan saat Anda mengirimkan pesan kontak atau formulir brief proyek.</li>
              <li><strong>Autentikasi Akun:</strong> Alamat email Google dan nama profil saat tim/klien masuk melalui integrasi Google Sign-In untuk keperluan otorisasi panel admin.</li>
              <li><strong>Data Analitik Teknis:</strong> Informasi penjelajahan agregat standar seperti jenis peramban, resolusi layar, dan waktu kunjungan untuk meningkatkan performa situs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Penggunaan Akun Google (Google OAuth)</h2>
            <p>
              Integrasi Google Sign-In pada situs kami hanya digunakan untuk memverifikasi identitas pengguna (Single Sign-On) ke dalam Portal Admin Zekalian. Kami tidak pernah membaca data email pribadi Anda di luar profil dasar (nama, email, foto profil) yang disetujui pengguna.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Keamanan Data</h2>
            <p>
              Semua transmisi data dilindungi oleh enkripsi SSL/TLS (HTTPS) standar industri dan disimpan secara aman di infrastruktur cloud terakreditasi Google Cloud & Firebase dengan pembatasan hak akses berbasis peran (RBAC).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Pembagian Data kepada Pihak Ketiga</h2>
            <p>
              Zekalian berkomitmen penuh untuk tidak menjual, menyewakan, atau memperjualbelikan data pribadi Anda kepada pihak ketiga mana pun untuk tujuan pemasaran.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Kontak Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi tim kami melalui:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Zekalian Agency</strong></p>
              <p>Email: <a href="mailto:zakikey.works@gmail.com" className="text-blue-600 hover:underline">zakikey.works@gmail.com</a></p>
              <p>Website: <a href="https://zekalian.web.id" className="text-blue-600 hover:underline">https://zekalian.web.id</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
