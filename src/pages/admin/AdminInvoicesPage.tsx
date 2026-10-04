import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Printer, Save, Download, CheckCircle2, Eye, X, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db, removeUndefinedFields } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface InvoiceItem {
  id: string;
  desc: string;
  rate: number;
  hours: number;
  disc: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  accName: string;
  bank: string;
  accNumber: string;
  isPaid: boolean;
  notes: string;
  status: 'Unpaid' | 'Paid';
}

export const AdminInvoicesPage: React.FC = () => {
  const { addToast, settings } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      invoiceNumber: 'INV/2026/09/001',
      clientName: 'PT. Nusantara Teknologi Kreasi',
      clientAddress: 'Jl. Sudirman Kav. 52, Jakarta Selatan',
      issueDate: '2026-09-01',
      dueDate: '2026-09-15',
      items: [
        { id: '1', desc: 'Termin 1 - Down Payment Brand Identity & Web App', rate: 6000000, hours: 1, disc: 0 }
      ],
      taxRate: 11,
      accName: 'PT Zekalian Kreatif Indonesia',
      bank: 'BCA',
      accNumber: '8830192831',
      isPaid: true,
      notes: 'Terima kasih atas kerja sama Anda dengan Zekalian Agency.',
      status: 'Paid',
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('INV/2026/001');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [accName, setAccName] = useState('Zekalian Agency');
  const [bank, setBank] = useState('BCA');
  const [accNumber, setAccNumber] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('Terima kasih atas kepercayaan Anda.');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', desc: 'Jasa Produksi Kreatif & Pengembangan', rate: 5000000, hours: 1, disc: 0 }
  ]);

  // Firestore sync
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'arsip_invoices'), (snapshot) => {
        const list: Invoice[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Invoice);
        });
        if (list.length > 0) {
          setInvoices(list);
        }
      }, (err) => {
        console.warn('Firestore snapshot error or offline:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore not initialized:', e);
    }
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), desc: '', rate: 0, hours: 1, disc: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (index: number, key: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    if (key === 'desc' || key === 'id') {
      (updated[index] as any)[key] = val;
    } else {
      (updated[index] as any)[key] = parseFloat(val) || 0;
    }
    setItems(updated);
  };

  const calculateSubtotal = (itemList: InvoiceItem[]) => {
    return itemList.reduce((sum, item) => {
      const base = item.rate * item.hours;
      return sum + Math.max(0, base - item.disc);
    }, 0);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setClientName(inv.clientName);
    setClientAddress(inv.clientAddress);
    setTaxRate(inv.taxRate);
    setAccName(inv.accName);
    setBank(inv.bank);
    setAccNumber(inv.accNumber);
    setIsPaid(inv.isPaid);
    setNotes(inv.notes);
    setItems(inv.items && inv.items.length > 0 ? inv.items : [{ id: '1', desc: '', rate: 0, hours: 1, disc: 0 }]);
    setIsCreating(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      addToast('Nama klien wajib diisi!', 'error');
      return;
    }

    if (editingId) {
      // Update existing
      const updatedList = invoices.map(inv => {
        if (inv.id === editingId) {
          return {
            ...inv,
            invoiceNumber,
            clientName,
            clientAddress,
            issueDate,
            dueDate: dueDate || issueDate,
            items,
            taxRate: Number(taxRate),
            accName,
            bank,
            accNumber,
            isPaid,
            notes,
            status: isPaid ? ('Paid' as const) : ('Unpaid' as const),
          };
        }
        return inv;
      });
      setInvoices(updatedList);
      addToast(`Invoice ${invoiceNumber} berhasil diperbarui!`, 'success');
    } else {
      // Create new
      const newInv: Invoice = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        invoiceNumber: invoiceNumber || `INV/2026/${Math.floor(100 + Math.random() * 900)}`,
        clientName,
        clientAddress,
        issueDate,
        dueDate: dueDate || issueDate,
        items,
        taxRate: Number(taxRate),
        accName,
        bank,
        accNumber,
        isPaid,
        notes,
        status: isPaid ? 'Paid' : 'Unpaid',
      };
      setInvoices([newInv, ...invoices]);
      addToast('Invoice berhasil dibuat!', 'success');
    }

    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setInvoiceNumber(`INV/2026/${Math.floor(100 + Math.random() * 900)}`);
    setClientName('');
    setClientAddress('');
    setDueDate('');
    setTaxRate(0);
    setAccNumber('');
    setIsPaid(false);
    setNotes('Terima kasih atas kepercayaan Anda.');
    setItems([{ id: '1', desc: 'Jasa Produksi Kreatif', rate: 5000000, hours: 1, disc: 0 }]);
  };

  const handleSaveToArchive = async (inv: Invoice) => {
    try {
      const clean = removeUndefinedFields({ ...inv });
      const docId = inv.invoiceNumber.replace(/\//g, '_');
      await setDoc(doc(db, 'arsip_invoices', docId), clean);
      addToast(`Invoice ${inv.invoiceNumber} berhasil disimpan ke arsip Firestore!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(`Gagal menyimpan ke arsip: ${err.message || err}`, 'error');
    }
  };

  const handlePreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPreviewOpen(true);
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank', 'width=900,height=800');
    } catch {
      printWindow = null;
    }

    if (!printWindow) {
      setIsPreviewOpen(true);
      addToast('Membuka pratinjau invoice untuk dicetak/disimpan ke PDF...', 'info');
      setTimeout(() => {
        window.print();
      }, 500);
      return;
    }

    const sub = calculateSubtotal(inv.items);
    const tax = sub * (inv.taxRate / 100);
    const hasDisc = inv.items.some(i => i.disc > 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${inv.invoiceNumber}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fff; color: #1e1b4b; margin: 0; padding: 40px; }
          .pdf-render { width: 100%; max-width: 800px; margin: 0 auto; background: white; color: #1e1b4b; position: relative; }
          .pdf-stamp { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 110px; font-weight: 900; color: rgba(34, 197, 94, 0.15); border: 10px solid rgba(34, 197, 94, 0.15); padding: 15px 50px; border-radius: 30px; z-index: 10; letter-spacing: 8px; }
          .pdf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
          .pdf-brand-side h1 { font-size: 55px; font-weight: 900; color: #008be8; margin: 0; letter-spacing: -2px; line-height: 1; }
          .pdf-meta-side { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
          .pdf-meta-side img { max-width: 220px; height: auto; margin-bottom: 15px; object-fit: contain; }
          .pdf-meta-side p { margin-bottom: 6px; font-size: 16px; font-weight: 500; }
          .pdf-meta-side b { color: #008be8; }
          .header-divider { width: 100%; height: 3px; background-color: #008be8; margin-bottom: 40px; }
          .pdf-billed-to { margin-bottom: 50px; }
          .pdf-billed-to h3 { font-size: 13px; text-transform: uppercase; color: #008be8; margin-bottom: 12px; letter-spacing: 1px; }
          .pdf-billed-to p.client-name { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
          .pdf-billed-to p.client-addr { font-size: 16px; font-weight: 400; line-height: 1.6; white-space: pre-line; color: #4338ca; }
          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .pdf-table th { text-align: left; padding: 15px 12px; background: #fdfcff; border-bottom: 3px solid #008be8; font-size: 13px; text-transform: uppercase; color: #008be8; font-weight: 800; }
          .pdf-table td { padding: 18px 12px; border-bottom: 1px solid #eef2ff; font-size: 15px; }
          .pdf-totals-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
          .pdf-totals-table { width: 380px; }
          .pdf-totals-table td { padding: 10px 15px; font-size: 16px; }
          .pdf-totals-table .label { text-align: right; color: #6366f1; font-weight: 600; }
          .pdf-totals-table .val { text-align: right; font-weight: 700; color: #1e1b4b; }
          .pdf-grand-total td { border-top: 3px solid #008be8; font-size: 22px; font-weight: 900 !important; color: #008be8; padding-top: 18px; }
          .pdf-footer { display: flex; justify-content: space-between; border-top: 2px solid #eef2ff; padding-top: 40px; }
          .pdf-pay-info h3, .pdf-from-info h3 { font-size: 13px; text-transform: uppercase; color: #008be8; margin-bottom: 12px; letter-spacing: 1px; }
          .pdf-pay-info p, .pdf-from-info p { font-size: 15px; line-height: 1.8; font-weight: 500; }
          .pdf-notes-footer { text-align: center; margin-top: 60px; font-size: 14px; color: #6366f1; font-style: italic; white-space: pre-line; border-top: 1px dashed #ddd6fe; padding-top: 30px; }
          @media print {
            body { padding: 0; }
            @page { size: A4 portrait; margin: 10mm 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="pdf-render">
          ${inv.isPaid ? '<div class="pdf-stamp">PAID</div>' : ''}
          <div class="pdf-header">
            <div class="pdf-brand-side">
              <h1>INVOICE</h1>
            </div>
            <div class="pdf-meta-side">
              <img src="${settings.logo_light_url || '/logo-text-biru.png'}" alt="Logo" style="width: 200px; height: auto; margin-bottom: 15px;" />
              <p>Date: <b>${formatDateStr(inv.issueDate)}</b></p>
              <p>No: <b>${inv.invoiceNumber}</b></p>
            </div>
          </div>
          <div class="header-divider"></div>
          <div class="pdf-billed-to">
            <h3>Billed To:</h3>
            <p class="client-name">${inv.clientName}</p>
            <p class="client-addr">${inv.clientAddress || '-'}</p>
          </div>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Rate</th>
                <th style="text-align: center;">Qty/Hrs</th>
                ${hasDisc ? '<th>Discount</th>' : ''}
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map(item => {
                const b = item.rate * item.hours;
                const f = Math.max(0, b - item.disc);
                return `
                  <tr>
                    <td><b>${item.desc || 'Untitled Service'}</b></td>
                    <td>${formatCurrency(item.rate)}</td>
                    <td style="text-align: center;">${item.hours}</td>
                    ${hasDisc ? `<td style="color: #ef4444;">${item.disc > 0 ? '-' + formatCurrency(item.disc) : '-'}</td>` : ''}
                    <td style="text-align: right;"><b>${formatCurrency(f)}</b></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="pdf-totals-section">
            <table class="pdf-totals-table">
              <tbody>
                <tr><td class="label">Subtotal</td><td class="val">${formatCurrency(sub)}</td></tr>
                <tr><td class="label">Tax (${inv.taxRate}%)</td><td class="val">${formatCurrency(sub * (inv.taxRate / 100))}</td></tr>
                <tr class="pdf-grand-total"><td class="label">Total Amount</td><td class="val">${formatCurrency(sub + (sub * (inv.taxRate / 100)))}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pdf-footer">
            <div class="pdf-pay-info" style="visibility: ${inv.isPaid ? 'hidden' : 'visible'};">
              <h3>Payment Information</h3>
              <p><b>Bank:</b> ${inv.bank}</p>
              <p><b>Account No:</b> ${inv.accNumber || '-'}</p>
              <p><b>Account Name:</b> ${inv.accName || '-'}</p>
            </div>
            <div class="pdf-from-info" style="text-align: right;">
              <h3>Issued By</h3>
              <p><b>${settings.agency_name || 'Zekalian'}</b></p>
              <p>Pekanbaru, Indonesia</p>
            </div>
          </div>
          ${inv.notes ? `<div class="pdf-notes-footer">${inv.notes}</div>` : ''}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDelete = async (inv: Invoice) => {
    if (!confirm('Hapus invoice ini dari daftar?')) return;
    try {
      await deleteDoc(doc(db, 'arsip_invoices', inv.invoiceNumber.replace(/\//g, '_')));
    } catch (e) {
      // ignore if not in firestore
    }
    setInvoices(invoices.filter(i => i.id !== inv.id));
    addToast('Invoice berhasil dihapus', 'info');
  };

  // Helper formatting
  const formatCurrency = (amount: number) => "Rp " + amount.toLocaleString('id-ID');
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const activeInv = selectedInvoice || invoices[0];
  const activeSubtotal = activeInv ? calculateSubtotal(activeInv.items) : 0;
  const activeTaxVal = activeInv ? activeSubtotal * (activeInv.taxRate / 100) : 0;
  const activeGrandTotal = activeSubtotal + activeTaxVal;
  const activeHasDiscount = activeInv ? activeInv.items.some(i => i.disc > 0) : false;

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005DDD] mb-1">
            <Receipt className="w-4 h-4" />
            <span>Billing &amp; Invoicing with Full Editing &amp; Popup Print</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Generator Invoice &amp; Penagihan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buat, edit dokumen tagihan, preview interaktif, cetak, dan arsipkan ke Firestore.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsCreating(true); setSelectedInvoice(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Invoice Baru</span>
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={handleSaveInvoice} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? `Edit Invoice: ${invoiceNumber}` : 'Form Pembuatan Invoice Tagihan'}
            </h3>
            <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Batal</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nomor Invoice</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Tanggal Terbit</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Jatuh Tempo</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Klien / Perusahaan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Nusantara Teknologi Kreasi"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Tarif Pajak (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Alamat Klien</label>
              <textarea
                rows={2}
                placeholder="Alamat lengkap klien..."
                value={clientAddress}
                onChange={e => setClientAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#005DDD]"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Rincian Item Pekerjaan</h4>
              <button type="button" onClick={handleAddItem} className="text-xs font-bold text-[#005DDD] hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deskripsi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Brand Identity & Guidelines"
                    value={item.desc}
                    onChange={e => updateItem(index, 'desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.rate || ''}
                    onChange={e => updateItem(index, 'rate', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Qty / Jam</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={item.hours || ''}
                    onChange={e => updateItem(index, 'hours', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.disc || ''}
                    onChange={e => updateItem(index, 'disc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end pt-4">
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bank & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={accName}
                onChange={e => setAccName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Bank</label>
              <select
                value={bank}
                onChange={e => setBank(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="BCA">BCA</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
                <option value="BSI">BSI</option>
                <option value="Bank Jago">Bank Jago</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                placeholder="1234567890"
                value={accNumber}
                onChange={e => setAccNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPaidCheck"
                checked={isPaid}
                onChange={e => setIsPaid(e.target.checked)}
                className="w-5 h-5 accent-[#005DDD] cursor-pointer"
              />
              <label htmlFor="isPaidCheck" className="text-sm font-bold text-slate-800 cursor-pointer">
                Tandai sebagai Lunas (PAID Stamp)
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs uppercase font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#005DDD] text-white text-xs font-bold shadow-sm hover:bg-[#018EE3]">
              {editingId ? 'Simpan Perubahan' : 'Simpan Invoice'}
            </button>
          </div>
        </form>
      ) : (
        /* Invoices List & Management */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Arsip Dokumen Invoice</h3>
              <span className="text-xs text-slate-400 font-mono">{invoices.length} Dokumen</span>
            </div>

            <div className="divide-y divide-slate-100">
              {invoices.map(inv => {
                const sub = calculateSubtotal(inv.items);
                const tax = sub * (inv.taxRate / 100);
                const total = sub + tax;

                return (
                  <div key={inv.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#005DDD] bg-[#005DDD]/10 px-2.5 py-0.5 rounded-full">
                          {inv.invoiceNumber}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{inv.clientName}</h4>
                      <p className="text-xs text-slate-500">
                        Total: <span className="font-mono font-bold text-slate-800">{formatCurrency(total)}</span> &bull; Jatuh Tempo: {inv.dueDate || inv.issueDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handlePreview(inv)}
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                        title="Preview Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditInvoice(inv)}
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSaveToArchive(inv)}
                        className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                        title="Simpan ke Arsip Firestore"
                      >
                        <Save className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePrint(inv)}
                        className="p-2.5 rounded-xl bg-[#005DDD] hover:bg-[#018EE3] text-white shadow-sm transition-colors"
                        title="Cetak atau Unduh PDF (Popup Print)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(inv)}
                        className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULLY SCROLLABLE INTERACTIVE PREVIEW MODAL */}
      {isPreviewOpen && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#005DDD]/10 flex items-center justify-center text-[#005DDD] font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Preview Invoice: {activeInv.invoiceNumber}</h3>
                  <p className="text-[11px] text-slate-500">Tampilan dokumen A4 dengan scroll penuh</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsPreviewOpen(false); handleEditInvoice(activeInv); }}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005DDD] transition-colors"
                  title="Edit Dokumen"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSaveToArchive(activeInv)}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                  title="Simpan Arsip"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePrint(activeInv)}
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

            {/* Modal Body with smooth scrolling */}
            <div className="p-4 sm:p-10 overflow-y-auto overflow-x-auto bg-slate-100 flex-1 flex justify-center">
              <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-[800px] max-w-full my-auto">
                <div className="pdf-render">
                  {activeInv.isPaid && <div className="pdf-stamp">PAID</div>}
                  
                  <div className="pdf-header">
                    <div className="pdf-brand-side">
                      <h1>INVOICE</h1>
                    </div>
                    <div className="pdf-meta-side">
                      <img src={settings.logo_light_url || '/logo-text-biru.png'} alt="Logo" style={{ width: '200px', height: 'auto', marginBottom: '15px' }} />
                      <p>Date: <b>{formatDateStr(activeInv.issueDate)}</b></p>
                      <p>No: <b>{activeInv.invoiceNumber}</b></p>
                    </div>
                  </div>
                  
                  <div className="header-divider"></div>

                  <div className="pdf-billed-to">
                    <h3>Billed To:</h3>
                    <p className="client-name">{activeInv.clientName}</p>
                    <p className="client-addr">{activeInv.clientAddress || '-'}</p>
                  </div>

                  <table className="pdf-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Rate</th>
                        <th style={{ textAlign: 'center' }}>Qty/Hrs</th>
                        {activeHasDiscount && <th>Discount</th>}
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInv.items.map((item, idx) => {
                        const base = item.rate * item.hours;
                        const final = Math.max(0, base - item.disc);
                        return (
                          <tr key={idx}>
                            <td><b>{item.desc || 'Untitled Service'}</b></td>
                            <td>{formatCurrency(item.rate)}</td>
                            <td style={{ textAlign: 'center' }}>{item.hours}</td>
                            {activeHasDiscount && (
                              <td style={{ color: '#ef4444' }}>{item.disc > 0 ? '-' + formatCurrency(item.disc) : '-'}</td>
                            )}
                            <td style={{ textAlign: 'right' }}><b>{formatCurrency(final)}</b></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="pdf-totals-section">
                    <table className="pdf-totals-table">
                      <tbody>
                        <tr><td className="label">Subtotal</td><td className="val">{formatCurrency(activeSubtotal)}</td></tr>
                        <tr><td className="label">Tax ({activeInv.taxRate}%)</td><td className="val">{formatCurrency(activeTaxVal)}</td></tr>
                        <tr className="pdf-grand-total"><td className="label">Total Amount</td><td className="val">{formatCurrency(activeGrandTotal)}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pdf-footer">
                    <div className="pdf-pay-info" style={{ visibility: activeInv.isPaid ? 'hidden' : 'visible' }}>
                      <h3>Payment Information</h3>
                      <p><b>Bank:</b> {activeInv.bank}</p>
                      <p><b>Account No:</b> {activeInv.accNumber || '-'}</p>
                      <p><b>Account Name:</b> {activeInv.accName || '-'}</p>
                    </div>
                    <div className="pdf-from-info" style={{ textAlign: 'right' }}>
                      <h3>Issued By</h3>
                      <p><b>{settings.agency_name || 'Zekalian'}</b></p>
                      <p>Pekanbaru, Indonesia</p>
                    </div>
                  </div>

                  {activeInv.notes && <div className="pdf-notes-footer">{activeInv.notes}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
