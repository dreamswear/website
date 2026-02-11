// dashboard-management.js
// Gestion complète des dashboards admin avec Supabase pour Dreamswear

class DashboardManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        console.log('🔄 DashboardManager: Instance créée');
    }

    // Initialiser Supabase (doit être appelé après le chargement)
    initializeSupabase() {
        if (this.supabase) {
            return this.supabase;
        }
        
        // Essayer de récupérer depuis SessionManager d'abord
        if (window.SessionManager && window.SessionManager.supabase) {
            this.supabase = window.SessionManager.supabase;
            console.log('✅ DashboardManager: Supabase récupéré depuis SessionManager');
            return this.supabase;
        }
        
        // Sinon initialiser directement
        if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG) {
            try {
                this.supabase = window.supabase.createClient(
                    window.SUPABASE_CONFIG.URL,
                    window.SUPABASE_CONFIG.KEY
                );
                console.log('✅ DashboardManager: Supabase initialisé directement');
            } catch (error) {
                console.error('❌ DashboardManager: Erreur initialisation Supabase', error);
            }
        } else {
            console.error('❌ DashboardManager: Supabase ou configuration non disponible');
        }
        
        return this.supabase;
    }

    // ========== FONCTIONS D'AUTHENTIFICATION ADMIN ==========
    
    async checkAdminAccess() {
        try {
            // Vérifier dans sessionStorage d'abord
            const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
            
            if (adminLoggedIn || isAdmin) {
                return true;
            }
            
            // Vérifier avec Supabase si disponible
            if (!this.supabase) {
                this.initializeSupabase();
            }
            
            if (this.supabase) {
                const { data: { user } } = await this.supabase.auth.getUser();
                this.currentUser = user;
                
                if (!user) {
                    return false;
                }
                
                // Vérifier dans la table admin_users
                const { data: adminData } = await this.supabase
                    .from('admin_users')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                
                if (adminData) {
                    sessionStorage.setItem('isAdmin', 'true');
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Erreur vérification admin:', error);
            return false;
        }
    }
    
    async requireAdminAccess() {
        const isAdmin = await this.checkAdminAccess();
        if (!isAdmin) {
            window.location.href = 'admin.html';
            return false;
        }
        return true;
    }

    // ========== FONCTIONS UTILITAIRES COMMUNES ==========
    
    showNotification(message, type = 'info', duration = 3000) {
        // Vérifier si un conteneur de notification existe
        let container = document.getElementById('notificationContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    async confirmAction(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                    <h3 style="margin-top: 0; color: #333;">${title}</h3>
                    <p style="margin-bottom: 25px; color: #666;">${message}</p>
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button id="confirmCancel" class="btn btn-outline" style="padding: 10px 20px;">Annuler</button>
                        <button id="confirmOk" class="btn btn-primary" style="padding: 10px 20px;">Confirmer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('confirmCancel').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            
            document.getElementById('confirmOk').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });
        });
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    generateStars(rating, size = '0.9rem') {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star" style="color: #FFD700;"></i>';
        if (halfStar) stars += '<i class="fas fa-star-half-alt" style="color: #FFD700;"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star" style="color: #FFD700;"></i>';
        
        return `<span style="font-size: ${size};">${stars}</span>`;
    }
    
    // ========== GESTION ANNUAIRE ==========
    
    async initializeAnnuaireManagement() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('🔄 Initialisation gestion annuaire...');
        
        try {
            // S'assurer que Supabase est initialisé
            this.initializeSupabase();
            
            // Charger les données depuis Supabase
            await this.loadCategories();
            await this.loadProfessionals();
            
            // Initialiser les événements
            this.setupAnnuaireEvents();
            
        } catch (error) {
            console.error('❌ Erreur initialisation annuaire:', error);
            this.showNotification('Erreur lors de l\'initialisation de l\'annuaire', 'error');
        }
    }
    
    setupAnnuaireEvents() {
        // Bouton ajouter professionnel
        const addBtn = document.getElementById('addProfessionalBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showProfessionalModal());
        }
        
        // Bouton ajouter catégorie
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showCategoryModal());
        }
        
        // Formulaire professionnel
        const professionalForm = document.getElementById('professionalForm');
        if (professionalForm) {
            professionalForm.addEventListener('submit', (e) => this.saveProfessional(e));
        }
        
        // Formulaire catégorie
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.saveCategory(e));
        }
        
        // Filtres
        const filterSearch = document.getElementById('filterSearch');
        if (filterSearch) {
            filterSearch.addEventListener('input', () => this.filterProfessionals());
        }
        
        const filterCategory = document.getElementById('filterCategory');
        if (filterCategory) {
            filterCategory.addEventListener('change', () => this.filterProfessionals());
        }
        
        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.filterProfessionals());
        }
    }
    
    async loadProfessionals() {
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) return;
            }
            
            const { data, error } = await this.supabase
                .from('annuaire_professionnels')
                .select(`
                    *,
                    annuaire_categories (
                        name,
                        icon,
                        color
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('❌ Erreur chargement professionnels:', error);
                this.showNotification('Erreur de chargement des professionnels', 'error');
                return;
            }
            
            window.allProfessionals = (data || []).map(item => ({
                ...item,
                category_name: item.annuaire_categories?.name,
                category_icon: item.annuaire_categories?.icon,
                category_color: item.annuaire_categories?.color
            }));
            
            this.updateProfessionalStats(window.allProfessionals);
            this.displayProfessionals(window.allProfessionals);
            
        } catch (error) {
            console.error('❌ Erreur chargement professionnels:', error);
            this.showNotification('Erreur de chargement des professionnels', 'error');
        }
    }
    
    updateProfessionalStats(professionals) {
        const total = professionals.length;
        const active = professionals.filter(p => p.status === 'active').length;
        const pending = professionals.filter(p => p.status === 'pending').length;
        
        const totalEl = document.getElementById('totalProfessionals');
        const activeEl = document.getElementById('activeProfessionals');
        const pendingEl = document.getElementById('pendingProfessionals');
        
        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (pendingEl) pendingEl.textContent = pending;
    }
    
    displayProfessionals(professionals) {
        const container = document.getElementById('professionalsList');
        if (!container) return;
        
        if (!professionals || professionals.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #666;">
                    <i class="fas fa-users" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>Aucun professionnel</h3>
                    <p>Ajoutez votre premier professionnel à l'annuaire</p>
                    <button class="btn btn-primary" onclick="dashboardManager.showProfessionalModal()">
                        <i class="fas fa-plus"></i> Ajouter un professionnel
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = professionals.map(pro => `
            <div class="professional-card" style="background: white; border-radius: 10px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 60px; height: 60px; border-radius: 10px; 
                                  background: ${pro.category_color || '#2196F3'}; 
                                  display: flex; align-items: center; justify-content: center;">
                            <i class="${pro.category_icon || 'fas fa-user'}" style="color: white; font-size: 1.8rem;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0 0 5px 0;">${pro.name}</h3>
                            <p style="margin: 0; color: #666;">${pro.category_name || 'Non catégorisé'}</p>
                        </div>
                    </div>
                    <span class="status-badge ${pro.status}" style="
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 0.8rem;
                        font-weight: 500;
                        background: ${pro.status === 'active' ? '#4CAF50' : pro.status === 'pending' ? '#FF9800' : '#9E9E9E'};
                        color: white;
                    ">
                        ${pro.status === 'active' ? 'Actif' : pro.status === 'pending' ? 'En attente' : 'Inactif'}
                    </span>
                </div>
                
                <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">
                    <strong>Spécialité:</strong> ${pro.specialty || 'Non spécifiée'}<br>
                    ${pro.description ? `${pro.description.substring(0, 100)}${pro.description.length > 100 ? '...' : ''}` : ''}
                </p>
                
                <div style="margin-bottom: 20px;">
                    ${pro.rating ? `
                        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                            ${this.generateStars(pro.rating)}
                            <span style="color: #666; font-size: 0.9rem;">(${pro.rating})</span>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.9rem; color: #666;">
                        ${pro.location ? `<span><i class="fas fa-map-marker-alt"></i> ${pro.location}</span>` : ''}
                        ${pro.contact_info ? `<span><i class="fas fa-envelope"></i> ${pro.contact_info}</span>` : ''}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 20px;">
                    <button class="btn btn-sm" onclick="dashboardManager.editProfessional(${pro.id})" style="flex: 1;">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteProfessional(${pro.id})" style="flex: 1;">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    filterProfessionals() {
        if (!window.allProfessionals) return;
        
        const searchTerm = document.getElementById('filterSearch')?.value?.toLowerCase() || '';
        const category = document.getElementById('filterCategory')?.value || '';
        const status = document.getElementById('filterStatus')?.value || '';
        
        const filtered = window.allProfessionals.filter(pro => {
            const matchesSearch = !searchTerm || 
                pro.name?.toLowerCase().includes(searchTerm) ||
                pro.specialty?.toLowerCase().includes(searchTerm) ||
                pro.description?.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !category || pro.category_name === category;
            const matchesStatus = !status || pro.status === status;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        this.displayProfessionals(filtered);
    }
    
    async loadCategories() {
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) return;
            }
            
            const { data, error } = await this.supabase
                .from('annuaire_categories')
                .select(`
                    *,
                    annuaire_professionnels(count)
                `)
                .order('name', { ascending: true });
            
            if (error) {
                console.error('❌ Erreur chargement catégories:', error);
                this.showNotification('Erreur de chargement des catégories', 'error');
                return;
            }
            
            window.allCategories = (data || []).map(cat => ({
                ...cat,
                professionals_count: cat.annuaire_professionnels?.[0]?.count || 0
            }));
            
            this.displayCategories(window.allCategories);
            this.populateCategorySelects(window.allCategories);
            
        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
            this.showNotification('Erreur de chargement des catégories', 'error');
        }
    }
    
    displayCategories(categories) {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        if (!categories || categories.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie</p>
                    <button class="btn btn-primary" onclick="dashboardManager.showCategoryModal()">
                        <i class="fas fa-plus"></i> Créer une catégorie
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = categories.map(cat => `
            <div class="category-card" style="background: white; border-radius: 10px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 5px solid ${cat.color || '#2196F3'};">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; border-radius: 10px; background: ${cat.color || '#2196F3'}; display: flex; align-items: center; justify-content: center;">
                        <i class="${cat.icon || 'fas fa-folder'}" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 5px 0;">${cat.name}</h3>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">${cat.professionals_count || 0} professionnel(s)</p>
                    </div>
                </div>
                
                ${cat.description ? `
                <p style="color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;">
                    ${cat.description}
                </p>
                ` : ''}
                
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-sm" onclick="dashboardManager.editCategory(${cat.id})" style="flex: 1;">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteCategory(${cat.id})" style="flex: 1;">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    populateCategorySelects(categories) {
        // Remplir le filtre de catégories
        const filterSelect = document.getElementById('filterCategory');
        if (filterSelect) {
            filterSelect.innerHTML = `
                <option value="">Toutes catégories</option>
                ${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            `;
        }
        
        // Remplir le select du formulaire
        const formSelect = document.getElementById('category_id');
        if (formSelect) {
            formSelect.innerHTML = `
                <option value="">Sélectionner une catégorie</option>
                ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            `;
        }
    }
    
    showProfessionalModal(professionalId = null) {
        const modal = document.getElementById('professionalModal');
        if (!modal) {
            this.createProfessionalModal();
        }
        
        const modalInstance = document.getElementById('professionalModal');
        const form = document.getElementById('professionalForm');
        
        if (professionalId && window.allProfessionals) {
            const professional = window.allProfessionals.find(p => p.id === professionalId);
            if (professional) {
                document.getElementById('professionalId').value = professional.id || '';
                document.getElementById('name').value = professional.name || '';
                document.getElementById('category_id').value = professional.category_id || '';
                document.getElementById('specialty').value = professional.specialty || '';
                document.getElementById('rating').value = professional.rating || '';
                document.getElementById('description').value = professional.description || '';
                document.getElementById('contact_info').value = professional.contact_info || '';
                document.getElementById('location').value = professional.location || '';
                document.getElementById('website').value = professional.website || '';
                document.getElementById('instagram').value = professional.instagram || '';
                document.getElementById('status').value = professional.status || 'pending';
                document.getElementById('type').value = professional.type || 'professional';
                
                document.getElementById('modalTitle').textContent = 'Modifier le professionnel';
            }
        } else {
            form.reset();
            document.getElementById('professionalId').value = '';
            document.getElementById('modalTitle').textContent = 'Ajouter un professionnel';
        }
        
        modalInstance.style.display = 'flex';
    }
    
    createProfessionalModal() {
        const modal = document.createElement('div');
        modal.id = 'professionalModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 10px; padding: 30px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 id="modalTitle" style="margin: 0;">Ajouter un professionnel</h2>
                    <button onclick="document.getElementById('professionalModal').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <form id="professionalForm">
                    <input type="hidden" id="professionalId">
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Nom *</label>
                        <input type="text" id="name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Catégorie</label>
                        <select id="category_id" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="">Sélectionner une catégorie</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Spécialité</label>
                        <input type="text" id="specialty" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Note (0-5)</label>
                        <input type="number" id="rating" min="0" max="5" step="0.1" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description</label>
                        <textarea id="description" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email de contact</label>
                        <input type="email" id="contact_info" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Localisation</label>
                        <input type="text" id="location" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Site web</label>
                        <input type="url" id="website" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Instagram</label>
                        <input type="text" id="instagram" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Statut</label>
                        <select id="status" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="active">Actif</option>
                            <option value="pending">En attente</option>
                            <option value="inactive">Inactif</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Type</label>
                        <select id="type" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="professional">Professionnel</option>
                            <option value="creator">Créateur</option>
                            <option value="partner">Partenaire</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" onclick="document.getElementById('professionalModal').style.display='none'" class="btn btn-outline">Annuler</button>
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    closeProfessionalModal() {
        const modal = document.getElementById('professionalModal');
        if (modal) modal.style.display = 'none';
    }
    
    showCategoryModal(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        if (!modal) {
            this.createCategoryModal();
        }
        
        const modalInstance = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        
        if (categoryId && window.allCategories) {
            const category = window.allCategories.find(c => c.id === categoryId);
            if (category) {
                document.getElementById('categoryId').value = category.id || '';
                document.getElementById('categoryName').value = category.name || '';
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryIcon').value = category.icon || 'fas fa-folder';
                document.getElementById('categoryColor').value = category.color || '#2196F3';
                
                document.getElementById('categoryModalTitle').textContent = 'Modifier la catégorie';
            }
        } else {
            form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryIcon').value = 'fas fa-folder';
            document.getElementById('categoryColor').value = '#2196F3';
            document.getElementById('categoryModalTitle').textContent = 'Ajouter une catégorie';
        }
        
        modalInstance.style.display = 'flex';
    }
    
    createCategoryModal() {
        const modal = document.createElement('div');
        modal.id = 'categoryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 10px; padding: 30px; max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 id="categoryModalTitle" style="margin: 0;">Ajouter une catégorie</h2>
                    <button onclick="document.getElementById('categoryModal').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <form id="categoryForm">
                    <input type="hidden" id="categoryId">
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Nom *</label>
                        <input type="text" id="categoryName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description</label>
                        <textarea id="categoryDescription" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Icône Font Awesome</label>
                        <input type="text" id="categoryIcon" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" placeholder="fas fa-folder">
                        <small style="color: #666;">Ex: fas fa-folder, fas fa-camera, fas fa-tshirt</small>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Couleur</label>
                        <input type="color" id="categoryColor" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 5px;" value="#2196F3">
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" onclick="document.getElementById('categoryModal').style.display='none'" class="btn btn-outline">Annuler</button>
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'none';
    }
    
    editProfessional(professionalId) {
        this.showProfessionalModal(professionalId);
    }
    
    editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    }
    
    async saveProfessional(event) {
        if (event) event.preventDefault();
        
        const professionalId = document.getElementById('professionalId').value;
        const isEdit = !!professionalId;
        
        const professionalData = {
            name: document.getElementById('name').value,
            category_id: document.getElementById('category_id').value || null,
            specialty: document.getElementById('specialty').value || null,
            rating: document.getElementById('rating').value ? parseFloat(document.getElementById('rating').value) : null,
            description: document.getElementById('description').value || null,
            contact_info: document.getElementById('contact_info').value || null,
            location: document.getElementById('location').value || null,
            website: document.getElementById('website').value || null,
            instagram: document.getElementById('instagram').value || null,
            status: document.getElementById('status').value,
            type: document.getElementById('type').value
        };
        
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) {
                    this.showNotification('Supabase non disponible', 'error');
                    return;
                }
            }
            
            let error;
            if (isEdit) {
                const { error: updateError } = await this.supabase
                    .from('annuaire_professionnels')
                    .update(professionalData)
                    .eq('id', professionalId);
                error = updateError;
            } else {
                const { error: insertError } = await this.supabase
                    .from('annuaire_professionnels')
                    .insert([professionalData]);
                error = insertError;
            }
            
            if (error) throw error;
            
            this.showNotification(`Professionnel ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
            this.closeProfessionalModal();
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde professionnel:', error);
            this.showNotification('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'), 'error');
        }
    }
    
    async saveCategory(event) {
        if (event) event.preventDefault();
        
        const categoryId = document.getElementById('categoryId').value;
        const isEdit = !!categoryId;
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value || null,
            icon: document.getElementById('categoryIcon').value || 'fas fa-folder',
            color: document.getElementById('categoryColor').value || '#2196F3'
        };
        
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) {
                    this.showNotification('Supabase non disponible', 'error');
                    return;
                }
            }
            
            let error;
            if (isEdit) {
                const { error: updateError } = await this.supabase
                    .from('annuaire_categories')
                    .update(categoryData)
                    .eq('id', categoryId);
                error = updateError;
            } else {
                const { error: insertError } = await this.supabase
                    .from('annuaire_categories')
                    .insert([categoryData]);
                error = insertError;
            }
            
            if (error) throw error;
            
            this.showNotification(`Catégorie ${isEdit ? 'modifiée' : 'ajoutée'} avec succès`, 'success');
            this.closeCategoryModal();
            await this.loadCategories();
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde catégorie:', error);
            this.showNotification('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'), 'error');
        }
    }
    
    async deleteProfessional(professionalId) {
        const confirmed = await this.confirmAction('Supprimer ce professionnel de l\'annuaire ?');
        if (!confirmed) return;
        
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) {
                    this.showNotification('Supabase non disponible', 'error');
                    return;
                }
            }
            
            const { error } = await this.supabase
                .from('annuaire_professionnels')
                .delete()
                .eq('id', professionalId);
            
            if (error) throw error;
            
            this.showNotification('Professionnel supprimé', 'success');
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('❌ Erreur suppression professionnel:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async deleteCategory(categoryId) {
        const confirmed = await this.confirmAction('Supprimer cette catégorie ? Les professionnels associés seront décattégorisés.');
        if (!confirmed) return;
        
        try {
            if (!this.supabase) {
                this.initializeSupabase();
                if (!this.supabase) {
                    this.showNotification('Supabase non disponible', 'error');
                    return;
                }
            }
            
            // D'abord décattégoriser les professionnels
            await this.supabase
                .from('annuaire_professionnels')
                .update({ category_id: null })
                .eq('category_id', categoryId);
            
            // Puis supprimer la catégorie
            const { error } = await this.supabase
                .from('annuaire_categories')
                .delete()
                .eq('id', categoryId);
            
            if (error) throw error;
            
            this.showNotification('Catégorie supprimée', 'success');
            await this.loadCategories();
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('❌ Erreur suppression catégorie:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    // ========== FONCTION D'INITIALISATION GLOBALE ==========
    
    async initializePage() {
        // S'assurer que Supabase est initialisé
        this.initializeSupabase();
        
        // Vérifier l'accès admin
        if (!await this.requireAdminAccess()) return;
        
        // Identifier la page actuelle
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        
        console.log(`📋 Initialisation page: ${page}`);
        
        // Initialiser la page spécifique
        switch(page) {
            case 'manage-annuaire':
                await this.initializeAnnuaireManagement();
                break;
            case 'manage-creators':
                await this.initializeCreatorsPage();
                break;
            case 'manage-portfolio':
                await this.initializePortfolioPage();
                break;
            case 'manage-opportunities':
                await this.initializeOpportunitiesPage();
                break;
            case 'manage-interactions':
                await this.initializeInteractionsPage();
                break;
            case 'manage-temoignages':
                await this.initializeTestimonialsPage();
                break;
            default:
                console.log('Page non reconnue, vérification admin uniquement');
        }
        
        // Ajouter des styles globaux
        this.addGlobalStyles();
    }
    
    addGlobalStyles() {
        if (document.getElementById('dashboardManagerStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'dashboardManagerStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: var(--primary, #d4af37);
                color: white;
            }
            
            .btn-primary:hover {
                background: var(--primary-dark, #b8960c);
            }
            
            .btn-outline {
                background: transparent;
                border: 1px solid var(--primary, #d4af37);
                color: var(--primary, #d4af37);
            }
            
            .btn-outline:hover {
                background: var(--primary, #d4af37);
                color: white;
            }
            
            .btn-danger {
                background: var(--danger, #dc3545);
                color: white;
            }
            
            .btn-danger:hover {
                background: #c82333;
            }
            
            .btn-sm {
                padding: 8px 15px;
                font-size: 0.9rem;
            }
            
            .status-badge {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialiser le gestionnaire global UNIQUEMENT s'il n'existe pas déjà
if (!window.dashboardManager) {
    window.dashboardManager = new DashboardManager();
    console.log('✅ DashboardManager initialisé globalement');
}

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (window.dashboardManager) {
        window.dashboardManager.initializePage();
    }
});
