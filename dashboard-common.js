// dashboard-common.js - VERSION CORRIGÉE
// À inclure dans toutes les pages dashboard-*.html

(function() {
    'use strict';
    
    function initDashboardCommon() {
        // Vérifier que SessionManager existe
        if (!window.SessionManager) {
            console.error('❌ DashboardCommon: SessionManager non disponible');
            return;
        }
        
        // Vérifier la connexion - MAIS NE PAS REDIRIGER IMMÉDIATEMENT
        if (!window.SessionManager.isCreatorLoggedIn()) {
            console.warn('🚫 DashboardCommon: Non connecté');
            // NE PAS rediriger ici - laisse la page décider
            return;
        }
        
        // Afficher les informations du créateur UNIQUEMENT si les éléments existent
        const creatorData = window.SessionManager.getCreatorData();
        
        // Mettre à jour le nom du créateur (si présent)
        const creatorNameElements = document.querySelectorAll('#creatorName, .creator-name, #userName');
        creatorNameElements.forEach(el => {
            if (el) el.textContent = creatorData.name || 'Créateur';
        });
        
        // Mettre à jour le domaine (si présent)
        const creatorDomainElements = document.querySelectorAll('#domainText, .creator-domain-text, #userBrand');
        creatorDomainElements.forEach(el => {
            if (el) el.textContent = creatorData.domain || 'Domaine';
        });
        
        // Gestion de la déconnexion (si bouton présent)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    window.SessionManager.logout();
                    window.location.href = 'index.html';
                }
            });
        }
        
        console.log('✅ DashboardCommon exécuté');
    }
    
    // Exécuter au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboardCommon);
    } else {
        initDashboardCommon();
    }
})();
