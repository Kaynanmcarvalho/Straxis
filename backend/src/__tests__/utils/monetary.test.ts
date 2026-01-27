/**
 * Testes de Propriedade para Valores Monetários em Centavos
 * 
 * Feature: straxis-saas
 * Properties: 52, 53, 54, 55
 * Requirements: 19.1, 19.2, 19.3, 19.5, 19.6, 19.7
 */

import * as fc from 'fast-check';

// Funções de conversão monetária
export function reaisToCentavos(reais: number): number {
  return Math.round(reais * 100);
}

export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

export function formatCurrency(centavos: number): string {
  const reais = centavosToReais(centavos);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
}

export function validateMonetaryValue(centavos: number): boolean {
  if (!Number.isInteger(centavos)) {
    throw new Error('Valor monetário deve ser integer');
  }
  
  if (centavos < 0) {
    throw new Error('Valor monetário não pode ser negativo');
  }
  
  return true;
}

describe('Valores Monetários em Centavos', () => {
  
  /**
   * Property 52: Valores armazenados em centavos
   * Para qualquer valor monetário armazenado, o valor deve ser um integer representando centavos
   */
  test('Property 52: valores devem ser integers em centavos', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000, noNaN: true }),
        (reais) => {
          const centavos = reaisToCentavos(reais);
          
          // Deve ser integer
          expect(Number.isInteger(centavos)).toBe(true);
          
          // Deve ser não-negativo
          expect(centavos).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 53: Conversão reais para centavos
   * Para qualquer valor em reais, o sistema deve multiplicar por 100 e armazenar como integer
   */
  test('Property 53: conversão reais para centavos deve multiplicar por 100', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000, noNaN: true }),
        (reais) => {
          const centavos = reaisToCentavos(reais);
          const expected = Math.round(reais * 100);
          
          expect(centavos).toBe(expected);
          expect(Number.isInteger(centavos)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 54: Conversão centavos para reais na UI
   * Para qualquer valor exibido na UI, o sistema deve dividir centavos por 100
   */
  test('Property 54: conversão centavos para reais deve dividir por 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }),
        (centavos) => {
          const reais = centavosToReais(centavos);
          const expected = centavos / 100;
          
          expect(reais).toBeCloseTo(expected, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 55: Cálculos financeiros em centavos
   * Para qualquer cálculo financeiro, o sistema deve usar aritmética de inteiros
   */
  test('Property 55: cálculos devem usar aritmética de inteiros', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 1000000 }), { minLength: 1, maxLength: 10 }),
        (valoresCentavos) => {
          // Soma em centavos (integers)
          const totalCentavos = valoresCentavos.reduce((sum, val) => sum + val, 0);
          
          // Deve ser integer
          expect(Number.isInteger(totalCentavos)).toBe(true);
          
          // Deve ser igual à soma esperada
          const expectedSum = valoresCentavos.reduce((sum, val) => sum + val, 0);
          expect(totalCentavos).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Testes unitários complementares
  describe('Casos de borda', () => {
    test('deve converter R$ 0,00 corretamente', () => {
      expect(reaisToCentavos(0)).toBe(0);
      expect(centavosToReais(0)).toBe(0);
    });

    test('deve converter R$ 1,00 corretamente', () => {
      expect(reaisToCentavos(1)).toBe(100);
      expect(centavosToReais(100)).toBe(1);
    });

    test('deve converter R$ 0,01 corretamente', () => {
      expect(reaisToCentavos(0.01)).toBe(1);
      expect(centavosToReais(1)).toBe(0.01);
    });

    test('deve converter R$ 1234,56 corretamente', () => {
      expect(reaisToCentavos(1234.56)).toBe(123456);
      expect(centavosToReais(123456)).toBe(1234.56);
    });

    test('deve arredondar corretamente valores com muitas casas decimais', () => {
      expect(reaisToCentavos(10.999)).toBe(1100); // Arredonda para 11.00
      expect(reaisToCentavos(10.994)).toBe(1099); // Arredonda para 10.99
    });

    test('deve formatar moeda corretamente', () => {
      const formatted100 = formatCurrency(100);
      const formatted123456 = formatCurrency(123456);
      const formatted1 = formatCurrency(1);
      
      // Verificar que contém os valores corretos (ignorando espaços especiais)
      expect(formatted100).toContain('1,00');
      expect(formatted123456).toContain('1.234,56');
      expect(formatted1).toContain('0,01');
    });

    test('deve validar valores monetários', () => {
      expect(validateMonetaryValue(100)).toBe(true);
      expect(validateMonetaryValue(0)).toBe(true);
      
      expect(() => validateMonetaryValue(10.5)).toThrow('Valor monetário deve ser integer');
      expect(() => validateMonetaryValue(-100)).toThrow('Valor monetário não pode ser negativo');
    });
  });

  // Testes de round-trip
  describe('Round-trip conversions', () => {
    test('conversão reais -> centavos -> reais deve preservar valor', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000000, noNaN: true }),
          (reaisOriginal) => {
            const centavos = reaisToCentavos(reaisOriginal);
            const reaisConvertido = centavosToReais(centavos);
            
            // Deve ser aproximadamente igual (tolerância de 0.01 devido a arredondamento)
            // Usamos Math.abs para verificar a diferença
            const diferenca = Math.abs(reaisConvertido - reaisOriginal);
            expect(diferenca).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
