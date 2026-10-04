import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/database';
import { ZekalianLogo } from '../ZekalianLogo';
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  FileText,
  Users,
  Image,
  MessageSquareQuote,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  UserCircle,
  Receipt,
  ClipboardList,
  Camera,
  Info,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Bug,
  Calendar,
  Clapperboard,
  X,
  Flag,
  TrendingUp,
  Bot,
} from 'lucide-react';

interface AdminSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const canAccessRoute = (role: UserRole, route: string): boolean => {
  if (
    route === '/admin/ai-assistant' ||
    route === '/admin/bug-reports' ||
    route === '/admin/schedule' ||
    route === '/admin/storyboard' ||
    route === '/admin/milestones' ||
    route === '/admin/analytics'
  )
    return true;
  if (role === 'super_admin' || role === 'programmer') return true;
  if (role === 'admin') {
    const superAdminOnly = ['/admin/homepage-content', '/admin/about-content', '/admin/seo', '/admin/settings'];
    return !superAdminOnly.includes(route);
  }
  if (role === 'finance') {
    const allowed = ['/admin', '/admin/analytics', '/admin/profile', '/admin/inquiries', '/admin/proposals', '/admin/invoices'];
    return allowed.includes(route);
  }
  if (role === 'producer') {
    const allowed = ['/admin', '/admin/analytics', '/admin/profile', '/admin/inquiries', '/admin/projects', '/admin/briefs', '/admin/shotlists', '/admin/storyboard'];
    return allowed.includes(route);
  }
  if (role === 'marketing') {
    const allowed = ['/admin', '/admin/analytics', '/admin/profile', '/admin/inquiries', '/admin/articles', '/admin/logos', '/admin/testimonials', '/admin/seo'];
    return allowed.includes(route);
  }
  if (role === 'editor') {
    const allowed = ['/admin', '/admin/analytics', '/admin/profile', '/admin/inquiries', '/admin/projects', '/admin/articles', '/admin/logos', '/admin/testimonials', '/admin/storyboard'];
    return allowed.includes(route);
  }
  if (role === 'analyst') {
    const allowed = ['/admin', '/admin/analytics', '/admin/profile', '/admin/inquiries'];
    return allowed.includes(route);
  }
  return false;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  onNavigate,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { currentUser, adminUsers, logout, switchRole } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizingRef = useRef(false);

  const handleNavClick = (route: string) => {
    onNavigate(route);
    onCloseMobile?.();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 210 && newWidth <= 380) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  if (!currentUser) return null;

  const pendingCount = adminUsers.filter(
    (u) => u.account_status === 'PENDING_APPROVAL' || u.role === 'pending'
  ).length;

