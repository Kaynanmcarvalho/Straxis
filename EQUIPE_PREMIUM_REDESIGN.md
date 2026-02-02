# EQUIPE - PAINEL VIVO DA EQUIPE
## Design System Premium | Straxis SaaS Platform

**Versão**: Alpha 19.0.0  
**Data**: 02/02/2026  
**Tipo**: MAJOR - Reconstrução Completa  
**Criticidade**: ALTA - Módulo Operacional Diário

---

## 🎯 CONCEITO VISUAL

A aba /equipe não é uma lista de funcionários.  
É o **Painel Vivo da Operação Humana**.

### Metáfora Visual
Imagine o app Saúde do iPhone combinado com o painel de equipe do Linear:
- **iOS Health** (cards vivos, status em tempo real)
- **Linear Team View** (elegância, organização)
- **Apple Watch Activity** (indicadores sutis de status)
- **Notion People** (hierarquia clara, informação densa mas legível)

### Princípios de Design
1. **Confiança Imediata**: Parece confiável em 0.5s
2. **Leitura Rápida**: Entende tudo em 2s
3. **Ação Direta**: Bate ponto em 1 toque
4. **Profundidade Elegante**: Informação sem poluição
5. **Vivo**: Atualiza em tempo real

---

## 📐 ESTRUTURA COMPLETA DA TELA

### Layout Geral
```
┌─────────────────────────────────────────────────────────┐
│  [Topo Editorial Premium]                               │
│  Equipe                                                 │
│  Seg, 02 fev                                            │
│                    [Bater Ponto]  [Gerenciar]          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Visão Geral Compacta]                                │
│  12 total  •  8 trabalhando  •  2 pausa  •  2 ausentes│
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Card Funcionário 1] ●                                │
│  João Silva                                             │
│  Operador                                               │
│  Entrada 08:00  •  R$ 75,00                            │
│                                                         │
│  [Card Funcionário 2] ◐                                │
│  Maria Santos                                           │
│  Encarregada                                            │
│  Almoço 12:15  •  R$ 150,00                            │
│                                                         │
│  [Card Funcionário 3] ○                                │
│  Pedro Costa                                            │
│  Operador                                               │
│  Ausente hoje                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. TOPO EDITORIAL PREMIUM

### Estrutura Visual
```
┌─────────────────────────────────────────────────────────┐
│  Equipe                                                 │
│  Seg, 02 fev                                            │
│                                                         │
│                    [Bater Ponto]  [Gerenciar]          │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Título "Equipe"**
- Font: -apple-system, 700
- Size: 34px
- Color: #000000
- Letter-spacing: -0.8px
- Margin-bottom: 2px
- Line-height: 1.1

**Data Editorial**
- Font: -apple-system, 400
- Size: 17px
- Color: #666666
- Letter-spacing: -0.2px
- Format: "Seg, 02 fev"

**Botão "Bater Ponto" (Primário)**
- Background: #000000
- Color: #FFFFFF
- Padding: 14px 24px
- Border-radius: 12px
- Font-size: 16px
- Font-weight: 600
- Box-shadow: 0 2px 8px rgba(0,0,0,0.12)
- Transition: all 0.2s ease
- Hover: transform: translateY(-1px), shadow aumenta
- Active: transform: scale(0.98)

**Botão "Gerenciar" (Secundário)**
- Background: rgba(0,0,0,0.04)
- Color: #000000
- Padding: 14px 20px
- Border-radius: 12px
- Font-size: 15px
- Font-weight: 500
- Border: 1px solid rgba(0,0,0,0.08)
- Hover: background: rgba(0,0,0,0.06)

### Comportamento
- Sticky no scroll (sempre visível)
- Botões com feedback tátil
- Espaçamento generoso (padding: 24px 20px)

---

## 📊 2. VISÃO GERAL COMPACTA

### Conceito
Resumo silencioso da situação atual da equipe.

### Estrutura Visual
```
┌─────────────────────────────────────────────────────────┐
│  12 total  •  8 trabalhando  •  2 pausa  •  2 ausentes │
└─────────────────────────────────────────────────────────┘
```

### Especificações

