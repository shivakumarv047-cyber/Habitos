import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getWaterRealtime, getWeeklyWater, logWater, addXP } from '../firebase/dbFunctions';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WaterTracker = ({ user, userData }) => {
  const [waterData, setWaterData] = useState({ total: 0, goal: 2000 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const today = new Date().toDateString();

  useEffect(() => {
    const unsub = getWaterRealtime(user.uid, today, (data) => {
      setWaterData(data || { total: 0, goal: userData?.waterGoal || 2000 });
    });
    
    getWeeklyWater(user.uid).then(data => {
      // Data is ordered from oldest to newest array based on the dbFunction logic 
      // where we map the last 7 days.
      setWeeklyData(data.reverse()); // Ensure chronological order for chart
    });
    
    return () => unsub();
  }, [user.uid, today, userData?.waterGoal]);

  const fillPercent = Math.min(100, Math.round((waterData.total / waterData.goal) * 100));

  const handleAddWater = async (amount) => {
    try {
      if (amount <= 0 || amount > 5000) return toast.error("Invalid amount");
      await logWater(user.uid, amount);
      await addXP(user.uid, 5);
      toast.success(`💧 ${amount}ml added!`);
      setShowCustom(false);
      setCustomAmount("");
      
      // Update weekly chart slightly aggressively for immediate feedback
      getWeeklyWater(user.uid).then(data => setWeeklyData(data.reverse()));
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  const chartData = {
    labels: weeklyData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        data: weeklyData.map(d => d.total),
        backgroundColor: weeklyData.map(d => d.date === today ? 'rgba(56,189,248,0.8)' : 'rgba(56,189,248,0.3)'),
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,15,30,0.9)',
        titleFont: { family: 'Nunito', size: 14 },
        bodyFont: { family: 'Orbitron', size: 16 },
        callbacks: {
          label: (context) => `${context.parsed.y} ml`
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)' }, beginAtZero: true }
    }
  };

  const weekTotal = weeklyData.reduce((sum, d) => sum + d.total, 0);
  const bestDay = Math.max(0, ...weeklyData.map(d => d.total));
  const dailyAvg = weeklyData.length > 0 ? Math.round(weekTotal / weeklyData.length) : 0;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: 'var(--text)' }}>💧 Water Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Stay hydrated, stay focused</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        
        {/* LEFT COMPONENT: BOTTLE */}
        <div className="glass" style={{ flex: '1 1 350px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', width: '180px', height: '320px', marginBottom: '24px' }}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <clipPath id="bottle-shape" clipPathUnits="objectBoundingBox">
                <path d="M0.3,0 H0.7 V0.1 C0.7,0.15 0.8,0.2 0.85,0.3 L0.9,0.9 C0.9,0.95 0.85,1 0.75,1 H0.25 C0.15,1 0.1,0.95 0.1,0.9 L0.15,0.3 C0.2,0.2 0.3,0.15 0.3,0.1 Z" />
              </clipPath>
            </svg>
            
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: 'rgba(255,255,255,0.03)', 
              clipPath: 'url(#bottle-shape)',
              boxShadow: 'inset 0 0 20px rgba(56,189,248,0.2)',
              border: '2px solid rgba(56,189,248,0.5)'
            }}>
              
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${fillPercent}%`,
                transition: 'height 1.5s cubic-bezier(0.4,0,0.2,1)',
                background: fillPercent < 33 ? 'linear-gradient(to top, #1E3A5F, #2563EB)' : 
                            fillPercent < 66 ? 'linear-gradient(to top, #0369A1, #38BDF8)' : 
                            fillPercent < 100 ? 'linear-gradient(to top, #06B6D4, #00F5D4)' : 
                            'linear-gradient(to top, #00F5D4, #4ADE80)',
                overflow: 'hidden'
              }}>
                {/* WAVES */}
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: 'absolute', top: '-10px', left: 0, width: '200%', height: '20px', animation: 'wave 2s linear infinite' }}>
                  <path d="M0,10 Q25,0 50,10 T100,10 V20 H0 Z" fill="rgba(255,255,255,0.2)" />
                </svg>
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: 'absolute', top: '-12px', left: 0, width: '200%', height: '25px', animation: 'wave 3s linear infinite reverse' }}>
                  <path d="M0,10 Q25,20 50,10 T100,10 V20 H0 Z" fill="rgba(255,255,255,0.3)" />
                </svg>

                {/* BUBBLES */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', 
                    width: `${Math.random() * 6 + 4}px`, 
                    height: `${Math.random() * 6 + 4}px`, 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.4)',
                    left: `${Math.random() * 80 + 10}%`,
                    bottom: '-10px',
                    animation: `float ${Math.random() * 2 + 2}s linear infinite`
                  }} />
                ))}
              </div>

            </div>

            <div style={{
              position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontFamily: 'Orbitron', fontWeight: 800, fontSize: '36px', color: 'white',
              textShadow: '0 0 20px currentColor', zIndex: 10
            }}>
              {fillPercent}%
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--blue)' }}>{waterData.total}</span>
            <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}> / {waterData.goal} ml</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            {Math.round(waterData.total / 250)} glasses consumed
          </p>

          {fillPercent >= 100 && (
            <div style={{ color: 'var(--green)', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px', animation: 'glow 2s infinite', marginBottom: '16px' }}>
              Goal Reached! 🎉
            </div>
          )}

          {/* ADD BUTTONS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[
              { label: '+250ml', value: 250 },
              { label: '+500ml', value: 500 },
              { label: '+1 Glass', value: 250 }
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={() => handleAddWater(btn.value)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--blue)', color: 'var(--blue)', padding: '10px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 600 }}
              >
                {btn.label}
              </button>
            ))}
            <button 
              onClick={() => setShowCustom(!showCustom)}
              style={{ background: showCustom ? 'var(--blue)' : 'var(--bg-card)', border: '1px solid var(--blue)', color: showCustom ? 'white' : 'var(--blue)', padding: '10px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 600 }}
            >
              Custom
            </button>
          </div>

          {showCustom && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center', animation: 'fadeIn 0.3s ease' }}>
              <input 
                type="number" 
                placeholder="0"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>ml</span>
              <button 
                onClick={() => handleAddWater(parseInt(customAmount))}
                style={{ background: 'var(--blue)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}
              >
                Add
              </button>
              <button 
                onClick={() => setShowCustom(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)', padding: '8px', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COMPONENT: CHART */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '20px', marginBottom: '20px' }}>This Week</h3>
            <div style={{ height: '220px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Best Day</div>
              <div style={{ fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--teal)' }}>{bestDay}ml</div>
            </div>
            <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Week Total</div>
              <div style={{ fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--blue)' }}>{weekTotal}ml</div>
            </div>
            <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Daily Avg</div>
              <div style={{ fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text)' }}>{dailyAvg}ml</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WaterTracker;
