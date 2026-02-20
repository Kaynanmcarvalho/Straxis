/**
 * Controller para integração Agenda → Trabalho
 * Garante idempotência e consistência
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase.config';
import { TrabalhoModel } from '../models/trabalho.model';
import { TrabalhoCompleto } from '../types/trabalho.types';

export class TrabalhoAgendaController {
  /**
   * Aprovar compromisso da agenda e criar trabalho
   * Endpoint: POST /api/trabalhos/from-agenda
   * 
   * Idempotência: usa agendaEventId como chave única
   */
  static async createFromAgenda(req: Request, res: Response) {
    try {
      const { agendaEventId, ...trabalhoDataFromBody } = req.body;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      // Validações
      if (!agendaEventId) {
        return res.status(400).json({
          error: 'agendaEventId é obrigatório para idempotência'
        });
      }

      if (!companyId || !userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      // Verificar se já existe trabalho com este agendaEventId (idempotência)
      const existingQuery = await db
        .collection(`companies/${companyId}/trabalhos`)
        .where('agendaEventId', '==', agendaEventId)
        .where('deletedAt', '==', null)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        const existing = existingQuery.docs[0];
        const trabalhoExistente = TrabalhoModel.fromFirestore(existing.id, existing.data());
        
        return res.status(200).json({
          message: 'Trabalho já existe (idempotência)',
          trabalho: trabalhoExistente,
          isNew: false
        });
      }

      // Buscar dados do evento da agenda
      const agendaDoc = await db
        .doc(`companies/${companyId}/agendamentos/${agendaEventId}`)
        .get();

      if (!agendaDoc.exists) {
        return res.status(404).json({
          error: 'Evento da agenda não encontrado'
        });
      }

      const agendaData = agendaDoc.data();

      // Validar que evento está pendente de aprovação
      if (agendaData?.status !== 'pendente') {
        return res.status(400).json({
          error: `Evento não pode ser aprovado. Status atual: ${agendaData?.status}`
        });
      }

      // Criar trabalho com dados da agenda
      const trabalhoCompleto: Partial<TrabalhoCompleto> = {
        companyId,
        source: 'agenda_approved',
        clienteId: trabalhoDataFromBody.clienteId || agendaData.clienteId,
        clienteNome: trabalhoDataFromBody.clienteNome || agendaData.clienteNome || 'Cliente não informado',
        localDescricao: trabalhoDataFromBody.localDescricao || agendaData.localDescricao || 'Local não informado',
        tipo: trabalhoDataFromBody.tipo || agendaData.tipo || 'descarga',
        tonelagemPrevista: trabalhoDataFromBody.tonelagemPrevista || agendaData.tonelagem || 0,
        tonelagemRealizada: 0,
        scheduledAt: agendaData.data?.toDate() || new Date(),
        assignees: trabalhoDataFromBody.assignees || agendaData.funcionarios || [],
        valorRecebidoCentavos: trabalhoDataFromBody.valorRecebidoCentavos || agendaData.valorEstimadoCentavos || 0,
        totalPagoCentavos: 0,
        lucroCentavos: 0,
        registrosPresenca: [],
        pausas: [],
        historico: [{
          id: Date.now().toString(),
          tipo: 'status_change',
          campo: 'Criação',
          valorAnterior: '-',
          valorNovo: 'Criado a partir da agenda',
          usuario: userId,
          timestamp: new Date()
        }],
        observacoes: trabalhoDataFromBody.observacoes || agendaData.observacoes,
        createdBy: userId,
      };

      // Validar dados
      const errors = TrabalhoModel.validate(trabalhoCompleto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors
        });
      }

      // Criar trabalho
      const trabalho = TrabalhoModel.create(trabalhoCompleto);
      const trabalhoRef = db.collection(`companies/${companyId}/trabalhos`).doc();
      trabalho.id = trabalhoRef.id;

      // Salvar com agendaEventId para idempotência
      const trabalhoDataToSave = {
        ...TrabalhoModel.toFirestore(trabalho),
        agendaEventId // Campo adicional para idempotência
      };

      await trabalhoRef.set(trabalhoDataToSave);

      // Atualizar status do evento da agenda
      await db
        .doc(`companies/${companyId}/agendamentos/${agendaEventId}`)
        .update({
          status: 'confirmado',
          trabalhoId: trabalhoRef.id,
          confirmedAt: new Date(),
          confirmedBy: userId,
          updatedAt: new Date()
        });

      return res.status(201).json({
        message: 'Trabalho criado com sucesso a partir da agenda',
        trabalho,
        isNew: true
      });

    } catch (error) {
      console.error('Erro ao criar trabalho da agenda:', error);
      return res.status(500).json({
        error: 'Erro ao criar trabalho',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Cancelar aprovação e reverter trabalho
   * Endpoint: DELETE /api/trabalhos/from-agenda/:agendaEventId
   */
  static async cancelFromAgenda(req: Request, res: Response) {
    try {
      const { agendaEventId } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      // Buscar trabalho vinculado
      const trabalhoQuery = await db
        .collection(`companies/${companyId}/trabalhos`)
        .where('agendaEventId', '==', agendaEventId)
        .where('deletedAt', '==', null)
        .limit(1)
        .get();

      if (trabalhoQuery.empty) {
        return res.status(404).json({
          error: 'Trabalho não encontrado'
        });
      }

      const trabalhoDoc = trabalhoQuery.docs[0];
      const trabalho = TrabalhoModel.fromFirestore(trabalhoDoc.id, trabalhoDoc.data());

      // Validar que trabalho não foi iniciado
      if (trabalho.startedAt) {
        return res.status(400).json({
          error: 'Trabalho já foi iniciado e não pode ser cancelado'
        });
      }

      // Soft delete do trabalho
      await trabalhoDoc.ref.update({
        deletedAt: new Date(),
        updatedAt: new Date(),
        deletedBy: userId
      });

      // Reverter status da agenda
      await db
        .doc(`companies/${companyId}/agendamentos/${agendaEventId}`)
        .update({
          status: 'pendente',
          trabalhoId: null,
          confirmedAt: null,
          confirmedBy: null,
          updatedAt: new Date()
        });

      return res.status(200).json({
        message: 'Aprovação cancelada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao cancelar aprovação:', error);
      return res.status(500).json({
        error: 'Erro ao cancelar aprovação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
