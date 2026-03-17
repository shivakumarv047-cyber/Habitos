/**
 * Stats.js - Handles Chart.js initializations and analytics rendering
 */
document.addEventListener('DOMContentLoaded', () => {

    const statsNav = document.querySelector('.nav-link[data-target="stats"]');
    if(statsNav) {
        statsNav.addEventListener('click', renderStats);
    }
    window.addEventListener('auth-changed', () => {
        // Prepare rendering if on stats page
        if(document.getElementById('content-stats').classList.contains('active')){
            renderStats();
        }
    });

    let chartWeeklyInstance = null;
    let chartWaterInstance = null;

    function renderStats() {
        const user = Storage.getCurrentUser();
        if(!user) return;

        // Generate Last 7 Days labels
        const labels = [];
        const habitData = [];
        const waterData = [];
        
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', {weekday:'short'}));
            
            // Calculate total habits completed on this day
            let completed = 0;
            user.habits.forEach(h => {
                if((h.history[dStr] || 0) >= h.target) completed++;
            });
            habitData.push(completed);

            // Water log
            waterData.push(user.waterLogs[dStr] || 0);
        }

        renderWeeklyChart(labels, habitData);
        renderWaterChart(labels, waterData, user.settings.waterGoal);
        renderTopHabits(user.habits);
    }

    function renderWeeklyChart(labels, data) {
        const ctx = document.getElementById('chart-weekly');
        if(!ctx) return;

        if(chartWeeklyInstance) chartWeeklyInstance.destroy();

        chartWeeklyInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Habits Completed',
                    data: data,
                    backgroundColor: 'rgba(0, 245, 212, 0.6)',
                    borderColor: '#00F5D4',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderWaterChart(labels, data, goal) {
        const ctx = document.getElementById('chart-water');
        if(!ctx) return;

        if(chartWaterInstance) chartWaterInstance.destroy();

        // Create a horizontal line for goal
        const goalData = labels.map(() => goal);

        chartWaterInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Water Intake (ml)',
                        data: data,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Goal',
                        data: goalData,
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
                    x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
                },
                plugins: {
                    legend: { labels: { color: '#94A3B8' } }
                }
            }
        });
    }

    function renderTopHabits(habits) {
        const list = document.getElementById('stats-top-habits');
        if(!list) return;
        list.innerHTML = '';

        if(habits.length === 0) {
            list.innerHTML = '<li style="color:var(--text-muted)">No habits tracked yet.</li>';
            return;
        }

        // Sort by longest streak
        const sorted = [...habits].sort((a,b) => b.longestStreak - a.longestStreak);
        
        sorted.slice(0, 3).forEach(h => {
            const li = document.createElement('li');
            li.style.padding = '0.75rem 0';
            li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            
            li.innerHTML = `
                <span>${h.icon} ${h.name}</span>
                <span class="accent">Best Streak: ${h.longestStreak} 🔥</span>
            `;
            list.appendChild(li);
        });
    }
});
