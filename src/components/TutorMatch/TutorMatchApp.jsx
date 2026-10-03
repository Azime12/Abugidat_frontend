import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TgBar from "./TgBar";
import WebAppHeader from "./WebAppHeader";

// Screens
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import TutorOnboardingScreen from "./screens/TutorOnboardingScreen";
import StudentBrowseScreen from "./screens/StudentBrowseScreen";
import FiltersScreen from "./screens/FiltersScreen";
import TutorProfileScreen from "./screens/TutorProfileScreen";
import BookingScreen from "./screens/BookingScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";
import ChatScreen from "./screens/ChatScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import TutorDashboardScreen from "./screens/TutorDashboardScreen";
import ScheduleSettingsScreen from "./screens/ScheduleSettingsScreen";

import { useGetTutorProfileQuery } from "../../redux/api/tutorMiniAppApiSlice";

// Detect if running inside Telegram WebApp
const INSIDE_TELEGRAM =
  typeof window !== "undefined" && Boolean(window?.Telegram?.WebApp?.initData);

// Default mock tutors used in StudentBrowseScreen before real data loads
const INITIAL_TUTORS = [
  {
    id: "t1",
    name: "Amara Bekele",
    initials: "AB",
    avatarBg: "var(--coral)",
    subjects: "Mathematics, Physics",
    subjectList: ["Mathematics", "Physics"],
    rate: 300,
    rating: 4.9,
    reviewsCount: 58,
    badgeType: "online",
    badgeText: "Online",
    sessionsCount: "120+",
    headline: "Math and physics tutor · 5 years experience",
    bio: "I love helping students build confidence in math. I focus on making concepts click through real-world examples rather than memorization.",
  },
  {
    id: "t2",
    name: "Daniel Tesfaye",
    initials: "DT",
    avatarBg: "var(--blue)",
    subjects: "English, Essay Writing",
    subjectList: ["English", "Essay Writing"],
    rate: 250,
    rating: 4.8,
    reviewsCount: 34,
    badgeType: "top",
    badgeText: "Top rated",
    sessionsCount: "85+",
    headline: "English & Literature specialist · Oxford certified",
    bio: "Passionate about empowering students in English grammar, conversational fluency, and high-scoring university entrance essays.",
  },
  {
    id: "t3",
    name: "Sara Mulu",
    initials: "SM",
    avatarBg: "var(--green)",
    subjects: "Coding / IT, Python",
    subjectList: ["Coding / IT", "Python", "Web Dev"],
    rate: 400,
    rating: 5.0,
    reviewsCount: 12,
    badgeType: "online",
    badgeText: "Online",
    sessionsCount: "40+",
    headline: "Software Engineer & Coding Mentor for youth",
    bio: "Interactive project-based coding lessons in Python, JavaScript, and algorithmic problem solving tailored for school and university students.",
  },
  {
    id: "t4",
    name: "Dawit Haile",
    initials: "DH",
    avatarBg: "var(--amber)",
    subjects: "Chemistry, Biology",
    subjectList: ["Chemistry", "Biology"],
    rate: 280,
    rating: 4.7,
    reviewsCount: 29,
    badgeType: "verified",
    badgeText: "Verified",
    sessionsCount: "95+",
    headline: "Biomedical Sciences graduate & Exam Coach",
    bio: "Specializing in Grade 11-12 national exam preparation with deep concept breakdowns, past exam walkthroughs, and mock tests.",
  },
];

