# 🏆 FUNCIONÁRIOS LUXURY REDESIGN
## Sistema Premium de Gestão Humana — Centro de Controle de Pessoas

---

## 📐 CONCEITO VISUAL

### Filosofia de Design
A aba /funcionarios não é um CRUD de pessoas.  
É um **sistema vivo de gestão humana**.

Um centro de controle operacional que gerencia:
- Cadastro e acesso ao sistema
- Ponto digital com localização
- Status em tempo real
- Diárias e valores
- Permissões por cargo
- Histórico completo
- Faltas e exceções

Tudo isso com:
- **Confiabilidade absoluta**
- **Elegância nativa iOS**
- **Hierarquia visual impecável**
- **Operação rápida no pátio**
- **Auditoria completa**

### Princípios Fundamentais

1. **Identidade Visual Clara**  
   Cada funcionário tem presença visual única (avatar, cor, status)

2. **Confiança no Ponto Digital**  
   Registro preciso de data, hora e localização com feedback imediato

3. **Hierarquia de Informação**  
   Nome → Cargo → Status → Última ação → Valor → Permissões

4. **Gestão Sem Fricção**  
   Toque no card = acesso completo. Sem navegação confusa.

5. **Auditoria Transparente**  
   Todo registro é rastreável, visível e confiável

6. **Permissões Visuais**  
   Cargo e nível de acesso ficam claros na interface

---

## 🎨 LINGUAGEM VISUAL

### Paleta de Cores

**Base**
- Fundo: `#FFFFFF` (branco premium)
- Superfície: `#FAFAFA` (off-white sutil)
- Borda: `#F0F0F0` (separação elegante)
- Overlay: `rgba(0, 0, 0, 0.02)` (profundidade)

**Status (Microcores Sofisticadas)**
- Trabalhando: `#10B981` (verde confiável)
- Pausa: `#F59E0B` (âmbar suave)
- Deslocamento: `#3B82F6` (azul movimento)
- Ausente: `#94A3B8` (neutro discreto)
- Offline: `#64748B` (cinza técnico)
- Desativado: `#E2E8F0` (cinza claro)

**Permissões (Hierarquia Visual)**
- Admin: `#8B5CF6` (roxo autoridade)
- Líder: `#3B82F6` (azul liderança)
- Funcionário: `#64748B` (cinza padrão)

**Tipografia**
- Nome: `#0F172A` (preto profundo) — 600 weight
- Cargo: `#64748B` (cinza médio) — 500 weight
- Status: `#475569` (cinza escuro) — 500 weight
- Valor: `#10B981` (verde) — 600 weight
- Metadados: `#94A3B8` (cinza claro) — 400 weight

### Profundidade e Sombras

**Card de Funcionário**
```css
box-shadow: 
  0 1px 3px rgba(0, 0, 0, 0.04),
  0 1px 2px rgba(0, 0, 0, 0.02);
border-radius: 16px;
background: #FFFFFF;
```

**Card Ativo (hover/touch)**
```css
box-shadow: 
  0 4px 12px rgba(0, 0, 0, 0.06),
  0 2px 4px rgba(0, 0, 0, 0.03);
transform: translateY(-2px);
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

**Card Desativado**
```css
opacity: 0.6;
background: #F8FAFC;
border: 1px dashed #E2E8F0;
```


---

## 📱 ESTRUTURA DA TELA

### 1. CABEÇALHO PREMIUM (Topo Fixo)

```
┌─────────────────────────────────────┐
│  Funcionários              [•••]    │  ← Título + Menu
│  12 ativos · 8 trabalhando          │  ← Resumo discreto
│                                     │
│  [🎯 Bater Ponto]  [+ Adicionar]   │  ← CTAs nativos
└─────────────────────────────────────┘
```

**Especificações**
- Título "Funcionários": 28px, weight 700, tracking -0.5px
- Resumo: 14px, weight 400, color `#64748B`
- Botão "Bater Ponto": Primary, destaque visual forte
- Botão "Adicionar": Secondary, ícone + texto

**Comportamento**
- Sticky no scroll
- Transição suave ao rolar
- Botões sempre acessíveis
- Menu (•••) abre opções: Filtros, Exportar, Configurações

---

### 2. VISÃO GERAL (Resumo Compacto)

```
┌─────────────────────────────────────┐
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  │  12  │  │   8  │  │   2  │  │   2  │
│  │Total │  │Ativos│  │Pausa │  │Fora  │
│  └──────┘  └──────┘  └──────┘  └──────┘
└─────────────────────────────────────┘
```

**Especificações**
- Cards horizontais compactos
- Número: 24px, weight 700
- Label: 13px, weight 500, color `#64748B`
- Ícone sutil acima do número
- Espaçamento: 12px entre cards
- Scroll horizontal se necessário

**Indicadores**
- Total: ícone `Users` + número total de funcionários
- Ativos: ícone `Activity` + verde `#10B981` (trabalhando agora)
- Pausa: ícone `Coffee` + âmbar `#F59E0B` (em pausa/almoço)
- Fora: ícone `MapPin` + azul `#3B82F6` (deslocamento)
- Ausentes: ícone `UserX` + neutro `#94A3B8` (não bateram ponto)

---

### 3. FILTROS RÁPIDOS (Opcional, Discreto)

```
┌─────────────────────────────────────┐
│  [Todos] [Ativos] [Pausa] [Ausentes] [Desativados]
└─────────────────────────────────────┘
```

**Especificações**
- Pills horizontais
- Scroll horizontal suave
- Seleção única com highlight
- Transição suave ao filtrar (fade)
- Contador discreto em cada pill

---

### 4. LISTA DE FUNCIONÁRIOS (Core da Tela)

Cada funcionário aparece como um **card premium flutuante**.

```
┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │ KM│  Kaynan Moreira         [⚙️] │  ← Avatar + Nome + Menu
│  └───┘  Operador de Máquinas        │  ← Cargo
│         🔵 Admin                     │  ← Badge de permissão
│                                     │
│  🟢 Trabalhando                     │  ← Status visual
│  Entrada: 07:32 · Pátio Principal   │  ← Última ação + local
│  R$ 180,00 acumulado hoje           │  ← Valor do dia
│                                     │
│  [Ver Detalhes]                     │  ← CTA discreto
└─────────────────────────────────────┘
```

**Anatomia do Card**

1. **Avatar (64x64px)**
   - Iniciais em fonte system
   - Cor de fundo única por funcionário (hash do nome)
   - Borda sutil `#F0F0F0`
   - Foto se disponível (upload opcional)
   - Indicador de status (dot 12px no canto inferior direito)

2. **Nome (Destaque)**
   - 17px, weight 600, color `#0F172A`
   - Truncate com ellipsis se necessário
   - Máximo 2 linhas
   - Alinhado à esquerda

