import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthChange } from './firebase/authFunctions';
import ThreeBackground from './components/ThreeBackground';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <ThreeBackground />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15,15,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(108,99,255,0.3)',
            color: '#F0F0FF',
            fontFamily: 'Nunito, sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#4ADE80', secondary: 'transparent' } },
          error: { iconTheme: { primary: '#FF6B6B', secondary: 'transparent' } },
        }}
      />
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid rgba(108,99,255,0.2)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
            <Route path="/dashboard" element={!user ? <Navigate to="/" /> : <MainApp user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
