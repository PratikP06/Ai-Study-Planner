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
    Notebook
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
        { name: " AI Notes", href: "/dashboard/notes", icon: Sparkles },
    ];

    const firstLetter = name?.[0]?.toUpperCase() || "U";

    return (
        <aside
            className={`hidden md:flex fixed top-0 left-0 h-screen flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                } bg-[#0e0e0e] border-r border-white/10`}
        >
            {/* ── Brand + Toggle ── */}
            <div className="flex items-center justify-between px-5 py-6">
                {!collapsed && (
                    <h2 className="text-2xl font-bold text-white tracking-tighter font-[family-name:var(--font-space-grotesk)]">
                        <Link href="/">StudyPlanner</Link>
                    </h2>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                    {collapsed ? (
                        <ChevronRight size={18} className="text-neutral-400" />
                    ) : (
                        <ChevronLeft size={18} className="text-neutral-400" />
                    )}
                </button>
            </div>

            {/* ── Nav Items ── */}
            <nav className="flex flex-col gap-2 px-3 mt-6">
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
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.04)]"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
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

            {/* ── User Profile ── */}
            <div className="px-4 pb-6">
                {!collapsed ? (
                    <div
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                        {/* Avatar + info */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center font-semibold text-lg border border-white/10">
                                {name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {name || "User"}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-white/10 transition"
                            title="Logout"
                        >
                            <LogOut size={18} className="text-neutral-400" />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center font-semibold border border-white/10">
                            {name?.[0]?.toUpperCase() || "U"}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
