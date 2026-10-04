import React, { useEffect } from 'react';
import { X, Instagram, Linkedin, User } from 'lucide-react';
import { TeamMember } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';

interface CrewModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  customRole?: string;
  onClose: () => void;
}

export const CrewModal: React.FC<CrewModalProps> = ({
  isOpen,
  member,
  customRole,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[990] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Detail Kru"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Avatar or Initial Badge */}
            <div className="relative mb-5">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-sky-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#005DDD] text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                  {member.initials}
                </div>
              )}
              <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Name & Roles */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {member.full_name}
            </h3>
            <p className="text-xs font-bold text-[#005DDD] uppercase tracking-wider mt-1">
              {customRole || member.default_role}
            </p>
            {customRole && customRole !== member.default_role && (
              <p className="text-xs text-slate-400 mt-0.5">
                Role agensi: {member.default_role}
              </p>
            )}

            {/* Bio */}
            {member.bio && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                {member.bio}
              </p>
            )}

            {/* Social Action Buttons */}
            <div className="mt-6 flex items-center gap-3 w-full">
              {member.instagram_url ? (
                <a
                  href={member.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent text-sm font-semibold transition-all shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              ) : (
                <button disabled className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-300 text-sm">
                  Instagram (N/A)
                </button>
              )}

              {member.linkedin_url ? (
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              ) : (
                <button disabled className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-300 text-sm">
                  LinkedIn (N/A)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
