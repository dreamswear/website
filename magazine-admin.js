// ============================================
// MAGAZINE UNIFIED SCRIPT - TOUT EN UN
// ============================================

// Configuration Supabase
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

// Initialisation Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales
let currentEditId = null;
let currentEditRubrique = null;
let currentEditImageUrl = "";

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

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

// ============================================
// GESTION DU THÈME (FONCTIONNE SUR TOUTES LES PAGES)
// ============================================

function setupTheme() {
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;
    
    if (!themeSelectButton || !themeOptions) {
        console.log("⚠️ Éléments du thème non trouvés");
        return;
    }
    
    console.log("✅ Configuration du thème...");
    
    // Fonction pour définir le thème
    function setTheme(theme) {
        if (theme === 'day') {
            body.classList.add('day-mode');
            localStorage.setItem('theme', 'day');
            if (themeButtonText) themeButtonText.textContent = 'Clair';
        } else {
            body.classList.remove('day-mode');
            localStorage.setItem('theme', 'night');
            if (themeButtonText) themeButtonText.textContent = 'Sombre';
        }
    }
    
    // Basculer le menu déroulant du thème
    themeSelectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("🎨 Bouton thème cliqué");
        themeOptions.classList.toggle('hidden-options');
        themeSelectButton.parentElement.classList.toggle('open');
    });
    
    // Définir le thème depuis le menu déroulant
    themeOptions.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🎨 Option thème cliquée");
        if (e.target.tagName === 'A') {
            const selectedTheme = e.target.dataset.theme;
            console.log("🎨 Thème sélectionné:", selectedTheme);
            setTheme(selectedTheme);
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });
    
    // Fermer le menu déroulant en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (!themeSelectButton.contains(e.target) && !themeOptions.contains(e.target)) {
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });
    
    // Appliquer le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('night');
    }
    
    console.log("✅ Thème configuré");
}

// ============================================
// GESTION DU MENU (FONCTIONNE SUR TOUTES LES PAGES)
// ============================================

function setupMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (!menuBtn || !dropdownMenu) {
        console.log("⚠️ Éléments du menu non trouvés");
        return;
    }
    
    console.log("✅ Configuration du menu...");
    
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("🍔 Menu cliqué");
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
    
    console.log("✅ Menu configuré");
}

// ============================================
// GESTION DU MODAL D'ABONNEMENT
// ============================================

function setupSubscriptionModal() {
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    
    if (!subscribeLink || !modal) {
        console.log("⚠️ Éléments d'abonnement non trouvés");
        return;
    }
    
    console.log("✅ Configuration du modal d'abonnement...");
    
    const closeModalButton = modal.querySelector('.close-modal');
    const tabLinks = modal.querySelectorAll('.tab-link');
    const tabContents = modal.querySelectorAll('.tab-content');
    
    const openModal = () => {
        modal.classList.remove('hidden-modal');
        document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => {
        modal.classList.add('hidden-modal');
        document.body.style.overflow = '';
    };
    
    // Ouvrir le modal
    subscribeLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("📧 Abonnement cliqué");
        openModal();
    });
    
    // Fermer le modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
            closeModal();
        }
    });
    
    // Gestion des onglets
    tabLinks.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.dataset.tab;
            const target = document.getElementById(targetId);
            
            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            if (target) target.classList.add('active');
        });
    });
    
    // Gestion du formulaire d'abonnement
    const subscriberForm = document.getElementById('subscriber-form-element');
    if (subscriberForm) {
        subscriberForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('sub-nom').value.trim();
            const prenom = document.getElementById('sub-prenom').value.trim();
            const email = document.getElementById('sub-email').value.trim();
            const telephone = document.getElementById('sub-tel').value.trim();
            
            console.log('📝 Inscription abonné:', email);
            
            try {
                const { data, error } = await supabase
                    .from('Abonnés')
                    .insert([{ nom, prenom, email, telephone }]);
                
                if (error) throw error;
                
                alert('✅ Inscription réussie !');
                closeModal();
                subscriberForm.reset();
                
            } catch (error) {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur: ' + error.message);
            }
        });
    }
    
    console.log("✅ Modal d'abonnement configuré");
}

