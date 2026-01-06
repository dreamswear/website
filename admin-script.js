// Système de notifications pour admin
function showNotification(options) {
    const container = document.getElementById('notifications-container');
    if (!container) {
        // Créer le container s'il n'existe pas
        const newContainer = document.createElement('div');
        newContainer.id = 'notifications-container';
        newContainer.className = 'notifications-container';
        document.body.appendChild(newContainer);
        return showNotification(options);
    }
    
    const { 
        title = 'Notification', 
        message, 
        type = 'info', 
        duration = 5000,
        icon = getIconForType(type)
    } = options;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icon || icons[type] || 'ℹ'}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.classList.add('hide'); setTimeout(() => this.parentElement.remove(), 300)">×</button>
        ${duration > 0 ? `<div class="notification-progress" style="animation-duration: ${duration}ms"></div>` : ''}
    `;
    
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    return notification;
}

function getIconForType(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'warning': return '⚠';
        case 'info': return 'ℹ';
        default: return 'ℹ';
    }
}

function showSuccess(message, title = 'Succès') {
    showNotification({
        title: title,
        message: message,
        type: 'success',
        duration: 3000
    });
}

function showError(message, title = 'Erreur') {
    showNotification({
        title: title,
        message: message,
        type: 'error',
        duration: 5000
    });
}

function showWarning(message, title = 'Attention') {
    showNotification({
        title: title,
        message: message,
        type: 'warning',
        duration: 4000
    });
}

function showInfo(message, title = 'Information') {
    showNotification({
        title: title,
        message: message,
        type: 'info',
        duration: 4000
    });
}

// Fonction de confirmation personnalisée
function confirmAction(message) {
    return new Promise((resolve) => {
        const notification = showNotification({
            title: 'Confirmation',
            message: message + '<br><br><div style="display: flex; gap: 10px; margin-top: 10px;">' +
                '<button onclick="window.confirmActionResult = true; this.closest(\'.notification\').classList.add(\'hide\'); setTimeout(() => this.closest(\'.notification\').remove(), 300)" ' +
                'style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Oui</button>' +
                '<button onclick="window.confirmActionResult = false; this.closest(\'.notification\').classList.add(\'hide\'); setTimeout(() => this.closest(\'.notification\').remove(), 300)" ' +
                'style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Non</button>' +
                '</div>',
            type: 'warning',
            duration: 0
        });
        
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    for (let node of mutation.removedNodes) {
                        if (node === notification) {
                            observer.disconnect();
                            resolve(window.confirmActionResult || false);
                            delete window.confirmActionResult;
                            return;
                        }
                    }
                }
            }
        });
        
        observer.observe(container, { childList: true });
    });
}

// Remplacer les alertes globalement
window.originalAlert = window.alert;
window.alert = function(message, title = 'Information', type = 'info') {
    showNotification({
        title: title,
        message: message,
        type: type
    });
};

// Exposer les fonctions
window.showNotification = showNotification;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.confirmAction = confirmAction;

// Script principal admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Script admin démarré');
    
    // 1. Initialisation de Supabase
    let supabase;
    
    if (typeof window.supabase !== 'undefined' && window.supabase.from) {
        console.log('✅ Utilisation de Supabase existant');
        supabase = window.supabase;
    } else {
        console.log('🔄 Initialisation de Supabase...');
        const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
        
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabase = supabase;
        } else {
            console.error('❌ Bibliothèque Supabase non chargée');
            showError('Bibliothèque Supabase non chargée. Vérifiez votre connexion internet.', 'Erreur critique');
            return;
        }
    }
    
    // 2. Test de connexion
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
        showWarning('Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.', 'Accès refusé');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('✅ Admin connecté');
    showInfo('Bienvenue dans l\'administration', 'Connexion réussie');
    
    // 4. Tester la connexion avant de continuer
    testerConnexionSupabase().then(connected => {
        if (!connected) {
            document.getElementById('pendingCreators').innerHTML = 
                `<div style="color: #dc3545; padding: 30px; text-align: center;">
                    <h3>❌ Erreur de connexion à la base de données</h3>
                    <p>Impossible de se connecter à Supabase. Vérifiez:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>Votre connexion internet</li>
                        <li>Les politiques RLS dans Supabase</li>
                        <li>Que la clé API est correcte</li>
                    </ul>
                </div>`;
            showError('Impossible de se connecter à la base de données', 'Erreur connexion');
            return;
        }
        
        // Si connexion réussie, charger les créateurs
        chargerTousLesCreateurs();
    });
    
    // 5. Éléments de la page
    const pendingDiv = document.getElementById('pendingCreators');
    const approvedDiv = document.getElementById('approvedCreators');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!pendingDiv || !approvedDiv) {
        console.error('❌ Éléments manquants dans la page');
        showError('Éléments de la page manquants', 'Erreur de chargement');
        return;
    }
    
    // 6. Charger tous les créateurs
    async function chargerTousLesCreateurs() {
        console.log('📡 Chargement des créateurs...');
        
        try {
            // Test de connexion d'abord
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                pendingDiv.innerHTML = 
                    `<div style="color: #dc3545; padding: 20px; text-align: center;">
                        Erreur connexion: ${testError.message}<br>
                        <small>Code: ${testError.code}</small>
                    </div>`;
                showError(`Erreur de connexion: ${testError.message}`, 'Erreur base de données');
                return;
            }
            
            console.log(`✅ ${count} créateurs dans la base`);
            
            // Charger les créateurs en attente
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending')
                .order('created_at', { ascending: false });
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                pendingDiv.innerHTML = 
                    `<div style="color: #dc3545; padding: 20px; text-align: center;">
                        Erreur: ${pendingError.message}
                    </div>`;
                showError(`Erreur de chargement: ${pendingError.message}`);
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending`);
                afficherCreateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
                
                if (pendingData && pendingData.length > 0) {
                    showInfo(`${pendingData.length} demande(s) en attente`, 'Statut');
                }
            }
            
            // Charger les créateurs approuvés
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif')
                .order('created_at', { ascending: false });
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                approvedDiv.innerHTML = 
                    `<div style="color: #dc3545; padding: 20px; text-align: center;">
                        Erreur: ${approvedError.message}
                    </div>`;
                showError(`Erreur de chargement: ${approvedError.message}`);
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés`);
                afficherCreateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            pendingDiv.innerHTML = 
                `<div style="color: #dc3545; padding: 20px; text-align: center;">
                    Erreur: ${error.message}
                </div>`;
            showError(`Erreur générale: ${error.message}`, 'Erreur système');
        }
    }
    
    // 7. Approuver un créateur
    async function approuverCreateur(id, nomMarque) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${nomMarque}"`);
        
        const confirmed = await confirmAction(`Approuver le créateur "${nomMarque}" ?\n\nIl pourra se connecter à son espace.`);
        if (!confirmed) {
            showInfo('Approbation annulée', 'Action annulée');
            return;
        }
        
        try {
            showInfo(`Approvision de "${nomMarque}" en cours...`, 'Traitement');
            
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
            
            showSuccess(`"${nomMarque}" a été approuvé avec succès !`, 'Approbation réussie');
            console.log(`✅ Créateur ${id} approuvé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            showError(`Échec de l'approbation: ${error.message}`, 'Erreur d\'approbation');
        }
    }
    
    // 8. Refuser un créateur
    async function refuserCreateur(id, nomMarque) {
        console.log(`🗑️ Tentative de refus: ${id} - "${nomMarque}"`);
        
        const confirmed = await confirmAction(`Refuser définitivement "${nomMarque}" ?\n\nCette action supprimera complètement la demande.`);
        if (!confirmed) {
            showInfo('Refus annulé', 'Action annulée');
            return;
        }
        
        try {
            showInfo(`Suppression de "${nomMarque}" en cours...`, 'Traitement');
            
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
            
            showWarning(`"${nomMarque}" a été refusé et supprimé.`, 'Demande refusée');
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            showError(`Échec du refus: ${error.message}`, 'Erreur de suppression');
        }
    }
    
    // 9. Fonction pour afficher les créateurs
    function afficherCreateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div class="empty-message">${message}</div>`;
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
            const dateInscription = creator.created_at 
                ? new Date(creator.created_at).toLocaleDateString('fr-FR')
                : 'Date inconnue';
            
            html += `
                <div class="creator-card" id="creator-${creator.id}">
                    <h3>${safeNom}</h3>
                    <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Téléphone:</strong> ${safeTel}</p>
                    <p><strong>Domaine:</strong> ${safeDomaine}</p>
                    <p><strong>Date d'inscription:</strong> ${dateInscription}</p>
                    <p><strong>Statut:</strong> <span class="status-${creator.statut}">${creator.statut}</span></p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" data-id="${creator.id}" data-brand="${safeNom}" title="Approuver ce créateur">
                            <i class="fas fa-check"></i> Approuver
                        </button>
                        <button class="action-btn reject-btn" data-id="${creator.id}" data-brand="${safeNom}" title="Refuser cette demande">
                            <i class="fas fa-times"></i> Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
        // Ajouter les événements après l'insertion du HTML
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
        logoutBtn.addEventListener('click', async function() {
            const confirmed = await confirmAction('Êtes-vous sûr de vouloir vous déconnecter ?');
            if (confirmed) {
                showInfo('Déconnexion en cours...', 'Déconnexion');
                setTimeout(() => {
                    sessionStorage.clear();
                    localStorage.removeItem('adminLoggedIn');
                    showSuccess('Déconnexion réussie', 'Au revoir');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }, 500);
            }
        });
    }
    
    // 13. Gestion du thème
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'day') {
            document.body.classList.add('day-mode');
        } else {
            document.body.classList.remove('day-mode');
        }
    }
    
    // Appliquer le thème au chargement
    applyTheme();
    
    // 14. Actualisation automatique
    setInterval(chargerTousLesCreateurs, 30000);
    
    console.log('🎯 Script admin prêt avec notifications');
    
    // 15. Ajouter du style pour les statuts
    const style = document.createElement('style');
    style.textContent = `
        .status-pending {
            color: #ffc107;
            font-weight: bold;
        }
        .status-actif {
            color: #28a745;
            font-weight: bold;
        }
        .creator-card {
            transition: all 0.3s ease;
        }
        .creator-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
});
