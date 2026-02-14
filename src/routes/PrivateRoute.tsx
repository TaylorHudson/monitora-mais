import { Navigate, Outlet } from "react-router-dom";

function isAuthenticated() {
  return document.cookie.includes("token=");
}

export function PrivateRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