// ============================================
// GESTION DE L'AUTHENTIFICATION
// ============================================

function setupAuthentication() {
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    
    if (!authBtn || !authModal) {
        console.log("⚠️ Éléments d'authentification non trouvés");
        return;
    }
    
    console.log("✅ Configuration de l'authentification...");
    
    const closeAuthModal = authModal.querySelector('.close-auth-modal');
    const authTabs = authModal.querySelectorAll('.auth-tab');
    const adminForm = document.getElementById('admin-form');
    const creatorForm = document.getElementById('creator-form');
    
    // Ouvrir le modal
    authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🔑 Authentification cliquée");
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Fermer le modal
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Fermer en cliquant à l'extérieur
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Gestion des onglets
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const authType = this.getAttribute('data-auth-type');
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (authType === 'admin' && adminForm) {
                adminForm.classList.add('active');
            } else if (creatorForm) {
                creatorForm.classList.add('active');
            }
        });
    });
    
    // Connexion admin
    if (adminForm) {
        adminForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('admin-nom').value.trim();
            const password = document.getElementById('admin-password').value;
            
            console.log('🔐 Connexion admin:', nom);
            
            try {
                const { data, error } = await supabase
                    .from('administrateurs')
                    .select('*')
                    .eq('nom', nom)
                    .eq('mot_de_passe', password)
                    .single();
                
                if (error) throw error;
                
                if (!data) {
                    alert('❌ Identifiants incorrects');
                    return;
                }
                
                // Connexion réussie
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminName', data.nom);
                
                alert('✅ Connexion réussie !');
                window.location.href = 'admin.html';
                
            } catch (error) {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur de connexion');
            }
        });
    }
    
    // Connexion créateur
    if (creatorForm) {
        creatorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const brand = document.getElementById('creator-brand').value.trim();
            const password = document.getElementById('creator-password').value;
            
            console.log('🎨 Connexion créateur:', brand);
            
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
                    alert('❌ Identifiants incorrects ou compte non activé');
                    return;
                }
                
                // Connexion réussie
                sessionStorage.setItem('creatorLoggedIn', 'true');
                sessionStorage.setItem('creatorBrand', data.nom_marque);
                
                alert('✅ Connexion réussie !');
                window.location.href = 'dashboard-home.html';
                
            } catch (error) {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur de connexion');
            }
        });
    }
    
    console.log("✅ Authentification configurée");
}

// ============================================
// FONCTIONS POUR LA PAGE D'ADMINISTRATION
// ============================================

function setupAdminPage() {
    console.log("🔄 Initialisation de la page d'administration...");
    
    // Initialiser les dates
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = today;
    });
    
    // Gestion des onglets
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', async function() {
            const tabId = this.dataset.tab;
            
            // Désactiver tous les onglets
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            const tabContent = document.getElementById(`${tabId}-tab`);
            if (tabContent) tabContent.classList.add('active');
            
            // Charger les données de l'onglet
            await loadAdminTabData(tabId);
            
            // Réinitialiser le formulaire
            resetAdminForm(tabId);
        });
    });
    
    // Initialiser les uploads d'images
    document.querySelectorAll('.imageFile').forEach(input => {
        const rubrique = input.id.split('-')[1];
        input.addEventListener('change', function() {
            handleImageUpload(this, rubrique);
        });
    });
    
    // Boutons de sauvegarde
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', async function() {
            const rubrique = this.id.split('-')[1];
            await saveAdminArticle(rubrique);
        });
    });
    
    // Boutons d'annulation
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        const rubrique = btn.id.split('-')[1];
        btn.addEventListener('click', () => resetAdminForm(rubrique));
    });
    
    // Charger les données initiales
    setTimeout(() => {
        const activeTab = document.querySelector('.tab-link.active');
        if (activeTab) {
            loadAdminTabData(activeTab.dataset.tab);
        } else {
            loadAdminTabData('actualites');
        }
    }, 100);
    
    console.log("✅ Page admin configurée");
}

