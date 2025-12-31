// ============================================
// SCRIPT UNIFIÉ POUR TOUTES LES PAGES DASHBOARD
// ============================================

// Configuration Supabase
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY) || null;

class DashboardManager {
    constructor() {
        this.creatorId = null;
        this.creatorBrand = null;
        this.currentPage = this.getCurrentPage();
        
        this.init();
    }
    
    // Initialisation principale
    init() {
        this.checkAuthentication();
        this.setupNavigation();
        this.setupTheme();
        this.setupPageSpecificFeatures();
        this.setupCommonEventListeners();
        this.updateUserInfo();
    }
    
    // Vérification de l'authentification
    checkAuthentication() {
        this.creatorId = sessionStorage.getItem('creatorId');
        this.creatorBrand = sessionStorage.getItem('creatorBrand');
        
        if (!this.creatorId) {
            console.warn('Non authentifié, redirection vers la page principale');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            return false;
        }
        
        console.log(`Connecté en tant que : ${this.creatorBrand} (ID: ${this.creatorId})`);
        return true;
    }
    
    // Gestion de la navigation
    setupNavigation() {
        // Menu mobile
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
            
            // Fermer le menu en cliquant sur un lien
            document.querySelectorAll('.main-nav a').forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
            });
            
            // Fermer le menu en cliquant à l'extérieur
            document.addEventListener('click', (e) => {
                if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        }
        
        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    sessionStorage.clear();
                    localStorage.removeItem('theme');
                    window.location.href = '../index.html';
                }
            });
        }
        
        // Marquer la page active dans la navigation
        this.highlightActiveNavLink();
    }
    
    // Gestion du thème
    setupTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme') || 'day';
        this.setTheme(savedTheme);
        
        // Créer un sélecteur de thème s'il n'existe pas
        if (!document.querySelector('.theme-selector')) {
            this.createThemeSelector();
        }
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('dashboard-theme', theme);
        
        // Mettre à jour le sélecteur
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) {
            const buttons = themeSelector.querySelectorAll('button');
            buttons.forEach(btn => btn.classList.remove('active'));
            const activeBtn = themeSelector.querySelector(`[data-theme="${theme}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }
    
    createThemeSelector() {
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.innerHTML = `
            <div class="theme-buttons">
                <button class="theme-btn" data-theme="day" title="Thème clair">
                    <i class="fas fa-sun"></i>
                </button>
                <button class="theme-btn" data-theme="night" title="Thème sombre">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        `;
        
        // Ajouter au header
        const header = document.querySelector('.dashboard-header .container');
        if (header) {
            header.appendChild(themeSelector);
            
            // Gestion des clics
            themeSelector.querySelectorAll('.theme-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.theme;
                    this.setTheme(theme);
                });
            });
        }
        
        // Style du sélecteur
        const style = document.createElement('style');
        style.textContent = `
            .theme-selector {
                margin-left: 1rem;
            }
            
            .theme-buttons {
                display: flex;
                gap: 0.5rem;
            }
            
            .theme-btn {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .theme-btn:hover {
                background: rgba(212, 175, 55, 0.3);
                transform: scale(1.1);
            }
            
            .theme-btn.active {
                background: #d4af37;
                color: #1a1a1a;
            }
            
            @media (max-width: 768px) {
                .theme-selector {
                    margin-left: 0.5rem;
                }
                
                .theme-btn {
                    width: 35px;
                    height: 35px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonctionnalités spécifiques à chaque page
    setupPageSpecificFeatures() {
        switch (this.currentPage) {
            case 'portfolio':
                this.setupPortfolioPage();
                break;
            case 'annuaire':
                this.setupAnnuairePage();
                break;
            case 'creators':
                this.setupCreatorsPage();
                break;
            case 'opportunities':
                this.setupOpportunitiesPage();
                break;
            case 'interactions':
                this.setupInteractionsPage();
                break;
            case 'temoignages':
                this.setupTemoignagesPage();
                break;
            case 'home':
            default:
                this.setupHomePage();
                break;
        }
    }
    
    // Page Portfolio
    setupPortfolioPage() {
        console.log('Initialisation page Portfolio');
        
        // Charger les données existantes
        const portfolioData = this.loadPortfolioData();
        
        // Gestion de la photo
        this.setupPhotoUpload();
        
        // Gestion du formulaire
        const form = document.getElementById('portfolioForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePortfolioData();
            });
        }
        
        // Pré-remplir le formulaire
        this.populatePortfolioForm(portfolioData);
    }
    
    setupPhotoUpload() {
        const browseBtn = document.getElementById('browseOption');
        const cameraBtn = document.getElementById('cameraOption');
        const fileInput = document.getElementById('fileInput');
        const previewImage = document.getElementById('previewImage');
        const previewActions = document.getElementById('previewActions');
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        // Parcourir l'appareil
        if (browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }
        
        // Prendre une photo (fallback sur parcourir)
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const cameraInput = document.createElement('input');
                    cameraInput.type = 'file';
                    cameraInput.accept = 'image/*';
                    cameraInput.capture = 'environment';
                    
                    cameraInput.onchange = (e) => {
                        if (e.target.files.length > 0) {
                            this.handlePhotoSelection(e.target.files[0]);
                        }
                    };
                    
                    cameraInput.click();
                } else {
                    alert("Votre appareil ne supporte pas l'appareil photo directement. Utilisez 'Parcourir l'appareil'.");
                    if (fileInput) fileInput.click();
                }
            });
        }
        
        // Gestion de la sélection de fichier
        if (fileInput && previewImage) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handlePhotoSelection(e.target.files[0]);
                }
            });
        }
        
        // Changer la photo
        if (changePhotoBtn && fileInput) {
            changePhotoBtn.addEventListener('click', () => fileInput.click());
        }
        
        // Supprimer la photo
        if (removePhotoBtn && previewImage && previewActions) {
            removePhotoBtn.addEventListener('click', () => {
                if (confirm('Supprimer cette photo ?')) {
                    const portfolioData = this.loadPortfolioData();
                    portfolioData.photoBase64 = '';
                    
                    previewImage.src = '';
                    previewImage.classList.remove('visible');
                    previewActions.style.display = 'none';
                    
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar) userAvatar.innerHTML = 'C';
                    
                    fileInput.value = '';
                    
                    this.savePortfolioData(portfolioData);
                    this.showNotification('Photo supprimée', 'success');
                }
            });
        }
    }
    
    handlePhotoSelection(file) {
        // Validation
        if (!file.type.match('image.*')) {
            this.showNotification('Veuillez sélectionner une image', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('La photo est trop lourde (max 5 Mo)', 'error');
            return;
        }
        
        // Convertir en base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const portfolioData = this.loadPortfolioData();
            portfolioData.photoBase64 = e.target.result;
            
            // Afficher l'aperçu
            const previewImage = document.getElementById('previewImage');
            const previewActions = document.getElementById('previewActions');
            
            if (previewImage && previewActions) {
                previewImage.src = e.target.result;
                previewImage.classList.add('visible');
                previewActions.style.display = 'flex';
            }
            
            // Mettre à jour l'avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.innerHTML = `<img src="${e.target.result}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
            
            // Sauvegarder
            this.savePortfolioData(portfolioData);
            this.showNotification('Photo ajoutée avec succès', 'success');
        };
        reader.readAsDataURL(file);
    }
    
    loadPortfolioData() {
        const defaultData = {
            brandName: this.creatorBrand || '',
            creatorName: '',
            domain: '',
            bio: '',
            instagram: '',
            photoBase64: ''
        };
        
        const savedData = localStorage.getItem(`portfolio_${this.creatorId}`);
        return savedData ? JSON.parse(savedData) : defaultData;
    }
    
    savePortfolioData(data = null) {
        if (!data) {
            // Récupérer les données du formulaire
            data = {
                brandName: document.getElementById('brandName')?.value.trim() || '',
                creatorName: document.getElementById('creatorName')?.value.trim() || '',
                domain: document.getElementById('domain')?.value || '',
                bio: document.getElementById('bio')?.value.trim() || '',
                instagram: document.getElementById('instagram')?.value.trim() || '',
                photoBase64: this.loadPortfolioData().photoBase64 || ''
            };
        }
        
        // Validation
        if (!data.brandName || !data.creatorName || !data.domain || !data.bio) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return false;
        }
        
        // Sauvegarder
        localStorage.setItem(`portfolio_${this.creatorId}`, JSON.stringify(data));
        sessionStorage.setItem('creatorBrand', data.brandName);
        
        // Mettre à jour l'affichage
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = data.brandName;
        
        this.showNotification('Portfolio sauvegardé avec succès !', 'success');
        
        // Redirection après 2 secondes
        setTimeout(() => {
            window.location.href = 'dashboard-home.html';
        }, 2000);
        
        return true;
    }
    
    populatePortfolioForm(data) {
        const elements = ['brandName', 'creatorName', 'domain', 'bio', 'instagram'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element && data[id]) {
                element.value = data[id];
            }
        });
        
        // Afficher la photo si elle existe
        if (data.photoBase64) {
            const previewImage = document.getElementById('previewImage');
            const previewActions = document.getElementById('previewActions');
            const userAvatar = document.getElementById('userAvatar');
            
            if (previewImage) {
                previewImage.src = data.photoBase64;
                previewImage.classList.add('visible');
            }
            
            if (previewActions) {
                previewActions.style.display = 'flex';
            }
            
            if (userAvatar) {
                userAvatar.innerHTML = `<img src="${data.photoBase64}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
        }
    }
    
    // Page Annuaire
    setupAnnuairePage() {
        console.log('Initialisation page Annuaire');
        
        // Données de démonstration
        const professionals = [
            {
                id: 1,
                name: "Studio Lumière",
                category: "photographers",
                specialty: "Photographie de mode & portrait",
                description: "Spécialiste en photographie éditoriale et lookbook. Plus de 10 ans d'expérience.",
                contact: "contact@studiolumiere.com",
                rating: 4.8
            },
            {
                id: 2,
                name: "Agence Aura",
                category: "models",
                specialty: "Mannequins professionnels",
                description: "Agence de mannequins pour défilés et shootings. Représente plus de 50 talents.",
                contact: "info@agenceaura.fr",
                rating: 4.6
            },
            {
                id: 3,
                name: "L'Art du Fil",
                category: "seamstresses",
                specialty: "Tricot et crochet sur mesure",
                description: "Atelier artisanal de création textile. Pièces uniques faites main.",
                contact: "atelier@artdufil.com",
                rating: 4.9
            },
            {
                id: 4,
                name: "Bijoux Céleste",
                category: "accessories",
                specialty: "Création de bijoux uniques",
                description: "Artisan bijoutier spécialisé en pièces uniques inspirées par la nature.",
                contact: "www.bijouxceleste.com",
                rating: 4.7
            }
        ];
        
        // Afficher les professionnels
        this.displayProfessionals(professionals);
        
        // Filtres par catégorie
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                this.filterProfessionals(e.target.dataset.category);
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('directorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProfessionals(e.target.value);
            });
            
            // Recherche avec bouton
            const searchBtn = document.querySelector('.search-box .btn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.searchProfessionals(searchInput.value);
                });
            }
        }
        
        // Modal d'ajout
        const addBtn = document.getElementById('addProfessionalBtn');
        const modal = document.getElementById('addProfessionalModal');
        const closeModal = document.querySelector('.close-modal');
        const professionalForm = document.getElementById('professionalForm');
        
        if (addBtn && modal) {
            addBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // Fermer en cliquant en dehors
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            
            // Fermer avec Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            });
        }
        
        if (professionalForm) {
            professionalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Merci pour votre suggestion ! Elle sera examinée par notre équipe.', 'success');
                modal.classList.remove('active');
                professionalForm.reset();
            });
        }
    }
    
    displayProfessionals(professionals) {
        const grid = document.getElementById('professionalsGrid');
        if (!grid) return;
        
        if (professionals.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-tie"></i>
                    <h3>Aucun professionnel trouvé</h3>
                    <p>Essayez avec d'autres critères de recherche</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = professionals.map(pro => `
            <div class="professional-card" data-category="${pro.category}">
                <div class="professional-header">
                    <div class="pro-avatar">
                        <i class="fas fa-${this.getCategoryIcon(pro.category)}"></i>
                    </div>
                    <div class="pro-info">
                        <h3>${pro.name}</h3>
                        <span class="pro-category">${this.getCategoryName(pro.category)}</span>
                        <div class="pro-rating">
                            ${this.generateStars(pro.rating)}
                            <span>${pro.rating}/5</span>
                        </div>
                    </div>
                </div>
                <div class="professional-body">
                    <p class="pro-specialty"><i class="fas fa-star"></i> ${pro.specialty}</p>
                    <p class="pro-description">${pro.description}</p>
                </div>
                <div class="professional-footer">
                    <span class="pro-contact"><i class="fas fa-envelope"></i> ${pro.contact}</span>
                    <button class="btn btn-outline contact-btn">
                        <i class="fas fa-envelope"></i> Contacter
                    </button>
                </div>
            </div>
        `).join('');
        
        // Gérer les boutons de contact
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.professional-card');
                const name = card.querySelector('h3').textContent;
                const contact = card.querySelector('.pro-contact').textContent;
                
                alert(`Contact pour ${name}:\n${contact}\n\nVous pouvez les contacter directement via ces coordonnées.`);
            });
        });
    }
    
    filterProfessionals(category) {
        const cards = document.querySelectorAll('.professional-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    searchProfessionals(query) {
        query = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.professional-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const specialty = card.querySelector('.pro-specialty')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.pro-description')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.pro-category')?.textContent.toLowerCase() || '';
            
            if (query === '' || 
                name.includes(query) || 
                specialty.includes(query) || 
                description.includes(query) ||
                category.includes(query)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Afficher message si aucun résultat
        if (visibleCount === 0 && query !== '') {
            const grid = document.getElementById('professionalsGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Aucun résultat trouvé</h3>
                        <p>Aucun professionnel ne correspond à "${query}"</p>
                        <button class="btn btn-primary" onclick="document.getElementById('directorySearch').value=''; document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active')); document.querySelector('[data-category=\"all\"]').classList.add('active'); dashboardManager.searchProfessionals('')">
                            Réinitialiser la recherche
                        </button>
                    </div>
                `;
            }
        }
    }
    
    getCategoryIcon(category) {
        const icons = {
            'photographers': 'camera',
            'models': 'user-tie',
            'seamstresses': 'cut',
            'accessories': 'gem',
            'stylists': 'palette',
            'other': 'user-tie'
        };
        return icons[category] || 'user-tie';
    }
    
    getCategoryName(category) {
        const names = {
            'photographers': 'Photographe',
            'models': 'Mannequin / Agence',
            'seamstresses': 'Couturier',
            'accessories': 'Accessoiriste',
            'stylists': 'Styliste',
            'other': 'Autre'
        };
        return names[category] || 'Professionnel';
    }
    
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    // Page Créateurs
    setupCreatorsPage() {
        console.log('Initialisation page Créateurs');
        
        // Charger les créateurs
        this.loadCreators();
        
        // Filtres
        const domainFilter = document.getElementById('domainFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        if (domainFilter) {
            domainFilter.addEventListener('change', () => this.filterCreators());
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.filterCreators());
        }
    }
    
    async loadCreators() {
        try {
            // À implémenter avec Supabase
            const creators = [
                {
                    id: 1,
                    name: "Élyra Fashion",
                    domain: "Haute Couture",
                    bio: "Marque de haute couture parisienne",
                    photo: "https://source.unsplash.com/random/300x300/?fashion,portrait",
                    instagram: "@elyrafashion"
                }
            ];
            
            this.displayCreators(creators);
            this.updateStats(creators.length);
            
        } catch (error) {
            console.error('Erreur chargement créateurs:', error);
        }
    }
    
    displayCreators(creators) {
        const grid = document.getElementById('creatorsGrid');
        if (!grid) return;
        
        if (!creators || creators.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>Aucun créateur pour le moment</h3>
                    <p>Soyez le premier à compléter votre portfolio !</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = creators.map(creator => `
            <div class="creator-card">
                <div class="creator-photo">
                    <img src="${creator.photo}" alt="${creator.name}" onerror="this.src='https://placehold.co/300x300?text=Dreamswear'">
                </div>
                <div class="creator-info">
                    <h3>${creator.name}</h3>
                    <span class="creator-domain">${creator.domain}</span>
                    <p class="creator-bio">${creator.bio}</p>
                    <div class="creator-social">
                        ${creator.instagram ? `<a href="#"><i class="fab fa-instagram"></i> ${creator.instagram}</a>` : ''}
                    </div>
                    <button class="btn btn-outline view-profile">
                        <i class="fas fa-eye"></i> Voir le profil
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    filterCreators() {
        // À implémenter avec Supabase
        console.log('Filtrage des créateurs');
    }
    
    updateStats(count) {
        const totalCreators = document.getElementById('totalCreators');
        const totalCountries = document.getElementById('totalCountries');
        const totalCollabs = document.getElementById('totalCollabs');
        
        if (totalCreators) totalCreators.textContent = count;
        if (totalCountries) totalCountries.textContent = Math.min(count, 5);
        if (totalCollabs) totalCollabs.textContent = count * 2;
    }
    
    // Page Opportunités
    setupOpportunitiesPage() {
        console.log('Initialisation page Opportunités');
        
        // Charger les opportunités
        this.loadOpportunities();
        
        // Filtres
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filterOpportunities(e.target.dataset.filter);
            });
        });
        
        // Modal de candidature
        const applyBtns = document.querySelectorAll('.apply-btn');
        const modal = document.getElementById('applicationModal');
        const closeModal = document.querySelector('.close-modal');
        const applicationForm = document.getElementById('applicationForm');
        
        if (applyBtns.length > 0 && modal) {
            applyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.classList.add('active');
                });
            });
        }
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
        
        if (applicationForm) {
            applicationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Candidature envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
                modal.classList.remove('active');
                applicationForm.reset();
            });
        }
    }
    
    loadOpportunities() {
        const opportunities = [
            {
                id: 1,
                title: "Focus accessoires printemps",
                domain: "Accessoires",
                description: "Mise en avant des accessoires de mode pour la saison printemps",
                deadline: "2024-02-10",
                price: 180,
                status: "open",
                spots: 8
            }
        ];
        
        this.displayOpportunities(opportunities);
    }
    
    displayOpportunities(opportunities) {
        const list = document.getElementById('opportunitiesList');
        if (!list) return;
        
        if (opportunities.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <h3>Aucune opportunité pour le moment</h3>
                    <p>Revenez bientôt pour découvrir de nouveaux projets !</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = opportunities.map(opp => `
            <div class="opportunity-item" data-status="${opp.status}">
                <div class="opportunity-item-header">
                    <h3>${opp.title}</h3>
                    <span class="opportunity-domain">${opp.domain}</span>
                </div>
                <p class="opportunity-description">${opp.description}</p>
                <div class="opportunity-item-details">
                    <span><i class="fas fa-calendar"></i> Jusqu'au ${opp.deadline}</span>
                    <span><i class="fas fa-euro-sign"></i> ${opp.price}€</span>
                    <span><i class="fas fa-user-friends"></i> ${opp.spots} places</span>
                </div>
                <button class="btn btn-primary apply-btn">
                    <i class="fas fa-paper-plane"></i> Postuler
                </button>
            </div>
        `).join('');
    }
    
    filterOpportunities(filter) {
        const items = document.querySelectorAll('.opportunity-item');
        items.forEach(item => {
            if (filter === 'all' || item.dataset.status === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Page Interactions
    setupInteractionsPage() {
        console.log('Initialisation page Interactions');
        
        // FAQ
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const icon = this.querySelector('i');
                
                answer.classList.toggle('active');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });
        
        // Formulaire de contact
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Message envoyé ! Nous vous répondrons dans les plus brefs délais.', 'success');
                contactForm.reset();
            });
        }
        
        // Newsletter
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('newsletterEmail').value;
                this.showNotification(`Merci ! Vous êtes maintenant abonné à notre newsletter (${email})`, 'success');
                newsletterForm.reset();
            });
        }
    }
    
    // Page Témoignages
    setupTemoignagesPage() {
        console.log('Initialisation page Témoignages');
        
        // Charger les témoignages
        this.loadTestimonials();
        
        // Formulaire de témoignage
        const testimonialForm = document.getElementById('testimonialForm');
        if (testimonialForm) {
            testimonialForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Merci pour votre témoignage ! Il sera examiné par notre équipe avant publication.', 'success');
                testimonialForm.reset();
            });
        }
    }
    
    loadTestimonials() {
        const testimonials = [
            {
                name: "Lucas Martin",
                brand: "StreetStyle Co",
                domain: "Streetwear",
                message: "Une plateforme incroyable pour les créateurs émergents. Les opportunités sont réelles et l'accompagnement est professionnel.",
                photo: "https://source.unsplash.com/random/100x100/?portrait,man"
            }
        ];
        
        this.displayTestimonials(testimonials);
    }
    
    displayTestimonials(testimonials) {
        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;
        
        grid.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <img src="${testimonial.photo}" alt="${testimonial.name}" onerror="this.src='https://placehold.co/100x100?text=Avatar'">
                    <div class="testimonial-author">
                        <h3>${testimonial.name}</h3>
                        <p class="author-brand">${testimonial.brand}</p>
                        <p class="author-domain">${testimonial.domain}</p>
                    </div>
                </div>
                <div class="testimonial-content">
                    <i class="fas fa-quote-left"></i>
                    <blockquote>${testimonial.message}</blockquote>
                </div>
            </div>
        `).join('');
    }
    
    // Page Accueil
    setupHomePage() {
        console.log('Initialisation page Accueil');
        
        // Charger les données du portfolio
        const portfolioData = this.loadPortfolioData();
        
        // Mettre à jour les informations
        this.updateWelcomeSection(portfolioData);
        this.updatePortfolioPreview(portfolioData);
        
        // Sauvegarder la date d'inscription
        if (!sessionStorage.getItem('joinDate')) {
            sessionStorage.setItem('joinDate', new Date().toISOString());
        }
    }
    
    updateWelcomeSection(portfolioData) {
        // Nom du créateur
        const creatorName = document.getElementById('creatorName');
        const welcomeAvatar = document.getElementById('welcomeAvatar');
        const creatorDomain = document.getElementById('creatorDomain');
        const welcomeSubtitle = document.getElementById('welcomeSubtitle');
        const memberDays = document.getElementById('memberDays');
        const portfolioCompletion = document.getElementById('portfolioCompletion');
        
        const displayName = portfolioData.brandName || this.creatorBrand || 'Créateur';
        
        if (creatorName) creatorName.textContent = displayName;
        
        // Avatar
        if (welcomeAvatar && portfolioData.photoBase64) {
            welcomeAvatar.innerHTML = `<img src="${portfolioData.photoBase64}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        }
        
        // Domaine
        if (creatorDomain && portfolioData.domain) {
            creatorDomain.innerHTML = `<i class="fas fa-tag"></i><span>${portfolioData.domain}</span>`;
        }
        
        // Jours depuis l'inscription
        if (memberDays) {
            const joinDate = sessionStorage.getItem('joinDate') || new Date().toISOString();
            const days = Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));
            memberDays.textContent = days;
        }
        
        // Progression portfolio
        if (portfolioCompletion) {
            const progress = this.calculateProgress(portfolioData);
            portfolioCompletion.textContent = `${progress}%`;
        }
    }
    
    updatePortfolioPreview(portfolioData) {
        const previewContainer = document.getElementById('portfolioPreview');
        if (!previewContainer) return;
        
        if (portfolioData.brandName || portfolioData.photoBase64) {
            previewContainer.innerHTML = `
                <div class="portfolio-preview-card">
                    ${portfolioData.photoBase64 ? `
                    <div class="preview-photo">
                        <img src="${portfolioData.photoBase64}" alt="${portfolioData.brandName || 'Portfolio'}">
                    </div>
                    ` : ''}
                    
                    <div class="preview-content">
                        <h3>${portfolioData.brandName || 'Votre marque'}</h3>
                        ${portfolioData.domain ? `<p class="preview-domain"><i class="fas fa-tag"></i> ${portfolioData.domain}</p>` : ''}
                        ${portfolioData.bio ? `<p class="preview-bio">${portfolioData.bio.substring(0, 150)}${portfolioData.bio.length > 150 ? '...' : ''}</p>` : ''}
                        
                        <div class="preview-meta">
                            ${portfolioData.creatorName ? `<span><i class="fas fa-user"></i> ${portfolioData.creatorName}</span>` : ''}
                            ${portfolioData.instagram ? `<span><i class="fab fa-instagram"></i> ${portfolioData.instagram}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    calculateProgress(portfolioData) {
        const checks = [
            portfolioData.brandName,
            portfolioData.creatorName,
            portfolioData.domain,
            portfolioData.bio,
            portfolioData.photoBase64
        ];
        const completed = checks.filter(item => item && item.trim() !== '').length;
        return Math.round((completed / checks.length) * 100);
    }
    
    // Méthodes utilitaires
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '').replace('dashboard-', '');
        return page || 'home';
    }
    
    highlightActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(this.currentPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    updateUserInfo() {
        const userNameElements = document.querySelectorAll('#userName, #creatorName');
        userNameElements.forEach(element => {
            if (element && this.creatorBrand) {
                element.textContent = this.creatorBrand;
            }
        });
    }
    
    setupCommonEventListeners() {
        // Gestion des notifications
        window.showNotification = this.showNotification.bind(this);
        
        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Erreur globale:', e);
        });
    }
    
    showNotification(message, type = 'info') {
        // Supprimer les anciennes notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style de la notification
        const style = document.createElement('style');
        style.textContent = `
            .notification {
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
                z-index: 9999;
                max-width: 350px;
            }
            
            [data-theme="night"] .notification {
                background: #2a2a2a;
                color: white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.4);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #28a745;
            }
            
            .notification-error {
                border-left: 4px solid #dc3545;
            }
            
            .notification-info {
                border-left: 4px solid #17a2b8;
            }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .notification-success i {
                color: #28a745;
            }
            
            .notification-error i {
                color: #dc3545;
            }
            
            .notification-info i {
                color: #17a2b8;
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        
        if (!document.querySelector('#notification-style')) {
            style.id = 'notification-style';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-destruction après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialisation globale
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
    
    // Exposer l'instance globale
    window.dashboardManager = dashboardManager;
    
    // Gestionnaire d'erreurs pour les images
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'https://placehold.co/300x300?text=Dreamswear';
            e.target.onerror = null; // Éviter les boucles infinies
        }
    }, true);
});

// Fonctions globales accessibles depuis le HTML
window.filterProfessionals = function(category) {
    if (dashboardManager) dashboardManager.filterProfessionals(category);
};

window.searchProfessionals = function(query) {
    if (dashboardManager) dashboardManager.searchProfessionals(query);
};
