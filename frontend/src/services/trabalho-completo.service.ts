/**
 * Service para Trabalhos com Schema Correto
 * Substitui trabalho.service.ts antigo
 */

import { db } from '../config/firebase.config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';

export type TrabalhoSource = 'manual' | 'agenda_approved';

export type TrabalhoStatus = 
  | 'rascunho'
  | 'agendado'
  | 'pronto'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'
  | 'cancelado'
  | 'bloqueado';

export type TrabalhoPriority = 'normal' | 'alta' | 'critica';

export interface TrabalhoPausa {
  inicio: Date;
  fim?: Date;
  motivo: string;
  registradoPor: string;
}

export interface TrabalhoRegistroPresenca {
  funcionarioId: string;
  funcionarioNome: string;
  tipo: 'presente_integral' | 'meia_diaria' | 'falta_total' | 'atraso' | 'saida_antecipada';
  horarioEntrada?: string;
  horarioSaida?: string;
  observacao?: string;
  registradoEm: Date;
  registradoPor: string;
}

export interface TrabalhoHistorico {
  id: string;
  tipo: 'status_change' | 'tonelagem_change' | 'equipe_change' | 'presenca_change' | 'pausa' | 'retomada';
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  usuario: string;
  timestamp: Date;
}

export interface TrabalhoCompleto {
  id: string;
  companyId: string;
  source: TrabalhoSource;
  status: TrabalhoStatus;
  priority: TrabalhoPriority;
  clienteId?: string;
  clienteNome: string;
  localDescricao: string;
  tipo: 'carga' | 'descarga';
  tonelagemPrevista: number;
  tonelagemRealizada: number;
  scheduledAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  slaDueAt?: Date;
  assignees: string[];
  registrosPresenca: TrabalhoRegistroPresenca[];
  pausas: TrabalhoPausa[];
  valorRecebidoCentavos: number;
  totalPagoCentavos: number;
  lucroCentavos: number;
  historico: TrabalhoHistorico[];
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class TrabalhoCompletoService {
  private getCompanyId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.companyId || 'dev-company-id';
  }

