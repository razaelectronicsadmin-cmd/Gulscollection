'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Phone, Mail, Menu, X, ArrowRight, Instagram, Facebook, AtSign, Linkedin, Tv, Youtube  } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';


export interface AnnouncementBarData {
  id?: number;
  isVisible: boolean;
  message: string;
  showPhone: boolean;
  phoneNumber: string;
  phoneLink: string;
  showEmail: boolean;
  emailAddress: string;
  emailLink: string;
  showSocialIcons: boolean;
  
  // URLs
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  pinterestUrl: string;
  threadsUrl: string;

  // Individual Toggles
  showInstagram: boolean;
  showFacebook: boolean;
  showTiktok: boolean;
  showYoutube: boolean;
  showLinkedin: boolean;
  showPinterest: boolean;
  showThreads: boolean;

  bgColor: string;
  textColor: string;
  accentColor: string;
  fontSize: 'xs' | 'sm' | 'base';
}

function NavbarInner() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [announcement, setAnnouncement] = useState<AnnouncementBarData>({
    isVisible: true,
    message: 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
    showPhone: true,
    phoneNumber: '0333-2265461',
    phoneLink: 'tel:03332265461',
    showEmail: true,
    emailAddress: 'gulscollection2617',
    emailLink: 'mailto:gulscollection2617@gmail.com',
    showSocialIcons: true,
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    pinterestUrl: '',
    threadsUrl: '',
    
    // Yahan missing fields add kiye hain
    showInstagram: true,
    showFacebook: true,
    showTiktok: false,
    showYoutube: false,
    showLinkedin: false,
    showPinterest: false,
    showThreads: false,
    
    bgColor: '#0b0f0e',
    textColor: '#F5F5F0',
    accentColor: '#C9A66B',
    fontSize: 'sm',
  });

  const pathname = usePathname();
  const searchParams = useSearchParams(); // Naya hook add kiya
  const router = useRouter();
  const { cart } = useStore();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    
    if (href.includes('department=')) {
      const targetDept = href.split('department=')[1];
      const currentDept = searchParams.get('department'); // window.location ki jagah Next.js ka hook
      
      if (currentDept === targetDept) return true;
      
      // Default active state for Fragrance if no department query is present in URL
      if (targetDept === 'Fragrance' && pathname === '/fragrance' && !currentDept) return true;
      
      return false;
    }
    
    return pathname?.startsWith(href.split('?')[0]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Fetch announcement bar settings from DB
  useEffect(() => {
    fetch('/api/announcement')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.isVisible === 'boolean') {
          setAnnouncement(data);
        }
      })
      .catch(() => {});
  }, []);

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
    { name: 'Fragrance', href: '/fragrance?department=Fragrance' },
    { name: 'Leather', href: '/fragrance?department=Leather' },
    { name: 'Essentials', href: '/fragrance?department=Essentials' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>

<header className="sticky top-0 left-0 w-full z-50">
    {/* ─── Top Announcement & Contact Ribbon ───────── */}
    {announcement.isVisible && (
      <div 
        style={{ 
          backgroundColor: announcement.bgColor, 
          color: announcement.textColor,
          borderBottomColor: `${announcement.accentColor}33`,
        }}
        className={cn(
          "w-full border-b px-5 font-sans transition-colors duration-300",
          announcement.fontSize === 'xs' ? 'text-[11px]' :
          announcement.fontSize === 'base' ? 'text-[14px] md:text-[15px]' :
          'text-xs md:text-sm'
        )}
      >
        {/* Changed from Flex to Grid for absolute centering */}
        <div className="w-full h-11 md:h-12 grid grid-cols-1 md:grid-cols-3 items-center">
          
          {/* Left: Contact Info */}
          <div className="hidden md:flex items-center space-x-6 justify-start">
            {announcement.showPhone && (
              <a
                href={announcement.phoneLink || 'tel:03332265461'}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Phone size={15} style={{ color: announcement.accentColor }} />
                <span>{announcement.phoneNumber}</span>
              </a>
            )}
            {announcement.showEmail && (
              <a
                href={announcement.emailLink || 'mailto:gulscollection@gmail.com'}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Mail size={15} style={{ color: announcement.accentColor }} />
                <span>{announcement.emailAddress}</span>
              </a>
            )}
          </div>

          {/* Center: Announcement Text */}
          <div className="w-full text-center font-semibold tracking-[1.5px] uppercase truncate px-2">
            {announcement.message}
          </div>

          {/* Right: Social Media Links */}
          <div className="hidden md:flex items-center space-x-4 justify-end">
            {announcement.showSocialIcons && (
              <>
                <span className="opacity-70 text-[11px] uppercase tracking-wider">Follow Us:</span>
                <div className="flex items-center space-x-4" style={{ color: announcement.accentColor }}>
                  
                  {/* Instagram */}
                  {announcement.showInstagram && announcement.instagramUrl && (
                    <a href={announcement.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                      <Instagram size={16} strokeWidth={1.5} />
                    </a>
                  )}

                  {/* Facebook */}
                  {announcement.showFacebook && announcement.facebookUrl && (
                    <a href={announcement.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                      <Facebook size={16} strokeWidth={1.5} />
                    </a>
                  )}

                  {/* Threads (Using AtSign) */}
                  {announcement.showThreads && announcement.threadsUrl && (
                    <a href={announcement.threadsUrl} target="_blank" rel="noopener noreferrer" aria-label="Threads" className="hover:opacity-80 transition-opacity">
                      <AtSign size={16} strokeWidth={1.5} />
                    </a>
                  )}

                  {/* LinkedIn */}
                  {announcement.showLinkedin && announcement.linkedinUrl && (
                    <a href={announcement.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
                      <Linkedin size={16} strokeWidth={1.5} />
                    </a>
                  )}

                  {/* Pinterest (Using a text fallback or alternative icon, as Lucide doesn't have Pinterest) */}
                  {announcement.showPinterest && announcement.pinterestUrl && (
                    <a href={announcement.pinterestUrl} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:opacity-80 transition-opacity flex items-center justify-center font-serif font-bold text-[14px]">
                      P
                    </a>
                  )}

                  {/* TikTok (Using Tv icon as alternative) */}
                  {announcement.showTiktok && announcement.tiktokUrl && (
                    <a href={announcement.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:opacity-80 transition-opacity">
                      <Tv size={16} strokeWidth={1.5} />
                    </a>
                  )}

                  {/* YouTube */}
                  {announcement.showYoutube && announcement.youtubeUrl && (
                    <a href={announcement.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
                      <Youtube size={16} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
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
              src="/images/guls-logo.png"
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
              const isActive = isLinkActive(link.href);

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
                  <>
                    {/* Backdrop to close on click outside */}
                    <div 
                      className="fixed inset-0 z-40 bg-black/20" 
                      onClick={() => setIsSearchOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-80 md:w-96 bg-[#183629] border border-[#C9A66B]/40 rounded-md shadow-2xl p-3 z-50"
                    >
                      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsSearchOpen(false);
                          }}
                          placeholder="Search fragrances, leather, essentials..."
                          className="w-full text-xs bg-[#0f241b] px-3.5 py-2.5 rounded-sm text-brand-white placeholder-brand-beige/50 outline-none border border-[#C9A66B]/20 focus:border-[#C9A66B] font-sans"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-[#C9A66B] text-[#183629] text-[12px] uppercase tracking-wider font-bold rounded-sm hover:bg-[#d8b57a] transition-colors shrink-0 cursor-pointer font-sans shadow-sm"
                        >
                          Search
                        </button>
                      </form>
                    </motion.div>
                  </>
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
                    placeholder="Search for fragrances, leather, essentials..."
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
                    const isActive = isLinkActive(link.href);

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

// File ke aakhir mein paste karein
export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-[91px] w-full bg-[#183629]" />}>
      <NavbarInner />
    </Suspense>
  );
}