"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import ReCaptcha from "@/components/common/ReCaptcha";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
      setError("Please complete the security Captcha verification.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Please verify your email and password.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
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
            Gul&apos;s Collection
          </h1>
          <p className="text-[#8C7A5B] text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
            Administrative Console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#183629] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none transition-all text-sm"
              placeholder="admin@gulscollection.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#183629]" htmlFor="password">
                Password
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-xs text-[#8C7A5B] hover:text-[#183629] hover:underline font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#183629] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Security Captcha */}
          <div className="pt-1">
            <ReCaptcha
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
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
              "Sign In to Console"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
