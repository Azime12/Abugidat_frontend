"use client";

import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tutorService } from "@/services/api/tutors";
import { TutorHeader } from "@/components/tutors/TutorHeader";
import { TutorAbout } from "@/components/tutors/TutorAbout";
import { TutorTeachingDetails } from "@/components/tutors/TutorTeachingDetails";
import { TutorVerification } from "@/components/tutors/TutorVerification";
import { TutorReviews } from "@/components/tutors/TutorReviews";
import { RateTutor } from "@/components/tutors/RateTutor";

export default function TutorProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as string) || "en";
  const qc = useQueryClient();

  const { data: tutor, isLoading, error } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => tutorService.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-5xl">😕</div>
          <h1 className="mt-4 text-2xl font-bold">Tutor not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This tutor profile may have been removed or the link is broken.
          </p>
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

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-16">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/tutors"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096D6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tutors
        </Link>

        <div className="space-y-6">
          <TutorHeader tutor={tutor} />
          <TutorAbout bio={tutor.bio} />
          <TutorTeachingDetails tutor={tutor} />
          <TutorVerification tutor={tutor} />
          <TutorReviews
            reviews={tutor.reviews ?? []}
            total={tutor.ratingCount}
          />
          <RateTutor
            tutorId={id}
            onRated={() => qc.invalidateQueries({ queryKey: ["tutor", id] })}
          />
        </div>
      </div>
    </div>
  );
}
