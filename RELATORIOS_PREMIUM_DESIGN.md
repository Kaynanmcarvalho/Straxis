# REDESIGN COMPLETO: ABA /RELATÓRIOS
**Sistema:** Straxis SaaS  
**Versão:** Alpha 8.1.0  
**Data:** 29/01/2026  
**Designer:** Product Designer & UX Architect Sênior  
**Especialidade:** Sistemas Operacionais Premium, Mobile-First, Apple-like Design

---

## 🎯 MANIFESTO DO REDESIGN

A aba /relatórios NÃO é um dashboard.  
NÃO é um gráfico bonito.  
NÃO é uma tela de filtros.

**É um MÓDULO DE INTELIGÊNCIA, AUDITORIA E DECISÃO PROFISSIONAL.**

Este é o módulo que define se o Straxis é profissional ou amador.  
Este é o módulo onde o dono confia ou desconfia.  
Este é o módulo que gera pagamentos, conferências e decisões.

**Se parecer SaaS genérico, falhou.**

---

## 📱 CONTEXTO OPERACIONAL REAL

### O Dono:
- Trabalha fisicamente no pátio
- Usa celular com luvas ou mãos sujas
- Não tem tempo para "brincar com filtro"
- Precisa bater o olho e entender os números
- Usa relatórios para: conferência, pagamento, decisão
- Confia no que vê ou abandona o sistema

### O Ambiente:
- Mobile-first absoluto (80% do uso)
- Luz solar direta (legibilidade crítica)
- Interrupções constantes (leitura rápida)
- Decisões sob pressão (clareza essencial)

---

## 🏗️ ESTRUTURA COMPLETA DA ABA

### 1. NAVEGAÇÃO SUPERIOR (STICKY)

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← Relatórios                    [···]  │
│  Análise operacional e financeira       │
└─────────────────────────────────────────┘
```

**Especificações:**
- Background: `rgba(255, 255, 255, 0.98)`
- Backdrop-filter: `blur(20px) saturate(180%)`
- Border-bottom: `0.33px solid rgba(0, 0, 0, 0.1)`
- Padding: `20px`
- Position: `sticky`, `top: 0`, `z-index: 100`

**Título:**
- Font-size: `34px`
- Font-weight: `700`
- Color: `#000`
- Letter-spacing: `-0.8px`
- Line-height: `1`

**Subtítulo:**
- Font-size: `13px`
- Font-weight: `400`
- Color: `#8E8E93`
- Letter-spacing: `-0.08px`
- Margin-top: `4px`

**Botão Menu (···):**
- Width/Height: `36px`
- Background: `rgba(0, 0, 0, 0.04)`
- Border-radius: `50%`
- Ações: Exportar, Histórico, Configurações

---

### 2. SELETOR DE PERÍODO (CARDS INTERATIVOS)

**Conceito:** NÃO é um filtro web. São CARDS SELECIONÁVEIS como no Apple Calendar.

**Layout:**
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│ Hoje │ │Semana│ │ Mês  │ │Personaliz│
└──────┘ └──────┘ └──────┘ └──────────┘
```

**Especificações de cada card:**
- Width: `auto` (flex: 1)
- Height: `72px`
- Background (não selecionado): `#FFF`
- Background (selecionado): `linear-gradient(135deg, #007AFF 0%, #0051D5 100%)`
- Border-radius: `16px`
- Box-shadow (não selecionado): `0 2px 8px rgba(0, 0, 0, 0.06)`
- Box-shadow (selecionado): `0 4px 16px rgba(0, 122, 255, 0.35)`
- Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**Conteúdo do card:**
- Label (topo): `12px`, `#8E8E93` (ou `#FFF` se selecionado)
- Valor (centro): `20px`, `600`, `#000` (ou `#FFF` se selecionado)
- Exemplo: "Hoje" / "29 Jan"

**Interação:**
- Tap: seleciona período
- Feedback: escala 0.97
- Se "Personalizado": abre modal de date picker nativo