async function loadAdminTabData(rubrique) {
    console.log(`🔄 Chargement des données pour: ${rubrique}`);
    
    const container = document.getElementById(`${rubrique}List`);
    if (!container) {
        console.log(`❌ Conteneur ${rubrique}List non trouvé`);
        return;
    }
    
    container.innerHTML = '<p style="text-align: center; color: #666;">Chargement...</p>';
    
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('rubrique', rubrique)
            .eq('statut', 'publié')
            .order('date_publication', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Aucun contenu publié.</p>';
            return;
        }
        
        displayAdminArticles(data, rubrique, container);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        container.innerHTML = `<p style="color: #dc3545;">Erreur: ${error.message}</p>`;
    }
}

function displayAdminArticles(articles, rubrique, container) {
    container.innerHTML = articles.map(article => `
        <div class="content-item" data-id="${article.id}" data-rubrique="${rubrique}">
            <div class="content-info">
                ${article.image_url ? `
                <img src="${article.image_url}" alt="${article.titre_fr}" 
                     onerror="this.src='https://placehold.co/80?text=IMG'">` : ''}
                <div>
                    <h3>${article.titre_fr}</h3>
                    <div class="content-meta">
                        <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                        <span>${getArticleMetaText(article, rubrique)}</span>
                        <span class="badge">${getRubriqueName(rubrique)}</span>
                    </div>
                </div>
            </div>
            <div class="actions">
                <button class="action-btn edit-btn" onclick="window.editArticle(${article.id}, '${rubrique}')">
                    ✏️ Modifier
                </button>
                <button class="action-btn delete-btn" onclick="window.deleteArticle(${article.id}, '${rubrique}')">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function getArticleMetaText(article, rubrique) {
    switch(rubrique) {
        case 'visages':
            return `${article.nom_createur || ''} • ${article.domaine || ''}`;
        case 'culture':
            return `${article.type_evenement || 'Événement'} • ${article.lieu || ''}`;
        case 'decouvertes':
            return `Type: ${article.type_decouverte || ''}`;
        case 'tendances':
            return `Saison: ${article.saison || ''}`;
        case 'mode':
            return `Thème: ${article.theme_mode || ''}`;
        case 'accessoires':
            return `Type: ${article.type_accessoire || ''}`;
        case 'beaute':
            return `Catégorie: ${article.type_beaute || ''}`;
        case 'actualites':
            return `${article.categorie_actualite || 'Actualité'}`;
        default:
            return `${article.auteur || 'Rédaction'}`;
    }
}

function handleImageUpload(input, rubrique) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert("❌ L'image ne doit pas dépasser 2MB");
        input.value = "";
        return;
    }
    
    if (!file.type.match('image.*')) {
        alert("❌ Veuillez sélectionner une image valide (JPG, PNG, GIF)");
        input.value = "";
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        const placeholder = document.querySelector(`#uploadArea-${rubrique} .upload-placeholder`);
        
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

async function saveAdminArticle(rubrique) {
    const btn = document.getElementById(`btnSave-${rubrique}`);
    const status = document.getElementById(`status-${rubrique}`);
    const fileInput = document.getElementById(`imageFile-${rubrique}`);
    const file = fileInput.files[0];
    
    // Validation
    const titreInput = document.getElementById(`titre-${rubrique}`);
    if (titreInput && !titreInput.value.trim()) {
        showStatus(status, '❌ Veuillez saisir un titre', 'error');
        titreInput.focus();
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = currentEditId ? 
        '<span>💾 Enregistrement...</span>' : 
        '<span>⏳ Publication...</span>';
    
    try {
        let imageUrl = currentEditImageUrl;
        
        // Upload d'une nouvelle image
        if (file) {
            const uploadResult = await uploadImage(file, rubrique);
            if (uploadResult.error) throw uploadResult.error;
            imageUrl = uploadResult.url;
        }
        
        // Préparation des données
        const articleData = prepareArticleData(rubrique, imageUrl);
        
        // Sauvegarde
        let result;
        if (currentEditId) {
            result = await supabase
                .from('articles')
                .update(articleData)
                .eq('id', currentEditId);
        } else {
            result = await supabase
                .from('articles')
                .insert([articleData]);
        }
        
        if (result.error) throw result.error;
        
        // Succès
        showStatus(status, 
            currentEditId ? '✅ Modifié avec succès !' : '✅ Publié avec succès !', 
            'success');
        
        // Recharger et réinitialiser
        await loadAdminTabData(rubrique);
        resetAdminForm(rubrique);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showStatus(status, `❌ Erreur: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = currentEditId ? 
            '<span>💾 Mettre à jour</span>' : 
            getDefaultButtonText(rubrique);
    }
}

async function uploadImage(file, rubrique) {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${rubrique}_${timestamp}_${randomStr}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
        .from('magazine-images')
        .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage
        .from('magazine-images')
        .getPublicUrl(fileName);
    
    return { url: urlData.publicUrl };
}

function prepareArticleData(rubrique, imageUrl) {
    const baseData = {
        rubrique: rubrique,
        titre_fr: getInputValue(`titre-${rubrique}`),
        contenu_fr: getTextareaValue(`contenu-${rubrique}`) || 
                   getTextareaValue(`description-${rubrique}`) ||
                   getTextareaValue(`biographie-${rubrique}`),
        image_url: imageUrl,
        date_publication: getInputValue(`date-${rubrique}`) || 
                        getInputValue(`date_debut-${rubrique}`) ||
                        new Date().toISOString().split('T')[0],
        auteur: getInputValue(`auteur-${rubrique}`) || 'Rédaction',
        statut: 'publié'
    };
    
    switch(rubrique) {
        case 'actualites':
            baseData.categorie_actualite = getSelectValue(`categorie-${rubrique}`);
            break;
        case 'visages':
            baseData.nom_marque = getInputValue(`nom_marque-${rubrique}`);
            baseData.nom_createur = getInputValue(`nom_createur-${rubrique}`);
            baseData.domaine = getSelectValue(`domaine-${rubrique}`);
            baseData.reseaux_instagram = getInputValue(`instagram-${rubrique}`);
            baseData.site_web = getInputValue(`siteweb-${rubrique}`);
            baseData.interview_fr = getTextareaValue(`interview-${rubrique}`);
            break;
        case 'tendances':
            baseData.saison = getSelectValue(`saison-${rubrique}`);
            break;
        case 'decouvertes':
            baseData.type_decouverte = getSelectValue(`type-${rubrique}`);
            break;
        case 'culture':
            baseData.type_evenement = getSelectValue(`type-${rubrique}`);
            baseData.date_evenement = getInputValue(`date_debut-${rubrique}`);
            baseData.date_fin = getInputValue(`date_fin-${rubrique}`);
            baseData.heure_evenement = getInputValue(`heure-${rubrique}`);
            baseData.statut_evenement = getSelectValue(`statut-${rubrique}`);
            baseData.lieu = getInputValue(`lieu-${rubrique}`);
            baseData.lien_evenement = getInputValue(`lien-${rubrique}`);
            break;
        case 'mode':
            baseData.theme_mode = getSelectValue(`theme-${rubrique}`);
            break;
        case 'accessoires':
            baseData.type_accessoire = getSelectValue(`type-${rubrique}`);
            break;
        case 'beaute':
            baseData.type_beaute = getSelectValue(`type-${rubrique}`);
            break;
    }
    
    return baseData;
}

function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function getTextareaValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function getSelectValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function showStatus(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `status-message status-${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function resetAdminForm(rubrique) {
    currentEditId = null;
    currentEditRubrique = null;
    currentEditImageUrl = "";
    
    const formTitle = document.getElementById(`formTitle-${rubrique}`);
    if (formTitle) {
        formTitle.textContent = getDefaultFormTitle(rubrique);
    }
    
    const btnSave = document.getElementById(`btnSave-${rubrique}`);
    const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
    if (btnSave) {
        btnSave.innerHTML = getDefaultButtonText(rubrique);
        btnSave.style.background = "";
    }
    if (btnCancel) {
        btnCancel.style.display = "none";
    }
    
    const preview = document.getElementById(`currentImagePreview-${rubrique}`);
    const placeholder = document.querySelector(`#uploadArea-${rubrique} .upload-placeholder`);
    if (preview) {
        preview.style.display = 'none';
        preview.src = "";
    }
    if (placeholder) {
        placeholder.style.display = 'block';
    }
    
    const tabElement = document.getElementById(`${rubrique}-tab`);
    if (tabElement) {
        tabElement.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type !== 'file' && el.type !== 'button' && el.type !== 'submit') {
                if (el.id.includes('date') && !el.id.includes('date_fin')) {
                    el.value = new Date().toISOString().split('T')[0];
                } else if (el.tagName === 'SELECT') {
                    el.selectedIndex = 0;
                } else if (el.id.includes('auteur')) {
                    el.value = "Rédaction";
                } else {
                    el.value = "";
                }
            }
        });
    }
    
    const fileInput = document.getElementById(`imageFile-${rubrique}`);
    if (fileInput) {
        fileInput.value = "";
    }
}

function getDefaultFormTitle(rubrique) {
    const titles = {
        'actualites': 'Publier une actualité',
        'visages': 'Ajouter un créateur',
        'coulisses': 'Article Coulisses',
        'tendances': 'Article Tendances',
        'decouvertes': 'Nouvelle découverte',
        'culture': 'Événement Culture/Agenda',
        'mode': 'Article Mode',
        'accessoires': 'Article Accessoires',
        'beaute': 'Article Beauté'
    };
    return titles[rubrique] || 'Nouveau contenu';
}

function getDefaultButtonText(rubrique) {
    const texts = {
        'actualites': '<span>🚀 Publier l\'actualité</span>',
        'visages': '<span>👑 Ajouter le créateur</span>',
        'coulisses': '<span>📝 Publier l\'article</span>',
        'tendances': '<span>📈 Publier la tendance</span>',
        'decouvertes': '<span>🔍 Publier la découverte</span>',
        'culture': '<span>📅 Ajouter l\'événement</span>',
        'mode': '<span>👗 Publier l\'article</span>',
        'accessoires': '<span>💎 Publier l\'article</span>',
        'beaute': '<span>💄 Publier l\'article</span>'
    };
    return texts[rubrique] || '<span>📝 Publier</span>';
}

// Fonctions globales pour l'admin
window.editArticle = async function(id, rubrique) {
    try {
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        currentEditId = id;
        currentEditRubrique = rubrique;
        currentEditImageUrl = article.image_url || "";
        
        // Basculer vers l'onglet
        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const tabButton = document.querySelector(`[data-tab="${rubrique}"]`);
        if (tabButton) tabButton.classList.add('active');
        
        const tabContent = document.getElementById(`${rubrique}-tab`);
        if (tabContent) tabContent.classList.add('active');
        
        // Remplir le formulaire
        fillAdminForm(article, rubrique);
        
        // Mettre à jour l'interface
        const formTitle = document.getElementById(`formTitle-${rubrique}`);
        const btnSave = document.getElementById(`btnSave-${rubrique}`);
        const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
        
        if (formTitle) formTitle.textContent = `Modifier l'article`;
        if (btnSave) {
            btnSave.innerHTML = '<span>💾 Mettre à jour</span>';
            btnSave.style.background = "#f59e0b";
        }
        if (btnCancel) btnCancel.style.display = "flex";
        
        // Aperçu de l'image
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        const placeholder = document.querySelector(`#uploadArea-${rubrique} .upload-placeholder`);
        if (article.image_url && preview) {
            preview.src = article.image_url;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        alert('❌ Erreur lors du chargement: ' + error.message);
        console.error('❌ Erreur édition:', error);
    }
};

function fillAdminForm(article, rubrique) {
    setInputValue(`titre-${rubrique}`, article.titre_fr);
    setTextareaValue(`contenu-${rubrique}`, article.contenu_fr);
    setInputValue(`date-${rubrique}`, article.date_publication);
    setInputValue(`auteur-${rubrique}`, article.auteur);
    
    switch(rubrique) {
        case 'actualites':
            setSelectValue(`categorie-${rubrique}`, article.categorie_actualite);
            break;
        case 'visages':
            setInputValue(`nom_marque-${rubrique}`, article.nom_marque);
            setInputValue(`nom_createur-${rubrique}`, article.nom_createur);
            setSelectValue(`domaine-${rubrique}`, article.domaine);
            setInputValue(`instagram-${rubrique}`, article.reseaux_instagram);
            setInputValue(`siteweb-${rubrique}`, article.site_web);
            setTextareaValue(`interview-${rubrique}`, article.interview_fr);
            setTextareaValue(`biographie-${rubrique}`, article.contenu_fr);
            break;
        case 'tendances':
            setSelectValue(`saison-${rubrique}`, article.saison);
            break;
        case 'decouvertes':
            setSelectValue(`type-${rubrique}`, article.type_decouverte);
            break;
        case 'culture':
            setInputValue(`titre-${rubrique}`, article.titre_fr);
            setTextareaValue(`description-${rubrique}`, article.contenu_fr);
            setSelectValue(`type-${rubrique}`, article.type_evenement);
            setInputValue(`date_debut-${rubrique}`, article.date_evenement);
            setInputValue(`date_fin-${rubrique}`, article.date_fin);
            setInputValue(`heure-${rubrique}`, article.heure_evenement);
            setSelectValue(`statut-${rubrique}`, article.statut_evenement);
            setInputValue(`lieu-${rubrique}`, article.lieu);
            setInputValue(`lien-${rubrique}`, article.lien_evenement);
            break;
        case 'mode':
            setSelectValue(`theme-${rubrique}`, article.theme_mode);
            break;
        case 'accessoires':
            setSelectValue(`type-${rubrique}`, article.type_accessoire);
            break;
        case 'beaute':
            setSelectValue(`type-${rubrique}`, article.type_beaute);
            break;
    }
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) element.value = value;
}

function setTextareaValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) element.value = value;
}

function setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        for (let option of element.options) {
            if (option.value === value) {
                option.selected = true;
                break;
            }
        }
    }
}

