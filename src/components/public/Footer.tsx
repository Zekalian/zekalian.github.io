import React from 'react';
import { Instagram, Linkedin, Mail, MessageCircle, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWhatsAppTracker } from '../../hooks/useWhatsAppTracker';
import { ZekalianLogo } from '../ZekalianLogo';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useApp();
  const { currentVariant, handleWhatsAppClick } = useWhatsAppTracker();

  const handleLink = (route: string) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dynamicMessage =
    currentVariant.default_message ||
    settings.whatsapp_prefilled_message ||
    'Halo Zekalian, saya ingin berkonsultasi mengenai proyek branding dan media.';
  const cleanWaNumber = settings.admin_whatsapp_number.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(dynamicMessage)}`;

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Brand & Physical Studio Info */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6">
            <ZekalianLogo />

            <p className="text-sm leading-relaxed text-slate-600 max-w-md">
              Your creative partner in building authentic brands, from initial concept to final execution. We combine cinematic visuals, distinctive identity systems, and tactical multimedia production to scale businesses.
            </p>

            <div className="flex items-start gap-3 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#005DDD] shrink-0 mt-0.5" />
              <span>{settings.studio_address || 'Pekanbaru — Payakumbuh, Indonesia'}</span>
            </div>

            {/* Circular Social Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Zekalian"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-transparent transition-all shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Zekalian"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#0077B5] hover:border-transparent transition-all shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Direct"
                id="footer-whatsapp-btn"
                onClick={() =>
                  handleWhatsAppClick({
                    placement: 'footer_cta',
                    customMessage: dynamicMessage,
                    variantId: currentVariant.id,
                    ctaText: currentVariant.short_label,
                  })
                }
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-emerald-500 hover:border-transparent transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Center Column: Fast Navigation */}
          <div className="md:col-span-3 lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => handleLink('/about')}
                  className="hover:text-[#005DDD] transition-colors"
                >
                  About Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/projects')}
                  className="hover:text-[#005DDD] transition-colors"
                >
                  Portfolio Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/services')}
                  className="hover:text-[#005DDD] transition-colors"
                >
                  Creative Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/articles')}
                  className="hover:text-[#005DDD] transition-colors"
                >
                  Insights & Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('/contact')}
                  className="inline-flex items-center gap-1 font-semibold text-[#005DDD] hover:underline"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Official Contact */}
          <div className="md:col-span-3 lg:col-span-4 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-900">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href={`mailto:${settings.official_email}`}
                className="flex items-center gap-2.5 text-slate-700 hover:text-[#005DDD] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#005DDD] shrink-0" />
                <span className="truncate">{settings.official_email}</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-slate-700 hover:text-emerald-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{settings.admin_whatsapp_number}</span>
              </a>
              <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Senin – Sabtu: 09:00 – 18:00 WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>Copyright &copy; 2026 Zekalian. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLink('/team')}
              className="hover:text-slate-900 transition-colors"
            >
              Creative Crew
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleLink('/contact')}
              className="hover:text-[#005DDD] font-medium transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
