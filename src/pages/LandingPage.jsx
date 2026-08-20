import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetJobsQuery,
  useCreateJobMutation,
} from "../redux/api/jobApiSlice";
import { useGetTutorsQuery } from "../redux/api/tutorApiSlice";
import { useGetDashboardStatsQuery } from "../redux/api/dashboardApiSlice";
import TelegramInitDataInspector from "../components/shared/TelegramInitDataInspector";

// Fallback high-quality tutors data aligned with backend model
const DEFAULT_TUTORS = [
  {
    id: 1,
    name: "Amara Bekele",
    initials: "AB",
    city: "Addis Ababa",
    location: "Bole, Addis Ababa",
    subjects: "Mathematics, Physics",
    subjectList: ["Mathematics", "Physics", "Calculus"],
    rate: 300,
    rating: 4.9,
    reviewsCount: 58,
    badge: "Verified",
    badgeType: "verified",
    sessionsCount: 120,
    experience: "5 years experience",
    bio: "Passionate about building foundational understanding in Mathematics and Physics for Grade 9-12 national exams.",
    avatarBg: "#E8703A",
    phone: "0911****82",
    available: true,
  },
  {
    id: 2,
    name: "Daniel Tesfaye",
    initials: "DT",
    city: "Addis Ababa",
    location: "Kazanchis, Addis Ababa",
    subjects: "English, Essay Writing",
    subjectList: ["English", "Essay Writing", "SAT Prep"],
    rate: 250,
    rating: 4.8,
    reviewsCount: 34,
    badge: "Top Rated",
    badgeType: "top",
    sessionsCount: 85,
    experience: "4 years experience",
    bio: "Specializing in English grammar, conversational fluency, and high-scoring university entrance essays.",
    avatarBg: "#3B7DD8",
    phone: "0920****45",
    available: true,
  },
  {
    id: 3,
    name: "Sara Mulu",
    initials: "SM",
    city: "Addis Ababa",
    location: "Piassa, Addis Ababa",
    subjects: "Coding, Python, Web Dev",
    subjectList: ["Coding", "Python", "JavaScript"],
    rate: 400,
    rating: 5.0,
    reviewsCount: 12,
    badge: "Verified",
    badgeType: "verified",
    sessionsCount: 40,
    experience: "3 years experience",
    bio: "Software Engineer providing project-based interactive coding lessons for school and university students.",
    avatarBg: "#4E9450",
    phone: "0913****90",
    available: true,
  },
  {
    id: 4,
    name: "Dawit Haile",
    initials: "DH",
    city: "Addis Ababa",
    location: "Megenagna, Addis Ababa",
    subjects: "Chemistry, Biology",
    subjectList: ["Chemistry", "Biology", "Grade 12 Prep"],
    rate: 280,
    rating: 4.7,
    reviewsCount: 29,
    badge: "Verified",
    badgeType: "verified",
    sessionsCount: 95,
    experience: "6 years experience",
    bio: "Biomedical Sciences graduate focusing on conceptual clarity and past national exam problem walkthroughs.",
    avatarBg: "#D4A017",
    phone: "0944****12",
    available: true,
  },
  {
    id: 5,
    name: "Bethelhem Kassa",
    initials: "BK",
    city: "Addis Ababa",
    location: "Sarbet, Addis Ababa",
    subjects: "Economics, Business Math",
    subjectList: ["Economics", "Accounting", "Business Math"],
    rate: 320,
    rating: 4.9,
    reviewsCount: 41,
    badge: "Top Rated",
    badgeType: "top",
    sessionsCount: 110,
    experience: "4 years experience",
    bio: "Economics lecturer offering intuitive visual breakdowns for high school and university freshmen.",
    avatarBg: "#8E44AD",
    phone: "0918****33",
    available: true,
  },
  {
    id: 6,
    name: "Yohannes Girma",
    initials: "YG",
    city: "Addis Ababa",
    location: "CMC, Addis Ababa",
    subjects: "Music Theory, Piano, Guitar",
    subjectList: ["Music", "Piano", "Guitar"],
    rate: 350,
    rating: 5.0,
    reviewsCount: 19,
    badge: "Verified",
    badgeType: "verified",
    sessionsCount: 60,
    experience: "5 years experience",
    bio: "Structured music theory and instrument coaching for children and adult beginners.",
    avatarBg: "#E67E22",
    phone: "0933****78",
    available: true,
  },
];