---

### 3. FILTROS SECUNDÁRIOS (CHIPS ELEGANTES)

**Conceito:** Filtros opcionais, não obrigatórios. Aparecem ABAIXO do seletor de período.

**Layout:**
```
🔍 Cliente    👤 Funcionário    📦 Tipo
```

**Especificações de cada chip:**
- Display: `inline-flex`
- Padding: `10px 16px`
- Background: `rgba(0, 0, 0, 0.04)`
- Border-radius: `12px`
- Font-size: `15px`
- Font-weight: `500`
- Color: `#3C3C43`
- Gap: `8px` entre chips

**Interação:**
- Tap: abre modal de busca/seleção
- Se selecionado: background `rgba(0, 122, 255, 0.1)`, color `#007AFF`
- Badge de contador: `(2)` se múltiplos selecionados

---

### 4. BOTÃO "GERAR ANÁLISE" (AÇÃO NATIVA)

**Conceito:** NÃO é um CTA de landing page. É uma ação nativa do sistema.

**Especificações:**
- Width: `100%`
- Height: `56px`
- Background: `linear-gradient(135deg, #007AFF 0%, #0051D5 100%)`
- Border-radius: `14px`
- Box-shadow: `0 4px 16px rgba(0, 122, 255, 0.35)`
- Font-size: `17px`
- Font-weight: `600`
- Color: `#FFF`
- Letter-spacing: `-0.3px`

**Label:** "Gerar Análise" (não "Gerar Relatório")

**Estados:**
- Hover: `translateY(-2px)`, shadow aumenta
- Active: `scale(0.98)`
- Loading: spinner branco, texto "Analisando..."
- Disabled: opacity `0.5`, não clicável

---

### 5. ESTADO VAZIO (PROFISSIONAL E CALMO)

**Conceito:** Quando nenhum relatório foi gerado ainda.

**Layout:**
```
        ┌─────────┐
        │   📊    │  (ícone minimalista)
        └─────────┘
        
    Nenhuma análise gerada
    
Selecione o período acima para
visualizar os dados operacionais
```

**Especificações:**
- Container: padding `80px 32px`
- Ícone: `80px x 80px`, background `rgba(0, 122, 255, 0.08)`, border-radius `24px`
- Título: `22px`, `600`, `#000`, letter-spacing `-0.5px`
- Descrição: `15px`, `400`, `#8E8E93`, line-height `1.5`, max-width `280px`

**Sem:**
- Ilustrações genéricas
- Textos motivacionais
- Botões desnecessários

---

### 6. RESULTADO DO RELATÓRIO (NÚCLEO DA TELA)

Quando o relatório é gerado, apresentar em **BLOCOS HIERÁRQUICOS**.

---

#### 6.1 RESUMO GERAL (HERO SECTION)

**Conceito:** Números grandes, claros, confiáveis. Primeira coisa que o olho vê.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Período: 23 - 29 Jan 2026              │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │    12    │  │  385.5t  │           │
│  │Trabalhos │  │Toneladas │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │R$ 24.850 │  │ R$ 1.200 │           │
│  │   Pago   │  │ Pendente │           │
│  └──────────┘  └──────────┘           │
└─────────────────────────────────────────┘
```

**Especificações do container:**
- Background: `#FFF`
- Border-radius: `20px`
- Box-shadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)`
- Padding: `24px`
- Margin-bottom: `20px`

**Período (topo):**
- Font-size: `15px`
- Font-weight: `500`
- Color: `#8E8E93`
- Margin-bottom: `20px`

**Cada métrica (card interno):**
- Background: `#F5F5F7`
- Border-radius: `16px`
- Padding: `20px`
- Display: `flex`, `flex-direction: column`, `align-items: center`

**Número (valor):**
- Font-size: `36px`
- Font-weight: `700`
- Color: `#000`
- Line-height: `1`
- Font-variant-numeric: `tabular-nums`