**Container**
- Background: rgba(0,0,0,0.02)
- Border: 1px solid rgba(0,0,0,0.04)
- Border-radius: 10px
- Padding: 12px 16px
- Margin: 16px 20px
- Display: flex
- Align-items: center
- Justify-content: center
- Gap: 12px

**Texto**
- Font-size: 14px
- Font-weight: 500
- Color: #666666
- Letter-spacing: -0.1px

**Números**
- Font-weight: 700
- Color: #000000

**Separador "•"**
- Color: rgba(0,0,0,0.2)
- Font-size: 12px

### Comportamento
- Atualiza em tempo real
- Animação suave ao mudar números
- Clicável para filtrar por status

---

## 👤 3. CARD DE FUNCIONÁRIO (NÚCLEO DO DESIGN)

### Conceito
Cada funcionário é uma **entidade viva** com status em tempo real.

### Estrutura Visual
```
┌─────────────────────────────────────────────────────────┐
│  ●  João Silva                                    [>]   │
│     Operador                                            │
│                                                         │
│     Entrada 08:00  •  R$ 75,00                         │
└─────────────────────────────────────────────────────────┘
```

### Especificações Detalhadas

**Container do Card**
- Background: #FFFFFF
- Border: 1px solid rgba(0,0,0,0.06)
- Border-radius: 16px
- Padding: 16px 18px
- Margin: 0 20px 12px 20px
- Box-shadow:
  - 0 1px 3px rgba(0,0,0,0.04)
  - 0 4px 12px rgba(0,0,0,0.02)
- Transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)
- Hover:
  - transform: translateY(-2px)
  - box-shadow: 0 8px 24px rgba(0,0,0,0.08)

**Avatar / Indicador de Status**
- Size: 40px
- Border-radius: 50%
- Background: gradiente suave baseado no status
- Display: flex
- Align-items: center
- Justify-content: center
- Font-size: 18px
- Font-weight: 600
- Color: #FFFFFF
- Margin-right: 14px
- Float: left

**Indicador de Status (Dot)**
- Position: absolute
- Top: 16px
- Left: 18px
- Size: 10px
- Border-radius: 50%
- Border: 2px solid #FFFFFF
- Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Cores por status:
  - **Trabalhando**: #34C759 (verde)
  - **Pausa/Almoço**: #FF9500 (laranja)
  - **Ausente**: #8E8E93 (cinza)
  - **Deslocamento**: #007AFF (azul)

**Nome do Funcionário**
- Font-size: 17px
- Font-weight: 600
- Color: #000000
- Letter-spacing: -0.3px
- Margin-bottom: 2px
- Line-height: 1.2

**Cargo/Função**
- Font-size: 14px
- Font-weight: 400
- Color: #666666
- Letter-spacing: -0.1px
- Margin-bottom: 10px

**Última Ação**
- Font-size: 13px
- Font-weight: 500
- Color: #999999
- Display: flex
- Align-items: center
- Gap: 6px

**Valor Acumulado**
- Font-size: 15px
- Font-weight: 700
- Color: #34C759
- Display: inline-block
- Padding: 4px 8px
- Background: rgba(52, 199, 89, 0.08)
- Border-radius: 6px
- Float: right

**Seta de Navegação**
- Position: absolute
- Top: 50%
- Right: 18px
- Transform: translateY(-50%)
- Color: #C7C7CC
- Size: 20px

---

## 🎨 4. LINGUAGEM DE STATUS

### Conceito
Status não é só cor. É uma **linguagem visual completa**.

### Paleta de Status

**Trabalhando**
- Cor: #34C759 (verde Apple)
- Dot: ● (filled circle)
- Background card: borda esquerda verde sutil
- Texto: "Trabalhando desde 08:00"

**Pausa/Almoço**
- Cor: #FF9500 (laranja)
- Dot: ◐ (half circle)
- Background card: borda esquerda laranja sutil
- Texto: "Almoço desde 12:15"

**Ausente**
- Cor: #8E8E93 (cinza neutro)
- Dot: ○ (empty circle)
- Background card: sem borda colorida
- Texto: "Ausente hoje"

**Deslocamento**
- Cor: #007AFF (azul)
- Dot: ◎ (circle with dot)
- Background card: borda esquerda azul sutil
- Texto: "Em deslocamento"

