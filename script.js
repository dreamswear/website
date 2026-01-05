// ============================================
// SCRIPT PRINCIPAL COMPLET - DREAMSWEAR MAG
// ============================================

let supabaseClient = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation DREAMSWEAR MAG');
    
    // 1. Initialiser Supabase
    initSupabase();
    
    // 2. Initialiser tous les composants
    initAllComponents();
    
    // 3. Observer les animations
    initAnimations();
    
    // 4. Charger les données selon la page
    autoLoadPageContent();
});

// ============================================
// 1. INITIALISATION SUPABASE
// ============================================
function initSupabase() {
    try {
        if (window.supabase) {
            supabaseClient = window.supabase;
        } else {
            const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
            
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        console.log('✅ Supabase initialisé');
    } catch (error) {
        console.error('❌ Erreur Supabase:', error);
    }
}

// ============================================
// 2. ANIMATIONS POUR PAGE PRINCIPALE
// ============================================
function initAnimations() {
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
}

// ============================================
// 3. INITIALISER LES COMPOSANTS
// ============================================
function initAllComponents() {
    // Menu déroulant principal
    initMainMenu();
    
    // Sélecteur de thème
    initThemeSelector();
    
    // Modal d'abonnement
    initSubscriptionModal();
    
    // Authentification
    initAuthModal();
    
    // Gestion des formulaires
    initForms();
    
    // Gestion admin/créateurs
    initAdminFeatures();
}

// ============================================
// MENU DÉROULANT PRINCIPAL
// ============================================
function initMainMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (menuBtn && dropdownMenu) {
        console.log('✅ Initialisation menu déroulant');
        
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
        
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// ============================================
// SÉLECTEUR DE THÈME
// ============================================
function initThemeSelector() {
    // Pour les pages simples (accessoires.html, beaute.html, etc.)
    const simpleThemeBtn = document.getElementById('themeButton');
    const simpleThemeOptions = document.getElementById('themeOptions');
    const themeText = document.getElementById('themeText');
    
    if (simpleThemeBtn && simpleThemeOptions) {
        console.log('✅ Initialisation thème simple');
        
        const savedTheme = localStorage.getItem('dreamswear-theme') || 'day';
        document.body.setAttribute('data-theme', savedTheme);
        if (themeText) {
            themeText.textContent = savedTheme === 'night' ? 'Sombre' : 'Clair';
        }
        
        simpleThemeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            simpleThemeOptions.classList.toggle('show');
        });
        
        simpleThemeOptions.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = this.getAttribute('data-theme');
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('dreamswear-theme', theme);
                
                if (themeText) {
                    themeText.textContent = theme === 'night' ? 'Sombre' : 'Clair';
                }
                
                simpleThemeOptions.classList.remove('show');
            });
        });
        
        document.addEventListener('click', function() {
            simpleThemeOptions.classList.remove('show');
        });
    }
    
    // Pour les pages avec l'ancien système (index.html, etc.)
    const oldThemeBtn = document.getElementById('theme-select-button');
    const oldThemeOptions = document.getElementById('theme-options');
    const oldThemeText = document.getElementById('theme-button-text');
    
    if (oldThemeBtn && oldThemeOptions) {
        console.log('✅ Initialisation thème ancien');
        
        const savedTheme = localStorage.getItem('dreamswear-theme') || 'day';
        document.body.setAttribute('data-theme', savedTheme);
        
        if (oldThemeText) {
            oldThemeText.textContent = savedTheme === 'night' ? 'Sombre' : 'Clair';
        }
        
        oldThemeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            oldThemeOptions.classList.toggle('hidden-options');
        });
        
        oldThemeOptions.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = this.getAttribute('data-theme');
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('dreamswear-theme', theme);
                
                if (oldThemeText) {
                    oldThemeText.textContent = theme === 'night' ? 'Sombre' : 'Clair';
                }
                
                oldThemeOptions.classList.add('hidden-options');
            });
        });
        
        document.addEventListener('click', function() {
            oldThemeOptions.classList.add('hidden-options');
        });
    }
}

// ============================================
// MODAL D'ABONNEMENT (PAGE PRINCIPALE)
// ============================================
function initSubscriptionModal() {
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    
    if (subscribeLink && modal) {
        console.log('✅ Initialisation modal abonnement');
        
        subscribeLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('hidden-modal');
        });
        
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.add('hidden-modal');
            });
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden-modal');
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
        
        // Gestion des onglets dans le modal
        const tabLinks = modal.querySelectorAll('.tab-link');
        tabLinks.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.getAttribute('data-tab');
                const target = document.getElementById(targetId);
                
                tabLinks.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                target.classList.add('active');
            });
        });
    }
}

