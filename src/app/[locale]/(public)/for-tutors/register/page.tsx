"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { RegisterProgress } from "@/components/tutors/RegisterProgress";
import { RegisterStep1 } from "@/components/tutors/RegisterStep1";
import { RegisterStep2 } from "@/components/tutors/RegisterStep2";
import { RegisterSuccess } from "@/components/tutors/RegisterSuccess";
import { tutorRegisterService } from "@/services/api/tutorRegister";
import { configService } from "@/services/api/config";
import type {
  TutorRegisterBasicInfo,
  TutorRegisterTeachingDetails,
} from "@/types/tutor";
import toast from "react-hot-toast";
import { useTelegramBotUrl } from "@/hooks/useTelegramBotUrl";

type Phase = "step1" | "step2" | "submitting" | "success";

export default function TutorRegisterPage() {
  const params = useParams();
  const telegram = useTelegramBotUrl();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  const [phase, setPhase] = useState<Phase>("step1");
  const [basic, setBasic] = useState<TutorRegisterBasicInfo>({
    fullName: "",
    phone: "",
    email: undefined,
    gender: undefined,
    studentGenderPreference: "Both",
    education: undefined,
    photo: undefined,
  });
  const [teaching, setTeaching] = useState<TutorRegisterTeachingDetails>({
    subjects: [],
    gradeLevels: [],
    areaName: "Bole",
    latitude: undefined,
    longitude: undefined,
    travelKm: 5,
    price: 400,
    bio: "",
    teachingMode: "Both",
    onlineOk: true,
    cvFile: undefined,
    educationFile: undefined,
  });
  const [tutorId, setTutorId] = useState("");

  useEffect(() => {
    configService.getPublicConfig().then((cfg) => {
      if (cfg?.default_travel_km) {
        setTeaching((prev) => ({ ...prev, travelKm: cfg.default_travel_km! }));
      }
    }).catch(() => {});
  }, []);

  const handleStep1Next = (data: TutorRegisterBasicInfo) => {
    setBasic(data);
    setPhase("step2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Submit = async (data: TutorRegisterTeachingDetails) => {
    setTeaching(data);
    setPhase("submitting");
    try {
      const result = await tutorRegisterService.register({ ...basic, ...data });
      setTutorId(result.id);
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
      setPhase("step2");
    }
  };

  // â”€â”€â”€ SUCCESS STATE â”€â”€â”€
  if (phase === "success") {
    return (
      <>
        <Breadcrumb
          locale={locale}
          crumbs={[
            { label: "For Tutors", href: "/for-tutors" },
            { label: "Register" },
          ]}
        />
        <RegisterSuccess tutorId={tutorId} />
      </>
    );
  }

  const stepNumber = phase === "step1" ? 1 : 2;

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        locale={locale}
        crumbs={[
          { label: "For Tutors", href: "/for-tutors" },
          { label: "Register" },
        ]}
      />

      {/* Main content */}
      <div className="min-h-screen bg-[#FFF8F0]">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              if (phase === "step1") {
                router.push("/for-tutors");
              } else {
                setPhase("step1");
              }
            }}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#0096D6]"
          >
            <ArrowLeft className="h-4 w-4" />
            {phase === "step1" ? "Back to For Tutors" : "Back to Step 1"}
          </button>

          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-black text-[#2D2A32]">
                Become an Abugida Tutor
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Join Ethiopia&apos;s trusted tutoring platform
              </p>
            </div>

            <RegisterProgress step={stepNumber} total={2} />

            {phase === "step1" && (
              <RegisterStep1 initial={basic} onNext={handleStep1Next} />
            )}

            {(phase === "step2" || phase === "submitting") && (
              <RegisterStep2
                initial={teaching}
                onBack={() => setPhase("step1")}
                onSubmit={handleStep2Submit}
                submitting={phase === "submitting"}
              />
            )}
          </div>

          {/* Help footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Need help?{" "}
              <a
                href={telegram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0096D6] hover:underline"
              >
                Contact us on Telegram
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}