**Label (descrição):**
- Font-size: `13px`
- Font-weight: `500`
- Color: `#8E8E93`
- Margin-top: `8px`
- Text-align: `center`

**Cores semânticas:**
- Pago: número em `#34C759`
- Pendente: número em `#FF9500`

---

#### 6.2 QUEBRA POR CLIENTE (LISTA ELEGANTE)

**Conceito:** NÃO é uma tabela. É uma lista de cards tocáveis.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Por Cliente                      [>]   │
├─────────────────────────────────────────┤
│  Armazém Central                        │
│  5 trabalhos • 125.5t                   │
│  R$ 8.450,00                            │
├─────────────────────────────────────────┤
│  Distribuidora Norte                    │
│  4 trabalhos • 98.0t                    │
│  R$ 6.200,00                            │
├─────────────────────────────────────────┤
│  Logística Sul                          │
│  3 trabalhos • 162.0t                   │
│  R$ 10.200,00                           │
└─────────────────────────────────────────┘
```

**Especificações do container:**
- Background: `#FFF`
- Border-radius: `20px`
- Box-shadow: `0 4px 16px rgba(0, 0, 0, 0.08)`
- Padding: `0` (padding nos itens)
- Margin-bottom: `20px`

**Header:**
- Padding: `20px 24px`
- Border-bottom: `0.5px solid rgba(0, 0, 0, 0.08)`
- Font-size: `17px`
- Font-weight: `600`
- Color: `#000`
- Ícone `>`: `#8E8E93`, tap para expandir/colapsar

**Cada item:**
- Padding: `20px 24px`
- Border-bottom: `0.5px solid rgba(0, 0, 0, 0.06)` (exceto último)
- Transition: `background 0.2s ease`
- Hover/Active: background `rgba(0, 0, 0, 0.02)`

**Nome do cliente:**
- Font-size: `17px`
- Font-weight: `600`
- Color: `#000`
- Margin-bottom: `6px`

**Detalhes (trabalhos e toneladas):**
- Font-size: `14px`
- Font-weight: `400`
- Color: `#8E8E93`
- Separator: ` • `

**Valor:**
- Font-size: `19px`
- Font-weight: `600`
- Color: `#34C759`
- Margin-top: `8px`
- Font-variant-numeric: `tabular-nums`

**Interação:**
- Tap: navega para visão detalhada do cliente
- Feedback: background muda, escala 0.99

---

#### 6.3 QUEBRA POR FUNCIONÁRIO (LISTA ELEGANTE)

**Conceito:** Mesma estrutura da quebra por cliente, mas com dados de funcionário.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Por Funcionário                  [>]   │
├─────────────────────────────────────────┤
│  João Silva                             │
│  5 diárias • 2 meias                    │
│  R$ 850,00                              │
├─────────────────────────────────────────┤
│  Maria Santos                           │
│  6 diárias • 0 meias                    │
│  R$ 900,00                              │
├─────────────────────────────────────────┤
│  Pedro Costa                            │
│  4 diárias • 1 meia                     │
│  R$ 675,00                              │
└─────────────────────────────────────────┘
```

**Especificações:** Idênticas à quebra por cliente.

**Diferenças:**
- Detalhes: "X diárias • Y meias"
- Valor: sempre em verde (pagamento)
- Tap: navega para histórico do funcionário

---

#### 6.4 EXCEÇÕES E ALERTAS (SEÇÃO DESTACADA)

**Conceito:** Informações que precisam de atenção, mas sem poluir o resumo principal.

**Layout:**
```
┌─────────────────────────────────────────┐
│  ⚠️ Exceções e Ajustes                  │
├─────────────────────────────────────────┤
│  🔴 3 faltas registradas                │
│  🟡 2 ajustes de tonelagem              │
│  🟢 1 trabalho cancelado                │
└─────────────────────────────────────────┘
```

**Especificações:**
- Background: `rgba(255, 149, 0, 0.05)`
- Border: `1px solid rgba(255, 149, 0, 0.15)`
- Border-radius: `16px`
- Padding: `16px 20px`
- Margin-bottom: `20px`

**Header:**
- Font-size: `15px`
- Font-weight: `600`
- Color: `#FF9500`
- Margin-bottom: `12px`

