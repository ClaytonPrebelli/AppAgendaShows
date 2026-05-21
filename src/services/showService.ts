import { Show } from '../models';
import { api } from './api';

const baseUrl = '/api/shows';

function fromApi(data: any): Show {
  return {
    id: data.id,
    contratanteId: data.contratante?.id ?? data.contratanteId,
    contratanteNome: data.contratante?.nome || '',
    contratanteTelefone: data.contratante?.telefone || undefined,
    localId: data.local?.id ?? data.localId,
    localNome: data.local?.nome || '',
    localEndereco: data.local?.endereco || undefined,
    data: data.data ? data.data.split('T')[0] : data.data,
    hora: data.hora,
    duracao: data.duracao,
    valorCobrado: Number(data.valorCobrado),
    pago: data.pago,
    dataPagamento: data.dataPagamento ? data.dataPagamento.split('T')[0] : data.dataPagamento,
    formaPagamento: data.formaPagamento,
    estilosSolicitados:
      typeof data.estilosSolicitados === 'string'
        ? JSON.parse(data.estilosSolicitados || '[]')
        : data.estilosSolicitados,
    necessitaNotaFiscal: data.necessitaNotaFiscal ?? false,
    notaEmitida: data.notaEmitida ?? false,
    createdAt: data.createdAt,
  };
}

export const showService = {
  list: (mes?: number, ano?: number): Promise<Show[]> => {
    const params = new URLSearchParams();
    if (mes !== undefined) params.set('mes', String(mes));
    if (ano !== undefined) params.set('ano', String(ano));
    const qs = params.toString();
    return api.get<any[]>(`${baseUrl}${qs ? `?${qs}` : ''}`).then(shows =>
      shows.map(fromApi)
    );
  },

  getById: (id: number): Promise<Show> =>
    api.get<any>(`${baseUrl}/${id}`).then(fromApi),

  create: (show: Omit<Show, 'id' | 'createdAt'>): Promise<Show> =>
    api.post<any>(baseUrl, show).then(fromApi),

  update: (show: Show): Promise<Show> =>
    api.put<any>(`${baseUrl}/${show.id}`, show).then(fromApi),

  delete: (id: number): Promise<void> =>
    api.delete<void>(`${baseUrl}/${id}`),

  togglePago: (id: number): Promise<Show> =>
    api.patch<any>(`${baseUrl}/${id}/toggle-pago`).then(fromApi),
};
