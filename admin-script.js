// admin-script.js - Version avec boutons adaptés
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
    
    // 4. Style CSS dynamique pour les boutons
    const style = document.createElement('style');
    style.textContent = `
        /* Styles pour les boutons de la page admin */
        .admin-action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }
        
        .admin-action-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 14px;
            flex: 1;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 44px; /* Taille minimale pour accessibilité */
        }
        
        .admin-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .admin-action-btn:active {
            transform: translateY(0);
        }
        
        .admin-approve-btn {
            background: linear-gradient(135deg, #28a745, #218838);
            color: white;
        }
        
        .admin-reject-btn {
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
        }
        
        .admin-approve-btn:hover {
            background: linear-gradient(135deg, #218838, #1e7e34);
        }
        
        .admin-reject-btn:hover {
            background: linear-gradient(135deg, #c82333, #bd2130);
        }
        
        /* Boutons d'en-tête */
        .admin-header-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            min-height: 44px;
        }
        
        .admin-poster-btn {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
        }
        
        .admin-logout-btn {
            background: linear-gradient(135deg, #6c757d, #545b62);
            color: white;
        }
        
        .admin-return-btn {
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: white;
        }
        
        .admin-header-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        /* Pour les petits écrans */
        @media (max-width: 768px) {
            .admin-action-buttons {
                flex-direction: column;
                gap: 10px;
            }
            
            .admin-action-btn {
                width: 100%;
                padding: 14px 20px;
            }
            
            .admin-header-btn {
                padding: 10px 16px;
                font-size: 13px;
            }
        }
        
        /* Pour les très petits écrans */
        @media (max-width: 480px) {
            .admin-header-btn span {
                display: none;
            }
            
            .admin-header-btn {
                padding: 12px;
            }
            
            .admin-header-btn i {
                margin: 0;
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 5. Fonction pour formater la date
    function getDateDisplay() {
        return new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // 6. REQUÊTE PRINCIPALE : Lire les créateurs depuis la base
    async function chargerCreeateurs() {
        console.log('📡 Chargement des créateurs...');
        
        try {
            // REQUÊTE 1 : Créateurs en attente
            console.log('🔍 Recherche des créateurs "pending"...');
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                pendingDiv.innerHTML = `
                    <div style="
                        color: #721c24;
                        background: #f8d7da;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                        margin: 20px 0;
                        border: 1px solid #f5c6cb;
                    ">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Erreur: ${pendingError.message}
                    </div>
                `;
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending trouvés`);
                afficherCreeateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            // REQUÊTE 2 : Créateurs approuvés
            console.log('🔍 Recherche des créateurs "actif"...');
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                approvedDiv.innerHTML = `
                    <div style="
                        color: #721c24;
                        background: #f8d7da;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                        margin: 20px 0;
                        border: 1px solid #f5c6cb;
                    ">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Erreur: ${approvedError.message}
                    </div>
                `;
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés trouvés`);
                afficherCreeateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            pendingDiv.innerHTML = `
                <div style="
                    color: #856404;
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                    border: 1px solid #ffeaa7;
                ">
                    <i class="fas fa-exclamation-circle"></i><br>
                    Erreur inattendue: ${error.message}
                </div>
            `;
        }
    }
    
    // 7. Fonction pour afficher les créateurs avec boutons adaptés
    function afficherCreeateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `
                <div class="empty-message" style="
                    text-align: center;
                    padding: 40px;
                    color: #6c757d;
                    font-style: italic;
                    font-size: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #dee2e6;
                ">
                    <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 10px; display: block; color: #adb5bd;"></i>
                    ${message}
                </div>
            `;
            return;
        }
        
        let html = '';
        
        creators.forEach((creator, index) => {
            const dateDisplay = getDateDisplay();
            
            html += `
                <div class="creator-card" style="
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border-left: 5px solid ${status === 'pending' ? '#ffc107' : '#28a745'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <h3 style="
                            margin: 0;
                            color: #333;
                            font-size: 18px;
                            font-weight: 600;
                        ">
                            ${escapeHtml(creator.nom_marque || 'Sans nom de marque')}
                        </h3>
                        <span style="
                            background: ${status === 'pending' ? '#ffc107' : '#28a745'};
                            color: ${status === 'pending' ? '#000' : 'white'};
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                        ">
                            ${status === 'pending' ? '⏳ EN ATTENTE' : '✅ APPROUVÉ'}
                        </span>
                    </div>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 12px;
                        margin-bottom: 20px;
                    ">
                        <div style="
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 6px;
                        ">
                            <strong style="color: #6c757d; font-size: 12px; display: block; margin-bottom: 4px;">CONTACT</strong>
                            <span style="color: #333; font-weight: 500;">
                                ${escapeHtml(creator.prenom || '')} ${escapeHtml(creator.nom || '')}
                            </span>
                        </div>
                        
                        <div style="
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 6px;
                        ">
                            <strong style="color: #6c757d; font-size: 12px; display: block; margin-bottom: 4px;">EMAIL</strong>
                            <span style="color: #007bff; font-weight: 500;">
                                ${escapeHtml(creator.email || 'Non fourni')}
                            </span>
                        </div>
                        
                        <div style="
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 6px;
                        ">
                            <strong style="color: #6c757d; font-size: 12px; display: block; margin-bottom: 4px;">TÉLÉPHONE</strong>
                            <span style="color: #333; font-weight: 500;">
                                ${escapeHtml(creator.telephone || 'Non fourni')}
                            </span>
                        </div>
                        
                        <div style="
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 6px;
                        ">
                            <strong style="color: #6c757d; font-size: 12px; display: block; margin-bottom: 4px;">DOMAINE</strong>
                            <span style="color: #333; font-weight: 500;">
                                ${escapeHtml(creator.domaine || 'Non spécifié')}
                            </span>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                        color: #6c757d;
                        font-size: 13px;
                    ">
                        <span>ID: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${creator.id}</code></span>
                        <span>Inscrit le: ${dateDisplay}</span>
                    </div>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="admin-action-buttons">
                        <button class="admin-action-btn admin-approve-btn" 
                                onclick="approuverCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                            <i class="fas fa-check-circle"></i>
                            <span>Approuver</span>
                        </button>
                        <button class="admin-action-btn admin-reject-btn" 
                                onclick="refuserCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                            <i class="fas fa-times-circle"></i>
                            <span>Refuser</span>
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    // 8. Fonctions d'action (à rendre globales)
    window.approuverCreator = async function(id, nomMarque) {
        if (!confirm(`Voulez-vous approuver le créateur "${nomMarque}" ?\n\nIl pourra alors se connecter à son espace.`)) return;
        
        try {
            console.log(`🔄 Approuver créateur ${id}...`);
            
            // Mettre à jour le statut
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    approved_at: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) throw error;
            
            // Message de succès
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                animation: slideIn 0.3s ease;
            `;
            successMsg.innerHTML = `<i class="fas fa-check-circle"></i> "${nomMarque}" approuvé !`;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
                chargerCreeateurs(); // Recharger la liste
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Erreur: ${error.message}`);
        }
    };
    
    window.refuserCreator = async function(id, nomMarque) {
        if (!confirm(`Voulez-vous refuser la demande de "${nomMarque}" ?\n\nCette action est irréversible.`)) return;
        
        try {
            console.log(`🔄 Refuser créateur ${id}...`);
            
            // Supprimer le créateur
            const { error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            // Message de succès
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                animation: slideIn 0.3s ease;
            `;
            successMsg.innerHTML = `<i class="fas fa-times-circle"></i> "${nomMarque}" refusé`;
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
                chargerCreeateurs(); // Recharger la liste
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Erreur: ${error.message}`);
        }
    };
    
    // 9. Fonction utilitaire pour échapper le HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 10. Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
    
    // 11. Animation CSS pour les messages
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
    // 12. Démarrer le chargement
    console.log('🚀 Démarrage du script admin...');
    
    // Charger les créateurs après un court délai
    setTimeout(() => {
        chargerCreeateurs();
        
        // Actualisation automatique toutes les 30 secondes
        setInterval(chargerCreeateurs, 30000);
    }, 500);
    
    console.log('🎯 Script admin initialisé');
});
