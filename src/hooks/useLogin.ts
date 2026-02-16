import { useState } from "react";
import { login } from "../services/authFetch";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(registration: string, password: string) {
    try {
      setLoading(true);
      const data = await login(registration, password);
      return data;
    } finally {
      setLoading(false);
    }
  }

  return { handleLogin, loading };
}
