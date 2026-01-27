export interface Funcionario {
  id: string;
  companyId: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FuncionarioStats {
  funcionarioId: string;
  funcionarioNome: string;
  totalRecebidoCentavos: number;
  totalTrabalhos: number;
  historicoTrabalhos: {
    trabalhoId: string;
    data: Date;
    tipo: 'carga' | 'descarga';
    valorPagoCentavos: number;
  }[];
}
