import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, CheckCircle, ExternalLink, Calendar, DollarSign, Building, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProposalItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  validUntil: string;
  items: ProposalItem[];
  notes: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdAt: string;
}

export const AdminProposalsPage: React.FC = () => {
  const { addToast, settings } = useApp();
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('zekalian_admin_proposals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'PROP-2026-001',
        title: 'Proposal Pembuatan Brand Identity & Web App',
        clientName: 'PT. Nusantara Teknologi Kreasi',
        clientEmail: 'procurement@nusantaratech.id',
        projectName: 'Platform E-Commerce B2B Modern',
        validUntil: '2026-10-30',
        items: [
          { id: '1', description: 'Brand Strategy & Visual Identity Design', qty: 1, price: 15000000 },
          { id: '2', description: 'Full-Stack Web App Development (React + Node.js)', qty: 1, price: 45000000 },
          { id: '3', description: 'Cinematic Company Profile Video Production', qty: 1, price: 20000000 },
        ],
        notes: 'Pembayaran dibagi menjadi 3 termin (DP 40%, Progress 40%, Pelunasan 20%).',
        status: 'Sent',
        createdAt: '2026-09-10',
      }
    ];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([
    { id: '1', description: 'Layanan Utama & Konsultasi Kreatif', qty: 1, price: 10000000 }
  ]);

  useEffect(() => {
    localStorage.setItem('zekalian_admin_proposals', JSON.stringify(proposals));
  }, [proposals]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = (itemList: ProposalItem[]) => {
    return itemList.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) {
      addToast('Judul proposal dan nama klien wajib diisi!', 'error');
      return;
    }

    const newProp: Proposal = {
      id: `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      clientName,
      clientEmail,
      projectName,
      validUntil: validUntil || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      items,
      notes,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProposals([newProp, ...proposals]);
    setIsCreating(false);
    resetForm();
    addToast('Proposal berhasil dibuat!', 'success');
  };

  const resetForm = () => {
    setTitle('');
    setClientName('');
    setClientEmail('');
    setProjectName('');
    setValidUntil('');
    setNotes('');
    setItems([{ id: '1', description: 'Layanan Utama & Konsultasi Kreatif', qty: 1, price: 10000000 }]);
  };

  const generatePdfBlob = (prop: Proposal): Blob => {
    const doc = new jsPDF();
    const total = calculateTotal(prop.items);

    // Header
    doc.setFillColor(0, 93, 221);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text((settings.agency_name || 'ZEKALIAN').toUpperCase(), 14, 22);
    doc.setFontSize(10);
    doc.text('PROPOSAL PROYEK', 160, 22, { align: 'right' });

    // Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(prop.title, 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${prop.id}`, 14, 56);
    doc.text(`Klien: ${prop.clientName} (${prop.clientEmail || '-'})`, 14, 63);
    doc.text(`Proyek: ${prop.projectName || '-'}`, 14, 70);
    doc.text(`Berlaku Hingga: ${prop.validUntil}`, 14, 77);

    // Table
    const tableData = prop.items.map((it, idx) => [
      idx + 1,
      it.description,
      it.qty,
      `Rp ${it.price.toLocaleString('id-ID')}`,
      `Rp ${(it.qty * it.price).toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['No', 'Ruang Lingkup / Layanan', 'Qty', 'Harga Satuan', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 93, 221] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Penawaran: Rp ${total.toLocaleString('id-ID')}`, 200, finalY, { align: 'right' });

    if (prop.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Catatan & Termin: ${prop.notes}`, 14, finalY + 15, { maxWidth: 180 });
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Zekalian Agency — Creative & Technology Production', 14, 280);

    return doc.output('blob');
  };

  const handleDownloadPdf = (prop: Proposal) => {
    const pdfBlob = generatePdfBlob(prop);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prop.id}_Proposal.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Proposal berhasil diunduh sebagai PDF!', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus proposal ini?')) {
      setProposals(proposals.filter(p => p.id !== id));
      if (selectedProposal?.id === id) setSelectedProposal(null);
      addToast('Proposal berhasil dihapus', 'info');
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <FileText className="w-4 h-4" />
            <span>Commercial Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Generator Proposal Proyek
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buat dokumen penawaran komersial, rincian anggaran, dan ekspor PDF profesional.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => { resetForm(); setIsCreating(true); setSelectedProposal(null); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Proposal Baru</span>
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleSaveProposal} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Form Pembuatan Proposal Proyek</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Batal</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Judul Proposal *</label>
              <input type="text" required placeholder="Contoh: Proposal Pengembangan Web & Branding" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Klien *</label>
              <input type="text" required placeholder="PT. Nusantara Teknologi" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Email Klien</label>
              <input type="email" placeholder="klien@perusahaan.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Proyek</label>
              <input type="text" placeholder="Platform E-Commerce B2B" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Berlaku Hingga</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
            </div>
          </div>

          {/* Items / Scope */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Rincian Ruang Lingkup &amp; Harga</h4>
              <button type="button" onClick={handleAddItem} className="text-xs font-bold text-[#005DDD] hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={it.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="sm:col-span-6">
                  <input type="text" placeholder="Deskripsi Layanan / Pekerjaan" value={it.description} onChange={e => {
                    const u = [...items]; u[idx].description = e.target.value; setItems(u);
                  }} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]" />
                </div>
                <div className="sm:col-span-2">
                  <input type="number" min="1" placeholder="Qty" value={it.qty} onChange={e => {
                    const u = [...items]; u[idx].qty = Number(e.target.value); setItems(u);
                  }} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]" />
                </div>
                <div className="sm:col-span-3">
                  <input type="number" placeholder="Harga Satuan (Rp)" value={it.price} onChange={e => {
                    const u = [...items]; u[idx].price = Number(e.target.value); setItems(u);
                  }} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#005DDD]" />
                </div>
                <div className="sm:col-span-1 flex justify-center">
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(it.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Catatan &amp; Termin Pembayaran</label>
            <textarea rows={3} placeholder="Contoh: DP 40%, Progress 40%, Pelunasan 20%" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3]">Simpan Proposal</button>
          </div>
        </form>
      ) : selectedProposal ? (
        /* Selected Proposal Detail */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <button onClick={() => setSelectedProposal(null)} className="text-xs font-bold text-[#005DDD] hover:underline mb-2 block">&larr; Kembali ke Daftar Proposal</button>
              <h2 className="text-2xl font-extrabold text-slate-900">{selectedProposal.title}</h2>
              <span className="text-xs font-mono text-slate-500 font-bold">{selectedProposal.id} &bull; Klien: {selectedProposal.clientName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadPdf(selectedProposal)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005DDD] text-white text-xs font-bold hover:bg-[#018EE3]"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Klien</span>
              <p className="text-sm font-bold text-slate-900">{selectedProposal.clientName}</p>
              <p className="text-xs text-slate-500">{selectedProposal.clientEmail}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nama Proyek</span>
              <p className="text-sm font-bold text-slate-900">{selectedProposal.projectName || '-'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Berlaku Hingga</span>
              <p className="text-sm font-bold text-slate-900">{selectedProposal.validUntil}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <th className="py-3 px-4">Deskripsi Ruang Lingkup</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {selectedProposal.items.map((it, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{it.description}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">{it.qty}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">Rp {it.price.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">Rp {(it.qty * it.price).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 max-w-md">
              <span className="font-bold block mb-1 text-slate-700">Catatan &amp; Termin:</span>
              {selectedProposal.notes || '-'}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block mb-1">Total Penawaran:</span>
              <span className="text-xl font-extrabold font-mono text-[#005DDD]">Rp {calculateTotal(selectedProposal.items).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Proposals List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Daftar Proposal Proyek</h3>
            <span className="text-xs text-slate-400 font-mono">{proposals.length} Dokumen</span>
          </div>

          <div className="divide-y divide-slate-100">
            {proposals.map(p => (
              <div key={p.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#005DDD] bg-[#005DDD]/10 px-2 py-0.5 rounded-full">{p.id}</span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">{p.status}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-500">Klien: <span className="font-semibold text-slate-700">{p.clientName}</span> &bull; Total: <span className="font-mono font-bold text-slate-800">Rp {calculateTotal(p.items).toLocaleString('id-ID')}</span></p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button onClick={() => setSelectedProposal(p)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Lihat</button>
                  <button onClick={() => handleDownloadPdf(p)} className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl text-rose-600 hover:bg-rose-50" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
