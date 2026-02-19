import Navbar from "@/components/navbar";
export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F0EEEA]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
