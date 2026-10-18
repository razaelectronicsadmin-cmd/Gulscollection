'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function AboutUs() {
  return (
    <section 
      className="relative w-full min-h-[720px] md:min-h-0 md:aspect-[1920/800] flex items-center overflow-hidden bg-[#F7F7F5]" 
      id="about"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/about-bg.png"
          alt="About Gul's Collection"
          fill
          priority
          /* Desktop par centered, mobile par visual balance ke liye soft focus */
          className="object-cover object-[25%_center] md:object-center"
          sizes="100vw"
        />
        {/* Mobile Gradient Overlay: Content ko readable banata hai baghair image ko kill kiye */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F5]/85 via-[#F7F7F5]/90 to-[#F7F7F5]/95 md:hidden z-10" />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-14 relative z-20 flex justify-center md:justify-end py-16 md:py-0">
        
        {/* Text Block Card for Mobile & Seamless for Desktop */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[550px] lg:max-w-[600px] flex flex-col items-center text-center md:items-start md:text-left backdrop-blur-[2px] md:backdrop-blur-none p-5 sm:p-8 md:p-0 rounded-sm md:rounded-none border border-[#C9A66B]/20 md:border-none bg-white/40 md:bg-transparent shadow-sm md:shadow-none"
        >
          {/* Subtitle tag */}
          <span className="font-sans text-[12px] md:text-[11px] tracking-[0.25em] text-[#8C7A5B] uppercase font-semibold mb-3">
            Our Heritage
          </span>

          {/* Heading */}
          <h2 className="font-serif text-3xl md:text-[40px] font-bold text-[#C9A66B] tracking-[0.04em] uppercase mb-5 md:mb-7 drop-shadow-sm leading-tight">
            About Us
          </h2>

          {/* First Paragraph */}
          <p className="font-sans text-[14px] md:text-[16px] lg:text-[17px] leading-[1.7] md:leading-[1.9] text-[#29251D] mb-5 md:mb-7 font-light">
            Gul&apos;s Collection is not just a fragrance house it&apos;s a time
            capsule. Born from the idea that every decade has a scent, and
            every person has an era, <strong className="font-semibold text-[#183629]">Decades by Gul&apos;s</strong> was created to let you
            <span className="italic uppercase font-semibold text-[#183629] ml-1">WEAR YOUR ERA.</span>
          </p>

          {/* Blockquote with Luxury Theme Accent */}
          <blockquote className="relative pl-4 sm:pl-5 py-1 mb-5 md:mb-7 border-l-[3px] border-[#C9A66B] font-serif italic text-[16px] sm:text-[18px] md:text-[20px] text-[#183629] text-left">
            &quot;You don&apos;t just wear a perfume. You wear a memory, a mood, a decade.&quot;
          </blockquote>

          {/* Final Paragraph */}
          <p className="font-sans text-[14px] md:text-[16px] lg:text-[17px] leading-[1.7] md:leading-[1.9] text-[#29251D] font-light">
            We craft premium, long-lasting, impression-based perfumes
            that bring luxury niche fragrances within reach. From bold
            masculine to soft feminine, from unisex modern to deep
            arabesque, our scents are designed to become your identity.
          </p>
        </motion.div>
      </div>
    </section>
  );
}