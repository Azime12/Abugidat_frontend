import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useListTutorJobsQuery } from "../../redux/api/tutorMiniAppApiSlice";
import { IoBriefcase, IoLocation, IoTime, IoCash, IoSearch } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import TelegramInitDataCard from "../../components/shared/TelegramInitDataCard";

const TutorJobList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useListTutorJobsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const jobs = data?.jobs || [];

  const filteredJobs = searchTerm
    ? jobs.filter(
        (job) =>
          job.subjects?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.student_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 text-sm">Loading opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <IoBriefcase size={28} className="text-red-400" />
        </div>
        <p className="text-gray-600 font-medium">Unable to load jobs</p>
        <p className="text-gray-400 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Telegram Context & initData Live Card ── */}
      <TelegramInitDataCard defaultExpanded={true} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tutoring Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find the perfect tutoring opportunity
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by subject, level, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <IoBriefcase size={36} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {searchTerm ? "No jobs match your search" : "No jobs available yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm
              ? "Try a different search term"
              : "Check back later for new opportunities"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/miniapp/job/${job.id}`)}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              {/* Title & Salary */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {job.subjects}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {job.student_level}
                  </p>
                </div>
                <span className="text-primary font-bold text-sm whitespace-nowrap ml-2">
                  {job.hourly_salary} ETB/hr
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <IoLocation size={14} className="text-gray-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <IoTime size={14} className="text-gray-400" />
                  {job.schedule}
                </span>
                {job.gender_requirement && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                    {job.gender_requirement}
                  </span>
                )}
              </div>

              {/* Posted date */}
              <p className="text-xs text-gray-400 mt-3">
                Posted {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorJobList;
