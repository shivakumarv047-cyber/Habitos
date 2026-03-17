import { useState, useEffect } from 'react';
import { getUserRealtime } from '../firebase/dbFunctions';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import HabitsTab from './HabitsTab';
import WaterTracker from './WaterTracker';
import StatsPage from './StatsPage';
import RewardsPage from './RewardsPage';
import SettingsPage from './SettingsPage';

const MainApp = ({ user }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = getUserRealtime(user.uid, setUserData);
    return () => unsubscribe();
  }, [user.uid]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard user={user} userData={userData} setActiveTab={setActiveTab} />;
      case "habits": return <HabitsTab user={user} userData={userData} setActiveTab={setActiveTab} />;
      case "water": return <WaterTracker user={user} userData={userData} setActiveTab={setActiveTab} />;
      case "stats": return <StatsPage user={user} userData={userData} setActiveTab={setActiveTab} />;
      case "rewards": return <RewardsPage user={user} userData={userData} setActiveTab={setActiveTab} />;
      case "settings": return <SettingsPage user={user} userData={userData} setActiveTab={setActiveTab} />;
      default: return <Dashboard user={user} userData={userData} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'transparent' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default MainApp;
