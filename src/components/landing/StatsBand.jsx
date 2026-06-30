"use client";

const STATS = [
    { value: "40,000+", label: "Study sessions logged" },
    { value: "180,000+", label: "Tasks completed" },
    { value: "9,600+", label: "Hours focused" },
    { value: "2.3×", label: "Average consistency gain" },
];

export default function StatsBand() {
    return (
        <section className="border-y border-white/5 py-16 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                {STATS.map((stat, i) => (
                    <div key={i} className="text-center md:text-left space-y-1">
                        <div className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            {stat.value}
                        </div>
                        <div className="text-xs text-neutral-500 font-light">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}