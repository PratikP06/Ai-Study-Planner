import Navbar from "@/components/navbar";
export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
