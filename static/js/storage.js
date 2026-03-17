/**
 * Storage.js - Handles all localStorage interactions and initializes default schemas
 */
const STORAGE_USERS = 'habitapp_users';
const STORAGE_SESSION = 'habitapp_session';

const Storage = {
    getUsers: function() {
        return JSON.parse(localStorage.getItem(STORAGE_USERS)) || {};
    },
    
    saveUsers: function(users) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    },

    getSession: function() {
        return JSON.parse(localStorage.getItem(STORAGE_SESSION));
    },

    saveSession: function(session) {
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
    },

    clearSession: function() {
        localStorage.removeItem(STORAGE_SESSION);
    },

    // User Operations
    createUser: function(userData) {
        const users = this.getUsers();
        const userId = 'user_' + Date.now();
        
        users[userId] = {
            profile: {
                id: userId,
                username: userData.username,
                email: userData.email,
                avatarColor: userData.avatarColor,
                createdAt: new Date().toISOString()
            },
            habits: [],
            waterLogs: {}, // e.g., {'2026-03-15': 1500}
            loginHistory: [], // array of ISO dates or YYYY-MM-DD
            badges: [],
            xp: 0,
            settings: {
                waterGoal: 2000,
                theme: 'dark'
            }
        };
        
        this.saveUsers(users);
        return userId;
    },

    getUserByEmail: function(email) {
        const users = this.getUsers();
        for (const userId in users) {
            if (users[userId].profile.email === email) {
                return Object.assign({ id: userId }, users[userId]);
            }
        }
        return null;
    },
    
    getCurrentUser: function() {
        const session = this.getSession();
        if (!session || !session.currentUserId) return null;
        
        const users = this.getUsers();
        return users[session.currentUserId] || null;
    },

    // Record Login 
    recordLogin: function() {
        const session = this.getSession();
        if (!session || !session.currentUserId) return;
        
        const users = this.getUsers();
        const user = users[session.currentUserId];
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (!user.loginHistory) user.loginHistory = [];
        
        // Prevent duplicate daily logins in history
        if (!user.loginHistory.includes(todayStr)) {
            user.loginHistory.push(todayStr);
            this.saveUsers(users);
        }
    }
};
