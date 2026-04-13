import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, baseClient, tokenStorage } from './baseClient';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const setupAxiosInterceptors = (): void => {
  baseClient.interceptors.request.use((config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  baseClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;
      const isUnauthorized = error.response?.status === 401;
      const isRefreshRequest =
        originalRequest?.url?.includes('/api/auth/refresh');

      if (
        !originalRequest ||
        !isUnauthorized ||
        originalRequest._retry ||
        isRefreshRequest
      ) {
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {
            refreshToken,
          },
        );

        const newAccessToken = refreshResponse.data?.accessToken as
          | string
          | undefined;
        const newRefreshToken = refreshResponse.data?.refreshToken as
          | string
          | undefined;

        if (!newAccessToken || !newRefreshToken) {
          tokenStorage.clearTokens();
          return Promise.reject(error);
        }

        tokenStorage.setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return baseClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    },
  );
};