3. **Cargo (Discreto)**
   - 14px, weight 500, color `#64748B`
   - Abaixo do nome
   - Truncate se necessário

4. **Badge de Permissão**
   - Pill pequeno (24px altura)
   - Cor conforme nível (Admin/Líder/Funcionário)
   - Ícone + texto
   - Posicionado abaixo do cargo

5. **Status (Visual + Texto)**
   - Indicador circular 8px + label
   - Cores sutis conforme estado
   - 14px, weight 500
   - Ícone contextual (opcional)

6. **Última Ação de Ponto**
   - 13px, weight 400, color `#475569`
   - Formato: "Entrada: 07:32 · Pátio Principal"
   - Ícone de localização discreto
   - Timestamp relativo se recente ("há 2h")

7. **Valor Acumulado**
   - 15px, weight 600, color `#10B981`
   - Formato: "R$ 180,00 acumulado hoje"
   - Só aparece se houver valor configurado
   - Atualiza em tempo real

8. **Menu de Ações (⚙️)**
   - Ícone discreto no canto superior direito
   - Abre dropdown com:
     - Editar
     - Ver histórico completo
     - Marcar falta
     - Desativar/Reativar
     - Excluir (com confirmação)

**Espaçamento**
- Padding interno: 16px
- Margin entre cards: 12px
- Border-radius: 16px
- Gap entre elementos: 8px


---

## 🎯 HIERARQUIA DOS CARDS

### Ordem de Prioridade Visual

1. **Nome do Funcionário** (mais forte)
2. **Status Atual** (indicador visual + texto)
3. **Última Ação de Ponto** (contexto temporal + espacial)
4. **Valor Acumulado** (incentivo/métrica financeira)
5. **Cargo** (contexto funcional)
6. **Badge de Permissão** (nível de acesso)

### Agrupamento Inteligente

Os cards são organizados por status e ordem alfabética:

```
🟢 TRABALHANDO AGORA (8)
├─ Kaynan Moreira (Admin)
├─ João Silva (Líder)
├─ Maria Santos (Funcionário)
└─ ...

🟡 EM PAUSA (2)
├─ Pedro Costa (Funcionário)
└─ Ana Lima (Funcionário)

🔵 DESLOCAMENTO (2)
├─ Carlos Souza (Líder)
└─ Fernanda Rocha (Funcionário)

⚪ AUSENTES (0)
(nenhum funcionário ausente)

🔘 DESATIVADOS (3)
├─ Roberto Alves
├─ Juliana Mendes
└─ Marcos Oliveira
```

**Regras de Agrupamento**
- Trabalhando sempre no topo
- Pausa em segundo
- Deslocamento em terceiro
- Ausentes em quarto
- Desativados por último (colapsado por padrão)
- Dentro de cada grupo: ordem alfabética
- Separadores visuais sutis entre grupos (linha 1px `#F0F0F0`)

---

## 🔄 ESTADOS POSSÍVEIS

### 1. Estado Normal (Com Funcionários)

Lista completa de cards organizados por status.  
Scroll suave, transições fluidas, pull to refresh.

---

### 2. Estado Vazio (Sem Funcionários)

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Users 64px]          │
│                                     │
│    Nenhum funcionário cadastrado    │
│                                     │
│    Adicione membros à sua equipe    │
│    para começar a gerenciar ponto   │
│    e acessos ao sistema.            │
│                                     │
│      [+ Adicionar Funcionário]      │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Ícone: 64px, color `#CBD5E1`
- Título: 18px, weight 600, color `#475569`
- Descrição: 15px, weight 400, color `#64748B`, max-width 320px
- Botão: Primary, destaque
- Centralizado vertical e horizontalmente

---

### 3. Estado "Todos Ausentes"

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Moon 64px]           │
│                                     │
│    Nenhum funcionário trabalhando   │
│                                     │
│    Todos estão ausentes ou fora     │
│    do expediente no momento.        │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Ícone: 64px, color `#94A3B8`
- Mensagem clara e neutra
- Sem ação necessária
- Lista de funcionários ainda visível abaixo (colapsada)

---

### 4. Estado "Funcionário Desativado"

Card com visual diferenciado:

```
┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │ RA│  Roberto Alves          [⚙️] │
│  └───┘  Operador                    │
│                                     │
│  ⚫ Desativado                       │
│  Última atividade: 15/01/2026       │
│                                     │
│  [Reativar Funcionário]             │
└─────────────────────────────────────┘
```

**Especificações**
- Opacity: 0.6
- Background: `#F8FAFC`
- Border: 1px dashed `#E2E8F0`
- Status: cinza neutro
- CTA para reativar visível

---

### 5. Estado "Erro de Localização"

Banner no topo da tela:

```
┌─────────────────────────────────────┐
│  ⚠️  Localização não disponível     │
│                                     │
│  O ponto digital requer acesso à    │
│  localização para funcionar.        │
│                                     │
│      [Permitir Localização]         │
└─────────────────────────────────────┘
```

**Especificações**
- Banner amarelo suave (`#FEF3C7`)
- Borda: `#FCD34D`
- Ícone de alerta
- Mensagem clara sobre o problema
- CTA para resolver
- Não bloqueia visualização da lista

---

### 6. Estado "Ponto Fora do Horário"

Modal de confirmação ao bater ponto:

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Clock]               │
│                                     │
│      Ponto Fora do Horário          │
│                                     │
│  Você está registrando ponto fora   │
│  do horário padrão (07:00 - 18:00). │
│                                     │
│  Deseja continuar?                  │
│                                     │
│      [Sim, Registrar]               │
│      [Cancelar]                     │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Modal centralizado
- Backdrop blur
- Ícone âmbar
- Mensagem clara
- Confirmação explícita necessária

---

### 7. Estado "Ponto Fora da Localização"

Modal de alerta ao bater ponto:

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone MapPin]              │
│                                     │
│    Localização Não Reconhecida      │
│                                     │
│  Você está fora das áreas           │
│  permitidas para registro de ponto. │
│                                     │
│  Localização atual:                 │
│  📍 Rua Exemplo, 123                │
│                                     │
│  Locais permitidos:                 │
│  • Pátio Principal                  │
│  • Escritório                       │
│                                     │
│      [Registrar Mesmo Assim]        │
│      [Cancelar]                     │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Modal centralizado
- Ícone vermelho suave
- Lista de locais permitidos
- Opção de override (com log de auditoria)
- Confirmação explícita

---

### 8. Estado "Modo Offline"

Banner discreto no topo:

