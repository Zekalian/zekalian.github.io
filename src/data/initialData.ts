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
  BugReport,
  PageViewEvent,
  ShareEvent,
} from '../types/database';

export const INITIAL_AGENCY_SETTINGS: AgencySettings = {
  id: '00000000-0000-0000-0000-000000000001',
  agency_name: 'Zekalian',
  official_email: 'halo@zekalian.web.id',
  admin_whatsapp_number: '+6283188998633',
  whatsapp_prefilled_message: 'Halo Zekalian, saya tertarik berdiskusi mengenai proyek media dan branding bisnis kami.',
  studio_address: 'Pekanbaru — Payakumbuh, Indonesia',
  instagram_url: 'https://instagram.com/zekalian',
  linkedin_url: 'https://linkedin.com/company/zekalian',
  logo_light_url: '',
  logo_dark_url: '',
  favicon_url: '',
  updated_at: '2026-09-19T00:00:00Z',

  seo_site_title: 'Zekalian — Authentic Branding & Media Creative Production',
  seo_meta_description: 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.',
  seo_og_image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=85',
  seo_keywords: 'zekalian, creative agency, branding indonesia, video production, multimedia showcase, digital campaign',
  seo_twitter_card: 'summary_large_image',
  seo_schema_type: 'ProfessionalService',
  seo_page_overrides: {
    home: { title: 'Zekalian — Authentic Branding & Media Creative Production', desc: 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.' },
    projects: { title: 'Portofolio & Studi Kasus', desc: 'Jelajahi studi kasus komersial, kampanye visual, dan video sinematik yang telah kami kerjakan untuk brand terkemuka.' },
    articles: { title: 'Wawasan & Opini Industri Kreatif', desc: 'Refleksi mendalam, panduan produksi videografi, dan strategi narasi visual dari studio Zekalian.' },
    about: { title: 'Tentang Zekalian — Cerita, Visi & Filosofi Kreatif', desc: 'Mengenal perjalanan Zekalian dalam membangun narasi visual autentik yang berkarakter dan berdampak.' },
    contact: { title: 'Hubungi & Mulai Kolaborasi Proyek', desc: 'Konsultasikan ide kampanye, jadwal syuting, atau tanyakan estimasi anggaran proyek bersama tim Zekalian.' },
  },

  hero_title_prefix: 'Building',
  hero_title_accent: 'authentic',
  hero_title_suffix: 'brands, concept to execution.',
  hero_subtitle: 'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.',
  hero_cta_primary: 'Hubungi Zekalian',
  hero_cta_secondary: 'Lihat Portofolio',

  services_subtitle: 'Layanan Agensi',
  services_title: 'Solusi Kreatif Menyeluruh untuk Skala Bisnis Anda',
  services_desc: 'Dari strategi positioning hingga eksekusi visual di lapangan, kami memberikan kualitas craftsmanship tanpa kompromi.',
  services_list: [
    {
      number: '01',
      title: 'Branding & Visual Identity',
      desc: 'Membangun identitas merek yang kokoh dan berkarakter unik. Mulai dari perumusan brand DNA, logo system, tipografi, palet warna, hingga buku panduan desain komprehensif.',
    },
    {
      number: '02',
      title: 'Production House & Media',
      desc: 'Eksekusi produksi audio visual sinematik standar bioskop untuk iklan komersial, film dokumenter korporat, dan kampanye digital berdaya pikat tinggi.',
    },
    {
      number: '03',
      title: 'Social Media Management',
      desc: 'Pengelolaan konten multimedia terstruktur berbasis data tren dan visual storytelling otentik guna melipatgandakan retensi dan interaksi audiens bisnis.',
    },
  ],

  workflow_subtitle: 'Our Methodology',
  workflow_title: 'Alur Kerja 4 Fase Terstruktur',
  workflow_desc: 'Menjamin transparansi tenggat waktu, kejelasan ekspektasi teknis, dan presisi hasil akhir.',
  workflow_list: [
    {
      number: '01',
      title: 'Discovery & Brief',
      color: '#005DDD',
      desc: 'Membedah tujuan bisnis, profil audiens sasaran, dan lanskap kompetitor untuk merumuskan fondasi strategi kreatif yang terukur.',
    },
    {
      number: '02',
      title: 'Creative Direction',
      color: '#018EE3',
      desc: 'Penyusunan moodboard, skrip naratif, storyboard visual, serta panduan estetika sebelum melangkah ke tahap eksekusi teknis.',
    },
    {
      number: '03',
      title: 'Production & Craft',
      color: '#00B7E8',
      desc: 'Sesi pengambilan gambar beresolusi tinggi, desain grafis presisi, tata suara, dan pewarnaan sinematik (color grading) berstandar profesional.',
    },
    {
      number: '04',
      title: 'Final Delivery',
      color: '#0F172A',
      desc: 'Pemberian paket aset siap tayang dalam berbagai format digital, dokumentasi lisensi, serta panduan penerapan berkala.',
    },
  ],

  cta_banner_title: 'Siap Mengangkat Identitas Brand Anda ke Level Berikutnya?',
  cta_banner_desc: 'Kami siap berdiskusi secara terbuka mengenai sasaran bisnis, kebutuhan visual, dan alokasi timeline proyek Anda.',
  cta_banner_btn_text: 'Hubungi Zekalian',

  about_subtitle: 'About Studio',
  about_title_prefix: 'Menghubungkan Brand dan Audiens Melalui Karya Visual yang',
  about_title_accent: 'Jujur.',
  about_desc: 'Zekalian adalah agensi kreatif independen yang berfokus pada perumusan identitas merek, produksi multimedia sinematik, dan strategi visual berorientasi dampak nyata.',
  about_philosophy_title: 'Filosofi Kerja Kami',
  about_philosophy_content: '<p>Di tengah derasnya arus konten instan yang seragam dan tak bernyawa, kami meyakini bahwa manusia senantiasa tergerak oleh keaslian. Sebuah visual yang kuat tidak sekadar menarik mata, melainkan menumbuhkan rasa percaya dan ikatan emosional yang bertahan lama.</p><p>Beroperasi dari basis studio kami di Pekanbaru — Payakumbuh, Indonesia, kami menggabungkan kekayaan perspektif lokal dengan standar produksi multimedia bertaraf internasional. Kami merangkul setiap tantangan kreatif dengan pendekatan eksploratif yang kritis namun terukur.</p><p>Bagi kami, kesuksesan sebuah kampanye tidak hanya diukur dari angka impresi di layar, melainkan dari sejauh mana karya tersebut memperkuat posisi dan reputasi bisnis klien di dunia nyata.</p>',
  about_vision_title: 'Visi Jangka Panjang',
  about_vision_desc: 'Menjadi katalis utama transformasi identitas visual bagi merek-merek progresif di Indonesia, membuktikan bahwa karya dari talenta kreatif daerah memiliki daya saing dan kedalaman artistik yang tak terbatas.',
  about_values_subtitle: 'Fundamental',
  about_values_title: 'Nilai-Nilai Agensi',
  about_values_list: [
    {
      title: 'Autentisitas Murni',
      desc: 'Kami menolak klise visual generik. Setiap garis desain dan frame video yang kami ciptakan berakar langsung pada DNA dan nilai unik brand Anda.',
    },
    {
      title: 'Disiplin Ketelitian',
      desc: 'Craftsmanship sejati hadir dalam detail mikro: ritme potongan adegan, keselarasan warna, konsistensi grid tipografi, dan tata suara yang harmonis.',
    },
    {
      title: 'Kemitraan Transparan',
      desc: 'Kami bekerja sebagai perpanjangan tim Anda. Bebas biaya tersembunyi, komitmen jadwal yang transparan, dan komunikasi yang lugas.',
    },
  ],
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Production House',
    slug: 'production-house',
    order_index: 1,
  },
  {
    id: 'cat-2',
    name: 'Branding Consulting',
    slug: 'branding-consulting',
    order_index: 2,
  },
  {
    id: 'cat-3',
    name: 'Social Media Management',
    slug: 'social-media-management',
    order_index: 3,
  },
];

