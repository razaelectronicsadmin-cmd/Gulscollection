import Navbar from '@/components/Navbar';
import Hero from '@/components/home/Hero';
import Demographics from '@/components/home/Demographics';
// import NewLaunches from '@/components/home/NewLaunches';
import AboutUs from '@/components/home/AboutUs';
import CollectionsShowcase from '@/components/home/CollectionsShowcase';
import AllCollections from '@/components/home/AllCollections';
// import FeaturedProducts from '@/components/home/FeaturedProducts';
import OurMission from '@/components/home/OurMission';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import OurProcess from '@/components/home/OurProcess';
import Footer from '@/components/Footer';
import VideoBentoGrid from '@/components/home/VideoBentoGrid';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-brand-white text-brand-black">
      <Navbar />
      <Hero />
      <VideoBentoGrid />
      <AboutUs />
      <CollectionsShowcase />
      <OurMission />
      <WhyChooseUs />
      <OurProcess />
      <Footer />
      {/* <Demographics />
      <NewLaunches />
      <AllCollections />
      <FeaturedProducts />
       */}
    </main>
  );
}
