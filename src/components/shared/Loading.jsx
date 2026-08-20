export default function Loading({ fullPage = false, message = "Loading..." }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullPage ? "min-h-screen" : "py-20"
      }`}
    >
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-text-sub text-sm">{message}</p>
    </div>
  );
}
