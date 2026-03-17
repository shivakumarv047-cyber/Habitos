import { useState, useEffect, useMemo } from 'react';
import { Flame, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getHabitsRealtime, getWeeklyWater } from '../firebase/dbFunctions';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const StatsPage = ({ user, userData }) => {
  const [habits, setHabits] = useState([]);
  const [waterWeekly, setWaterWeekly] = useState([]);

  useEffect(() => {
    const unsub = getHabitsRealtime(user.uid, setHabits);
    getWeeklyWater(user.uid).then(data => setWaterWeekly(data.reverse()));
    return unsub;
  }, [user.uid]);

  const totalCompletionsAllTime = habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
  const bestStreakAllTime = Math.max(...habits.map(h => h.longestStreak || 0), 0);
  const currentActiveStreaks = habits.filter(h => h.currentStreak > 0).length;

  const weeklyHabitData = useMemo(() => {
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const completedCount = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      counts.push(completedCount);
    }
    return { labels: days, data: counts };
  }, [habits]);

  const chartOptionsTemplate = (isLine) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,15,30,0.9)',
        titleFont: { family: 'Nunito', size: 14 },
        bodyFont: { family: 'Orbitron', size: 16 }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)' } },
      y: { 
        grid: { color: 'rgba(255,255,255,0.05)' }, 
        ticks: { color: 'var(--text-muted)', stepSize: isLine ? undefined : 1 },
        beginAtZero: true
      }
    }
  });

  const generateHeatmap = () => {
    const grid = [];
    // Last 90 days grid (13 cols x 7 rows)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Find the start date (90 days ago) aligned to Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - 90);
    start.setDate(start.getDate() - start.getDay()); // backtrack to Sunday
    
    // Create mapping of dates to counts
    const countsMap = {};
    for (let i = 0; i <= 90 + today.getDay(); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toDateString();
      const count = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      countsMap[dateStr] = { date: d, count };
    }

    // Build columns
    let currentWeek = [];
    for (let i = 0; i <= 90 + today.getDay(); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toDateString();
      
      currentWeek.push(countsMap[dateStr]);
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) grid.push(currentWeek);

    return grid;
  };

  const heatmapGrid = generateHeatmap();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: 'var(--text)' }}>📊 Statistics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your growth over time</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: Flame, color: 'var(--coral)', val: userData?.loginStreak || 1, label: 'Login Streak' },
          { icon: CheckCircle, color: 'var(--green)', val: totalCompletionsAllTime, label: 'Total Completions' },
          { icon: TrendingUp, color: 'var(--blue)', val: bestStreakAllTime, label: 'Best Streak Ever' },
          { icon: Zap, color: 'var(--amber)', val: userData?.xp || 0, label: 'Total XP' }
        ].map((stat, i) => (
          <div key={i} className="glass" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: `${stat.color}22`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontFamily: 'Orbitron', fontWeight: 700 }}>{stat.val}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '20px' }}>Weekly Habit Completion</h3>
          <div style={{ height: '220px' }}>
            <Bar 
              data={{
                labels: weeklyHabitData.labels,
                datasets: [{
                  data: weeklyHabitData.data,
                  backgroundColor: 'rgba(108,99,255,0.7)',
                  borderRadius: 6
                }]
              }} 
              options={chartOptionsTemplate(false)} 
            />
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '20px' }}>Water This Week</h3>
          <div style={{ height: '220px' }}>
            <Line 
              data={{
                labels: waterWeekly.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [{
                  data: waterWeekly.map(d => d.total),
                  borderColor: 'var(--blue)',
                  backgroundColor: 'rgba(56,189,248,0.1)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 0
                }]
              }} 
              options={chartOptionsTemplate(true)} 
            />
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* LEADERBOARD */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '20px' }}>Streak Rankings 🏆</h3>
          {habits.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Add habits to see your stats</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...habits].sort((a,b) => b.currentStreak - a.currentStreak).map((habit, i) => {
                const isTop3 = i < 3;
                const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                const maxStreak = Math.max(...habits.map(h => h.currentStreak||0), 10);
                const widthPct = Math.max(5, ((habit.currentStreak||0) / maxStreak) * 100);

                return (
                  <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: `fadeIn 0.3s ease forwards`, animationDelay: `${i*0.05}s`, opacity: 0 }}>
                    <div style={{ width: '20px', textAlign: 'center', fontWeight: 'bold', color: isTop3 ? medalColors[i] : 'var(--text-muted)' }}>
                      {i + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${habit.color}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>
                        {habit.emoji}
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{habit.name}</div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                          <div style={{ width: `${widthPct}%`, height: '100%', background: habit.color, borderRadius: '3px', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Orbitron', fontWeight: 700, width: '30px', textAlign: 'right', color: habit.currentStreak > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                        {habit.currentStreak||0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 90 DAY HEATMAP */}
        <div className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '20px' }}>90 Day Activity</h3>
          <div style={{ display: 'flex', gap: '3px', paddingBottom: '8px' }}>
            {heatmapGrid.map((col, colIdx) => (
              <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {col.map((cell, rowIdx) => {
                  let bgColor = 'rgba(255,255,255,0.04)';
                  if (cell.count > 0 && cell.count <= 2) bgColor = 'rgba(108,99,255,0.3)';
                  else if (cell.count > 2 && cell.count <= 5) bgColor = 'rgba(108,99,255,0.6)';
                  else if (cell.count > 5) bgColor = 'rgba(108,99,255,1.0)';
                  
                  // Hide days in the future
                  const isFuture = cell.date > new Date();
                  
                  return (
                    <div 
                      key={rowIdx} 
                      title={`${cell.date.toDateString()}: ${cell.count} completions`}
                      style={{ 
                        width: '12px', height: '12px', borderRadius: '2px', 
                        background: isFuture ? 'transparent' : bgColor,
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={e => !isFuture && (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={e => !isFuture && (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(108,99,255,0.3)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(108,99,255,0.6)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(108,99,255,1.0)' }} />
            </div>
            <span>More</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StatsPage;