// ============================================
// FORMULAIRES D'INSCRIPTION (PAGE PRINCIPALE)
// ============================================
function initForms() {
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
                const { data, error } = await supabaseClient
                    .from('Abonnés')
                    .insert([{
                        nom: nom,
                        prenom: prenom,
                        email: email,
                        telephone: telephone
                    }]);
                
                if (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                    return;
                }
                
                console.log('✅ Inscription réussie!', data);
                alert('Inscription réussie ! Vous recevrez nos actualités par email.');
                
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.classList.add('hidden-modal');
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
                const { data, error } = await supabaseClient
                    .from('créateurs')
                    .insert([{
                        nom: nom,
                        prenom: prenom,
                        nom_marque: marque,
                        domaine: domaine,
                        email: email,
                        telephone: telephone,
                        mot_de_passe: password,
                        statut: 'pending'
                    }]);
                
                if (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                    return;
                }
                
                console.log('✅ Inscription créateur réussie!', data);
                alert('Inscription réussie ! Votre compte sera activé après validation.');
                
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.classList.add('hidden-modal');
                creatorRegisterForm.reset();
                
            } catch (error) {
                console.error('💥 Erreur d\'inscription:', error);
                alert('Une erreur est survenue lors de l\'inscription.');
            }
        });
    }
}

// ============================================
// MODAL D'AUTHENTIFICATION
// ============================================
function initAuthModal() {
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    
    if (authBtn && authModal) {
        console.log('✅ Initialisation modal auth');
        
        authBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        const closeAuthBtn = authModal.querySelector('.close-auth-modal');
        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', function() {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && authModal.classList.contains('active')) {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Gestion des onglets d'authentification
        const authTabs = authModal.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const authType = this.getAttribute('data-auth-type');
                
                authTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                
                if (authType === 'admin') {
                    const adminForm = document.getElementById('admin-form');
                    if (adminForm) adminForm.classList.add('active');
                } else {
                    const creatorForm = document.getElementById('creator-form');
                    if (creatorForm) creatorForm.classList.add('active');
                }
            });
        });
        
        // Connexion administrateur
        const adminForm = document.getElementById('admin-form');
        const adminError = document.getElementById('admin-error');
        
        if (adminForm) {
            adminForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nom = document.getElementById('admin-nom').value.trim();
                const password = document.getElementById('admin-password').value;
                
                console.log('🔐 Tentative connexion admin:', nom);
                
                try {
                    const { data, error } = await supabaseClient
                        .from('administrateurs')
                        .select('*')
                        .eq('nom', nom)
                        .eq('mot_de_passe', password)
                        .single();
                    
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
                    
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('adminId', data.id);
                    sessionStorage.setItem('adminName', data.nom);
                    sessionStorage.setItem('adminEmail', data.email);
                    
                    window.location.href = 'Actualisation.html';
                    
                } catch (error) {
                    console.error('💥 Erreur de connexion:', error);
                    if (adminError) {
                        adminError.textContent = 'Une erreur est survenue lors de la connexion';
                        adminError.style.display = 'block';
                    }
                }
            });
        }
        
        // Connexion créateur
        const creatorForm = document.getElementById('creator-form');
        const creatorError = document.getElementById('creator-error');
        
        if (creatorForm) {
            creatorForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const brand = document.getElementById('creator-brand').value.trim();
                const password = document.getElementById('creator-password').value;
                
                console.log('🎨 Tentative connexion créateur:', brand);
                
                try {
                    const { data, error } = await supabaseClient
                        .from('créateurs')
                        .select('*')
                        .eq('nom_marque', brand)
                        .eq('mot_de_passe', password)
                        .eq('statut', 'actif')
                        .single();
                    
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
                    
                    sessionStorage.setItem('creatorLoggedIn', 'true');
                    sessionStorage.setItem('creatorId', data.id);
                    sessionStorage.setItem('creatorBrand', data.nom_marque);
                    
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
    }
}