export const INITIAL_CLIENT_LOGOS: ClientLogo[] = [
  {
    id: 'logo-1',
    brand_name: 'Mitra & Brand Partner',
    logo_url: 'https://dummyimage.com/160x50/000/fff&text=BRAND+PARTNER',
    order_index: 1,
    is_active: true,
  },
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    full_name: 'Zaki Fadhillah Andri',
    default_role: 'Creative Director & Founder',
    initials: 'ZA',
    bio: 'Memimpin perumusan konsep visual autentik, narasi kampanye, dan arah kreatif brand studio Zekalian.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    instagram_url: 'https://instagram.com/zekalian',
    linkedin_url: 'https://linkedin.com/company/zekalian',
    order_index: 1,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Proyek Perdana — Brand Campaign & Film Sinematik',
    slug: 'proyek-perdana-brand-campaign',
    category_id: 'cat-1',
    client_name: 'Klien Kolaborasi',
    description: 'Proyek percontohan komersial dan identitas visual kreatif studio Zekalian. Menampilkan perpaduan storytelling berkarakter, sinematografi presisi, dan visual branding modern.',
    media_type: 'IMAGE',
    is_featured: true,
    status: 'PUBLISHED',
    created_at: '2026-09-01T10:00:00Z',
    media: [
      {
        id: 'media-1-1',
        project_id: 'proj-1',
        image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
        caption: 'Behind the scenes dan sesi visual showcase proyek',
        order_index: 1,
      },
    ],
    crews: [
      {
        id: 'crew-1',
        project_id: 'proj-1',
        team_member_id: 'team-1',
        custom_role_in_project: 'CREATIVE DIRECTOR',
      },
    ],
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Membangun Karakter Visual Autentik di Era Digital',
    slug: 'membangun-karakter-visual-autentik',
    cover_image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Refleksi perdana studio Zekalian tentang pentingnya kejujuran visual, pendekatan sinematik, dan identitas merek yang memiliki jiwa.',
    content_html: `<p class="mb-4 leading-relaxed">Selamat datang di jurnal kreatif Zekalian. Di ruang ini, kami membagikan catatan lapangan, filosofi visual, dan wawasan seputar produksi media serta perumusan identitas merek yang berdaya tahan lama.</p>
<h3 class="text-2xl font-bold mt-8 mb-4 text-slate-900">Fondasi Cerita yang Berkarakter</h3>
<p class="mb-4 leading-relaxed">Bagi kami, visual yang memikat bukan semata-mata soal kecanggihan kamera, melainkan kejelasan pesan dan ketulusan emosi yang disampaikan kepada audiens.</p>`,
    tags: 'Branding, Creative, Storytelling',
    status: 'PUBLISHED',
    published_at: '2026-09-01T08:00:00Z',
    reading_time: '3 min read',
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    client_name: 'Rian Pratama',
    client_company_or_brand: 'Brand Partner',
    testimonial_text: 'Kolaborasi yang sangat profesional bersama Zekalian. Eksekusi visual dan narasi kampanye berhasil menyampaikan nilai brand kami secara autentik.',
    rating: 5,
    is_active: true,
    created_at: '2026-09-01T00:00:00Z',
  },
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Klien Calon Partner',
    email: 'halo@mitra.com',
    project_vision: 'Konsultasi konsep kampanye video komersial dan penyusunan brand guidelines baru untuk peluncuran produk.',
    status: 'NEW',
    created_at: '2026-09-01T10:00:00Z',
  },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-super-1',
    username: 'zekalian',
    email: 'admin@zekalian.web.id',
    full_name: 'Zaki Fadhillah Andri',
    role: 'super_admin',
    account_status: 'APPROVED',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    whatsapp: '6281234567890',
    linkedin: 'https://linkedin.com/in/zakifadhillah',
    password: 'Sleep0veerr',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'admin-prod-2',
    username: 'taufik',
    email: 'taufik@zekalian.web.id',
    full_name: 'Taufik Ridha Nugraha',
    role: 'admin',
    account_status: 'APPROVED',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    whatsapp: '6281234567891',
    linkedin: 'https://linkedin.com/in/taufikridha',
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'admin-editor-3',
    username: 'rizqi',
    email: 'rizqi@zekalian.web.id',
    full_name: 'Rizqi Almutawalli',
    role: 'editor',
    account_status: 'APPROVED',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    whatsapp: '6281234567892',
    linkedin: 'https://linkedin.com/in/rizqialmutawalli',
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: 'admin-analyst-4',
    username: 'analyst',
    email: 'analyst@zekalian.web.id',
    full_name: 'Agency Performance Analyst',
    role: 'analyst',
    account_status: 'APPROVED',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    whatsapp: '6281234567893',
    linkedin: 'https://linkedin.com/in/analyst-zekalian',
    created_at: '2026-01-04T00:00:00Z',
  },
  {
    id: 'admin-prog-5',
    username: 'programmer',
    email: 'dev@zekalian.web.id',
    full_name: 'Lead System Engineer',
    role: 'programmer',
    account_status: 'APPROVED',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    whatsapp: '6281234567894',
    linkedin: 'https://linkedin.com/in/systemprogrammer',
    created_at: '2026-01-05T00:00:00Z',
  },
];

