export interface Show {
  id: number;
  contratanteId: number;
  contratanteNome: string;
  contratanteTelefone?: string;
  localId: number;
  localNome: string;
  localEndereco?: string;
  data: string;
  hora: string;
  duracao: string;
  valorCobrado: number;
  pago: boolean;
  dataPagamento?: string;
  formaPagamento: string;
  estilosSolicitados: string[];
  necessitaNotaFiscal: boolean;
  notaEmitida: boolean;
  createdAt: string;
}

export interface Contratante {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  createdAt?: string;
}

export interface Local {
  id: number;
  nome: string;
  endereco?: string;
  cidade?: string;
  createdAt?: string;
}

export interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  shows: Show[];
}

export interface Stats {
  total: number;
  pagos: number;
  pendentes: number;
  receita: number;
}

export interface PeriodGroup {
  label: string;
  shows: Show[];
}
