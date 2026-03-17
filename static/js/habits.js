/**
 * Habits.js - Manages the preset library, custom habit creation, and daily tracking
 */

document.addEventListener('DOMContentLoaded', () => {

    const presetHabitsData = [
        { id: 'p1', name: 'Meditate', icon: '🧘', color: '#A78BFA', frequency: 'Daily', target: 1 },
        { id: 'p2', name: 'Exercise', icon: '🏃', color: '#EF4444', frequency: 'Daily', target: 1 },
        { id: 'p3', name: 'Read 30 mins', icon: '📚', color: '#FFB347', frequency: 'Daily', target: 1 },
        { id: 'p4', name: 'Sleep 8 hrs', icon: '🛌', color: '#3B82F6', frequency: 'Daily', target: 1 },
        { id: 'p5', name: 'Eat healthy', icon: '🥗', color: '#10B981', frequency: 'Daily', target: 1 },
        { id: 'p6', name: 'No social media', icon: '🚫', color: '#F87171', frequency: 'Daily', target: 1 },
        { id: 'p7', name: 'Journal', icon: '✍️', color: '#A78BFA', frequency: 'Daily', target: 1 },
        { id: 'p8', name: 'Clean workspace', icon: '🧹', color: '#6EE7B7', frequency: 'Daily', target: 1 },
        { id: 'p9', name: 'No screen < 10pm', icon: '📵', color: '#9CA3AF', frequency: 'Daily', target: 1 },
        { id: 'p10', name: 'Work on goal', icon: '🎯', color: '#F59E0B', frequency: 'Daily', target: 1 },
        { id: 'p11', name: 'Take vitamins', icon: '🌿', color: '#34D399', frequency: 'Daily', target: 1 },
        { id: 'p12', name: 'Learn something', icon: '🧠', color: '#6366F1', frequency: 'Daily', target: 1 },
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    // UI Elements
    const elements = {
        gridPreset: document.getElementById('preset-habits-grid'),
        listAll: document.getElementById('all-habits-list'),
        listToday: document.getElementById('today-habit-list'),
        
        btnCreate: document.getElementById('btn-create-habit'),
        btnAddDashboard: document.getElementById('btn-add-habit'),
        modalHabit: document.getElementById('modal-habit'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        formHabit: document.getElementById('form-habit'),
        colorOptions: document.querySelectorAll('#habit-color .color-option'),
        
        // Progress UI
        progressText: document.getElementById('today-percentage'),
        progressCount: document.getElementById('today-completed-count'),
        progressTotal: document.getElementById('today-total-count'),
        progressBar: document.getElementById('main-progress-bar')
    };

    window.addEventListener('auth-changed', loadHabitsData);

    function loadHabitsData() {
        const user = Storage.getCurrentUser();
        if(!user) return;
        renderPresetHabits();
        renderUserHabits(user.habits);
        updateDailyProgress(user.habits);
    }

    // --- Modal Logic ---
    function openModal() { elements.modalHabit.classList.add('active'); }
    function closeModal() { elements.modalHabit.classList.remove('active'); elements.formHabit.reset(); }
    
    if(elements.btnCreate) elements.btnCreate.addEventListener('click', openModal);
    if(elements.btnAddDashboard) elements.btnAddDashboard.addEventListener('click', () => {
        document.querySelector('.nav-link[data-target="habits"]').click();
        openModal();
    });
    if(elements.btnCloseModal) elements.btnCloseModal.addEventListener('click', closeModal);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if(e.target === elements.modalHabit) closeModal();
    });

    // Custom Habit Form Submission
    elements.colorOptions.forEach(opt => {
        opt.addEventListener('click', function() {
            elements.colorOptions.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if(elements.formHabit) {
        elements.formHabit.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('habit-name').value.trim();
            const icon = document.getElementById('habit-icon').value.trim() || '⭐️';
            const target = parseInt(document.getElementById('habit-target').value) || 1;
            const colorOpt = document.querySelector('#habit-color .color-option.active');
            const color = colorOpt ? colorOpt.dataset.color : 'var(--accent-teal)';

            const user = Storage.getCurrentUser();
            if(user.habits.length >= 20) return alert("Maximum 20 habits allowed.");

            const newHabit = {
                id: 'h_' + Date.now(),
                name: name,
                icon: icon,
                color: color,
                frequency: 'Daily',
                target: target,
                createdAt: new Date().toISOString(),
                history: {},
                currentStreak: 0,
                longestStreak: 0
            };

            user.habits.push(newHabit);
            saveUser(user);
            
            closeModal();
            loadHabitsData();
        });
    }

    // --- Presets ---
    function renderPresetHabits() {
        if(!elements.gridPreset) return;
        elements.gridPreset.innerHTML = '';
        
        presetHabitsData.forEach(preset => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div class="preset-icon" style="color: ${preset.color}; background: ${preset.color}20">${preset.icon}</div>
                <div class="preset-title">${preset.name}</div>
                <div class="preset-freq">${preset.frequency}</div>
                <button class="btn-add-preset" data-id="${preset.id}">+ Add</button>
            `;
            elements.gridPreset.appendChild(card);
        });

        document.querySelectorAll('.btn-add-preset').forEach(btn => {
            btn.addEventListener('click', (e) => addPresetToUser(e.currentTarget.dataset.id));
        });
    }

    function addPresetToUser(presetId) {
        const preset = presetHabitsData.find(p => p.id === presetId);
        if(!preset) return;

        const user = Storage.getCurrentUser();
        if(user.habits.length >= 20) return alert("Maximum 20 habits allowed.");
        if(user.habits.find(h => h.name === preset.name)) return alert("You are already tracking this habit.");

        user.habits.push({
            id: 'h_' + Date.now(),
            name: preset.name,
            icon: preset.icon,
            color: preset.color,
            frequency: preset.frequency,
            target: preset.target,
            createdAt: new Date().toISOString(),
            history: {},
            currentStreak: 0,
            longestStreak: 0
        });

        saveUser(user);
        loadHabitsData();
        alert(`"${preset.name}" added!`);
    }

    // --- Rendering Habits ---
    function renderUserHabits(habits) {
        // "My Habits" tab list
        if(elements.listAll) {
            if(habits.length === 0) {
                elements.listAll.innerHTML = `<div class="p-4 text-center rounded" style="background: rgba(255,255,255,0.05); grid-column: 1/-1;">You haven't added any habits yet. Choose from the presets above or create a custom one!</div>`;
            } else {
                elements.listAll.innerHTML = '';
                habits.forEach(habit => {
                    const card = document.createElement('div');
                    card.className = 'glass-card p-4 d-flex align-items-center gap-3';
                    card.style.display = 'flex'; card.style.gap = '1rem'; card.style.padding = '1rem';
                    card.innerHTML = `
                        <div class="preset-icon" style="color: ${habit.color}; background: ${habit.color}20">${habit.icon}</div>
                        <div style="flex:1">
                            <h4>${habit.name}</h4>
                            <p style="color: var(--text-muted); font-size: 0.8rem;">${habit.frequency} • Target: ${habit.target}/day</p>
                        </div>
                        <div style="color: #EF4444; font-weight: bold;">🔥 ${habit.currentStreak}</div>
                    `;
                    elements.listAll.appendChild(card);
                });
            }
        }

        // "Dashboard" Today's Habits
        if(elements.listToday) {
            elements.listToday.innerHTML = '';
            if(habits.length === 0) {
                elements.listToday.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">No habits tracked yet. Start building good habits today!</p>`;
                return;
            }

            habits.forEach(habit => {
                const todayCurrent = habit.history[todayStr] || 0;
                const isCompleted = todayCurrent >= habit.target;
                
                const card = document.createElement('div');
                card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
                card.dataset.id = habit.id;
                
                let targetUI = '';
                if(habit.target > 1) {
                    targetUI = `<span class="habit-target-count" style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; font-size:0.8rem;">${todayCurrent}/${habit.target}</span>`;
                }

                card.innerHTML = `
                    <div class="habit-check">✓</div>
                    <div class="habit-info">
                        <div class="habit-name">${habit.name} ${targetUI}</div>
                        <div class="habit-meta">
                            <span class="habit-streak">🔥 ${habit.currentStreak}</span>
                            <span>${habit.frequency}</span>
                        </div>
                    </div>
                    <div class="preset-icon" style="color: ${habit.color}; background: ${habit.color}20; width:40px; height:40px; font-size: 1.5rem;">${habit.icon}</div>
                `;
                
                // Add check-off logic
                const checkBtn = card.querySelector('.habit-check');
                checkBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleHabit(habit.id);
                });

                elements.listToday.appendChild(card);
            });
        }
    }

    function toggleHabit(habitId) {
        const user = Storage.getCurrentUser();
        const habit = user.habits.find(h => h.id === habitId);
        if(!habit) return;

        let current = habit.history[todayStr] || 0;
        
        if(current >= habit.target) {
            // Uncheck (for simplicity, reset to 0)
            habit.history[todayStr] = 0;
        } else {
            // Check off/increment
            habit.history[todayStr] = current + 1;
            
            if(habit.history[todayStr] >= habit.target) {
                triggerConfetti();
                if("vibrate" in navigator) navigator.vibrate([30, 50, 30]);
                
                // Temporary simplified streak increment (Full logic in Step 8)
                habit.currentStreak += 1; 
                if(habit.currentStreak > habit.longestStreak) {
                    habit.longestStreak = habit.currentStreak;
                }
            } else {
                if("vibrate" in navigator) navigator.vibrate(20);
            }
        }
        
        saveUser(user);
        loadHabitsData();
    }

    function updateDailyProgress(habits) {
        if(!elements.progressText) return;
        if(habits.length === 0) {
            elements.progressText.innerText = '0%';
            elements.progressCount.innerText = '0';
            elements.progressTotal.innerText = '0';
            elements.progressBar.style.width = '0%';
            return;
        }

        const total = habits.length;
        const completed = habits.filter(h => (h.history[todayStr] || 0) >= h.target).length;
        const percent = Math.round((completed / total) * 100);

        elements.progressCount.innerText = completed;
        elements.progressTotal.innerText = total;
        
        animateValue(elements.progressText, percent, '%');
        elements.progressBar.style.width = `${percent}%`;
    }

    // Helpers
    function saveUser(user) {
        const allUsers = Storage.getUsers();
        allUsers[user.id] = user;
        Storage.saveUsers(allUsers);
    }
    
    function triggerConfetti() {
        if(typeof confetti !== 'undefined') {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#00F5D4', '#A78BFA'] });
        }
    }

    function animateValue(obj, end, suffix) {
        let start = parseInt(obj.innerText) || 0;
        let diff = end - start;
        if(diff === 0) { obj.innerText = end + suffix; return; }
        let startTimestamp = null;
        const duration = 500;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * diff + start) + suffix;
            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = end + suffix;
        };
        window.requestAnimationFrame(step);
    }
});
