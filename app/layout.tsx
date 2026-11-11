import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext'; 
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Gul's Premium Fragrances | Wear Your Era",
  description: "Ultra-luxury, minimal artisanal perfumes handcrafted for distinction and lasting presence.",
  keywords: "perfume, luxury fragrance, Gul's Collection, niche perfumes, minimal luxury",
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
        <NextTopLoader
          color="#183629" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #183629,0 0 5px #183629" 
        />
        <StoreProvider>
          {/* Main content wrapper */}
          <div className="flex-grow w-full flex flex-col">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}