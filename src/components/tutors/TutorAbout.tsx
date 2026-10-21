export function TutorAbout({ bio }: { bio?: string }) {
  if (!bio) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="mb-4 text-lg font-bold text-[#2D2A32]">About</h2>
      <p className="text-sm leading-relaxed text-gray-600">{bio}</p>
    </div>
  );
}