import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Tipos de error normalizados ──────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
}

// ─── Instancia Axios ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 30_000,
  withCredentials: false,
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

// ─── Refresh token queue ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Interceptor RESPONSE — refresh token automático en 401 ──────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es 401 y no es un retry ni es el endpoint de login/register/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/login') &&
      !originalRequest.url?.includes('/users/register') &&
      !originalRequest.url?.includes('/users/refresh')
    ) {
      if (isRefreshing) {
        // Ya hay un refresh en curso — encolar esta petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('lendchain_refresh_token');

      if (!refreshToken) {
        // Sin refresh token — limpiar sesión y rechazar
        localStorage.removeItem('lendchain_jwt');
        localStorage.removeItem('lendchain_refresh_token');
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        window.location.reload();
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post<{ data: { access_token: string } }>(
          '/api/v1/users/refresh',
          { refresh_token: refreshToken }
        );
        const newToken = data.data.access_token;
        localStorage.setItem('lendchain_jwt', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('lendchain_jwt');
        localStorage.removeItem('lendchain_refresh_token');
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores — normalizar como antes
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrió un error inesperado. Intenta de nuevo.',
    };
    if (error.response) {
      const data = error.response.data;
      apiError.code = data?.code ?? `HTTP_${error.response.status}`;
      apiError.message = data?.message ?? data?.error ?? httpMessage(error.response.status);
    } else if (error.request) {
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
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
