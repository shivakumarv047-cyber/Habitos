import { useState, useEffect, useRef } from 'react';
import { Zap, Flame, Star, Droplets, CheckSquare } from 'lucide-react';
import VanillaTilt from 'vanilla-tilt';
import toast from 'react-hot-toast';
import { getHabitsRealtime, getWaterRealtime, toggleHabitComplete, addXP, checkAndUnlockBadges } from '../firebase/dbFunctions';

const TiltCard = ({ children, options, style, className, onClick }) => {
  const tiltRef = useRef();

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, options);
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (tiltRef.current && tiltRef.current.vanillaTilt) {
        tiltRef.current.vanillaTilt.destroy();
      }
    };
  }, [options]);

  return <div ref={tiltRef} style={style} className={className} onClick={onClick}>{children}</div>;
};

const Dashboard = ({ user, userData, setActiveTab }) => {
  const [habits, setHabits] = useState([]);
  const [todayWater, setTodayWater] = useState({ total: 0, goal: 2000 });
  const [displayedXP, setDisplayedXP] = useState(0);

  const today = new Date().toDateString();

  useEffect(() => {
    const unsubHabits = getHabitsRealtime(user.uid, setHabits);
    const unsubWater = getWaterRealtime(user.uid, today, (data) => {
      setTodayWater(data || { total: 0, goal: userData?.waterGoal || 2000 });
    });
    return () => {
      unsubHabits();
      unsubWater();
    };
  }, [user.uid, today, userData?.waterGoal]);

  useEffect(() => {
    // XP count up animation
    if (userData && userData.xp !== displayedXP) {
      const diff = userData.xp - displayedXP;
      const step = Math.max(1, Math.floor(diff / 20));
      
      const interval = setInterval(() => {
        setDisplayedXP(prev => {
          if (prev < userData.xp) return Math.min(prev + step, userData.xp);
          if (prev > userData.xp) return Math.max(prev - step, userData.xp);
          clearInterval(interval);
          return prev;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [userData, displayedXP]);

  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const completionPercent = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = userData?.name || "User";
  const firstName = name.split(' ')[0];

  const handleToggleHabit = async (habit) => {
    try {
      const wasCompleted = habit.completedDates?.includes(today);
      await toggleHabitComplete(user.uid, habit.id, today);
      
      if (!wasCompleted) {
        await addXP(user.uid, 10);
        await checkAndUnlockBadges(user.uid);
        toast.success(`Completed: ${habit.name}! +10 XP`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!userData) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      {/* TOP NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>{getGreeting()}, </span>
          <span style={{ fontSize: '28px', fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--violet)' }}>{firstName}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '50px', gap: '8px', border: '1px solid var(--violet)', boxShadow: '0 0 10px rgba(108,99,255,0.2)' }}>
            <Zap size={20} color="var(--amber)" fill="var(--amber)" />
            <span style={{ fontFamily: 'Orbitron', fontWeight: 700 }}>{displayedXP} XP</span>
            <div style={{ background: 'var(--violet)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>LVL {userData.level || 1}</div>
          </div>
          
          <div 
            onClick={() => setActiveTab("settings")}
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--violet), var(--teal))', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px',
              border: '2px solid var(--bg-deep)'
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Card 1: Login Streak */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Flame size={32} color="var(--coral)" style={{ animation: 'flamePulse 2s infinite' }} />
          <div style={{ fontSize: '36px', fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--text)' }}>{userData.loginStreak || 1}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Day Streak</div>
        </div>

        {/* Card 2: Today Progress */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="35" cy="35" r="30" fill="transparent" stroke="var(--violet)" strokeWidth="6" strokeDasharray="188" strokeDashoffset={188 - (188 * completionPercent) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
            </svg>
            <div style={{ position: 'absolute', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px' }}>{completionPercent}%</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Today</div>
        </div>

        {/* Card 3: Water Today */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('water')}>
          <Droplets size={32} color="var(--blue)" />
          <div style={{ fontSize: '24px', fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--text)' }}>{todayWater.total}<span style={{fontSize:'14px', color:'var(--text-muted)'}}>/ {todayWater.goal}ml</span></div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (todayWater.total / todayWater.goal) * 100)}%`, height: '100%', background: 'var(--blue)', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Card 4: Total XP */}
        <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Star size={32} color="var(--teal)" fill="rgba(0,245,212,0.2)" />
          <div style={{ fontSize: '36px', fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--text)' }}>{displayedXP}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>XP Earned</div>
        </div>

      </div>

      {/* TODAY'S HABITS SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', color: 'var(--text)' }}>Today's Habits</h2>
        <div style={{ background: 'rgba(108,99,255,0.2)', color: 'var(--violet)', padding: '4px 12px', borderRadius: '50px', fontSize: '14px', fontWeight: 700 }}>
          {completedToday}/{habits.length} done
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>🎯</div>
          <h3 style={{ fontSize: '20px' }}>No habits yet!</h3>
          <button 
            onClick={() => setActiveTab("habits")}
            style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))', color: 'white', padding: '12px 24px', borderRadius: '12px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px' }}
          >
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {habits.map((habit, index) => {
            const isCompleted = habit.completedDates?.includes(today);
            return (
              <TiltCard 
                key={habit.id} 
                options={{ max: 5, scale: 1.02, glare: true, 'max-glare': 0.05 }}
                className="glass"
                style={{ 
                  padding: '16px', cursor: 'pointer', 
                  animation: `fadeIn 0.4s ease forwards`,
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  borderLeft: isCompleted ? '3px solid var(--green)' : '1px solid var(--border)',
                  background: isCompleted ? 'rgba(74, 222, 128, 0.05)' : 'var(--bg-card)'
                }}
                onClick={() => handleToggleHabit(habit)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${habit.color}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
                      {habit.emoji}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{habit.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--coral)', fontWeight: 700 }}>
                    <Flame size={16} /> {habit.currentStreak || 0}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '6px', 
                    border: isCompleted ? 'none' : '2px solid var(--text-muted)',
                    background: isCompleted ? 'var(--green)' : 'transparent',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    transition: 'var(--transition)'
                  }}>
                    {isCompleted && <CheckSquare size={16} color="var(--bg-deep)" />}
                  </div>
                  <div style={{ color: isCompleted ? 'var(--text)' : 'var(--text-muted)' }}>
                    {isCompleted ? 'Completed' : 'Mark Complete'}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* PROGRESS BAR at bottom */}
      <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Daily Progress</span>
          <span style={{ fontFamily: 'Orbitron', fontWeight: 600 }}>{completionPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${completionPercent}%`, height: '100%', 
            background: 'linear-gradient(90deg, var(--violet), var(--teal))',
            boxShadow: '0 0 10px rgba(108,99,255,0.5)',
            transition: 'width 0.8s ease'
          }} />
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
