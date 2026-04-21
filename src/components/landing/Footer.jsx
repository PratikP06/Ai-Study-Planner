"use client";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/5 py-12 flex flex-col items-center justify-center space-y-6">
      <div className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">StudyPlanner</div>
      <div className="flex items-center space-x-10">
        <a className="text-neutral-500 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-300" href="#">Privacy Policy</a>
        <a className="text-neutral-500 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-300" href="#">Terms of Service</a>
        <a className="text-neutral-500 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors duration-300" href="#">Help Center</a>
      </div>
      <div className="text-neutral-400 text-xs tracking-[0.2em] uppercase opacity-60">
        © {new Date().getFullYear()} StudyPlanner. The Ethereal Workspace.
      </div>
    </footer>
  );
}