  const roleColors: Record<UserRole, { bg: string; text: string; label: string }> = {
    super_admin: { bg: 'bg-[#005DDD]/10', text: 'text-[#005DDD]', label: 'Super Admin' },
    admin: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Admin' },
    programmer: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Programmer' },
    producer: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Producer' },
    finance: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Finance' },
    marketing: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Marketing' },
    editor: { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Editor' },
    analyst: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Analyst' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
  };

  const categories = [
    {
      title: 'Main',
      items: [
        { label: 'Ringkasan Dashboard', route: '/admin', icon: LayoutDashboard },
        { label: 'ZetAI Copilot', route: '/admin/ai-assistant', icon: Bot },
        { label: 'Analitik & SEO Traffic', route: '/admin/analytics', icon: TrendingUp },
        { label: 'Profil Saya', route: '/admin/profile', icon: UserCircle },
        { label: 'Kotak Masuk (Inquiries)', route: '/admin/inquiries', icon: Inbox },
      ],
    },
    {
      title: 'Content & Showcase',
      items: [
        { label: 'Portofolio Proyek', route: '/admin/projects', icon: FolderKanban },
        { label: 'Artikel & Wawasan', route: '/admin/articles', icon: FileText },
        { label: 'Logo Klien Showcase', route: '/admin/logos', icon: Image },
        { label: 'Testimoni Klien', route: '/admin/testimonials', icon: MessageSquareQuote },
        { label: 'Teks Halaman Utama', route: '/admin/homepage-content', icon: LayoutDashboard },
        { label: 'Teks Halaman Tentang', route: '/admin/about-content', icon: Info },
      ],
    },
    {
      title: 'Documents & Production',
      items: [
        { label: 'Milestones Proyek', route: '/admin/milestones', icon: Flag },
        { label: 'Jadwal Produksi (Calendar)', route: '/admin/schedule', icon: Calendar },
        { label: 'Moodboard & Storyboard', route: '/admin/storyboard', icon: Clapperboard },
        { label: 'Production Shot List', route: '/admin/shotlists', icon: Camera },
        { label: 'Project Brief', route: '/admin/briefs', icon: ClipboardList },
        { label: 'Generator Proposal', route: '/admin/proposals', icon: FileText },
        { label: 'Generator Invoice', route: '/admin/invoices', icon: Receipt },
      ],
    },
    {
      title: 'Agency & System',
      items: [
        { label: 'Tim & Kru Agensi', route: '/admin/team', icon: Users },
        { label: 'Pengaturan SEO & Metadata', route: '/admin/seo', icon: Globe },
        { label: 'Pengaturan Kontak Agensi', route: '/admin/settings', icon: Settings },
        { label: 'Kelola User & Role (RBAC)', route: '/admin/users', icon: ShieldAlert },
      ],
    },
    {
      title: 'System & Support',
      items: [
        { label: 'Pelaporan Bug & Isu', route: '/admin/bug-reports', icon: Bug },
      ],
      isSystemSupport: true,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{ width: isCollapsed ? '76px' : `${sidebarWidth}px` }}
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
          bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen
          transition-transform lg:transition-all duration-200 pb-6
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          {/* Header Branding & Collapse Toggle */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            {!isCollapsed ? (
              <button
                onClick={() => handleNavClick('/')}
                className="text-left group focus:outline-none min-w-0 flex-1 truncate pr-2 cursor-pointer"
              >
                <ZekalianLogo size="sm" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#005DDD] mt-1 block">
                  Studio Workspace
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/')}
                className="mx-auto text-center font-black text-[#005DDD] text-lg cursor-pointer"
                title="Zekalian Agency"
              >
                Z
              </button>
            )}

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Tutup Menu Navigasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Current User Card & RBAC Switcher */}
        {!isCollapsed ? (
          <div className="p-3 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Active User
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  roleColors[currentUser.role].bg
                } ${roleColors[currentUser.role].text}`}
              >
                {roleColors[currentUser.role].label}
              </span>
            </div>

            <div
              onClick={() => onNavigate('/admin/profile')}
              className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-200/50 cursor-pointer transition-colors group mb-2"
              title="Click to view My Profile"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>
                    {currentUser.full_name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#005DDD] transition-colors">
                  {currentUser.full_name}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/profile')}
              className="w-full py-1.5 px-2.5 mb-2 rounded-lg bg-white border border-slate-200 hover:border-[#005DDD] text-[#005DDD] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCircle className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {/* Role Switcher */}
            {(currentUser.email === 'zakikey.works@gmail.com' || currentUser.email === 'admin@zekalian.web.id') && (
              <div className="pt-2 border-t border-slate-200/80 mt-2">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Role Switcher:
                </label>
                <select
                  value={currentUser.role}
                  onChange={(e) => switchRole(e.target.value as UserRole)}
                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#005DDD]"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="programmer">Programmer</option>
                  <option value="producer">Producer</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="editor">Editor</option>
                  <option value="analyst">Analyst</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center">
            <div
              onClick={() => onNavigate('/admin/profile')}
              className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-slate-200 shadow-sm"
              title={`${currentUser.full_name} (${roleColors[currentUser.role].label})`}
            >
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>
                  {currentUser.full_name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation List by Categories */}
        <nav className={`px-2.5 pb-6 ${isCollapsed ? 'space-y-3' : 'space-y-4'}`}>
          {categories.map((cat, catIdx) => (
            <div key={catIdx}>
              {!isCollapsed ? (
                <div className="px-3 pb-1.5 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  {cat.title}
                </div>
              ) : (
                <div className="my-1 border-t border-slate-100 mx-1"></div>
              )}
              <div className="space-y-1">
                {cat.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;
                  const isLocked = !canAccessRoute(currentUser.role, item.route);

                  return (
                    <button
                      key={item.route}
                      onClick={() => handleNavClick(item.route)}
                      title={`${item.label}${isLocked ? ' (Locked)' : ''}`}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                      } rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-[#005DDD] text-white shadow-sm'
                          : isLocked
                          ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0 flex-1 mr-2'}`}>
                        <div className="relative">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {isCollapsed && isLocked && (
                            <span className="absolute -top-1 -right-1.5 w-3 h-3 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-bold shadow-2xs">
                              🔒
                            </span>
                          )}
                        </div>
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.route === '/admin/users' && pendingCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-2xs">
                              {pendingCount}
                            </span>
                          )}
                          {isLocked && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              Locked
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {cat.isSystemSupport && (
                  <div className="space-y-1.5 pt-2 mt-2 border-t border-slate-100">
                    {!isCollapsed && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-[10px] text-emerald-800 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Google Firestore</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-emerald-600">Connected</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleNavClick('/')}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 py-2 px-3'} rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer`}
                      title="View Public Site"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {!isCollapsed && <span>View Public Site</span>}
                    </button>

                    <button
                      onClick={logout}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 py-2 px-3'} rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer`}
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      {!isCollapsed && <span>Logout</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Resize Handle (Right Border) */}
      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#005DDD]/40 transition-colors z-10"
          title="Drag to resize sidebar width"
        />
      )}
    </aside>
    </>
  );
};
