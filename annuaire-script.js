// annuaire-script.js - Gestion complète de l'annuaire professionnel avec Supabase

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
    
    if (currentPath.includes('dashboard-annuaire.html')) {
        console.log('📄 Page Dashboard Annuaire détectée');
        await initDashboardAnnuaire();
    } else if (currentPath.includes('manage-annuaire.html')) {
        console.log('📄 Page Manage Annuaire détectée');
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
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorDiv.innerHTML = `<strong>Erreur:</strong> ${message}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        successDiv.innerHTML = `<strong>Succès:</strong> ${message}`;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // ============================================
    // 4. DASHBOARD ANNUAIRE (Vue créateur)
    // ============================================
    
    async function initDashboardAnnuaire() {
        console.log('🔄 Initialisation Dashboard Annuaire...');
        
        try {
            // Charger les catégories pour les filtres
            await loadCategories();
            
            // Charger les professionnels
            await loadProfessionals();
            
            // Initialiser la recherche
            setupSearch();
            
            // Initialiser le formulaire d'ajout
            setupAddProfessionalForm();
            
            // Initialiser les boutons de contact
            setupContactButtons();
            
            console.log('✅ Dashboard Annuaire initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation dashboard:', error);
            showError('Erreur lors du chargement de l\'annuaire');
        }
    }

    async function loadCategories() {
        try {
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            // Mettre à jour les compteurs dans les cartes catégories
            if (categories && categories.length > 0) {
                for (const category of categories) {
                    // Compter les professionnels actifs par catégorie
                    const { count, error: countError } = await supabase
                        .from('annuaire')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', category.id)
                        .eq('status', 'active');
                    
                    if (!countError) {
                        // Mettre à jour l'affichage si l'élément existe
                        const categoryElement = document.querySelector(`[data-category-id="${category.id}"]`);
                        if (categoryElement) {
                            const countSpan = categoryElement.querySelector('.category-count');
                            if (countSpan) {
                                countSpan.textContent = `${count || 0} professionnels`;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
        }
    }

    async function loadProfessionals(category = 'all', searchTerm = '') {
        console.log('🔄 Chargement des professionnels...');
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

            // Filtrer par catégorie si spécifiée
            if (category !== 'all') {
                query = query.eq('category_id', category);
            }

            // Filtrer par recherche si spécifiée
            if (searchTerm.trim()) {
                query = query.or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length === 0) {
                grid.innerHTML = `
                    <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 10px;">Aucun professionnel trouvé</h3>
                        <p>${searchTerm ? 'Aucun résultat pour votre recherche.' : 'Aucun professionnel disponible pour le moment.'}</p>
                        ${!searchTerm && category === 'all' ? '<button class="btn btn-primary" onclick="window.location.reload()" style="margin-top: 20px;"><i class="fas fa-redo"></i> Réessayer</button>' : ''}
                    </div>
                `;
                return;
            }

            grid.innerHTML = data.map(pro => {
                const categoryName = pro.categories?.name || 'Non catégorisé';
                const categoryColor = pro.categories?.color || '#d4af37';
                const categoryIcon = pro.categories?.icon || 'fas fa-user';
                
                return `
                    <div class="professional-card" data-id="${pro.id}" data-category="${pro.category_id}">
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

            console.log(`✅ ${data.length} professionnels chargés`);

        } catch (error) {
            console.error('❌ Erreur chargement professionnels:', error);
            grid.innerHTML = `
                <div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 10px;">Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-outline" onclick="window.location.reload()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }

    function setupSearch() {
        const searchInput = document.getElementById('directorySearch');
        const searchButton = document.querySelector('.directory-search .btn-primary');

        if (searchInput && searchButton) {
            // Recherche sur bouton
            searchButton.addEventListener('click', async function() {
                const activeCategory = document.querySelector('.category-filter.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                await loadProfessionals(category, searchInput.value);
            });

            // Recherche sur Entrée
            searchInput.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter') {
                    const activeCategory = document.querySelector('.category-filter.active');
                    const category = activeCategory ? activeCategory.dataset.category : 'all';
                    await loadProfessionals(category, this.value);
                }
            });

            // Recherche en temps réel (débounced)
            searchInput.addEventListener('input', debounce(async function() {
                const activeCategory = document.querySelector('.category-filter.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                await loadProfessionals(category, this.value);
            }, 500));
        }
    }

    function setupAddProfessionalForm() {
        const addBtn = document.getElementById('addProfessionalBtn');
        const modal = document.getElementById('addProfessionalModal');
        const closeModal = modal?.querySelector('.close-modal');
        const form = document.getElementById('professionalForm');

        if (addBtn && modal) {
            addBtn.addEventListener('click', function() {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                if (form) form.reset();
            });
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                    if (form) form.reset();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
                
                const formData = {
                    name: document.getElementById('proName').value.trim(),
                    category_id: document.getElementById('proCategory').value,
                    specialty: document.getElementById('proSpecialty').value.trim(),
                    contact_info: document.getElementById('proContact').value.trim(),
                    description: document.getElementById('proDescription').value.trim(),
                    status: 'pending',
                    type: 'suggested'
                };

                console.log('📝 Soumission professionnel:', formData);

                try {
                    // Validation
                    if (!formData.name || !formData.contact_info) {
                        throw new Error('Le nom et le contact sont obligatoires');
                    }

                    const { data, error } = await supabase
                        .from('annuaire')
                        .insert([formData]);

                    if (error) throw error;

                    showSuccess('Votre suggestion a été soumise avec succès ! Elle sera examinée par notre équipe.');
                    
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                    form.reset();
                    
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

    function setupContactButtons() {
        // Cette fonction sera appelée dynamiquement quand les cartes sont chargées
    }

    // ============================================
    // 5. MANAGE ANNUAIRE (Vue admin)
    // ============================================
    
    async function initManageAnnuaire() {
        console.log('🔄 Initialisation Manage Annuaire...');
        
        // Vérifier les droits admin
        if (window.SessionManager && !window.SessionManager.isAdmin()) {
            showError('Accès non autorisé. Connectez-vous en tant qu\'administrateur.');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
            return;
        }

        try {
            // Charger les catégories pour les selects
            await loadCategoriesForSelect();
            
            // Charger les catégories pour l'affichage
            await loadCategoriesList();
            
            // Charger les statistiques
            await loadStatistics();
            
            // Charger les professionnels
            await loadAllProfessionals();
            
            // Initialiser les onglets
            setupManageTabs();
            
            // Initialiser les filtres
            setupManageFilters();
            
            // Initialiser les modals
            setupManageModals();
            
            console.log('✅ Manage Annuaire initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation manage:', error);
            showError('Erreur lors du chargement de la gestion');
        }
    }

    async function loadCategoriesForSelect() {
        try {
            const { data, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');

            if (error) throw error;

            // Mettre à jour tous les selects de catégorie
            const selects = document.querySelectorAll('select[id*="category"], select[id$="category_id"]');
            selects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Sélectionnez une catégorie</option>' +
                        (data?.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('') || '');
                }
            });

        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
            showError('Erreur lors du chargement des catégories');
        }
    }

    async function loadCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        try {
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');

            if (error) throw error;

            if (!categories || categories.length === 0) {
                categoriesList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                        <h3>Aucune catégorie définie</h3>
                        <p>Ajoutez votre première catégorie.</p>
                    </div>
                `;
                return;
            }

            // Pour chaque catégorie, compter les professionnels
            const categoriesWithCount = await Promise.all(
                categories.map(async (cat) => {
                    const { count, error: countError } = await supabase
                        .from('annuaire')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', cat.id);
                    
                    return {
                        ...cat,
                        count: countError ? 0 : count
                    };
                })
            );

            categoriesList.innerHTML = categoriesWithCount.map(cat => `
                <div class="category-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${cat.color}20; color: ${cat.color}; display: flex; align-items: center; justify-content: center;">
                                <i class="${cat.icon}"></i>
                            </div>
                            <h3 style="margin: 0;">${escapeHtml(cat.name)}</h3>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-edit-category" onclick="editCategory('${cat.id}')" style="padding: 5px 10px; background: #ffc107; color: #1a1a1a; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete-category" onclick="deleteCategory('${cat.id}', '${escapeHtml(cat.name)}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <p style="color: #666; margin-bottom: 15px; font-size: 0.9rem;">
                        ${escapeHtml(cat.description || 'Aucune description')}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="category-count" style="background: #f8f9fa; color: #d4af37; padding: 0.3rem 1rem; border-radius: 15px; font-weight: 600; font-size: 0.9rem;">
                            ${cat.count} professionnel${cat.count !== 1 ? 's' : ''}
                        </span>
                        <span style="color: #999; font-size: 0.8rem;">
                            ${cat.color ? `<div style="width: 20px; height: 20px; border-radius: 50%; background: ${cat.color}; display: inline-block; margin-right: 5px;"></div>` : ''}
                        </span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Erreur chargement liste catégories:', error);
            categoriesList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                    <h3>Erreur de chargement</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async function loadStatistics() {
        try {
            const { data: professionals, error } = await supabase
                .from('annuaire')
                .select('category_id, status');

            if (error) throw error;

            // Calculer les statistiques
            const total = professionals?.length || 0;
            const active = professionals?.filter(p => p.status === 'active').length || 0;
            const pending = professionals?.filter(p => p.status === 'pending').length || 0;
            
            // Compter par catégorie (approximation basée sur les IDs)
            const photographers = professionals?.filter(p => p.category_id === 'photographers' && p.status === 'active').length || 0;
            const stylists = professionals?.filter(p => p.category_id === 'stylists' && p.status === 'active').length || 0;
            const models = professionals?.filter(p => p.category_id === 'models' && p.status === 'active').length || 0;

            // Mettre à jour l'affichage
            updateElement('totalProfessionals', total);
            updateElement('activeProfessionals', active);
            updateElement('pendingBadge', pending);
            updateElement('photographersCount', photographers);
            updateElement('stylistsCount', stylists);
            updateElement('modelsCount', models);

        } catch (error) {
            console.error('❌ Erreur chargement statistiques:', error);
        }
    }

    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            
            // Pour les badges, gérer l'affichage
            if (id === 'pendingBadge') {
                element.style.display = value > 0 ? 'inline-block' : 'none';
            }
        }
    }

    async function loadAllProfessionals(search = '', category = '', status = '') {
        console.log('🔄 Chargement de tous les professionnels...');
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
                .order('created_at', { ascending: false });

            // Appliquer les filtres
            if (search.trim()) {
                query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,description.ilike.%${search}%,contact_info.ilike.%${search}%`);
            }

            if (category) {
                query = query.eq('category_id', category);
            }

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Mettre à jour les statistiques
            await loadStatistics();

            if (!data || data.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 10px;">Aucun professionnel trouvé</h3>
                        <p>${search || category || status ? 'Aucun résultat pour vos critères.' : 'Aucun professionnel dans la base de données.'}</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = data.map(pro => {
                const categoryName = pro.categories?.name || 'Non catégorisé';
                const categoryColor = pro.categories?.color || '#d4af37';
                const statusColor = pro.status === 'active' ? '#28a745' : 
                                  pro.status === 'pending' ? '#ffc107' : '#dc3545';
                const statusText = pro.status === 'active' ? 'Actif' : 
                                 pro.status === 'pending' ? 'En attente' : 'Inactif';

                return `
                    <div class="professional-card" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
                        <div class="professional-header" style="padding: 1.5rem; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); display: flex; gap: 1rem; align-items: center;">
                            <div class="pro-avatar" style="width: 60px; height: 60px; background: ${categoryColor}20; color: ${categoryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                <i class="${pro.categories?.icon || 'fas fa-user'}"></i>
                            </div>
                            <div class="pro-info" style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <span class="pro-category" style="display: inline-block; background: ${categoryColor}20; color: ${categoryColor}; padding: 0.2rem 0.8rem; border-radius: 12px; font-size: 0.8rem; margin-bottom: 0.5rem;">
                                            ${escapeHtml(categoryName)}
                                        </span>
                                        <h3 style="margin: 0.3rem 0; font-size: 1.2rem; color: #1a1a1a;">${escapeHtml(pro.name)}</h3>
                                    </div>
                                    <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; padding: 0.2rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                        ${statusText}
                                    </span>
                                </div>
                                <div class="pro-rating" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                    ${generateStars(pro.rating || 0)}
                                    <span style="color: #666; font-size: 0.9rem;">${pro.rating ? pro.rating.toFixed(1) : 'Non noté'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="professional-body" style="padding: 1.5rem; border-bottom: 1px solid #eee;">
                            <div style="color: #d4af37; font-weight: 600; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-star"></i> ${escapeHtml(pro.specialty || 'Non spécifié')}
                            </div>
                            <p style="color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">
                                ${escapeHtml(pro.description?.substring(0, 100) || 'Aucune description')}...
                            </p>
                            <div style="font-size: 0.85rem; color: #888;">
                                <div style="margin-bottom: 0.3rem;"><i class="fas fa-envelope"></i> ${escapeHtml(pro.contact_info)}</div>
                                ${pro.location ? `<div style="margin-bottom: 0.3rem;"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(pro.location)}</div>` : ''}
                                ${pro.website ? `<div style="margin-bottom: 0.3rem;"><i class="fas fa-globe"></i> ${escapeHtml(pro.website)}</div>` : ''}
                                ${pro.instagram ? `<div><i class="fab fa-instagram"></i> ${escapeHtml(pro.instagram)}</div>` : ''}
                            </div>
                        </div>
                        
                        <div class="professional-footer" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #666; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar"></i> ${new Date(pro.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-edit" onclick="editProfessional('${pro.id}')" style="padding: 0.4rem 0.8rem; background: #ffc107; color: #1a1a1a; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s;">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-delete" onclick="deleteProfessional('${pro.id}', '${escapeHtml(pro.name)}')" style="padding: 0.4rem 0.8rem; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s;">
                                    <i class="fas fa-trash"></i>
                                </button>
                                ${pro.status === 'pending' ? `
                                <button class="btn btn-approve" onclick="approveProfessional('${pro.id}')" style="padding: 0.4rem 0.8rem; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s;">
                                    <i class="fas fa-check"></i>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            console.log(`✅ ${data.length} professionnels chargés pour la gestion`);

        } catch (error) {
            console.error('❌ Erreur chargement professionnels:', error);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 10px;">Erreur de chargement</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async function loadPendingSubmissions() {
        const pendingList = document.getElementById('pendingList');
        if (!pendingList) return;

        pendingList.innerHTML = `
            <div class="loading" style="text-align: center; padding: 40px; color: #666;">
                <div class="spinner" style="margin: 0 auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px;">Chargement des soumissions...</p>
            </div>
        `;

        try {
            const { data, error } = await supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name,
                        icon,
                        color
                    )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Mettre à jour le badge
            const pendingBadge = document.getElementById('pendingBadge');
            if (pendingBadge) {
                pendingBadge.textContent = data?.length || 0;
                pendingBadge.style.display = data?.length > 0 ? 'inline-block' : 'none';
            }

            if (!data || data.length === 0) {
                pendingList.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 10px;">Aucune soumission en attente</h3>
                        <p>Toutes les soumissions ont été traitées.</p>
                    </div>
                `;
                return;
            }

            pendingList.innerHTML = data.map(pro => {
                const categoryName = pro.categories?.name || 'Non catégorisé';
                const categoryColor = pro.categories?.color || '#d4af37';

                return `
                    <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <div style="flex: 1;">
                                <h3 style="margin: 0 0 5px 0; color: #1a1a1a;">${escapeHtml(pro.name)}</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.9rem; color: #666;">
                                    <span style="display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-folder" style="color: ${categoryColor};"></i> 
                                        ${escapeHtml(categoryName)}
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-calendar"></i> 
                                        ${new Date(pro.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-envelope"></i> 
                                        ${escapeHtml(pro.contact_info?.length > 25 ? pro.contact_info.substring(0, 25) + '...' : pro.contact_info)}
                                    </span>
                                </div>
                            </div>
                            <span style="background: #ffc10720; color: #ffc107; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">
                                En attente
                            </span>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <strong>Spécialité:</strong> ${escapeHtml(pro.specialty || 'Non spécifiée')}
                        </div>
                        
                        <div style="margin-bottom: 20px; color: #666; font-size: 0.95rem; line-height: 1.5;">
                            ${escapeHtml(pro.description?.substring(0, 200) || 'Aucune description')}...
                        </div>
                        
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="approveProfessional('${pro.id}')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s; display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-check"></i> Approuver
                            </button>
                            <button class="btn btn-secondary" onclick="editProfessional('${pro.id}')" style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s; display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="btn btn-danger" onclick="deleteProfessional('${pro.id}', '${escapeHtml(pro.name)}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; transition: opacity 0.3s; display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-times"></i> Refuser
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('❌ Erreur chargement soumissions:', error);
            pendingList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 10px;">Erreur de chargement</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    function setupManageTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Désactiver tous les onglets
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => {
                    c.style.display = 'none';
                    c.classList.remove('active');
                });

                // Activer l'onglet sélectionné
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabId}Tab`);
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                }

                // Charger les données si nécessaire
                if (tabId === 'pending') {
                    loadPendingSubmissions();
                } else if (tabId === 'categories') {
                    loadCategoriesList();
                }
            });
        });
    }

    function setupManageFilters() {
        const searchInput = document.getElementById('searchProfessional');
        const categoryFilter = document.getElementById('filterCategory');
        const statusFilter = document.getElementById('filterStatus');

        const applyFilters = async () => {
            const search = searchInput?.value || '';
            const category = categoryFilter?.value || '';
            const status = statusFilter?.value || '';
            await loadAllProfessionals(search, category, status);
        };

        if (searchInput) {
            searchInput.addEventListener('input', debounce(applyFilters, 300));
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }
    }

    function setupManageModals() {
        // Modal professionnel
        const proModal = document.getElementById('professionalModal');
        const proForm = document.getElementById('professionalForm');
        
        if (proModal && proForm) {
            proForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await saveProfessional(e);
            });
            
            // Fermer modal avec Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && proModal.style.display === 'flex') {
                    closeModal();
                }
            });
        }
        
        // Modal catégorie
        const catModal = document.getElementById('categoryModal');
        const catForm = document.getElementById('categoryForm');
        
        if (catModal && catForm) {
            catForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await saveCategory(e);
            });
            
            // Fermer modal avec Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && catModal.style.display === 'flex') {
                    closeCategoryModal();
                }
            });
        }
    }

    // ============================================
    // 6. FONCTIONS GLOBALES (exportées)
    // ============================================

    window.addProfessional = function() {
        const modal = document.getElementById('professionalModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('professionalForm');
        
        if (modal && title && form) {
            title.textContent = 'Ajouter un professionnel';
            form.reset();
            document.getElementById('professionalId').value = '';
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function() {
        const modal = document.getElementById('professionalModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            const form = document.getElementById('professionalForm');
            if (form) form.reset();
        }
    };

    window.addCategory = function() {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (modal && title && form) {
            title.textContent = 'Ajouter une catégorie';
            form.reset();
            document.getElementById('categoryId').value = '';
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeCategoryModal = function() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            const form = document.getElementById('categoryForm');
            if (form) form.reset();
        }
    };

    window.editProfessional = async function(id) {
        console.log('✏️ Édition professionnel:', id);
        
        try {
            const { data, error } = await supabase
                .from('annuaire')
                .select(`
                    *,
                    categories:category_id (
                        name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) {
                showError('Professionnel non trouvé');
                return;
            }

            // Remplir le formulaire
            document.getElementById('modalTitle').textContent = 'Modifier le professionnel';
            document.getElementById('professionalId').value = data.id;
            document.getElementById('name').value = data.name || '';
            document.getElementById('category_id').value = data.category_id || '';
            document.getElementById('specialty').value = data.specialty || '';
            document.getElementById('rating').value = data.rating || '';
            document.getElementById('description').value = data.description || '';
            document.getElementById('contact_info').value = data.contact_info || '';
            document.getElementById('location').value = data.location || '';
            document.getElementById('website').value = data.website || '';
            document.getElementById('instagram').value = data.instagram || '';
            document.getElementById('status').value = data.status || 'pending';
            document.getElementById('type').value = data.type || 'professional';

            // Afficher le modal
            document.getElementById('professionalModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error('❌ Erreur chargement professionnel:', error);
            showError('Erreur lors du chargement du professionnel');
        }
    };

    window.saveProfessional = async function(event) {
        if (event) event.preventDefault();
        
        const form = document.getElementById('professionalForm');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

        const id = document.getElementById('professionalId').value;
        const formData = {
            name: document.getElementById('name').value.trim(),
            category_id: document.getElementById('category_id').value,
            specialty: document.getElementById('specialty').value.trim(),
            rating: parseFloat(document.getElementById('rating').value) || null,
            description: document.getElementById('description').value.trim(),
            contact_info: document.getElementById('contact_info').value.trim(),
            location: document.getElementById('location').value.trim(),
            website: document.getElementById('website').value.trim(),
            instagram: document.getElementById('instagram').value.trim(),
            status: document.getElementById('status').value,
            type: document.getElementById('type').value,
            updated_at: new Date().toISOString()
        };

        console.log('💾 Sauvegarde professionnel:', { id, ...formData });

        try {
            // Validation
            if (!formData.name || !formData.contact_info) {
                throw new Error('Le nom et le contact sont obligatoires');
            }

            let result;
            if (id) {
                // Mise à jour
                const { data, error } = await supabase
                    .from('annuaire')
                    .update(formData)
                    .eq('id', id);

                if (error) throw error;
                result = data;
                console.log('✅ Professionnel mis à jour');
                showSuccess('Professionnel mis à jour avec succès !');
            } else {
                // Création
                const { data, error } = await supabase
                    .from('annuaire')
                    .insert([formData]);

                if (error) throw error;
                result = data;
                console.log('✅ Nouveau professionnel créé');
                showSuccess('Nouveau professionnel créé avec succès !');
            }

            closeModal();
            
            // Recharger les données
            if (window.location.pathname.includes('manage-annuaire')) {
                await loadAllProfessionals();
                await loadPendingSubmissions();
                await loadStatistics();
            }

        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            showError('Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    };

    window.deleteProfessional = async function(id, name) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('annuaire')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showSuccess('Professionnel supprimé avec succès !');
            
            // Recharger les données
            if (window.location.pathname.includes('manage-annuaire')) {
                await loadAllProfessionals();
                await loadPendingSubmissions();
                await loadStatistics();
            }

        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            showError('Erreur lors de la suppression: ' + error.message);
        }
    };

    window.approveProfessional = async function(id) {
        if (!confirm('Approuver ce professionnel ?\n\nIl apparaîtra dans l\'annuaire public.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('annuaire')
                .update({ 
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            showSuccess('Professionnel approuvé avec succès !');
            
            // Recharger les données
            if (window.location.pathname.includes('manage-annuaire')) {
                await loadAllProfessionals();
                await loadPendingSubmissions();
                await loadStatistics();
            }

        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            showError('Erreur lors de l\'approbation: ' + error.message);
        }
    };

    window.editCategory = async function(id) {
        try {
            const { data, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) {
                showError('Catégorie non trouvée');
                return;
            }

            // Remplir le formulaire
            document.getElementById('categoryModalTitle').textContent = 'Modifier la catégorie';
            document.getElementById('categoryId').value = data.id;
            document.getElementById('categoryName').value = data.name || '';
            document.getElementById('categoryDescription').value = data.description || '';
            document.getElementById('categoryIcon').value = data.icon || 'fas fa-folder';
            document.getElementById('categoryColor').value = data.color || '#2196F3';

            // Afficher le modal
            document.getElementById('categoryModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error('❌ Erreur chargement catégorie:', error);
            showError('Erreur lors du chargement de la catégorie');
        }
    };

    window.saveCategory = async function(event) {
        if (event) event.preventDefault();
        
        const form = document.getElementById('categoryForm');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

        const id = document.getElementById('categoryId').value;
        const formData = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
            icon: document.getElementById('categoryIcon').value.trim() || 'fas fa-folder',
            color: document.getElementById('categoryColor').value
        };

        console.log('💾 Sauvegarde catégorie:', { id, ...formData });

        try {
            // Validation
            if (!formData.name) {
                throw new Error('Le nom de la catégorie est obligatoire');
            }

            let result;
            if (id) {
                // Mise à jour
                const { data, error } = await supabase
                    .from('annuaire_categories')
                    .update(formData)
                    .eq('id', id);

                if (error) throw error;
                result = data;
                console.log('✅ Catégorie mise à jour');
                showSuccess('Catégorie mise à jour avec succès !');
            } else {
                // Générer un ID si nouveau
                if (!id) {
                    formData.id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
                
                const { data, error } = await supabase
                    .from('annuaire_categories')
                    .insert([formData]);

                if (error) throw error;
                result = data;
                console.log('✅ Nouvelle catégorie créée');
                showSuccess('Nouvelle catégorie créée avec succès !');
            }

            closeCategoryModal();
            
            // Recharger les données
            if (window.location.pathname.includes('manage-annuaire')) {
                await loadCategoriesForSelect();
                await loadCategoriesList();
                await loadStatistics();
            }

        } catch (error) {
            console.error('❌ Erreur sauvegarde catégorie:', error);
            showError('Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    };

    window.deleteCategory = async function(id, name) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?\n\nCette action supprimera également tous les professionnels associés.`)) {
            return;
        }

        try {
            // D'abord, vérifier s'il y a des professionnels dans cette catégorie
            const { count, error: countError } = await supabase
                .from('annuaire')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', id);

            if (countError) throw countError;

            if (count > 0) {
                if (!confirm(`Cette catégorie contient ${count} professionnel(s).\nVoulez-vous vraiment la supprimer ?\n\nLes professionnels seront déplacés dans "Non catégorisé".`)) {
                    return;
                }
                
                // Mettre à jour les professionnels pour les décategoriser
                const { error: updateError } = await supabase
                    .from('annuaire')
                    .update({ category_id: null })
                    .eq('category_id', id);
                
                if (updateError) throw updateError;
            }

            // Supprimer la catégorie
            const { error } = await supabase
                .from('annuaire_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showSuccess('Catégorie supprimée avec succès !');
            
            // Recharger les données
            if (window.location.pathname.includes('manage-annuaire')) {
                await loadCategoriesForSelect();
                await loadCategoriesList();
                await loadStatistics();
                await loadAllProfessionals();
            }

        } catch (error) {
            console.error('❌ Erreur suppression catégorie:', error);
            showError('Erreur lors de la suppression: ' + error.message);
        }
    };

    window.switchTab = function(tab) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    };

    window.contactProfessional = function(name, contact, website, instagram) {
        let contactInfo = `Nom: ${name}\n`;
        contactInfo += `Contact: ${contact}\n`;
        if (website) contactInfo += `Site web: ${website}\n`;
        if (instagram) contactInfo += `Instagram: ${instagram}\n`;
        
        const modalHTML = `
            <div id="contactModal" class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #1a1a1a;">Contacter ${escapeHtml(name)}</h3>
                        <button onclick="closeContactModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
                    </div>
                    
                    <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <div style="display: grid; gap: 10px;">
                            <div>
                                <strong>Email/Téléphone :</strong>
                                <p style="margin: 5px 0; color: #666;">${escapeHtml(contact)}</p>
                            </div>
                            ${website ? `
                            <div>
                                <strong>Site web :</strong>
                                <p style="margin: 5px 0; color: #666;">
                                    <a href="${website.startsWith('http') ? website : 'https://' + website}" target="_blank" style="color: #d4af37; text-decoration: none;">
                                        ${escapeHtml(website)}
                                    </a>
                                </p>
                            </div>
                            ` : ''}
                            ${instagram ? `
                            <div>
                                <strong>Instagram :</strong>
                                <p style="margin: 5px 0; color: #666;">
                                    <a href="https://instagram.com/${instagram.replace('@', '')}" target="_blank" style="color: #d4af37; text-decoration: none;">
                                        ${escapeHtml(instagram)}
                                    </a>
                                </p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="copyContact(\`${escapeHtml(contactInfo)}\`)" class="btn btn-primary" style="padding: 10px 20px; background: #d4af37; color: #1a1a1a; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-copy"></i> Copier les informations
                        </button>
                        <button onclick="closeContactModal()" class="btn btn-secondary" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Créer et afficher le modal
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstChild);
        document.body.style.overflow = 'hidden';
    };

    window.closeContactModal = function() {
        const modal = document.getElementById('contactModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    };

    window.copyContact = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Informations copiées dans le presse-papier !');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            showError('Impossible de copier les informations');
        });
    };

    // ============================================
    // 7. CSS ANIMATION POUR LE SPINNER
    // ============================================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        .professional-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Script annuaire complètement chargé !');
});
