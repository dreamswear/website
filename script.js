// ============================================
// CODE PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ============================================
    // 1. OBSERVATEUR D'INTERSECTION (ANIMATIONS)
    // ============================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    // ============================================
    // 2. SELECTEUR DE THÈME
    // ============================================
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;

    // Fonction pour définir le thème
    const setTheme = (theme) => {
        if (theme === 'day') {
            body.classList.add('day-mode');
            localStorage.setItem('theme', 'day');
            themeButtonText.textContent = 'Clair';
        } else {
            body.classList.remove('day-mode');
            localStorage.setItem('theme', 'night');
            themeButtonText.textContent = 'Sombre';
        }
    };

    // Basculer le menu déroulant du thème
    if (themeSelectButton) {
        themeSelectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeOptions.classList.toggle('hidden-options');
            themeSelectButton.parentElement.classList.toggle('open');
        });
    }

    // Définir le thème depuis le menu déroulant
    if (themeOptions) {
        themeOptions.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                const selectedTheme = e.target.dataset.theme;
                setTheme(selectedTheme);
                themeOptions.classList.add('hidden-options');
                themeSelectButton.parentElement.classList.remove('open');
            }
        });
    }
    
    // Fermer le menu déroulant en cliquant à l'extérieur
    document.addEventListener('click', () => {
        if (themeOptions && !themeOptions.classList.contains('hidden-options')) {
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });

    // Vérifier le thème sauvegardé dans localStorage au chargement
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Thème par défaut si aucun n'est sauvegardé
        setTheme('night');
    }

    // ============================================
    // 3. MODAL D'ABONNEMENT
    // ============================================
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    const closeModalButton = modal ? modal.querySelector('.close-modal') : null;
    const tabLinks = modal ? modal.querySelectorAll('.tab-link') : [];
    const tabContents = modal ? modal.querySelectorAll('.tab-content') : [];

    const openModal = () => modal.classList.remove('hidden-modal');
    const closeModal = () => modal.classList.add('hidden-modal');

    if (subscribeLink) {
        subscribeLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
            closeModal();
        }
    });

    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            const target = document.getElementById(targetId);

            tabLinks.forEach(link => {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            target.classList.add('active');
        });
    });

    // ============================================
    // 4. FORMULAIRES D'INSCRIPTION (DANS LE MODAL)
    // ============================================
    
    // Gestion de l'inscription abonné
    const subscriberForm = document.getElementById('subscriber-form-element');
    if (subscriberForm) {
        subscriberForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('sub-nom').value.trim();
            const prenom = document.getElementById('sub-prenom').value.trim();
            const email = document.getElementById('sub-email').value.trim();
            const telephone = document.getElementById('sub-tel').value.trim();
            
            console.log('📝 Tentative inscription abonné:', email);
            
            try {
                const { data, error } = await supabase
                    .from('Abonnés')  // Note: 'a' minuscule
                    .insert([
                        {
                            nom: nom,
                            prenom: prenom,
                            email: email,
                            telephone: telephone
                        }
                    ]);
                
                if (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                    return;
                }
                
                console.log('✅ Inscription réussie!', data);
                alert('Inscription réussie ! Vous recevrez nos actualités par email.');
                modal.classList.add('hidden-modal');
                subscriberForm.reset();
                
            } catch (error) {
                console.error('💥 Erreur d\'inscription:', error);
                alert('Une erreur est survenue lors de l\'inscription.');
            }
        });
    }

    // Gestion de l'inscription créateur
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
            
            console.log('🎨 Tentative inscription créateur:', marque);
            
            try {
                const { data, error } = await supabase
                    .from('créateurs')
                    .insert([
                        {
                            nom: nom,
                            prenom: prenom,
                            nom_marque: marque,
                            domaine: domaine,
                            email: email,
                            telephone: telephone,
                            mot_de_passe: password,
                            statut: 'pending'
                        }
                    ]);
                
                if (error) {
                    console.error('❌ Erreur inscription:', error);
                    alert('Erreur: ' + error.message);
                    return;
                }
                
                console.log('✅ Inscription créateur réussie!', data);
                alert('Inscription réussie ! Votre compte sera activé après validation par un administrateur.');
                modal.classList.add('hidden-modal');
                creatorRegisterForm.reset();
                
            } catch (error) {
                console.error('💥 Erreur d\'inscription:', error);
                alert('Une erreur est survenue lors de l\'inscription.');
            }
        });
    }

    // ============================================
    // 5. MENU DÉROULANT PRINCIPAL
    // ============================================
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
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
    }

    // ============================================
    // 6. FENÊTRE D'AUTHENTIFICATION (ADMIN/CRÉATEURS)
    // ============================================
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = authModal ? authModal.querySelector('.close-auth-modal') : null;
    const authTabs = authModal ? authModal.querySelectorAll('.auth-tab') : [];
    const adminForm = document.getElementById('admin-form');
    const creatorForm = document.getElementById('creator-form');
    const adminError = document.getElementById('admin-error');
    const creatorError = document.getElementById('creator-error');

    // Ouvrir la fenêtre d'authentification
    if (authBtn && authModal) {
        authBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fermer la fenêtre d'authentification
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', function() {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            if (adminError) adminError.style.display = 'none';
            if (creatorError) creatorError.style.display = 'none';
            if (adminForm) adminForm.reset();
            if (creatorForm) creatorForm.reset();
        });
    }

    // Fermer en cliquant à l'extérieur
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                if (adminError) adminError.style.display = 'none';
                if (creatorError) creatorError.style.display = 'none';
                if (adminForm) adminForm.reset();
                if (creatorForm) creatorForm.reset();
            }
        });
    }

    // Gestion des onglets d'authentification
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const authType = this.getAttribute('data-auth-type');
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (authType === 'admin') {
                if (adminForm) adminForm.classList.add('active');
            } else {
                if (creatorForm) creatorForm.classList.add('active');
            }
            
            if (adminError) adminError.style.display = 'none';
            if (creatorError) creatorError.style.display = 'none';
        });
    });

    // ============================================
    // 7. CONNEXION ADMINISTRATEUR (CORRIGÉE)
    // ============================================
    if (adminForm) {
        adminForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('admin-nom').value.trim();
            const password = document.getElementById('admin-password').value;
            
            console.log('🔐 Tentative connexion admin:', nom);
            
            try {
                // Vérification dans la table administrateurs
                const { data, error } = await supabase
                    .from('administrateurs')
                    .select('*')
                    .eq('nom', nom)
                    .eq('mot_de_passe', password)
                    .single();
                
                console.log('📊 Résultat:', { data: !!data, error: error?.message });
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error.message);
                    if (adminError) {
                        adminError.textContent = 'Erreur technique: ' + error.message;
                        adminError.style.display = 'block';
                    }
                    return;
                }
                
                if (!data) {
                    console.log('⚠️ Aucun admin trouvé');
                    if (adminError) {
                        adminError.textContent = 'Nom d\'administrateur ou mot de passe incorrect';
                        adminError.style.display = 'block';
                    }
                    return;
                }
                
                console.log('✅ Connexion réussie! Admin:', data);
                
                // Connexion réussie
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminId', data.id);
                sessionStorage.setItem('adminName', data.nom);
                sessionStorage.setItem('adminEmail', data.email);
                
                // Redirection vers la page d'administration
                window.location.href = 'admin.html';
                
            } catch (error) {
                console.error('💥 Erreur de connexion:', error);
                if (adminError) {
                    adminError.textContent = 'Une erreur est survenue lors de la connexion';
                    adminError.style.display = 'block';
                }
            }
        });
    }

    // ============================================
    // 8. CONNEXION CRÉATEUR (CORRIGÉE)
    // ============================================
    if (creatorForm) {
        creatorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const brand = document.getElementById('creator-brand').value.trim();
            const password = document.getElementById('creator-password').value;
            
            console.log('🎨 Tentative connexion créateur:', brand);
            
            try {
                // Vérification dans la table créateurs
                const { data, error } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('nom_marque', brand)
                    .eq('mot_de_passe', password)
                    .eq('statut', 'actif')
                    .single();
                
                console.log('📊 Résultat:', { data: !!data, error: error?.message });
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error.message);
                    if (creatorError) {
                        creatorError.textContent = 'Erreur technique: ' + error.message;
                        creatorError.style.display = 'block';
                    }
                    return;
                }
                
                if (!data) {
                    console.log('⚠️ Aucun créateur trouvé');
                    if (creatorError) {
                        creatorError.textContent = 'Marque ou mot de passe incorrect';
                        creatorError.style.display = 'block';
                    }
                    return;
                }
                
                console.log('✅ Connexion créateur réussie!', data);
                
                // Connexion réussie
                sessionStorage.setItem('creatorLoggedIn', 'true');
                sessionStorage.setItem('creatorId', data.id);
                sessionStorage.setItem('creatorBrand', data.nom_marque);
                
                // Redirection vers le dashboard créateur
                window.location.href = 'dashboard-home.html';
                
            } catch (error) {
                console.error('💥 Erreur de connexion:', error);
                if (creatorError) {
                    creatorError.textContent = 'Une erreur est survenue lors de la connexion';
                    creatorError.style.display = 'block';
                }
            }
        });
    }

    // ============================================
    // 9. GESTION DES ÉVÉNEMENTS CLAVIER
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Échap pour fermer la fenêtre d'authentification
        if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            if (adminError) adminError.style.display = 'none';
            if (creatorError) creatorError.style.display = 'none';
            if (adminForm) adminForm.reset();
            if (creatorForm) creatorForm.reset();
        }
        
        // Échap pour fermer le modal d'abonnement
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
            closeModal();
        }
    });

    // ============================================
    // 10. EMPÊCHER LA SOUMISSION PAR DÉFAUT DES AUTRES FORMULAIRES
    // ============================================
    const otherForms = document.querySelectorAll('form:not(#subscriber-form-element):not(#creator-register-form):not(#admin-form):not(#creator-form)');
    otherForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Formulaire soumis avec succès ! (démonstration)');
            form.reset();
        });
    });

    // ============================================
    // 11. GESTION DES CRÉATEURS POUR L'ADMINISTRATION
    // ============================================
    const pendingCreatorsDiv = document.getElementById('pendingCreators');
    const approvedCreatorsDiv = document.getElementById('approvedCreators');
    
    if (pendingCreatorsDiv && approvedCreatorsDiv) {
        console.log('🔄 Page admin détectée');
        
        // Vérifier la connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        // Charger les données
        loadAllCreators();
        
        async function loadAllCreators() {
            console.log('🔄 Chargement créateurs...');
            
            // Afficher message temporaire
            pendingCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            approvedCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            
            try {
                // Charger les créateurs en attente
                const { data: pendingData, error: pendingError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'pending')
                    .order('created_at', { ascending: false });
                
                if (pendingError) {
                    console.error('❌ Erreur pending:', pendingError);
                    pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${pendingError.message}</div>`;
                } else if (!pendingData || pendingData.length === 0) {
                    pendingCreatorsDiv.innerHTML = '<div class="empty-message">Aucune demande en attente</div>';
                } else {
                    displayCreators(pendingData, pendingCreatorsDiv, 'pending');
                    document.getElementById('pendingCount').textContent = pendingData.length;
                }
                
                // Charger les créateurs approuvés
                const { data: approvedData, error: approvedError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'actif')
                    .order('created_at', { ascending: false });
                
                if (approvedError) {
                    console.error('❌ Erreur approved:', approvedError);
                    approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${approvedError.message}</div>`;
                } else if (!approvedData || approvedData.length === 0) {
                    approvedCreatorsDiv.innerHTML = '<div class="empty-message">Aucun créateur approuvé</div>';
                } else {
                    displayCreators(approvedData, approvedCreatorsDiv, 'approved');
                    document.getElementById('approvedCount').textContent = approvedData.length;
                }
                
            } catch (error) {
                console.error('💥 Erreur générale:', error);
                pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
                approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
            }
        }
        
        function displayCreators(creators, container, status) {
            let html = '';
            
            creators.forEach(creator => {
                const date = creator.created_at 
                    ? new Date(creator.created_at).toLocaleDateString('fr-FR')
                    : 'Date inconnue';
                
                html += `
                    <div class="creator-card">
                        <h3>${creator.nom_marque || 'Sans nom'}</h3>
                        <p><strong>Contact :</strong> ${creator.prenom || ''} ${creator.nom || ''}</p>
                        <p><strong>Email :</strong> ${creator.email || 'Non fourni'}</p>
                        <p><strong>Téléphone :</strong> ${creator.telephone || 'Non fourni'}</p>
                        <p><strong>Domaine :</strong> ${creator.domaine || 'Non spécifié'}</p>
                        <p><strong>Date :</strong> ${date}</p>
                        <p><strong>Statut :</strong> ${creator.statut}</p>
                `;
                
                if (status === 'pending') {
                    html += `
                        <div class="card-actions">
                            <button class="action-btn approve-btn" onclick="approveCreator(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                                Approuver
                            </button>
                            <button class="action-btn reject-btn" onclick="rejectCreator(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')">
                                Refuser
                            </button>
                        </div>
                    `;
                }
                
                html += `</div>`;
            });
            
            container.innerHTML = html;
        }
        
        // Fonctions globales
        window.approveCreator = async function(id, brandName) {
            if (!confirm(`Approuver "${brandName}" ?`)) return;
            
            try {
                const { error } = await supabase
                    .from('créateurs')
                    .update({ 
                        statut: 'actif',
                        approved_at: new Date().toISOString()
                    })
                    .eq('id', id);
                
                if (error) throw error;
                
                alert(`"${brandName}" approuvé`);
                loadAllCreators();
                
            } catch (error) {
                alert('Erreur : ' + error.message);
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
                
                alert(`"${brandName}" refusé`);
                loadAllCreators();
                
            } catch (error) {
                alert('Erreur : ' + error.message);
            }
        };
    }
    
    // ============================================
    // 12. FONCTIONS DE CHARGEMENT POUR TOUTES LES PAGES
    // ============================================
    
    // Fonction pour charger les articles de Coulisses
    window.loadCoulissesArticles = async function() {
        try {
            console.log('🔄 Chargement des articles Coulisses...');
            
            // Charger l'article à la une
            const { data: featuredData, error: featuredError } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'coulisses')
                .eq('statut', 'publié')
                .eq('a_la_une', true)
                .order('date_publication', { ascending: false })
                .limit(1);
            
            if (featuredError) throw featuredError;
            
            // Charger les autres articles
            const { data: articlesData, error: articlesError } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'coulisses')
                .eq('statut', 'publié')
                .neq('a_la_une', true)
                .order('date_publication', { ascending: false })
                .limit(6);
            
            if (articlesError) throw articlesError;
            
            // Afficher l'article à la une
            const featuredContainer = document.getElementById('featured-article');
            if (featuredData && featuredData.length > 0) {
                const article = featuredData[0];
                featuredContainer.innerHTML = `
                    <img src="${article.image_url || 'https://placehold.co/600x400?text=COULISSES'}" 
                         alt="${article.titre_fr}"
                         class="featured-image"
                         onerror="this.src='https://placehold.co/600x400?text=COULISSES'">
                    <div class="featured-content">
                        <span class="category">COULISSES</span>
                        <h2>${article.titre_fr}</h2>
                        <p>${article.contenu_fr ? article.contenu_fr.substring(0, 200) + '...' : 'Découvrez cet article exclusif.'}</p>
                        <div class="featured-meta">
                            <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            <span>👤 ${article.auteur || 'Rédaction'}</span>
                            <span>⏱️ ${article.temps_lecture || '5 min'}</span>
                        </div>
                        <a href="article.html?id=${article.id}" class="featured-link">Lire l'article</a>
                    </div>
                `;
            }
            
            // Afficher les autres articles
            const articlesContainer = document.getElementById('articles-list');
            if (articlesData && articlesData.length > 0) {
                articlesContainer.innerHTML = articlesData.map(article => `
                    <div class="article-card">
                        <img src="${article.image_url || 'https://placehold.co/400x200?text=ARTICLE'}" 
                             alt="${article.titre_fr}"
                             onerror="this.src='https://placehold.co/400x200?text=ARTICLE'">
                        <div class="article-card-content">
                            <span class="category">COULISSES</span>
                            <h3>${article.titre_fr}</h3>
                            <p>${article.contenu_fr ? article.contenu_fr.substring(0, 100) + '...' : ''}</p>
                            <div class="card-meta">
                                <span>${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                                <a href="article.html?id=${article.id}" class="read-more">Lire →</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                articlesContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                        <p style="color: var(--text-secondary);">Aucun article disponible pour le moment.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erreur chargement articles Coulisses:', error);
            const container = document.getElementById('articles-list') || document.getElementById('featured-article');
            if (container) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                        <p>Erreur de chargement des articles. Veuillez réessayer.</p>
                    </div>
                `;
            }
        }
    };
    
    // Fonction pour charger les Tendances
    window.loadTrends = async function() {
        const container = document.getElementById('trends-container');
        if (!container) return;
        
        try {
            console.log('🔄 Chargement des tendances...');
            
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'tendances')
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false })
                .limit(6);
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">
                            Aucun article sur les tendances pour le moment.
                        </p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(article => `
                <div class="trend-card">
                    <img src="${article.image_url || 'https://placehold.co/400x200?text=TRENDS'}" 
                         alt="${article.titre_fr}"
                         onerror="this.src='https://placehold.co/400x200?text=TRENDS'">
                    <div class="trend-card-content">
                        <span class="trend-tag">${article.categorie || 'TENDANCE'}</span>
                        <h3>${article.titre_fr}</h3>
                        <p>${article.contenu_fr ? article.contenu_fr.substring(0, 120) + '...' : ''}</p>
                        <div class="trend-meta">
                            <span>${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            <a href="article.html?id=${article.id}" class="trend-link">Découvrir →</a>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Erreur chargement tendances:', error);
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #dc3545;">
                    <p>Erreur de chargement des tendances. Veuillez réessayer.</p>
                </div>
            `;
        }
    };
    
    // Fonction pour charger les Visages
    window.loadVisages = async function(filter = 'all') {
        const container = document.getElementById('visages-container');
        if (!container) return;
        
        try {
            console.log('🔄 Chargement des visages...');
            
            let query = supabase
                .from('visages')
                .select('*')
                .eq('statut', 'actif')
                .order('date_featured', { ascending: false });
            
            // Appliquer le filtre si nécessaire
            if (filter !== 'all') {
                const domainMap = {
                    'haute-couture': 'Haute couture',
                    'streetwear': 'Streetwear',
                    'bijoux': 'Bijoux',
                    'accessoires': 'Accessoires'
                };
                query = query.eq('domaine', domainMap[filter] || filter);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">
                            Aucun créateur ne correspond à ce filtre pour le moment.
                        </p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(visage => `
                <div class="visage-card">
                    <img src="${visage.photo_url || 'https://placehold.co/400x250?text=DREAMSWEAR'}" 
                         alt="${visage.nom_marque}"
                         class="visage-image"
                         onerror="this.src='https://placehold.co/400x250?text=DREAMSWEAR'">
                    <div class="visage-content">
                        <span class="visage-domain">${visage.domaine || 'Mode'}</span>
                        <h3>${visage.nom_marque}</h3>
                        <p>${visage.biographie_fr ? visage.biographie_fr.substring(0, 150) + '...' : 'Découvrez ce créateur talentueux.'}</p>
                        <a href="visage-detail.html?id=${visage.id}" class="visage-link">Voir le portrait</a>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Erreur chargement visages:', error);
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #dc3545;">
                    <p>Erreur de chargement des créateurs. Veuillez réessayer.</p>
                </div>
            `;
        }
    };
    
    // Fonction pour charger les Découvertes
    window.loadDiscoveries = async function() {
        const container = document.getElementById('discoveries-container');
        if (!container) return;
        
        try {
            console.log('🔄 Chargement des découvertes...');
            
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'decouvertes')
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false })
                .limit(6);
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">
                            Aucune découverte pour le moment.
                        </p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(article => {
                const authorInitial = article.auteur ? article.auteur.charAt(0).toUpperCase() : 'A';
                
                return `
                    <div class="discovery-card">
                        <img src="${article.image_url || 'https://placehold.co/400x200?text=DECOUVERTE'}" 
                             alt="${article.titre_fr}"
                             class="discovery-image"
                             onerror="this.src='https://placehold.co/400x200?text=DECOUVERTE'">
                        <div class="discovery-content">
                            <span class="discovery-tag">${article.categorie || 'DÉCOUVERTE'}</span>
                            <h3>${article.titre_fr}</h3>
                            <p>${article.contenu_fr ? article.contenu_fr.substring(0, 150) + '...' : ''}</p>
                            <div class="discovery-meta">
                                <div class="discovery-author">
                                    <div class="author-avatar">${authorInitial}</div>
                                    <span>${article.auteur || 'Rédaction'}</span>
                                </div>
                                <a href="article.html?id=${article.id}" class="discovery-link">Lire →</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Erreur chargement découvertes:', error);
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #dc3545;">
                    <p>Erreur de chargement des découvertes. Veuillez réessayer.</p>
                </div>
            `;
        }
    };
    
    // Fonction pour charger les Événements (Culture/Agenda)
    window.loadEvents = async function() {
        const container = document.getElementById('events-container');
        if (!container) return;
        
        try {
            console.log('🔄 Chargement des événements...');
            
            const { data, error } = await supabase
                .from('evenements')
                .select('*')
                .eq('statut', 'à venir')
                .order('date_debut', { ascending: true })
                .limit(6);
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">
                            Aucun événement à venir pour le moment.
                        </p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(event => {
                const eventDate = new Date(event.date_debut);
                const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                                   'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                
                return `
                    <div class="event-card">
                        <div class="event-date">
                            <div class="day">${eventDate.getDate()}</div>
                            <div class="month">${monthNames[eventDate.getMonth()]}</div>
                        </div>
                        <div class="event-content">
                            <span class="event-type">${event.type || 'Événement'}</span>
                            <h3>${event.titre}</h3>
                            <p>${event.description ? event.description.substring(0, 100) + '...' : ''}</p>
                            <div class="event-details">
                                <span><i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('fr-FR')}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${event.lieu || 'Lieu à préciser'}</span>
                                <span><i class="fas fa-clock"></i> ${event.heure || 'Horaire à venir'}</span>
                            </div>
                            <a href="evenement.html?id=${event.id}" class="event-link">Plus d'informations</a>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Erreur chargement événements:', error);
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #dc3545;">
                    <p>Erreur de chargement des événements. Veuillez réessayer.</p>
                </div>
            `;
        }
    };
    
    // Fonction pour configurer les filtres
    window.setupFilters = function() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                if (typeof loadVisages === 'function') {
                    loadVisages(filter);
                }
            });
        });
    };
    
    // Fonction pour configurer les catégories
    window.setupCategoryFilters = function() {
        const categoryElements = document.querySelectorAll('[data-category]');
        categoryElements.forEach(el => {
            el.addEventListener('click', function() {
                const category = this.dataset.category;
                alert(`Filtre: ${category} - Fonctionnalité à implémenter`);
            });
        });
    };
    
    // ============================================
    // 13. INITIALISATION AUTOMATIQUE BASÉE SUR LA PAGE
    // ============================================
    window.initPageData = function() {
        console.log('🔄 Initialisation des données de la page...');
        
        // Détection basée sur l'ID des conteneurs
        if (document.getElementById('articles-list') && document.getElementById('featured-article')) {
            console.log('📄 Page Coulisses détectée');
            loadCoulissesArticles();
        }
        
        if (document.getElementById('trends-container')) {
            console.log('📈 Page Tendances détectée');
            loadTrends();
        }
        
        if (document.getElementById('visages-container')) {
            console.log('👤 Page Visages détectée');
            loadVisages();
            setupFilters();
        }
        
        if (document.getElementById('discoveries-container')) {
            console.log('🔍 Page Découvertes détectée');
            loadDiscoveries();
            setupCategoryFilters();
        }
        
        if (document.getElementById('events-container')) {
            console.log('📅 Page Culture/Agenda détectée');
            loadEvents();
        }
    };
    
    // ============================================
    // 14. EXÉCUTION AUTOMATIQUE POUR LES PAGES DE CONTENU
    // ============================================
    // Exécuter l'initialisation automatiquement
    setTimeout(() => {
        initPageData();
    }, 100);
});
