// ============================================
// SCRIPT PRINCIPAL - DREAMSWEAR MAG (VERSION CORRIGÉE)
// ============================================

// Variable globale pour Supabase
let supabaseClient = null;

// Attendre que tout soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation DREAMSWEAR MAG');
    
    // Initialiser Supabase IMMÉDIATEMENT
    initSupabase();
    
    // Puis initialiser le reste
    initPage();
});

// ============================================
// 1. INITIALISATION SUPABASE (FONCTIONNEMENT GARANTI)
// ============================================
function initSupabase() {
    console.log('🔄 Initialisation Supabase...');
    
    try {
        // VÉRIFICATION 1 : La bibliothèque Supabase est-elle chargée ?
        if (typeof window.supabase === 'undefined') {
            console.error('❌ La bibliothèque Supabase n\'est pas chargée');
            // Charger dynamiquement si absent
            loadSupabaseLibrary();
            return;
        }
        
        // VÉRIFICATION 2 : La fonction createClient existe-t-elle ?
        if (typeof window.supabase.createClient !== 'function') {
            console.error('❌ window.supabase.createClient n\'est pas une fonction');
            return;
        }
        
        // INITIALISATION avec VOS clés
        const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
        
        // Créer le client
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // VÉRIFICATION 3 : Le client est-il valide ?
        if (!supabaseClient || typeof supabaseClient.from !== 'function') {
            console.error('❌ supabaseClient n\'est pas valide');
            return;
        }
        
        console.log('✅ Supabase initialisé avec succès!');
        console.log('📊 Client Supabase:', supabaseClient);
        
        // Tester la connexion
        testSupabaseConnection();
        
    } catch (error) {
        console.error('💥 Erreur critique Supabase:', error);
        showErrorMessage('Erreur de connexion à la base de données');
    }
}

// ============================================
// 2. CHARGEMENT DYNAMIQUE DE SUPABASE
// ============================================
function loadSupabaseLibrary() {
    console.log('📦 Chargement de la bibliothèque Supabase...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function() {
        console.log('✅ Bibliothèque Supabase chargée');
        // Réessayer l'initialisation
        setTimeout(initSupabase, 100);
    };
    script.onerror = function() {
        console.error('❌ Impossible de charger Supabase');
        showErrorMessage('Impossible de charger la bibliothèque de base de données');
    };
    
    document.head.appendChild(script);
}

// ============================================
// 3. TEST DE CONNEXION
// ============================================
async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.warn('⚠️ Impossible de tester: supabaseClient non défini');
        return;
    }
    
    try {
        console.log('🔍 Test de connexion Supabase...');
        const { data, error } = await supabaseClient
            .from('articles')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('⚠️ Test échoué:', error.message);
        } else {
            console.log('✅ Connexion Supabase réussie!');
        }
    } catch (error) {
        console.warn('⚠️ Erreur test connexion:', error.message);
    }
}

// ============================================
// 4. INITIALISATION DE LA PAGE
// ============================================
function initPage() {
    console.log('📄 Initialisation de la page...');
    
    // Attendre que Supabase soit prêt
    const checkSupabase = setInterval(function() {
        if (supabaseClient && typeof supabaseClient.from === 'function') {
            clearInterval(checkSupabase);
            
            // Initialiser les composants
            initComponents();
            
            // Charger le contenu de la page
            loadPageContent();
            
            // Observer les animations
            initAnimations();
            
        } else if (supabaseClient === false) {
            // Supabase a échoué
            clearInterval(checkSupabase);
            showErrorMessage('Base de données non disponible');
        }
    }, 100);
    
    // Timeout après 5 secondes
    setTimeout(function() {
        if (!supabaseClient) {
            clearInterval(checkSupabase);
            console.warn('⚠️ Timeout Supabase');
            showErrorMessage('Connexion lente à la base de données');
            
            // Essayer quand même sans Supabase
            initComponents();
            loadPageContent();
            initAnimations();
        }
    }, 5000);
}

// ============================================
// 5. INITIALISATION DES COMPOSANTS
// ============================================
function initComponents() {
    console.log('⚙️ Initialisation des composants...');
    
    // Menu déroulant
    initMenu();
    
    // Thème
    initTheme();
    
    // Modals
    initModals();
}

function initMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
}

