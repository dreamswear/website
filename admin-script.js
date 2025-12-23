// admin-script.js - Version simplifiée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 admin-script.js chargé');
    
    // Configuration
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Vérifier connexion admin
    if (!sessionStorage.getItem('adminLoggedIn')) {
        alert('Accès non autorisé');
        window.location.href = 'index.html';
        return;
    }
    
    // Charger les créateurs
    async function loadCreators() {
        try {
            // Créateurs en attente
            const { data: pending, error: err1 } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending')
                .order('created_at', { ascending: false });
            
            if (err1) console.error('Erreur pending:', err1);
            displayCreators(pending || [], 'pending');
            
            // Créateurs approuvés
            const { data: approved, error: err2 } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif')
                .order('date_validation', { ascending: false });
            
            if (err2) console.error('Erreur approved:', err2);
            displayCreators(approved || [], 'approved');
            
        } catch (error) {
            console.error('Erreur générale:', error);
        }
    }
    
    // Afficher les créateurs
    function displayCreators(creators, type) {
        const container = type === 'pending' 
            ? document.getElementById('pendingCreators')
            : document.getElementById('approvedCreators');
        
        const countElement = type === 'pending'
            ? document.getElementById('pendingCount')
            : document.getElementById('approvedCount');
        
        if (!container) return;
        
        // Mettre à jour le compteur
        if (countElement) countElement.textContent = creators.length;
        
        // Si aucun créateur
        if (creators.length === 0) {
            container.innerHTML = `<div class="empty-message">Aucun créateur ${type === 'pending' ? 'en attente' : 'approuvé'}</div>`;
            return;
        }
        
        // Générer le HTML
        let html = '';
        creators.forEach(creator => {
            const safeName = creator.nom_marque ? creator.nom_marque.replace(/'/g, "\\'") : '';
            
            html += `
                <div class="creator-card">
                    <h3>${creator.nom_marque || 'Sans nom'}</h3>
                    <p><strong>Contact:</strong> ${creator.prenom || ''} ${creator.nom || ''}</p>
                    <p><strong>Email:</strong> ${creator.email || ''}</p>
                    <p><strong>Téléphone:</strong> ${creator.telephone || ''}</p>
                    <p><strong>Domaine:</strong> ${creator.domaine || ''}</p>
                    <p><strong>Statut:</strong> ${creator.statut}</p>
            `;
            
            if (type === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" onclick="approveCreator('${creator.id}', '${safeName}')">
                            Approuver
                        </button>
                        <button class="action-btn reject-btn" onclick="rejectCreator('${creator.id}', '${safeName}')">
                            Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    // Fonctions globales
    window.approveCreator = async function(id, name) {
        if (!confirm(`Approuver "${name}" ?`)) return;
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`"${name}" approuvé !`);
            loadCreators(); // Recharger
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };
    
    window.rejectCreator = async function(id, name) {
        if (!confirm(`Refuser "${name}" ?`)) return;
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`"${name}" refusé.`);
            loadCreators(); // Recharger
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };
    
    // Déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    // Initialisation
    loadCreators();
});
