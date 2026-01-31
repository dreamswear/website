// annuaire-script.js - Gestion complète des annuaires (vue public + admin)

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du script annuaire...');

    // ============================================
    // 1. CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    let supabase;
    
    try {
        if (typeof window.supabase !== 'undefined') {
            if (window.supabase.from) {
                supabase = window.supabase;
                console.log('✅ Supabase déjà initialisé');
            } else if (window.supabase.createClient) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                window.supabase = supabase;
                console.log('✅ Supabase initialisé via createClient');
            }
        }
        
        if (!supabase) {
            console.error('❌ Supabase non disponible');
            showError('Bibliothèque Supabase non chargée');
            return;
        }
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error);
        showError('Erreur de connexion à la base de données');
        return;
    }

    // ============================================
    // 2. DÉTECTION DE LA PAGE
    // ============================================
    const currentPath = window.location.pathname;
    console.log('📍 Page détectée:', currentPath);
    
    if (currentPath.includes('dashboard-annuaire.html')) {
        console.log('📄 Page Dashboard Annuaire (créateur) détectée');
        await initDashboardAnnuaire();
    } else if (currentPath.includes('annuaire-view.html')) {
        console.log('📄 Page Annuaire View (public) détectée');
        await initAnnuaireView();
    } else if (currentPath.includes('manage-annuaire.html')) {
        console.log('📄 Page Manage Annuaire (admin) détectée');
        await initManageAnnuaire();
    }

    // ============================================
    // 3. FONCTIONS UTILITAIRES
    // ============================================
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function generateStars(rating) {
        if (!rating || rating === 0) {
            return '<i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>';
        }
        
        let stars = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && halfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function showError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <div>
                <strong>Erreur</strong>
                <div style="font-size: 0.9rem; margin-top: 5px;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    function showSuccess(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Succès</strong>
                <div style="font-size: 0.9rem; margin-top: 5px;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Styles d'animation pour les notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #d4af37;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // 4. ANNUAIRE PUBLIC (annuaire-view.html)
    // ============================================
    
    async function initAnnuaireView() {
        console.log('🔄 Initialisation Annuaire View (public)...');
        
        try {
            // Charger les catégories pour les filtres
            const categories = await loadCategoriesForPublic();
            
            // Charger les professionnels actifs
            await loadPublicProfessionals();
            
            // Initialiser la recherche
            setupPublicSearch();
            
            // Initialiser les filtres
            setupPublicFilters();
            
            // Initialiser les onglets
            setupPublicTabs();
            
            // Initialiser la pagination
            setupPublicPagination();
            
            console.log('✅ Annuaire View initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation annuaire public:', error);
            showError('Erreur lors du chargement de l\'annuaire');
        }
    }

    async function loadCategoriesForPublic() {
        try {
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            // Mettre à jour le select de filtre
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter && categories) {
                categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>' + 
                    categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
            }
            
            // Afficher les catégories dans l'onglet
            displayPublicCategories(categories);
            
            return categories;
        } catch (error) {
            console.error('❌ Erreur chargement catégories public:', error);
            return [];
        }
    }

    function displayPublicCategories(categories) {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid || !categories) return;
        
        // Pour chaque catégorie, compter les professionnels actifs
        Promise.all(categories.map(async (cat) => {
            const { count, error } = await supabase
                .from('annuaire')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id)
                .eq('status', 'active');
            
            return {
                ...cat,
                count: error ? 0 : count
            };
        })).then(categoriesWithCount => {
            categoriesGrid.innerHTML = categoriesWithCount.map(cat => `
                <div class="category-card" onclick="filterByCategory('${cat.id}')">
                    <div class="category-icon" style="background: ${cat.color || '#2196F3'}">
                        <i class="${cat.icon || 'fas fa-folder'}"></i>
                    </div>
                    <h4>${escapeHtml(cat.name)}</h4>
                    <span class="category-count">${cat.count} professionnel${cat.count !== 1 ? 's' : ''}</span>
                </div>
            `).join('');
        });
    }

    let currentPage = 1;
    const itemsPerPage = 12;
    let totalProfessionals = 0;
    let currentFilter = {
        category: '',
        status: 'active',
        rating: 0,
        search: ''
    };

    async function loadPublicProfessionals(page = 1, filters = currentFilter) {
        console.log('🔄 Chargement des professionnels publics...', { page, filters });
        
        const grid = document.getElementById('professionalsGrid');
        if (!grid) return;
        
        // Afficher le loading
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <div class="loading-spinner"></div>
                <p>Chargement des professionnels...</p>
            </div>
        `;
        
        try {
            let query = supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name,
                        icon,
                        color
                    )
                `, { count: 'exact' });
            
            // Appliquer les filtres
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.category) {
                query = query.eq('category_id', filters.category);
            }
            
            if (filters.rating > 0) {
                query = query.gte('rating', filters.rating);
            }
            
            if (filters.search.trim()) {
                query = query.or(`name.ilike.%${filters.search}%,specialty.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            
            // Pagination
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            query = query.order('created_at', { ascending: false })
                        .range(from, to);
            
            const { data: professionals, error, count } = await query;
            
            if (error) throw error;
            
            totalProfessionals = count || 0;
            currentPage = page;
            currentFilter = filters;
            
            // Mettre à jour les statistiques
            updatePublicStatistics();
            
            // Mettre à jour la pagination
            updatePublicPagination();
            
            if (!professionals || professionals.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-user-friends"></i>
                        <h3>Aucun professionnel trouvé</h3>
                        <p>${filters.search ? 'Aucun résultat pour votre recherche.' : 'Aucun professionnel disponible pour le moment.'}</p>
                        ${filters.search ? `<button onclick="resetFilters()" class="btn btn-primary" style="margin-top: 15px;">
                            <i class="fas fa-times"></i> Réinitialiser les filtres
                        </button>` : ''}
                    </div>
                `;
                return;
            }
            
            // Afficher les professionnels
            displayPublicProfessionals(professionals);
            
        } catch (error) {
            console.error('❌ Erreur chargement professionnels publics:', error);
            grid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Erreur de chargement</h3>
                    <p>Impossible de charger les professionnels. Veuillez réessayer.</p>
                    <button onclick="loadPublicProfessionals()" class="btn btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }

    function displayPublicProfessionals(professionals) {
        const grid = document.getElementById('professionalsGrid');
        
        grid.innerHTML = professionals.map(pro => {
            const categoryName = pro.categories?.name || 'Non catégorisé';
            const categoryColor = pro.categories?.color || '#d4af37';
            const statusClass = pro.status === 'active' ? 'status-active' : 
                               pro.status === 'pending' ? 'status-pending' : 'status-inactive';
            const statusText = pro.status === 'active' ? 'Actif' : 
                             pro.status === 'pending' ? 'En attente' : 'Inactif';
            
            return `
                <div class="professional-card" onclick="showProfessionalDetail('${pro.id}')">
                    <div class="card-header">
                        <div class="category-badge" style="background: ${categoryColor}">
                            ${escapeHtml(categoryName)}
                        </div>
                        <h3>${escapeHtml(pro.name)}</h3>
                        <div class="specialty">
                            <i class="fas fa-star"></i> ${escapeHtml(pro.specialty || 'Spécialité non spécifiée')}
                        </div>
                        <div class="rating">
                            <div class="rating-stars">
                                ${generateStars(pro.rating || 0)}
                            </div>
                            <span class="rating-value">${pro.rating ? pro.rating.toFixed(1) : 'Non noté'}/5</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="description">
                            ${escapeHtml(pro.description?.substring(0, 150) || 'Aucune description disponible')}...
                        </div>
                        <div class="contact-info">
                            ${pro.contact_info ? `
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>${escapeHtml(pro.contact_info.length > 30 ? pro.contact_info.substring(0, 30) + '...' : pro.contact_info)}</span>
                            </div>
                            ` : ''}
                            ${pro.location ? `
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${escapeHtml(pro.location)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="location">
                            <i class="fas fa-calendar"></i>
                            <span>Ajouté le ${new Date(pro.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="status-badge ${statusClass}">
                            ${statusText}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupPublicSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', debounce(function() {
            currentFilter.search = this.value;
            loadPublicProfessionals(1, currentFilter);
        }, 500));
    }

    function setupPublicFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                currentFilter.category = this.value;
                loadPublicProfessionals(1, currentFilter);
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                currentFilter.status = this.value;
                loadPublicProfessionals(1, currentFilter);
            });
        }
        
        if (ratingFilter) {
            ratingFilter.addEventListener('change', function() {
                currentFilter.rating = parseInt(this.value) || 0;
                loadPublicProfessionals(1, currentFilter);
            });
        }
    }

    function setupPublicTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Désactiver tous les onglets
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabId}Tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
                
                // Charger les données spécifiques à l'onglet
                switch(tabId) {
                    case 'categories':
                        loadCategoriesForPublic();
                        break;
                    case 'featured':
                        loadFeaturedProfessionals();
                        break;
                    default:
                        loadPublicProfessionals();
                }
            });
        });
    }

    function setupPublicPagination() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        
        if (!prevBtn || !nextBtn || !pageInfo) return;
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadPublicProfessionals(currentPage - 1, currentFilter);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(totalProfessionals / itemsPerPage);
            if (currentPage < totalPages) {
                loadPublicProfessionals(currentPage + 1, currentFilter);
            }
        });
    }

    function updatePublicPagination() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        
        if (!prevBtn || !nextBtn || !pageInfo) return;
        
        const totalPages = Math.ceil(totalProfessionals / itemsPerPage);
        
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages} (${totalProfessionals} professionnels)`;
    }

    async function updatePublicStatistics() {
        // Compter les photographes
        const { count: photographersCount } = await supabase
            .from('annuaire')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', 'photographers')
            .eq('status', 'active');
        
        // Compter les stylistes
        const { count: stylistsCount } = await supabase
            .from('annuaire')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', 'stylists')
            .eq('status', 'active');
        
        // Mettre à jour l'affichage
        document.getElementById('totalCount').textContent = totalProfessionals;
        document.getElementById('photographersCount').textContent = photographersCount || 0;
        document.getElementById('stylistsCount').textContent = stylistsCount || 0;
    }

    async function loadFeaturedProfessionals() {
        const grid = document.getElementById('featuredGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <div class="loading-spinner"></div>
                <p>Chargement des recommandations...</p>
            </div>
        `;
        
        try {
            const { data: professionals, error } = await supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name,
                        icon,
                        color
                    )
                `)
                .eq('status', 'active')
                .gte('rating', 4)
                .order('rating', { ascending: false })
                .limit(6);
            
            if (error) throw error;
            
            if (!professionals || professionals.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-crown"></i>
                        <h3>Aucune recommandation</h3>
                        <p>Aucun professionnel ne correspond aux critères de recommandation.</p>
                    </div>
                `;
                return;
            }
            
            displayFeaturedProfessionals(professionals);
            
        } catch (error) {
            console.error('❌ Erreur chargement recommandations:', error);
            grid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Erreur de chargement</h3>
                    <p>Impossible de charger les recommandations.</p>
                </div>
            `;
        }
    }

    function displayFeaturedProfessionals(professionals) {
        const grid = document.getElementById('featuredGrid');
        
        grid.innerHTML = professionals.map(pro => {
            const categoryName = pro.categories?.name || 'Non catégorisé';
            const categoryColor = pro.categories?.color || '#d4af37';
            
            return `
                <div class="professional-card" onclick="showProfessionalDetail('${pro.id}')">
                    <div class="card-header">
                        <div class="category-badge" style="background: ${categoryColor}">
                            ${escapeHtml(categoryName)}
                        </div>
                        <h3>${escapeHtml(pro.name)}</h3>
                        <div class="specialty">
                            <i class="fas fa-crown" style="color: #ffc107;"></i> ${escapeHtml(pro.specialty || 'Spécialité non spécifiée')}
                        </div>
                        <div class="rating">
                            <div class="rating-stars">
                                ${generateStars(pro.rating || 0)}
                            </div>
                            <span class="rating-value">${pro.rating ? pro.rating.toFixed(1) : 'Non noté'}/5</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="description">
                            ${escapeHtml(pro.description?.substring(0, 120) || 'Aucune description disponible')}...
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="location">
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <span>Professionnel recommandé</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // 5. DASHBOARD ANNUAIRE (dashboard-annuaire.html)
    // ============================================
    
    async function initDashboardAnnuaire() {
        console.log('🔄 Initialisation Dashboard Annuaire (créateur)...');
        
        try {
            // Vérifier la connexion créateur
            const creatorId = sessionStorage.getItem('creatorId');
            if (!creatorId) {
                window.location.href = 'index.html';
                return;
            }
            
            // Charger les catégories
            await loadCategoriesForDashboard();
            
            // Charger les professionnels
            await loadDashboardProfessionals();
            
            // Initialiser la recherche
            setupDashboardSearch();
            
            // Initialiser les filtres
            setupDashboardFilters();
            
            // Initialiser le formulaire d'ajout
            setupDashboardAddForm();
            
            console.log('✅ Dashboard Annuaire initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation dashboard:', error);
            showError('Erreur lors du chargement de l\'annuaire');
        }
    }

    async function loadCategoriesForDashboard() {
        try {
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            // Mettre à jour le select du formulaire
            const categorySelect = document.getElementById('proCategory');
            if (categorySelect && categories) {
                categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>' + 
                    categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
            }
            
            // Afficher les cartes de catégories
            displayDashboardCategoryCards(categories);
            
            return categories;
        } catch (error) {
            console.error('❌ Erreur chargement catégories dashboard:', error);
            return [];
        }
    }

    async function displayDashboardCategoryCards(categories) {
        const grid = document.getElementById('categoriesGrid');
        if (!grid || !categories) return;
        
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const { count, error } = await supabase
                    .from('annuaire')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id)
                    .eq('status', 'active');
                
                return {
                    ...cat,
                    count: error ? 0 : count
                };
            })
        );
        
        grid.innerHTML = categoriesWithCount.map(cat => `
            <div class="category-card">
                <div class="category-icon" style="background: ${cat.color || '#2196F3'}">
                    <i class="${cat.icon || 'fas fa-folder'}"></i>
                </div>
                <h3>${escapeHtml(cat.name)}</h3>
                <p>${escapeHtml(cat.description || 'Professionnels spécialisés')}</p>
                <span class="category-count">${cat.count || 0} professionnel${cat.count !== 1 ? 's' : ''}</span>
            </div>
        `).join('');
    }

    async function loadDashboardProfessionals(category = 'all', search = '') {
        const grid = document.getElementById('professionalsGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <div class="spinner" style="margin: 0 auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px;">Chargement des professionnels...</p>
            </div>
        `;
        
        try {
            let query = supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name,
                        icon,
                        color
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            
            if (category !== 'all') {
                query = query.eq('category_id', category);
            }
            
            if (search.trim()) {
                query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,description.ilike.%${search}%`);
            }
            
            const { data: professionals, error } = await query;
            
            if (error) throw error;
            
            if (!professionals || professionals.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 10px;">Aucun professionnel trouvé</h3>
                        <p>${search ? 'Aucun résultat pour votre recherche.' : 'Aucun professionnel disponible pour le moment.'}</p>
                    </div>
                `;
                return;
            }
            
            displayDashboardProfessionals(professionals);
            
        } catch (error) {
            console.error('❌ Erreur chargement professionnels dashboard:', error);
            grid.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 10px;">Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="loadDashboardProfessionals()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }

    function displayDashboardProfessionals(professionals) {
        const grid = document.getElementById('professionalsGrid');
        
        grid.innerHTML = professionals.map(pro => {
            const categoryName = pro.categories?.name || 'Non catégorisé';
            const categoryColor = pro.categories?.color || '#d4af37';
            const categoryIcon = pro.categories?.icon || 'fas fa-user';
            
            return `
                <div class="professional-card">
                    <div class="professional-header">
                        <div class="pro-avatar" style="background: ${categoryColor}20; color: ${categoryColor};">
                            <i class="${categoryIcon}"></i>
                        </div>
                        <div class="pro-info">
                            <span class="pro-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                                ${escapeHtml(categoryName)}
                            </span>
                            <h3>${escapeHtml(pro.name)}</h3>
                            <div class="pro-rating">
                                ${generateStars(pro.rating || 0)}
                                <span>${pro.rating ? pro.rating.toFixed(1) : 'Non noté'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="professional-body">
                        <div class="pro-specialty">
                            <i class="fas fa-star"></i> ${escapeHtml(pro.specialty || 'Spécialité non spécifiée')}
                        </div>
                        <p class="pro-description">
                            ${escapeHtml(pro.description?.substring(0, 150) || 'Aucune description disponible')}
                            ${pro.description && pro.description.length > 150 ? '...' : ''}
                        </p>
                    </div>
                    
                    <div class="professional-footer">
                        <div class="pro-contact">
                            <i class="fas fa-envelope"></i> 
                            ${escapeHtml(pro.contact_info?.length > 30 ? pro.contact_info.substring(0, 30) + '...' : pro.contact_info || 'Non disponible')}
                        </div>
                        <button class="btn btn-outline contact-btn" 
                                onclick="contactProfessional('${escapeHtml(pro.name)}', '${escapeHtml(pro.contact_info)}', '${escapeHtml(pro.website)}', '${escapeHtml(pro.instagram)}')"
                                style="white-space: nowrap;">
                            <i class="fas fa-paper-plane"></i> Contacter
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupDashboardSearch() {
        const searchInput = document.getElementById('directorySearch');
        const searchBtn = document.getElementById('searchBtn');
        
        if (!searchInput || !searchBtn) return;
        
        searchBtn.addEventListener('click', async function() {
            const activeCategory = document.querySelector('.category-filter.active');
            const category = activeCategory ? activeCategory.dataset.category : 'all';
            await loadDashboardProfessionals(category, searchInput.value);
        });
        
        searchInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                const activeCategory = document.querySelector('.category-filter.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                await loadDashboardProfessionals(category, this.value);
            }
        });
        
        searchInput.addEventListener('input', debounce(async function() {
            const activeCategory = document.querySelector('.category-filter.active');
            const category = activeCategory ? activeCategory.dataset.category : 'all';
            await loadDashboardProfessionals(category, this.value);
        }, 500));
    }

    function setupDashboardFilters() {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.addEventListener('click', async function() {
                filters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.dataset.category;
                const searchInput = document.getElementById('directorySearch');
                await loadDashboardProfessionals(category, searchInput?.value || '');
            });
        });
    }

    function setupDashboardAddForm() {
        const addBtn = document.getElementById('addProfessionalBtn');
        const modal = document.getElementById('addProfessionalModal');
        const closeModal = modal?.querySelector('.close-modal');
        const form = document.getElementById('professionalForm');
        
        if (addBtn && modal) {
            addBtn.addEventListener('click', function() {
                modal.classList.add('active');
            });
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.classList.remove('active');
                if (form) form.reset();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                    if (form) form.reset();
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
                
                const formData = {
                    name: document.getElementById('proName').value.trim(),
                    category_id: document.getElementById('proCategory').value,
                    specialty: document.getElementById('proSpecialty').value.trim(),
                    contact_info: document.getElementById('proContact').value.trim(),
                    description: document.getElementById('proDescription').value.trim(),
                    location: document.getElementById('proLocation')?.value.trim() || null,
                    website: document.getElementById('proWebsite')?.value.trim() || null,
                    instagram: document.getElementById('proInstagram')?.value.trim() || null,
                    status: 'pending',
                    type: 'suggested'
                };
                
                try {
                    if (!formData.name || !formData.category_id || !formData.contact_info) {
                        throw new Error('Veuillez remplir tous les champs obligatoires');
                    }
                    
                    const { data, error } = await supabase
                        .from('annuaire')
                        .insert([formData]);
                    
                    if (error) throw error;
                    
                    showSuccess('Votre suggestion a été soumise avec succès ! Elle sera examinée par notre équipe.');
                    
                    modal.classList.remove('active');
                    this.reset();
                    
                    // Recharger les professionnels
                    await loadDashboardProfessionals();
                    
                } catch (error) {
                    console.error('❌ Erreur soumission:', error);
                    showError('Erreur lors de la soumission: ' + error.message);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }
    }

    // ============================================
    // 6. FONCTIONS GLOBALES
    // ============================================

    window.filterByCategory = function(categoryId) {
        // Pour annuaire-view.html
        if (document.getElementById('categoryFilter')) {
            document.getElementById('categoryFilter').value = categoryId;
            currentFilter.category = categoryId;
            loadPublicProfessionals(1, currentFilter);
            
            // Basculer sur l'onglet professionnels
            const tabBtn = document.querySelector('.tab-btn[data-tab="professionals"]');
            if (tabBtn) tabBtn.click();
        }
    };

    window.resetFilters = function() {
        // Pour annuaire-view.html
        if (document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('statusFilter').value = 'active';
            document.getElementById('ratingFilter').value = '0';
            
            currentFilter = {
                category: '',
                status: 'active',
                rating: 0,
                search: ''
            };
            
            loadPublicProfessionals(1, currentFilter);
        }
    };

    window.showProfessionalDetail = async function(id) {
        try {
            const { data: professional, error } = await supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name,
                        icon,
                        color,
                        description
                    )
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (!professional) {
                showError('Professionnel non trouvé');
                return;
            }
            
            const modal = document.getElementById('detailModal');
            const modalContent = document.getElementById('modalContent');
            
            if (!modal || !modalContent) return;
            
            const categoryName = professional.categories?.name || 'Non catégorisé';
            const categoryColor = professional.categories?.color || '#d4af37';
            const statusClass = professional.status === 'active' ? 'status-active' : 
                               professional.status === 'pending' ? 'status-pending' : 'status-inactive';
            const statusText = professional.status === 'active' ? 'Actif' : 
                             professional.status === 'pending' ? 'En attente' : 'Inactif';
            
            modalContent.innerHTML = `
                <div style="padding: 40px;">
                    <div style="display: flex; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px;">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                                <div style="width: 80px; height: 80px; background: ${categoryColor}20; color: ${categoryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                                    <i class="${professional.categories?.icon || 'fas fa-user'}"></i>
                                </div>
                                <div>
                                    <h2 style="margin: 0 0 5px 0; color: #333;">${escapeHtml(professional.name)}</h2>
                                    <div class="status-badge ${statusClass}" style="display: inline-block;">
                                        ${statusText}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h3 style="color: #d4af37; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-star"></i> Spécialité
                                </h3>
                                <p style="font-size: 1.1rem; color: #555;">${escapeHtml(professional.specialty || 'Non spécifiée')}</p>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h3 style="color: #d4af37; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-tag"></i> Catégorie
                                </h3>
                                <div class="category-badge" style="background: ${categoryColor}; display: inline-block; padding: 8px 20px; border-radius: 20px; color: white; font-weight: 600;">
                                    ${escapeHtml(categoryName)}
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h3 style="color: #d4af37; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-star-half-alt"></i> Note
                                </h3>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="font-size: 1.2rem; color: #ffc107;">
                                        ${generateStars(professional.rating || 0)}
                                    </div>
                                    <span style="font-size: 1.2rem; font-weight: bold; color: #666;">
                                        ${professional.rating ? professional.rating.toFixed(1) : 'Non noté'}/5
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="flex: 1; min-width: 300px;">
                            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px;">
                                <h3 style="color: #d4af37; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-address-card"></i> Informations de contact
                                </h3>
                                
                                <div style="display: grid; gap: 15px;">
                                    ${professional.contact_info ? `
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="fas fa-envelope" style="color: #d4af37; width: 24px;"></i>
                                        <div>
                                            <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Contact</div>
                                            <div style="color: #666; font-size: 0.95rem;">${escapeHtml(professional.contact_info)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    
                                    ${professional.location ? `
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="fas fa-map-marker-alt" style="color: #d4af37; width: 24px;"></i>
                                        <div>
                                            <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Localisation</div>
                                            <div style="color: #666; font-size: 0.95rem;">${escapeHtml(professional.location)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    
                                    ${professional.website ? `
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="fas fa-globe" style="color: #d4af37; width: 24px;"></i>
                                        <div>
                                            <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Site web</div>
                                            <div style="color: #666; font-size: 0.95rem;">
                                                <a href="${professional.website}" target="_blank" style="color: #d4af37; text-decoration: none;">
                                                    ${escapeHtml(professional.website)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    
                                    ${professional.instagram ? `
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="fab fa-instagram" style="color: #d4af37; width: 24px;"></i>
                                        <div>
                                            <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Instagram</div>
                                            <div style="color: #666; font-size: 0.95rem;">
                                                <a href="https://instagram.com/${professional.instagram.replace('@', '')}" target="_blank" style="color: #d4af37; text-decoration: none;">
                                                    ${escapeHtml(professional.instagram)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="fas fa-calendar" style="color: #d4af37; width: 24px;"></i>
                                        <div>
                                            <div style="font-weight: 600; color: #555; margin-bottom: 2px;">Date d'ajout</div>
                                            <div style="color: #666; font-size: 0.95rem;">
                                                ${new Date(professional.created_at).toLocaleDateString('fr-FR', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 25px; display: flex; gap: 10px;">
                                    <button onclick="copyProfessionalInfo('${escapeHtml(professional.name)}', '${escapeHtml(professional.contact_info)}', '${escapeHtml(professional.website)}', '${escapeHtml(professional.instagram)}')" 
                                            class="btn btn-primary" style="flex: 1;">
                                        <i class="fas fa-copy"></i> Copier les coordonnées
                                    </button>
                                    ${professional.website ? `
                                    <button onclick="window.open('${professional.website}', '_blank')" 
                                            class="btn btn-outline" style="flex: 1;">
                                        <i class="fas fa-external-link-alt"></i> Visiter le site
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <h3 style="color: #d4af37; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-align-left"></i> Description
                        </h3>
                        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; line-height: 1.7; color: #555;">
                            ${escapeHtml(professional.description || 'Aucune description disponible.')}
                        </div>
                    </div>
                    
                    ${professional.categories?.description ? `
                    <div style="margin-top: 30px;">
                        <h3 style="color: #d4af37; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-info-circle"></i> À propos de la catégorie
                        </h3>
                        <div style="background: ${categoryColor}10; padding: 20px; border-radius: 12px; line-height: 1.6; color: #555; border-left: 4px solid ${categoryColor};">
                            ${escapeHtml(professional.categories.description)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            modal.style.display = 'flex';
            
            // Fermer le modal
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.onclick = () => modal.style.display = 'none';
            }
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };
            
        } catch (error) {
            console.error('❌ Erreur chargement détail:', error);
            showError('Erreur lors du chargement des détails');
        }
    };

    window.copyProfessionalInfo = function(name, contact, website, instagram) {
        let info = `Coordonnées de ${name}:\n\n`;
        info += `Contact: ${contact}\n`;
        if (website) info += `Site web: ${website}\n`;
        if (instagram) info += `Instagram: ${instagram}\n`;
        
        navigator.clipboard.writeText(info).then(() => {
            showSuccess('Coordonnées copiées dans le presse-papier !');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            showError('Impossible de copier les coordonnées');
        });
    };

    window.contactProfessional = function(name, contact, website, instagram) {
        let contactInfo = `Nom: ${name}\n`;
        contactInfo += `Contact: ${contact}\n`;
        if (website) contactInfo += `Site web: ${website}\n`;
        if (instagram) contactInfo += `Instagram: ${instagram}\n`;
        
        const modalHTML = `
            <div class="modal" style="display: flex;" id="contactModal">
                <div class="modal-content" style="max-width: 500px;">
                    <button class="modal-close" onclick="document.getElementById('contactModal').remove()">&times;</button>
                    <div style="padding: 30px;">
                        <h2 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-paper-plane"></i> Contacter ${escapeHtml(name)}
                        </h2>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                            <p style="color: #666; margin-bottom: 15px;"><strong>Coordonnées :</strong></p>
                            <div style="display: grid; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-envelope" style="color: #d4af37;"></i>
                                    <span style="color: #555;">${escapeHtml(contact)}</span>
                                </div>
                                ${website ? `
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-globe" style="color: #d4af37;"></i>
                                    <a href="${website}" target="_blank" style="color: #d4af37; text-decoration: none;">${escapeHtml(website)}</a>
                                </div>
                                ` : ''}
                                ${instagram ? `
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fab fa-instagram" style="color: #d4af37;"></i>
                                    <a href="https://instagram.com/${instagram.replace('@', '')}" target="_blank" style="color: #d4af37; text-decoration: none;">${escapeHtml(instagram)}</a>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button onclick="copyProfessionalInfo('${escapeHtml(name)}', '${escapeHtml(contact)}', '${escapeHtml(website)}', '${escapeHtml(instagram)}')" 
                                    class="btn btn-primary" style="padding: 12px 24px;">
                                <i class="fas fa-copy"></i> Copier
                            </button>
                            <button onclick="document.getElementById('contactModal').remove()" 
                                    class="btn btn-secondary" style="padding: 12px 24px;">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstChild);
    };

    // Gestionnaire d'événements pour fermer les modals avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('detailModal');
            if (modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
            
            const contactModal = document.getElementById('contactModal');
            if (contactModal) {
                contactModal.remove();
            }
            
            const addModal = document.getElementById('addProfessionalModal');
            if (addModal && addModal.classList.contains('active')) {
                addModal.classList.remove('active');
            }
        }
    });

    console.log('✅ Script annuaire complètement chargé !');
});
