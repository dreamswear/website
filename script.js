// ============================================
// CODE PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ============================================
    // DÉTECTION AUTOMATIQUE DE LA PAGE (NOUVEAU)
    // ============================================
    function detectPageAndLoad() {
        console.log('🔍 Détection automatique de la page...');
        
        // Vérifier si on est sur la page d'administration
        if (window.location.pathname.includes('Actualisation.html')) {
            console.log('📄 Page Admin détectée');
            initAdminPage();
            return;
        }
        
        // 1. Si on est sur article.html
        if (document.getElementById('article-content')) {
            console.log('📄 Page Article détectée');
            loadSingleArticle();
            return;
        }
        
        // 2. Liste des conteneurs et leurs rubriques associées
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
        
        // 3. Chercher quel conteneur est présent sur la page
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
        
        // 4. Si aucun conteneur trouvé, essayer par nom de fichier
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
    }
    
    // ============================================
    // FONCTION POUR LA PAGE ADMINISTRATION
    // ============================================
    
    async function initAdminPage() {
        console.log('🔄 Initialisation de la page admin...');
        
        // Initialiser les onglets
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-tab').classList.add('active');
            });
        });
        
        // Initialiser les boutons de sauvegarde
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', async function() {
                const tabId = this.id.split('-')[1];
                console.log('Enregistrement pour:', tabId);
                // Votre logique d'enregistrement ici
            });
        });
        
        // Charger les données initiales
        await loadAdminData('actualites');
    }
    
    async function loadAdminData(tabId) {
        console.log(`🔄 Chargement des données admin pour: ${tabId}`);
        // Implémentez ici le chargement des données pour l'admin
    }
    
    // ============================================
    // 0. FONCTIONS POUR LA NOUVELLE STRUCTURE
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
            
            console.log('📊 Données reçues pour', rubrique, ':', data); // <-- DÉBOGAGE AJOUTÉ
            
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
    
    // Fonctions de rendu pour chaque rubrique
    function renderActualites(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="article-card">
                ${article.image_url ? `
                <div class="article-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy" 
                         onerror="this.src='https://placehold.co/600x400?text=ACTUALITE'">
                </div>
                ` : ''}
                
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        ${article.categorie_actualite ? `<span class="article-category">${article.categorie_actualite}</span>` : ''}
                    </div>
                    
                    <h2 class="article-title">${article.titre_fr}</h2>
                    
                    <div class="article-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 200) + (article.contenu_fr.length > 200 ? '...' : '') : 'Lire la suite...'}
                    </div>
                    
                    <div class="article-author">
                        Par ${article.auteur || 'Rédaction'}
                    </div>
                    
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
                <div class="visage-card">
                    ${visage.image_url ? `
                    <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy" class="visage-image"
                         onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    ` : ''}
                    
                    <div class="visage-content">
                        <h3>${visage.nom_marque || visage.titre_fr}</h3>
                        
                        ${visage.domaine ? `<span class="visage-domain">${visage.domaine}</span>` : ''}
                        
                        <p>
                            ${visage.contenu_fr ? visage.contenu_fr.substring(0, 120) + (visage.contenu_fr.length > 120 ? '...' : '') : 'Découvrez ce créateur...'}
                        </p>
                        
                        <a href="article.html?id=${visage.id}" class="visage-link">
                            Voir le profil complet →
                        </a>
                    </div>
                </div>
            `).join('');
        } else {
            // Version générique pour d'autres pages
            container.innerHTML = visages.map(visage => `
                <div class="creator-card">
                    ${visage.image_url ? `
                    <div class="creator-photo">
                        <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    </div>
                    ` : ''}
                    
                    <div class="creator-info">
                        <h3 class="creator-name">${visage.nom_marque || visage.titre_fr}</h3>
                        
                        ${visage.nom_createur ? `<p class="creator-person">👤 ${visage.nom_createur}</p>` : ''}
                        ${visage.domaine ? `<p class="creator-domain">🏷️ ${visage.domaine}</p>` : ''}
                        
                        <div class="creator-bio">
                            ${visage.contenu_fr ? visage.contenu_fr.substring(0, 150) + (visage.contenu_fr.length > 150 ? '...' : '') : 'Découvrez ce créateur...'}
                        </div>
                        
                        <div class="creator-links">
                            ${visage.reseaux_instagram ? `
                            <a href="https://instagram.com/${visage.reseaux_instagram.replace('@', '')}" 
                               target="_blank" class="social-link instagram">
                                <i class="fab fa-instagram"></i> ${visage.reseaux_instagram}
                            </a>
                            ` : ''}
                            
                            ${visage.site_web ? `
                            <a href="${visage.site_web}" target="_blank" class="social-link website">
                                <i class="fas fa-globe"></i> Site web
                            </a>
                            ` : ''}
                        </div>
                        
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
            <article class="backstage-article">
                ${article.image_url ? `
                <div class="backstage-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=COULISSES'">
                </div>
                ` : ''}
                
                <div class="backstage-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="backstage-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        <span>🎬 ${article.auteur || 'Rédaction'}</span>
                    </div>
                    
                    <div class="backstage-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 180) + (article.contenu_fr.length > 180 ? '...' : '') : 'Découvrez les coulisses...'}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-backstage">
                        Voir les coulisses →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderTendances(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="trend-article">
                ${article.image_url ? `
                <div class="trend-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=TENDANCE'">
                    ${article.saison ? `<span class="season-badge">${article.saison}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="trend-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="trend-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        ${article.saison ? `<span>🌤️ ${article.saison}</span>` : ''}
                    </div>
                    
                    <div class="trend-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 220) + (article.contenu_fr.length > 220 ? '...' : '') : 'Découvrez les tendances...'}
                    </div>
                    
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
                        <div class="discovery-card">
                            ${item.image_url ? `
                            <div class="discovery-image">
                                <img src="${item.image_url}" alt="${item.titre_fr}" loading="lazy"
                                     onerror="this.src='https://placehold.co/400x250?text=DECOUVERTE'">
                            </div>
                            ` : ''}
                            
                            <div class="discovery-content">
                                <h3>${item.titre_fr}</h3>
                                <div class="discovery-excerpt">
                                    ${item.contenu_fr ? item.contenu_fr.substring(0, 120) + (item.contenu_fr.length > 120 ? '...' : '') : 'Découvrez...'}
                                </div>
                                <div class="discovery-meta">
                                    <span>📅 ${new Date(item.date_publication).toLocaleDateString('fr-FR')}</span>
                                    <span>🔍 ${getTypeDecouverteLabel(item.type_decouverte)}</span>
                                </div>
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
                            <div class="event-card upcoming">
                                <div class="event-header">
                                    <h3>${event.titre_fr}</h3>
                                    <span class="event-type">${event.type_evenement || 'Événement'}</span>
                                </div>
                                
                                <div class="event-details">
                                    <div class="event-date">
                                        <i class="fas fa-calendar"></i>
                                        ${event.date_evenement ? new Date(event.date_evenement).toLocaleDateString('fr-FR') : new Date(event.date_publication).toLocaleDateString('fr-FR')}
                                        ${event.heure_evenement ? ` • ${event.heure_evenement}` : ''}
                                    </div>
                                    
                                    ${event.lieu ? `
                                    <div class="event-location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${event.lieu}
                                    </div>
                                    ` : ''}
                                    
                                    <div class="event-description">
                                        ${event.contenu_fr ? event.contenu_fr.substring(0, 150) + (event.contenu_fr.length > 150 ? '...' : '') : 'Plus d\'informations...'}
                                    </div>
                                    
                                    ${event.lien_evenement ? `
                                    <a href="${event.lien_evenement}" target="_blank" class="event-link">
                                        <i class="fas fa-external-link-alt"></i> Plus d'infos
                                    </a>
                                    ` : `
                                    <a href="article.html?id=${event.id}" class="event-link">
                                        <i class="fas fa-info-circle"></i> Voir détails
                                    </a>
                                    `}
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
                            <div class="event-card past">
                                <h4>${event.titre_fr}</h4>
                                <div class="event-meta">
                                    <span>${new Date(event.date_evenement || event.date_publication).toLocaleDateString('fr-FR')}</span>
                                    <span>${event.type_evenement || 'Événement'}</span>
                                </div>
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
            <article class="fashion-article">
                ${article.image_url ? `
                <div class="fashion-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=MODE'">
                    ${article.theme_mode ? `<span class="theme-badge">${article.theme_mode}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="fashion-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="article-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        <span>👤 ${article.auteur || 'Rédaction'}</span>
                        ${article.theme_mode ? `<span>🏷️ ${article.theme_mode}</span>` : ''}
                    </div>
                    
                    <div class="article-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 250) + (article.contenu_fr.length > 250 ? '...' : '') : 'Découvrez l\'article...'}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-article">
                        Lire l'article complet →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderAccessoires(articles, container) {
        container.innerHTML = articles.map(article => `
            <div class="accessory-article">
                ${article.image_url ? `
                <div class="accessory-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ACCESSOIRE'">
                    ${article.type_accessoire ? `<span class="type-tag">${article.type_accessoire}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="accessory-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="article-info">
                        <span class="date">${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        ${article.type_accessoire ? `<span class="type">${article.type_accessoire}</span>` : ''}
                    </div>
                    
                    <p class="excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 180) + (article.contenu_fr.length > 180 ? '...' : '') : 'Découvrez...'}
                    </p>
                    
                    <a href="article.html?id=${article.id}" class="view-details">
                        Voir les détails →
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    function renderBeaute(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="beauty-card">
                ${article.image_url ? `
                <div class="beauty-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=BEAUTE'">
                    ${article.type_beaute ? `<div class="beauty-category">${article.type_beaute}</div>` : ''}
                </div>
                ` : ''}
                
                <div class="beauty-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="beauty-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        <span>👩‍⚕️ ${article.auteur || 'Rédaction'}</span>
                    </div>
                    
                    <div class="beauty-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 200) + (article.contenu_fr.length > 200 ? '...' : '') : 'Découvrez...'}
                    </div>
                    
                    <div class="beauty-tips">
                        ${article.type_beaute ? `<span class="tip-tag">💡 ${article.type_beaute}</span>` : ''}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-beauty">
                        Lire les conseils →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderGenericArticles(articles, container, rubrique) {
        container.innerHTML = articles.map(article => `
            <article class="generic-article">
                ${article.image_url ? `
                <div class="generic-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ARTICLE'">
                </div>
                ` : ''}
                
                <div class="generic-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="generic-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        <span>${article.auteur || 'Rédaction'}</span>
                    </div>
                    
                    <p class="generic-excerpt">
                        ${article.contenu_fr ? article.contenu_fr.substring(0, 150) + (article.contenu_fr.length > 150 ? '...' : '') : 'Lire la suite...'}
                    </p>
                    
                    <a href="article.html?id=${article.id}" class="read-generic">
                        Lire l'article →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    // Fonction pour charger un article unique
    window.loadSingleArticle = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId || !document.getElementById('article-content')) {
            return;
        }
        
        const container = document.getElementById('article-content');
        
        try {
            console.log(`🔄 Chargement de l'article ${articleId}...`);
            
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (!article || article.statut !== 'publié') {
                throw new Error('Article non disponible (statut non publié)');
            }
            
            console.log('✅ Article chargé:', article);
            renderSingleArticle(article);
            
        } catch (error) {
            console.error('Erreur:', error);
            container.innerHTML = `
                <div class="error-message" style="padding: 40px; text-align: center;">
                    <h2>Erreur de chargement</h2>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
        }
    };
    
    function renderSingleArticle(article) {
        const container = document.getElementById('article-content');
        
        container.innerHTML = `
            <article class="full-article">
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
                    <div class="article-hero-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>
                    ` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${formatArticleContent(article.contenu_fr)}
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
                <div class="specific-info creator-info">
                    <h3>À propos du créateur</h3>
                    <ul>
                        ${article.nom_marque ? `<li><strong>Marque :</strong> ${article.nom_marque}</li>` : ''}
                        ${article.nom_createur ? `<li><strong>Créateur :</strong> ${article.nom_createur}</li>` : ''}
                        ${article.domaine ? `<li><strong>Domaine :</strong> ${article.domaine}</li>` : ''}
                        ${article.reseaux_instagram ? `<li><strong>Instagram :</strong> <a href="https://instagram.com/${article.reseaux_instagram.replace('@', '')}" target="_blank">${article.reseaux_instagram}</a></li>` : ''}
                        ${article.site_web ? `<li><strong>Site web :</strong> <a href="${article.site_web}" target="_blank">${article.site_web}</a></li>` : ''}
                    </ul>
                    ${article.interview_fr ? `
                    <div class="interview-section">
                        <h4>Interview</h4>
                        <div class="interview-content">${formatArticleContent(article.interview_fr)}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        if (article.rubrique === 'culture' && article.type_evenement) {
            html += `
                <div class="specific-info event-info">
                    <h3>Informations pratiques</h3>
                    <ul>
                        ${article.type_evenement ? `<li><strong>Type :</strong> ${article.type_evenement}</li>` : ''}
                        ${article.date_evenement ? `<li><strong>Date :</strong> ${new Date(article.date_evenement).toLocaleDateString('fr-FR')}</li>` : ''}
                        ${article.heure_evenement ? `<li><strong>Heure :</strong> ${article.heure_evenement}</li>` : ''}
                        ${article.lieu ? `<li><strong>Lieu :</strong> ${article.lieu}</li>` : ''}
                        ${article.statut_evenement ? `<li><strong>Statut :</strong> ${article.statut_evenement}</li>` : ''}
                        ${article.lien_evenement ? `<li><strong>Lien :</strong> <a href="${article.lien_evenement}" target="_blank">${article.lien_evenement}</a></li>` : ''}
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
    // FONCTION D'INITIALISATION AUTOMATIQUE DES PAGES (CONSERVÉE POUR COMPATIBILITÉ)
    // ============================================
    
    window.initPageData = function() {
        console.log('🔄 Initialisation des données de la page...');
        detectPageAndLoad(); // Utilise la nouvelle fonction de détection
    };
    
    // ============================================
    // FONCTION SPÉCIALE POUR COULISSES (ARTICLE À LA UNE)
    // ============================================
    
    async function loadCoulissesFeatured() {
        try {
            const container = document.getElementById('coulisses-container');
            const featuredContainer = document.getElementById('coulisses-featured');
            
            if (!container) return;
            
            // Si vous avez un conteneur "featured" séparé
            if (featuredContainer) {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('rubrique', 'coulisses')
                    .eq('statut', 'publié')
                    .order('date_publication', { ascending: false })
                    .limit(7);
                
                if (error) throw error;
                
                if (!data || data.length === 0) {
                    container.innerHTML = '<p class="no-content">Aucun article coulisses pour le moment.</p>';
                    featuredContainer.innerHTML = '';
                    return;
                }
                
                // Premier article = à la une
                const featured = data[0];
                featuredContainer.innerHTML = `
                    <article class="featured-article-content">
                        ${featured.image_url ? `
                        <img src="${featured.image_url}" alt="${featured.titre_fr}" 
                             onerror="this.src='https://placehold.co/800x400?text=COULISSES'">
                        ` : ''}
                        <div class="featured-info">
                            <span class="category">COULISSES</span>
                            <h2>${featured.titre_fr}</h2>
                            <p>${featured.contenu_fr ? featured.contenu_fr.substring(0, 200) + '...' : ''}</p>
                            <a href="article.html?id=${featured.id}" class="read-more">Lire l'article →</a>
                        </div>
                    </article>
                `;
                
                // Les 6 articles suivants = liste
                const otherArticles = data.slice(1);
                if (otherArticles.length > 0) {
                    container.innerHTML = otherArticles.map(article => `
                        <article class="article-item">
                            ${article.image_url ? `
                            <img src="${article.image_url}" alt="${article.titre_fr}" 
                                 onerror="this.src='https://placehold.co/300x200?text=ARTICLE'">
                            ` : ''}
                            <div class="article-item-info">
                                <h3>${article.titre_fr}</h3>
                                <p>${article.contenu_fr ? article.contenu_fr.substring(0, 100) + '...' : ''}</p>
                                <a href="article.html?id=${article.id}" class="read-link">Lire →</a>
                            </div>
                        </article>
                    `).join('');
                } else {
                    container.innerHTML = '';
                }
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement coulisses:', error);
            const container = document.getElementById('coulisses-container');
            if (container) {
                container.innerHTML = '<p class="error">Erreur de chargement des articles.</p>';
            }
        }
    }
    
    // ============================================
    // EXÉCUTION AUTOMATIQUE DE LA DÉTECTION (NOUVEAU)
    // ============================================
    setTimeout(() => {
        detectPageAndLoad(); // Détection automatique au chargement
    }, 100);

    // ============================================
    // 1. OBSERVATEUR D'INTERSECTION (ANIMATIONS)
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
    }, {
        threshold: 0.1
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // ============================================
    // 2. SELECTEUR DE THÈME
    // ============================================
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

    // ============================================
    // 3. MODAL D'ABONNEMENT
    // ============================================
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    const closeModalButton = modal ? modal.querySelector('.close-modal') : null;
    const tabLinks = modal ? modal.querySelectorAll('.tab-link') : [];
    const tabContents = modal ? modal.querySelectorAll('.tab-content') : [];

    const openModal = () => modal.classList.remove('hidden-modal');
    const closeModal = () => modal.classList.add('hidden-modal');

    if (subscribeLink) {
        subscribeLink.addEventListener('click', (e) => {
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

    // ============================================
    // 4. FORMULAIRES D'INSCRIPTION
    // ============================================
    
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

    // ============================================
    // 5. MENU DÉROULANT PRINCIPAL
    // ============================================
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

    // ============================================
    // 6. FENÊTRE D'AUTHENTIFICATION
    // ============================================
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

    // ============================================
    // 7. CONNEXION ADMINISTRATEUR
    // ============================================
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

    // ============================================
    // 8. CONNEXION CRÉATEUR
    // ============================================
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

    // ============================================
    // 9. GESTION DES ÉVÉNEMENTS CLAVIER
    // ============================================
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

    // ============================================
    // 10. EMPÊCHER LA SOUMISSION PAR DÉFAUT DES AUTRES FORMULAIRES
    // ============================================
    const otherForms = document.querySelectorAll('form:not(#subscriber-form-element):not(#creator-register-form):not(#admin-form):not(#creator-form)');
    otherForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Formulaire soumis avec succès ! (démonstration)');
            form.reset();
        });
    });

    // ============================================
    // 11. GESTION DES CRÉATEURS POUR L'ADMINISTRATION
    // ============================================
    const pendingCreatorsDiv = document.getElementById('pendingCreators');
    const approvedCreatorsDiv = document.getElementById('approvedCreators');
    
    if (pendingCreatorsDiv && approvedCreatorsDiv) {
        console.log('🔄 Page admin détectée');
        
        // Vérifier la connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        // Charger les données
        loadAllCreators();
        
        async function loadAllCreators() {
            console.log('🔄 Chargement créateurs...');
            
            // Afficher message temporaire
            pendingCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            approvedCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            
            try {
                // Charger les créateurs en attente
                const { data: pendingData, error: pendingError } = await supabase
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
                
                // Charger les créateurs approuvés
                const { data: approvedData, error: approvedError } = await supabase
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
        
        // Fonctions globales
        window.approveCreator = async function(id, brandName) {
            if (!confirm(`Approuver "${brandName}" ?`)) return;
            
            try {
                const { error } = await supabase
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
                const { error } = await supabase
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
    
    // ============================================
    // 12. ANCIENNES FONCTIONS PRÉSERVÉES POUR COMPATIBILITÉ
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
});