// ============================================
// FONCTIONNALITÉS ADMIN
// ============================================
function initAdminFeatures() {
    const pendingCreatorsDiv = document.getElementById('pendingCreators');
    const approvedCreatorsDiv = document.getElementById('approvedCreators');
    
    if (pendingCreatorsDiv && approvedCreatorsDiv) {
        console.log('🔄 Page admin détectée');
        
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        loadAllCreators();
        
        async function loadAllCreators() {
            console.log('🔄 Chargement créateurs...');
            
            pendingCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            approvedCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            
            try {
                const { data: pendingData, error: pendingError } = await supabaseClient
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'pending')
                    .order('created_at', { ascending: false });
                
                if (pendingError) {
                    console.error('❌ Erreur pending:', pendingError);
                    pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${pendingError.message}</div>`;
                } else if (!pendingData || pendingData.length === 0) {
                    pendingCreatorsDiv.innerHTML = '<div class="empty-message">Aucune demande en attente</div>';
                } else {
                    displayCreators(pendingData, pendingCreatorsDiv, 'pending');
                    document.getElementById('pendingCount').textContent = pendingData.length;
                }
                
                const { data: approvedData, error: approvedError } = await supabaseClient
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'actif')
                    .order('created_at', { ascending: false });
                
                if (approvedError) {
                    console.error('❌ Erreur approved:', approvedError);
                    approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${approvedError.message}</div>`;
                } else if (!approvedData || approvedData.length === 0) {
                    approvedCreatorsDiv.innerHTML = '<div class="empty-message">Aucun créateur approuvé</div>';
                } else {
                    displayCreators(approvedData, approvedCreatorsDiv, 'approved');
                    document.getElementById('approvedCount').textContent = approvedData.length;
                }
                
            } catch (error) {
                console.error('💥 Erreur générale:', error);
                pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
                approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
            }
        }
        
        function displayCreators(creators, container, status) {
            let html = '';
            
            creators.forEach(creator => {
                const date = creator.created_at 
                    ? new Date(creator.created_at).toLocaleDateString('fr-FR')
                    : 'Date inconnue';
                
                html += `
                    <div class="creator-card">
                        <h3>${creator.nom_marque || 'Sans nom'}</h3>
                        <p><strong>Contact :</strong> ${creator.prenom || ''} ${creator.nom || ''}</p>
                        <p><strong>Email :</strong> ${creator.email || 'Non fourni'}</p>
                        <p><strong>Téléphone :</strong> ${creator.telephone || 'Non fourni'}</p>
                        <p><strong>Domaine :</strong> ${creator.domaine || 'Non spécifié'}</p>
                        <p><strong>Date :</strong> ${date}</p>
                        <p><strong>Statut :</strong> ${creator.statut}</p>
                `;
                
                if (status === 'pending') {
                    html += `
                        <div class="card-actions">
                            <button class="action-btn approve-btn" onclick="approveCreator(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                                Approuver
                            </button>
                            <button class="action-btn reject-btn" onclick="rejectCreator(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                                Refuser
                            </button>
                        </div>
                    `;
                }
                
                html += `</div>`;
            });
            
            container.innerHTML = html;
        }
        
        window.approveCreator = async function(id, brandName) {
            if (!confirm(`Approuver "${brandName}" ?`)) return;
            
            try {
                const { error } = await supabaseClient
                    .from('créateurs')
                    .update({ 
                        statut: 'actif',
                        approved_at: new Date().toISOString()
                    })
                    .eq('id', id);
                
                if (error) throw error;
                
                alert(`"${brandName}" approuvé`);
                loadAllCreators();
                
            } catch (error) {
                alert('Erreur : ' + error.message);
            }
        };
        
        window.rejectCreator = async function(id, brandName) {
            if (!confirm(`Refuser "${brandName}" ?`)) return;
            
            try {
                const { error } = await supabaseClient
                    .from('créateurs')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert(`"${brandName}" refusé`);
                loadAllCreators();
                
            } catch (error) {
                alert('Erreur : ' + error.message);
            }
        };
    }
}