```
┌─────────────────────────────────────┐
│  📡  Modo Offline                   │
│                                     │
│  Pontos serão sincronizados quando  │
│  a conexão for restaurada.          │
│                                     │
│  [2 registros pendentes]            │
└─────────────────────────────────────┘
```

**Especificações**
- Banner azul suave (`#DBEAFE`)
- Borda: `#93C5FD`
- Não bloqueia uso
- Indicador de sincronização pendente
- Contador de registros na fila
- Auto-dismiss quando sincronizar

---

### 9. Estado "Carregando"

Skeleton loading elegante:

```
┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │░░░│  ░░░░░░░░░░░░░░░░░░░░       │
│  └───┘  ░░░░░░░░░░░░                │
│         ░░░░░░                      │
│                                     │
│  ░░░░░░░░░░░                        │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░         │
│  ░░░░░░░░░░░░░░░░░░░░               │
└─────────────────────────────────────┘
```

**Especificações**
- Shimmer suave (gradiente animado)
- Mantém estrutura do card
- Transição suave para conteúdo real
- Sem flash ou jump
- 3-5 skeleton cards visíveis


---

## 🎬 FLUXOS PRINCIPAIS

### FLUXO 1: Adicionar Novo Funcionário

**Passo 1: Toque em "+ Adicionar"**

Modal slide-up com formulário:

```
┌─────────────────────────────────────┐
│  [X]  Novo Funcionário              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Foto]  Adicionar foto      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nome Completo *                    │
│  ┌─────────────────────────────┐   │
│  │ Kaynan Moreira              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Cargo *                            │
│  ┌─────────────────────────────┐   │
│  │ Operador de Máquinas ▼      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nível de Acesso *                  │
│  ○ Funcionário (apenas ponto)       │
│  ○ Líder (visualiza equipe)         │
│  ○ Admin (controle total)           │
│                                     │
│  Valor da Diária (opcional)         │
│  ┌─────────────────────────────┐   │
│  │ R$ 150,00                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Telefone (opcional)                │
│  ┌─────────────────────────────┐   │
│  │ (62) 99451-0649             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Email (para login) *               │
│  ┌─────────────────────────────┐   │
│  │ kaynan@straxis.com          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Senha Inicial *                    │
│  ┌─────────────────────────────┐   │
│  │ ••••••••                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Cancelar]  [Criar Funcionário]   │
└─────────────────────────────────────┘
```

**Passo 2: Validação**
- Nome: obrigatório, mínimo 3 caracteres
- Cargo: obrigatório, seleção de lista
- Nível de acesso: obrigatório, radio button
- Email: obrigatório, formato válido, único no sistema
- Senha: obrigatório, mínimo 6 caracteres
- Valor: opcional, formato monetário
- Telefone: opcional, formato brasileiro

**Passo 3: Confirmação**

Toast de sucesso:
```
✅ Funcionário criado com sucesso!
   Credenciais enviadas por email.
```

**Passo 4: Resultado**
- Card aparece na lista (animação fade-in)
- Email automático com credenciais
- Log de auditoria registrado

---

### FLUXO 2: Bater Ponto Digital

**Passo 1: Toque em "Bater Ponto"**

Sistema solicita localização (se necessário).

**Passo 2: Modal de Confirmação**

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Clock 64px]          │
│                                     │
│      Registrar Ponto                │
│                                     │
│  📍 Pátio Principal                 │
│  🕐 07:32                            │
│  📅 Segunda, 2 de fevereiro         │
│                                     │
│  Tipo de Registro:                  │
│  ● Entrada                          │
│  ○ Saída                            │
│  ○ Início de Pausa                  │
│  ○ Retorno de Pausa                 │
│                                     │
│  Observação (opcional)              │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│      [Confirmar Registro]           │
│      [Cancelar]                     │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Localização detectada automaticamente
- Horário em tempo real
- Tipo de registro inteligente (sugere baseado no último)
- Observação opcional (máx 200 caracteres)
- Validações:
  - Não permite ponto duplicado (mesmo tipo em < 5min)
  - Alerta se fora do horário
  - Alerta se fora da localização permitida

**Passo 3: Processamento**

Loading state:
```
┌─────────────────────────────────────┐
│                                     │
│         [Spinner]                   │
│                                     │
│      Registrando ponto...           │
│                                     │
└─────────────────────────────────────┘
```

**Passo 4: Feedback de Sucesso**

```
┌─────────────────────────────────────┐
│                                     │
│         [Check Verde 64px]          │
│                                     │
│      Ponto Registrado!              │
│                                     │
│  Entrada às 07:32                   │
│  📍 Pátio Principal                 │
│                                     │
│  Registro #1247                     │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Haptic feedback forte
- Animação de sucesso (check verde scale-in)
- Auto-dismiss após 2s
- Card do funcionário atualiza imediatamente
- Número de registro para auditoria

**Passo 5: Modo Offline (se sem conexão)**

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Cloud Off]           │
│                                     │
│      Ponto Salvo Localmente         │
│                                     │
│  Será sincronizado quando a         │
│  conexão for restaurada.            │
│                                     │
│  Entrada às 07:32                   │
│  📍 Pátio Principal                 │
│                                     │
└─────────────────────────────────────┘
```

**Especificações**
- Salva no IndexedDB local
- Indicador visual de pendência
- Sincronização automática em background
- Notificação quando sincronizar

---

### FLUXO 3: Ver Detalhes do Funcionário

**Passo 1: Toque no Card**

Modal/drawer slide-up com detalhes completos:

```
┌─────────────────────────────────────┐
│  [X]                                │
│                                     │
│  ┌───┐                              │
│  │ KM│  Kaynan Moreira              │
│  └───┘  Operador de Máquinas        │
│         🔵 Admin                     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📍 Status Atual                    │
│  🟢 Trabalhando desde 07:32         │
│  📍 Pátio Principal                 │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⏱️ Histórico de Hoje               │
│  • Entrada: 07:32 (Pátio)           │
│  • Pausa: 12:00 (Refeitório)        │
│  • Retorno: 13:00 (Refeitório)      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💰 Financeiro                      │
│  Valor da diária: R$ 150,00         │
│  Acumulado hoje: R$ 180,00          │
│  Total do mês: R$ 3.600,00          │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📊 Estatísticas do Mês             │
│  • Dias trabalhados: 22             │
│  • Horas totais: 176h               │
│  • Média diária: 8h                 │
│  • Faltas: 0                        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔐 Acesso e Permissões             │
│  Email: kaynan@straxis.com          │
│  Nível: Admin (controle total)      │
│  Último login: Hoje às 07:30        │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  [Ver Histórico Completo]           │
│  [Editar Funcionário]               │
│  [Marcar Falta]                     │
│  [Desativar]                        │
│                                     │
└─────────────────────────────────────┘
```

