/**
 * Water.js - Handles logic and animations for the Water Tracker step
 */

document.addEventListener('DOMContentLoaded', () => {

    const todayStr = new Date().toISOString().split('T')[0];

    // UI Elements
    const elements = {
        level: document.getElementById('main-water-level'),
        currentText: document.getElementById('water-current-text'),
        goalText: document.getElementById('water-goal-text'),
        percentText: document.getElementById('water-percent-text'),
        editGoalBtn: document.getElementById('btn-edit-water-goal'),
        customAmount: document.getElementById('custom-water-amount'),
        customBtn: document.getElementById('btn-custom-water'),
        quickBtns: document.querySelectorAll('.btn-water, .btn-water-quick') // Both main page and sidebar
    };

    let userGoal = 2000;
    let currentAmount = 0;

    // Listen to session start & updates
    window.addEventListener('auth-changed', loadWaterData);

    function loadWaterData() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        // Initialize user defaults for water
        userGoal = user.settings.waterGoal || 2000;
        
        // Ensure water log object exists
        if (!user.waterLogs) user.waterLogs = {};
        
        currentAmount = user.waterLogs[todayStr] || 0;
        
        updateWaterUI();
    }

    function addWater(amount) {
        const user = Storage.getCurrentUser();
        if(!user) return;

        currentAmount += amount;
        user.waterLogs[todayStr] = currentAmount;
        
        // Save back
        const allUsers = Storage.getUsers();
        allUsers[user.id] = user;
        Storage.saveUsers(allUsers);

        updateWaterUI();
        
        // Add subtle click animation/haptic feel
        if("vibrate" in navigator) navigator.vibrate(50);
    }

    function updateWaterUI() {
        if (!elements.level) return;

        let percentage = Math.round((currentAmount / userGoal) * 100);
        
        // Cap visual at 100% inside the glass but let numbers go higher
        let visualPercent = percentage > 100 ? 100 : percentage;

        elements.level.style.height = `${visualPercent}%`;
        animateValue(elements.currentText, currentAmount, 'ml');
        elements.goalText.innerText = `${userGoal}ml`;
        elements.percentText.innerText = `${percentage}%`;

        // Update colors based on progress
        // Red -> Yellow -> Blue/Teal
        let color = '';
        let glow = '';
        if (percentage < 30) {
            color = '#EF4444'; // Red
            glow = '0 0 20px rgba(239, 68, 68, 0.5)';
        } else if (percentage < 70) {
            color = 'var(--accent-amber)'; // Yellow/Orange
            glow = '0 0 20px rgba(255, 179, 71, 0.5)';
        } else {
            color = '#3B82F6'; // Blue
            glow = '0 0 25px rgba(59, 130, 246, 0.6)';
        }

        elements.level.style.backgroundColor = color;
        elements.level.style.boxShadow = glow;

        // Check for 100% celebration
        if (percentage >= 100 && percentage - Math.round(((currentAmount-250)/userGoal)*100) < 100) {
            // Trigger celebration only exactly when crossing 100% (approx calculation logic)
            triggerWaterCelebration();
        }

        // Also update the mini right-panel water bar
        const miniWater = document.querySelector('.water-mini-progress .water-fill');
        if (miniWater) {
            miniWater.style.width = `${visualPercent}%`;
            miniWater.style.backgroundColor = color;
        }
    }

    function triggerWaterCelebration() {
        if(typeof confetti !== 'undefined') {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#3B82F6', '#60A5FA', '#00F5D4']
            });
        }
        
        // Add ripple effect to glass
        elements.level.classList.add('ripple-effect');
        setTimeout(() => elements.level.classList.remove('ripple-effect'), 1000);
    }

    // Number animator
    function animateValue(obj, end, suffix) {
        let start = parseInt(obj.innerText) || 0;
        let diff = end - start;
        if(diff === 0) { obj.innerText = end + suffix; return; }
        
        let startTimestamp = null;
        const duration = 800;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * diff + start) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Bind events
    elements.quickBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amt = parseInt(e.currentTarget.dataset.amount);
            addWater(amt);
        });
    });

    if(elements.customBtn) {
        elements.customBtn.addEventListener('click', () => {
            const amt = parseInt(elements.customAmount.value);
            if(amt && amt > 0) {
                addWater(amt);
                elements.customAmount.value = '';
            }
        });
    }

    if(elements.editGoalBtn) {
        elements.editGoalBtn.addEventListener('click', () => {
            const newGoal = prompt("Enter your new daily water goal (in ml):", userGoal);
            if(newGoal && !isNaN(newGoal) && newGoal > 0) {
                userGoal = parseInt(newGoal);
                
                // Save to user settings
                const user = Storage.getCurrentUser();
                user.settings.waterGoal = userGoal;
                const allUsers = Storage.getUsers();
                allUsers[user.id] = user;
                Storage.saveUsers(allUsers);
                
                updateWaterUI();
            }
        });
    }
});
