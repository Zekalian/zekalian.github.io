import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Trash2,
  Copy,
  Check,
  FolderKanban,
  Share2,
  Mail,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AdminFloatingChatWidgetProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export const AdminFloatingChatWidget: React.FC<AdminFloatingChatWidgetProps> = ({
  onNavigate,
  currentRoute,
}) => {
  const { currentUser, projects } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Copywriter State
  const [showQuickCopy, setShowQuickCopy] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects.length > 0 ? projects[0].id : '';
  });
  const [selectedFormat, setSelectedFormat] = useState<string>('social_caption');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('zekalian_admin_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-widget',
        role: 'model',
        content: `Halo **${currentUser?.full_name || currentUser?.username || 'Admin'}**! Butuh bantuan terkait sistem, panduan fitur, atau copywriting konten? Tanyakan langsung atau klik **Quick Copy**!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    if (isOpen && chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom || isLoading) {
        scrollToBottom(true);
      }
    }
  }, [messages.length, isOpen, isLoading]);

  useEffect(() => {
    try {
      localStorage.setItem('zekalian_admin_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // If currently on the dedicated full-page /admin/ai-assistant, hide the floating button to prevent clutter
  if (currentRoute === '/admin/ai-assistant') {
    return null;
  }

  // Only show for logged in admin users
  if (!currentUser) {
    return null;
  }

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
        content: `⚠️ Gagal menghubungi AI: ${err.message || 'Coba lagi beberapa saat.'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerQuickCopy = () => {
    if (!selectedProject) return;

    let formatName = 'Instagram & TikTok Caption';
    if (selectedFormat === 'linkedin') formatName = 'LinkedIn B2B Case Study Post';
    if (selectedFormat === 'email') formatName = 'Cold Email Outreach Pitch Template';
    if (selectedFormat === 'whatsapp') formatName = 'WhatsApp Direct B2B Pitch';

    const promptText = `Tolong buatkan **${formatName}** berdasarkan proyek portofolio Zekalian:
- Proyek: ${selectedProject.title} (Klien: ${selectedProject.client_name})
- Kategori: ${selectedProject.category?.name || 'Commercial Video & Branding'}
- Deskripsi: ${selectedProject.description || 'Karya produksi kreatif Zekalian.'}
${selectedProject.deliverables ? `- Deliverables: ${selectedProject.deliverables.join(', ')}` : ''}
${selectedProject.impact_metric ? `- Metrik: ${selectedProject.impact_metric}` : ''}

Buatkan copy yang bernilai tinggi, siap pakai, dan memiliki daya tarik kuat!`;

    handleSendMessage(promptText);
    setShowQuickCopy(false);
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-slate-900 via-indigo-900 to-[#005DDD] text-white shadow-2xl hover:shadow-indigo-500/30 hover:scale-105 transition-all cursor-pointer border border-indigo-500/40 group"
          title="Buka ZetAI Admin Copilot"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-sky-300">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>ZetAI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </span>
            <span className="block text-[10px] text-slate-300 font-medium">
              Quick Copy &amp; Sistem
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-3.5 flex items-center justify-between border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#005DDD] to-indigo-500 p-0.5 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-sky-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-tight">ZetAI Assistant</h3>
                  <button
                    onClick={() => setShowQuickCopy(!showQuickCopy)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#005DDD] text-white hover:bg-sky-500 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Quick Copy</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Panduan sistem, naskah &amp; outreach
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onNavigate && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('/admin/ai-assistant');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Buka Halaman Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tutup Obrolan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Copy Mini Builder Dropdown */}
          {showQuickCopy && (
            <div className="p-3 bg-slate-900 text-white border-b border-indigo-900/60 space-y-2 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Copywriter Proyek</span>
                </span>
                <button
                  onClick={() => setShowQuickCopy(false)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  Tutup
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Pilih Proyek:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} &bull; {p.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('social_caption')}
                  className={`p-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all ${
                    selectedFormat === 'social_caption'
                      ? 'bg-[#005DDD] border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  📱 Caption Sosmed
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('linkedin')}
                  className={`p-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all ${
                    selectedFormat === 'linkedin'
                      ? 'bg-[#005DDD] border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  💼 LinkedIn Case Study
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('email')}
                  className={`p-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all ${
                    selectedFormat === 'email'
                      ? 'bg-[#005DDD] border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  ✉️ Email Outreach
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('whatsapp')}
                  className={`p-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all ${
                    selectedFormat === 'whatsapp'
                      ? 'bg-[#005DDD] border-sky-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  💬 WhatsApp B2B
                </button>
              </div>

              <button
                type="button"
                onClick={handleTriggerQuickCopy}
                disabled={isLoading || !selectedProject}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#005DDD] to-indigo-600 text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Copy</span>
              </button>
            </div>
          )}

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold shadow-2xs ${
                      isUser
                        ? 'bg-[#005DDD] text-white'
                        : 'bg-gradient-to-tr from-slate-900 to-indigo-900 text-sky-300'
                    }`}
                  >
                    {isUser
                      ? (currentUser?.full_name || currentUser?.username || 'AD').slice(0, 2).toUpperCase()
                      : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed shadow-2xs relative group ${
                      isUser
                        ? 'bg-[#005DDD] text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {!isUser && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-[#005DDD] transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 mr-auto">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-sky-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005DDD] animate-ping" />
                  <span>ZetAI sedang merumuskan copy...</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tanyakan sistem web atau ide copywriting..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005DDD] focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
