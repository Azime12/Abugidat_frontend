import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/slice/authSlice";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector((state) => state.auth?.user?.role);

  return isAuthenticated && allowedRoles.includes(userRole) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