**Cada item:**
- Font-size: `14px`
- Font-weight: `400`
- Color: `#3C3C43`
- Padding: `8px 0`
- Display: `flex`, `align-items: center`, `gap: 8px`

**Ícones:**
- 🔴 Crítico: `#FF3B30`
- 🟡 Atenção: `#FF9500`
- 🟢 Info: `#34C759`

**Interação:**
- Tap: abre modal com detalhes da exceção

---

### 7. EXPORTAÇÃO (INTEGRADA AO DESIGN)

**Conceito:** Exportação é parte do sistema, não um botão jogado.

**Acesso:** Menu (···) no topo direito

**Opções:**
```
┌─────────────────────────────────────────┐
│  📄 Exportar PDF                        │
│  📊 Resumo Semanal                      │
│  💰 Fechamento Diário                   │
│  📧 Enviar por Email                    │
└─────────────────────────────────────────┘
```

**Especificações do modal:**
- Background: `#FFF`
- Border-radius: `20px 20px 0 0` (mobile) ou `20px` (desktop)
- Box-shadow: `0 -8px 32px rgba(0, 0, 0, 0.15)`
- Padding: `24px`

**Cada opção:**
- Padding: `16px`
- Border-radius: `12px`
- Background (hover): `rgba(0, 0, 0, 0.04)`
- Font-size: `16px`
- Font-weight: `500`
- Color: `#000`
- Display: `flex`, `align-items: center`, `gap: 12px`

**Ícones:**
- Size: `20px`
- Color: `#007AFF`

---

## 🎨 PALETA DE CORES (MINIMALISTA E INTELIGENTE)

### Cores Principais:
- **Fundo:** `#FFFFFF` (branco puro)
- **Fundo Secundário:** `#F5F5F7` (off-white)
- **Fundo Terciário:** `#FAFAFA` (cinza muito claro)

### Cores de Texto:
- **Primário:** `#000000` (preto)
- **Secundário:** `#3C3C43` (cinza escuro)
- **Terciário:** `#8E8E93` (cinza médio)

### Cores Semânticas:
- **Positivo:** `#34C759` (verde Apple)
- **Atenção:** `#FF9500` (laranja Apple)
- **Crítico:** `#FF3B30` (vermelho Apple)
- **Info:** `#007AFF` (azul Apple)

### Cores de Ação:
- **Primary:** `linear-gradient(135deg, #007AFF 0%, #0051D5 100%)`
- **Secondary:** `rgba(0, 0, 0, 0.04)`

### Sombras:
- **Leve:** `0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)`
- **Média:** `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)`
- **Forte:** `0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)`

### Bordas:
- **Fina:** `0.33px solid rgba(0, 0, 0, 0.1)`
- **Média:** `0.5px solid rgba(0, 0, 0, 0.08)`
- **Separador:** `0.5px solid rgba(0, 0, 0, 0.06)`

---

## 📝 TIPOGRAFIA (SF PRO INSPIRED)

### Família:
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
```

### Hierarquia:

**Título Principal (H1):**
- Size: `34px`
- Weight: `700`
- Line-height: `1`
- Letter-spacing: `-0.8px`
- Color: `#000`

**Título Seção (H2):**
- Size: `22px`
- Weight: `600`
- Line-height: `1.2`
- Letter-spacing: `-0.5px`
- Color: `#000`

**Título Card (H3):**
- Size: `17px`
- Weight: `600`
- Line-height: `1.3`
- Letter-spacing: `-0.4px`
- Color: `#000`

