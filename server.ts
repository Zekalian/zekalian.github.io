import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side Gemini AI SEO & Growth Analysis Endpoint
app.post('/api/seo-analysis', async (req, res) => {
  try {
    const { topPages, topShares, deviceStats, referrerStats, agencySettings } = req.body;

    const prompt = `Anda adalah seorang Senior SEO & Content Growth Strategist kelas dunia untuk Zekalian, sebuah agensi branding autentik dan creative video production house di Indonesia (Pekanbaru & Payakumbuh).

Berdasarkan data analitik real-time terkini dari website Zekalian:
1. Profil Agensi:
   - Nama: ${agencySettings?.agency_name || 'Zekalian'}
   - Deskripsi: ${agencySettings?.seo_meta_description || 'Authentic branding and commercial video production.'}
   - Meta Keywords: ${agencySettings?.seo_keywords || 'branding, video production, digital campaign'}

2. Konten Paling Sering Di-Share & Disalin:
${JSON.stringify(topShares || [], null, 2)}

3. Halaman Paling Sering Dikunjungi (Pageviews):
${JSON.stringify(topPages || [], null, 2)}

4. Statistik Perangkat:
- Smartphone: ${deviceStats?.mobilePct || 0}% (${deviceStats?.mobile || 0} hits)
- Desktop: ${deviceStats?.desktopPct || 0}% (${deviceStats?.desktop || 0} hits)

5. Sumber Trafik (Referrer):
${JSON.stringify(referrerStats || [], null, 2)}

Tolong buat analisis komprehensif, tajam, dan strategis dalam Bahasa Indonesia yang profesional. Jelaskan:
1. Ringkasan Eksekutif (Executive Summary): Apa yang sedang terjadi dengan trafik Zekalian saat ini.
2. Analisis Konten Viral: Mengapa artikel / portofolio teratas disukai dan sering dibagikan ke WhatsApp.
3. Rekomendasi 3-4 Judul Artikel Baru: Judul menarik, kata kunci utama (SEO keywords), dan alasan strategisnya.
4. Taktik Optimasi Konversi (CRO Leads WhatsApp): Cara mengubah pembaca artikel / penonton portofolio menjadi lead klien nyata.
5. Rencana Aksi 7 Hari ke Depan (Action Items).`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        executive_summary: {
          type: Type.STRING,
          description: 'Ringkasan performa trafik dan potensi pertumbuhan Zekalian saat ini.',
        },
        viral_content_analysis: {
          type: Type.STRING,
          description: 'Analisis mendalam mengapa konten teratas sering dibagikan pengunjung.',
        },
        recommended_articles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Judul artikel yang disarankan' },
              target_keyword: { type: Type.STRING, description: 'Kata kunci pencarian Google utama' },
              rationale: { type: Type.STRING, description: 'Alasan kenapa topik ini akan menarik klien' },
            },
            required: ['title', 'target_keyword', 'rationale'],
          },
          description: 'Daftar usulan ide artikel dan wawasan industri baru.',
        },
        cro_recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Saran optimasi konversi agar lebih banyak pengunjung mengklik tombol konsultasi WhatsApp.',
        },
        action_plan_7_days: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Langkah praktis yang dapat dikerjakan tim marketing & content dalam 7 hari.',
        },
      },
      required: [
        'executive_summary',
        'viral_content_analysis',
        'recommended_articles',
        'cro_recommendations',
        'action_plan_7_days',
      ],
    };

    let aiResponse;
    try {
      aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });
    } catch (modelErr: any) {
      console.warn('Gemini 3.8 Flash unavailable, using fallback gemini-3.1-flash-lite:', modelErr?.message);
      aiResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });
    }

    const outputText = aiResponse.text || '{}';
    const parsedData = JSON.parse(outputText);

    return res.json({
      success: true,
      data: parsedData,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini SEO Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan analisis AI Gemini.',
    });
  }
});