### Implementação Visual
```css
.card-trabalhando {
  border-left: 3px solid #34C759;
}

.card-pausa {
  border-left: 3px solid #FF9500;
}

.card-deslocamento {
  border-left: 3px solid #007AFF;
}

.card-ausente {
  opacity: 0.6;
}
```

---

## 🔄 5. INTERAÇÕES PRINCIPAIS

### Tocar no Card
**Ação**: Abre modal de detalhes do funcionário

**Modal de Detalhes**
```
┌─────────────────────────────────────────────────────────┐
│  João Silva                                       [X]   │
│  Operador                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Histórico do Dia]                                    │
│  08:00  Entrada                                         │
│  12:00  Saída para almoço                              │
│  13:00  Volta do almoço                                 │
│                                                         │
│  [Valor Acumulado]                                     │
│  R$ 75,00                                               │
│  Diária base: R$ 150,00                                │
│                                                         │
│  [Localização Atual]                                   │
│  Pátio A - Setor 3                                     │
│  Atualizado há 2 min                                    │
│                                                         │
│  [Ações Rápidas]                                       │
│  [Corrigir Ponto]  [Ver Histórico Completo]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Bater Ponto
**Fluxo**:
1. Toca em "Bater Ponto"
2. Sistema captura localização
3. Modal de confirmação aparece
4. Mostra: data, hora, localização, tipo de ponto
5. Botão "Confirmar Ponto"
6. Feedback visual imediato
7. Card atualiza em tempo real

**Modal de Ponto**
```
┌─────────────────────────────────────────────────────────┐
│  Registrar Ponto                                  [X]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Ícone Clock Grande]                                  │
│                                                         │
│  14:32                                                  │
│  Segunda-feira, 02 de fevereiro                        │
│                                                         │
│  Tipo: Volta do Almoço                                 │
│  Local: Pátio A - Setor 3                              │
│                                                         │
│  [Confirmar Ponto]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Gerenciar Equipe
**Ação**: Navega para tela de gestão completa
- Adicionar funcionário
- Editar informações
- Ver histórico completo
- Configurar permissões

---

## 📱 6. ESTADOS DA INTERFACE

