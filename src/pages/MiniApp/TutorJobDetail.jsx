import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useGetTutorJobQuery,
  useApplyForJobMutation,
} from "../../redux/api/tutorMiniAppApiSlice";
import {
  IoBriefcase,
  IoLocation,
  IoTime,
  IoCash,
  IoPerson,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoArrowBack,
} from "react-icons/io5";

const TutorJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTutorJobQuery(id);
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const [status, setStatus] = useState(null); // null | 'applying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const [initData, setInitData] = useState("");

  // Get initData from Telegram WebApp on mount
  useEffect(() => {
    if (window?.Telegram?.WebApp?.initData) {
      setInitData(window.Telegram.WebApp.initData);
    } else {
      // For development/testing outside Telegram
      const stored = localStorage.getItem("tg_initData");
      if (stored) setInitData(stored);
    }
  }, []);

  const handleApply = async () => {
    if (!initData) {
      setErrorMsg("Authentication data not found. Please open this from Telegram.");
      setStatus("error");
      return;
    }

    setStatus("applying");
    try {
      const result = await applyForJob({ job_id: parseInt(id), initData }).unwrap();
      setStatus("success");
      // Close Mini App after 2 seconds if inside Telegram
      setTimeout(() => {
        if (window?.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      }, 2000);
    } catch (err) {
      setStatus("error");
      const errData = err?.data?.error || err?.data;
      if (typeof errData === "object") {
        if (errData.reason === "insufficient_invites") {
          setErrorMsg(
            `You need ${errData.required_threshold} invites to apply. You currently have ${errData.current_balance}.`
          );
        } else if (errData.reason === "previously_rejected") {
          setErrorMsg("Your previous application for this job was rejected by an admin.");
        } else if (errData.reason === "already_applied") {
          setErrorMsg("You have already applied for this job.");
        } else {
          setErrorMsg(errData.message || "Application failed. Please try again.");
        }
      } else {
        setErrorMsg(err?.data?.message || "Application failed. Please try again.");
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 text-sm">Loading job details...</p>
      </div>
    );
  }

  // Error/unavailable state
  if (error || !data?.job) {
    const isGone = error?.status === 410;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isGone ? "bg-yellow-100" : "bg-red-100"
          }`}
        >
          {isGone ? (
            <IoCloseCircle size={36} className="text-yellow-400" />
          ) : (
            <IoCloseCircle size={36} className="text-red-400" />
          )}
        </div>
        <p className="text-gray-700 font-medium text-lg">
          {isGone ? "Job No Longer Available" : "Job Not Found"}
        </p>
        <p className="text-gray-400 text-sm mt-2 mb-6">
          {isGone
            ? "This job has been filled or is no longer accepting applications."
            : "The job you're looking for doesn't exist."}
        </p>
        <button
          onClick={() => navigate("/miniapp")}
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Browse Other Jobs
        </button>
      </div>
    );
  }

  const job = data.job;

  // Success state
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <IoCheckmarkCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 text-sm mb-4">
          Your application for {job.subjects} has been received.
        </p>
        <p className="text-gray-400 text-xs">
          An admin will review your application shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Job Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-700 px-6 py-5">
          <h1 className="text-white font-bold text-lg">{job.subjects}</h1>
          <p className="text-blue-200 text-sm mt-1">{job.student_level}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IoCash size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hourly Rate</p>
              <p className="font-semibold text-gray-900">{job.hourly_salary} ETB/hr</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <IoLocation size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Location</p>
              <p className="font-semibold text-gray-900">{job.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <IoTime size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Schedule</p>
              <p className="font-semibold text-gray-900">{job.schedule}</p>
            </div>
          </div>

          {job.gender_requirement && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <IoPerson size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Preference</p>
                <p className="font-semibold text-gray-900">{job.gender_requirement}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">Posted</p>
            <p className="text-sm text-gray-600">
              {new Date(job.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-600 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={isApplying || status === "applying"}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            isApplying || status === "applying"
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-lg shadow-primary/25"
          }`}
        >
          {isApplying || status === "applying" ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Apply for This Job"
          )}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Your Telegram identity will be used to verify your application
        </p>
      </div>
    </div>
  );
};

export default TutorJobDetail;
