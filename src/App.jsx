import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SmartSignUp from "./components/Login/SmartSingUp";
import Logout from "./components/Login/Logout";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import TutorsPage from "./pages/TutorsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import MatchesPage from "./pages/MatchesPage";
import SettingsPage from "./pages/SettingsPage";
import MiniAppLayout from "./pages/MiniApp/MiniAppLayout";
import TutorJobList from "./pages/MiniApp/TutorJobList";
import TutorJobDetail from "./pages/MiniApp/TutorJobDetail";
import TutorMatchApp from "./components/TutorMatch/TutorMatchApp";
import { useTutorAuthMutation } from "./redux/api/tutorMiniAppApiSlice";
import { setUserCredentials } from "./redux/slice/authSlice";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { useRequestNotificationPermission } from "./hooks/useRequestNotificationPermission";

/**
 * MiniAppInit — handles Telegram Mini App authentication and start_param routing.
 * Renders nothing visible; redirects after auth completes.
 */
function MiniAppInit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tutorAuth] = useTutorAuthMutation();

  useEffect(() => {
    async function init() {
      // Get initData from Telegram WebApp
      const initData = window?.Telegram?.WebApp?.initData;
      
      if (!initData) {
        // Not inside Telegram — redirect to job list for dev/testing
        navigate("/miniapp/jobs", { replace: true });
        return;
      }

      try {
        // Authenticate with backend
        const result = await tutorAuth(initData).unwrap();
        
        // Store auth token
        dispatch(
          setUserCredentials({
            user: {
              ...result.tutor,
              role: "Tutor",
            },
            token: result.token,
          })
        );

        // Handle start_param (deep link from channel)
        const startParam = result.start_param;
        if (startParam && startParam.startsWith("job_")) {
          const jobId = startParam.replace("job_", "");
          navigate(`/miniapp/job/${jobId}`, { replace: true });
        } else {
          navigate("/miniapp/jobs", { replace: true });
        }
      } catch (err) {
        console.error("Mini App auth failed:", err);
        navigate("/miniapp/jobs", { replace: true });
      }
    }

    init();
  }, [dispatch, navigate, tutorAuth]);

  // Show loading spinner while authenticating
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Authenticating...</p>
      </div>
    </div>
  );
}

export default function App() {
  useRequestNotificationPermission();

  const dispatch = useDispatch();

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    } else {
      console.warn("Not running inside Telegram WebApp");
    }
  }, [dispatch]);

  return (
    <>
      <ErrorBoundary>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SmartSignUp />} />
          <Route path="/logout" element={<Logout />} />

          {/* Admin routes */}
          <Route element={<Layout />}>
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin"]} />
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Tutor Mini App & Prototype Routes */}
          <Route path="/miniapp" element={<TutorMatchApp />} />
          <Route path="/tutormatch" element={<TutorMatchApp defaultViewMode="mockup" />} />
          <Route path="/prototype" element={<TutorMatchApp defaultViewMode="mockup" />} />

          {/* Legacy MiniApp sub-routes if accessed directly */}
          <Route path="/miniapp-classic" element={<MiniAppLayout />}>
            <Route index element={<MiniAppInit />} />
            <Route path="jobs" element={<TutorJobList />} />
            <Route path="job/:id" element={<TutorJobDetail />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <ToastContainer />
    </>
  );
}
