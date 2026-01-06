// ============================================
// ADMIN SCRIPT - Gestion complète du magazine
// ============================================

// Configuration Supabase (identique pour toutes les pages)
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

// Initialisation Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// 1. SCRIPT POUR LA PAGE D'ADMINISTRATION (Actualisation.html)
// ============================================
if (window.location.pathname.includes('Actualisation.html')) {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🔄 Initialisation de la page d\'administration...');
        
        // Variables globales pour l'édition
        let currentEditId = null;
        let currentEditRubrique = null;
        let currentEditImageUrl = "";
        
        // Appliquer le thème sauvegardé
        applyTheme();
        initThemeSelector();
        
        // Initialiser les dates
        initDates();
        
        // Gestion des onglets
        initAdminTabs();
        
        // Gestion des formulaires et uploads
        initAdminForms();
        
        // Charger les données initiales (onglet Actualités par défaut)
        await loadAdminTabData('actualites');
        
        // ============================================
        // FONCTIONS ADMIN
        // ============================================
        
        function applyTheme() {
            const theme = localStorage.getItem('dreamswear-theme') || 'day';
            document.body.setAttribute('data-theme', theme);
            
            const themeText = document.getElementById('theme-button-text');
            if (themeText) {
                themeText.textContent = theme === 'night' ? 'Sombre' : 'Clair';
            }
        }
        
        function initThemeSelector() {
            const themeButton = document.getElementById('theme-select-button');
            const themeOptions = document.getElementById('theme-options');
            
            if (!themeButton || !themeOptions) return;
            
            themeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                themeOptions.classList.toggle('hidden-options');
            });
            
            themeOptions.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const theme = this.getAttribute('data-theme');
                    document.body.setAttribute('data-theme', theme);
                    localStorage.setItem('dreamswear-theme', theme);
                    
                    const themeText = document.getElementById('theme-button-text');
                    if (themeText) {
                        themeText.textContent = theme === 'night' ? 'Sombre' : 'Clair';
                    }
                    themeOptions.classList.add('hidden-options');
                });
            });
            
            document.addEventListener('click', function() {
                themeOptions.classList.add('hidden-options');
            });
        }
        
        function initDates() {
            const today = new Date().toISOString().split('T')[0];
            document.querySelectorAll('input[type="date"]').forEach(input => {
                if (!input.value) input.value = today;
            });
        }
        
        function initAdminTabs() {
            document.querySelectorAll('.tab-link').forEach(tab => {
                tab.addEventListener('click', async function() {
                    const tabId = this.dataset.tab;
                    
                    // Désactiver tous les onglets
                    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Activer l'onglet cliqué
                    this.classList.add('active');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                    
                    // Charger les données de l'onglet
                    await loadAdminTabData(tabId);
                    
                    // Réinitialiser le formulaire
                    resetAdminForm(tabId);
                });
            });
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
                
                if (error) {
                    container.innerHTML = `<p style="color: #dc3545;">Erreur: ${error.message}</p>`;
                    console.error(`❌ Erreur chargement ${rubrique}:`, error);
                    return;
                }
                
                if (!data || data.length === 0) {
                    container.innerHTML = '<p style="text-align: center; color: #666;">Aucun contenu publié.</p>';
                    return;
                }
                
                // Afficher les articles
                displayAdminArticles(data, rubrique, container);
                
            } catch (error) {
                container.innerHTML = `<p style="color: #dc3545;">Erreur: ${error.message}</p>`;
                console.error('💥 Erreur:', error);
            }
        }
        
        function displayAdminArticles(articles, rubrique, container) {
            container.innerHTML = articles.map(article => {
                // Texte de métadonnées selon la rubrique
                let metaText = getArticleMetaText(article, rubrique);
                
                return `
                    <div class="content-item" data-id="${article.id}" data-rubrique="${rubrique}">
                        <div class="content-info">
                            ${article.image_url ? `
                            <img src="${article.image_url}" alt="${article.titre_fr}" 
                                 onerror="this.src='https://placehold.co/80?text=IMG'">` : ''}
                            <div>
                                <h3>${article.titre_fr}</h3>
                                <div class="content-meta">
                                    <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                                    <span>${metaText}</span>
                                    <span class="badge">${getRubriqueLabel(rubrique)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="actions">
                            <button class="action-btn edit-btn" onclick="editArticle(${article.id}, '${rubrique}')">
                                ✏️ Modifier
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteArticle(${article.id}, '${rubrique}')">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
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
        
        function getRubriqueLabel(rubrique) {
            const labels = {
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
            return labels[rubrique] || rubrique;
        }
        
        function initAdminForms() {
            // Initialiser les uploads d'images
            document.querySelectorAll('.imageFile').forEach(input => {
                const rubrique = input.id.split('-')[1];
                input.addEventListener('change', function() {
                    handleImageUpload(this, rubrique);
                });
            });
            
            // Boutons d'annulation
            document.querySelectorAll('.btn-cancel').forEach(btn => {
                const rubrique = btn.id.split('-')[1];
                btn.addEventListener('click', () => resetAdminForm(rubrique));
            });
            
            // Boutons de sauvegarde
            document.querySelectorAll('.btn-save').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const rubrique = this.id.split('-')[1];
                    await saveAdminArticle(rubrique);
                });
            });
            
            // Initialiser les champs de date pour la culture
            const dateDebutCulture = document.getElementById('date_debut-culture');
            const dateFinCulture = document.getElementById('date_fin-culture');
            if (dateDebutCulture && dateFinCulture) {
                dateDebutCulture.addEventListener('change', function() {
                    if (!dateFinCulture.value || dateFinCulture.value < this.value) {
                        dateFinCulture.value = this.value;
                    }
                    dateFinCulture.min = this.value;
                });
            }
        }
        
        function handleImageUpload(input, rubrique) {
            const file = input.files[0];
            if (!file) return;
            
            // Validation de la taille
            if (file.size > 2 * 1024 * 1024) {
                alert("L'image ne doit pas dépasser 2MB");
                input.value = "";
                return;
            }
            
            // Validation du type
            if (!file.type.match('image.*')) {
                alert("Veuillez sélectionner une image valide (JPG, PNG, GIF)");
                input.value = "";
                return;
            }
            
            // Aperçu de l'image
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
            
            // Validation des champs requis
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
                
                // Préparation des données selon la rubrique
                const articleData = prepareArticleData(rubrique, imageUrl);
                
                // Sauvegarde dans Supabase
                let result;
                if (currentEditId) {
                    // Mise à jour
                    result = await supabase
                        .from('articles')
                        .update(articleData)
                        .eq('id', currentEditId);
                } else {
                    // Insertion
                    result = await supabase
                        .from('articles')
                        .insert([articleData]);
                }
                
                if (result.error) throw result.error;
                
                // Succès
                showStatus(status, 
                    currentEditId ? '✅ Modifié avec succès !' : '✅ Publié avec succès !', 
                    'success');
                
                // Recharger les données et réinitialiser le formulaire
                await loadAdminTabData(rubrique);
                resetAdminForm(rubrique);
                
                // Défilement vers le haut
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
            
            // Upload vers Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('magazine-images')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;
            
            // Récupérer l'URL publique
            const { data: urlData } = supabase.storage
                .from('magazine-images')
                .getPublicUrl(fileName);
            
            return { url: urlData.publicUrl };
        }
        
        function prepareArticleData(rubrique, imageUrl) {
            // Données communes
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
            
            // Données spécifiques par rubrique
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
            
            // Réinitialiser le titre du formulaire
            const formTitle = document.getElementById(`formTitle-${rubrique}`);
            if (formTitle) {
                formTitle.textContent = getDefaultFormTitle(rubrique);
            }
            
            // Réinitialiser le bouton
            const btnSave = document.getElementById(`btnSave-${rubrique}`);
            const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
            if (btnSave) {
                btnSave.innerHTML = getDefaultButtonText(rubrique);
                btnSave.style.background = "";
            }
            if (btnCancel) {
                btnCancel.style.display = "none";
            }
            
            // Réinitialiser l'aperçu de l'image
            const preview = document.getElementById(`currentImagePreview-${rubrique}`);
            const placeholder = document.querySelector(`#uploadArea-${rubrique} .upload-placeholder`);
            if (preview) {
                preview.style.display = 'none';
                preview.src = "";
            }
            if (placeholder) {
                placeholder.style.display = 'block';
            }
            
            // Réinitialiser les champs du formulaire
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
            
            // Réinitialiser l'upload de fichier
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
        
        // ============================================
        // FONCTIONS GLOBALES POUR L'ADMIN
        // ============================================
        
        window.editArticle = async function(id, rubrique) {
            try {
                const { data: article, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                
                // Sauvegarder les informations d'édition
                currentEditId = id;
                currentEditRubrique = rubrique;
                currentEditImageUrl = article.image_url || "";
                
                // Remplir le formulaire
                fillAdminForm(article, rubrique);
                
                // Basculer vers l'onglet approprié
                document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                const tabButton = document.querySelector(`[data-tab="${rubrique}"]`);
                if (tabButton) tabButton.classList.add('active');
                
                const tabContent = document.getElementById(`${rubrique}-tab`);
                if (tabContent) tabContent.classList.add('active');
                
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
                
                // Aperçu de l'image existante
                const preview = document.getElementById(`currentImagePreview-${rubrique}`);
                const placeholder = document.querySelector(`#uploadArea-${rubrique} .upload-placeholder`);
                if (article.image_url && preview) {
                    preview.src = article.image_url;
                    preview.style.display = 'block';
                    if (placeholder) placeholder.style.display = 'none';
                }
                
                // Défilement vers le formulaire
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } catch (error) {
                alert('Erreur lors du chargement: ' + error.message);
                console.error('❌ Erreur édition:', error);
            }
        };
        
        function fillAdminForm(article, rubrique) {
            // Remplir les champs communs
            setInputValue(`titre-${rubrique}`, article.titre_fr);
            setTextareaValue(`contenu-${rubrique}`, article.contenu_fr);
            setInputValue(`date-${rubrique}`, article.date_publication);
            setInputValue(`auteur-${rubrique}`, article.auteur);
            
            // Remplir les champs spécifiques
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
                
                alert("Article supprimé avec succès !");
                
                // Recharger les données
                await loadAdminTabData(rubrique);
                
                // Si on était en train d'éditer cet article, réinitialiser le formulaire
                if (currentEditId === id) {
                    resetAdminForm(rubrique);
                }
                
            } catch (error) {
                alert("Erreur lors de la suppression: " + error.message);
                console.error('❌ Erreur suppression:', error);
            }
        };
    });
}

