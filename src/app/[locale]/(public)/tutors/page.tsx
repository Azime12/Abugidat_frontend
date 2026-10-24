"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { TutorsPageClient } from "@/components/tutors/TutorsPageClient";

export default function TutorsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <>
      <Breadcrumb
        locale={locale}
        crumbs={[{ label: "Find Tutors" }]}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FFF8F0] py-16 text-center text-sm font-semibold text-gray-500">
            Loading tutors...
          </div>
        }
      >
        <TutorsPageClient />
      </Suspense>
    </>
  );
}