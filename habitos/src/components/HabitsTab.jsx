import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import VanillaTilt from 'vanilla-tilt';
import toast from 'react-hot-toast';
import { getHabitsRealtime, addHabit, updateHabit, deleteHabit } from '../firebase/dbFunctions';
import { serverTimestamp } from 'firebase/firestore';

const PRESET_HABITS = [
  {name:"Meditate", emoji:"🧘", color:"#A78BFA"},
  {name:"Exercise", emoji:"🏃", color:"#FF6B6B"},
  {name:"Read 30 mins", emoji:"📚", color:"#FFB347"},
  {name:"Sleep 8hrs", emoji:"😴", color:"#38BDF8"},
  {name:"Eat Healthy", emoji:"🥗", color:"#4ADE80"},
  {name:"No Social Media", emoji:"📵", color:"#6C63FF"},
  {name:"Journal", emoji:"✍️", color:"#F472B6"},
  {name:"Drink Water", emoji:"💧", color:"#00F5D4"},
  {name:"Take Vitamins", emoji:"💊", color:"#FB923C"},
  {name:"Learn Something", emoji:"🧠", color:"#818CF8"},
  {name:"Clean Workspace", emoji:"🧹", color:"#34D399"},
  {name:"Work on Goal", emoji:"🎯", color:"#FBBF24"}
];

const EMOJIS = ["🎯","🏃","📚","💧","🧘","✍️","🏋️","🎨","🎵","💊","🥗","😴","📵","🧠","🧹","⭐","🔥","💪","🌿","🎮","📖","🏊","🚴","🧪","🌅","🎭","🏆","💡","🌱","❤️"];
const COLORS = ["#6C63FF","#00F5D4","#FF6B6B","#4ADE80","#FFB347","#38BDF8","#F472B6","#FBBF24"];

const TiltCard = ({ children, options, style, className }) => {
  const tiltRef = useRef();
  useEffect(() => {
    if (tiltRef.current) VanillaTilt.init(tiltRef.current, options);
    return () => { if (tiltRef.current?.vanillaTilt) tiltRef.current.vanillaTilt.destroy(); };
  }, [options]);
  return <div ref={tiltRef} style={style} className={className}>{children}</div>;
};

