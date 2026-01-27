import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';
import { User } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        companyId: string;
        role: string;
        user: User;
      };
    }
  }
}

/**
 * Middleware de autenticação
 * Valida token Firebase e extrai dados do usuário
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // MODO DESENVOLVIMENTO - Bypass de autenticação
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      req.auth = {
        userId: 'dev-user-id',
        companyId: 'dev-company-id',
        role: 'admin_platform',
        user: {
          id: 'dev-user-id',
          email: 'dev@straxis.com',
          name: 'Desenvolvedor',
          role: 'admin_platform',
          companyId: 'dev-company-id',
          active: true,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User,
      };
      next();
      return;
    }

    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token não fornecido',
        code: 1001,
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token
    const { uid } = await AuthService.verifyToken(token);

    // Buscar contexto do usuário
    const userContext = await AuthService.getUserContext(uid);

    // Adicionar ao request
    req.auth = userContext;

    // Registrar log de acesso
    await LogService.logAccess(
      userContext.userId,
      userContext.companyId,
      `Acesso ao endpoint: ${req.method} ${req.path}`,
      {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    );

    next();
  } catch (error: any) {
    if (error.message === 'Token inválido ou expirado') {
      res.status(401).json({
        error: error.message,
        code: 1001,
      });
      return;
    }

    if (error.message === 'Usuário não encontrado') {
      res.status(404).json({
        error: error.message,
        code: 3003,
      });
      return;
    }

    if (error.message === 'Usuário inativo') {
      res.status(403).json({
        error: error.message,
        code: 1004,
      });
      return;
    }

    res.status(500).json({
      error: 'Erro ao autenticar',
      code: 4003,
    });
  }
};

/**
 * Middleware para verificar se usuário é Admin da Plataforma
 */
export const requireAdminPlatform = (
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

  if (req.auth.role !== 'admin_platform') {
    res.status(403).json({
      error: 'Acesso negado. Apenas Admin da Plataforma pode acessar.',
      code: 1003,
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar se usuário é Dono da Empresa
 */
export const requireOwner = (
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

  if (req.auth.role !== 'owner' && req.auth.role !== 'admin_platform') {
    res.status(403).json({
      error: 'Acesso negado. Apenas Dono da Empresa pode acessar.',
      code: 1003,
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (module: string, action: 'read' | 'write' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        error: 'Não autenticado',
        code: 1001,
      });
      return;
    }

    // Admin sempre tem permissão
    if (req.auth.role === 'admin_platform') {
      next();
      return;
    }

    // Verificar permissões do usuário
    const hasPermission = req.auth.user.permissions.some(
      (perm) => perm.module === module && perm.actions.includes(action)
    );

    if (!hasPermission) {
      res.status(403).json({
        error: `Sem permissão para ${action} em ${module}`,
        code: 1003,
      });
      return;
    }

    next();
  };
};
