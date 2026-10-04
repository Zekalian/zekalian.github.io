import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types/database';
import { Instagram, Linkedin, ArrowUpRight } from 'lucide-react';
import { CrewModal } from '../../components/public/CrewModal';

interface TeamPageProps {
  onNavigate?: (route: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigate }) => {
  const { teamMembers } = useApp();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const sortedTeam = [...teamMembers].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <span>Creative Force</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          Tim Inti &amp; Kru Kreatif Zekalian
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#334155] leading-relaxed">
          Kolektif profesional multimedia, pengarah kreatif, dan visualis berdedikasi yang mendedikasikan presisi pada setiap bingkai karya.
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {sortedTeam.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#005DDD]/40 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#005DDD] to-[#018EE3] text-white font-extrabold text-5xl">
                  {member.initials}
                </div>
              )}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <ArrowUpRight className="w-4 h-4 text-[#005DDD]" />
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#005DDD] block mb-1">
                  {member.default_role}
                </span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors">
                  {member.full_name}
                </h3>
                {member.bio && (
                  <p className="mt-3 text-xs leading-relaxed text-[#334155] line-clamp-3">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-500">
                  Lihat Profil Lengkap
                </span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {member.instagram_url && (
                    <a
                      href={member.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-pink-600 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-[#0077B5] transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Crew Modal */}
      <CrewModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
