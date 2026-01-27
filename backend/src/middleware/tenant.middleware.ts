import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { EmpresaModel } from '../models/empresa.model';

/**
 * Middleware de isolamento multi-tenant
 * Valida que o usuário pertence à empresa e que o plano está ativo
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({
        error: 'Não autenticado',
        code: 1001,
      });
      return;
    }

    // Admin da plataforma tem acesso a todas as empresas
    if (req.auth.role === 'admin_platform') {
      next();
      return;
    }

    const { companyId } = req.auth;

    // Buscar dados da empresa
    const companyDoc = await db.collection('companies').doc(companyId).get();

    if (!companyDoc.exists) {
      res.status(404).json({
        error: 'Empresa não encontrada',
        code: 3003,
      });
      return;
    }

    const company = EmpresaModel.fromFirestore(companyId, companyDoc.data());

    // Verificar se empresa está ativa
    if (!company.active) {
      res.status(403).json({
        error: 'Empresa inativa. Entre em contato com o administrador.',
        code: 3004,
      });
      return;
    }

    // Verificar se plano está vencido
    if (!EmpresaModel.isPlanActive(company)) {
      res.status(403).json({
        error: 'Plano da empresa expirou. Entre em contato com o administrador.',
        code: 3001,
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao validar tenant',
      code: 4003,
    });
  }
};

/**
 * Middleware para validar que o companyId do recurso pertence ao usuário
 * Usado em rotas que recebem companyId como parâmetro
 */
export const validateCompanyAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.auth) {
    res.status(401).json({
      error: 'Não autenticado',
      code: 1001,
    });
    return;
  }

  // Admin da plataforma tem acesso a todas as empresas
  if (req.auth.role === 'admin_platform') {
    next();
    return;
  }

  // Extrair companyId do parâmetro ou body
  const requestedCompanyId = req.params.companyId || req.body.companyId;

  if (!requestedCompanyId) {
    res.status(400).json({
      error: 'CompanyId não fornecido',
      code: 2001,
    });
    return;
  }

  // Verificar se o companyId do usuário corresponde ao solicitado
  if (req.auth.companyId !== requestedCompanyId) {
    res.status(403).json({
      error: 'Acesso negado. Você não tem permissão para acessar dados desta empresa.',
      code: 1003,
    });
    return;
  }

  next();
};

/**
 * Middleware para adicionar filtro automático de companyId em queries
 * Garante que queries sempre filtrem pelo companyId do usuário
 */
export const addCompanyFilter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.auth) {
    res.status(401).json({
      error: 'Não autenticado',
      code: 1001,
    });
    return;
  }

  // Admin da plataforma não precisa de filtro
  if (req.auth.role === 'admin_platform') {
    next();
    return;
  }

  // Adicionar companyId ao query params
  req.query.companyId = req.auth.companyId;

  next();
};
