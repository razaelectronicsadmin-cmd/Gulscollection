'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  KeyRound,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [currentEmail, setCurrentEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (isMounted && res.ok && data.user) {
          setCurrentEmail(data.user.email);
          setAdminName(data.user.name || 'Admin');
          setRole(data.user.role || 'ADMIN');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);
    setIsUpdatingEmail(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_EMAIL',
          newEmail,
          currentPassword: emailCurrentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email.');

      setEmailMessage({ type: 'success', text: data.message });
      setCurrentEmail(newEmail.trim().toLowerCase());
      setNewEmail('');
      setEmailCurrentPassword('');
    } catch (err: any) {
      setEmailMessage({ type: 'error', text: err.message || 'Error updating email.' });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword.length < 8) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match. Please verify.' });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PASSWORD',
          currentPassword: pwdCurrentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setPwdMessage({ type: 'success', text: data.message });
      setPwdCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 font-inter">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900">
          Account Settings & Security
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your administrator credentials, email address, and security policies.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center font-bold text-lg">
            {adminName.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{adminName}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {role}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {isLoadingProfile ? 'Loading...' : currentEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <ShieldCheck size={16} className="text-[#C9A66B]" />
          <span>Two-factor & Captcha Protected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ─── Card 1: Change Admin Email ───────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#C9A66B] flex items-center justify-center border border-amber-200/50">
                <Mail size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Change Admin Email</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Updating your email requires current password confirmation. Order alerts and reset links will be redirected to the new address.
            </p>

            {emailMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium mb-5 flex items-center gap-2 ${
                  emailMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {emailMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{emailMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Email
                </label>
                <input
                  type="text"
                  disabled
                  value={currentEmail}
                  className="w-full px-3.5 py-2 text-xs bg-gray-100 text-gray-500 rounded-lg border border-gray-200 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Admin Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newadmin@gulscollection.com"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Password (for authorization)
                </label>
                <div className="relative">
                  <input
                    type={showEmailCurrentPassword ? 'text' : 'password'}
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailCurrentPassword(!showEmailCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showEmailCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingEmail}
                className="flex px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
              >
                {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Email Address'}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Card 2: Change Password ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#C9A66B] flex items-center justify-center border border-amber-200/50">
                <KeyRound size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Change Admin Password</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Use a robust passphrase with at least 8 characters, combining uppercase, lowercase, numbers, and symbols.
            </p>

            {pwdMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium mb-5 flex items-center gap-2 ${
                  pwdMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {pwdMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPwdCurrent ? 'text' : 'password'}
                    value={pwdCurrentPassword}
                    onChange={(e) => setPwdCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdCurrent(!showPwdCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPwdCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPwdNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdNew(!showPwdNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPwdNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
              >
                {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

