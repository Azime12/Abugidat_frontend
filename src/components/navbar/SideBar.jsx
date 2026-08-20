import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdWork, MdPeople, MdDescription, MdHandshake, MdSettings, MdLogout } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { toggleSidebar } from "../../redux/slice/stateSlice";
import { selectUser } from "../../redux/slice/authSlice";
import Loading from "../others/Loading";
import AbugidaLogo from "../AbugidaLogo";
import { motion } from "framer-motion";

const SideBar = ({ onClose, isSidebarVisible }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.state.isSidebarOpen);
  const user = useSelector(selectUser);
  const userRole = user?.role;
  const navigate = useNavigate();

  const Menus = [
    { key: "dashboard", title: t("dashboard"), icon: <MdDashboard size={22} />, path: "/dashboard", roles: ["Admin"] },
    { key: "jobs", title: t("jobs"), icon: <MdWork size={22} />, path: "/jobs", roles: ["Admin"] },
    { key: "tutors", title: t("tutors"), icon: <MdPeople size={22} />, path: "/tutors", roles: ["Admin"] },
    { key: "applications", title: t("applications"), icon: <MdDescription size={22} />, path: "/applications", roles: ["Admin"] },
    { key: "matches", title: t("matches"), icon: <MdHandshake size={22} />, path: "/matches", roles: ["Admin"] },
    { key: "settings", title: t("settings"), icon: <MdSettings size={22} />, path: "/settings", roles: ["Admin"] },
    { key: "logout", title: t("logout"), icon: <MdLogout size={22} />, path: "/logout", roles: ["Admin"] },
  ];

  const filteredMenus = Menus.filter((menu) => menu.roles.includes(userRole));

  useEffect(() => {
    if (!userRole || !Menus.some((menu) => menu.roles.includes(userRole))) {
      navigate("/login");
    }
  }, [userRole, navigate]);

  if (!userRole) {
    return <Loading />;
  }

  return (
    <div className="fixed z-50 flex h-full">
      <div className={`${isSidebarOpen ? "w-72" : "w-20"} bg-brand-navy h-screen p-5 pt-8 relative duration-300`}>
        <img src="/images/control.png"
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-2 border-brand-navy/50 rounded-full bg-brand-navy hover:scale-110 transition-all duration-300 ${!isSidebarVisible && !isSidebarOpen ? "hidden xl:flex" : "flex"} ${!isSidebarOpen && "rotate-180"}`}
          onClick={() => { dispatch(toggleSidebar()); onClose?.(); }}
        />

        <div className="flex items-center gap-x-4">
          <AbugidaLogo size={40} variant="icon" />
          <h1 className={`text-white origin-left font-semibold text-xl duration-200 ${!isSidebarOpen && "scale-0"}`}>
            {t("appTitle")}
          </h1>
        </div>

        <ul className="pt-4 max-h-[32rem] overflow-y-auto pb-12 scrollbar-hidden scroll-smooth space-y-0.5">
          {filteredMenus.map((Menu, index) => {
            const isActive = Menu.path === location.pathname;
            return (
              <li key={Menu.key || index} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FAC832] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Link to={Menu.path}
                  className={`group flex items-center py-2.5 px-3 rounded-lg text-sm gap-x-3 cursor-pointer transition-all duration-200 ${
                    isSidebarOpen ? "" : "justify-center"
                  } ${
                    isActive
                      ? "bg-white/15 text-white font-semibold shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  } mt-0.5`}
                >
                  <span className={`transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}>
                    {Menu.icon}
                  </span>
                  <span className={`${!isSidebarOpen && "hidden"} origin-left duration-200 text-sm font-medium`}>
                    {Menu.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default SideBar;
