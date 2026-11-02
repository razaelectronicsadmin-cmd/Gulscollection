"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Tag, Menu, X, Megaphone, Percent } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/categories', label: 'Categories', icon: Tag, exact: false },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, exact: false },
  { href: '/admin/promotions', label: 'Promotions & Delivery', icon: Percent, exact: false },
  { href: '/admin/announcement', label: 'Announcement Bar', icon: Megaphone, exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render the sidebar on the login page
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-inter">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-playfair font-bold text-xl tracking-wide">Gul&apos;s CMS</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href, link.exact);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  active ? 'bg-[#f4f1eb] text-black font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <span className="font-playfair font-bold text-xl tracking-wide">Gul&apos;s CMS</span>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href, link.exact);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  active ? 'bg-[#f4f1eb] text-black font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header with Hamburger */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-playfair font-bold text-lg">Gul&apos;s CMS</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })} 
            className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md"
          >
            Sign Out
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
