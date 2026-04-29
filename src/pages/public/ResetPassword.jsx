import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyResetToken, invalidateToken } from '@/utils/common/emailService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // null = loading, true = valid, false = invalid
  const navigate = useNavigate();

  useEffect(() => {
    // Verify the token when the page loads
    if (!email || !token) {
      setIsValidToken(false);
      return;
    }
    const valid = verifyResetToken(token, email);
    setIsValidToken(valid);
  }, [email, token]);

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Search ALL localStorage databases to update the password
    const databases = [
      'stateAdminAccounts',
      'regionAccounts',
      'branchAccounts',
      'hubAccounts',
      'storeAccounts'
    ];

    let accountFoundAndUpdated = false;

    databases.forEach(db => {
      const accounts = JSON.parse(localStorage.getItem(db) || '[]');
      const targetIndex = accounts.findIndex(acc => acc.email.toLowerCase() === email.toLowerCase());
      
      if (targetIndex !== -1) {
        accounts[targetIndex].password = formData.password;
        delete accounts[targetIndex].confirmPassword; 
        localStorage.setItem(db, JSON.stringify(accounts));
        accountFoundAndUpdated = true;
      }
    });

    if (accountFoundAndUpdated) {
      // Invalidate the token so it can't be reused
      invalidateToken(token);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } else {
      setErrors({ global: 'Account associated with this email no longer exists.' });
    }
  };

  // Invalid or expired token
  if (isValidToken === false) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid or Expired Link</h2>
          <p className="text-gray-500 mb-6">
            This password reset link is invalid or has expired. Please request a new reset link from the login page.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-3 bg-[#1a2c42] text-white rounded-xl font-bold hover:bg-[#152436] transition-all shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Still verifying token
  if (isValidToken === null) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a2c42]/30 border-t-[#1a2c42] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Password Updated!</h2>
          <p className="text-gray-500 mb-8">
            Your password has been successfully reset. Redirecting you home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          You are resetting the password for <span className="font-semibold text-gray-800">{email}</span>. Please choose a new secure password.
        </p>

        {errors.global && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
            <input 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Enter new password" 
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 outline-none transition-all focus:ring-2 focus:ring-[#1a2c42]/20 focus:border-[#1a2c42] ${errors.password ? 'border-red-500' : 'border-gray-200'}`} 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <input 
              name="confirmPassword" 
              type="password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm new password" 
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 outline-none transition-all focus:ring-2 focus:ring-[#1a2c42]/20 focus:border-[#1a2c42] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`} 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full py-3 mt-4 bg-[#1a2c42] text-white rounded-xl font-bold hover:bg-[#152436] transition-all shadow-md"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
