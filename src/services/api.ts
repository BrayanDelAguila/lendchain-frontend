import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Tipos de error normalizados ──────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
}

// ─── Instancia Axios ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Interceptor REQUEST — adjunta JWT del localStorage ──────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('lendchain_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Interceptor RESPONSE — normaliza errores como { code, message } ─────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: string; message?: string; error?: string }>) => {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrió un error inesperado. Intenta de nuevo.',
    };

    if (error.response) {
      // Error con respuesta del servidor (4xx, 5xx)
      const data = error.response.data;
      apiError.code = data?.code ?? `HTTP_${error.response.status}`;
      apiError.message =
        data?.message ?? data?.error ?? httpMessage(error.response.status);
    } else if (error.request) {
      // Sin respuesta (timeout, red caída)
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      // Error al construir la petición
      apiError.code = 'REQUEST_ERROR';
      apiError.message = error.message ?? apiError.message;
    }

    return Promise.reject(apiError);
  },
);

// ─── Helper: mensajes HTTP legibles ──────────────────────────────────────────

function httpMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'La solicitud contiene datos inválidos.',
    401: 'No estás autenticado. Por favor inicia sesión.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no existe.',
    409: 'Ya existe un recurso con esos datos.',
    422: 'Los datos enviados no son válidos.',
    429: 'Demasiadas solicitudes. Espera un momento.',
    500: 'Error interno del servidor.',
    503: 'Servicio no disponible temporalmente.',
  };
  return messages[status] ?? `Error del servidor (${status}).`;
}

export default api;
