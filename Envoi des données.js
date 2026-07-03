const resetBtn = document.getElementById('resetFormBtn');
const form = document.getElementById('auditForm');

// Fonction du bouton "Réinitialiser" en haut
if (resetBtn && form) {
    resetBtn.addEventListener('click', () => {
        if (confirm("Es-tu sûr de vouloir effacer toutes les réponses ?")) {
            form.reset();

            document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');

            const statusBoxes = document.querySelectorAll('.status-box');
            statusBoxes.forEach(box => box.style.display = 'none');
            
            const condEpoxy = document.getElementById('conditional_epoxy');
            if (condEpoxy) condEpoxy.style.display = 'none';
            
            const condFuts = document.getElementById('conditional_futs');
            if (condFuts) condFuts.style.display = 'none';

            const apercuBalances = document.getElementById('apercuBalances');
            if (apercuBalances) { apercuBalances.style.display = 'none'; apercuBalances.removeAttribute('src'); }
            
            const apercuEpoxy = document.getElementById('apercuEpoxy');
            if (apercuEpoxy) { apercuEpoxy.style.display = 'none'; apercuEpoxy.removeAttribute('src'); }
            
            const apercuResultat = document.getElementById('apercuResultat');
            if (apercuResultat) { apercuResultat.style.display = 'none'; apercuResultat.removeAttribute('src'); }

            const canvas = document.getElementById('signaturePad');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    });
}

// Fonction du bouton "Valider"
window.validerAudit = async function() {
    const form = document.getElementById('auditForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return; 
    }

    const formData = new FormData();

    const dateAuditElement = document.getElementById('dateAudit');
    formData.append('date_audit', dateAuditElement ? (dateAuditElement.textContent || dateAuditElement.value) : "Date inconnue");
    formData.append('nom_auditeur', document.getElementById('nomAuditeur').value);
    formData.append('entretien_balances', document.getElementById('entretienBalances').value);
    
    const remarquesSemaine = document.getElementById('remarquesSemaine');
    if (remarquesSemaine) formData.append('remarques_semaine', remarquesSemaine.value);

    const zoneChecked = document.querySelector('input[name="zone_balayée"]:checked');
    if (zoneChecked) formData.append('zone_balayee', zoneChecked.value);

    const dechetsChecked = document.querySelector('input[name="dechets"]:checked');
    if (dechetsChecked) formData.append('dechets', dechetsChecked.value);

    const produitChecked = document.querySelector('input[name="produit"]:checked');
    if (produitChecked) formData.append('produit_sol', produitChecked.value);

    const dluChecked = document.querySelector('input[name="dlu"]:checked');
    if (dluChecked) formData.append('dlu_conforme', dluChecked.value);

    const epoxyChecked = document.querySelector('input[name="epoxy"]:checked');
    if (epoxyChecked) {
        formData.append('epoxy_change', epoxyChecked.value);
        if (epoxyChecked.value === 'Non') {
            const pourquoiEpoxy = document.getElementById('pourquoiEpoxy');
            if (pourquoiEpoxy) formData.append('pourquoi_epoxy', pourquoiEpoxy.value);
            
            const photoEpoxyInput = document.getElementById('photoEpoxyInput');
            if (photoEpoxyInput && photoEpoxyInput.files[0]) {
                formData.append('photo_epoxy', photoEpoxyInput.files[0]);
            }
        }
    }

    const futsChecked = document.querySelector('input[name="futs"]:checked');
    if (futsChecked) {
        formData.append('compatibilite_futs', futsChecked.value);
        if (futsChecked.value === 'Non') {
            const actionFuts = document.getElementById('actionFuts');
            if (actionFuts) formData.append('action_futs', actionFuts.value);
        }
    }

    const photoBalancesInput = document.getElementById('photoBalancesInput');
    if (photoBalancesInput && photoBalancesInput.files[0]) {
        formData.append('photo_balances', photoBalancesInput.files[0]);
    }

    const photoRésultatInput = document.getElementById('photoRésultatInput');
    if (photoRésultatInput && photoRésultatInput.files[0]) {
        formData.append('photo_résultat', photoRésultatInput.files[0]);
    }

    const canvas = document.getElementById('signaturePad');
    if (canvas) {
        await new Promise(resolve => {
            canvas.toBlob(blob => {
                if (blob) {
                    formData.append('signature', blob, 'signature.png');
                }
                resolve();
            }, 'image/png');
        });
    }

    try {
        const response = await fetch('http://localhost:5000/api/audit', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("✓ Audit validé avec succès ! Les données sont enregistrées.");
            
            form.reset(); 
            
            // 1. On supprime les indications "Conforme / Non Conforme" (ce qu'on a fait tout à l'heure)
            const statusBoxes = document.querySelectorAll('.status-box');
            statusBoxes.forEach(box => {
                box.style.display = 'none';
            });
            
            // 2. ⚠️ ON SUPPRIME LES APERÇUS PHOTOS (ta demande actuelle)
            const apercuBalances = document.getElementById('apercuBalances');
            if (apercuBalances) {
                apercuBalances.src = "";
                apercuBalances.style.display = 'none';
            }
            
            const apercuEpoxy = document.getElementById('apercuEpoxy');
            if (apercuEpoxy) {
                apercuEpoxy.src = "";
                apercuEpoxy.style.display = 'none';
            }
            
            const apercuResultat = document.getElementById('apercuResultat');
            if (apercuResultat) {
                apercuResultat.src = "";
                apercuResultat.style.display = 'none';
            }

            // 3. On vide la mémoire des boutons photos du navigateur
            document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');

            // 4. On nettoie la zone de signature
            const canvas = document.getElementById('signaturePad');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
        } else {
            alert("❌ Erreur lors de l'envoi au serveur Python.");
        }
    } catch (error) {
        console.error("Erreur de connexion :", error);
        alert("❌ Impossible de joindre le serveur Python. Vérifie qu'il est bien démarré.");
    }
}