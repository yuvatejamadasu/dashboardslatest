import React, { useState, useRef, useEffect, memo } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Save,
  CheckCircle, Briefcase, X, AlertCircle, Loader2, Crosshair, Edit2
} from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useProfile } from '@/context/hub-admin/ProfileContext';
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
                ? 'bg-[#212529] border-slate-600 text-white focus:border-brand'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand')
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
  const [isEditing, setIsEditing] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [saved,    setSaved]    = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');
  const [isLocating, setIsLocating] = useState(false);

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!profileData.fullName?.trim())                              errs.fullName = 'Full name is required.';
    if (!profileData.phone?.trim())                                 errs.phone = 'Phone number is required.';
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
      setSaveMsg('⚠ Saved locally — server unreachable.');
    } else {
      setSaveMsg('Profile updated!');
      setIsEditing(false);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setSaveMsg(''); }, 4000);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setprofile(profile);
    setErrors({});
    setIsEditing(false);
  };

  const isServerError = saveError && !isSaving;
  const cardClass = `rounded-xl border transition-all duration-300 overflow-hidden ${
    isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
  }`;

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Hub Administration Profile</h2>
          <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View and update your personal information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm
                ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}

          {saved && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold animate-fade-in border ${
              saveMsg.startsWith('⚠')
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-green-500/10 border-green-500/20 text-green-500'
            }`}>
              <CheckCircle size={16} />
              {saveMsg}
            </div>
          )}
        </div>
      </div>

      {isServerError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ── Form card ── */}
      <div className={cardClass}>
        <div className="p-8">
          <form className="flex flex-col md:flex-row gap-8 items-start" onSubmit={handleSubmit} noValidate>

            {/* Avatar column */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-500/20 shadow-inner">
                  <img
                    src={profileData.profileImage || avatarImg}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    onError={(e) => { e.target.src = avatarImg; }}
                  />
                </div>
                <label
                  className={`absolute bottom-1 right-1 p-2.5 bg-brand text-white rounded-full shadow-xl transition-all border-2 border-white dark:border-[#2c3136] active:scale-95 group-hover:rotate-6 ${
                    isEditing ? 'cursor-pointer hover:bg-brand-hover' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <Camera size={18} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={!isEditing || isSaving}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{profileData.fullName}</p>
                <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>{profileData.role}</p>
              </div>
            </div>

            {/* Fields column */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <Field
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  icon={User}
                  error={errors.fullName}
                  placeholder="Your full name"
                  isDark={isDark}
                  disabled={!isEditing || isSaving}
                />
                <Field
                  label="Email Address"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  type="email"
                  icon={Mail}
                  isDark={isDark}
                  disabled={true}
                />
                <Field
                  label="Mobile Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  type="tel"
                  icon={Phone}
                  error={errors.phone}
                  placeholder="+254 7XX XXXXXX"
                  isDark={isDark}
                  disabled={!isEditing || isSaving}
                />
                <Field
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="City, Country"
                  isDark={isDark}
                  disabled={!isEditing || isSaving}
                  actionBtn={
                    isEditing && (
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating || isSaving}
                        className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
                          isDark ? 'text-brand hover:text-brand-hover' : 'text-[#1d5ba0] hover:text-[#154682]'
                        }`}
                      >
                        {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                        Get Location
                      </button>
                    )
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
                  disabled={!isEditing || isSaving}
                />

                <div className="md:col-span-2 space-y-2">
                  <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    disabled={!isEditing || isSaving}
                    rows={3}
                    placeholder="A short description about yourself..."
                    className={`w-full border rounded-lg py-2.5 px-4 text-sm font-medium outline-none transition-all resize-none
                      ${(!isEditing || isSaving) ? 'opacity-50 cursor-not-allowed text-slate-500' : ''}
                      ${isDark
                        ? 'bg-[#212529] border-slate-600 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'
                      }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className={`mt-8 pt-6 border-t flex justify-end gap-3 animate-fade-in ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors
                      ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <X size={15} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    {isSaving
                      ? <><Loader2 size={16} className="animate-spin" />Saving…</>
                      : <><Save size={16} />Save Changes</>
                    }
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Products Managed', value: '248',   color: 'text-brand',   bg: 'bg-brand/10'   },
          { label: 'Orders Processed', value: '1,842', color: 'text-green-500',  bg: 'bg-green-500/10'  },
          { label: 'Sellers Onboarded', value: '64',   color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${cardClass} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <span className={`text-lg font-black ${color}`}>#</span>
            </div>
            <div>
              <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
