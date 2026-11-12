import type { Metadata, Viewport } from 'next'; // Viewport import mein add karein
import './globals.css';
import { StoreProvider } from '@/context/StoreContext'; 
import NextTopLoader from 'nextjs-toploader';
import WhatsAppWidget from '@/components/ui/WhatsAppWidget';
import BottomNav from '@/components/BottomNav';
import PwaBanner from '@/components/PwaBanner';

export const metadata: Metadata = {
  title: "Gul's Collection | Premium Fragrances",
  description: "Discover the art of perfumery with Gul's Collection.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gul's",
  },
};

// PWA ke mobile status bar color ke liye yeh add karein
export const viewport: Viewport = {
  themeColor: "#183629",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Background and text colors are now perfectly handled by globals.css */}
      <body className="flex flex-col min-h-screen w-full relative antialiased">
        <PwaBanner />
        <NextTopLoader
          color="#C9A66B" // Loader color ko maine gold kar diya hai taake dark green bg par nazar aaye (optional)
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #C9A66B,0 0 5px #C9A66B" 
        />
        <StoreProvider>
          {/* Main content wrapper */}
          <div className="flex-grow w-full flex flex-col">
            {children}
            <BottomNav />
            <div className="h-16 md:hidden w-full"></div>
            <WhatsAppWidget />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}