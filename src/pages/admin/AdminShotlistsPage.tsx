import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Printer, Eye, X, Edit3, Image as ImageIcon, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, removeUndefinedFields, isWebPFile } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface ShotItem {
  id: string;
  shotNo: string;
  framing: string;
  description: string;
  talent: string;
  props: string;
  equipment: string;
  notes: string;
  imgUrls: string[];
}

interface ShotlistProject {
  id: string;
  projectName: string;
  clientName: string;
  photographer: string;
  location: string;
  date: string;
  callTime: string;
  wrapTime: string;
  camRoll: string;
  shots: ShotItem[];
  createdAt: string;
}

export const AdminShotlistsPage: React.FC = () => {
  const { addToast } = useApp();
  const [shotlists, setShotlists] = useState<ShotlistProject[]>([
    {
      id: 'SHOT-001',
      projectName: 'Summer Fashion Campaign Q4',
      clientName: 'PT. Perta Daya Gas',
      photographer: 'Zakikey Studio',
      location: 'Studio A / Outdoor Jakarta',
      date: '2026-10-01',
      callTime: '08:00',
      wrapTime: '17:00',
      camRoll: 'CAM_A_CARD_01',
      shots: [
        {
          id: '1',
          shotNo: 'Look 1 / Set A',
          framing: 'Full Body, Low Angle',
          description: 'Model berpose dinamis mengenakan jaket safety hijau neon dengan latar belakang instalasi industri.',
          talent: 'Rian & Sarah (Wardrobe: Casual Corporate Safety)',
          props: 'Helm Safety, Kacamata Industri',
          equipment: 'Lensa 85mm f/1.4, Strobe Keylight + Softbox',
          notes: 'Pastikan logo korporat di helm terlihat jelas menghadap kamera.',
          imgUrls: []
        }
      ],
      createdAt: '2026-09-21',
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedShotlist, setSelectedShotlist] = useState<ShotlistProject | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState('08:00');
  const [wrapTime, setWrapTime] = useState('17:00');
  const [camRoll, setCamRoll] = useState('CAM_A_01');
  const [shots, setShots] = useState<ShotItem[]>([
    { id: '1', shotNo: 'Look 1', framing: 'Medium Shot', description: '', talent: '', props: '', equipment: '', notes: '', imgUrls: [] }
  ]);

  // Firestore sync
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'arsip_shotlists'), (snapshot) => {
        const list: ShotlistProject[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ShotlistProject);
        });
        if (list.length > 0) {
          setShotlists(list);
        }
      }, (err) => {
        console.warn('Firestore snapshot error or offline:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore not initialized:', e);
    }
  }, []);

  const resetForm = () => {
    setProjectName('');
    setClientName('');
    setPhotographer('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setCallTime('08:00');
    setWrapTime('17:00');
    setCamRoll('CAM_A_01');
    setShots([
      { id: Date.now().toString(), shotNo: 'Look 1', framing: 'Medium Shot', description: '', talent: '', props: '', equipment: '', notes: '', imgUrls: [] }
    ]);
    setEditingId(null);
  };

  const handleAddShot = () => {
    setShots([
      ...shots,
      {
        id: Date.now().toString(),
        shotNo: `Look ${shots.length + 1}`,
        framing: 'Close Up / Angle',
        description: '',
        talent: '',
        props: '',
        equipment: '',
        notes: '',
        imgUrls: []
      }
    ]);
  };

  const handleRemoveShot = (id: string) => {
    if (shots.length === 1) {
      addToast('Minimal harus ada 1 shot adegan dalam daftar!', 'error');
      return;
    }
    setShots(shots.filter(s => s.id !== id));
  };

  const handleUpdateShot = (index: number, key: keyof ShotItem, val: any) => {
    const updated = [...shots];
    (updated[index] as any)[key] = val;
    setShots(updated);
  };

  const handleShotImages = (event: React.ChangeEvent<HTMLInputElement>, shotIndex: number) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => !isWebPFile(file));
    if (invalidFiles.length > 0) {
      addToast('Foto visual reference wajib berformat .WEBP atau gunakan tautan gambar.', 'error');
      event.target.value = '';
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          setShots(prev => {
            const updated = [...prev];
            updated[shotIndex].imgUrls = [...updated[shotIndex].imgUrls, dataUrl];
            return updated;
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleClearImages = (shotIndex: number) => {
    const updated = [...shots];
    updated[shotIndex].imgUrls = [];
    setShots(updated);
  };

  const handleEditShotlist = (s: ShotlistProject) => {
    setEditingId(s.id);
    setProjectName(s.projectName);
    setClientName(s.clientName);
    setPhotographer(s.photographer);
    setLocation(s.location);
    setDate(s.date);
    setCallTime(s.callTime);
    setWrapTime(s.wrapTime);
    setCamRoll(s.camRoll);
    setShots(s.shots || []);
    setIsCreating(true);
  };

  const handleSaveShotlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      addToast('Nama proyek wajib diisi!', 'error');
      return;
    }

    const docId = editingId || `SHOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const shotlistData: ShotlistProject = {
      id: docId,
      projectName,
      clientName,
      photographer,
      location,
      date,
      callTime,
      wrapTime,
      camRoll,
      shots,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const clean = removeUndefinedFields(shotlistData);
      await setDoc(doc(db, 'arsip_shotlists', docId), clean);
      setShotlists(prev => {
        const exists = prev.find(item => item.id === docId);
        if (exists) {
          return prev.map(item => item.id === docId ? shotlistData : item);
        }
        return [shotlistData, ...prev];
      });
      setIsCreating(false);
      resetForm();
      addToast(editingId ? 'Production shot list berhasil diperbarui!' : 'Production shot list berhasil dibuat & disimpan ke arsip!', 'success');
    } catch (err: any) {
      console.error('Error saving shotlist to Firestore:', err);
      if (editingId) {
        setShotlists(shotlists.map(s => s.id === editingId ? shotlistData : s));
      } else {
        setShotlists([shotlistData, ...shotlists]);
      }
      setIsCreating(false);
      resetForm();
      addToast('Disimpan secara lokal (Firestore offline)', 'info');
    }
  };

  const handleSaveToArchive = async (s: ShotlistProject) => {
    try {
      const clean = removeUndefinedFields(s);
      await setDoc(doc(db, 'arsip_shotlists', s.id), clean);
      addToast(`Shot list ${s.id} berhasil disimpan ke arsip cloud!`, 'success');
    } catch (err: any) {
      addToast(`Gagal arsip cloud: ${err.message}`, 'error');
    }
  };

  const handleDeleteShotlist = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus shot list ini?')) return;
    try {
      await deleteDoc(doc(db, 'arsip_shotlists', id));
      setShotlists(shotlists.filter(s => s.id !== id));
      if (selectedShotlist?.id === id) {
        setIsPreviewOpen(false);
        setSelectedShotlist(null);
      }
      addToast('Shot list berhasil dihapus', 'info');
    } catch (err: any) {
      setShotlists(shotlists.filter(s => s.id !== id));
      addToast('Shot list dihapus dari tampilan lokal', 'info');
    }
  };

  const handlePreview = (s: ShotlistProject) => {
    setSelectedShotlist(s);
    setIsPreviewOpen(true);
  };

  const handlePrint = (s: ShotlistProject) => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      addToast('Popup diblokir browser. Izinkan popup untuk mencetak.', 'error');
      return;
    }

    let cardsHtml = '';
    s.shots.forEach(shot => {
      let pdfImagesHtml = '<span style="color:#999; font-size:11px;">No Visual Reference</span>';
      if (shot.imgUrls && shot.imgUrls.length > 0) {
        pdfImagesHtml = shot.imgUrls.map(url => `<img src="${url}" style="max-height: 160px; max-width: 100%; object-fit: contain; border-radius: 4px;" />`).join('');
      }

      cardsHtml += `
        <div style="border: 2px solid #1e1b4b; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 20px; break-inside: avoid; page-break-inside: avoid;">
          <div style="background: #1e1b4b; color: white; padding: 6px 10px; font-weight: 800; display: flex; justify-content: space-between; font-size: 11px;">
            <span>ID: ${shot.shotNo || '-'}</span>
            <span>Framing: ${shot.framing || '-'}</span>
          </div>
          <div style="min-height: 180px; padding: 10px; background: #f0f0f0; border-bottom: 2px solid #1e1b4b; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 10px; overflow: hidden;">
            ${pdfImagesHtml}
          </div>
          <div style="padding: 10px; flex-grow: 1; font-size: 11px;">
            <div style="display: grid; grid-template-columns: 90px 1fr; margin-bottom: 6px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
              <div style="font-weight: 700; color: #008be8; text-transform: uppercase; font-size: 10px;">Desc/Mood</div>
              <div style="font-size: 11px; white-space: pre-wrap; line-height: 1.4;"><b>${shot.description || '-'}</b></div>
            </div>
            <div style="display: grid; grid-template-columns: 90px 1fr; margin-bottom: 6px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
              <div style="font-weight: 700; color: #008be8; text-transform: uppercase; font-size: 10px;">Talent/Wardrobe</div>
              <div style="font-size: 11px; white-space: pre-wrap; line-height: 1.4;">${shot.talent || '-'}</div>
            </div>
            <div style="display: grid; grid-template-columns: 90px 1fr; margin-bottom: 6px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
              <div style="font-weight: 700; color: #008be8; text-transform: uppercase; font-size: 10px;">Props</div>
              <div style="font-size: 11px; white-space: pre-wrap; line-height: 1.4;">${shot.props || '-'}</div>
            </div>
            <div style="display: grid; grid-template-columns: 90px 1fr; margin-bottom: 6px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
              <div style="font-weight: 700; color: #008be8; text-transform: uppercase; font-size: 10px;">Equipment</div>
              <div style="font-size: 11px; white-space: pre-wrap; line-height: 1.4;">${shot.equipment || '-'}</div>
            </div>
            <div style="display: grid; grid-template-columns: 90px 1fr;">
              <div style="font-weight: 700; color: #008be8; text-transform: uppercase; font-size: 10px;">Notes</div>
              <div style="font-size: 11px; white-space: pre-wrap; line-height: 1.4; color: #ef4444;">${shot.notes || '-'}</div>
            </div>
          </div>
        </div>
      `;
    });

    const formattedDate = s.date ? new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photoshoot List - ${s.id}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Inter', sans-serif; color: #111; padding: 20px; background: #fff; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 3px solid #008be8; padding-bottom: 15px; }
          h1 { font-size: 26px; font-weight: 900; color: #008be8; margin: 0 0 5px 0; text-transform: uppercase; }
          .meta p { font-size: 12px; margin: 2px 0; }
          .meta strong { color: #008be8; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          @media print {
            body { padding: 0; }
            .grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
            > div { width: 48%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PHOTOSHOOT LIST</h1>
            <p style="font-size: 15px; font-weight: 700; margin: 0 0 5px 0;">${s.projectName} ${s.clientName ? `| ${s.clientName}` : ''}</p>
            <p style="font-size: 12px; color: #555; margin: 0;">Photographer: <strong>${s.photographer || '-'}</strong></p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; margin: 2px 0;">Location: <strong>${s.location || '-'}</strong></p>
            <p style="font-size: 12px; margin: 2px 0;">Date: <strong>${formattedDate}</strong></p>
            <p style="font-size: 12px; margin: 2px 0;">Time: <strong>${s.callTime || '-'} - ${s.wrapTime || '-'} (Est. Wrap)</strong></p>
            <p style="font-size: 12px; margin: 2px 0;">Cam / Roll: <strong>${s.camRoll || '-'}</strong></p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${cardsHtml}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Camera className="w-4 h-4" />
            <span>Production Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Photoshoot List Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rencana pengambilan foto profesional, detail adegan, wardrobe, props, peralatan, dan referensi visual dengan format cetak standar produksi.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsCreating(true); setSelectedShotlist(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Shot List Baru</span>
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={handleSaveShotlist} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Photoshoot List' : 'Form Pembuatan Photoshoot List'}
            </h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
          </div>

          {/* Project Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Proyek *</label>
              <input type="text" required placeholder="Contoh: Summer Campaign" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Klien / Brand</label>
              <input type="text" placeholder="Contoh: Acme Corp" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Fotografer</label>
              <input type="text" placeholder="Nama Fotografer / Crew" value={photographer} onChange={e => setPhotographer(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Lokasi Syuting</label>
              <input type="text" placeholder="Contoh: Studio A / Outdoor" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Tanggal</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Call Time</label>
                <input type="time" value={callTime} onChange={e => setCallTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Est. Wrap</label>
                <input type="time" value={wrapTime} onChange={e => setWrapTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Cam / Roll (Nama Folder)</label>
              <input type="text" placeholder="Contoh: CAM_A_CARD_01" value={camRoll} onChange={e => setCamRoll(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
          </div>

          {/* Shots List */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Daftar Foto / Shot List</h4>
                <p className="text-xs text-slate-500">Tambahkan detail adegan, talent, wardrobe, properti, dan referensi visual foto.</p>
              </div>
              <button
                type="button"
                onClick={handleAddShot}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Foto Baru</span>
              </button>
            </div>

            <div className="space-y-4">
              {shots.map((shot, idx) => (
                <div key={shot.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white bg-[#005DDD] px-3 py-1 rounded-full">Photo {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveShot(shot.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Hapus Shot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Shot ID / No.</label>
                      <input
                        type="text"
                        placeholder="e.g. Look 1 / Set A"
                        value={shot.shotNo}
                        onChange={e => handleUpdateShot(idx, 'shotNo', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Framing / Angle</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Body, Close Up, Low Angle"
                        value={shot.framing}
                        onChange={e => handleUpdateShot(idx, 'framing', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Description / Mood</label>
                    <textarea
                      rows={2}
                      placeholder="Pose, ekspresi, atau vibe foto..."
                      value={shot.description}
                      onChange={e => handleUpdateShot(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Talent & Wardrobe</label>
                      <textarea
                        rows={2}
                        placeholder="Siapa talentnya & pakai baju apa?"
                        value={shot.talent}
                        onChange={e => handleUpdateShot(idx, 'talent', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Props (Properti)</label>
                      <textarea
                        rows={2}
                        placeholder="Benda yang masuk ke dalam frame"
                        value={shot.props}
                        onChange={e => handleUpdateShot(idx, 'props', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Equipment (Lens / Lighting)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lensa 85mm, Strobe Keylight"
                      value={shot.equipment}
                      onChange={e => handleUpdateShot(idx, 'equipment', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Additional Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Catatan ekstra untuk tim..."
                        value={shot.notes}
                        onChange={e => handleUpdateShot(idx, 'notes', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold uppercase text-slate-600">Visual Ref. (Upload .WebP)</label>
                        {shot.imgUrls.length > 0 && (
                          <button type="button" onClick={() => handleClearImages(idx)} className="text-[11px] text-rose-600 font-bold hover:underline">Hapus Foto</button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/webp,.webp"
                        multiple
                        onChange={e => handleShotImages(e, idx)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#005DDD] hover:file:bg-blue-100"
                      />
                      <div className="mt-2 h-24 border border-slate-200 rounded-xl bg-white overflow-x-auto flex items-center gap-2 p-2">
                        {shot.imgUrls && shot.imgUrls.length > 0 ? (
                          shot.imgUrls.map((url, i) => (
                            <img key={i} src={url} alt={`Ref ${i}`} className="h-full w-auto object-contain rounded border border-slate-100" />
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">Belum ada foto referensi</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3]">Simpan Shot List</button>
          </div>
        </form>
      ) : (
        /* Shotlists List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Arsip Photoshoot List</h3>
            <span className="text-xs text-slate-400 font-mono">{shotlists.length} Dokumen</span>
          </div>

          <div className="divide-y divide-slate-100">
            {shotlists.map(s => (
              <div key={s.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#005DDD] bg-[#005DDD]/10 px-2.5 py-1 rounded-full">{s.id}</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> {s.shots.length} Shot Adegan
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{s.projectName}</h4>
                  <p className="text-xs text-slate-500">Klien: <span className="font-semibold text-slate-700">{s.clientName || '-'}</span> &bull; Tanggal Syuting: {s.date}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handlePreview(s)}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                    title="Preview Shot List"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditShotlist(s)}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                    title="Edit Shot List"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSaveToArchive(s)}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                    title="Simpan ke Arsip Dokumen"
                  >
                    <Save className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handlePrint(s)}
                    className="p-2.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white shadow-sm transition-colors"
                    title="Cetak atau Unduh PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteShotlist(s.id)}
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Shot List"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedShotlist && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Preview Shot List: {selectedShotlist.id}</h3>
                <span className="text-[11px] text-slate-500">{selectedShotlist.projectName} &bull; {selectedShotlist.clientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsPreviewOpen(false); handleEditShotlist(selectedShotlist); }}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                  title="Edit Dokumen"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSaveToArchive(selectedShotlist)}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                  title="Simpan Arsip"
                >
                  <Save className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePrint(selectedShotlist)}
                  className="p-2.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white shadow-sm transition-colors"
                  title="Cetak / PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-8 sm:p-12 overflow-y-auto space-y-8 bg-white flex-1">
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div>
                  <h1 className="text-3xl font-black text-[#005DDD] tracking-tight">PHOTOSHOOT LIST</h1>
                  <p className="text-xs text-slate-500 mt-1"><strong className="text-slate-800">{selectedShotlist.projectName}</strong> {selectedShotlist.clientName ? `| ${selectedShotlist.clientName}` : ''}</p>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p>Lokasi: <strong>{selectedShotlist.location || '-'}</strong></p>
                  <p>Tanggal: <strong>{selectedShotlist.date}</strong></p>
                  <p>Waktu: <strong>{selectedShotlist.callTime} - {selectedShotlist.wrapTime}</strong></p>
                  <p>Cam/Roll: <strong>{selectedShotlist.camRoll}</strong></p>
                </div>
              </div>

              {/* Shot Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedShotlist.shots.map((shot, idx) => (
                  <div key={shot.id} className="border-2 border-slate-900 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
                    <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold">
                      <span>ID: {shot.shotNo || `Shot ${idx + 1}`}</span>
                      <span>Framing: {shot.framing || '-'}</span>
                    </div>

                    <div className="h-44 bg-slate-100 border-b-2 border-slate-900 flex items-center justify-center gap-2 p-3 overflow-x-auto">
                      {shot.imgUrls && shot.imgUrls.length > 0 ? (
                        shot.imgUrls.map((url, i) => (
                          <img key={i} src={url} alt={`Ref ${i}`} className="h-full w-auto object-contain rounded" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No Visual Reference</span>
                      )}
                    </div>

                    <div className="p-4 space-y-2 text-xs flex-1">
                      <div className="grid grid-cols-[90px_1fr] pb-2 border-b border-dashed border-slate-200">
                        <span className="font-bold text-[#005DDD] uppercase text-[10px]">Desc/Mood</span>
                        <span className="font-semibold text-slate-900">{shot.description || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[90px_1fr] pb-2 border-b border-dashed border-slate-200">
                        <span className="font-bold text-[#005DDD] uppercase text-[10px]">Talent/Wardrobe</span>
                        <span className="text-slate-700">{shot.talent || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[90px_1fr] pb-2 border-b border-dashed border-slate-200">
                        <span className="font-bold text-[#005DDD] uppercase text-[10px]">Props</span>
                        <span className="text-slate-700">{shot.props || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[90px_1fr] pb-2 border-b border-dashed border-slate-200">
                        <span className="font-bold text-[#005DDD] uppercase text-[10px]">Equipment</span>
                        <span className="text-slate-700 font-mono">{shot.equipment || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[90px_1fr]">
                        <span className="font-bold text-[#005DDD] uppercase text-[10px]">Notes</span>
                        <span className="text-rose-600 font-medium">{shot.notes || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
