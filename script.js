document.addEventListener('DOMContentLoaded', () => {

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
    // 4. FORMULAIRE CRÉATEUR (DANS LE MODAL)
    // ============================================
    const creatorForm = document.getElementById('creator-form-element');
    if (creatorForm) {
        creatorForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(creatorForm);
            const submission = {
                id: Date.now(), // ID unique simple
                nom: formData.get('nom'),
                prenom: formData.get('prenom'),
                email: formData.get('email'),
                telephone: formData.get('telephone'),
                marque: formData.get('marque'),
                domaine: formData.get('domaine'),
                status: 'pending',
                submissionDate: new Date().toISOString()
            };

            // Obtenir les soumissions existantes ou initialiser un nouveau tableau
            const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions')) || [];
            pendingSubmissions.push(submission);
            localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));

            // Afficher la confirmation
            creatorForm.innerHTML = `<p>Merci pour votre soumission ! Votre demande est en cours d'examen. Nous vous contacterons bientôt.</p>`;
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
    // 6. FENÊTRE CRÉATEURS (CONNEXION)
    // ============================================
    const creatorBtn = document.getElementById('creator-login-btn');
    const creatorModal = document.getElementById('creator-modal');
    const closeCreatorModal = creatorModal ? creatorModal.querySelector('.close-creator-modal') : null;
    const creatorLoginForm = document.getElementById('creator-login-form');
    const creatorLoginError = document.getElementById('creator-login-error');

    // Liste des marques autorisées
    const authorizedBrands = {
        'Elyra': 'elyra2024',
        'Dreamwear': 'dreamwear2024',
        'ModeParis': 'paris2024',
        'StyleLuxe': 'luxe2024'
    };

    // Ouvrir la fenêtre créateurs
    if (creatorBtn && creatorModal) {
        creatorBtn.addEventListener('click', function(e) {
            e.preventDefault();
            creatorModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fermer la fenêtre créateurs
    if (closeCreatorModal) {
        closeCreatorModal.addEventListener('click', function() {
            creatorModal.classList.remove('active');
            document.body.style.overflow = '';
            if (creatorLoginError) creatorLoginError.style.display = 'none';
            if (creatorLoginForm) creatorLoginForm.reset();
        });
    }

    // Fermer en cliquant à l'extérieur
    if (creatorModal) {
        creatorModal.addEventListener('click', function(e) {
            if (e.target === creatorModal) {
                creatorModal.classList.remove('active');
                document.body.style.overflow = '';
                if (creatorLoginError) creatorLoginError.style.display = 'none';
                if (creatorLoginForm) creatorLoginForm.reset();
            }
        });
    }

    // Gestion de la connexion créateurs
    if (creatorLoginForm) {
        creatorLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const brand = document.getElementById('creator-brand').value.trim();
            const password = document.getElementById('creator-password').value;
            
            // Vérification simple
            if (authorizedBrands[brand] && authorizedBrands[brand] === password) {
                // Connexion réussie
                if (creatorLoginError) creatorLoginError.style.display = 'none';
                
                // Stocker la session
                sessionStorage.setItem('creatorLoggedIn', 'true');
                sessionStorage.setItem('creatorBrand', brand);
                
                // Redirection vers le dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Échec de connexion
                if (creatorLoginError) creatorLoginError.style.display = 'block';
                document.getElementById('creator-password').value = '';
            }
        });
    }

    // ============================================
    // 7. GESTION DES ÉVÉNEMENTS CLAVIER
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Échap pour fermer la fenêtre créateurs
        if (e.key === 'Escape' && creatorModal && creatorModal.classList.contains('active')) {
            creatorModal.classList.remove('active');
            document.body.style.overflow = '';
            if (creatorLoginError) creatorLoginError.style.display = 'none';
            if (creatorLoginForm) creatorLoginForm.reset();
        }
        
        // Échap pour fermer le modal d'abonnement
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
            closeModal();
        }
    });

    // ============================================
    // 8. EMPÊCHER LA SOUMISSION PAR DÉFAUT DES FORMULAIRES
    // ============================================
    const otherForms = document.querySelectorAll('form:not(#creator-form-element):not(#creator-login-form)');
    otherForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Pour le formulaire d'abonnement dans le modal
            if (form.closest('.modal-overlay')) {
                alert('Formulaire soumis avec succès ! (démonstration)');
                modal.classList.add('hidden-modal');
            } else {
                alert('Formulaire soumis avec succès ! (démonstration)');
            }
            
            form.reset();
        });
    });

});
