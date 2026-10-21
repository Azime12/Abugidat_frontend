import { Link } from "@/i18n/routing";
import { Search, Shield, MapPin, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#FFF8F0]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side */}
          <div>
            <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold shadow-sm">
              ✨ Matching is free for parents
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#2D2A32] md:text-6xl">
              Find a <span className="text-[#0096D6]">verified Abugida Tutor</span>
              <br />
              near you in
              <br />
              <span className="underline decoration-[#F59E0B] decoration-8 underline-offset-4">
                under a minute
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Say goodbye to paper cards and phone chains. Choose your child's grade, share your area, and see verified tutors nearby.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex max-w-2xl flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
                <span>🎓</span>
                <select className="w-full bg-transparent text-sm font-semibold outline-none">
                  <option>Grade 5-8</option>
                  <option>Grade 9-10</option>
                  <option>Grade 11-12</option>
                  <option>KG</option>
                  <option>Grade 1-4</option>
                  <option>University</option>
                </select>
              </div>
              <div className="hidden w-px bg-gray-200 sm:block" />
              <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
                <span>📍</span>
                <select className="w-full bg-transparent text-sm font-semibold outline-none">
                  <option>Bole</option>
                  <option>Kirkos</option>
                  <option>Yeka</option>
                  <option>Arada</option>
                </select>
              </div>
              <Link
                href="/tutors"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8]"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>

            {/* Trust chips */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Verified tutors only
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Location stays private
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Reply in 24 hours
              </div>
            </div>
          </div>

          {/* Right side illustration */}
          <div className="relative">
            <div
              className="aspect-[4/5] rounded-3xl bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1544717305-2782549b5136?w=800')",
              }}
            />

            {/* Floating badges */}
            <div className="absolute -left-4 top-8 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold">ID Verified</p>
                  <p className="text-xs text-gray-500">+ 2 references called</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
              <div className="text-2xl text-yellow-400">⭐⭐⭐⭐⭐</div>
              <p className="mt-1 text-lg font-bold">4.9 average</p>
              <p className="text-xs text-gray-500">From 1,200+ parents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
