"use client";

import Reveal from "./Reveal";

const STEPS = [
    { time: "Morning", label: "Open the dashboard", body: "Today's plan is already there, built around what's due and what's weak." },
    { time: "Plan", label: "Confirm or adjust", body: "Move a session, swap a subject, regenerate around new exam dates." },
    { time: "Focus", label: "Start the timer", body: "One subject at a time. The session tracks itself." },
    { time: "Track", label: "Check it off", body: "Completed work disappears from today and counts toward the streak." },
    { time: "Review", label: "See the week", body: "Analytics show hours by subject, not just a vague sense of effort." },
    { time: "Improve", label: "Tomorrow adjusts", body: "Weak topics get more time automatically. The plan learns." },
];

export default function WorkflowSection() {
    return (
        <section className="py-28 sm:py-36 px-6 bg-[#0e0e0e]">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-20">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-4">
                        A day, start to finish
                    </div>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                        One continuous loop.
                    </h2>
                </div>

                <div className="relative pl-10 sm:pl-12">
                    {/* The signature thread */}
                    <div className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />

                    <div className="space-y-12 sm:space-y-16">
                        {STEPS.map((step, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="relative">
                                    <div className="absolute -left-10 sm:-left-12 top-1 w-[15px] h-[15px] rounded-full bg-[#0e0e0e] border-2 border-white/40" />
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                                            {step.time}
                                        </div>
                                        <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">
                                            {step.label}
                                        </h3>
                                        <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-md">
                                            {step.body}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}