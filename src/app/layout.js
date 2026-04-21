import { Space_Grotesk, Manrope, Inter } from "next/font/google";
import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Study Planner",
  description: "Calm, intelligent study planning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${inter.variable} antialiased bg-[#131313] text-[#e5e2e1] font-[family-name:var(--font-manrope)]`}
      >
        {children}
      </body>
    </html>
  );
}