**Comportamento**
- Slide up animation (iOS-like)
- Backdrop blur sutil
- Swipe down para fechar
- Scroll interno se necessário
- Transição suave (300ms)

---

### FLUXO 4: Editar Funcionário

**Passo 1: Toque em "Editar Funcionário"**

Modal com formulário pré-preenchido (igual ao de criação).

**Passo 2: Alterações**
- Todos os campos editáveis
- Senha: campo separado "Redefinir senha"
- Validações em tempo real

**Passo 3: Confirmação**

Toast de sucesso:
```
✅ Funcionário atualizado com sucesso!
```

**Passo 4: Resultado**
- Card atualiza imediatamente
- Log de auditoria registrado
- Notificação para o funcionário (se email alterado)

---

### FLUXO 5: Marcar Falta

**Passo 1: Toque em "Marcar Falta"**

Modal de confirmação:

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Calendar X]          │
│                                     │
│      Marcar Falta                   │
│                                     │
│  Funcionário: Kaynan Moreira        │
│                                     │
│  Data da Falta                      │
│  ┌─────────────────────────────┐   │
│  │ 02/02/2026              📅  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tipo de Falta                      │
│  ○ Falta Justificada                │
│  ○ Falta Não Justificada            │
│  ○ Atestado Médico                  │
│  ○ Licença                          │
│                                     │
│  Observação (opcional)              │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ Esta ação afetará o cálculo     │
│     de diárias e relatórios.        │
│                                     │
│      [Cancelar]  [Confirmar]        │
│                                     │
└─────────────────────────────────────┘
```

**Passo 2: Confirmação**

Toast de sucesso:
```
✅ Falta registrada com sucesso!
```

**Passo 3: Resultado**
- Falta aparece no histórico
- Cálculo de diárias ajustado
- Log de auditoria registrado

---

### FLUXO 6: Desativar Funcionário

**Passo 1: Toque em "Desativar"**

Modal de confirmação crítica:

```
┌─────────────────────────────────────┐
│                                     │
│         [Ícone Alert Triangle]      │
│                                     │
│      Desativar Funcionário?         │
│                                     │
│  Kaynan Moreira será desativado     │
│  e não poderá mais:                 │
│                                     │
│  • Fazer login no sistema           │
│  • Bater ponto                      │
│  • Acessar dados                    │
│                                     │
│  O histórico será preservado e      │
│  você poderá reativar a qualquer    │
│  momento.                           │
│                                     │
│  Motivo (opcional)                  │
│  ┌─────────────────────────────┐   │
│  │ Desligamento                │   │
│  └─────────────────────────────┘   │
│                                     │
│      [Cancelar]  [Desativar]        │
│                                     │
└─────────────────────────────────────┘
```

**Passo 2: Confirmação**

Toast de sucesso:
```
✅ Funcionário desativado com sucesso!
```

**Passo 3: Resultado**
- Card move para seção "Desativados"
- Visual muda (opacity, dashed border)
- Login bloqueado imediatamente
- Log de auditoria registrado


---

## 🎨 USO DE CORES E TIPOGRAFIA

### Sistema de Cores por Status

**1. Trabalhando**
- Indicador: `#10B981` (verde confiável)
- Background sutil: `#ECFDF5` (verde 50)
- Borda: `#A7F3D0` (verde 200)
- Uso: status ativo, valores positivos, confirmações

**2. Pausa/Almoço**
- Indicador: `#F59E0B` (âmbar suave)
- Background sutil: `#FEF3C7` (âmbar 100)
- Borda: `#FCD34D` (âmbar 300)
- Uso: estado temporário, atenção neutra, avisos

**3. Deslocamento**
- Indicador: `#3B82F6` (azul movimento)
- Background sutil: `#DBEAFE` (azul 100)
- Borda: `#93C5FD` (azul 300)
- Uso: em trânsito, mobilidade, informação

**4. Ausente**
- Indicador: `#94A3B8` (neutro discreto)
- Background sutil: `#F8FAFC` (slate 50)
- Borda: `#E2E8F0` (slate 200)
- Uso: inativo, sem urgência, neutro

**5. Desativado**
- Indicador: `#64748B` (cinza técnico)
- Background sutil: `#F8FAFC` (slate 50)
- Borda: `#E2E8F0` dashed (slate 200)
- Uso: conta desativada, sem acesso

**6. Offline/Erro**
- Indicador: `#EF4444` (vermelho suave)
- Background sutil: `#FEE2E2` (vermelho 100)
- Borda: `#FCA5A5` (vermelho 300)
- Uso: problemas técnicos, erros críticos

### Sistema de Cores por Permissão

**Admin**
- Badge: `#8B5CF6` (roxo autoridade)
- Background: `#F3E8FF` (roxo 100)
- Ícone: `Shield` ou `Crown`

**Líder**
- Badge: `#3B82F6` (azul liderança)
- Background: `#DBEAFE` (azul 100)
- Ícone: `Star` ou `Users`

**Funcionário**
- Badge: `#64748B` (cinza padrão)
- Background: `#F1F5F9` (slate 100)
- Ícone: `User`

### Hierarquia Tipográfica

**Nível 1: Título da Página**
```css
font-size: 28px;
font-weight: 700;
letter-spacing: -0.5px;
color: #0F172A;
line-height: 1.2;
```

**Nível 2: Nome do Funcionário**
```css
font-size: 17px;
font-weight: 600;
color: #0F172A;
line-height: 1.3;
```

**Nível 3: Cargo**
```css
font-size: 14px;
font-weight: 500;
color: #64748B;
line-height: 1.4;
```

**Nível 4: Status/Ação**
```css
font-size: 14px;
font-weight: 500;
color: #475569;
line-height: 1.4;
```

**Nível 5: Metadados (hora, local)**
```css
font-size: 13px;
font-weight: 400;
color: #64748B;
line-height: 1.4;
```

**Nível 6: Valor Monetário**
```css
font-size: 15px;
font-weight: 600;
color: #10B981;
line-height: 1.3;
font-variant-numeric: tabular-nums;
```

**Nível 7: Badge de Permissão**
```css
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
line-height: 1;
```

**Nível 8: Resumo do Cabeçalho**
```css
font-size: 14px;
font-weight: 400;
color: #64748B;
line-height: 1.4;
```

### Família Tipográfica

**Sistema Nativo (Preferencial)**
```css
font-family: -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Helvetica Neue', 
             Arial, sans-serif;
```

**Fallback Web**
```css
font-family: 'Inter', system-ui, sans-serif;
```

### Espaçamento e Ritmo Vertical

**Micro (Dentro do Card)**
- Entre avatar e nome: 12px
- Entre nome e cargo: 4px
- Entre cargo e badge: 6px
- Entre badge e status: 12px
- Entre status e ação: 8px
- Entre ação e valor: 8px

