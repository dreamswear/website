// ============================================
// SCRIPT PRINCIPAL - DREAMSWEAR MAG
// ============================================

let supabaseClient = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation DREAMSWEAR MAG');
    
    // 1. Initialiser Supabase
    initSupabase();
    
    // 2. Initialiser tous les composants
    initAllComponents();
    
    // 3. Charger les données selon la page
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
// 2. INITIALISER LES COMPOSANTS
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
}

// ============================================
// MENU DÉROULANT PRINCIPAL (FIX)
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
            console.log('Menu cliqué, état:', dropdownMenu.classList.contains('active'));
        });
        
        // Fermer en cliquant ailleurs
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
}

// ============================================
// SÉLECTEUR DE THÈME (FIX)
// ============================================
function initThemeSelector() {
    // Pour les pages simples (accessoires.html, beaute.html, etc.)
    const simpleThemeBtn = document.getElementById('themeButton');
    const simpleThemeOptions = document.getElementById('themeOptions');
    const themeText = document.getElementById('themeText');
    
    if (simpleThemeBtn && simpleThemeOptions) {
        console.log('✅ Initialisation thème simple');
        
        // Appliquer le thème sauvegardé
        const savedTheme = localStorage.getItem('dreamswear-theme') || 'day';
        document.body.setAttribute('data-theme', savedTheme);
        if (themeText) {
            themeText.textContent = savedTheme === 'night' ? 'Sombre' : 'Clair';
        }
        
        // Gestion du clic
        simpleThemeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            simpleThemeOptions.classList.toggle('show');
        });
        
        // Gestion des options
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
        
        // Fermer en cliquant ailleurs
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
// MODAL D'ABONNEMENT
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
        
        // Gestion des onglets dans le modal
        const tabLinks = modal.querySelectorAll('.tab-link');
        tabLinks.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.getAttribute('data-tab');
                const target = document.getElementById(targetId);
                
                tabLinks.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                target.classList.add('active');
            });
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
    }
}

// ============================================
// 3. CHARGEMENT AUTOMATIQUE DES PAGES
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
    
    // Mapping des pages vers leurs conteneurs
    const pageMap = {
        'accessoires': ['accessoires-container', 'accessoires'],
        'beaute': ['beaute-container', 'beaute'],
        'mode': ['articlesContainer', 'mode'],
        'coulisses': ['articles-list', 'coulisses'],
        'tendances': ['trends-container', 'tendances'],
        'decouvertes': ['discoveries-container', 'decouvertes'],
        'découvertes': ['discoveries-container', 'decouvertes'],
        'culture': ['events-container', 'culture'],
        'visages': ['visages-container', 'visages']
    };
    
    // Chercher quelle page on est
    for (const [pageName, [containerId, rubrique]] of Object.entries(pageMap)) {
        if (page.includes(pageName) || document.getElementById(containerId)) {
            loadArticlesByRubrique(rubrique, containerId);
            return;
        }
    }
}

// ============================================
// FONCTION PRINCIPALE DE CHARGEMENT
// ============================================
async function loadArticlesByRubrique(rubrique, containerId) {
    console.log(`🔄 Chargement: ${rubrique} dans ${containerId}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Conteneur ${containerId} non trouvé`);
        return;
    }
    
    // Afficher chargement
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin"></i> Chargement...
        </div>
    `;
    
    try {
        // Requête unique compatible avec Actualisation.html
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .eq('rubrique', rubrique)
            .order('date_publication', { ascending: false });
        
        if (error) throw error;
        
        const articles = data || [];
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                    <p>Aucun contenu ${rubrique} pour le moment.</p>
                </div>
            `;
            return;
        }
        
        // Générer le HTML
        container.innerHTML = articles.map(article => {
            const image = article.image_url || `https://placehold.co/400x250?text=${rubrique.toUpperCase()}`;
            const date = article.date_publication ? 
                new Date(article.date_publication).toLocaleDateString('fr-FR') : 
                'Date inconnue';
            
            return `
                <div class="article-card">
                    <img src="${image}" alt="${article.titre_fr}" class="article-image"
                         onerror="this.src='https://placehold.co/400x250?text=${rubrique.toUpperCase()}'">
                    <div class="article-content">
                        <div class="article-meta">
                            <span>${date}</span>
                            <span class="article-category">${rubrique}</span>
                        </div>
                        <h3 class="article-title">${article.titre_fr}</h3>
                        <p class="article-excerpt">
                            ${(article.contenu_fr || '').substring(0, 120)}...
                        </p>
                        <a href="article.html?id=${article.id}" class="article-read-more">
                            Lire la suite →
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error(`❌ Erreur ${rubrique}:`, error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                <p>Erreur: ${error.message}</p>
            </div>
        `;
    }
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
        // Essayer la table articles d'abord
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single();
        
        if (error) throw error;
        
        container.innerHTML = `
            <div class="article-header">
                ${data.image_url ? `<img src="${data.image_url}" alt="${data.titre_fr}">` : ''}
                <h1>${data.titre_fr}</h1>
                <div class="article-meta">
                    <span>${new Date(data.date_publication).toLocaleDateString('fr-FR')}</span>
                    <span>${data.auteur || 'Rédaction'}</span>
                </div>
            </div>
            <div class="article-content">
                ${data.contenu_fr || '<p>Contenu non disponible.</p>'}
            </div>
            <a href="javascript:history.back()" class="back-button">← Retour</a>
        `;
        
    } catch (error) {
        console.error('Erreur article:', error);
        container.innerHTML = '<p>Article non trouvé.</p>';
    }
}

// ============================================
// FONCTIONS GLOBALES POUR COMPATIBILITÉ
// ============================================
window.loadArticlesByRubrique = loadArticlesByRubrique;
window.loadSingleArticle = loadSingleArticle;

// Anciennes fonctions (pour les pages existantes)
window.loadVisages = () => loadArticlesByRubrique('visages', 'visages-container');
window.loadTrends = () => loadArticlesByRubrique('tendances', 'trends-container');
window.loadDiscoveries = () => loadArticlesByRubrique('decouvertes', 'discoveries-container');
window.loadEvents = () => loadArticlesByRubrique('culture', 'events-container');
window.loadCoulissesArticles = () => loadArticlesByRubrique('coulisses', 'articles-list');

console.log('✅ script.js chargé');
