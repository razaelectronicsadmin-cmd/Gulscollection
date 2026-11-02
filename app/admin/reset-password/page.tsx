'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          !
        </div>
        <h2 className="text-lg font-serif font-bold text-[#183629]">
          Invalid Reset Link
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The reset link you followed is missing a valid security token or has already been used.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/forgot-password"
            className="inline-block px-5 py-2.5 rounded-lg bg-[#183629] text-[#F3E9D7] text-xs font-bold uppercase tracking-wider hover:bg-[#11261d]"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#183629]">
          Password Reset Complete
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your administrative password has been securely updated. Redirecting you to the sign-in screen...
        </p>
        <div className="pt-2">
          <Link
            href="/admin/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-[#183629] text-[#F3E9D7] text-xs font-bold uppercase tracking-wider hover:bg-[#11261d] transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#183629] mb-1.5" htmlFor="new-password">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none transition-all text-sm"
            placeholder="Min 8 characters"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#183629] p-1"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#183629] mb-1.5" htmlFor="confirm-password">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none transition-all text-sm"
            placeholder="Re-enter password"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#183629] p-1"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] font-medium py-3 rounded-lg transition-all tracking-[0.1em] uppercase text-xs font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set New Password'}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/admin/login"
          className="text-xs text-[#8C7A5B] hover:text-[#183629] font-medium transition-colors"
        >
          Cancel and return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] font-inter px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#C9A66B]/25 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-[#183629] tracking-tight">
            Reset Password
          </h1>
          <p className="text-[#8C7A5B] text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
            Choose a new secure password
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#C9A66B]" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

