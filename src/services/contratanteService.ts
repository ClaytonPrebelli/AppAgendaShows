import { Contratante } from '../models';
import { api } from './api';

const baseUrl = '/api/contratantes';

export const contratanteService = {
  list: (): Promise<Contratante[]> => api.get<Contratante[]>(baseUrl),

  search: (term: string): Promise<Contratante[]> =>
    api.get<Contratante[]>(`${baseUrl}?search=${encodeURIComponent(term)}`),

  getById: (id: number): Promise<Contratante> =>
    api.get<Contratante>(`${baseUrl}/${id}`),

  create: (data: Partial<Contratante>): Promise<Contratante> =>
    api.post<Contratante>(baseUrl, data),

  update: (data: Contratante): Promise<Contratante> =>
    api.put<Contratante>(`${baseUrl}/${data.id}`, data),

  delete: (id: number): Promise<void> =>
    api.delete<void>(`${baseUrl}/${id}`),
};
