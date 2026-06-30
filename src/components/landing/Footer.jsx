"use client";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Help center", href: "#" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">
              Flow State
            </div>
            <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-[200px]">
              A quiet workspace for planning, focus, and notes.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="space-y-3">
              <div className="text-xs uppercase tracking-[0.15em] text-neutral-600">
                {heading}
              </div>
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-300 w-fit"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Flow State.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 hover:text-white transition-colors duration-300"
              aria-label="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.12.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.75-4.04-1.66-4.04-1.66-.55-1.43-1.34-1.82-1.34-1.82-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.81 1.33 3.5 1.01.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.38-5.47-6.15 0-1.36.46-2.46 1.22-3.33-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.27a11 11 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.7.24 2.96.12 3.27.76.87 1.22 1.97 1.22 3.33 0 4.78-2.81 5.83-5.49 6.14.43.38.81 1.13.81 2.29 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.34 24 17.74 24 12.3 24 5.5 18.63 0 12 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}