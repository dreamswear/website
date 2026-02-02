// session-manager.js
class SessionManager {
    constructor() {
        this.supabase = null;
        this.initSupabase();
    }
    
    initSupabase() {
        const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
        
        if (typeof window.supabase !== 'undefined') {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    }
    
    // Sauvegarder toutes les données du créateur
    saveCreatorSession(creatorData) {
        if (!creatorData) return false;
        
        try {
            // Données principales
            sessionStorage.setItem('creatorId', creatorData.id);
            sessionStorage.setItem('creatorBrand', creatorData.nom_marque || '');
            
            // Nom complet
            const fullName = `${creatorData.prenom || ''} ${creatorData.nom || ''}`.trim();
            sessionStorage.setItem('creatorName', fullName || creatorData.nom_marque || 'Créateur');
            
            // Domaine
            sessionStorage.setItem('creatorDomain', creatorData.domaine || 'Domaine non spécifié');
            
            // Informations de contact
            sessionStorage.setItem('creatorEmail', creatorData.email || '');
            sessionStorage.setItem('creatorPhone', creatorData.telephone || '');
            
            // Statut
            sessionStorage.setItem('creatorStatus', creatorData.statut || '');
            
            // Dates importantes
            if (creatorData.date_inscription) {
                sessionStorage.setItem('creatorJoinDate', creatorData.date_inscription);
            }
            if (creatorData.date_validation) {
                sessionStorage.setItem('creatorValidationDate', creatorData.date_validation);
            }
            
            // Informations de portfolio
            sessionStorage.setItem('creatorBiography', creatorData.biographie || '');
            sessionStorage.setItem('creatorInstagram', creatorData.reseaux_instagram || '');
            sessionStorage.setItem('creatorWebsite', creatorData.site_web || '');
            
            // Marquer comme connecté
            sessionStorage.setItem('creatorLoggedIn', 'true');
            sessionStorage.setItem('creatorLoginTime', new Date().toISOString());
            
            // Sauvegarder aussi dans localStorage pour persistance
            this.saveToLocalStorage(creatorData);
            
            console.log('✅ Session créateur sauvegardée:', {
                name: sessionStorage.getItem('creatorName'),
                domain: sessionStorage.getItem('creatorDomain')
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde session:', error);
            return false;
        }
    }
    
    // Sauvegarder dans localStorage (plus persistant)
    saveToLocalStorage(creatorData) {
        try {
            localStorage.setItem('creatorId', creatorData.id);
            localStorage.setItem('creatorBrand', creatorData.nom_marque || '');
            
            const fullName = `${creatorData.prenom || ''} ${creatorData.nom || ''}`.trim();
            localStorage.setItem('creatorName', fullName || creatorData.nom_marque || 'Créateur');
            localStorage.setItem('creatorDomain', creatorData.domaine || 'Domaine non spécifié');
            
        } catch (error) {
            console.error('❌ Erreur localStorage:', error);
        }
    }
    
    // Récupérer les données de session
    getCreatorData() {
        return {
            id: sessionStorage.getItem('creatorId') || localStorage.getItem('creatorId'),
            name: sessionStorage.getItem('creatorName') || localStorage.getItem('creatorName') || 'Créateur',
            domain: sessionStorage.getItem('creatorDomain') || localStorage.getItem('creatorDomain') || 'Domaine non spécifié',
            brand: sessionStorage.getItem('creatorBrand') || localStorage.getItem('creatorBrand') || '',
            email: sessionStorage.getItem('creatorEmail') || '',
            phone: sessionStorage.getItem('creatorPhone') || '',
            status: sessionStorage.getItem('creatorStatus') || '',
            joinDate: sessionStorage.getItem('creatorJoinDate'),
            validationDate: sessionStorage.getItem('creatorValidationDate')
        };
    }
    
    // Vérifier si le créateur est connecté
    isCreatorLoggedIn() {
        const loggedIn = sessionStorage.getItem('creatorLoggedIn') === 'true' || 
                        localStorage.getItem('creatorId') !== null;
        
        if (loggedIn) {
            // Vérifier que les données essentielles sont présentes
            const data = this.getCreatorData();
            return !!(data.id && data.name);
        }
        
        return false;
    }
    
    // Rafraîchir les données depuis Supabase
    async refreshCreatorData() {
        try {
            const creatorId = sessionStorage.getItem('creatorId') || localStorage.getItem('creatorId');
            
            if (!creatorId || !this.supabase) {
                return false;
            }
            
            const { data, error } = await this.supabase
                .from('créateurs')
                .select('*')
                .eq('id', creatorId)
                .single();
            
            if (error || !data) {
                console.error('❌ Erreur rafraîchissement:', error);
                return false;
            }
            
            // Mettre à jour la session
            this.saveCreatorSession(data);
            return true;
            
        } catch (error) {
            console.error('💥 Erreur rafraîchissement:', error);
            return false;
        }
    }
    
    // Déconnexion
    logout() {
        // Supprimer sessionStorage
        const keysToRemove = [
            'creatorId', 'creatorName', 'creatorDomain', 'creatorBrand',
            'creatorEmail', 'creatorPhone', 'creatorStatus', 'creatorLoggedIn',
            'creatorJoinDate', 'creatorValidationDate', 'creatorLoginTime',
            'creatorBiography', 'creatorInstagram', 'creatorWebsite'
        ];
        
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        
        // Garder localStorage pour la persistance (optionnel)
        // localStorage.clear(); // Décommenter pour tout supprimer
        
        console.log('👋 Session créateur effacée');
    }
    
    // Initialiser la session au chargement de la page
    async initSession() {
        if (this.isCreatorLoggedIn()) {
            console.log('✅ Créateur déjà connecté');
            
            // Rafraîchir les données si nécessaire
            const loginTime = sessionStorage.getItem('creatorLoginTime');
            if (loginTime) {
                const loginDate = new Date(loginTime);
                const now = new Date();
                const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
                
                // Rafraîchir après 1 heure
                if (hoursDiff > 1) {
                    console.log('🔄 Rafraîchissement des données...');
                    await this.refreshCreatorData();
                }
            }
            
            return this.getCreatorData();
        }
        
        return null;
    }
}

// Créer une instance globale
window.SessionManager = new SessionManager();
