// dashboard-management.js
// Gestion complète des dashboards avec Supabase pour Dreamswear

// Configuration Supabase
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

class DashboardManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initializeSupabase();
    }

    initializeSupabase() {
        // Initialiser Supabase
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase initialisé');
        } else {
            console.warn('Supabase non disponible - mode simulation activé');
        }
    }

    // ========== FONCTIONS D'AUTHENTIFICATION ==========
    
    async checkAdminAccess() {
        try {
            // Vérifier dans sessionStorage d'abord
            const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
            
            if (adminLoggedIn || isAdmin) {
                return true;
            }
            
            // Vérifier avec Supabase si disponible
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
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Erreur vérification admin:', error);
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
        // Supprimer les notifications existantes
        document.querySelectorAll('.dashboard-notification').forEach(n => n.remove());
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Styles de la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(120%);
            transition: transform 0.3s;
            z-index: 10000;
            border-left: 4px solid ${colors[type] || '#17a2b8'};
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Icône de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            color: #666;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-fermeture
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    async confirmAction(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'dashboard-confirm-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s;
            `;
            
            modal.innerHTML = `
                <div class="confirm-content" style="
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    padding: 30px;
                    animation: slideIn 0.3s;
                ">
                    <h3 style="margin: 0 0 20px 0; color: #333;">${title}</h3>
                    <p style="margin-bottom: 30px; color: #666; line-height: 1.5;">${message}</p>
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button class="btn-confirm-no" style="
                            padding: 10px 25px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">Non</button>
                        <button class="btn-confirm-yes" style="
                            padding: 10px 25px;
                            background: #d4af37;
                            color: #1a1a1a;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">Oui</button>
                    </div>
                </div>
            `;
            
            // Ajouter les styles d'animation
            if (!document.querySelector('#modal-animations')) {
                const style = document.createElement('style');
                style.id = 'modal-animations';
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        from { transform: translateY(-20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            modal.querySelector('.btn-confirm-yes').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });
            
            modal.querySelector('.btn-confirm-no').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            
            // Fermer en cliquant en dehors
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            });
            
            document.body.appendChild(modal);
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
        } catch (e) {
            return dateString;
        }
    }
    
    generateStars(rating, size = '0.9rem') {
        if (!rating) return '';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += `<i class="fas fa-star" style="color: #ffc107; font-size: ${size};"></i>`;
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars += `<i class="fas fa-star-half-alt" style="color: #ffc107; font-size: ${size};"></i>`;
            } else {
                stars += `<i class="far fa-star" style="color: #ddd; font-size: ${size};"></i>`;
            }
        }
        return stars;
    }
    
    // ========== FONCTIONS SPÉCIFIQUES AUX PAGES ==========
    
    // 1. GESTION ANNUAIRE (manage-annuaire.html)
    async initializeAnnuairePage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page annuaire');
        
        // Variables globales
        window.allProfessionals = [];
        window.allCategories = [];
        
        // Initialiser les événements
        this.setupAnnuaireEvents();
        
        // Charger les données
        await this.loadProfessionals();
        await this.loadCategories();
        
        // Initialiser les onglets
        this.switchTab('all');
    }
    
    setupAnnuaireEvents() {
        // Événements des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Événements de recherche/filtre
        document.getElementById('searchProfessional')?.addEventListener('input', () => this.filterProfessionals());
        document.getElementById('filterCategory')?.addEventListener('change', () => this.filterProfessionals());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterProfessionals());
        
        // Boutons d'action
        document.getElementById('addProfessionalBtn')?.addEventListener('click', () => this.showProfessionalModal());
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.showCategoryModal());
        
        // Fermer les modals
        document.getElementById('professionalModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeProfessionalModal();
        });
        
        document.getElementById('categoryModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeCategoryModal();
        });
    }
    
    switchTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Afficher le contenu approprié
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) activeContent.style.display = 'block';
        
        // Charger les données spécifiques à l'onglet
        if (tabName === 'categories') {
            this.loadCategories();
        } else if (tabName === 'pending') {
            this.loadSubmissions();
        }
    }
    
    async loadProfessionals() {
        try {
            let professionals = [];
            
            if (this.supabase) {
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
                
                if (error) throw error;
                professionals = data.map(item => ({
                    ...item,
                    category_name: item.annuaire_categories?.name,
                    category_icon: item.annuaire_categories?.icon,
                    category_color: item.annuaire_categories?.color
                }));
            } else {
                // Mode simulation
                professionals = [
                    {
                        id: 1,
                        name: 'Jean Dupont',
                        category_id: 1,
                        category_name: 'Photographe',
                        specialty: 'Photographie de mode',
                        rating: 4.5,
                        description: 'Photographe professionnel spécialisé dans la mode',
                        contact_info: 'contact@jeandupont.com',
                        location: 'Paris',
                        website: 'https://jeandupont.com',
                        instagram: '@jeandupont',
                        status: 'active',
                        type: 'professional'
                    }
                ];
            }
            
            window.allProfessionals = professionals;
            this.updateProfessionalStats(professionals);
            this.displayProfessionals(professionals);
            
        } catch (error) {
            console.error('Erreur chargement professionnels:', error);
            this.showNotification('Erreur de chargement des professionnels', 'error');
        }
    }
    
    updateProfessionalStats(professionals) {
        const total = professionals.length;
        const photographers = professionals.filter(p => 
            p.category_name && p.category_name.toLowerCase().includes('photographe')).length;
        const stylists = professionals.filter(p => 
            p.category_name && p.category_name.toLowerCase().includes('styliste')).length;
        const models = professionals.filter(p => 
            p.category_name && p.category_name.toLowerCase().includes('mannequin')).length;
        
        const totalEl = document.getElementById('totalProfessionals');
        const photographersEl = document.getElementById('photographersCount');
        const stylistsEl = document.getElementById('stylistsCount');
        const modelsEl = document.getElementById('modelsCount');
        
        if (totalEl) totalEl.textContent = total;
        if (photographersEl) photographersEl.textContent = photographers;
        if (stylistsEl) stylistsEl.textContent = stylists;
        if (modelsEl) modelsEl.textContent = models;
    }
    
    displayProfessionals(professionals) {
        const container = document.getElementById('professionalsGrid');
        if (!container) return;
        
        if (!professionals || professionals.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                    <i class="fas fa-user-tie" style="font-size: 4rem; margin-bottom: 20px; color: #ddd;"></i>
                    <h3 style="margin-bottom: 10px;">Aucun professionnel trouvé</h3>
                    <p>Essayez avec d'autres critères de recherche</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = professionals.map(pro => `
            <div class="professional-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 15px rgba(0,0,0,0.1); transition: transform 0.3s;">
                <div style="padding: 25px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #333;">${pro.name}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">
                                <i class="fas fa-tag"></i> ${pro.category_name || 'Non catégorisé'}
                            </p>
                        </div>
                        <span class="status-badge" style="background: ${this.getStatusColor(pro.status)}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                            ${this.getStatusLabel(pro.status)}
                        </span>
                    </div>
                    
                    <p style="color: #d4af37; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-star"></i> ${pro.specialty}
                    </p>
                    
                    <p style="color: #666; line-height: 1.5; margin-bottom: 20px; 
                       display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${pro.description}
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <span style="color: #666; font-size: 0.9rem;">
                            <i class="fas fa-envelope"></i> ${pro.contact_info}
                        </span>
                    </div>
                    
                    ${pro.rating ? `
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 15px;">
                        ${this.generateStars(pro.rating)}
                        <span style="color: #666; font-size: 0.9rem;">${pro.rating}/5</span>
                    </div>
                    ` : ''}
                </div>
                
                <div style="padding: 15px 25px; display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #999;">
                        ${pro.location ? `<i class="fas fa-map-marker-alt"></i> ${pro.location}` : ''}
                    </small>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-action" onclick="dashboardManager.editProfessional(${pro.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-danger" onclick="dashboardManager.deleteProfessional(${pro.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Ajouter les effets hover
        const cards = document.querySelectorAll('.professional-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 3px 15px rgba(0,0,0,0.1)';
            });
        });
    }
    
    filterProfessionals() {
        const searchTerm = document.getElementById('searchProfessional')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('filterCategory')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        
        if (!window.allProfessionals) return;
        
        const filtered = window.allProfessionals.filter(pro => {
            const matchesSearch = !searchTerm || 
                pro.name.toLowerCase().includes(searchTerm) ||
                pro.specialty?.toLowerCase().includes(searchTerm) ||
                pro.description?.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || pro.category_name === categoryFilter;
            const matchesStatus = !statusFilter || pro.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        this.displayProfessionals(filtered);
    }
    
    async loadCategories() {
        try {
            let categories = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('annuaire_categories')
                    .select('*')
                    .order('name', { ascending: true });
                
                if (error) throw error;
                categories = data;
            } else {
                // Mode simulation
                categories = [
                    { id: 1, name: 'Photographe', description: 'Photographes professionnels', icon: 'fas fa-camera', color: '#2196F3' },
                    { id: 2, name: 'Styliste', description: 'Stylistes mode', icon: 'fas fa-tshirt', color: '#9C27B0' }
                ];
            }
            
            window.allCategories = categories;
            this.displayCategories(categories);
            this.populateCategorySelects(categories);
            
        } catch (error) {
            console.error('Erreur chargement catégories:', error);
            this.showNotification('Erreur de chargement des catégories', 'error');
        }
    }
    
    displayCategories(categories) {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        if (!categories || categories.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>Aucune catégorie</h3>
                    <p>Créez votre première catégorie</p>
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
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">${cat.professionals_count || 0} professionnels</p>
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
        if (!modal) return;
        
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('professionalForm');
        
        if (professionalId) {
            // Mode édition
            title.textContent = 'Modifier le professionnel';
            
            // Trouver le professionnel
            const professional = window.allProfessionals.find(p => p.id == professionalId);
            if (professional) {
                document.getElementById('professionalId').value = professional.id;
                document.getElementById('name').value = professional.name;
                document.getElementById('category_id').value = professional.category_id;
                document.getElementById('specialty').value = professional.specialty;
                document.getElementById('rating').value = professional.rating || '5';
                document.getElementById('description').value = professional.description;
                document.getElementById('contact_info').value = professional.contact_info;
                document.getElementById('location').value = professional.location || '';
                document.getElementById('website').value = professional.website || '';
                document.getElementById('instagram').value = professional.instagram || '';
                document.getElementById('status').value = professional.status;
                document.getElementById('type').value = professional.type || 'professional';
            }
        } else {
            // Mode création
            title.textContent = 'Ajouter un professionnel';
            form.reset();
            document.getElementById('professionalId').value = '';
            document.getElementById('rating').value = '5';
            document.getElementById('status').value = 'active';
            document.getElementById('type').value = 'professional';
        }
        
        modal.style.display = 'flex';
    }
    
    closeProfessionalModal() {
        const modal = document.getElementById('professionalModal');
        if (modal) modal.style.display = 'none';
    }
    
    async saveProfessional(event) {
        if (event) event.preventDefault();
        
        const professionalId = document.getElementById('professionalId').value;
        const isEdit = !!professionalId;
        
        const professionalData = {
            name: document.getElementById('name').value,
            category_id: document.getElementById('category_id').value,
            specialty: document.getElementById('specialty').value,
            rating: document.getElementById('rating').value || null,
            description: document.getElementById('description').value,
            contact_info: document.getElementById('contact_info').value,
            location: document.getElementById('location').value || null,
            website: document.getElementById('website').value || null,
            instagram: document.getElementById('instagram').value || null,
            status: document.getElementById('status').value,
            type: document.getElementById('type').value
        };
        
        try {
            if (this.supabase) {
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
            }
            
            this.showNotification(`Professionnel ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
            this.closeProfessionalModal();
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('Erreur sauvegarde professionnel:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    async editProfessional(professionalId) {
        this.showProfessionalModal(professionalId);
    }
    
    async deleteProfessional(professionalId) {
        const confirmed = await this.confirmAction('Supprimer ce professionnel de l\'annuaire ?');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('annuaire_professionnels')
                    .delete()
                    .eq('id', professionalId);
                
                if (error) throw error;
            }
            
            this.showNotification('Professionnel supprimé', 'success');
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('Erreur suppression professionnel:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    showCategoryModal(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        if (!modal) return;
        
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (categoryId) {
            // Mode édition
            title.textContent = 'Modifier la catégorie';
            
            // Trouver la catégorie
            const category = window.allCategories.find(c => c.id == categoryId);
            if (category) {
                document.getElementById('categoryId').value = category.id;
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryIcon').value = category.icon || 'fas fa-folder';
                document.getElementById('categoryColor').value = category.color || '#2196F3';
            }
        } else {
            // Mode création
            title.textContent = 'Ajouter une catégorie';
            form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryColor').value = '#2196F3';
        }
        
        modal.style.display = 'flex';
    }
    
    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'none';
    }
    
    async saveCategory(event) {
        if (event) event.preventDefault();
        
        const categoryId = document.getElementById('categoryId').value;
        const isEdit = !!categoryId;
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value || null,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value
        };
        
        try {
            if (this.supabase) {
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
            }
            
            this.showNotification(`Catégorie ${isEdit ? 'modifiée' : 'ajoutée'} avec succès`, 'success');
            this.closeCategoryModal();
            await this.loadCategories();
            await this.loadProfessionals(); // Recharger pour mettre à jour les filtres
            
        } catch (error) {
            console.error('Erreur sauvegarde catégorie:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    async editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    }
    
    async deleteCategory(categoryId) {
        const confirmed = await this.confirmAction('Supprimer cette catégorie ? Les professionnels associés seront décattégorisés.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
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
            }
            
            this.showNotification('Catégorie supprimée', 'success');
            await this.loadCategories();
            await this.loadProfessionals();
            
        } catch (error) {
            console.error('Erreur suppression catégorie:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async loadSubmissions() {
        // À implémenter selon votre structure de données
        console.log('Chargement des soumissions...');
    }
    
    getStatusColor(status) {
        const colors = {
            'active': '#28a745',
            'inactive': '#6c757d',
            'pending': '#ffc107'
        };
        return colors[status] || '#6c757d';
    }
    
    getStatusLabel(status) {
        const labels = {
            'active': 'Actif',
            'inactive': 'Inactif',
            'pending': 'En attente'
        };
        return labels[status] || status;
    }
    
    // 2. GESTION CRÉATEURS (manage-creators.html)
    async initializeCreatorsPage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page créateurs');
        
        // Variables globales
        window.allCreators = [];
        window.filteredCreators = [];
        window.currentPage = 1;
        window.itemsPerPage = 10;
        
        // Initialiser les événements
        this.setupCreatorsEvents();
        
        // Charger les données
        await this.loadCreators();
    }
    
    setupCreatorsEvents() {
        // Événements de recherche/filtre
        document.getElementById('searchCreator')?.addEventListener('input', () => this.filterCreators());
        document.getElementById('filterDomain')?.addEventListener('change', () => this.filterCreators());
        
        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.changePage(1));
        
        // Modal
        document.getElementById('creatorModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeCreatorModal();
        });
    }
    
    async loadCreators() {
        try {
            let creators = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('creators')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                creators = data;
            } else {
                // Mode simulation
                creators = [
                    {
                        id: 1,
                        brand_name: 'Maison Couture',
                        full_name: 'Marie Lambert',
                        email: 'marie@maisoncouture.com',
                        phone: '0123456789',
                        domain: 'haute-couture',
                        city: 'Paris',
                        country: 'France',
                        is_active: true,
                        portfolio_complete: true,
                        last_activity: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }
                ];
            }
            
            window.allCreators = creators;
            this.updateCreatorStats(creators);
            this.filterCreators();
            
        } catch (error) {
            console.error('Erreur chargement créateurs:', error);
            this.showNotification('Erreur de chargement des créateurs', 'error');
        }
    }
    
    updateCreatorStats(creators) {
        const total = creators.length;
        const active = creators.filter(c => c.is_active).length;
        const complete = creators.filter(c => c.portfolio_complete).length;
        
        const totalEl = document.getElementById('totalCreators');
        const activeEl = document.getElementById('activeCreators');
        const completeEl = document.getElementById('completePortfolios');
        
        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (completeEl) completeEl.textContent = complete;
    }
    
    filterCreators() {
        const searchTerm = document.getElementById('searchCreator')?.value.toLowerCase() || '';
        const domainFilter = document.getElementById('filterDomain')?.value || '';
        
        window.filteredCreators = window.allCreators.filter(creator => {
            const matchesSearch = !searchTerm || 
                (creator.brand_name && creator.brand_name.toLowerCase().includes(searchTerm)) ||
                (creator.email && creator.email.toLowerCase().includes(searchTerm)) ||
                (creator.full_name && creator.full_name.toLowerCase().includes(searchTerm));
            
            const matchesDomain = !domainFilter || creator.domain === domainFilter;
            
            return matchesSearch && matchesDomain;
        });
        
        window.currentPage = 1;
        this.displayCreators();
    }
    
    displayCreators() {
        const table = document.getElementById('creatorsTable');
        if (!table) return;
        
        const startIndex = (window.currentPage - 1) * window.itemsPerPage;
        const endIndex = startIndex + window.itemsPerPage;
        const pageCreators = window.filteredCreators.slice(startIndex, endIndex);
        
        if (pageCreators.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 20px; text-align: center; color: #666;">
                        Aucun créateur trouvé
                    </td>
                </tr>
            `;
        } else {
            table.innerHTML = pageCreators.map(creator => `
                <tr style="border-bottom: 1px solid #eee;" data-creator-id="${creator.id}">
                    <td style="padding: 15px; font-family: monospace;">${creator.id}</td>
                    <td style="padding: 15px;">
                        <strong>${creator.brand_name || 'Sans marque'}</strong>
                        ${creator.full_name ? `<br><small>${creator.full_name}</small>` : ''}
                    </td>
                    <td style="padding: 15px;">${creator.email || 'Non spécifié'}</td>
                    <td style="padding: 15px;">
                        <span class="domain-badge">${creator.domain || 'Non spécifié'}</span>
                    </td>
                    <td style="padding: 15px;">
                        ${creator.portfolio_complete ? 
                            '<span style="color: #28a745;"><i class="fas fa-check-circle"></i> Complet</span>' : 
                            '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> Incomplet</span>'}
                    </td>
                    <td style="padding: 15px;">${creator.created_at ? new Date(creator.created_at).toLocaleDateString() : 'Inconnue'}</td>
                    <td style="padding: 15px;">
                        ${creator.is_active ? 
                            '<span style="color: #28a745; font-weight: bold;">Actif</span>' : 
                            '<span style="color: #dc3545;">Inactif</span>'}
                    </td>
                    <td style="padding: 15px;">
                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            <button class="btn btn-sm" onclick="dashboardManager.viewCreator(${creator.id})" title="Voir détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm" onclick="dashboardManager.editCreator(${creator.id})" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteCreator(${creator.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = Math.ceil(window.filteredCreators.length / window.itemsPerPage);
        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (paginationInfo) {
            paginationInfo.textContent = `Page ${window.currentPage} sur ${totalPages} (${window.filteredCreators.length} créateurs)`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = window.currentPage === 1;
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = window.currentPage === totalPages || totalPages === 0;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }
    
    changePage(direction) {
        const totalPages = Math.ceil(window.filteredCreators.length / window.itemsPerPage);
        const newPage = window.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            window.currentPage = newPage;
            this.displayCreators();
        }
    }
    
    async viewCreator(creatorId) {
        try {
            let creator = window.allCreators.find(c => c.id == creatorId);
            if (!creator) {
                if (this.supabase) {
                    const { data, error } = await this.supabase
                        .from('creators')
                        .select('*')
                        .eq('id', creatorId)
                        .single();
                    
                    if (error) throw error;
                    creator = data;
                }
            }
            
            let portfolio = null;
            if (this.supabase && creator) {
                const { data, error } = await this.supabase
                    .from('portfolios')
                    .select('*')
                    .eq('creator_id', creatorId)
                    .single();
                
                if (!error) portfolio = data;
            }
            
            const modal = document.getElementById('creatorModal');
            const details = document.getElementById('creatorDetails');
            
            if (modal && details) {
                details.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px;">
                        <div>
                            <div style="margin-bottom: 20px;">
                                <h3 style="margin-bottom: 10px;">Informations</h3>
                                <p><strong>Marque:</strong> ${creator.brand_name || 'Non spécifié'}</p>
                                <p><strong>Nom:</strong> ${creator.full_name || 'Non spécifié'}</p>
                                <p><strong>Email:</strong> ${creator.email || 'Non spécifié'}</p>
                                <p><strong>Téléphone:</strong> ${creator.phone || 'Non spécifié'}</p>
                                <p><strong>Domaine:</strong> ${creator.domain || 'Non spécifié'}</p>
                                <p><strong>Ville:</strong> ${creator.city || 'Non spécifié'}</p>
                                <p><strong>Pays:</strong> ${creator.country || 'Non spécifié'}</p>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h3 style="margin-bottom: 10px;">Statut</h3>
                                <p><strong>Compte:</strong> ${creator.is_active ? 'Actif' : 'Inactif'}</p>
                                <p><strong>Portfolio:</strong> ${creator.portfolio_complete ? 'Complet' : 'Incomplet'}</p>
                                <p><strong>Dernière activité:</strong> ${creator.last_activity ? new Date(creator.last_activity).toLocaleString() : 'Jamais'}</p>
                                <p><strong>Inscrit depuis:</strong> ${creator.created_at ? new Date(creator.created_at).toLocaleDateString() : 'Inconnu'}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="margin-bottom: 10px;">Portfolio</h3>
                            ${portfolio ? `
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                                    <p><strong>Bio:</strong> ${portfolio.bio || 'Non renseignée'}</p>
                                    <p><strong>Style:</strong> ${portfolio.style || 'Non spécifié'}</p>
                                    <p><strong>Instagram:</strong> ${portfolio.instagram || 'Non renseigné'}</p>
                                    <p><strong>Site web:</strong> ${portfolio.website || 'Non renseigné'}</p>
                                    <p><strong>Collections:</strong> ${portfolio.collections_count || 0}</p>
                                    <p><strong>Produits:</strong> ${portfolio.products_count || 0}</p>
                                </div>
                            ` : '<p style="color: #666;">Aucun portfolio trouvé</p>'}
                            
                            <div style="margin-top: 20px;">
                                <h3 style="margin-bottom: 10px;">Actions rapides</h3>
                                <div style="display: flex; gap: 10px;">
                                    <button class="btn" onclick="dashboardManager.toggleCreatorStatus(${creatorId}, ${!creator.is_active})">
                                        ${creator.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                                    </button>
                                    <button class="btn btn-danger" onclick="dashboardManager.deleteCreator(${creatorId})">
                                        Supprimer définitivement
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('Erreur chargement détails:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }
    
    closeCreatorModal() {
        const modal = document.getElementById('creatorModal');
        if (modal) modal.style.display = 'none';
    }
    
    async toggleCreatorStatus(creatorId, newStatus) {
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('creators')
                    .update({ is_active: newStatus })
                    .eq('id', creatorId);
                
                if (error) throw error;
            }
            
            this.showNotification(`Compte ${newStatus ? 'activé' : 'désactivé'} avec succès`, 'success');
            await this.loadCreators();
            this.closeCreatorModal();
            
        } catch (error) {
            console.error('Erreur changement statut:', error);
            this.showNotification('Erreur lors du changement de statut', 'error');
        }
    }
    
    async deleteCreator(creatorId) {
        const confirmed = await this.confirmAction('Êtes-vous sûr de vouloir supprimer ce créateur ? Cette action est irréversible et supprimera également son portfolio.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                // D'abord supprimer le portfolio
                await this.supabase
                    .from('portfolios')
                    .delete()
                    .eq('creator_id', creatorId);
                
                // Puis supprimer le créateur
                const { error } = await this.supabase
                    .from('creators')
                    .delete()
                    .eq('id', creatorId);
                
                if (error) throw error;
            }
            
            this.showNotification('Créateur supprimé avec succès', 'success');
            await this.loadCreators();
            this.closeCreatorModal();
            
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async editCreator(creatorId) {
        const creator = window.allCreators.find(c => c.id == creatorId);
        if (!creator) return;
        
        const newBrand = prompt('Nouveau nom de marque:', creator.brand_name || '');
        if (newBrand === null) return;
        
        const newEmail = prompt('Nouvel email:', creator.email || '');
        if (newEmail === null) return;
        
        const newDomain = prompt('Nouveau domaine:', creator.domain || '');
        if (newDomain === null) return;
        
        try {
            const updates = {
                brand_name: newBrand,
                email: newEmail,
                domain: newDomain
            };
            
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('creators')
                    .update(updates)
                    .eq('id', creatorId);
                
                if (error) throw error;
            }
            
            this.showNotification('Créateur mis à jour', 'success');
            await this.loadCreators();
            
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    }
    
    // 3. GESTION PORTFOLIO (manage-portfolio.html)
    async initializePortfolioPage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page portfolio');
        
        // Variables globales
        window.allPortfolios = [];
        window.displayedCount = 6;
        
        // Initialiser les événements
        this.setupPortfolioEvents();
        
        // Charger les données
        await this.loadPortfolios();
    }
    
    setupPortfolioEvents() {
        // Événements de recherche/filtre
        document.getElementById('searchPortfolio')?.addEventListener('input', () => this.filterPortfolios());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterPortfolios());
        document.getElementById('filterDomain')?.addEventListener('change', () => this.filterPortfolios());
        
        // Bouton charger plus
        document.getElementById('loadMore')?.addEventListener('click', () => this.loadMorePortfolios());
        
        // Modal
        document.getElementById('portfolioModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closePortfolioModal();
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePortfolioModal();
        });
    }
    
    async loadPortfolios() {
        try {
            let portfolios = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('portfolios')
                    .select(`
                        *,
                        creators (
                            full_name,
                            email,
                            domain
                        )
                    `)
                    .order('updated_at', { ascending: false });
                
                if (error) throw error;
                
                portfolios = data.map(item => ({
                    ...item,
                    creator_name: item.creators?.full_name,
                    creator_email: item.creators?.email,
                    creator_domain: item.creators?.domain
                }));
            } else {
                // Mode simulation
                portfolios = [
                    {
                        id: 1,
                        brand_name: 'Maison Couture',
                        creator_id: 1,
                        creator_name: 'Marie Lambert',
                        creator_domain: 'haute-couture',
                        bio: 'Créatrice de haute couture parisienne',
                        style: 'Haute couture',
                        profile_image: null,
                        instagram: '@maisoncouture',
                        website: 'https://maisoncouture.com',
                        is_complete: true,
                        needs_review: false,
                        photos_count: 12,
                        collections_count: 3,
                        products_count: 45,
                        updated_at: new Date().toISOString()
                    }
                ];
            }
            
            window.allPortfolios = portfolios;
            this.updatePortfolioStats(portfolios);
            this.displayPortfolios(portfolios.slice(0, window.displayedCount));
            
        } catch (error) {
            console.error('Erreur chargement portfolios:', error);
            this.showNotification('Erreur de chargement des portfolios', 'error');
        }
    }
    
    updatePortfolioStats(portfolios) {
        const total = portfolios.length;
        const complete = portfolios.filter(p => p.is_complete).length;
        const pending = portfolios.filter(p => p.needs_review).length;
        const avgPhotos = portfolios.length > 0 ? 
            Math.round(portfolios.reduce((sum, p) => sum + (p.photos_count || 0), 0) / portfolios.length) : 0;
        
        const totalEl = document.getElementById('totalPortfolios');
        const completeEl = document.getElementById('completePortfolios');
        const pendingEl = document.getElementById('pendingPortfolios');
        const avgEl = document.getElementById('avgPhotos');
        
        if (totalEl) totalEl.textContent = total;
        if (completeEl) completeEl.textContent = complete;
        if (pendingEl) pendingEl.textContent = pending;
        if (avgEl) avgEl.textContent = avgPhotos;
    }
    
    displayPortfolios(portfolios) {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;
        
        if (!portfolios || portfolios.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-portrait" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">Aucun portfolio trouvé</h3>
                    <p style="color: #999;">Essayez avec d'autres critères de recherche</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = portfolios.map(portfolio => `
            <div class="portfolio-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 15px rgba(0,0,0,0.1); transition: transform 0.3s; cursor: pointer;" 
                 onclick="dashboardManager.viewPortfolio(${portfolio.id})">
                
                ${portfolio.profile_image ? `
                <div style="height: 200px; overflow: hidden;">
                    <img src="${portfolio.profile_image}" alt="${portfolio.brand_name}" 
                         style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
                </div>
                ` : `
                <div style="height: 200px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-portrait" style="font-size: 4rem; color: #999;"></i>
                </div>
                `}
                
                <div style="padding: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #333; font-size: 1.2rem;">${portfolio.brand_name || 'Sans nom'}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">
                                <i class="fas fa-user"></i> ${portfolio.creator_name || 'Anonyme'}
                            </p>
                        </div>
                        <span class="portfolio-status ${portfolio.is_complete ? 'status-complete' : 'status-incomplete'}">
                            ${portfolio.is_complete ? '✓ Complet' : '✗ Incomplet'}
                        </span>
                    </div>
                    
                    <p style="color: #666; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; 
                       display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${portfolio.bio || 'Aucune description disponible'}
                    </p>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                        <span class="tag" style="background: #e9ecef; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #495057;">
                            <i class="fas fa-tag"></i> ${portfolio.domain || portfolio.creator_domain || 'Non spécifié'}
                        </span>
                        <span class="tag" style="background: #e9ecef; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #495057;">
                            <i class="fas fa-image"></i> ${portfolio.photos_count || 0} photos
                        </span>
                        ${portfolio.needs_review ? `
                        <span class="tag" style="background: #fff3cd; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #856404;">
                            <i class="fas fa-clock"></i> À valider
                        </span>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <small style="color: #999;">
                            Mis à jour: ${portfolio.updated_at ? new Date(portfolio.updated_at).toLocaleDateString() : 'Jamais'}
                        </small>
                        <div>
                            <button class="btn-action" onclick="event.stopPropagation(); dashboardManager.validatePortfolio(${portfolio.id})" 
                                    title="Valider" style="background: #28a745; color: white; border: none; width: 36px; height: 36px; border-radius: 50%; margin-right: 5px;">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action" onclick="event.stopPropagation(); dashboardManager.deletePortfolio(${portfolio.id})" 
                                    title="Supprimer" style="background: #dc3545; color: white; border: none; width: 36px; height: 36px; border-radius: 50%;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Ajouter les effets hover
        const cards = document.querySelectorAll('.portfolio-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                const img = this.querySelector('img');
                if (img) img.style.transform = 'scale(1.05)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                const img = this.querySelector('img');
                if (img) img.style.transform = 'scale(1)';
            });
        });
    }
    
    filterPortfolios() {
        const searchTerm = document.getElementById('searchPortfolio')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        const domainFilter = document.getElementById('filterDomain')?.value || '';
        
        const filtered = window.allPortfolios.filter(portfolio => {
            const matchesSearch = !searchTerm || 
                (portfolio.brand_name && portfolio.brand_name.toLowerCase().includes(searchTerm)) ||
                (portfolio.creator_name && portfolio.creator_name.toLowerCase().includes(searchTerm)) ||
                (portfolio.bio && portfolio.bio.toLowerCase().includes(searchTerm));
            
            let matchesStatus = true;
            if (statusFilter === 'complete') matchesStatus = portfolio.is_complete;
            if (statusFilter === 'incomplete') matchesStatus = !portfolio.is_complete;
            if (statusFilter === 'pending') matchesStatus = portfolio.needs_review;
            
            const matchesDomain = !domainFilter || 
                portfolio.domain === domainFilter || 
                portfolio.creator_domain === domainFilter;
            
            return matchesSearch && matchesStatus && matchesDomain;
        });
        
        window.displayedCount = 6;
        this.displayPortfolios(filtered.slice(0, window.displayedCount));
        
        // Afficher/masquer le bouton "Charger plus"
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = filtered.length > window.displayedCount ? 'flex' : 'none';
        }
    }
    
    loadMorePortfolios() {
        const searchTerm = document.getElementById('searchPortfolio')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        const domainFilter = document.getElementById('filterDomain')?.value || '';
        
        const filtered = window.allPortfolios.filter(portfolio => {
            const matchesSearch = !searchTerm || 
                (portfolio.brand_name && portfolio.brand_name.toLowerCase().includes(searchTerm)) ||
                (portfolio.creator_name && portfolio.creator_name.toLowerCase().includes(searchTerm)) ||
                (portfolio.bio && portfolio.bio.toLowerCase().includes(searchTerm));
            
            let matchesStatus = true;
            if (statusFilter === 'complete') matchesStatus = portfolio.is_complete;
            if (statusFilter === 'incomplete') matchesStatus = !portfolio.is_complete;
            if (statusFilter === 'pending') matchesStatus = portfolio.needs_review;
            
            const matchesDomain = !domainFilter || 
                portfolio.domain === domainFilter || 
                portfolio.creator_domain === domainFilter;
            
            return matchesSearch && matchesStatus && matchesDomain;
        });
        
        window.displayedCount += 6;
        this.displayPortfolios(filtered.slice(0, window.displayedCount));
        
        // Masquer le bouton si on a tout affiché
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn && window.displayedCount >= filtered.length) {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    async viewPortfolio(portfolioId) {
        try {
            let portfolio = window.allPortfolios.find(p => p.id == portfolioId);
            let creator = null;
            
            if (!portfolio && this.supabase) {
                const { data, error } = await this.supabase
                    .from('portfolios')
                    .select('*')
                    .eq('id', portfolioId)
                    .single();
                
                if (error) throw error;
                portfolio = data;
            }
            
            if (portfolio && this.supabase) {
                const { data, error } = await this.supabase
                    .from('creators')
                    .select('*')
                    .eq('id', portfolio.creator_id)
                    .single();
                
                if (!error) creator = data;
            }
            
            const modal = document.getElementById('portfolioModal');
            const content = document.getElementById('portfolioModalContent');
            
            if (modal && content) {
                content.innerHTML = `
                    <div style="padding: 30px;">
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 40px; margin-bottom: 30px;">
                            <!-- Section gauche : Informations générales -->
                            <div>
                                <div style="margin-bottom: 30px;">
                                    <h2 style="color: #333; margin-bottom: 15px;">${portfolio.brand_name || 'Sans nom'}</h2>
                                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                                        <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #d4af37;">
                                            ${portfolio.profile_image ? 
                                                `<img src="${portfolio.profile_image}" alt="Photo profil" style="width: 100%; height: 100%; object-fit: cover;">` :
                                                `<div style="width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-user" style="font-size: 2rem; color: #ccc;"></i>
                                                </div>`}
                                        </div>
                                        <div>
                                            <h3 style="margin: 0 0 5px 0;">${creator?.full_name || 'Anonyme'}</h3>
                                            <p style="margin: 0; color: #666;"><i class="fas fa-envelope"></i> ${creator?.email || 'Non spécifié'}</p>
                                            <p style="margin: 0; color: #666;"><i class="fas fa-phone"></i> ${creator?.phone || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                                    <h4 style="margin-bottom: 15px; color: #333;">Détails du portfolio</h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                        <div>
                                            <p><strong>Domaine:</strong><br>${portfolio.domain || 'Non spécifié'}</p>
                                            <p><strong>Style:</strong><br>${portfolio.style || 'Non spécifié'}</p>
                                            <p><strong>Statut:</strong><br>
                                                <span class="${portfolio.is_complete ? 'status-complete' : 'status-incomplete'}">
                                                    ${portfolio.is_complete ? 'Complet ✓' : 'Incomplet ✗'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p><strong>Photos:</strong><br>${portfolio.photos_count || 0}</p>
                                            <p><strong>Collections:</strong><br>${portfolio.collections_count || 0}</p>
                                            <p><strong>À valider:</strong><br>
                                                ${portfolio.needs_review ? 
                                                    '<span style="color: #ffc107;"><i class="fas fa-clock"></i> En attente</span>' : 
                                                    '<span style="color: #28a745;"><i class="fas fa-check"></i> Validé</span>'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Actions d'administration -->
                                <div style="background: #fff3cd; padding: 20px; border-radius: 10px;">
                                    <h4 style="margin-bottom: 15px; color: #856404;">Actions d'administration</h4>
                                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                        ${portfolio.needs_review ? `
                                        <button class="btn" onclick="dashboardManager.validatePortfolio(${portfolio.id})" style="flex: 1;">
                                            <i class="fas fa-check-circle"></i> Valider le portfolio
                                        </button>
                                        ` : ''}
                                        <button class="btn btn-danger" onclick="dashboardManager.deletePortfolio(${portfolio.id})" style="flex: 1;">
                                            <i class="fas fa-trash"></i> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Section droite : Bio et informations détaillées -->
                            <div>
                                <div style="margin-bottom: 30px;">
                                    <h4 style="color: #333; margin-bottom: 15px;">Biographie</h4>
                                    <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #eee;">
                                        ${portfolio.bio ? 
                                            `<p style="line-height: 1.6; color: #555;">${portfolio.bio}</p>` : 
                                            `<p style="color: #999; font-style: italic;">Aucune biographie renseignée</p>`}
                                    </div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                                    <div>
                                        <h4 style="color: #333; margin-bottom: 15px;">Liens</h4>
                                        <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
                                            ${portfolio.instagram ? `
                                                <p><i class="fab fa-instagram" style="color: #E4405F;"></i> 
                                                    <a href="https://instagram.com/${portfolio.instagram.replace('@', '')}" target="_blank" style="color: #0066cc;">
                                                        ${portfolio.instagram}
                                                    </a>
                                                </p>
                                            ` : ''}
                                            ${portfolio.website ? `
                                                <p><i class="fas fa-globe" style="color: #17a2b8;"></i> 
                                                    <a href="${portfolio.website}" target="_blank" style="color: #0066cc;">
                                                        ${portfolio.website}
                                                    </a>
                                                </p>
                                            ` : ''}
                                            ${!portfolio.instagram && !portfolio.website ? 
                                                '<p style="color: #999;">Aucun lien renseigné</p>' : ''}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 style="color: #333; margin-bottom: 15px;">Métadonnées</h4>
                                        <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
                                            <p><strong>Créé le:</strong><br>
                                                ${portfolio.created_at ? new Date(portfolio.created_at).toLocaleDateString() : 'Inconnu'}
                                            </p>
                                            <p><strong>Mis à jour:</strong><br>
                                                ${portfolio.updated_at ? new Date(portfolio.updated_at).toLocaleDateString() : 'Jamais'}
                                            </p>
                                            <p><strong>Visibilité:</strong><br>
                                                ${portfolio.is_public ? 
                                                    '<span style="color: #28a745;">Public</span>' : 
                                                    '<span style="color: #dc3545;">Privé</span>'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Notes d'administration -->
                                <div>
                                    <h4 style="color: #333; margin-bottom: 15px;">Notes d'administration</h4>
                                    <textarea id="adminNotes" placeholder="Ajoutez des notes internes..." 
                                              style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; min-height: 100px; font-family: inherit;">
                                        ${portfolio.admin_notes || ''}
                                    </textarea>
                                    <button class="btn btn-primary" onclick="dashboardManager.saveAdminNotes(${portfolio.id})" style="margin-top: 10px;">
                                        <i class="fas fa-save"></i> Enregistrer les notes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Erreur chargement détails:', error);
            this.showNotification('Erreur lors du chargement des détails du portfolio', 'error');
        }
    }
    
    closePortfolioModal() {
        const modal = document.getElementById('portfolioModal');
        if (modal) modal.style.display = 'none';
    }
    
    async validatePortfolio(portfolioId) {
        const confirmed = await this.confirmAction('Valider ce portfolio ? Il sera marqué comme vérifié et pourra être présenté aux clients.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('portfolios')
                    .update({ 
                        needs_review: false,
                        is_complete: true,
                        validated_at: new Date().toISOString()
                    })
                    .eq('id', portfolioId);
                
                if (error) throw error;
            }
            
            this.showNotification('Portfolio validé avec succès', 'success');
            await this.loadPortfolios();
            this.closePortfolioModal();
            
        } catch (error) {
            console.error('Erreur validation:', error);
            this.showNotification('Erreur lors de la validation', 'error');
        }
    }
    
    async deletePortfolio(portfolioId) {
        const confirmed = await this.confirmAction('⚠️ Attention ! Supprimer ce portfolio ? Cette action supprimera toutes les photos et collections associées. Cette action est irréversible.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('portfolios')
                    .delete()
                    .eq('id', portfolioId);
                
                if (error) throw error;
            }
            
            this.showNotification('Portfolio supprimé avec succès', 'success');
            await this.loadPortfolios();
            this.closePortfolioModal();
            
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async saveAdminNotes(portfolioId) {
        const notes = document.getElementById('adminNotes')?.value;
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('portfolios')
                    .update({ admin_notes: notes })
                    .eq('id', portfolioId);
                
                if (error) throw error;
            }
            
            this.showNotification('Notes enregistrées', 'success');
            
        } catch (error) {
            console.error('Erreur sauvegarde notes:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    // 4. GESTION OPPORTUNITÉS (manage-opportunities.html)
    async initializeOpportunitiesPage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page opportunités');
        
        // Variables globales
        window.allOpportunities = [];
        window.allApplications = [];
        
        // Initialiser les événements
        this.setupOpportunitiesEvents();
        
        // Charger les données
        await this.loadOpportunities();
        await this.loadApplications();
    }
    
    setupOpportunitiesEvents() {
        // Événements des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchOpportunitiesTab(tab);
            });
        });
        
        // Événements de recherche/filtre
        document.getElementById('searchOpportunity')?.addEventListener('input', () => this.filterOpportunities());
        document.getElementById('filterType')?.addEventListener('change', () => this.filterOpportunities());
        document.getElementById('filterApplicationStatus')?.addEventListener('change', () => this.filterApplications());
        
        // Bouton créer opportunité
        document.getElementById('addOpportunityBtn')?.addEventListener('click', () => this.showOpportunityModal());
        
        // Modal opportunité
        document.getElementById('opportunityModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeOpportunityModal();
        });
    }
    
    async loadOpportunities() {
        try {
            let opportunities = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('opportunities')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                opportunities = data;
            } else {
                // Mode simulation
                opportunities = [
                    {
                        id: 1,
                        title: 'Collaboration collection Printemps',
                        type: 'collaboration',
                        description: 'Recherche créateurs pour collaboration sur collection printemps',
                        start_date: new Date().toISOString(),
                        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        participation_fee: 0,
                        spots_available: 5,
                        status: 'active',
                        created_at: new Date().toISOString()
                    }
                ];
            }
            
            window.allOpportunities = opportunities;
            this.updateOpportunityStats(opportunities, window.allApplications);
            this.displayOpportunities(opportunities);
            
        } catch (error) {
            console.error('Erreur chargement opportunités:', error);
            this.showNotification('Erreur de chargement des opportunités', 'error');
        }
    }
    
    async loadApplications() {
        try {
            let applications = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('applications')
                    .select(`
                        *,
                        opportunities (
                            title
                        ),
                        creators (
                            full_name,
                            email
                        )
                    `)
                    .order('applied_at', { ascending: false });
                
                if (error) throw error;
                
                applications = data.map(item => ({
                    ...item,
                    opportunity_title: item.opportunities?.title,
                    creator_name: item.creators?.full_name,
                    creator_email: item.creators?.email
                }));
            }
            
            window.allApplications = applications;
            this.updateOpportunityStats(window.allOpportunities, applications);
            
            // Afficher si l'onglet est actif
            if (document.querySelector('[data-tab="applications"]')?.classList.contains('active')) {
                this.displayApplications(applications);
            }
            
        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
        }
    }
    
    updateOpportunityStats(opportunities, applications) {
        const active = opportunities.filter(o => o.status === 'active').length;
        const upcoming = opportunities.filter(o => o.status === 'upcoming').length;
        const completed = opportunities.filter(o => o.status === 'completed').length;
        const totalApps = applications?.length || 0;
        const pendingApps = applications?.filter(a => a.status === 'pending').length || 0;
        
        const activeEl = document.getElementById('activeOpportunities');
        const upcomingEl = document.getElementById('upcomingOpportunities');
        const completedEl = document.getElementById('completedOpportunities');
        const totalAppsEl = document.getElementById('totalApplications');
        const pendingBadge = document.getElementById('pendingAppsBadge');
        
        if (activeEl) activeEl.textContent = active;
        if (upcomingEl) upcomingEl.textContent = upcoming;
        if (completedEl) completedEl.textContent = completed;
        if (totalAppsEl) totalAppsEl.textContent = totalApps;
        
        if (pendingBadge) {
            if (pendingApps > 0) {
                pendingBadge.textContent = pendingApps;
                pendingBadge.style.display = 'inline';
            } else {
                pendingBadge.style.display = 'none';
            }
        }
    }
    
    displayOpportunities(opportunities) {
        const container = document.getElementById('opportunitiesList');
        if (!container) return;
        
        const filtered = this.filterOpportunitiesList(opportunities);
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-bullhorn" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>Aucune opportunité trouvée</h3>
                    <p>Créez votre première opportunité !</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(opp => `
            <div class="opportunity-item" style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid ${this.getOpportunityStatusColor(opp.status)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 10px 0;">${opp.title}</h3>
                        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                            <span class="badge" style="background: ${this.getOpportunityTypeColor(opp.type)}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                                ${this.getOpportunityTypeLabel(opp.type)}
                            </span>
                            <span class="badge" style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                                <i class="fas fa-calendar"></i> Jusqu'au ${new Date(opp.deadline).toLocaleDateString()}
                            </span>
                            <span class="badge" style="background: #e9ecef; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                                <i class="fas fa-users"></i> ${opp.spots_available || 'Illimité'} places
                            </span>
                        </div>
                        <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">${opp.description}</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-shrink: 0;">
                        <button class="btn-action" onclick="dashboardManager.editOpportunity(${opp.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action" onclick="dashboardManager.viewApplications(${opp.id})" title="Voir candidatures">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn-action btn-danger" onclick="dashboardManager.deleteOpportunity(${opp.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px;">
                    <div>
                        <small style="color: #999;">
                            <i class="fas fa-clock"></i> Créé le ${new Date(opp.created_at).toLocaleDateString()}
                            ${opp.updated_at !== opp.created_at ? 
                                ` • Mis à jour le ${new Date(opp.updated_at).toLocaleDateString()}` : ''}
                        </small>
                    </div>
                    <div>
                        <span class="status-badge" style="background: ${this.getOpportunityStatusColor(opp.status)}; color: white; padding: 5px 15px; border-radius: 15px; font-size: 0.9rem;">
                            ${this.getOpportunityStatusLabel(opp.status)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    filterOpportunitiesList(opportunities) {
        const searchTerm = document.getElementById('searchOpportunity')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('filterType')?.value || '';
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        
        return opportunities.filter(opp => {
            // Filtre par onglet
            let matchesTab = true;
            if (activeTab === 'active') matchesTab = opp.status === 'active';
            if (activeTab === 'upcoming') matchesTab = opp.status === 'upcoming';
            if (activeTab === 'completed') matchesTab = opp.status === 'completed';
            
            // Filtre par recherche
            const matchesSearch = !searchTerm || 
                opp.title.toLowerCase().includes(searchTerm) ||
                opp.description.toLowerCase().includes(searchTerm);
            
            // Filtre par type
            const matchesType = !typeFilter || opp.type === typeFilter;
            
            return matchesTab && matchesSearch && matchesType;
        });
    }
    
    filterOpportunities() {
        const filtered = this.filterOpportunitiesList(window.allOpportunities);
        this.displayOpportunities(filtered);
    }
    
    switchOpportunitiesTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Afficher le contenu approprié
        const opportunitiesTab = document.getElementById('opportunitiesTab');
        const applicationsTab = document.getElementById('applicationsTab');
        
        if (opportunitiesTab) opportunitiesTab.style.display = 'none';
        if (applicationsTab) applicationsTab.style.display = 'none';
        
        if (tabName === 'applications') {
            if (applicationsTab) applicationsTab.style.display = 'block';
            this.filterApplications();
        } else {
            if (opportunitiesTab) opportunitiesTab.style.display = 'block';
            this.filterOpportunities();
        }
    }
    
    showOpportunityModal(opportunityId = null) {
        const modal = document.getElementById('opportunityModal');
        if (!modal) return;
        
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('opportunityForm');
        
        if (opportunityId) {
            // Mode édition
            title.textContent = 'Modifier l\'opportunité';
            
            const opportunity = window.allOpportunities.find(o => o.id == opportunityId);
            if (opportunity) {
                document.getElementById('opportunityId').value = opportunity.id;
                document.getElementById('title').value = opportunity.title;
                document.getElementById('type').value = opportunity.type;
                document.getElementById('description').value = opportunity.description;
                document.getElementById('start_date').value = opportunity.start_date.split('T')[0];
                document.getElementById('deadline').value = opportunity.deadline.split('T')[0];
                document.getElementById('participation_fee').value = opportunity.participation_fee || '';
                document.getElementById('spots_available').value = opportunity.spots_available || '';
                document.getElementById('status').value = opportunity.status;
            }
        } else {
            // Mode création
            title.textContent = 'Créer une opportunité';
            form.reset();
            document.getElementById('opportunityId').value = '';
            
            // Définir la date de début à aujourd'hui et la date limite à dans un mois
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const nextMonthStr = nextMonth.toISOString().split('T')[0];
            
            document.getElementById('start_date').value = today;
            document.getElementById('deadline').value = nextMonthStr;
            document.getElementById('status').value = 'active';
        }
        
        modal.style.display = 'flex';
    }
    
    closeOpportunityModal() {
        const modal = document.getElementById('opportunityModal');
        if (modal) modal.style.display = 'none';
    }
    
    async saveOpportunity(event) {
        if (event) event.preventDefault();
        
        const opportunityId = document.getElementById('opportunityId').value;
        const isEdit = !!opportunityId;
        
        const opportunityData = {
            title: document.getElementById('title').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            start_date: document.getElementById('start_date').value,
            deadline: document.getElementById('deadline').value,
            participation_fee: document.getElementById('participation_fee').value || null,
            spots_available: document.getElementById('spots_available').value || null,
            status: document.getElementById('status').value
        };
        
        try {
            if (this.supabase) {
                let error;
                if (isEdit) {
                    const { error: updateError } = await this.supabase
                        .from('opportunities')
                        .update(opportunityData)
                        .eq('id', opportunityId);
                    error = updateError;
                } else {
                    const { error: insertError } = await this.supabase
                        .from('opportunities')
                        .insert([opportunityData]);
                    error = insertError;
                }
                
                if (error) throw error;
            }
            
            this.showNotification(`Opportunité ${isEdit ? 'modifiée' : 'créée'} avec succès`, 'success');
            this.closeOpportunityModal();
            await this.loadOpportunities();
            
        } catch (error) {
            console.error('Erreur sauvegarde opportunité:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    async editOpportunity(opportunityId) {
        this.showOpportunityModal(opportunityId);
    }
    
    async deleteOpportunity(opportunityId) {
        const confirmed = await this.confirmAction('Supprimer cette opportunité ? Toutes les candidatures associées seront également supprimées.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                // Supprimer d'abord les candidatures
                await this.supabase
                    .from('applications')
                    .delete()
                    .eq('opportunity_id', opportunityId);
                
                // Puis supprimer l'opportunité
                const { error } = await this.supabase
                    .from('opportunities')
                    .delete()
                    .eq('id', opportunityId);
                
                if (error) throw error;
            }
            
            this.showNotification('Opportunité supprimée', 'success');
            await this.loadOpportunities();
            
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async viewApplications(opportunityId) {
        const applications = window.allApplications.filter(app => app.opportunity_id == opportunityId);
        
        if (applications.length === 0) {
            this.showNotification('Aucune candidature pour cette opportunité', 'info');
            return;
        }
        
        const appList = applications.map(app => `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <strong>${app.creator_name || 'Anonyme'}</strong><br>
                <small>${app.creator_email}</small><br>
                <p style="margin: 10px 0; color: #666;">${app.message}</p>
                <span class="badge" style="background: ${this.getApplicationStatusColor(app.status)}; color: white; padding: 2px 8px; border-radius: 10px;">
                    ${this.getApplicationStatusLabel(app.status)}
                </span>
            </div>
        `).join('');
        
        const details = `
            <h3>Candidatures (${applications.length})</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                ${appList}
            </div>
        `;
        
        this.showCustomModal('Candidatures', details);
    }
    
    getOpportunityStatusColor(status) {
        const colors = {
            'active': '#28a745',
            'upcoming': '#ffc107',
            'completed': '#6c757d',
            'draft': '#adb5bd'
        };
        return colors[status] || '#6c757d';
    }
    
    getOpportunityStatusLabel(status) {
        const labels = {
            'active': 'Active',
            'upcoming': 'À venir',
            'completed': 'Terminée',
            'draft': 'Brouillon'
        };
        return labels[status] || status;
    }
    
    getOpportunityTypeColor(type) {
        const colors = {
            'editorial': '#17a2b8',
            'collaboration': '#d4af37',
            'contest': '#ffc107',
            'workshop': '#28a745'
        };
        return colors[type] || '#6c757d';
    }
    
    getOpportunityTypeLabel(type) {
        const labels = {
            'editorial': 'Éditorial',
            'collaboration': 'Collaboration',
            'contest': 'Concours',
            'workshop': 'Workshop'
        };
        return labels[type] || type;
    }
    
    getApplicationStatusColor(status) {
        const colors = {
            'pending': '#ffc107',
            'reviewed': '#17a2b8',
            'accepted': '#28a745',
            'rejected': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }
    
    getApplicationStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'reviewed': 'En revue',
            'accepted': 'Accepté',
            'rejected': 'Rejeté'
        };
        return labels[status] || status;
    }
    
    filterApplications() {
        const statusFilter = document.getElementById('filterApplicationStatus')?.value || '';
        const filtered = window.allApplications.filter(app => {
            return !statusFilter || app.status === statusFilter;
        });
        
        this.displayApplications(filtered);
    }
    
    displayApplications(applications) {
        const container = document.getElementById('applicationsList');
        if (!container) return;
        
        if (applications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>Aucune candidature trouvée</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = applications.map(app => `
            <div class="application-item" style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0;">${app.opportunity_title}</h4>
                        <p style="margin: 0; color: #666;">
                            <strong>${app.creator_name || 'Anonyme'}</strong> • ${app.creator_email}
                        </p>
                    </div>
                    <div>
                        <span class="status-badge" style="background: ${this.getApplicationStatusColor(app.status)}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                            ${this.getApplicationStatusLabel(app.status)}
                        </span>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0; font-style: italic; color: #555;">"${app.message.substring(0, 150)}${app.message.length > 150 ? '...' : ''}"</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #999;">
                        Postulé le ${new Date(app.applied_at).toLocaleDateString()}
                    </small>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-sm" onclick="dashboardManager.viewApplication(${app.id})">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                        <button class="btn btn-sm ${app.status === 'pending' ? 'btn-primary' : 'btn-secondary'}" onclick="dashboardManager.reviewApplication(${app.id})">
                            ${app.status === 'pending' ? '<i class="fas fa-check"></i> Examiner' : '<i class="fas fa-edit"></i> Revoir'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async viewApplication(applicationId) {
        try {
            let application = window.allApplications.find(a => a.id == applicationId);
            
            if (!application && this.supabase) {
                const { data, error } = await this.supabase
                    .from('applications')
                    .select(`
                        *,
                        opportunities (
                            title
                        ),
                        creators (
                            full_name,
                            email
                        )
                    `)
                    .eq('id', applicationId)
                    .single();
                
                if (error) throw error;
                
                application = {
                    ...data,
                    opportunity_title: data.opportunities?.title,
                    creator_name: data.creators?.full_name,
                    creator_email: data.creators?.email
                };
            }
            
            if (!application) {
                this.showNotification('Candidature non trouvée', 'error');
                return;
            }
            
            let portfolio = null;
            if (this.supabase && application.creator_id) {
                const { data, error } = await this.supabase
                    .from('portfolios')
                    .select('*')
                    .eq('creator_id', application.creator_id)
                    .single();
                
                if (!error) portfolio = data;
            }
            
            const modalContent = `
                <h3>Candidature de ${application.creator_name || 'Anonyme'}</h3>
                <p><strong>Email:</strong> ${application.creator_email}</p>
                <p><strong>Opportunité:</strong> ${application.opportunity_title}</p>
                <p><strong>Date:</strong> ${new Date(application.applied_at).toLocaleString()}</p>
                <p><strong>Statut:</strong> ${this.getApplicationStatusLabel(application.status)}</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>Message:</strong><br>
                    <p>${application.message}</p>
                </div>
                ${portfolio ? `
                    <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <strong>Portfolio:</strong><br>
                        <p>${portfolio.brand_name || 'Sans marque'}</p>
                        <p>${portfolio.bio ? portfolio.bio.substring(0, 200) + '...' : 'Aucune bio'}</p>
                    </div>
                ` : ''}
                <div style="margin-top: 20px;">
                    <select id="newStatus" style="padding: 8px; margin-right: 10px;">
                        <option value="pending" ${application.status === 'pending' ? 'selected' : ''}>En attente</option>
                        <option value="reviewed" ${application.status === 'reviewed' ? 'selected' : ''}>En revue</option>
                        <option value="accepted" ${application.status === 'accepted' ? 'selected' : ''}>Accepté</option>
                        <option value="rejected" ${application.status === 'rejected' ? 'selected' : ''}>Rejeté</option>
                    </select>
                    <button class="btn" onclick="dashboardManager.updateApplicationStatus(${applicationId})">
                        Mettre à jour
                    </button>
                </div>
            `;
            
            this.showCustomModal('Détails de la candidature', modalContent);
            
        } catch (error) {
            console.error('Erreur vue candidature:', error);
            this.showNotification('Erreur lors du chargement de la candidature', 'error');
        }
    }
    
    async updateApplicationStatus(applicationId) {
        const newStatus = document.getElementById('newStatus')?.value;
        if (!newStatus) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('applications')
                    .update({ 
                        status: newStatus,
                        reviewed_at: newStatus !== 'pending' ? new Date().toISOString() : null
                    })
                    .eq('id', applicationId);
                
                if (error) throw error;
            }
            
            this.showNotification('Statut mis à jour', 'success');
            this.closeCustomModal();
            await this.loadApplications();
            
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    }
    
    reviewApplication(applicationId) {
        this.viewApplication(applicationId);
    }
    
    showCustomModal(title, content) {
        // Créer un modal personnalisé
        const modal = document.createElement('div');
        modal.className = 'dashboard-custom-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">${title}</h2>
                    <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div>${content}</div>
            </div>
        `;
        
        // Fermer le modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
    
    closeCustomModal() {
        const modal = document.querySelector('.dashboard-custom-modal');
        if (modal) document.body.removeChild(modal);
    }
    
    // 5. GESTION INTERACTIONS (manage-interactions.html)
    async initializeInteractionsPage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page interactions');
        
        // Initialiser les événements
        this.setupInteractionsEvents();
        
        // Charger les données
        await this.loadMessages();
        await this.loadSubscribers();
        await this.loadFAQ();
    }
    
    setupInteractionsEvents() {
        // Les fonctions de base sont déjà définies dans le HTML
        // On peut ajouter des améliorations si nécessaire
    }
    
    async loadMessages() {
        try {
            let messages = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('interactions')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                messages = data;
            } else {
                // Mode simulation
                messages = [
                    {
                        id: 1,
                        creator_name: 'Marie Lambert',
                        creator_email: 'marie@maisoncouture.com',
                        subject: 'Question sur la plateforme',
                        message: 'Bonjour, comment puis-je ajouter plus de photos à mon portfolio ?',
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ];
            }
            
            this.displayMessages(messages);
            
            // Mettre à jour le compteur
            const unread = messages.filter(m => m.status !== 'read').length;
            const unreadEl = document.getElementById('unreadCount');
            if (unreadEl) unreadEl.textContent = unread;
            
        } catch (error) {
            console.error('Erreur chargement messages:', error);
        }
    }
    
    displayMessages(messages) {
        const table = document.getElementById('messagesTable');
        if (!table) return;
        
        if (!messages || messages.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 20px; text-align: center; color: #666;">
                        Aucun message pour le moment
                    </td>
                </tr>
            `;
            return;
        }
        
        table.innerHTML = messages.map(msg => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${msg.creator_name || 'Anonyme'}</td>
                <td style="padding: 15px;">${msg.subject}</td>
                <td style="padding: 15px;">${new Date(msg.created_at).toLocaleDateString()}</td>
                <td style="padding: 15px;">
                    <span class="status-badge ${msg.status === 'read' ? 'status-read' : 'status-unread'}">
                        ${msg.status === 'read' ? 'Lu' : 'Non lu'}
                    </span>
                </td>
                <td style="padding: 15px;">
                    <button class="btn btn-sm" onclick="dashboardManager.viewMessage(${msg.id})" style="margin-right: 5px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteMessage(${msg.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    async loadSubscribers() {
        try {
            let subscribers = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('newsletter_subscribers')
                    .select('*')
                    .order('subscribed_at', { ascending: false });
                
                if (error) throw error;
                subscribers = data;
            }
            
            this.displaySubscribers(subscribers);
            
            const subscriberCountEl = document.getElementById('subscriberCount');
            if (subscriberCountEl) subscriberCountEl.textContent = subscribers.length;
            
        } catch (error) {
            console.error('Erreur chargement abonnés:', error);
        }
    }
    
    displaySubscribers(subscribers) {
        const table = document.getElementById('subscribersTable');
        if (!table) return;
        
        if (!subscribers || subscribers.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center; color: #666;">
                        Aucun abonné pour le moment
                    </td>
                </tr>
            `;
            return;
        }
        
        table.innerHTML = subscribers.map(sub => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${sub.email}</td>
                <td style="padding: 15px;">${new Date(sub.subscribed_at).toLocaleDateString()}</td>
                <td style="padding: 15px;">
                    <span class="status-badge ${sub.active ? 'status-active' : 'status-inactive'}">
                        ${sub.active ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td style="padding: 15px;">
                    <button class="btn btn-sm btn-danger" onclick="dashboardManager.unsubscribe('${sub.email}')">
                        <i class="fas fa-user-minus"></i> Désabonner
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    async loadFAQ() {
        try {
            let faqs = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('faq')
                    .select('*')
                    .order('order_index', { ascending: true });
                
                if (error) throw error;
                faqs = data;
            } else {
                // Mode simulation
                faqs = [
                    {
                        id: 1,
                        question: 'Comment créer un portfolio ?',
                        answer: 'Connectez-vous à votre compte créateur et accédez à la section "Mon Portfolio".',
                        order_index: 1
                    }
                ];
            }
            
            this.displayFAQ(faqs);
            
        } catch (error) {
            console.error('Erreur chargement FAQ:', error);
        }
    }
    
    displayFAQ(faqItems) {
        const container = document.getElementById('faqList');
        if (!container) return;
        
        if (!faqItems || faqItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    Aucune FAQ pour le moment
                </div>
            `;
            return;
        }
        
        container.innerHTML = faqItems.map((faq, index) => `
            <div class="faq-item" style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${index + 1}. ${faq.question}</strong>
                        <p style="margin-top: 5px; color: #666;">${faq.answer}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm" onclick="dashboardManager.editFAQ(${faq.id})" style="margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteFAQ(${faq.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async viewMessage(messageId) {
        try {
            let message = null;
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('interactions')
                    .select('*')
                    .eq('id', messageId)
                    .single();
                
                if (error) throw error;
                message = data;
            }
            
            if (message) {
                alert(`Message de: ${message.creator_name || 'Anonyme'}\n\nSujet: ${message.subject}\n\nMessage: ${message.message}\n\nEnvoyé le: ${new Date(message.created_at).toLocaleString()}`);
                
                // Marquer comme lu
                if (this.supabase && message.status !== 'read') {
                    await this.supabase
                        .from('interactions')
                        .update({ status: 'read' })
                        .eq('id', messageId);
                    
                    await this.loadMessages();
                }
            }
            
        } catch (error) {
            console.error('Erreur chargement message:', error);
            this.showNotification('Erreur lors du chargement du message', 'error');
        }
    }
    
    async deleteMessage(messageId) {
        const confirmed = await this.confirmAction('Supprimer ce message ?');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('interactions')
                    .delete()
                    .eq('id', messageId);
                
                if (error) throw error;
            }
            
            this.showNotification('Message supprimé', 'success');
            await this.loadMessages();
            
        } catch (error) {
            console.error('Erreur suppression message:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async unsubscribe(email) {
        const confirmed = await this.confirmAction(`Désabonner ${email} ?`);
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('newsletter_subscribers')
                    .update({ active: false })
                    .eq('email', email);
                
                if (error) throw error;
            }
            
            this.showNotification('Utilisateur désabonné', 'success');
            await this.loadSubscribers();
            
        } catch (error) {
            console.error('Erreur désabonnement:', error);
            this.showNotification('Erreur lors du désabonnement', 'error');
        }
    }
    
    async deleteFAQ(faqId) {
        const confirmed = await this.confirmAction('Supprimer cette FAQ ?');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('faq')
                    .delete()
                    .eq('id', faqId);
                
                if (error) throw error;
            }
            
            this.showNotification('FAQ supprimée', 'success');
            await this.loadFAQ();
            
        } catch (error) {
            console.error('Erreur suppression FAQ:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    async addFAQ() {
        const question = prompt('Nouvelle question:');
        if (!question) return;
        
        const answer = prompt('Réponse:');
        if (!answer) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('faq')
                    .insert([{ question, answer }]);
                
                if (error) throw error;
            }
            
            this.showNotification('FAQ ajoutée', 'success');
            await this.loadFAQ();
            
        } catch (error) {
            console.error('Erreur ajout FAQ:', error);
            this.showNotification('Erreur lors de l\'ajout', 'error');
        }
    }
    
    async editFAQ(faqId) {
        const question = prompt('Modifier la question:');
        if (!question) return;
        
        const answer = prompt('Modifier la réponse:');
        if (!answer) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('faq')
                    .update({ question, answer })
                    .eq('id', faqId);
                
                if (error) throw error;
            }
            
            this.showNotification('FAQ modifiée', 'success');
            await this.loadFAQ();
            
        } catch (error) {
            console.error('Erreur modification FAQ:', error);
            this.showNotification('Erreur lors de la modification', 'error');
        }
    }
    
    // 6. GESTION TÉMOIGNAGES (manage-temoignages.html)
    async initializeTestimonialsPage() {
        if (!await this.requireAdminAccess()) return;
        
        console.log('Initialisation page témoignages');
        
        // Variables globales
        window.allTestimonials = [];
        
        // Initialiser les événements
        this.setupTestimonialsEvents();
        
        // Charger les données
        await this.loadTestimonials();
    }
    
    setupTestimonialsEvents() {
        // Événements des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchTestimonialsTab(tab);
            });
        });
        
        // Événements de recherche/filtre
        document.getElementById('searchTestimonial')?.addEventListener('input', () => this.filterTestimonials());
        document.getElementById('filterRating')?.addEventListener('change', () => this.filterTestimonials());
    }
    
    async loadTestimonials() {
        try {
            let testimonials = [];
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('testimonials')
                    .select(`
                        *,
                        creators (
                            full_name,
                            brand_name,
                            email,
                            domain,
                            profile_image
                        )
                    `)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                testimonials = data.map(item => ({
                    ...item,
                    creator_name: item.creators?.full_name,
                    creator_brand: item.creators?.brand_name,
                    creator_email: item.creators?.email,
                    creator_domain: item.creators?.domain,
                    creator_photo: item.creators?.profile_image
                }));
            } else {
                // Mode simulation
                testimonials = [
                    {
                        id: 1,
                        creator_id: 1,
                        creator_name: 'Marie Lambert',
                        creator_brand: 'Maison Couture',
                        creator_photo: null,
                        rating: 5,
                        message: 'Excellente plateforme qui m\'a permis de développer ma visibilité.',
                        status: 'published',
                        is_featured: true,
                        published_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }
                ];
            }
            
            window.allTestimonials = testimonials;
            this.updateTestimonialStats(testimonials);
            this.displayTestimonials(testimonials);
            
        } catch (error) {
            console.error('Erreur chargement témoignages:', error);
            this.showNotification('Erreur de chargement des témoignages', 'error');
        }
    }
    
    updateTestimonialStats(testimonials) {
        const published = testimonials.filter(t => t.status === 'published').length;
        const pending = testimonials.filter(t => t.status === 'pending').length;
        const featured = testimonials.filter(t => t.is_featured).length;
        const total = testimonials.length;
        const responseRate = total > 0 ? Math.round((published / total) * 100) : 0;
        
        const publishedEl = document.getElementById('publishedCount');
        const pendingEl = document.getElementById('pendingCount');
        const responseRateEl = document.getElementById('responseRate');
        const pendingBadge = document.getElementById('pendingBadge');
        
        if (publishedEl) publishedEl.textContent = published;
        if (pendingEl) pendingEl.textContent = pending;
        if (responseRateEl) responseRateEl.textContent = responseRate + '%';
        
        if (pendingBadge) {
            if (pending > 0) {
                pendingBadge.textContent = pending;
                pendingBadge.style.display = 'inline';
            } else {
                pendingBadge.style.display = 'none';
            }
        }
    }
    
    displayTestimonials(testimonials) {
        const container = document.getElementById('testimonialsList');
        if (!container) return;
        
        const filtered = this.filterTestimonialsList(testimonials);
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>Aucun témoignage trouvé</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(testimonial => `
            <div class="testimonial-item" style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); ${testimonial.is_featured ? 'border: 2px solid #ffc107;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${testimonial.creator_photo ? `
                            <img src="${testimonial.creator_photo}" alt="${testimonial.creator_name}" 
                                 style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                        ` : `
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-user" style="font-size: 1.5rem; color: #ccc;"></i>
                            </div>
                        `}
                        <div>
                            <h3 style="margin: 0 0 5px 0;">${testimonial.creator_name}</h3>
                            <p style="margin: 0; color: #666;">
                                ${testimonial.creator_brand ? `${testimonial.creator_brand} • ` : ''}
                                ${testimonial.creator_domain || ''}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="margin-bottom: 10px;">
                            ${this.generateStars(testimonial.rating)}
                        </div>
                        <span class="status-badge" style="background: ${this.getTestimonialStatusColor(testimonial.status)}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem;">
                            ${this.getTestimonialStatusLabel(testimonial.status)}
                        </span>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; position: relative;">
                    <i class="fas fa-quote-left" style="position: absolute; top: 15px; left: 15px; color: #ddd; font-size: 1.5rem;"></i>
                    <p style="margin: 0; padding-left: 30px; font-style: italic; color: #555; line-height: 1.6;">
                        "${testimonial.message}"
                    </p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #999;">
                        Soumis le ${new Date(testimonial.created_at).toLocaleDateString()}
                        ${testimonial.published_at ? ` • Publié le ${new Date(testimonial.published_at).toLocaleDateString()}` : ''}
                    </small>
                    <div style="display: flex; gap: 10px;">
                        ${testimonial.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="dashboardManager.approveTestimonial(${testimonial.id})">
                                <i class="fas fa-check"></i> Approuver
                            </button>
                        ` : ''}
                        ${testimonial.status === 'published' && !testimonial.is_featured ? `
                            <button class="btn btn-sm" onclick="dashboardManager.toggleFeaturedTestimonial(${testimonial.id}, true)">
                                <i class="fas fa-crown"></i> Mettre en vedette
                            </button>
                        ` : ''}
                        ${testimonial.is_featured ? `
                            <button class="btn btn-sm" onclick="dashboardManager.toggleFeaturedTestimonial(${testimonial.id}, false)">
                                <i class="fas fa-times"></i> Retirer des vedettes
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="dashboardManager.deleteTestimonial(${testimonial.id})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    filterTestimonialsList(testimonials) {
        const searchTerm = document.getElementById('searchTestimonial')?.value.toLowerCase() || '';
        const ratingFilter = document.getElementById('filterRating')?.value || '';
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        
        return testimonials.filter(testimonial => {
            // Filtre par onglet
            let matchesTab = true;
            if (activeTab === 'pending') matchesTab = testimonial.status === 'pending';
            if (activeTab === 'featured') matchesTab = testimonial.is_featured;
            
            // Filtre par recherche
            const matchesSearch = !searchTerm || 
                testimonial.creator_name?.toLowerCase().includes(searchTerm) ||
                testimonial.creator_brand?.toLowerCase().includes(searchTerm) ||
                testimonial.message.toLowerCase().includes(searchTerm);
            
            // Filtre par note
            const matchesRating = !ratingFilter || testimonial.rating == ratingFilter;
            
            return matchesTab && matchesSearch && matchesRating;
        });
    }
    
    filterTestimonials() {
        const filtered = this.filterTestimonialsList(window.allTestimonials);
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        
        if (activeTab === 'pending') {
            this.displayPendingTestimonials(filtered);
        } else if (activeTab === 'featured') {
            this.displayFeaturedTestimonials(filtered);
        } else {
            this.displayTestimonials(filtered);
        }
    }
    
    displayPendingTestimonials(testimonials) {
        const pending = testimonials.filter(t => t.status === 'pending');
        const container = document.getElementById('pendingList');
        if (!container) return;
        
        if (pending.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px; color: #28a745;"></i>
                    <h3>Aucun témoignage en attente</h3>
                    <p>Tous les témoignages sont traités</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pending.map(testimonial => `
            <div class="pending-item" style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid #ffc107;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0 0 10px 0;">${testimonial.creator_name}</h3>
                        <p style="margin: 0; color: #666;">
                            ${testimonial.creator_brand ? `${testimonial.creator_brand} • ` : ''}
                            ${testimonial.creator_email || ''}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        ${this.generateStars(testimonial.rating)}
                        <div style="margin-top: 10px;">
                            <button class="btn btn-sm btn-success" onclick="dashboardManager.approveTestimonial(${testimonial.id})">
                                <i class="fas fa-check"></i> Approuver
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="dashboardManager.rejectTestimonial(${testimonial.id})">
                                <i class="fas fa-times"></i> Rejeter
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #856404; line-height: 1.6;">
                        "${testimonial.message}"
                    </p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <small style="color: #999;">
                            Soumis le ${new Date(testimonial.created_at).toLocaleString()}
                        </small>
                        <button class="btn btn-sm" onclick="dashboardManager.viewCreator(${testimonial.creator_id})">
                            <i class="fas fa-user"></i> Voir le créateur
                        </button>
                    </div>
                </div>
            `).join('');
    }
    
    displayFeaturedTestimonials(testimonials) {
        const featured = testimonials.filter(t => t.is_featured && t.status === 'published');
        const container = document.getElementById('featuredList');
        if (!container) return;
        
        if (featured.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-crown" style="font-size: 3rem; margin-bottom: 20px; color: #ffc107;"></i>
                    <h3>Aucun témoignage en vedette</h3>
                    <p>Mettez des témoignages en vedette pour les mettre en avant</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = featured.map(testimonial => `
            <div class="featured-item" style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 5px 20px rgba(255, 193, 7, 0.2); border: 2px solid #ffc107; position: relative;">
                <div style="position: absolute; top: 15px; right: 15px; background: #ffc107; color: white; padding: 5px 15px; border-radius: 15px; font-size: 0.85rem; font-weight: bold;">
                    <i class="fas fa-crown"></i> Vedette
                </div>
                
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                    ${testimonial.creator_photo ? `
                        <img src="${testimonial.creator_photo}" alt="${testimonial.creator_name}" 
                             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ffc107;">
                    ` : `
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: #fff3cd; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user" style="font-size: 2rem; color: #ffc107;"></i>
                        </div>
                    `}
                    <div>
                        <h2 style="margin: 0 0 5px 0; color: #333;">${testimonial.creator_name}</h2>
                        <p style="margin: 0; color: #666; font-size: 1.1rem;">
                            ${testimonial.creator_brand || ''}
                        </p>
                        <div style="margin-top: 10px;">
                            ${this.generateStars(testimonial.rating, '1.2rem')}
                        </div>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; position: relative;">
                    <i class="fas fa-quote-left" style="position: absolute; top: 20px; left: 20px; color: #ffc107; font-size: 2rem;"></i>
                    <p style="margin: 0; padding-left: 40px; font-size: 1.1rem; line-height: 1.8; color: #856404;">
                        "${testimonial.message}"
                    </p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #999;">
                        Publié le ${new Date(testimonial.published_at).toLocaleDateString()}
                    </small>
                    <div>
                        <button class="btn btn-sm" onclick="dashboardManager.toggleFeaturedTestimonial(${testimonial.id}, false)">
                            <i class="fas fa-times"></i> Retirer des vedettes
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    switchTestimonialsTab(tabName) {
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Afficher le contenu approprié
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) activeContent.style.display = 'block';
        
        // Filtrer les témoignages
        this.filterTestimonials();
    }
    
    getTestimonialStatusColor(status) {
        const colors = {
            'published': '#28a745',
            'pending': '#ffc107',
            'rejected': '#dc3545',
            'draft': '#6c757d'
        };
        return colors[status] || '#6c757d';
    }
    
    getTestimonialStatusLabel(status) {
        const labels = {
            'published': 'Publié',
            'pending': 'En attente',
            'rejected': 'Rejeté',
            'draft': 'Brouillon'
        };
        return labels[status] || status;
    }
    
    async approveTestimonial(testimonialId) {
        const confirmed = await this.confirmAction('Approuver ce témoignage ? Il sera publié sur la plateforme.');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('testimonials')
                    .update({ 
                        status: 'published',
                        published_at: new Date().toISOString()
                    })
                    .eq('id', testimonialId);
                
                if (error) throw error;
            }
            
            this.showNotification('Témoignage approuvé et publié', 'success');
            await this.loadTestimonials();
            
        } catch (error) {
            console.error('Erreur approbation:', error);
            this.showNotification('Erreur lors de l\'approbation', 'error');
        }
    }
    
    async rejectTestimonial(testimonialId) {
        const reason = prompt('Raison du rejet (facultatif):');
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('testimonials')
                    .update({ 
                        status: 'rejected',
                        rejection_reason: reason || null
                    })
                    .eq('id', testimonialId);
                
                if (error) throw error;
            }
            
            this.showNotification('Témoignage rejeté', 'success');
            await this.loadTestimonials();
            
        } catch (error) {
            console.error('Erreur rejet:', error);
            this.showNotification('Erreur lors du rejet', 'error');
        }
    }
    
    async toggleFeaturedTestimonial(testimonialId, makeFeatured) {
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('testimonials')
                    .update({ 
                        is_featured: makeFeatured,
                        featured_at: makeFeatured ? new Date().toISOString() : null
                    })
                    .eq('id', testimonialId);
                
                if (error) throw error;
            }
            
            this.showNotification(`Témoignage ${makeFeatured ? 'mis en vedette' : 'retiré des vedettes'}`, 'success');
            await this.loadTestimonials();
            
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la modification', 'error');
        }
    }
    
    async deleteTestimonial(testimonialId) {
        const confirmed = await this.confirmAction('Supprimer définitivement ce témoignage ?');
        if (!confirmed) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('testimonials')
                    .delete()
                    .eq('id', testimonialId);
                
                if (error) throw error;
            }
            
            this.showNotification('Témoignage supprimé', 'success');
            await this.loadTestimonials();
            
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    
    viewCreator(creatorId) {
        window.open(`manage-creators.html?creator=${creatorId}`, '_blank');
    }
    
    // ========== FONCTION D'INITIALISATION GLOBALE ==========
    
    async initializePage() {
        // Vérifier l'accès admin
        if (!await this.requireAdminAccess()) return;
        
        // Identifier la page actuelle
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        
        console.log(`Initialisation page: ${page}`);
        
        // Initialiser la page spécifique
        switch(page) {
            case 'manage-annuaire':
                await this.initializeAnnuairePage();
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
            case 'dashboard-management':
                // La page dashboard-management a sa propre logique
                console.log('Page dashboard-management initialisée');
                break;
            default:
                console.log('Page non reconnue, vérification admin uniquement');
        }
        
        // Ajouter des styles globaux
        this.addGlobalStyles();
    }
    
    addGlobalStyles() {
        // Ajouter des styles CSS globaux pour les notifications, modals, etc.
        if (!document.querySelector('#dashboard-global-styles')) {
            const style = document.createElement('style');
            style.id = 'dashboard-global-styles';
            style.textContent = `
                /* Styles pour les notifications */
                .dashboard-notification {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .notification-success {
                    border-left-color: #28a745 !important;
                }
                
                .notification-error {
                    border-left-color: #dc3545 !important;
                }
                
                .notification-warning {
                    border-left-color: #ffc107 !important;
                }
                
                .notification-info {
                    border-left-color: #17a2b8 !important;
                }
                
                /* Styles pour les boutons d'action */
                .btn-action {
                    background: none;
                    border: 1px solid #ddd;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .btn-action:hover {
                    background: #f8f9fa;
                    transform: scale(1.1);
                }
                
                .btn-action.btn-danger {
                    border-color: #dc3545;
                    color: #dc3545;
                }
                
                .btn-action.btn-danger:hover {
                    background: #dc3545;
                    color: white;
                }
                
                /* Styles pour les badges de statut */
                .status-badge {
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-block;
                }
                
                .status-unread { background: #d4edda; color: #155724; }
                .status-read { background: #f8f9fa; color: #6c757d; }
                .status-active { background: #d1ecf1; color: #0c5460; }
                .status-inactive { background: #f8d7da; color: #721c24; }
                
                /* Styles pour les boutons */
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }
                
                .btn-sm {
                    padding: 5px 10px;
                    font-size: 0.85rem;
                }
                
                .btn-primary {
                    background: #d4af37;
                    color: #1a1a1a;
                }
                
                .btn-primary:hover {
                    background: #b08924;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #5a6268;
                }
                
                .btn-success {
                    background: #28a745;
                    color: white;
                }
                
                .btn-success:hover {
                    background: #218838;
                }
                
                .btn-danger {
                    background: #dc3545;
                    color: white;
                }
                
                .btn-danger:hover {
                    background: #c82333;
                }
                
                /* Styles pour les modals */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1000;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.3s;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialiser le gestionnaire global
const dashboardManager = new DashboardManager();

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', () => {
    dashboardManager.initializePage();
});

// Exporter pour utilisation dans les fichiers HTML
window.dashboardManager = dashboardManager;