**Número Grande (Métrica):**
- Size: `36px`
- Weight: `700`
- Line-height: `1`
- Letter-spacing: `-0.5px`
- Font-variant-numeric: `tabular-nums`

**Número Médio (Valor):**
- Size: `19px`
- Weight: `600`
- Line-height: `1.2`
- Font-variant-numeric: `tabular-nums`

**Corpo (Body):**
- Size: `15px`
- Weight: `400`
- Line-height: `1.5`
- Letter-spacing: `-0.2px`
- Color: `#3C3C43`

**Corpo Pequeno (Caption):**
- Size: `13px`
- Weight: `400`
- Line-height: `1.4`
- Letter-spacing: `-0.08px`
- Color: `#8E8E93`

**Label (Descrição):**
- Size: `12px`
- Weight: `500`
- Line-height: `1.3`
- Letter-spacing: `-0.05px`
- Color: `#8E8E93`
- Text-transform: `none`

---

## 🎭 COMPORTAMENTO DOS CARDS

### Elevação e Profundidade:
- Cards usam sombra real, não bordas grossas
- Separação por espaço (16-20px), não por linhas
- Hover: `translateY(-2px)`, sombra aumenta
- Active: `scale(0.99)`, sombra diminui

### Transições:
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Estados Interativos:
- **Repouso:** sombra leve, escala 1
- **Hover:** sombra média, translateY(-2px)
- **Active:** sombra leve, scale(0.99)
- **Disabled:** opacity 0.5, cursor not-allowed

### Feedback Tátil:
- Tap: escala 0.97 por 100ms
- Sucesso: pulso verde
- Erro: shake horizontal

---

## 🔄 ESTADOS DA INTERFACE

### 1. ESTADO VAZIO (INICIAL)
- Ícone minimalista
- Texto calmo e profissional
- Sem botões desnecessários
- Instrução clara

### 2. ESTADO CARREGANDO
- Skeleton screens (não spinners genéricos)
- Animação suave de pulse
- Texto: "Analisando dados..."
- Duração estimada se > 3s

### 3. ESTADO COM DADOS
- Animação de fade-in suave (300ms)
- Scroll suave entre seções
- Números animam de 0 ao valor final
- Transição elegante

### 4. ESTADO DE ERRO
- Ícone de alerta discreto
- Mensagem clara e acionável
- Botão "Tentar Novamente"
- Sem jargão técnico

### 5. ESTADO SEM DADOS (PERÍODO VAZIO)
- Diferente do estado inicial
- Mensagem: "Nenhum trabalho registrado neste período"
- Sugestão: "Tente outro período ou verifique os filtros"
- Botão: "Limpar Filtros"

---

## 🖱️ INTERAÇÕES INTELIGENTES

### Toque em Número (Métrica):
- Abre modal com breakdown detalhado
- Exemplo: tap em "12 Trabalhos" → lista dos 12 trabalhos
- Modal com animação slide-up

### Toque em Cliente:
- Navega para visão filtrada do cliente
- Mostra todos trabalhos daquele cliente
- Breadcrumb: Relatórios > Cliente X

### Toque em Funcionário:
- Navega para histórico do funcionário
- Mostra todas diárias e meias
- Gráfico de presença

### Toque em Exceção:
- Abre modal com detalhes
- Mostra: data, trabalho, motivo, responsável
- Opção: "Corrigir" ou "Marcar como Resolvido"

### Swipe em Item de Lista:
- Swipe left: ações rápidas (Detalhes, Exportar)
- Swipe right: marcar como revisado
- Feedback háptico

### Long Press em Card:
- Abre menu contextual
- Opções: Compartilhar, Exportar, Adicionar Nota
- Vibração leve

---

## 📱 MOBILE-FIRST REAL

### Legibilidade:
- Números: mínimo 19px
- Texto: mínimo 15px
- Labels: mínimo 13px
- Contraste: mínimo 4.5:1