window.deleteArticle = async function(id, rubrique) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cet article ?")) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert("✅ Article supprimé avec succès !");
        await loadAdminTabData(rubrique);
        
        if (currentEditId === id) {
            resetAdminForm(rubrique);
        }
        
    } catch (error) {
        alert("❌ Erreur lors de la suppression: " + error.message);
        console.error('❌ Erreur suppression:', error);
    }
};

// ============================================
// FONCTIONS POUR LES PAGES DE CONTENU
// ============================================

async function loadContentPage() {
    const containerMap = {
        'actualites-container': 'actualites',
        'visages-container': 'visages',
        'tendances-container': 'tendances',
        'accessoires-container': 'accessoires',
        'beaute-container': 'beaute',
        'coulisses-container': 'coulisses',
        'culture-container': 'culture',
        'decouvertes-container': 'decouvertes',
        'mode-container': 'mode'
    };
    
    for (const [containerId, rubrique] of Object.entries(containerMap)) {
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`📄 Chargement de la page: ${rubrique}`);
            
            container.innerHTML = '<div class="loading">Chargement des articles...</div>';
            
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('rubrique', rubrique)
                    .eq('statut', 'publié')
                    .order('date_publication', { ascending: false });
                
                if (error) throw error;
                
                if (!data || data.length === 0) {
                    container.innerHTML = `
                        <div class="no-content">
                            <p>Aucun contenu publié pour le moment.</p>
                        </div>
                    `;
                    return;
                }
                
                renderContentPage(rubrique, data, container);
                
            } catch (error) {
                console.error(`❌ Erreur chargement ${rubrique}:`, error);
                container.innerHTML = `
                    <div class="error">
                        <p>Erreur de chargement des articles.</p>
                    </div>
                `;
            }
            return;
        }
    }
}

