import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTPEmail, verifyOTP } from '@/utils/common/emailMock';
import { generateResetLink } from '@/utils/common/emailService';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkIfEmailExists = (searchEmail) => {
    // Search ALL localStorage databases for this email
    const databases = [
      'stateAdminAccounts',
      'regionAccounts',
      'branchAccounts',
      'hubAccounts',
      'storeAccounts'
    ];

    for (let db of databases) {
      const accounts = JSON.parse(localStorage.getItem(db) || '[]');
      if (accounts.some(acc => acc.email.toLowerCase() === searchEmail.toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (!checkIfEmailExists(email)) {
      setMessage({ text: 'No account found with that email address.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Sending verification code...', type: 'success' });
    
    try {
      const res = await sendOTPEmail(email);
      if (res.success) {
        setMessage({ text: `Verification code sent to ${email}`, type: 'success' });
        setStep('otp');
      } else {
        setMessage({ text: res.message || 'Failed to send OTP. Please try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Please check if the backend is running.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage({ text: 'Please enter the OTP', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Verifying...', type: 'success' });

    try {
      const res = await verifyOTP(email, otp);
      if (res.success) {
        setMessage({ text: 'OTP Verified! Redirecting...', type: 'success' });
        
        // Use the existing emailService to generate a valid reset link/token
        // This keeps it compatible with ResetPassword.jsx
        const { resetLink } = generateResetLink(email);
        
        // Wait a small moment so user sees success message
        setTimeout(() => {
          navigate(resetLink.replace(window.location.origin, ''));
        }, 1500);
      } else {
        setMessage({ text: res.message || 'Invalid OTP. Please try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Verification failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-[60vh]">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          {step === 'email' ? 'Forgot Password?' : 'Enter OTP'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {step === 'email' 
            ? "No worries, we'll send you a verification code to reset your instructions."
            : `Please enter the 6-digit verification code sent to ${email}`
          }
        </p>
        
        <form onSubmit={step === 'email' ? handleSendOTP : handleVerifyOTP} className="space-y-4">
          {step === 'email' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email" 
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 outline-none transition-all focus:ring-2 focus:ring-[#1a2c42]/20 focus:border-[#1a2c42] ${message.type === 'error' ? 'border-red-500' : 'border-gray-200'}`} 
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Verification Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all focus:ring-2 focus:ring-[#1a2c42]/20 focus:border-[#1a2c42] ${message.type === 'error' ? 'border-red-500' : 'border-gray-200'}`} 
              />
            </div>
          )}

          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.type === 'error' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              )}
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 mt-4 bg-[#1a2c42] text-white rounded-xl font-bold hover:bg-[#152436] transition-all shadow-md flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {step === 'email' ? 'Send OTP' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => step === 'email' ? navigate(-1) : setStep('email')} 
            className="text-sm font-semibold text-[#1a2c42] hover:text-[#152436] transition-colors flex items-center justify-center mx-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {step === 'email' ? 'Back to login' : 'Change email address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
