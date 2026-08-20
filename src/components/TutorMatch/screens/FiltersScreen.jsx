import React, { useState } from "react";

export default function FiltersScreen({ onBack, onApplyFilters, initialFilters = {} }) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [minRating, setMinRating] = useState(initialFilters.minRating || "4.0+");
  const [availability, setAvailability] = useState(initialFilters.availability || "Online now");
  const [selectedSubjects, setSelectedSubjects] = useState(
    initialFilters.subjects || ["Math"]
  );

  const ratings = ["3.5+", "4.0+", "4.5+", "5.0"];
  const availOptions = ["Online now", "This week"];
  const filterSubjects = ["Math", "English", "Physics", "Coding", "Chemistry", "Biology"];

  const toggleSubject = (sub) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      minRating,
      availability,
      subjects: selectedSubjects,
    });
    onBack();
  };

  return (
    <div className="tm-screen flex flex-col justify-between" id="s-filters">
      <div>
        <div className="tm-backbar">
          <i className="ti ti-arrow-left" onClick={onBack} title="Back to browse" />
          <span>Filters</span>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1.5 font-medium">
            Price range (ETB/hr)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue"
            />
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1.5 font-medium">
            Minimum rating
          </label>
          <div className="flex gap-2">
            {ratings.map((r) => (
              <div
                key={r}
                onClick={() => setMinRating(r)}
                className={`tm-toggle-pill flex-1 !py-2 !px-1 text-xs ${
                  minRating === r ? "selected" : ""
                }`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1.5 font-medium">
            Availability
          </label>
          <div className="flex gap-2">
            {availOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => setAvailability(opt)}
                className={`tm-toggle-pill flex-1 !py-2 ${
                  availability === opt ? "selected" : ""
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1.5 font-medium">
            Subjects
          </label>
          <div className="grid grid-cols-2 gap-2">
            {filterSubjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <div
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`tm-toggle-pill !py-2 ${
                    isSelected ? "selected" : ""
                  }`}
                >
                  {sub}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3">
        <button className="tm-btn tm-btn-primary shadow-sm" onClick={handleApply}>
          Show matching tutors
        </button>
      </div>
    </div>
  );
}
