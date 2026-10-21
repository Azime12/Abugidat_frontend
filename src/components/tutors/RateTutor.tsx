"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { tutorService } from "@/services/api/tutors";
import { useAuth } from "@/contexts/auth-context";
import { getApiErrorMessage } from "@/lib/api-errors";

export function RateTutor({
  tutorId,
  onRated,
}: {
  tutorId: string;
  onRated?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Log in as a parent to rate this tutor.
        </p>
      </div>
    );
  }

  const submit = async () => {
    if (stars < 1) {
      toast.error("Select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await tutorService.rateTutor(tutorId, stars, comment.trim() || undefined);
      toast.success("Thanks for your review!");
      setStars(0);
      setComment("");
      onRated?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit review"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-3 text-lg font-bold text-[#2D2A32]">Rate this tutor</h2>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStars(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 transition ${
                (hover || stars) >= i
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        className="mt-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
        rows={3}
      />

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0096D6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#007FB8] disabled:opacity-50"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit review
      </button>
    </div>
  );
}
