import React from "react";

export default function StudentBrowseScreen({
  tutors = [],
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
  onOpenFilters,
  onSelectTutor,
}) {
  const subjectsList = [
    "All subjects",
    "Math",
    "English",
    "Physics",
    "Coding",
    "Chemistry",
    "Music",
  ];

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === "All subjects" ||
      tutor.subjects.toLowerCase().includes(selectedSubject.toLowerCase());

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="tm-screen pb-4" id="s-browse">
      <h1 className="text-xl font-bold text-tm-navy mb-1">Find a tutor</h1>
      <p className="text-[13px] text-tm-muted mb-3.5">
        142 tutors online near Addis Ababa
      </p>

      {/* Search & Filter Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-muted text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subject or tutor name"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted hover:text-tm-navy text-xs"
            >
              <i className="ti ti-x" />
            </button>
          )}
        </div>
        <button
          className="tm-btn tm-btn-outline-blue !w-auto !py-2.5 !px-3.5 flex items-center justify-center shadow-sm"
          onClick={onOpenFilters}
          title="Open filters"
        >
          <i className="ti ti-adjustments-horizontal text-lg" />
        </button>
      </div>

      {/* Subject Chips */}
      <div className="tm-chip-row">
        {subjectsList.map((sub) => (
          <div
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`tm-chip shadow-xs ${
              selectedSubject === sub ? "active" : ""
            }`}
          >
            {sub}
          </div>
        ))}
      </div>

      {/* Tutor List */}
      <div className="space-y-3 mt-1">
        {filteredTutors.length === 0 ? (
          <div className="tm-card text-center py-8">
            <i className="ti ti-search-off text-3xl text-tm-muted mb-2 block" />
            <p className="font-semibold text-tm-navy text-sm">No tutors found</p>
            <p className="text-xs text-tm-muted mt-1">
              Try adjusting your search query or subject filters.
            </p>
          </div>
        ) : (
          filteredTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="tm-card tm-tutor-card shadow-sm"
              onClick={() => onSelectTutor(tutor)}
            >
              <div
                className="tm-avatar w-12 h-12 text-sm shadow-sm"
                style={{ backgroundColor: tutor.avatarBg || "var(--coral)" }}
              >
                {tutor.initials || "AB"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-tm-navy text-[15px] truncate">
                  {tutor.name}
                </div>
                <div className="text-xs text-tm-muted my-0.5 truncate">
                  {tutor.subjects} · {tutor.rate} ETB/hr
                </div>
                <div className="tm-stars">
                  <i className="ti ti-star-filled text-xs text-tm-coral" />
                  <span className="text-xs font-medium text-tm-navy">
                    {tutor.rating}
                  </span>
                  <span className="text-xs text-tm-muted">
                    ({tutor.reviewsCount} reviews)
                  </span>
                </div>
              </div>
              <div>
                <span
                  className={`tm-badge ${
                    tutor.badgeType === "top"
                      ? "tm-badge-coral"
                      : tutor.badgeType === "verified"
                      ? "tm-badge-amber"
                      : "tm-badge-green"
                  }`}
                >
                  {tutor.badgeText || "Online"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
