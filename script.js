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
     // ============================================
    // 12. DIAGNOSTIC ADMIN
    // ============================================
    const pendingCreatorsDiv = document.getElementById('pendingCreators');
    const approvedCreatorsDiv = document.getElementById('approvedCreators');
    
    if (pendingCreatorsDiv && approvedCreatorsDiv) {
        console.log('🔍 DIAGNOSTIC: Page admin détectée');
        
        // Test complet de la connexion
        async function runDiagnostic() {
            try {
                console.log('1️⃣ Test de base de Supabase...');
                
                // Test 1: Vérifier que supabase existe
                if (!supabase) {
                    console.error('❌ supabase est undefined');
                    return { success: false, message: 'Supabase non initialisé' };
                }
                
                // Test 2: Compter tous les créateurs
                console.log('2️⃣ Comptage total des créateurs...');
                const { count, error: countError } = await supabase
                    .from('créateurs')
                    .select('*', { count: 'exact', head: true });
                
                if (countError) {
                    console.error('❌ Erreur de comptage:', countError);
                    return { 
                        success: false, 
                        message: `Erreur de comptage: ${countError.message}`,
                        details: countError 
                    };
                }
                
                console.log(`✅ Total créateurs: ${count}`);
                
                // Test 3: Voir les statuts disponibles
                console.log('3️⃣ Analyse des statuts...');
                const { data: allStats, error: statsError } = await supabase
                    .from('créateurs')
                    .select('statut')
                    .limit(10);
                
                if (statsError) {
                    console.error('❌ Erreur statuts:', statsError);
                    return { 
                        success: false, 
                        message: `Erreur statuts: ${statsError.message}` 
                    };
                }
                
                const uniqueStats = [...new Set(allStats.map(c => c.statut))];
                console.log(`📊 Statuts uniques trouvés: ${uniqueStats.join(', ')}`);
                
                // Test 4: Chercher spécifiquement 'pending'
                console.log('4️⃣ Recherche créateurs "pending"...');
                const { data: pendingData, error: pendingError } = await supabase
                    .from('créateurs')
                    .select('id, nom_marque, statut, created_at')
                    .eq('statut', 'pending');
                
                if (pendingError) {
                    console.error('❌ Erreur pending:', pendingError);
                    return { 
                        success: false, 
                        message: `Erreur pending: ${pendingError.message}` 
                    };
                }
                
                console.log(`📋 Créateurs "pending" trouvés: ${pendingData.length}`);
                pendingData.forEach(c => {
                    console.log(`   - ${c.nom_marque} (${c.id}) - ${c.statut} - ${c.created_at}`);
                });
                
                // Afficher les résultats dans la page
                const diagnosticDiv = document.createElement('div');
                diagnosticDiv.id = 'diagnostic-info';
                diagnosticDiv.style.cssText = `
                    background: #e3f2fd;
                    color: #1565c0;
                    padding: 15px;
                    margin: 15px;
                    border-radius: 5px;
                    border-left: 4px solid #1976d2;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 14px;
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 300px;
                    z-index: 10000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                `;
                
                let html = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong style="color: #0d47a1;">🔍 DIAGNOSTIC</strong>
                        <button onclick="document.getElementById('diagnostic-info').remove()" 
                                style="background: none; border: none; color: #666; cursor: pointer; font-size: 16px;">
                            ×
                        </button>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>Résultats:</strong><br>
                        ✅ Supabase: Connecté<br>
                        ✅ Table: créateurs<br>
                        📊 Total: ${count} créateur(s)<br>
                        📋 Statuts: ${uniqueStats.join(', ')}<br>
                        ⏳ Pending: ${pendingData.length} créateur(s)
                    </div>
                `;
                
                if (pendingData.length > 0) {
                    html += `<div><strong>Créateurs pending:</strong><br>`;
                    pendingData.forEach(c => {
                        html += `• ${c.nom_marque || 'Sans nom'}<br>`;
                    });
                    html += `</div>`;
                }
                
                diagnosticDiv.innerHTML = html;
                document.body.appendChild(diagnosticDiv);
                
                return { 
                    success: true, 
                    count, 
                    uniqueStats, 
                    pendingCount: pendingData.length,
                    pendingData 
                };
                
            } catch (error) {
                console.error('💥 Erreur diagnostic:', error);
                return { 
                    success: false, 
                    message: `Erreur inattendue: ${error.message}` 
                };
            }
        }
        
        // Fonction pour charger les créateurs (version simplifiée)
        const loadAllCreators = async () => {
            console.log('🔄 Chargement créateurs...');
            
            try {
                // Charger pending
                const { data: pendingData, error: pendingError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'pending')
                    .order('created_at', { ascending: false });
                
                if (pendingError) {
                    throw new Error(`Pending: ${pendingError.message}`);
                }
                
                if (pendingData && pendingData.length > 0) {
                    console.log(`📊 ${pendingData.length} créateurs pending à afficher`);
                    displayCreators(pendingData, pendingCreatorsDiv, 'pending');
                    document.getElementById('pendingCount').textContent = pendingData.length;
                } else {
                    pendingCreatorsDiv.innerHTML = '<div class="empty-message">Aucune demande en attente</div>';
                    document.getElementById('pendingCount').textContent = '0';
                }
                
                // Charger approved
                const { data: approvedData, error: approvedError } = await supabase
                    .from('créateurs')
                    .select('*')
                    .eq('statut', 'actif')
                    .order('created_at', { ascending: false });
                
                if (approvedError) {
                    throw new Error(`Approved: ${approvedError.message}`);
                }
                
                if (approvedData && approvedData.length > 0) {
                    console.log(`✅ ${approvedData.length} créateurs approuvés à afficher`);
                    displayCreators(approvedData, approvedCreatorsDiv, 'approved');
                    document.getElementById('approvedCount').textContent = approvedData.length;
                } else {
                    approvedCreatorsDiv.innerHTML = '<div class="empty-message">Aucun créateur approuvé</div>';
                    document.getElementById('approvedCount').textContent = '0';
                }
                
            } catch (error) {
                console.error('💥 Erreur chargement:', error);
                pendingCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
                approvedCreatorsDiv.innerHTML = `<div class="empty-message">Erreur: ${error.message}</div>`;
            }
        };
        
        // Fonction d'affichage (très simple)
        function displayCreators(creators, container, status) {
            let html = '';
            
            creators.forEach(creator => {
                const date = creator.created_at 
                    ? new Date(creator.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    : 'Date inconnue';
                
                html += `
                    <div class="creator-card" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #333;">${creator.nom_marque || 'Sans nom de marque'}</h3>
                        <p><strong>Contact :</strong> ${creator.prenom || ''} ${creator.nom || ''}</p>
                        <p><strong>Email :</strong> ${creator.email || 'Non fourni'}</p>
                        <p><strong>Téléphone :</strong> ${creator.telephone || 'Non fourni'}</p>
                        <p><strong>Domaine :</strong> ${creator.domaine || 'Non spécifié'}</p>
                        <p><strong>Date :</strong> ${date}</p>
                        <p><strong>Statut :</strong> ${status === 'pending' ? '⏳ En attente' : '✅ Approuvé'}</p>
                `;
                
                if (status === 'pending') {
                    html += `
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <button onclick="adminApprove(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')"
                                    style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; flex: 1;">
                                ✅ Approuver
                            </button>
                            <button onclick="adminReject(${creator.id}, '${(creator.nom_marque || '').replace(/'/g, "\\'")}')"
                                    style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; flex: 1;">
                                ❌ Refuser
                            </button>
                        </div>
                    `;
                }
                
                html += `</div>`;
            });
            
            container.innerHTML = html;
        }
        
        // Fonctions globales
        window.adminApprove = async function(id, brandName) {
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
                
                alert(`✅ "${brandName}" approuvé !`);
                await loadAllCreators();
                
            } catch (error) {
                alert(`❌ Erreur: ${error.message}`);
            }
        };
        
        window.adminReject = async function(id, brandName) {
            if (!confirm(`Refuser "${brandName}" ?`)) return;
            
            try {
                const { error } = await supabase
                    .from('créateurs')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert(`❌ "${brandName}" refusé.`);
                await loadAllCreators();
                
            } catch (error) {
                alert(`❌ Erreur: ${error.message}`);
            }
        };
        
        // Vérifier la connexion admin
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true') {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter.');
            window.location.href = 'index.html';
            return;
        }
        
        // Exécuter le diagnostic d'abord
        console.log('🚀 Lancement du diagnostic...');
        setTimeout(async () => {
            const result = await runDiagnostic();
            console.log('📋 Résultat diagnostic:', result);
            
            // Si le diagnostic réussit, charger les créateurs
            if (result.success) {
                await loadAllCreators();
            } else {
                pendingCreatorsDiv.innerHTML = `<div class="empty-message">${result.message}</div>`;
                approvedCreatorsDiv.innerHTML = `<div class="empty-message">${result.message}</div>`;
            }
        }, 1000);
    }
});
