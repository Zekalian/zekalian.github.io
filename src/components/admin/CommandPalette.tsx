import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
  Receipt,
  ClipboardList,
  Camera,
  Calendar,
  Bug,
  Globe,
  Inbox,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { projects, articles, adminUsers } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle global Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Base navigation pages
  const staticNavigation = [
    { id: 'nav-dash', title: 'Ringkasan Dashboard', category: 'Navigasi Admin', route: '/admin', icon: LayoutDashboard },
    { id: 'nav-schedule', title: 'Jadwal Produksi & Timeline (Calendar)', category: 'Navigasi Admin', route: '/admin/schedule', icon: Calendar },
    { id: 'nav-inbox', title: 'Kotak Masuk (Inquiries Klien)', category: 'Navigasi Admin', route: '/admin/inquiries', icon: Inbox },
    { id: 'nav-projects', title: 'Portofolio Proyek & Studi Kasus', category: 'Navigasi Admin', route: '/admin/projects', icon: FolderKanban },
    { id: 'nav-shotlists', title: 'Production Shot List & Storyboard', category: 'Navigasi Admin', route: '/admin/shotlists', icon: Camera },
    { id: 'nav-briefs', title: 'Project Brief Kreatif', category: 'Navigasi Admin', route: '/admin/briefs', icon: ClipboardList },
    { id: 'nav-invoices', title: 'Generator & Arsip Invoice', category: 'Navigasi Admin', route: '/admin/invoices', icon: Receipt },
    { id: 'nav-proposals', title: 'Generator Proposal Penawaran', category: 'Navigasi Admin', route: '/admin/proposals', icon: FileText },
    { id: 'nav-articles', title: 'Artikel & Wawasan Jurnal', category: 'Navigasi Admin', route: '/admin/articles', icon: FileText },
    { id: 'nav-team', title: 'Kru & Manajemen Tim', category: 'Navigasi Admin', route: '/admin/team', icon: Users },
    { id: 'nav-users', title: 'Kelola Akun & Role (RBAC)', category: 'Navigasi Admin', route: '/admin/users', icon: Settings },
    { id: 'nav-seo', title: 'Pengaturan SEO & Meta Tags', category: 'Navigasi Admin', route: '/admin/seo', icon: Globe },
    { id: 'nav-bugs', title: 'Pelaporan Bug & Isu Sistem', category: 'Navigasi Admin', route: '/admin/bug-reports', icon: Bug },
    { id: 'nav-public', title: 'Lihat Situs Publik Zekalian', category: 'Tautan Cepat', route: '/', icon: Globe },
  ];

  // Projects dynamic search
  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    title: `${p.title} — ${p.client_name || 'Project'}`,
    category: 'Proyek / Portofolio',
    route: `/projects/${p.slug}`,
    icon: FolderKanban,
  }));

  // Articles dynamic search
  const articleItems = articles.map((a) => ({
    id: `art-${a.id}`,
    title: a.title,
    category: 'Artikel / Journal',
    route: `/articles/${a.slug}`,
    icon: FileText,
  }));

  // Users dynamic search
  const userItems = adminUsers.map((u) => ({
    id: `usr-${u.id}`,
    title: `${u.full_name} (@${u.username}) — ${u.role}`,
    category: 'Kru / Anggota Tim',
    route: '/admin/team',
    icon: Users,
  }));

  const allItems = [...staticNavigation, ...projectItems, ...articleItems, ...userItems];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.route.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  const handleSelect = (route: string) => {
    onNavigate(route);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].route);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari modul, proyek, artikel, invoice, kru... (Tekan panah atau enter)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">Tidak ada hasil untuk "{query}"</p>
              <p className="text-[11px] text-slate-400 mt-1">Coba kata kunci lain atau buka modul dari sidebar</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.route)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-[#005DDD] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{item.title}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.route}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↓</kbd> Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↵</kbd> Buka
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#005DDD] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zekalian Quick Launcher</span>
          </div>
        </div>
      </div>
    </div>
  );
};
