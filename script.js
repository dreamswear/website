// ============================================
// SCRIPT PRINCIPAL CENTRALISÉ - VERSION RENFORCÉE AVEC OPTION "AUTRE"
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. CONFIGURATION SUPABASE
    // ============================================
    const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

    // Initialisation globale de Supabase
    let supabase;
    
    if (typeof window.supabase !== 'undefined' && window.supabase.from) {
        console.log('✅ Utilisation de Supabase existant');
        supabase = window.supabase;
    } else {
        console.log('🔄 Initialisation de Supabase...');
        
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabase = supabase;
        } else {
            console.error('❌ Bibliothèque Supabase non chargée');
            alert('Erreur: Bibliothèque Supabase non chargée. Vérifiez votre connexion internet.');
            return;
        }
    }

    // ============================================
    // 1.5 GESTION DE L'OPTION "AUTRE" POUR LE DOMAINE
    // ============================================
    const domaineSelect = document.getElementById('cre-domaine');
    const autreDomaineGroup = document.getElementById('autre-domaine-group');
    const autreDomaineInput = document.getElementById('cre-domaine-autre');

    if (domaineSelect && autreDomaineGroup && autreDomaineInput) {
        domaineSelect.addEventListener('change', function() {
            if (this.value === 'autre') {
                autreDomaineGroup.style.display = 'block';
                autreDomaineInput.required = true;
                autreDomaineInput.focus();
            } else {
                autreDomaineGroup.style.display = 'none';
                autreDomaineInput.required = false;
                autreDomaineInput.value = '';
            }
        });
    }

    // ============================================
    // 2. GESTION DE SESSION AMÉLIORÉE
    // ============================================
    const SessionManager = {
        // Vérification ULTRA flexible pour admin
        isAdmin: function() {
            console.group('🔐 VÉRIFICATION SESSION ADMIN');
            
            const sessionKeys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                sessionKeys.push(sessionStorage.key(i));
            }
            console.log('Clés session trouvées:', sessionKeys);
            
            const adminIndicators = [
                { key: 'adminLoggedIn', value: 'true' },
                { key: 'isAdmin', value: 'true' },
                { key: 'userRole', value: 'admin' },
                { key: 'role', value: 'admin' },
                { key: 'loggedIn', value: 'true' },
                { key: 'isLoggedIn', value: 'true' }
            ];
            
            for (const indicator of adminIndicators) {
                const value = sessionStorage.getItem(indicator.key);
                console.log(`${indicator.key}: ${value}`);
                if (value === indicator.value) {
                    console.log(`✅ Admin détecté via: ${indicator.key}`);
                    console.groupEnd();
                    return true;
                }
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('admin') && urlParams.get('admin') === 'true') {
                console.log('⚠️ Mode développement: accès admin via URL');
                sessionStorage.setItem('adminLoggedIn', 'true');
                console.groupEnd();
                return true;
            }
            
            console.warn('❌ Aucun marqueur admin trouvé');
            console.groupEnd();
            return false;
        },
        
        isCreator: function() {
            const creatorId = sessionStorage.getItem('creatorId');
            const hasBrand = sessionStorage.getItem('creatorBrand');
            
            console.log(`🎨 Vérification créateur: ID=${creatorId}, Marque=${hasBrand}`);
            
            return !!(creatorId && hasBrand);
        },
        
        checkAccess: function() {
            const currentPath = window.location.pathname;
            console.log(`📍 Page actuelle: ${currentPath}`);
            
            if (currentPath.includes('admin.html') || 
                currentPath.includes('Actualisation.html') ||
                currentPath.includes('manage-')) {
                
                console.log('🔒 Page ADMIN détectée');
                
                if (!this.isAdmin()) {
                    console.warn('🚫 Accès ADMIN refusé');
                    
                    if (this.isCreator()) {
                        alert('❌ Zone réservée aux administrateurs\n\nVous êtes connecté en tant que créateur. Déconnectez-vous pour accéder à cette zone.');
                        window.location.href = 'dashboard-home.html';
                    } else {
                        alert('🔒 Accès administrateur requis\n\nVeuillez vous connecter avec vos identifiants administrateur.');
                        sessionStorage.setItem('redirectAfterLogin', window.location.href);
                        window.location.href = 'admin.html';
                    }
                    return false;
                }
                
                console.log('✅ Accès ADMIN autorisé');
                return true;
            }
            
            if (currentPath.includes('dashboard-') && 
                !currentPath.includes('dashboard-management')) {
                
                console.log('🎨 Page CRÉATEUR détectée');
                
                if (!this.isCreator()) {
                    console.warn('🚫 Accès CRÉATEUR refusé');
                    
                    if (this.isAdmin()) {
                        alert('❌ Zone réservée aux créateurs\n\nVous êtes connecté en tant qu\'administrateur.');
                        window.location.href = 'dashboard-management.html';
                    } else {
                        alert('🎨 Espace créateur\n\nVeuillez vous connecter avec vos identifiants créateur.');
                        window.location.href = 'index.html';
                    }
                    return false;
                }
                
                console.log('✅ Accès CRÉATEUR autorisé');
                return true;
            }
            
            console.log('🌐 Page publique - accès libre');
            return true;
        },
        
        setAdminSession: function(username, email = '') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('userRole', 'admin');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            console.log('✅ Session admin définie pour:', username);
        },
        
        setCreatorSession: function(creatorId, brandName) {
            sessionStorage.setItem('creatorId', creatorId);
            sessionStorage.setItem('creatorBrand', brandName);
            sessionStorage.setItem('creatorLoggedIn', 'true');
            sessionStorage.setItem('loginTime', new Date().toISOString());
            console.log('✅ Session créateur définie pour:', brandName);
        },
        
        clearSession: function() {
            const keysToRemove = [
                'adminLoggedIn', 'isAdmin', 'userRole', 'username', 'email',
                'creatorId', 'creatorBrand', 'creatorLoggedIn',
                'loggedIn', 'isLoggedIn', 'role', 'loginTime'
            ];
            
            keysToRemove.forEach(key => sessionStorage.removeItem(key));
            console.log('🧹 Session nettoyée');
        }
    };
    
    window.SessionManager = SessionManager;

// ============================================
// 3. CALENDRIER DYNAMIQUE POUR LA PAGE CULTURE - VERSION AMÉLIORÉE
// ============================================

function generateCalendar(year, month) {
    const calendarElement = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('current-month');
    
    if (!calendarElement || !currentMonthElement) {
        return;
    }
    
    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Vider le calendrier
    calendarElement.innerHTML = '';
    
    // Ajouter les en-têtes des jours
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarElement.appendChild(dayHeader);
    });
    
    // Calculer le premier jour du mois (0 = Dimanche, 1 = Lundi, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Aujourd'hui
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    // Ajouter les jours vides avant le premier jour du mois
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarElement.appendChild(emptyDay);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Marquer le jour actuel
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        
        // Numéro du jour
        const daySpan = document.createElement('span');
        daySpan.textContent = day;
        dayNumber.appendChild(daySpan);
        
        // Conteneur pour les indicateurs d'événements
        const eventIndicator = document.createElement('div');
        eventIndicator.className = 'event-indicator';
        dayNumber.appendChild(eventIndicator);
        
        dayElement.appendChild(dayNumber);
        calendarElement.appendChild(dayElement);
    }
    
    // Charger les événements pour ce mois
    loadEventsForCalendar(year, month + 1);
}

async function loadEventsForCalendar(year, month) {
    try {
        console.log(`📅 Chargement des événements pour ${month}/${year}...`);
        
        // Créer les dates de début et fin du mois
        const startDate = new Date(year, month - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();
        
        console.log(`📅 Période: ${new Date(startISO).toLocaleDateString('fr-FR')} au ${new Date(endISO).toLocaleDateString('fr-FR')}`);
        
        // Requête principale avec comparaison de dates
        const { data: events, error } = await supabase
            .from('articles')
            .select('*')
            .eq('rubrique', 'culture')
            .eq('statut', 'publié')
            .gte('date_evenement', startISO)
            .lte('date_evenement', endISO);
        
        if (error) {
            console.error('❌ Erreur chargement événements calendrier:', error);
            
            // Tentative alternative sans filtre de date
            console.log('🔄 Tentative avec requête alternative...');
            
            const { data: eventsAlt, error: errorAlt } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'culture')
                .eq('statut', 'publié');
            
            if (errorAlt) {
                console.error('❌ Échec de la requête alternative:', errorAlt);
                updateEventsCount(0);
                return;
            }
            
            if (eventsAlt && eventsAlt.length > 0) {
                console.log(`📅 ${eventsAlt.length} événements trouvés (tous) - filtrage manuel`);
                const filteredEvents = filterEventsByMonth(eventsAlt, year, month);
                
                if (filteredEvents.length > 0) {
                    console.log(`📅 ${filteredEvents.length} événements pour ${month}/${year} après filtrage`);
                    addEventsToCalendar(filteredEvents);
                    updateEventsCount(filteredEvents.length);
                } else {
                    console.log(`ℹ️ Aucun événement pour ${month}/${year}`);
                    updateEventsCount(0);
                }
            } else {
                updateEventsCount(0);
            }
            return;
        }
        
        if (events && events.length > 0) {
            console.log(`📅 ${events.length} événements trouvés pour ${month}/${year}`);
            addEventsToCalendar(events);
            updateEventsCount(events.length);
        } else {
            console.log(`ℹ️ Aucun événement trouvé pour ${month}/${year}`);
            updateEventsCount(0);
        }
        
    } catch (error) {
        console.error('💥 Erreur lors du chargement des événements:', error);
        updateEventsCount(0);
    }
}

