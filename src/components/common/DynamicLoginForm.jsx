import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sendOTP, verifyOTP } from '@/utils/common/otpService';
import { ref, get } from 'firebase/database';
import { db } from '@/config/firebase';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import logo from '@/assets/logo.png';

const DynamicLoginForm = ({ config }) => {
  const { title, redirectPath, role } = config;

  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { manualLogin } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setMessage({ text: location.state.message, type: 'error' });
    }
  }, [location.state]);

  const [currentOtp, setCurrentOtp] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        throw new Error('Email not found. Please register first.');
      }

      const users = snapshot.val();
      const userId = Object.keys(users).find(key => users[key].email?.toLowerCase() === email.toLowerCase());
      
      if (!userId) {
        throw new Error('Email not found. Please register first.');
      }

      const userData = users[userId];
      
      if (userData.role !== role) {
        const correctPage = userData.role === 'hub_admin' ? 'Hub Login' : userData.role === 'store_admin' ? 'Store Login' : 'Super Admin Login';
        throw new Error(`Unauthorized. This account is registered as a ${userData.role.replace('_', ' ')}. Please use the ${correctPage} page.`);
      }

      setTargetUser({ ...userData, id: userId });
      
      const sentOtp = await sendOTP(email);
      setCurrentOtp(sentOtp);
      
      setMessage({ text: `Verification required. Use the code displayed below.`, type: 'success' });
      setStep('otp');
    } catch (err) {
      console.error("Login error:", err);
      setMessage({ text: err.message || 'Failed to send OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const sentOtp = await sendOTP(email);
      setCurrentOtp(sentOtp);
      setMessage({ text: `A new OTP has been generated.`, type: 'success' });
      setResendTimer(60); 
    } catch (err) {
      setMessage({ text: 'Failed to resend OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const isValid = verifyOTP(email, otp);
      if (isValid && targetUser) {
        setMessage({ text: 'OTP Verified! Redirecting...', type: 'success' });
        await manualLogin(targetUser);
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        setMessage({ text: 'Invalid or expired OTP. Please try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Verification failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-compact">
        {/* Left Side: Logo */}
        <div className="login-logo-side">
          <div className="logo-wrapper animate-fade-in">
            <img src={logo} alt="Prime Basket Logo" className="large-logo" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-side">
          <div className="login-content-wrapper">
            <div className="login-header">
              <h2 className="text-white text-2xl font-extrabold mb-1">{title}</h2>
              <p className="text-white/70 text-xs font-medium">
                {step === 'login' ? 'Enter email to receive OTP' : 'Enter the code below'}
              </p>
            </div>

            {message.text && (
              <div className={`message-banner ${message.type === 'error' ? 'bg-red-500/20 border-red-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} text-white`}>
                <ShieldCheck size={16} />
                {message.text}
              </div>
            )}

            {step === 'login' ? (
              <form onSubmit={handleEmailSubmit} className="login-form-main">
                <div className="form-group">
                  <label className="text-white/90 text-xs font-bold mb-1">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="icon" />
                    <input
                      type="email"
                      placeholder="admin@primebasket.com"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-white"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={16} /> Sending...</> : 'Send Login OTP'}
                  </button>

                  {/* Demo Credentials Box */}
                  {config.demoEmail && (
                    <div className="demo-box">
                      <p className="demo-title">Demo Credentials</p>
                      <div className="demo-details">
                        <p><span>mail:</span> {config.demoEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="login-form-main">
                <div className="otp-display-panel">
                  <span className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">Your Login OTP is</span>
                  <span className="text-3xl font-black text-white tracking-[0.15em]">{currentOtp}</span>
                </div>

                <div className="form-group">
                  <label className="text-white/90 text-xs font-bold mb-1 text-center w-full">Verification Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    className="otp-input-field"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="text-[10px] font-bold text-white/60 hover:text-white underline disabled:no-underline disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="btn-primary-white"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={16} /> Verifying...</> : 'Verify & Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="btn-outline-white"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

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
          padding: 40px 20px;
        }

        .login-card-compact {
          display: flex;
          width: 100%;
          max-width: 800px;
          min-height: 580px;
          height: auto;
          background: #1d5ba0;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

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
          margin: auto;
          margin-top: 40px; /* Moved down by 40px */
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
          margin-bottom: 16px;
        }

        .message-banner {
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .login-form-main {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon .icon {
          position: absolute;
          left: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .login-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          padding: 10px 12px 10px 38px;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .login-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: white;
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
        }

        .btn-primary-white:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .demo-box {
          margin-top: 16px;
          background: rgba(0, 0, 0, 0.1);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          padding: 12px;
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

        .btn-outline-white {
          width: 100%;
          padding: 10px;
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .otp-display-panel {
          background: rgba(255, 255, 255, 0.1);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          padding: 16px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 8px;
        }

        .otp-input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 12px;
          color: white;
          text-align: center;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.4em;
          outline: none;
          transition: all 0.2s;
        }

        .footer-copyright {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 850px) {
          .login-card-compact {
            max-width: 440px;
            height: auto;
          }
          .login-logo-side { display: none; }
        }
      `}</style>
    </div>
  );
};

export default DynamicLoginForm;
