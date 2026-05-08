let items = [{ desc: '', rate: 0, hours: 0, disc: 0 }];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('in-date').valueAsDate = new Date();
    renderItems();
});

function formatCurrency(amount) {
    return "Rp " + amount.toLocaleString('id-ID');
}

function renderItems() {
    const container = document.getElementById('items-list');
    container.innerHTML = '';

    items.forEach((item, index) => {
        const html = `
            <div class="item-card">
                <div class="item-header-badge">Work Item ${index + 1}</div>
                ${items.length > 1 ? `<button class="btn-remove" onclick="removeItem(${index})">✕</button>` : ''}
                
                <div class="input-group" style="margin-top: 15px;">
                    <label>Description</label>
                    <input type="text" placeholder="e.g. Motion Graphic Design" 
                           value="${item.desc}" oninput="updateItem(${index}, 'desc', this.value)">
                </div>
                
                <div class="input-group">
                    <label>Rate (Price per unit/hour)</label>
                    <div class="prefix-wrapper">
                        <span>Rp</span>
                        <input type="number" placeholder="0" 
                               value="${item.rate || ''}" oninput="updateItem(${index}, 'rate', this.value)">
                    </div>
                </div>
                
                <div class="input-group">
                    <label>Quantity / Hours</label>
                    <input type="number" placeholder="0" 
                           value="${item.hours || ''}" oninput="updateItem(${index}, 'hours', this.value)">
                </div>
                
                <div class="input-group">
                    <label>Discount Amount</label>
                    <div class="prefix-wrapper">
                        <span>Rp</span>
                        <input type="number" placeholder="0" 
                               value="${item.disc || ''}" oninput="updateItem(${index}, 'disc', this.value)">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function addNewItem() { items.push({ desc: '', rate: 0, hours: 0, disc: 0 }); renderItems(); }
function removeItem(index) { if (items.length > 1) { items.splice(index, 1); renderItems(); } }

function updateItem(index, key, val) {
    if (key === 'desc') {
        items[index][key] = val;
    } else {
        items[index][key] = parseFloat(val) || 0;
    }
}

function generateAndDownload() {
    const preview = document.getElementById('invoice-preview');

    const invNo = document.getElementById('in-no').value || 'INV-001';
    const rawDate = document.getElementById('in-date').value;
    const invDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const clientName = document.getElementById('in-client-name').value || 'Client Name';
    const clientAddress = document.getElementById('in-client-address').value || '';
    const taxRate = parseFloat(document.getElementById('in-tax').value) || 0;
    const accName = document.getElementById('in-acc-name').value || '-';
    const bank = document.getElementById('in-bank').value || '-';
    const accNum = document.getElementById('in-acc-number').value || '-';
    const isPaid = document.getElementById('in-is-paid').checked;
    const notes = document.getElementById('in-notes').value;

    const hasDiscount = items.some(item => item.disc > 0);

    let subtotal = 0;
    let tableRows = '';
    
    items.forEach(item => {
        let base = item.rate * item.hours;
        let final = Math.max(0, base - item.disc);
        subtotal += final;

        let qtyText = item.hours;
        if (item.hours === 24) qtyText = "24 (1 Day)";

        let discCell = '';
        if (hasDiscount) {
            discCell = `<td style="color:#ef4444">${item.disc > 0 ? '-' + formatCurrency(item.disc) : '-'}</td>`;
        }

        tableRows += `
            <tr>
                <td><b>${item.desc || 'Untitled Service'}</b></td>
                <td>${formatCurrency(item.rate)}</td>
                <td style="text-align:center">${qtyText}</td>
                ${discCell}
                <td style="text-align:right"><b>${formatCurrency(final)}</b></td>
            </tr>
        `;
    });

    const taxVal = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxVal;

    let discHeader = '';
    if (hasDiscount) {
        discHeader = `<th>Discount</th>`;
    }

    preview.innerHTML = `
        <div class="pdf-render">
            ${isPaid ? '<div class="pdf-stamp">PAID</div>' : ''}
            
            <div class="pdf-header">
                <div class="pdf-brand-side">
                    <h1>INVOICE</h1>
                </div>
                <div class="pdf-meta-side">
                    <img src="Logo_Dipakaiberuda.png" alt="Logo" style="width: 200px; height: auto; margin-bottom: 15px;">
                    <p>Date: <b>${invDate}</b></p>
                    <p>No: <b>${invNo}</b></p>
                </div>
            </div>
            
            <div class="header-divider"></div>

            <div class="pdf-billed-to">
                <h3>Billed To:</h3>
                <p class="client-name">${clientName}</p>
                <p class="client-addr">${clientAddress}</p>
            </div>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Rate</th>
                        <th style="text-align:center">Qty/Hrs</th>
                        ${discHeader}
                        <th style="text-align:right">Amount</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div class="pdf-totals-section">
                <table class="pdf-totals-table">
                    <tr><td class="label">Subtotal</td><td class="val">${formatCurrency(subtotal)}</td></tr>
                    <tr><td class="label">Tax (${taxRate}%)</td><td class="val">${formatCurrency(taxVal)}</td></tr>
                    <tr class="pdf-grand-total"><td class="label">Total Amount</td><td class="val">${formatCurrency(grandTotal)}</td></tr>
                </table>
            </div>
            <div class="pdf-footer">
                <div class="pdf-pay-info" style="${isPaid ? 'visibility:hidden' : ''}">
                    <h3>Payment Information</h3>
                    <p><b>Bank:</b> ${bank}</p>
                    <p><b>Account No:</b> ${accNum}</p>
                    <p><b>Account Name:</b> ${accName}</p>
                </div>
                <div class="pdf-from-info" style="text-align:right">
                    <h3>Issued By</h3>
                    <p><b>Dipakai Berdua</b></p>
                    <p>Pekanbaru</p>
                </div>
            </div>
            ${notes ? `<div class="pdf-notes-footer">${notes}</div>` : ''}
        </div>
    `;

    // Panggil kotak dialog Print bawaan browser
    setTimeout(() => {
        window.print();
    }, 150);
}