**Macro (Entre Elementos)**
- Entre cabeçalho e resumo: 20px
- Entre resumo e filtros: 16px
- Entre filtros e lista: 20px
- Entre cards: 12px
- Entre grupos de status: 24px
- Padding lateral da tela: 16px

---

## 🏗️ MICROINTERAÇÕES

### 1. Transição de Card (Hover/Touch)

```css
.employee-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.employee-card:hover,
.employee-card:active {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.03);
}
```

**Comportamento**
- Elevação sutil ao tocar
- Sombra mais pronunciada
- Feedback visual imediato
- Sem delay perceptível

---

### 2. Mudança de Status (Tempo Real)

```css
.status-indicator {
  transition: all 0.3s ease-in-out;
}

.status-indicator.updating {
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
```

**Comportamento**
- Pulse suave ao atualizar
- Cor transiciona suavemente
- Texto atualiza sem flash
- Sincronização visual

---

### 3. Registro de Ponto (Feedback Completo)

**Sequência**
1. Botão pressionado → scale(0.95) + haptic
2. Modal aparece → slide up (300ms)
3. Confirmação → loading spinner
4. Sucesso → check verde + scale-in + haptic forte
5. Card atualiza → highlight sutil (fade)
6. Auto-dismiss → fade out (2s)

```css
.success-feedback {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% { 
    transform: scale(0.8); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.05); 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
}

.card-highlight {
  animation: highlightFade 2s ease-out;
}

@keyframes highlightFade {
  0% { 
    background: #ECFDF5; 
    border-color: #10B981; 
  }
  100% { 
    background: #FFFFFF; 
    border-color: #F0F0F0; 
  }
}
```

---

### 4. Pull to Refresh

