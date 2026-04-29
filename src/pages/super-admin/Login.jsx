import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Save, ShieldCheck, AlertCircle, Loader2, KeyRound, RefreshCcw } from 'lucide-react';
import logo from '@/assets/logo.png';

const Login = () => {
  const { isDark, toggleTheme } = useTheme();
  const { login, manualLogin } = useAuth();
  const themeMode = isDark ? 'dark' : 'light';

  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  
  const [step, setStep]         = useState(1); // 1: Login, 2: Change Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        const { superAdminService } = await import('@/services/super-admin/superAdminService');
        const admins = await superAdminService.getSuperAdmins();
        const user = admins.find(a => a.email.toLowerCase() === email.toLowerCase());

        if (!user || user.password !== password) {
          throw new Error("Invalid email or password");
        }

        if (user.status !== 'Active') {
          throw new Error("Account is inactive. Please contact system administrator.");
        }

        if (user.needsPasswordChange) {
          setAuthenticatedUser(user);
          setStep(2);
          setLoading(false);
          return;
        }

        await manualLogin({
          uid: user.id,
          email: user.email,
          fullName: user.name,
          role: 'super_admin',
          status: 'Active'
        });
        navigate('/dashboard', { replace: true });
      } else {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (newPassword === password) {
          throw new Error("New password must be different from current password");
        }

        const { superAdminService } = await import('@/services/super-admin/superAdminService');
        await superAdminService.updateSuperAdminPassword(authenticatedUser.id, newPassword);
        
        await manualLogin({
          uid: authenticatedUser.id,
          email: authenticatedUser.email,
          fullName: authenticatedUser.name,
          role: 'super_admin',
          status: 'Active'
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-theme={themeMode}>
      <div className="login-card-compact">
        {/* Left Side: Logo */}
        <div className="login-logo-side">
          <div className="logo-wrapper animate-fade-in">
            <img src={logo} alt="Prime Basket Logo" className="large-logo" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-side">
          <div className={`login-content-wrapper ${shake ? 'shake' : ''}`}>
            <div className="login-header text-white">
              <h2 className="text-white">{step === 1 ? 'Super Admin Login' : 'Update Password'}</h2>
              <p className="text-white/80">{step === 1 ? 'Sign in to access the control panel' : 'Please set a new password for your account'}</p>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form-main">
              {step === 1 ? (
                <>
                  <div className="form-group">
                    <label>Email address</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="icon" />
                      <input
                        type="email"
                        placeholder="admin@primebasket.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="flex justify-between items-center">
                      <label>Password</label>
                      <button type="button" className="forgot-link">Forgot password?</button>
                    </div>
                    <div className="input-with-icon">
                      <Lock size={18} className="icon" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        required
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPass(v => !v)}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="remember-row">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Remember me 
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin" size={18} /> Checking…</>
                    ) : (
                      <><ShieldCheck size={18} /> Sign In</>
                    )}
                  </button>

                  {/* Demo Credentials Box */}
                  <div className="demo-box">
                    <p className="demo-title">Demo Credentials</p>
                    <div className="demo-details">
                      <p><span>Username:</span> superadmin@primebasket.com</p>
                      <p><span>Password:</span> Admin123@</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="icon" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                      <RefreshCcw size={18} className="icon" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin" size={18} /> Updating…</>
                    ) : (
                      <><Save size={18} /> Update & Login</>
                    )}
                  </button>
                </>
              )}
            </form>

            <p className="footer-copyright">
              © {new Date().getFullYear()} Prime-Basket. All rights reserved.
            </p>
          </div>
        </div>
      </div>


      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 20px;
        }

        /* Compact Centered Card */
        .login-card-compact {
          display: flex;
          align-items: stretch;
          width: 100%;
          max-width: 800px;
          min-height: 550px;
          background: #1d5ba0;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        /* --- Left Side (Logo) --- */
        .login-logo-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #ffffff;
          position: relative;
        }
        
        .logo-wrapper {
          width: 100%;
          max-width: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.06));
          animation: tilt3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes tilt3d {
          0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1); }
          50% { transform: perspective(1000px) rotateX(5deg) rotateY(15deg) scale(1.02); }
        }
        
        .large-logo {
          width: 100%;
          height: auto;
          object-fit: contain;
          border: 0 !important;
          outline: none !important;
          box-shadow: none !important;
        }

        /* --- Right Side (Form) --- */
        .login-form-side {
          flex: 1;
          background: #1d5ba0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .login-content-wrapper {
          width: 100%;
          max-width: 320px;
        }

        .login-header {
          margin-bottom: 24px;
        }
        
        .login-header h2 {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
          color: white;
        }

        .login-header p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .error-banner {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .login-form-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon .icon {
          position: absolute;
          left: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .input-with-icon input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          padding: 10px 12px 10px 38px;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }

        .input-with-icon input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: white;
        }

        .input-with-icon input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
        }

        .btn-primary-white {
          width: 100%;
          padding: 12px;
          background: #1d5ba0;
          color: #ffffff;
          border: 1.5px solid #ffffff;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin-top: 6px;
        }

        .btn-primary-white:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-primary-white:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .demo-box {
          margin-top: 15px;
          background: rgba(0, 0, 0, 0.1);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          padding: 10px;
          border-radius: 12px;
        }

        .demo-title {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 4px;
        }

        .demo-details p {
          font-size: 11px;
          color: white;
          margin-bottom: 1px;
        }
        
        .demo-details span {
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
          margin-right: 4px;
        }

        .footer-copyright {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .forgot-link {
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        .remember-row {
          display: flex;
          align-items: center;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          position: relative;
          padding-left: 24px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0; width: 0;
        }

        .checkmark {
          position: absolute;
          left: 0;
          height: 16px;
          width: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .checkbox-container input:checked ~ .checkmark {
          background: white;
          border-color: white;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-container .checkmark:after {
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid #1d5ba0;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        @media (max-width: 850px) {
          .login-card-compact {
            max-width: 440px;
            height: auto;
          }
          .login-logo-side {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

