import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#2D2A32]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