function renderContentPage(rubrique, articles, container) {
    switch(rubrique) {
        case 'visages':
            renderVisagesPage(articles, container);
            break;
        case 'culture':
            renderCulturePage(articles, container);
            break;
        case 'decouvertes':
            renderDecouvertesPage(articles, container);
            break;
        default:
            renderGenericPage(articles, container, rubrique);
    }
}

function renderVisagesPage(visages, container) {
    container.innerHTML = visages.map(visage => `
        <article class="creator-card">
            ${visage.image_url ? `
            <div class="creator-image">
                <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" 
                     loading="lazy" onerror="this.src='https://placehold.co/400x300?text=CREATEUR'">
            </div>
            ` : ''}
            
            <div class="creator-info">
                <h3>${visage.nom_marque || visage.titre_fr}</h3>
                
                ${visage.nom_createur ? `<p class="creator-name">👤 ${visage.nom_createur}</p>` : ''}
                ${visage.domaine ? `<p class="creator-domain">🏷️ ${visage.domaine}</p>` : ''}
                
                <div class="creator-bio">
                    <p>${visage.contenu_fr ? 
                        visage.contenu_fr.substring(0, 200) + 
                        (visage.contenu_fr.length > 200 ? '...' : '') : 
                        'Découvrez ce créateur...'}</p>
                </div>
                
                <div class="creator-links">
                    ${visage.reseaux_instagram ? `
                    <a href="https://instagram.com/${visage.reseaux_instagram.replace('@', '')}" 
                       target="_blank" class="social-link instagram">
                        <i class="fab fa-instagram"></i> Instagram
                    </a>
                    ` : ''}
                    
                    ${visage.site_web ? `
                    <a href="${visage.site_web}" target="_blank" class="social-link website">
                        <i class="fas fa-globe"></i> Site web
                    </a>
                    ` : ''}
                </div>
                
                <a href="article.html?id=${visage.id}" class="btn-view-profile">
                    Voir le profil complet →
                </a>
            </div>
        </article>
    `).join('');
}

