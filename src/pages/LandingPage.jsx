import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetPublicStatsQuery,
  useGetPublicTutorsQuery,
  useGetPublicJobsQuery,
  useCreatePublicJobMutation,
} from "../redux/api/publicApiSlice";
import { selectUser, logout } from "../redux/slice/authSlice";
import TelegramInitDataInspector from "../components/shared/TelegramInitDataInspector";
import TelegramLoginModal from "../components/shared/TelegramLoginModal";
import BrowserJobApplyModal from "../components/shared/BrowserJobApplyModal";
import NearbyTutorsMap from "../components/shared/NearbyTutorsMap";

// Avatar colour palette — deterministic from tutor id
const AVATAR_COLORS = ["#E8703A", "#3B7DD8", "#4E9450", "#D4A017", "#8E44AD", "#E67E22", "#1B7A8C", "#C0392B"];

const POPULAR_LOCATIONS = [
  "All",
  "Bole",
  "Kazanchis",
  "CMC",
  "Sarbet",
  "Piassa",
  "Megenagna",
  "Gerji",
  "22 Mazoriya",
  "Lebu",
  "Hawassa",
  "Adama",
  "Online / Remote",
];

// Skeleton loading card
function SkeletonCard({ lines = 4 }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E8E1D3] shadow-sm animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E8E1D3]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#E8E1D3] rounded w-2/3" />
          <div className="h-2 bg-[#E8E1D3] rounded w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-2 bg-[#E8E1D3] rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  // Active portal tab: parent vs tutor
  const [activePortal, setActivePortal] = useState("parent"); // "parent" | "tutor"

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Minimized Map state (default false per user request to minimize map view)
  const [showMap, setShowMap] = useState(false);

  // Browser Auth & Application Modals
  const [showTelegramLogin, setShowTelegramLogin] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Post Job Modal State
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [postJobForm, setPostJobForm] = useState({
    parent_name: "",
    parent_phone_contact: "",
    parent_telegram_id: "",
    student_level: "Grade 11-12",
    subjects: "",
    location: "Bole, Addis Ababa",
    schedule: "3 days/week • 4:30 PM - 6:30 PM",
    hourly_salary: 300,
    gender_requirement: "Any",
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // ── Public API queries (no auth required) ─────────────────────────────
  const {
    data: tutorsData,
    isLoading: tutorsLoading,
  } = useGetPublicTutorsQuery({ limit: 20 });

  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useGetPublicJobsQuery({ limit: 20 });

  const { data: statsData } = useGetPublicStatsQuery();

  const [createPublicJob] = useCreatePublicJobMutation();

  // Resolved lists — real DB data only, no mock fallback
  const tutorsList = Array.isArray(tutorsData?.tutors) ? tutorsData.tutors : [];
  const jobsList = Array.isArray(jobsData?.jobs) ? jobsData.jobs : [];

  // Live stats (or zero while loading)
  const stats = {
    totalJobs: statsData?.stats?.totalJobs ?? 0,
    approvedJobs: statsData?.stats?.approvedJobs ?? 0,
    totalTutors: statsData?.stats?.totalTutors ?? 0,
    totalMatches: statsData?.stats?.totalMatches ?? 0,
  };

  // Normalize tutor — public API already shapes fields, this adds display helpers
  const normalizeTutor = (t) => {
    const nameParts = [t.name, t.first_name, t.last_name].filter(Boolean);
    const fullName = nameParts.length ? nameParts.join(" ") : `Tutor #${t.id}`;
    const initials = fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "TR";
    return {
      ...t,
      name: fullName,
      initials,
      location: t.location || t.city || "Addis Ababa",
      subjects: t.subjects || "Mathematics",
      subjectList: t.subjects
        ? t.subjects.split(",").map((s) => s.trim())
        : ["Mathematics"],
      rate: t.rate || 300,
      rating: t.rating || 4.8,
      reviewsCount: t.reviewsCount || 0,
      sessionsCount: t.sessionsCount || 0,
      badge: t.badge || "Verified",
      badgeType: t.badgeType || "verified",
      avatarBg: AVATAR_COLORS[(t.id || 0) % AVATAR_COLORS.length],
      bio: t.bio || "Certified educator dedicated to helping students reach their potential.",
    };
  };

  const normalizedTutors = tutorsList.map(normalizeTutor);

  // Filter computation for Tutors (includes Location + Subject + Search)
  const filteredTutors = normalizedTutors.filter((tutor) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (tutor.name && tutor.name.toLowerCase().includes(term)) ||
      (tutor.subjects && tutor.subjects.toLowerCase().includes(term)) ||
      (tutor.location && tutor.location.toLowerCase().includes(term));

    const matchesSubject =
      selectedSubject === "All" ||
      (tutor.subjects && tutor.subjects.toLowerCase().includes(selectedSubject.toLowerCase()));

    const matchesLocation =
      selectedLocation === "All" ||
      (tutor.location && tutor.location.toLowerCase().includes(selectedLocation.toLowerCase())) ||
      (selectedLocation === "Online / Remote" && tutor.teaching_mode !== "In-person");

    return matchesSearch && matchesSubject && matchesLocation;
  });

  // Filter computation for Jobs (includes Location + Subject + Level + Search)
  const filteredJobs = jobsList.filter((job) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (job.subjects && job.subjects.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term)) ||
      (job.student_level && job.student_level.toLowerCase().includes(term));

    const matchesSubject =
      selectedSubject === "All" ||
      (job.subjects && job.subjects.toLowerCase().includes(selectedSubject.toLowerCase()));

    const matchesLevel =
      selectedLevel === "All" ||
      (job.student_level && job.student_level.toLowerCase().includes(selectedLevel.toLowerCase()));

    const matchesLocation =
      selectedLocation === "All" ||
      (job.location && job.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesSubject && matchesLevel && matchesLocation;
  });

  // Handle direct browser application trigger
  const handleApplyClick = (job) => {
    setSelectedJobToApply(job);
    if (currentUser) {
      setShowApplyModal(true);
    } else {
      setShowTelegramLogin(true);
    }
  };

  const handleTelegramLoginSuccess = (user) => {
    if (selectedJobToApply) {
      setShowApplyModal(true);
    }
  };

  // Handle Parent Post Job Submit (public endpoint — no auth required)
  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    if (!postJobForm.parent_phone_contact && !postJobForm.parent_telegram_id) {
      toast.warning("Please provide at least a phone number or Telegram username.");
      return;
    }
    if (!postJobForm.subjects) {
      toast.warning("Please enter the subjects needed.");
      return;
    }

    setIsSubmittingJob(true);
    try {
      await createPublicJob(postJobForm).unwrap();
      toast.success("✅ Tutoring request submitted! Our team will review and broadcast it to verified tutors.");
      setShowPostJobModal(false);
      refetchJobs();
      setPostJobForm({
        parent_name: "",
        parent_phone_contact: "",
        parent_telegram_id: "",
        student_level: "Grade 11-12",
        subjects: "",
        location: "Bole, Addis Ababa",
        schedule: "3 days/week • 4:30 PM - 6:30 PM",
        hourly_salary: 300,
        gender_requirement: "Any",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit job request. Please try again.");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const subjectsFilterList = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Coding / IT",
    "Economics",
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#22364A] font-sans antialiased flex flex-col selection:bg-[#E9F1FC] selection:text-[#3B7DD8]">
      {/* ──────── 1. TOP NAVIGATION BAR ──────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D3] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-[#3B7DD8] text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
              <i className="ti ti-school" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-[#22364A] flex items-center gap-2">
                <span>Abugida</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FCEAE1] text-[#E8703A] border border-[#FAD3C1]">
                  Tutor Platform
                </span>
              </div>
              <p className="text-[11px] text-[#6B7684]">Ethiopia's Verified Tutor Marketplace</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FBF8F2] p-1 rounded-2xl border border-[#E8E1D3]">
            <button
              onClick={() => {
                setActivePortal("parent");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePortal === "parent"
                  ? "bg-white text-[#3B7DD8] shadow-xs"
                  : "text-[#6B7684] hover:text-[#22364A]"
              }`}
            >
              <i className="ti ti-users text-sm" />
              <span>Find Tutors</span>
            </button>

            <button
              onClick={() => {
                setActivePortal("tutor");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePortal === "tutor"
                  ? "bg-white text-[#E8703A] shadow-xs"
                  : "text-[#6B7684] hover:text-[#22364A]"
              }`}
            >
              <i className="ti ti-briefcase text-sm" />
              <span>Tutoring Jobs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E7F3E7] text-[#4E9450] text-[10px]">
                {jobsList.length} New
              </span>
            </button>

            <button
              onClick={() => navigate("/miniapp/register")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#E8703A] hover:bg-white transition-all flex items-center gap-1.5"
            >
              <i className="ti ti-user-plus text-sm" />
              <span>Become a Tutor</span>
            </button>

            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#4E9450] hover:bg-white transition-all flex items-center gap-1.5"
            >
              <i className="ti ti-plus text-sm" />
              <span>Post Request</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <TelegramInitDataInspector />

            {/* If logged in via Telegram or web */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#E9F1FC] p-1 pr-2 rounded-2xl border border-[#3B7DD8]/30">
                <div className="w-7 h-7 rounded-xl bg-[#3B7DD8] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.first_name ? currentUser.first_name[0].toUpperCase() : "T"}
                </div>
                <div className="hidden sm:block text-left mr-1">
                  <div className="text-[11px] font-extrabold text-[#22364A] leading-none">
                    {currentUser.first_name || currentUser.name || "Tutor"}
                  </div>
                  <div className="text-[9px] text-[#3B7DD8] font-bold">
                    {currentUser.telegram_id ? `@${currentUser.telegram_id}` : "Connected"}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/miniapp/dashboard")}
                  className="px-2.5 py-1 bg-[#3B7DD8] hover:bg-[#2D6BBB] text-white rounded-xl text-[11px] font-bold transition-all shadow-2xs"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    dispatch(logout());
                    toast.info("Logged out successfully");
                  }}
                  className="p-1 text-[#6B7684] hover:text-[#C0392B] rounded-lg transition-colors"
                  title="Log out"
                >
                  <i className="ti ti-logout text-sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTelegramLogin(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#E9F1FC] text-[#3B7DD8] border border-[#3B7DD8]/30 rounded-xl text-xs font-bold hover:bg-[#3B7DD8] hover:text-white transition-all shadow-2xs"
              >
                <i className="ti ti-brand-telegram text-base" />
                <span className="hidden sm:inline">Login with Telegram</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            {/* Post Job CTA */}
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-3.5 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 flex-shrink-0"
            >
              <i className="ti ti-sparkles text-sm" />
              <span className="hidden sm:inline">Request a Tutor</span>
              <span className="sm:hidden">Request</span>
            </button>

            {/* Login / Admin portal */}
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-xl text-[#22364A] hover:bg-[#FBF8F2] border border-[#E8E1D3] transition-colors flex-shrink-0"
              title="Staff & Admin Portal"
            >
              <i className="ti ti-user-shield text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* ──────── 2. HERO BANNER & PORTAL SWITCHER ──────── */}
      <section className="bg-gradient-to-b from-white to-[#FBF8F2] border-b border-[#E8E1D3] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Title & Subtitle */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9F1FC] border border-[#3B7DD8]/30 text-[#3B7DD8] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#4E9450] animate-ping" />
              <span>Telegram-First Tutor Matching & Geospatial Marketplace in Ethiopia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#22364A] tracking-tight leading-[1.15]">
              Connecting <span className="text-[#3B7DD8]">Students & Parents</span> with{" "}
              <span className="text-[#E8703A]">Nearby Verified Tutors</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B7684] leading-relaxed">
              Specialized coaching for Grade 9–12 National Exams, Mathematics, Physics, Chemistry, English, and Coding across Addis Ababa & online nationwide.
            </p>
          </div>

          {/* Role Mode Cards */}
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Student/Parent Card */}
            <div
              onClick={() => {
                setActivePortal("parent");
              }}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4 shadow-sm ${
                activePortal === "parent"
                  ? "bg-white border-[#3B7DD8] ring-4 ring-[#3B7DD8]/10 shadow-md"
                  : "bg-white/80 border-[#E8E1D3] hover:border-[#3B7DD8]/60"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#3B7DD8] text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                <i className="ti ti-backpack" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#22364A]">For Parents & Students</h3>
                  {activePortal === "parent" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E9F1FC] text-[#3B7DD8] text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7684] leading-relaxed">
                  Search nearby tutors by map location, browse verified educator profiles, and post tutoring job requests.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#3B7DD8]">
                  <span onClick={(e) => { e.stopPropagation(); navigate("/miniapp"); }}>
                    Open Map & Tutors in Mini App →
                  </span>
                </div>
              </div>
            </div>

            {/* Tutor Card */}
            <div
              onClick={() => {
                setActivePortal("tutor");
              }}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4 shadow-sm ${
                activePortal === "tutor"
                  ? "bg-white border-[#E8703A] ring-4 ring-[#E8703A]/10 shadow-md"
                  : "bg-white/80 border-[#E8E1D3] hover:border-[#E8703A]/60"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E8703A] text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                <i className="ti ti-school" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#22364A]">For Tutors & Teachers</h3>
                  {activePortal === "tutor" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FCEAE1] text-[#E8703A] text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7684] leading-relaxed">
                  Register with 5-step map onboarding, browse open student job requests, and earn referral commissions.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#E8703A]">
                  <span onClick={(e) => { e.stopPropagation(); navigate("/miniapp/register"); }}>
                    Start Tutor Registration →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
            <div className="bg-white p-4 rounded-2xl border border-[#E8E1D3] text-center shadow-2xs">
              <div className="font-extrabold text-xl sm:text-2xl text-[#3B7DD8]">{stats.totalTutors}+</div>
              <div className="text-xs text-[#6B7684] font-medium mt-0.5">Verified Tutors</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8E1D3] text-center shadow-2xs">
              <div className="font-extrabold text-xl sm:text-2xl text-[#E8703A]">{stats.totalJobs}+</div>
              <div className="text-xs text-[#6B7684] font-medium mt-0.5">Tutoring Jobs Posted</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8E1D3] text-center shadow-2xs">
              <div className="font-extrabold text-xl sm:text-2xl text-[#4E9450]">{stats.totalMatches}+</div>
              <div className="text-xs text-[#6B7684] font-medium mt-0.5">Successful Matches</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8E1D3] text-center shadow-2xs">
              <div className="font-extrabold text-xl sm:text-2xl text-[#D4A017]">100%</div>
              <div className="text-xs text-[#6B7684] font-medium mt-0.5">Verified Matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── 3. NORMAL SEARCH & FILTER SUITE (LOCATION + SUBJECT + MINIMIZED MAP) ──────── */}
      <section className="bg-white border-b border-[#E8E1D3] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Top Search Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* 1. Keyword search input */}
            <div className="relative flex-1">
              <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7684] text-base" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activePortal === "parent"
                    ? "Search tutor by name, subject, or location..."
                    : "Search jobs by subject, grade level, location..."
                }
                className="w-full pl-10 pr-8 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7684] hover:text-[#22364A]"
                >
                  <i className="ti ti-x text-xs" />
                </button>
              )}
            </div>

            {/* 2. Normal Location Selector Dropdown */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E8703A] text-sm pointer-events-none">
                <i className="ti ti-map-pin" />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-8 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-semibold appearance-none focus:outline-none focus:border-[#3B7DD8]"
              >
                <option value="All">All Locations (Ethiopia)</option>
                {POPULAR_LOCATIONS.filter((l) => l !== "All").map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
              <i className="ti ti-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7684] text-xs pointer-events-none" />
            </div>

            {/* 3. Minimized Map View Toggle Button */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs flex-shrink-0 ${
                showMap
                  ? "bg-[#3B7DD8] text-white border-[#3B7DD8]"
                  : "bg-[#FBF8F2] text-[#22364A] border-[#E8E1D3] hover:border-[#3B7DD8]"
              }`}
            >
              <i className={showMap ? "ti ti-map-off text-sm" : "ti ti-map-2 text-sm"} />
              <span>{showMap ? "Minimize Map" : "🗺️ Show Map View"}</span>
            </button>
          </div>

          {/* Quick Subject & Location Filter Chips */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-[#E8E1D3]/50">
            {/* Subject Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-[#6B7684] flex-shrink-0 mr-1">
                Subject:
              </span>
              {subjectsFilterList.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    selectedSubject === sub
                      ? "bg-[#3B7DD8] text-white border-[#3B7DD8] shadow-xs"
                      : "bg-[#FBF8F2] text-[#22364A] border-[#E8E1D3] hover:border-[#3B7DD8]"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── COLLAPSIBLE MINIMIZED MAP CONTAINER ──────── */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 overflow-hidden"
          >
            <div className="bg-white rounded-3xl border border-[#E8E1D3] shadow-lg overflow-hidden">
              <div className="p-3 bg-[#1B3A5C] text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <i className="ti ti-map-pin text-[#E8703A] text-sm" />
                  <span>Geospatial Tutor Map: Radius Search across Addis Ababa & Ethiopia</span>
                </div>
                <button
                  onClick={() => setShowMap(false)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <i className="ti ti-x text-xs" />
                  <span>Minimize Map</span>
                </button>
              </div>
              <div className="h-80 sm:h-96 w-full">
                <NearbyTutorsMap
                  tutors={filteredTutors}
                  radiusKm={15}
                  userLocationName="Addis Ababa, Ethiopia"
                  onSelectTutor={(t) => {
                    navigate("/miniapp");
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────── 4. MAIN CONTENT WORKSPACE ──────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ════════════ PORTAL A: PARENTS & STUDENTS ════════════ */}
        {activePortal === "parent" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#22364A] tracking-tight">
                  Verified Tutors Available in Ethiopia
                </h2>
                <p className="text-xs text-[#6B7684] mt-0.5">
                  Showing {filteredTutors.length} tutors ready for in-person or online sessions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="px-4 py-2 bg-[#E9F1FC] text-[#3B7DD8] hover:bg-[#3B7DD8] hover:text-white text-xs font-bold rounded-xl shadow-2xs border border-[#3B7DD8]/30 flex items-center gap-1.5 transition-all"
                >
                  <i className={showMap ? "ti ti-map-off text-sm" : "ti ti-map-2 text-sm"} />
                  <span>{showMap ? "Hide Map" : "Interactive Map View"}</span>
                </button>
                <button
                  onClick={() => setShowPostJobModal(true)}
                  className="px-4 py-2 bg-[#4E9450] hover:bg-[#3D783F] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <i className="ti ti-file-plus text-sm" />
                  <span>Post a Request</span>
                </button>
              </div>
            </div>

            {/* Tutors Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tutorsLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredTutors.length === 0 ? (
                <div className="col-span-3 text-center py-16 text-[#6B7684]">
                  <i className="ti ti-user-off text-4xl mb-3 block text-[#E8E1D3]" />
                  <p className="font-semibold text-sm">No tutors registered yet.</p>
                  <p className="text-xs mt-1">Be the first — <button className="text-[#E8703A] underline" onClick={() => navigate("/miniapp/register")}>Register as a tutor</button></p>
                </div>
              ) : filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white rounded-3xl p-6 border border-[#E8E1D3] shadow-sm hover:shadow-md hover:border-[#3B7DD8] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Avatar, Name, Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-13 h-13 rounded-2xl text-white font-extrabold text-base flex items-center justify-center shadow-xs flex-shrink-0"
                          style={{ backgroundColor: tutor.avatarBg || "#3B7DD8" }}
                        >
                          {tutor.initials || "AB"}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-[#22364A] leading-tight">
                            {tutor.name}
                          </h3>
                          <p className="text-xs text-[#6B7684] flex items-center gap-1 mt-0.5">
                            <i className="ti ti-map-pin text-xs text-[#E8703A]" />
                            <span>{tutor.location || tutor.city || "Addis Ababa"}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          tutor.badgeType === "top"
                            ? "bg-[#FCEAE1] text-[#E8703A]"
                            : "bg-[#E7F3E7] text-[#4E9450]"
                        }`}
                      >
                        {tutor.badge || "Verified"}
                      </span>
                    </div>

                    {/* Rating & Sessions taught */}
                    <div className="flex items-center justify-between text-xs py-1 px-3 bg-[#FBF8F2] rounded-xl border border-[#E8E1D3]">
                      <div className="flex items-center gap-1 text-[#E8703A] font-bold">
                        <i className="ti ti-star-filled text-xs" />
                        <span>{tutor.rating}</span>
                        <span className="text-[#6B7684] font-normal">({tutor.reviewsCount} reviews)</span>
                      </div>
                      <div className="text-[#6B7684] font-medium">
                        {tutor.sessionsCount}+ sessions taught
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-[#22364A]/90 leading-relaxed italic line-clamp-2">
                      "{tutor.bio}"
                    </p>

                    {/* Subject Badges */}
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjectList ? (
                        tutor.subjectList.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E9F1FC] text-[#3B7DD8]"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E9F1FC] text-[#3B7DD8]">
                          {tutor.subjects}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Rate & Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#E8E1D3] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6B7684] uppercase font-bold">Hourly Rate</span>
                      <div className="font-extrabold text-base text-[#3B7DD8]">
                        {tutor.rate} ETB/hr
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate("/miniapp")}
                        className="px-4 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1"
                      >
                        <i className="ti ti-calendar text-xs" />
                        <span>Book Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ PORTAL B: TUTORS & TEACHING OPPORTUNITIES ════════════ */}
        {activePortal === "tutor" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#22364A] tracking-tight">
                  Open Tutoring Job Requests from Parents
                </h2>
                <p className="text-xs text-[#6B7684] mt-0.5">
                  Browse real student requests across Addis Ababa. 1-click apply to receive parent contacts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/miniapp/register")}
                  className="px-4 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <i className="ti ti-user-plus text-sm" />
                  <span>Register as Tutor</span>
                </button>
                <button
                  onClick={() => navigate("/miniapp")}
                  className="px-4 py-2 bg-[#3B7DD8] hover:bg-[#2D6BBB] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <i className="ti ti-brand-telegram text-sm" />
                  <span>Open Tutor Bot Dashboard</span>
                </button>
              </div>
            </div>

            {/* Jobs Listing Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {jobsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)
              ) : filteredJobs.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-[#6B7684]">
                  <i className="ti ti-briefcase-off text-4xl mb-3 block text-[#E8E1D3]" />
                  <p className="font-semibold text-sm">No open job requests yet.</p>
                  <p className="text-xs mt-1">Parents can <button className="text-[#3B7DD8] underline" onClick={() => setShowPostJobModal(true)}>post a request</button> and tutors will apply.</p>
                </div>
              ) : filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 border border-[#E8E1D3] shadow-sm hover:shadow-md hover:border-[#E8703A] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Subjects & Salary */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FCEAE1] text-[#E8703A] text-[10px] font-bold">
                          {job.student_level}
                        </span>
                        <h3 className="font-extrabold text-base text-[#22364A] mt-1.5">
                          {job.subjects}
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-[#6B7684] uppercase font-bold block">Salary</span>
                        <span className="font-extrabold text-base text-[#4E9450]">
                          {job.hourly_salary} ETB/hr
                        </span>
                      </div>
                    </div>

                    {/* Meta details grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7684]">
                      <div className="flex items-center gap-1.5">
                        <i className="ti ti-map-pin text-[#E8703A]" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="ti ti-calendar-time text-[#3B7DD8]" />
                        <span className="truncate">{job.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="ti ti-user text-[#6B7684]" />
                        <span>Parent: {job.parent_name || "Verified Parent"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="ti ti-gender-intergender text-[#6B7684]" />
                        <span>Tutor Gender: {job.gender_requirement || "Any"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Apply Action */}
                  <div className="pt-3 border-t border-[#E8E1D3] flex items-center justify-between">
                    <div className="text-[11px] text-[#6B7684] flex items-center gap-1">
                      <i className="ti ti-users-group text-xs text-[#3B7DD8]" />
                      <span>{job.applications_count || 2} tutors applied</span>
                    </div>

                    <button
                      onClick={() => handleApplyClick(job)}
                      disabled={appliedJobIds.includes(job.id)}
                      className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                        appliedJobIds.includes(job.id)
                          ? "bg-[#4E9450] cursor-default"
                          : "bg-[#E8703A] hover:bg-[#D6602A]"
                      }`}
                    >
                      <i className={appliedJobIds.includes(job.id) ? "ti ti-check text-xs" : "ti ti-send text-xs"} />
                      <span>{appliedJobIds.includes(job.id) ? "Applied" : "Apply Now"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tutor Benefits & Referral Program Banner */}
            <div className="bg-gradient-to-r from-[#1B3A5C] to-[#22364A] text-white rounded-3xl p-6 sm:p-8 shadow-md grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-bold text-[#E8703A] uppercase tracking-wider">
                  Tutor Registration & Referral Program
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Join Abugida as a Verified Tutor & Earn Referral Bonuses
                </h3>
                <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                  Manage everything right in your browser or on Telegram. Set your hourly ETB rate, subjects, availability, and receive student matches instantly.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {currentUser ? (
                  <button
                    onClick={() => navigate("/miniapp/dashboard")}
                    className="px-5 py-3 bg-[#3B7DD8] hover:bg-[#2D6BBB] text-white rounded-xl text-xs font-extrabold transition-all text-center shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <i className="ti ti-layout-dashboard text-sm" />
                    <span>Open Tutor Dashboard</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowTelegramLogin(true)}
                      className="px-5 py-3 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl text-xs font-extrabold transition-all text-center shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <i className="ti ti-brand-telegram text-sm" />
                      <span>Log in with Telegram</span>
                    </button>
                    <button
                      onClick={() => navigate("/miniapp/register")}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Register as New Tutor
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ──────── 5. MODAL: REAL PARENT POST TUTORING REQUEST ──────── */}
      <AnimatePresence>
        {showPostJobModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl border border-[#E8E1D3] shadow-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="bg-[#3B7DD8] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base">Request a Tutor / Post a Job</h3>
                  <p className="text-xs text-white/80">
                    Your request will be vetted by admins and broadcasted to verified tutors.
                  </p>
                </div>
                <button
                  onClick={() => setShowPostJobModal(false)}
                  className="text-white hover:opacity-80 p-1"
                >
                  <i className="ti ti-x text-lg" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handlePostJobSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#22364A] block mb-1">
                    Student Grade / Level *
                  </label>
                  <select
                    value={postJobForm.student_level}
                    onChange={(e) => setPostJobForm({ ...postJobForm, student_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                  >
                    <option>Grade 9-10</option>
                    <option>Grade 11-12 (National Exam Prep)</option>
                    <option>Grade 1-8 (Primary / Ministry)</option>
                    <option>College / University</option>
                    <option>Adult Learning / Languages</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#22364A] block mb-1">
                    Subjects Needed *
                  </label>
                  <input
                    type="text"
                    required
                    value={postJobForm.subjects}
                    onChange={(e) => setPostJobForm({ ...postJobForm, subjects: e.target.value })}
                    placeholder="e.g. Mathematics, Physics, English Essay Writing"
                    className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#22364A] block mb-1">Location / Subcity *</label>
                    <input
                      type="text"
                      required
                      value={postJobForm.location}
                      onChange={(e) => setPostJobForm({ ...postJobForm, location: e.target.value })}
                      placeholder="e.g. Bole, Addis Ababa"
                      className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#22364A] block mb-1">Hourly Budget (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={postJobForm.hourly_salary}
                      onChange={(e) => setPostJobForm({ ...postJobForm, hourly_salary: Number(e.target.value) })}
                      placeholder="300"
                      className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#22364A] block mb-1">Preferred Schedule</label>
                  <input
                    type="text"
                    value={postJobForm.schedule}
                    onChange={(e) => setPostJobForm({ ...postJobForm, schedule: e.target.value })}
                    placeholder="e.g. 3 days/week • 4:30 PM - 6:30 PM"
                    className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#22364A] block mb-1">Parent / Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={postJobForm.parent_name}
                      onChange={(e) => setPostJobForm({ ...postJobForm, parent_name: e.target.value })}
                      placeholder="e.g. Abebech T."
                      className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#22364A] block mb-1">Phone Number (09...) *</label>
                    <input
                      type="tel"
                      required
                      value={postJobForm.parent_phone_contact}
                      onChange={(e) => setPostJobForm({ ...postJobForm, parent_phone_contact: e.target.value })}
                      placeholder="0911223344"
                      className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#22364A] block mb-1">Telegram Username (Optional)</label>
                  <input
                    type="text"
                    value={postJobForm.parent_telegram_id}
                    onChange={(e) => setPostJobForm({ ...postJobForm, parent_telegram_id: e.target.value })}
                    placeholder="@your_telegram"
                    className="w-full px-3.5 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] font-medium focus:outline-none focus:border-[#3B7DD8]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingJob}
                    className="w-full py-3 bg-[#E8703A] hover:bg-[#D6602A] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingJob ? (
                      <>
                        <i className="ti ti-loader animate-spin" />
                        <span>Submitting request...</span>
                      </>
                    ) : (
                      <>
                        <i className="ti ti-check" />
                        <span>Submit Tutoring Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── 6. FOOTER ──────── */}
      <footer className="bg-[#1B3A5C] text-white/80 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8703A] text-white flex items-center justify-center font-extrabold text-base">
                <i className="ti ti-school" />
              </div>
              <span className="font-extrabold text-white text-base">Abugida Platform</span>
            </div>
            <p className="text-white/60 leading-relaxed">
              Ethiopia's trusted tutor network. Empowering students, parents, and teachers with safe matching and verified teacher credentials.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">
              Subjects & Exam Prep
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>Grade 12 National Exam Prep</li>
              <li>Grade 9–10 Mathematics & Physics</li>
              <li>Grade 11–12 Chemistry & Biology</li>
              <li>English Writing & SAT Coaching</li>
              <li>Python & Coding for Youth</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">
              Platform & Features
            </h4>
            <ul className="space-y-2 text-white/70">
              <li className="cursor-pointer hover:text-white" onClick={() => navigate("/miniapp")}>
                Tutor Platform (Web App)
              </li>
              <li className="cursor-pointer hover:text-white" onClick={() => navigate("/miniapp/register")}>
                Tutor Registration (5-Step Map)
              </li>
              <li className="cursor-pointer hover:text-white" onClick={() => setShowPostJobModal(true)}>
                Post a Tutoring Request
              </li>
              <li className="cursor-pointer hover:text-white" onClick={() => navigate("/login")}>
                Staff & Admin Portal
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">
              Telegram Community
            </h4>
            <p className="text-white/60 mb-3 leading-relaxed">
              Join 5,000+ students, parents, and tutors on Telegram for instant job broadcasts and announcements.
            </p>
            <button
              onClick={() => navigate("/miniapp")}
              className="px-4 py-2.5 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <i className="ti ti-school text-base" />
              <span>Launch Tutor Platform</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-white/50 text-[11px] gap-2">
          <span>© {new Date().getFullYear()} Abugida Tutor Platform. All rights reserved.</span>
          <span>Bole, Addis Ababa, Ethiopia • Telebirr & CBE Birr Supported</span>
        </div>
      </footer>

      {/* ──────── 7. BROWSER TELEGRAM AUTH & APPLICATION MODALS ──────── */}
      <TelegramLoginModal
        isOpen={showTelegramLogin}
        onClose={() => setShowTelegramLogin(false)}
        onSuccess={handleTelegramLoginSuccess}
        title="Log in with Telegram"
      />

      <BrowserJobApplyModal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setSelectedJobToApply(null);
        }}
        job={selectedJobToApply}
        tutor={currentUser}
        onApplied={(jobId) => {
          setAppliedJobIds((prev) => [...prev, jobId]);
          refetchJobs();
        }}
      />
    </div>
  );
}
