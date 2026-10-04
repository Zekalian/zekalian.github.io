import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  Inbox,
  Receipt,
  Bug,
  Users,
  Calendar,
  Check,
  Trash2,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminNotification } from '../../types/database';

interface NotificationCenterProps {
  onNavigate: (route: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { inquiries, adminUsers } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize notifications from real system events
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('zekalian_admin_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'notif-1',
        title: 'Pesan Tim Baru di Kanal General',
        message: 'Kru produksi mengunggah update moodboard syuting iklan.',
        type: 'chat',
        link: '/admin/chat',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        is_read: false,
        priority: 'normal',
      },
      {
        id: 'notif-2',
        title: 'Jadwal Produksi Mendatang',
        message: 'Shooting Day #1 untuk Proyek Commercial Nike Autumn dimulai lusa.',
        type: 'schedule',
        link: '/admin/schedule',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        is_read: false,
        priority: 'high',
      },
    ];
  });

  // Sync unread inquiries into notifications
  useEffect(() => {
    const unreadInquiries = inquiries.filter((inq) => inq.status === 'NEW');
    if (unreadInquiries.length > 0) {
      setNotifications((prev) => {
        const existingInqIds = new Set(prev.map((n) => n.id));
        const newNotifs: AdminNotification[] = unreadInquiries
          .filter((inq) => !existingInqIds.has(`inq-${inq.id}`))
          .map((inq) => ({
            id: `inq-${inq.id}`,
            title: `Inquiry Klien Baru: ${inq.name || 'Klien'}`,
            message: inq.project_vision ? inq.project_vision.slice(0, 80) + '...' : 'Pesan konsultasi proyek baru masuk.',
            type: 'inquiry',
            link: '/admin/inquiries',
            created_at: inq.created_at || new Date().toISOString(),
            is_read: false,
            priority: 'high',
          }));
        if (newNotifs.length > 0) {
          const combined = [...newNotifs, ...prev];
          localStorage.setItem('zekalian_admin_notifications', JSON.stringify(combined));
          return combined;
        }
        return prev;
      });
    }
  }, [inquiries]);

  // Sync pending user approvals
  useEffect(() => {
    const pendingUsers = adminUsers.filter((u) => u.account_status === 'PENDING_APPROVAL');
    if (pendingUsers.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const userNotifs: AdminNotification[] = pendingUsers
          .filter((u) => !existingIds.has(`user-${u.id}`))
          .map((u) => ({
            id: `user-${u.id}`,
            title: `Permintaan Akses Akun: ${u.full_name}`,
            message: `Meminta hak akses sebagai ${u.requested_role || u.role} (${u.request_department || 'Divisi'}).`,
            type: 'user',
            link: '/admin/users',
            created_at: u.requested_at || new Date().toISOString(),
            is_read: false,
            priority: 'high',
          }));
        if (userNotifs.length > 0) {
          const combined = [...userNotifs, ...prev];
          localStorage.setItem('zekalian_admin_notifications', JSON.stringify(combined));
          return combined;
        }
        return prev;
      });
    }
  }, [adminUsers]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(updated);
    localStorage.setItem('zekalian_admin_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    localStorage.setItem('zekalian_admin_notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('zekalian_admin_notifications');
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    markAsRead(notif.id);
    onNavigate(notif.link);
    setIsOpen(false);
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      case 'inquiry':
        return <Inbox className="w-4 h-4 text-emerald-600" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-purple-600" />;
      case 'bug':
        return <Bug className="w-4 h-4 text-rose-600" />;
      case 'user':
        return <Users className="w-4 h-4 text-amber-600" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#005DDD]" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      return `${diffDays} hari lalu`;
    } catch {
      return '';
    }
  };

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
        title="Pusat Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#005DDD]/10 text-[#005DDD] text-[11px] font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-[#005DDD] hover:text-[#004bb5] flex items-center gap-1 cursor-pointer"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Baca Semua</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer ml-1"
                  title="Bersihkan notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 px-4 pt-2 gap-4 text-xs font-semibold text-slate-500">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'border-[#005DDD] text-[#005DDD]'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'border-[#005DDD] text-[#005DDD]'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 px-4">
                <Check className="w-7 h-7 mx-auto mb-2 text-emerald-500 bg-emerald-50 rounded-full p-1.5" />
                <p className="text-xs font-semibold text-slate-700">Semua Beres!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === 'unread'
                    ? 'Tidak ada notifikasi yang belum dibaca.'
                    : 'Belum ada notifikasi baru saat ini.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notif.is_read ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs truncate ${
                          !notif.is_read
                            ? 'font-extrabold text-slate-900'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#005DDD] shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Notifikasi otomatis tersinkronisasi secara real-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
