import { LayoutDashboard, CheckSquare, Droplets, BarChart2, Trophy, Settings, LogOut } from 'lucide-react';
import { logOut } from '../firebase/authFunctions';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "habits", icon: CheckSquare, label: "Habits" },
    { id: "water", icon: Droplets, label: "Water" },
    { id: "stats", icon: BarChart2, label: "Stats" },
    { id: "rewards", icon: Trophy, label: "Rewards" },
    { id: "settings", icon: Settings, label: "Settings" }
  ];

  const handleLogout = async () => {
    await logOut();
  };

  return (
    <div className="glass" style={{
      width: '70px',
      height: '100%',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: '8px',
      zIndex: 100
    }}>
      {/* Logo Placeholder */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--violet), var(--teal))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        boxShadow: '0 0 20px rgba(108,99,255,0.4)',
        animation: 'pulse 2s infinite'
      }}>
        <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: 'white', fontSize: '18px' }}>H</span>
      </div>

      {/* Nav Items */}
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: isActive ? 'rgba(108,99,255,0.2)' : 'transparent',
              border: isActive ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(108,99,255,0.2)' : 'none',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon size={24} color={isActive ? 'var(--violet)' : 'var(--text-muted)'} />
          </div>
        );
      })}

      {/* Logout Bottom */}
      <div
        onClick={handleLogout}
        title="Logout"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          marginTop: 'auto',
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <LogOut size={24} color="var(--coral)" />
      </div>
    </div>
  );
};

export default Sidebar;