function renderCulturePage(events, container) {
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
    
    if (evenementsFuturs.length > 0) {
        html += `
            <section class="upcoming-events">
                <h2>📅 Événements à venir</h2>
                <div class="events-grid">
                    ${evenementsFuturs.map(event => `
                        <div class="event-card upcoming">
                            <h3>${event.titre_fr}</h3>
                            <div class="event-details">
                                <p><i class="fas fa-calendar"></i> 
                                    ${event.date_evenement ? 
                                        new Date(event.date_evenement).toLocaleDateString('fr-FR') : 
                                        new Date(event.date_publication).toLocaleDateString('fr-FR')}
                                    ${event.heure_evenement ? ` • ${event.heure_evenement}` : ''}
                                </p>
                                ${event.lieu ? `<p><i class="fas fa-map-marker-alt"></i> ${event.lieu}</p>` : ''}
                                <p class="event-description">
                                    ${event.contenu_fr ? 
                                        event.contenu_fr.substring(0, 150) + 
                                        (event.contenu_fr.length > 150 ? '...' : '') : 
                                        'Plus d\'informations...'}
                                </p>
                            </div>
                            <a href="article.html?id=${event.id}" class="btn-event">
                                Voir les détails →
                            </a>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }
    
    if (evenementsPasses.length > 0) {
        html += `
            <section class="past-events">
                <h2>📚 Archives des événements</h2>
                <div class="events-grid past">
                    ${evenementsPasses.map(event => `
                        <div class="event-card past">
                            <h4>${event.titre_fr}</h4>
                            <div class="event-meta">
                                <span>${new Date(event.date_evenement || event.date_publication).toLocaleDateString('fr-FR')}</span>
                                <span>${event.type_evenement || 'Événement'}</span>
                            </div>
                            <a href="article.html?id=${event.id}" class="btn-event">
                                Revivre l'événement →
                            </a>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }
    
    container.innerHTML = html || '<p class="no-events">Aucun événement programmé pour le moment.</p>';
}

