import { useState, useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { getBadgesRealtime, ALL_BADGES } from '../firebase/dbFunctions';

const TiltHexagon = ({ children, isLocked, onClick }) => {
  const tiltRef = useRef();
  
  useEffect(() => {
    if (tiltRef.current && !isLocked) {
      VanillaTilt.init(tiltRef.current, { max: 12, glare: true, 'max-glare': 0.1 });
    }
    return () => {
      if (tiltRef.current?.vanillaTilt) tiltRef.current.vanillaTilt.destroy();
    };
  }, [isLocked]);

  return (
    <div 
      ref={tiltRef} 
      onClick={onClick}
      className={isLocked ? "glass locked" : "glass"}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        filter: isLocked ? 'grayscale(100%) opacity(0.35)' : 'none',
        position: 'relative',
        transition: 'var(--transition)'
      }}
    >
      {isLocked && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'rgba(5,8,20,0.5)' }}>
          <span style={{ fontSize: '32px' }}>🔒</span>
        </div>
      )}
      {children}
    </div>
  );
};

const RewardsPage = ({ user, userData }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const unsub = getBadgesRealtime(user.uid, setEarnedBadges);
    return unsub;
  }, [user.uid]);

  const earnedBadgeIds = earnedBadges.map(b => b.badgeId);

  const getLevelInfo = (level) => {
    if (level <= 2) return "Beginner";
    if (level <= 4) return "Apprentice";
    if (level <= 6) return "Explorer";
    if (level <= 8) return "Warrior";
    if (level <= 10) return "Champion";
    if (level <= 15) return "Legend";
    return "Grandmaster";
  };

  const getRarityColor = (rarity) => {
    if (rarity === "common") return "var(--teal)";
    if (rarity === "rare") return "var(--violet)";
    if (rarity === "legendary") return "var(--amber)";
    return "var(--border)";
  };

  const currentLevel = userData?.level || 1;
  const currentXP = userData?.xp || 0;
  const xpInLevel = currentXP % 500;
  const xpPercent = (xpInLevel / 500) * 100;

  const filters = ["all", "streak", "water", "login", "completion"];

  const filteredBadges = ALL_BADGES.filter(b => {
    if (activeFilter === "all") return true;
    return b.category === activeFilter;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '32px', color: 'var(--text)' }}>🏆 Rewards</h1>
        <p style={{ color: 'var(--text-muted)' }}>Achievements unlocked through consistency</p>
      </div>

      {/* XP LEVEL BANNER */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--violet)', fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 900 }}>LEVEL {currentLevel}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{getLevelInfo(currentLevel)}</div>
        </div>
        
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <span>{currentXP} XP</span>
            <span>{500 - xpInLevel} XP to next level</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${xpPercent}%`, height: '100%', 
              background: 'linear-gradient(90deg, var(--violet), var(--teal))', 
              transition: 'width 1s ease',
              backgroundSize: '200% auto',
              animation: 'shimmer 2s linear infinite'
            }} />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{ 
              background: activeFilter === f ? 'var(--violet)' : 'var(--bg-surface)', 
              color: activeFilter === f ? 'white' : 'var(--text-muted)',
              padding: '8px 20px', borderRadius: '50px', textTransform: 'capitalize', fontWeight: 700,
              border: activeFilter === f ? '1px solid var(--border-glow)' : '1px solid transparent'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* BADGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {filteredBadges.map((badge, index) => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          const rarityColor = getRarityColor(badge.rarity);
          
          return (
            <TiltHexagon 
              key={badge.id}
              isLocked={!isEarned}
              onClick={() => setSelectedBadge(badge)}
            >
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', 
                background: `${rarityColor}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', 
                fontSize: '28px', marginBottom: '8px',
                boxShadow: isEarned ? `0 0 20px ${rarityColor}66` : 'none'
              }}>
                {badge.emoji}
              </div>
              
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
                {badge.name}
              </div>
              
              <div style={{ color: rarityColor, fontSize: '12px', letterSpacing: '2px' }}>
                {badge.rarity === 'common' ? '★' : badge.rarity === 'rare' ? '★★★' : '★★★★★'}
              </div>
              
              {isEarned ? (
                <div style={{ background: `${rarityColor}22`, color: rarityColor, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>
                  +{badge.xpReward} XP
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                  {badge.desc.substring(0, 30)}...
                </div>
              )}
            </TiltHexagon>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {selectedBadge && (
        <div 
          onClick={() => setSelectedBadge(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{ width: '100%', maxWidth: '360px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <button 
              onClick={() => setSelectedBadge(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'var(--text-muted)', fontSize: '20px' }}
            >✕</button>
            
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: `${getRarityColor(selectedBadge.rarity)}33`, display: 'flex', justifyContent: 'center', alignItems: 'center', 
              fontSize: '40px', marginBottom: '16px',
              boxShadow: earnedBadgeIds.includes(selectedBadge.id) ? `0 0 30px ${getRarityColor(selectedBadge.rarity)}88` : 'none'
            }}>
              {selectedBadge.emoji}
            </div>

            <h2 style={{ fontFamily: 'Orbitron', fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>{selectedBadge.name}</h2>
            
            <div style={{ color: getRarityColor(selectedBadge.rarity), letterSpacing: '2px', marginBottom: '16px' }}>
              {selectedBadge.rarity === 'common' ? '★ Common ★' : selectedBadge.rarity === 'rare' ? '★★★ Rare ★★★' : '★★★★★ Legendary ★★★★★'}
            </div>

            <p style={{ color: 'var(--text)', textAlign: 'center', fontSize: '16px', marginBottom: '24px', lineHeight: 1.5 }}>
              {selectedBadge.desc}
            </p>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '18px' }}>{selectedBadge.xpReward} XP</span>
            </div>

            {!earnedBadgeIds.includes(selectedBadge.id) && (
              <div style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🔒</span> Keep going to unlock!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RewardsPage;
