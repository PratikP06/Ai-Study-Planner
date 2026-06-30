"use client";

const BENEFITS = [
    { title: "Less stress before exams", body: "When the plan already accounts for the exam date, there's no last-minute scramble to figure out what's left." },
    { title: "Fewer things to remember", body: "Deadlines, topics, and notes live in one place, so your head doesn't have to hold all of it." },
    { title: "Consistency that sticks", body: "A visible streak and a daily plan make showing up the default, not a decision you make every morning." },
    { title: "Work that ends on time", body: "A bounded focus session means studying has a clear stop, not just a clear start." },
];

export default function BenefitsSection() {
    return (
        <section id="benefits" className="py-28 sm:py-36 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-2xl mb-16 sm:mb-20">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-4">
                        What changes
                    </div>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                        Not more features.
                        <br />
                        <span className="text-neutral-500">Less to think about.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
                    {BENEFITS.map((b, i) => (
                        <div key={i} className="space-y-3 border-t border-white/10 pt-6">
                            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">
                                {b.title}
                            </h3>
                            <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-sm">
                                {b.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}