// ============================================
// 4. CHARGEMENT AUTOMATIQUE DES PAGES
// ============================================
function autoLoadPageContent() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '').toLowerCase();
    
    console.log(`📄 Page détectée: ${page}`);
    
    // Si on est sur article.html
    if (page === 'article' || document.getElementById('article-content')) {
        loadSingleArticle();
        return;
    }
    
    // Si on est sur la page principale (index.html)
    if (page === 'index' || page === 'index2' || page === '' || document.querySelector('.hero')) {
        console.log('🏠 Page principale détectée');
        return;
    }
    
    // DÉTECTION AUTOMATIQUE PAR CONTENEUR
    const containerMap = {
        // VOS CONTENEURS EXACTS
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
        'articlesContainer': 'mode',
        'articles-list': 'coulisses',
        'trends-container': 'tendances',
        'discoveries-container': 'decouvertes',
        'events-container': 'culture'
    };
    
    // Chercher quel conteneur est présent sur la page
    for (const [containerId, rubrique] of Object.entries(containerMap)) {
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`🎯 Conteneur trouvé: ${containerId} -> ${rubrique}`);
            loadArticlesByRubrique(rubrique, containerId);
            return;
        }
    }
    
    // Si aucun conteneur trouvé, essayer par nom de page
    const pageToRubrique = {
        'accessoires': ['accessoires-container', 'accessoires'],
        'beaute': ['beaute-container', 'beaute'],
        'mode': ['mode-container', 'mode'],
        'coulisses': ['coulisses-container', 'coulisses'],
        'tendances': ['tendances-container', 'tendances'],
        'decouvertes': ['decouvertes-container', 'decouvertes'],
        'culture': ['culture-container', 'culture'],
        'visages': ['visages-container', 'visages']
    };
    
    for (const [pageName, [containerId, rubrique]] of Object.entries(pageToRubrique)) {
        if (page.includes(pageName)) {
            loadArticlesByRubrique(rubrique, containerId);
            return;
        }
    }
    
    console.log('ℹ️ Aucun conteneur spécifique détecté');
}

// ============================================
// FONCTION PRINCIPALE DE CHARGEMENT DES ARTICLES
// ============================================
async function loadArticlesByRubrique(rubrique, containerId) {
    console.log(`🔄 Chargement: ${rubrique} dans ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Conteneur ${containerId} non trouvé`);
        return;
    }
    
    // Afficher message de chargement
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin"></i> Chargement des ${rubrique}...
        </div>
    `;
    
    try {
        // Requête Supabase
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .eq('rubrique', rubrique)
            .order('date_publication', { ascending: false });
        
        if (error) throw error;
        
        const articles = data || [];
        
        // Filtrer les articles publiés
        const publishedArticles = articles.filter(article => 
            article.statut === 'publié' || article.statut === 'published' || !article.statut
        );
        
        if (publishedArticles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                    <p>Aucun ${rubrique} publié pour le moment.</p>
                    <p><small>Utilisez Actualisation.html pour publier du contenu</small></p>
                </div>
            `;
            return;
        }
        
        console.log(`✅ ${publishedArticles.length} ${rubrique} chargés`);
        
        // Générer le HTML
        container.innerHTML = generateArticlesHTML(publishedArticles, rubrique);
        
    } catch (error) {
        console.error(`❌ Erreur ${rubrique}:`, error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                <p>Erreur de chargement: ${error.message}</p>
                <p><small>Vérifiez votre connexion et les permissions Supabase</small></p>
            </div>
        `;
    }
}

// ============================================
// GÉNÉRATION HTML POUR LES ARTICLES
// ============================================
function generateArticlesHTML(articles, rubrique) {
    return articles.map(article => {
        // Données de l'article
        const id = article.id;
        const titre = article.titre_fr || article.titre || article.nom_marque || 'Sans titre';
        const contenu = article.contenu_fr || article.description || article.biographie_fr || '';
        const image = article.image_url || article.photo_url || getDefaultImage(rubrique);
        const date = formatDate(article.date_publication || article.created_at);
        const auteur = article.auteur || article.nom_createur || 'Rédaction';
        const type = getArticleType(article, rubrique);
        
        // Limiter l'extrait
        const excerpt = contenu.length > 120 ? contenu.substring(0, 120) + '...' : contenu;
        
        return `
            <div class="article-card">
                <img src="${image}" 
                     alt="${titre}" 
                     class="article-image"
                     onerror="this.src='${getDefaultImage(rubrique)}'">
                
                <div class="article-content">
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${date}</span>
                        <span class="article-category">${type}</span>
                    </div>
                    
                    <h3 class="article-title">${titre}</h3>
                    
                    <p class="article-excerpt">${excerpt}</p>
                    
                    <div class="article-author">
                        <i class="fas fa-user"></i> ${auteur}
                    </div>
                    
                    <a href="article.html?id=${id}" class="article-read-more">
                        Lire la suite <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function getDefaultImage(rubrique) {
    const images = {
        'actualites': 'https://placehold.co/400x250?text=ACTUALITE',
        'visages': 'https://placehold.co/400x250?text=CREATEUR',
        'tendances': 'https://placehold.co/400x250?text=TENDANCE',
        'accessoires': 'https://placehold.co/400x250?text=ACCESSOIRE',
        'beaute': 'https://placehold.co/400x250?text=BEAUTE',
        'coulisses': 'https://placehold.co/400x250?text=COULISSES',
        'culture': 'https://placehold.co/400x250?text=CULTURE',
        'decouvertes': 'https://placehold.co/400x250?text=DECOUVERTE',
        'mode': 'https://placehold.co/400x250?text=MODE'
    };
    return images[rubrique] || 'https://placehold.co/400x250?text=ARTICLE';
}

function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return 'Date inconnue';
    }
}

