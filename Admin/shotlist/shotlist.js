let shots = [{ shotNo: '1', angle: '', action: '', audio: '', duration: '', notes: '', imgUrl: '' }];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sb-date').valueAsDate = new Date();
    renderShots();
});

function renderShots() {
    const container = document.getElementById('shots-list');
    container.innerHTML = '';

    shots.forEach((shot, index) => {
        const html = `
            <div class="item-card">
                <div class="item-header-badge">Shot ${index + 1}</div>
                <button class="btn-remove" onclick="removeShot(${index})">✕</button>
                
                <div class="grid-2-cols" style="margin-top: 15px;">
                    <div class="input-group">
                        <label>Shot / Scene No.</label>
                        <input type="text" placeholder="e.g. Sc 1 / Sh 1A" 
                               value="${shot.shotNo}" oninput="updateShot(${index}, 'shotNo', this.value)">
                    </div>
                    <div class="input-group">
                        <label>Est. Duration</label>
                        <input type="text" placeholder="e.g. 5 sec" 
                               value="${shot.duration}" oninput="updateShot(${index}, 'duration', this.value)">
                    </div>
                </div>

                <div class="input-group">
                    <label>Shot Size & Angle</label>
                    <input type="text" placeholder="e.g. Wide Shot, Eye Level, Tracking" 
                           value="${shot.angle}" oninput="updateShot(${index}, 'angle', this.value)">
                </div>

                <div class="input-group">
                    <label>Visual Description / Action</label>
                    <textarea rows="2" placeholder="Apa yang terjadi di dalam frame?" 
                              oninput="updateShot(${index}, 'action', this.value)">${shot.action}</textarea>
                </div>

                <div class="input-group">
                    <label>Audio / Dialog / VO</label>
                    <textarea rows="2" placeholder="Teks dialog, VO, atau Sound Effect" 
                              oninput="updateShot(${index}, 'audio', this.value)">${shot.audio}</textarea>
                </div>

                <div class="grid-2-cols">
                    <div class="input-group">
                        <label>Camera/Lighting Notes</label>
                        <textarea rows="4" placeholder="e.g. Pakai Gimbal, ND Filter..." 
                                  oninput="updateShot(${index}, 'notes', this.value)">${shot.notes}</textarea>
                    </div>
                    <div class="input-group">
                        <label>Visual Ref. (Upload)</label>
                        <input type="file" accept="image/*" onchange="handleShotImage(event, ${index})">
                        <div class="img-preview-box">
                            ${shot.imgUrl ? `<img src="${shot.imgUrl}">` : '<span style="color:#aaa; font-size:11px;">No image</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function addShot() { 
    shots.push({ shotNo: `${shots.length + 1}`, angle: '', action: '', audio: '', duration: '', notes: '', imgUrl: '' }); 
    renderShots(); 
}
function removeShot(index) { shots.splice(index, 1); renderShots(); }
function updateShot(index, key, val) { shots[index][key] = val; }

function handleShotImage(event, index) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            shots[index].imgUrl = e.target.result;
            renderShots();
        };
        reader.readAsDataURL(file);
    }
}

function generateShotlist() {
    const preview = document.getElementById('shotlist-preview');

    const project = document.getElementById('sb-project').value || 'Untitled Project';
    const location = document.getElementById('sb-location').value || 'TBA';
    const rawDate = document.getElementById('sb-date').value;
    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    let cardsHtml = '';
    shots.forEach(shot => {
        cardsHtml += `
            <div class="sb-card">
                <div class="sb-header-bar">
                    <span>SHOT: ${shot.shotNo || '-'}</span>
                    <span>⏱ ${shot.duration || '-'}</span>
                </div>
                <div class="sb-img-container">
                    ${shot.imgUrl ? `<img src="${shot.imgUrl}">` : '<span style="color:#999;">No Visual Reference</span>'}
                </div>
                <div class="sb-details">
                    <div class="sb-details-row">
                        <div class="sb-label">Angle/Size</div>
                        <div class="sb-value"><b>${shot.angle || '-'}</b></div>
                    </div>
                    <div class="sb-details-row">
                        <div class="sb-label">Action</div>
                        <div class="sb-value">${shot.action || '-'}</div>
                    </div>
                    <div class="sb-details-row">
                        <div class="sb-label">Audio/VO</div>
                        <div class="sb-value">${shot.audio || '-'}</div>
                    </div>
                    <div class="sb-details-row" style="border:none;">
                        <div class="sb-label">Notes</div>
                        <div class="sb-value" style="color: #ef4444;">${shot.notes || '-'}</div>
                    </div>
                </div>
            </div>
        `;
    });

    preview.innerHTML = `
        <div class="pdf-render">
            <div class="pdf-header">
                <div>
                    <h1>STORYBOARD & SHOTLIST</h1>
                    <p style="font-size: 16px; font-weight: 700;">${project}</p>
                </div>
                <div class="pdf-meta">
                    <p>Location: <strong>${location}</strong></p>
                    <p>Date: <strong>${dateStr}</strong></p>
                    <p>Produced by: <strong>Zekalian</strong></p>
                </div>
            </div>

            <div class="pdf-storyboard-grid">
                ${cardsHtml}
            </div>
        </div>
    `;

    // Beri jeda sedikit agar gambar termuat sempurna sebelum dialog print muncul
    setTimeout(() => {
        window.print();
    }, 300);
}