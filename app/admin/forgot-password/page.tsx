'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import ReCaptcha from '@/components/common/ReCaptcha';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
      setError('Please complete the security Captcha verification.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch reset link');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] font-inter px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#C9A66B]/25 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#183629] text-[#C9A66B] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-[#183629] tracking-tight">
            Forgot Password
          </h1>
          <p className="text-[#8C7A5B] text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
            Administrative Recovery
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#183629]">
              Check Your Inbox
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              If an administrative account matches <strong className="text-[#183629]">{email}</strong>, a secure password reset link has been dispatched with instructions.
            </p>
            <p className="text-[11px] text-gray-400">
              Please check your spam or promotions folder if it doesn&apos;t arrive within a few moments.
            </p>
            <div className="pt-4">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#183629] hover:text-[#C9A66B] transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500 leading-relaxed">
              Enter your registered administrator email address. We will dispatch a single-use secure reset link to your inbox.
            </p>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#183629] mb-1.5" htmlFor="email">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none transition-all text-sm"
                  placeholder="admin@gulscollection.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Security Captcha */}
            <div className="pt-1">
              <ReCaptcha
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#183629] text-[#F3E9D7] hover:bg-[#11261d] hover:text-[#C9A66B] font-medium py-3 rounded-lg transition-all tracking-[0.1em] uppercase text-xs font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Dispatch Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#8C7A5B] hover:text-[#183629] font-medium transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

