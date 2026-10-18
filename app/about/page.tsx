import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OurMission from '@/components/home/OurMission';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import OurProcess from '@/components/home/OurProcess';
import AboutUs from '@/components/home/AboutUs';
import Hero from '@/components/home/Hero';

export const metadata = {
  title: 'About Us | Gul\'s Collection',
  description: 'Decades of scents. A signature of you. Discover the story of Gul\'s Collection.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#29251D] selection:bg-[#C9A66B]/30 selection:text-[#183629]">
      <Navbar />   
      
      {/* ─── ABOUT US WRAPPER (FORCES 100vh ONLY ON THIS PAGE) ─── */}
      <div className="[&>section]:!min-h-[calc(100dvh)] [&>section]:!h-[calc(100dvh)] [&>section]:md:!aspect-auto">
        <AboutUs />
      </div>

      {/* ─── REUSED HOMEPAGE COMPONENTS ─── */}      
      <OurMission />
      <WhyChooseUs />
      <OurProcess />
      <Footer />
    </main>
  );
}