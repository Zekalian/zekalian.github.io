import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: Array<{ image_url: string; caption?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Tutup Pratinjau Gambar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Gambar Sebelumnya"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Main Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={current.image_url}
            alt={current.caption || 'Project Showcase Preview'}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            referrerPolicy="no-referrer"
          />
          {current.caption && (
            <p className="mt-4 text-center text-sm text-slate-300 font-medium max-w-2xl px-4">
              {current.caption}
            </p>
          )}
          {images.length > 1 && (
            <span className="mt-2 text-xs text-slate-400 font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </motion.div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Gambar Berikutnya"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </AnimatePresence>
  );
};