```css
.refresh-indicator {
  transition: transform 0.2s ease-out;
}

.refresh-indicator.pulling {
  transform: rotate(180deg);
}

.refresh-indicator.refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Comportamento**
- Ícone rotaciona ao puxar
- Spinner suave ao atualizar
- Feedback tátil no trigger
- Retorno suave ao soltar

---

### 5. Skeleton Loading (Carregamento Inicial)

```css
.skeleton-card {
  background: linear-gradient(
    90deg,
    #F8FAFC 0%,
    #F1F5F9 50%,
    #F8FAFC 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Comportamento**
- Shimmer sutil e elegante
- Mantém estrutura do card
- Transição suave para conteúdo real
- Sem flash ou jump

---

### 6. Badge de Permissão (Hover)

```css
.permission-badge {
  transition: all 0.2s ease;
}

.permission-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

**Comportamento**
- Leve aumento ao hover
- Tooltip aparece explicando permissões
- Transição suave

---

### 7. Menu de Ações (Dropdown)

```css
.action-menu {
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-menu.open {
  opacity: 1;
  transform: translateY(0);
}
```

**Comportamento**
- Fade in + slide down
- Backdrop blur sutil
- Fecha ao clicar fora
- Transição suave

---

### 8. Filtros Rápidos (Seleção)

```css
.filter-pill {
  transition: all 0.2s ease;
}

.filter-pill.active {
  background: #0F172A;
  color: #FFFFFF;
  transform: scale(1.05);
}
```

**Comportamento**
- Mudança de cor suave
- Leve aumento ao selecionar
- Lista filtra com fade

---

### 9. Modal de Confirmação (Crítico)

```css
.critical-modal {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

**Comportamento**
- Shake sutil ao aparecer (ações críticas)
- Backdrop escuro (0.6 opacity)
- Botão de confirmação em vermelho
- Requer confirmação explícita


---

## 🔒 GARANTIAS DE CONFIABILIDADE DO PONTO

### 1. Registro Preciso de Data e Hora

**Implementação**
```typescript
const timestamp = new Date().toISOString();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const pontoData = {
  timestamp,
  timezone,
  timestampServer: null, // preenchido no backend
  timestampLocal: Date.now()
};
```

**Garantias**
- Timestamp ISO 8601 padrão
- Timezone do dispositivo registrado
- Timestamp do servidor como fonte de verdade
- Timestamp local para auditoria de discrepância

---

### 2. Captura de Localização Precisa

**Implementação**
```typescript
const location = await navigator.geolocation.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
});

const locationData = {
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy,
  altitude: location.coords.altitude,
  heading: location.coords.heading,
  speed: location.coords.speed,
  timestamp: location.timestamp
};
```

**Garantias**
- High accuracy mode ativado
- Timeout de 10s (não espera infinito)
- Sem cache de localização
- Precisão registrada (em metros)
- Dados completos de GPS

---

### 3. Validação de Localização Permitida

**Implementação**
```typescript
const allowedLocations = [
  { name: 'Pátio Principal', lat: -16.123, lng: -48.456, radius: 100 },
  { name: 'Escritório', lat: -16.124, lng: -48.457, radius: 50 }
];

function isLocationAllowed(lat: number, lng: number): boolean {
  return allowedLocations.some(loc => {
    const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
    return distance <= loc.radius;
  });
}
```

**Garantias**
- Geofencing por raio (metros)
- Múltiplas localizações permitidas
- Cálculo de distância preciso (Haversine)
- Override possível com log de auditoria

---

### 4. Prevenção de Ponto Duplicado

**Implementação**
```typescript
const lastPonto = await getLastPonto(funcionarioId);
const timeDiff = Date.now() - lastPonto.timestamp;
const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutos

if (timeDiff < MIN_INTERVAL && lastPonto.tipo === novoPonto.tipo) {
  throw new Error('Ponto duplicado detectado');
}
```

**Garantias**
- Intervalo mínimo de 5min entre pontos do mesmo tipo
- Validação no frontend e backend
- Mensagem clara ao usuário
- Log de tentativas duplicadas

---

### 5. Modo Offline Confiável

**Implementação**
```typescript
// Salvar localmente
await db.pontosPendentes.add({
  id: generateUUID(),
  funcionarioId,
  timestamp,
  location,
  tipo,
  synced: false,
  createdAt: Date.now()
});

// Sincronizar em background
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-pontos');
});
```

**Garantias**
- Salva no IndexedDB (persistente)
- UUID único para cada registro
- Flag de sincronização
- Background sync automático
- Retry com backoff exponencial
- Notificação quando sincronizar

---

### 6. Auditoria Completa

**Implementação**
```typescript
const auditLog = {
  action: 'PONTO_REGISTRADO',
  userId: funcionarioId,
  timestamp: new Date().toISOString(),
  data: {
    tipo: 'ENTRADA',
    location: locationData,
    device: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    },
    ip: await getClientIP(),
    companyId: currentCompany.id
  },
  metadata: {
    appVersion: '0.7.8',
    offline: !navigator.onLine
  }
};

await logService.create(auditLog);
```

**Garantias**
- Log completo de cada ação
- Dados do dispositivo registrados
- IP do cliente capturado
- Versão do app registrada
- Modo offline identificado
- Imutável (append-only)

---

### 7. Validação de Horário

**Implementação**
```typescript
const workingHours = {
  start: '07:00',
  end: '18:00',
  allowOutside: true, // permite com confirmação
  alertOutside: true
};

function isWithinWorkingHours(timestamp: Date): boolean {
  const hour = timestamp.getHours();
  const minute = timestamp.getMinutes();
  const time = hour * 60 + minute;
  
  const [startH, startM] = workingHours.start.split(':').map(Number);
  const [endH, endM] = workingHours.end.split(':').map(Number);
  
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  
  return time >= start && time <= end;
}
```

**Garantias**
- Validação de horário configurável
- Alerta visual se fora do horário
- Permite override com confirmação
- Log de pontos fora do horário

---

### 8. Sincronização Garantida

**Implementação**
```typescript
async function syncPontosPendentes() {
  const pendentes = await db.pontosPendentes
    .where('synced').equals(false)
    .toArray();
  
  for (const ponto of pendentes) {
    try {
      await api.post('/pontos', ponto);
      await db.pontosPendentes.update(ponto.id, { synced: true });
    } catch (error) {
      // Retry com backoff
      await scheduleRetry(ponto.id);
    }
  }
}
```

**Garantias**
- Fila de sincronização persistente
- Retry automático em caso de falha
- Backoff exponencial (1s, 2s, 4s, 8s...)
- Máximo 5 tentativas
- Notificação de falha após tentativas

---

### 9. Integridade de Dados

**Implementação**
```typescript
const pontoHash = crypto.subtle.digest('SHA-256', 
  JSON.stringify({
    funcionarioId,
    timestamp,
    location,
    tipo
  })
);

const ponto = {
  ...pontoData,
  hash: pontoHash,
  version: 1
};
```

**Garantias**
- Hash SHA-256 de cada registro
- Detecção de adulteração
- Versionamento de schema
- Validação de integridade no backend

---

### 10. Feedback Visual Confiável

**Implementação**
- ✅ Sucesso: Check verde + haptic forte + toast
- ⏳ Processando: Spinner + texto "Registrando..."
- 📡 Offline: Cloud off + texto "Salvo localmente"
- ⚠️ Erro: X vermelho + mensagem clara + retry
- 🔄 Sincronizando: Ícone sync + contador

**Garantias**
- Feedback imediato (< 100ms)
- Estado sempre visível
- Sem ambiguidade
- Ações claras em caso de erro

---

## 🎯 JUSTIFICATIVA DO DESIGN PREMIUM

### 1. Por que Fundo Branco?

**Razão Operacional**
- Uso em ambiente externo (pátio, sol direto)
- Legibilidade máxima em qualquer luz
- Contraste superior para leitura rápida
- Menos fadiga visual em uso prolongado

**Razão Estética**
- Sensação de limpeza e organização
- Profissionalidade e seriedade
- Padrão iOS nativo (confiança)
- Elegância atemporal

**Razão Técnica**
- Menor consumo de bateria (LCD)
- Melhor para screenshots e impressão
- Acessibilidade WCAG AAA
- Cores destacam melhor

---

### 2. Por que Cards Flutuantes?

**Hierarquia Visual**
- Cada funcionário é uma entidade única
- Separação clara entre pessoas
- Foco individual facilitado
- Escaneabilidade rápida

**Affordance de Interação**
- Parece tocável (convida à ação)
- Feedback visual claro ao tocar
- Padrão mobile estabelecido
- Usuário sabe que pode interagir

**Profundidade Elegante**
- Sombras sutis criam camadas
- Sensação de qualidade premium
- Diferenciação do fundo
- Modernidade sem exagero

---

### 3. Por que Status Visual (não só texto)?

**Cognição Rápida**
- Cor processa mais rápido que texto
- Padrão universal (verde = ok, vermelho = problema)
- Leitura periférica funciona
- Menos carga cognitiva

**Contexto Operacional**
- Dono olha rápido no celular
- Decisão em segundos
- Ambiente com distrações
- Informação deve saltar aos olhos

**Acessibilidade**
- Não depende só de cor (ícone + cor + texto)
- Funciona para daltônicos
- Redundância intencional
- WCAG AAA compliant

---

### 4. Por que Hierarquia Tipográfica Rígida?

**Escaneabilidade**
- Olho encontra informação em camadas
- Nome → Status → Detalhes
- Prioridade visual clara
- Leitura não-linear eficiente

**Consistência**
- Padrão previsível em todos os cards
- Aprendizado rápido
- Confiança no sistema
- Profissionalismo

**Performance Cognitiva**
- Menos decisões visuais
- Processamento automático
- Fadiga reduzida
- Uso prolongado confortável

---

### 5. Por que Microinterações Sutis?

**Feedback Imediato**
- Usuário sabe que tocou
- Sistema responde visivelmente
- Confiança na ação
- Reduz ansiedade

**Qualidade Percebida**
- Detalhes fazem diferença
- Sensação de cuidado
- Produto premium
- Diferenciação competitiva

**Engajamento**
- Interação prazerosa
- Uso não é tarefa chata
- Experiência memorável
- Fidelização natural

---

### 6. Por que Agrupamento por Status?

**Priorização Operacional**
- Trabalhando = mais importante
- Ausente = menos urgente
- Ordem reflete realidade operacional
- Decisões facilitadas

**Redução de Scroll**
- Informação crítica no topo
- Menos navegação necessária
- Acesso mais rápido
- Eficiência operacional

**Contexto Visual**
- Grupos criam narrativa
- "8 trabalhando, 2 em pausa"
- Visão geral instantânea
- Gestão facilitada

---

### 7. Por que Valor Acumulado no Card?

**Motivação**
- Funcionário vê progresso do dia
- Gamificação sutil
- Transparência total
- Reconhecimento imediato

**Gestão**
- Dono monitora custos em tempo real
- Planejamento financeiro
- Decisões informadas
- Controle de despesas

**Confiança**
- Cálculo visível e transparente
- Sem surpresas no fim do mês
- Transparência gera confiança
- Relacionamento saudável

---

### 8. Por que Badge de Permissão Visível?

**Clareza de Hierarquia**
- Quem é admin fica claro
- Quem é líder fica claro
- Evita confusão
- Respeito à hierarquia

**Segurança**
- Usuário sabe seu nível de acesso
- Evita tentativas de ações não permitidas
- Transparência de permissões
- Auditoria visual

**Gestão**
- Dono vê rapidamente quem tem acesso
- Facilita revisão de permissões
- Identificação rápida
- Controle visual

---

### 9. Por que Modal em vez de Nova Tela?

**Contexto Preservado**
- Usuário não perde lugar na lista
- Volta fácil (swipe down)
- Fluxo não quebra
- Menos desorientação

**Performance**
- Sem carregamento de página
- Transição instantânea
- Menos requisições
- Experiência fluida

**Padrão Mobile**
- iOS usa modals extensivamente
- Usuário já conhece o padrão
- Gesto de fechar natural
- Familiaridade

---

### 10. Por que Ponto Digital com Localização?

**Confiabilidade**
- Prova de presença física
- Anti-fraude (não pode bater de casa)
- Auditoria completa
- Segurança jurídica

**Operacional**
- Saber onde está a equipe
- Gestão de deslocamento
- Planejamento logístico
- Segurança do trabalho

**Transparência**
- Funcionário sabe que é registrado
- Dono tem certeza da presença
- Relação de confiança
- Profissionalismo

---

### 11. Por que Estados Vazios Cuidadosos?

**Primeira Impressão**
- Novo usuário vê qualidade
- Não parece quebrado
- Orientação clara
- Onboarding natural

**Confiança**
- Sistema funciona sempre
- Sem telas brancas
- Feedback constante
- Profissionalismo

**Educação**
- Usuário entende o que fazer
- Próximo passo claro
- Sem frustração
- Adoção facilitada

---

### 12. Por que Modo Offline Robusto?

**Realidade Operacional**
- Pátio pode ter sinal fraco
- Não pode bloquear trabalho
- Sincronização automática
- Confiabilidade total

**Confiança**
- Funcionário não perde registro
- Sistema sempre funciona
- Sem ansiedade
- Profissionalismo

**Técnico**
- IndexedDB persistente
- Background sync
- Retry automático
- Garantia de entrega


---

## 🎖️ DIFERENCIAL COMPETITIVO

### O que torna /funcionarios PREMIUM?

**1. Não é um CRUD**  
É um sistema vivo de gestão humana com ponto digital confiável

**2. Não é só funcional**  
É visualmente elegante e operacionalmente robusto

**3. Não é genérico**  
É desenhado para o contexto real de uso (pátio, pressa, confiança)

**4. Não é web**  
É nativo mobile em essência e comportamento

**5. Não é superficial**  
Cada detalhe tem propósito operacional e auditável

**6. Não é complicado**  
É sofisticado mas simples de usar no dia a dia

**7. Não é só bonito**  
É eficiente no pátio, sob sol, com uma mão, com pressa

**8. Não é descartável**  
É o módulo crítico de gestão de pessoas e ponto

**9. Não é isolado**  
Conversa com /agenda, /dashboard, /trabalhos, /relatorios

**10. Não é comum**  
É o padrão que outros sistemas vão tentar copiar

---

## 🔐 SISTEMA DE PERMISSÕES

### Níveis de Acesso

**1. Funcionário (Padrão)**
- Bater ponto próprio
- Ver histórico próprio
- Ver valor acumulado próprio
- Editar perfil próprio (limitado)
- Sem acesso a outros funcionários

**2. Líder (Intermediário)**
- Tudo do Funcionário +
- Ver equipe completa
- Ver status em tempo real
- Ver histórico da equipe
- Marcar faltas da equipe
- Sem editar permissões
- Sem desativar funcionários

**3. Admin (Total)**
- Tudo do Líder +
- Adicionar funcionários
- Editar funcionários
- Desativar/reativar funcionários
- Excluir funcionários
- Gerenciar permissões
- Configurar localizações permitidas
- Configurar horários de trabalho
- Exportar relatórios completos

### Validação de Permissões

**Frontend**
```typescript
const canEditEmployee = (user: User, employee: Employee) => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'LIDER' && user.id === employee.id) return true;
  if (user.role === 'FUNCIONARIO' && user.id === employee.id) return true;
  return false;
};
```

**Backend**
```typescript
// Middleware de autorização
const requireRole = (roles: Role[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissão negada' 
      });
    }
    next();
  };
};

// Uso nas rotas
router.post('/funcionarios', 
  requireRole(['ADMIN']), 
  createFuncionario
);
```

### Interface Visual de Permissões

**Badge no Card**
- Admin: Roxo + ícone Shield
- Líder: Azul + ícone Star
- Funcionário: Cinza + ícone User

**Tooltip ao Hover**
- Admin: "Controle total do sistema"
- Líder: "Visualiza e gerencia equipe"
- Funcionário: "Acesso básico (ponto próprio)"

**Modal de Edição**
- Radio buttons claros
- Descrição de cada nível
- Confirmação ao mudar para Admin
- Log de auditoria de mudanças

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Design
- [ ] Paleta de cores definida
- [ ] Tipografia especificada
- [ ] Sombras e profundidade
- [ ] Espaçamentos documentados
- [ ] Estados visuais mapeados
- [ ] Badges de permissão
- [ ] Ícones selecionados

### Componentes
- [ ] Card de funcionário
- [ ] Avatar system
- [ ] Status indicators
- [ ] Resumo compacto
- [ ] Cabeçalho premium
- [ ] Modal de detalhes
- [ ] Modal de ponto
- [ ] Modal de adicionar/editar
- [ ] Modal de marcar falta
- [ ] Modal de desativar
- [ ] Estados vazios
- [ ] Skeleton loading
- [ ] Filtros rápidos
- [ ] Menu de ações

### Interações
- [ ] Touch feedback
- [ ] Transições suaves
- [ ] Pull to refresh
- [ ] Swipe gestures
- [ ] Haptic feedback
- [ ] Animações de sucesso
- [ ] Animações de erro
- [ ] Loading states

### Funcionalidades Core
- [ ] Listagem de funcionários
- [ ] Agrupamento por status
- [ ] Adicionar funcionário
- [ ] Editar funcionário
- [ ] Desativar funcionário
- [ ] Reativar funcionário
- [ ] Excluir funcionário (soft delete)
- [ ] Marcar falta
- [ ] Filtros por status
- [ ] Busca por nome (opcional)

### Ponto Digital
- [ ] Bater ponto (entrada/saída/pausa/retorno)
- [ ] Captura de localização (GPS)
- [ ] Validação de localização permitida
- [ ] Validação de horário
- [ ] Prevenção de duplicação
- [ ] Modo offline robusto
- [ ] Sincronização automática
- [ ] Feedback visual imediato
- [ ] Histórico de ponto
- [ ] Auditoria completa

### Permissões
- [ ] Sistema de roles (Admin/Líder/Funcionário)
- [ ] Validação frontend
- [ ] Validação backend
- [ ] Badge visual de permissão
- [ ] Tooltip explicativo
- [ ] Edição de permissões (Admin only)
- [ ] Log de mudanças de permissão

### Financeiro
- [ ] Configurar valor de diária
- [ ] Calcular valor acumulado do dia
- [ ] Calcular total do mês
- [ ] Exibir no card
- [ ] Exibir no modal de detalhes
- [ ] Integração com relatórios

### Auditoria
- [ ] Log de criação
- [ ] Log de edição
- [ ] Log de desativação
- [ ] Log de reativação
- [ ] Log de exclusão
- [ ] Log de ponto
- [ ] Log de mudança de permissão
- [ ] Log de faltas
- [ ] Timestamp + user + IP + device

### Responsividade
- [ ] Mobile portrait (320px+)
- [ ] Mobile landscape
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)

### Performance
- [ ] Lazy loading de lista
- [ ] Virtualized list (se >100 itens)
- [ ] Otimização de imagens (avatar)
- [ ] Cache inteligente
- [ ] Offline-first
- [ ] Background sync
- [ ] Debounce em busca

### Acessibilidade
- [ ] Contraste WCAG AAA
- [ ] Labels semânticos
- [ ] Navegação por teclado
- [ ] Screen reader support
- [ ] Tamanhos de toque (44x44px)
- [ ] Focus visible
- [ ] Aria labels

### Testes
- [ ] Funcionários ativos
- [ ] Todos ausentes
- [ ] Lista vazia
- [ ] Funcionário desativado
- [ ] Erro de localização
- [ ] Ponto fora do horário
- [ ] Ponto fora da localização
- [ ] Modo offline
- [ ] Sincronização
- [ ] Ponto duplicado
- [ ] Mudança de status em tempo real
- [ ] Permissões (cada role)
- [ ] Validações de formulário

### Integração
- [ ] API de funcionários
- [ ] API de ponto
- [ ] API de localização
- [ ] API de permissões
- [ ] API de auditoria
- [ ] Firebase Auth
- [ ] Firestore (multi-tenant)
- [ ] IndexedDB (offline)
- [ ] Service Worker (sync)

---

## 🚀 PRÓXIMOS PASSOS

### Fase 1: Design e Prototipagem
1. Criar protótipo interativo (Figma/Framer)
2. Validar fluxos com stakeholders
3. Testar com usuários reais (5-10 pessoas)
4. Iterar baseado em feedback
5. Finalizar especificações visuais

### Fase 2: Implementação Core
1. Criar componentes base (Card, Avatar, Badge)
2. Implementar listagem e agrupamento
3. Implementar estados vazios
4. Implementar skeleton loading
5. Testar responsividade

### Fase 3: Ponto Digital
1. Implementar captura de localização
2. Implementar validações
3. Implementar modo offline
4. Implementar sincronização
5. Testar em dispositivos reais (Android + iOS)

### Fase 4: Gestão de Funcionários
1. Implementar CRUD completo
2. Implementar sistema de permissões
3. Implementar marcar falta
4. Implementar desativar/reativar
5. Testar fluxos completos

### Fase 5: Auditoria e Segurança
1. Implementar logs completos
2. Implementar validações de segurança
3. Implementar rate limiting
4. Testar tentativas de fraude
5. Revisar com time de segurança

### Fase 6: Integração e Testes
1. Integrar com /agenda
2. Integrar com /dashboard
3. Integrar com /trabalhos
4. Integrar com /relatorios
5. Testes E2E completos

### Fase 7: Refinamento e Lançamento
1. Otimizar performance
2. Ajustar microinterações
3. Revisar acessibilidade
4. Documentar para equipe
5. Treinar usuários
6. Lançar em produção
7. Monitorar métricas

---

## 📊 MÉTRICAS DE SUCESSO

### Quantitativas
- Tempo para bater ponto < 5s
- Tempo para encontrar funcionário < 3s
- Taxa de erro de ponto < 0.1%
- Taxa de sincronização offline > 99.9%
- Uso diário > 90% dos funcionários
- Satisfação (NPS) > 9/10
- Tempo de carregamento < 1s
- Taxa de falha de localização < 1%

### Qualitativas
- "Parece app profissional e confiável"
- "Confio 100% no registro de ponto"
- "Uso com uma mão facilmente no pátio"
- "Encontro informação em segundos"
- "Não parece sistema barato"
- "Nunca perdi um registro de ponto"
- "Interface é clara e elegante"
- "Melhor que sistemas caros que já usei"

### Operacionais
- Zero disputas sobre ponto registrado
- Redução de 90% em ajustes manuais
- Auditoria completa disponível sempre
- Conformidade legal 100%
- Tempo de onboarding < 5min
- Suporte técnico < 1 ticket/mês

---

## 🎨 INSPIRAÇÕES VISUAIS

### Referências de Qualidade
- **Apple Health**: Hierarquia, cards, dados de saúde sensíveis
- **Things 3**: Elegância, espaçamento, tipografia impecável
- **Linear**: Profundidade, microinterações, performance
- **Notion**: Organização, estados vazios, confiabilidade
- **Stripe Dashboard**: Dados financeiros, clareza, confiança
- **Gusto (RH)**: Gestão de pessoas, ponto, folha de pagamento

### O que NÃO copiar
- ❌ Listas genéricas de CRM
- ❌ Tabelas de RH tradicional
- ❌ Dashboards web pesados
- ❌ Apps de ponto antigos (Ahgora, Tangerino)
- ❌ Interfaces corporativas frias
- ❌ Formulários longos e confusos

---

## 🏆 CONCLUSÃO

A aba /funcionarios não é um módulo de cadastro.  
É o **sistema crítico de gestão humana** do Straxis.

É onde o dono:
- Gerencia sua equipe
- Controla ponto digital
- Monitora presença em tempo real
- Calcula custos de mão de obra
- Audita registros
- Confia nos dados

Por isso, ela precisa ser:
- **Confiável** como um sistema bancário
- **Elegante** como um produto Apple
- **Rápida** como um app nativo
- **Robusta** como um sistema crítico
- **Clara** como uma boa conversa
- **Auditável** como um sistema jurídico

Se conseguirmos isso, /funcionarios será:
- O módulo mais crítico
- O mais confiável
- O diferencial competitivo
- A razão para escolher Straxis
- O padrão do mercado

**Este é o padrão.**  
**Este é o objetivo.**  
**Este é o Straxis.**

---

*Documento criado em 02/02/2026*  
*Versão: 1.0*  
*Status: Pronto para Implementação*  
*Autor: Principal Product Designer*  
*Revisão: Pendente*
