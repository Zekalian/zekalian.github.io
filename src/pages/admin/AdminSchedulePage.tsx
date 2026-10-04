import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  FolderKanban,
  Video,
  Scissors,
  Eye,
  Send,
  Receipt,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionScheduleEvent } from '../../types/database';
import { db, removeUndefinedFields } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export const AdminSchedulePage: React.FC = () => {
  const { projects, adminUsers, addToast, currentUser } = useApp();
  const [events, setEvents] = useState<ProductionScheduleEvent[]>([
    {
      id: 'sch-1',
      title: 'Sesi Kickoff & Pra-Produksi Proyek',
      project_title: 'Proyek Perdana — Brand Campaign & Film Sinematik',
      client_name: 'Klien Kolaborasi',
      type: 'meeting',
      start_date: '2026-10-05',
      start_time: '10:00',
      location: 'Studio Zekalian / Google Meet',
      assigned_to: ['Zaki Fadhillah Andri'],
      status: 'planned',
      notes: 'Penyusunan brief dan moodboard visual kampanye.',
      created_at: new Date().toISOString(),
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formType, setFormType] = useState<ProductionScheduleEvent['type']>('shoot');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formLocation, setFormLocation] = useState('');
  const [formAssigned, setFormAssigned] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<ProductionScheduleEvent['status']>('planned');
  const [formNotes, setFormNotes] = useState('');

  // Sync with Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'production_schedules'),
        (snap) => {
          if (!snap.empty) {
            const loaded: ProductionScheduleEvent[] = [];
            snap.forEach((d) => {
              loaded.push({ id: d.id, ...(d.data() as Omit<ProductionScheduleEvent, 'id'>) });
            });
            setEvents(loaded);
          }
        },
        (err) => {
          console.warn('Production schedule sync note:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Production schedule sync note:', e);
    }
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormProjectId('');
    setFormType('shoot');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('09:00');
    setFormLocation('');
    setFormAssigned([]);
    setFormStatus('planned');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ev: ProductionScheduleEvent) => {
    setEditingId(ev.id);
    setFormTitle(ev.title);
    setFormProjectId(ev.project_id || '');
    setFormType(ev.type);
    setFormStartDate(ev.start_date);
    setFormStartTime(ev.start_time || '09:00');
    setFormLocation(ev.location || '');
    setFormAssigned(ev.assigned_to || []);
    setFormStatus(ev.status);
    setFormNotes(ev.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate) {
      addToast('Judul dan tanggal jadwal wajib diisi', 'error');
      return;
    }

    const selectedProj = projects.find((p) => p.id === formProjectId);

    const eventData: ProductionScheduleEvent = {
      id: editingId || `sch-${Date.now()}`,
      title: formTitle.trim(),
      project_id: formProjectId || undefined,
      project_title: selectedProj ? selectedProj.title : undefined,
      client_name: selectedProj ? selectedProj.client_name : undefined,
      type: formType,
      start_date: formStartDate,
      start_time: formStartTime,
      location: formLocation.trim() || undefined,
      assigned_to: formAssigned,
      status: formStatus,
      notes: formNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'production_schedules', eventData.id), removeUndefinedFields({ ...eventData }));
      setEvents((prev) => {
        const idx = prev.findIndex((ev) => ev.id === eventData.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = eventData;
          return updated;
        }
        return [eventData, ...prev];
      });
      addToast(editingId ? 'Jadwal berhasil diperbarui!' : 'Jadwal baru berhasil ditambahkan!', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(`Gagal menyimpan jadwal: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      await deleteDoc(doc(db, 'production_schedules', id));
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      addToast('Jadwal dihapus.', 'info');
    } catch (err: any) {
      addToast(`Gagal menghapus: ${err.message}`, 'error');
    }
  };

  const getTypeBadge = (type: ProductionScheduleEvent['type']) => {
    switch (type) {
      case 'shoot':
        return { label: 'Syuting / Production', icon: Video, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'editing':
        return { label: 'Editing / Post-Prod', icon: Scissors, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'review':
        return { label: 'Client Review', icon: Eye, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'delivery':
        return { label: 'Final Asset Delivery', icon: Send, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'meeting':
        return { label: 'Pre-Prod Meeting', icon: Users, color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'invoice_due':
        return { label: 'Invoice Jatuh Tempo', icon: Receipt, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Event', icon: CalendarIcon, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getStatusBadge = (status: ProductionScheduleEvent['status']) => {
    switch (status) {
      case 'planned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Direncanakan</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Sedang Berjalan</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Selesai</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Dibatalkan</span>;
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'all' && ev.type !== filterType) return false;
    return true;
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005DDD] text-xs font-bold border border-blue-100">
              Production Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Jadwal Produksi & Timeline Agensi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Kalender terintegrasi untuk mengoordinasikan hari syuting (shooting days), tenggat waktu editing, review klien, dan penyerahan master video.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-[#005DDD] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kalender Bulanan
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-[#005DDD] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Timeline
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-1">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'shoot', label: '🎥 Syuting' },
            { id: 'editing', label: '✂️ Editing' },
            { id: 'review', label: '👀 Review' },
            { id: 'delivery', label: '📦 Delivery' },
            { id: 'meeting', label: '👥 Meeting' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterType === cat.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 min-w-32 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        /* Calendar Grid View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
            <div>Minggu</div>
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
            {/* Empty boxes for days before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 p-2 min-h-24"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter((ev) => ev.start_date === dateStr);
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`p-2 min-h-28 transition-colors ${
                    isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? 'bg-[#005DDD] text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayEvents.length} kegiatan
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map((ev) => {
                      const typeBadge = getTypeBadge(ev.type);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => openEditModal(ev)}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer truncate shadow-2xs hover:scale-[1.02] transition-transform ${typeBadge.color}`}
                          title={`${ev.title} (${ev.start_time || ''}) - ${ev.location || ''}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                            <span className="font-bold truncate">{ev.title}</span>
                          </div>
                          {ev.start_time && (
                            <div className="text-[10px] opacity-80 mt-0.5">
                              {ev.start_time}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Timeline List View */
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold text-slate-700">Tidak ada jadwal ditemukan</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan tombol "Tambah Jadwal" di atas untuk menambahkan aktivitas produksi baru.
              </p>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const typeBadge = getTypeBadge(ev.type);
              const TypeIcon = typeBadge.icon;
              return (
                <div
                  key={ev.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl border ${typeBadge.color} shrink-0`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                        {getStatusBadge(ev.status)}
                        {ev.project_title && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 flex items-center gap-1">
                            <FolderKanban className="w-3 h-3" />
                            {ev.project_title}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {ev.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {ev.start_date}
                        </span>
                        {ev.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {ev.start_time} WIB
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {ev.location}
                          </span>
                        )}
                      </div>

                      {ev.notes && (
                        <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          {ev.notes}
                        </p>
                      )}

                      {ev.assigned_to && ev.assigned_to.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-slate-400 font-semibold">Kru Ditugaskan:</span>
                          {ev.assigned_to.map((member, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {member}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => openEditModal(ev)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Add / Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-extrabold text-sm text-slate-900">
                {editingId ? 'Edit Jadwal Produksi' : 'Tambah Jadwal Produksi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Aktivitas / Sesi Syuting *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Shooting Day #1 — Nike Autumn Commercial"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kegiatan
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                  >
                    <option value="shoot">🎥 Syuting / Production</option>
                    <option value="editing">✂️ Editing & Color Grading</option>
                    <option value="review">👀 Client Review & Revisi</option>
                    <option value="delivery">📦 Final Asset Delivery</option>
                    <option value="meeting">👥 Pre-Prod Meeting</option>
                    <option value="invoice_due">🧾 Invoice Jatuh Tempo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tautkan ke Proyek
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                  >
                    <option value="">-- Tanpa Tautan Proyek --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.client_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Waktu (Jam Mulai)
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi / Ruang Kerja
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Contoh: Studio 4 Cilandak / Google Meet"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Jadwal
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                >
                  <option value="planned">Direncanakan (Planned)</option>
                  <option value="in_progress">Sedang Berjalan (In Progress)</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Kebutuhan Alat & Logistik
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Daftar kamera, lighting, atau agenda penting..."
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#005DDD]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005DDD] hover:bg-[#004bb5] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
