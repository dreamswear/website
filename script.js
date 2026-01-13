// ============================================
// CODE PRINCIPAL - CENTRALISÉ (VERSION COMPLÈTE)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // CONFIGURATION SUPABASE (COMMUNE À TOUTES LES PAGES)
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    // Initialisation globale de Supabase
    let supabase;
    
    if (typeof window.supabase !== 'undefined' && window.supabase.from) {
        // Si supabase est déjà initialisé (depuis un autre script)
        console.log('✅ Utilisation de Supabase existant');
        supabase = window.supabase;
    } else {
        // Initialiser Supabase depuis zéro
        console.log('🔄 Initialisation de Supabase...');
        
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

    // ============================================
    // TEST DE CONNEXION SUPABASE AMÉLIORÉ
    // ============================================
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

    // ============================================
    // DÉTECTION AUTOMATIQUE DE LA PAGE
    // ============================================
    function detectPageAndLoad() {
        console.log('🔍 Détection automatique de la page...');
        
        // 1. Vérifier si on est sur la page d'administration admin.html
        if (window.location.pathname.includes('admin.html')) {
            console.log('📄 Page Admin détectée');
            initAdminPage();
            return;
        }
        
        // 2. Vérifier si on est sur la page d'actualisation
        if (window.location.pathname.includes('Actualisation.html')) {
            console.log('📄 Page Actualisation détectée');
            initActualisationPage();
            return;
        }
        
        // 3. Si on est sur article.html
        if (document.getElementById('article-content')) {
            console.log('📄 Page Article détectée');
            loadSingleArticle();
            return;
        }
        
        // 4. Liste des conteneurs et leurs rubriques associées
        const containerMap = {
            'actualites-container': 'actualites',
            'visages-container': 'visages',
            'tendances-container': 'tendances',
            'accessoires-container': 'accessoires',
            'beaute-container': 'beaute',
            'coulisses-container': 'coulisses',
            'culture-container': 'culture',
            'decouvertes-container': 'decouvertes',
            'mode-container': 'mode',
            // Anciens noms pour compatibilité
            'articles-list': 'coulisses',
            'trends-container': 'tendances',
            'discoveries-container': 'decouvertes',
            'events-container': 'culture'
        };
        
        // 5. Chercher quel conteneur est présent sur la page
        for (const [containerId, rubrique] of Object.entries(containerMap)) {
            if (document.getElementById(containerId)) {
                console.log(`📄 Page ${rubrique} détectée (${containerId})`);
                loadArticlesByRubrique(rubrique, containerId);
                
                // Configurations spécifiques
                if (rubrique === 'visages' && document.querySelectorAll('.filter-btn').length > 0) {
                    setupVisageFilters();
                }
                return;
            }
        }
        
        // 6. Si aucun conteneur trouvé, essayer par nom de fichier
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '').toLowerCase();
        
        const pageToRubrique = {
            'accessoires': ['accessoires-container', 'accessoires'],
            'beaute': ['beaute-container', 'beaute'],
            'mode': ['mode-container', 'mode'],
            'coulisses': ['coulisses-container', 'coulisses'],
            'tendances': ['tendances-container', 'tendances'],
            'decouvertes': ['decouvertes-container', 'decouvertes'],
            'culture': ['culture-container', 'culture'],
            'visages': ['visages-container', 'visages'],
            'actualites': ['actualites-container', 'actualites']
        };
        
        if (pageToRubrique[pageName]) {
            const [containerId, rubrique] = pageToRubrique[pageName];
            console.log(`📄 Page ${rubrique} détectée par nom de fichier`);
            loadArticlesByRubrique(rubrique, containerId);
            return;
        }
        
        console.log('ℹ️ Aucune page spécifique détectée');
        initCommonElements();
    }
    
    // ============================================
    // INITIALISATION DES ÉLÉMENTS COMMUNS
    // ============================================
    function initCommonElements() {
        console.log('🔄 Initialisation des éléments communs...');
        
        // 1. OBSERVATEUR D'INTERSECTION (ANIMATIONS)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('show');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach(el => observer.observe(el));

        // 2. SELECTEUR DE THÈME
        const themeSelectButton = document.getElementById('theme-select-button');
        const themeOptions = document.getElementById('theme-options');
        const themeButtonText = document.getElementById('theme-button-text');
        const body = document.body;

        // Fonction pour définir le thème
        const setTheme = (theme) => {
            if (theme === 'day') {
                body.classList.add('day-mode');
                localStorage.setItem('theme', 'day');
                themeButtonText.textContent = 'Clair';
            } else {
                body.classList.remove('day-mode');
                localStorage.setItem('theme', 'night');
                themeButtonText.textContent = 'Sombre';
            }
        };

        // Basculer le menu déroulant du thème
        if (themeSelectButton) {
            themeSelectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                themeOptions.classList.toggle('hidden-options');
                themeSelectButton.parentElement.classList.toggle('open');
            });
        }

        // Définir le thème depuis le menu déroulant
        if (themeOptions) {
            themeOptions.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target.tagName === 'A') {
                    const selectedTheme = e.target.dataset.theme;
                    setTheme(selectedTheme);
                    themeOptions.classList.add('hidden-options');
                    themeSelectButton.parentElement.classList.remove('open');
                }
            });
        }
        
        // Fermer le menu déroulant en cliquant à l'extérieur
        document.addEventListener('click', () => {
            if (themeOptions && !themeOptions.classList.contains('hidden-options')) {
                themeOptions.classList.add('hidden-options');
                themeSelectButton.parentElement.classList.remove('open');
            }
        });

        // Vérifier le thème sauvegardé dans localStorage au chargement
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Thème par défaut si aucun n'est sauvegardé
            setTheme('night');
        }

        // 3. MODAL D'ABONNEMENT
        const subscribeDesktop = document.getElementById('subscribe-desktop');
        const subscribeMobile = document.getElementById('subscribe-mobile');
        const modal = document.getElementById('subscribe-modal');
        const closeModalButton = modal ? modal.querySelector('.close-modal') : null;
        const tabLinks = modal ? modal.querySelectorAll('.tab-link') : [];
        const tabContents = modal ? modal.querySelectorAll('.tab-content') : [];

        const openModal = () => modal.classList.remove('hidden-modal');
        const closeModal = () => modal.classList.add('hidden-modal');

        // Gestion du bouton desktop
        if (subscribeDesktop) {
            subscribeDesktop.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        // Gestion du bouton mobile
        if (subscribeMobile) {
            subscribeMobile.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
                closeModal();
            }
        });

        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;
                const target = document.getElementById(targetId);

                tabLinks.forEach(link => {
                    link.classList.remove('active');
                    link.setAttribute('aria-selected', 'false');
                });
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                target.classList.add('active');
            });
        });

        // 4. FORMULAIRES D'INSCRIPTION
        // Gestion de l'inscription abonné
        const subscriberForm = document.getElementById('subscriber-form-element');
        if (subscriberForm) {
            subscriberForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nom = document.getElementById('sub-nom').value.trim();
                const prenom = document.getElementById('sub-prenom').value.trim();
                const email = document.getElementById('sub-email').value.trim();
                const telephone = document.getElementById('sub-tel').value.trim();
                
                console.log('📝 Tentative inscription abonné:', email);
                
                try {
                    const { data, error } = await supabase
                        .from('Abonnés')
                        .insert([
                            {
                                nom: nom,
                                prenom: prenom,
                                email: email,
                                telephone: telephone
                            }
                        ]);
                    
                    if (error) {
                        console.error('❌ Erreur inscription:', error);
                        alert('Erreur: ' + error.message);
                        return;
                    }
                    
                    console.log('✅ Inscription réussie!', data);
                    alert('Inscription réussie ! Vous recevrez nos actualités par email.');
                    modal.classList.add('hidden-modal');
                    subscriberForm.reset();
                    
                } catch (error) {
                    console.error('💥 Erreur d\'inscription:', error);
                    alert('Une erreur est survenue lors de l\'inscription.');
                }
            });
        }

        // Gestion de l'inscription créateur
        const creatorRegisterForm = document.getElementById('creator-register-form');
        if (creatorRegisterForm) {
            creatorRegisterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nom = document.getElementById('cre-nom').value.trim();
                const prenom = document.getElementById('cre-prenom').value.trim();
                const password = document.getElementById('cre-password').value;
                const email = document.getElementById('cre-email').value.trim();
                const telephone = document.getElementById('cre-tel').value.trim();
                const marque = document.getElementById('cre-marque').value.trim();
                const domaine = document.getElementById('cre-domaine').value;
                
                console.log('🎨 Tentative inscription créateur:', marque);
                
                try {
                    const { data, error } = await supabase
                        .from('créateurs')
                        .insert([
                            {
                                nom: nom,
                                prenom: prenom,
                                nom_marque: marque,
                                domaine: domaine,
                                email: email,
                                telephone: telephone,
                                mot_de_passe: password,
                                statut: 'pending'
                            }
                        ]);
                    
                    if (error) {
                        console.error('❌ Erreur inscription:', error);
                        alert('Erreur: ' + error.message);
                        return;
                    }
                    
                    console.log('✅ Inscription créateur réussie!', data);
                    alert('Inscription réussie ! Votre compte sera activé après validation par un administrateur.');
                    modal.classList.add('hidden-modal');
                    creatorRegisterForm.reset();
                    
                } catch (error) {
                    console.error('💥 Erreur d\'inscription:', error);
                    alert('Une erreur est survenue lors de l\'inscription.');
                }
            });
        }

        // 5. MENU DÉROULANT PRINCIPAL
        const menuBtn = document.getElementById('menu-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');

        if (menuBtn && dropdownMenu) {
            menuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });
            
            // Fermer le menu si on clique ailleurs
            document.addEventListener('click', function(e) {
                if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('active');
                }
            });
            
            // Empêcher la fermeture quand on clique dans le menu
            dropdownMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // 6. FENÊTRE D'AUTHENTIFICATION
        const authBtn = document.getElementById('auth-btn');
        const authModal = document.getElementById('auth-modal');
        const closeAuthModal = authModal ? authModal.querySelector('.close-auth-modal') : null;
        const authTabs = authModal ? authModal.querySelectorAll('.auth-tab') : [];
        const adminForm = document.getElementById('admin-form');
        const creatorForm = document.getElementById('creator-form');
        const adminError = document.getElementById('admin-error');
        const creatorError = document.getElementById('creator-error');

        // Ouvrir la fenêtre d'authentification
        if (authBtn && authModal) {
            authBtn.addEventListener('click', function(e) {
                e.preventDefault();
                authModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Fermer la fenêtre d'authentification
        if (closeAuthModal) {
            closeAuthModal.addEventListener('click', function() {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                if (adminError) adminError.style.display = 'none';
                if (creatorError) creatorError.style.display = 'none';
                if (adminForm) adminForm.reset();
                if (creatorForm) creatorForm.reset();
            });
        }

        // Fermer en cliquant à l'extérieur
        if (authModal) {
            authModal.addEventListener('click', function(e) {
                if (e.target === authModal) {
                    authModal.classList.remove('active');
                    document.body.style.overflow = '';
                    if (adminError) adminError.style.display = 'none';
                    if (creatorError) creatorError.style.display = 'none';
                    if (adminForm) adminForm.reset();
                    if (creatorForm) creatorForm.reset();
                }
            });
        }

        // Gestion des onglets d'authentification
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const authType = this.getAttribute('data-auth-type');
                
                authTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                
                if (authType === 'admin') {
                    if (adminForm) adminForm.classList.add('active');
                } else {
                    if (creatorForm) creatorForm.classList.add('active');
                }
                
                if (adminError) adminError.style.display = 'none';
                if (creatorError) creatorError.style.display = 'none';
            });
        });

        // 7. CONNEXION ADMINISTRATEUR
        if (adminForm) {
            adminForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nom = document.getElementById('admin-nom').value.trim();
                const password = document.getElementById('admin-password').value;
                
                console.log('🔐 Tentative connexion admin:', nom);
                
                try {
                    // Vérification dans la table administrateurs
                    const { data, error } = await supabase
                        .from('administrateurs')
                        .select('*')
                        .eq('nom', nom)
                        .eq('mot_de_passe', password)
                        .single();
                    
                    console.log('📊 Résultat:', { data: !!data, error: error?.message });
                    
                    if (error) {
                        console.error('❌ Erreur Supabase:', error.message);
                        if (adminError) {
                            adminError.textContent = 'Erreur technique: ' + error.message;
                            adminError.style.display = 'block';
                        }
                        return;
                    }
                    
                    if (!data) {
                        console.log('⚠️ Aucun admin trouvé');
                        if (adminError) {
                            adminError.textContent = 'Nom d\'administrateur ou mot de passe incorrect';
                            adminError.style.display = 'block';
                        }
                        return;
                    }
                    
                    console.log('✅ Connexion réussie! Admin:', data);
                    
                    // Connexion réussie
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('adminId', data.id);
                    sessionStorage.setItem('adminName', data.nom);
                    sessionStorage.setItem('adminEmail', data.email);
                    
                    // Redirection vers la page d'administration
                    window.location.href = 'admin.html';
                    
                } catch (error) {
                    console.error('💥 Erreur de connexion:', error);
                    if (adminError) {
                        adminError.textContent = 'Une erreur est survenue lors de la connexion';
                        adminError.style.display = 'block';
                    }
                }
            });
        }

        // 8. CONNEXION CRÉATEUR
        if (creatorForm) {
            creatorForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const brand = document.getElementById('creator-brand').value.trim();
                const password = document.getElementById('creator-password').value;
                
                console.log('🎨 Tentative connexion créateur:', brand);
                
                try {
                    // Vérification dans la table créateurs
                    const { data, error } = await supabase
                        .from('créateurs')
                        .select('*')
                        .eq('nom_marque', brand)
                        .eq('mot_de_passe', password)
                        .eq('statut', 'actif')
                        .single();
                    
                    console.log('📊 Résultat:', { data: !!data, error: error?.message });
                    
                    if (error) {
                        console.error('❌ Erreur Supabase:', error.message);
                        if (creatorError) {
                            creatorError.textContent = 'Erreur technique: ' + error.message;
                            creatorError.style.display = 'block';
                        }
                        return;
                    }
                    
                    if (!data) {
                        console.log('⚠️ Aucun créateur trouvé');
                        if (creatorError) {
                            creatorError.textContent = 'Marque ou mot de passe incorrect';
                            creatorError.style.display = 'block';
                        }
                        return;
                    }
                    
                    console.log('✅ Connexion créateur réussie!', data);
                    
                    // Connexion réussie
                    sessionStorage.setItem('creatorLoggedIn', 'true');
                    sessionStorage.setItem('creatorId', data.id);
                    sessionStorage.setItem('creatorBrand', data.nom_marque);
                    
                    // Redirection vers le dashboard créateur
                    window.location.href = 'dashboard-home.html';
                    
                } catch (error) {
                    console.error('💥 Erreur de connexion:', error);
                    if (creatorError) {
                        creatorError.textContent = 'Une erreur est survenue lors de la connexion';
                        creatorError.style.display = 'block';
                    }
                }
            });
        }

        // 9. GESTION DES ÉVÉNEMENTS CLAVIER
        document.addEventListener('keydown', function(e) {
            // Échap pour fermer la fenêtre d'authentification
            if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                if (adminError) adminError.style.display = 'none';
                if (creatorError) creatorError.style.display = 'none';
                if (adminForm) adminForm.reset();
                if (creatorForm) creatorForm.reset();
            }
            
            // Échap pour fermer le modal d'abonnement
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
                closeModal();
            }
        });

        // 10. EMPÊCHER LA SOUMISSION PAR DÉFAUT DES AUTRES FORMULAIRES
        const otherForms = document.querySelectorAll('form:not(#subscriber-form-element):not(#creator-register-form):not(#admin-form):not(#creator-form)');
        otherForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Formulaire soumis avec succès ! (démonstration)');
                form.reset();
            });
        });
    }
    
    // ============================================
    // FONCTIONS POUR LA PAGE ADMINISTRATION (admin.html)
    // ============================================
    
    async function initAdminPage() {
        console.log('🔄 Initialisation de la page admin...');
        
        // Vérification de connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Connectez-vous en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Admin connecté');
        
        // Tester la connexion avant de continuer
        const connected = await testerConnexionSupabase();
        if (!connected) {
            const pendingDiv = document.getElementById('pendingCreators');
            if (pendingDiv) {
                pendingDiv.innerHTML = 
                    `<div style="color: red; padding: 30px; text-align: center;">
                        <h3>❌ Erreur de connexion à la base de données</h3>
                        <p>Impossible de se connecter à Supabase. Vérifiez:</p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Votre connexion internet</li>
                            <li>Les politiques RLS dans Supabase</li>
                            <li>Que la clé API est correcte</li>
                        </ul>
                    </div>`;
            }
            return;
        }
        
        // Éléments de la page
        const pendingDiv = document.getElementById('pendingCreators');
        const approvedDiv = document.getElementById('approvedCreators');
        const pendingCount = document.getElementById('pendingCount');
        const approvedCount = document.getElementById('approvedCount');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (!pendingDiv || !approvedDiv) {
            console.error('❌ Éléments manquants dans la page');
            return;
        }
        
        // Charger les créateurs
        chargerTousLesCreateurs();
        
        // Gestion déconnexion
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Déconnexion ?')) {
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Actualisation automatique
        setInterval(chargerTousLesCreateurs, 30000);
        
        console.log('🎯 Script admin prêt');
    }
    
    // REQUÊTE : Charger tous les créateurs
    async function chargerTousLesCreateurs() {
        console.log('📡 Chargement des créateurs...');
        
        const pendingDiv = document.getElementById('pendingCreators');
        const approvedDiv = document.getElementById('approvedCreators');
        const pendingCount = document.getElementById('pendingCount');
        const approvedCount = document.getElementById('approvedCount');
        
        try {
            // Test de connexion d'abord
            const { count, error: testError } = await supabase
                .from('créateurs')
                .select('*', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Erreur connexion:', testError);
                if (pendingDiv) {
                    pendingDiv.innerHTML = `
                        <div style="color: red; padding: 20px; text-align: center;">
                            Erreur connexion: ${testError.message}<br>
                            <small>Code: ${testError.code}</small>
                        </div>
                    `;
                }
                return;
            }
            
            console.log(`✅ ${count} créateurs dans la base`);
            
            // Charger les créateurs en attente
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                if (pendingDiv) {
                    pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                        Erreur: ${pendingError.message}
                    </div>`;
                }
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending`);
                afficherCreateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            // Charger les créateurs approuvés
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                if (approvedDiv) {
                    approvedDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                        Erreur: ${approvedError.message}
                    </div>`;
                }
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés`);
                afficherCreateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            if (pendingDiv) {
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${error.message}
                </div>`;
            }
        }
    }
    
    // REQUÊTE : Approuver un créateur
    async function approuverCreateur(id, nomMarque) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Approuver le créateur "${nomMarque}" ?\n\nIl pourra se connecter à son espace.`)) {
            return;
        }
        
        try {
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
            
            alert(`✅ "${nomMarque}" a été approuvé avec succès !`);
            console.log(`✅ Créateur ${id} approuvé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Échec de l'approbation: ${error.message}`);
        }
    }
    
    // REQUÊTE : Refuser un créateur
    async function refuserCreateur(id, nomMarque) {
        console.log(`🗑️ Tentative de refus: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Refuser définitivement "${nomMarque}" ?\n\nCette action supprimera complètement la demande.`)) {
            return;
        }
        
        try {
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
            
            alert(`❌ "${nomMarque}" a été refusé et supprimé.`);
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Échec du refus: ${error.message}`);
        }
    }
    
    // Fonction pour afficher les créateurs (VERSION CORRIGÉE)
    function afficherCreateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">${message}</div>`;
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
            
            html += `
                <div class="creator-card" id="creator-${creator.id}">
                    <h3>${safeNom}</h3>
                    <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Téléphone:</strong> ${safeTel}</p>
                    <p><strong>Domaine:</strong> ${safeDomaine}</p>
                    <p><strong>ID:</strong> <code>${creator.id}</code></p>
                    <p><strong>Statut:</strong> ${creator.statut}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" data-id="${creator.id}" data-brand="${safeNom}">
                            ✅ Approuver
                        </button>
                        <button class="action-btn reject-btn" data-id="${creator.id}" data-brand="${safeNom}">
                            ❌ Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
        // AJOUTER LES ÉVÉNEMENTS APRÈS L'INSERTION DU HTML
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
    
    // Fonction utilitaire pour échapper le HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Rendre les fonctions globales pour admin
    window.approuverCreateur = approuverCreateur;
    window.refuserCreateur = refuserCreateur;
    
    // ============================================
    // FONCTIONS POUR LA PAGE ACTUALISATION (Actualisation.html)
    // ============================================
    
    async function initActualisationPage() {
        console.log('🔄 Initialisation de la page actualisation...');
        
        // Vérification de connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Admin connecté pour actualisation');
        
        // Initialiser les onglets
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-tab').classList.add('active');
                
                // Charger les données de la rubrique sélectionnée
                loadAdminData(tabId);
            });
        });
        
        // Initialiser l'upload d'images pour chaque rubrique
        const rubriques = ['actualites', 'visages', 'coulisses', 'tendances', 'decouvertes', 'mode', 'accessoires', 'beaute', 'culture'];
        rubriques.forEach(rubrique => {
            setupImageUpload(rubrique);
        });
        
        // Initialiser les boutons de sauvegarde
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', async function() {
                const tabId = this.id.split('-')[1];
                console.log('🔄 Enregistrement pour:', tabId);
                await saveArticle(tabId);
            });
        });
        
        // Initialiser les boutons d'annulation
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.id.split('-')[1];
                resetForm(tabId);
            });
        });
        
        // Charger les données initiales
        await loadAdminData('actualites');
        
        // Définir la date du jour comme valeur par défaut pour tous les champs date
        setDefaultDates();
    }
    
    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }
    
    function setupImageUpload(rubrique) {
        const uploadArea = document.getElementById(`uploadArea-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        
        if (!uploadArea || !imageFile) return;
        
        // Gestion du drag & drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--accent)';
            this.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.backgroundColor = '';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                imageFile.files = e.dataTransfer.files;
                displayImagePreview(file, preview);
            }
        });
        
        // Gestion du clic
        uploadArea.addEventListener('click', function() {
            imageFile.click();
        });
        
        // Gestion du changement de fichier
        imageFile.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                displayImagePreview(this.files[0], preview);
            }
        });
    }
    
    function displayImagePreview(file, previewElement) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    async function loadAdminData(tabId) {
        console.log(`🔄 Chargement des données admin pour: ${tabId}`);
        
        const listContainer = document.getElementById(`${tabId}List`);
        if (!listContainer) return;
        
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('rubrique', tabId)
                .order('date_publication', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        Aucun contenu publié pour le moment.
                    </div>
                `;
                return;
            }
            
            listContainer.innerHTML = data.map(article => `
                <div class="content-item" data-id="${article.id}">
                    <div class="content-info">
                        ${article.image_url ? `
                        <img src="${article.image_url}" 
                             alt="${article.titre_fr}" 
                             onerror="this.src='https://placehold.co/80x60?text=${tabId.toUpperCase()}'">
                        ` : `
                        <div style="width: 80px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                            📝
                        </div>
                        `}
                        <div>
                            <h3>${article.titre_fr}</h3>
                            <div class="content-meta">
                                <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                                <span>${article.auteur || 'Rédaction'}</span>
                                <span class="badge">${article.statut || 'publié'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="editArticle('${tabId}', '${article.id}')">
                            ✏️ Modifier
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteArticle('${tabId}', '${article.id}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error(`❌ Erreur chargement ${tabId}:`, error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    Erreur de chargement: ${error.message}
                </div>
            `;
        }
    }
    
    // ============================================
    // FONCTION UPLOAD D'IMAGE MODIFIÉE
    // ============================================
    async function uploadImage(file, rubrique) {
        if (!file) return null;
        
        try {
            console.log('📤 Début upload image:', file.name, file.size);
            
            // Vérifier la taille du fichier (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                console.error('❌ Fichier trop volumineux:', file.size);
                alert('Le fichier est trop volumineux (max 2MB)');
                return null;
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${rubrique}_${Date.now()}.${fileExt}`;
            const filePath = `${rubrique}/${fileName}`;
            
            console.log('📁 Chemin de fichier:', filePath);
            
            // Option 1: Si vous avez configuré le bucket "images" dans Supabase Storage
            // const { data, error } = await supabase.storage
            //     .from('images')
            //     .upload(filePath, file);
            
            // Option 2: Utiliser un service d'upload externe ou stocker l'image en base64
            // Pour le moment, on va stocker l'image en base64 directement dans la base de données
            
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                reader.onload = function(e) {
                    const base64Image = e.target.result;
                    console.log('✅ Image convertie en base64:', base64Image.length);
                    resolve(base64Image); // Stocker l'image en base64
                };
                
                reader.onerror = function(error) {
                    console.error('❌ Erreur conversion base64:', error);
                    reject(error);
                };
                
                reader.readAsDataURL(file);
            });
            
        } catch (error) {
            console.error('💥 Erreur upload image:', error);
            return null;
        }
    }
    
    async function saveArticle(rubrique) {
        const formTitle = document.getElementById(`formTitle-${rubrique}`);
        const btnSave = document.getElementById(`btnSave-${rubrique}`);
        const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
        const statusElement = document.getElementById(`status-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        
        if (!formTitle || !btnSave) return;
        
        // Récupérer les données du formulaire
        const formData = getFormData(rubrique);
        
        // Validation
        if (!formData.titre_fr) {
            showStatus(statusElement, '❌ Le titre est obligatoire', 'error');
            return;
        }
        
        // Désactiver le bouton pendant l'enregistrement
        btnSave.disabled = true;
        btnSave.innerHTML = '<span>⏳ Enregistrement...</span>';
        
        try {
            let imageUrl = null;
            
            // Upload de l'image si présente
            if (imageFile.files && imageFile.files[0]) {
                imageUrl = await uploadImage(imageFile.files[0], rubrique);
            }
            
            // Préparer les données pour Supabase
            const articleData = {
                ...formData,
                image_url: imageUrl || formData.image_url,
                statut: 'publié',
                date_publication: formData.date_publication || new Date().toISOString()
            };
            
            console.log('📤 Données à envoyer:', articleData);
            
            // Vérifier si c'est une création ou une mise à jour
            const editingId = btnSave.getAttribute('data-editing-id');
            
            let result;
            if (editingId) {
                // Mise à jour
                const { data, error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', editingId);
                
                if (error) throw error;
                
                console.log('✅ Article mis à jour:', data);
                showStatus(statusElement, '✅ Article mis à jour avec succès!', 'success');
                btnSave.removeAttribute('data-editing-id');
                formTitle.textContent = getFormTitle(rubrique, false);
                
            } else {
                // Création
                const { data, error } = await supabase
                    .from('articles')
                    .insert([articleData]);
                
                if (error) throw error;
                
                console.log('✅ Article créé:', data);
                showStatus(statusElement, '✅ Article publié avec succès!', 'success');
            }
            
            // Réinitialiser le formulaire
            resetForm(rubrique);
            
            // Recharger la liste
            await loadAdminData(rubrique);
            
            // Afficher le succès pendant 3 secondes
            setTimeout(() => {
                showStatus(statusElement, '', 'success');
            }, 3000);
            
        } catch (error) {
            console.error(`❌ Erreur sauvegarde ${rubrique}:`, error);
            showStatus(statusElement, `❌ Erreur: ${error.message}`, 'error');
        } finally {
            // Réactiver le bouton
            btnSave.disabled = false;
            btnSave.innerHTML = editingId ? 
                '<span>💾 Mettre à jour</span>' : 
                '<span>🚀 Publier</span>';
        }
    }
    
    function getFormData(rubrique) {
        const data = {
            rubrique: document.getElementById(`rubrique-${rubrique}`)?.value || rubrique,
            titre_fr: document.getElementById(`titre-${rubrique}`)?.value || '',
            contenu_fr: document.getElementById(`contenu-${rubrique}`)?.value || '',
            auteur: document.getElementById(`auteur-${rubrique}`)?.value || 'Rédaction',
            date_publication: document.getElementById(`date-${rubrique}`)?.value || new Date().toISOString().split('T')[0]
        };
        
        // Champs spécifiques par rubrique
        switch(rubrique) {
            case 'actualites':
                data.categorie_actualite = document.getElementById(`categorie-${rubrique}`)?.value;
                break;
            case 'visages':
                data.nom_marque = document.getElementById(`nom_marque-${rubrique}`)?.value;
                data.nom_createur = document.getElementById(`nom_createur-${rubrique}`)?.value;
                data.domaine = document.getElementById(`domaine-${rubrique}`)?.value;
                data.reseaux_instagram = document.getElementById(`instagram-${rubrique}`)?.value;
                data.site_web = document.getElementById(`siteweb-${rubrique}`)?.value;
                data.interview_fr = document.getElementById(`interview-${rubrique}`)?.value;
                break;
            case 'tendances':
                data.saison = document.getElementById(`saison-${rubrique}`)?.value;
                break;
            case 'decouvertes':
                data.type_decouverte = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'mode':
                data.theme_mode = document.getElementById(`theme-${rubrique}`)?.value;
                break;
            case 'accessoires':
                data.type_accessoire = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'beaute':
                data.type_beaute = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'culture':
                // Traitement spécial pour culture/agenda
                return getCultureFormData();
        }
        
        return data;
    }
    
    function getCultureFormData() {
        return {
            rubrique: 'culture',
            titre_fr: document.getElementById('titre-culture')?.value || '',
            type_evenement: document.getElementById('type-culture')?.value,
            date_evenement: document.getElementById('date_debut-culture')?.value,
            date_fin_evenement: document.getElementById('date_fin-culture')?.value,
            heure_evenement: document.getElementById('heure-culture')?.value,
            statut_evenement: document.getElementById('statut-culture')?.value,
            lieu: document.getElementById('lieu-culture')?.value,
            contenu_fr: document.getElementById('description-culture')?.value || '',
            lien_evenement: document.getElementById('lien-culture')?.value,
            auteur: 'Rédaction',
            statut: 'publié'
        };
    }
    
    function showStatus(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `status-message status-${type}`;
        element.style.display = message ? 'block' : 'none';
    }
    
    function resetForm(rubrique) {
        // Réinitialiser tous les champs du formulaire
        const form = document.getElementById(`${rubrique}-tab`);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], input[type="url"], textarea, select');
        inputs.forEach(input => {
            if (input.type === 'select-one') {
                input.selectedIndex = 0;
            } else if (input.type === 'date') {
                input.value = new Date().toISOString().split('T')[0];
            } else if (input.id.includes('titre-') || input.id.includes('contenu-')) {
                input.value = '';
            } else if (input.id.includes('auteur-')) {
                input.value = 'Rédaction';
            } else {
                input.value = '';
            }
        });
        
        // Réinitialiser l'image
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        if (imageFile) {
            imageFile.value = '';
        }
        
        // Réinitialiser le bouton
        const btnSave = document.getElementById(`btnSave-${rubrique}`);
        const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
        const formTitle = document.getElementById(`formTitle-${rubrique}`);
        
        if (btnSave) {
            btnSave.removeAttribute('data-editing-id');
            btnSave.innerHTML = '<span>🚀 Publier</span>';
        }
        
        if (btnCancel) {
            btnCancel.style.display = 'none';
        }
        
        if (formTitle) {
            formTitle.textContent = getFormTitle(rubrique, false);
        }
        
        // Cacher le message de statut
        const statusElement = document.getElementById(`status-${rubrique}`);
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }
    
    function getFormTitle(rubrique, editing = false) {
        const titles = {
            'actualites': editing ? 'Modifier une actualité' : 'Publier une actualité',
            'visages': editing ? 'Modifier un créateur' : 'Ajouter un créateur',
            'coulisses': editing ? 'Modifier un article coulisses' : 'Article Coulisses',
            'tendances': editing ? 'Modifier un article tendances' : 'Article Tendances',
            'decouvertes': editing ? 'Modifier une découverte' : 'Nouvelle découverte',
            'culture': editing ? 'Modifier un événement' : 'Événement Culture/Agenda',
            'mode': editing ? 'Modifier un article mode' : 'Article Mode',
            'accessoires': editing ? 'Modifier un article accessoires' : 'Article Accessoires',
            'beaute': editing ? 'Modifier un article beauté' : 'Article Beauté'
        };
        
        return titles[rubrique] || 'Formulaire';
    }
    
    // Fonctions pour éditer/supprimer les articles
    window.editArticle = async function(rubrique, articleId) {
        console.log(`✏️ Édition article ${articleId} (${rubrique})`);
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (!data) {
                alert('Article non trouvé');
                return;
            }
            
            // Remplir le formulaire avec les données
            fillForm(rubrique, data);
            
            // Mettre à jour le bouton
            const btnSave = document.getElementById(`btnSave-${rubrique}`);
            const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
            const formTitle = document.getElementById(`formTitle-${rubrique}`);
            
            if (btnSave) {
                btnSave.setAttribute('data-editing-id', articleId);
                btnSave.innerHTML = '<span>💾 Mettre à jour</span>';
            }
            
            if (btnCancel) {
                btnCancel.style.display = 'block';
            }
            
            if (formTitle) {
                formTitle.textContent = getFormTitle(rubrique, true);
            }
            
            // Aller à l'onglet correspondant
            document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const tabBtn = document.querySelector(`.tab-link[data-tab="${rubrique}"]`);
            const tabContent = document.getElementById(`${rubrique}-tab`);
            
            if (tabBtn) tabBtn.classList.add('active');
            if (tabContent) tabContent.classList.add('active');
            
        } catch (error) {
            console.error('❌ Erreur chargement article:', error);
            alert('Erreur lors du chargement de l\'article');
        }
    };
    
    window.deleteArticle = async function(rubrique, articleId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);
            
            if (error) throw error;
            
            alert('✅ Article supprimé avec succès!');
            
            // Recharger la liste
            await loadAdminData(rubrique);
            
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            alert('❌ Erreur lors de la suppression');
        }
    };
    
    function fillForm(rubrique, data) {
        // Remplir les champs communs
        const setValue = (id, value) => {
            const element = document.getElementById(`${id}-${rubrique}`);
            if (element && value) element.value = value;
        };
        
        setValue('titre', data.titre_fr);
        setValue('contenu', data.contenu_fr);
        setValue('auteur', data.auteur);
        
        if (data.date_publication) {
            setValue('date', data.date_publication.split('T')[0]);
        }
        
        // Remplir les champs spécifiques
        switch(rubrique) {
            case 'actualites':
                setValue('categorie', data.categorie_actualite);
                break;
            case 'visages':
                setValue('nom_marque', data.nom_marque);
                setValue('nom_createur', data.nom_createur);
                setValue('domaine', data.domaine);
                setValue('instagram', data.reseaux_instagram);
                setValue('siteweb', data.site_web);
                setValue('interview', data.interview_fr);
                break;
            case 'tendances':
                setValue('saison', data.saison);
                break;
            case 'decouvertes':
                setValue('type', data.type_decouverte);
                break;
            case 'mode':
                setValue('theme', data.theme_mode);
                break;
            case 'accessoires':
                setValue('type', data.type_accessoire);
                break;
            case 'beaute':
                setValue('type', data.type_beaute);
                break;
            case 'culture':
                fillCultureForm(data);
                break;
        }
        
        // Afficher l'image si présente
        if (data.image_url) {
            const preview = document.getElementById(`currentImagePreview-${rubrique}`);
            if (preview) {
                preview.src = data.image_url;
                preview.style.display = 'block';
            }
        }
    }
    
    function fillCultureForm(data) {
        const setValue = (id, value) => {
            const element = document.getElementById(`${id}-culture`);
            if (element && value) element.value = value;
        };
        
        setValue('titre', data.titre_fr);
        setValue('type', data.type_evenement);
        setValue('date_debut', data.date_evenement ? data.date_evenement.split('T')[0] : '');
        setValue('date_fin', data.date_fin_evenement ? data.date_fin_evenement.split('T')[0] : '');
        setValue('heure', data.heure_evenement);
        setValue('statut', data.statut_evenement);
        setValue('lieu', data.lieu);
        setValue('description', data.contenu_fr);
        setValue('lien', data.lien_evenement);
    }
    
    // ============================================
    // FONCTIONS POUR LA NOUVELLE STRUCTURE
    // ============================================
    
    // Fonction principale pour charger les articles par rubrique
    window.loadArticlesByRubrique = async function(rubrique, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.log(`❌ Conteneur ${containerId} non trouvé`);
            return;
        }
        
        try {
            console.log(`🔄 Chargement des articles ${rubrique}...`);
            
            // Afficher un message de chargement
            container.innerHTML = '<div class="loading" style="padding: 40px; text-align: center; color: #666;">Chargement des articles...</div>';
            
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', rubrique)
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            console.log('📊 Données reçues pour', rubrique, ':', data);
            
            if (error) {
                console.error(`❌ Erreur chargement ${rubrique}:`, error);
                container.innerHTML = `<p class="error" style="padding: 40px; text-align: center; color: #dc3545;">Erreur de chargement: ${error.message}</p>`;
                return;
            }
            
            if (!data || data.length === 0) {
                console.log(`ℹ️ Aucun article ${rubrique} trouvé (statut = publié)`);
                container.innerHTML = `<p class="no-content" style="padding: 40px; text-align: center; color: #666;">Aucun contenu publié pour le moment.<br><small>Utilisez Actualisation.html pour publier du contenu</small></p>`;
                return;
            }
            
            console.log(`✅ ${data.length} articles ${rubrique} chargés (publiés)`);
            
            // Appeler la fonction de rendu appropriée
            switch(rubrique) {
                case 'actualites':
                    renderActualites(data, container);
                    break;
                case 'visages':
                    renderVisages(data, container);
                    break;
                case 'coulisses':
                    renderCoulisses(data, container);
                    break;
                case 'tendances':
                    renderTendances(data, container);
                    break;
                case 'decouvertes':
                    renderDecouvertes(data, container);
                    break;
                case 'culture':
                    renderCulture(data, container);
                    break;
                case 'mode':
                    renderMode(data, container);
                    break;
                case 'accessoires':
                    renderAccessoires(data, container);
                    break;
                case 'beaute':
                    renderBeaute(data, container);
                    break;
                default:
                    renderGenericArticles(data, container, rubrique);
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            container.innerHTML = `<p class="error" style="padding: 40px; text-align: center; color: #dc3545;">Une erreur est survenue lors du chargement: ${error.message}</p>`;
        }
    };
    
    // ============================================
    // FONCTION DE DÉBOGAGE POUR VÉRIFIER LES ARTICLES
    // ============================================
    async function debugArticles(rubrique) {
        console.log(`🔍 Debug ${rubrique}...`);
        
        try {
            const { data, error, count } = await supabase
                .from('articles')
                .select('*', { count: 'exact' })
                .eq('rubrique', rubrique)
                .eq('statut', 'publié');
            
            if (error) {
                console.error(`❌ Erreur query ${rubrique}:`, error);
                return;
            }
            
            console.log(`📊 ${rubrique}: ${count} articles trouvés`);
            
            if (data && data.length > 0) {
                data.forEach((article, index) => {
                    console.log(`  ${index + 1}. ${article.titre_fr} (ID: ${article.id})`);
                    console.log(`     Image: ${article.image_url ? '✓' : '✗'}`);
                    console.log(`     Statut: ${article.statut}`);
                    console.log(`     Date: ${article.date_publication}`);
                });
            }
            
        } catch (error) {
            console.error(`💥 Exception debug ${rubrique}:`, error);
        }
    }
    
    // ============================================
    // FONCTIONS DE RENDU MODIFIÉES (TITRE + IMAGE SEULEMENT)
    // ============================================
    
    function renderActualites(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="article-card rounded-article">
                ${article.image_url ? `
                <div class="article-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy" 
                         onerror="this.src='https://placehold.co/600x400?text=ACTUALITE'">
                </div>
                ` : ''}
                
                <div class="article-content">
                    <h2 class="article-title">${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-more">
                        Lire la suite →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderVisages(visages, container) {
        // Si le conteneur est dans la page Visages avec son design spécifique
        if (container.closest('.visages-page')) {
            container.innerHTML = visages.map(visage => `
                <div class="visage-card rounded-article">
                    ${visage.image_url ? `
                    <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy" class="visage-image rounded-image"
                         onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    ` : ''}
                    
                    <div class="visage-content">
                        <h3>${visage.nom_marque || visage.titre_fr}</h3>
                        
                        <a href="article.html?id=${visage.id}" class="visage-link">
                            Voir le profil complet →
                        </a>
                    </div>
                </div>
            `).join('');
        } else {
            // Version simplifiée (titre + image seulement)
            container.innerHTML = visages.map(visage => `
                <div class="creator-card rounded-article">
                    ${visage.image_url ? `
                    <div class="creator-photo rounded-image">
                        <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    </div>
                    ` : ''}
                    
                    <div class="creator-info">
                        <h3 class="creator-name">${visage.nom_marque || visage.titre_fr}</h3>
                        
                        <a href="article.html?id=${visage.id}" class="view-profile">
                            Voir le profil complet →
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }
    
    function renderCoulisses(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="backstage-article rounded-article">
                ${article.image_url ? `
                <div class="backstage-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=COULISSES'">
                </div>
                ` : ''}
                
                <div class="backstage-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-backstage">
                        Voir les coulisses →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderTendances(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="trend-article rounded-article">
                ${article.image_url ? `
                <div class="trend-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=TENDANCE'">
                    ${article.saison ? `<span class="season-badge">${article.saison}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="trend-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-trend">
                        Découvrir les tendances →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderDecouvertes(decouvertes, container) {
        const groupedByType = {};
        decouvertes.forEach(decouverte => {
            const type = decouverte.type_decouverte || 'autre';
            if (!groupedByType[type]) {
                groupedByType[type] = [];
            }
            groupedByType[type].push(decouverte);
        });
        
        container.innerHTML = Object.entries(groupedByType).map(([type, items]) => `
            <section class="discovery-section">
                <h2 class="section-title">${getTypeDecouverteLabel(type)}</h2>
                <div class="discoveries-grid">
                    ${items.map(item => `
                        <div class="discovery-card rounded-article">
                            ${item.image_url ? `
                            <div class="discovery-image rounded-image">
                                <img src="${item.image_url}" alt="${item.titre_fr}" loading="lazy"
                                     onerror="this.src='https://placehold.co/400x250?text=DECOUVERTE'">
                            </div>
                            ` : ''}
                            
                            <div class="discovery-content">
                                <h3>${item.titre_fr}</h3>
                                <a href="article.html?id=${item.id}" class="discovery-link">
                                    Découvrir →
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `).join('');
    }
    
    function renderCulture(events, container) {
        const maintenant = new Date();
        const evenementsFuturs = [];
        const evenementsPasses = [];
        
        events.forEach(event => {
            const dateEvent = event.date_evenement ? new Date(event.date_evenement) : new Date(event.date_publication);
            if (dateEvent >= maintenant) {
                evenementsFuturs.push(event);
            } else {
                evenementsPasses.push(event);
            }
        });
        
        let html = '';
        
        // Événements à venir
        if (evenementsFuturs.length > 0) {
            html += `
                <section class="events-section">
                    <h2 class="section-title">📅 Événements à venir</h2>
                    <div class="events-grid">
                        ${evenementsFuturs.map(event => `
                            <div class="event-card upcoming rounded-article">
                                <div class="event-header">
                                    <h3>${event.titre_fr}</h3>
                                    ${event.image_url ? `
                                    <div class="event-image rounded-image">
                                        <img src="${event.image_url}" alt="${event.titre_fr}" loading="lazy"
                                             onerror="this.src='https://placehold.co/400x250?text=EVENEMENT'">
                                    </div>
                                    ` : ''}
                                    <span class="event-type">${event.type_evenement || 'Événement'}</span>
                                </div>
                                
                                <div class="event-details">
                                    <a href="article.html?id=${event.id}" class="event-link">
                                        <i class="fas fa-info-circle"></i> Voir détails
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        // Événements passés
        if (evenementsPasses.length > 0) {
            html += `
                <section class="events-section">
                    <h2 class="section-title">📚 Archives des événements</h2>
                    <div class="events-grid past">
                        ${evenementsPasses.map(event => `
                            <div class="event-card past rounded-article">
                                ${event.image_url ? `
                                <div class="event-image rounded-image">
                                    <img src="${event.image_url}" alt="${event.titre_fr}" loading="lazy"
                                         onerror="this.src='https://placehold.co/400x250?text=EVENEMENT'">
                                </div>
                                ` : ''}
                                <h4>${event.titre_fr}</h4>
                                <a href="article.html?id=${event.id}" class="event-link">
                                    Revivre l'événement →
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        container.innerHTML = html || '<p class="no-content">Aucun événement programmé.</p>';
    }
    
    function renderMode(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="fashion-article rounded-article">
                ${article.image_url ? `
                <div class="fashion-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=MODE'">
                    ${article.theme_mode ? `<span class="theme-badge">${article.theme_mode}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="fashion-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-article">
                        Lire l'article complet →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderAccessoires(articles, container) {
        container.innerHTML = articles.map(article => `
            <div class="accessory-article rounded-article">
                ${article.image_url ? `
                <div class="accessory-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ACCESSOIRE'">
                    ${article.type_accessoire ? `<span class="type-tag">${article.type_accessoire}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="accessory-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="view-details">
                        Voir les détails →
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    function renderBeaute(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="beauty-card rounded-article">
                ${article.image_url ? `
                <div class="beauty-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=BEAUTE'">
                    ${article.type_beaute ? `<div class="beauty-category">${article.type_beaute}</div>` : ''}
                </div>
                ` : ''}
                
                <div class="beauty-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="read-beauty">
                        Lire les conseils →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderGenericArticles(articles, container, rubrique) {
        container.innerHTML = articles.map(article => `
            <article class="generic-article rounded-article">
                ${article.image_url ? `
                <div class="generic-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ARTICLE'">
                </div>
                ` : ''}
                
                <div class="generic-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="read-generic">
                        Lire l'article →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    // ============================================
    // FONCTION POUR CHARGER UN ARTICLE UNIQUE (CORRIGÉE)
    // ============================================
    window.loadSingleArticle = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            console.error('❌ Aucun ID d\'article dans l\'URL');
            const container = document.getElementById('article-content');
            if (container) {
                container.innerHTML = `
                    <div class="error-message" style="padding: 40px; text-align: center;">
                        <h2>Erreur</h2>
                        <p>Aucun article spécifié. Retournez à la page précédente.</p>
                        <a href="javascript:history.back()" class="btn-home">Retour</a>
                    </div>
                `;
            }
            return;
        }
        
        const container = document.getElementById('article-content');
        if (!container) {
            console.error('❌ Conteneur article-content non trouvé');
            return;
        }
        
        // Afficher un message de chargement avec le style arrondi
        container.innerHTML = `
            <article class="full-article rounded-article">
                <div class="loading" style="padding: 40px; text-align: center; color: #666;">
                    <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p>Chargement de l'article...</p>
                </div>
            </article>
        `;
        
        try {
            console.log(`🔄 Chargement de l'article ${articleId}...`);
            
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw new Error(`Erreur de chargement: ${error.message}`);
            }
            
            if (!article) {
                throw new Error('Article non trouvé');
            }
            
            if (article.statut !== 'publié') {
                throw new Error('Article non disponible (statut non publié)');
            }
            
            console.log('✅ Article chargé:', article);
            renderSingleArticle(article);
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            container.innerHTML = `
                <article class="full-article rounded-article">
                    <div class="error-message" style="padding: 40px; text-align: center;">
                        <h2>Erreur de chargement</h2>
                        <p>${error.message}</p>
                        <a href="index.html" class="btn-home">Retour à l'accueil</a>
                    </div>
                </article>
            `;
        }
    };
    
    function renderSingleArticle(article) {
        const container = document.getElementById('article-content');
        
        container.innerHTML = `
            <article class="full-article rounded-article">
                <header class="article-header">
                    <nav class="article-breadcrumb">
                        <a href="index.html">Accueil</a> > 
                        <a href="${article.rubrique}.html">${getRubriqueName(article.rubrique)}</a>
                    </nav>
                    
                    <h1 class="article-title">${article.titre_fr}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            <span class="article-author">👤 ${article.auteur || 'Rédaction'}</span>
                        </div>
                        
                        <div class="meta-right">
                            <span class="article-rubrique">${getRubriqueName(article.rubrique)}</span>
                            ${getArticleBadge(article)}
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image rounded-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>
                    ` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${article.contenu_fr ? formatArticleContent(article.contenu_fr) : '<p>Contenu non disponible.</p>'}
                    </div>
                    
                    ${renderArticleSpecificInfo(article)}
                </div>
                
                <footer class="article-footer">
                    <div class="article-tags">
                        ${getArticleTags(article)}
                    </div>
                    
                    <div class="article-navigation">
                        <a href="${article.rubrique}.html" class="back-to-list">
                            ← Retour à ${getRubriqueName(article.rubrique)}
                        </a>
                    </div>
                </footer>
            </article>
            
            <style>
                /* Styles pour les bordures arrondies comme mode/accessoires/beauté */
                .rounded-article {
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    background: var(--card-bg, #ffffff);
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .rounded-article:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                }
                
                .rounded-image {
                    border-radius: 15px 15px 0 0;
                    overflow: hidden;
                }
                
                .rounded-image img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                
                /* Style spécifique pour la page article */
                .full-article.rounded-article {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0;
                }
                
                .article-header {
                    padding: 30px;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
                }
                
                .article-body {
                    padding: 30px;
                }
                
                .article-footer {
                    padding: 30px;
                    border-top: 1px solid rgba(212, 175, 55, 0.1);
                    background: rgba(0, 0, 0, 0.02);
                }
                
                .article-breadcrumb {
                    font-size: 0.9em;
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }
                
                .article-breadcrumb a {
                    color: var(--accent);
                    text-decoration: none;
                }
                
                .article-breadcrumb a:hover {
                    text-decoration: underline;
                }
                
                .article-title {
                    font-size: 2.2em;
                    margin: 0 0 20px 0;
                    color: var(--text-primary);
                    line-height: 1.3;
                }
                
                .article-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: rgba(212, 175, 55, 0.05);
                    border-radius: 10px;
                }
                
                .meta-left, .meta-right {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    align-items: center;
                }
                
                .article-date, .article-author, .article-rubrique {
                    font-size: 0.9em;
                    color: var(--text-secondary);
                }
                
                .specific-badge {
                    background: var(--accent);
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    font-weight: 500;
                }
                
                .article-hero-image {
                    margin: 20px 0;
                }
                
                .article-hero-image img {
                    width: 100%;
                    height: auto;
                    border-radius: 10px;
                }
                
                .article-content-text {
                    font-size: 1.1em;
                    line-height: 1.8;
                    color: var(--text-primary);
                }
                
                .article-content-text h2 {
                    font-size: 1.5em;
                    margin: 30px 0 15px 0;
                    color: var(--text-primary);
                    padding-bottom: 10px;
                    border-bottom: 2px solid var(--accent);
                }
                
                .article-content-text h3 {
                    font-size: 1.3em;
                    margin: 25px 0 12px 0;
                    color: var(--text-primary);
                }
                
                .article-content-text p {
                    margin-bottom: 20px;
                }
                
                .article-content-text strong {
                    color: var(--accent);
                    font-weight: 600;
                }
                
                .article-content-text em {
                    font-style: italic;
                    color: var(--text-secondary);
                }
                
                .article-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .article-tag {
                    background: rgba(212, 175, 55, 0.1);
                    color: var(--accent);
                    padding: 5px 12px;
                    border-radius: 15px;
                    font-size: 0.85em;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }
                
                .back-to-list {
                    display: inline-block;
                    background: var(--accent);
                    color: white;
                    padding: 12px 25px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .back-to-list:hover {
                    background: rgba(212, 175, 55, 0.8);
                    transform: translateX(-5px);
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .article-title {
                        font-size: 1.8em;
                    }
                    
                    .article-meta {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .meta-left, .meta-right {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .article-header,
                    .article-body,
                    .article-footer {
                        padding: 20px;
                    }
                }
            </style>
        `;
    }
    
    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================
    
    function getTypeDecouverteLabel(type) {
        const labels = {
            'marque': 'Nouvelles Marques',
            'designer': 'Designers',
            'produit': 'Produits Innovants',
            'lieu': 'Lieux Inspirants',
            'technique': 'Techniques',
            'matiere': 'Nouvelles Matières',
            'artisan': 'Artisans',
            'autre': 'Autres Découvertes'
        };
        return labels[type] || 'Découvertes';
    }
    
    function getRubriqueName(rubrique) {
        const names = {
            'actualites': 'Actualités',
            'visages': 'Visages',
            'coulisses': 'Coulisses',
            'tendances': 'Tendances',
            'decouvertes': 'Découvertes',
            'culture': 'Culture/Agenda',
            'mode': 'Mode',
            'accessoires': 'Accessoires',
            'beaute': 'Beauté'
        };
        return names[rubrique] || rubrique;
    }
    
    function getArticleBadge(article) {
        if (article.type_decouverte) return `<span class="specific-badge">🔍 ${article.type_decouverte}</span>`;
        if (article.type_accessoire) return `<span class="specific-badge">💎 ${article.type_accessoire}</span>`;
        if (article.type_beaute) return `<span class="specific-badge">💄 ${article.type_beaute}</span>`;
        if (article.saison) return `<span class="specific-badge">📈 ${article.saison}</span>`;
        if (article.theme_mode) return `<span class="specific-badge">👗 ${article.theme_mode}</span>`;
        if (article.type_evenement) return `<span class="specific-badge">🎫 ${article.type_evenement}</span>`;
        if (article.categorie_actualite) return `<span class="specific-badge">📢 ${article.categorie_actualite}</span>`;
        return '';
    }
    
    function renderArticleSpecificInfo(article) {
        let html = '';
        
        if (article.rubrique === 'visages') {
            html += `
                <div class="specific-info creator-info rounded-article" style="margin: 30px 0; padding: 20px; background: rgba(212, 175, 55, 0.05); border-radius: 10px;">
                    <h3>À propos du créateur</h3>
                    <ul style="list-style: none; padding: 0; margin: 15px 0;">
                        ${article.nom_marque ? `<li style="margin-bottom: 10px;"><strong>Marque :</strong> ${article.nom_marque}</li>` : ''}
                        ${article.nom_createur ? `<li style="margin-bottom: 10px;"><strong>Créateur :</strong> ${article.nom_createur}</li>` : ''}
                        ${article.domaine ? `<li style="margin-bottom: 10px;"><strong>Domaine :</strong> ${article.domaine}</li>` : ''}
                        ${article.reseaux_instagram ? `<li style="margin-bottom: 10px;"><strong>Instagram :</strong> <a href="https://instagram.com/${article.reseaux_instagram.replace('@', '')}" target="_blank" style="color: var(--accent); text-decoration: none;">${article.reseaux_instagram}</a></li>` : ''}
                        ${article.site_web ? `<li style="margin-bottom: 10px;"><strong>Site web :</strong> <a href="${article.site_web}" target="_blank" style="color: var(--accent); text-decoration: none;">${article.site_web}</a></li>` : ''}
                    </ul>
                    ${article.interview_fr ? `
                    <div class="interview-section" style="margin-top: 20px;">
                        <h4 style="color: var(--accent); margin-bottom: 15px;">Interview</h4>
                        <div class="interview-content" style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent);">
                            ${formatArticleContent(article.interview_fr)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        if (article.rubrique === 'culture' && article.type_evenement) {
            html += `
                <div class="specific-info event-info rounded-article" style="margin: 30px 0; padding: 20px; background: rgba(212, 175, 55, 0.05); border-radius: 10px;">
                    <h3>Informations pratiques</h3>
                    <ul style="list-style: none; padding: 0; margin: 15px 0;">
                        ${article.type_evenement ? `<li style="margin-bottom: 10px;"><strong>Type :</strong> ${article.type_evenement}</li>` : ''}
                        ${article.date_evenement ? `<li style="margin-bottom: 10px;"><strong>Date :</strong> ${new Date(article.date_evenement).toLocaleDateString('fr-FR')}</li>` : ''}
                        ${article.heure_evenement ? `<li style="margin-bottom: 10px;"><strong>Heure :</strong> ${article.heure_evenement}</li>` : ''}
                        ${article.lieu ? `<li style="margin-bottom: 10px;"><strong>Lieu :</strong> ${article.lieu}</li>` : ''}
                        ${article.statut_evenement ? `<li style="margin-bottom: 10px;"><strong>Statut :</strong> ${article.statut_evenement}</li>` : ''}
                        ${article.lien_evenement ? `<li style="margin-bottom: 10px;"><strong>Lien :</strong> <a href="${article.lien_evenement}" target="_blank" style="color: var(--accent); text-decoration: none;">${article.lien_evenement}</a></li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        return html;
    }
    
    function formatArticleContent(content) {
        if (!content) return '<p>Contenu non disponible.</p>';
        return content
            .replace(/\n/g, '<br>')
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/## (.*?)\n/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    function getArticleTags(article) {
        const tags = [];
        
        if (article.type_decouverte) tags.push(`🔍 ${article.type_decouverte}`);
        if (article.type_accessoire) tags.push(`💎 ${article.type_accessoire}`);
        if (article.type_beaute) tags.push(`💄 ${article.type_beaute}`);
        if (article.saison) tags.push(`📈 ${article.saison}`);
        if (article.theme_mode) tags.push(`👗 ${article.theme_mode}`);
        if (article.domaine) tags.push(`🏷️ ${article.domaine}`);
        if (article.categorie_actualite) tags.push(`📢 ${article.categorie_actualite}`);
        if (article.type_evenement) tags.push(`🎫 ${article.type_evenement}`);
        
        return tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    }
    
    // ============================================
    // FONCTIONS POUR FILTRES ET CONFIGURATIONS
    // ============================================
    
    // Fonction pour configurer les filtres génériques
    window.setupFilters = function() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                if (typeof loadVisages === 'function') {
                    loadVisages(filter);
                }
            });
        });
    };
    
    // Fonction pour configurer les filtres Visages (spécifique)
    window.setupVisageFilters = function() {
        console.log('🔄 Configuration des filtres Visages...');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        if (filterBtns.length === 0) {
            console.log('ℹ️ Aucun filtre trouvé sur cette page');
            return;
        }
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Retirer la classe active de tous les boutons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                console.log(`🎯 Filtre sélectionné: ${filter}`);
                
                // Filtrer les articles Visages
                filterVisages(filter);
            });
        });
    };
    
    // Fonction pour filtrer les Visages par domaine
    async function filterVisages(domain) {
        const container = document.getElementById('visages-container');
        if (!container) return;
        
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'visages')
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            // Ajouter un filtre si ce n'est pas "all"
            if (domain !== 'all') {
                query = query.eq('domaine', domain);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = '<p class="no-content">Aucun créateur trouvé dans cette catégorie.</p>';
                return;
            }
            
            // Réutiliser la fonction de rendu existante
            renderVisages(data, container);
            
        } catch (error) {
            console.error('❌ Erreur filtrage:', error);
            container.innerHTML = `<p class="error">Erreur: ${error.message}</p>`;
        }
    }
    
    // Fonction pour configurer les catégories
    window.setupCategoryFilters = function() {
        const categoryElements = document.querySelectorAll('[data-category]');
        categoryElements.forEach(el => {
            el.addEventListener('click', function() {
                const category = this.dataset.category;
                alert(`Filtre: ${category} - Fonctionnalité à implémenter`);
            });
        });
    };
    
    // ============================================
    // FONCTION D'INITIALISATION AUTOMATIQUE DES PAGES
    // ============================================
    
    window.initPageData = function() {
        console.log('🔄 Initialisation des données de la page...');
        detectPageAndLoad();
    };
    
    // ============================================
    // ANCIENNES FONCTIONS PRÉSERVÉES POUR COMPATIBILITÉ
    // ============================================
    
    // Fonction pour charger les articles de Coulisses (ancienne version)
    window.loadCoulissesArticles = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadCoulissesArticles');
        loadArticlesByRubrique('coulisses', 'articles-list');
    };
    
    // Fonction pour charger les Tendances (ancienne version)
    window.loadTrends = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadTrends');
        loadArticlesByRubrique('tendances', 'trends-container');
    };
    
    // Fonction pour charger les Visages (ancienne version)
    window.loadVisages = async function(filter = 'all') {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadVisages');
        loadArticlesByRubrique('visages', 'visages-container');
    };
    
    // Fonction pour charger les Découvertes (ancienne version)
    window.loadDiscoveries = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadDiscoveries');
        loadArticlesByRubrique('decouvertes', 'discoveries-container');
    };
    
    // Fonction pour charger les Événements (Culture/Agenda)
    window.loadEvents = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadEvents');
        loadArticlesByRubrique('culture', 'events-container');
    };
    
    // ============================================
    // FONCTION DE DÉBOGAGE GLOBALE
    // ============================================
    
    // Fonction de débogage pour vérifier les articles (globale)
    window.debugArticles = debugArticles;
    
    // ============================================
    // EXÉCUTION AUTOMATIQUE
    // ============================================
    console.log('🚀 Script principal centralisé chargé avec succès !');
    
    // Démarrer la détection de page après un court délai
    setTimeout(() => {
        detectPageAndLoad();
    }, 100);
});
