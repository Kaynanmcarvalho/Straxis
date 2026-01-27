export interface Agendamento {
  id: string;
  companyId: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorEstimadoCentavos: number;
  funcionarios: string[];
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
