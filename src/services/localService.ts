import { Local } from '../models';
import { api } from './api';

const baseUrl = '/api/locais';

export const localService = {
  list: (): Promise<Local[]> => api.get<Local[]>(baseUrl),

  search: (term: string): Promise<Local[]> =>
    api.get<Local[]>(`${baseUrl}?search=${encodeURIComponent(term)}`),

  getById: (id: number): Promise<Local> =>
    api.get<Local>(`${baseUrl}/${id}`),

  create: (data: Partial<Local>): Promise<Local> =>
    api.post<Local>(baseUrl, data),

  update: (data: Local): Promise<Local> =>
    api.put<Local>(`${baseUrl}/${data.id}`, data),

  delete: (id: number): Promise<void> =>
    api.delete<void>(`${baseUrl}/${id}`),
};