### Área de Toque:
- Mínimo: 44px x 44px
- Recomendado: 48px x 48px
- Espaçamento: mínimo 8px entre elementos

### Scroll:
- Suave e natural
- Momentum scrolling
- Snap points em seções
- Pull-to-refresh para atualizar

### Orientação:
- Portrait: layout vertical
- Landscape: layout horizontal (2 colunas)
- Rotação suave sem perda de estado

### Performance:
- Lazy loading de seções
- Virtualização de listas longas
- Imagens otimizadas
- Animações com GPU

---

## 🔗 CONSISTÊNCIA COM O STRAXIS

### Visual:
- Mesma paleta de cores
- Mesma tipografia
- Mesmos border-radius (16px, 20px)
- Mesmas sombras

### Interação:
- Mesmos gestos (tap, swipe, long press)
- Mesmas transições (cubic-bezier)
- Mesmos feedbacks (escala, vibração)

### Navegação:
- Mesmo padrão de breadcrumb
- Mesmo padrão de modal
- Mesmo padrão de menu

### Componentes:
- Reutilizar Dock
- Reutilizar CoreCard
- Reutilizar EmptyState (adaptado)
- Reutilizar LoadingState

---

## ✅ CHECKLIST DE QUALIDADE

### Visual:
- [ ] Parece app nativo (não web)
- [ ] Fundo branco com profundidade real
- [ ] Hierarquia visual clara
- [ ] Números destacados sem poluição
- [ ] Cores usadas com propósito (não decoração)

### Funcional:
- [ ] Legível sem zoom
- [ ] Toque fácil (44px+)
- [ ] Scroll suave
- [ ] Feedback imediato
- [ ] Estados claros

### Profissional:
- [ ] Gera confiança
- [ ] Facilita decisão
- [ ] Permite auditoria
- [ ] Exportação integrada
- [ ] Sem jargão técnico

### Performance:
- [ ] Carrega < 2s
- [ ] Animações 60fps
- [ ] Sem lag no scroll
- [ ] Funciona offline (cache)

---

## 🎯 CONCLUSÃO: POR QUE ISSO PARECE UM APP PREMIUM?

### 1. PROFUNDIDADE REAL
Não usa bordas grossas ou gradientes exagerados. Usa sombras suaves e elevação real, como iOS.

### 2. TIPOGRAFIA HIERÁRQUICA
Números grandes e claros. Labels discretos. Textos secundários suaves. Nada grita.

### 3. ESPAÇO RESPIRA
Separação por espaço (16-20px), não por linhas. Cards têm padding generoso (20-24px).

### 4. CORES COM PROPÓSITO
Verde = positivo. Laranja = atenção. Vermelho = crítico. Azul = ação. Nunca decoração.

### 5. INTERAÇÕES NATURAIS
Tap, swipe, long press. Feedback tátil. Transições suaves. Como um app nativo.

### 6. CONFIANÇA VISUAL
Números grandes e legíveis. Fonte tabular. Alinhamento preciso. Sem ambiguidade.

### 7. MOBILE-FIRST REAL
Não é desktop espremido. É pensado para mobile desde o início. Legível, tocável, rápido.

### 8. CONSISTÊNCIA TOTAL
Conversa com /dashboard, /agenda, /trabalhos. Parece um sistema único, não módulos isolados.

### 9. ELEGÂNCIA SEM OSTENTAÇÃO
Bonito mas não chamativo. Elegante mas não pretensioso. Profissional mas não frio.

### 10. CLAREZA ABSOLUTA
Relatório bonito sem clareza é inútil. Este tem ambos. Números claros, hierarquia óbvia, decisão fácil.

---

**Este não é um redesign de tela.**  
**É a reconstrução de um módulo de inteligência profissional.**  
**É o módulo que define se o Straxis é premium ou genérico.**

---

**Assinado:**  
Product Designer & UX Architect Sênior  
Especialista em Sistemas Operacionais Premium  
29/01/2026 - 23:58
