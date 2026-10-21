"use client";

import { Link } from "@/i18n/routing";
import { Clock, CheckCircle2, FileCheck } from "lucide-react";

export function RegisterSuccess({ tutorId }: { tutorId: string }) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-[#2D2A32]">
            Profile submitted!
          </h1>
          <p className="mt-1 text-sm font-bold text-gray-500">
            መገለጫዎ ገብቷል!
          </p>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Thanks for applying to become an Abugida Tutor. Our team will
            review your details and get back to you within 1-2 business days.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-xs">
            <FileCheck className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-mono font-bold text-gray-700">{tutorId}</span>
          </div>

          <div className="mt-8 rounded-xl bg-[#E8F4F8] p-5 text-left">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#0096D6]" />
              <div>
                <p className="text-sm font-bold text-[#2D2A32]">What's next?</p>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                  <li>1. We verify your ID and qualifications</li>
                  <li>2. We call your 2 references</li>
                  <li>3. Short interview (5-10 minutes)</li>
                  <li>4. Approval — you'll get 10 free Kulf 🔑</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/dashboard"
              className="block w-full rounded-lg bg-[#0096D6] py-3 text-center text-sm font-bold text-white transition hover:bg-[#007FB8]"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}