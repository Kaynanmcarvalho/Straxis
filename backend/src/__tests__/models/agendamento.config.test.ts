/**
 * Testes de Propriedade para Configuração de Valores em Agendamentos
 * 
 * Feature: straxis-saas
 * Property: 42
 * Requirements: 14.3
 */

import * as fc from 'fast-check';

interface CompanyConfig {
  valorCargaPorToneladaCentavos: number;
  valorDescargaPorToneladaCentavos: number;
}

interface AgendamentoInput {
  tipo: 'carga' | 'descarga';
  tonelagem: number;
}

// Função de sugestão de valor
export function calcularValorSugerido(
  agendamento: AgendamentoInput,
  config: CompanyConfig
): number {
  const valorPorTonelada = agendamento.tipo === 'carga'
    ? config.valorCargaPorToneladaCentavos
    : config.valorDescargaPorToneladaCentavos;
  
  // Converter tonelagem para centavos
  const tonelagemEmCentavos = Math.round(agendamento.tonelagem * 100);
  
  // Calcular valor sugerido: (valorPorTonelada * tonelagem) / 100
  // Dividimos por 100 porque tonelagem está em centavos
  return Math.round((valorPorTonelada * agendamento.tonelagem));
}

describe('Configuração de Valores em Agendamentos', () => {
  
  /**
   * Property 42: Sugestão de valor baseada em configuração
   * Para qualquer trabalho novo, o valor sugerido deve ser igual à configuração
   * (valorCargaPorTonelada ou valorDescargaPorTonelada) multiplicada pela tonelagem
   */
  test('Property 42: valor sugerido deve ser config * tonelagem', () => {
    fc.assert(
      fc.property(
        fc.record({
          valorCargaPorToneladaCentavos: fc.integer({ min: 1000, max: 1000000 }),
          valorDescargaPorToneladaCentavos: fc.integer({ min: 1000, max: 1000000 }),
        }),
        fc.constantFrom('carga' as const, 'descarga' as const),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
        (config, tipo, tonelagem) => {
          const agendamento = { tipo, tonelagem };
          const valorSugerido = calcularValorSugerido(agendamento, config);
          
          // Valor esperado
          const valorPorTonelada = tipo === 'carga'
            ? config.valorCargaPorToneladaCentavos
            : config.valorDescargaPorToneladaCentavos;
          
          const expectedValor = Math.round(valorPorTonelada * tonelagem);
          
          expect(valorSugerido).toBe(expectedValor);
          expect(Number.isInteger(valorSugerido)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 42: valor sugerido para carga usa valorCargaPorTonelada', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }),
        fc.integer({ min: 1000, max: 1000000 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
        (valorCarga, valorDescarga, tonelagem) => {
          const config = {
            valorCargaPorToneladaCentavos: valorCarga,
            valorDescargaPorToneladaCentavos: valorDescarga,
          };
          
          const agendamento = { tipo: 'carga' as const, tonelagem };
          const valorSugerido = calcularValorSugerido(agendamento, config);
          
          const expectedValor = Math.round(valorCarga * tonelagem);
          
          expect(valorSugerido).toBe(expectedValor);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 42: valor sugerido para descarga usa valorDescargaPorTonelada', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }),
        fc.integer({ min: 1000, max: 1000000 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
        (valorCarga, valorDescarga, tonelagem) => {
          const config = {
            valorCargaPorToneladaCentavos: valorCarga,
            valorDescargaPorToneladaCentavos: valorDescarga,
          };
          
          const agendamento = { tipo: 'descarga' as const, tonelagem };
          const valorSugerido = calcularValorSugerido(agendamento, config);
          
          const expectedValor = Math.round(valorDescarga * tonelagem);
          
          expect(valorSugerido).toBe(expectedValor);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Testes unitários complementares
  describe('Casos de borda', () => {
    test('carga com 1 tonelada e R$ 100/ton deve sugerir R$ 100', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000, // R$ 100
        valorDescargaPorToneladaCentavos: 8000, // R$ 80
      };
      
      const agendamento = { tipo: 'carga' as const, tonelagem: 1 };
      const valorSugerido = calcularValorSugerido(agendamento, config);
      
      expect(valorSugerido).toBe(10000); // R$ 100
    });

    test('descarga com 1 tonelada e R$ 80/ton deve sugerir R$ 80', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000, // R$ 100
        valorDescargaPorToneladaCentavos: 8000, // R$ 80
      };
      
      const agendamento = { tipo: 'descarga' as const, tonelagem: 1 };
      const valorSugerido = calcularValorSugerido(agendamento, config);
      
      expect(valorSugerido).toBe(8000); // R$ 80
    });

    test('carga com 10.5 toneladas e R$ 100/ton deve sugerir R$ 1050', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000, // R$ 100
        valorDescargaPorToneladaCentavos: 8000, // R$ 80
      };
      
      const agendamento = { tipo: 'carga' as const, tonelagem: 10.5 };
      const valorSugerido = calcularValorSugerido(agendamento, config);
      
      expect(valorSugerido).toBe(105000); // R$ 1050
    });

    test('descarga com 0.5 toneladas e R$ 80/ton deve sugerir R$ 40', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000, // R$ 100
        valorDescargaPorToneladaCentavos: 8000, // R$ 80
      };
      
      const agendamento = { tipo: 'descarga' as const, tonelagem: 0.5 };
      const valorSugerido = calcularValorSugerido(agendamento, config);
      
      expect(valorSugerido).toBe(4000); // R$ 40
    });

    test('valor sugerido deve sempre ser integer', () => {
      const config = {
        valorCargaPorToneladaCentavos: 12345, // R$ 123.45
        valorDescargaPorToneladaCentavos: 9876, // R$ 98.76
      };
      
      const agendamento1 = { tipo: 'carga' as const, tonelagem: 3.7 };
      const valorSugerido1 = calcularValorSugerido(agendamento1, config);
      expect(Number.isInteger(valorSugerido1)).toBe(true);
      
      const agendamento2 = { tipo: 'descarga' as const, tonelagem: 2.3 };
      const valorSugerido2 = calcularValorSugerido(agendamento2, config);
      expect(Number.isInteger(valorSugerido2)).toBe(true);
    });

    test('tonelagem zero deve resultar em valor zero', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000,
        valorDescargaPorToneladaCentavos: 8000,
      };
      
      const agendamento = { tipo: 'carga' as const, tonelagem: 0 };
      const valorSugerido = calcularValorSugerido(agendamento, config);
      
      expect(valorSugerido).toBe(0);
    });

    test('valores diferentes para carga e descarga devem gerar sugestões diferentes', () => {
      const config = {
        valorCargaPorToneladaCentavos: 10000, // R$ 100
        valorDescargaPorToneladaCentavos: 8000, // R$ 80
      };
      
      const tonelagem = 5;
      
      const agendamentoCarga = { tipo: 'carga' as const, tonelagem };
      const valorSugeridoCarga = calcularValorSugerido(agendamentoCarga, config);
      
      const agendamentoDescarga = { tipo: 'descarga' as const, tonelagem };
      const valorSugeridoDescarga = calcularValorSugerido(agendamentoDescarga, config);
      
      expect(valorSugeridoCarga).toBe(50000); // R$ 500
      expect(valorSugeridoDescarga).toBe(40000); // R$ 400
      expect(valorSugeridoCarga).not.toBe(valorSugeridoDescarga);
    });
  });

  // Testes de invariantes
  describe('Invariantes', () => {
    test('valor sugerido nunca deve ser negativo', () => {
      fc.assert(
        fc.property(
          fc.record({
            valorCargaPorToneladaCentavos: fc.integer({ min: 0, max: 1000000 }),
            valorDescargaPorToneladaCentavos: fc.integer({ min: 0, max: 1000000 }),
          }),
          fc.constantFrom('carga' as const, 'descarga' as const),
          fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
          (config, tipo, tonelagem) => {
            const agendamento = { tipo, tonelagem };
            const valorSugerido = calcularValorSugerido(agendamento, config);
            
            expect(valorSugerido).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('valor sugerido deve ser proporcional à tonelagem', () => {
      fc.assert(
        fc.property(
          fc.record({
            valorCargaPorToneladaCentavos: fc.integer({ min: 1000, max: 100000 }),
            valorDescargaPorToneladaCentavos: fc.integer({ min: 1000, max: 100000 }),
          }),
          fc.constantFrom('carga' as const, 'descarga' as const),
          fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
          (config, tipo, tonelagem) => {
            const agendamento1 = { tipo, tonelagem };
            const valorSugerido1 = calcularValorSugerido(agendamento1, config);
            
            const agendamento2 = { tipo, tonelagem: tonelagem * 2 };
            const valorSugerido2 = calcularValorSugerido(agendamento2, config);
            
            // Valor com o dobro da tonelagem deve ser aproximadamente o dobro
            // (pode ter pequena diferença devido a arredondamento)
            const ratio = valorSugerido2 / valorSugerido1;
            expect(ratio).toBeGreaterThan(1.9);
            expect(ratio).toBeLessThan(2.1);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('valor sugerido deve sempre ser integer (centavos)', () => {
      fc.assert(
        fc.property(
          fc.record({
            valorCargaPorToneladaCentavos: fc.integer({ min: 1, max: 1000000 }),
            valorDescargaPorToneladaCentavos: fc.integer({ min: 1, max: 1000000 }),
          }),
          fc.constantFrom('carga' as const, 'descarga' as const),
          fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
          (config, tipo, tonelagem) => {
            const agendamento = { tipo, tonelagem };
            const valorSugerido = calcularValorSugerido(agendamento, config);
            
            expect(Number.isInteger(valorSugerido)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
