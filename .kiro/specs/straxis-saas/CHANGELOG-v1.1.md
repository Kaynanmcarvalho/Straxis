# Changelog v1.1 - Straxis SaaS

**Data:** 26/01/2026  
**Tipo:** Melhorias Críticas de Segurança e Operação

---

## 🎯 Resumo

A versão 1.1 adiciona **5 melhorias críticas** identificadas durante revisão de segurança e operação, prevenindo:
- ❌ Perda irreversível de histórico financeiro
- ❌ Fraudes com valores monetários (R$ 0,01)
- ❌ Custos descontrolados de IA e WhatsApp
- ❌ Falhas operacionais sem recuperação
- ❌ Conflitos de dados offline

---

## 🔧 Melhorias Implementadas

### 1. Soft Delete (Requisito 18)

**Problema:** Exclusão permanente de trabalhos, funcionários e agendamentos causa perda irreversível de histórico financeiro.

**Solução:**
- Campo `deletedAt: Date | null` em todas as entidades críticas
- Queries sempre filtram `deletedAt == null`
- Delete real apenas para Admin_Plataforma
- Possibilidade de restauração

**Impacto:**
- ✅ Preserva histórico financeiro completo
- ✅ Permite auditoria de dados excluídos
- ✅ Recuperação de exclusões acidentais

**Propriedades Adicionadas:**
- Property 49: Soft delete preserva registros
- Property 50: Queries filtram soft-deleted
- Property 51: Admin pode fazer delete real

---

### 2. Valores Monetários em Centavos (Requisito 19)

**Problema:** Valores como `number` (float) permitem fraudes e erros de arredondamento.

**Solução:**
- **TODOS** os valores monetários armazenados como `integer` (centavos)
- Conversão para reais **APENAS** na UI
- Aritmética de inteiros para cálculos financeiros

**Exemplo:**
```typescript
// ❌ ANTES (PERIGOSO)
interface Trabalho {
  valorRecebido: number;  // 1000.50
}

// ✅ DEPOIS (SEGURO)
interface Trabalho {
  valorRecebidoCentavos: number;  // 100050
}
```

**Impacto:**
- ✅ Previne fraudes (ex: R$ 0,01)
- ✅ Elimina erros de arredondamento
- ✅ Padrão bancário (compliance)

**Propriedades Adicionadas:**
- Property 52: Valores armazenados em centavos
- Property 53: Conversão reais para centavos
- Property 54: Conversão centavos para reais na UI
- Property 55: Cálculos financeiros em centavos

---

### 3. Rate Limiting (Requisito 20)

**Problema:** Sem controle de uso, um cliente pode gerar custos descontrolados de IA e WhatsApp.

**Solução:**

**WhatsApp:**
- 1000 mensagens/dia por empresa
- 10 mensagens/minuto por número
- 30 segundos de cooldown entre mensagens

**IA:**
- 60 requisições/minuto por empresa
- 500 requisições/dia por usuário

**Impacto:**
- ✅ Controla custos operacionais
- ✅ Previne spam
- ✅ Protege contra abuso

**Propriedades Adicionadas:**
- Property 56: Rate limit WhatsApp por dia
- Property 57: Rate limit WhatsApp por minuto
- Property 58: Cooldown entre mensagens
- Property 59: Rate limit IA por minuto
- Property 60: Rate limit IA por dia por usuário
- Property 61: Reset de contadores diários

---

### 4. Fallback Operacional (Requisito 21)

**Problema:** Quando IA falha ou WhatsApp cai, sistema fica sem resposta.

**Solução:**

**IA Falha:**
- Mensagem padrão predefinida
- Notificação no painel do Dono_Empresa
- Log para análise

**WhatsApp Desconecta:**
- Desconexão graciosa
- Alerta no painel
- Status atualizado

**Mensagem Não Compreendida:**
- Resposta padrão
- Log para análise futura

**Retry Automático:**
- Backoff exponencial (1s, 2s, 4s)
- Máximo 3 tentativas

**Impacto:**
- ✅ Continuidade operacional
- ✅ Experiência do usuário preservada
- ✅ Transparência de falhas

**Propriedades Adicionadas:**
- Property 62: Fallback quando IA falha
- Property 63: Fallback quando WhatsApp desconecta
- Property 64: Fallback para mensagem não compreendida
- Property 65: Retry com backoff exponencial

---

### 5. Resolução de Conflitos Offline (Requisito 22)

**Problema:** Múltiplos usuários editando offline causam conflitos de dados.

**Solução:**

**Last-Write-Wins:**
- Baseado em timestamp
- Versão anterior preservada em logs

**Merge Inteligente:**
- Arrays: união de elementos únicos
- Objetos: campo por campo com timestamp

**Sincronização:**
- Ordem cronológica
- Validação de integridade
- Notificação ao usuário

**Impacto:**
- ✅ Previne perda de dados
- ✅ Sincronização confiável
- ✅ Transparência para usuário

**Propriedades Adicionadas:**
- Property 66: Last-write-wins para conflitos
- Property 67: Merge inteligente de arrays
- Property 68: Preservação de versão anterior
- Property 69: Sincronização em ordem cronológica

---

## 📊 Estatísticas

**Requisitos:**
- Adicionados: 5 novos requisitos (18-22)
- Total: 22 requisitos

**Propriedades de Correção:**
- Adicionadas: 21 novas propriedades (49-69)
- Total: 69 propriedades

**Tasks:**
- Adicionadas: 6 novas tasks (28-33)
- Total: 33 tasks principais

**Interfaces Atualizadas:**
- `Trabalho`: +1 campo (deletedAt), valores em centavos
- `Agendamento`: +1 campo (deletedAt), valores em centavos
- `Funcionario`: +1 campo (deletedAt)
- `User`: +1 campo (deletedAt)
- `CompanyConfig`: +2 objetos (RateLimits, FallbackMessages)
- `IAUsage`: valores em centavos

---

## 🚀 Próximos Passos

1. **Revisar e aprovar** as mudanças da v1.1
2. **Executar tasks 28-33** para implementar melhorias
3. **Executar testes de propriedade** para validar correção
4. **Atualizar README.md** após cada 5 tasks concluídas

---

## 📝 Documentos Atualizados

- ✅ `README.md` - Adicionado changelog v1.1
- ✅ `requirements.md` - Adicionados requisitos 18-22
- ✅ `design.md` - Adicionadas propriedades 49-69 e seções detalhadas
- ✅ `tasks.md` - Adicionadas tasks 28-33

---

**Versão:** 1.1  
**Status:** ✅ Pronto para implementação  
**Aprovação:** Aguardando revisão do usuário
