/**
 * Rewards.js - Handles XP, Leveling, and Badge Unlocks
 */
document.addEventListener('DOMContentLoaded', () => {

    const BADGES = [
        { id: 'b1', name: 'First Login', icon: '👋', description: 'Log in for the first time.', condition: (u) => u.loginHistory.length >= 1 },
        { id: 'b2', name: '3-Day Streak', icon: '🔥', description: 'Log in 3 days in a row.', condition: (u) => u.loginHistory.length >= 3 },
        { id: 'b3', name: '7-Day Warrior', icon: '⚔️', description: 'Log in 7 days in a row.', condition: (u) => u.loginHistory.length >= 7 },
        { id: 'b4', name: 'Hydration Hero', icon: '🌊', description: 'Drink your water goal once.', condition: (u) => Object.values(u.waterLogs).some(v => v >= u.settings.waterGoal) },
        { id: 'b5', name: 'Habit Starter', icon: '🌱', description: 'Complete your first habit.', condition: (u) => {
            return u.habits.some(h => Object.values(h.history).some(v => v >= h.target));
        }},
        { id: 'b6', name: 'Perfect Week', icon: '⭐', description: 'Complete a 7-day streak on any habit.', condition: (u) => u.habits.some(h => h.longestStreak >= 7) }
    ];

    window.addEventListener('auth-changed', evaluateRewards);
    // Bind to the nav click for updates just in case
    const rewardsNav = document.querySelector('.nav-link[data-target="rewards"]');
    if(rewardsNav) {
        rewardsNav.addEventListener('click', evaluateRewards);
    }

    function evaluateRewards() {
        const user = Storage.getCurrentUser();
        if(!user) return;

        let earnedNewBadge = false;
        if(!user.badges) user.badges = [];
        
        // Ensure user obj has XP
        if(typeof user.xp !== 'number') user.xp = 0;

        BADGES.forEach(badge => {
            if(!user.badges.includes(badge.id)) {
                try {
                    if(badge.condition(user)) {
                        user.badges.push(badge.id);
                        user.xp += 50; // Award XP for badge
                        earnedNewBadge = true;
                        
                        setTimeout(() => showBadgeUnlocked(badge), 500);
                    }
                } catch(e) { console.error('Error evaluating badge', badge.id, e); }
            }
        });

        // Calculate Level (Simple formula: Level = floor(XP / 100) + 1)
        const currentLevel = Math.floor(user.xp / 100) + 1;
        const xpForNext = currentLevel * 100;
        const currentLevelXP = user.xp % 100;
        const xpPercent = (currentLevelXP / 100) * 100;

        // Render UI
        const levelEl = document.getElementById('reward-level');
        const xpEl = document.getElementById('reward-xp');
        const xpBar = document.getElementById('reward-xp-bar');

        if(levelEl) levelEl.innerText = `Lv ${currentLevel}`;
        if(xpEl) xpEl.innerText = `${user.xp} XP total`;
        if(xpBar) xpBar.style.width = `${xpPercent}%`;

        renderBadges(user.badges);

        if(earnedNewBadge) {
            const allUsers = Storage.getUsers();
            allUsers[user.id] = user;
            Storage.saveUsers(allUsers);
        }
    }

    function renderBadges(userBadgeIds) {
        const grid = document.getElementById('badge-grid');
        if(!grid) return;
        grid.innerHTML = '';

        BADGES.forEach(badge => {
            const isUnlocked = userBadgeIds.includes(badge.id);
            const card = document.createElement('div');
            card.className = `preset-card ${isUnlocked ? '' : 'locked-badge'}`;
            card.style.opacity = isUnlocked ? '1' : '0.4';
            card.style.filter = isUnlocked ? 'none' : 'grayscale(100%)';
            
            card.innerHTML = `
                <div class="preset-icon" style="font-size:2.5rem; background: ${isUnlocked ? 'rgba(255, 179, 71, 0.2)' : 'rgba(255,255,255,0.05)'}">${isUnlocked ? badge.icon : '🔒'}</div>
                <div class="preset-title" style="color: ${isUnlocked ? 'var(--accent-amber)' : 'inherit'}">${badge.name}</div>
                <div class="preset-freq">${badge.description}</div>
            `;
            grid.appendChild(card);
        });
    }

    function showBadgeUnlocked(badge) {
        alert(`🏆 Achievement Unlocked: ${badge.name}!\n${badge.description}\n+50 XP`);
        if(typeof confetti !== 'undefined') {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#FFB347', '#F59E0B'] });
        }
    }

});
