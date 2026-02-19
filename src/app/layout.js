import { Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

export const metadata = {
  title: "Study Planner",
  description: "Calm, intelligent study planning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} antialiased bg-[#F0EEEA]`}>
        {children}
      </body>
    </html>
  );
}
