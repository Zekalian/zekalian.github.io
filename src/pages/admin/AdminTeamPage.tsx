import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../types/database';
import { uploadFileToStorage, isWebPFile } from '../../lib/firebase';
import { ImgbbGuideButton, ImgbbViewerLinkWarning } from '../../components/admin/ImgbbGuideButton';
import { Users, Plus, Trash2, Edit2, ShieldAlert, Check, X, UploadCloud, Loader2, Link as LinkIcon } from 'lucide-react';

export const AdminTeamPage: React.FC = () => {
  const { teamMembers, saveTeamMember, deleteTeamMember, currentUser } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [defaultRole, setDefaultRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const canManage = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFullName('');
    setDefaultRole('');
    setBio('');
    setAvatarUrl('');
    setOrderIndex(teamMembers.length + 1);
    setIsActive(true);
  };

  const handleStartEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setFullName(m.full_name);
    setDefaultRole(m.default_role);
    setBio(m.bio || '');
    setAvatarUrl(m.avatar_url || '');
    setOrderIndex(m.order_index);
    setIsActive(m.is_active ?? true);
    setIsAdding(true);
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      alert('Format file ditolak: Foto tim yang diunggah wajib berformat .WEBP. Silakan unggah file .webp atau gunakan tautan URL gambar.');
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadFileToStorage(file, 'team_avatars');
      setAvatarUrl(url);
    } catch (err: any) {
      alert('Gagal mengunggah foto tim: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !defaultRole.trim()) return;

    saveTeamMember({
      id: editingId || undefined,
      full_name: fullName,
      default_role: defaultRole.toUpperCase(),
      bio,
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      order_index: Number(orderIndex),
      is_active: isActive,
    });

    resetForm();
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Users className="w-4 h-4" />
            <span>Creative Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Tim &amp; Kru Agensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar talenta dan kru yang dapat ditugaskan pada setiap proyek portofolio.
          </p>
        </div>

        {canManage && !isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota Kru</span>
          </button>
        )}
      </div>

      {!canManage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Peran Anda adalah <strong>{currentUser?.role?.toUpperCase()}</strong>. Manajemen data tim memerlukan izin minimal <strong>Admin</strong> atau <strong>Super Admin</strong>.
          </span>
        </div>
      )}

      {/* Form Drawer */}
      {isAdding && canManage && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900">
            {editingId ? 'Edit Anggota Tim' : 'Tambah Anggota Tim Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Zaki Fadhillah Andri"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Peran Utama (Default Role) *
              </label>
              <input
                type="text"
                required
                placeholder="DIRECTOR / EXECUTIVE PRODUCER"
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            {/* Avatar WebP Upload & Link */}
            <div className="sm:col-span-2 space-y-2 border-t border-slate-100 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="block text-xs uppercase font-bold text-slate-700">
                  Foto Kru / Avatar
                </label>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005DDD] font-bold border border-blue-200/80 px-2.5 py-0.5 rounded-lg text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#005DDD]"></span>
                  <span>Wajib Format .WebP atau Gunakan Tautan Link (URL)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      accept="image/webp,.webp"
                      className="hidden"
                      onChange={handleAvatarFileUpload}
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Unggah File .WebP</span>
                        </>
                      )}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Atau tempel URL gambar (ImgBB / Cloud):</span>
                      </span>
                      <ImgbbGuideButton size="xs" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://i.ibb.co/... atau URL gambar langsung"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                    />
                    <ImgbbViewerLinkWarning url={avatarUrl} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
              Biografi Singkat
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan latar belakang spesialisasi..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#005DDD] w-4 h-4"
              />
              <span>Aktif ditampilkan di Halaman Tim</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3]"
            >
              {editingId ? 'Simpan Pembaruan' : 'Tambahkan Anggota'}
            </button>
          </div>
        </form>
      )}

      {/* Team Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((m) => (
          <div
            key={m.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={m.avatar_url}
                    alt={m.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {m.full_name}
                  </h4>
                  <span className="text-[10px] font-black uppercase text-[#005DDD] block mt-0.5 tracking-wider truncate">
                    {m.default_role}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Urutan: #{m.order_index}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#334155] line-clamp-3 leading-relaxed">
                {m.bio}
              </p>
            </div>

            {canManage && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {m.is_active ? 'Aktif' : 'Non-aktif'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(m)}
                    className="p-1.5 text-slate-400 hover:text-[#005DDD]"
                    title="Edit Profil"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus anggota tim ${m.full_name}?`)) {
                        deleteTeamMember(m.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Hapus Anggota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
