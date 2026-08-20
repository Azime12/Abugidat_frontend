export const navigateBasedOnRole = (role, navigate) => {
  switch (role) {
    case "Admin":
      navigate("/dashboard");
      break;
    default:
      navigate("/dashboard");
      break;
  }
};
