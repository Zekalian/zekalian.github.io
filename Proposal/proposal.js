let items = [{ desc: '', price: 0 }];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prop-date').valueAsDate = new Date();
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
                <div class="item-header-badge">Project Item ${index + 1}</div>
                ${items.length > 1 ? `<button class="btn-remove" onclick="removeItem(${index})">✕</button>` : ''}
                
                <div class="input-group" style="margin-top: 15px;">
                    <label>Description / Deliverable</label>
                    <input type="text" placeholder="e.g. 1x Motion Graphic Video 60s" 
                           value="${item.desc}" oninput="updateItem(${index}, 'desc', this.value)">
                </div>
                
                <div class="input-group">
                    <label>Estimated Price</label>
                    <div class="prefix-wrapper">
                        <span>Rp</span>
                        <input type="number" placeholder="0" 
                               value="${item.price || ''}" oninput="updateItem(${index}, 'price', this.value)">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function addNewItem() { items.push({ desc: '', price: 0 }); renderItems(); }
function removeItem(index) { if (items.length > 1) { items.splice(index, 1); renderItems(); } }

function updateItem(index, key, val) {
    if (key === 'desc') {
        items[index][key] = val;
    } else {
        items[index][key] = parseFloat(val) || 0;
    }
}

function generateProposal() {
    const preview = document.getElementById('proposal-preview');

    const propNo = document.getElementById('prop-no').value;
    const rawDate = document.getElementById('prop-date').value;
    const propDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const propValid = document.getElementById('prop-valid').value;
    
    const clientName = document.getElementById('prop-client-name').value || 'Client Name';
    const clientAddress = document.getElementById('prop-client-address').value || '-';
    
    const title = document.getElementById('prop-title').value || 'Project Proposal';
    const overview = document.getElementById('prop-overview').value || '-';
    const timeline = document.getElementById('prop-timeline').value || '-';
    const terms = document.getElementById('prop-terms').value || '-';

    let grandTotal = 0;
    let tableRows = '';
    
    items.forEach(item => {
        grandTotal += item.price;
        tableRows += `
            <tr>
                <td><b>${item.desc || 'Untitled Service'}</b></td>
                <td style="text-align:right">${formatCurrency(item.price)}</td>
            </tr>
        `;
    });

    preview.innerHTML = `
        <div class="pdf-render">
            <div class="pdf-header">
                <div>
                    <h1>PROPOSAL</h1>
                    <p style="font-size:16px; color:#6366f1; font-weight:600; margin-top:5px;">${title}</p>
                </div>
                <div class="pdf-meta">
                    <img src="Logo_Dipakaiberuda.png" alt="Logo">
                    <p>Date: <b>${propDate}</b></p>
                    <p>No: <b>${propNo}</b></p>
                    <p>Valid For: <b>${propValid}</b></p>
                </div>
            </div>
            
            <div class="header-divider"></div>

            <div class="pdf-prepared">
                <div class="pdf-prepared-box">
                    <h3>Prepared For</h3>
                    <strong>${clientName}</strong>
                    <p style="white-space:pre-wrap; color:#4338ca;">${clientAddress}</p>
                </div>
                <div class="pdf-prepared-box" style="text-align:right;">
                    <h3>Prepared By</h3>
                    <strong>Dipakai Berdua</strong>
                    <p>Creative Studio, Pekanbaru<br>hello@dipakaiberdua.com</p>
                </div>
            </div>

            <div class="pdf-section">
                <h2>1. Project Overview & Objective</h2>
                <pre>${overview}</pre>
            </div>

            <div class="pdf-section">
                <h2>2. Project Timeline</h2>
                <pre>${timeline}</pre>
            </div>

            <div class="pdf-section">
                <h2>3. Scope of Work & Investment</h2>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th>Description / Deliverables</th>
                            <th style="text-align:right">Estimated Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="pdf-total-row">
                            <td style="text-align:right">Total Investment</td>
                            <td style="text-align:right">${formatCurrency(grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pdf-section" style="page-break-inside: avoid;">
                <h2>4. Terms & Next Steps</h2>
                <pre>${terms}</pre>
                
                <div class="pdf-signatures">
                    <div class="sign-box">
                        <p>Accepted By (Client)</p>
                        <div class="sign-line"></div>
                        <span>Name / Signature / Date</span>
                    </div>
                    <div class="sign-box">
                        <p>Prepared By</p>
                        <div class="sign-line"></div>
                        <span>Dipakai Berdua</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        window.print();
    }, 150);
}