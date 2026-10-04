import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Lightbulb,
  MousePointerClick,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ImgbbGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage?: () => void;
}

export const ImgbbGuideModal: React.FC<ImgbbGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenFullPage,
}) => {
  const [testUrl, setTestUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const trimmedTest = testUrl.trim();
  const isDirectImgbb = trimmedTest.startsWith('https://i.ibb.co/') || trimmedTest.startsWith('http://i.ibb.co/');
  const isViewerImgbb =
    (trimmedTest.startsWith('https://ibb.co/') || trimmedTest.startsWith('http://ibb.co/')) &&
    !trimmedTest.includes('i.ibb.co');
  const isOtherDirectImage =
    (trimmedTest.startsWith('http://') || trimmedTest.startsWith('https://')) &&
    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmedTest);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#005DDD] flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Petunjuk Upload Foto ImgBB &amp; Direct Link
              </h3>
              <p className="text-xs text-slate-500">
                Cara mengambil tautan langsung agar foto muncul di portofolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Quick Notice: Direct Link vs Viewer Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>BENAR: Direct Link</span>
              </div>
              <p className="text-slate-600 mb-2">Berawalan dengan huruf &quot;i.&quot; dan berakhiran ekstensi foto:</p>
              <code className="block bg-white p-2 rounded-lg font-mono text-[11px] text-emerald-700 break-all select-all border border-emerald-200/80">
                https://i.ibb.co/XyZ123/foto.jpg
              </code>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>SALAH: Viewer Link</span>
              </div>
              <p className="text-slate-600 mb-2">Halaman web (bukan file fisik), gambar tidak akan muncul:</p>
              <code className="block bg-white p-2 rounded-lg font-mono text-[11px] text-rose-700 line-through break-all select-all border border-rose-200/80">
                https://ibb.co/XyZ123
              </code>
            </div>
          </div>

          {/* 4 Simple Steps */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-[#005DDD]" />
              <span>4 Langkah Cepat di ImgBB.com:</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-6 h-6 rounded-lg bg-[#005DDD] text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-slate-900">Buka imgbb.com:</strong> Buka situs{' '}
                  <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-[#005DDD] font-bold underline inline-flex items-center gap-0.5">
                    imgbb.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  dan klik tombol biru <em>&ldquo;Mulai Mengunggah&rdquo;</em>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-slate-900">Atur Waktu Hapus:</strong> Sebelum klik upload, pastikan dropdown <em>&ldquo;Otomatis hapus gambar&rdquo;</em> diatur ke <strong>&ldquo;Jangan hapus otomatis&rdquo;</strong> (*Don&apos;t autodelete*).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-6 h-6 rounded-lg bg-[#005DDD] text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <strong className="text-slate-900">Klik Unggah:</strong> Klik tombol hijau <em>&ldquo;Unggah&rdquo;</em> dan tunggu proses selesai.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-300">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                <div>
                  <strong className="text-slate-900">Ambil Direct Link (KUNCI):</strong> Pada menu <em>&ldquo;Kode Sematan&rdquo;</em> (*Embed codes*), ubah dari <em>Viewer links</em> menjadi <strong>&ldquo;Tautan langsung&rdquo; / &ldquo;Direct links&rdquo;</strong>, lalu salin URL yang diawali <code className="bg-white px-1 rounded text-emerald-700 font-mono">https://i.ibb.co/...</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tip: Right Click */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2.5 text-xs text-slate-700">
            <Lightbulb className="w-4 h-4 text-[#005DDD] shrink-0 mt-0.5" />
            <div>
              <strong>Trik Cepat:</strong> Anda juga bisa membuka foto di ImgBB, lalu lakukan <strong>klik kanan pada gambar &gt; Salin alamat gambar (Copy image address)</strong>.
            </div>
          </div>

          {/* Mini Link Checker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#005DDD]" />
                <span>Tes Cek Tautan Anda:</span>
              </span>
            </div>
            <input
              type="text"
              placeholder="Tempelkan link ImgBB Anda di sini untuk uji coba..."
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
            />
            {trimmedTest && (
              <div className="pt-1">
                {isDirectImgbb || isOtherDirectImage ? (
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tautan Valid! Ini adalah Direct Link murni.</span>
                  </div>
                ) : isViewerImgbb ? (
                  <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Ini adalah Viewer Link (ibb.co). Ikuti langkah 4 untuk mengambil Direct Link (i.ibb.co).</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Pastikan link berawalan https://i.ibb.co/</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href="https://imgbb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005DDD] hover:underline"
            >
              <span>Buka ImgBB.com di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Buka Halaman Lengkap
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#004bb5] transition-colors cursor-pointer"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
