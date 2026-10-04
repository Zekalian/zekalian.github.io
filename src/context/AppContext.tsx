import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AgencySettings,
  Category,
  ClientLogo,
  TeamMember,
  Project,
  Article,
  Testimonial,
  Inquiry,
  AdminUser,
  UserRole,
  BugReport,
  WhatsAppClickLog,
  WhatsAppImpressionLog,
  WhatsAppSplitVariantId,
  PageViewEvent,
  ShareEvent,
} from '../types/database';
import { getVisitorTelemetry } from '../utils/analytics';
import {
  INITIAL_AGENCY_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_CLIENT_LOGOS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_ARTICLES,
  INITIAL_TESTIMONIALS,
  INITIAL_INQUIRIES,
  INITIAL_ADMIN_USERS,
  INITIAL_BUG_REPORTS,
  INITIAL_PAGE_VIEWS,
  INITIAL_SHARE_EVENTS,
} from '../data/initialData';
import {
  db,
  auth,
  googleProvider,
  testConnection,
  handleFirestoreError,
  OperationType,
  safeSetDoc,
  removeUndefinedFields,
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Public & Content Data
  settings: AgencySettings;
  categories: Category[];
  clientLogos: ClientLogo[];
  teamMembers: TeamMember[];
  projects: Project[];
  articles: Article[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  adminUsers: AdminUser[];
  bugReports: BugReport[];
  whatsappClicks: WhatsAppClickLog[];
  whatsappImpressions: WhatsAppImpressionLog[];
  pageViews: PageViewEvent[];
  shareEvents: ShareEvent[];
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;

  // Database Connection Status
  isFirestoreConnected: boolean;

  // Auth State
  currentUser: AdminUser | null;
  firebaseAuthUser: FirebaseUser | null;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;

  // Lead attribution & WhatsApp & Analytics telemetry
  recordWhatsAppClick: (clickData: WhatsAppClickLog) => Promise<void>;
  recordWhatsAppImpression: (variantId: WhatsAppSplitVariantId, path: string) => Promise<void>;
  recordPageView: (view: PageViewEvent) => Promise<void>;
  recordShareEvent: (event: ShareEvent) => Promise<void>;
  archiveOutgoingWhatsAppMessage?: (data: any) => Promise<void>;

  // CRUD actions with RBAC checks
  updateSettings: (newSettings: Partial<AgencySettings>) => boolean;
  saveClientLogo: (logo: Partial<ClientLogo> & { id?: string }) => boolean;
  deleteClientLogo: (id: string) => boolean;
  saveProject: (project: Partial<Project> & { id?: string }) => boolean;
  deleteProject: (id: string) => boolean;
  saveTeamMember: (member: Partial<TeamMember> & { id?: string }) => boolean;
  deleteTeamMember: (id: string) => boolean;
  saveArticle: (article: Partial<Article> & { id?: string }) => boolean;
  deleteArticle: (id: string) => boolean;
  saveTestimonial: (testi: Partial<Testimonial> & { id?: string }) => boolean;
  deleteTestimonial: (id: string) => boolean;
  submitInquiry: (name: string, email: string, project_vision: string) => Promise<{ success: boolean; error?: string }>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => boolean;
  createAdminUser: (userData: Omit<AdminUser, 'id' | 'created_at'>) => boolean;
  updateUserProfile: (userId: string, data: Partial<AdminUser>) => boolean;
  deleteAdminUser: (userId: string) => boolean;
  saveBugReport: (bug: Partial<BugReport> & { id?: string }) => boolean;
  deleteBugReport: (id: string) => boolean;

  // Access request & verification methods
  submitAccessRequest: (data: {
    full_name: string;
    request_department: string;
    requested_role: UserRole;
    request_reason: string;
  }) => Promise<boolean>;
  approveUserAccess: (userId: string, assignedRole: UserRole) => Promise<boolean>;
  rejectUserAccess: (userId: string, reason?: string) => Promise<boolean>;
  refreshCurrentUser: () => Promise<void>;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'zekalian_settings_v2',
  LOGOS: 'zekalian_logos_v3',
  CATEGORIES: 'zekalian_categories_v2',
  TEAM: 'zekalian_team_v3',
  PROJECTS: 'zekalian_projects_v3',
  ARTICLES: 'zekalian_articles_v3',
  TESTIMONIALS: 'zekalian_testimonials_v3',
  INQUIRIES: 'zekalian_inquiries_v3',
  ADMINS: 'zekalian_admins_v2',
  BUG_REPORTS: 'zekalian_bug_reports_v3',
  CURRENT_USER: 'zekalian_current_user_v2',
  WA_CLICKS: 'zekalian_wa_clicks_v2',
  WA_IMPRESSIONS: 'zekalian_wa_impressions_v2',
  PAGE_VIEWS: 'zekalian_page_views_v1',
  SHARE_EVENTS: 'zekalian_share_events_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AgencySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_AGENCY_SETTINGS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGOS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_LOGOS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMINS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [bugReports, setBugReports] = useState<BugReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUG_REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_BUG_REPORTS;
  });

  const [whatsappClicks, setWhatsappClicks] = useState<WhatsAppClickLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WA_CLICKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [whatsappImpressions, setWhatsappImpressions] = useState<WhatsAppImpressionLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WA_IMPRESSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [pageViews, setPageViews] = useState<PageViewEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS);
    return saved ? JSON.parse(saved) : INITIAL_PAGE_VIEWS;
  });

  const [shareEvents, setShareEvents] = useState<ShareEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHARE_EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_SHARE_EVENTS;
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local cache for instant zero-latency renders
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGOS, JSON.stringify(clientLogos));
  }, [clientLogos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify(pageViews.slice(0, 150)));
  }, [pageViews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHARE_EVENTS, JSON.stringify(shareEvents.slice(0, 150)));
  }, [shareEvents]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Boot & Test connection to Firestore with graceful offline handling
  useEffect(() => {
    testConnection()
      .then((connected) => {
        setIsFirestoreConnected(connected);
      })
      .catch(() => {
        setIsFirestoreConnected(false);
      });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        // Find or create user in adminUsers
        const userEmail = fbUser.email?.toLowerCase() || '';
        const userDocRef = doc(db, 'users', fbUser.uid);

        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as AdminUser;
            setCurrentUser(data);
          } else {
            // Determine initial role: owner email gets super_admin
            const isOwner = userEmail === 'zakikey.works@gmail.com';
            const newUser: AdminUser = {
              id: fbUser.uid,
              username: (fbUser.displayName || 'admin')
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, ''),
              email: userEmail,
              full_name: fbUser.displayName || 'Google User',
              role: isOwner ? 'super_admin' : 'editor',
              avatar_url: fbUser.photoURL || '',
              whatsapp: '',
              linkedin: '',
              created_at: new Date().toISOString(),
            };

            await safeSetDoc(userDocRef, newUser);
            setCurrentUser(newUser);
            setAdminUsers((prev) => {
              if (prev.some((u) => u.id === newUser.id)) return prev;
              return [...prev, newUser];
            });
          }
        } catch (err) {
          console.warn('Could not sync user profile with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Sync & Initial Seeding
  useEffect(() => {
    // 1. Projects
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        if (!snap.empty) {
          const loaded: Project[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Project, 'id'>) });
          });
          setProjects(loaded);
        } else {
          // Auto-seed initial projects into Firestore
          INITIAL_PROJECTS.forEach(async (p) => {
            try {
              await safeSetDoc(doc(db, 'projects', p.id), p);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore projects listener:', error.message);
        }
      }
    );

    // 2. Articles
    const unsubArticles = onSnapshot(
      collection(db, 'articles'),
      (snap) => {
        if (!snap.empty) {
          const loaded: Article[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Article, 'id'>) });
          });
          setArticles(loaded);
        } else {
          INITIAL_ARTICLES.forEach(async (a) => {
            try {
              await safeSetDoc(doc(db, 'articles', a.id), a);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore articles listener:', error.message);
        }
      }
    );

    // 3. Agency Members (Team)
    const unsubTeam = onSnapshot(
      collection(db, 'agency_members'),
      (snap) => {
        if (!snap.empty) {
          const loaded: TeamMember[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<TeamMember, 'id'>) });
          });
          setTeamMembers(loaded);
        } else {
          INITIAL_TEAM_MEMBERS.forEach(async (m) => {
            try {
              await safeSetDoc(doc(db, 'agency_members', m.id), m);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore agency_members listener:', error.message);
        }
      }
    );

    // 4. Client Logos
    const unsubLogos = onSnapshot(
      collection(db, 'client_logos'),
      (snap) => {
        if (!snap.empty) {
          const loaded: ClientLogo[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<ClientLogo, 'id'>) });
          });
          setClientLogos(loaded);
        } else {
          INITIAL_CLIENT_LOGOS.forEach(async (l) => {
            try {
              await safeSetDoc(doc(db, 'client_logos', l.id), l);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore client_logos listener:', error.message);
        }
      }
    );

    // 5. Testimonials
    const unsubTesti = onSnapshot(
      collection(db, 'testimonials'),
      (snap) => {
        if (!snap.empty) {
          const loaded: Testimonial[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Testimonial, 'id'>) });
          });
          setTestimonials(loaded);
        } else {
          INITIAL_TESTIMONIALS.forEach(async (t) => {
            try {
              await safeSetDoc(doc(db, 'testimonials', t.id), t);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore testimonials listener:', error.message);
        }
      }
    );

    // 6. Agency Settings (Document: default)
    const unsubSettings = onSnapshot(
      doc(db, 'agency_settings', 'default'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AgencySettings);
        } else {
          // seed settings
          safeSetDoc(doc(db, 'agency_settings', 'default'), INITIAL_AGENCY_SETTINGS).catch(() => {});
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore settings listener:', error.message);
        }
      }
    );

    // 7. Inquiries
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snap) => {
        if (!snap.empty) {
          const loaded: Inquiry[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Inquiry, 'id'>) });
          });
          setInquiries(loaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
          INITIAL_INQUIRIES.forEach(async (inq) => {
            try {
              await safeSetDoc(doc(db, 'inquiries', inq.id), inq);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore inquiries listener:', error.message);
        }
      }
    );

    // 8. Users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        if (!snap.empty) {
          const loaded: AdminUser[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<AdminUser, 'id'>) });
          });
          setAdminUsers(loaded);
        } else {
          INITIAL_ADMIN_USERS.forEach(async (u) => {
            try {
              await safeSetDoc(doc(db, 'users', u.id), u);
            } catch (e) {
              // silent seed
            }
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore users listener:', error.message);
        }
      }
    );

    // 9. Page Views
    const unsubPageViews = onSnapshot(
      collection(db, 'page_views'),
      (snap) => {
        if (!snap.empty) {
          const loaded: PageViewEvent[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<PageViewEvent, 'id'>) });
          });
          setPageViews(loaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
          INITIAL_PAGE_VIEWS.forEach(async (pv) => {
            try {
              await safeSetDoc(doc(db, 'page_views', pv.id), pv);
            } catch (e) {}
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore page_views listener:', error.message);
        }
      }
    );

    // 10. Share Events
    const unsubShareEvents = onSnapshot(
      collection(db, 'share_events'),
      (snap) => {
        if (!snap.empty) {
          const loaded: ShareEvent[] = [];
          snap.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<ShareEvent, 'id'>) });
          });
          setShareEvents(loaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
          INITIAL_SHARE_EVENTS.forEach(async (sh) => {
            try {
              await safeSetDoc(doc(db, 'share_events', sh.id), sh);
            } catch (e) {}
          });
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.warn('Firestore share_events listener:', error.message);
        }
      }
    );

    return () => {
      unsubProjects();
      unsubArticles();
      unsubTeam();
      unsubLogos();
      unsubTesti();
      unsubSettings();
      unsubInquiries();
      unsubUsers();
      unsubPageViews();
      unsubShareEvents();
    };
  }, []);

  // Google Login via Firebase Auth
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userEmail = fbUser.email?.toLowerCase() || '';

      // Check or create Firestore record
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      let targetUser: AdminUser;
      if (userSnap.exists()) {
        targetUser = userSnap.data() as AdminUser;
      } else {
        const isOwner = userEmail === 'zakikey.works@gmail.com';
        targetUser = {
          id: fbUser.uid,
          username: (fbUser.displayName || 'admin')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, ''),
          email: userEmail,
          full_name: fbUser.displayName || 'Google Admin',
          role: isOwner ? 'super_admin' : 'editor',
          avatar_url: fbUser.photoURL || '',
          whatsapp: '',
          linkedin: '',
          created_at: new Date().toISOString(),
        };
        await safeSetDoc(userDocRef, targetUser);
      }

      setCurrentUser(targetUser);
      addToast(`Berhasil masuk dengan akun Google: ${targetUser.full_name}`, 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        return {
          success: false,
          error: 'Domain ini belum didaftarkan di Firebase Auth (Authorized Domains). Silakan masuk langsung menggunakan Kredensial Username & Password di bawah, atau tambahkan domain Anda di Firebase Console.',
        };
      }
      return {
        success: false,
        error: err.message || 'Gagal masuk dengan Google.',
      };
    }
  };

  // Standard Username / Password Authentication
  const login = async (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();

    const matchedUser = adminUsers.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    // Check against user's stored password or the default super admin password
    const isSuperAdminDefault =
      (cleanId === 'zekalian' || cleanId === 'admin@zekalian.web.id') && pass === 'Sleep0veerr';
    const isUserPasswordMatch =
      matchedUser && (matchedUser.password ? matchedUser.password === pass : pass === 'Sleep0veerr');

    if (isSuperAdminDefault || isUserPasswordMatch) {
      if (matchedUser) {
        setCurrentUser(matchedUser);
        addToast(`Selamat datang kembali, ${matchedUser.full_name}!`, 'success');
        return { success: true };
      } else if (cleanId === 'zekalian' || cleanId === 'admin@zekalian.web.id') {
        const defaultAdmin = INITIAL_ADMIN_USERS[0];
        setCurrentUser(defaultAdmin);
        addToast(`Selamat datang kembali, ${defaultAdmin.full_name}!`, 'success');
        return { success: true };
      }
    }

    return {
      success: false,
      error: 'Kredensial login tidak valid. Pastikan username/email dan password sesuai.',
    };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // safe fallback
    }
    setCurrentUser(null);
    setFirebaseAuthUser(null);
    addToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    addToast(`Mode RBAC beralih ke peran: ${role.toUpperCase()}`, 'info');
  };

  // RBAC Guard helper
  const canModify = (actionCategory: 'settings' | 'users' | 'team' | 'inquiries' | 'content') => {
    if (!currentUser) return false;
    const role = currentUser.role;

    if (role === 'analyst') {
      addToast('Akses ditolak: Akun Analyst hanya memiliki izin baca (Read-Only).', 'error');
      return false;
    }

    if (actionCategory === 'settings') {
      if (role !== 'super_admin') {
        addToast('Akses ditolak: Hanya Super Admin yang memiliki hak konfigurasi ini.', 'error');
        return false;
      }
    }

    if (actionCategory === 'users') {
      if (role !== 'super_admin' && role !== 'admin') {
        addToast('Akses ditolak: Hanya Super Admin dan Admin yang memiliki hak kelola pengguna & peran.', 'error');
        return false;
      }
    }

    if (actionCategory === 'team' || actionCategory === 'inquiries') {
      if (role !== 'super_admin' && role !== 'admin') {
        addToast('Akses ditolak: Peran Anda tidak memiliki izin untuk modul ini.', 'error');
        return false;
      }
    }

    return true;
  };

  // Bug Reports
  const saveBugReport = (bug: Partial<BugReport> & { id?: string }) => {
    const bugId = bug.id || 'bug-' + Date.now();
    const finalBug: BugReport = {
      id: bugId,
      title: bug.title || 'Untitled Bug',
      description: bug.description || '',
      module: bug.module || 'General',
      severity: bug.severity || 'medium',
      status: bug.status || 'open',
      reported_by: bug.reported_by || currentUser?.full_name || 'System User',
      reported_at: bug.reported_at || new Date().toISOString(),
      assigned_to: bug.assigned_to,
      resolution_notes: bug.resolution_notes,
    };

    setBugReports((prev) => {
      const exists = prev.some((b) => b.id === bugId);
      if (exists) {
        return prev.map((b) => (b.id === bugId ? finalBug : b));
      }
      return [finalBug, ...prev];
    });

    safeSetDoc(doc(db, 'bug_reports', bugId), finalBug).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `bug_reports/${bugId}`);
    });

    addToast('Laporan bug berhasil disimpan.', 'success');
    return true;
  };

  const deleteBugReport = (id: string) => {
    setBugReports((prev) => prev.filter((b) => b.id !== id));
    deleteDoc(doc(db, 'bug_reports', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `bug_reports/${id}`);
    });
    addToast('Laporan bug berhasil dihapus.', 'info');
    return true;
  };

  // Settings
  const updateSettings = (newSettings: Partial<AgencySettings>) => {
    if (!canModify('settings')) return false;
    const updated: AgencySettings = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
    setSettings(updated);

    // Persist to Firestore
    safeSetDoc(doc(db, 'agency_settings', 'default'), updated).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, 'agency_settings/default');
    });

    addToast('Pengaturan agensi berhasil disimpan ke Cloud Firestore.', 'success');
    return true;
  };

  // Client Logos
  const saveClientLogo = (logo: Partial<ClientLogo> & { id?: string }) => {
    if (!canModify('content')) return false;
    const logoId = logo.id || 'logo-' + Date.now();
    const finalLogo: ClientLogo = {
      id: logoId,
      brand_name: logo.brand_name || 'Brand Baru',
      logo_url: logo.logo_url || 'https://dummyimage.com/160x50/000/fff&text=BRAND',
      order_index: logo.order_index ?? clientLogos.length + 1,
      is_active: logo.is_active ?? true,
    };

    setClientLogos((prev) => {
      const exists = prev.some((l) => l.id === logoId);
      if (exists) {
        return prev.map((l) => (l.id === logoId ? finalLogo : l));
      }
      return [...prev, finalLogo];
    });

    safeSetDoc(doc(db, 'client_logos', logoId), finalLogo).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `client_logos/${logoId}`);
    });

    addToast(logo.id ? 'Logo klien berhasil diperbarui.' : 'Logo klien baru berhasil ditambahkan.', 'success');
    return true;
  };

  const deleteClientLogo = (id: string) => {
    if (!canModify('content')) return false;
    setClientLogos((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, 'client_logos', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `client_logos/${id}`);
    });
    addToast('Logo klien berhasil dihapus.', 'info');
    return true;
  };

  // Projects
  const saveProject = (projectData: Partial<Project> & { id?: string }) => {
    if (!canModify('content')) return false;
    const projectId = projectData.id || 'proj-' + Date.now();
    const finalProject: Project = {
      id: projectId,
      title: projectData.title || 'Judul Proyek Baru',
      slug: projectData.slug || 'proyek-' + Date.now(),
      category_id: projectData.category_id || categories[0]?.id || 'cat-1',
      client_name: projectData.client_name || 'Klien Agensi',
      description: projectData.description || 'Deskripsi proyek kreatif Zekalian.',
      media_type: projectData.media_type || 'IMAGE',
      youtube_video_id: projectData.youtube_video_id,
      is_featured: projectData.is_featured ?? false,
      status: projectData.status || 'PUBLISHED',
      progress_stage: projectData.progress_stage || 'DISCOVERY',
      completion_percentage: projectData.completion_percentage ?? 0,
      target_delivery_date: projectData.target_delivery_date,
      milestones: projectData.milestones,
      created_at: projectData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: projectData.media || [],
      crews: projectData.crews || [],
      category: categories.find((c) => c.id === (projectData.category_id || categories[0]?.id)),
    };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === projectId);
      if (exists) {
        return prev.map((p) => (p.id === projectId ? finalProject : p));
      }
      return [finalProject, ...prev];
    });

    safeSetDoc(doc(db, 'projects', projectId), finalProject).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `projects/${projectId}`);
    });

    addToast(projectData.id ? 'Proyek berhasil diperbarui di Firestore!' : 'Proyek baru berhasil disimpan ke Firestore!', 'success');
    return true;
  };

  const deleteProject = (id: string) => {
    if (!canModify('content')) return false;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteDoc(doc(db, 'projects', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    });
    addToast('Proyek berhasil dihapus.', 'info');
    return true;
  };

  // Team Members
  const saveTeamMember = (memberData: Partial<TeamMember> & { id?: string }) => {
    if (!canModify('team')) return false;
    const memberId = memberData.id || 'member-' + Date.now();
    const initials = (memberData.full_name || 'Kru')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 3)
      .toUpperCase();

    const finalMember: TeamMember = {
      id: memberId,
      full_name: memberData.full_name || 'Anggota Tim',
      default_role: memberData.default_role || 'Creative Specialist',
      initials: memberData.initials || initials,
      avatar_url: memberData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
      bio: memberData.bio || 'Kru kreatif Zekalian Production.',
      instagram_url: memberData.instagram_url || '',
      linkedin_url: memberData.linkedin_url || '',
      order_index: memberData.order_index ?? teamMembers.length + 1,
      is_active: memberData.is_active ?? true,
      created_at: memberData.created_at || new Date().toISOString(),
    };

    setTeamMembers((prev) => {
      const exists = prev.some((m) => m.id === memberId);
      if (exists) {
        return prev.map((m) => (m.id === memberId ? finalMember : m));
      }
      return [...prev, finalMember];
    });

    safeSetDoc(doc(db, 'agency_members', memberId), finalMember).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `agency_members/${memberId}`);
    });

    addToast(memberData.id ? 'Data kru berhasil diperbarui.' : 'Kru baru berhasil ditambahkan.', 'success');
    return true;
  };

  const deleteTeamMember = (id: string) => {
    if (!canModify('team')) return false;
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    deleteDoc(doc(db, 'agency_members', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `agency_members/${id}`);
    });
    addToast('Kru berhasil dihapus.', 'info');
    return true;
  };

  // Articles
  const saveArticle = (articleData: Partial<Article> & { id?: string }) => {
    if (!canModify('content')) return false;
    const articleId = articleData.id || 'art-' + Date.now();
    const finalArticle: Article = {
      id: articleId,
      title: articleData.title || 'Artikel Baru',
      slug: articleData.slug || 'artikel-' + Date.now(),
      excerpt: articleData.excerpt || 'Ringkasan artikel.',
      content_html: articleData.content_html || '<p>Konten artikel...</p>',
      cover_image_url: articleData.cover_image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      tags: articleData.tags || 'Creative',
      status: articleData.status || 'PUBLISHED',
      reading_time: articleData.reading_time || '5 Menit Baca',
      published_at: articleData.published_at || new Date().toISOString(),
      created_at: articleData.created_at || new Date().toISOString(),
    };

    setArticles((prev) => {
      const exists = prev.some((a) => a.id === articleId);
      if (exists) {
        return prev.map((a) => (a.id === articleId ? finalArticle : a));
      }
      return [finalArticle, ...prev];
    });

    safeSetDoc(doc(db, 'articles', articleId), finalArticle).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `articles/${articleId}`);
    });

    addToast(articleData.id ? 'Artikel berhasil diperbarui.' : 'Artikel baru berhasil dipublikasikan!', 'success');
    return true;
  };

  const deleteArticle = (id: string) => {
    if (!canModify('content')) return false;
    setArticles((prev) => prev.filter((a) => a.id !== id));
    deleteDoc(doc(db, 'articles', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
    });
    addToast('Artikel berhasil dihapus.', 'info');
    return true;
  };

  // Testimonials
  const saveTestimonial = (testi: Partial<Testimonial> & { id?: string }) => {
    if (!canModify('content')) return false;
    const testiId = testi.id || 'testi-' + Date.now();
    const finalTesti: Testimonial = {
      id: testiId,
      client_name: testi.client_name || 'Nama Klien',
      client_company_or_brand: testi.client_company_or_brand || testi.company_or_title || 'Perusahaan',
      testimonial_text: testi.testimonial_text || testi.quote || 'Ulasan kolaborasi yang luar biasa.',
      rating: testi.rating ?? 5,
      is_active: testi.is_active ?? true,
      order_index: testi.order_index ?? testimonials.length + 1,
      created_at: testi.created_at || new Date().toISOString(),
    };

    setTestimonials((prev) => {
      const exists = prev.some((t) => t.id === testiId);
      if (exists) {
        return prev.map((t) => (t.id === testiId ? finalTesti : t));
      }
      return [...prev, finalTesti];
    });

    safeSetDoc(doc(db, 'testimonials', testiId), finalTesti).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${testiId}`);
    });

    addToast(testi.id ? 'Testimoni berhasil diperbarui.' : 'Testimoni baru berhasil ditambahkan.', 'success');
    return true;
  };

  const deleteTestimonial = (id: string) => {
    if (!canModify('content')) return false;
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    deleteDoc(doc(db, 'testimonials', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    });
    addToast('Testimoni berhasil dihapus.', 'info');
    return true;
  };

  // Inquiries (Public Submission)
  const submitInquiry = async (name: string, email: string, project_vision: string) => {
    if (!name.trim() || !email.trim() || !project_vision.trim()) {
      return { success: false, error: 'Harap lengkapi semua bidang formulir.' };
    }

    const inqId = 'inq-' + Date.now();
    const newInquiry: Inquiry = {
      id: inqId,
      name: name.trim(),
      email: email.trim(),
      project_vision: project_vision.trim(),
      status: 'NEW',
      created_at: new Date().toISOString(),
    };

    setInquiries((prev) => [newInquiry, ...prev]);

    // Save directly to Firestore collection
    try {
      await safeSetDoc(doc(db, 'inquiries', inqId), newInquiry);
    } catch (err) {
      console.warn('Inquiry firestore save fallback:', err);
    }

    addToast('Brief proyek Anda telah terkirim! Tim Zekalian akan segera menghubungi Anda.', 'success');
    return { success: true };
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    if (!canModify('inquiries')) return false;
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));

    updateDoc(doc(db, 'inquiries', id), { status }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    });

    addToast(`Status inquiry diperbarui menjadi: ${status}`, 'success');
    return true;
  };

  // Safe zero-database-overhead WhatsApp handlers
  const recordWhatsAppClick = async (_clickData?: WhatsAppClickLog) => {
    // Disabled to lighten Firestore database as requested
  };

  const recordWhatsAppImpression = async (_variantId?: WhatsAppSplitVariantId, _path?: string) => {
    // Disabled to lighten Firestore database as requested
  };

  // Super Admin & Admin: User Management
  const createAdminUser = (userData: Omit<AdminUser, 'id' | 'created_at'>) => {
    if (!canModify('users')) return false;
    const exists = adminUsers.some(
      (u) =>
        u.username.toLowerCase() === userData.username.toLowerCase() ||
        u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      addToast('Username atau email sudah terdaftar.', 'error');
      return false;
    }

    const userId = 'admin-' + Date.now();
    const newUser: AdminUser = {
      id: userId,
      username: userData.username.toLowerCase().trim(),
      email: userData.email.toLowerCase().trim(),
      full_name: userData.full_name.trim(),
      role: userData.role,
      avatar_url: userData.avatar_url || '',
      whatsapp: userData.whatsapp || '',
      linkedin: userData.linkedin || '',
      created_at: new Date().toISOString(),
    };
    if (userData.password) {
      newUser.password = userData.password;
    }

    setAdminUsers((prev) => [...prev, newUser]);

    safeSetDoc(doc(db, 'users', userId), newUser).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    });

    addToast(`Pengguna admin ${newUser.full_name} berhasil dibuat dengan peran ${newUser.role}.`, 'success');
    return true;
  };

  // Update Profile (Any logged in user can edit their own profile; Super Admin & Admin can also edit others and roles)
  const updateUserProfile = (userId: string, updates: Partial<AdminUser>): boolean => {
    if (!currentUser) return false;

    const isSelf = currentUser.id === userId;
    const isSuperAdminOrAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

    if (!isSelf && !isSuperAdminOrAdmin) {
      addToast('Akses ditolak: Anda hanya dapat memperbarui profil akun Anda sendiri.', 'error');
      return false;
    }

    // Check conflict for username
    if (updates.username) {
      const cleanUsername = updates.username.toLowerCase().trim().replace(/^@/, '');
      const conflictUsername = adminUsers.find(
        (u) => u.id !== userId && u.username.toLowerCase() === cleanUsername
      );
      if (conflictUsername) {
        addToast(`Username @${cleanUsername} sudah digunakan oleh akun lain.`, 'error');
        return false;
      }
    }

    // Check conflict for email
    if (updates.email) {
      const cleanEmail = updates.email.toLowerCase().trim();
      const conflictEmail = adminUsers.find(
        (u) => u.id !== userId && u.email.toLowerCase() === cleanEmail
      );
      if (conflictEmail) {
        addToast(`Email ${cleanEmail} sudah digunakan oleh akun lain.`, 'error');
        return false;
      }
    }

    const targetUser = adminUsers.find((u) => u.id === userId);
    if (!targetUser) {
      addToast('Data pengguna tidak ditemukan.', 'error');
      return false;
    }

    // Role protection: Only Super Admin and Admin can change roles!
    let finalRole = targetUser.role;
    if (updates.role && updates.role !== targetUser.role) {
      if (isSuperAdminOrAdmin) {
        finalRole = updates.role;
      } else {
        addToast('Perubahan peran diabaikan: Hanya Super Admin dan Admin yang berhak mengubah peran.', 'info');
      }
    }

    const updatedUser: AdminUser = {
      ...targetUser,
      full_name: updates.full_name ? updates.full_name.trim() : targetUser.full_name,
      username: updates.username ? updates.username.toLowerCase().trim().replace(/^@/, '') : targetUser.username,
      email: updates.email ? updates.email.toLowerCase().trim() : targetUser.email,
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : (targetUser.avatar_url || ''),
      whatsapp: updates.whatsapp !== undefined ? updates.whatsapp : (targetUser.whatsapp || ''),
      linkedin: updates.linkedin !== undefined ? updates.linkedin : (targetUser.linkedin || ''),
      role: finalRole,
    };

    if (updates.password || targetUser.password) {
      updatedUser.password = updates.password || targetUser.password;
    } else {
      delete updatedUser.password;
    }

    setAdminUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    // Persist to Firestore safely
    safeSetDoc(doc(db, 'users', userId), updatedUser).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    });

    addToast(`Profil ${updatedUser.full_name} berhasil diperbarui di Cloud Firestore!`, 'success');
    return true;
  };

  const deleteAdminUser = (userId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      addToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat menghapus akun.', 'error');
      return false;
    }
    if (currentUser.id === userId) {
      addToast('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.', 'error');
      return false;
    }

    setAdminUsers((prev) => prev.filter((u) => u.id !== userId));

    deleteDoc(doc(db, 'users', userId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    });

    addToast('Pengguna admin berhasil dihapus dari Cloud Firestore.', 'success');
    return true;
  };

  const submitAccessRequest = async (data: {
    full_name: string;
    request_department: string;
    requested_role: UserRole;
    request_reason: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser: AdminUser = {
      ...currentUser,
      full_name: data.full_name.trim(),
      request_department: data.request_department.trim(),
      requested_role: data.requested_role,
      request_reason: data.request_reason.trim(),
      requested_at: new Date().toISOString(),
      account_status: 'PENDING_APPROVAL',
      role: 'pending',
    };

    setCurrentUser(updatedUser);
    setAdminUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    try {
      await safeSetDoc(doc(db, 'users', currentUser.id), updatedUser);
      return true;
    } catch (err) {
      console.error('Error updating access request:', err);
      return false;
    }
  };

  const approveUserAccess = async (userId: string, assignedRole: UserRole): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      addToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat menyetujui akun.', 'error');
      return false;
    }

    const target = adminUsers.find((u) => u.id === userId);
    if (!target) {
      addToast('Pengguna tidak ditemukan.', 'error');
      return false;
    }

    const updatedUser: AdminUser = {
      ...target,
      role: assignedRole,
      account_status: 'APPROVED',
      reviewed_by: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
    };

    setAdminUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    try {
      await safeSetDoc(doc(db, 'users', userId), updatedUser);
      addToast(`Akses untuk ${target.full_name} (${target.email}) berhasil disetujui sebagai ${assignedRole.toUpperCase()}!`, 'success');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      return false;
    }
  };

  const rejectUserAccess = async (userId: string, reason?: string): Promise<boolean> => {
    if (!currentUser) return false;
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      addToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat menolak permohonan.', 'error');
      return false;
    }

    const target = adminUsers.find((u) => u.id === userId);
    if (!target) {
      addToast('Pengguna tidak ditemukan.', 'error');
      return false;
    }

    const updatedUser: AdminUser = {
      ...target,
      account_status: 'REJECTED',
      role: 'pending',
      reviewed_by: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
      request_reason: reason || target.request_reason,
    };

    setAdminUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    try {
      await safeSetDoc(doc(db, 'users', userId), updatedUser);
      addToast(`Permohonan akses ${target.full_name} telah ditolak.`, 'info');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      return false;
    }
  };

  const refreshCurrentUser = async (): Promise<void> => {
    if (!currentUser) return;
    try {
      const userSnap = await getDoc(doc(db, 'users', currentUser.id));
      if (userSnap.exists()) {
        const data = userSnap.data() as AdminUser;
        setCurrentUser(data);
      }
    } catch (err) {
      console.warn('Could not refresh user status:', err);
    }
  };

  const archiveOutgoingWhatsAppMessage = async (data: any) => {
    try {
      const logRef = doc(collection(db, 'whatsapp_chat_logs'));
      await safeSetDoc(logRef, {
        id: logRef.id,
        ...data,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save archive outgoing whatsapp message:', err);
    }
  };

  const recordPageView = async (view: PageViewEvent) => {
    setPageViews((prev) => [view, ...prev.filter((p) => p.id !== view.id).slice(0, 199)]);
    try {
      await safeSetDoc(doc(db, 'page_views', view.id), view);
    } catch (err) {
      console.warn('Could not record page view in Firestore:', err);
    }
  };

  const recordShareEvent = async (event: ShareEvent) => {
    setShareEvents((prev) => [event, ...prev.filter((s) => s.id !== event.id).slice(0, 199)]);
    try {
      await safeSetDoc(doc(db, 'share_events', event.id), event);
    } catch (err) {
      console.warn('Could not record share event in Firestore:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        categories,
        clientLogos,
        teamMembers,
        projects,
        articles,
        testimonials,
        inquiries,
        adminUsers,
        bugReports,
        whatsappClicks,
        whatsappImpressions,
        pageViews,
        shareEvents,
        lang,
        setLang,
        isFirestoreConnected,
        currentUser,
        firebaseAuthUser,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        recordWhatsAppClick,
        recordWhatsAppImpression,
        recordPageView,
        recordShareEvent,
        archiveOutgoingWhatsAppMessage,
        updateSettings,
        saveClientLogo,
        deleteClientLogo,
        saveProject,
        deleteProject,
        saveTeamMember,
        deleteTeamMember,
        saveArticle,
        deleteArticle,
        saveTestimonial,
        deleteTestimonial,
        submitInquiry,
        updateInquiryStatus,
        createAdminUser,
        updateUserProfile,
        deleteAdminUser,
        saveBugReport,
        deleteBugReport,
        submitAccessRequest,
        approveUserAccess,
        rejectUserAccess,
        refreshCurrentUser,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
