import React from 'react';
import { useApp } from '../context/AppContext';

export interface ZekalianLogoProps {
  variant?: 'color' | 'white' | 'icon' | 'left' | 'center' | 'wordmark-blue' | 'wordmark-white';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ZekalianLogo: React.FC<ZekalianLogoProps> = ({
  variant = 'color',
  className = '',
  size = 'md',
}) => {
  const { settings } = useApp();

  // Height sizing for responsive layouts
  const heightClass =
    size === 'sm'
      ? 'h-7 sm:h-8'
      : size === 'lg'
      ? 'h-11 sm:h-12'
      : size === 'xl'
      ? 'h-14 sm:h-16'
      : 'h-8 sm:h-9';

  const iconSize =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-12 h-12'
      : size === 'xl'
      ? 'w-16 h-16'
      : 'w-10 h-10';

  // 1. Icon / Favicon badge variant (Browser tab, collapsed sidebar, badges)
  if (variant === 'icon') {
    const faviconSrc = settings.favicon_url || '/assets/Favicon.png';
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={faviconSrc}
          alt={settings.agency_name || 'Zekalian Favicon'}
          className={`${iconSize} object-contain rounded-xl shadow-xs transition-transform duration-200 hover:scale-105`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/favicon.png';
          }}
        />
      </div>
    );
  }

  // 2. White Wordmark / Dark mode logo (Dark footer, dark banners, dark modals)
  if (variant === 'white' || variant === 'wordmark-white') {
    const whiteLogoSrc = settings.logo_dark_url || '/assets/logo-text-putih.png';
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={whiteLogoSrc}
          alt={settings.agency_name || 'Zekalian Logo'}
          className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/Logo Utama Rata Kiri.png';
          }}
        />
      </div>
    );
  }

  // 3. Centered Primary Logo (e.g. Login page hero, centered showcase)
  if (variant === 'center') {
    const centerLogoSrc = '/assets/Logo Utama.png';
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <img
          src={centerLogoSrc}
          alt={settings.agency_name || 'Zekalian Agency'}
          className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = settings.logo_light_url || '/assets/Logo Utama Rata Kiri.png';
          }}
        />
      </div>
    );
  }

  // 4. High-resolution Blue Wordmark variant
  if (variant === 'wordmark-blue') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/assets/logo-text-biru.png"
          alt={settings.agency_name || 'Zekalian'}
          className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/Logo Utama Rata Kiri.png';
          }}
        />
      </div>
    );
  }

  // 5. Default Primary / Left-aligned logo (Navbar, Footer, Admin, Client Portal)
  // Prefers user configured logo_light_url, with fallback to '/assets/Logo Utama Rata Kiri.png'
  const primaryLogoSrc = settings.logo_light_url || '/assets/Logo Utama Rata Kiri.png';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={primaryLogoSrc}
        alt={settings.agency_name || 'Zekalian Creative Agency'}
        className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/logo-text-biru.png';
        }}
      />
    </div>
  );
};
