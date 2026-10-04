import React from 'react';
import { useApp } from '../context/AppContext';

interface ZekalianLogoProps {
  variant?: 'color' | 'white' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ZekalianLogo: React.FC<ZekalianLogoProps> = ({ variant = 'color', className = '', size = 'md' }) => {
  const { settings } = useApp();
  const isWhite = variant === 'white';
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-9';
  const iconSize = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-base';

  const customFavicon = settings.favicon_url;
  const customLogo = isWhite ? (settings.logo_dark_url || settings.logo_light_url) : settings.logo_light_url;

  if (variant === 'icon') {
    if (customFavicon) {
      return (
        <img
          src={customFavicon}
          alt="Agency Favicon"
          className={`${iconSize} object-contain rounded-xl shadow-xs`}
        />
      );
    }
    // Dummy Icon Placeholder
    return (
      <div className={`${iconSize} rounded-xl ${isWhite ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} flex items-center justify-center font-black shadow-sm select-none tracking-tighter`}>
        {settings.agency_name ? settings.agency_name.charAt(0).toUpperCase() : 'Z'}
      </div>
    );
  }

  if (customLogo) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src={customLogo}
          alt={settings.agency_name || 'Agency Logo'}
          className={`${heightClass} w-auto object-contain transition-transform hover:scale-[1.02]`}
        />
      </div>
    );
  }

  // Dummy Logo Placeholder (Until user replaces via Admin Settings)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`${iconSize} rounded-xl ${isWhite ? 'bg-white text-slate-900' : 'bg-[#005DDD] text-white'} flex items-center justify-center font-black shadow-md shadow-[#005DDD]/20 tracking-tighter shrink-0`}>
        {settings.agency_name ? settings.agency_name.charAt(0).toUpperCase() : 'Z'}
      </div>
      <div className="flex flex-col">
        <span className={`font-extrabold ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'} tracking-tight ${isWhite ? 'text-white' : 'text-slate-900'} leading-none`}>
          {settings.agency_name || 'ZEKALIAN'}
        </span>
        <span className={`text-[10px] tracking-[0.2em] font-semibold ${isWhite ? 'text-slate-300' : 'text-slate-400'} mt-1 uppercase`}>
          CREATIVE AGENCY
        </span>
      </div>
    </div>
  );
};
