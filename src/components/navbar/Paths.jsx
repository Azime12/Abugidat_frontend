export const paths = {
  public: "/public",
  dashboard: "/dashboard",
  login: "/login",
  register: "/register",
  transactions: "/transactions",
  settings: "/settings",
  // Add more as needed
};

// import { paths } from "../routes/paths";

{/* <Link to={paths.dashboard}>Dashboard</Link> */}

export const Paths = {
  auth: {
    login: "/login",
    register: "/register",
  },
  dashboard: "/dashboard",
  transactions: {
    root: "/transactions",
    create: "/transactions/create",
    detail: (id) => `/transactions/${id}`,
  },
};


// <Link to={paths.transactions.detail(123)}>View Transaction</Link>
