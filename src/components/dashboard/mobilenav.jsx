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
      backdrop-blur-xl rounded-3xl border z-50 md:hidden"
      style={{
        backgroundColor: "rgba(246,243,237,0.9)",
        borderColor: "#D6CBBF",
      }}
    >
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center text-xs transition-all duration-200"
              style={{
                color: isActive ? "#97B3AE" : "#6B7C78",
              }}
            >
              <div
                className={`p-2 rounded-xl transition ${
                  isActive ? "bg-[#97B3AE]/15" : ""
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
