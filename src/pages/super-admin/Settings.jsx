import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Lock, Shield,
  UserCheck, Globe, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';

const TABS = [
  { id: 'notifications', icon: <Bell size={18} />,         label: 'Notifications' },
  { id: 'password',      icon: <Lock size={18} />,         label: 'Password & Security' },
  { id: 'permissions',   icon: <UserCheck size={18} />,    label: 'Permissions' },
];

const Settings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saved, setSaved] = useState(false);

  // Notifications
  const [notifyOrders,    setNotifyOrders]   = useState(true);
  const [notifyReviews,   setNotifyReviews]  = useState(true);
  const [notifyMessages,  setNotifyMessages] = useState(false);
  const [notifySystem,    setNotifySystem]   = useState(true);
  const [notifyEmail,     setNotifyEmail]    = useState(true);
  const [notifyPush,      setNotifyPush]     = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [passwordError,   setPasswordError]   = useState('');

  // Permissions
  const [perm2FA,         setPerm2FA]         = useState(false);
  const [permApiAccess,   setPermApiAccess]   = useState(true);
  const [permExportData,  setPermExportData]  = useState(true);

  const handleSave = () => {
    if (activeTab === 'password') {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All password fields are required.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.');
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters.');
        return;
      }
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const card = `rounded-2xl border transition-all duration-300 ${isDark ? 'bg-[#212529]/80 backdrop-blur-md border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`;
  const inputClass = `w-full border rounded-xl py-3 pl-4 pr-4 text-sm font-medium outline-none transition-all shadow-inner ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white focus:border-brand focus:ring-4 focus:ring-brand/10' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand focus:ring-4 focus:ring-brand/10'}`;
  const labelClass = `text-sm font-black tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  const Toggle = ({ active, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer focus:outline-none ${active ? 'bg-brand' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${active ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const Checkbox = ({ label, checked, onToggle }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center focus:outline-none ${checked ? 'bg-brand border-brand shadow-lg shadow-brand/20' : (isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}`}
      >
        {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </button>
      <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} group-hover:text-brand transition-colors`}>{label}</span>
    </label>
  );

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Bell size={20} />
              </div>
              <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</h4>
            </div>

            <div className="space-y-5">
              <h6 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Activity Alerts</h6>
              {[
                { label: 'New orders and transactions', val: notifyOrders, set: setNotifyOrders },
                { label: 'New reviews and ratings',     val: notifyReviews, set: setNotifyReviews },
                { label: 'Direct messages from users',  val: notifyMessages, set: setNotifyMessages },
                { label: 'System and platform updates', val: notifySystem, set: setNotifySystem },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0 pb-4 last:pb-0">
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                  <Toggle active={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>

            <div className={`border-t pt-8 space-y-5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h6 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Channels</h6>
              {[
                { label: 'Email notifications', val: notifyEmail, set: setNotifyEmail },
                { label: 'Push notifications',  val: notifyPush,  set: setNotifyPush },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                  <Toggle active={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Lock size={20} />
              </div>
              <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Security</h4>
            </div>

            {passwordError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                {passwordError}
              </div>
            )}

            <div className="grid gap-6">
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
                placeholder="Confirm your identity"
              />
              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Strength: strong suggested"
              />
              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                placeholder="One more time"
              />
            </div>

            {newPassword && (
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
                <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password Security Strength</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => {
                    const strength = Math.min(4, [
                      newPassword.length >= 8,
                      /[A-Z]/.test(newPassword),
                      /[0-9]/.test(newPassword),
                      /[^A-Za-z0-9]/.test(newPassword),
                    ].filter(Boolean).length);
                    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500'];
                    return (
                      <div
                        key={n}
                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${n <= strength ? colors[strength - 1] + ' shadow-lg shadow-' + colors[strength - 1].split('-')[1] + '-500/20' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}
                      />
                    );
                  })}
                </div>
                <p className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Use at least 8 characters, special symbols, and numbers for a stronger password.
                </p>
              </div>
            )}
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <UserCheck size={20} />
              </div>
              <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Permissions</h4>
            </div>

            <div className="grid gap-8">
              {[
                { label: 'Two-Factor (2FA) Security', sub: 'Enable robust login protection via app authenticator.', val: perm2FA, set: setPerm2FA },
                { label: 'External API Integration', sub: 'Securely connect Prime Basket data with 3rd-party apps.', val: permApiAccess, set: setPermApiAccess },
                { label: 'Bulk Data Archiving',      sub: 'Allow full export of your metrics and settings to JSON.', val: permExportData, set: setPermExportData },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="flex items-start justify-between gap-6">
                  <div>
                    <h6 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</h6>
                    <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>
                  </div>
                  <Toggle active={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Platform Settings</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your administrative hierarchy and system-wide preferences.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-black uppercase tracking-widest animate-slide-in">
            <CheckCircle size={18} />
            Configurations Applied
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all group ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-xl shadow-brand/20 -translate-y-1'
                  : (isDark ? 'text-slate-400 hover:bg-slate-800/80 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-brand hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5')
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-brand transition-colors'}>
                  {tab.icon}
                </span>
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className={`lg:col-span-3 ${card}`}>
          <div className="p-8 md:p-10">
            {renderContent()}

            <div className={`mt-10 pt-8 border-t flex items-center justify-between gap-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Last modified: <span className="font-black">April 08, 2026</span>
              </p>
              <button
                onClick={handleSave}
                className="bg-brand hover:bg-brand/90 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center gap-3"
              >
                <CheckCircle size={16} />
                Deploy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