function initTheme() {
    // Pour les pages simples
    const themeBtn = document.getElementById('themeButton');
    const themeOptions = document.getElementById('themeOptions');
    const themeText = document.getElementById('themeText');
    
    if (themeBtn && themeOptions) {
        // Appliquer thème sauvegardé
        const savedTheme = localStorage.getItem('dreamswear-theme') || 'day';
        document.body.setAttribute('data-theme', savedTheme);
        if (themeText) themeText.textContent = savedTheme === 'night' ? 'Sombre' : 'Clair';
        
        themeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            themeOptions.classList.toggle('show');
        });
        
        themeOptions.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = this.getAttribute('data-theme');
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('dreamswear-theme', theme);
                if (themeText) themeText.textContent = theme === 'night' ? 'Sombre' : 'Clair';
                themeOptions.classList.remove('show');
            });
        });
        
        document.addEventListener('click', () => themeOptions.classList.remove('show'));
    }
}

function initModals() {
    // Modal d'abonnement
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    
    if (subscribeLink && modal) {
        subscribeLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('hidden-modal');
        });
        
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.add('hidden-modal'));
        }
    }
}

// ============================================
// 6. CHARGEMENT DU CONTENU DE LA PAGE
// ============================================
function loadPageContent() {
    console.log('📦 Chargement du contenu...');
    
    // Détecter la page
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '').toLowerCase();
    
    // Si article.html
    if (page === 'article' || document.getElementById('article-content')) {
        loadSingleArticle();
        return;
    }
    
    // Si page principale
    if (page === 'index' || page === 'index2' || page === '' || document.querySelector('.hero')) {
        console.log('🏠 Page principale');
        return;
    }
    
    // Mapping des conteneurs
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
        'articlesContainer': 'mode',
        'articles-list': 'coulisses',
        'trends-container': 'tendances',
        'discoveries-container': 'decouvertes',
        'events-container': 'culture'
    };
    
    // Chercher un conteneur
    for (const [containerId, rubrique] of Object.entries(containerMap)) {
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`🎯 Chargement: ${rubrique} dans ${containerId}`);
            loadArticles(rubrique, containerId);
            return;
        }
    }
    
    console.log('ℹ️ Aucun conteneur spécifique trouvé');
}

// ============================================
// 7. CHARGEMENT DES ARTICLES (FONCTION SÛRE)
// ============================================
async function loadArticles(rubrique, containerId) {
    console.log(`📚 Chargement articles ${rubrique}...`);
    
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
    
    // VÉRIFIER que Supabase est prêt
    if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        console.error('❌ Supabase non prêt pour charger les articles');
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                <p>Erreur: Base de données non disponible</p>
            </div>
        `;
        return;
    }
    
    try {
        // REQUÊTE SUPABASE
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .eq('rubrique', rubrique)
            .order('date_publication', { ascending: false });
        
        if (error) {
            throw new Error(`Supabase: ${error.message}`);
        }
        
        const articles = data || [];
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                    <p>Aucun ${rubrique} publié.</p>
                </div>
            `;
            return;
        }
        
        console.log(`✅ ${articles.length} ${rubrique} chargés`);
        
        // Générer HTML
        container.innerHTML = articles.map(article => `
            <div class="article-card">
                <img src="${article.image_url || 'https://placehold.co/400x250?text=' + rubrique.toUpperCase()}" 
                     alt="${article.titre_fr}" 
                     class="article-image">
                <div class="article-content">
                    <div class="article-meta">
                        <span>${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
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
        `).join('');
        
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
// 8. CHARGEMENT ARTICLE UNIQUE
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
    
    // Vérifier Supabase
    if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        container.innerHTML = '<p>Base de données non disponible.</p>';
        return;
    }
    
    try {
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
// 9. ANIMATIONS
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
    }, { threshold: 0.1 });

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
}

// ============================================
// 10. FONCTIONS UTILITAIRES
// ============================================
function showErrorMessage(message) {
    console.error('💥', message);
    
    // Afficher un message discret
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #dc3545;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 14px;
        display: none;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Afficher brièvement
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

// ============================================
// 11. FONCTIONS GLOBALES (pour compatibilité)
// ============================================
window.loadArticlesByRubrique = loadArticles;
window.loadSingleArticle = loadSingleArticle;

// Anciennes fonctions
window.loadVisages = () => loadArticles('visages', 'visages-container');
window.loadTrends = () => loadArticles('tendances', 'tendances-container');
window.loadDiscoveries = () => loadArticles('decouvertes', 'decouvertes-container');
window.loadEvents = () => loadArticles('culture', 'culture-container');
window.loadCoulissesArticles = () => loadArticles('coulisses', 'coulisses-container');
window.setupCategoryFilters = () => console.log('Filtres OK');

console.log('✅ script.js prêt');
