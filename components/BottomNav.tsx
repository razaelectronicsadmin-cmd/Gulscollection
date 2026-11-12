'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Catalog', href: '/fragrance', icon: LayoutGrid },
    { name: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Account', href: '/admin', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0b0f0e]/95 backdrop-blur-lg border-t border-[#C9A66B]/20 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}?`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-[#C9A66B]" : "text-[#F5F5F0]/60 hover:text-[#F5F5F0]"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                {/* Cart Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C9A66B] text-[#183629] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium tracking-wide", isActive && "font-bold")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}