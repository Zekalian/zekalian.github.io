let shots = [{ 
    shotNo: '1', description: '', framing: '', talent: '', equipment: '', props: '', notes: '', imgUrl: '' 
}];

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
                <div class="item-header-badge">Photo ${index + 1}</div>
                <button class="btn-remove" onclick="removeShot(${index})">✕</button>
                
                <div class="grid-2-cols" style="margin-top: 15px;">
                    <div class="input-group">
                        <label>Shot ID / No.</label>
                        <input type="text" placeholder="e.g. Look 1 / Set A" 
                               value="${shot.shotNo}" oninput="updateShot(${index}, 'shotNo', this.value)">
                    </div>
                    <div class="input-group">
                        <label>Framing / Angle</label>
                        <input type="text" placeholder="e.g. Full Body, Close Up, Low Angle" 
                               value="${shot.framing}" oninput="updateShot(${index}, 'framing', this.value)">
                    </div>
                </div>

                <div class="input-group">
                    <label>Description / Mood</label>
                    <textarea rows="2" placeholder="Pose, ekspresi, atau vibe foto..." 
                              oninput="updateShot(${index}, 'description', this.value)">${shot.description}</textarea>
                </div>

                <div class="grid-2-cols">
                    <div class="input-group">
                        <label>Talent & Wardrobe</label>
                        <textarea rows="2" placeholder="Siapa talentnya & pakai baju apa?" 
                                  oninput="updateShot(${index}, 'talent', this.value)">${shot.talent}</textarea>
                    </div>
                    <div class="input-group">
                        <label>Props (Properti)</label>
                        <textarea rows="2" placeholder="Benda yang masuk ke dalam frame" 
                                  oninput="updateShot(${index}, 'props', this.value)">${shot.props}</textarea>
                    </div>
                </div>

                <div class="input-group">
                    <label>Equipment (Lens / Lighting)</label>
                    <input type="text" placeholder="e.g. Lensa 85mm, Strobe Keylight" 
                           value="${shot.equipment}" oninput="updateShot(${index}, 'equipment', this.value)">
                </div>

                <div class="grid-2-cols">
                    <div class="input-group">
                        <label>Additional Notes</label>
                        <textarea rows="4" placeholder="Catatan ekstra untuk tim..." 
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
    shots.push({ shotNo: `${shots.length + 1}`, description: '', framing: '', talent: '', equipment: '', props: '', notes: '', imgUrl: '' }); 
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

    const project = document.getElementById('sb-project').value || 'Untitled Photoshoot';
    const client = document.getElementById('sb-client').value || '-';
    const photographer = document.getElementById('sb-photographer').value || '-';
    const location = document.getElementById('sb-location').value || 'TBA';
    const time = document.getElementById('sb-time').value || '-';
    const wrap = document.getElementById('sb-wrap').value || '-';
    const roll = document.getElementById('sb-roll').value || '-';
    const rawDate = document.getElementById('sb-date').value;
    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    let cardsHtml = '';
    shots.forEach(shot => {
        cardsHtml += `
            <div class="sb-card">
                <div class="sb-header-bar">
                    <span>ID: ${shot.shotNo || '-'}</span>
                    <span>Framing: ${shot.framing || '-'}</span>
                </div>
                <div class="sb-img-container">
                    ${shot.imgUrl ? `<img src="${shot.imgUrl}">` : '<span style="color:#999;">No Visual Reference</span>'}
                </div>
                <div class="sb-details">
                    <div class="sb-details-row">
                        <div class="sb-label">Desc/Mood</div>
                        <div class="sb-value"><b>${shot.description || '-'}</b></div>
                    </div>
                    <div class="sb-details-row">
                        <div class="sb-label">Talent/W.drobe</div>
                        <div class="sb-value">${shot.talent || '-'}</div>
                    </div>
                    <div class="sb-details-row">
                        <div class="sb-label">Props</div>
                        <div class="sb-value">${shot.props || '-'}</div>
                    </div>
                    <div class="sb-details-row">
                        <div class="sb-label">Equipment</div>
                        <div class="sb-value">${shot.equipment || '-'}</div>
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
                    <h1>PHOTOSHOOT LIST</h1>
                    <p style="font-size: 16px; font-weight: 700;">${project} ${client !== '-' ? `| ${client}` : ''}</p>
                    <p style="font-size: 12px; margin-top: 5px;">Photographer: <strong>${photographer}</strong></p>
                </div>
                <div class="pdf-meta">
                    <p>Location: <strong>${location}</strong></p>
                    <p>Date: <strong>${dateStr}</strong></p>
                    <p>Time: <strong>${time} - ${wrap} (Est. Wrap)</strong></p>
                    <p>Cam / Roll: <strong>${roll}</strong></p>
                </div>
            </div>

            <div class="pdf-storyboard-grid">
                ${cardsHtml}
            </div>
        </div>
    `;

    setTimeout(() => {
        window.print();
    }, 300);
}