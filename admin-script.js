
// Solution corrigée - admin-script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Script admin démarré');
    
    // 1. Initialisation CORRECTE de Supabase
    let supabase;
    
    if (typeof window.supabase !== 'undefined' && window.supabase.from) {
        // Si supabase est déjà initialisé (depuis un autre script)
        console.log('✅ Utilisation de Supabase existant');
        supabase = window.supabase;
    } else {
        // Initialiser Supabase depuis zéro
        console.log('🔄 Initialisation de Supabase...');
        const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
        
        // Vérifier que la bibliothèque Supabase est chargée
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabase = supabase; // Stocker pour une utilisation ultérieure
        } else {
            console.error('❌ Bibliothèque Supabase non chargée');
            alert('Erreur: Bibliothèque Supabase non chargée. Vérifiez votre connexion internet.');
            return;
        }
    }
    
    // 2. TESTER IMMÉDIATEMENT LA CONNEXION
    async function testerConnexionSupabase() {
        console.log('🔍 Test de connexion Supabase...');
        try {
            const { data, error } = await supabase
                .from('créateurs')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Erreur de connexion:', error);
                return false;
            }
            
            console.log('✅ Connexion Supabase réussie!');
            return true;
        } catch (error) {
            console.error('💥 Erreur inattendue:', error);
            return false;
        }
    }
    
    // 3. Vérification de connexion admin
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
        alert('⚠️ Accès non autorisé. Connectez-vous en tant qu\'administrateur.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Admin connecté');
    
    // 4. Tester la connexion avant de continuer
    testerConnexionSupabase().then(connected => {
        if (!connected) {
            document.getElementById('pendingCreators').innerHTML = 
                `<div style="color: red; padding: 30px; text-align: center;">
                    <h3>❌ Erreur de connexion à la base de données</h3>
                    <p>Impossible de se connecter à Supabase. Vérifiez:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>Votre connexion internet</li>
                        <li>Les politiques RLS dans Supabase</li>
                        <li>Que la clé API est correcte</li>
                    </ul>
                </div>`;
            return;
        }
        
        // Si connexion réussie, charger les créateurs
        chargerTousLesCreateurs();
    });
    
    // [Le reste de votre code reste inchangé...]
    // 5. Éléments de la page
    const pendingDiv = document.getElementById('pendingCreators');
    const approvedDiv = document.getElementById('approvedCreators');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!pendingDiv || !approvedDiv) {
        console.error('❌ Éléments manquants dans la page');
        return;
    }
    
    // 6. REQUÊTE : Charger tous les créateurs
    async function chargerTousLesCreateurs() {
        console.log('📡 Chargement des créateurs...');
        
        try {
            // Test de connexion d'abord
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                pendingDiv.innerHTML = `
                    <div style="color: red; padding: 20px; text-align: center;">
                        Erreur connexion: ${testError.message}<br>
                        <small>Code: ${testError.code}</small>
                    </div>
                `;
                return;
            }
            
            console.log(`✅ ${count} créateurs dans la base`);
            
            // [Le reste de votre fonction chargerTousLesCreateurs...]
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
    
    // [Les autres fonctions restent inchangées...]
    // 7. REQUÊTE : Approuver un créateur
    async function approuverCreateur(id, nomMarque) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Approuver le créateur "${nomMarque}" ?\n\nIl pourra se connecter à son espace.`)) {
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString()
                })
                .eq('id', id);
            
            console.log('📊 Résultat mise à jour:', { data, error: error?.message });
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            if (data && data.length === 0) {
                throw new Error('Créateur non trouvé ou déjà approuvé');
            }
            
            alert(`✅ "${nomMarque}" a été approuvé avec succès !`);
            console.log(`✅ Créateur ${id} approuvé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Échec de l'approbation: ${error.message}`);
        }
    }
    
    // 8. REQUÊTE : Refuser un créateur
    async function refuserCreateur(id, nomMarque) {
        console.log(`🗑️ Tentative de refus: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Refuser définitivement "${nomMarque}" ?\n\nCette action supprimera complètement la demande.`)) {
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            console.log('📊 Résultat suppression:', { data, error: error?.message });
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            if (data && data.length === 0) {
                throw new Error('Créateur non trouvé ou déjà traité');
            }
            
            alert(`❌ "${nomMarque}" a été refusé et supprimé.`);
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Échec du refus: ${error.message}`);
        }
    }
    
// 9. Fonction pour afficher les créateurs (VERSION CORRIGÉE)
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
            <div class="creator-card" id="creator-${creator.id}">
                <h3>${safeNom}</h3>
                <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Téléphone:</strong> ${safeTel}</p>
                <p><strong>Domaine:</strong> ${safeDomaine}</p>
                <p><strong>ID:</strong> <code>${creator.id}</code></p>
                <p><strong>Statut:</strong> ${creator.statut}</p>
        `;
        
        if (status === 'pending') {
            html += `
                <div class="card-actions">
                    <button class="action-btn approve-btn" data-id="${creator.id}" data-brand="${safeNom}">
                        ✅ Approuver
                    </button>
                    <button class="action-btn reject-btn" data-id="${creator.id}" data-brand="${safeNom}">
                        ❌ Refuser
                    </button>
                </div>
            `;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
    
    // AJOUTER LES ÉVÉNEMENTS APRÈS L'INSERTION DU HTML
    if (status === 'pending') {
        // Boutons Approuver
        container.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const brand = this.getAttribute('data-brand');
                approuverCreateur(id, brand);
            });
        });
        
        // Boutons Refuser
        container.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const brand = this.getAttribute('data-brand');
                refuserCreateur(id, brand);
            });
        });
    }
}
    // 10. Fonction utilitaire
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 11. Rendre les fonctions globales
    window.approuverCreateur = approuverCreateur;
    window.refuserCreateur = refuserCreateur;
    
    // 12. Gestion déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Déconnexion ?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
    
    // 13. Actualisation automatique
    setInterval(chargerTousLesCreateurs, 30000);
    
    console.log('🎯 Script admin prêt');
});
