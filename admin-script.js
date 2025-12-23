// admin-script.js - Version corrigée avec les bons noms de colonnes
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Script admin démarré');
    
    // 1. Configuration Supabase
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
    
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
    async function loadAllCreators() {
        console.log('📡 Connexion à Supabase...');
        
        try {
            // Test de connexion
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Erreur connexion: ${testError.message}</div>`;
                return;
            }
            
            console.log(`✅ ${count} créateurs dans la base`);
            
            // Charger les créateurs en attente - CORRIGÉ: utiliser date_inscription
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending')
                .order('date_inscription', { ascending: false }); // CORRECTION ICI
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Erreur: ${pendingError.message}</div>`;
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending`);
                displayCreators(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            // Charger les créateurs approuvés - CORRIGÉ: utiliser date_inscription
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif')
                .order('date_inscription', { ascending: false }); // CORRECTION ICI
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                approvedDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Erreur: ${approvedError.message}</div>`;
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés`);
                displayCreators(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Erreur: ${error.message}</div>`;
        }
    }
    
    // 5. REQUÊTE : Approuver un créateur
    async function approveCreator(id, brandName) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${brandName}"`);
        
        if (!confirm(`Approuver le créateur "${brandName}" ?\n\nIl pourra se connecter à son espace.`)) {
            return;
        }
        
        try {
            // CORRECTION: Utiliser date_validation au lieu de date_approbation
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString() // CORRECTION ICI
                })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`✅ "${brandName}" a été approuvé avec succès !`);
            console.log(`✅ Créateur ${id} approuvé`);
            
            // Recharger les listes
            setTimeout(() => {
                loadAllCreators();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Échec de l'approbation: ${error.message}`);
        }
    }
    
    // 6. REQUÊTE : Refuser un créateur
    async function rejectCreator(id, brandName) {
        console.log(`🗑️ Tentative de refus: ${id} - "${brandName}"`);
        
        if (!confirm(`Refuser définitivement "${brandName}" ?\n\nCette action supprimera complètement la demande.`)) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`❌ "${brandName}" a été refusé et supprimé.`);
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            // Recharger les listes
            setTimeout(() => {
                loadAllCreators();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Échec du refus: ${error.message}`);
        }
    }
    
    // 7. Fonction pour afficher les créateurs (corrigée)
    function displayCreators(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">${message}</div>`;
            return;
        }
        
        let html = '';
        
        creators.forEach(creator => {
            // CORRECTION: Utiliser date_inscription au lieu de created_at
            const date = creator.date_inscription 
                ? new Date(creator.date_inscription).toLocaleDateString('fr-FR')
                : 'Date inconnue';
            
            const safeBrand = escapeHtml(creator.nom_marque || 'Sans nom');
            const safeName = escapeHtml(`${creator.prenom || ''} ${creator.nom || ''}`.trim() || 'Non fourni');
            const safeEmail = escapeHtml(creator.email || 'Non fourni');
            const safeTel = escapeHtml(creator.telephone || 'Non fourni');
            const safeDomaine = escapeHtml(creator.domaine || 'Non spécifié');
            
            html += `
                <div class="creator-card">
                    <h3>${safeBrand}</h3>
                    <p><strong>Contact :</strong> ${safeName}</p>
                    <p><strong>Email :</strong> ${safeEmail}</p>
                    <p><strong>Téléphone :</strong> ${safeTel}</p>
                    <p><strong>Domaine :</strong> ${safeDomaine}</p>
                    <p><strong>Date d'inscription :</strong> ${date}</p>
                    <p><strong>Statut :</strong> ${creator.statut}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" onclick="window.approveCreator(${creator.id}, '${safeBrand.replace(/'/g, "\\'")}')">
                            Approuver
                        </button>
                        <button class="action-btn reject-btn" onclick="window.rejectCreator(${creator.id}, '${safeBrand.replace(/'/g, "\\'")}')">
                            Refuser
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
    window.approveCreator = approveCreator;
    window.rejectCreator = rejectCreator;
    
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
    loadAllCreators();
    
    // 12. Actualisation automatique
    setInterval(loadAllCreators, 30000);
    
    console.log('🎯 Script admin prêt');
});