const HabitsTab = ({ user }) => {
  const [habits, setHabits] = useState([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("🎯");
  const [formColor, setFormColor] = useState("#6C63FF");
  const [formFreq, setFormFreq] = useState("daily");
  const [formTargetCount, setFormTargetCount] = useState(1);

  useEffect(() => {
    const unsub = getHabitsRealtime(user.uid, setHabits);
    return () => unsub();
  }, [user.uid]);

  const openDrawer = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setFormName(habit.name);
      setFormEmoji(habit.emoji);
      setFormColor(habit.color);
      setFormFreq(habit.frequency || "daily");
      setFormTargetCount(habit.targetCount || 1);
    } else {
      setEditingHabit(null);
      setFormName("");
      setFormEmoji("🎯");
      setFormColor("#6C63FF");
      setFormFreq("daily");
      setFormTargetCount(1);
    }
    setShowAddDrawer(true);
  };

  const closeDrawer = () => {
    setShowAddDrawer(false);
    setTimeout(() => setEditingHabit(null), 300);
  };

  const handleSave = async () => {
    if (!formName.trim()) return toast.error("Habit name cannot be empty");
    
    const habitData = {
      name: formName.trim(),
      emoji: formEmoji,
      color: formColor,
      frequency: formFreq,
      targetCount: formTargetCount
    };

    try {
      if (editingHabit) {
        await updateHabit(user.uid, editingHabit.id, habitData);
        toast.success("Habit updated!");
      } else {
        await addHabit(user.uid, habitData);
        toast.success("New habit created!");
      }
      closeDrawer();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm("Delete this habit permanently?")) {
      try {
        await deleteHabit(user.uid, habitId);
        toast.success("Habit deleted");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleQuickAdd = async (preset) => {
    try {
      await addHabit(user.uid, {
        name: preset.name,
        emoji: preset.emoji,
        color: preset.color,
        frequency: "daily",
        targetCount: 1
      });
      toast.success(`${preset.name} added!`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isDrawerOpen = showAddDrawer || editingHabit !== null;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: 'var(--text)' }}>My Habits</h1>
          <p style={{ color: 'var(--text-muted)' }}>Build streaks. Build yourself.</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          style={{ background: 'linear-gradient(135deg, var(--violet), var(--teal))', color: 'white', padding: '12px 24px', borderRadius: '12px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>＋</span> New Habit
        </button>
      </div>

      {/* QUICK ADD PRESETS */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Add</h3>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {PRESET_HABITS.map((preset, i) => (
            <div key={i} className="glass" style={{ minWidth: '130px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${preset.color}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
                {preset.emoji}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {preset.name}
              </div>
              <button 
                onClick={() => handleQuickAdd(preset)}
                style={{ background: 'transparent', border: `1px solid ${preset.color}`, color: preset.color, padding: '4px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginTop: '4px' }}
              >
                ＋ Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE HABITS GRID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: '20px', color: 'var(--text)' }}>Active Habits</h2>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>{habits.length}</div>
      </div>

      {habits.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>🎯</div>
          <h3 style={{ fontSize: '20px' }}>No active habits yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Use quick add or create your own to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {habits.map((habit, index) => (
            <TiltCard 
              key={habit.id} 
              options={{ max: 8, scale: 1.02, glare: true, 'max-glare': 0.08 }}
              className="glass"
              style={{ 
                padding: '20px', 
                borderLeft: `3px solid ${habit.color}`,
                animation: `scaleIn 0.4s ease forwards`,
                animationDelay: `${index * 0.05}s`,
                opacity: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${habit.color}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {habit.emoji}
                  </div>
                  <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', wordBreak: 'break-word' }}>
                    {habit.name}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,107,107,0.1)', color: 'var(--coral)', padding: '4px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                  🔥 {habit.currentStreak || 0}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {habit.frequency}
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {habit.targetCount}x per day
                </div>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '16px', gap: '12px' }}>
                <button 
                  onClick={() => openDrawer(habit)}
                  style={{ flex: 1, background: 'var(--bg-surface)', color: 'var(--text)', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(habit.id)}
                  style={{ width: '40px', background: 'rgba(255,107,107,0.1)', color: 'var(--coral)', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* ADD/EDIT DRAWER */}
      {isDrawerOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
            onClick={closeDrawer}
          />
          <div className="glass" style={{ 
            position: 'fixed', bottom: 0, left: '70px', right: 0, 
            maxHeight: '85vh', background: 'rgba(5,8,20,0.85)', backdropFilter: 'blur(30px)',
            borderTop: '1px solid var(--border-glow)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            zIndex: 200, padding: '24px', overflowY: 'auto',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '4px', margin: '0 auto 16px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px' }}>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h2>
              <button 
                onClick={closeDrawer}
                style={{ background: 'var(--bg-surface)', width: '36px', height: '36px', borderRadius: '50%', color: 'var(--text-muted)', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
              
              {/* Name */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Habit Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  placeholder="e.g. Morning Run" 
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Emoji */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Choose Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                  {EMOJIS.map(emoji => (
                    <div 
                      key={emoji} 
                      onClick={() => setFormEmoji(emoji)}
                      style={{ 
                        height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', cursor: 'pointer', borderRadius: '10px',
                        background: formEmoji === emoji ? 'rgba(108,99,255,0.2)' : 'var(--bg-surface)',
                        border: formEmoji === emoji ? '1px solid var(--violet)' : '1px solid transparent'
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Theme Color</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {COLORS.map(color => (
                    <div 
                      key={color}
                      onClick={() => setFormColor(color)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', background: color, cursor: 'pointer',
                        boxShadow: formColor === color ? `0 0 0 3px var(--bg-deep), 0 0 0 5px ${color}` : 'none',
                        transform: formColor === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Frequency</label>
                <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '6px', borderRadius: '12px' }}>
                  {["daily", "weekdays", "custom"].map(freq => (
                    <div 
                      key={freq}
                      onClick={() => setFormFreq(freq)}
                      style={{ 
                        flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', textTransform: 'capitalize', fontSize: '14px', fontWeight: 600,
                        background: formFreq === freq ? 'var(--violet)' : 'transparent',
                        color: formFreq === freq ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      {freq}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Count */}
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Times per day</label>
                <input 
                  type="number" 
                  min="1" max="20"
                  value={formTargetCount} 
                  onChange={e => setFormTargetCount(parseInt(e.target.value) || 1)} 
                />
              </div>

              <button 
                onClick={handleSave}
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--violet), var(--teal))', color: 'white', borderRadius: '12px', height: '52px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px', marginTop: '16px' }}
              >
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </button>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default HabitsTab;