// ============================================
// 2. SCRIPT POUR LES PAGES DE CONTENU
// ============================================
else if (document.querySelector('.admin-page') === null) {
    // Ce script ne s'exécute pas sur les pages d'administration
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🔄 Initialisation des pages de contenu...');
        
        // Détecter la page actuelle
        const pageInfo = detectContentPage();
        if (!pageInfo) {
            console.log('ℹ️ Page non reconnue');
            return;
        }
        
        const { rubrique, containerId } = pageInfo;
        console.log(`📄 Page détectée: ${rubrique} (${containerId})`);
        
        // Charger les articles
        await loadContentPage(rubrique, containerId);
        
        // Initialiser les filtres si nécessaire
        if (rubrique === 'visages' && document.querySelectorAll('.filter-btn').length > 0) {
            setupContentFilters();
        }
        
        // ============================================
        // FONCTIONS POUR LES PAGES DE CONTENU
        // ============================================
        
        function detectContentPage() {
            // Détection par ID de conteneur
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
                if (document.getElementById(containerId)) {
                    return { rubrique, containerId };
                }
            }
            
            // Détection par nom de fichier
            const path = window.location.pathname;
            const pageName = path.split('/').pop().replace('.html', '').toLowerCase();
            
            const pageMap = {
                'actualites': ['actualites-container', 'actualites'],
                'visages': ['visages-container', 'visages'],
                'tendances': ['tendances-container', 'tendances'],
                'accessoires': ['accessoires-container', 'accessoires'],
                'beaute': ['beaute-container', 'beaute'],
                'coulisses': ['coulisses-container', 'coulisses'],
                'culture': ['culture-container', 'culture'],
                'decouvertes': ['decouvertes-container', 'decouvertes'],
                'mode': ['mode-container', 'mode']
            };
            
            if (pageMap[pageName]) {
                const [containerId, rubrique] = pageMap[pageName];
                return { rubrique, containerId };
            }
            
            return null;
        }
        
        async function loadContentPage(rubrique, containerId) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.log(`❌ Conteneur ${containerId} non trouvé`);
                return;
            }
            
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
                            <small>Les articles seront bientôt disponibles</small>
                        </div>
                    `;
                    return;
                }
                
                // Afficher les articles selon la rubrique
                renderContentPage(rubrique, data, container);
                
            } catch (error) {
                console.error(`❌ Erreur chargement ${rubrique}:`, error);
                container.innerHTML = `
                    <div class="error">
                        <p>Erreur de chargement des articles.</p>
                        <small>Veuillez réessayer plus tard</small>
                    </div>
                `;
            }
        }
        
        function renderContentPage(rubrique, articles, container) {
            // Utiliser des templates différents selon la rubrique
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
            
            // Événements à venir
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
            
            // Événements passés
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
            // Grouper par type
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
                    <h2>${getDiscoveryTypeLabel(type)}</h2>
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
                                        <span>🔍 ${getDiscoveryTypeLabel(item.type_decouverte)}</span>
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
        
        function getDiscoveryTypeLabel(type) {
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
        
        function renderGenericPage(articles, container, rubrique) {
            const rubriqueLabel = getRubriqueLabel(rubrique);
            
            container.innerHTML = articles.map(article => `
                <article class="article-card ${rubrique}-card">
                    ${article.image_url ? `
                    <div class="article-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" 
                             loading="lazy" onerror="this.src='https://placehold.co/600x400?text=${rubriqueLabel.toUpperCase()}'">
                        ${getArticleBadge(article, rubrique)}
                    </div>
                    ` : ''}
                    
                    <div class="article-content">
                        <div class="article-meta">
                            <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            ${getArticleCategory(article, rubrique)}
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
        
        function getRubriqueLabel(rubrique) {
            const labels = {
                'actualites': 'Actualités',
                'coulisses': 'Coulisses',
                'tendances': 'Tendances',
                'mode': 'Mode',
                'accessoires': 'Accessoires',
                'beaute': 'Beauté'
            };
            return labels[rubrique] || rubrique;
        }
        
        function getArticleBadge(article, rubrique) {
            switch(rubrique) {
                case 'tendances':
                    return article.saison ? `<span class="badge season-badge">${article.saison}</span>` : '';
                case 'mode':
                    return article.theme_mode ? `<span class="badge theme-badge">${article.theme_mode}</span>` : '';
                case 'accessoires':
                    return article.type_accessoire ? `<span class="badge type-badge">${article.type_accessoire}</span>` : '';
                case 'beaute':
                    return article.type_beaute ? `<span class="badge beauty-badge">${article.type_beaute}</span>` : '';
                case 'actualites':
                    return article.categorie_actualite ? `<span class="badge category-badge">${article.categorie_actualite}</span>` : '';
                default:
                    return '';
            }
        }
        
        function getArticleCategory(article, rubrique) {
            switch(rubrique) {
                case 'tendances':
                    return article.saison ? `<span class="article-category">🌤️ ${article.saison}</span>` : '';
                case 'mode':
                    return article.theme_mode ? `<span class="article-category">👗 ${article.theme_mode}</span>` : '';
                case 'accessoires':
                    return article.type_accessoire ? `<span class="article-category">💎 ${article.type_accessoire}</span>` : '';
                case 'beaute':
                    return article.type_beaute ? `<span class="article-category">💄 ${article.type_beaute}</span>` : '';
                case 'actualites':
                    return article.categorie_actualite ? `<span class="article-category">📢 ${article.categorie_actualite}</span>` : '';
                default:
                    return '';
            }
        }
        
        function setupContentFilters() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            if (filterBtns.length === 0) return;
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', async function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.dataset.filter;
                    await filterVisages(filter);
                });
            });
        }
        
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
                
                if (domain !== 'all') {
                    query = query.eq('domaine', domain);
                }
                
                const { data, error } = await query;
                if (error) throw error;
                
                if (!data || data.length === 0) {
                    container.innerHTML = '<p class="no-content">Aucun créateur trouvé dans cette catégorie.</p>';
                    return;
                }
                
                renderVisagesPage(data, container);
                
            } catch (error) {
                console.error('❌ Erreur filtrage:', error);
                container.innerHTML = '<p class="error">Erreur lors du filtrage des créateurs.</p>';
            }
        }
    });
}

