"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BarChart2,
    Sparkles,
    Timer,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, user, name }) {
    const pathname = usePathname();

    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Focus", href: "/dashboard/focus", icon: Timer },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "AI", href: "/dashboard/ai", icon: Sparkles },
    ];

    const firstLetter = name?.[0]?.toUpperCase() || "U";

    return (
        <aside
            className={`hidden md:flex fixed top-0 left-0 h-screen flex-col transition-all duration-300 ${
                collapsed ? "w-20" : "w-64"
            } bg-gradient-to-b from-[#97B3AE] via-[#97B3AE] to-[#a6cda8]
      shadow-[4px_0_25px_rgba(0,0,0,0.06)]`}
        >
                        <div className="flex items-center justify-between px-5 py-6">
                {!collapsed && (
                    <h2 className="text-2xl font-semibold text-white tracking-wider">
                        <Link href="/">FlowState</Link>
                    </h2>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                >
                    {collapsed ? (
                        <ChevronRight size={18} className="text-white" />
                    ) : (
                        <ChevronLeft size={18} className="text-white" />
                    )}
                </button>
            </div>

                        <nav className="flex flex-col gap-3 px-3 mt-6">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? "bg-white text-[#3A4F4B] shadow-sm"
                                    : "text-white/90 hover:bg-white/20"
                            }`}
                        >
                            <Icon size={18} />
                            {!collapsed && (
                                <span className="text-sm font-medium tracking-wide">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex-grow" />

                                    <div className="px-4 pb-6">
                {!collapsed ? (
                    <div
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl
      bg-white/20 backdrop-blur-sm border border-white/30
      hover:bg-white/30 transition-all duration-300"
                    >
                                                <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-[#3A4F4B] text-white flex items-center justify-center font-semibold text-lg shadow">
                                {name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {name || "User"}
                                </p>
                                <p className="text-xs text-white/80 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                                                <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-white/30 transition"
                            title="Logout"
                        >
                            <LogOut size={18} className="text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-11 h-11 rounded-full bg-[#3A4F4B] text-white flex items-center justify-center font-semibold shadow">
                            {name?.[0]?.toUpperCase() || "U"}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
