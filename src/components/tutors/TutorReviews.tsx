import { Star } from "lucide-react";
import type { TutorReview } from "@/types/tutor";

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= count
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function TutorReviews({
  reviews,
  total,
}: {
  reviews: TutorReview[];
  total?: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="mb-5 text-lg font-bold text-[#2D2A32]">
        Reviews {total && <span className="text-gray-400">({total})</span>}
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">
          No reviews yet. Be the first to review after a lesson.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4F8] text-sm font-bold text-[#0096D6]">
                  {review.parentInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#2D2A32]">
                        {review.parentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.date}
                        {review.context && ` · ${review.context}`}
                      </p>
                    </div>
                    <StarRow count={review.stars} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}