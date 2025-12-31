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
    // 2. SELECTEUR DE THÈME UNIFIÉ POUR TOUT LE SITE
    // ============================================
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;

    // Fonction pour définir le thème (utilisée par tout le site)
    const setTheme = (theme) => {
        if (theme === 'day') {
            body.classList.add('day-mode');
            localStorage.setItem('theme', 'day');
            if (themeButtonText) themeButtonText.textContent = 'Clair';
        } else {
            body.classList.remove('day-mode');
            localStorage.setItem('theme', 'night');
            if (themeButtonText) themeButtonText.textContent = 'Sombre';
        }
    };

    // Basculer le menu déroulant du thème
    if (themeSelectButton) {
        themeSelectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (themeOptions) {
                themeOptions.classList.toggle('hidden-options');
                themeSelectButton.parentElement.classList.toggle('open');
            }
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
    // 11. GESTION DES CRÉATEURS POUR L'ADMINISTRATION (VERSION DIAGNOSTIC)
    // ============================================
    const pendingCreatorsDiv = document.getElementById('pendingCreators');
    const approvedCreatorsDiv = document.getElementById('approvedCreators');
    
    if (pendingCreatorsDiv && approvedCreatorsDiv) {
        console.log('🔄 Page admin détectée');
        
        // TEST 1: Vérifier si Supabase est accessible
        async function testSupabaseConnection() {
            try {
                console.log('🔍 Test connexion Supabase...');
                
                // Test simple : compter tous les créateurs
                const { count, error: countError } = await supabase
                    .from('créateurs')
                    .select('*', { count: 'exact', head: true });
                
                if (countError) {
                    console.error('❌ Erreur compte:', countError);
                    alert('Erreur Supabase: ' + countError.message);
                    return false;
                }
                
                console.log(`📊 Total créateurs dans Supabase: ${count}`);
                
                // Test 2: Voir tous les statuts
                const { data: allCreators, error: allError } = await supabase
                    .from('créateurs')
                    .select('id, nom_marque, statut')
                    .order('created_at', { ascending: false });
                
                if (allError) {
                    console.error('❌ Erreur récupération:', allError);
                    return false;
                }
                
                console.log('📋 Liste complète des créateurs:', allCreators);
                
                // Afficher dans la page pour debug
                const debugDiv = document.createElement('div');
                debugDiv.style.cssText = `
                    background: #f8d7da;
                    color: #721c24;
                    padding: 15px;
                    margin: 15px;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 12px;
                `;
                
                let debugHtml = '<strong>DEBUG Supabase:</strong><br>';
                debugHtml += `Total créateurs: ${count}<br>`;
                debugHtml += '<strong>Statuts trouvés:</strong><br>';
                
                if (allCreators && allCreators.length > 0) {
                    allCreators.forEach(creator => {
                        debugHtml += `- ${creator.nom_marque} (ID: ${creator.id}) → Statut: <strong>${creator.statut}</strong><br>`;
                    });
                } else {
                    debugHtml += 'Aucun créateur trouvé<br>';
                }
                
                debugDiv.innerHTML = debugHtml;
                document.body.prepend(debugDiv);
                
                return true;
                
            } catch (error) {
                console.error('💥 Erreur test:', error);
                alert('Erreur test: ' + error.message);
                return false;
            }
        }
        
        // Fonction principale corrigée
        const loadAllCreators = async () => {
            console.log('🔄 Chargement créateurs...');
            
            // Afficher message temporaire
            pendingCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            approvedCreatorsDiv.innerHTML = '<div class="empty-message">Chargement en cours...</div>';
            
            // Tester la connexion d'abord
            const connected = await testSupabaseConnection();
            if (!connected) {
                pendingCreatorsDiv.innerHTML = '<div class="empty-message">❌ Impossible de se connecter à la base de données</div>';
                approvedCreatorsDiv.innerHTML = '<div class="empty-message">❌ Impossible de se connecter à la base de données</div>';
                return;
            }
            
            // Charger les créateurs en attente
            try {
                const { data: pendingData, error: pendingError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'pending')  // VÉRIFIEZ ICI LE STATUT EXACT
                    .order('created_at', { ascending: false });
                
                console.log('📋 Données pending:', pendingData);
                console.log('❌ Erreur pending:', pendingError);
                
                if (pendingError) {
                    pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${pendingError.message}</div>`;
                } else if (!pendingData || pendingData.length === 0) {
                    pendingCreatorsDiv.innerHTML = '<div class="empty-message">Aucune demande avec statut "pending"</div>';
                } else {
                    displayCreators(pendingData, pendingCreatorsDiv, 'pending');
                    document.getElementById('pendingCount').textContent = pendingData.length;
                }
                
            } catch (error) {
                console.error('💥 Erreur pending:', error);
                pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
            }
            
            // Charger les créateurs approuvés
            try {
                const { data: approvedData, error: approvedError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'actif')  // VÉRIFIEZ ICI LE STATUT EXACT
                    .order('created_at', { ascending: false });
                
                console.log('✅ Données approved:', approvedData);
                console.log('❌ Erreur approved:', approvedError);
                
                if (approvedError) {
                    approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${approvedError.message}</div>`;
                } else if (!approvedData || approvedData.length === 0) {
                    approvedCreatorsDiv.innerHTML = '<div class="empty-message">Aucun créateur avec statut "actif"</div>';
                } else {
                    displayCreators(approvedData, approvedCreatorsDiv, 'approved');
                    document.getElementById('approvedCount').textContent = approvedData.length;
                }
                
            } catch (error) {
                console.error('💥 Erreur approved:', error);
                approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
            }
        };
        
        // Fonction d'affichage
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
                        <p><strong>Statut dans BD :</strong> ${creator.statut}</p>
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
                await loadAllCreators();
                
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
                await loadAllCreators();
                
            } catch (error) {
                alert('Erreur : ' + error.message);
            }
        };
        
        // Vérifier la connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        // Charger les données
        setTimeout(loadAllCreators, 1000);
    }
});

