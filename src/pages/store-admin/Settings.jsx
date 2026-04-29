import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Lock, Shield,
  UserCheck, Globe, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';

const TABS = [
  { id: 'general',       icon: <SettingsIcon size={18} />, label: 'General' },
  { id: 'notifications', icon: <Bell size={18} />,         label: 'Notifications' },
  { id: 'password',      icon: <Lock size={18} />,         label: 'Password & Security' },
  { id: 'privacy',       icon: <Shield size={18} />,       label: 'Privacy' },
  { id: 'permissions',   icon: <UserCheck size={18} />,    label: 'Permissions' },
  { id: 'language',      icon: <Globe size={18} />,        label: 'Language' },
];

const Settings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  // General
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('en');

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

  // Privacy
  const [showEmail,       setShowEmail]       = useState(false);
  const [showPhone,       setShowPhone]       = useState(false);
  const [allowTracking,   setAllowTracking]   = useState(false);
  const [dataSharingAds,  setDataSharingAds]  = useState(false);

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

  const card = `rounded-xl border transition-all duration-300 ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`;
  const inputClass = `w-full border rounded-lg py-2.5 pl-4 pr-4 text-sm font-medium outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'}`;
  const labelClass = `text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  const Toggle = ({ active, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer focus:outline-none ${active ? 'bg-brand' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${active ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const Checkbox = ({ label, checked, onToggle }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        onClick={onToggle}
        className={`w-4 h-4 rounded border transition-all flex items-center justify-center focus:outline-none ${checked ? 'bg-brand border-brand' : (isDark ? 'border-slate-600' : 'border-slate-300')}`}
      >
        {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </button>
      <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
    </label>
  );

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>General Settings</h4>

            <div className="flex items-center justify-between p-4 rounded-lg bg-brand/5 border border-brand/10">
              <div>
                <h6 className="text-sm font-bold text-brand">Public Profile</h6>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Allow others to find and view your profile.</p>
              </div>
              <Toggle active={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} />
            </div>

            <div className="space-y-3">
              <h6 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Preferences</h6>
              <Checkbox label="Account updates and security alerts" checked={emailUpdates} onToggle={() => setEmailUpdates(!emailUpdates)} />
              <Checkbox label="Marketing emails and promotions" checked={emailMarketing} onToggle={() => setEmailMarketing(!emailMarketing)} />
              <Checkbox label="Product updates and newsletters" checked={emailNewsletter} onToggle={() => setEmailNewsletter(!emailNewsletter)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={inputClass}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={inputClass}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Notification Settings</h4>

            <div className="space-y-4">
              <h6 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Activity Alerts</h6>
              {[
                { label: 'New orders and transactions', val: notifyOrders, set: setNotifyOrders },
                { label: 'New reviews and ratings',     val: notifyReviews, set: setNotifyReviews },
                { label: 'Direct messages',             val: notifyMessages, set: setNotifyMessages },
                { label: 'System and platform alerts',  val: notifySystem, set: setNotifySystem },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
                  <Toggle active={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>

            <div className={`border-t pt-6 space-y-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h6 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Delivery Channels</h6>
              {[
                { label: 'Email notifications', val: notifyEmail, set: setNotifyEmail },
                { label: 'Push notifications',  val: notifyPush,  set: setNotifyPush },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
                  <Toggle active={val} onToggle={() => set(!val)} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Password & Security</h4>

            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm font-medium">
                {passwordError}
              </div>
            )}

            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="At least 8 characters"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Repeat new password"
            />

            {newPassword && (
              <div className="space-y-1">
                <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password strength</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => {
                    const strength = Math.min(4, [
                      newPassword.length >= 8,
                      /[A-Z]/.test(newPassword),
                      /[0-9]/.test(newPassword),
                      /[^A-Za-z0-9]/.test(newPassword),
                    ].filter(Boolean).length);
                    const colors = ['bg-rose-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                    return (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${n <= strength ? colors[strength - 1] : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Privacy Settings</h4>

            {[
              { label: 'Show email on profile',       sub: 'Your email address will be visible to other users.', val: showEmail, set: setShowEmail },
              { label: 'Show phone number on profile', sub: 'Your phone number will be visible to other users.', val: showPhone, set: setShowPhone },
              { label: 'Allow activity tracking',     sub: 'Help us improve by sharing anonymous usage data.',   val: allowTracking, set: setAllowTracking },
              { label: 'Personalized advertising',    sub: 'Allow data to be used for ad targeting purposes.',   val: dataSharingAds, set: setDataSharingAds },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-start justify-between gap-6">
                <div>
                  <h6 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</h6>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>
                </div>
                <Toggle active={val} onToggle={() => set(!val)} />
              </div>
            ))}
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Permissions</h4>

            {[
              { label: 'Two-Factor Authentication', sub: 'Require a verification code on sign-in.',     val: perm2FA, set: setPerm2FA },
              { label: 'API Access',                sub: 'Allow external apps to connect via API.',     val: permApiAccess, set: setPermApiAccess },
              { label: 'Data Export',               sub: 'Allow downloading your data as CSV or JSON.', val: permExportData, set: setPermExportData },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-start justify-between gap-6">
                <div>
                  <h6 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</h6>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>
                </div>
                <Toggle active={val} onToggle={() => set(!val)} />
              </div>
            ))}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Language & Region</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Display Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Date Format</label>
                <select className={inputClass}>
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Currency</label>
                <select className={inputClass}>
                  <option>USD — US Dollar</option>
                  <option>EUR — Euro</option>
                  <option>GBP — British Pound</option>
                  <option>INR — Indian Rupee</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
          <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your account preferences and configurations.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm font-bold animate-fade-in">
            <CheckCircle size={16} />
            Settings saved!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tab Navigation */}
        <div className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-lg shadow-brand-light'
                  : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50')
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className={`md:col-span-2 ${card}`}>
          <div className="p-6">
            {renderContent()}

            <div className={`mt-8 pt-6 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={handleSave}
                className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand-light active:scale-95"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
