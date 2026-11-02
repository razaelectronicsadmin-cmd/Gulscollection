import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#183629] py-8 px-6 md:px-12 border-t border-[#C9A66B]/20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
        
        {/* Left: Brand Logo */}
        <div className="flex shrink-0">
          <Link href="/">
            <Image 
              src="/images/brand-logo-gold.png" 
              alt="Gul's Collection" 
              width={140} 
              height={70} 
              className="object-contain"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] md:text-[12px] tracking-[0.2em] text-[#C9A66B] uppercase font-medium">
          <Link href="/" className="hover:text-[#F3E9D7] transition-colors duration-300">
            Home
          </Link>
          <Link href="/fragrance?department=Fragrance" className="hover:text-[#F3E9D7] transition-colors duration-300">
            Fragrance
          </Link>  
          <Link href="/fragrance?department=Leather" className="hover:text-[#F3E9D7] transition-colors duration-300">
            Leather
          </Link>          
          <Link href="/fragrance?department=Essentials" className="hover:text-[#F3E9D7] transition-colors duration-300">
            Essentials
          </Link>
          <Link href="/about" className="hover:text-[#F3E9D7] transition-colors duration-300">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-[#F3E9D7] transition-colors duration-300">
            Contact
          </Link>
        </nav>

        {/* Right: Social Icons & Tagline */}
        <div className="flex items-center gap-5 text-[#C9A66B]">
          {/* Social Icons (Custom SVGs to avoid dependencies) */}
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Instagram" className="hover:text-[#F3E9D7] transition-colors duration-300">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="Facebook" className="hover:text-[#F3E9D7] transition-colors duration-300">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="Pinterest" className="hover:text-[#F3E9D7] transition-colors duration-300">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.279 1.14c-.038.154-.127.189-.286.115-1.068-.498-1.736-2.056-1.736-3.311 0-2.692 1.956-5.166 5.642-5.166 2.962 0 5.266 2.112 5.266 4.938 0 2.943-1.854 5.311-4.428 5.311-1.066 0-2.073-.554-2.417-1.211l-.661 2.518c-.238.917-.881 2.061-1.314 2.76 1.02.31 2.096.477 3.209.477 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </Link>
          </div>

          {/* Divider */}
          <span className="w-[1px] h-6 bg-[#C9A66B]/50 mx-2 hidden sm:block"></span>

          {/* Tagline */}
          <p className="font-serif italic text-[15px] md:text-[17px] text-[#C9A66B] mt-2 sm:mt-0">
            Luxury in Every Detail
          </p>
        </div>

      </div>
    </footer>
  );
}