// ============================================
// CONFIGURATION SUPABASE
// ============================================
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// CODE PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
            
            try {
                const { data, error } = await supabase
                    .from('Abonnés')
                    .insert([
                        {
                            nom: nom,
                            prenom: prenom,
                            email: email,
                            telephone: telephone
                        }
                    ]);
                
                if (error) throw error;
                
                alert('Inscription réussie ! Vous recevrez nos actualités par email.');
                modal.classList.add('hidden-modal');
                subscriberForm.reset();
                
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
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
                            mot_de_passe: password
                        }
                    ]);
                
                if (error) throw error;
                
                alert('Inscription réussie ! Votre compte sera activé après validation par un administrateur.');
                modal.classList.add('hidden-modal');
                creatorRegisterForm.reset();
                
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
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
    // 7. CONNEXION ADMINISTRATEUR (AMÉLIORÉE)
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
    // 8. CONNEXION CRÉATEUR (AMÉLIORÉE)
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
                window.location.href = 'dashboard.html';
                
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
});
