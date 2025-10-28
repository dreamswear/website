document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for animations
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

    // Theme switcher logic
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;

    // Function to set the theme
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

    // Toggle theme dropdown
    themeSelectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeOptions.classList.toggle('hidden-options');
        themeSelectButton.parentElement.classList.toggle('open');
    });

    // Set theme from dropdown
    themeOptions.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const selectedTheme = e.target.dataset.theme;
            setTheme(selectedTheme);
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (!themeOptions.classList.contains('hidden-options')) {
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });

    // Check for saved theme in localStorage on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Optional: set a default theme if none is saved
        setTheme('night'); 
    }

    // Subscription Modal Logic
    const subscribeLink = document.getElementById('subscribe-link');
    const modal = document.getElementById('subscribe-modal');
    const closeModalButton = modal.querySelector('.close-modal');
    const tabLinks = modal.querySelectorAll('.tab-link');
    const tabContents = modal.querySelectorAll('.tab-content');

    const openModal = () => modal.classList.remove('hidden-modal');
    const closeModal = () => modal.classList.add('hidden-modal');

    subscribeLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeModalButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
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

    // Creator Form Submission
    const creatorForm = document.getElementById('creator-form-element');
    creatorForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(creatorForm);
        const submission = {
            id: Date.now(), // Simple unique ID
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            marque: formData.get('marque'),
            domaine: formData.get('domaine'),
            status: 'pending',
            submissionDate: new Date().toISOString()
        };

        // Get existing submissions or initialize a new array
        const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions')) || [];
        pendingSubmissions.push(submission);
        localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));

        // Show confirmation
        creatorForm.innerHTML = `<p>Merci pour votre soumission ! Votre demande est en cours d'examen. Nous vous contacterons bientôt.</p>`;
    });
});