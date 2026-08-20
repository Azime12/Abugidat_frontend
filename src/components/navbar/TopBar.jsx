import * as React from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { Box, MenuItem, Divider } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { MdLogout, MdPerson } from "react-icons/md";
import { logout, selectUser } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function TopBar({ onMenuClick, isSidebarVisible, isMobileOrTablet }) {
  const { i18n, t } = useTranslation();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const user = useSelector(selectUser);
  const { isSidebarOpen } = useSelector((state) => state.state);
  const [language, setLanguage] = useState(
    localStorage.getItem("i18nextLng") || "en"
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("You are successfully Logged out");
    navigate("/login");
    handleCloseUserMenu();
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("i18nextLng", selectedLanguage);
  };

  const settings = [
    {
      title: t("logout"),
      onClick: handleLogout,
      icon: <MdLogout size={18} />,
    },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 2 : 0}
      sx={{
        backgroundColor: "white",
        color: "black",
        borderBottom: scrolled ? "1px solid #f1f5f9" : "1px solid transparent",
        width: isMobileOrTablet
          ? isSidebarOpen || isSidebarVisible
            ? "calc(100% - 5rem)"
            : "100%"
          : isSidebarOpen
          ? "calc(100% - 18rem)"
          : "calc(100% - 5rem)",
        ml: isMobileOrTablet
          ? isSidebarOpen || isSidebarVisible
            ? "5rem"
            : "0"
          : isSidebarOpen
          ? "18rem"
          : "5rem",
        transition: "all 0.3s ease",
        zIndex: 30,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
          <div className="xl:hidden">
            <IconButton
              onClick={onMenuClick}
              className="xl:hidden"
              size="large"
            >
              {isSidebarVisible ? (
                <IoMdClose className="text-2xl" />
              ) : (
                <IoMdMenu className="text-2xl" />
              )}
            </IconButton>
          </div>

          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".03rem",
              color: "#0F3C6E",
            }}
          >
            Abugida
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0.5,
                  border: "2px solid",
                  borderColor: scrolled ? "#e2e8f0" : "transparent",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#0F3C6E30" },
                }}
              >
                <Avatar
                  alt={user?.first_name || "User"}
                  sx={{
                    bgcolor: "#0F3C6E",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {(user?.first_name?.[0] || "U").toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  minWidth: 180,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                },
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* User info header */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {user?.role || "Admin"}
                </Typography>
              </Box>
              <Divider />
              {settings.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={item.onClick}
                  sx={{
                    py: 1.5,
                    "&:hover": { backgroundColor: "#FFF8F0" },
                  }}
                >
                  <div className="flex items-center gap-2.5 text-sm text-[#64748B] hover:text-[#EF4444] transition-colors">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default TopBar;
