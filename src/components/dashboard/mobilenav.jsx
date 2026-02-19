"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, Sparkles, Timer } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Focus",
      href: "/dashboard/focus",
      icon: Timer,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
    },
    {
      name: "AI",
      href: "/dashboard/ai",
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 md:hidden z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-xs transition
              ${isActive ? "text-[#97B3AE]" : "text-[#6B7C78]"}`}
          >
            <Icon size={20} />
            <span className="mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
