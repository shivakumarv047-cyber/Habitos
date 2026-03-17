import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Shield, Download, Trash2, LogOut, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserProfile, getHabitsRealtime, deleteHabit, getUserRealtime } from '../firebase/dbFunctions';
import { logOut } from '../firebase/authFunctions';
import { db, auth } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: checked ? 'var(--violet)' : 'var(--bg-surface)',
      border: `1px solid ${checked ? 'var(--violet)' : 'var(--border)'}`,
      position: 'relative', cursor: 'pointer', transition: 'var(--transition)'
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: 'white',
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      transition: 'var(--transition)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const SettingsPage = ({ user, userData }) => {
  const [formData, setFormData] = useState({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (userData) {
      setFormData({
        waterGoal: userData.waterGoal || 2000,
        weekStart: userData.weekStart || "monday",
        dailyReminder: userData.dailyReminder || false,
        streakAlerts: userData.streakAlerts || false,
        badgeAlerts: userData.badgeAlerts || false
      });
      setTempName(userData.name || "");
    }
  }, [userData]);

  // Debounced auto-save logic
  const handleSave = useCallback(async (updates) => {
    try {
      await updateUserProfile(user.uid, updates);
      toast.custom((t) => (
        <div style={{ background: 'rgba(15,15,30,0.9)', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', fontSize: '14px' }}>
          <Check size={16} color="var(--green)" /> Saved
        </div>
      ), { duration: 1500, position: 'bottom-center' });
    } catch (error) {
      toast.error("Failed to save settings");
    }
  }, [user.uid]);

  const updateField = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Auto-save specific preferences
    if (userData?.[field] !== value) {
      handleSave({ [field]: value });
    }
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (tempName.trim() !== userData?.name) {
      handleSave({ name: tempName.trim() });
    }
  };

  const handleExportData = async () => {
    try {
      // Create a simplified export object
      const exportData = {
        profile: userData,
        habits: []
      };
      
      const habitsRef = collection(db, "users", user.uid, "habits");
      const habitsSnap = await getDocs(habitsRef);
      exportData.habits = habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "habitOS-export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Export failed: " + error.message);
    }
  };

  const handleResetHabits = async () => {
    if (window.confirm("This will permanently delete all your habits. Are you sure?")) {
      try {
        const habitsRef = collection(db, "users", user.uid, "habits");
        const habitsSnap = await getDocs(habitsRef);
        
        const batch = writeBatch(db);
        habitsSnap.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        
        toast.success("All habits deleted.");
      } catch (error) {
        toast.error("Failed to delete habits: " + error.message);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("WARNING: This action cannot be undone. All your data will be permanently erased. Proceed?")) {
      if (window.confirm("Are you absolutely sure you want to delete your account?")) {
        try {
          await deleteDoc(doc(db, "users", user.uid));
          if (auth.currentUser) {
            await auth.currentUser.delete();
          }
          localStorage.clear();
          window.location.href = "/";
        } catch (error) {
          toast.error("Failed to delete account. You may need to sign in again to perform this action.");
        }
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch(err) {
      toast.error(err.message);
    }
  };

  if (!userData) return <div style={{ padding: '24px' }}>Loading settings...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease', paddingBottom: '60px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: 'var(--text)' }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your preferences and account</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* PROFILE CARD */}
        <div className="glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--teal))', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontFamily: 'Orbitron', fontWeight: 800, fontSize: '32px', marginBottom: '8px' 
          }}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Your profile</p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px' }}>
              <User size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              {isEditingName ? (
                <input 
                  autoFocus
                  type="text" 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, fontSize: '16px' }}
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)} 
                  style={{ flex: 1, textAlign: 'left', cursor: 'pointer', fontSize: '16px' }}
                  title="Click to edit"
                >
                  {userData.name}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px', opacity: 0.7 }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <div style={{ flex: 1, textAlign: 'left', color: 'var(--text-muted)' }}>{userData.email}</div>
              <Shield size={16} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: userData.provider === 'google.com' ? 'var(--blue)' : 'var(--violet)' }} />
              {userData.provider === 'google.com' ? 'Google Account' : 'Email Account'}
            </div>
          </div>
        </div>

        {/* PREFERENCES CARD */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '24px' }}>Preferences</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Daily Water Goal</label>
              <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{formData.waterGoal} ml</span>
            </div>
            <input 
              type="range" 
              min="500" max="4000" step="250"
              value={formData.waterGoal || 2000}
              onChange={(e) => updateField('waterGoal', Number(e.target.value))}
              style={{ padding: 0, height: '6px', background: 'var(--bg-surface)' }}
            />
          </div>

          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', display: 'block' }}>Week Starts On</label>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '50px' }}>
              {["sunday", "monday"].map(day => (
                <button 
                  key={day}
                  onClick={() => updateField('weekStart', day)}
                  style={{ 
                    flex: 1, padding: '8px', borderRadius: '50px', textTransform: 'capitalize', fontWeight: 600, fontSize: '14px',
                    background: formData.weekStart === day ? 'var(--violet)' : 'transparent',
                    color: formData.weekStart === day ? 'white' : 'var(--text-muted)'
                  }}
                >{day}</button>
              ))}
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS CARD */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '24px' }}>Notifications</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>Daily Reminder</span>
              <ToggleSwitch checked={formData.dailyReminder} onChange={(val) => updateField('dailyReminder', val)} />
            </div>
            <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>Streak Alerts</span>
              <ToggleSwitch checked={formData.streakAlerts} onChange={(val) => updateField('streakAlerts', val)} />
            </div>
            <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>Badge Alerts</span>
              <ToggleSwitch checked={formData.badgeAlerts} onChange={(val) => updateField('badgeAlerts', val)} />
            </div>
          </div>
        </div>

        {/* ACCOUNT ACTIONS CARD */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '18px', marginBottom: '24px' }}>Account</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleExportData}
              style={{ background: 'transparent', border: '1px solid var(--teal)', color: 'var(--teal)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              <Download size={18} /> Export Data
            </button>
            
            <button 
              onClick={handleResetHabits}
              style={{ background: 'transparent', border: '1px solid var(--coral)', color: 'var(--coral)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              <Trash2 size={18} /> Reset All Habits
            </button>
            
            <button 
              onClick={handleDeleteAccount}
              style={{ background: 'transparent', border: '1px solid var(--coral)', color: 'var(--coral)', padding: '8px', borderRadius: '12px', fontSize: '12px', marginTop: '16px', opacity: 0.8 }}
            >
              Delete Account
            </button>

            <button 
              onClick={handleSignOut}
              style={{ background: 'var(--coral)', color: 'white', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 700, fontFamily: 'Orbitron', marginTop: '24px' }}
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
