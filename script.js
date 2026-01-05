// ============================================
// SCRIPT PRINCIPAL COMPLET ET UNIFIÉ - DREAMSWEAR MAG
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation DREAMSWEAR MAG');
    
    // ============================================
    // 1. INITIALISATION SUPABASE (ORIGINALE)
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    // Utiliser l'instance globale supabase comme dans le code original
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase initialisé (mode original)');
    
    // ============================================
    // 2. ANIMATIONS (ORIGINEL)
    // ============================================
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
    
    // ============================================
    // 3. FONCTIONS DE CHARGEMENT DES ARTICLES (NOUVELLES)
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
            
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', rubrique)
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            if (error) {
                console.error(`❌ Erreur chargement ${rubrique}:`, error);
                container.innerHTML = `<p class="error">Erreur de chargement: ${error.message}</p>`;
                return;
            }
            
            if (!data || data.length === 0) {
                console.log(`ℹ️ Aucun article ${rubrique} trouvé`);
                container.innerHTML = `<p class="no-content">Aucun contenu pour le moment.</p>`;
                return;
            }
            
            console.log(`✅ ${data.length} articles ${rubrique} chargés`);
            
            // Générer le HTML selon la rubrique
            container.innerHTML = generateArticlesHTML(data, rubrique);
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            container.innerHTML = `<p class="error">Une erreur est survenue lors du chargement.</p>`;
        }
    };
    
    // Fonction pour charger un article unique
    window.loadSingleArticle = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        const container = document.getElementById('article-content') || 
                         document.getElementById('article-container') ||
                         document.getElementById('article-detail');
        
        if (!articleId || !container) {
            if (container && !articleId) {
                container.innerHTML = '<p>Article non spécifié.</p>';
            }
            return;
        }
        
        try {
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (!article || article.statut !== 'publié') {
                throw new Error('Article non disponible');
            }
            
            renderSingleArticle(article, container);
            
        } catch (error) {
            console.error('Erreur:', error);
            container.innerHTML = `
                <div class="error-message">
                    <h2>Erreur de chargement</h2>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
        }
    };
    
    // ============================================
    // 4. FONCTIONS DE RENDU HTML
    // ============================================
    
    function generateArticlesHTML(articles, rubrique) {
        return articles.map(article => {
            const id = article.id;
            const titre = article.titre_fr || article.titre || article.nom_marque || 'Sans titre';
            const contenu = article.contenu_fr || article.description || article.biographie_fr || '';
            const image = article.image_url || article.photo_url || getDefaultImage(rubrique);
            const date = formatDate(article.date_publication || article.created_at);
            const auteur = article.auteur || article.nom_createur || 'Rédaction';
            const type = getArticleType(article, rubrique);
            const excerpt = contenu.length > 150 ? contenu.substring(0, 150) + '...' : contenu;
            
            return `
                <div class="article-card">
                    <img src="${image}" 
                         alt="${titre}" 
                         class="article-image"
                         onerror="this.src='${getDefaultImage(rubrique)}'">
                    
                    <div class="article-content">
                        <div class="article-meta">
                            <span><i class="far fa-calendar"></i> ${date}</span>
                            ${type ? `<span class="article-category">${type}</span>` : ''}
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
    
    function renderSingleArticle(article, container) {
        container.innerHTML = `
            <article class="full-article">
                <header class="article-header">
                    <nav class="article-breadcrumb">
                        <a href="index.html">Accueil</a> > 
                        <a href="${article.rubrique}.html">${getRubriqueName(article.rubrique)}</a>
                    </nav>
                    
                    <h1 class="article-title">${article.titre_fr || article.titre || 'Sans titre'}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${formatDate(article.date_publication)}</span>
                            <span class="article-author">👤 ${article.auteur || article.nom_createur || 'Rédaction'}</span>
                        </div>
                        
                        <div class="meta-right">
                            <span class="article-rubrique">${getRubriqueName(article.rubrique)}</span>
                            ${getArticleBadge(article)}
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>
                    ` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${formatArticleContent(article.contenu_fr || article.description || '')}
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
        `;
    }
    
    // ============================================
    // 5. FONCTIONS UTILITAIRES
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
        if (article.type_accessoire) return article.type_accessoire;
        if (article.type_beaute) return article.type_beaute;
        if (article.type_decouverte) return article.type_decouverte;
        if (article.type_evenement) return article.type_evenement;
        if (article.theme_mode) return article.theme_mode;
        if (article.saison) return article.saison;
        if (article.domaine) return article.domaine;
        if (article.categorie_actualite) return article.categorie_actualite;
        
        return getRubriqueName(rubrique);
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
    
    function renderArticleSpecificInfo(article) {
        if (article.rubrique === 'visages') {
            return `
                <div class="specific-info creator-info">
                    <h3>À propos du créateur</h3>
                    <ul>
                        ${article.nom_marque ? `<li><strong>Marque :</strong> ${article.nom_marque}</li>` : ''}
                        ${article.nom_createur ? `<li><strong>Créateur :</strong> ${article.nom_createur}</li>` : ''}
                        ${article.domaine ? `<li><strong>Domaine :</strong> ${article.domaine}</li>` : ''}
                        ${article.reseaux_instagram ? `<li><strong>Instagram :</strong> <a href="https://instagram.com/${article.reseaux_instagram.replace('@', '')}" target="_blank">${article.reseaux_instagram}</a></li>` : ''}
                        ${article.site_web ? `<li><strong>Site web :</strong> <a href="${article.site_web}" target="_blank">${article.site_web}</a></li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        if (article.rubrique === 'culture' && article.type_evenement) {
            return `
                <div class="specific-info event-info">
                    <h3>Informations pratiques</h3>
                    <ul>
                        ${article.type_evenement ? `<li><strong>Type :</strong> ${article.type_evenement}</li>` : ''}
                        ${article.date_evenement ? `<li><strong>Date :</strong> ${formatDate(article.date_evenement)}</li>` : ''}
                        ${article.heure_evenement ? `<li><strong>Heure :</strong> ${article.heure_evenement}</li>` : ''}
                        ${article.lieu ? `<li><strong>Lieu :</strong> ${article.lieu}</li>` : ''}
                        ${article.lien_evenement ? `<li><strong>Lien :</strong> <a href="${article.lien_evenement}" target="_blank">${article.lien_evenement}</a></li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        return '';
    }
    
    // ============================================
    // 6. CHARGEMENT AUTOMATIQUE DES PAGES
    // ============================================
    function autoLoadPageContent() {
        console.log('🔄 Détection auto de la page...');
        
        // Si on est sur article.html
        if (document.getElementById('article-content') || 
            document.getElementById('article-container') ||
            document.getElementById('article-detail')) {
            console.log('📄 Page Article détectée');
            loadSingleArticle();
            return;
        }
        
        // Détection par conteneurs
        const containerMap = {
            'actualites-container': 'actualites',
            'visages-container': 'visages',
            'coulisses-container': 'coulisses',
            'tendances-container': 'tendances',
            'decouvertes-container': 'decouvertes',
            'culture-container': 'culture',
            'mode-container': 'mode',
            'accessoires-container': 'accessoires',
            'beaute-container': 'beaute',
            // Compatibilité
            'articles-list': 'coulisses',
            'trends-container': 'tendances',
            'discoveries-container': 'decouvertes',
            'events-container': 'culture'
        };
        
        for (const [containerId, rubrique] of Object.entries(containerMap)) {
            if (document.getElementById(containerId)) {
                console.log(`📄 Page ${rubrique} détectée (${containerId})`);
                loadArticlesByRubrique(rubrique, containerId);
                return;
            }
        }
        
        console.log('ℹ️ Aucun conteneur spécifique détecté');
    }
    
    // ============================================
    // 7. FONCTIONS DE COMPATIBILITÉ
    // ============================================
    
    // Anciennes fonctions pour compatibilité
    window.loadVisages = (filter = 'all') => {
        console.log('⚠️ Utilisation ancienne loadVisages');
        loadArticlesByRubrique('visages', 'visages-container');
    };
    
    window.loadTrends = () => {
        console.log('⚠️ Utilisation ancienne loadTrends');
        loadArticlesByRubrique('tendances', 'trends-container');
    };
    
    window.loadDiscoveries = () => {
        console.log('⚠️ Utilisation ancienne loadDiscoveries');
        loadArticlesByRubrique('decouvertes', 'discoveries-container');
    };
    
    window.loadEvents = () => {
        console.log('⚠️ Utilisation ancienne loadEvents');
        loadArticlesByRubrique('culture', 'events-container');
    };
    
    window.loadCoulissesArticles = () => {
        console.log('⚠️ Utilisation ancienne loadCoulissesArticles');
        loadArticlesByRubrique('coulisses', 'articles-list');
    };
    
    window.setupFilters = function() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                console.log(`Filtre: ${filter} - À implémenter`);
            });
        });
    };
    
    window.setupCategoryFilters = function() {
        console.log('Filtres catégories initialisés');
    };
    
    // ============================================
    // 8. COMPOSANTS DE BASE (ORIGINAUX)
    // ============================================
    
    // SÉLECTEUR DE THÈME
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;

    const setTheme = (theme) => {
        if (theme === 'day') {
            body.classList.add('day-mode');
            localStorage.setItem('theme', 'day');
            if (themeButtonText) themeButtonText.textContent = 'Clair';
        } else {
            body.classList.remove('day-mode');
            localStorage.setItem('theme', 'night');
            if (themeButtonText) themeButtonText.textContent = 'Sombre';
        }
    };

    if (themeSelectButton) {
        themeSelectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeOptions.classList.toggle('hidden-options');
            themeSelectButton.parentElement.classList.toggle('open');
        });
    }

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
    
    document.addEventListener('click', () => {
        if (themeOptions && !themeOptions.classList.contains('hidden-options')) {
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('night');
    }
    
    // MODAL D'ABONNEMENT
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    
    if (subscribeLink && modal) {
        subscribeLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden-modal');
        });

        const closeModalButton = modal.querySelector('.close-modal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                modal.classList.add('hidden-modal');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden-modal');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
    }
    
    // MENU DÉROULANT
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
        
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // AUTHENTIFICATION
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    
    if (authBtn && authModal) {
        authBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeAuthModal = authModal.querySelector('.close-auth-modal');
        if (closeAuthModal) {
            closeAuthModal.addEventListener('click', function() {
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
    
    // FORMULAIRES D'INSCRIPTION
    const subscriberForm = document.getElementById('subscriber-form-element');
    if (subscriberForm) {
        subscriberForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('sub-nom').value.trim();
            const prenom = document.getElementById('sub-prenom').value.trim();
            const email = document.getElementById('sub-email').value.trim();
            const telephone = document.getElementById('sub-tel').value.trim();
            
            try {
                const { data, error } = await supabase
                    .from('Abonnés')
                    .insert([{ nom, prenom, email, telephone }]);
                
                if (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                    return;
                }
                
                console.log('✅ Inscription réussie!', data);
                alert('Inscription réussie !');
                
                if (modal) modal.classList.add('hidden-modal');
                subscriberForm.reset();
                
            } catch (error) {
                console.error('💥 Erreur d\'inscription:', error);
                alert('Une erreur est survenue.');
            }
        });
    }
    
    // ============================================
    // 9. EXÉCUTION AUTOMATIQUE
    // ============================================
    
    // Démarrer le chargement automatique après un court délai
    setTimeout(() => {
        autoLoadPageContent();
        
        // Configurer les filtres si présents
        if (document.querySelectorAll('.filter-btn').length > 0) {
            setupFilters();
        }
    }, 300);
    
    console.log('✅ script.js UNIFIÉ chargé avec succès');
});
