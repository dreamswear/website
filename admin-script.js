// admin-script.js - Script spécifique pour la page admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Script admin démarré');
    
    // 1. Configuration Supabase (identique à script.js)
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
    
    // 4. REQUÊTE PRINCIPALE : Lire les créateurs depuis la base
    async function chargerCreeateurs() {
        console.log('📡 Connexion à Supabase...');
        
        try {
            // REQUÊTE 1 : Créateurs en attente (statut = 'pending')
            console.log('🔍 Recherche des créateurs "pending"...');
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')  // Nom de la table
                .select('*')        // Sélectionner toutes les colonnes
                .eq('statut', 'pending')  // Filtrer par statut
                .order('created_at', { ascending: false });  // Trier par date
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${pendingError.message}
                </div>`;
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending trouvés`);
                afficherCreeateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            // REQUÊTE 2 : Créateurs approuvés (statut = 'actif')
            console.log('🔍 Recherche des créateurs "actif"...');
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')  // Nom de la table
                .select('*')        // Sélectionner toutes les colonnes
                .eq('statut', 'actif')  // Filtrer par statut
                .order('created_at', { ascending: false });  // Trier par date
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                approvedDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${approvedError.message}
                </div>`;
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés trouvés`);
                afficherCreeateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                Erreur inattendue: ${error.message}
            </div>`;
        }
    }
    
    // 5. Fonction pour afficher les créateurs
    function afficherCreeateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div class="empty-message">${message}</div>`;
            return;
        }
        
        let html = '';
        
        creators.forEach(creator => {
            const date = creator.created_at 
                ? new Date(creator.created_at).toLocaleDateString('fr-FR')
                : 'Date inconnue';
            
            html += `
                <div class="creator-card">
                    <h3>${escapeHtml(creator.nom_marque || 'Sans nom')}</h3>
                    <p><strong>Contact:</strong> ${escapeHtml(creator.prenom || '')} ${escapeHtml(creator.nom || '')}</p>
                    <p><strong>Email:</strong> ${escapeHtml(creator.email || 'Non fourni')}</p>
                    <p><strong>Téléphone:</strong> ${escapeHtml(creator.telephone || 'Non fourni')}</p>
                    <p><strong>Domaine:</strong> ${escapeHtml(creator.domaine || 'Non spécifié')}</p>
                    <p><strong>Date d'inscription:</strong> ${date}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" 
                                onclick="approuverCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                            ✅ Approuver
                        </button>
                        <button class="action-btn reject-btn" 
                                onclick="refuserCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                            ❌ Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    // 6. Fonctions d'action (à rendre globales)
    window.approuverCreator = async function(id, nomMarque) {
        if (!confirm(`Approuver le créateur "${nomMarque}" ?`)) return;
        
        try {
            console.log(`🔄 Approuver créateur ${id}...`);
            
            // REQUÊTE DE MISE À JOUR : Changer le statut à 'actif'
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    approved_at: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`✅ "${nomMarque}" a été approuvé !`);
            chargerCreeateurs(); // Recharger la liste
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`Erreur: ${error.message}`);
        }
    };
    
    window.refuserCreator = async function(id, nomMarque) {
        if (!confirm(`Refuser la demande de "${nomMarque}" ?`)) return;
        
        try {
            console.log(`🔄 Refuser créateur ${id}...`);
            
            // REQUÊTE DE SUPPRESSION : Supprimer le créateur
            const { error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`❌ "${nomMarque}" a été refusé.`);
            chargerCreeateurs(); // Recharger la liste
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`Erreur: ${error.message}`);
        }
    };
    
    // 7. Fonction utilitaire pour échapper le HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 8. Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminId');
                sessionStorage.removeItem('adminName');
                sessionStorage.removeItem('adminEmail');
                window.location.href = 'index.html';
            }
        });
    }
    
    // 9. Charger les données au démarrage
    console.log('🚀 Démarrage du chargement...');
    chargerCreeateurs();
    
    // 10. Actualisation automatique toutes les 30 secondes
    setInterval(chargerCreeateurs, 30000);
    
    console.log('🎯 Script admin prêt');
});
