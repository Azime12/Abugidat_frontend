import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useApplyForJobMutation } from "../../redux/api/tutorMiniAppApiSlice";

export default function BrowserJobApplyModal({ isOpen, onClose, job, tutor, onApplied }) {
  const [applyForJob, { isLoading }] = useApplyForJobMutation();
  const [proposedRate, setProposedRate] = useState(job?.hourly_salary || 300);
  const [note, setNote] = useState("");

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await applyForJob({
        job_id: job.id,
      }).unwrap();

      toast.success(res?.message || "🎉 Application submitted successfully directly in your browser!");
      if (onApplied) onApplied(job.id);
      onClose();
    } catch (err) {
      const errData = err?.data?.error || err?.data;
      if (errData?.reason === "already_applied") {
        toast.info("You have already applied for this job.");
        onClose();
      } else if (errData?.reason === "insufficient_invites") {
        toast.warning(errData?.message || "You need more invites to apply for this job.");
      } else {
        toast.error(errData?.message || err?.message || "Failed to submit application. Please check your profile.");
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E1D3] relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8703A] text-white flex items-center justify-center text-xl shadow-xs">
                <i className="ti ti-briefcase" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#22364A]">Apply for Tutoring Job</h3>
                <p className="text-[11px] text-[#6B7684]">Direct application in browser</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FBF8F2] border border-[#E8E1D3] flex items-center justify-center text-[#6B7684] hover:text-[#22364A] transition-colors"
            >
              <i className="ti ti-x text-sm" />
            </button>
          </div>

          {/* Job summary card */}
          <div className="my-4 p-4 rounded-2xl bg-[#FBF8F2] border border-[#E8E1D3] space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FCEAE1] text-[#E8703A] text-[10px] font-bold">
                  {job.student_level || "High School"}
                </span>
                <h4 className="font-extrabold text-base text-[#22364A] mt-1">{job.subjects}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#6B7684] uppercase font-bold block">Parent Budget</span>
                <span className="font-extrabold text-base text-[#4E9450]">{job.hourly_salary} ETB/hr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7684] pt-1">
              <div className="flex items-center gap-1.5 truncate">
                <i className="ti ti-map-pin text-[#E8703A]" />
                <span className="truncate">{job.location || "Addis Ababa"}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <i className="ti ti-calendar-time text-[#3B7DD8]" />
                <span className="truncate">{job.schedule || "Flexible"}</span>
              </div>
            </div>
          </div>

          {/* Applying as info */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-[#E9F1FC] rounded-xl border border-[#3B7DD8]/20 mb-4">
            <span className="text-[#6B7684]">Applying as:</span>
            <span className="font-bold text-[#3B7DD8]">
              {tutor?.name || tutor?.first_name || "Verified Tutor"} (Telegram ID: {tutor?.telegram_id || tutor?.phone_number || "Connected"})
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#22364A] mb-1">
                Your Proposed Hourly Rate (ETB/hour)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7684] font-bold">ETB</span>
                <input
                  type="number"
                  min="100"
                  max="3000"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2.5 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs font-semibold text-[#22364A] focus:outline-none focus:border-[#E8703A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#22364A] mb-1">
                Short Note for the Parent (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly state your relevant experience and teaching approach..."
                className="w-full p-3 bg-[#FBF8F2] border border-[#E8E1D3] rounded-xl text-xs text-[#22364A] focus:outline-none focus:border-[#E8703A] resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#FBF8F2] hover:bg-[#E8E1D3] text-[#6B7684] rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-[#E8703A] hover:bg-[#D6602A] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <i className="ti ti-send text-xs" />
                    <span>Confirm & Apply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
