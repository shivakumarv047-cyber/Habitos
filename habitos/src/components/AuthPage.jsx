import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from '../firebase/authFunctions';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculatePasswordStrength = (pwd) => {
    if (pwd.length === 0) return { width: '0%', color: 'transparent' };
    if (pwd.length < 6) return { width: '33%', color: 'var(--coral)' };
    if (pwd.length < 10) return { width: '66%', color: 'var(--amber)' };
    const hasNum = /\d/.test(pwd);
    const hasSpec = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (hasNum && hasSpec) return { width: '100%', color: 'var(--green)' };
    return { width: '66%', color: 'var(--amber)' };
  };

  const handleSignIn = async () => {
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) return toast.error("Please fill in all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      await resetPassword(email);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const strength = calculatePasswordStrength(password);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <div className="glass" style={{ width: '420px', padding: '40px', animation: 'scaleIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--teal))', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(108,99,255,0.4)', animation: 'pulse 2s infinite' }}>
            <span style={{ fontFamily: 'Orbitron', fontWeight: 900, color: 'white', fontSize: '20px' }}>H</span>
          </div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: '28px', color: 'var(--violet)' }}>HabitOS</h1>
        </div>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your daily ritual starts here</p>

        {/* Tabs */}
        <div style={{ display: 'flex', width: '100%', background: 'var(--bg-surface)', borderRadius: '50px', padding: '4px', marginBottom: '24px' }}>
          <div 
            onClick={() => setActiveTab('signin')}
            style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: '50px', cursor: 'pointer', background: activeTab === 'signin' ? 'var(--violet)' : 'transparent', color: activeTab === 'signin' ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)', fontWeight: 600 }}
          >
            Sign In
          </div>
          <div 
            onClick={() => setActiveTab('signup')}
            style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: '50px', cursor: 'pointer', background: activeTab === 'signup' ? 'var(--violet)' : 'transparent', color: activeTab === 'signup' ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)', fontWeight: 600 }}
          >
            Create Account
          </div>
        </div>

        {/* Content */}
        <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
          {activeTab === 'signin' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={handleGoogleSignIn}
                style={{ width: '100%', background: 'white', color: 'black', borderRadius: '50px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '16px' }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '24px', height: '24px' }} />
                Continue with Google
              </button>
              
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '8px 0', fontSize: '14px' }}>─── or ───</div>
              
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }} 
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }} 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '15px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              <button 
                onClick={handleSignIn}
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--violet), var(--teal))', color: 'white', borderRadius: '12px', height: '48px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>

              <div 
                onClick={handleForgotPassword}
                style={{ textAlign: 'center', color: 'var(--violet)', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}
              >
                Forgot Password?
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }} 
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }} 
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }} 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '15px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                {password.length > 0 && (
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: strength.width, background: strength.color, height: '100%', transition: 'all 0.3s ease' }} />
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '44px', borderColor: confirmPassword && password !== confirmPassword ? 'var(--coral)' : 'var(--border)' }} 
                />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ color: 'var(--coral)', fontSize: '12px', marginTop: '4px' }}>Passwords do not match</div>
                )}
              </div>

              <button 
                onClick={handleSignUp}
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--violet), var(--teal))', color: 'white', borderRadius: '12px', height: '48px', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '16px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