// Fonction pour mettre à jour le compteur d'événements
function updateEventsCount(count) {
    const countElement = document.getElementById('events-count');
    if (countElement) {
        if (count > 0) {
            countElement.textContent = `${count} événement${count > 1 ? 's' : ''} programmé${count > 1 ? 's' : ''} ce mois-ci`;
            countElement.style.color = 'var(--accent)';
        } else {
            countElement.textContent = 'Aucun événement programmé ce mois-ci';
            countElement.style.color = 'var(--text-secondary)';
        }
    }
}

// Fonction de filtrage manuel en cas d'échec de la requête
function filterEventsByMonth(events, year, month) {
    return events.filter(event => {
        if (!event.date_evenement) return false;
        
        try {
            const eventDate = new Date(event.date_evenement);
            // Vérifier si la date est valide
            if (isNaN(eventDate.getTime())) return false;
            
            return eventDate.getFullYear() === year && 
                   eventDate.getMonth() === (month - 1);
        } catch (e) {
            console.warn('⚠️ Erreur de parsing de date:', event.date_evenement);
            return false;
        }
    });
}

function addEventsToCalendar(events) {
    // Regrouper les événements par jour
    const eventsByDay = {};
    
    events.forEach(event => {
        if (!event.date_evenement) return;
        
        try {
            const eventDate = new Date(event.date_evenement);
            
            // Vérifier si la date est valide
            if (isNaN(eventDate.getTime())) {
                console.warn('⚠️ Date invalide pour événement:', event.titre_fr, event.date_evenement);
                return;
            }
            
            const day = eventDate.getDate();
            
            if (!eventsByDay[day]) {
                eventsByDay[day] = [];
            }
            eventsByDay[day].push(event);
            
        } catch (error) {
            console.error('❌ Erreur lors du traitement d\'un événement:', error, event);
        }
    });
    
    // Pour chaque jour qui a des événements
    Object.keys(eventsByDay).forEach(day => {
        const dayEvents = eventsByDay[day];
        const dayNumber = parseInt(day);
        
        // Trouver l'élément du jour correspondant
        const dayElements = document.querySelectorAll('.calendar-day:not(.empty)');
        dayElements.forEach(dayElement => {
            const dayNumberElement = dayElement.querySelector('.day-number span');
            if (dayNumberElement && parseInt(dayNumberElement.textContent) === dayNumber) {
                
                // Marquer le jour comme ayant des événements
                dayElement.classList.add('has-events');
                
                // Supprimer les anciens indicateurs pour éviter les doublons
                const existingIndicator = dayElement.querySelector('.event-indicator');
                if (existingIndicator) {
                    existingIndicator.innerHTML = '';
                    
                    // Ajouter un point par événement (max 3 points)
                    const maxDots = Math.min(dayEvents.length, 3);
                    for (let i = 0; i < maxDots; i++) {
                        const dot = document.createElement('span');
                        dot.className = 'event-dot';
                        dot.title = dayEvents[i].titre_fr || 'Événement';
                        existingIndicator.appendChild(dot);
                    }
                    
                    // Si plus de 3 événements, ajouter un indicateur "+X"
                    if (dayEvents.length > 3) {
                        const moreIndicator = document.createElement('span');
                        moreIndicator.className = 'more-events';
                        moreIndicator.textContent = `+${dayEvents.length - 3}`;
                        moreIndicator.style.fontSize = '0.7rem';
                        moreIndicator.style.marginLeft = '3px';
                        moreIndicator.style.color = 'var(--accent)';
                        existingIndicator.appendChild(moreIndicator);
                    }
                }
                
                // Supprimer les anciennes popups
                const existingPopups = dayElement.querySelectorAll('.event-popup');
                existingPopups.forEach(popup => popup.remove());
                
                // Créer une popup avec tous les événements du jour
                const eventPopup = document.createElement('div');
                eventPopup.className = 'event-popup';
                
                let popupContent = '';
                dayEvents.forEach((event, index) => {
                    const formattedDate = event.date_evenement 
                        ? new Date(event.date_evenement).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Horaire non défini';
                    
                    popupContent += `
                        <div style="${index > 0 ? 'margin-top: 15px; padding-top: 10px; border-top: 1px solid var(--border-color);' : ''}">
                            <h4 style="color: var(--accent); margin: 0 0 5px 0;">${event.titre_fr || 'Événement'}</h4>
                            <p style="margin: 3px 0;"><strong>Type:</strong> ${event.type_evenement || 'Événement'}</p>
                            <p style="margin: 3px 0;"><strong>🕒</strong> ${formattedDate}</p>
                            ${event.lieu ? `<p style="margin: 3px 0;"><strong>📍</strong> ${event.lieu}</p>` : ''}
                            <a href="article.html?id=${event.id}" class="event-link-popup" style="display: inline-block; margin-top: 5px;">
                                Voir détails →
                            </a>
                        </div>
                    `;
                });
                
                eventPopup.innerHTML = popupContent;
                dayElement.appendChild(eventPopup);
            }
        });
    });
    
    // Afficher le nombre total d'événements
    const totalEvents = events.length;
    console.log(`✅ ${totalEvents} événement(s) ajouté(s) au calendrier`);
}

function initCalendar() {
    const calendarElement = document.getElementById('calendar');
    if (!calendarElement) {
        console.log('ℹ️ Pas de calendrier sur cette page');
        return;
    }
    
    console.log('📅 Initialisation du calendrier...');
    
    // Date actuelle
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth(); // 0-11
    
    // Générer le calendrier pour le mois en cours
    generateCalendar(currentYear, currentMonth);
    
    // Bouton mois précédent
    const prevBtn = document.getElementById('prev-month');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentYear, currentMonth);
        });
    }
    
    // Bouton mois suivant
    const nextBtn = document.getElementById('next-month');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentYear, currentMonth);
        });
    }
    
    // Bouton aujourd'hui
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            currentDate = new Date();
            currentYear = currentDate.getFullYear();
            currentMonth = currentDate.getMonth();
            generateCalendar(currentYear, currentMonth);
        });
    }
    
    console.log('✅ Calendrier initialisé');
}

// Fonction de débogage pour vérifier les événements
async function debugCultureEvents() {
    console.log('🔍 Vérification des événements culture...');
    
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('id, titre_fr, date_evenement, type_evenement, lieu, rubrique, statut')
            .eq('rubrique', 'culture')
            .eq('statut', 'publié');
        
        if (error) {
            console.error('❌ Erreur:', error);
            return;
        }
        
        console.log(`📊 ${data?.length || 0} événements culture trouvés:`);
        
        if (data && data.length > 0) {
            data.forEach((event, index) => {
                const dateValid = event.date_evenement ? !isNaN(new Date(event.date_evenement).getTime()) : false;
                console.log(`${index + 1}. "${event.titre_fr}"`);
                console.log(`   Date: ${event.date_evenement || 'Non définie'} (${dateValid ? '✓ valide' : '✗ invalide'})`);
                console.log(`   Type: ${event.type_evenement || 'Non spécifié'}`);
                console.log(`   Lieu: ${event.lieu || 'Non spécifié'}`);
            });
        }
        
        return data;
    } catch (error) {
        console.error('💥 Erreur:', error);
    }
}