// Admin-Only Gemini Chatbot Endpoint
const CHATBOT_SYSTEM_INSTRUCTION = `Anda adalah "ZetAI" — Senior Strategic AI Assistant & Creative Copilot khusus internal tim Zekalian Agency (Authentic Branding & Commercial Video Production House di Indonesia).

PERAN & TANGGUNG JAWAB ANDA:
1. PANDUAN LENGKAP SISTEM & FITUR WEBSITE ZEKALIAN:
   - Membantu tim memahami cara kerja seluruh modul CMS dan fungsionalitas platform:
     * Portofolio (/admin/projects): Kelola proyek, unggah cover media, video showcase, detail klien, dan kategori layanan.
     * Milestones & Portal Klien (/admin/milestones): Manajemen tahapan produksi (Pra-Produksi, Produksi, Offline Editing, Online Editing & Grading, Serah Terima). Klien memiliki tautan portal unik (/portal/:token) tanpa perlu login untuk memantau progres dan memberi revisi.
     * Artikel & Wawasan (/admin/articles): Publikasi artikel edukatif dan pemikiran industri, estimasi waktu baca, dan tombol berbagi media sosial.
     * Brief (/admin/briefs), Shotlist (/admin/shotlists), Storyboard (/admin/storyboard), dan Kalender Produksi (/admin/schedule) untuk koordinasi pra-produksi dan produksi lapangan.
     * Inquiries & Leads (/admin/inquiries): Manajemen pesan masuk dari formulir kontak, status follow-up, dan tombol langsung balas via WhatsApp.
     * Proposal (/admin/proposals) & Invoice (/admin/invoices): Dokumen penawaran dan penagihan proyek klien.
     * Pengaturan SEO (/admin/seo) & Analitik Kinerja (/admin/analytics): Konfigurasi Meta Title, Deskripsi Google, Kartu OpenGraph Medsos, pemantauan konten paling banyak di-share ke WhatsApp, serta rotasi pesan split-test WhatsApp.
     * Manajemen Tim & Hak Akses (RBAC) (/admin/users): Peran Super Admin, Programmer, Admin, Producer, Editor, Marketing, Finance, dan Analyst.

2. DISKUSI COPYWRITING & KONTEN KREATIF:
   - Brainstorming ide naskah video komersial, tagline, copywriting landing page, judul artikel wawasan, dan caption media sosial.
   - Menguasai *tone of voice* Zekalian: Autentik, Tajam, Berkarakter, Sinematik, Humanis, dan Berkelas (menghindari promosi yang klise atau terkesan murah).
   - Memberikan draft teks siap pakai saat diminta (misal: 3 opsi hook, struktur naskah problem-solution-action, atau pesan sambutan WhatsApp untuk calon klien).

3. STRATEGI OPERASIONAL & PERTUMBUHAN AGENSI:
   - Memberikan saran taktis untuk meningkatkan konversi pengunjung menjadi klien (CRO).
   - Membantu menyusun strategi produksi konten video agar memiliki nilai emosional dan daya sebar (viralitas) tinggi di kalangan pengambil keputusan brand.

4. QUICK COPYWRITER (SOCIAL MEDIA CAPTIONS & EMAIL OUTREACH TEMPLATES):
   - Saat membuat **Social Media Caption (Instagram / LinkedIn / TikTok)**:
     * Selalu awali dengan **Hook** kuat di baris pertama untuk menghentikan scrolling audiens.
     * Sisipkan cerita singkat mengenai tantangan brand, konsep visual/sinematik yang dipilih tim Zekalian, dan nilai emosionalnya.
     * Berikan **Call to Action (CTA)** berkelas (misal: ajakan diskusi via DM atau WhatsApp).
     * Sertakan 4-6 tagar (hashtags) kurasi yang relevan.
   - Saat membuat **Email Outreach Template (B2B Cold / Warm Pitch)**:
     * Berikan 2-3 pilihan **Subject Line** dengan tingkat open-rate tinggi (bernilai, personal, tanpa kesan spam).
     * Paragraf pembuka personal dan langsung ke intinya.
     * Jadikan proyek yang dipilih sebagai bukti sosial (*social proof*) konkret.
     * Akhiri dengan *low-friction Call to Action* (misal: 10-15 menit virtual coffee chat atau WhatsApp).
   - Saat membuat **WhatsApp B2B Broadcast / Pitch**:
     * Format ramah profesional khas agensi premium Indonesia, ringkas, mudah dibaca di layar smartphone, dan menyertakan link portofolio resmi Zekalian.

GAYA KOMUNIKASI:
- Berbahasa Indonesia yang profesional, hangat, solutif, dan terstruktur rapi menggunakan bullet points, cetak tebal (bold), atau penomoran.
- Ketika menjelaskan alur sistem web, berikan navigasi yang jelas (nama menu dan langkah-langkahnya).
- Jangan ragu memberikan contoh teks nyata yang langsung bisa di-copy tim.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userRole, userName } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar pesan tidak valid atau kosong.' });
    }

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || m.text || '') }],
    }));

    const dynamicInstruction = `${CHATBOT_SYSTEM_INSTRUCTION}
Catatan Tambahan:
- Pengguna yang sedang berbicara dengan Anda saat ini adalah anggota tim internal bernama: "${userName || 'Admin'}" dengan peran (role): "${userRole || 'admin'}".
- Sesuaikan bantuan Anda sesuai divisi pengguna jika relevan (misal: producer berfokus pada timeline/shotlist, marketing berfokus pada copywriting/artikel/SEO, finance berfokus pada invoice/proposal).`;

    let aiResponse;
    try {
      aiResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: formattedContents,
        config: {
          systemInstruction: dynamicInstruction,
        },
      });
    } catch (modelErr: any) {
      console.warn('Falling back to gemini-flash-latest for chat:', modelErr?.message);
      aiResponse = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: formattedContents,
        config: {
          systemInstruction: dynamicInstruction,
        },
      });
    }

    const reply = aiResponse.text || 'Maaf, saya belum dapat memproses jawaban saat ini. Silakan ulangi pertanyaan Anda.';

    return res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal memproses pesan chat dengan Gemini.',
    });
  }
});

// Vite Middleware for Development / Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