  private getUserId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.uid || 'anonymous';
  }

  private fromFirestore(id: string, data: any): TrabalhoCompleto {
    return {
      id,
      companyId: data.companyId,
      source: data.source || 'manual',
      status: data.status || 'rascunho',
      priority: data.priority || 'normal',
      clienteId: data.clienteId,
      clienteNome: data.clienteNome || '',
      localDescricao: data.localDescricao || '',
      tipo: data.tipo,
      tonelagemPrevista: data.tonelagemPrevista || data.tonelagem || 0,
      tonelagemRealizada: data.tonelagemRealizada || 0,
      scheduledAt: data.scheduledAt?.toDate(),
      startedAt: data.startedAt?.toDate(),
      finishedAt: data.finishedAt?.toDate(),
      slaDueAt: data.slaDueAt?.toDate(),
      assignees: data.assignees || [],
      registrosPresenca: (data.registrosPresenca || []).map((r: any) => ({
        ...r,
        registradoEm: r.registradoEm?.toDate() || new Date()
      })),
      pausas: (data.pausas || []).map((p: any) => ({
        ...p,
        inicio: p.inicio?.toDate() || new Date(),
        fim: p.fim?.toDate()
      })),
      valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
      totalPagoCentavos: data.totalPagoCentavos || 0,
      lucroCentavos: data.lucroCentavos || 0,
      historico: (data.historico || []).map((h: any) => ({
        ...h,
        timestamp: h.timestamp?.toDate() || new Date()
      })),
      observacoes: data.observacoes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
    };
  }

  async list(): Promise<TrabalhoCompleto[]> {
    const companyId = this.getCompanyId();
    const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
    const q = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.fromFirestore(doc.id, doc.data()));
  }

  async getById(id: string): Promise<TrabalhoCompleto | null> {
    const companyId = this.getCompanyId();
    const docRef = doc(db, `companies/${companyId}/trabalhos`, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return this.fromFirestore(docSnap.id, docSnap.data());
  }

  async create(data: Partial<TrabalhoCompleto>): Promise<TrabalhoCompleto> {
    const companyId = this.getCompanyId();
    const userId = this.getUserId();
    const now = new Date();

    const trabalhoData = {
      companyId,
      source: data.source || 'manual',
      status: 'rascunho',
      priority: 'normal',
      clienteId: data.clienteId || null,
      clienteNome: data.clienteNome || '',
      localDescricao: data.localDescricao || '',
      tipo: data.tipo || 'descarga',
      tonelagemPrevista: data.tonelagemPrevista || 0,
      tonelagemRealizada: 0,
      scheduledAt: data.scheduledAt || null,
      startedAt: null,
      finishedAt: null,
      slaDueAt: null,
      assignees: [],
      registrosPresenca: [],
      pausas: [],
      valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
      totalPagoCentavos: 0,
      lucroCentavos: 0,
      historico: [{
        id: Date.now().toString(),
        tipo: 'status_change',
        campo: 'Criação',
        valorAnterior: '-',
        valorNovo: 'Trabalho criado',
        usuario: userId,
        timestamp: Timestamp.fromDate(now)
      }],
      observacoes: data.observacoes || null,
      createdBy: userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      deletedAt: null,
    };

    const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
    const docRef = await addDoc(trabalhosRef, trabalhoData);
    
    const created = await this.getById(docRef.id);
    if (!created) throw new Error('Erro ao buscar trabalho criado');
    
    return created;
  }

  async update(id: string, updates: Partial<TrabalhoCompleto>): Promise<void> {
    const companyId = this.getCompanyId();
    const docRef = doc(db, `companies/${companyId}/trabalhos`, id);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Converter datas para Timestamp
    if (updates.scheduledAt) updateData.scheduledAt = Timestamp.fromDate(updates.scheduledAt);
    if (updates.startedAt) updateData.startedAt = Timestamp.fromDate(updates.startedAt);
    if (updates.finishedAt) updateData.finishedAt = Timestamp.fromDate(updates.finishedAt);

    await updateDoc(docRef, updateData);
  }

  async delete(id: string): Promise<void> {
    const companyId = this.getCompanyId();
    const userId = this.getUserId();
    const docRef = doc(db, `companies/${companyId}/trabalhos`, id);

    await updateDoc(docRef, {
      deletedAt: Timestamp.fromDate(new Date()),
      deletedBy: userId,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async iniciar(id: string): Promise<void> {
    const trabalho = await this.getById(id);
    if (!trabalho) throw new Error('Trabalho não encontrado');

    if (trabalho.startedAt) {
      throw new Error('Trabalho já foi iniciado');
    }

    await this.update(id, {
      startedAt: new Date(),
      status: 'em_andamento',
      historico: [
        ...trabalho.historico,
        {
          id: Date.now().toString(),
          tipo: 'status_change',
          campo: 'Status',
          valorAnterior: trabalho.status,
          valorNovo: 'em_andamento',
          usuario: this.getUserId(),
          timestamp: new Date()
        }
      ]
    });
  }

  async pausar(id: string, motivo: string): Promise<void> {
    const trabalho = await this.getById(id);
    if (!trabalho) throw new Error('Trabalho não encontrado');

    const novaPausa: TrabalhoPausa = {
      inicio: new Date(),
      motivo,
      registradoPor: this.getUserId()
    };

    await this.update(id, {
      status: 'pausado',
      pausas: [...trabalho.pausas, novaPausa],
      historico: [
        ...trabalho.historico,
        {
          id: Date.now().toString(),
          tipo: 'pausa',
          campo: 'Status',
          valorAnterior: 'em_andamento',
          valorNovo: `pausado (${motivo})`,
          usuario: this.getUserId(),
          timestamp: new Date()
        }
      ]
    });
  }

  async retomar(id: string): Promise<void> {
    const trabalho = await this.getById(id);
    if (!trabalho) throw new Error('Trabalho não encontrado');

    const pausasAtualizadas = [...trabalho.pausas];
    if (pausasAtualizadas.length > 0) {
      const ultimaPausa = pausasAtualizadas[pausasAtualizadas.length - 1];
      if (!ultimaPausa.fim) {
        ultimaPausa.fim = new Date();
      }
    }

    await this.update(id, {
      status: 'em_andamento',
      pausas: pausasAtualizadas,
      historico: [
        ...trabalho.historico,
        {
          id: Date.now().toString(),
          tipo: 'retomada',
          campo: 'Status',
          valorAnterior: 'pausado',
          valorNovo: 'em_andamento',
          usuario: this.getUserId(),
          timestamp: new Date()
        }
      ]
    });
  }

  async finalizar(id: string): Promise<void> {
    const trabalho = await this.getById(id);
    if (!trabalho) throw new Error('Trabalho não encontrado');

    if (trabalho.finishedAt) {
      throw new Error('Trabalho já foi finalizado');
    }

    await this.update(id, {
      finishedAt: new Date(),
      status: 'concluido',
      historico: [
        ...trabalho.historico,
        {
          id: Date.now().toString(),
          tipo: 'status_change',
          campo: 'Status',
          valorAnterior: trabalho.status,
          valorNovo: 'concluido',
          usuario: this.getUserId(),
          timestamp: new Date()
        }
      ]
    });
  }
}

export const trabalhoCompletoService = new TrabalhoCompletoService();
