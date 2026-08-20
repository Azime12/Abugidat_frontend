import React, { useState } from "react";

export default function BookingScreen({
  tutor,
  onBack,
  onContinueToPayment,
  bookingDetails,
  setBookingDetails,
}) {
  const [selectedDay, setSelectedDay] = useState(
    bookingDetails.day || "Wed 13"
  );
  const [selectedSlot, setSelectedSlot] = useState(
    bookingDetails.slot || "2:00 PM"
  );

  const days = ["Wed 13", "Thu 14", "Fri 15", "Sat 16", "Sun 17", "Mon 18"];
  const slots = [
    "9:00 AM",
    "2:00 PM",
    "4:30 PM",
    "6:00 PM",
    "7:30 PM",
    "8:30 PM",
  ];

  const handleContinue = () => {
    setBookingDetails({
      day: selectedDay,
      slot: selectedSlot,
      tutorName: tutor?.name || "Amara Bekele",
      rate: tutor?.rate || 300,
      serviceFee: 15,
      total: (tutor?.rate || 300) + 15,
    });
    onContinueToPayment();
  };

  return (
    <div className="tm-screen flex flex-col justify-between" id="s-booking">
      <div>
        <div className="tm-backbar">
          <i className="ti ti-arrow-left" onClick={onBack} title="Back to profile" />
          <span>Book a session</span>
        </div>

        <p className="text-[13px] text-tm-muted mb-4 font-medium">
          With {tutor?.name || "Amara Bekele"} · {tutor?.rate || 300} ETB/hr
        </p>

        {/* Date Selection */}
        <h2 className="text-sm font-semibold text-tm-navy mb-2">Pick a day</h2>
        <div className="tm-chip-row mb-3">
          {days.map((day) => (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`tm-chip shadow-xs ${
                selectedDay === day ? "active" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Slot Grid */}
        <h2 className="text-sm font-semibold text-tm-navy mb-2">Pick a time</h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {slots.map((slot) => (
            <div
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`tm-slot ${
                selectedSlot === slot ? "selected" : ""
              }`}
            >
              {slot}
            </div>
          ))}
        </div>

        {/* Breakdown Card */}
        <div className="tm-card shadow-sm">
          <div className="tm-req-row">
            <span className="text-[13px] text-tm-muted">Session duration</span>
            <span className="text-[13px] text-tm-navy font-medium">1 hour</span>
          </div>
          <div className="tm-req-row">
            <span className="text-[13px] text-tm-muted">Hourly rate</span>
            <span className="text-[13px] text-tm-navy font-semibold">
              {tutor?.rate || 300} ETB
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <button
          className="tm-btn tm-btn-primary shadow-sm"
          onClick={handleContinue}
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}
