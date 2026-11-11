'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import ReCaptcha from '@/components/common/ReCaptcha';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Captcha Validation
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
      setError('Please complete the security Captcha verification before sending your message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-offwhite text-brand-black selection:bg-brand-gold/30 selection:text-brand-green-dark">
      <Navbar />

      <section className="pt-32 md:pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
            <span className="text-[16px] md:text-[11px] font-sans uppercase tracking-[0.3em] text-brand-gold mb-4 inline-block font-bold">
              Connect With The Atelier
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[56px] text-brand-green-dark tracking-tight mb-6 leading-tight">
              Get in Touch
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#8C7A5B] font-sans leading-relaxed tracking-wide px-4">
              Whether you seek bespoke consultation, gift curation, or assistance with your signature order, our concierge is at your service.
            </p>
          </div>

          {/* 2-Column Clean Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-10 pr-0 lg:pr-8"
            >
              <div>
                <span className="text-[12px] uppercase tracking-[0.25em] text-brand-gold font-semibold block mb-3">
                  Atelier Concierge
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-brand-green-dark mb-4">
                  Gul&apos;s Collection
                </h2>
                <p className="text-[13px] sm:text-[14px] text-[#8C7A5B] font-sans leading-relaxed">
                  Decades of scents. Crafted to leave an enduring memory in every room you enter.
                </p>
              </div>

              <div className="space-y-8 pt-6 border-t border-brand-gold/20 font-sans">
                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-brand-green-dark flex items-center justify-center text-brand-gold shrink-0 shadow-sm">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark">
                      Direct Email
                    </h3>
                    <p className="text-[13px] text-[#8C7A5B] mt-1 hover:text-brand-gold transition-colors cursor-pointer">
                      gulscollection.2617@gmail.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-brand-green-dark flex items-center justify-center text-brand-gold shrink-0 shadow-sm">
                    <Phone size={18} strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark">
                      WhatsApp Concierge
                    </h3>
                    <p className="text-[13px] text-[#8C7A5B] mt-1">+92 (300) 827-4192</p>
                    <p className="text-[11px] text-brand-gold font-medium mt-1">Available for real-time recommendations</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-brand-green-dark flex items-center justify-center text-brand-gold shrink-0 shadow-sm">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark">
                      House Location
                    </h3>
                    <p className="text-[13px] text-[#8C7A5B] mt-1">Karachi, Pakistan</p>
                    <p className="text-[11px] text-brand-gold font-medium mt-1">Nationwide Express Delivery</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-full bg-brand-green-dark flex items-center justify-center text-brand-gold shrink-0 shadow-sm">
                    <Clock size={18} strokeWidth={1.5} />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark">
                      Hours of Operation
                    </h3>
                    <p className="text-[13px] text-[#8C7A5B] mt-1">Monday &ndash; Saturday: 10:00 &ndash; 20:00 PKT</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Refined Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 bg-white p-6 sm:p-10 md:p-12 rounded-sm shadow-soft-md border border-brand-gold/20"
            >
              {isSubmitted ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-green-dark text-brand-gold flex items-center justify-center mx-auto mb-6 shadow-md">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-serif text-3xl text-brand-green-dark mb-3">Message Sent</h3>
                  <p className="text-[14px] text-[#8C7A5B] font-sans max-w-sm mx-auto mb-10 leading-relaxed">
                    Thank you for reaching out. A dedicated fragrance consultant will respond to your inquiry within 24 business hours.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                      setCaptchaToken('');
                    }}
                    className="w-full sm:w-auto tracking-[0.2em] text-[11px] px-8 py-4 bg-brand-green-dark text-brand-offwhite hover:bg-[#11261d]"
                  >
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark mb-2 font-sans">
                      Your Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ayesha Siddiqui"
                      className="w-full bg-transparent border-b border-brand-gold/30 py-3 text-[14px] text-brand-black placeholder-[#8C7A5B]/70 focus:outline-none focus:border-brand-gold focus:ring-0 transition-colors font-sans rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark mb-2 font-sans">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-transparent border-b border-brand-gold/30 py-3 text-[14px] text-brand-black placeholder-[#8C7A5B]/70 focus:outline-none focus:border-brand-gold focus:ring-0 transition-colors font-sans rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark mb-2 font-sans">
                      Inquiry Subject
                    </label>
                    <div className="relative">
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-transparent border-b border-brand-gold/30 py-3 text-[14px] text-brand-black focus:outline-none focus:border-brand-gold focus:ring-0 transition-colors font-sans cursor-pointer appearance-none rounded-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Fragrance Consultation">Personal Fragrance Consultation</option>
                        <option value="Order Tracking & Support">Order Tracking & Support</option>
                        <option value="Bespoke & Gifting">Bespoke & Corporate Gifting</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8C7A5B]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-green-dark mb-2 font-sans">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How may our house assist you today?"
                      className="w-full bg-transparent border-b border-brand-gold/30 py-3 text-[14px] text-brand-black placeholder-[#8C7A5B]/70 focus:outline-none focus:border-brand-gold focus:ring-0 transition-colors font-sans resize-none rounded-none"
                    />
                  </div>

                  {/* Security Captcha Verification */}
                  <div className="bg-white border border-brand-gold/25 p-4 rounded-sm shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-brand-gold" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-green-dark">
                        Security Verification
                      </span>
                    </div>
                    <ReCaptcha
                      onVerify={(token) => {
                        setCaptchaToken(token);
                        setError('');
                      }}
                      onExpire={() => setCaptchaToken('')}
                    />
                  </div>

                  {/* Error Message Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm font-medium leading-relaxed">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-10 py-4 bg-brand-gold text-brand-green-dark text-[12px] uppercase tracking-wider font-bold rounded-sm hover:bg-brand-gold-light transition-colors shrink-0 cursor-pointer font-sans"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> SENDING...</span>
                      ) : (
                        'SEND MESSAGE'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}