"use client";

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
      <TutorsPageClient />
    </>
  );
}