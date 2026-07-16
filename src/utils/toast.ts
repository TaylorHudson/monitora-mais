import { toast } from 'sonner';

export function toastSuccess(title: string, description?: string) {
  toast.success(title, {
    description,
  });
}

export function toastError(title: string, description?: string) {
  toast.error(title, {
    description,
  });
}

export function toastApiError(
  error: Error | unknown,
  fallbackMessage = 'Erro inesperado',
) {
  if (error instanceof Error && error.message === 'Sessão expirada') {
    return;
  }

  const message = error instanceof Error ? error.message : fallbackMessage;

  toast.error(message, {});
}
