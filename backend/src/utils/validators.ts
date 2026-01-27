// Validadores para todos os modelos do sistema

// ============================================
// Funções de Conversão Monetária
// ============================================

/**
 * Converte valor em reais para centavos
 * @param reais - Valor em reais (ex: 150.50)
 * @returns Valor em centavos (ex: 15050)
 */
export function reaisToCentavos(reais: number): number {
  if (typeof reais !== 'number' || isNaN(reais)) {
    throw new Error('Valor inválido: deve ser um número');
  }
  
  if (reais < 0) {
    throw new Error('Valor não pode ser negativo');
  }
  
  // Multiplicar por 100 e arredondar para evitar problemas de ponto flutuante
  return Math.round(reais * 100);
}

/**
 * Converte valor em centavos para reais
 * @param centavos - Valor em centavos (ex: 15050)
 * @returns Valor em reais (ex: 150.50)
 */
export function centavosToReais(centavos: number): number {
  if (typeof centavos !== 'number' || isNaN(centavos)) {
    throw new Error('Valor inválido: deve ser um número');
  }
  
  if (!Number.isInteger(centavos)) {
    throw new Error('Centavos deve ser um número inteiro');
  }
  
  if (centavos < 0) {
    throw new Error('Valor não pode ser negativo');
  }
  
  // Dividir por 100
  return centavos / 100;
}

/**
 * Formata valor em centavos para exibição em reais
 * @param centavos - Valor em centavos (ex: 15050)
 * @param locale - Locale para formatação (padrão: pt-BR)
 * @returns String formatada (ex: "R$ 150,50")
 */
