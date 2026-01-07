// ============================================
// CODE PRINCIPAL - CENTRALISÉ ET CORRIGÉ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script principal démarré');
    
    // ============================================
    // INITIALISATION SUPABASE - VERSION CORRIGÉE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    // Initialisation sûre de Supabase
    let supabase;
    
    try {
        // Vérifier si la bibliothèque Supabase est chargée
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            // Si supabase n'est pas disponible globalement, on le charge
            console.error('❌ Supabase non chargé. Vérifiez que le script est inclus avant celui-ci.');
            
            // Créer un objet fallback pour éviter les crashs
            supabase = {
                from: () => ({
                    select: () => ({ 
                        eq: () => ({ 
                            order: () => ({ 
                                single: () => Promise.resolve({ data: null, error: new Error('Supabase non initialisé') })
                            })
                        })
                    }),
                    insert: () => Promise.resolve({ error: new Error('Supabase non initialisé') }),
                    update: () => Promise.resolve({ error: new Error('Supabase non initialisé') }),
                    delete: () => Promise.resolve({ error: new Error('Supabase non initialisé') })
                })
            };
            
            // Afficher un message d'erreur clair
            setTimeout(() => {
                if (window.location.pathname.includes('admin.html') || 
                    window.location.pathname.includes('actualisation.html')) {
                    alert('❌ ERREUR: Supabase non chargé. Le site ne peut pas fonctionner correctement.\n\nVérifiez que le script Supabase est inclus dans le HTML avant script.js');
                }
            }, 1000);
        } else {
            // Initialiser normalement
            supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase initialisé avec succès');
            
            // Stocker pour une utilisation globale
            window.supabaseClient = supabase;
        }
    } catch (error) {
        console.error('💥 Erreur d\'initialisation Supabase:', error);
        supabase = createFallbackSupabase();
    }

    // Fonction fallback
    function createFallbackSupabase() {
        return {
            from: () => ({
                select: () => ({ 
                    eq: () => ({ 
                        order: () => ({ 
                            single: () => Promise.resolve({ data: null, error: new Error('Supabase non initialisé') })
                        })
                    })
                }),
                insert: () => Promise.resolve({ error: new Error('Supabase non initialisé') }),
                update: () => Promise.resolve({ error: new Error('Supabase non initialisé') }),
                delete: () => Promise.resolve({ error: new Error('Supabase non initialisé') })
            })
        };
    }

    // ============================================
    // TEST DE CONNEXION SUPABASE
    // ============================================
    async function testSupabaseConnection() {
        console.log('🔍 Test de connexion Supabase...');
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('id')
                .limit(1);
            
            if (error) {
                console.error('❌ Erreur connexion Supabase:', error);
                return false;
            }
            
            console.log('✅ Connexion Supabase OK');
            return true;
        } catch (error) {
            console.error('💥 Erreur test connexion:', error);
            return false;
        }
    }

    // ============================================
    // INITIALISATION PRINCIPALE
    // ============================================
    async function initialize() {
        console.log('🔧 Initialisation en cours...');
        
        // Tester la connexion
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
            console.warn('⚠️ Connexion Supabase limitée, certaines fonctionnalités peuvent être désactivées');
        }
        
        // Détecter la page et charger le contenu approprié
        detectAndLoadPage();
        
        // Initialiser les fonctionnalités communes
        initCommonFeatures();
        
        console.log('✅ Initialisation terminée');
    }

    function detectAndLoadPage() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().toLowerCase();
        
        console.log(`📄 Page détectée: ${pageName}`);
        
        // Pages d'administration
        if (pageName === 'admin.html') {
            console.log('👑 Page admin détectée');
            checkAdminAuth();
            return;
        }
        
        if (pageName === 'actualisation.html') {
            console.log('📝 Page actualisation détectée');
            checkAdminAuth();
            return;
        }
        
        // Page d'article unique
        if (pageName === 'article.html' || document.getElementById('article-content')) {
            console.log('📰 Page article détectée');
            loadSingleArticle();
            return;
        }
        
        // Pages de contenu
        loadPageContent();
    }

    // ============================================
    // PAGES DE CONTENU (Rubriques)
    // ============================================
    function loadPageContent() {
        // Mapping des conteneurs
        const containers = [
            { id: 'actualites-container', rubrique: 'actualites', render: renderArticles },
            { id: 'visages-container', rubrique: 'visages', render: renderArticles },
            { id: 'coulisses-container', rubrique: 'coulisses', render: renderArticles },
            { id: 'tendances-container', rubrique: 'tendances', render: renderArticles },
            { id: 'decouvertes-container', rubrique: 'decouvertes', render: renderArticles },
            { id: 'culture-container', rubrique: 'culture', render: renderArticles },
            { id: 'mode-container', rubrique: 'mode', render: renderArticles },
            { id: 'accessoires-container', rubrique: 'accessoires', render: renderArticles },
            { id: 'beaute-container', rubrique: 'beaute', render: renderArticles },
            { id: 'articles-list', rubrique: 'coulisses', render: renderArticles },
            { id: 'trends-container', rubrique: 'tendances', render: renderArticles },
            { id: 'discoveries-container', rubrique: 'decouvertes', render: renderArticles },
            { id: 'events-container', rubrique: 'culture', render: renderArticles }
        ];
        
        // Trouver le premier conteneur présent
        for (const container of containers) {
            const element = document.getElementById(container.id);
            if (element) {
                console.log(`✅ Chargement ${container.rubrique} dans ${container.id}`);
                loadArticles(container.rubrique, container.id);
                return;
            }
        }
        
        console.log('ℹ️ Aucun conteneur de contenu trouvé');
    }

    async function loadArticles(rubrique, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Conteneur ${containerId} non trouvé`);
            return;
        }
        
        console.log(`🔄 Chargement articles: ${rubrique}`);
        
        // Message de chargement
        container.innerHTML = '<div class="loading">Chargement en cours...</div>';
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', rubrique)
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-message">Aucun contenu disponible pour ${getRubriqueName(rubrique)}</div>`;
                return;
            }
            
            console.log(`✅ ${data.length} articles chargés pour ${rubrique}`);
            renderArticles(data, container, rubrique);
            
        } catch (error) {
            console.error(`❌ Erreur chargement ${rubrique}:`, error);
            container.innerHTML = `
                <div class="error-message">
                    <h3>Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <small>Vérifiez votre connexion internet</small>
                </div>
            `;
        }
    }

    function renderArticles(articles, container, rubrique) {
        if (!articles || articles.length === 0) {
            container.innerHTML = '<div class="empty-message">Aucun contenu disponible</div>';
            return;
        }
        
        let html = '';
        
        articles.forEach(article => {
            const safeTitle = escapeHtml(article.titre_fr || 'Sans titre');
            const safeContent = escapeHtml(article.contenu_fr || '');
            const safeAuthor = escapeHtml(article.auteur || 'Rédaction');
            const date = article.date_publication ? new Date(article.date_publication).toLocaleDateString('fr-FR') : 'Date inconnue';
            
            html += `
                <article class="article-card">
                    ${article.image_url ? `
                    <div class="article-image">
                        <img src="${article.image_url}" alt="${safeTitle}" 
                             onerror="this.src='https://placehold.co/600x400?text=${rubrique.toUpperCase()}'">
                    </div>` : ''}
                    
                    <div class="article-content">
                        <div class="article-meta">
                            <span class="article-date">📅 ${date}</span>
                            <span class="article-author">👤 ${safeAuthor}</span>
                        </div>
                        
                        <h3 class="article-title">${safeTitle}</h3>
                        
                        <div class="article-excerpt">
                            ${truncateText(safeContent, 150)}
                        </div>
                        
                        <a href="article.html?id=${article.id}" class="read-more">
                            Lire la suite →
                        </a>
                    </div>
                </article>
            `;
        });
        
        container.innerHTML = html;
    }

    // ============================================
    // ARTICLE INDIVIDUEL
    // ============================================
    async function loadSingleArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            console.log('ℹ️ Aucun ID article dans l\'URL');
            return;
        }
        
        console.log(`📰 Chargement article: ${articleId}`);
        
        const container = document.getElementById('article-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading">Chargement de l\'article...</div>';
        
        try {
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (article.statut !== 'publié') {
                throw new Error('Cet article n\'est pas encore publié');
            }
            
            renderSingleArticle(article);
            
        } catch (error) {
            console.error('❌ Erreur chargement article:', error);
            container.innerHTML = `
                <div class="error-message">
                    <h2>Article non disponible</h2>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
        }
    }

    function renderSingleArticle(article) {
        const container = document.getElementById('article-content');
        if (!container) return;
        
        const safeTitle = escapeHtml(article.titre_fr || 'Sans titre');
        const safeContent = escapeHtml(article.contenu_fr || '');
        const safeAuthor = escapeHtml(article.auteur || 'Rédaction');
        const date = article.date_publication ? new Date(article.date_publication).toLocaleDateString('fr-FR') : 'Date inconnue';
        const rubriqueName = getRubriqueName(article.rubrique);
        
        container.innerHTML = `
            <article class="full-article">
                <header class="article-header">
                    <h1 class="article-title">${safeTitle}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${date}</span>
                            <span class="article-author">👤 ${safeAuthor}</span>
                        </div>
                        <div class="meta-right">
                            <span class="article-category">${rubriqueName}</span>
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image">
                        <img src="${article.image_url}" alt="${safeTitle}" 
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content">
                        ${formatContent(safeContent)}
                    </div>
                </div>
                
                <footer class="article-footer">
                    <a href="${article.rubrique}.html" class="back-to-category">
                        ← Retour à ${rubriqueName}
                    </a>
                </footer>
            </article>
        `;
    }

    // ============================================
    // ADMINISTRATION
    // ============================================
    function checkAdminAuth() {
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès administrateur requis. Veuillez vous connecter.');
            window.location.href = 'index.html';
            return false;
        }
        
        console.log('✅ Admin authentifié');
        
        if (window.location.pathname.includes('admin.html')) {
            initAdminPage();
        } else if (window.location.pathname.includes('actualisation.html')) {
            initActualisationPage();
        }
        
        return true;
    }

    async function initAdminPage() {
        console.log('👑 Initialisation page admin...');
        
        await loadAdminCreators();
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Déconnexion ?')) {
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
        
        console.log('✅ Page admin initialisée');
    }

    async function loadAdminCreators() {
        console.log('📡 Chargement des créateurs...');
        
        try {
            // Créateurs en attente
            const { data: pending, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) throw pendingError;
            
            updateCreatorList(pending, 'pendingCreators', 'pending');
            updateCounter('pendingCount', pending?.length || 0);
            
            // Créateurs approuvés
            const { data: approved, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) throw approvedError;
            
            updateCreatorList(approved, 'approvedCreators', 'approved');
            updateCounter('approvedCount', approved?.length || 0);
            
        } catch (error) {
            console.error('❌ Erreur chargement créateurs:', error);
            showError('pendingCreators', error.message);
            showError('approvedCreators', error.message);
        }
    }

    function updateCreatorList(creators, containerId, status) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente' 
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div class="empty-message">${message}</div>`;
            return;
        }
        
        let html = '';
        
        creators.forEach(creator => {
            const safeBrand = escapeHtml(creator.nom_marque || 'Sans nom');
            const safeName = escapeHtml(`${creator.prenom || ''} ${creator.nom || ''}`.trim() || 'Non spécifié');
            const safeEmail = escapeHtml(creator.email || 'Non fourni');
            const safePhone = escapeHtml(creator.telephone || 'Non fourni');
            const safeDomain = escapeHtml(creator.domaine || 'Non spécifié');
            
            html += `
                <div class="creator-card">
                    <h3>${safeBrand}</h3>
                    <p><strong>Contact:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Téléphone:</strong> ${safePhone}</p>
                    <p><strong>Domaine:</strong> ${safeDomain}</p>
                    <p><strong>Statut:</strong> ${creator.statut}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button onclick="adminApproveCreator(${creator.id}, '${safeBrand.replace(/'/g, "\\'")}')" 
                                class="btn-approve">✅ Approuver</button>
                        <button onclick="adminRejectCreator(${creator.id}, '${safeBrand.replace(/'/g, "\\'")}')" 
                                class="btn-reject">❌ Refuser</button>
                    </div>
                `;
            }
            
            html += '</div>';
        });
        
        container.innerHTML = html;
    }

    // Fonctions globales pour l'admin
    window.adminApproveCreator = async function(id, brandName) {
        if (!confirm(`Approuver le créateur "${brandName}" ?`)) return;
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`✅ "${brandName}" a été approuvé !`);
            loadAdminCreators();
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Erreur: ${error.message}`);
        }
    };

    window.adminRejectCreator = async function(id, brandName) {
        if (!confirm(`Refuser le créateur "${brandName}" ?`)) return;
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`❌ "${brandName}" a été refusé.`);
            loadAdminCreators();
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Erreur: ${error.message}`);
        }
    };

    function initActualisationPage() {
        console.log('📝 Initialisation page actualisation...');
        
        // Onglets
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Désactiver tous les onglets
                document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activer l'onglet cliqué
                this.classList.add('active');
                document.getElementById(`${tabId}-tab`)?.classList.add('active');
            });
        });
        
        console.log('✅ Page actualisation initialisée');
    }

    // ============================================
    // AUTHENTIFICATION
    // ============================================
    function initAuth() {
        const authBtn = document.getElementById('auth-btn');
        const authModal = document.getElementById('auth-modal');
        
        if (!authBtn || !authModal) return;
        
        // Ouvrir modal
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.add('active');
        });
        
        // Fermer modal
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal || e.target.classList.contains('close-auth-modal')) {
                authModal.classList.remove('active');
                resetAuthForms();
            }
        });
        
        // Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('active')) {
                authModal.classList.remove('active');
                resetAuthForms();
            }
        });
        
        // Onglets auth
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const authType = this.dataset.authType;
                
                // Onglets
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Formulaires
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                
                if (authType === 'admin') {
                    document.getElementById('admin-form')?.classList.add('active');
                } else {
                    document.getElementById('creator-form')?.classList.add('active');
                }
            });
        });
        
        // Connexion admin
        const adminForm = document.getElementById('admin-form');
        if (adminForm) {
            adminForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const nom = document.getElementById('admin-nom').value.trim();
                const password = document.getElementById('admin-password').value;
                const errorElement = document.getElementById('admin-error');
                
                try {
                    const { data, error } = await supabase
                        .from('administrateurs')
                        .select('*')
                        .eq('nom', nom)
                        .eq('mot_de_passe', password)
                        .single();
                    
                    if (error) throw error;
                    
                    if (!data) {
                        throw new Error('Identifiants incorrects');
                    }
                    
                    // Connexion réussie
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('adminName', data.nom);
                    
                    authModal.classList.remove('active');
                    adminForm.reset();
                    
                    window.location.href = 'admin.html';
                    
                } catch (error) {
                    console.error('❌ Erreur connexion admin:', error);
                    if (errorElement) {
                        errorElement.textContent = error.message;
                        errorElement.style.display = 'block';
                    }
                }
            });
        }
        
        // Connexion créateur
        const creatorForm = document.getElementById('creator-form');
        if (creatorForm) {
            creatorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const brand = document.getElementById('creator-brand').value.trim();
                const password = document.getElementById('creator-password').value;
                const errorElement = document.getElementById('creator-error');
                
                try {
                    const { data, error } = await supabase
                        .from('créateurs')
                        .select('*')
                        .eq('nom_marque', brand)
                        .eq('mot_de_passe', password)
                        .eq('statut', 'actif')
                        .single();
                    
                    if (error) throw error;
                    
                    if (!data) {
                        throw new Error('Marque ou mot de passe incorrect');
                    }
                    
                    // Connexion réussie
                    sessionStorage.setItem('creatorLoggedIn', 'true');
                    sessionStorage.setItem('creatorBrand', data.nom_marque);
                    
                    authModal.classList.remove('active');
                    creatorForm.reset();
                    
                    window.location.href = 'dashboard-home.html';
                    
                } catch (error) {
                    console.error('❌ Erreur connexion créateur:', error);
                    if (errorElement) {
                        errorElement.textContent = error.message;
                        errorElement.style.display = 'block';
                    }
                }
            });
        }
    }

    function resetAuthForms() {
        const adminForm = document.getElementById('admin-form');
        const creatorForm = document.getElementById('creator-form');
        
        if (adminForm) adminForm.reset();
        if (creatorForm) creatorForm.reset();
        
        // Cacher les erreurs
        const adminError = document.getElementById('admin-error');
        const creatorError = document.getElementById('creator-error');
        
        if (adminError) adminError.style.display = 'none';
        if (creatorError) creatorError.style.display = 'none';
    }

    // ============================================
    // FONCTIONNALITÉS COMMUNES
    // ============================================
    function initCommonFeatures() {
        console.log('🔧 Initialisation fonctionnalités communes...');
        
        // Thème
        initTheme();
        
        // Modal d'abonnement
        initSubscriptionModal();
        
        // Authentification
        initAuth();
        
        // Menu
        initMenu();
        
        // Formulaires
        initForms();
        
        console.log('✅ Fonctionnalités communes initialisées');
    }

    function initTheme() {
        const themeButton = document.getElementById('theme-select-button');
        const themeOptions = document.getElementById('theme-options');
        
        if (!themeButton || !themeOptions) return;
        
        // Définir le thème
        const setTheme = (theme) => {
            if (theme === 'day') {
                document.body.classList.add('day-mode');
                localStorage.setItem('theme', 'day');
            } else {
                document.body.classList.remove('day-mode');
                localStorage.setItem('theme', 'night');
            }
        };
        
        // Bouton thème
        themeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeOptions.classList.toggle('hidden-options');
        });
        
        // Options thème
        themeOptions.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                setTheme(e.target.dataset.theme);
                themeOptions.classList.add('hidden-options');
            }
        });
        
        // Fermer en cliquant ailleurs
        document.addEventListener('click', () => {
            themeOptions.classList.add('hidden-options');
        });
        
        // Charger thème sauvegardé
        const savedTheme = localStorage.getItem('theme') || 'night';
        setTheme(savedTheme);
    }

    function initSubscriptionModal() {
        const subscribeLink = document.getElementById('subscribe-link');
        const modal = document.getElementById('subscribe-modal');
        
        if (!subscribeLink || !modal) return;
        
        subscribeLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden-modal');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
        
        // Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
    }

    function initMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (!menuBtn || !dropdownMenu) return;
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
    }

    function initForms() {
        // Inscription abonné
        const subscriberForm = document.getElementById('subscriber-form-element');
        if (subscriberForm) {
            subscriberForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const nom = document.getElementById('sub-nom').value.trim();
                const prenom = document.getElementById('sub-prenom').value.trim();
                const email = document.getElementById('sub-email').value.trim();
                const telephone = document.getElementById('sub-tel').value.trim();
                
                try {
                    const { error } = await supabase
                        .from('Abonnés')
                        .insert([{ nom, prenom, email, telephone }]);
                    
                    if (error) throw error;
                    
                    alert('✅ Inscription réussie !');
                    subscriberForm.reset();
                    document.getElementById('subscribe-modal').classList.add('hidden-modal');
                    
                } catch (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('❌ Erreur: ' + error.message);
                }
            });
        }
        
        // Inscription créateur
        const creatorRegisterForm = document.getElementById('creator-register-form');
        if (creatorRegisterForm) {
            creatorRegisterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const nom = document.getElementById('cre-nom').value.trim();
                const prenom = document.getElementById('cre-prenom').value.trim();
                const password = document.getElementById('cre-password').value;
                const email = document.getElementById('cre-email').value.trim();
                const telephone = document.getElementById('cre-tel').value.trim();
                const marque = document.getElementById('cre-marque').value.trim();
                const domaine = document.getElementById('cre-domaine').value;
                
                try {
                    const { error } = await supabase
                        .from('créateurs')
                        .insert([{
                            nom, prenom, email, telephone,
                            nom_marque: marque,
                            domaine,
                            mot_de_passe: password,
                            statut: 'pending'
                        }]);
                    
                    if (error) throw error;
                    
                    alert('✅ Inscription envoyée ! Attente de validation.');
                    creatorRegisterForm.reset();
                    document.getElementById('subscribe-modal').classList.add('hidden-modal');
                    
                } catch (error) {
                    console.error('❌ Erreur inscription créateur:', error);
                    alert('❌ Erreur: ' + error.message);
                }
            });
        }
    }

    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncateText(text, maxLength) {
        if (!text) return 'Lire la suite...';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function formatContent(text) {
        if (!text) return '<p>Contenu non disponible.</p>';
        return text.replace(/\n/g, '<br>');
    }

    function getRubriqueName(rubrique) {
        const names = {
            'actualites': 'Actualités',
            'visages': 'Visages',
            'coulisses': 'Coulisses',
            'tendances': 'Tendances',
            'decouvertes': 'Découvertes',
            'culture': 'Culture',
            'mode': 'Mode',
            'accessoires': 'Accessoires',
            'beaute': 'Beauté'
        };
        return names[rubrique] || rubrique;
    }

    function updateCounter(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = count;
    }

    function showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    // ============================================
    // FONCTIONS GLOBALES POUR COMPATIBILITÉ
    // ============================================
    window.loadArticlesByRubrique = loadArticles;
    window.loadSingleArticle = loadSingleArticle;
    window.setupVisageFilters = () => console.log('Filtres visages - à implémenter');
    window.loadCoulissesArticles = () => loadArticles('coulisses', 'articles-list');
    window.loadTrends = () => loadArticles('tendances', 'trends-container');
    window.loadVisages = (filter) => loadArticles('visages', 'visages-container');
    window.loadDiscoveries = () => loadArticles('decouvertes', 'discoveries-container');
    window.loadEvents = () => loadArticles('culture', 'events-container');
    window.initPageData = initialize;

    // ============================================
    // DÉMARRAGE
    // ============================================
    // Démarrer l'initialisation
    setTimeout(initialize, 100);