export default function TutorMatchApp({
  initialRole = "student",
  initialScreen = "s-browse", // default to browse in web mode (skip role-select)
}) {
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get("role");
  const urlScreen = searchParams.get("screen");
  const isRegisterParam = searchParams.get("register") === "true";

  const resolvedInitialRole = urlRole || (isRegisterParam ? "tutor" : initialRole);
  const resolvedInitialScreen =
    urlScreen || (isRegisterParam ? "s-onb-1" : initialScreen);

  const [role, setRole] = useState(resolvedInitialRole);
  const [activeScreen, setActiveScreen] = useState(resolvedInitialScreen);
  const [history, setHistory] = useState([resolvedInitialScreen]);
  const [onboardingStep, setOnboardingStep] = useState(
    resolvedInitialScreen.startsWith("s-onb-")
      ? parseInt(resolvedInitialScreen.replace("s-onb-", ""), 10) || 1
      : 1
  );

  // RTK Query: fetch authenticated tutor profile if available
  const { data: tutorProfileData } = useGetTutorProfileQuery(undefined, {
    skip: typeof window === "undefined",
  });

  // Data state
  const [tutors] = useState(INITIAL_TUTORS);
  const [selectedTutor, setSelectedTutor] = useState(INITIAL_TUTORS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All subjects");
  const [filters, setFilters] = useState({});

  const [bookingDetails, setBookingDetails] = useState({
    day: "Wed 13",
    slot: "2:00 PM",
    tutorName: "Amara Bekele",
    rate: 300,
    serviceFee: 15,
    total: 315,
  });

  const [tutorProfile, setTutorProfile] = useState({
    name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    city: "Addis Ababa",
    gender: "",
    student_gender_preference: "Both",
    bio: "",
    subjects: [],
    grade_levels: [],
    teaching_mode: "Both",
    hourlyRate: 300,
    hourly_rate: 300,
    education: "",
    experience: "",
    availableDays: [],
    startTime: "9:00 AM",
    endTime: "6:00 PM",
    referral_code: "",
    accumulated_invites_balance: 0,
    is_registered: false,
  });

  // Sync profile from backend if available
  useEffect(() => {
    if (tutorProfileData?.tutor) {
      const serverTutor = tutorProfileData.tutor;
      setTutorProfile((prev) => ({
        ...prev,
        ...serverTutor,
        name:
          serverTutor.name ||
          [serverTutor.first_name, serverTutor.last_name].filter(Boolean).join(" ") ||
          prev.name,
        hourlyRate: serverTutor.hourly_rate || prev.hourlyRate,
        is_registered: serverTutor.is_registered,
      }));
    }
  }, [tutorProfileData]);

  // ── Navigation ─────────────────────────────────────────────
  const show = (screenId) => {
    setActiveScreen(screenId);
    setHistory((prev) => [...prev, screenId]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setActiveScreen(prevScreen);
    } else {
      setActiveScreen("s-browse");
    }
  };

  const handleContinueRole = () => {
    if (role === "student") {
      show("s-browse");
    } else {
      if (tutorProfile?.is_registered) {
        show("s-dash");
      } else {
        setOnboardingStep(1);
        show("s-onb-1");
      }
    }
  };

  const handleOnboardingNext = (nextStep) => {
    setOnboardingStep(nextStep);
    show(`s-onb-${nextStep}`);
  };

  const handleOnboardingComplete = () => {
    show("s-dash");
  };

  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    show("s-profile");
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // ── Screen title ────────────────────────────────────────────
  const getScreenTitle = () => {
    switch (activeScreen) {
      case "s-role":       return "Abugida Tutor Platform";
      case "s-onb-1":
      case "s-onb-2":
      case "s-onb-3":
      case "s-onb-4":
      case "s-onb-5":     return `Tutor Registration — Step ${onboardingStep} of 5`;
      case "s-browse":    return "Find a Tutor";
      case "s-filters":   return "Filters";
      case "s-profile":   return selectedTutor?.name || "Tutor Profile";
      case "s-booking":   return "Book a Session";
      case "s-payment":   return "Payment";
      case "s-confirm":   return "Booking Confirmed";
      case "s-chat":      return selectedTutor?.name || "Chat";
      case "s-notif":     return "Notifications";
      case "s-dash":      return "Tutor Dashboard";
      case "s-schedule":  return "My Availability";
      default:            return "Abugida Tutor Platform";
    }
  };

  // ── Render ─────────────────────────────────────────────────
  // Inside Telegram: keep the classic phone-frame experience
  if (INSIDE_TELEGRAM) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-tm-cream">
        <div className="w-full max-w-lg min-h-screen bg-tm-cream relative shadow-md flex flex-col">
          <TgBar
            title={getScreenTitle()}
            onBack={goBack}
            onShowNotif={() => show("s-notif")}
            unreadCount={1}
            canGoBack={history.length > 1}
          />
          <div className="flex-1 flex flex-col justify-between">
            {renderScreenContent()}
          </div>
        </div>
      </div>
    );
  }

  // In browser: full web app layout (no phone frame)
  return (
    <div className="min-h-screen bg-[#FBF8F2] flex flex-col">
      {/* Web header replaces the Telegram bar */}
      <WebAppHeader
        activeScreen={activeScreen}
        role={role}
        onNavigate={(screenId) => {
          if (screenId === "s-onb-1") {
            setRole("tutor");
            setOnboardingStep(1);
          } else if (screenId === "s-browse") {
            setRole("student");
          } else if (screenId === "s-dash") {
            setRole("tutor");
          }
          show(screenId);
        }}
        onBack={goBack}
        canGoBack={history.length > 1}
        title={getScreenTitle()}
        unreadCount={1}
      />

      {/* Page content — full-width, no phone frame */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {renderScreenContent()}
      </main>
    </div>
  );

  // ── Screen content switcher (shared between web & TG) ───────
  function renderScreenContent() {
    return (
      <>
        {activeScreen === "s-role" && (
          <RoleSelectionScreen
            role={role}
            onPickRole={setRole}
            onContinue={handleContinueRole}
          />
        )}

        {activeScreen.startsWith("s-onb") && (
          <TutorOnboardingScreen
            step={onboardingStep}
            onNextStep={handleOnboardingNext}
            onComplete={handleOnboardingComplete}
            tutorProfile={tutorProfile}
            setTutorProfile={setTutorProfile}
          />
        )}

        {activeScreen === "s-browse" && (
          <StudentBrowseScreen
            tutors={tutors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            onOpenFilters={() => show("s-filters")}
            onSelectTutor={handleSelectTutor}
          />
        )}

        {activeScreen === "s-filters" && (
          <FiltersScreen
            onBack={() => show("s-browse")}
            onApplyFilters={handleApplyFilters}
            initialFilters={filters}
          />
        )}

        {activeScreen === "s-profile" && (
          <TutorProfileScreen
            tutor={selectedTutor}
            onBack={() => show("s-browse")}
            onStartChat={() => show("s-chat")}
            onStartBooking={() => show("s-booking")}
          />
        )}

        {activeScreen === "s-booking" && (
          <BookingScreen
            tutor={selectedTutor}
            onBack={() => show("s-profile")}
            onContinueToPayment={() => show("s-payment")}
            bookingDetails={bookingDetails}
            setBookingDetails={setBookingDetails}
          />
        )}

        {activeScreen === "s-payment" && (
          <PaymentScreen
            bookingDetails={bookingDetails}
            onBack={() => show("s-booking")}
            onConfirmPayment={() => show("s-confirm")}
          />
        )}

        {activeScreen === "s-confirm" && (
          <ConfirmationScreen
            bookingDetails={bookingDetails}
            onMessageTutor={() => show("s-chat")}
            onBackToBrowse={() => show("s-browse")}
          />
        )}

        {activeScreen === "s-chat" && (
          <ChatScreen
            tutorName={selectedTutor?.name || "Tutor"}
            onBack={goBack}
          />
        )}

        {activeScreen === "s-notif" && (
          <NotificationsScreen
            onBack={goBack}
            onNavigateScreen={(scr) => show(scr)}
          />
        )}

        {activeScreen === "s-dash" && (
          <TutorDashboardScreen
            tutorProfile={tutorProfile}
            onManageSchedule={() => show("s-schedule")}
            onEditProfile={() => {
              setOnboardingStep(1);
              show("s-onb-1");
            }}
          />
        )}

        {activeScreen === "s-schedule" && (
          <ScheduleSettingsScreen
            onBack={() => show("s-dash")}
            onSave={() => show("s-dash")}
            tutorProfile={tutorProfile}
            setTutorProfile={setTutorProfile}
          />
        )}
      </>
    );
  }
}