// ============================================
// 3. SCRIPT POUR LA PAGE ARTICLE INDIVIDUEL (article.html)
// ============================================
if (document.getElementById('article-content')) {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🔄 Chargement de l\'article individuel...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            document.getElementById('article-content').innerHTML = `
                <div class="error-message">
                    <h2>Article non trouvé</h2>
                    <p>Aucun ID d'article spécifié dans l'URL.</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
            return;
        }
        
        await loadSingleArticle(articleId);
    });
    
    async function loadSingleArticle(id) {
        const container = document.getElementById('article-content');
        container.innerHTML = '<div class="loading">Chargement de l\'article...</div>';
        
        try {
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (!article || article.statut !== 'publié') {
                throw new Error('Cet article n\'est pas disponible ou n\'existe pas.');
            }
            
            renderSingleArticle(article);
            
        } catch (error) {
            console.error('❌ Erreur chargement article:', error);
            container.innerHTML = `
                <div class="error-message">
                    <h2>Erreur de chargement</h2>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn-home">Retour à l'accueil</a>
                </div>
            `;
        }
    }
    
    function renderSingleArticle(article) {
        const container = document.getElementById('article-content');
        const rubriqueLabel = getRubriqueLabel(article.rubrique);
        
        container.innerHTML = `
            <article class="full-article">
                <nav class="article-breadcrumb">
                    <a href="index.html">Accueil</a> > 
                    <a href="${article.rubrique}.html">${rubriqueLabel}</a>
                </nav>
                
                <header class="article-header">
                    <h1 class="article-title">${article.titre_fr}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            <span class="article-author">👤 ${article.auteur || 'Rédaction'}</span>
                        </div>
                        <div class="meta-right">
                            <span class="article-rubrique">${rubriqueLabel}</span>
                            ${getArticleCategoryBadge(article)}
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" 
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>
                    ` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${formatArticleContent(article.contenu_fr)}
                    </div>
                    
                    ${renderArticleSpecificContent(article)}
                </div>
                
                ${renderArticleTags(article)}
                
                <footer class="article-footer">
                    <a href="${article.rubrique}.html" class="btn-back">
                        ← Retour à ${rubriqueLabel}
                    </a>
                    
                    <div class="article-share">
                        <span>Partager :</span>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                           target="_blank" class="share-btn facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.titre_fr)}" 
                           target="_blank" class="share-btn twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.titre_fr)}" 
                           target="_blank" class="share-btn linkedin">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </footer>
            </article>
        `;
    }
    
    function formatArticleContent(content) {
        if (!content) return '<p>Contenu non disponible.</p>';
        
        // Convertir les sauts de ligne
        let formatted = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        
        // Convertir les titres
        formatted = formatted.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>');
        formatted = formatted.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>');
        formatted = formatted.replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>');
        
        // Convertir le formatage
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convertir les listes
        formatted = formatted.replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return `<p>${formatted}</p>`;
    }
    
    function getArticleCategoryBadge(article) {
        if (article.type_decouverte) return `<span class="article-category-badge">🔍 ${article.type_decouverte}</span>`;
        if (article.type_accessoire) return `<span class="article-category-badge">💎 ${article.type_accessoire}</span>`;
        if (article.type_beaute) return `<span class="article-category-badge">💄 ${article.type_beaute}</span>`;
        if (article.saison) return `<span class="article-category-badge">📈 ${article.saison}</span>`;
        if (article.theme_mode) return `<span class="article-category-badge">👗 ${article.theme_mode}</span>`;
        if (article.type_evenement) return `<span class="article-category-badge">🎫 ${article.type_evenement}</span>`;
        if (article.categorie_actualite) return `<span class="article-category-badge">📢 ${article.categorie_actualite}</span>`;
        if (article.domaine) return `<span class="article-category-badge">🏷️ ${article.domaine}</span>`;
        return '';
    }
    
    function renderArticleSpecificContent(article) {
        if (article.rubrique === 'visages') {
            return `
                <div class="article-specific creator-details">
                    <h3>À propos du créateur</h3>
                    <div class="creator-info-grid">
                        ${article.nom_marque ? `<div><strong>Marque :</strong> ${article.nom_marque}</div>` : ''}
                        ${article.nom_createur ? `<div><strong>Créateur :</strong> ${article.nom_createur}</div>` : ''}
                        ${article.domaine ? `<div><strong>Domaine :</strong> ${article.domaine}</div>` : ''}
                        ${article.reseaux_instagram ? `
                        <div>
                            <strong>Instagram :</strong> 
                            <a href="https://instagram.com/${article.reseaux_instagram.replace('@', '')}" 
                               target="_blank">${article.reseaux_instagram}</a>
                        </div>
                        ` : ''}
                        ${article.site_web ? `
                        <div>
                            <strong>Site web :</strong> 
                            <a href="${article.site_web}" target="_blank">${article.site_web}</a>
                        </div>
                        ` : ''}
                    </div>
                    
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
            return `
                <div class="article-specific event-details">
                    <h3>Informations pratiques</h3>
                    <div class="event-info-grid">
                        ${article.type_evenement ? `<div><strong>Type :</strong> ${article.type_evenement}</div>` : ''}
                        ${article.date_evenement ? `<div><strong>Date :</strong> ${new Date(article.date_evenement).toLocaleDateString('fr-FR')}</div>` : ''}
                        ${article.heure_evenement ? `<div><strong>Heure :</strong> ${article.heure_evenement}</div>` : ''}
                        ${article.lieu ? `<div><strong>Lieu :</strong> ${article.lieu}</div>` : ''}
                        ${article.statut_evenement ? `<div><strong>Statut :</strong> ${article.statut_evenement}</div>` : ''}
                        ${article.lien_evenement ? `
                        <div>
                            <strong>Site web :</strong> 
                            <a href="${article.lien_evenement}" target="_blank">${article.lien_evenement}</a>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return '';
    }
    
    function renderArticleTags(article) {
        const tags = [];
        
        if (article.type_decouverte) tags.push(`🔍 ${article.type_decouverte}`);
        if (article.type_accessoire) tags.push(`💎 ${article.type_accessoire}`);
        if (article.type_beaute) tags.push(`💄 ${article.type_beaute}`);
        if (article.saison) tags.push(`📈 ${article.saison}`);
        if (article.theme_mode) tags.push(`👗 ${article.theme_mode}`);
        if (article.domaine) tags.push(`🏷️ ${article.domaine}`);
        if (article.categorie_actualite) tags.push(`📢 ${article.categorie_actualite}`);
        if (article.type_evenement) tags.push(`🎫 ${article.type_evenement}`);
        
        if (tags.length === 0) return '';
        
        return `
            <div class="article-tags">
                ${tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
}

console.log('✅ Script magazine chargé avec succès');
