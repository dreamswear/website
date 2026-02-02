// dashboard-common.js - À inclure dans toutes les pages dashboard-*.html

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier la connexion
    if (!window.SessionManager || !window.SessionManager.isCreatorLoggedIn()) {
        console.warn('🚫 Accès non autorisé, redirection vers la page de connexion');
        window.location.href = 'index.html';
        return;
    }
    
    // Afficher les informations du créateur si les éléments existent
    const creatorNameElement = document.getElementById('creatorName');
    const creatorDomainElement = document.getElementById('creatorDomain');
    
    if (creatorNameElement || creatorDomainElement) {
        const creatorData = SessionManager.getCreatorData();
        
        if (creatorNameElement) {
            creatorNameElement.textContent = creatorData.name;
        }
        
        if (creatorDomainElement) {
            creatorDomainElement.textContent = creatorData.domain;
        }
    }
    
    // Gestion de la déconnexion (si bouton présent)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                SessionManager.logout();
                window.location.href = 'index.html';
            }
        });
    }
    
    console.log('✅ Dashboard commun chargé pour:', SessionManager.getCreatorData().name);
});
