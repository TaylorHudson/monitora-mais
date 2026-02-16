// Utilitários para cookies
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function getCookie(name: string): string | null {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export async function fetchComToken(input: RequestInfo, init: RequestInit = {}) {
  let token = getCookie("token");
  let refreshToken = getCookie("refreshToken");

  if (!token && !refreshToken) {
    window.location.href = "/login";
    throw new Error("Sessão expirada");
  }

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  init.headers = {
    ...(init.headers || {}),
    ...authHeaders,
  };

  let response = await fetch(input, init);

  if ((response.status === 401 || response.status === 403) && refreshToken) {
    const refreshResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

      if (data.token) {
        setCookie("token", data.token);
        token = data.token;

        init.headers = {
          ...(init.headers || {}),
          Authorization: `Bearer ${token}`,
        };

        response = await fetch(input, init);
      }
    } else {
      deleteCookie("token");
      deleteCookie("refreshToken");
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }
  }

  if (!response.ok) {
    let errorMessage = "Erro inesperado. Tente novamente.";
    try {
      const data = await response.clone().json();
      if (data?.errorCode) {
        // Mapeamento dos códigos para mensagens amigáveis
        const errorMap: Record<string, string> = {
          ERROR_100: "Verifique os campos do formulário.",
          ERROR_101: "O professor informado não é o professor da monitoria.",
          ERROR_102: "O estudante já está inscrito na monitoria.",
          ERROR_103: "A matrícula do estudante é inválida ou não foi encontrada no Suap.",
          ERROR_104: "O nome do enum informado é inválido.",
          ERROR_200: "Ponto não encontrado.",
          ERROR_201: "Usuário não encontrado.",
          ERROR_202: "Agendamento de monitoria não encontrado.",
          ERROR_203: "Monitoria não encontrada.",
          ERROR_204: "Sessão de monitoria não encontrada.",
          ERROR_205: "Nenhuma sessão de monitoria iniciada foi encontrada.",
          ERROR_300: "Token de autenticação inválido, expirado ou corrompido.",
          ERROR_301: "Matrícula ou senha inválida.",
          ERROR_400: "Já existe um agendamento de monitoria para essa disciplina nesse horário.",
          ERROR_401: "A sessão de monitoria já foi iniciada.",
          ERROR_402: "A sessão de monitoria só pode ser iniciada no horário agendado ou em até 5 minutos depois.",
          ERROR_403: "A sessão de monitoria não foi iniciada, então não pode ser finalizada.",
          ERROR_500: "Você não tem permissão para esta ação.",
          ERROR_999: "Não foi possível processar sua requisição.",
        };
        errorMessage = errorMap[data.errorCode] || data.message || errorMessage;
      } else if (data && data.message) {
        errorMessage = data.message;
      }
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return response;
}
