import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { AgendamentoModel } from '../models/agendamento.model';
import { DisponibilidadeService } from '../services/disponibilidade.service';
import { AgendamentoConversaoService } from '../services/agendamento-conversao.service';
import { Agendamento } from '../types';

export class AgendamentoController {
  static async list(req: Request, res: Response) {
    try {
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({ error: 'CompanyId é obrigatório' });
        return;
      }

      const { status, origem } = req.query;

      const filters: any[] = [
        { field: 'deletedAt', operator: '==', value: null }
      ];

      if (status) {
        filters.push({ field: 'status', operator: '==', value: status });
      }

      if (origem) {
        filters.push({ field: 'origem', operator: '==', value: origem });
      }

      const agendamentos = await FirestoreService.querySubcollection<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        filters
      );

      agendamentos.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      res.json(agendamentos);
    } catch (error: any) {
      console.error('Erro ao listar agendamentos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({ error: 'CompanyId é obrigatório' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      res.json(agendamento);
    } catch (error: any) {
      console.error('Erro ao buscar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        res.status(400).json({ error: 'CompanyId e userId são obrigatórios' });
        return;
      }

      const data = req.body;

      const agendamentoData = AgendamentoModel.create({
        ...data,
        companyId,
        solicitadoPor: userId,
        createdBy: userId,
        status: 'pendente',
        origem: data.origem || 'manual',
      });

      const errors = AgendamentoModel.validate(agendamentoData);
      if (errors.length > 0) {
        res.status(400).json({ error: 'Validação falhou', errors });
        return;
      }

      const disponibilidade = await DisponibilidadeService.verificarDisponibilidade(
        companyId,
        data.horarioInicio,
        data.horarioFim,
        data.tonelagem
      );

      if (!disponibilidade.disponivel) {
        agendamentoData.conflitoDetectado = true;
        agendamentoData.conflitos = disponibilidade.conflitos;
      }

      const id = await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        AgendamentoModel.toFirestore(agendamentoData)
      );

      const created = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      res.status(201).json({
        ...created,
        disponibilidade
      });
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        res.status(400).json({ error: 'CompanyId e userId são obrigatórios' });
        return;
      }

      const data = req.body;

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      const updateData = {
        ...data,
        updatedAt: new Date(),
        historico: [
          ...(agendamento.historico || []),
          {
            acao: 'atualizacao',
            userId,
            timestamp: new Date(),
            detalhes: 'Agendamento atualizado'
          }
        ]
      };

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        id,
        updateData
      );

      const updated = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        res.status(400).json({ error: 'CompanyId e userId são obrigatórios' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        id,
        {
          deletedAt: new Date(),
          updatedAt: new Date(),
          historico: [
            ...(agendamento.historico || []),
            {
              acao: 'exclusao',
              userId,
              timestamp: new Date(),
              detalhes: 'Agendamento excluído'
            }
          ]
        }
      );

      res.json({ message: 'Agendamento excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async verificarDisponibilidade(req: Request, res: Response) {
    try {
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({ error: 'CompanyId é obrigatório' });
        return;
      }

      const { horarioInicio, horarioFim, tonelagem } = req.query;

      if (!horarioInicio || !horarioFim) {
        return res.status(400).json({ error: 'horarioInicio e horarioFim são obrigatórios' });
      }

      const disponibilidade = await DisponibilidadeService.verificarDisponibilidade(
        companyId,
        new Date(horarioInicio as string),
        new Date(horarioFim as string),
        tonelagem ? Number(tonelagem) : undefined
      );

      res.json(disponibilidade);
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async aprovar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;
      const role = req.auth?.role;

      if (!companyId || !userId || !role) {
        res.status(400).json({ error: 'Dados de autenticação incompletos' });
        return;
      }

      if (!['admin_platform', 'owner', 'admin'].includes(role)) {
        res.status(403).json({ error: 'Sem permissão para aprovar agendamentos' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      if (agendamento.status !== 'pendente') {
        res.status(400).json({ error: 'Apenas agendamentos pendentes podem ser aprovados' });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        id,
        {
          status: 'aprovado',
          aprovadoPor: userId,
          aprovadoEm: new Date(),
          updatedAt: new Date(),
          historico: [
            ...(agendamento.historico || []),
            {
              acao: 'aprovacao',
              userId,
              timestamp: new Date(),
              detalhes: 'Agendamento aprovado'
            }
          ]
        }
      );

      const updated = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao aprovar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async rejeitar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;
      const role = req.auth?.role;

      if (!companyId || !userId || !role) {
        res.status(400).json({ error: 'Dados de autenticação incompletos' });
        return;
      }

      if (!['admin_platform', 'owner', 'admin'].includes(role)) {
        res.status(403).json({ error: 'Sem permissão para rejeitar agendamentos' });
        return;
      }

      if (!motivo) {
        res.status(400).json({ error: 'Motivo da rejeição é obrigatório' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      if (agendamento.status !== 'pendente') {
        res.status(400).json({ error: 'Apenas agendamentos pendentes podem ser rejeitados' });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        id,
        {
          status: 'rejeitado',
          rejeitadoPor: userId,
          rejeitadoEm: new Date(),
          motivoRejeicao: motivo,
          updatedAt: new Date(),
          historico: [
            ...(agendamento.historico || []),
            {
              acao: 'rejeicao',
              userId,
              timestamp: new Date(),
              detalhes: `Agendamento rejeitado: ${motivo}`
            }
          ]
        }
      );

      const updated = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao rejeitar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async converter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;
      const role = req.auth?.role;

      if (!companyId || !userId || !role) {
        res.status(400).json({ error: 'Dados de autenticação incompletos' });
        return;
      }

      if (!['admin_platform', 'owner', 'admin'].includes(role)) {
        res.status(403).json({ error: 'Sem permissão para converter agendamentos' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      const trabalho = await AgendamentoConversaoService.converterEmTrabalho(id, userId);

      res.json({
        message: 'Agendamento convertido em trabalho com sucesso',
        trabalhoId: trabalho.id,
        trabalho
      });
    } catch (error: any) {
      console.error('Erro ao converter agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        res.status(400).json({ error: 'CompanyId e userId são obrigatórios' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'Status é obrigatório' });
        return;
      }

      const validStatuses = ['solicitado', 'pendente', 'aprovado', 'rejeitado', 'reagendado', 'cancelado', 'convertido'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Status inválido' });
        return;
      }

      const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      if (!agendamento) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'agendamentos',
        id,
        {
          status,
          updatedAt: new Date(),
          historico: [
            ...(agendamento.historico || []),
            {
              acao: 'mudanca_status',
              userId,
              timestamp: new Date(),
              detalhes: `Status alterado para: ${status}`
            }
          ]
        }
      );

      const updated = await FirestoreService.getSubcollectionDoc<Agendamento>(
        'companies',
        companyId,
        'agendamentos',
        id
      );

      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
