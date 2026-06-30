"use client";

const SOLUTIONS = [
    {
        problem: "Deadlines slip through",
        solution: "Every exam and assignment lives on one calendar, and your daily plan adjusts automatically as dates get closer.",
    },
    {
        problem: "Notes end up everywhere",
        solution: "Notes are tied to the subject and topic you're studying — searchable, structured, and never disconnected from your plan.",
    },
    {
        problem: "Days have no shape",
        solution: "Each morning, Flow State lays out exactly what to study and for how long, based on what's actually due.",
    },
    {
        problem: "Focus breaks easily",
        solution: "A dedicated focus session tracks one subject at a time, with a visible timer and nothing else competing for attention.",
    },
];

export default function SolutionSection() {
    return (
        <section className="py-28 sm:py-36 px-6 bg-[#0e0e0e]">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-2xl mb-16 sm:mb-20">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-4">
                        The approach
                    </div>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                        So we built one workspace
                        <br />
                        that answers all four.
                    </h2>
                </div>

                <div className="space-y-px bg-white/5 rounded-2xl overflow-hidden">
                    {SOLUTIONS.map((s, i) => (
                        <div
                            key={i}
                            className="bg-[#131313] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12"
                        >
                            <div className="sm:w-56 shrink-0">
                                <div className="text-sm text-neutral-600 line-through decoration-neutral-700">
                                    {s.problem}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[#e5e2e1] text-base font-light leading-relaxed">
                                    {s.solution}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}