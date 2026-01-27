/**
 * Testes de Propriedade para Validações de Trabalhos e Agendamentos
 * 
 * Feature: straxis-saas
 * Properties: 9, 10, 12
 * Requirements: 4.3, 4.4, 5.4, 5.5, 4.1
 */

import * as fc from 'fast-check';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Funções de validação
export function validateTonelagem(tonelagem: number): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (tonelagem <= 0) {
    errors.push({
      field: 'tonelagem',
      message: 'Tonelagem deve ser maior que zero',
    });
  }
  
  if (!Number.isFinite(tonelagem)) {
    errors.push({
      field: 'tonelagem',
      message: 'Tonelagem deve ser um número válido',
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateValorMonetario(valor: number, fieldName: string = 'valor'): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (valor < 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} não pode ser negativo`,
    });
  }
  
  if (!Number.isInteger(valor)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} deve ser um integer (centavos)`,
    });
  }
  
  if (!Number.isFinite(valor)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} deve ser um número válido`,
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTrabalho(data: {
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  funcionarios: any[];
}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar data
  if (!(data.data instanceof Date) || isNaN(data.data.getTime())) {
    errors.push({
      field: 'data',
      message: 'Data inválida',
    });
  }
  
  // Validar tipo
  if (!['carga', 'descarga'].includes(data.tipo)) {
    errors.push({
      field: 'tipo',
      message: 'Tipo deve ser "carga" ou "descarga"',
    });
  }
  
  // Validar tonelagem
  const tonelagemResult = validateTonelagem(data.tonelagem);
  errors.push(...tonelagemResult.errors);
  
  // Validar valor recebido
  const valorResult = validateValorMonetario(data.valorRecebidoCentavos, 'valorRecebidoCentavos');
  errors.push(...valorResult.errors);
  
  // Validar funcionários
  if (!Array.isArray(data.funcionarios)) {
    errors.push({
      field: 'funcionarios',
      message: 'Funcionários deve ser um array',
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAgendamento(data: {
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorEstimadoCentavos: number;
}): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar data
  if (!(data.data instanceof Date) || isNaN(data.data.getTime())) {
    errors.push({
      field: 'data',
      message: 'Data inválida',
    });
  }
  
  // Validar tipo
  if (!['carga', 'descarga'].includes(data.tipo)) {
    errors.push({
      field: 'tipo',
      message: 'Tipo deve ser "carga" ou "descarga"',
    });
  }
  
  // Validar tonelagem
  const tonelagemResult = validateTonelagem(data.tonelagem);
  errors.push(...tonelagemResult.errors);
  
  // Validar valor estimado
  const valorResult = validateValorMonetario(data.valorEstimadoCentavos, 'valorEstimadoCentavos');
  errors.push(...valorResult.errors);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

describe('Validações de Trabalhos e Agendamentos', () => {
  
  /**
   * Property 9: Validação de tonelagem positiva
   * Para qualquer trabalho ou agendamento com tonelagem <= 0, a validação deve falhar
   */
  test('Property 9: tonelagem deve ser maior que zero', () => {
    fc.assert(
      fc.property(
        fc.float({ max: 0 }),
        (tonelagem) => {
          const result = validateTonelagem(tonelagem);
          
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThanOrEqual(1);
          expect(result.errors.some(e => e.field === 'tonelagem')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: tonelagem positiva deve ser válida', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        (tonelagem) => {
          const result = validateTonelagem(tonelagem);
          
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Validação de valores não-negativos
   * Para qualquer trabalho ou agendamento com valor < 0, a validação deve falhar
   */
  test('Property 10: valores monetários não podem ser negativos', () => {
    fc.assert(
      fc.property(
        fc.integer({ max: -1 }),
        (valor) => {
          const result = validateValorMonetario(valor);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.message.includes('negativo'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: valores não-negativos devem ser válidos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }),
        (valor) => {
          const result = validateValorMonetario(valor);
          
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Presença de campos obrigatórios em agendamentos
   * Para qualquer agendamento, os campos obrigatórios devem estar presentes e válidos
   */
  test('Property 12: agendamento deve ter campos obrigatórios válidos', () => {
    fc.assert(
      fc.property(
        fc.record({
          data: fc.date(),
          tipo: fc.constantFrom('carga' as const, 'descarga' as const),
          tonelagem: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
          valorEstimadoCentavos: fc.integer({ min: 0, max: 10000000 }),
        }),
        (agendamento) => {
          const result = validateAgendamento(agendamento);
          
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Testes unitários complementares
  describe('Casos de borda - Tonelagem', () => {
    test('tonelagem zero deve ser inválida', () => {
      const result = validateTonelagem(0);
      expect(result.valid).toBe(false);
    });

    test('tonelagem negativa deve ser inválida', () => {
      const result = validateTonelagem(-10);
      expect(result.valid).toBe(false);
    });

    test('tonelagem NaN deve ser inválida', () => {
      const result = validateTonelagem(NaN);
      expect(result.valid).toBe(false);
    });

    test('tonelagem Infinity deve ser inválida', () => {
      const result = validateTonelagem(Infinity);
      expect(result.valid).toBe(false);
    });

    test('tonelagem 0.01 deve ser válida', () => {
      const result = validateTonelagem(0.01);
      expect(result.valid).toBe(true);
    });

    test('tonelagem 1000 deve ser válida', () => {
      const result = validateTonelagem(1000);
      expect(result.valid).toBe(true);
    });
  });

  describe('Casos de borda - Valores Monetários', () => {
    test('valor zero deve ser válido', () => {
      const result = validateValorMonetario(0);
      expect(result.valid).toBe(true);
    });

    test('valor negativo deve ser inválido', () => {
      const result = validateValorMonetario(-100);
      expect(result.valid).toBe(false);
    });

    test('valor float deve ser inválido', () => {
      const result = validateValorMonetario(10.5);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('integer'))).toBe(true);
    });

    test('valor NaN deve ser inválido', () => {
      const result = validateValorMonetario(NaN);
      expect(result.valid).toBe(false);
    });

    test('valor Infinity deve ser inválido', () => {
      const result = validateValorMonetario(Infinity);
      expect(result.valid).toBe(false);
    });

    test('valor integer positivo deve ser válido', () => {
      const result = validateValorMonetario(100000);
      expect(result.valid).toBe(true);
    });
  });

  describe('Validação completa de Trabalho', () => {
    test('trabalho válido deve passar na validação', () => {
      const result = validateTrabalho({
        data: new Date(),
        tipo: 'carga',
        tonelagem: 10.5,
        valorRecebidoCentavos: 100000,
        funcionarios: [],
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('trabalho com tonelagem inválida deve falhar', () => {
      const result = validateTrabalho({
        data: new Date(),
        tipo: 'carga',
        tonelagem: 0,
        valorRecebidoCentavos: 100000,
        funcionarios: [],
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'tonelagem')).toBe(true);
    });

    test('trabalho com valor negativo deve falhar', () => {
      const result = validateTrabalho({
        data: new Date(),
        tipo: 'carga',
        tonelagem: 10,
        valorRecebidoCentavos: -100,
        funcionarios: [],
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'valorRecebidoCentavos')).toBe(true);
    });

    test('trabalho com tipo inválido deve falhar', () => {
      const result = validateTrabalho({
        data: new Date(),
        tipo: 'invalido' as any,
        tonelagem: 10,
        valorRecebidoCentavos: 100000,
        funcionarios: [],
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'tipo')).toBe(true);
    });

    test('trabalho com data inválida deve falhar', () => {
      const result = validateTrabalho({
        data: new Date('invalid'),
        tipo: 'carga',
        tonelagem: 10,
        valorRecebidoCentavos: 100000,
        funcionarios: [],
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'data')).toBe(true);
    });

    test('trabalho com múltiplos erros deve reportar todos', () => {
      const result = validateTrabalho({
        data: new Date('invalid'),
        tipo: 'invalido' as any,
        tonelagem: -10,
        valorRecebidoCentavos: -100,
        funcionarios: 'not-an-array' as any,
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Validação completa de Agendamento', () => {
    test('agendamento válido deve passar na validação', () => {
      const result = validateAgendamento({
        data: new Date(),
        tipo: 'descarga',
        tonelagem: 15.5,
        valorEstimadoCentavos: 150000,
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('agendamento com tonelagem zero deve falhar', () => {
      const result = validateAgendamento({
        data: new Date(),
        tipo: 'carga',
        tonelagem: 0,
        valorEstimadoCentavos: 100000,
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'tonelagem')).toBe(true);
    });

    test('agendamento com valor float deve falhar', () => {
      const result = validateAgendamento({
        data: new Date(),
        tipo: 'carga',
        tonelagem: 10,
        valorEstimadoCentavos: 100.5,
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('integer'))).toBe(true);
    });
  });
});
