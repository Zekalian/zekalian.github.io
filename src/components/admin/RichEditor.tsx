import React, { useState, useEffect, useRef } from 'react';
import { uploadFileToStorage, isWebPFile } from '../../lib/firebase';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  Video,
  Eye,
  Undo2,
  Redo2,
  UploadCloud,
  Loader2,
  Link as LinkIcon,
  X,
  CheckCircle2,
} from 'lucide-react';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const RichEditor: React.FC<RichEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [htmlContent, setHtmlContent] = useState<string>(content || '');

  // Image insertion modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imgModalTab, setImgModalTab] = useState<'upload' | 'link'>('upload');
  const [modalImgUrl, setModalImgUrl] = useState('');
  const [modalImgCaption, setModalImgCaption] = useState('');
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Sync external content changes if needed
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
      setHtmlContent(content || '');
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  };

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleHeading = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleOpenImageModal = () => {
    setModalImgUrl('');
    setModalImgCaption('');
    setImgModalTab('upload');
    setIsImageModalOpen(true);
  };

  const handleModalFileUpload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      alert('Format file ditolak: Sistem hanya menerima format WebP (.webp). Mohon unggah file berekstensi .webp atau gunakan tab Tautan/Link Gambar.');
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
      return;
    }

    setIsUploadingImg(true);
    try {
      const url = await uploadFileToStorage(file, 'article_content');
      setModalImgUrl(url);
      if (!modalImgCaption) {
        setModalImgCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err: any) {
      console.error('Upload article image failed:', err);
      alert('Gagal mengunggah gambar: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploadingImg(false);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  const handleInsertConfirmedImage = () => {
    if (!modalImgUrl.trim()) {
      alert('Mohon unggah file .webp atau masukkan tautan URL gambar terlebih dahulu.');
      return;
    }

    const caption = modalImgCaption.trim();
    const imgHtml = `
<figure class="my-6 text-center">
  <img src="${modalImgUrl.trim()}" alt="${caption}" class="rounded-2xl max-w-full w-full h-auto border border-slate-200 shadow-sm mx-auto object-cover" />
  ${caption ? `<figcaption class="text-xs text-slate-500 text-center mt-2 italic">${caption}</figcaption>` : ''}
</figure>
<p><br></p>
`;
    executeCommand('insertHTML', imgHtml);
    setIsImageModalOpen(false);
  };

  const handleInsertYouTube = () => {
    const rawUrl = prompt('Masukkan URL Video YouTube (misal: https://youtu.be/ysz5S6PUM-U atau Video ID):');
    if (!rawUrl) return;

    let cleanId = rawUrl.trim();
    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const match = rawUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
      if (match && match[2].length === 11) {
        cleanId = match[2];
      }
    }

    const videoHtml = `
<div class="aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-md bg-slate-950">
  <iframe class="w-full h-full border-0" src="https://www.youtube-nocookie.com/embed/${cleanId}?rel=0" allowfullscreen></iframe>
</div>
<p><br></p>
`;
    executeCommand('insertHTML', videoHtml);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Tebal (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bold</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-2 rounded-lg italic text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Miring (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Italic</span>
          </button>

          <button
            type="button"
            onClick={() => handleHeading('<h2>')}
            className="p-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span>H2</span>
          </button>

          <button
            type="button"
            onClick={() => handleHeading('<h3>')}
            className="p-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span>H3</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
            title="Kutipan (Quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={handleOpenImageModal}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-[#005DDD] hover:bg-sky-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>+ Sisip Gambar (.WebP / Link)</span>
          </button>

          <button
            type="button"
            onClick={handleInsertYouTube}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>+ Embed YouTube</span>
          </button>
        </div>

        {/* Tab switch: Write vs Live Preview */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'write' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Tulis (Visual)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Pratinjau</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === 'write' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="w-full p-5 text-sm text-slate-800 focus:outline-none min-h-[320px] bg-white overflow-y-auto prose prose-slate max-w-none leading-relaxed"
          style={{ wordBreak: 'break-word' }}
        />
      ) : (
        <div className="p-6 bg-slate-50 min-h-[320px] prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed overflow-y-auto">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <span className="text-slate-400 italic">Belum ada konten untuk ditampilkan di pratinjau.</span>
          )}
        </div>
      )}

      {/* Modal Sisip Gambar (WebP atau Link) */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#005DDD] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sisipkan Gambar ke Artikel</h4>
                  <p className="text-[11px] text-slate-500">Wajib format .WebP atau tautan link gambar (URL)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setImgModalTab('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imgModalTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#005DDD]" />
                <span>Unggah Berkas .WebP</span>
              </button>
              <button
                type="button"
                onClick={() => setImgModalTab('link')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  imgModalTab === 'link' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#005DDD]" />
                <span>Tautan / Link Gambar</span>
              </button>
            </div>

            {/* Tab 1: Upload .WebP */}
            {imgModalTab === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImg(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImg(false); }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation(); setIsDraggingImg(false);
                  if (e.dataTransfer.files?.length) handleModalFileUpload(e.dataTransfer.files);
                }}
                onClick={() => !isUploadingImg && modalFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
                  isDraggingImg
                    ? 'border-[#005DDD] bg-sky-50'
                    : isUploadingImg
                    ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-sky-50/30 hover:border-[#005DDD]'
                }`}
              >
                <input
                  type="file"
                  ref={modalFileInputRef}
                  accept="image/webp,.webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) handleModalFileUpload(e.target.files);
                  }}
                />
                {isUploadingImg ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#005DDD] animate-spin" />
                    <span className="text-xs font-bold text-[#005DDD]">Mengunggah WebP...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <UploadCloud className="w-6 h-6 text-[#005DDD]" />
                    <p className="text-xs font-bold text-slate-800">
                      Pilih Berkas <span className="text-[#005DDD]">.WEBP</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tarik &amp; lepas atau klik dari komputer (hanya menerima .webp)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Tab 2: Link URL */
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">URL Gambar Langsung</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... atau URL foto eksternal"
                  value={modalImgUrl}
                  onChange={(e) => setModalImgUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                />
                <p className="text-[10px] text-slate-400">Pastikan tautan dapat diakses secara publik.</p>
              </div>
            )}

            {/* Preview image if available */}
            {modalImgUrl && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">Pratinjau Gambar:</span>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-900 flex items-center justify-center">
                  <img src={modalImgUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Teks Keterangan / Caption (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Dokumentasi proses color grading di studio"
                value={modalImgCaption}
                onChange={(e) => setModalImgCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!modalImgUrl.trim()}
                onClick={handleInsertConfirmedImage}
                className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3] transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sisipkan ke Artikel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