export const INITIAL_BUG_REPORTS: BugReport[] = [
  {
    id: 'bug-1',
    title: 'Optimasi Tampilan Tabel Invoice pada Layar Mobile',
    description: 'Kolom total harga pada generator invoice kadang terpotong saat dibuka menggunakan resolusi layar smartphone kecil.',
    module: 'Generator Invoice',
    severity: 'medium',
    status: 'in_progress',
    reported_by: 'Taufik Ridha Nugraha',
    reported_at: '2026-09-20T10:30:00Z',
    assigned_to: 'Lead System Engineer',
  },
  {
    id: 'bug-2',
    title: 'Sinkronisasi Realtime Status Approval User Baru',
    description: 'Notifikasi pending count pada menu User & Role memerlukan refresh manual setelah user baru melakukan register.',
    module: 'Kelola User (RBAC)',
    severity: 'high',
    status: 'open',
    reported_by: 'Zaki Fadhillah Andri',
    reported_at: '2026-09-21T08:15:00Z',
  },
];

export const INITIAL_PAGE_VIEWS: PageViewEvent[] = [
  {
    id: 'pv-init-1',
    path: '/',
    title: 'Zekalian — Authentic Branding & Media Creative Production',
    device_type: 'desktop',
    browser_name: 'Google Chrome',
    operating_system: 'macOS',
    referrer: 'google.com',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pv-init-2',
    path: '/projects',
    title: 'Portofolio & Studi Kasus',
    device_type: 'mobile',
    browser_name: 'Apple Safari',
    operating_system: 'iOS',
    referrer: 'instagram.com',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'pv-init-3',
    path: '/articles',
    title: 'Wawasan & Opini Industri Kreatif',
    device_type: 'desktop',
    browser_name: 'Google Chrome',
    operating_system: 'Windows',
    referrer: 'direct',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'pv-init-4',
    path: '/projects/proyek-perdana-brand-campaign-film-sinematik',
    title: 'Proyek Perdana — Brand Campaign & Film Sinematik',
    device_type: 'mobile',
    browser_name: 'Instagram In-App',
    operating_system: 'Android',
    referrer: 'instagram.com',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'pv-init-5',
    path: '/articles/membangun-karakter-visual-autentik-di-era-digital',
    title: 'Membangun Karakter Visual Autentik di Era Digital',
    device_type: 'desktop',
    browser_name: 'Mozilla Firefox',
    operating_system: 'macOS',
    referrer: 'linkedin.com',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'pv-init-6',
    path: '/contact',
    title: 'Hubungi & Mulai Kolaborasi Proyek',
    device_type: 'mobile',
    browser_name: 'Apple Safari',
    operating_system: 'iOS',
    referrer: 'direct',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
];

export const INITIAL_SHARE_EVENTS: ShareEvent[] = [
  {
    id: 'sh-init-1',
    item_type: 'article',
    item_id: 'art-1',
    item_title: 'Membangun Karakter Visual Autentik di Era Digital',
    item_slug: 'membangun-karakter-visual-autentik-di-era-digital',
    action: 'copy_link',
    path: '/articles/membangun-karakter-visual-autentik-di-era-digital',
    device_type: 'desktop',
    browser_name: 'Google Chrome',
    operating_system: 'macOS',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'sh-init-2',
    item_type: 'project',
    item_id: 'proj-1',
    item_title: 'Proyek Perdana — Brand Campaign & Film Sinematik',
    item_slug: 'proyek-perdana-brand-campaign-film-sinematik',
    action: 'copy_link',
    path: '/projects/proyek-perdana-brand-campaign-film-sinematik',
    device_type: 'mobile',
    browser_name: 'Apple Safari',
    operating_system: 'iOS',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'sh-init-3',
    item_type: 'article',
    item_id: 'art-1',
    item_title: 'Membangun Karakter Visual Autentik di Era Digital',
    item_slug: 'membangun-karakter-visual-autentik-di-era-digital',
    action: 'share_whatsapp',
    path: '/articles/membangun-karakter-visual-autentik-di-era-digital',
    device_type: 'mobile',
    browser_name: 'Apple Safari',
    operating_system: 'iOS',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'sh-init-4',
    item_type: 'project',
    item_id: 'proj-1',
    item_title: 'Proyek Perdana — Brand Campaign & Film Sinematik',
    item_slug: 'proyek-perdana-brand-campaign-film-sinematik',
    action: 'share_native',
    path: '/projects/proyek-perdana-brand-campaign-film-sinematik',
    device_type: 'desktop',
    browser_name: 'Google Chrome',
    operating_system: 'Windows',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
];

