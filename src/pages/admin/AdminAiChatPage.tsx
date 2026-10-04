import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types/database';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  FileText,
  Video,
  Share2,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  SlidersHorizontal,
  Flame,
  Globe2,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const COPY_FORMATS = [
  {
    id: 'social_caption',
    name: 'Instagram & TikTok Caption',
    icon: Share2,
    badge: 'Sosial Media',
    description: 'Hook memikat di baris pertama, storytelling konsep visual, CTA WhatsApp/DM, & kurasi hashtag.',
  },
  {
    id: 'linkedin_post',
    name: 'LinkedIn B2B Case Study',
    icon: FileText,
    badge: 'B2B Authority',
    description: 'Tantangan brand, pendekatan strategis Zekalian, deliverables, & wawasan kepemimpinan bagi founder/CMO.',
  },
  {
    id: 'email_outreach',
    name: 'Email Outreach Template',
    icon: Mail,
    badge: 'Cold / Warm Pitch',
    description: '2-3 opsi Subject Line pemikat, opening personal, studi kasus relevan, & ajakan 15 menit diskusi santai.',
  },
  {
    id: 'whatsapp_pitch',
    name: 'WhatsApp B2B Broadcast',
    icon: MessageSquare,
    badge: 'Direct WhatsApp',
    description: 'Pesan ramah & berkelas untuk calon klien, to-the-point, ringkasan deliverables, & link portofolio.',
  },
];

const TONE_OPTIONS = [
  { id: 'authentic_cinematic', name: 'Autentik & Sinematik (Khas Zekalian)' },
  { id: 'b2b_roi', name: 'B2B Korporat & ROI Focus' },
  { id: 'bold_provocative', name: 'Bold, Berani & Provokatif' },
  { id: 'human_storytelling', name: 'Hangat & Storytelling Humanis' },
];

const STARTER_PROMPTS = [
  {
    category: 'Sistem & Fitur Web',
    icon: Video,
    prompt: 'Bagaimana cara kerja fitur Milestones & Client Tracking Portal di web Zekalian?',
  },
  {
    category: 'Copywriting Naskah',
    icon: FileText,
    prompt: 'Buatkan 3 konsep hook dan naskah video pendek 30 detik untuk brand lifestyle lokal dengan tone sinematik autentik.',
  },
  {
    category: 'Strategi WhatsApp & Leads',
    icon: Share2,
    prompt: 'Bagaimana cara kerja split-testing template pesan WhatsApp dan bagaimana tips meningkatkan konversi leads?',
  },
  {
    category: 'Ide Konten Artikel',
    icon: Lightbulb,
    prompt: 'Berikan 3 usulan topik artikel wawasan industri kreatif yang berpotensi menarik perhatian brand korporat.',
  },
];

