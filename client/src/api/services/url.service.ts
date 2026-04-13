import { baseClient } from '../baseClient';

export interface ShortenResponse {
  id: string;
  userId: number | null;
  originalLink: string;
  shortLink: string;
  createdAt: string;
}

export const shortenUrl = async (
  originalLink: string,
): Promise<ShortenResponse> => {
  const { data } = await baseClient.post<ShortenResponse>('/api/v1/urls', {
    originalLink,
  });
  return data;
};

export const getUserLinks = async (): Promise<ShortenResponse[]> => {
  const { data } = await baseClient.get<ShortenResponse[]>('/api/v1/urls', {
    withCredentials: true,
  });
  return data;
};

export const deleteLink = async (id: string): Promise<void> => {
  await baseClient.delete(`/api/v1/urls/${id}`, {
    withCredentials: true,
  });
};
