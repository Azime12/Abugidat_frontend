import { Outlet, Link, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import AbugidaLogo from "../../components/AbugidaLogo";
import TelegramInitDataInspector from "../../components/shared/TelegramInitDataInspector";

const MiniAppLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/miniapp" || location.pathname === "/miniapp/";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mini App Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link
                to="/miniapp"
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoArrowBack size={22} className="text-gray-600" />
              </Link>
            )}
            <AbugidaLogo size={28} variant="icon" />
            <span className="font-bold text-[#1B3A5C] text-base">Abugida</span>
          </div>

          <div className="flex items-center gap-2">
            <TelegramInitDataInspector />
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full hidden sm:inline">
              Tutor App
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200">
        <div className="flex justify-center py-2">
          <Link
            to="/miniapp/jobs"
            className={`flex flex-col items-center px-6 py-1 rounded-lg transition-colors ${
              location.pathname.includes("/miniapp/job") || location.pathname === "/miniapp/jobs"
                ? "text-primary"
                : "text-gray-400"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-0.5 font-medium">Browse Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MiniAppLayout;