function renderDecouvertesPage(decouvertes, container) {
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
            <h2>${getTypeDecouverteLabel(type)}</h2>
            <div class="discoveries-grid">
                ${items.map(item => `
                    <article class="discovery-card">
                        ${item.image_url ? `
                        <div class="discovery-image">
                            <img src="${item.image_url}" alt="${item.titre_fr}" 
                                 loading="lazy" onerror="this.src='https://placehold.co/400x300?text=DECOUVERTE'">
                        </div>
                        ` : ''}
                        
                        <div class="discovery-content">
                            <h3>${item.titre_fr}</h3>
                            <p class="discovery-excerpt">
                                ${item.contenu_fr ? 
                                    item.contenu_fr.substring(0, 180) + 
                                    (item.contenu_fr.length > 180 ? '...' : '') : 
                                    'Découvrez...'}
                            </p>
                            <div class="discovery-meta">
                                <span>📅 ${new Date(item.date_publication).toLocaleDateString('fr-FR')}</span>
                                <span>🔍 ${getTypeDecouverteLabel(item.type_decouverte)}</span>
                            </div>
                            <a href="article.html?id=${item.id}" class="btn-discovery">
                                Découvrir →
                            </a>
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
    `).join('');
}

function renderGenericPage(articles, container, rubrique) {
    container.innerHTML = articles.map(article => `
        <article class="article-card">
            ${article.image_url ? `
            <div class="article-image">
                <img src="${article.image_url}" alt="${article.titre_fr}" 
                     loading="lazy" onerror="this.src='https://placehold.co/600x400?text=ARTICLE'">
            </div>
            ` : ''}
            
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <h2 class="article-title">${article.titre_fr}</h2>
                
                <div class="article-excerpt">
                    <p>${article.contenu_fr ? 
                        article.contenu_fr.substring(0, 250) + 
                        (article.contenu_fr.length > 250 ? '...' : '') : 
                        'Lire la suite...'}</p>
                </div>
                
                <div class="article-footer">
                    <span class="article-author">👤 ${article.auteur || 'Rédaction'}</span>
                    <a href="article.html?id=${article.id}" class="btn-read-more">
                        Lire la suite →
                    </a>
                </div>
            </div>
        </article>
    `).join('');
}

// ============================================
// INITIALISATION PRINCIPALE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation du magazine...");
    
    // TOUJOURS configurer ces éléments (ils existent sur toutes les pages)
    setupTheme();
    setupMenu();
    setupSubscriptionModal();
    setupAuthentication();
    
    // Détecter le type de page
    if (window.location.pathname.includes('Actualisation.html') || 
        document.querySelector('.admin-page')) {
        console.log("🖥️ Page d'administration détectée");
        setupAdminPage();
    } 
    else if (window.location.pathname.includes('visages.html') ||
             window.location.pathname.includes('coulisses.html') ||
             window.location.pathname.includes('tendances.html') ||
             window.location.pathname.includes('actualites.html') ||
             window.location.pathname.includes('mode.html') ||
             window.location.pathname.includes('accessoires.html') ||
             window.location.pathname.includes('beaute.html') ||
             window.location.pathname.includes('culture.html') ||
             window.location.pathname.includes('decouvertes.html')) {
        
        console.log("📄 Page de contenu détectée");
        loadContentPage();
    }
    
    console.log("✅ Magazine initialisé avec succès");
});

// ============================================
// GESTION DES FILTRES POUR VISAGES
// ============================================

document.addEventListener('click', function(e) {
    // Gestion des filtres Visages
    if (e.target.classList.contains('filter-btn')) {
        const filter = e.target.dataset.filter;
        const container = document.getElementById('visages-container');
        
        if (container) {
            filterVisages(filter, container);
        }
        
        // Activer le bouton sélectionné
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

async function filterVisages(filter, container) {
    if (!container) return;
    
    try {
        let query = supabase
            .from('articles')
            .select('*')
            .eq('rubrique', 'visages')
            .eq('statut', 'publié')
            .order('date_publication', { ascending: false });
        
        if (filter !== 'all') {
            query = query.eq('domaine', filter);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="no-content">Aucun créateur trouvé.</p>';
            return;
        }
        
        renderVisagesPage(data, container);
        
    } catch (error) {
        console.error('❌ Erreur filtrage:', error);
        container.innerHTML = '<p class="error">Erreur lors du filtrage.</p>';
    }
}
