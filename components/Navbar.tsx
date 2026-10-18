'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Phone, Mail, Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useStore();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/fragrance?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Fragrances', href: '/fragrance' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>

<header className=" top-0 left-0 w-full z-40">
    {/* ─── Top Announcement & Contact Ribbon ───────── */}
      <div className="w-full bg-[#0b0f0e] text-[#F5F5F0] border-b border-brand-gold/15 px-[10px] text-xs md:text-sm font-sans">
        <div className="w-full h-11 md:h-12 flex items-center justify-between">
          {/* Left: Contact Info */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="tel:03332265461"
              className="flex items-center gap-2 hover:text-brand-gold transition-colors"
            >
              <Phone size={15} className="text-brand-gold" />
              <span>0333-2265461</span>
            </a>
            <a
              href="mailto:gulscollection@gmail.com"
              className="flex items-center gap-2 hover:text-brand-gold transition-colors"
            >
              <Mail size={15} className="text-brand-gold" />
              <span>gulscollection@gmail.com</span>
            </a>
          </div>

          {/* Center: Free Delivery Text */}
          <div className="w-full md:w-auto text-center font-semibold tracking-[1.5px] uppercase text-xs sm:text-sm">
            FREE DELIVERY ON ORDERS ABOVE PKR 5,000
          </div>

          {/* Right: Social Media Links */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-brand-beige/70">Follow Us:</span>
            <div className="flex items-center space-x-4">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-brand-gold transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-brand-gold transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-brand-gold transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-brand-gold transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <nav
        className={cn(
            'w-full transition-all duration-300 ease-in-out px-6 md:px-14',
            isScrolled
              ? 'bg-brand-green-dark/95 backdrop-blur-md shadow-soft-md'
              : 'bg-brand-green-dark backdrop-blur-sm'
          )}
        >
        <div className="max-w-7xl mx-auto h-[91px] flex items-center justify-between">
          {/* Left: Brand Logo Image */}
          <Link href="/" className="relative flex items-center justify-center transition-transform hover:scale-105">
            <Image
              src="/images/brand-logo-gold.png"
              alt="Gul's Collection"
              width={94}
              height={58}
              className="object-contain"
              priority
            />
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-7 h-full">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(link.href.split('?')[0]);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'relative h-full flex items-center text-[13px] uppercase tracking-[1.5px] transition-all duration-200 active:scale-95 cursor-pointer font-sans',
                    isActive
                      ? 'text-brand-gold font-semibold'
                      : 'text-[#F5F5F0] hover:text-brand-gold font-normal'
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-[28px] left-0 w-full h-[2px] bg-brand-gold" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions & Button */}
          <div className="flex items-center space-x-6 text-[#F5F5F0]">
            
            {/* Actionable Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Search Fragrances"
                className="hover:text-brand-gold transition-colors cursor-pointer flex items-center"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Desktop Quick Search dropdown */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-10 w-72 bg-brand-green border border-brand-gold/20 rounded-md shadow-soft-xl p-2 z-50"
                  >
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes, perfume, era..."
                        className="w-full text-xs bg-brand-green-dark px-3 py-2 rounded-sm text-brand-white placeholder-brand-beige/50 outline-none focus:ring-1 focus:ring-brand-gold font-sans"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-gold text-brand-green-dark text-[12px] uppercase tracking-wider font-bold rounded-sm hover:bg-brand-gold-light transition-colors shrink-0 cursor-pointer font-sans"
                      >
                        Go
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/cart"
              aria-label="Shopping Bag"
              className="relative hover:text-brand-gold transition-colors active:scale-95"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-gold text-brand-green-dark text-[12px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Figma Gold Button (Desktop Only) */}
            <div className="hidden lg:block">
              <Button href="/fragrance" className="!py-[7.5px] !px-[20px] !text-[12px] tracking-[2.4px]">
                Explore Scents
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden hover:text-brand-gold transition-colors cursor-pointer p-1 active:scale-95"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
      </header>

      {/* ─── Modern Slide-out Mobile Navigation Drawer (Dark Theme) ───────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-[85%] max-w-sm h-full bg-brand-green-dark shadow-2xl flex flex-col justify-between p-8 z-10 border-l border-brand-gold/20 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-brand-gold/20">
                  <Image
                    src="/images/brand-logo-gold.png"
                    alt="Gul's Collection"
                    width={70}
                    height={43}
                    className="object-contain"
                  />
                  <button
                    className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark transition-colors cursor-pointer active:scale-90"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close Menu"
                  >
                    <X size={20} strokeWidth={1.8} />
                  </button>
                </div>

                <form onSubmit={handleSearchSubmit} className="mt-8 flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fragrance, notes…"
                    className="w-full text-xs bg-brand-green px-4 py-3 rounded-xs text-brand-white placeholder-brand-beige/50 outline-none border border-brand-gold/20 focus:border-brand-gold font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-brand-gold text-brand-green-dark text-[12px] uppercase tracking-wider font-semibold rounded-xs hover:bg-brand-gold-light transition-colors shrink-0 cursor-pointer font-sans"
                  >
                    Search
                  </button>
                </form>

                <nav className="mt-10 flex flex-col space-y-2">
                  {navLinks.map((link, idx) => {
                    const isActive =
                      link.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(link.href.split('?')[0]);

                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.06, duration: 0.35, ease: 'easeOut' }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'py-3.5 px-2 flex items-center justify-between font-serif text-2xl tracking-tight transition-all duration-200 active:scale-95 rounded-xs',
                            isActive
                              ? 'text-brand-gold font-bold pl-4 border-l-2 border-brand-gold bg-brand-gold/10'
                              : 'text-brand-offwhite hover:text-brand-gold hover:pl-3'
                          )}
                        >
                          <span>{link.name}</span>
                          {isActive ? (
                            <span className="w-2 h-2 rounded-full bg-brand-gold" />
                          ) : (
                            <ArrowRight size={16} className="text-brand-gold/50" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-12 pt-6 border-t border-brand-gold/20 space-y-4 font-sans text-xs"
              >
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 px-4 bg-brand-green border border-brand-gold/20 rounded-xs flex items-center justify-between text-brand-offwhite hover:border-brand-gold transition-colors active:scale-95"
                >
                  <span className="uppercase tracking-[0.2em] font-semibold text-[12px] text-brand-gold">
                    Shopping Bag
                  </span>
                  <span className="font-semibold text-[#F5F5F0]">
                    {cartCount > 0 ? `${cartCount} items` : 'Empty'}
                  </span>
                </Link>

                <p className="text-[12px] uppercase tracking-[0.25em] text-brand-beige/50 text-center pt-2 font-medium">
                  Decades by Gul&apos;s &bull; Wear Your Era
                </p>
              </motion.div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}