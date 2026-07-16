import { login } from "../services/authFetch";

export function useLogin() {

  async function handleLogin(registration: string, password: string) {
    const data = await login(registration, password);
    return data;
  }

  return { handleLogin };
}
