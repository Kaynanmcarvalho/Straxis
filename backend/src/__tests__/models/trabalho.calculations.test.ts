/**
 * Testes de Propriedade para Cálculos Financeiros de Trabalhos
 * 
 * Feature: straxis-saas
 * Properties: 11, 13, 14
 * Requirements: 5.1, 5.2, 5.3
 */

import * as fc from 'fast-check';

interface TrabalhoFuncionario {
  funcionarioId: string;
  funcionarioNome: string;
  valorPagoCentavos: number;
}

interface Trabalho {
  id: string;
  companyId: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  funcionarios: TrabalhoFuncionario[];
  totalPagoCentavos: number;
  lucroCentavos: number;
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Funções de cálculo
export function calcularTotalPago(funcionarios: TrabalhoFuncionario[]): number {
  return funcionarios.reduce((sum, f) => sum + f.valorPagoCentavos, 0);
}

export function calcularLucro(valorRecebidoCentavos: number, totalPagoCentavos: number): number {
  return valorRecebidoCentavos - totalPagoCentavos;
}

export function criarTrabalho(data: Partial<Trabalho>): Trabalho {
  const funcionarios = data.funcionarios || [];
  const totalPagoCentavos = calcularTotalPago(funcionarios);
  const valorRecebidoCentavos = data.valorRecebidoCentavos || 0;
  const lucroCentavos = calcularLucro(valorRecebidoCentavos, totalPagoCentavos);

  return {
    id: data.id || 'test-id',
    companyId: data.companyId || 'test-company',
    data: data.data || new Date(),
    tipo: data.tipo || 'carga',
    tonelagem: data.tonelagem || 0,
    valorRecebidoCentavos,
    funcionarios,
    totalPagoCentavos,
    lucroCentavos,
    observacoes: data.observacoes,
    createdBy: data.createdBy || 'test-user',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deletedAt: data.deletedAt || null,
  };
}

describe('Cálculos Financeiros de Trabalhos', () => {
  
  /**
   * Property 11: Presença de campos obrigatórios em trabalhos
   * Para qualquer trabalho criado, os campos obrigatórios devem estar presentes e válidos
   */
  test('Property 11: campos obrigatórios devem estar presentes', () => {
    fc.assert(
      fc.property(
        fc.record({
          data: fc.date(),
          tipo: fc.constantFrom('carga' as const, 'descarga' as const),
          tonelagem: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
          valorRecebidoCentavos: fc.integer({ min: 0, max: 10000000 }),
          funcionarios: fc.array(
            fc.record({
              funcionarioId: fc.uuid(),
              funcionarioNome: fc.string({ minLength: 1, maxLength: 100 }),
              valorPagoCentavos: fc.integer({ min: 0, max: 1000000 }),
            }),
            { maxLength: 20 }
          ),
        }),
        (data) => {
          const trabalho = criarTrabalho(data);
          
          // Campos obrigatórios devem estar presentes
          expect(trabalho.id).toBeDefined();
          expect(trabalho.companyId).toBeDefined();
          expect(trabalho.data).toBeInstanceOf(Date);
          expect(['carga', 'descarga']).toContain(trabalho.tipo);
          expect(trabalho.tonelagem).toBeGreaterThan(0);
          expect(trabalho.valorRecebidoCentavos).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(trabalho.funcionarios)).toBe(true);
          expect(trabalho.totalPagoCentavos).toBeDefined();
          expect(trabalho.lucroCentavos).toBeDefined();
          expect(trabalho.createdBy).toBeDefined();
          expect(trabalho.createdAt).toBeInstanceOf(Date);
          expect(trabalho.updatedAt).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Cálculo correto de total pago
   * Para qualquer trabalho, totalPago deve ser igual à soma dos valores pagos aos funcionários
   */
  test('Property 13: totalPago deve ser soma dos valores pagos', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            funcionarioId: fc.uuid(),
            funcionarioNome: fc.string({ minLength: 1, maxLength: 100 }),
            valorPagoCentavos: fc.integer({ min: 0, max: 1000000 }),
          }),
          { maxLength: 20 }
        ),
        (funcionarios) => {
          const trabalho = criarTrabalho({ funcionarios });
          
          const expectedTotal = funcionarios.reduce(
            (sum, f) => sum + f.valorPagoCentavos,
            0
          );
          
          expect(trabalho.totalPagoCentavos).toBe(expectedTotal);
          expect(Number.isInteger(trabalho.totalPagoCentavos)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Cálculo correto de lucro
   * Para qualquer trabalho, lucro deve ser igual a valorRecebido - totalPago
   */
  test('Property 14: lucro deve ser valorRecebido - totalPago', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }),
        fc.array(
          fc.record({
            funcionarioId: fc.uuid(),
            funcionarioNome: fc.string({ minLength: 1, maxLength: 100 }),
            valorPagoCentavos: fc.integer({ min: 0, max: 100000 }),
          }),
          { maxLength: 20 }
        ),
        (valorRecebidoCentavos, funcionarios) => {
          const trabalho = criarTrabalho({ valorRecebidoCentavos, funcionarios });
          
          const expectedLucro = valorRecebidoCentavos - trabalho.totalPagoCentavos;
          
          expect(trabalho.lucroCentavos).toBe(expectedLucro);
          expect(Number.isInteger(trabalho.lucroCentavos)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Testes unitários complementares
  describe('Casos de borda', () => {
    test('trabalho sem funcionários deve ter totalPago = 0', () => {
      const trabalho = criarTrabalho({
        valorRecebidoCentavos: 100000,
        funcionarios: [],
      });
      
      expect(trabalho.totalPagoCentavos).toBe(0);
      expect(trabalho.lucroCentavos).toBe(100000);
    });

    test('trabalho com 1 funcionário deve calcular corretamente', () => {
      const trabalho = criarTrabalho({
        valorRecebidoCentavos: 100000,
        funcionarios: [
          {
            funcionarioId: 'func-1',
            funcionarioNome: 'João',
            valorPagoCentavos: 30000,
          },
        ],
      });
      
      expect(trabalho.totalPagoCentavos).toBe(30000);
      expect(trabalho.lucroCentavos).toBe(70000);
    });

    test('trabalho com múltiplos funcionários deve calcular corretamente', () => {
      const trabalho = criarTrabalho({
        valorRecebidoCentavos: 100000,
        funcionarios: [
          {
            funcionarioId: 'func-1',
            funcionarioNome: 'João',
            valorPagoCentavos: 30000,
          },
          {
            funcionarioId: 'func-2',
            funcionarioNome: 'Maria',
            valorPagoCentavos: 25000,
          },
          {
            funcionarioId: 'func-3',
            funcionarioNome: 'Pedro',
            valorPagoCentavos: 20000,
          },
        ],
      });
      
      expect(trabalho.totalPagoCentavos).toBe(75000);
      expect(trabalho.lucroCentavos).toBe(25000);
    });

    test('trabalho com totalPago > valorRecebido deve ter lucro negativo', () => {
      const trabalho = criarTrabalho({
        valorRecebidoCentavos: 50000,
        funcionarios: [
          {
            funcionarioId: 'func-1',
            funcionarioNome: 'João',
            valorPagoCentavos: 80000,
          },
        ],
      });
      
      expect(trabalho.totalPagoCentavos).toBe(80000);
      expect(trabalho.lucroCentavos).toBe(-30000);
    });

    test('trabalho com valores zerados', () => {
      const trabalho = criarTrabalho({
        valorRecebidoCentavos: 0,
        funcionarios: [
          {
            funcionarioId: 'func-1',
            funcionarioNome: 'João',
            valorPagoCentavos: 0,
          },
        ],
      });
      
      expect(trabalho.totalPagoCentavos).toBe(0);
      expect(trabalho.lucroCentavos).toBe(0);
    });
  });

  // Testes de invariantes
  describe('Invariantes', () => {
    test('totalPago nunca deve ser negativo', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              funcionarioId: fc.uuid(),
              funcionarioNome: fc.string({ minLength: 1 }),
              valorPagoCentavos: fc.integer({ min: 0, max: 1000000 }),
            }),
            { maxLength: 20 }
          ),
          (funcionarios) => {
            const trabalho = criarTrabalho({ funcionarios });
            expect(trabalho.totalPagoCentavos).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('lucro pode ser negativo mas deve ser calculado corretamente', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.array(
            fc.record({
              funcionarioId: fc.uuid(),
              funcionarioNome: fc.string({ minLength: 1 }),
              valorPagoCentavos: fc.integer({ min: 0, max: 1000000 }),
            }),
            { maxLength: 20 }
          ),
          (valorRecebidoCentavos, funcionarios) => {
            const trabalho = criarTrabalho({ valorRecebidoCentavos, funcionarios });
            
            // Lucro pode ser negativo, mas deve ser a diferença correta
            const expectedLucro = valorRecebidoCentavos - trabalho.totalPagoCentavos;
            expect(trabalho.lucroCentavos).toBe(expectedLucro);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('todos os valores devem ser integers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.array(
            fc.record({
              funcionarioId: fc.uuid(),
              funcionarioNome: fc.string({ minLength: 1 }),
              valorPagoCentavos: fc.integer({ min: 0, max: 1000000 }),
            }),
            { maxLength: 20 }
          ),
          (valorRecebidoCentavos, funcionarios) => {
            const trabalho = criarTrabalho({ valorRecebidoCentavos, funcionarios });
            
            expect(Number.isInteger(trabalho.valorRecebidoCentavos)).toBe(true);
            expect(Number.isInteger(trabalho.totalPagoCentavos)).toBe(true);
            expect(Number.isInteger(trabalho.lucroCentavos)).toBe(true);
            
            trabalho.funcionarios.forEach(f => {
              expect(Number.isInteger(f.valorPagoCentavos)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
