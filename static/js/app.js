/**
 * App.js - Main Application Logic & View Routing
 */

document.addEventListener('DOMContentLoaded', () => {

    const viewAuth = document.getElementById('view-auth');
    const viewMain = document.getElementById('view-main');
    const btnLogout = document.getElementById('btn-logout');

    const ui = {
        greeting: document.getElementById('user-greeting'),
        date: document.getElementById('current-date'),
        navAvatar: document.getElementById('nav-avatar'),
        navUsername: document.getElementById('nav-username')
    };

    // Routing Logic
    function renderApp() {
        const session = Storage.getSession();
        
        if (session && session.currentUserId) {
            // User is logged in
            viewAuth.classList.add('hidden');
            viewMain.classList.remove('hidden');
            
            initializeDashboard();
        } else {
            // Unauthenticated
            viewMain.classList.add('hidden');
            viewAuth.classList.remove('hidden');
        }
    }

    function initializeDashboard() {
        const currentUser = Storage.getCurrentUser();
        
        // Update header
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        ui.date.innerText = now.toLocaleDateString('en-US', options);
        
        ui.greeting.innerText = `Welcome back, ${currentUser.profile.username}!`;
        ui.navUsername.innerText = currentUser.profile.username;
        ui.navAvatar.innerText = currentUser.profile.username.charAt(0).toUpperCase();

        // Check streak on initialization
        checkAndUpdateStreak(currentUser);
        
        // Select Dashboard tab by default
        document.querySelector('.nav-link[data-target="dashboard"]').click();
        
        // Show Welcome animation
        ui.greeting.style.animation = 'slideUp 0.6s var(--spring)';
    }

    // Nav-link routing
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all content sections (once more are added like habits, water, etc.)
            contentSections.forEach(section => section.classList.remove('active'));
            
            const targetSection = document.getElementById(`content-${target}`);
            if(targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Logout
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        Storage.clearSession();
        renderApp();
    });

    // Listen to Auth Changes
    window.addEventListener('auth-changed', () => {
        renderApp();
    });
    
    // Streak logic hook for Step 3 implementation later (mocking for now to avoid errors)
    function checkAndUpdateStreak(user) {
        // Will be implemented fully in step 3
        const counter = document.getElementById('login-streak-counter');
        if (counter && user.loginHistory) {
             counter.innerText = user.loginHistory.length; // Temporary simplistic representation
        }
    }

    // --- Polish: Keyboard Shortcuts ---
    window.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const key = e.key.toLowerCase();
        
        if (key === 'n') {
            e.preventDefault();
            const btnCreate = document.getElementById('btn-create-habit');
            if(btnCreate) {
                document.querySelector('.nav-link[data-target="habits"]').click();
                btnCreate.click();
            }
        } else if (key === 'w') {
            document.querySelector('.nav-link[data-target="water"]').click();
        } else if (key === 'd') {
            document.querySelector('.nav-link[data-target="dashboard"]').click();
        }
    });

    // --- Polish: Loading Skeleton & Onboarding Simulation ---
    // Instead of a full complex flow, we will detect if it's the very first login 
    // and show a welcome alert. Skeleton simulation inside initializeDashboard:
    
    // Initial check
    renderApp();
});
