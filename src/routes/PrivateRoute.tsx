import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { refreshAuthToken } from "../services/authFetch";
import {
  getToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "../services/authStorage";

export function PrivateRoute() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function validate() {
      const token = getToken();

      if (token) {
        setAuthorized(true);
        setChecking(false);
        return;
      }

      const newToken = await refreshAuthToken();

      if (!newToken) {
        clearAuthTokens();
        window.location.replace("/login");
        return;
      }

      setAuthTokens(newToken, getRefreshToken()!);
      setAuthorized(true);
      setChecking(false);
    }

    validate();
  }, []);

  if (checking) {
    return <Spinner />;
  }

  if (!authorized) {
    return null;
  }

  return <Outlet />;
}
