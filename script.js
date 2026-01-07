
// ============================================
// CODE PRINCIPAL - CENTRALISÉ ET SIMPLIFIÉ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script principal démarré');
    
    // ============================================
    // CONFIGURATION SUPABASE (COMMUNE À TOUTES LES PAGES)
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    // Initialisation globale de Supabase - VERSION SIMPLIFIÉE
    let supabase;
    
    if (typeof window.supabaseClient !== 'undefined') {
        // Si supabase est déjà initialisé
        supabase = window.supabaseClient;
        console.log('✅ Utilisation de Supabase existant');
    } else {
        // Initialiser Supabase
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabaseClient = supabase; // Stocker pour une utilisation ultérieure
            console.log('🔄 Supabase initialisé');
        } else {
            console.error('❌ Bibliothèque Supabase non chargée');
            // Ne pas bloquer l'exécution, mais signaler l'erreur
            supabase = {
                from: () => ({ 
                    select: () => ({ 
                        then: (callback) => callback({ data: [], error: new Error('Supabase non chargé') })
                    })
                })
            };
        }
    }

    // ============================================
    // DÉTECTION ET INITIALISATION AUTOMATIQUE
    // ============================================
    function initPage() {
        console.log('🔍 Initialisation de la page...');
        
        // Détecter la page actuelle
        const path = window.location.pathname;
        const pageName = path.split('/').pop().toLowerCase();
        
        console.log(`📄 Page détectée: ${pageName}`);
        
        // Vérifier si nous sommes sur une page admin
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
        
        // Vérifier si nous sommes sur une page d'article
        if (pageName === 'article.html' || document.getElementById('article-content')) {
            console.log('📰 Page article détectée');
            loadSingleArticle();
            return;
        }
        
        // Détecter les pages de contenu par leur conteneur
        detectAndLoadContent();
        
        // Initialiser les fonctionnalités communes
        initCommonFeatures();
    }
    
    function detectAndLoadContent() {
        console.log('🔍 Détection du contenu...');
        
        // Mapping des conteneurs vers les rubriques
        const containerMapping = [
            { id: 'actualites-container', rubrique: 'actualites', render: renderActualites },
            { id: 'visages-container', rubrique: 'visages', render: renderVisages },
            { id: 'coulisses-container', rubrique: 'coulisses', render: renderCoulisses },
            { id: 'tendances-container', rubrique: 'tendances', render: renderTendances },
            { id: 'decouvertes-container', rubrique: 'decouvertes', render: renderDecouvertes },
            { id: 'culture-container', rubrique: 'culture', render: renderCulture },
            { id: 'mode-container', rubrique: 'mode', render: renderMode },
            { id: 'accessoires-container', rubrique: 'accessoires', render: renderAccessoires },
            { id: 'beaute-container', rubrique: 'beaute', render: renderBeaute },
            { id: 'articles-list', rubrique: 'coulisses', render: renderCoulisses },
            { id: 'trends-container', rubrique: 'tendances', render: renderTendances },
            { id: 'discoveries-container', rubrique: 'decouvertes', render: renderDecouvertes },
            { id: 'events-container', rubrique: 'culture', render: renderCulture }
        ];
        
        // Chercher le premier conteneur présent
        for (const mapping of containerMapping) {
            const container = document.getElementById(mapping.id);
            if (container) {
                console.log(`✅ Conteneur trouvé: ${mapping.id} pour ${mapping.rubrique}`);
                loadContent(mapping.rubrique, mapping.id, mapping.render);
                
                // Configurations spécifiques
                if (mapping.rubrique === 'visages') {
                    setTimeout(() => setupVisageFilters(), 100);
                }
                return;
            }
        }
        
        console.log('ℹ️ Aucun conteneur spécifique trouvé');
    }
    
    async function loadContent(rubrique, containerId, renderFunction) {
        console.log(`🔄 Chargement ${rubrique}...`);
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`❌ Conteneur ${containerId} non trouvé`);
            return;
        }
        
        // Afficher le chargement
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', rubrique)
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            if (error) {
                console.error(`❌ Erreur ${rubrique}:`, error);
                container.innerHTML = `<div class="error">Erreur: ${error.message}</div>`;
                return;
            }
            
            if (!data || data.length === 0) {
                console.log(`ℹ️ Aucun ${rubrique} publié`);
                container.innerHTML = `<div class="empty">Aucun contenu disponible</div>`;
                return;
            }
            
            console.log(`✅ ${data.length} ${rubrique} chargés`);
            renderFunction(data, container);
            
        } catch (error) {
            console.error(`💥 Erreur générale ${rubrique}:`, error);
            container.innerHTML = `<div class="error">Erreur de chargement</div>`;
        }
    }
    
    // ============================================
    // FONCTIONS D'ADMINISTRATION
    // ============================================
    
    function checkAdminAuth() {
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès administrateur requis');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Admin authentifié');
        
        // Initialiser la page admin spécifique
        if (window.location.pathname.includes('admin.html')) {
            initAdminPage();
        } else if (window.location.pathname.includes('actualisation.html')) {
            initActualisationPage();
        }
    }
    
    async function initAdminPage() {
        console.log('🔄 Initialisation admin page...');
        
        // Charger les créateurs
        await loadAllCreators();
        
        // Configurer le bouton de déconnexion
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
    
    async function loadAllCreators() {
        console.log('📡 Chargement des créateurs...');
        
        try {
            // Créateurs en attente
            const { data: pending, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) throw pendingError;
            
            displayCreators(pending, 'pendingCreators', 'pending');
            updateCounter('pendingCount', pending?.length || 0);
            
            // Créateurs approuvés
            const { data: approved, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) throw approvedError;
            
            displayCreators(approved, 'approvedCreators', 'approved');
            updateCounter('approvedCount', approved?.length || 0);
            
        } catch (error) {
            console.error('❌ Erreur chargement créateurs:', error);
            showError('pendingCreators', error.message);
            showError('approvedCreators', error.message);
        }
    }
    
    function displayCreators(creators, containerId, status) {
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
            html += `
                <div class="creator-card">
                    <h3>${escapeHtml(creator.nom_marque || 'Sans nom')}</h3>
                    <p><strong>Contact:</strong> ${escapeHtml(creator.prenom || '')} ${escapeHtml(creator.nom || '')}</p>
                    <p><strong>Email:</strong> ${escapeHtml(creator.email || 'Non fourni')}</p>
                    <p><strong>Tél:</strong> ${escapeHtml(creator.telephone || 'Non fourni')}</p>
                    <p><strong>Domaine:</strong> ${escapeHtml(creator.domaine || 'Non spécifié')}</p>
                    <p><strong>Statut:</strong> ${creator.statut}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button onclick="approveCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')" 
                                class="action-btn approve-btn">✅ Approuver</button>
                        <button onclick="rejectCreator(${creator.id}, '${escapeHtml(creator.nom_marque || '').replace(/'/g, "\\'")}')" 
                                class="action-btn reject-btn">❌ Refuser</button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    // Fonctions globales pour les boutons admin
    window.approveCreator = async function(id, brandName) {
        if (!confirm(`Approuver "${brandName}" ?`)) return;
        
        try {
            const { error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`✅ "${brandName}" approuvé !`);
            loadAllCreators();
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Erreur: ${error.message}`);
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
            
            alert(`❌ "${brandName}" refusé !`);
            loadAllCreators();
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Erreur: ${error.message}`);
        }
    };
    
    function initActualisationPage() {
        console.log('📝 Initialisation page actualisation...');
        
        // Initialiser les onglets
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Mettre à jour les onglets actifs
                tabLinks.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Afficher le contenu correspondant
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabId}-tab`)?.classList.add('active');
            });
        });
        
        console.log('✅ Page actualisation initialisée');
    }
    
    // ============================================
    // FONCTIONS DE RENDU D'ARTICLES
    // ============================================
    
    function renderActualites(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="article-card">
                ${article.image_url ? `
                <div class="article-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/600x400?text=ACTUALITE'">
                </div>` : ''}
                
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">📅 ${formatDate(article.date_publication)}</span>
                        ${article.categorie_actualite ? 
                            `<span class="article-category">${article.categorie_actualite}</span>` : ''}
                    </div>
                    
                    <h2 class="article-title">${article.titre_fr}</h2>
                    
                    <div class="article-excerpt">
                        ${truncateText(article.contenu_fr, 200)}
                    </div>
                    
                    <div class="article-author">Par ${article.auteur || 'Rédaction'}</div>
                    
                    <a href="article.html?id=${article.id}" class="read-more">Lire la suite →</a>
                </div>
            </article>
        `).join('');
    }
    
    function renderVisages(visages, container) {
        container.innerHTML = visages.map(visage => `
            <div class="visage-card">
                ${visage.image_url ? `
                <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" 
                     onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">` : ''}
                
                <div class="visage-content">
                    <h3>${visage.nom_marque || visage.titre_fr}</h3>
                    
                    ${visage.domaine ? `<span class="visage-domain">${visage.domaine}</span>` : ''}
                    
                    <p>${truncateText(visage.contenu_fr, 120)}</p>
                    
                    <a href="article.html?id=${visage.id}" class="visage-link">Voir le profil →</a>
                </div>
            </div>
        `).join('');
    }
    
    function renderCoulisses(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="backstage-article">
                ${article.image_url ? `
                <div class="backstage-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=COULISSES'">
                </div>` : ''}
                
                <div class="backstage-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="backstage-meta">
                        <span>📅 ${formatDate(article.date_publication)}</span>
                        <span>🎬 ${article.auteur || 'Rédaction'}</span>
                    </div>
                    
                    <div class="backstage-excerpt">
                        ${truncateText(article.contenu_fr, 180)}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-backstage">Voir les coulisses →</a>
                </div>
            </article>
        `).join('');
    }
    
    function renderTendances(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="trend-article">
                ${article.image_url ? `
                <div class="trend-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=TENDANCE'">
                    ${article.saison ? `<span class="season-badge">${article.saison}</span>` : ''}
                </div>` : ''}
                
                <div class="trend-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="trend-meta">
                        <span>📅 ${formatDate(article.date_publication)}</span>
                        ${article.saison ? `<span>🌤️ ${article.saison}</span>` : ''}
                    </div>
                    
                    <div class="trend-excerpt">
                        ${truncateText(article.contenu_fr, 220)}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-trend">Découvrir →</a>
                </div>
            </article>
        `).join('');
    }
    
    function renderDecouvertes(articles, container) {
        container.innerHTML = articles.map(article => `
            <div class="discovery-card">
                ${article.image_url ? `
                <div class="discovery-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=DECOUVERTE'">
                </div>` : ''}
                
                <div class="discovery-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="discovery-excerpt">
                        ${truncateText(article.contenu_fr, 120)}
                    </div>
                    
                    <div class="discovery-meta">
                        <span>📅 ${formatDate(article.date_publication)}</span>
                        <span>🔍 ${article.type_decouverte || 'Découverte'}</span>
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="discovery-link">Découvrir →</a>
                </div>
            </div>
        `).join('');
    }
    
    function renderCulture(events, container) {
        container.innerHTML = events.map(event => `
            <div class="event-card">
                <h3>${event.titre_fr}</h3>
                
                <div class="event-meta">
                    <span>📅 ${formatDate(event.date_evenement || event.date_publication)}</span>
                    <span>${event.type_evenement || 'Événement'}</span>
                </div>
                
                <div class="event-description">
                    ${truncateText(event.contenu_fr, 150)}
                </div>
                
                <a href="article.html?id=${event.id}" class="event-link">Voir détails →</a>
            </div>
        `).join('');
    }
    
    function renderMode(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="fashion-article">
                ${article.image_url ? `
                <div class="fashion-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=MODE'">
                    ${article.theme_mode ? `<span class="theme-badge">${article.theme_mode}</span>` : ''}
                </div>` : ''}
                
                <div class="fashion-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <div class="article-meta">
                        <span>📅 ${formatDate(article.date_publication)}</span>
                        <span>👤 ${article.auteur || 'Rédaction'}</span>
                        ${article.theme_mode ? `<span>🏷️ ${article.theme_mode}</span>` : ''}
                    </div>
                    
                    <div class="article-excerpt">
                        ${truncateText(article.contenu_fr, 250)}
                    </div>
                    
                    <a href="article.html?id=${article.id}" class="read-article">Lire →</a>
                </div>
            </article>
        `).join('');
    }
    
    function renderAccessoires(articles, container) {
        container.innerHTML = articles.map(article => `
            <div class="accessory-article">
                ${article.image_url ? `
                <div class="accessory-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=ACCESSOIRE'">
                    ${article.type_accessoire ? `<span class="type-tag">${article.type_accessoire}</span>` : ''}
                </div>` : ''}
                
                <div class="accessory-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="article-info">
                        <span class="date">${formatDate(article.date_publication)}</span>
                        ${article.type_accessoire ? `<span class="type">${article.type_accessoire}</span>` : ''}
                    </div>
                    
                    <p class="excerpt">${truncateText(article.contenu_fr, 180)}</p>
                    
                    <a href="article.html?id=${article.id}" class="view-details">Voir →</a>
                </div>
            </div>
        `).join('');
    }
    
    function renderBeaute(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="beauty-card">
                ${article.image_url ? `
                <div class="beauty-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" 
                         onerror="this.src='https://placehold.co/400x250?text=BEAUTE'">
                    ${article.type_beaute ? `<div class="beauty-category">${article.type_beaute}</div>` : ''}
                </div>` : ''}
                
                <div class="beauty-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <div class="beauty-meta">
                        <span>📅 ${formatDate(article.date_publication)}</span>
                        <span>👩‍⚕️ ${article.auteur || 'Rédaction'}</span>
                    </div>
                    
                    <div class="beauty-excerpt">${truncateText(article.contenu_fr, 200)}</div>
                    
                    ${article.type_beaute ? `<span class="tip-tag">💡 ${article.type_beaute}</span>` : ''}
                    
                    <a href="article.html?id=${article.id}" class="read-beauty">Conseils →</a>
                </div>
            </article>
        `).join('');
    }
    
    // ============================================
    // ARTICLE INDIVIDUEL
    // ============================================
    
    async function loadSingleArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            console.log('ℹ️ Aucun ID article spécifié');
            return;
        }
        
        console.log(`📰 Chargement article ${articleId}...`);
        
        try {
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (article.statut !== 'publié') {
                throw new Error('Article non publié');
            }
            
            renderArticle(article);
            
        } catch (error) {
            console.error('❌ Erreur chargement article:', error);
            document.getElementById('article-content').innerHTML = `
                <div class="error-message">
                    <h2>Article non disponible</h2>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
        }
    }
    
    function renderArticle(article) {
        const container = document.getElementById('article-content');
        if (!container) return;
        
        container.innerHTML = `
            <article class="full-article">
                <header class="article-header">
                    <h1 class="article-title">${article.titre_fr}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${formatDate(article.date_publication)}</span>
                            <span class="article-author">👤 ${article.auteur || 'Rédaction'}</span>
                        </div>
                        
                        <div class="meta-right">
                            <span class="article-rubrique">${getRubriqueName(article.rubrique)}</span>
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" 
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${formatContent(article.contenu_fr)}
                    </div>
                </div>
                
                <footer class="article-footer">
                    <a href="${article.rubrique}.html" class="back-to-list">
                        ← Retour à ${getRubriqueName(article.rubrique)}
                    </a>
                </footer>
            </article>
        `;
    }
    
    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================
    
    function formatDate(dateString) {
        if (!dateString) return 'Date inconnue';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }
    
    function truncateText(text, maxLength) {
        if (!text) return 'Lire la suite...';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    function formatContent(content) {
        if (!content) return '<p>Contenu non disponible.</p>';
        return content.replace(/\n/g, '<br>');
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    // FILTRES VISAGES
    // ============================================
    
    function setupVisageFilters() {
        console.log('🎯 Configuration filtres visages...');
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Mettre à jour les boutons actifs
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrer
                const filter = this.dataset.filter;
                filterVisages(filter);
            });
        });
    }
    
    async function filterVisages(domain) {
        console.log(`🎯 Filtrage par domaine: ${domain}`);
        
        const container = document.getElementById('visages-container');
        if (!container) return;
        
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'visages')
                .eq('statut', 'publié');
            
            if (domain !== 'all') {
                query = query.eq('domaine', domain);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = '<div class="empty">Aucun créateur dans cette catégorie</div>';
                return;
            }
            
            renderVisages(data, container);
            
        } catch (error) {
            console.error('❌ Erreur filtrage:', error);
            container.innerHTML = `<div class="error">Erreur: ${error.message}</div>`;
        }
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
        
        // Animations
        initAnimations();
    }
    
    function initTheme() {
        const themeButton = document.getElementById('theme-select-button');
        const themeOptions = document.getElementById('theme-options');
        const themeText = document.getElementById('theme-button-text');
        const body = document.body;
        
        if (!themeButton || !themeOptions) return;
        
        // Fonction pour définir le thème
        const setTheme = (theme) => {
            if (theme === 'day') {
                body.classList.add('day-mode');
                localStorage.setItem('theme', 'day');
                if (themeText) themeText.textContent = 'Clair';
            } else {
                body.classList.remove('day-mode');
                localStorage.setItem('theme', 'night');
                if (themeText) themeText.textContent = 'Sombre';
            }
        };
        
        // Bouton thème
        themeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeOptions.classList.toggle('hidden-options');
            themeButton.parentElement.classList.toggle('open');
        });
        
        // Options thème
        themeOptions.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                setTheme(e.target.dataset.theme);
                themeOptions.classList.add('hidden-options');
                themeButton.parentElement.classList.remove('open');
            }
        });
        
        // Fermer en cliquant ailleurs
        document.addEventListener('click', () => {
            themeOptions.classList.add('hidden-options');
            themeButton.parentElement.classList.remove('open');
        });
        
        // Charger thème sauvegardé
        const savedTheme = localStorage.getItem('theme') || 'night';
        setTheme(savedTheme);
    }
    
    function initSubscriptionModal() {
        const subscribeLink = document.getElementById('subscribe-link');
        const modal = document.getElementById('subscribe-modal');
        
        if (!subscribeLink || !modal) return;
        
        // Ouvrir modal
        subscribeLink.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden-modal');
        });
        
        // Fermer modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
        
        // Échap pour fermer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
                modal.classList.add('hidden-modal');
            }
        });
        
        // Onglets
        const tabLinks = modal.querySelectorAll('.tab-link');
        tabLinks.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.dataset.tab;
                
                // Onglets
                tabLinks.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Contenu
                modal.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(targetId)?.classList.add('active');
            });
        });
    }
    
    function initAuth() {
        const authBtn = document.getElementById('auth-btn');
        const authModal = document.getElementById('auth-modal');
        
        if (!authBtn || !authModal) return;
        
        // Ouvrir modal auth
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.add('active');
        });
        
        // Fermer modal auth
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal || e.target.classList.contains('close-auth-modal')) {
                authModal.classList.remove('active');
                resetAuthForms();
            }
        });
        
        // Échap pour fermer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('active')) {
                authModal.classList.remove('active');
                resetAuthForms();
            }
        });
        
        // Onglets auth
        const authTabs = authModal.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const authType = this.dataset.authType;
                
                // Onglets
                authTabs.forEach(t => t.classList.remove('active'));
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
                
                // Cacher les erreurs
                hideAuthErrors();
            });
        });
        
        // Soumission formulaire admin
        const adminForm = document.getElementById('admin-form');
        if (adminForm) {
            adminForm.addEventListener('submit', handleAdminLogin);
        }
        
        // Soumission formulaire créateur
        const creatorForm = document.getElementById('creator-form');
        if (creatorForm) {
            creatorForm.addEventListener('submit', handleCreatorLogin);
        }
    }
    
    async function handleAdminLogin(e) {
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
            
            document.getElementById('auth-modal').classList.remove('active');
            window.location.href = 'admin.html';
            
        } catch (error) {
            console.error('❌ Erreur connexion admin:', error);
            if (errorElement) {
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
            }
        }
    }
    
    async function handleCreatorLogin(e) {
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
            
            document.getElementById('auth-modal').classList.remove('active');
            window.location.href = 'dashboard-home.html';
            
        } catch (error) {
            console.error('❌ Erreur connexion créateur:', error);
            if (errorElement) {
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
            }
        }
    }
    
    function resetAuthForms() {
        const adminForm = document.getElementById('admin-form');
        const creatorForm = document.getElementById('creator-form');
        
        if (adminForm) adminForm.reset();
        if (creatorForm) creatorForm.reset();
        
        hideAuthErrors();
    }
    
    function hideAuthErrors() {
        const adminError = document.getElementById('admin-error');
        const creatorError = document.getElementById('creator-error');
        
        if (adminError) adminError.style.display = 'none';
        if (creatorError) creatorError.style.display = 'none';
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
        
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    function initForms() {
        // Formulaire inscription abonné
        const subscriberForm = document.getElementById('subscriber-form-element');
        if (subscriberForm) {
            subscriberForm.addEventListener('submit', async function(e) {
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
                    
                    alert('Inscription réussie !');
                    subscriberForm.reset();
                    document.getElementById('subscribe-modal').classList.add('hidden-modal');
                    
                } catch (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                }
            });
        }
        
        // Formulaire inscription créateur
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
                    
                    alert('Inscription envoyée ! Attente de validation.');
                    creatorRegisterForm.reset();
                    document.getElementById('subscribe-modal').classList.add('hidden-modal');
                    
                } catch (error) {
                    console.error('❌ Erreur inscription créateur:', error);
                    alert('Erreur: ' + error.message);
                }
            });
        }
    }
    
    function initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
    }
    
    // ============================================
    // FONCTIONS GLOBALES POUR COMPATIBILITÉ
    // ============================================
    
    window.loadArticlesByRubrique = loadContent;
    window.loadSingleArticle = loadSingleArticle;
    window.setupVisageFilters = setupVisageFilters;
    window.loadCoulissesArticles = () => loadContent('coulisses', 'articles-list', renderCoulisses);
    window.loadTrends = () => loadContent('tendances', 'trends-container', renderTendances);
    window.loadVisages = (filter = 'all') => {
        loadContent('visages', 'visages-container', renderVisages);
        if (filter !== 'all') setTimeout(() => filterVisages(filter), 100);
    };
    window.loadDiscoveries = () => loadContent('decouvertes', 'discoveries-container', renderDecouvertes);
    window.loadEvents = () => loadContent('culture', 'events-container', renderCulture);
    window.initPageData = initPage;
    
    // ============================================
    // DÉMARRAGE
    // ============================================
    
    // Démarrer l'initialisation
    setTimeout(initPage, 50);
    
    console.log('✅ Script principal prêt');
});
