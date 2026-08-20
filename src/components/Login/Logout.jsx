import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../../redux/slice/authSlice";
import { apiSlice } from "../../redux/api/apiSlice";


const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;



    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    toast.success("You have been logged out successfully!");
    navigate("/login");

    hasExecuted.current = true;
  }, [dispatch, navigate]);

  //   const handleResetGame = () => {
  //     dispatch(resetCaller());
  //   dispatch(resetAllLocks)
  // // resetcurrentB
  //     // dispatch(resetAllSelections());
  //     // navigate('/cards-selection'); // ✅ Navigate properly
  //   };

  return null;
};

export default Logout;
