import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, AtSign } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#183629] py-8 px-6 md:px-12 border-t border-[#C9A66B]/20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0">
          <Link href="/">
            <Image
              src="/images/guls-logo.png"
              alt="Gul's Collection"
              width={140}
              height={70}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] md:text-[12px] tracking-[0.2em] text-[#C9A66B] uppercase font-medium">
          <Link
            href="/"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            Home
          </Link>
          <Link
            href="/fragrance?department=Fragrance"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            Fragrance
          </Link>
          <Link
            href="/fragrance?department=Leather"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            Leather
          </Link>
          <Link
            href="/fragrance?department=Essentials"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            Essentials
          </Link>
          <Link
            href="/about"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#F3E9D7] transition-colors duration-300"
          >
            Contact
          </Link>
        </nav>

        {/* Right: Social Icons & Tagline */}
        <div className="flex items-center gap-5 text-[#C9A66B]">
          {/* Social Icons (Lucide React) */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <Link
              href="https://www.instagram.com/guls_collection26/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#C9A66B] hover:text-[#F3E9D7] hover:scale-110 transition-all duration-300"
            >
              <Instagram size={20} strokeWidth={1.5} />
            </Link>

            {/* Threads (Using AtSign as alternative) */}
            <Link
              href="https://www.threads.com/@guls_collection26/media"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads"
              className="text-[#C9A66B] hover:text-[#F3E9D7] hover:scale-110 transition-all duration-300"
            >
              <AtSign size={20} strokeWidth={1.5} />
            </Link>

            {/* Facebook */}
            <Link
              href="https://www.facebook.com/profile.php?id=61595715104800"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-[#C9A66B] hover:text-[#F3E9D7] hover:scale-110 transition-all duration-300"
            >
              <Facebook size={20} strokeWidth={1.5} />
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
