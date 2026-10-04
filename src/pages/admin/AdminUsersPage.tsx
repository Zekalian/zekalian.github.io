import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AdminUser } from '../../types/database';
import { ImgbbGuideButton, ImgbbViewerLinkWarning } from '../../components/admin/ImgbbGuideButton';
import {
  Shield,
  UserPlus,
  ShieldAlert,
  Edit,
  Trash2,
  Phone,
  Linkedin,
  Mail,
  Check,
  Lock,
  User,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { adminUsers, createAdminUser, updateUserProfile, deleteAdminUser, approveUserAccess, rejectUserAccess, currentUser, addToast } = useApp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('editor');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const canManageRoles = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  const pendingRequests = adminUsers.filter(
    (u) => u.account_status === 'PENDING_APPROVAL' || u.role === 'pending'
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRoles) {
      addToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat menambah pengguna.', 'error');
      return;
    }

    const success = createAdminUser({
      username: username.toLowerCase().trim().replace(/^@/, ''),
      email: email.toLowerCase().trim(),
      full_name: fullName.trim(),
      role,
      whatsapp: whatsapp.trim().replace(/[^0-9+]/g, ''),
      linkedin: linkedin.trim(),
      avatar_url: avatarUrl.trim(),
      password,
    });

    if (success) {
      setUsername('');
      setEmail('');
      setFullName('');
      setPassword('');
      setWhatsapp('');
      setLinkedin('');
      setAvatarUrl('');
      setShowAddModal(false);
    }
  };

  const handleStartEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditWhatsapp(user.whatsapp || '');
    setEditLinkedin(user.linkedin || '');
    setEditAvatarUrl(user.avatar_url || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!canManageRoles) {
      addToast('Akses ditolak: Hanya Super Admin dan Admin yang dapat mengubah peran atau akun pengguna lain.', 'error');
      return;
    }

    const success = updateUserProfile(editingUser.id, {
      full_name: editFullName.trim(),
      username: editUsername.toLowerCase().trim().replace(/^@/, ''),
      email: editEmail.toLowerCase().trim(),
      role: editRole,
      whatsapp: editWhatsapp.trim().replace(/[^0-9+]/g, ''),
      linkedin: editLinkedin.trim(),
      avatar_url: editAvatarUrl.trim(),
    });

    if (success) {
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      addToast('Anda tidak dapat menghapus akun Anda sendiri.', 'error');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${user.full_name}?`)) {
      deleteAdminUser(user.id);
    }
  };

  const roleBadgeStyle: Record<UserRole, string> = {
    super_admin: 'bg-[#005DDD]/10 text-[#005DDD] border-[#005DDD]/20',
    admin: 'bg-sky-50 text-sky-700 border-sky-200',
    programmer: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    producer: 'bg-purple-50 text-purple-700 border-purple-200',
    finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    marketing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    editor: 'bg-teal-50 text-teal-700 border-teal-200',
    analyst: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const roleLabelText: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    programmer: 'Programmer',
    producer: 'Producer (Production)',
    finance: 'Finance (Invoices)',
    marketing: 'Marketing & SEO',
    editor: 'Content Editor',
    analyst: 'Analyst (Read-Only)',
    pending: 'Pending Approval',
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Shield className="w-4 h-4" />
            <span>RBAC Authorization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Pengguna Admin &amp; Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Setiap pengguna dapat mengubah profilnya sendiri. Pengubahan peran (role) hanya dapat dilakukan oleh <strong>Super Admin</strong> dan <strong>Admin</strong>.
          </p>
        </div>

        {canManageRoles && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Admin Baru</span>
          </button>
        )}
      </div>

      {!canManageRoles && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            Anda sedang masuk dengan peran <strong>{currentUser?.role}</strong> (Read-Only pada laman ini). Hanya <strong>Super Admin</strong> dan <strong>Admin</strong> yang memiliki izin membuat akun atau mengubah peran pengguna lain. Anda tetap dapat mengedit data profil akun Anda sendiri di menu <strong>Profil Saya</strong>.
          </span>
        </div>
      )}

      {/* Pending Access Requests Section */}
      {canManageRoles && pendingRequests.length > 0 && (
        <div className="bg-amber-50/90 rounded-3xl border border-amber-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {pendingRequests.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">Permohonan Akses Masuk Menunggu Persetujuan</h3>
                <p className="text-xs text-amber-700">
                  Pengguna Google berikut mendaftar dan meminta otorisasi akses internal.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((reqUser) => (
              <div key={reqUser.id} className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                      {reqUser.avatar_url ? (
                        <img src={reqUser.avatar_url} alt={reqUser.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        reqUser.full_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{reqUser.full_name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">{reqUser.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                    Pending
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div><strong>Divisi / Posisi:</strong> {reqUser.request_department || 'Belum diisi'}</div>
                  <div><strong>Peran Diminta:</strong> <span className="uppercase text-[#005DDD] font-bold">{reqUser.requested_role || 'editor'}</span></div>
                  <div><strong>Alasan:</strong> {reqUser.request_reason || 'Tidak ada catatan alasan.'}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => rejectUserAccess(reqUser.id, 'Ditolak oleh Super Admin')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => approveUserAccess(reqUser.id, reqUser.requested_role || 'editor')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui Akses ({reqUser.requested_role || 'editor'})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-6">Pengguna &amp; Profil</th>
                <th className="py-4 px-6">Kontak (WA &amp; LinkedIn)</th>
                <th className="py-4 px-6">Email Resmi</th>
                <th className="py-4 px-6">Hak Akses (Role)</th>
                <th className="py-4 px-6">Terdaftar Sejak</th>
                {canManageRoles && <th className="py-4 px-6 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>
                            {user.full_name
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{user.full_name}</span>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">@{user.username}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.whatsapp || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Linkedin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{user.linkedin || '-'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-600">{user.email}</td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                        roleBadgeStyle[user.role]
                      }`}
                    >
                      {roleLabelText[user.role]}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {canManageRoles && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#005DDD] hover:bg-slate-100 transition-colors"
                          title="Edit Pengguna & Role"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin User Modal */}
      {showAddModal && canManageRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Daftarkan Akun Admin Baru
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Buat akun pengguna baru dan tentukan hak akses peran (role).
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Zaki Fadhillah Andri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="nama_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Email Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@zekalian.web.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Hak Akses (Role RBAC) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#005DDD] bg-white"
                >
                  <option value="super_admin">Super Admin (Kontrol Penuh Sistem)</option>
                  <option value="admin">Admin (Kelola Kru, Inquiries &amp; Konten)</option>
                  <option value="producer">Producer (Fokus Produksi, Shotlist &amp; Brief)</option>
                  <option value="finance">Finance (Fokus Invoice &amp; Proposal Anggaran)</option>
                  <option value="marketing">Marketing &amp; SEO (Fokus SEO, Artikel &amp; Showcase)</option>
                  <option value="editor">Content Editor (Portofolio &amp; Artikel)</option>
                  <option value="analyst">Analyst (Akses Baca Saja / Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="6281234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Profil LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase font-bold text-slate-700">
                    Foto Profil URL (Avatar)
                  </label>
                  <ImgbbGuideButton size="xs" />
                </div>
                <input
                  type="url"
                  placeholder="https://i.ibb.co/... atau URL gambar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
                <ImgbbViewerLinkWarning url={avatarUrl} />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Kata Sandi Sementara <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3] active:scale-95 transition-all"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Role Modal */}
      {showEditModal && editingUser && canManageRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Edit Akun &amp; Hak Akses Pengguna
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Mengubah informasi profil dan peran (role) untuk @{editingUser.username}.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Email Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              {/* Role Selection: Super Admin & Admin ONLY */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase font-bold text-slate-800">
                    Peran &amp; Hak Akses (Role)
                  </label>
                  <span className="text-[10px] font-bold text-[#005DDD] bg-[#005DDD]/10 px-2 py-0.5 rounded-full">
                    Akses Admin
                  </span>
                </div>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#005DDD] bg-white"
                >
                  <option value="super_admin">Super Admin (Kontrol Penuh Sistem &amp; RBAC)</option>
                  <option value="admin">Admin (Kelola Tim, Inquiries, &amp; Konten)</option>
                  <option value="producer">Producer (Fokus Produksi, Shotlist &amp; Brief)</option>
                  <option value="finance">Finance (Fokus Invoice &amp; Proposal Anggaran)</option>
                  <option value="marketing">Marketing &amp; SEO (Fokus SEO, Artikel &amp; Showcase)</option>
                  <option value="editor">Content Editor (Portofolio &amp; Artikel)</option>
                  <option value="analyst">Analyst (Akses Baca Saja / Read-Only)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Hanya Super Admin dan Admin yang dapat mengubah hak akses ini.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="6281234567890"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                  Profil LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase font-bold text-slate-700">
                    Foto Profil URL (Avatar)
                  </label>
                  <ImgbbGuideButton size="xs" />
                </div>
                <input
                  type="url"
                  placeholder="https://i.ibb.co/... atau URL gambar"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#005DDD]"
                />
                <ImgbbViewerLinkWarning url={editAvatarUrl} />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3] active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
