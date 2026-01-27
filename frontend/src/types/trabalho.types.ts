export interface Trabalho {
  id: string;
  companyId: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  funcionarios: TrabalhoFuncionario[];
  totalPagoCentavos: number;
  lucroCentavos: number;
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TrabalhoFuncionario {
  funcionarioId: string;
  funcionarioNome: string;
  valorPagoCentavos: number;
}
