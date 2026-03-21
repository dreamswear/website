// admin-script.js - Version avec affichage des créateurs actifs uniquement
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
    
    // 4. Éléments de la page
    const allCreatorsDiv = document.getElementById('allCreators');
    const totalCount = document.getElementById('totalCount');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!allCreatorsDiv) {
        console.error('❌ Élément allCreators manquant dans la page');
        return;
    }
    
    // 5. Tester la connexion avant de continuer
    testerConnexionSupabase().then(connected => {
        if (!connected) {
            allCreatorsDiv.innerHTML = 
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
    
    // 6. Charger tous les créateurs (actifs uniquement)
    async function chargerTousLesCreateurs() {
        console.log('📡 Chargement des créateurs actifs...');
        
        try {
            // Test de connexion d'abord
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true })
                .eq('statut', 'actif');
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                allCreatorsDiv.innerHTML = `
                    <div style="color: red; padding: 20px; text-align: center;">
                        Erreur connexion: ${testError.message}<br>
                        <small>Code: ${testError.code}</small>
                    </div>
                `;
                return;
            }
            
            console.log(`✅ ${count} créateurs actifs dans la base`);
            
            // Charger les créateurs actifs
            const { data: creators, error } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif')
                .order('date_inscription', { ascending: false });
            
            if (error) {
                console.error('❌ Erreur chargement:', error);
                allCreatorsDiv.innerHTML = `
                    <div style="color: red; padding: 20px; text-align: center;">
                        Erreur: ${error.message}
                    </div>
                `;
                return;
            }
            
            console.log(`✅ ${creators?.length || 0} créateurs chargés`);
            
            // Mettre à jour le compteur
            if (totalCount) totalCount.textContent = creators?.length || 0;
            
            // Afficher les créateurs
            if (!creators || creators.length === 0) {
                allCreatorsDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        Aucun créateur actif pour le moment
                    </div>
                `;
                return;
            }
            
            afficherCreateurs(creators);
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            allCreatorsDiv.innerHTML = `
                <div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${error.message}
                </div>
            `;
        }
    }
    
    // 7. Afficher les créateurs
    function afficherCreateurs(creators) {
        let html = '';
        
        creators.forEach(creator => {
            const safeNom = escapeHtml(creator.nom_marque || 'Sans nom');
            const safePrenom = escapeHtml(creator.prenom || '');
            const safeNomComplet = escapeHtml(creator.nom || '');
            const safeEmail = escapeHtml(creator.email || 'Non fourni');
            const safeTel = escapeHtml(creator.telephone || 'Non fourni');
            const safeDomaine = escapeHtml(creator.domaine || 'Non spécifié');
            
            // Formater la date d'inscription
            let dateInscription = 'Date inconnue';
            if (creator.date_inscription) {
                try {
                    dateInscription = new Date(creator.date_inscription).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                } catch (e) {
                    dateInscription = creator.date_inscription;
                }
            }
            
            html += `
                <div class="creator-card">
                    <h3>${safeNom}</h3>
                    <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Téléphone:</strong> ${safeTel}</p>
                    <p><strong>Domaine:</strong> ${safeDomaine}</p>
                    <p><strong>Inscrit le:</strong> ${dateInscription}</p>
                    <p><strong>ID:</strong> <code>${creator.id}</code></p>
                </div>
            `;
        });
        
        allCreatorsDiv.innerHTML = html;
    }
    
    // 8. Fonction utilitaire pour échapper le HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 9. Gestion déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Déconnexion ?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
    
    // 10. Actualisation automatique (toutes les 30 secondes)
    setInterval(chargerTousLesCreateurs, 30000);
    
    console.log('🎯 Script admin prêt - Affichage des créateurs actifs uniquement');
});
