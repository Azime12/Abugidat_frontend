"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CheckCircle2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tutorService } from "@/services/api/tutors";
import { RequestForm } from "@/components/tutors/RequestForm";
import { RequestSummary } from "@/components/tutors/RequestSummary";
import type { ParentRequest } from "@/types/request";

export default function RequestPage() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as string) || "en";

  const [submittedRequest, setSubmittedRequest] = useState<ParentRequest | null>(null);

  const { data: tutor, isLoading } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => tutorService.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-5xl">😕</div>
          <h1 className="mt-4 text-2xl font-bold">Tutor not found</h1>
          <Link
            href="/tutors"
            className="mt-6 inline-block rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white"
          >
            ← Back to tutors
          </Link>
        </div>
      </div>
    );
  }

  // â”€â”€â”€ SUCCESS STATE â”€â”€â”€
  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] px-6 py-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mt-6 text-2xl font-black text-[#2D2A32]">
              Request sent!
            </h1>
            <p className="mt-1 text-sm font-bold text-gray-500">
              áŒ¥á‹«á‰„á‹Ž á‰°áˆáŠ³áˆ!
            </p>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              We&apos;ve sent your request to{" "}
              <strong>{submittedRequest.tutorName}</strong>.
              <br />
              You&apos;ll get a message when they reply — usually within 24 hours.
            </p>

            {/* Request ID badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-mono font-bold text-gray-700">
                {submittedRequest.id}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link
                href="/dashboard"
                className="block w-full rounded-lg bg-[#0096D6] py-3 text-center text-sm font-bold text-white transition hover:bg-[#007FB8]"
              >
                View my requests
              </Link>
              <Link
                href="/tutors"
                className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Find another tutor
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€â”€ FORM STATE â”€â”€â”€
  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-16">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href={`/tutors/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096D6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
              <h1 className="text-2xl font-black text-[#2D2A32]">
                Send request to {tutor.fullName.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Matching is free. {tutor.fullName.split(" ")[0]} will be
                notified immediately.
              </p>

              <div className="mt-8">
                <RequestForm
                  tutorId={tutor.id}
                  tutorName={tutor.fullName}
                  defaultGrade={tutor.gradeLevels[0]}
                  onSuccess={setSubmittedRequest}
                />
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="lg:col-span-1">
            <RequestSummary
              tutor={tutor}
              gradeLevel={tutor.gradeLevels[0]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}