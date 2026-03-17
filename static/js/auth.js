/**
 * Auth.js - Handles signup, login, and UI related to authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const tabs = document.querySelectorAll('.tab-btn');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.tab === 'login') {
                formLogin.classList.remove('hidden');
                formSignup.classList.add('hidden');
            } else {
                formLogin.classList.add('hidden');
                formSignup.classList.remove('hidden');
            }
        });
    });

    // Color Picker logic
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(opt => {
        opt.addEventListener('click', function() {
            colorOptions.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Handle Signup
    formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value; // In a real app, hash this!
        const colorOpt = document.querySelector('.color-option.active');
        const color = colorOpt ? colorOpt.dataset.color : 'teal';

        if (!username || !email || !password) return alert('Please fill in all fields.');

        const existingUser = Storage.getUserByEmail(email);
        if (existingUser) {
            return alert('An account with this email already exists.');
        }

        const userId = Storage.createUser({
            username: username,
            email: email,
            avatarColor: color
        });

        // Set session
        Storage.saveSession({
            currentUserId: userId,
            loginTime: Date.now()
        });

        Storage.recordLogin();
        
        // Let main app know to render dashboard
        window.dispatchEvent(new Event('auth-changed'));
    });

    // Handle Login
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) return alert('Please fill in all fields.');

        const user = Storage.getUserByEmail(email);
        
        if (!user) {
            return alert('Invalid email or password.');
            // Note: For simplicity, ignoring password check. A simple web demo logic.
        }

        // Set session
        Storage.saveSession({
            currentUserId: user.id,
            loginTime: Date.now()
        });

        Storage.recordLogin();

        // Let main app know to render dashboard
        window.dispatchEvent(new Event('auth-changed'));
    });
});
