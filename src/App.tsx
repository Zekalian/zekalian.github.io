import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { Toast } from './components/public/Toast';
import { FloatingWhatsApp } from './components/public/FloatingWhatsApp';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { TeamPage } from './pages/public/TeamPage';
import { ArticlesPage } from './pages/public/ArticlesPage';
import { ArticleDetailPage } from './pages/public/ArticleDetailPage';
import { ContactPage } from './pages/public/ContactPage';

// Admin Components & Lazy-Loaded Pages
import { AdminSidebar, canAccessRoute } from './components/admin/AdminSidebar';
import { AdminTopBar } from './components/admin/AdminTopBar';
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminHomepageContentPage = lazy(() => import('./pages/admin/AdminHomepageContentPage').then(m => ({ default: m.AdminHomepageContentPage })));
const AdminAboutContentPage = lazy(() => import('./pages/admin/AdminAboutContentPage').then(m => ({ default: m.AdminAboutContentPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminLogosPage = lazy(() => import('./pages/admin/AdminLogosPage').then(m => ({ default: m.AdminLogosPage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage').then(m => ({ default: m.AdminProjectsPage })));
const AdminMilestonesPage = lazy(() => import('./pages/admin/AdminMilestonesPage').then(m => ({ default: m.AdminMilestonesPage })));
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage').then(m => ({ default: m.AdminTeamPage })));
const AdminArticlesPage = lazy(() => import('./pages/admin/AdminArticlesPage').then(m => ({ default: m.AdminArticlesPage })));
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage').then(m => ({ default: m.AdminTestimonialsPage })));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage').then(m => ({ default: m.AdminInquiriesPage })));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage').then(m => ({ default: m.AdminProfilePage })));
const AdminProposalsPage = lazy(() => import('./pages/admin/AdminProposalsPage').then(m => ({ default: m.AdminProposalsPage })));
const AdminInvoicesPage = lazy(() => import('./pages/admin/AdminInvoicesPage').then(m => ({ default: m.AdminInvoicesPage })));
const AdminBriefsPage = lazy(() => import('./pages/admin/AdminBriefsPage').then(m => ({ default: m.AdminBriefsPage })));
const AdminShotlistsPage = lazy(() => import('./pages/admin/AdminShotlistsPage').then(m => ({ default: m.AdminShotlistsPage })));
const AdminSchedulePage = lazy(() => import('./pages/admin/AdminSchedulePage').then(m => ({ default: m.AdminSchedulePage })));
const AccessRequestPendingPage = lazy(() => import('./pages/admin/AccessRequestPendingPage').then(m => ({ default: m.AccessRequestPendingPage })));
const AdminSeoPage = lazy(() => import('./pages/admin/AdminSeoPage').then(m => ({ default: m.AdminSeoPage })));
const AdminBugReportsPage = lazy(() => import('./pages/admin/AdminBugReportsPage').then(m => ({ default: m.AdminBugReportsPage })));
const AdminStoryboardPage = lazy(() => import('./pages/admin/AdminStoryboardPage').then(m => ({ default: m.AdminStoryboardPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminAiChatPage = lazy(() => import('./pages/admin/AdminAiChatPage').then(m => ({ default: m.AdminAiChatPage })));
import { AdminFloatingChatWidget } from './components/admin/AdminFloatingChatWidget';
import { usePageSEO } from './hooks/usePageSEO';
import { createPageViewPayload } from './utils/analytics';

const getResolvedRoute = (): string => {
  if (typeof window === 'undefined') return '/';

  // 1. Check search parameter ?p= from GitHub Pages SPA redirection
  const searchParams = new URLSearchParams(window.location.search);
  const pParam = searchParams.get('p') || searchParams.get('path') || searchParams.get('route');
  if (pParam) {
    const cleanPath = pParam.startsWith('/') ? pParam : `/${pParam}`;
    // Restore clean address bar without query param
    const cleanUrl = cleanPath + (window.location.hash || '');
    window.history.replaceState(null, '', cleanUrl);
    return cleanPath;
  }

  // 2. Check hash route e.g. #/admin or #admin
  if (window.location.hash && window.location.hash !== '#') {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    if (rawHash) {
      const cleanPath = `/${rawHash}`;
      return cleanPath;
    }
  }

  // 3. Standard pathname e.g. /admin
  return window.location.pathname || '/';
};

const AppContent: React.FC = () => {
  const { currentUser, projects, articles, recordPageView } = useApp();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return getResolvedRoute();
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Keep route in sync with browser back / forward and hashchange
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getResolvedRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    // Clean up any previously stored manual scale to ensure 100% pure automatic responsive scaling
    try {
      localStorage.removeItem('zekalian_font_scale_val');
      localStorage.removeItem('zekalian_font_scale_mode');
      localStorage.removeItem('zekalian_font_scale');
      document.documentElement.style.fontSize = '';
      document.documentElement.removeAttribute('data-manual-scale');
      document.documentElement.removeAttribute('data-font-scale');
    } catch {}

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Dynamic SEO metadata computation
  let pageTitle = 'Zekalian — Authentic Branding & Media Creative Production';
  let pageDesc =
    'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.';
  let pageImage = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=85';

  if (currentRoute === '/projects') {
    pageTitle = 'Portofolio & Studi Kasus';
    pageDesc = 'Jelajahi studi kasus komersial, kampanye visual, dan video sinematik yang telah kami kerjakan untuk brand terkemuka.';
  } else if (currentRoute.startsWith('/projects/')) {
    const slug = currentRoute.replace('/projects/', '');
    const proj = projects.find((p) => p.slug === slug);
    if (proj) {
      pageTitle = `${proj.title} | Studi Kasus ${proj.client_name}`;
      pageDesc = proj.description?.slice(0, 160) || pageDesc;
      pageImage = proj.media?.[0]?.image_url || pageImage;
    }
  } else if (currentRoute === '/articles') {
    pageTitle = 'Wawasan & Opini Industri Kreatif';
    pageDesc = 'Refleksi mendalam, panduan produksi videografi, dan strategi narasi visual dari studio Zekalian.';
  } else if (currentRoute.startsWith('/articles/')) {
    const slug = currentRoute.replace('/articles/', '');
    const art = articles.find((a) => a.slug === slug);
    if (art) {
      pageTitle = `${art.title} | Zekalian Journal`;
      pageDesc = art.excerpt || pageDesc;
      pageImage = art.cover_image_url || pageImage;
    }
  } else if (currentRoute === '/about') {
    pageTitle = 'Tentang Zekalian — Cerita, Visi & Filosofi Kreatif';
    pageDesc = 'Mengenal perjalanan Zekalian dalam membangun narasi visual autentik yang berkarakter dan berdampak.';
  } else if (currentRoute === '/services') {
    pageTitle = 'Layanan & Kapabilitas Produksi';
    pageDesc = 'Layanan menyeluruh meliputi Branding, Cinematic Commercial Video, Social Campaign, hingga Production Stills.';
  } else if (currentRoute === '/team') {
    pageTitle = 'Kru & Tim Kreatif';
    pageDesc = 'Kenali sutradara, sinematografer, desainer, dan tim produksi di balik visual karya Zekalian.';
  } else if (currentRoute === '/contact') {
    pageTitle = 'Hubungi & Mulai Kolaborasi Proyek';
    pageDesc = 'Konsultasikan ide kampanye, jadwal syuting, atau tanyakan estimasi anggaran proyek bersama tim Zekalian.';
  } else if (currentRoute.startsWith('/admin')) {
    pageTitle = 'Portal Admin Zekalian';
    pageDesc = 'Zekalian Agency Workspace';
  }

  usePageSEO({
    title: pageTitle,
    description: pageDesc,
    image: pageImage,
  });

  // Track Google Analytics and Internal SEO Telemetry page_view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: currentRoute,
          page_title: document.title,
        });
      }
      if (!currentRoute.startsWith('/admin')) {
        const payload = createPageViewPayload(currentRoute, pageTitle);
        recordPageView(payload);
      }
    }
  }, [currentRoute, pageTitle]);

  const navigate = (to: string) => {
    if (to !== currentRoute) {
      window.history.pushState({}, '', to);
      setCurrentRoute(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAdminRoute = currentRoute.startsWith('/admin');
  const isLoginPage = currentRoute === '/admin/login';

  // Render Public or Admin Views
  const renderPublicView = () => {
    if (currentRoute === '/' || currentRoute === '') {
      return <HomePage onNavigate={navigate} />;
    }
    if (currentRoute === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (currentRoute === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }
    if (currentRoute === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('/projects/')) {
      const slug = currentRoute.replace('/projects/', '');
      return <ProjectDetailPage slug={slug} onNavigate={navigate} />;
    }
    if (currentRoute === '/team') {
      return <TeamPage onNavigate={navigate} />;
    }
    if (currentRoute === '/articles') {
      return <ArticlesPage onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('/articles/')) {
      const slug = currentRoute.replace('/articles/', '');
      return <ArticleDetailPage slug={slug} onNavigate={navigate} />;
    }
    if (currentRoute === '/contact') {
      return <ContactPage />;
    }

    // Default 404 fallback to Home
    return <HomePage onNavigate={navigate} />;
  };

  const renderAdminView = () => {
    if (isLoginPage || !currentUser) {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen w-screen bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#005DDD] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memuat Login Admin...</span>
            </div>
          </div>
        }>
          <AdminLoginPage onNavigate={navigate} />
        </Suspense>
      );
    }

    // Access approval gate for non-approved users
    const isOwner = currentUser.email === 'zakikey.works@gmail.com' || currentUser.email === 'admin@zekalian.web.id';
    if (!isOwner && currentUser.account_status !== 'APPROVED') {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen w-screen bg-[#F8FAFC]">
            <div className="w-8 h-8 border-4 border-[#005DDD] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AccessRequestPendingPage onNavigate={navigate} />
        </Suspense>
      );
    }

    let adminComponent = <AdminDashboardPage onNavigate={navigate} />;

    switch (currentRoute) {
      case '/admin':
        adminComponent = <AdminDashboardPage onNavigate={navigate} />;
        break;
      case '/admin/profile':
        adminComponent = <AdminProfilePage onNavigate={navigate} />;
        break;
      case '/admin/projects':
        adminComponent = <AdminProjectsPage onNavigate={navigate} />;
        break;
      case '/admin/milestones':
        adminComponent = <AdminMilestonesPage onNavigate={navigate} />;
        break;
      case '/admin/articles':
        adminComponent = <AdminArticlesPage />;
        break;
      case '/admin/team':
        adminComponent = <AdminTeamPage />;
        break;
      case '/admin/logos':
        adminComponent = <AdminLogosPage />;
        break;
      case '/admin/testimonials':
        adminComponent = <AdminTestimonialsPage />;
        break;
      case '/admin/settings':
        adminComponent = <AdminSettingsPage />;
        break;
      case '/admin/seo':
        adminComponent = <AdminSeoPage />;
        break;
      case '/admin/analytics':
        adminComponent = <AdminAnalyticsPage onNavigate={navigate} />;
        break;
      case '/admin/ai-assistant':
        adminComponent = <AdminAiChatPage />;
        break;
      case '/admin/homepage-content':
        adminComponent = <AdminHomepageContentPage />;
        break;
      case '/admin/about-content':
        adminComponent = <AdminAboutContentPage />;
        break;
      case '/admin/users':
        adminComponent = <AdminUsersPage />;
        break;
      case '/admin/inquiries':
        adminComponent = <AdminInquiriesPage />;
        break;
      case '/admin/proposals':
        adminComponent = <AdminProposalsPage />;
        break;
      case '/admin/invoices':
        adminComponent = <AdminInvoicesPage />;
        break;
      case '/admin/briefs':
        adminComponent = <AdminBriefsPage />;
        break;
      case '/admin/shotlists':
        adminComponent = <AdminShotlistsPage />;
        break;
      case '/admin/storyboard':
        adminComponent = <AdminStoryboardPage />;
        break;
      case '/admin/schedule':
        adminComponent = <AdminSchedulePage />;
        break;
      case '/admin/bug-reports':
        adminComponent = <AdminBugReportsPage />;
        break;
      default:
        adminComponent = <AdminDashboardPage onNavigate={navigate} />;
        break;
    }

    if (!canAccessRoute(currentUser.role, currentRoute)) {
      adminComponent = (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold shadow-xs border border-amber-100 mx-auto">
            🔒
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Akses Modul Dibatasi (RBAC)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Peran Anda saat ini (<strong className="capitalize text-slate-800">{currentUser.role}</strong>) tidak memiliki izin untuk mengakses modul ini. Silakan hubungi Super Admin untuk penyesuaian hak akses divisi.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#004bb5] transition-all cursor-pointer"
          >
            Kembali ke Ringkasan Dashboard
          </button>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-full bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#005DDD] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memuat Halaman...</span>
          </div>
        </div>
      }>
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <AdminSidebar
            currentRoute={currentRoute}
            onNavigate={navigate}
            mobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
            <AdminTopBar
              currentRoute={currentRoute}
              onNavigate={navigate}
              onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
            />
            <main className="flex-1 overflow-y-auto">
              {adminComponent}
            </main>
          </div>
          <AdminFloatingChatWidget onNavigate={navigate} currentRoute={currentRoute} />
        </div>
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-[#005DDD] selection:text-white flex flex-col justify-between">
      {isAdminRoute ? (
        renderAdminView()
      ) : (
        <>
          <Navbar currentRoute={currentRoute} onNavigate={navigate} />
          <main className="flex-1">{renderPublicView()}</main>
          <Footer onNavigate={navigate} />
          <FloatingWhatsApp />
        </>
      )}

      {/* Global Toast Stack */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
