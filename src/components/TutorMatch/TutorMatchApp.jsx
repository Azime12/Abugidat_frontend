import React, { useState, useEffect } from "react";
import TgBar from "./TgBar";
import BottomNav from "./BottomNav";

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

// Default Initial Mock Tutors
const INITIAL_TUTORS = [
  {
    id: "t1",
    name: "Amara Bekele",
    initials: "AB",
    avatarBg: "var(--coral)",
    subjects: "Math, physics",
    subjectList: ["Math", "Physics"],
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
    subjects: "English, essay writing",
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
    subjects: "Coding basics, Python",
    subjectList: ["Coding", "Python", "Web Dev"],
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
  initialScreen = "s-role",
  defaultViewMode = null,
}) {
  const [role, setRole] = useState(initialRole);
  const [activeScreen, setActiveScreen] = useState(initialScreen);
  const [history, setHistory] = useState([initialScreen]);
  const [onboardingStep, setOnboardingStep] = useState(
    initialScreen.startsWith("s-onb-")
      ? parseInt(initialScreen.replace("s-onb-", ""), 10) || 1
      : 1
  );

  // Data state
  const [tutors, setTutors] = useState(INITIAL_TUTORS);
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
    name: "Amara Bekele",
    bio: "I love helping students build confidence in math.",
    subjects: ["Math", "Physics"],
    hourlyRate: 300,
    availableDays: ["Mon", "Tue", "Thu", "Sat"],
    startTime: "9:00 AM",
    endTime: "6:00 PM",
  });

  // Telegram mini app detection & desktop framing
  const isInsideTelegram = typeof window !== "undefined" && Boolean(window?.Telegram?.WebApp?.initData);
  const [viewMode, setViewMode] = useState(
    defaultViewMode || (isInsideTelegram ? "fullscreen" : "mockup")
  );

  // Navigation handlers
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
      setActiveScreen("s-role");
    }
  };

  const handlePickRole = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleContinueRole = () => {
    if (role === "student") {
      show("s-browse");
    } else {
      setOnboardingStep(1);
      show("s-onb-1");
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

  // Screen Title for Telegram Bar
  const getScreenTitle = () => {
    switch (activeScreen) {
      case "s-role":
        return "TutorMatch";
      case "s-onb-1":
      case "s-onb-2":
      case "s-onb-3":
      case "s-onb-4":
        return "Tutor Registration";
      case "s-browse":
        return "Find a Tutor";
      case "s-filters":
        return "Filters";
      case "s-profile":
        return selectedTutor?.name || "Tutor Profile";
      case "s-booking":
        return "Book a Session";
      case "s-payment":
        return "Payment";
      case "s-confirm":
        return "Booking Confirmed";
      case "s-chat":
        return selectedTutor?.name || "Chat";
      case "s-notif":
        return "Notifications";
      case "s-dash":
        return "Tutor Dashboard";
      case "s-schedule":
        return "Availability";
      default:
        return "TutorMatch";
    }
  };

  const showBottomNav =
    activeScreen !== "s-role" && !activeScreen.startsWith("s-onb");

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${viewMode === "mockup" ? "bg-[#DDD6C4] py-4 px-2" : "bg-tm-cream"}`}>
      {/* View Mode & Role Switcher Bar for Desktop Previews */}
      {!isInsideTelegram && (
        <div className="w-full max-w-[412px] mb-3 flex items-center justify-between px-2 text-xs text-tm-navy/80 select-none">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-tm-border shadow-xs">
            <span className="font-semibold text-tm-navy">Role:</span>
            <button
              onClick={() => {
                setRole("student");
                show("s-browse");
              }}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                role === "student" && activeScreen !== "s-role"
                  ? "bg-tm-blue text-white font-medium"
                  : "hover:text-tm-blue"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                setRole("tutor");
                show("s-dash");
              }}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                role === "tutor" && activeScreen !== "s-role"
                  ? "bg-tm-coral text-white font-medium"
                  : "hover:text-tm-coral"
              }`}
            >
              Tutor
            </button>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "mockup" ? "fullscreen" : "mockup")}
            className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-tm-border hover:bg-white shadow-xs font-medium"
            title="Toggle phone frame mockup"
          >
            <i className={`ti ${viewMode === "mockup" ? "ti-device-mobile" : "ti-layout-sidebar"}`} />
            <span>{viewMode === "mockup" ? "Phone Frame" : "Full View"}</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`${
          viewMode === "mockup"
            ? "phone-mockup"
            : "w-full max-w-lg min-h-screen bg-tm-cream relative shadow-md flex flex-col"
        }`}
      >
        {/* Telegram Top Bar */}
        <TgBar
          title={getScreenTitle()}
          onBack={goBack}
          onShowNotif={() => show("s-notif")}
          unreadCount={1}
          canGoBack={history.length > 1}
        />

        {/* Screen Content Router */}
        <div className="flex-1 flex flex-col justify-between">
          {activeScreen === "s-role" && (
            <RoleSelectionScreen
              role={role}
              onPickRole={handlePickRole}
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
              tutorName={selectedTutor?.name || "Amara Bekele"}
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
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav
            activeScreen={activeScreen}
            onNavigate={(screenId) => show(screenId)}
            role={role}
          />
        )}
      </div>
    </div>
  );
}
