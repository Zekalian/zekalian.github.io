import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZekalianLogo } from '../ZekalianLogo';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useApp();

  const navLinks = [
    { label: lang === 'id' ? 'Beranda' : 'Home', route: '/' },
    { label: lang === 'id' ? 'Tentang' : 'About', route: '/about' },
    { label: lang === 'id' ? 'Portofolio' : 'Projects', route: '/projects' },
    { label: lang === 'id' ? 'Layanan' : 'Services', route: '/services' },
    { label: lang === 'id' ? 'Wawasan' : 'Articles', route: '/articles' },
    { label: lang === 'id' ? 'Kontak' : 'Contact', route: '/contact' },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-left group focus:outline-none"
        >
          <ZekalianLogo />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`text-sm tracking-tight transition-colors relative py-1 ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-600 hover:text-[#005DDD] font-medium'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005DDD] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            title="Ganti Bahasa / Switch Language"
          >
            <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
          </button>

          <button
            onClick={() => handleNavClick('/contact')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{lang === 'id' ? 'Mulai Proyek' : 'Start a Project'}</span>
            <ArrowUpRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 uppercase"
          >
            {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-[#005DDD] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNavClick('/contact')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0F172A] text-white text-base font-semibold shadow-md"
            >
              <span>{lang === 'id' ? 'Mulai Proyek' : 'Start a Project'}</span>
              <ArrowUpRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
