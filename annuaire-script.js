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
        // Initialiser Supabase
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error);
        showError('Erreur de connexion à la base de données');
        return;
    }

    // ============================================
    // 2. FONCTIONS UTILITAIRES
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

    // ============================================
    // 3. DASHBOARD ANNUAIRE (dashboard-annuaire.html)
    // ============================================
    
    async function initDashboardAnnuaire() {
        console.log('🔄 Initialisation Dashboard Annuaire...');
        
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
            // Charger les catégories depuis annuaire_categories
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
            
            // Créer les filtres de catégories
            createCategoryFilters(categories);
            
            // Afficher les cartes de catégories
            displayDashboardCategoryCards(categories);
            
            return categories;
        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
            return [];
        }
    }

    function createCategoryFilters(categories) {
        const filtersContainer = document.getElementById('categoryFilters');
        if (!filtersContainer || !categories) return;
        
        let html = `
            <div class="category-filter active" data-category="all">
                <i class="fas fa-th"></i>
                <span>Tous</span>
            </div>
        `;
        
        categories.forEach(cat => {
            html += `
                <div class="category-filter" data-category="${cat.id}">
                    <i class="${cat.icon || 'fas fa-folder'}"></i>
                    <span>${escapeHtml(cat.name)}</span>
                </div>
            `;
        });
        
        filtersContainer.innerHTML = html;
    }

    async function displayDashboardCategoryCards(categories) {
        const grid = document.getElementById('categoriesGrid');
        if (!grid || !categories) return;
        
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                // Compter les professionnels actifs par catégorie
                const { count, error } = await supabase
                    .from('annuaire_professionnels')
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
            <div class="category-card" onclick="filterByCategoryId('${cat.id}')">
                <div class="category-icon" style="background: ${cat.color || '#d4af37'}">
                    <i class="${cat.icon || 'fas fa-folder'}"></i>
                </div>
                <h3>${escapeHtml(cat.name)}</h3>
                <p>${escapeHtml(cat.description || 'Professionnels spécialisés')}</p>
                <span class="category-count">${cat.count || 0} professionnel${cat.count !== 1 ? 's' : ''}</span>
            </div>
        `).join('');
    }

    async function loadDashboardProfessionals(categoryId = 'all', search = '') {
        const grid = document.getElementById('professionalsGrid');
        if (!grid) return;
        
        // Afficher le loading
        grid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Chargement des professionnels...</p>
            </div>
        `;
        
        try {
            let query = supabase
                .from('annuaire_professionnels')
                .select(`
                    *,
                    annuaire_categories (
                        name,
                        icon,
                        color
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            
            // Filtrer par catégorie
            if (categoryId !== 'all') {
                query = query.eq('category_id', categoryId);
            }
            
            // Filtrer par recherche
            if (search.trim()) {
                query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,description.ilike.%${search}%`);
            }
            
            const { data: professionals, error } = await query;
            
            if (error) throw error;
            
            if (!professionals || professionals.length === 0) {
                grid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-user-friends"></i>
                        <h3>Aucun professionnel trouvé</h3>
                        <p>${search ? 'Aucun résultat pour votre recherche.' : 'Aucun professionnel disponible pour le moment.'}</p>
                    </div>
                `;
                return;
            }
            
            // Afficher les professionnels
            displayDashboardProfessionals(professionals);
            
        } catch (error) {
            console.error('❌ Erreur chargement professionnels:', error);
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erreur de chargement</h3>
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
            // Récupérer les informations de la catégorie
            const category = Array.isArray(pro.annuaire_categories) ? pro.annuaire_categories[0] : pro.annuaire_categories;
            const categoryName = category?.name || 'Non catégorisé';
            const categoryColor = category?.color || '#d4af37';
            const categoryIcon = category?.icon || 'fas fa-user';
            
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
                                onclick="contactProfessional(
                                    '${escapeHtml(pro.name)}', 
                                    '${escapeHtml(pro.contact_info)}', 
                                    '${escapeHtml(pro.website || '')}', 
                                    '${escapeHtml(pro.instagram || '')}'
                                )"
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
        const searchBtn = document.getElementById('searchButton');
        
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
    }

    function setupDashboardFilters() {
        // Attacher les événements aux filtres de catégories
        document.addEventListener('click', async function(e) {
            const filter = e.target.closest('.category-filter');
            if (!filter) return;
            
            // Désactiver tous les filtres
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            
            // Activer le filtre cliqué
            filter.classList.add('active');
            
            // Charger les professionnels filtrés
            const category = filter.dataset.category;
            const searchInput = document.getElementById('directorySearch');
            await loadDashboardProfessionals(category, searchInput?.value || '');
        });
    }

    function setupDashboardAddForm() {
        const addBtn = document.getElementById('addProfessionalBtn');
        const modal = document.getElementById('addProfessionalModal');
        const closeModalBtn = modal?.querySelector('.close-modal');
        const closeFormBtn = modal?.querySelector('.close-modal-form');
        const form = document.getElementById('professionalForm');
        
        if (addBtn && modal) {
            addBtn.addEventListener('click', function() {
                modal.style.display = 'flex';
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                if (form) form.reset();
            });
        }
        
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                if (form) form.reset();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
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
                
                // Récupérer les données du formulaire
                const formData = {
                    name: document.getElementById('proName').value.trim(),
                    category_id: document.getElementById('proCategory').value,
                    specialty: document.getElementById('proSpecialty').value.trim(),
                    contact_info: document.getElementById('proContact').value.trim(),
                    description: document.getElementById('proDescription').value.trim(),
                    location: document.getElementById('proLocation')?.value.trim() || null,
                    website: document.getElementById('proWebsite')?.value.trim() || null,
                    instagram: document.getElementById('proInstagram')?.value.trim() || null,
                    status: 'pending',  // En attente d'approbation
                    type: 'suggested'   // Proposé par un utilisateur
                };
                
                try {
                    // Validation
                    if (!formData.name || !formData.category_id || !formData.contact_info) {
                        throw new Error('Veuillez remplir tous les champs obligatoires (*)');
                    }
                    
                    // Insérer dans la base de données
                    const { data, error } = await supabase
                        .from('annuaire_professionnels')
                        .insert([formData]);
                    
                    if (error) throw error;
                    
                    // Succès
                    showSuccess('✅ Votre suggestion a été soumise avec succès ! Elle sera examinée par notre équipe avant publication.');
                    
                    // Fermer le modal et réinitialiser le formulaire
                    modal.style.display = 'none';
                    form.reset();
                    
                    // Recharger les professionnels
                    const activeCategory = document.querySelector('.category-filter.active');
                    const category = activeCategory ? activeCategory.dataset.category : 'all';
                    const searchInput = document.getElementById('directorySearch');
                    await loadDashboardProfessionals(category, searchInput?.value || '');
                    
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
    // 4. FONCTIONS GLOBALES
    // ============================================

    window.filterByCategoryId = function(categoryId) {
        // Activer le filtre correspondant
        document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
        
        const targetFilter = document.querySelector(`.category-filter[data-category="${categoryId}"]`);
        if (targetFilter) {
            targetFilter.classList.add('active');
        } else {
            // Activer "Tous"
            document.querySelector('.category-filter[data-category="all"]').classList.add('active');
        }
        
        // Charger les professionnels
        const searchInput = document.getElementById('directorySearch');
        loadDashboardProfessionals(categoryId, searchInput?.value || '');
    };

    window.contactProfessional = function(name, contact, website, instagram) {
        // Créer un modal de contact
        const contactModal = document.getElementById('contactModal');
        if (!contactModal) {
            // Créer le modal s'il n'existe pas
            const modalDiv = document.createElement('div');
            modalDiv.id = 'contactModal';
            modalDiv.className = 'modal';
            modalDiv.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                    <div style="padding: 30px;">
                        <h2 style="margin-bottom: 20px; color: #333;">
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
                            <button onclick="copyToClipboard('${escapeHtml(name)}', '${escapeHtml(contact)}', '${escapeHtml(website || '')}', '${escapeHtml(instagram || '')}')" 
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
            `;
            document.body.appendChild(modalDiv);
            modalDiv.style.display = 'flex';
        } else {
            // Mettre à jour le contenu du modal existant
            contactModal.querySelector('h2').innerHTML = `<i class="fas fa-paper-plane"></i> Contacter ${escapeHtml(name)}`;
            contactModal.querySelector('.modal-content > div').innerHTML = `
                <div style="padding: 30px;">
                    <h2 style="margin-bottom: 20px; color: #333;">
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
                        <button onclick="copyToClipboard('${escapeHtml(name)}', '${escapeHtml(contact)}', '${escapeHtml(website || '')}', '${escapeHtml(instagram || '')}')" 
                                class="btn btn-primary" style="padding: 12px 24px;">
                            <i class="fas fa-copy"></i> Copier
                        </button>
                        <button onclick="document.getElementById('contactModal').remove()" 
                                class="btn btn-secondary" style="padding: 12px 24px;">
                            Fermer
                        </button>
                    </div>
                </div>
            `;
            contactModal.style.display = 'flex';
        }
    };

    window.copyToClipboard = function(name, contact, website, instagram) {
        let info = `Coordonnées de ${name}:\n\n`;
        info += `📧 Contact: ${contact}\n`;
        if (website) info += `🌐 Site web: ${website}\n`;
        if (instagram) info += `📱 Instagram: ${instagram}\n`;
        
        navigator.clipboard.writeText(info).then(() => {
            showSuccess('✅ Coordonnées copiées dans le presse-papier !');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            showError('❌ Impossible de copier les coordonnées');
        });
    };

    // ============================================
    // 5. DÉTECTION DE LA PAGE ET INITIALISATION
    // ============================================
    
    const currentPath = window.location.pathname;
    console.log('📍 Page détectée:', currentPath);
    
    if (currentPath.includes('dashboard-annuaire.html') || 
        document.getElementById('professionalsGrid')) {
        console.log('📄 Page Dashboard Annuaire détectée');
        initDashboardAnnuaire();
    }

    console.log('✅ Script annuaire complètement chargé !');
});
