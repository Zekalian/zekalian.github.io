import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Calendar,
  ExternalLink,
  Plus,
  Receipt,
  FileText,
  Sparkles,
  Menu,
  Check,
  ZoomIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';

interface AdminTopBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onToggleSidebar?: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  currentRoute,
  onNavigate,
  onToggleSidebar,
}) => {
  const { currentUser } = useApp();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDensityOpen, setIsDensityOpen] = useState(false);
  const [density, setDensity] = useState<'auto' | 'compact' | 'normal' | 'large'>('auto');
  const densityRef = useRef<HTMLDivElement>(null);

  // Load density preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_density_mode') as 'auto' | 'compact' | 'normal' | 'large' | null;
      if (saved && ['auto', 'compact', 'normal', 'large'].includes(saved)) {
        setDensity(saved);
        applyDensity(saved);
      }
    } catch {}
  }, []);

  // Close density popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (densityRef.current && !densityRef.current.contains(e.target as Node)) {
        setIsDensityOpen(false);
      }
    };
    if (isDensityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDensityOpen]);

  const applyDensity = (mode: 'auto' | 'compact' | 'normal' | 'large') => {
    if (mode === 'auto') {
      document.documentElement.style.fontSize = '';
      document.documentElement.removeAttribute('data-admin-scale');
    } else if (mode === 'compact') {
      document.documentElement.style.fontSize = '86%';
      document.documentElement.setAttribute('data-admin-scale', 'compact');
    } else if (mode === 'normal') {
      document.documentElement.style.fontSize = '100%';
      document.documentElement.setAttribute('data-admin-scale', 'normal');
    } else if (mode === 'large') {
      document.documentElement.style.fontSize = '112%';
      document.documentElement.setAttribute('data-admin-scale', 'large');
    }
    try {
      localStorage.setItem('admin_density_mode', mode);
    } catch {}
  };

  const handleSelectDensity = (mode: 'auto' | 'compact' | 'normal' | 'large') => {
    setDensity(mode);
    applyDensity(mode);
    setIsDensityOpen(false);
  };

  // Derive page title for current route
  const getPageTitle = () => {
    switch (currentRoute) {
      case '/admin':
        return 'Ringkasan Dashboard';
      case '/admin/schedule':
        return 'Jadwal Produksi & Timeline';
      case '/admin/projects':
        return 'Portofolio Proyek';
      case '/admin/milestones':
        return 'Milestones Proyek & Progress Klien';
      case '/admin/articles':
        return 'Artikel & Wawasan';
      case '/admin/proposals':
        return 'Generator Proposal';
      case '/admin/invoices':
        return 'Generator & Arsip Invoice';
      case '/admin/briefs':
        return 'Project Brief Kreatif';
      case '/admin/shotlists':
        return 'Production Shot List';
      case '/admin/team':
        return 'Kru & Manajemen Tim';
      case '/admin/inquiries':
        return 'Kotak Masuk (Inquiries)';
      case '/admin/users':
        return 'Kelola User & Role (RBAC)';
      case '/admin/seo':
        return 'Pengaturan SEO & Meta Tags';
      case '/admin/settings':
        return 'Pengaturan Agensi';
      case '/admin/bug-reports':
        return 'Pelaporan Bug & Isu';
      default:
        return 'Panel Admin';
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Mobile Hamburger & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Buka Navigasi Admin"
            title="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#005DDD]">
                Zekalian Studio
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-semibold text-slate-400 capitalize">
                {currentUser?.role || 'Kru'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Search Command Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-xs text-slate-400 font-medium transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-slate-500">Cari modul, proyek, kru, invoice...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Side: Quick Action Icons & Notification Center */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Schedule Button */}
          <button
            type="button"
            onClick={() => onNavigate('/admin/schedule')}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentRoute === '/admin/schedule'
                ? 'bg-[#005DDD] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Jadwal & Timeline Produksi"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden xl:inline text-xs">Jadwal</span>
          </button>

          {/* Quick Search on mobile */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Cari"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          {/* In-App Notification Center */}
          <NotificationCenter onNavigate={onNavigate} />

          {/* Admin Display Density / Scale Switcher */}
          <div className="relative" ref={densityRef}>
            <button
              type="button"
              onClick={() => setIsDensityOpen(!isDensityOpen)}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Sesuaikan Kerapatan & Ukuran Tampilan Admin"
            >
              <span className="font-mono text-xs font-black text-[#005DDD]">aA</span>
              <span className="hidden xl:inline text-[11px] text-slate-500 font-medium">
                {density === 'compact' ? 'Kompak' : density === 'large' ? 'Besar' : density === 'normal' ? 'Standar' : 'Otomatis'}
              </span>
            </button>

            {isDensityOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 border-b border-slate-100 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Kerapatan Layar Admin
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sesuaikan ukuran tampilan agar pas di layar laptop Anda dan tidak menumpuk.
                  </p>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'auto', label: 'Otomatis Sesuai Layar', desc: 'Adaptif dari mobile sampai monitor' },
                    { id: 'compact', label: 'Kompak (Layar Laptop)', desc: 'Paling lega & padat, data muat banyak' },
                    { id: 'normal', label: 'Standar (100%)', desc: 'Ukuran default bawaan' },
                    { id: 'large', label: 'Besar & Nyaman', desc: 'Teks lebih besar dan mudah dibaca' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectDensity(opt.id as any)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        density === opt.id
                          ? 'bg-blue-50 text-[#005DDD] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal leading-tight">
                          {opt.desc}
                        </div>
                      </div>
                      {density === opt.id && <Check className="w-3.5 h-3.5 text-[#005DDD] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Public Website */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="p-2 rounded-xl text-slate-500 hover:text-[#005DDD] hover:bg-slate-100 transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold"
            title="Buka Website Publik"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Web Publik</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
