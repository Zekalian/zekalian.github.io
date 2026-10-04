import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Printer, Save, Eye, X, Edit3, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, removeUndefinedFields, isWebPFile } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ImgbbGuideButton, ImgbbViewerLinkWarning } from '../../components/admin/ImgbbGuideButton';

interface BriefReference {
  id: string;
  title: string;
  imgUrl: string;
  desc: string;
}

interface ProjectBrief {
  id: string;
  briefNumber: string;
  projectName: string;
  clientName: string;
  objective: string;
  targetAudience: string;
  keyMessage: string;
  deliverables: string;
  timeline: string;
  budgetRange: string;
  competitors: string;
  mandatory: string;
  toneVibe: string;
  colorPalette: string;
  references?: BriefReference[];
  createdAt: string;
}

export const AdminBriefsPage: React.FC = () => {
  const { addToast } = useApp();
  const [briefs, setBriefs] = useState<ProjectBrief[]>([
    {
      id: 'BRIEF-001',
      briefNumber: 'BRIEF/2026/09/001',
      projectName: 'Kampanye Video Komersial Q4',
      clientName: 'PT. Perta Daya Gas',
      objective: 'Meningkatkan awareness brand mengenai efisiensi energi hijau.',
      targetAudience: 'Profesional B2B, Manager Industri, & Pembuat Kebijakan Energi',
      keyMessage: 'Zekalian x Perta Daya Gas: Energi Bersih untuk Masa Depan Berkelanjutan',
      deliverables: '1x Video Cinematic 60s, 3x Social Media Teaser, 15x High-res Stills',
      timeline: '1 Bulan (Mulai 1 Okt 2026)',
      budgetRange: 'Rp 50jt - 100jt',
      competitors: 'EcoEnergy ID, Delta Power',
      mandatory: 'Logo korporat wajib di awal dan akhir video',
      toneVibe: 'Cinematic, Professional, Inspiring',
      colorPalette: 'Navy Blue, Emerald Green, Pure White',
      references: [
        { id: '1', title: 'Moodboard Warna Korporat', imgUrl: '', desc: 'Menggunakan gradasi biru tua dan hijau neon untuk kesan ramah lingkungan.' }
      ],
      createdAt: '2026-09-12',
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<ProjectBrief | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [briefNumber, setBriefNumber] = useState('BRIEF/2026/001');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [mandatory, setMandatory] = useState('');
  const [toneVibe, setToneVibe] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [references, setReferences] = useState<BriefReference[]>([]);

  // Firestore sync
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'arsip_briefs'), (snapshot) => {
        const list: ProjectBrief[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ProjectBrief);
        });
        if (list.length > 0) {
          setBriefs(list);
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
    setBriefNumber(`BRIEF/2026/${Math.floor(100 + Math.random() * 900)}`);
    setProjectName('');
    setClientName('');
    setObjective('');
    setTargetAudience('');
    setKeyMessage('');
    setDeliverables('');
    setTimeline('');
    setBudgetRange('');
    setCompetitors('');
    setMandatory('');
    setToneVibe('');
    setColorPalette('');
    setReferences([]);
    setEditingId(null);
  };

  const handleAddReference = () => {
    setReferences([...references, { id: Date.now().toString(), title: '', imgUrl: '', desc: '' }]);
  };

  const handleRemoveReference = (id: string) => {
    setReferences(references.filter(r => r.id !== id));
  };

  const handleUpdateReference = (index: number, key: keyof BriefReference, val: string) => {
    const updated = [...references];
    (updated[index] as any)[key] = val;
    setReferences(updated);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isWebPFile(file)) {
      addToast('File referensi yang diunggah wajib berformat .WEBP atau masukkan tautan link gambar.', 'error');
      event.target.value = '';
      return;
    }

    if (file) {
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
          const updated = [...references];
          updated[index].imgUrl = dataUrl;
          setReferences(updated);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditBrief = (b: ProjectBrief) => {
    setEditingId(b.id);
    setBriefNumber(b.briefNumber || b.id);
    setProjectName(b.projectName);
    setClientName(b.clientName);
    setObjective(b.objective);
    setTargetAudience(b.targetAudience);
    setKeyMessage(b.keyMessage);
    setDeliverables(b.deliverables);
    setTimeline(b.timeline);
    setBudgetRange(b.budgetRange);
    setCompetitors(b.competitors || '');
    setMandatory(b.mandatory || '');
    setToneVibe(b.toneVibe || '');
    setColorPalette(b.colorPalette || '');
    setReferences(b.references || []);
    setIsCreating(true);
  };

  const handleSaveBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !clientName) {
      addToast('Nama proyek dan klien wajib diisi!', 'error');
      return;
    }

    const docId = editingId || `BRIEF-${Math.floor(1000 + Math.random() * 9000)}`;
    const briefData: ProjectBrief = {
      id: docId,
      briefNumber: briefNumber || docId,
      projectName,
      clientName,
      objective,
      targetAudience,
      keyMessage,
      deliverables,
      timeline,
      budgetRange,
      competitors,
      mandatory,
      toneVibe,
      colorPalette,
      references,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const clean = removeUndefinedFields(briefData);
      await setDoc(doc(db, 'arsip_briefs', docId), clean);
      setBriefs(prev => {
        const exists = prev.find(item => item.id === docId);
        if (exists) {
          return prev.map(item => item.id === docId ? briefData : item);
        }
        return [briefData, ...prev];
      });
      setIsCreating(false);
      resetForm();
      addToast(editingId ? 'Project brief berhasil diperbarui!' : 'Project brief berhasil dibuat & disimpan ke arsip!', 'success');
    } catch (err: any) {
      console.error('Error saving brief to Firestore:', err);
      if (editingId) {
        setBriefs(briefs.map(b => b.id === editingId ? briefData : b));
      } else {
        setBriefs([briefData, ...briefs]);
      }
      setIsCreating(false);
      resetForm();
      addToast('Disimpan secara lokal (Firestore offline)', 'info');
    }
  };

  const handleSaveToArchive = async (b: ProjectBrief) => {
    try {
      const clean = removeUndefinedFields(b);
      await setDoc(doc(db, 'arsip_briefs', b.id), clean);
      addToast(`Brief ${b.briefNumber || b.id} berhasil disimpan ke arsip cloud!`, 'success');
    } catch (err: any) {
      addToast(`Gagal arsip cloud: ${err.message}`, 'error');
    }
  };

  const handleDeleteBrief = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus brief ini?')) return;
    try {
      await deleteDoc(doc(db, 'arsip_briefs', id));
      setBriefs(briefs.filter(b => b.id !== id));
      if (selectedBrief?.id === id) {
        setIsPreviewOpen(false);
        setSelectedBrief(null);
      }
      addToast('Brief berhasil dihapus', 'info');
    } catch (err: any) {
      setBriefs(briefs.filter(b => b.id !== id));
      addToast('Brief dihapus dari tampilan lokal', 'info');
    }
  };

  const handlePreview = (b: ProjectBrief) => {
    setSelectedBrief(b);
    setIsPreviewOpen(true);
  };

  const handlePrint = (b: ProjectBrief) => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      addToast('Popup diblokir browser. Izinkan popup untuk mencetak.', 'error');
      return;
    }

    let refsHtml = '';
    if (b.references && b.references.length > 0) {
      let grids = '';
      b.references.forEach(r => {
        grids += `
          <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; page-break-inside: avoid;">
            ${r.imgUrl ? `<img src="${r.imgUrl}" style="width: 100%; height: 160px; object-fit: contain; background: #fff; margin-bottom: 10px; border-radius: 4px; display: block;" />` : ''}
            ${r.title ? `<h4 style="color: #005DDD; font-size: 13px; margin: 0 0 4px 0;">${r.title}</h4>` : ''}
            ${r.desc ? `<p style="font-size: 12px; color: #475569; margin: 0;">${r.desc}</p>` : ''}
          </div>
        `;
      });
      refsHtml = `
        <div class="section">
          <h3>VISUAL REFERENCES &amp; MEDIA</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            ${grids}
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Creative Brief - ${b.briefNumber || b.id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e1b4b; padding: 40px; background: #fff; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #005DDD; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { font-size: 28px; font-weight: 900; color: #005DDD; margin: 0; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .meta-item label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
          .meta-item span { font-size: 14px; font-weight: 700; color: #0f172a; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section h3 { font-size: 14px; color: #fff; background: #005DDD; display: inline-block; padding: 6px 14px; border-radius: 6px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .card label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px; }
          .card p { font-size: 13px; color: #334155; margin: 0; white-space: pre-wrap; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PROJECT BRIEF KREATIF</h1>
            <p style="font-size: 13px; color: #64748b; margin-top: 5px;">Nomor Dokumen: <strong>${b.briefNumber || b.id}</strong></p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 13px; font-weight: bold; color: #005DDD;">Zekalian Agency</p>
            <p style="font-size: 12px; color: #64748b;">Tanggal: ${b.createdAt}</p>
          </div>
        </div>

        <div class="meta-box">
          <div class="meta-item"><label>Nama Proyek</label><span>${b.projectName}</span></div>
          <div class="meta-item"><label>Klien / Brand</label><span>${b.clientName}</span></div>
          <div class="meta-item"><label>Timeline</label><span>${b.timeline || '-'}</span></div>
          <div class="meta-item"><label>Kisaran Anggaran</label><span>${b.budgetRange || '-'}</span></div>
        </div>

        <div class="section">
          <h3>1. TUJUAN &amp; AUDIENS</h3>
          <div class="grid">
            <div class="card"><label>Tujuan Proyek (Objective)</label><p>${b.objective || '-'}</p></div>
            <div class="card"><label>Target Audiens</label><p>${b.targetAudience || '-'}</p></div>
          </div>
        </div>

        <div class="section">
          <h3>2. PESAN &amp; ARAHAN VISUAL</h3>
          <div class="grid">
            <div class="card"><label>Pesan Utama (Key Message)</label><p>${b.keyMessage || '-'}</p></div>
            <div class="card"><label>Tone &amp; Vibe</label><p>${b.toneVibe || '-'}</p></div>
          </div>
        </div>

        ${refsHtml}

        <div class="section">
          <h3>3. DELIVERABLES &amp; KETENTUAN</h3>
          <div class="grid">
            <div class="card"><label>Deliverables (Expected Outputs)</label><p>${b.deliverables || '-'}</p></div>
            <div class="card"><label>Mandatory Elements</label><p>${b.mandatory || '-'}</p></div>
          </div>
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
            <ClipboardList className="w-4 h-4" />
            <span>Creative Strategy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Brief Kreatif &amp; Teknis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Definisikan tujuan proyek, target audiens, pesan kunci, deliverables, serta unggah foto atau media referensi.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsCreating(true); setSelectedBrief(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Brief Baru</span>
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={handleSaveBrief} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Project Brief' : 'Form Pembuatan Project Brief'}
            </h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nomor Dokumen</label>
              <input type="text" value={briefNumber} onChange={e => setBriefNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Proyek *</label>
              <input type="text" required placeholder="Kampanye Video Q4" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Klien *</label>
              <input type="text" required placeholder="PT. Perta Daya Gas" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Tujuan Proyek (Objective)</label>
              <textarea rows={2} placeholder="Tujuan utama kampanye atau pembuatan..." value={objective} onChange={e => setObjective(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Target Audiens</label>
              <input type="text" placeholder="Profesional B2B, Manager Industri" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Pesan Utama (Key Message)</label>
              <input type="text" placeholder="Slogan / core message..." value={keyMessage} onChange={e => setKeyMessage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Deliverables</label>
              <input type="text" placeholder="1x Video 60s, 3x Teaser" value={deliverables} onChange={e => setDeliverables(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Timeline</label>
              <input type="text" placeholder="1 Bulan" value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Kisaran Anggaran</label>
              <input type="text" placeholder="Rp 50jt - 100jt" value={budgetRange} onChange={e => setBudgetRange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Tone &amp; Vibe</label>
              <input type="text" placeholder="Cinematic, Professional" value={toneVibe} onChange={e => setToneVibe(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Mandatory Elements / Catatan Khusus</label>
              <textarea rows={2} placeholder="Logo wajib ada, font korporat..." value={mandatory} onChange={e => setMandatory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
          </div>

          {/* Visual References / Photo Upload Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upload Foto &amp; Media Referensi</h4>
                <p className="text-xs text-slate-500">Tambahkan gambar moodboard, contoh referensi visual, atau aset pendukung.</p>
              </div>
              <button
                type="button"
                onClick={handleAddReference}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Referensi Gambar</span>
              </button>
            </div>

            {references.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref, idx) => (
                  <div key={ref.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative space-y-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(ref.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Hapus Referensi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Judul Gambar / Media</label>
                      <input
                        type="text"
                        placeholder="Contoh: Moodboard Warna Utama"
                        value={ref.title}
                        onChange={e => handleUpdateReference(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase text-slate-600">File Gambar (Upload .WebP atau Tautan Link)</label>
                        <ImgbbGuideButton size="xs" />
                      </div>
                      <input
                        type="file"
                        accept="image/webp,.webp"
                        onChange={e => handleImageUpload(e, idx)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#005DDD] hover:file:bg-blue-100"
                      />
                      <div className="mt-1.5 flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Atau tempel Direct Link ImgBB / URL gambar (https://...)"
                          value={ref.imgUrl && !ref.imgUrl.startsWith('data:') ? ref.imgUrl : ''}
                          onChange={e => handleUpdateReference(idx, 'imgUrl', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-[#005DDD]"
                        />
                      </div>
                      <ImgbbViewerLinkWarning url={ref.imgUrl || ''} />
                      {ref.imgUrl && (
                        <div className="mt-2 h-32 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                          <img src={ref.imgUrl} alt={ref.title || 'Preview'} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Deskripsi / Catatan Referensi</label>
                      <textarea
                        rows={2}
                        placeholder="Jelaskan mengapa referensi ini dipilih..."
                        value={ref.desc}
                        onChange={e => handleUpdateReference(idx, 'desc', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3]">Simpan Brief</button>
          </div>
        </form>
      ) : (
        /* Briefs List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Arsip Project Brief</h3>
            <span className="text-xs text-slate-400 font-mono">{briefs.length} Dokumen</span>
          </div>

          <div className="divide-y divide-slate-100">
            {briefs.map(b => (
              <div key={b.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#005DDD] bg-[#005DDD]/10 px-2.5 py-1 rounded-full">{b.briefNumber || b.id}</span>
                    {b.references && b.references.length > 0 && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> {b.references.length} Media
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{b.projectName}</h4>
                  <p className="text-xs text-slate-500">Klien: <span className="font-semibold text-slate-700">{b.clientName}</span> &bull; Dibuat: {b.createdAt}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handlePreview(b)}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                    title="Preview Brief"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditBrief(b)}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                    title="Edit Brief"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSaveToArchive(b)}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                    title="Simpan ke Arsip Dokumen"
                  >
                    <Save className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handlePrint(b)}
                    className="p-2.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white shadow-sm transition-colors"
                    title="Cetak atau Unduh PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteBrief(b.id)}
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Brief"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal (Scrollable with Icon-Only Action Bar) */}
      {isPreviewOpen && selectedBrief && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Preview Brief: {selectedBrief.briefNumber || selectedBrief.id}</h3>
                <span className="text-[11px] text-slate-500">{selectedBrief.projectName} &bull; {selectedBrief.clientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsPreviewOpen(false); handleEditBrief(selectedBrief); }}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                  title="Edit Dokumen"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSaveToArchive(selectedBrief)}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                  title="Simpan Arsip"
                >
                  <Save className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePrint(selectedBrief)}
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
                  <h1 className="text-3xl font-black text-[#005DDD] tracking-tight">PROJECT BRIEF</h1>
                  <p className="text-xs text-slate-500 mt-1">ID Dokumen: <span className="font-mono font-bold">{selectedBrief.briefNumber || selectedBrief.id}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Zekalian Agency</p>
                  <p className="text-xs text-slate-500">Tanggal: {selectedBrief.createdAt}</p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nama Proyek</span>
                  <p className="text-sm font-bold text-slate-900">{selectedBrief.projectName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Klien / Brand</span>
                  <p className="text-sm font-bold text-slate-900">{selectedBrief.clientName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Timeline</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedBrief.timeline || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Kisaran Anggaran</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedBrief.budgetRange || '-'}</p>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#005DDD] bg-blue-50 px-3 py-1.5 rounded-lg inline-block mb-3">1. Tujuan &amp; Target</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tujuan Proyek (Objective)</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.objective || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Audiens</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.targetAudience || '-'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#005DDD] bg-blue-50 px-3 py-1.5 rounded-lg inline-block mb-3">2. Pesan &amp; Vibe Visual</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pesan Utama (Key Message)</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.keyMessage || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tone &amp; Vibe</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.toneVibe || '-'}</p>
                    </div>
                  </div>
                </div>

                {selectedBrief.references && selectedBrief.references.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#005DDD] bg-blue-50 px-3 py-1.5 rounded-lg inline-block mb-3">3. Foto &amp; Media Referensi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedBrief.references.map((r, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                          {r.imgUrl && (
                            <div className="h-40 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                              <img src={r.imgUrl} alt={r.title || 'Reference'} className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                          {r.title && <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>}
                          {r.desc && <p className="text-xs text-slate-600">{r.desc}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#005DDD] bg-blue-50 px-3 py-1.5 rounded-lg inline-block mb-3">4. Deliverables &amp; Ketentuan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Deliverables (Expected Outputs)</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.deliverables || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Mandatory Elements</span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedBrief.mandatory || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