### Estado Vazio (Sem Funcionários)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Ícone Users]                        │
│                                                         │
│              Nenhum funcionário cadastrado              │
│                                                         │
│  Adicione funcionários para começar a gerenciar        │
│  a equipe e registrar pontos.                          │
│                                                         │
│                  [Adicionar Funcionário]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado: Todos Ausentes
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Visão Geral]                                         │
│  12 total  •  0 trabalhando  •  0 pausa  •  12 ausentes│
│                                                         │
│  [Mensagem Sutil]                                      │
│  Nenhum funcionário trabalhando no momento             │
│                                                         │
│  [Lista de Ausentes com opacidade reduzida]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado: Erro de Localização
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Localização não disponível                        │
│                                                         │
│  Para registrar ponto, é necessário permitir           │
│  acesso à localização.                                 │
│                                                         │
│                  [Permitir Localização]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado: Ponto Offline
```
┌─────────────────────────────────────────────────────────┐
│  📡  Sem conexão                                        │
│                                                         │
│  O ponto será registrado assim que a conexão          │
│  for restabelecida.                                    │
│                                                         │
│  Pontos pendentes: 2                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estado: Carregando
- Skeleton screens elegantes
- Animação de pulse suave
- Sem spinners genéricos

---

## 🎭 7. MICROINTERAÇÕES

### Transições de Status
```css
.status-dot {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-dot.changing {
  animation: statusPulse 0.6s ease-in-out;
}

@keyframes statusPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
```

### Feedback de Ponto Registrado
```css
.ponto-registrado {
  animation: pontoSuccess 0.8s ease-out;
}

@keyframes pontoSuccess {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
```

### Hover no Card
- Elevação suave (2px)
- Sombra aumenta
- Seta de navegação fica mais escura
- Duração: 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Pull to Refresh
- Indicador circular elegante
- Animação de rotação suave
- Feedback háptico (se disponível)
- Mensagem: "Atualizando..."

---

## 🎨 8. PALETA DE CORES

### Cores Principais
- **Fundo**: #FAFAFA (off-white)
- **Cards**: #FFFFFF
- **Texto Principal**: #000000
- **Texto Secundário**: #666666
- **Texto Terciário**: #999999
- **Bordas**: rgba(0,0,0,0.06)

### Cores de Status
- **Trabalhando**: #34C759
- **Pausa**: #FF9500
- **Ausente**: #8E8E93
- **Deslocamento**: #007AFF

### Cores de Ação
- **Primário**: #000000
- **Secundário**: rgba(0,0,0,0.04)
- **Sucesso**: #34C759
- **Alerta**: #FF9500
- **Erro**: #FF3B30

---

## 📝 9. TIPOGRAFIA

### Hierarquia
```
Título Principal: 34px, 700, -0.8px
Subtítulo: 17px, 400, -0.2px
Nome Funcionário: 17px, 600, -0.3px
Cargo: 14px, 400, -0.1px
Última Ação: 13px, 500
Valor: 15px, 700
Botão Primário: 16px, 600
Botão Secundário: 15px, 500
```

### Família
- **Principal**: -apple-system, BlinkMacSystemFont, 'SF Pro Display'
- **Texto**: -apple-system, BlinkMacSystemFont, 'SF Pro Text'
- **Números**: SF Mono (monospace para valores)

---

## 🔒 10. SEGURANÇA E CONFIANÇA

### Registro de Ponto
- Timestamp preciso (servidor)
- Geolocalização obrigatória
- Foto opcional (futuro)
- Não editável pelo funcionário
- Auditoria completa

### Feedback Visual
- Confirmação imediata
- Número do ponto registrado
- Hora exata
- Localização capturada
- Impossível duplicar

### Indicadores de Confiança
- "Ponto registrado com sucesso"
- Ícone de check verde
- Vibração háptica
- Som sutil (opcional)

---

## 📊 11. JUSTIFICATIVA PREMIUM

### Por que isso NÃO é uma lista comum?

**1. Linguagem Visual Viva**
- Status em tempo real
- Indicadores sutis e elegantes
- Cores com significado
- Hierarquia impecável

**2. Informação Densa mas Legível**
- Tudo visível em 2 segundos
- Sem cliques desnecessários
- Leitura rápida no pátio
- Uma mão, olhar rápido

**3. Confiança Imediata**
- Parece confiável
- Feedback claro
- Sem ambiguidade
- Registro auditável

**4. Microinterações Sofisticadas**
- Transições suaves
- Feedback tátil
- Animações funcionais
- Nada decorativo

**5. Consistência com Straxis**
- Mesmo DNA visual
- Paleta coerente
- Comportamentos previsíveis
- Padrão premium

**6. Mobile-First Absoluto**
- Uso com uma mão
- Touch targets grandes
- Leitura rápida
- Ações diretas

### Comparação Visual

**Lista Comum**:
- Linhas de tabela
- Texto pequeno
- Status só texto
- Sem hierarquia
- Parece web

**Straxis /equipe**:
- Cards flutuantes
- Hierarquia clara
- Status visual
- Informação densa
- Parece app nativo

---

## 🚀 PRÓXIMOS PASSOS

1. Criar `EquipePageCore.tsx`
2. Criar `EquipePageCore.css`
3. Implementar componentes:
   - `TeamMemberCard.tsx`
   - `TeamOverview.tsx`
   - `PontoModal.tsx`
   - `MemberDetailsModal.tsx`
4. Integrar com backend
5. Adicionar geolocalização
6. Implementar offline-first
7. Adicionar testes

---

## ✅ CHECKLIST DE QUALIDADE

- [ ] Parece app nativo iOS?
- [ ] Leitura rápida (< 2s)?
- [ ] Uso com uma mão?
- [ ] Status claro em 0.5s?
- [ ] Ponto confiável?
- [ ] Microinterações suaves?
- [ ] Consistente com Straxis?
- [ ] Mobile-first?
- [ ] Offline-first?
- [ ] Parece premium?

Se todas as respostas forem SIM, o design está aprovado.

---

**Este documento define o padrão de qualidade para módulos operacionais do Straxis.**

**A aba /equipe é o coração humano do sistema.**