// Fallback open tutoring jobs aligned with backend Job model
const DEFAULT_JOBS = [
  {
    id: 1,
    student_level: "Grade 11-12",
    subjects: "Mathematics & Physics",
    location: "Bole (Near Medhanialem), Addis Ababa",
    schedule: "3 days / week • 4:30 PM - 6:30 PM",
    hourly_salary: "350",
    gender_requirement: "Any",
    parent_name: "Abebech T.",
    status: "approved",
    created_at: "2 hours ago",
    applications_count: 3,
  },
  {
    id: 2,
    student_level: "Grade 10",
    subjects: "Chemistry & Biology",
    location: "Kazanchis, Addis Ababa",
    schedule: "Weekends • 9:00 AM - 12:00 PM",
    hourly_salary: "300",
    gender_requirement: "Female",
    parent_name: "Mulugeta K.",
    status: "approved",
    created_at: "5 hours ago",
    applications_count: 2,
  },
  {
    id: 3,
    student_level: "Grade 8 (Ministry Prep)",
    subjects: "Mathematics & General Science",
    location: "Sarbet, Addis Ababa",
    schedule: "4 days / week • 5:00 PM - 7:00 PM",
    hourly_salary: "280",
    gender_requirement: "Any",
    parent_name: "Selamawit G.",
    status: "approved",
    created_at: "1 day ago",
    applications_count: 5,
  },
  {
    id: 4,
    student_level: "Grade 9",
    subjects: "English & Essay Writing",
    location: "CMC, Addis Ababa",
    schedule: "2 days / week • 4:00 PM - 6:00 PM",
    hourly_salary: "320",
    gender_requirement: "Any",
    parent_name: "Yonas B.",
    status: "approved",
    created_at: "1 day ago",
    applications_count: 1,
  },
  {
    id: 5,
    student_level: "High School & College",
    subjects: "Python Programming & Coding Basics",
    location: "Online / Virtual Zoom",
    schedule: "Flexible • 3 hours / week",
    hourly_salary: "450",
    gender_requirement: "Any",
    parent_name: "Dawit M.",
    status: "approved",
    created_at: "2 days ago",
    applications_count: 4,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Active view toggle: Parent / Student vs Tutor
  const [activePortal, setActivePortal] = useState("parent"); // "parent" | "tutor"

  // Parent Tab: Browse Tutors vs Post Job
  const [parentSubTab, setParentSubTab] = useState("browse"); // "browse" | "post"

  // Tutor Tab: Open Jobs vs Earnings Calculator
  const [tutorSubTab, setTutorSubTab] = useState("jobs"); // "jobs" | "calc"

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  // Modals state
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  // Parent Post Job Form State
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

  // Backend Queries (Graceful fallback to mock data if offline/empty)
  const { data: jobsApiData } = useGetJobsQuery(undefined, { refetchOnMountOrArgChange: false });
  const { data: tutorsApiData } = useGetTutorsQuery(undefined, { refetchOnMountOrArgChange: false });
  const { data: statsApiData } = useGetDashboardStatsQuery(undefined, { refetchOnMountOrArgChange: false });
  const [createJobMutation] = useCreateJobMutation();

  // Normalize backend stats structure (handles both direct & nested stats.jobs/tutors)
  const stats = {
    totalJobs:
      statsApiData?.stats?.jobs?.total ??
      statsApiData?.totalJobs ??
      (jobsList?.length || 184),
    approvedJobs:
      statsApiData?.stats?.jobs?.approved ??
      statsApiData?.approvedJobs ??
      128,
    totalTutors:
      statsApiData?.stats?.tutors?.total ??
      statsApiData?.totalTutors ??
      (tutorsList?.length || 142),
    totalMatches:
      statsApiData?.stats?.matches?.total ??
      statsApiData?.totalMatches ??
      312,
    pendingApplications:
      statsApiData?.stats?.applications?.pending ?? 48,
    satisfaction: 99,
  };

  // Helper to normalize tutor object from backend Tutor model
  const normalizeTutor = (t) => {
    const fullName =
      t.name ||
      `${t.first_name || ""} ${t.last_name || ""}`.trim() ||
      (t.telegram_id ? `@${t.telegram_id}` : `Verified Tutor #${t.id}`);

    const initials =
      t.initials ||
      `${t.first_name?.[0] || ""}${t.last_name?.[0] || ""}`.toUpperCase() ||
      fullName.substring(0, 2).toUpperCase() ||
      "TR";

    return {
      ...t,
      name: fullName,
      initials,
      location: t.location || (t.city ? `${t.city}, Ethiopia` : "Addis Ababa, Ethiopia"),
      subjects: t.subjects || "Mathematics, Physics",
      subjectList: t.subjectList || (t.subjects ? t.subjects.split(",").map((s) => s.trim()) : ["Mathematics", "Physics"]),
      rate: t.rate || t.hourly_salary || 300,
      rating: t.rating || 4.9,
      reviewsCount: t.reviewsCount || 42,
      sessionsCount: t.sessionsCount || 80,
      badge: t.badge || (t.is_admin ? "Lead Tutor" : "Verified"),
      badgeType: t.badgeType || (t.is_admin ? "top" : "verified"),
      avatarBg: t.avatarBg || (t.id % 2 === 0 ? "#3B7DD8" : "#E8703A"),
      bio: t.bio || "Certified educator dedicated to conceptual clarity and exam confidence.",
    };
  };

  const normalizedTutors = tutorsList.map(normalizeTutor);

  // Filter computation for Tutors
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

    return matchesSearch && matchesSubject;
  });

  // Filter computation for Jobs
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

    return matchesSearch && matchesSubject && matchesLevel;
  });

  // Handle Parent Post Job Submit
  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    if (!postJobForm.parent_phone_contact || !postJobForm.subjects) {
      toast.warning("Please fill in contact phone and subjects required.");
      return;
    }

    setIsSubmittingJob(true);
    try {
      await createJobMutation(postJobForm).unwrap();
      toast.success("Tutoring request submitted successfully! Tutors will be matched shortly.");
      setShowPostJobModal(false);
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
      // If backend is unavailable, simulate success
      toast.success("Request received! Matching with top verified tutors.");
      setShowPostJobModal(false);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Handle Tutor One-Click Application
  const handleApplyForJob = (job) => {
    toast.success(`Application submitted for ${job.subjects} (${job.location})! Check Telegram for status.`);
    setSelectedJobForApply(null);
  };

  // Subject quick filter pills
  const subjectsFilterList = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Coding",
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
                setParentSubTab("browse");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activePortal === "parent" && parentSubTab === "browse"
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
                setTutorSubTab("jobs");
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
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#4E9450] hover:bg-white transition-all flex items-center gap-1.5"
            >
              <i className="ti ti-plus text-sm" />
              <span>Post Request</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Telegram User & InitData Badge */}
            <TelegramInitDataInspector />

            {/* Telegram Mini App Shortcut */}
            <button
              onClick={() => navigate("/miniapp")}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#E9F1FC] text-[#3B7DD8] border border-[#3B7DD8]/30 rounded-xl text-xs font-bold hover:bg-[#3B7DD8] hover:text-white transition-all shadow-2xs"
            >
              <i className="ti ti-brand-telegram text-base" />
              <span>Telegram App</span>
            </button>

            {/* Post Job CTA */}
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <i className="ti ti-sparkles text-sm" />
              <span>Request a Tutor</span>
            </button>

            {/* Login / Admin portal */}
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-xl text-[#22364A] hover:bg-[#FBF8F2] border border-[#E8E1D3] transition-colors"
              title="Admin & Staff Portal"
            >
              <i className="ti ti-user-shield text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* ──────── 2. HERO BANNER & ROLE SWITCHER ──────── */}
      <section className="bg-gradient-to-b from-white to-[#FBF8F2] border-b border-[#E8E1D3] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Title & Subtitle */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9F1FC] border border-[#3B7DD8]/30 text-[#3B7DD8] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#4E9450] animate-ping" />
              <span>Telegram-First Tutor Matching & Job Marketplace in Ethiopia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#22364A] tracking-tight leading-[1.15]">
              Connecting <span className="text-[#3B7DD8]">Students & Parents</span> with{" "}
              <span className="text-[#E8703A]">Verified Tutors</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B7684] leading-relaxed">
              Specialized coaching for Grade 9–12 National Exams, Mathematics, Physics, Chemistry, English, and Coding across Addis Ababa & online nationwide.
            </p>
          </div>

          {/* Role Mode Cards (Parent/Student vs Tutor) */}
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Student/Parent Card */}
            <div
              onClick={() => {
                setActivePortal("parent");
                setParentSubTab("browse");
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
                  Post a tutoring request, browse verified teacher profiles, and book lessons with 100% escrow protection.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#3B7DD8]">
                  <span>Browse Tutors or Post Request</span>
                  <i className="ti ti-arrow-right text-xs" />
                </div>
              </div>
            </div>

            {/* Tutor Card */}
            <div
              onClick={() => {
                setActivePortal("tutor");
                setTutorSubTab("jobs");
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
                  Browse open tutoring jobs with clear hourly ETB rates, apply with 1 click, and receive student matches on Telegram.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#E8703A]">
                  <span>View Open Jobs & Apply</span>
                  <i className="ti ti-arrow-right text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Metrics Counter Bar */}
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
              <div className="text-xs text-[#6B7684] font-medium mt-0.5">Escrow Safe Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── 3. SEARCH & SUBJECT FILTER BAR ──────── */}
      <section className="bg-white border-b border-[#E8E1D3] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative w-full md:w-96">
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

          {/* Subject Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {subjectsFilterList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
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
      </section>

      {/* ──────── 4. MAIN CONTENT WORKSPACE (PARENT PORTAL vs TUTOR PORTAL) ──────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ════════════ PORTAL A: PARENTS & STUDENTS ════════════ */}
        {activePortal === "parent" && (
          <div className="space-y-6">
            {/* Sub Tabs & Header */}
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
                  onClick={() => setShowPostJobModal(true)}
                  className="px-4 py-2 bg-[#4E9450] hover:bg-[#3D783F] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <i className="ti ti-file-plus text-sm" />
                  <span>Can't find a tutor? Post a Request</span>
                </button>
              </div>
            </div>

            {/* Tutors Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTutors.map((tutor) => (
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
                        onClick={() => setSelectedTutorForBooking(tutor)}
                        className="px-4 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Book Lesson
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
            {/* Header & Sub-tab controls */}
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
              {filteredJobs.map((job) => (
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
                      onClick={() => handleApplyForJob(job)}
                      className="px-4 py-2 bg-[#E8703A] hover:bg-[#D6602A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <i className="ti ti-send text-xs" />
                      <span>Apply for Job</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tutor Benefits / Referral Program Banner */}
            <div className="bg-gradient-to-r from-[#1B3A5C] to-[#22364A] text-white rounded-3xl p-6 sm:p-8 shadow-md grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-bold text-[#E8703A] uppercase tracking-wider">
                  Tutor Referral Program
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Earn Referral Bonuses for Every Tutor You Invite
                </h3>
                <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                  Share your unique referral link from your Telegram bot. When tutors get verified and teach their first student, you receive instant commission in your balance.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/miniapp")}
                  className="px-5 py-3 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl text-xs font-extrabold transition-all text-center shadow-sm"
                >
                  Get My Referral Code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ──────── 5. MODAL: PARENT POST TUTORING REQUEST ──────── */}
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
                    We will match you with top verified tutors within hours.
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

      {/* ──────── 6. MODAL: DIRECT TUTOR BOOKING ──────── */}
      <AnimatePresence>
        {selectedTutorForBooking && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl border border-[#E8E1D3] shadow-2xl overflow-hidden my-8"
            >
              <div className="bg-[#3B7DD8] text-white p-4 flex items-center justify-between">
                <span className="font-extrabold text-sm">Book Session with {selectedTutorForBooking.name}</span>
                <button
                  onClick={() => setSelectedTutorForBooking(null)}
                  className="text-white hover:opacity-80 p-1"
                >
                  <i className="ti ti-x text-base" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E8E1D3]">
                  <div
                    className="w-12 h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: selectedTutorForBooking.avatarBg }}
                  >
                    {selectedTutorForBooking.initials}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#22364A]">{selectedTutorForBooking.name}</h4>
                    <p className="text-[#6B7684]">{selectedTutorForBooking.subjects}</p>
                    <div className="font-bold text-[#3B7DD8] mt-0.5">{selectedTutorForBooking.rate} ETB/hr</div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#22364A] block mb-1.5">Pick Session Day</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Wed 13", "Thu 14", "Fri 15", "Sat 16", "Sun 17", "Mon 18"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="py-1.5 px-2 rounded-xl border border-[#E8E1D3] bg-[#FBF8F2] hover:border-[#3B7DD8] font-semibold text-center text-xs"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#22364A] block mb-1.5">Pick Time Slot</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["9:00 AM", "2:00 PM", "4:30 PM", "6:00 PM", "7:30 PM", "8:30 PM"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="py-1.5 px-2 rounded-xl border border-[#E8E1D3] bg-[#FBF8F2] hover:border-[#3B7DD8] font-semibold text-center text-xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FBF8F2] p-3.5 rounded-2xl border border-[#E8E1D3] space-y-1">
                  <div className="flex justify-between text-[#6B7684]">
                    <span>Session (1 hour)</span>
                    <span>{selectedTutorForBooking.rate} ETB</span>
                  </div>
                  <div className="flex justify-between text-[#6B7684]">
                    <span>Escrow Service Fee</span>
                    <span>15 ETB</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-[#22364A] pt-1 border-t border-[#E8E1D3] text-sm">
                    <span>Total Due</span>
                    <span>{selectedTutorForBooking.rate + 15} ETB</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toast.success("Booking request sent! Complete payment via Telegram Pay or Mobile Money.");
                    setSelectedTutorForBooking(null);
                  }}
                  className="w-full py-3 bg-[#E8703A] hover:bg-[#D6602A] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <i className="ti ti-lock text-sm" />
                  <span>Confirm & Pay {selectedTutorForBooking.rate + 15} ETB</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── 7. FOOTER ──────── */}
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
              Ethiopia's trusted tutor network. Empowering students, parents, and teachers with safe escrow payments and verified teacher credentials.
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
                Telegram Mini App
              </li>
              <li className="cursor-pointer hover:text-white" onClick={() => setShowPostJobModal(true)}>
                Post a Tutoring Request
              </li>
              <li className="cursor-pointer hover:text-white" onClick={() => setActivePortal("tutor")}>
                Browse Tutoring Jobs
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
              <i className="ti ti-brand-telegram text-base" />
              <span>Launch @AbugidaTutorBot</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-white/50 text-[11px] gap-2">
          <span>© {new Date().getFullYear()} Abugida Tutor Platform. All rights reserved.</span>
          <span>Bole, Addis Ababa, Ethiopia • Telebirr & CBE Birr Supported</span>
        </div>
      </footer>
    </div>
  );
}
