// Remplit automatiquement le champ avec la date du jour
function myFunction_date() {
    const dateDiv = document.getElementById("dateAudit");
    if (dateDiv) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let dateLocale = new Date().toLocaleDateString('fr-FR', options);
        
        // Force la majuscule sur le premier caractère
        let dateMaj = dateLocale.charAt(0).toUpperCase() + dateLocale.slice(1);
        
        dateDiv.textContent = dateMaj;
        console.log("Date calculée : " + dateMaj); // Regarde dans la console F12
    }
}

// Appel de la date au chargement
window.addEventListener('DOMContentLoaded', myFunction_date);

function toggleDechets(value) {
    const box = document.getElementById('status_dechets');
    if (!box) return;
    box.style.display = 'block';
    if(value === 'Oui') {
        box.className = 'status-box status-nonconforme';
        box.innerHTML = '🚨 NON CONFORME<br><span style="font-weight:normal; color:#242424;">Mettre de l\'absorbant sur la zone à traiter</span>';
    } else {
        box.className = 'status-box status-conforme';
        box.innerHTML = '✅ CONFORME<br><span style="font-weight:normal; color:#242424;">Pas d\'action à réaliser</span>';
    }
}

function toggleProduit(value) {
    const box = document.getElementById('status_produit');
    if (!box) return;
    box.style.display = 'block';
    if(value === 'Oui') {
        box.className = 'status-box status-nonconforme';
        box.innerHTML = '🚨 NON CONFORME<br><span style="font-weight:normal; color:#242424;">Mettre de l\'absorbant sur la zone à traiter</span>';
    } else {
        box.className = 'status-box status-conforme';
        box.innerHTML = '✅ CONFORME<br><span style="font-weight:normal; color:#242424;">Pas d\'action à réaliser</span>';
    }
}

function toggleEpoxy(value) {
    const div = document.getElementById('conditional_epoxy');
    const input = document.getElementById('pourquoiEpoxy');
    if (!div || !input) return;
    if(value === 'Non') {
        div.style.display = 'block';
        input.required = true;
    } else {
        div.style.display = 'none';
        input.required = false;
    }
}

function toggleDlu(value) {
    const box = document.getElementById('status_dlu');
    if (!box) return;
    box.style.display = 'block';
    if(value === 'Oui') {
        box.className = 'status-box status-conforme';
        box.innerHTML = '✅ CONFORME<br><span style="font-weight:normal; color:#242424;">Remettre les produits dans leur contenants d\'origine.</span>';
    } else {
        box.className = 'status-box status-nonconforme';
        box.innerHTML = '🚨 NON CONFORME<br><span style="font-weight:normal; color:#242424;">- Si c\'est de la résine : Faire catalyser dans la zone déchet extérieure.<br>- Si autres produits : Jeter les seaux à la poubelle.</span>';
    }
}

function toggleFuts(value) {
    const div = document.getElementById('conditional_futs');
    const select = document.getElementById('actionFuts');
    if (!div || !select) return;
    if(value === 'Non') {
        div.style.display = 'block';
        select.required = true;
    } else {
        div.style.display = 'none';
        select.required = false;
    }
}

// --- GESTION SÉCURISÉE DES APERÇUS PHOTOS ---
function setupPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// On active l'aperçu pour TOUTES les photos
setupPreview('photoBalancesInput', 'aperçuBalances');
setupPreview('photoEpoxyInput', 'aperçuEpoxy');
setupPreview('photoRésultatInput', 'aperçuRésultat');


// --- GESTION DE LA SIGNATURE ---
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return; // Sécurité anti-crash
        
    const ctx = canvas.getContext('2d');
    const clearButton = document.getElementById('clearBtn');
        
    let drawing = false;

    ctx.strokeStyle = "#242424";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function initCanvasSize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.strokeStyle = "#242424";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }

    initCanvasSize();

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    function startDrawing(e) {
        drawing = true;
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault(); 
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing); 

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }
});