let items = [{ desc: '', price: 0 }];
let refItems = []; // Array untuk menyimpan referensi gambar

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prop-date').valueAsDate = new Date();
    renderItems();
    renderRefItems(); // Render referensi kosong saat dimuat
});

function formatCurrency(amount) {
    return "Rp " + amount.toLocaleString('id-ID');
}

// --- FUNGSI UNTUK SECTION 3 (SCOPE OF WORK) ---
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
    if (key === 'desc') items[index][key] = val;
    else items[index][key] = parseFloat(val) || 0;
}

// --- FUNGSI UNTUK SECTION 5 (REFERENCES) ---
function renderRefItems() {
    const container = document.getElementById('references-list');
    container.innerHTML = '';

    refItems.forEach((item, index) => {
        const html = `
            <div class="item-card">
                <div class="item-header-badge" style="background: #8b5cf6;">Reference ${index + 1}</div>
                <button class="btn-remove" style="background: #ef4444;" onclick="removeRefItem(${index})">✕</button>
                
                <div class="input-group" style="margin-top: 15px;">
                    <label>Image Title</label>
                    <input type="text" placeholder="e.g. 3D Character Concept" 
                           value="${item.title || ''}" oninput="updateRefItem(${index}, 'title', this.value)">
                </div>
                
                <div class="input-group">
                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onchange="handleImageUpload(event, ${index})">
                    <div class="img-preview-box">
                        ${item.imgUrl ? `<img src="${item.imgUrl}">` : '<span style="color:#aaa; font-size:12px;">No image selected</span>'}
                    </div>
                </div>

                <div class="input-group">
                    <label>Brief Description</label>
                    <textarea rows="2" placeholder="Jelaskan alasan referensi ini dipilih..." 
                              oninput="updateRefItem(${index}, 'desc', this.value)">${item.desc || ''}</textarea>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function addReferenceItem() { refItems.push({ title: '', imgUrl: '', desc: '' }); renderRefItems(); }
function removeRefItem(index) { refItems.splice(index, 1); renderRefItems(); }
function updateRefItem(index, key, val) { refItems[index][key] = val; }

function handleImageUpload(event, index) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            refItems[index].imgUrl = e.target.result; // Simpan sebagai Base64 string
            renderRefItems(); // Refresh tampilan
        };
        reader.readAsDataURL(file);
    }
}

// --- FUNGSI RENDER PDF ---
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

    // Cek apakah ada referensi yang valid (minimal salah satu field diisi)
    const validRefs = refItems.filter(r => r.title || r.imgUrl || r.desc);
    
    let termsNumber = "4"; // Default nomor untuk Terms jika referensi kosong
    let referencesHtml = ''; // Penampung HTML referensi

    if (validRefs.length > 0) {
        termsNumber = "5"; // Geser Terms ke nomor 5

        let refGrids = '';
        validRefs.forEach(ref => {
            refGrids += `
                <div class="pdf-ref-item">
                    ${ref.imgUrl ? `<img src="${ref.imgUrl}">` : ''}
                    ${ref.title ? `<h4>${ref.title}</h4>` : ''}
                    ${ref.desc ? `<p>${ref.desc}</p>` : ''}
                </div>
            `;
        });

        referencesHtml = `
            <div class="pdf-section">
                <h2>4. Reference & Visual Guideline</h2>
                <div class="pdf-references">
                    ${refGrids}
                </div>
            </div>
        `;
    }

    preview.innerHTML = `
        <div class="pdf-render">
            <div class="pdf-header">
                <div>
                    <h1>PROPOSAL</h1>
                    <h2>${title}</h2>
                </div>
                <div class="pdf-meta">
                    <img src="logo-text-biru.png" alt="Logo"> 
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
                    <strong>Zekalian</strong>
                    <p>Pekanbaru<br>hello@dipakaiberdua.com</p>
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

            ${referencesHtml}
            
            <div class="pdf-section" style="page-break-inside: avoid;">
                <h2>${termsNumber}. Terms & Next Steps</h2>
                <pre>${terms}</pre>
                
                <div class="pdf-signatures">
                    <div class="sign-box">
                        <p>Accepted By (Client)</p>
                        <div class="sign-line"></div>
                        <span>${clientName}</span>
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
    }, 250); // Waktu jeda diperpanjang sedikit agar render gambar base64 lebih aman
}