// ============================================
// DASHBOARD - RESPECTANT L'APPARENCE UNIFORME
// ============================================

class DashboardManager {
    constructor() {
        this.creatorId = null;
        this.creatorBrand = null;
        this.currentPage = this.getCurrentPage();
        
        this.init();
    }
    
    // Initialisation principale
    init() {
        if (!this.checkAuthentication()) return;
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
    
    // Gestion du thème (utilise le même système que le site principal)
    setupTheme() {
        // Le dashboard utilise le même thème que le site principal
        // via la classe day-mode sur le body
        console.log('Dashboard utilise le thème unifié du site');
        
        // Créer un sélecteur de thème simple si besoin
        this.createSimpleThemeSelector();
    }
    
    createSimpleThemeSelector() {
        // Vérifier si un sélecteur de thème existe déjà
        if (document.querySelector('.dashboard-theme-selector')) return;
        
        const themeSelector = document.createElement('div');
        themeSelector.className = 'dashboard-theme-selector';
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
            
            // Récupérer la fonction setTheme du site principal
            const setTheme = (theme) => {
                if (theme === 'day') {
                    document.body.classList.add('day-mode');
                    localStorage.setItem('theme', 'day');
                } else {
                    document.body.classList.remove('day-mode');
                    localStorage.setItem('theme', 'night');
                }
                
                // Mettre à jour les boutons actifs
                themeSelector.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const activeBtn = themeSelector.querySelector(`[data-theme="${theme}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            };
            
            // Définir le bouton actif selon le thème actuel
            const currentTheme = document.body.classList.contains('day-mode') ? 'day' : 'night';
            const activeBtn = themeSelector.querySelector(`[data-theme="${currentTheme}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            
            // Gestion des clics
            themeSelector.querySelectorAll('.theme-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.theme;
                    setTheme(theme);
                });
            });
        }
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
        
        // Style de la notification adapté au thème
        const isDayMode = document.body.classList.contains('day-mode');
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
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
                background: ${isDayMode ? 'white' : '#2a2a2a'};
                color: ${isDayMode ? '#333' : 'white'};
                border-left: 4px solid;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left-color: #28a745;
            }
            
            .notification-error {
                border-left-color: #dc3545;
            }
            
            .notification-info {
                border-left-color: #17a2b8;
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
    // Initialiser le dashboard si on est sur une page dashboard
    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard') || currentPath.includes('admin')) {
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
    }
});

// Fonctions globales accessibles depuis le HTML
window.filterProfessionals = function(category) {
    if (dashboardManager) dashboardManager.filterProfessionals(category);
};

window.searchProfessionals = function(query) {
    if (dashboardManager) dashboardManager.searchProfessionals(query);
};
