import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import SideBar from "./navbar/SideBar";
import TopBar from "./navbar/TopBar";
import { toggleSidebar } from "../redux/slice/stateSlice";

const Layout = () => {
  const isSidebarOpen = useSelector((state) => state.state.isSidebarOpen);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();

  const toggleSidebar2 = () => setSidebarVisible((prev) => !prev);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = () => setIsMobileOrTablet(mediaQuery.matches);

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (isMobileOrTablet && isSidebarOpen) {
      dispatch(toggleSidebar());
    }
  }, [isMobileOrTablet, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isMobileOrTablet &&
        isSidebarOpen
      ) {
        dispatch(toggleSidebar());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, isMobileOrTablet, dispatch]);

  return (
    <div className="flex">
      <div
        ref={sidebarRef}
        className={`transition-all duration-300 
          ${
            isMobileOrTablet
              ? isSidebarVisible || isSidebarOpen
                ? "ml-0"
                : "ml-[-80px]"
              : isSidebarOpen
              ? ""
              : "ml-0"
          }
         md:block`}
      >
        <SideBar
          onClose={() => setSidebarVisible(false)}
          isMobileOrTablet={isMobileOrTablet}
          isSidebarVisible={isSidebarVisible}
        />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen && !isSidebarVisible
            ? isMobileOrTablet
              ? "ml-0"
              : "ml-72"
            : "ml-0"
        }`}
      >
        <TopBar
          onMenuClick={toggleSidebar2}
          isSidebarVisible={isSidebarVisible}
          isMobileOrTablet={isMobileOrTablet}
        />

        <div
          className={`transition-all duration-300
            ${isSidebarOpen ? "ml-72" : "ml-20"}
            pt-16 pb-8 min-h-screen overflow-y-auto`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
