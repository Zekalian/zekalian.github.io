let refItems = []; // Array for reference images

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cb-date').valueAsDate = new Date();
    renderRefItems(); // Render empty reference on load
});

// --- FUNCTIONS FOR VISUAL REFERENCES ---
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
                    <input type="text" placeholder="e.g. Layout Concept" 
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
                    <textarea rows="2" placeholder="Why was this reference chosen?" 
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
            refItems[index].imgUrl = e.target.result;
            renderRefItems();
        };
        reader.readAsDataURL(file);
    }
}

// --- RENDER PDF FUNCTION ---
function generateBrief() {
    const preview = document.getElementById('brief-preview');

    const projectName = document.getElementById('cb-project-name').value || 'Untitled Project';
    const clientName = document.getElementById('cb-client-name').value || 'Unknown Client';
    const rawDate = document.getElementById('cb-date').value;
    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    const picName = document.getElementById('cb-pic').value || 'TBA';

    const objective = document.getElementById('cb-objective').value || '-';
    const audience = document.getElementById('cb-audience').value || '-';
    const message = document.getElementById('cb-message').value || '-';
    
    const tone = document.getElementById('cb-tone').value || '-';
    const colors = document.getElementById('cb-colors').value || '-';
    const referencesText = document.getElementById('cb-references').value || '-';

    const deliverables = document.getElementById('cb-deliverables').value || '-';
    const competitors = document.getElementById('cb-competitors').value || '-';
    const mandatory = document.getElementById('cb-mandatory').value || '-';

    // Image Reference Logic
    const validRefs = refItems.filter(r => r.title || r.imgUrl || r.desc);
    let deliverableNumber = "4";
    let visualReferencesHtml = '';

    if (validRefs.length > 0) {
        deliverableNumber = "5"; // Shift Deliverables down

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

        visualReferencesHtml = `
            <div class="brief-section">
                <h3>4. Visual References (Images)</h3>
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
                    <h1>CREATIVE BRIEF</h1>
                </div>
                <div class="pdf-logo">
                    <img src="logo-text-biru.png" alt="Logo"> 
                </div>
            </div>

            <div class="brief-meta-box">
                <div class="meta-item">
                    <label>Project Name</label>
                    <span>${projectName}</span>
                </div>
                <div class="meta-item">
                    <label>Client / Brand</label>
                    <span>${clientName}</span>
                </div>
                <div class="meta-item">
                    <label>Date Prepared</label>
                    <span>${dateStr}</span>
                </div>
                <div class="meta-item">
                    <label>Person in Charge</label>
                    <span>${picName}</span>
                </div>
            </div>

            <div class="brief-section">
                <h3>1. Objective & Target</h3>
                <div class="brief-grid">
                    <div class="data-block">
                        <label>Project Objective</label>
                        <pre>${objective}</pre>
                    </div>
                    <div class="data-block">
                        <label>Target Audience</label>
                        <p>${audience}</p>
                    </div>
                    <div class="data-block">
                        <label>Key Message</label>
                        <p>${message}</p>
                    </div>
                </div>
            </div>

            <div class="brief-section">
                <h3>2. Visual Direction</h3>
                <div class="brief-grid">
                    <div class="data-block">
                        <label>Tone & Vibe</label>
                        <p>${tone}</p>
                    </div>
                    <div class="data-block">
                        <label>Color Palette</label>
                        <p>${colors}</p>
                    </div>
                    <div class="data-block">
                        <label>Design Notes</label>
                        <pre>${referencesText}</pre>
                    </div>
                </div>
            </div>

            ${visualReferencesHtml}

            <div class="brief-section" style="page-break-inside: avoid;">
                <h3>${deliverableNumber}. Deliverables & Constraints</h3>
                <div class="brief-grid">
                    <div class="data-block">
                        <label>Deliverables (Expected Outputs)</label>
                        <pre>${deliverables}</pre>
                    </div>
                    <div class="data-block">
                        <label>Competitors</label>
                        <p>${competitors}</p>
                    </div>
                    <div class="data-block">
                        <label>Mandatory Elements</label>
                        <p>${mandatory}</p>
                    </div>
                </div>
            </div>

        </div>
    `;

    setTimeout(() => {
        window.print();
    }, 250);
}