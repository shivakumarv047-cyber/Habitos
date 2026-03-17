/**
 * Dashboard.js - Handles the logic for Daily Login Streaks and general Dashboard updates
 */

document.addEventListener('DOMContentLoaded', () => {

    // Listen to when the main view is activated
    window.addEventListener('auth-changed', () => {
        const session = Storage.getSession();
        if (session && session.currentUserId) {
            updateDashboardData();
        }
    });

    // Helper: calculate difference in days
    function getDaysDiff(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        // Normalize time to midnight
        d1.setHours(0,0,0,0);
        d2.setHours(0,0,0,0);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    function calculateStreak(loginHistory) {
        if (!loginHistory || loginHistory.length === 0) return 0;

        // Sort dates chronologically
        const sortedDates = [...loginHistory].sort((a,b) => new Date(a) - new Date(b));
        
        const todayStr = new Date().toISOString().split('T')[0];
        let streak = 0;
        let currentDateStr = sortedDates[sortedDates.length - 1];

        // If last login is not today or yesterday, streak is broken
        if (getDaysDiff(currentDateStr, todayStr) > 1) {
            return 0; // Streak broken
        }

        let tempDate = new Date(currentDateStr);

        for (let i = sortedDates.length - 1; i >= 0; i--) {
            const checkDateStr = sortedDates[i];
            
            // Allow same day multiple logs, but only count as 1
            if (i < sortedDates.length - 1 && checkDateStr === sortedDates[i+1]) {
                continue;
            }

            const diff = getDaysDiff(tempDate.toISOString().split('T')[0], checkDateStr);
            
            if (diff <= 1) {
                streak++;
                tempDate = new Date(checkDateStr);
            } else {
                break;
            }
        }

        return streak;
    }

    function checkMilestone(streak) {
        const milestones = [3, 7, 14, 30, 60, 100];
        if (milestones.includes(streak)) {
            triggerConfetti();
            alert(`🎉 Amazing! You've reached a ${streak}-day login streak!`);
            // In a fuller implementation, we'd add the badge to the user's "badges" array
        }
    }

    function updateDashboardData() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        // 1. Update Username Greeting 
        const greetingEl = document.getElementById('user-greeting');
        if(greetingEl) greetingEl.innerHTML = `Welcome back, <span class="accent">${user.profile.username}</span>!`;

        // 2. Update Streak
        const streakCounter = calculateStreak(user.loginHistory);
        const counterEl = document.getElementById('login-streak-counter');
        
        // Animate counter
        const currentVal = parseInt(counterEl.innerText) || 0;
        if (currentVal !== streakCounter) {
            animateValue(counterEl, currentVal, streakCounter, 1000);
            checkMilestone(streakCounter);
        } else {
            counterEl.innerText = streakCounter;
        }

        const streakIcon = document.querySelector('.streak-icon');
        if (streakCounter > 0) {
            streakIcon.style.color = '#EF4444'; // Flame color if active
            streakIcon.style.textShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
        } else {
            streakIcon.style.color = 'var(--text-muted)';
            streakIcon.style.textShadow = 'none';
        }
    }

    function triggerConfetti() {
        if(typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00F5D4', '#FFB347', '#A78BFA']
            });
        }
    }

    // Standard counter animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Quick expose to window for other scripts 
    window.updateDashboardData = updateDashboardData;
});
