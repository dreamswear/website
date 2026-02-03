// annuaire-script.js - Version simplifiée sans relations complexes

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du script annuaire...');

    // ============================================
    // 1. CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    let supabase;
    
    try {
        // Charger Supabase depuis CDN si pas déjà chargé
        if (typeof createClient === 'function') {
            supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        } else if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase;
        } else {
            // Charger le script Supabase
            await loadSupabaseScript();
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        
        window.supabase = supabase;
        console.log('✅ Supabase initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error);
        return;
    }

    // ============================================
    // 2. DÉTECTION DE LA PAGE
    // ============================================
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard-annuaire.html')) {
        console.log('📄 Page Dashboard Annuaire détectée');
        await initDashboardAnnuaire();
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
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
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
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div>
                <strong>${type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : 'Information'}</strong>
                <div style="font-size: 0.9rem; margin-top: 5px;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Ajouter les styles d'animation
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
    // 4. DASHBOARD ANNUAIRE SIMPLIFIÉ
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
            
            // Initialiser les événements
            initDashboardEvents();
            
            // Charger les catégories
            await loadCategories();
            
            // Charger les professionnels
            await loadProfessionals();
            
            console.log('✅ Dashboard Annuaire initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            showNotification('Erreur lors du chargement de l\'annuaire', 'error');
        }
    }

    function initDashboardEvents() {
        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Déconnexion ?')) {
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Menu mobile
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                document.querySelector('.main-nav').classList.toggle('active');
            });
        }
        
        // Filtres par catégorie
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', async function() {
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.dataset.category;
                const searchInput = document.getElementById('directorySearch');
                await loadProfessionals(category, searchInput?.value || '');
            });
        });
        
        // Recherche avec bouton
        const searchBtn = document.querySelector('.search-box .btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', async function() {
                const activeCategory = document.querySelector('.category-filter.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                const searchInput = document.getElementById('directorySearch');
                await loadProfessionals(category, searchInput?.value || '');
            });
        }
        
        // Recherche avec Entrée
        const searchInput = document.getElementById('directorySearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter') {
                    const activeCategory = document.querySelector('.category-filter.active');
                    const category = activeCategory ? activeCategory.dataset.category : 'all';
                    await loadProfessionals(category, this.value);
                }
            });
        }
        
        // Modal d'ajout
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
                    this.style.display = 'none';
                    document.body.style.overflow = '';
                    if (form) form.reset();
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                await submitProfessionalForm(this);
            });
        }
        
        // Fermer modal avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('addProfessionalModal');
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });
    }

    async function loadCategories() {
        try {
            // D'abord, charger les catégories depuis la table annuaire_categories
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*')
                .order('name');
            
            if (error) {
                console.log('⚠️ Table annuaire_categories non trouvée, utilisation des catégories par défaut');
                // Utiliser les catégories par défaut
                const defaultCategories = [
                    { id: 'photographers', name: 'Photographes', icon: 'fas fa-camera', color: '#2196F3' },
                    { id: 'models', name: 'Mannequins', icon: 'fas fa-user-tie', color: '#4CAF50' },
                    { id: 'seamstresses', name: 'Couturiers', icon: 'fas fa-cut', color: '#FF9800' },
                    { id: 'accessories', name: 'Accessoiristes', icon: 'fas fa-gem', color: '#9C27B0' },
                    { id: 'stylists', name: 'Stylistes', icon: 'fas fa-palette', color: '#E91E63' }
                ];
                
                // Mettre à jour le select du formulaire
                updateCategorySelect(defaultCategories);
                return defaultCategories;
            }
            
            // Mettre à jour le select du formulaire
            updateCategorySelect(categories);
            
            return categories;
            
        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
            return [];
        }
    }

    function updateCategorySelect(categories) {
        const categorySelect = document.getElementById('proCategory');
        if (categorySelect && categories) {
            categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>' + 
                categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
        }
    }

    async function loadProfessionals(category = 'all', search = '') {
        console.log('🔄 Chargement des professionnels...', { category, search });
        
        const grid = document.getElementById('professionalsGrid');
        if (!grid) return;
        
        // Afficher le chargement
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 15px; color: #666;">Chargement des professionnels...</p>
            </div>
        `;
        
        try {
            // Requête de base pour les professionnels actifs
            let query = supabase
                .from('annuaire')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            
            // Filtrer par catégorie
            if (category !== 'all') {
                query = query.eq('category_id', category);
            }
            
            // Filtrer par recherche
            if (search.trim()) {
                query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,description.ilike.%${search}%`);
            }
            
            const { data: professionals, error } = await query;
            
            if (error) throw error;
            
            if (!professionals || professionals.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin-bottom: 10px;">Aucun professionnel trouvé</h3>
                        <p>${search ? 'Aucun résultat pour votre recherche.' : 'Aucun professionnel disponible pour le moment.'}</p>
                    </div>
                `;
                return;
            }
            
            // Charger les informations de catégories séparément
            const categories = await getCategoriesInfo();
            
            // Afficher les professionnels
            displayProfessionals(professionals, categories);
            
        } catch (error) {
            console.error('❌ Erreur chargement professionnels:', error);
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                    <h3 style="margin-bottom: 10px;">Erreur de chargement</h3>
                    <p>${error.message}</p>
                    <button onclick="loadProfessionals()" style="margin-top: 20px; padding: 10px 20px; background: #d4af37; color: #1a1a1a; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }

    async function getCategoriesInfo() {
        try {
            const { data: categories, error } = await supabase
                .from('annuaire_categories')
                .select('*');
            
            if (error || !categories) {
                // Retourner les catégories par défaut
                return {
                    'photographers': { name: 'Photographes', icon: 'fas fa-camera', color: '#2196F3' },
                    'models': { name: 'Mannequins', icon: 'fas fa-user-tie', color: '#4CAF50' },
                    'seamstresses': { name: 'Couturiers', icon: 'fas fa-cut', color: '#FF9800' },
                    'accessories': { name: 'Accessoiristes', icon: 'fas fa-gem', color: '#9C27B0' },
                    'stylists': { name: 'Stylistes', icon: 'fas fa-palette', color: '#E91E63' }
                };
            }
            
            // Convertir en objet pour un accès facile
            const categoriesMap = {};
            categories.forEach(cat => {
                categoriesMap[cat.id] = {
                    name: cat.name,
                    icon: cat.icon || 'fas fa-folder',
                    color: cat.color || '#2196F3'
                };
            });
            
            return categoriesMap;
            
        } catch (error) {
            console.error('❌ Erreur chargement info catégories:', error);
            return {};
        }
    }

    function displayProfessionals(professionals, categoriesMap) {
        const grid = document.getElementById('professionalsGrid');
        
        grid.innerHTML = professionals.map(pro => {
            // Obtenir les informations de catégorie
            const categoryInfo = categoriesMap[pro.category_id] || {
                name: 'Non catégorisé',
                icon: 'fas fa-user',
                color: '#d4af37'
            };
            
            const categoryName = categoryInfo.name;
            const categoryColor = categoryInfo.color;
            const categoryIcon = categoryInfo.icon;
            
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

    async function submitProfessionalForm(form) {
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
        
        // Ajouter les champs optionnels s'ils existent
        const proLocation = document.getElementById('proLocation');
        const proWebsite = document.getElementById('proWebsite');
        const proInstagram = document.getElementById('proInstagram');
        
        if (proLocation && proLocation.value.trim()) formData.location = proLocation.value.trim();
        if (proWebsite && proWebsite.value.trim()) formData.website = proWebsite.value.trim();
        if (proInstagram && proInstagram.value.trim()) formData.instagram = proInstagram.value.trim();
        
        try {
            // Validation
            if (!formData.name || !formData.category_id || !formData.contact_info) {
                throw new Error('Veuillez remplir tous les champs obligatoires (*)');
            }
            
            const { data, error } = await supabase
                .from('annuaire')
                .insert([formData]);
            
            if (error) throw error;
            
            showNotification('Votre suggestion a été soumise avec succès ! Elle sera examinée par notre équipe.', 'success');
            
            // Fermer le modal
            const modal = document.getElementById('addProfessionalModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            
            // Réinitialiser le formulaire
            form.reset();
            
            // Recharger les professionnels
            await loadProfessionals();
            
        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            showNotification('Erreur lors de la soumission: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // ============================================
    // 5. FONCTIONS GLOBALES
    // ============================================

    window.contactProfessional = function(name, contact, website, instagram) {
        let contactInfo = `Nom: ${name}\n`;
        contactInfo += `Contact: ${contact}\n`;
        if (website) contactInfo += `Site web: ${website}\n`;
        if (instagram) contactInfo += `Instagram: ${instagram}\n`;
        
        const modalHTML = `
            <div class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #333;">Contacter ${escapeHtml(name)}</h3>
                        <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
                    </div>
                    
                    <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <p style="margin-bottom: 10px; color: #555;"><strong>Coordonnées :</strong></p>
                        <div style="display: grid; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-envelope" style="color: #d4af37;"></i>
                                <span style="color: #666;">${escapeHtml(contact)}</span>
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
                        <button onclick="copyToClipboard('${escapeHtml(contactInfo)}')" style="padding: 12px 24px; background: #d4af37; color: #1a1a1a; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-copy"></i> Copier
                        </button>
                        <button onclick="this.closest('.modal').remove()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstChild);
    };

    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Coordonnées copiées dans le presse-papier !', 'success');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            showNotification('Impossible de copier les coordonnées', 'error');
        });
    };

    // Fonction pour charger le script Supabase
    async function loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('✅ Supabase script chargé');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    console.log('✅ Script annuaire chargé avec succès !');
});
