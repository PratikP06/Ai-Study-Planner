"use client";

const PROBLEMS = [
    {
        title: "Deadlines slip through",
        body: "An exam date lives in a syllabus PDF. An assignment lives in your inbox. By the time they collide, it's too late to plan around them.",
    },
    {
        title: "Notes end up everywhere",
        body: "Half in a notebook, half in a notes app, half remembered from class. Nothing connects to what you're actually studying for.",
    },
    {
        title: "Days have no shape",
        body: "Without a plan, studying becomes whatever feels urgent at 11pm — not what would have helped most.",
    },
    {
        title: "Focus breaks easily",
        body: "One tab open for 'just a second' turns into forty minutes. There's no boundary marking when work starts and stops.",
    },
];

export default function ProblemSection() {
    return (
        <section className="py-28 sm:py-36 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-2xl mb-16 sm:mb-20">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-4">
                        The problem
                    </div>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                        Studying isn't hard because the material is hard.
                        <br />
                        <span className="text-neutral-500">It's hard because nothing is organized.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
                    {PROBLEMS.map((p, i) => (
                        <div key={i} className="bg-[#131313] p-8 sm:p-10 space-y-3">
                            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">
                                {p.title}
                            </h3>
                            <p className="text-neutral-500 text-sm leading-relaxed font-light">{p.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}