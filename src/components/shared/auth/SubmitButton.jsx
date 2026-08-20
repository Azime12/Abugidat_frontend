import LoadingSpinner from "./LoadingSpinner";

export default function SubmitButton({
  isLoading = false,
  loadingText = "Loading...",
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-all text-sm font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
