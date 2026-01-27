import { Request, Response } from 'express';
import { db } from '../config/firebase.config';
import { Funcionario, FuncionarioStats } from '../models/funcionario.model';

export class FuncionarioController {
  // GET /funcionarios - Listar funcionários da empresa
  async list(req: Request, res: Response) {
    try {
      const { companyId } = req.auth;

      const snapshot = await db
        .collection(`companies/${companyId}/funcionarios`)
        .where('deletedAt', '==', null)
        .orderBy('nome')
        .get();

      const funcionarios = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(funcionarios);
    } catch (error) {
      console.error('Error listing funcionarios:', error);
      res.status(500).json({ error: 'Failed to list funcionarios' });
    }
  }

  // GET /funcionarios/:id - Obter funcionário específico
  async get(req: Request, res: Response) {
    try {
      const { companyId } = req.auth;
      const { id } = req.params;

      const doc = await db
        .collection(`companies/${companyId}/funcionarios`)
        .doc(id)
        .get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      const funcionario = doc.data();
      if (funcionario?.deletedAt) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      res.json({ id: doc.id, ...funcionario });
    } catch (error) {
      console.error('Error getting funcionario:', error);
      res.status(500).json({ error: 'Failed to get funcionario' });
    }
  }

  // POST /funcionarios - Criar funcionário
  async create(req: Request, res: Response) {
    try {
      const { companyId, userId } = req.auth;
      const { nome, cpf, telefone } = req.body;

      // Validação
      if (!nome || nome.trim() === '') {
        return res.status(400).json({ error: 'Nome is required' });
      }

      const funcionario: Omit<Funcionario, 'id'> = {
        companyId,
        nome: nome.trim(),
        cpf: cpf?.trim() || undefined,
        telefone: telefone?.trim() || undefined,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      const docRef = await db
        .collection(`companies/${companyId}/funcionarios`)
        .add(funcionario);

      res.status(201).json({ id: docRef.id, ...funcionario });
    } catch (error) {
      console.error('Error creating funcionario:', error);
      res.status(500).json({ error: 'Failed to create funcionario' });
    }
  }

  // PUT /funcionarios/:id - Atualizar funcionário
  async update(req: Request, res: Response) {
    try {
      const { companyId } = req.auth;
      const { id } = req.params;
      const { nome, cpf, telefone, active } = req.body;

      const docRef = db.collection(`companies/${companyId}/funcionarios`).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      const funcionario = doc.data();
      if (funcionario?.deletedAt) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      const updates: Partial<Funcionario> = {
        updatedAt: new Date()
      };

      if (nome !== undefined) {
        if (nome.trim() === '') {
          return res.status(400).json({ error: 'Nome cannot be empty' });
        }
        updates.nome = nome.trim();
      }
      if (cpf !== undefined) updates.cpf = cpf?.trim() || undefined;
      if (telefone !== undefined) updates.telefone = telefone?.trim() || undefined;
      if (active !== undefined) updates.active = active;

      await docRef.update(updates);

      const updated = await docRef.get();
      res.json({ id: updated.id, ...updated.data() });
    } catch (error) {
      console.error('Error updating funcionario:', error);
      res.status(500).json({ error: 'Failed to update funcionario' });
    }
  }

  // DELETE /funcionarios/:id - Soft delete funcionário
  async delete(req: Request, res: Response) {
    try {
      const { companyId } = req.auth;
      const { id } = req.params;

      const docRef = db.collection(`companies/${companyId}/funcionarios`).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      const funcionario = doc.data();
      if (funcionario?.deletedAt) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      await docRef.update({
        deletedAt: new Date(),
        updatedAt: new Date()
      });

      res.json({ message: 'Funcionario deleted successfully' });
    } catch (error) {
      console.error('Error deleting funcionario:', error);
      res.status(500).json({ error: 'Failed to delete funcionario' });
    }
  }

  // GET /funcionarios/:id/stats - Obter estatísticas do funcionário
  async getStats(req: Request, res: Response) {
    try {
      const { companyId } = req.auth;
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      // Verificar se funcionário existe
      const funcionarioDoc = await db
        .collection(`companies/${companyId}/funcionarios`)
        .doc(id)
        .get();

      if (!funcionarioDoc.exists) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      const funcionario = funcionarioDoc.data();
      if (funcionario?.deletedAt) {
        return res.status(404).json({ error: 'Funcionario not found' });
      }

      // Buscar trabalhos do funcionário
      let query = db
        .collection(`companies/${companyId}/trabalhos`)
        .where('deletedAt', '==', null);

      if (startDate) {
        query = query.where('data', '>=', new Date(startDate as string));
      }
      if (endDate) {
        query = query.where('data', '<=', new Date(endDate as string));
      }

      const trabalhosSnapshot = await query.get();

      // Filtrar trabalhos que incluem este funcionário
      const historicoTrabalhos: FuncionarioStats['historicoTrabalhos'] = [];
      let totalRecebidoCentavos = 0;

      trabalhosSnapshot.docs.forEach((doc: any) => {
        const trabalho = doc.data();
        const funcionarioTrabalho = trabalho.funcionarios?.find(
          (f: any) => f.funcionarioId === id
        );

        if (funcionarioTrabalho) {
          historicoTrabalhos.push({
            trabalhoId: doc.id,
            data: trabalho.data.toDate(),
            tipo: trabalho.tipo,
            valorPagoCentavos: funcionarioTrabalho.valorPagoCentavos
          });
          totalRecebidoCentavos += funcionarioTrabalho.valorPagoCentavos;
        }
      });

      const stats: FuncionarioStats = {
        funcionarioId: id,
        funcionarioNome: funcionario.nome,
        totalRecebidoCentavos,
        totalTrabalhos: historicoTrabalhos.length,
        historicoTrabalhos: historicoTrabalhos.sort((a, b) => 
          b.data.getTime() - a.data.getTime()
        )
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting funcionario stats:', error);
      res.status(500).json({ error: 'Failed to get funcionario stats' });
    }
  }
}
