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
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md
      bg-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10
      shadow-[0_0_20px_rgba(255,255,255,0.03)] z-50 md:hidden"
    >
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs transition-all duration-200 ${
                isActive ? "text-white" : "text-neutral-500"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition ${
                  isActive ? "bg-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)]" : ""
                }`}
              >
                <Icon size={20} />
              </div>

              <span className="mt-1 text-[11px]">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
