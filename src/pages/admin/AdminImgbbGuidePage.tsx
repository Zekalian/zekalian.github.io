import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  MousePointerClick,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AdminImgbbGuidePageProps {
  onNavigate?: (route: string) => void;
}

export const AdminImgbbGuidePage: React.FC<AdminImgbbGuidePageProps> = ({ onNavigate }) => {
  const [testUrl, setTestUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Live validator analysis
  const trimmedTest = testUrl.trim();
  const isDirectImgbb = trimmedTest.startsWith('https://i.ibb.co/') || trimmedTest.startsWith('http://i.ibb.co/');
  const isViewerImgbb =
    (trimmedTest.startsWith('https://ibb.co/') || trimmedTest.startsWith('http://ibb.co/')) &&
    !trimmedTest.includes('i.ibb.co');
  const isOtherDirectImage =
    (trimmedTest.startsWith('http://') || trimmedTest.startsWith('https://')) &&
    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmedTest);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#005DDD] mb-3 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Manajemen Proyek</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-[#005DDD] border border-sky-200">
              Dokumentasi &amp; Panduan Media
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Panduan Upload Foto di ImgBB &amp; Direct Link
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ikuti petunjuk praktis ini untuk mengunggah foto portofolio berkualitas tinggi secara gratis menggunakan <strong className="text-slate-800">ImgBB.com</strong> dan mengambil tautan langsung (<strong className="text-slate-800">Direct Link</strong>) yang siap disematkan ke website Zekalian.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://imgbb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold transition-all shadow-md shadow-[#005DDD]/20 cursor-pointer active:scale-95"
          >
            <span>Buka ImgBB.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Visual Comparison: Direct Link vs Viewer Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Correct One: Direct Link */}
        <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Direct Link (BENAR &amp; WAJIB)</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
              Langsung Muncul
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 mb-2">
            Tautan File Gambar Asli Murni
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Direct Link mengarah langsung ke berkas gambar fisik di server. Memiliki awalan <strong className="text-emerald-900 font-mono">https://i.ibb.co/...</strong> dan diakhiri dengan ekstensi <strong className="text-emerald-900 font-mono">.jpg / .png / .webp</strong>.
          </p>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 font-mono text-xs text-slate-800 break-all select-all flex items-center justify-between gap-2 shadow-2xs">
            <span className="text-emerald-700 font-bold">
              https://i.ibb.co/3sX8K2M/cinematic-shoot.jpg
            </span>
            <button
              onClick={() => handleCopy('https://i.ibb.co/3sX8K2M/cinematic-shoot.jpg', 'direct-example')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
              title="Salin contoh"
            >
              {copiedKey === 'direct-example' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-emerald-900 font-medium">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Berawalan dengan huruf <strong className="font-bold">i.ibb.co</strong> (ada huruf &quot;i.&quot;)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Berakhiran ekstensi foto (.jpg, .png, .webp)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bisa langsung dirender di lightbox &amp; portofolio publik</span>
            </li>
          </ul>
        </div>

        {/* The Incorrect One: Viewer Link */}
        <div className="bg-rose-50/60 border-2 border-rose-300 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white shadow-xs">
              <XCircle className="w-4 h-4" />
              <span>Viewer Link (SALAH / JANGAN GUNAKAN)</span>
            </span>
            <span className="text-[11px] font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-lg">
              Akan Error / Gambar Rusak
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 mb-2">
            Halaman Web Viewer HTML ImgBB
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Viewer link adalah alamat laman web yang berisi tombol download dan iklan ImgBB. Memiliki format <strong className="text-rose-900 font-mono">https://ibb.co/XyZ...</strong> tanpa akhiran nama berkas gambar.
          </p>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-200 font-mono text-xs text-slate-800 break-all select-all flex items-center justify-between gap-2 shadow-2xs">
            <span className="text-rose-700 line-through">
              https://ibb.co/3sX8K2M
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Tidak Bisa Dirender
            </span>
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-rose-900 font-medium">
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Tidak memiliki huruf &quot;i.&quot; di depan ibb.co</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Tidak memiliki ekstensi .jpg / .png di akhir tautan</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Jika dipasang, foto di web akan tampil blank atau ikon gambar rusak</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Step-by-Step Guide with Visual Cards */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MousePointerClick className="w-6 h-6 text-[#005DDD]" />
            <span>Langkah Mudah Mendapatkan Direct Link di ImgBB</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hanya memerlukan waktu 30 detik tanpa biaya langganan apapun:
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#005DDD] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Buka Situs ImgBB
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kunjungi <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-[#005DDD] font-bold underline">imgbb.com</a> di tab baru browser Anda. Anda bebas mengunggah secara langsung tanpa registrasi, namun sangat dianjurkan membuat akun gratis agar Anda dapat mengelola arsip foto di kemudian hari.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#005DDD] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              2
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Klik &ldquo;Mulai Mengunggah&rdquo; (Start Uploading)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Klik tombol biru besar di tengah layar, lalu pilih satu atau beberapa file foto resolusi tinggi dari komputer/perangkat Anda. Anda juga bisa langsung menyeret (*drag and drop*) file foto ke halaman web tersebut.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Pilih Opsi &ldquo;Jangan Hapus Otomatis&rdquo; (SANGAT PENTING!)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                  Wajib
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Di jendela pratinjau sebelum klik upload, periksa dropdown <strong>&ldquo;Otomatis hapus gambar&rdquo;</strong> (*Auto delete image*). Pastikan memilih opsi <strong>&ldquo;Jangan hapus otomatis&rdquo;</strong> (*Don&apos;t autodelete*) agar foto portofolio Anda tersimpan secara permanen dan tidak hilang setelah beberapa minggu.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#005DDD] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              4
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Klik Tombol Hijau &ldquo;Unggah&rdquo; (Upload)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tunggu beberapa detik hingga bilah progres mencapai 100%. ImgBB akan memproses gambar Anda dan menampilkan layar hasil unggahan (*Upload complete*).
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              5
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  KUNCI UTAMA: Ganti Dropdown ke &ldquo;Tautan Langsung&rdquo; (Direct links)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  Langkah Terpenting
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Setelah selesai upload, pada bagian bawah terdapat kotak berlabel <strong>&ldquo;Kode Sematan&rdquo;</strong> (*Embed codes*):
              </p>
              <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-2">
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>1. Klik dropdown yang bertuliskan <em>&ldquo;Viewer links&rdquo;</em></span>
                </p>
                <p className="flex items-center gap-2 font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>2. Pilih opsi <strong>&ldquo;Tautan langsung&rdquo; / &ldquo;Direct links&rdquo;</strong></span>
                </p>
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>3. Tautan di dalam kotak akan otomatis berubah menjadi: <code className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">https://i.ibb.co/.../nama-foto.jpg</code></span>
                </p>
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>4. Klik tombol <strong>&ldquo;Salin&rdquo; (Copy)</strong> lalu tempelkan (*paste*) di form proyek Zekalian!</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Alternatif: Klik Kanan */}
        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3.5">
          <Lightbulb className="w-5 h-5 text-[#005DDD] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-700 space-y-1">
            <h5 className="font-bold text-slate-900">
              Metode Alternatif Praktis (Klik Kanan Gambar):
            </h5>
            <p>
              Jika Anda sedang membuka gambar di situs ImgBB, Anda bisa langsung melakukan <strong>klik kanan pada foto</strong> &gt; lalu pilih <strong>&ldquo;Copy image address&rdquo; (Salin alamat gambar)</strong>. URL yang tersalin akan otomatis berformat Direct Link (<code className="bg-white px-1.5 py-0.5 rounded text-[#005DDD] font-mono">https://i.ibb.co/...</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive URL Tester & Validator Tool */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#005DDD]" />
            <h3 className="text-lg font-bold text-slate-900">
              Uji Coba Tautan Anda (Live Link Validator)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tempelkan link foto yang Anda salin ke kotak di bawah untuk memeriksa apakah link tersebut sudah merupakan Direct Link yang benar.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Tempelkan tautan foto di sini (contoh: https://i.ibb.co/3sX8K2M/foto.jpg)..."
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005DDD] bg-slate-50/50"
            />
            {testUrl && (
              <button
                type="button"
                onClick={() => setTestUrl('')}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Validation Feedback Result */}
          {trimmedTest ? (
            <div>
              {isDirectImgbb || isOtherDirectImage ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>SEMPURNA! Ini adalah Direct Link yang valid dan siap digunakan.</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    URL mengarah langsung ke berkas fisik gambar. Website Zekalian dapat memuat dan menampilkan gambar ini dengan instan.
                  </p>
                  {/* Live preview */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                      Hasil Pratinjau Foto:
                    </span>
                    <div className="max-w-xs rounded-xl overflow-hidden border border-emerald-300 shadow-sm bg-black/5 aspect-video flex items-center justify-center">
                      <img
                        src={trimmedTest}
                        alt="Valid Direct Link Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).alt = 'Gagal memuat gambar (periksa akses internet)';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : isViewerImgbb ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-700">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>PERINGATAN: Ini adalah Viewer Link (ibb.co/...), bukan Direct Link!</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Tautan ini adalah halaman web ImgBB dan <strong>tidak akan muncul</strong> jika dimasukkan ke daftar foto proyek.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-800">
                    <strong>Cara perbaiki:</strong> Buka tautan tersebut di tab baru, klik kanan pada gambar di layar, lalu pilih <strong>&ldquo;Copy image address&rdquo;</strong>.
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Format tautan belum dikenali sebagai Direct Link standar.</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Pastikan tautan diawali dengan <code>https://i.ibb.co/</code> atau berakhiran ekstensi gambar <code>.jpg, .png, .webp</code>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              * Contoh tautan valid: <code>https://i.ibb.co/3sX8K2M/cinematic-shoot.jpg</code>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#005DDD]" />
          <span>Pertanyaan Umum (FAQ)</span>
        </h3>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
            <h5 className="font-bold text-slate-900 mb-1">
              Berapa batas maksimal ukuran file foto di ImgBB?
            </h5>
            <p>
              ImgBB mendukung ukuran file hingga <strong>32 Megabyte (MB)</strong> per foto secara gratis. Ini lebih dari cukup untuk foto kamera sinematik resolusi tinggi.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
            <h5 className="font-bold text-slate-900 mb-1">
              Apakah foto saya akan terhapus setelah beberapa bulan?
            </h5>
            <p>
              Tidak, asalkan Anda memilih opsi <strong>&ldquo;Jangan hapus otomatis&rdquo;</strong> (*Don&apos;t autodelete*) saat proses unggah seperti pada Langkah 3 di atas.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
            <h5 className="font-bold text-slate-900 mb-1">
              Apakah saya bisa menggunakan layanan hosting gambar lain selain ImgBB?
            </h5>
            <p>
              Tentu bisa! Anda dapat menggunakan layanan cloud hosting apa pun (seperti Cloudinary, Google Cloud Storage, AWS S3, PostImages, dll.) asalkan tautan yang Anda masukkan adalah <strong>Direct Link murni</strong> yang mengarah langsung ke file gambar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
