/**
 * Testes E2E - Fluxo Agenda → Trabalho
 * 
 * Testa o fluxo completo de aprovação de agendamento
 * e criação de trabalho operacional
 */

import request from 'supertest';
import app from '../app';

describe('E2E: Fluxo Agenda → Trabalho', () => {
  let authToken: string;
  let companyId: string;
  let agendaEventId: string;
  let trabalhoId: string;

  beforeAll(async () => {
    // TODO: Setup de autenticação e empresa de teste
    authToken = 'test-token';
    companyId = 'test-company-id';
  });

  describe('POST /api/trabalhos/from-agenda', () => {
    it('deve criar trabalho a partir de agendamento aprovado', async () => {
      agendaEventId = `agenda-${Date.now()}`;
      
      const response = await request(app)
        .post('/api/trabalhos/from-agenda')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agendaEventId,
          clienteId: 'cliente-123',
          clienteNome: 'Cliente Teste',
          tipo: 'descarga',
          tonelagemPrevista: 50,
          localDescricao: 'Galpão A',
          scheduledAt: new Date().toISOString(),
          observacoes: 'Teste E2E'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.source).toBe('agenda_approved');
      expect(response.body.data.agendaEventId).toBe(agendaEventId);
      
      trabalhoId = response.body.data.id;
    });

    it('deve ser idempotente - não criar duplicado', async () => {
      const response = await request(app)
        .post('/api/trabalhos/from-agenda')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agendaEventId,
          clienteId: 'cliente-123',
          clienteNome: 'Cliente Teste',
          tipo: 'descarga',
          tonelagemPrevista: 50,
          localDescricao: 'Galpão A',
          scheduledAt: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('já existe');
      expect(response.body.data.id).toBe(trabalhoId);
    });

    it('deve rejeitar sem agendaEventId', async () => {
      const response = await request(app)
        .post('/api/trabalhos/from-agenda')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clienteNome: 'Cliente Teste',
          tipo: 'descarga',
          tonelagemPrevista: 50
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trabalhos/from-agenda/:agendaEventId', () => {
    it('deve cancelar aprovação e soft-delete trabalho', async () => {
      const response = await request(app)
        .delete(`/api/trabalhos/from-agenda/${agendaEventId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelada');
    });

    it('deve retornar 404 para agendaEventId inexistente', async () => {
      const response = await request(app)
        .delete('/api/trabalhos/from-agenda/inexistente-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Fluxo Completo: Criar → Iniciar → Pausar → Retomar → Finalizar', () => {
    let trabalhoFluxoId: string;

    it('1. Criar trabalho', async () => {
      const response = await request(app)
        .post('/api/trabalhos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clienteNome: 'Cliente Fluxo',
          tipo: 'carga',
          tonelagemPrevista: 30,
          localDescricao: 'Pátio B'
        });

      expect(response.status).toBe(201);
      trabalhoFluxoId = response.body.data.id;
    });

    it('2. Iniciar trabalho', async () => {
      const response = await request(app)
        .post(`/api/trabalhos/${trabalhoFluxoId}/iniciar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('3. Pausar trabalho', async () => {
      const response = await request(app)
        .post(`/api/trabalhos/${trabalhoFluxoId}/pausar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Almoço' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('4. Retomar trabalho', async () => {
      const response = await request(app)
        .post(`/api/trabalhos/${trabalhoFluxoId}/retomar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('5. Finalizar trabalho', async () => {
      const response = await request(app)
        .post(`/api/trabalhos/${trabalhoFluxoId}/finalizar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('6. Não deve permitir iniciar trabalho já finalizado', async () => {
      const response = await request(app)
        .post(`/api/trabalhos/${trabalhoFluxoId}/iniciar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
