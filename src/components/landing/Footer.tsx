import { GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src="/logo-icon.png" alt="Abugida Tutor" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-extrabold">Abugida Tutor</span>
            </div>
            <p className="text-sm text-gray-500">
              Ethiopia&apos;s trusted marketplace for verified tutors.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Parents</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/tutors" className="hover:text-[#0096D6]">Find Tutors</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#0096D6]">How It Works</Link></li>
              <li><Link href="/safety" className="hover:text-[#0096D6]">Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Tutors</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/for-tutors" className="hover:text-[#0096D6]">Become a Abugida Tutor</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0096D6]">Pricing</Link></li>
              <li><Link href="/guidelines" className="hover:text-[#0096D6]">Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-[#0096D6]">About</Link></li>
              <li><Link href="/contact" className="hover:text-[#0096D6]">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[#0096D6]">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
          © 2026 Abugida Tutor · Made in Addis Ababa, Ethiopia 🇪🇹
        </div>
      </div>
    </footer>
  );
}