export const AdminAiChatPage: React.FC = () => {
  const { currentUser, projects } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('zekalian_admin_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: `Halo **${currentUser?.full_name || currentUser?.username || 'Tim Zekalian'}**! 👋\n\nSaya **ZetAI**, asisten AI khusus internal tim Zekalian Agency.\n\n✨ **Fitur Baru**: Anda sekarang bisa menggunakan menu **"Quick Copywriter"** di atas untuk secara otomatis menyusun **Caption Instagram/TikTok**, **Post LinkedIn B2B**, atau **Template Email Outreach Klien Baru** berdasarkan detail proyek portofolio kita!\n\nAda yang ingin kita buat atau tanyakan hari ini?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Copywriter State
  const [isQuickCopyOpen, setIsQuickCopyOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects.length > 0 ? projects[0].id : '';
  });
  const [selectedFormat, setSelectedFormat] = useState<string>('social_caption');
  const [selectedTone, setSelectedTone] = useState<string>('authentic_cinematic');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [customAngle, setCustomAngle] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialMount = useRef(true);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    // Avoid sudden scroll on initial page mount so header and controls stay in view
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

    // Only auto-scroll inside container if user is already near bottom
    if (isNearBottom) {
      scrollToBottom(true);
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    try {
      localStorage.setItem('zekalian_admin_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setTimeout(() => scrollToBottom(true), 50);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userRole: currentUser?.role || 'admin',
          userName: currentUser?.full_name || currentUser?.username || 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menerima balasan dari AI.');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Maaf, terjadi kendala saat menghubungi AI:**\n${err.message || 'Silakan coba beberapa saat lagi.'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuickCopy = () => {
    if (!selectedProject) {
      alert('Silakan pilih proyek terlebih dahulu.');
      return;
    }

    const formatObj = COPY_FORMATS.find((f) => f.id === selectedFormat) || COPY_FORMATS[0];
    const toneObj = TONE_OPTIONS.find((t) => t.id === selectedTone) || TONE_OPTIONS[0];

    const promptText = `Tolong buatkan **${formatObj.name}** berdasarkan proyek portofolio Zekalian berikut ini:

📋 **DETAIL PROYEK REFERENSI**:
- **Judul Proyek**: ${selectedProject.title}
- **Nama Klien/Brand**: ${selectedProject.client_name}
- **Kategori**: ${selectedProject.category?.name || 'Branding & Video Production'}
- **Deskripsi Ringkas**: ${selectedProject.description || 'Studi kasus produksi kreatif Zekalian.'}
${selectedProject.deliverables && selectedProject.deliverables.length > 0 ? `- **Deliverables**: ${selectedProject.deliverables.join(', ')}` : ''}
${selectedProject.impact_metric ? `- **Metrik Keberhasilan/Dampak**: ${selectedProject.impact_metric}` : ''}
${selectedProject.tags && selectedProject.tags.length > 0 ? `- **Kata Kunci/Tags**: ${selectedProject.tags.join(', ')}` : ''}

🎯 **SPESIFIKASI KONTEN**:
- **Format Target**: ${formatObj.name} (${formatObj.description})
- **Gaya Bahasa (Tone of Voice)**: ${toneObj.name}
${targetAudience.trim() ? `- **Target Audiens/Calon Klien**: ${targetAudience.trim()}` : ''}
${customAngle.trim() ? `- **Fokus/Pesan Tambahan**: ${customAngle.trim()}` : ''}

Berikan teks copywriting yang lengkap, terstruktur rapi, siap dipublikasikan atau dikirimkan ke prospek klien!`;

    handleSendMessage(promptText);
    setIsQuickCopyOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat obrolan dengan ZetAI?')) {
      const initial: ChatMessage[] = [
        {
          id: 'welcome-reset',
          role: 'model',
          content: `Obrolan telah dibersihkan. Halo **${currentUser?.full_name || currentUser?.username || 'Admin'}**, ada yang bisa saya bantu sekarang?`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(initial);
      localStorage.removeItem('zekalian_admin_chat_history');
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper formatting for markdown text
  const formatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine: React.ReactNode = line;

      const parts = line.split(/(\*\*.*?\*\*)/g);
      if (parts.length > 1) {
        formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });
      }

      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 leading-relaxed my-0.5">
            {typeof formattedLine === 'string' ? formattedLine.slice(2) : formattedLine}
          </li>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-700 leading-relaxed my-0.5">
            {formattedLine}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed text-slate-700 my-0.5">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 mb-4 bg-white/70 backdrop-blur-md px-6 py-4 rounded-3xl border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#005DDD] via-indigo-600 to-sky-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-sky-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ZetAI Copilot
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                Gemini Flash
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Admin Ops Companion, System Guide &amp; Quick Copywriter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Copywriter Toggle Button */}
          <button
            onClick={() => setIsQuickCopyOpen(!isQuickCopyOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isQuickCopyOpen
                ? 'bg-gradient-to-r from-[#005DDD] to-indigo-600 text-white border-transparent shadow-indigo-500/20'
                : 'bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Copywriter</span>
            {isQuickCopyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-all cursor-pointer"
            title="Bersihkan riwayat percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expandable Quick Copywriter Studio Panel */}
      {isQuickCopyOpen && (
        <div className="mb-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border border-indigo-800/40 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#005DDD]/30 border border-[#005DDD]/50 flex items-center justify-center text-sky-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Quick Copywriter Studio</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    Proyek &rarr; Copy
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Pilih proyek portofolio, tentukan format, dan biarkan Gemini menyusun konten sosial media atau email outreach siap kirim.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsQuickCopyOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Project & Format Selection */}
            <div className="lg:col-span-7 space-y-4">
              {/* Select Project */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#005DDD]" />
                  <span>1. Pilih Proyek Portofolio Zekalian</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#005DDD] focus:border-transparent transition-all cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.title} &bull; {p.client_name} ({p.category?.name || 'Portofolio'})
                    </option>
                  ))}
                </select>

                {/* Selected Project Quick Preview */}
                {selectedProject && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{selectedProject.title}</span>
                      <span className="text-[11px] text-sky-300">Klien: {selectedProject.client_name}</span>
                    </div>
                    {selectedProject.deliverables && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#005DDD]/30 text-sky-200">
                        {selectedProject.deliverables.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Select Format */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Pilih Format Output</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COPY_FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#005DDD]/40 border-sky-400 ring-1 ring-sky-400'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-sky-300" />
                            {fmt.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                          {fmt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Tone, Audience & Generate Button */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Tone of Voice */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    3. Gaya Bahasa (Tone of Voice)
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#005DDD] cursor-pointer"
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Audience / Industry */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Target Audiens / Industri (Opsional)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Contoh: Brand Owner Kuliner, Direktur Marketing..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005DDD]"
                  />
                </div>

                {/* Custom Angle / Hook Note */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Pesan Khusus / Sudut Pandang (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customAngle}
                    onChange={(e) => setCustomAngle(e.target.value)}
                    placeholder="Contoh: Tekankan proses color grading sinematik..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005DDD]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateQuickCopy}
                disabled={isLoading || !selectedProject}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005DDD] via-indigo-600 to-sky-500 hover:from-[#004bb5] hover:to-sky-600 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Copywriting Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Scrollable Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {/* Starter Prompts when conversation is short */}
        {messages.length <= 2 && !isQuickCopyOpen && (
          <div className="mb-4 p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-white border border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Contoh Topik yang Bisa Anda Tanyakan:</span>
              </div>

              <button
                onClick={() => setIsQuickCopyOpen(true)}
                className="text-xs font-bold text-[#005DDD] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Buka Quick Copywriter Studio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_PROMPTS.map((sp, idx) => {
                const Icon = sp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    disabled={isLoading}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#005DDD] hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#005DDD]">
                        <Icon className="w-3.5 h-3.5" />
                        {sp.category}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#005DDD] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      &ldquo;{sp.prompt}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-[#005DDD] text-white'
                    : 'bg-gradient-to-tr from-slate-900 to-indigo-900 text-sky-300'
                }`}
              >
                {isUser ? (
                  (currentUser?.full_name || currentUser?.username || 'AD').slice(0, 2).toUpperCase()
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`rounded-3xl p-4 sm:p-5 shadow-xs border relative group ${
                  isUser
                    ? 'bg-[#005DDD] text-white border-transparent rounded-tr-xs'
                    : 'bg-white border-slate-200/90 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Role & Timestamp */}
                <div
                  className={`flex items-center justify-between gap-4 text-[10px] font-semibold mb-2 ${
                    isUser ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  <span>{isUser ? 'Anda' : 'ZetAI'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content */}
                <div
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isUser ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    formatText(msg.content)
                  )}
                </div>

                {/* Copy Action & Quick Follow-up Pills (for Model replies) */}
                {!isUser && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Follow-up refinement chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() =>
                          handleSendMessage(
                            'Tolong buatkan 3 variasi hook pembuka yang lebih provokatif dan scroll-stopping untuk copy di atas.'
                          )
                        }
                        disabled={isLoading}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Flame className="w-2.5 h-2.5 text-amber-500" />
                        <span>3 Variasi Hook Lain</span>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            'Tolong adaptasikan teks copywriting di atas ke dalam Bahasa Inggris yang natural, berkelas, dan bergaya agensi kreatif global.'
                          )
                        }
                        disabled={isLoading}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Globe2 className="w-2.5 h-2.5 text-sky-500" />
                        <span>English Version</span>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            'Tolong buatkan versi yang lebih ringkas dan padat (maksimal 2-3 kalimat tajam) untuk teks di atas.'
                          )
                        }
                        disabled={isLoading}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Scissors className="w-2.5 h-2.5 text-indigo-500" />
                        <span>Versi Singkat</span>
                      </button>
                    </div>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#005DDD] hover:bg-slate-50 transition-colors cursor-pointer ml-auto"
                      title="Salin isi teks jawaban"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-sky-300 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-3xl rounded-tl-xs p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-[#005DDD] animate-ping" />
                <span className="font-semibold">ZetAI sedang merumuskan copywriting &amp; ide...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-slate-200/80 bg-white/60 backdrop-blur-md rounded-3xl p-3 border shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 focus-within:border-[#005DDD] focus-within:ring-2 focus-within:ring-[#005DDD]/20 transition-all p-2 flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sistem web, minta caption sosial media, atau draft email outreach (Enter kirim, Shift+Enter baris baru)..."
              disabled={isLoading}
              className="w-full resize-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 max-h-32 px-2 py-1 leading-relaxed bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 rounded-2xl bg-[#005DDD] hover:bg-[#004bb5] text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-[#005DDD]/25 cursor-pointer"
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-3 pt-2">
          <span>
            Khusus internal Zekalian Agency &bull; Ditenagai model Gemini AI
          </span>
          <span className="font-mono">
            Role: <strong className="text-slate-700 capitalize">{currentUser?.role || 'Admin'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
