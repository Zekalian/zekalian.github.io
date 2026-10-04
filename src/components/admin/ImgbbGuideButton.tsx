import React, { useState } from 'react';
import { HelpCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { ImgbbGuideModal } from './ImgbbGuideModal';

interface ImgbbGuideButtonProps {
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onOpenFullPage?: () => void;
}

export const ImgbbGuideButton: React.FC<ImgbbGuideButtonProps> = ({
  label = 'Petunjuk Direct Link ImgBB',
  size = 'sm',
  className = '',
  onOpenFullPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-1.5',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center font-bold text-[#005DDD] hover:text-[#004bb5] bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-lg transition-colors cursor-pointer w-fit shrink-0 ${sizeClasses[size]} ${className}`}
        title="Buka petunjuk cara upload foto & mengambil direct link di imgbb.com"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#005DDD] shrink-0" />
        <span>{label}</span>
        <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      <ImgbbGuideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpenFullPage={
          onOpenFullPage ||
          (() => {
            if (typeof window !== 'undefined') {
              window.open('#/admin/guide/imgbb', '_blank');
            }
          })
        }
      />
    </>
  );
};

export const ImgbbViewerLinkWarning: React.FC<{ url: string; onOpenGuide?: () => void }> = ({
  url,
  onOpenGuide,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const trimmed = url?.trim() || '';
  const isViewer = trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/');

  if (!isViewer) return null;

  return (
    <>
      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 animate-in fade-in my-1.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <strong>Tautan terdeteksi sebagai Viewer Link (ibb.co/...).</strong> Foto tidak akan muncul di website dengan link ini. Anda harus menggunakan <strong>Direct Link (i.ibb.co/...)</strong>.{' '}
          <button
            type="button"
            onClick={() => {
              if (onOpenGuide) onOpenGuide();
              else setModalOpen(true);
            }}
            className="text-[#005DDD] font-bold underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
          >
            Buka Petunjuk Direct Link &rarr;
          </button>
        </div>
      </div>

      <ImgbbGuideModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOpenFullPage={() => {
          if (typeof window !== 'undefined') {
            window.open('#/admin/guide/imgbb', '_blank');
          }
        }}
      />
    </>
  );
};