// Appeler la vérification après l'initialisation
setTimeout(debugCultureEvents, 2000);

    // ============================================
    // 4. TEST DE CONNEXION SUPABASE
    // ============================================
    async function testerConnexionSupabase() {
        console.log('🔍 Test de connexion Supabase...');
        try {
            const { data, error } = await supabase
                .from('créateurs')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Erreur de connexion:', error);
                return false;
            }
            
            console.log('✅ Connexion Supabase réussie!');
            return true;
        } catch (error) {
            console.error('💥 Erreur inattendue:', error);
            return false;
        }
    }

    // ============================================
    // 5. DÉTECTION AUTOMATIQUE DE LA PAGE
    // ============================================
    function detectPageAndLoad() {
        console.log('🔍 Détection automatique de la page...');
        
        const currentPath = window.location.pathname;
        if (!currentPath.includes('index.html') && 
            !currentPath.includes('article.html') &&
            !currentPath.includes('.css') &&
            !currentPath.includes('.js')) {
            
            if (!SessionManager.checkAccess()) {
                return;
            }
        }
        
        if (window.location.pathname.includes('admin.html')) {
            console.log('📄 Page Admin détectée');
            initAdminPage();
            return;
        }
        
        if (window.location.pathname.includes('Actualisation.html')) {
            console.log('📄 Page Actualisation détectée');
            initActualisationPage();
            return;
        }
        
        if (document.getElementById('article-content')) {
            console.log('📄 Page Article détectée');
            loadSingleArticle();
            return;
        }
        
        if (window.location.pathname.includes('culture.html')) {
            console.log('📄 Page Culture détectée');
            initCalendar();
        }
        
        const containerMap = {
            'actualites-container': 'actualites',
            'visages-container': 'visages',
            'tendances-container': 'tendances',
            'accessoires-container': 'accessoires',
            'beaute-container': 'beaute',
            'coulisses-container': 'coulisses',
            'culture-container': 'culture',
            'decouvertes-container': 'decouvertes',
            'mode-container': 'mode',
            'articles-list': 'coulisses',
            'trends-container': 'tendances',
            'discoveries-container': 'decouvertes',
            'events-container': 'culture'
        };
        
        for (const [containerId, rubrique] of Object.entries(containerMap)) {
            if (document.getElementById(containerId)) {
                console.log(`📄 Page ${rubrique} détectée (${containerId})`);
                loadArticlesByRubrique(rubrique, containerId);
                
                if (rubrique === 'visages' && document.querySelectorAll('.filter-btn').length > 0) {
                    setupVisageFilters();
                }
                return;
            }
        }
        
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '').toLowerCase();
        
        const pageToRubrique = {
            'accessoires': ['accessoires-container', 'accessoires'],
            'beaute': ['beaute-container', 'beaute'],
            'mode': ['mode-container', 'mode'],
            'coulisses': ['coulisses-container', 'coulisses'],
            'tendances': ['tendances-container', 'tendances'],
            'decouvertes': ['decouvertes-container', 'decouvertes'],
            'culture': ['culture-container', 'culture'],
            'visages': ['visages-container', 'visages'],
            'actualites': ['actualites-container', 'actualites']
        };
        
        if (pageToRubrique[pageName]) {
            const [containerId, rubrique] = pageToRubrique[pageName];
            console.log(`📄 Page ${rubrique} détectée par nom de fichier`);
            loadArticlesByRubrique(rubrique, containerId);
            return;
        }
        
        console.log('ℹ️ Aucune page spécifique détectée');
    }

    // ============================================
    // 6. FONCTIONS POUR LA PAGE ADMINISTRATION
    // ============================================
    
    async function initAdminPage() {
        console.log('🔄 Initialisation de la page admin...');
        
        if (!SessionManager.isAdmin()) {
            alert('⚠️ Accès non autorisé. Connectez-vous en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Admin connecté');
        
        const connected = await testerConnexionSupabase();
        if (!connected) {
            const pendingDiv = document.getElementById('pendingCreators');
            if (pendingDiv) {
                pendingDiv.innerHTML = 
                    `<div style="color: red; padding: 30px; text-align: center;">
                        <h3>❌ Erreur de connexion à la base de données</h3>
                        <p>Impossible de se connecter à Supabase.</p>
                    </div>`;
            }
            return;
        }
        
        const pendingDiv = document.getElementById('pendingCreators');
        const approvedDiv = document.getElementById('approvedCreators');
        const pendingCount = document.getElementById('pendingCount');
        const approvedCount = document.getElementById('approvedCount');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (!pendingDiv || !approvedDiv) {
            console.error('❌ Éléments manquants dans la page');
            return;
        }
        
        chargerTousLesCreateurs();
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Déconnexion ?')) {
                    SessionManager.clearSession();
                    window.location.href = 'index.html';
                }
            });
        }
        
        setInterval(chargerTousLesCreateurs, 30000);
        
        console.log('🎯 Script admin prêt');
    }
    
    async function chargerTousLesCreateurs() {
        console.log('📡 Chargement des créateurs...');
        
        const pendingDiv = document.getElementById('pendingCreators');
        const approvedDiv = document.getElementById('approvedCreators');
        const pendingCount = document.getElementById('pendingCount');
        const approvedCount = document.getElementById('approvedCount');
        
        try {
            const { data: pendingData, error: pendingError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'pending');
            
            if (pendingError) {
                console.error('❌ Erreur pending:', pendingError);
                if (pendingDiv) {
                    pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                        Erreur: ${pendingError.message}
                    </div>`;
                }
            } else {
                console.log(`📊 ${pendingData?.length || 0} créateurs pending`);
                afficherCreateurs(pendingData, pendingDiv, 'pending');
                if (pendingCount) pendingCount.textContent = pendingData?.length || 0;
            }
            
            const { data: approvedData, error: approvedError } = await supabase
                .from('créateurs')
                .select('*')
                .eq('statut', 'actif');
            
            if (approvedError) {
                console.error('❌ Erreur approved:', approvedError);
                if (approvedDiv) {
                    approvedDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                        Erreur: ${approvedError.message}
                    </div>`;
                }
            } else {
                console.log(`✅ ${approvedData?.length || 0} créateurs approuvés`);
                afficherCreateurs(approvedData, approvedDiv, 'approved');
                if (approvedCount) approvedCount.textContent = approvedData?.length || 0;
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            if (pendingDiv) {
                pendingDiv.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
                    Erreur: ${error.message}
                </div>`;
            }
        }
    }
    
    async function approuverCreateur(id, nomMarque) {
        console.log(`🔄 Tentative d'approbation: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Approuver le créateur "${nomMarque}" ?\n\nIl pourra se connecter à son espace.`)) {
            return;
        }
        
        try {
            // Récupérer d'abord le créateur pour connaître son domaine
            const { data: creator, error: fetchError } = await supabase
                .from('créateurs')
                .select('domaine')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const { data, error } = await supabase
                .from('créateurs')
                .update({ 
                    statut: 'actif',
                    date_validation: new Date().toISOString()
                })
                .eq('id', id);
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            alert(`✅ "${nomMarque}" a été approuvé avec succès !`);
            console.log(`✅ Créateur ${id} approuvé`);
            
            // Mettre à jour la contrainte CHECK avec tous les domaines
            await updateDomaineCheckConstraint();
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur approbation:', error);
            alert(`❌ Échec de l'approbation: ${error.message}`);
        }
    }
    
    async function refuserCreateur(id, nomMarque) {
        console.log(`🗑️ Tentative de refus: ${id} - "${nomMarque}"`);
        
        if (!confirm(`Refuser définitivement "${nomMarque}" ?\n\nCette action supprimera complètement la demande.`)) {
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('créateurs')
                .delete()
                .eq('id', id);
            
            if (error) {
                throw new Error(`Erreur Supabase: ${error.message}`);
            }
            
            alert(`❌ "${nomMarque}" a été refusé et supprimé.`);
            console.log(`🗑️ Créateur ${id} supprimé`);
            
            setTimeout(() => {
                chargerTousLesCreateurs();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur refus:', error);
            alert(`❌ Échec du refus: ${error.message}`);
        }
    }
    
    function afficherCreateurs(creators, container, status) {
        if (!creators || creators.length === 0) {
            const message = status === 'pending' 
                ? 'Aucune demande en attente'
                : 'Aucun créateur approuvé';
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">${message}</div>`;
            return;
        }
        
        let html = '';
        
        creators.forEach(creator => {
            const safeNom = escapeHtml(creator.nom_marque || 'Sans nom');
            const safePrenom = escapeHtml(creator.prenom || '');
            const safeNomComplet = escapeHtml(creator.nom || '');
            const safeEmail = escapeHtml(creator.email || 'Non fourni');
            const safeTel = escapeHtml(creator.telephone || 'Non fourni');
            const safeDomaine = escapeHtml(creator.domaine || 'Non spécifié');
            
            html += `
                <div class="creator-card" id="creator-${creator.id}">
                    <h3>${safeNom}</h3>
                    <p><strong>Contact:</strong> ${safePrenom} ${safeNomComplet}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Téléphone:</strong> ${safeTel}</p>
                    <p><strong>Domaine:</strong> ${safeDomaine}</p>
                    <p><strong>ID:</strong> <code>${creator.id}</code></p>
                    <p><strong>Statut:</strong> ${creator.statut}</p>
            `;
            
            if (status === 'pending') {
                html += `
                    <div class="card-actions">
                        <button class="action-btn approve-btn" data-id="${creator.id}" data-brand="${safeNom}">
                            ✅ Approuver
                        </button>
                        <button class="action-btn reject-btn" data-id="${creator.id}" data-brand="${safeNom}">
                            ❌ Refuser
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
        if (status === 'pending') {
            container.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const brand = this.getAttribute('data-brand');
                    approuverCreateur(id, brand);
                });
            });
            
            container.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const brand = this.getAttribute('data-brand');
                    refuserCreateur(id, brand);
                });
            });
        }
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // 7. FONCTION POUR METTRE À JOUR LA CONTRAINTE CHECK
    // ============================================
    
    async function updateDomaineCheckConstraint() {
        try {
            console.log('🔄 Mise à jour de la contrainte CHECK des domaines...');
            
            const { data: domainesData, error } = await supabase
                .from('créateurs')
                .select('domaine')
                .eq('statut', 'actif');
            
            if (error) throw error;
            
            const domainesUniques = [...new Set(domainesData.map(d => d.domaine))];
            
            const domainesParDefaut = [
                'Styliste haute couture',
                'Styliste streetwear',
                'Designer',
                'Marque de bijoux',
                'Artisans du tricot'
            ];
            
            const nouveauxDomaines = domainesUniques.filter(d => !domainesParDefaut.includes(d));
            
            if (nouveauxDomaines.length > 0) {
                console.log('🆕 Nouveaux domaines à ajouter à la contrainte:', nouveauxDomaines);
                
                const { error: rpcError } = await supabase.rpc('ajouter_domaines_check', {
                    nouveaux_domaines: nouveauxDomaines
                });
                
                if (rpcError) {
                    console.error('❌ Erreur lors de la mise à jour de la contrainte:', rpcError);
                } else {
                    console.log('✅ Contrainte CHECK mise à jour avec succès');
                }
            }
            
        } catch (error) {
            console.error('💥 Erreur lors de la mise à jour des domaines:', error);
        }
    }

    // ============================================
    // 8. FONCTIONS POUR LA PAGE ACTUALISATION
    // ============================================
    
    async function initActualisationPage() {
        console.log('🔄 Initialisation de la page actualisation...');
        
        if (!SessionManager.isAdmin()) {
            alert('⚠️ Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Admin connecté pour actualisation');
        
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-tab').classList.add('active');
                
                loadAdminData(tabId);
            });
        });
        
        const rubriques = ['actualites', 'visages', 'coulisses', 'tendances', 'decouvertes', 'mode', 'accessoires', 'beaute', 'culture'];
        rubriques.forEach(rubrique => {
            setupImageUpload(rubrique);
        });
        
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', async function() {
                const tabId = this.id.split('-')[1];
                console.log('🔄 Enregistrement pour:', tabId);
                await saveArticle(tabId);
            });
        });
        
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.id.split('-')[1];
                resetForm(tabId);
            });
        });
        
        await loadAdminData('actualites');
        
        setDefaultDates();
    }
    
    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }
    
    function setupImageUpload(rubrique) {
        const uploadArea = document.getElementById(`uploadArea-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        
        if (!uploadArea || !imageFile) return;
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--accent)';
            this.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.backgroundColor = '';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                imageFile.files = e.dataTransfer.files;
                displayImagePreview(file, preview);
            }
        });
        
        uploadArea.addEventListener('click', function() {
            imageFile.click();
        });
        
        imageFile.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                displayImagePreview(this.files[0], preview);
            }
        });
    }
    
    function displayImagePreview(file, previewElement) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    async function loadAdminData(tabId) {
        console.log(`🔄 Chargement des données admin pour: ${tabId}`);
        
        const listContainer = document.getElementById(`${tabId}List`);
        if (!listContainer) return;
        
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .eq('rubrique', tabId)
                .order('date_publication', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        Aucun contenu publié pour le moment.
                    </div>
                `;
                return;
            }
            
            listContainer.innerHTML = data.map(article => `
                <div class="content-item" data-id="${article.id}">
                    <div class="content-info">
                        ${article.image_url ? `
                        <img src="${article.image_url}" 
                             alt="${article.titre_fr}" 
                             onerror="this.src='https://placehold.co/80x60?text=${tabId.toUpperCase()}'">
                        ` : `
                        <div style="width: 80px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                            📝
                        </div>
                        `}
                        <div>
                            <h3>${article.titre_fr}</h3>
                            <div class="content-meta">
                                <span>📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                                <span>${article.auteur || 'Rédaction'}</span>
                                <span class="badge">${article.statut || 'publié'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="editArticle('${tabId}', '${article.id}')">
                            ✏️ Modifier
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteArticle('${tabId}', '${article.id}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error(`❌ Erreur chargement ${tabId}:`, error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    Erreur de chargement: ${error.message}
                </div>
            `;
        }
    }
    
    async function uploadImage(file, rubrique) {
        if (!file) return null;
        
        try {
            console.log('📤 Début upload image:', file.name, file.size);
            
            if (file.size > 2 * 1024 * 1024) {
                console.error('❌ Fichier trop volumineux:', file.size);
                alert('Le fichier est trop volumineux (max 2MB)');
                return null;
            }
            
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                reader.onload = function(e) {
                    const base64Image = e.target.result;
                    console.log('✅ Image convertie en base64');
                    resolve(base64Image);
                };
                
                reader.onerror = function(error) {
                    console.error('❌ Erreur conversion base64:', error);
                    reject(error);
                };
                
                reader.readAsDataURL(file);
            });
            
        } catch (error) {
            console.error('💥 Erreur upload image:', error);
            return null;
        }
    }
    
    async function saveArticle(rubrique) {
        const formTitle = document.getElementById(`formTitle-${rubrique}`);
        const btnSave = document.getElementById(`btnSave-${rubrique}`);
        const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
        const statusElement = document.getElementById(`status-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        
        if (!formTitle || !btnSave) return;
        
        const formData = getFormData(rubrique);
        
        let validationError = '';
        
        switch(rubrique) {
            case 'visages':
                if (!formData.nom_marque) {
                    validationError = '❌ Le nom de la marque est obligatoire';
                } else if (!formData.biographie) {
                    validationError = '❌ La biographie est obligatoire';
                }
                break;
                
            case 'culture':
                if (!formData.titre_fr) {
                    validationError = '❌ Le titre est obligatoire';
                } else if (!formData.date_evenement) {
                    validationError = '❌ La date de début est obligatoire';
                }
                break;
                
            default:
                if (!formData.titre_fr) {
                    validationError = '❌ Le titre est obligatoire';
                }
        }
        
        if (validationError) {
            showStatus(statusElement, validationError, 'error');
            return;
        }
        
        btnSave.disabled = true;
        btnSave.innerHTML = '<span>⏳ Enregistrement...</span>';
        
        try {
            let imageUrl = null;
            
            if (imageFile.files && imageFile.files[0]) {
                imageUrl = await uploadImage(imageFile.files[0], rubrique);
            }
            
            const articleData = {
                ...formData,
                image_url: imageUrl || formData.image_url,
                statut: 'publié',
                date_publication: formData.date_publication || new Date().toISOString()
            };
            
            if (rubrique === 'visages' && articleData.nom_marque) {
                articleData.titre_fr = articleData.nom_createur 
                    ? `${articleData.nom_marque} par ${articleData.nom_createur}`
                    : `${articleData.nom_marque}`;
            }

            console.log('📤 Données à envoyer:', articleData);
            
            const editingId = btnSave.getAttribute('data-editing-id');
            
            let result;
            if (editingId) {
                const { data, error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', editingId);
                
                if (error) throw error;
                
                console.log('✅ Article mis à jour:', data);
                showStatus(statusElement, '✅ Article mis à jour avec succès!', 'success');
                btnSave.removeAttribute('data-editing-id');
                formTitle.textContent = getFormTitle(rubrique, false);
                
            } else {
                const { data, error } = await supabase
                    .from('articles')
                    .insert([articleData]);
                
                if (error) throw error;
                
                console.log('✅ Article créé:', data);
                showStatus(statusElement, '✅ Article publié avec succès!', 'success');
            }
            
            resetForm(rubrique);
            await loadAdminData(rubrique);
            
            setTimeout(() => {
                showStatus(statusElement, '', 'success');
            }, 3000);
            
        } catch (error) {
            console.error(`❌ Erreur sauvegarde ${rubrique}:`, error);
            showStatus(statusElement, `❌ Erreur: ${error.message}`, 'error');
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = editingId ? 
                '<span>💾 Mettre à jour</span>' : 
                '<span>🚀 Publier</span>';
        }
    }
    
    function getFormData(rubrique) {
        const data = {
            rubrique: document.getElementById(`rubrique-${rubrique}`)?.value || rubrique,
            titre_fr: document.getElementById(`titre-${rubrique}`)?.value || '',
            contenu_fr: document.getElementById(`contenu-${rubrique}`)?.value || '',
            auteur: document.getElementById(`auteur-${rubrique}`)?.value || 'Rédaction',
            date_publication: document.getElementById(`date-${rubrique}`)?.value || new Date().toISOString().split('T')[0]
        };
        
        switch(rubrique) {
            case 'actualites':
                data.categorie_actualite = document.getElementById(`categorie-${rubrique}`)?.value;
                break;
            case 'visages':
                data.nom_marque = document.getElementById(`nom_marque-${rubrique}`)?.value;
                data.nom_createur = document.getElementById(`nom_createur-${rubrique}`)?.value;
                data.domaine = document.getElementById(`domaine-${rubrique}`)?.value;
                data.reseaux_instagram = document.getElementById(`instagram-${rubrique}`)?.value;
                data.site_web = document.getElementById(`siteweb-${rubrique}`)?.value;
                data.biographie = document.getElementById(`biographie-${rubrique}`)?.value;
                data.interview_fr = document.getElementById(`interview-${rubrique}`)?.value;
                break;
            case 'tendances':
                data.saison = document.getElementById(`saison-${rubrique}`)?.value;
                break;
            case 'decouvertes':
                data.type_decouverte = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'mode':
                data.theme_mode = document.getElementById(`theme-${rubrique}`)?.value;
                break;
            case 'accessoires':
                data.type_accessoire = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'beaute':
                data.type_beaute = document.getElementById(`type-${rubrique}`)?.value;
                break;
            case 'culture':
                return getCultureFormData();
        }
        
        return data;
    }
    
    function getCultureFormData() {
        return {
            rubrique: 'culture',
            titre_fr: document.getElementById('titre-culture')?.value || '',
            type_evenement: document.getElementById('type-culture')?.value,
            date_evenement: document.getElementById('date_debut-culture')?.value,
            date_fin_evenement: document.getElementById('date_fin-culture')?.value,
            heure_evenement: document.getElementById('heure-culture')?.value,
            statut_evenement: document.getElementById('statut-culture')?.value,
            lieu: document.getElementById('lieu-culture')?.value,
            contenu_fr: document.getElementById('description-culture')?.value || '',
            lien_evenement: document.getElementById('lien-culture')?.value,
            auteur: 'Rédaction',
            statut: 'publié'
        };
    }
    
    function showStatus(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `status-message status-${type}`;
        element.style.display = message ? 'block' : 'none';
    }
    
    function resetForm(rubrique) {
        const form = document.getElementById(`${rubrique}-tab`);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], input[type="url"], textarea, select');
        inputs.forEach(input => {
            if (input.type === 'select-one') {
                input.selectedIndex = 0;
            } else if (input.type === 'date') {
                input.value = new Date().toISOString().split('T')[0];
            } else if (input.id.includes('titre-') || input.id.includes('contenu-')) {
                input.value = '';
            } else if (input.id.includes('auteur-')) {
                input.value = 'Rédaction';
            } else {
                input.value = '';
            }
        });
        
        const preview = document.getElementById(`currentImagePreview-${rubrique}`);
        const imageFile = document.getElementById(`imageFile-${rubrique}`);
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        if (imageFile) {
            imageFile.value = '';
        }
        
        const btnSave = document.getElementById(`btnSave-${rubrique}`);
        const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
        const formTitle = document.getElementById(`formTitle-${rubrique}`);
        
        if (btnSave) {
            btnSave.removeAttribute('data-editing-id');
            btnSave.innerHTML = '<span>🚀 Publier</span>';
        }
        
        if (btnCancel) {
            btnCancel.style.display = 'none';
        }
        
        if (formTitle) {
            formTitle.textContent = getFormTitle(rubrique, false);
        }
        
        const statusElement = document.getElementById(`status-${rubrique}`);
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }
    
    function getFormTitle(rubrique, editing = false) {
        const titles = {
            'actualites': editing ? 'Modifier une actualité' : 'Publier une actualité',
            'visages': editing ? 'Modifier un créateur' : 'Ajouter un créateur',
            'coulisses': editing ? 'Modifier un article coulisses' : 'Article Coulisses',
            'tendances': editing ? 'Modifier un article tendances' : 'Article Tendances',
            'decouvertes': editing ? 'Modifier une découverte' : 'Nouvelle découverte',
            'culture': editing ? 'Modifier un événement' : 'Événement Culture/Agenda',
            'mode': editing ? 'Modifier un article mode' : 'Article Mode',
            'accessoires': editing ? 'Modifier un article accessoires' : 'Article Accessoires',
            'beaute': editing ? 'Modifier un article beauté' : 'Article Beauté'
        };
        
        return titles[rubrique] || 'Formulaire';
    }
    
    window.editArticle = async function(rubrique, articleId) {
        console.log(`✏️ Édition article ${articleId} (${rubrique})`);
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) throw error;
            
            if (!data) {
                alert('Article non trouvé');
                return;
            }
            
            fillForm(rubrique, data);
            
            const btnSave = document.getElementById(`btnSave-${rubrique}`);
            const btnCancel = document.getElementById(`btnCancel-${rubrique}`);
            const formTitle = document.getElementById(`formTitle-${rubrique}`);
            
            if (btnSave) {
                btnSave.setAttribute('data-editing-id', articleId);
                btnSave.innerHTML = '<span>💾 Mettre à jour</span>';
            }
            
            if (btnCancel) {
                btnCancel.style.display = 'block';
            }
            
            if (formTitle) {
                formTitle.textContent = getFormTitle(rubrique, true);
            }
            
            document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const tabBtn = document.querySelector(`.tab-link[data-tab="${rubrique}"]`);
            const tabContent = document.getElementById(`${rubrique}-tab`);
            
            if (tabBtn) tabBtn.classList.add('active');
            if (tabContent) tabContent.classList.add('active');
            
        } catch (error) {
            console.error('❌ Erreur chargement article:', error);
            alert('Erreur lors du chargement de l\'article');
        }
    };
    
    window.deleteArticle = async function(rubrique, articleId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);
            
            if (error) throw error;
            
            alert('✅ Article supprimé avec succès!');
            
            await loadAdminData(rubrique);
            
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            alert('❌ Erreur lors de la suppression');
        }
    };
    
    function fillForm(rubrique, data) {
        const setValue = (id, value) => {
            const element = document.getElementById(`${id}-${rubrique}`);
            if (element && value) element.value = value;
        };
        
        setValue('titre', data.titre_fr);
        setValue('contenu', data.contenu_fr);
        setValue('auteur', data.auteur);
        
        if (data.date_publication) {
            setValue('date', data.date_publication.split('T')[0]);
        }
        
        switch(rubrique) {
            case 'actualites':
                setValue('categorie', data.categorie_actualite);
                break;
            case 'visages':
                setValue('nom_marque', data.nom_marque);
                setValue('nom_createur', data.nom_createur);
                setValue('domaine', data.domaine);
                setValue('instagram', data.reseaux_instagram);
                setValue('siteweb', data.site_web);
                setValue('interview', data.interview_fr);
                break;
            case 'tendances':
                setValue('saison', data.saison);
                break;
            case 'decouvertes':
                setValue('type', data.type_decouverte);
                break;
            case 'mode':
                setValue('theme', data.theme_mode);
                break;
            case 'accessoires':
                setValue('type', data.type_accessoire);
                break;
            case 'beaute':
                setValue('type', data.type_beaute);
                break;
            case 'culture':
                fillCultureForm(data);
                break;
        }
        
        if (data.image_url) {
            const preview = document.getElementById(`currentImagePreview-${rubrique}`);
            if (preview) {
                preview.src = data.image_url;
                preview.style.display = 'block';
            }
        }
    }
    
    function fillCultureForm(data) {
        const setValue = (id, value) => {
            const element = document.getElementById(`${id}-culture`);
            if (element && value) element.value = value;
        };
        
        setValue('titre', data.titre_fr);
        setValue('type', data.type_evenement);
        setValue('date_debut', data.date_evenement ? data.date_evenement.split('T')[0] : '');
        setValue('date_fin', data.date_fin_evenement ? data.date_fin_evenement.split('T')[0] : '');
        setValue('heure', data.heure_evenement);
        setValue('statut', data.statut_evenement);
        setValue('lieu', data.lieu);
        setValue('description', data.contenu_fr);
        setValue('lien', data.lien_evenement);
    }

    // ============================================
    // 9. FONCTIONS POUR LA STRUCTURE PRINCIPALE
    // ============================================
    
    window.loadArticlesByRubrique = async function(rubrique, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.log(`❌ Conteneur ${containerId} non trouvé`);
            return;
        }
        
        try {
            console.log(`🔄 Chargement des articles ${rubrique}...`);
            
            container.innerHTML = '<div class="loading" style="padding: 40px; text-align: center; color: #666;">Chargement des articles...</div>';
            
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', rubrique)
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            console.log('📊 Données reçues pour', rubrique, ':', data);
            
            if (error) {
                console.error(`❌ Erreur chargement ${rubrique}:`, error);
                container.innerHTML = `<p class="error" style="padding: 40px; text-align: center; color: #dc3545;">Erreur de chargement: ${error.message}</p>`;
                return;
            }
            
            if (!data || data.length === 0) {
                console.log(`ℹ️ Aucun article ${rubrique} trouvé (statut = publié)`);
                container.innerHTML = `<p class="no-content" style="padding: 40px; text-align: center; color: #666;">Aucun contenu publié pour le moment.<br></p>`;
                return;
            }
            
            console.log(`✅ ${data.length} articles ${rubrique} chargés (publiés)`);
            
            switch(rubrique) {
                case 'actualites':
                    renderActualites(data, container);
                    break;
                case 'visages':
                    renderVisages(data, container);
                    break;
                case 'coulisses':
                    renderCoulisses(data, container);
                    break;
                case 'tendances':
                    renderTendances(data, container);
                    break;
                case 'decouvertes':
                    renderDecouvertes(data, container);
                    break;
                case 'culture':
                    renderCulture(data, container);
                    break;
                case 'mode':
                    renderMode(data, container);
                    break;
                case 'accessoires':
                    renderAccessoires(data, container);
                    break;
                case 'beaute':
                    renderBeaute(data, container);
                    break;
                default:
                    renderGenericArticles(data, container, rubrique);
            }
            
        } catch (error) {
            console.error('💥 Erreur générale:', error);
            container.innerHTML = `<p class="error" style="padding: 40px; text-align: center; color: #dc3545;">Une erreur est survenue lors du chargement: ${error.message}</p>`;
        }
    };

    // ============================================
    // 10. FONCTIONS DE RENDU MODIFIÉES
    // ============================================
    
    function renderActualites(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="article-card rounded-article">
                ${article.image_url ? `
                <div class="article-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy" 
                         onerror="this.src='https://placehold.co/600x400?text=ACTUALITE'">
                </div>
                ` : ''}
                
                <div class="article-content">
                    <h2 class="article-title">${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-more">
                        Lire la suite →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderVisages(visages, container) {
        if (container.closest('.visages-page')) {
            container.innerHTML = visages.map(visage => `
                <div class="visage-card rounded-article">
                    ${visage.image_url ? `
                    <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy" class="visage-image rounded-image"
                         onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    ` : ''}
                    
                    <div class="visage-content">
                        <h3>${visage.nom_marque || visage.titre_fr}</h3>
                        ${visage.domaine ? `<span class="visage-domain">${visage.domaine}</span>` : ''}
                        
                        <a href="article.html?id=${visage.id}" class="visage-link">
                            Voir le profil complet →
                        </a>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = visages.map(visage => `
                <div class="creator-card rounded-article">
                    ${visage.image_url ? `
                    <div class="creator-photo rounded-image">
                        <img src="${visage.image_url}" alt="${visage.nom_marque || visage.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/400x250?text=CREATEUR'">
                    </div>
                    ` : ''}
                    
                    <div class="creator-info">
                        <h3 class="creator-name">${visage.nom_marque || visage.titre_fr}</h3>
                        
                        <a href="article.html?id=${visage.id}" class="view-profile">
                            Voir le profil complet →
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }
    
    function renderCoulisses(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="backstage-article rounded-article">
                ${article.image_url ? `
                <div class="backstage-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=COULISSES'">
                </div>
                ` : ''}
                
                <div class="backstage-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-backstage">
                        Voir les coulisses →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderTendances(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="trend-article rounded-article">
                ${article.image_url ? `
                <div class="trend-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=TENDANCE'">
                    ${article.saison ? `<span class="season-badge">${article.saison}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="trend-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-trend">
                        Découvrir les tendances →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderDecouvertes(decouvertes, container) {
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
                <h2 class="section-title">${getTypeDecouverteLabel(type)}</h2>
                <div class="discoveries-grid">
                    ${items.map(item => `
                        <div class="discovery-card rounded-article">
                            ${item.image_url ? `
                            <div class="discovery-image rounded-image">
                                <img src="${item.image_url}" alt="${item.titre_fr}" loading="lazy"
                                     onerror="this.src='https://placehold.co/400x250?text=DECOUVERTE'">
                            </div>
                            ` : ''}
                            
                            <div class="discovery-content">
                                <h3>${item.titre_fr}</h3>
                                <a href="article.html?id=${item.id}" class="discovery-link">
                                    Découvrir →
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `).join('');
    }
    
    function renderCulture(events, container) {
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
                <section class="events-section">
                    <h2 class="section-title">📅 Événements à venir</h2>
                    <div class="events-grid">
                        ${evenementsFuturs.map(event => `
                            <div class="event-card upcoming rounded-article">
                                <div class="event-header">
                                    <h3>${event.titre_fr}</h3>
                                    ${event.image_url ? `
                                    <div class="event-image rounded-image">
                                        <img src="${event.image_url}" alt="${event.titre_fr}" loading="lazy"
                                             onerror="this.src='https://placehold.co/400x250?text=EVENEMENT'">
                                    </div>
                                    ` : ''}
                                    <span class="event-type">${event.type_evenement || 'Événement'}</span>
                                </div>
                                
                                <div class="event-details">
                                    <a href="article.html?id=${event.id}" class="event-link">
                                        <i class="fas fa-info-circle"></i> Voir détails
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        if (evenementsPasses.length > 0) {
            html += `
                <section class="events-section">
                    <h2 class="section-title">📚 Archives des événements</h2>
                    <div class="events-grid past">
                        ${evenementsPasses.map(event => `
                            <div class="event-card past rounded-article">
                                ${event.image_url ? `
                                <div class="event-image rounded-image">
                                    <img src="${event.image_url}" alt="${event.titre_fr}" loading="lazy"
                                         onerror="this.src='https://placehold.co/400x250?text=EVENEMENT'">
                                </div>
                                ` : ''}
                                <h4>${event.titre_fr}</h4>
                                <a href="article.html?id=${event.id}" class="event-link">
                                    Revivre l'événement →
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        container.innerHTML = html || '<p class="no-content">Aucun événement programmé.</p>';
    }
    
    function renderMode(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="fashion-article rounded-article">
                ${article.image_url ? `
                <div class="fashion-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=MODE'">
                    ${article.theme_mode ? `<span class="theme-badge">${article.theme_mode}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="fashion-content">
                    <h2>${article.titre_fr}</h2>
                    
                    <a href="article.html?id=${article.id}" class="read-article">
                        Lire l'article complet →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderAccessoires(articles, container) {
        container.innerHTML = articles.map(article => `
            <div class="accessory-article rounded-article">
                ${article.image_url ? `
                <div class="accessory-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ACCESSOIRE'">
                    ${article.type_accessoire ? `<span class="type-tag">${article.type_accessoire}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="accessory-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="view-details">
                        Voir les détails →
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    function renderBeaute(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="beauty-card rounded-article">
                ${article.image_url ? `
                <div class="beauty-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=BEAUTE'">
                    ${article.type_beaute ? `<div class="beauty-category">${article.type_beaute}</div>` : ''}
                </div>
                ` : ''}
                
                <div class="beauty-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="read-beauty">
                        Lire les conseils →
                    </a>
                </div>
            </article>
        `).join('');
    }
    
    function renderGenericArticles(articles, container, rubrique) {
        container.innerHTML = articles.map(article => `
            <article class="generic-article rounded-article">
                ${article.image_url ? `
                <div class="generic-image rounded-image">
                    <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x250?text=ARTICLE'">
                </div>
                ` : ''}
                
                <div class="generic-content">
                    <h3>${article.titre_fr}</h3>
                    
                    <a href="article.html?id=${article.id}" class="read-generic">
                        Lire l'article →
                    </a>
                </div>
            </article>
        `).join('');
    }

    // ============================================
    // 11. FONCTION POUR CHARGER UN ARTICLE UNIQUE
    // ============================================
    window.loadSingleArticle = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            console.error('❌ Aucun ID d\'article dans l\'URL');
            const container = document.getElementById('article-content');
            if (container) {
                container.innerHTML = `
                    <div class="error-message" style="padding: 40px; text-align: center;">
                        <h2>Erreur</h2>
                        <p>Aucun article spécifié. Retournez à la page précédente.</p>
                        <a href="javascript:history.back()" class="btn-home">Retour</a>
                    </div>
                `;
            }
            return;
        }
        
        const container = document.getElementById('article-content');
        if (!container) {
            console.error('❌ Conteneur article-content non trouvé');
            return;
        }
        
        container.innerHTML = `
            <article class="full-article rounded-article">
                <div class="loading" style="padding: 40px; text-align: center; color: #666;">
                    <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p>Chargement de l'article...</p>
                </div>
            </article>
        `;
        
        try {
            console.log(`🔄 Chargement de l'article ${articleId}...`);
            
            const { data: article, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw new Error(`Erreur de chargement: ${error.message}`);
            }
            
            if (!article) {
                throw new Error('Article non trouvé');
            }
            
            if (article.statut !== 'publié') {
                throw new Error('Article non disponible (statut non publié)');
            }
            
            console.log('✅ Article chargé:', article);
            renderSingleArticle(article);
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            container.innerHTML = `
                <article class="full-article rounded-article">
                    <div class="error-message" style="padding: 40px; text-align: center;">
                        <h2>Erreur de chargement</h2>
                        <p>${error.message}</p>
                        <a href="index.html" class="btn-home">Retour à l'accueil</a>
                    </div>
                </article>
            `;
        }
    };
    
    function renderSingleArticle(article) {
        const container = document.getElementById('article-content');
        
        container.innerHTML = `
            <article class="full-article rounded-article">
                <header class="article-header">
                    <nav class="article-breadcrumb">
                        <a href="index.html">Accueil</a> > 
                        <a href="${article.rubrique}.html">${getRubriqueName(article.rubrique)}</a>
                    </nav>
                    
                    <h1 class="article-title">${article.titre_fr}</h1>
                    
                    <div class="article-meta">
                        <div class="meta-left">
                            <span class="article-date">📅 ${new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                            <span class="article-author">👤 ${article.auteur || 'Rédaction'}</span>
                        </div>
                        
                        <div class="meta-right">
                            <span class="article-rubrique">${getRubriqueName(article.rubrique)}</span>
                            ${getArticleBadge(article)}
                        </div>
                    </div>
                    
                    ${article.image_url ? `
                    <div class="article-hero-image rounded-image">
                        <img src="${article.image_url}" alt="${article.titre_fr}" loading="lazy"
                             onerror="this.src='https://placehold.co/800x400?text=ARTICLE'">
                    </div>
                    ` : ''}
                </header>
                
                <div class="article-body">
                    <div class="article-content-text">
                        ${article.contenu_fr ? formatArticleContent(article.contenu_fr) : '<p>Contenu non disponible.</p>'}
                    </div>
                    
                    ${renderArticleSpecificInfo(article)}
                </div>
                
                <footer class="article-footer">
                    <div class="article-tags">
                        ${getArticleTags(article)}
                    </div>
                    
                    <div class="article-navigation">
                        <a href="${article.rubrique}.html" class="back-to-list">
                            ← Retour à ${getRubriqueName(article.rubrique)}
                        </a>
                    </div>
                </footer>
            </article>
        `;
    }

    // ============================================
    // 12. FONCTIONS UTILITAIRES
    // ============================================
    
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
    
    function getArticleBadge(article) {
        if (article.type_decouverte) return `<span class="specific-badge">🔍 ${article.type_decouverte}</span>`;
        if (article.type_accessoire) return `<span class="specific-badge">💎 ${article.type_accessoire}</span>`;
        if (article.type_beaute) return `<span class="specific-badge">💄 ${article.type_beaute}</span>`;
        if (article.saison) return `<span class="specific-badge">📈 ${article.saison}</span>`;
        if (article.theme_mode) return `<span class="specific-badge">👗 ${article.theme_mode}</span>`;
        if (article.type_evenement) return `<span class="specific-badge">🎫 ${article.type_evenement}</span>`;
        if (article.categorie_actualite) return `<span class="specific-badge">📢 ${article.categorie_actualite}</span>`;
        return '';
    }
    
    function renderArticleSpecificInfo(article) {
        let html = '';
        
        if (article.rubrique === 'visages') {
        html += `
            <div class="specific-info creator-info rounded-article">
                <h3>À propos du créateur</h3>
                ${article.biographie ? `
                <div class="biography" style="margin-bottom: 20px;">
                    <h4 style="color: var(--accent); margin-bottom: 10px;">Présentation</h4>
                    <div class="bio-content" style="background: white; padding: 15px; border-radius: 8px;">
                        ${formatArticleContent(article.biographie)}
                    </div>
                </div>
                ` : ''}
                <ul style="list-style: none; padding: 0; margin: 15px 0;">
                    ${article.nom_marque ? `<li><strong>Marque :</strong> ${article.nom_marque}</li>` : ''}
                    ${article.nom_createur ? `<li><strong>Créateur :</strong> ${article.nom_createur}</li>` : ''}
                    ${article.domaine ? `<li><strong>Domaine :</strong> ${article.domaine}</li>` : ''}
                    ${article.reseaux_instagram ? `<li><strong>Instagram :</strong> <a href="https://instagram.com/${article.reseaux_instagram.replace('@', '')}" target="_blank">${article.reseaux_instagram}</a></li>` : ''}
                    ${article.site_web ? `<li><strong>Site web :</strong> <a href="${article.site_web}" target="_blank">${article.site_web}</a></li>` : ''}
                </ul>
                ${article.interview_fr ? `
                <div class="interview-section" style="margin-top: 20px;">
                    <h4 style="color: var(--accent); margin-bottom: 15px;">Interview</h4>
                    <div class="interview-content" style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent);">
                        ${formatArticleContent(article.interview_fr)}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
        if (article.rubrique === 'culture' && article.type_evenement) {
            html += `
                <div class="specific-info event-info rounded-article" style="margin: 30px 0; padding: 20px; background: rgba(212, 175, 55, 0.05); border-radius: 10px;">
                    <h3>Informations pratiques</h3>
                    <ul style="list-style: none; padding: 0; margin: 15px 0;">
                        ${article.type_evenement ? `<li style="margin-bottom: 10px;"><strong>Type :</strong> ${article.type_evenement}</li>` : ''}
                        ${article.date_evenement ? `<li style="margin-bottom: 10px;"><strong>Date :</strong> ${new Date(article.date_evenement).toLocaleDateString('fr-FR')}</li>` : ''}
                        ${article.heure_evenement ? `<li style="margin-bottom: 10px;"><strong>Heure :</strong> ${article.heure_evenement}</li>` : ''}
                        ${article.lieu ? `<li style="margin-bottom: 10px;"><strong>Lieu :</strong> ${article.lieu}</li>` : ''}
                        ${article.statut_evenement ? `<li style="margin-bottom: 10px;"><strong>Statut :</strong> ${article.statut_evenement}</li>` : ''}
                        ${article.lien_evenement ? `<li style="margin-bottom: 10px;"><strong>Lien :</strong> <a href="${article.lien_evenement}" target="_blank" style="color: var(--accent); text-decoration: none;">${article.lien_evenement}</a></li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        return html;
    }
    
    function formatArticleContent(content) {
        if (!content) return '<p>Contenu non disponible.</p>';
        return content
            .replace(/\n/g, '<br>')
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/## (.*?)\n/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    function getArticleTags(article) {
        const tags = [];
        
        if (article.type_decouverte) tags.push(`🔍 ${article.type_decouverte}`);
        if (article.type_accessoire) tags.push(`💎 ${article.type_accessoire}`);
        if (article.type_beaute) tags.push(`💄 ${article.type_beaute}`);
        if (article.saison) tags.push(`📈 ${article.saison}`);
        if (article.theme_mode) tags.push(`👗 ${article.theme_mode}`);
        if (article.domaine) tags.push(`🏷️ ${article.domaine}`);
        if (article.categorie_actualite) tags.push(`📢 ${article.categorie_actualite}`);
        if (article.type_evenement) tags.push(`🎫 ${article.type_evenement}`);
        
        return tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    }

    // ============================================
    // 13. FONCTIONS POUR FILTRES
    // ============================================
    
    window.setupFilters = function() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                if (typeof filterVisages === 'function') {
                    filterVisages(filter);
                }
            });
        });
    };
    
    window.setupVisageFilters = function() {
        console.log('🔄 Configuration des filtres Visages...');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        if (filterBtns.length === 0) {
            console.log('ℹ️ Aucun filtre trouvé sur cette page');
            return;
        }
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                console.log(`🎯 Filtre sélectionné: ${filter}`);
                
                filterVisages(filter);
            });
        });
        
        setTimeout(() => {
            filterVisages('all');
        }, 500);
    };
    
    async function filterVisages(domain) {
        const container = document.getElementById('visages-container');
        if (!container) return;
        
        container.innerHTML = '<div class="loading" style="padding: 40px; text-align: center; color: #666;">Filtrage en cours...</div>';
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('rubrique', 'visages')
                .eq('statut', 'publié')
                .order('date_publication', { ascending: false });
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                container.innerHTML = '<p class="no-content" style="text-align: center; padding: 40px;">Aucun créateur trouvé.</p>';
                return;
            }
            
            console.log(`📊 ${data.length} créateurs chargés pour filtrage`);
            
            if (domain === 'all') {
                console.log('✅ Affichage de tous les créateurs');
                renderVisages(data, container);
                return;
            }
            
            const domainMap = {
                'haute-couture': ['Styliste haute couture', 'haute-couture', 'couture', 'haute'],
                'streetwear': ['Styliste streetwear', 'street', 'street wear', 'urban'],
                'Designer' : ['Designer']
                'bijoux': ['bijoux', 'bijouterie', 'joaillerie', 'bijou', 'accessoires', 'accessoire', 'sac', 'chaussure'],
                'Artisans du tricot': ['artisants du tricot', 'tricot' ]
                'Autres' :['Autres']
            };
            
            const searchTerms = domainMap[domain] || [domain.toLowerCase()];
            console.log(`🔍 Recherche des termes:`, searchTerms);
            
            let filteredData = data.filter(article => {
                if (!article.domaine) return false;
                
                const domaineLower = article.domaine.toLowerCase().trim();
                
                return searchTerms.some(term => {
                    return domaineLower.includes(term.toLowerCase()) || 
                           term.toLowerCase().includes(domaineLower);
                });
            });
            
            console.log(`🔍 Filtre "${domain}": ${filteredData.length} résultats sur ${data.length} total`);
            
            if (filteredData.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">Aucun créateur trouvé dans la catégorie "${domain}".</p>
                        <button class="filter-btn active" data-filter="all" style="padding: 10px 25px; background: var(--accent); border: none; border-radius: 25px; color: var(--text-dark); font-weight: 600; cursor: pointer;">Voir tous les créateurs</button>
                    </div>
                `;
                
                const allBtn = container.querySelector('button[data-filter="all"]');
                if (allBtn) {
                    allBtn.addEventListener('click', function() {
                        document.querySelectorAll('.filter-btn').forEach(btn => {
                            if (btn.dataset.filter === 'all') {
                                btn.classList.add('active');
                            } else {
                                btn.classList.remove('active');
                            }
                        });
                        filterVisages('all');
                    });
                }
                return;
            }
            
            renderVisages(filteredData, container);
            
        } catch (error) {
            console.error('❌ Erreur filtrage:', error);
            container.innerHTML = `<p class="error" style="text-align: center; padding: 40px; color: #dc3545;">Erreur: ${error.message}</p>`;
        }
    }
    
    window.setupCategoryFilters = function() {
        const categoryElements = document.querySelectorAll('[data-category]');
        categoryElements.forEach(el => {
            el.addEventListener('click', function() {
                const category = this.dataset.category;
                alert(`Filtre: ${category} - Fonctionnalité à implémenter`);
            });
        });
    };
    
    window.initPageData = function() {
        console.log('🔄 Initialisation des données de la page...');
        detectPageAndLoad();
    };

    // ============================================
    // 14. FONCTION DE DÉBOGAGE POUR VOIR LES DOMAINES
    // ============================================
    
    async function debugDomainesVisages() {
        console.log('🔍 Analyse des domaines Visages...');
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('domaine, nom_marque, titre_fr')
                .eq('rubrique', 'visages')
                .eq('statut', 'publié');
            
            if (error) {
                console.error('❌ Erreur:', error);
                return;
            }
            
            if (!data || data.length === 0) {
                console.log('ℹ️ Aucun article Visages trouvé');
                return;
            }
            
            console.log(`📊 ${data.length} articles Visages trouvés`);
            
            const domaines = {};
            data.forEach(article => {
                const domaine = article.domaine || 'non spécifié';
                domaines[domaine] = (domaines[domaine] || 0) + 1;
                console.log(`- ${article.nom_marque || article.titre_fr}: "${domaine}"`);
            });
            
            console.log('📈 Répartition des domaines:');
            Object.entries(domaines).forEach(([domaine, count]) => {
                console.log(`  ${domaine}: ${count} article(s)`);
            });
            
            const domainesUniques = Object.keys(domaines).filter(d => d !== 'non spécifié');
            if (domainesUniques.length > 0) {
                console.log('✅ Filtres recommandés pour votre HTML:');
                domainesUniques.forEach(d => {
                    console.log(`<button class="filter-btn" data-filter="${d.toLowerCase()}">${d}</button>`);
                });
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
        }
    }

    // ============================================
    // 15. EXÉCUTION AUTOMATIQUE
    // ============================================
    setTimeout(() => {
        detectPageAndLoad();
    }, 100);
    
    setTimeout(() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            debugDomainesVisages();
        }
    }, 3000);

    // ============================================
    // 16. OBSERVATEUR D'INTERSECTION (ANIMATIONS)
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
    // 17. SELECTEUR DE THÈME
    // ============================================
    const themeSelectButton = document.getElementById('theme-select-button');
    const themeOptions = document.getElementById('theme-options');
    const themeButtonText = document.getElementById('theme-button-text');
    const body = document.body;

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

    if (themeSelectButton) {
        themeSelectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeOptions.classList.toggle('hidden-options');
            themeSelectButton.parentElement.classList.toggle('open');
        });
    }

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
    
    document.addEventListener('click', () => {
        if (themeOptions && !themeOptions.classList.contains('hidden-options')) {
            themeOptions.classList.add('hidden-options');
            themeSelectButton.parentElement.classList.remove('open');
        }
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('night');
    }

    // ============================================
    // 18. MODAL D'ABONNEMENT
    // ============================================
    const subscribeDesktop = document.getElementById('subscribe-desktop');
    const subscribeMobile = document.getElementById('subscribe-mobile');
    
    const modal = document.getElementById('subscribe-modal');
    const closeModalButton = modal ? modal.querySelector('.close-modal') : null;
    const tabLinks = modal ? modal.querySelectorAll('.tab-link') : [];
    const tabContents = modal ? modal.querySelectorAll('.tab-content') : [];

    const openModal = () => modal.classList.remove('hidden-modal');
    const closeModal = () => modal.classList.add('hidden-modal');

    if (subscribeDesktop) {
        subscribeDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (subscribeMobile) {
        subscribeMobile.addEventListener('click', (e) => {
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
                // Réinitialiser la zone "Autre" à la fermeture
                if (autreDomaineGroup) {
                    autreDomaineGroup.style.display = 'none';
                    if (autreDomaineInput) {
                        autreDomaineInput.required = false;
                        autreDomaineInput.value = '';
                    }
                }
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
            closeModal();
            // Réinitialiser la zone "Autre" à la fermeture
            if (autreDomaineGroup) {
                autreDomaineGroup.style.display = 'none';
                if (autreDomaineInput) {
                    autreDomaineInput.required = false;
                    autreDomaineInput.value = '';
                }
            }
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
            
            // Réinitialiser la zone "Autre" quand on change d'onglet
            if (targetId !== 'creator-register-tab') {
                if (autreDomaineGroup) {
                    autreDomaineGroup.style.display = 'none';
                    if (autreDomaineInput) {
                        autreDomaineInput.required = false;
                        autreDomaineInput.value = '';
                    }
                }
            }
        });
    });

    // ============================================
    // 19. FORMULAIRES D'INSCRIPTION
    // ============================================
    
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
                    .from('Abonnés')
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
            let domaine = document.getElementById('cre-domaine').value;
            
            // Vérifier si c'est "Autre" et récupérer la valeur personnalisée
            if (domaine === 'autre') {
                const domaineAutre = document.getElementById('cre-domaine-autre').value.trim();
                if (!domaineAutre) {
                    alert('Veuillez préciser votre domaine');
                    return;
                }
                domaine = domaineAutre;
            }
            
            console.log('🎨 Tentative inscription créateur:', { marque, domaine });
            
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
                
                if (autreDomaineGroup) {
                    autreDomaineGroup.style.display = 'none';
                    if (autreDomaineInput) {
                        autreDomaineInput.required = false;
                        autreDomaineInput.value = '';
                    }
                }
                
            } catch (error) {
                console.error('💥 Erreur d\'inscription:', error);
                alert('Une erreur est survenue lors de l\'inscription.');
            }
        });
    }

    // ============================================
    // 20. MENU DÉROULANT PRINCIPAL
    // ============================================
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
        
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // ============================================
    // 21. FENÊTRE D'AUTHENTIFICATION AMÉLIORÉE
    // ============================================
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = authModal ? authModal.querySelector('.close-auth-modal') : null;
    const authTabs = authModal ? authModal.querySelectorAll('.auth-tab') : [];
    const adminForm = document.getElementById('admin-form');
    const creatorForm = document.getElementById('creator-form');
    const adminError = document.getElementById('admin-error');
    const creatorError = document.getElementById('creator-error');

    if (authBtn && authModal) {
        authBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

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
    // 22. CONNEXION ADMINISTRATEUR AMÉLIORÉE
    // ============================================
    if (adminForm) {
        adminForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('admin-nom').value.trim();
            const password = document.getElementById('admin-password').value;
            
            console.log('🔐 Tentative connexion admin:', nom);
            
            try {
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
                
                SessionManager.setAdminSession(data.nom, data.email);
                
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'admin.html';
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
                
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
    // 23. CONNEXION CRÉATEUR AMÉLIORÉE
    // ============================================
    if (creatorForm) {
        creatorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const brand = document.getElementById('creator-brand').value.trim();
            const password = document.getElementById('creator-password').value;
            
            console.log('🎨 Tentative connexion créateur:', brand);
            
            try {
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
                
                SessionManager.setCreatorSession(data.id, data.nom_marque);
                
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
    // 24. GESTION DES ÉVÉNEMENTS CLAVIER
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            if (adminError) adminError.style.display = 'none';
            if (creatorError) creatorError.style.display = 'none';
            if (adminForm) adminForm.reset();
            if (creatorForm) creatorForm.reset();
        }
        
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden-modal')) {
            closeModal();
        }
    });

    // ============================================
    // 25. EMPÊCHER LA SOUMISSION PAR DÉFAUT
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
    // 26. FONCTIONS DE COMPATIBILITÉ
    // ============================================
    
    window.loadCoulissesArticles = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadCoulissesArticles');
        loadArticlesByRubrique('coulisses', 'articles-list');
    };
    
    window.loadTrends = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadTrends');
        loadArticlesByRubrique('tendances', 'trends-container');
    };
    
    window.loadVisages = async function(filter = 'all') {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadVisages');
        loadArticlesByRubrique('visages', 'visages-container');
    };
    
    window.loadDiscoveries = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadDiscoveries');
        loadArticlesByRubrique('decouvertes', 'discoveries-container');
    };
    
    window.loadEvents = async function() {
        console.log('⚠️ Utilisation de l\'ancienne fonction loadEvents');
        loadArticlesByRubrique('culture', 'events-container');
    };

    // ============================================
    // 27. FONCTION DE DÉBOGAGE GLOBALE
    // ============================================
    
    async function debugArticles(rubrique) {
        console.log(`🔍 Debug ${rubrique}...`);
        
        try {
            const { data, error, count } = await supabase
                .from('articles')
                .select('*', { count: 'exact' })
                .eq('rubrique', rubrique)
                .eq('statut', 'publié');
            
            if (error) {
                console.error(`❌ Erreur query ${rubrique}:`, error);
                return;
            }
            
            console.log(`📊 ${rubrique}: ${count} articles trouvés`);
            
            if (data && data.length > 0) {
                data.forEach((article, index) => {
                    console.log(`  ${index + 1}. ${article.titre_fr} (ID: ${article.id})`);
                    console.log(`     Image: ${article.image_url ? '✓' : '✗'}`);
                    console.log(`     Statut: ${article.statut}`);
                    console.log(`     Date: ${article.date_publication}`);
                });
            }
            
        } catch (error) {
            console.error(`💥 Exception debug ${rubrique}:`, error);
        }
    }
    
    window.debugArticles = debugArticles;
    window.debugDomainesVisages = debugDomainesVisages;
    
    setTimeout(() => {
        console.log('🔍 Lancement du débogage des articles...');
        debugArticles('actualites');
        debugArticles('visages');
        debugArticles('mode');
    }, 2000);
    
    console.log('🚀 Script principal centralisé chargé avec succès !');
});
