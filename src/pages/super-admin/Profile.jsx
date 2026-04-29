import React, { useState, useRef, useEffect, memo } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Save,
  CheckCircle, Briefcase, Globe, X, AlertCircle, Loader2,
  Lock, Eye, EyeOff, Crosshair
} from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useProfile } from '@/context/super-admin/ProfileContext';
import avatarImg from '@/assets/avatar.png';

// ─── Field — stable memo component (prevents cursor-jump on re-render) ───────
const Field = memo(({ label, name, value, onChange, type = 'text', icon: Icon, error, placeholder, isDark, disabled, actionBtn }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
      {actionBtn}
    </div>
    <div className="relative">
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error
            ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5'
            : (isDark
                ? 'bg-[#212529] border-slate-600 text-white focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500')
          }`}
      />
      <Icon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${error ? 'text-rose-400' : 'text-slate-400'}`} />
    </div>
    {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
  </div>
));

// ─── Profile page ─────────────────────────────────────────────────────────────
const Profile = () => {
  const { isDark } = useTheme();
  const { profile, loading, isSaving, saveError, updateProfile } = useProfile();
  const fileInputRef = useRef(null);

  // Local form copy — synced from context on first load
  const [profileData, setprofile] = useState(profile);
  const [errors,   setErrors]   = useState({});
  const [saved,    setSaved]    = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [passwordError,   setPasswordError]   = useState('');

  // Keep local form in sync whenever context profile changes externally
  useEffect(() => {
    setprofile(profile);
  }, [profile]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      alert('Image must be smaller than 800 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setprofile(prev => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      if ('+254 '.startsWith(value) || value === '') {
        // do nothing, let it be
      } else {
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith('254')) {
          digits = digits.substring(3);
        } else if (digits.startsWith('0')) {
          digits = digits.substring(1);
        }
        if (digits.length > 9) digits = digits.substring(0, 9);
        value = '+254 ' + digits;
      }
    }

    setprofile(prev => ({ ...prev, [name]: value }));
    // Clear the field-level error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!profile.fullName?.trim())                              errs.fullName = 'Full name is required.';
    if (!profile.email?.trim() || !/\S+@\S+\.\S+/.test(profile.email)) errs.email = 'Valid email is required.';
    if (!profile.phone?.trim())                                 errs.phone = 'Phone number is required.';
    return errs;
  };

  // ── Get Location ───────────────────────────────────────────────────────────
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
          const data = await res.json();
          let locationStr = data.display_name || `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          // Try to get just city and country if possible
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.state_district || data.address.county;
            const country = data.address.country;
            if (city && country) locationStr = `${city}, ${country}`;
          }
          setprofile(prev => ({ ...prev, location: locationStr }));
        } catch (error) {
          setprofile(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert('Unable to retrieve your location');
      }
    );
  };

  // ── Save Changes ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const { error } = await updateProfile(profileData);

    if (error) {
      // saveError from context will show the banner; also toast warning
      setSaveMsg('⚠ Saved locally — server unreachable.');
    } else {
      setSaveMsg('Profile updated!');
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setSaveMsg(''); }, 4000);
  };

  // ── Reset to last-saved context data ──────────────────────────────────────
  const handleReset = () => {
    setprofile(profile);
    setErrors({});
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const isServerError = saveError && !isSaving;
  const cardClass = `rounded-2xl border transition-all duration-300 overflow-hidden ${
    isDark ? 'bg-[#212529]/80 backdrop-blur-md border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
  }`;

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div className="space-y-2">
      <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border rounded-lg py-2.5 pl-4 pr-12 text-sm font-medium outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-white focus:border-brand focus:ring-4 focus:ring-brand/10' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand focus:ring-4 focus:ring-brand/10'}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  // ── Skeleton loader while profile is fetching ──────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className={`h-8 w-40 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`${cardClass} p-8`}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className={`w-32 h-32 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="flex-1 grid grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-10 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Profile Settings</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your digital identity and account details.
          </p>
        </div>

        {/* Success toast */}
        {saved && (
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold animate-slide-in border ${
            saveMsg.startsWith('⚠')
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : 'bg-brand/10 border-brand/20 text-brand'
          }`}>
            <CheckCircle size={16} />
            {saveMsg}
          </div>
        )}
      </div>

      {/* ── Server error banner ── */}
      {isServerError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ── Form card ── */}
      <div className={cardClass}>
        <div className="p-10">
          <form className="flex flex-col md:flex-row gap-12 items-start" onSubmit={handleSubmit} noValidate>

            {/* Avatar column */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className={`w-40 h-40 rounded-full overflow-hidden p-1.5 border-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'} shadow-inner overflow-hidden`}>
                  <img
                    src={profileData.profileImage || avatarImg}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110 duration-700"
                    onError={(e) => { e.target.src = avatarImg; }}
                  />
                </div>
                <label
                  className="absolute bottom-2 right-2 p-3 bg-brand text-white rounded-full shadow-2xl hover:bg-brand/90 transition-all cursor-pointer border-4 border-white dark:border-[#2c3136] hover:scale-110 active:scale-95 group-hover:rotate-12"
                  title="Change avatar"
                >
                  <Camera size={20} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{profileData.fullName}</p>
                <p className={`text-sm font-bold mt-0.5 tracking-wide ${isDark ? 'text-brand' : 'text-brand'}`}>{profileData.role}</p>
              </div>
              <p className={`text-xs font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                JPG or PNG · <span className="font-bold">800 KB</span> max
              </p>
            </div>

            {/* Fields column */}
            <div className="flex-1 w-full space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <Field
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  icon={User}
                  error={errors.fullName}
                  placeholder="Your full name"
                  isDark={isDark}
                  disabled={isSaving}
                />
                <Field
                  label="Email Address"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  type="email"
                  icon={Mail}
                  error={errors.email}
                  placeholder="your@email.com"
                  isDark={isDark}
                  disabled={isSaving}
                />
                <Field
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  type="tel"
                  icon={Phone}
                  error={errors.phone}
                  placeholder="+254 7XX XXXXXX"
                  isDark={isDark}
                  disabled={isSaving}
                />
                <Field
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="City, Country"
                  isDark={isDark}
                  disabled={isSaving}
                  actionBtn={
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating || isSaving}
                      className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
                        isDark ? 'text-brand hover:text-brand-hover' : 'text-[#1d5ba0] hover:text-[#154682]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                      Get Location
                    </button>
                  }
                />
                <Field
                  label="Job Role"
                  name="role"
                  value={profileData.role}
                  onChange={handleChange}
                  icon={Briefcase}
                  placeholder="Your role or title"
                  isDark={isDark}
                  disabled={isSaving}
                />

                {/* Bio — full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className={`text-sm font-black tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    disabled={isSaving}
                    rows={4}
                    placeholder="A short description about yourself..."
                    className={`w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all resize-none shadow-inner
                      ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isDark
                        ? 'bg-[#1a1d21] border-slate-700 text-white focus:border-brand focus:ring-4 focus:ring-brand/10'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand focus:ring-4 focus:ring-brand/10'
                      }`}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className={`pt-8 border-t flex justify-end gap-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                    ${isSaving ? 'opacity-40 cursor-not-allowed' : ''}
                    ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <X size={14} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                >
                  {isSaving
                    ? <><Loader2 size={16} className="animate-spin" />Saving…</>
                    : <><Save size={16} />Update Profile</>
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Password Update Card ── */}
      <div className={cardClass}>
        <div className="p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Lock size={20} />
            </div>
            <div>
              <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Security Settings</h4>
              <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ensure your account remains safe with a strong password.</p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} />
              {passwordError}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
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

            <div className="pt-8 lg:pt-0">
              {newPassword ? (
                <div className="space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 h-fit">
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
              ) : (
                <div className="h-full flex flex-col justify-center items-center p-8 border-2 border-dashed rounded-2xl text-center opacity-50 dark:border-slate-700 border-slate-200">
                  <Lock size={48} className="mb-4 text-slate-400" />
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enter a new password to check its strength</p>
                </div>
              )}
            </div>
          </div>
          
          <div className={`mt-10 pt-8 border-t flex justify-end ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => {
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
                setSaveMsg('Password updated successfully!');
                setSaved(true);
                setTimeout(() => { setSaved(false); setSaveMsg(''); }, 4000);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <Lock size={16} />
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Products Managed', value: '248',   icon: <Briefcase size={20} />, color: 'text-brand',   bg: 'bg-brand/10'   },
          { label: 'Orders Processed', value: '1,842', icon: <CheckCircle size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10'  },
          { label: 'Sellers Onboarded', value: '64',   icon: <Globe size={20} />, color: 'text-violet-500',  bg: 'bg-violet-500/10' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`${cardClass} p-6 flex items-center gap-5 hover:scale-[1.02] cursor-default`}>
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
              <p className={`text-xs font-bold tracking-tight uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
