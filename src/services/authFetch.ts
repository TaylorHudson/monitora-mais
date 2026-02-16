import { useState } from "react";
import {
  getToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "../services/authStorage";
import { Spinner } from "../components/ui/Spinner";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAuthToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.token || !data.refreshToken) return null;

      setAuthTokens(data.token, data.refreshToken);
      return data.token;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchComToken(
  input: RequestInfo,
  init: RequestInit = {}
) {
  let token = getToken();

  init.headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(input, init);

  if (response.status === 401 || response.status === 403) {
    const newToken = await refreshAuthToken();

    if (!newToken) {
      clearAuthTokens();
      window.location.href = "/login";
      return new Promise<Response>(() => {});
    }

    init.headers = {
      ...(init.headers || {}),
      Authorization: `Bearer ${newToken}`,
    };

    response = await fetch(input, init);
  }

  if (!response.ok) {
    let errorMessage = "Erro inesperado. Tente novamente.";

    try {
      const data = await response.clone().json();

      if (data?.errorCode) {
        const errorMap: Record<string, string> = {
          ERROR_100: "Verifique os campos do formulário",
          ERROR_101: "O professor informado não é o professor da monitoria",
          ERROR_102: "O estudante já está inscrito na monitoria",
          ERROR_103: "A matrícula do estudante é inválida ou não foi encontrada no Suap",
          ERROR_104: "O nome do enum informado é inválido",
          ERROR_200: "Ponto não encontrado",
          ERROR_201: "Usuário não encontrado",
          ERROR_202: "Agendamento de monitoria não encontrado",
          ERROR_203: "Monitoria não encontrada",
          ERROR_204: "Sessão de monitoria não encontrada",
          ERROR_205: "Nenhuma sessão de monitoria iniciada foi encontrada",
          ERROR_300: "Token de autenticação inválido, expirado ou corrompido",
          ERROR_301: "Matrícula ou senha inválida",
          ERROR_400: "Já existe um agendamento de monitoria para essa disciplina nesse horário",
          ERROR_401: "A sessão de monitoria já foi iniciada",
          ERROR_402: "A sessão de monitoria só pode ser iniciada no horário agendado ou em até 5 minutos depois",
          ERROR_403: "A sessão de monitoria não foi iniciada, então não pode ser finalizada",
          ERROR_500: "Você não tem permissão para esta ação",
          ERROR_999: "Não foi possível processar sua requisição",
        };

        errorMessage = errorMap[data.errorCode] || data.message || errorMessage;
      } else if (data?.message) {
        errorMessage = data.message;
      }
    } catch {}

    throw new Error(errorMessage);
  }

  return response;
}

type LoginResponse = {
  token: string;
  refreshToken: string;
};

export async function login(
  registration: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration, password }),
    }
  );

  if (!response.ok) {
    let message = "Matrícula ou senha inválida";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  setAuthTokens(data.accessToken, data.refreshToken);

  return data;
}
