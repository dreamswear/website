// admin-script.js - Version finale avec requêtes correctes
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Script admin démarré');
    
    // 1. Configuration Supabase
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
    
    // Initialiser Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // 2. Vérifier la connexion admin
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
        alert('⚠️ Accès non autorisé. Connectez-vous en tant qu\'administrateur.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Admin connecté');
    
    // 3. Éléments de la page
    const pendingDiv = document.getElementById('pendingCreators');
    const approvedDiv = document.getElementById('approvedCreators');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!pendingDiv || !approvedDiv) {
        console.error('❌ Éléments manquants dans la page');
        return;
    }
    
    // 4. REQUÊTE : Charger tous les créateurs
    async function chargerTousLesCreateurs() {
        console.log('📡 Connexion à Supabase...');
        
        try {
            // Test de connexion d'abord
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                pendingDiv.innerHTML = `
                    <div style="color: red; padding: 20px; text-align: center;">
                        Erreur connexion: ${testError.message}
                    </div>
                `;
                return;
            }
            
            console.log(`✅ ${count} créateurs dans la base`);
            
            // Charger les créateurs en attente
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${pendingError.message}
                </div>`;
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending`);
                afficherCreateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            // Charger les créateurs approuvés
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                approvedDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${approvedError.message}
                </div>`;
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés`);
                afficherCreateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                Erreur: ${error.message}
            </div>`;
        }
    }
    
    // 5. REQUÊTE : Approuver un créateur (changer son statut)
    async function approuverCreateur(id, nomMarque) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Approuver le créateur "${nomMarque}" ?\n\nIl pourra se connecter à son espace.`)) {
            return;
        }
        
        try {
            // REQUÊTE DE MISE À JOUR : Changer le statut de 'pending' à 'actif'
            const { data, error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',  // Change le statut
                    date_approbation: new Date().toISOString()  // Ajoute une date d'approbation
                })
                .eq('id', id)  // Cible l'ID spécifique
                .eq('statut', 'pending');  // Sécurité : vérifie qu'il est bien en attente
            
            console.log('📊 Résultat mise à jour:', { data, error: error?.message });
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            if (data && data.length === 0) {
                throw new Error('Créateur non trouvé ou déjà approuvé');
            }
            
            // Succès
            alert(`✅ "${nomMarque}" a été approuvé avec succès !`);
            console.log(`✅ Créateur ${id} approuvé`);
            
            // Recharger les listes
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Échec de l'approbation: ${error.message}`);
        }
    }
    
    // 6. REQUÊTE : Refuser un créateur (le supprimer)
    async function refuserCreateur(id, nomMarque) {
        console.log(`🗑️ Tentative de refus: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Refuser définitivement "${nomMarque}" ?\n\nCette action supprimera complètement la demande.`)) {
            return;
        }
        
        try {
            // REQUÊTE DE SUPPRESSION : Supprimer le créateur
            const { data, error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id)  // Cible l'ID spécifique
                .eq('statut', 'pending');  // Sécurité : vérifie qu'il est bien en attente
            
            console.log('📊 Résultat suppression:', { data, error: error?.message });
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            if (data && data.length === 0) {
                throw new Error('Créateur non trouvé ou déjà traité');
            }
            
            // Succès
            alert(`❌ "${nomMarque}" a été refusé et supprimé.`);
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            // Recharger les listes
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Échec du refus: ${error.message}`);
        }
    }
    
    // 7. Fonction pour afficher les créateurs
    function afficherCreateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">${message}</div>`;
            return;
        }
        
        let html = '';
        
        creators.forEach(creator => {
            const safeNom = escapeHtml(creator.nom_marque || 'Sans nom');
            const safePrenom = escapeHtml(creator.prenom || '');
            const safeNomComplet = escapeHtml(creator.nom || '');
            const safeEmail = escapeHtml(creator.email || 'Non fourni');
            const safeTel = escapeHtml(creator.telephone || 'Non fourni');
            const safeDomaine = escapeHtml(creator.domaine || 'Non spécifié');
            
            html += `
                <div style="
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #333;">${safeNom}</h3>
                        <span style="
                            background: ${status === 'pending' ? '#ffc107' : '#28a745'};
                            color: ${status === 'pending' ? '#000' : 'white'};
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: bold;
                        ">
                            ${status === 'pending' ? 'EN ATTENTE' : 'APPROUVÉ'}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                        <p><strong>Email:</strong> ${safeEmail}</p>
                        <p><strong>Téléphone:</strong> ${safeTel}</p>
                        <p><strong>Domaine:</strong> ${safeDomaine}</p>
                        <p><strong>ID:</strong> <code>${creator.id}</code></p>
                    </div>
            `;
            
            if (status === 'pending') {
                html += `
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button onclick="approuverCreateur(${creator.id}, '${safeNom.replace(/'/g, "\\'")}')"
                                style="
                                    flex: 1;
                                    background: #28a745;
                                    color: white;
                                    border: none;
                                    padding: 10px 20px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-weight: bold;
                                    transition: background 0.3s;
                                "
                                onmouseover="this.style.background='#218838'"
                                onmouseout="this.style.background='#28a745'">
                            ✅ Approuver
                        </button>
                        <button onclick="refuserCreateur(${creator.id}, '${safeNom.replace(/'/g, "\\'")}')"
                                style="
                                    flex: 1;
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    padding: 10px 20px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-weight: bold;
                                    transition: background 0.3s;
                                "
                                onmouseover="this.style.background='#c82333'"
                                onmouseout="this.style.background='#dc3545'">
                            ❌ Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    // 8. Fonction utilitaire
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 9. Rendre les fonctions globales
    window.approuverCreateur = approuverCreateur;
    window.refuserCreateur = refuserCreateur;
    
    // 10. Gestion déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Déconnexion ?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
    
    // 11. Démarrer
    console.log('🚀 Chargement initial...');
    chargerTousLesCreateurs();
    
    // Actualisation automatique
    setInterval(chargerTousLesCreateurs, 30000);
    
    console.log('🎯 Script admin prêt');
});
