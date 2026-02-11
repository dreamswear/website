// session-manager.js - Gestion complète des sessions
// À CHARGER IMMÉDIATEMENT APRÈS LE CDN SUPABASE

class SessionManager {
    constructor() {
        this.supabase = null;
        console.log('🔄 SessionManager: Instance créée');
    }
    
    // Initialiser Supabase (appeler après chargement du CDN)
    initSupabase() {
        if (this.supabase) {
            return this.supabase;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.error('❌ SessionManager: Supabase CDN non chargé');
            return null;
        }
        
        if (!window.SUPABASE_CONFIG) {
            console.error('❌ SessionManager: Configuration Supabase manquante');
            return null;
        }
        
        try {
            this.supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.URL,
                window.SUPABASE_CONFIG.KEY
            );
            console.log('✅ SessionManager: Supabase initialisé');
            return this.supabase;
        } catch (error) {
            console.error('❌ SessionManager: Erreur initialisation Supabase', error);
            return null;
        }
    }
    
    // Sauvegarder toutes les données du créateur
    saveCreatorSession(creatorData) {
        if (!creatorData) return false;
        
        try {
            // Nettoyer les anciennes données
            this.clearSessionData();
            
            // Données principales
            sessionStorage.setItem('creatorId', creatorData.id);
            sessionStorage.setItem('creatorBrand', creatorData.nom_marque || '');
            
            // Nom complet
            const prenom = creatorData.prenom || '';
            const nom = creatorData.nom || '';
            const fullName = `${prenom} ${nom}`.trim();
            sessionStorage.setItem('creatorName', fullName || creatorData.nom_marque || 'Créateur');
            
            // Domaine
            sessionStorage.setItem('creatorDomain', creatorData.domaine || 'Domaine non spécifié');
            
            // Informations de contact
            sessionStorage.setItem('creatorEmail', creatorData.email || '');
            sessionStorage.setItem('creatorPhone', creatorData.telephone || '');
            
            // Statut
            sessionStorage.setItem('creatorStatus', creatorData.statut || 'pending');
            
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
            
            // Prénom et nom séparés
            sessionStorage.setItem('creatorPrenom', creatorData.prenom || '');
            sessionStorage.setItem('creatorNom', creatorData.nom || '');
            
            // Marquer comme connecté
            sessionStorage.setItem('creatorLoggedIn', 'true');
            sessionStorage.setItem('creatorLoginTime', new Date().toISOString());
            
            // Sauvegarder aussi dans localStorage pour persistance
            this.saveToLocalStorage(creatorData);
            
            console.log('✅ Session créateur sauvegardée:', {
                id: creatorData.id,
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
            
            const prenom = creatorData.prenom || '';
            const nom = creatorData.nom || '';
            const fullName = `${prenom} ${nom}`.trim();
            localStorage.setItem('creatorName', fullName || creatorData.nom_marque || 'Créateur');
            localStorage.setItem('creatorDomain', creatorData.domaine || 'Domaine non spécifié');
            localStorage.setItem('creatorPrenom', creatorData.prenom || '');
            localStorage.setItem('creatorNom', creatorData.nom || '');
            
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
            status: sessionStorage.getItem('creatorStatus') || 'pending',
            joinDate: sessionStorage.getItem('creatorJoinDate'),
            validationDate: sessionStorage.getItem('creatorValidationDate'),
            prenom: sessionStorage.getItem('creatorPrenom') || localStorage.getItem('creatorPrenom') || '',
            nom: sessionStorage.getItem('creatorNom') || localStorage.getItem('creatorNom') || ''
        };
    }
    
    // Vérifier si le créateur est connecté
    isCreatorLoggedIn() {
        const sessionLoggedIn = sessionStorage.getItem('creatorLoggedIn') === 'true';
        const localId = localStorage.getItem('creatorId');
        
        if (sessionLoggedIn) {
            return true;
        }
        
        if (localId) {
            // Restaurer la session depuis localStorage
            sessionStorage.setItem('creatorId', localId);
            sessionStorage.setItem('creatorName', localStorage.getItem('creatorName') || 'Créateur');
            sessionStorage.setItem('creatorDomain', localStorage.getItem('creatorDomain') || 'Domaine');
            sessionStorage.setItem('creatorLoggedIn', 'true');
            return true;
        }
        
        return false;
    }
    
    // Rafraîchir les données depuis Supabase
    async refreshCreatorData() {
        try {
            const creatorId = sessionStorage.getItem('creatorId') || localStorage.getItem('creatorId');
            
            if (!creatorId) {
                console.warn('⚠️ Aucun ID créateur trouvé');
                return false;
            }
            
            if (!this.supabase) {
                this.initSupabase();
                if (!this.supabase) return false;
            }
            
            const { data, error } = await this.supabase
                .from('créateurs')
                .select('*')
                .eq('id', creatorId)
                .single();
            
            if (error) {
                console.error('❌ Erreur rafraîchissement:', error);
                return false;
            }
            
            if (data) {
                this.saveCreatorSession(data);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('💥 Erreur rafraîchissement:', error);
            return false;
        }
    }
    
    // Nettoyer les données de session
    clearSessionData() {
        const keysToRemove = [
            'creatorId', 'creatorName', 'creatorDomain', 'creatorBrand',
            'creatorEmail', 'creatorPhone', 'creatorStatus', 'creatorLoggedIn',
            'creatorJoinDate', 'creatorValidationDate', 'creatorLoginTime',
            'creatorBiography', 'creatorInstagram', 'creatorWebsite',
            'creatorPrenom', 'creatorNom'
        ];
        
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
    
    // Déconnexion complète
    logout() {
        this.clearSessionData();
        // Optionnel: décommenter pour supprimer aussi localStorage
        // localStorage.clear();
        console.log('👋 Session créateur effacée');
    }
    
    // Initialiser la session au chargement de la page
    async initSession() {
        this.initSupabase();
        
        if (this.isCreatorLoggedIn()) {
            console.log('✅ Créateur déjà connecté');
            
            // Rafraîchir les données si nécessaire
            const loginTime = sessionStorage.getItem('creatorLoginTime');
            if (loginTime) {
                const loginDate = new Date(loginTime);
                const now = new Date();
                const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
                
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

// Créer une instance globale UNIQUE
if (!window.SessionManager) {
    window.SessionManager = new SessionManager();
    console.log('✅ SessionManager initialisé globalement');
}