export function formatCurrency(centavos: number, locale: string = 'pt-BR'): string {
  if (typeof centavos !== 'number' || isNaN(centavos)) {
    return 'R$ 0,00';
  }
  
  if (!Number.isInteger(centavos)) {
    throw new Error('Centavos deve ser um número inteiro');
  }
  
  const reais = centavosToReais(centavos);
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

/**
 * Valida se um valor monetário em centavos é válido
 * @param centavos - Valor em centavos
 * @returns true se válido, false caso contrário
 */
export function isValidCentavos(centavos: any): boolean {
  return (
    typeof centavos === 'number' &&
    !isNaN(centavos) &&
    Number.isInteger(centavos) &&
    centavos >= 0
  );
}

// ============================================
// Validadores de Estrutura
// ============================================

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validador de Trabalho
export function validateTrabalho(data: any): ValidationResult {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.data) errors.push('Campo "data" é obrigatório');
  if (!data.tipo) errors.push('Campo "tipo" é obrigatório');
  if (data.tonelagem === undefined) errors.push('Campo "tonelagem" é obrigatório');
  if (data.valorRecebidoCentavos === undefined) errors.push('Campo "valorRecebidoCentavos" é obrigatório');
  if (!data.funcionarios || !Array.isArray(data.funcionarios)) {
    errors.push('Campo "funcionarios" é obrigatório e deve ser um array');
  }

  // Validações de tipo
  if (data.tipo && !['carga', 'descarga'].includes(data.tipo)) {
    errors.push('Campo "tipo" deve ser "carga" ou "descarga"');
  }

  // Validações de valor
  if (data.tonelagem !== undefined && data.tonelagem <= 0) {
    errors.push('Campo "tonelagem" deve ser maior que zero');
  }

  if (data.valorRecebidoCentavos !== undefined) {
    if (!Number.isInteger(data.valorRecebidoCentavos)) {
      errors.push('Campo "valorRecebidoCentavos" deve ser um integer');
    }
    if (data.valorRecebidoCentavos < 0) {
      errors.push('Campo "valorRecebidoCentavos" não pode ser negativo');
    }
  }

  // Validar funcionários
  if (Array.isArray(data.funcionarios)) {
    data.funcionarios.forEach((func: any, index: number) => {
      if (!func.funcionarioId) {
        errors.push(`Funcionário ${index + 1}: "funcionarioId" é obrigatório`);
      }
      if (!func.funcionarioNome) {
        errors.push(`Funcionário ${index + 1}: "funcionarioNome" é obrigatório`);
      }
      if (func.valorPagoCentavos === undefined) {
        errors.push(`Funcionário ${index + 1}: "valorPagoCentavos" é obrigatório`);
      }
      if (func.valorPagoCentavos !== undefined && !Number.isInteger(func.valorPagoCentavos)) {
        errors.push(`Funcionário ${index + 1}: "valorPagoCentavos" deve ser um integer`);
      }
      if (func.valorPagoCentavos !== undefined && func.valorPagoCentavos < 0) {
        errors.push(`Funcionário ${index + 1}: "valorPagoCentavos" não pode ser negativo`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de Agendamento
export function validateAgendamento(data: any): ValidationResult {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.data) errors.push('Campo "data" é obrigatório');
  if (!data.tipo) errors.push('Campo "tipo" é obrigatório');
  if (data.tonelagem === undefined) errors.push('Campo "tonelagem" é obrigatório');
  if (data.valorEstimadoCentavos === undefined) errors.push('Campo "valorEstimadoCentavos" é obrigatório');

  // Validações de tipo
  if (data.tipo && !['carga', 'descarga'].includes(data.tipo)) {
    errors.push('Campo "tipo" deve ser "carga" ou "descarga"');
  }

  if (data.status && !['pendente', 'confirmado', 'cancelado', 'concluido'].includes(data.status)) {
    errors.push('Campo "status" inválido');
  }

  // Validações de valor
  if (data.tonelagem !== undefined && data.tonelagem <= 0) {
    errors.push('Campo "tonelagem" deve ser maior que zero');
  }

  if (data.valorEstimadoCentavos !== undefined) {
    if (!Number.isInteger(data.valorEstimadoCentavos)) {
      errors.push('Campo "valorEstimadoCentavos" deve ser um integer');
    }
    if (data.valorEstimadoCentavos < 0) {
      errors.push('Campo "valorEstimadoCentavos" não pode ser negativo');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de Funcionário
export function validateFuncionario(data: any): ValidationResult {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.nome || data.nome.trim() === '') {
    errors.push('Campo "nome" é obrigatório e não pode estar vazio');
  }

  // Validação de CPF (se fornecido)
  if (data.cpf && !isValidCPF(data.cpf)) {
    errors.push('CPF inválido');
  }

  // Validação de telefone (se fornecido)
  if (data.telefone && !isValidPhone(data.telefone)) {
    errors.push('Telefone inválido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de Usuário
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.email) errors.push('Campo "email" é obrigatório');
  if (!data.name || data.name.trim() === '') errors.push('Campo "name" é obrigatório');
  if (!data.role) errors.push('Campo "role" é obrigatório');

  // Validação de email
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  // Validação de role
  if (data.role && !['admin_platform', 'owner', 'user'].includes(data.role)) {
    errors.push('Campo "role" deve ser "admin_platform", "owner" ou "user"');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de Empresa
export function validateCompany(data: any): ValidationResult {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.name || data.name.trim() === '') {
    errors.push('Campo "name" é obrigatório');
  }

  if (data.planMonths === undefined) {
    errors.push('Campo "planMonths" é obrigatório');
  }

  // Validações de valor
  if (data.planMonths !== undefined && (!Number.isInteger(data.planMonths) || data.planMonths <= 0)) {
    errors.push('Campo "planMonths" deve ser um integer positivo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de valores monetários
export function validateMonetaryValue(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];

  if (value === undefined || value === null) {
    errors.push(`Campo "${fieldName}" é obrigatório`);
  } else {
    if (!Number.isInteger(value)) {
      errors.push(`Campo "${fieldName}" deve ser um integer (centavos)`);
    }
    if (value < 0) {
      errors.push(`Campo "${fieldName}" não pode ser negativo`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helpers de validação
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');
  
  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
  return phone.length === 10 || phone.length === 11;
}

// Validador genérico de estrutura
export function validateStructure(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];

  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`Campo "${field}" é obrigatório`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