function getArticleType(article, rubrique) {
    // Types spécifiques selon la rubrique
    if (article.type_accessoire) return article.type_accessoire;
    if (article.type_beaute) return article.type_beaute;
    if (article.type_decouverte) return article.type_decouverte;
    if (article.type_evenement) return article.type_evenement;
    if (article.theme_mode) return article.theme_mode;
    if (article.saison) return article.saison;
    if (article.domaine) return article.domaine;
    if (article.categorie_actualite) return article.categorie_actualite;
    
    // Par défaut, nom de la rubrique
    const rubriqueNames = {
        'actualites': 'Actualité',
        'visages': 'Créateur',
        'tendances': 'Tendance',
        'accessoires': 'Accessoire',
        'beaute': 'Beauté',
        'coulisses': 'Coulisses',
        'culture': 'Événement',
        'decouvertes': 'Découverte',
        'mode': 'Mode'
    };
    
    return rubriqueNames[rubrique] || rubrique;
}

// ============================================
// CHARGEMENT ARTICLE UNIQUE
// ============================================
async function loadSingleArticle() {
    const container = document.getElementById('article-content') || 
                     document.getElementById('article-container');
    
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        container.innerHTML = '<p>Article non spécifié.</p>';
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single();
        
        if (error) throw error;
        
        // Afficher l'article
        container.innerHTML = `
            <div class="article-header">
                ${data.image_url ? `<img src="${data.image_url}" alt="${data.titre_fr}">` : ''}
                <h1>${data.titre_fr}</h1>
                <div class="article-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(data.date_publication)}</span>
                    <span><i class="fas fa-user"></i> ${data.auteur || 'Rédaction'}</span>
                    <span><i class="fas fa-tag"></i> ${data.rubrique || 'Article'}</span>
                </div>
            </div>
            <div class="article-content">
                ${data.contenu_fr || '<p>Contenu non disponible.</p>'}
            </div>
            <a href="javascript:history.back()" class="back-button">← Retour</a>
        `;
        
    } catch (error) {
        console.error('Erreur article:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <p style="color: #dc3545;">Erreur de chargement de l'article</p>
                <a href="javascript:history.back()" style="color: var(--accent);">← Retour</a>
            </div>
        `;
    }
}

// ============================================
// FONCTIONS GLOBALES POUR COMPATIBILITÉ
// ============================================
window.loadArticlesByRubrique = loadArticlesByRubrique;
window.loadSingleArticle = loadSingleArticle;

// Anciennes fonctions (pour compatibilité)
window.loadVisages = () => loadArticlesByRubrique('visages', 'visages-container');
window.loadTrends = () => loadArticlesByRubrique('tendances', 'tendances-container');
window.loadDiscoveries = () => loadArticlesByRubrique('decouvertes', 'decouvertes-container');
window.loadEvents = () => loadArticlesByRubrique('culture', 'culture-container');
window.loadCoulissesArticles = () => loadArticlesByRubrique('coulisses', 'coulisses-container');
window.loadActualites = () => loadArticlesByRubrique('actualites', 'actualites-container');
window.loadMode = () => loadArticlesByRubrique('mode', 'mode-container');
window.loadBeaute = () => loadArticlesByRubrique('beaute', 'beaute-container');
window.loadAccessoires = () => loadArticlesByRubrique('accessoires', 'accessoires-container');

window.setupCategoryFilters = function() {
    console.log('Filtres initialisés');
};

console.log('✅ script.js COMPLET chargé avec tous les conteneurs');
