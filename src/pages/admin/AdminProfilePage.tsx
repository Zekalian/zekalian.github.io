import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AdminUser } from '../../types/database';
import { isWebPFile } from '../../lib/firebase';
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Shield,
  Camera,
  Upload,
  Trash2,
  Key,
  Check,
  AlertCircle,
  Save,
  Lock,
  Sparkles,
} from 'lucide-react';

interface AdminProfilePageProps {
  onNavigate?: (route: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
];

export const AdminProfilePage: React.FC<AdminProfilePageProps> = () => {
  const { currentUser, updateUserProfile, addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-slate-500">
        Silakan login terlebih dahulu untuk mengakses laman profil.
      </div>
    );
  }

  const canEditRole = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  // Form State
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      addToast('Foto profil yang diunggah wajib berformat .WEBP atau masukkan tautan link URL avatar.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran gambar maksimal 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        addToast('Foto profil berhasil dimuat.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      addToast('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    if (!username.trim()) {
      addToast('Username tidak boleh kosong.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      addToast('Format email tidak valid.', 'error');
      return;
    }

    if (isChangingPassword) {
      if (newPassword.length < 6) {
        addToast('Kata sandi baru minimal 6 karakter.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('Konfirmasi kata sandi tidak cocok.', 'error');
        return;
      }
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    const cleanWhatsapp = whatsapp.trim().replace(/[^0-9+]/g, '');

    const profileUpdates: Partial<AdminUser> = {
      full_name: fullName.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      whatsapp: cleanWhatsapp,
      linkedin: linkedin.trim(),
      avatar_url: avatarUrl.trim(),
      role: canEditRole ? selectedRole : currentUser.role,
    };

    if (isChangingPassword && newPassword) {
      profileUpdates.password = newPassword;
    }

    const success = updateUserProfile(currentUser.id, profileUpdates);

    if (success) {
      if (isChangingPassword) {
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      }
    }
  };

  const roleLabels: Record<UserRole, { title: string; badge: string; desc: string }> = {
    super_admin: {
      title: 'Super Admin',
      badge: 'bg-[#005DDD]/10 text-[#005DDD] border-[#005DDD]/20',
      desc: 'Kontrol penuh sistem, pengaturan agensi, dan hak akses pengguna.',
    },
    admin: {
      title: 'Admin',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      desc: 'Kelola tim kru, kotak masuk penawaran, portofolio, dan artikel.',
    },
    programmer: {
      title: 'Programmer',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Sistem engineering, perbaikan bug, dan manajemen infrastruktur.',
    },
    producer: {
      title: 'Producer (Production)',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Fokus pada produksi visual, shot list, brief, dan portofolio proyek.',
    },
    finance: {
      title: 'Finance (Invoices)',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Fokus pada pembuatan invoice, penawaran harga, dan proposal finansial.',
    },
    marketing: {
      title: 'Marketing & SEO',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Fokus pada optimasi SEO, artikel jurnal, dan logo showcase.',
    },
    editor: {
      title: 'Content Editor',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      desc: 'Kelola konten portofolio proyek dan artikel publikasi.',
    },
    analyst: {
      title: 'Analyst (Read-Only)',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Hanya memiliki hak akses baca (monitoring data).',
    },
    pending: {
      title: 'Pending Approval',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Menunggu persetujuan hak akses dari Super Admin.',
    },
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
          <User className="w-4 h-4" />
          <span>Pengaturan Akun Pengguna</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola informasi identitas akun, foto profil, WhatsApp, LinkedIn, email, dan username Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Live Profile Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 text-center">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center mx-auto">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-2xl font-black text-slate-700">
                    {getInitials(fullName || currentUser.full_name)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-[#005DDD] text-white shadow-md hover:bg-[#018EE3] transition-all"
                title="Unggah Foto Baru"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {fullName || 'Nama Anda'}
              </h3>
              <p className="text-xs font-mono text-slate-500">
                @{username ? username.replace(/^@/, '') : 'username'}
              </p>
              <div className="mt-2.5">
                <span
                  className={`inline-block px-3 py-1 rounded-full border text-[11px] font-black uppercase ${
                    roleLabels[canEditRole ? selectedRole : currentUser.role].badge
                  }`}
                >
                  {roleLabels[canEditRole ? selectedRole : currentUser.role].title}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{email || 'Belum diatur'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{whatsapp || 'Belum diatur'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{linkedin || 'Belum diatur'}</span>
              </div>
            </div>
          </div>

          {/* Role Access Notice */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Shield className="w-4 h-4 text-[#005DDD]" />
              <span>Kebijakan Hak Akses (RBAC)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Setiap pengguna dapat memperbarui identitas profil diri secara bebas. Pengubahan peran
              (role) hanya dapat dilakukan oleh <strong>Super Admin</strong> dan <strong>Admin</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Edit Informasi Profil
            </h2>

            {/* Foto Profil / Avatar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="block text-xs uppercase font-bold text-slate-700">
                  Foto Profil (Avatar)
                </label>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005DDD] font-bold border border-blue-200/80 px-2.5 py-0.5 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]"></span>
                  <span>Wajib Format .WebP atau Gunakan Tautan Link (URL)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau URL foto"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/webp,.webp"
                  className="hidden"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Avatar Selection */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">
                  Atau pilih avatar standar profesional:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform shrink-0 hover:scale-105 ${
                        avatarUrl === preset ? 'border-[#005DDD] ring-2 ring-[#005DDD]/30' : 'border-transparent'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nama Lengkap & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-3.5 top-2.5 text-xs font-mono font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="username_anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>
            </div>

            {/* Email Resmi & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                  Email Resmi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="email@zekalian.web.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="6281234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Format angka internasional (contoh: 6281234567890)
                </span>
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1.5">
                Tautan Profil LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#005DDD]"
                />
              </div>
            </div>

            {/* Role / Hak Akses */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase font-bold text-slate-700">
                  Peran &amp; Hak Akses (Role)
                </label>
                {canEditRole ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span>Dapat Diubah (Super Admin &amp; Admin)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Lock className="w-3 h-3" />
                    <span>Terkunci</span>
                  </span>
                )}
              </div>

              {canEditRole ? (
                <div className="space-y-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#005DDD] bg-white"
                  >
                    <option value="super_admin">Super Admin (Kontrol Penuh Sistem &amp; RBAC)</option>
                    <option value="admin">Admin (Kelola Tim, Kotak Masuk, &amp; Konten)</option>
                    <option value="editor">Editor (CRUD Portofolio Proyek &amp; Artikel)</option>
                    <option value="analyst">Analyst (Akses Baca Saja / Read-Only)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Sebagai {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}, Anda memiliki izin untuk mengubah tingkatan peran.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-700">
                      Peran Anda saat ini: <span className="uppercase text-[#005DDD]">{currentUser.role}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pengubahan peran akun hanya diizinkan untuk <strong>Super Admin</strong> dan <strong>Admin</strong>. Silakan hubungi pimpinan agensi jika Anda membutuhkan eskalasi hak akses.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#005DDD] hover:underline"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isChangingPassword ? 'Batalkan Ganti Kata Sandi' : 'Ganti Kata Sandi Akun'}</span>
                </button>
              </div>

              {isChangingPassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      Ulangi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Konfirmasi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white text-xs font-bold shadow-md shadow-[#005DDD]/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
