"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ArrowLeft, History } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { RegisterProgress } from "@/components/tutors/RegisterProgress";
import { RegisterStep1 } from "@/components/tutors/RegisterStep1";
import { RegisterStep2 } from "@/components/tutors/RegisterStep2";
import { RegisterSuccess } from "@/components/tutors/RegisterSuccess";
import { tutorRegisterService } from "@/services/api/tutorRegister";
import { configService } from "@/services/api/config";
import { PHASE_1_KEYS, PHASE_2_KEYS } from "@/lib/registrationFlow";
import type {
  TutorRegisterBasicInfo,
  TutorRegisterTeachingDetails,
} from "@/types/tutor";
import toast from "react-hot-toast";
import { useTelegramBotUrl } from "@/hooks/useTelegramBotUrl";

type Phase = "step1" | "step2" | "submitting" | "success";

// P5-6 — client-side draft so a tutor can leave and finish later.
const DRAFT_KEY = "abugida_tutor_registration_draft_v1";

interface DraftShape {
  basic: TutorRegisterBasicInfo;
  teaching: TutorRegisterTeachingDetails;
}

function loadDraft(): DraftShape | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftShape;
    if (parsed?.basic && parsed?.teaching) return parsed;
    return null;
  } catch {
    return null;
  }
}

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
  const [resumeAvailable, setResumeAvailable] = useState(false);

  useEffect(() => {
    configService.getPublicConfig().then((cfg) => {
      if (cfg?.default_travel_km) {
        setTeaching((prev) => ({ ...prev, travelKm: cfg.default_travel_km! }));
      }
    }).catch(() => {});
  }, []);

  // P5-6 — offer to resume a draft (and, when authenticated, backend progress).
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setResumeAvailable(true);
    }
    // Best-effort backend progress (works in the mini app where the tutor is
    // already authenticated via Telegram initData).
    tutorRegisterService.getProgress().then((progress) => {
      if (progress && !progress.completed_at && progress.data) {
        setResumeAvailable(true);
      }
    }).catch(() => {});
  }, []);

  const persistDraft = (nextBasic: TutorRegisterBasicInfo, nextTeaching: TutorRegisterTeachingDetails) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ basic: nextBasic, teaching: nextTeaching }));
    } catch {}
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setResumeAvailable(false);
  };

  const applyDraft = () => {
    const draft = loadDraft();
    if (!draft) return;
    setBasic(draft.basic);
    setTeaching(draft.teaching);
    setPhase("step2");
    setResumeAvailable(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep1Next = (data: TutorRegisterBasicInfo) => {
    setBasic(data);
    persistDraft(data, teaching);
    // P5 — report progress to the shared flow (no-op when unauthenticated).
    tutorRegisterService.saveProgress({
      step_key: "grade_levels",
      data: { full_name: data.fullName, phone: data.phone, email: data.email },
    }).catch(() => {});
    setPhase("step2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Submit = async (data: TutorRegisterTeachingDetails) => {
    setTeaching(data);
    persistDraft(basic, data);
    setPhase("submitting");
    try {
      const result = await tutorRegisterService.register({ ...basic, ...data });
      setTutorId(result.id);
      clearDraft();
      tutorRegisterService.saveProgress({ completed: true }).catch(() => {});
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
      setPhase("step2");
    }
  };

  // ─── SUCCESS STATE ───
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
  // Phase labels derived from the shared flow (P5-3).
  const phaseLabels = [
    `${PHASE_1_KEYS.length} questions`,
    `${PHASE_2_KEYS.length} questions`,
  ];

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

            {/* P5-6 — resume banner */}
            {resumeAvailable && (
              <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[#0096D6]/20 bg-[#E8F4F8] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <History className="mt-0.5 h-5 w-5 shrink-0 text-[#0096D6]" />
                  <div>
                    <p className="text-sm font-bold text-[#2D2A32]">Continue where you left off</p>
                    <p className="text-xs text-gray-600">
                      We found a saved registration in progress.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyDraft}
                  className="shrink-0 rounded-lg bg-[#0096D6] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#007FB8]"
                >
                  Resume
                </button>
              </div>
            )}

            <RegisterProgress step={stepNumber} total={2} labels={phaseLabels} />

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
