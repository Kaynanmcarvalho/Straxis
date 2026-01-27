# Documento de Requisitos - Straxis SaaS

**Versão:** 1.1  
**Desenvolvedor Principal:** Kaynan Moreira  
**Colaborador:** Renier (a partir da task 6)

> **📝 Nota de Atualização:** Este documento é atualizado pela IA a cada 5 tasks concluídas. A IA registra automaticamente qual desenvolvedor (Kaynan ou Renier) implementou cada funcionalidade, baseando-se no usuário logado no momento da execução.

---

## Introdução

O Straxis é um sistema SaaS B2B mobile-first para gestão de operações de carga e descarga. O sistema oferece controle financeiro completo, gestão de funcionários, integração com WhatsApp via Baileys, e assistente de IA opcional (OpenAI/Google Gemini). A arquitetura é multi-tenant baseada em Firebase, com três níveis de usuários: Admin da Plataforma, Dono da Empresa e Usuário Comum.

## Glossário

- **Sistema**: O sistema Straxis completo
- **Admin_Plataforma**: Administrador proprietário do SaaS
- **Dono_Empresa**: Proprietário de uma empresa cliente
- **Usuario_Comum**: Funcionário operacional da empresa
- **Empresa**: Tenant/cliente do SaaS
- **Trabalho**: Registro de operação de carga ou descarga
- **Agendamento**: Planejamento futuro de trabalho
- **IA_Assistant**: Assistente de inteligência artificial integrado
- **WhatsApp_Integration**: Integração com WhatsApp via Baileys
- **Firestore**: Banco de dados Firebase Firestore
- **Plano**: Período de acesso contratado pela empresa (em meses)
- **Tonelagem**: Quantidade de carga em toneladas
- **Lucro**: Diferença entre valor recebido e valor pago aos funcionários

## Requisitos

### Requisito 1: Autenticação e Controle de Acesso Multi-Tenant

**User Story:** Como administrador do sistema, quero controlar o acesso de diferentes tipos de usuários em diferentes empresas, para garantir segurança e isolamento de dados.

#### Acceptance Criteria

1. THE Sistema SHALL autenticar usuários via Firebase Auth
2. WHEN um usuário faz login, THE Sistema SHALL identificar sua empresa e tipo de usuário
3. THE Sistema SHALL isolar completamente os dados entre diferentes empresas no Firestore
4. WHEN uma empresa tem plano vencido, THE Sistema SHALL bloquear acesso de todos os usuários dessa empresa
5. THE Sistema SHALL implementar três níveis de permissão: Admin_Plataforma, Dono_Empresa e Usuario_Comum
6. THE Sistema SHALL registrar todos os acessos em logs por empresa

### Requisito 2: Gestão de Empresas pelo Admin da Plataforma

**User Story:** Como Admin_Plataforma, quero criar e gerenciar empresas clientes, para controlar o acesso ao SaaS.

#### Acceptance Criteria

1. WHEN Admin_Plataforma cria uma empresa, THE Sistema SHALL criar estrutura completa no Firestore
2. THE Sistema SHALL permitir que Admin_Plataforma defina plano em meses para cada empresa
3. THE Sistema SHALL permitir que Admin_Plataforma ative ou desative empresas
4. WHEN Admin_Plataforma acessa painel, THE Sistema SHALL exibir lista de todas as empresas
5. THE Sistema SHALL exibir para Admin_Plataforma o uso de IA por empresa e por usuário
6. THE Sistema SHALL permitir que Admin_Plataforma visualize logs globais do sistema

### Requisito 3: Gestão de Usuários e Permissões

**User Story:** Como Dono_Empresa, quero gerenciar usuários da minha empresa e suas permissões, para controlar quem acessa o sistema.

#### Acceptance Criteria

1. WHEN Dono_Empresa cria usuário, THE Sistema SHALL associar usuário à empresa correta
2. THE Sistema SHALL permitir que Dono_Empresa defina permissões específicas por usuário
3. THE Sistema SHALL permitir que Dono_Empresa ative ou desative usuários
4. WHEN Dono_Empresa visualiza lista de usuários, THE Sistema SHALL exibir apenas usuários da sua empresa
5. THE Sistema SHALL registrar alterações de permissões em logs

### Requisito 4: Registro de Agendamentos

**User Story:** Como usuário autorizado, quero agendar trabalhos futuros de carga e descarga, para planejar operações.

#### Acceptance Criteria

1. WHEN usuário cria agendamento, THE Sistema SHALL registrar data, tipo (carga/descarga), tonelagem e valor
2. THE Sistema SHALL permitir associar funcionários ao agendamento
3. THE Sistema SHALL validar que tonelagem seja maior que zero
4. THE Sistema SHALL validar que valor seja maior ou igual a zero
5. WHEN usuário visualiza agendamentos, THE Sistema SHALL exibir apenas agendamentos da sua empresa
6. THE Sistema SHALL permitir editar e excluir agendamentos

### Requisito 5: Registro de Trabalhos (Carga e Descarga)

**User Story:** Como usuário autorizado, quero registrar trabalhos realizados de carga e descarga, para controlar operações diárias.

#### Acceptance Criteria

1. WHEN usuário registra trabalho, THE Sistema SHALL capturar data, tipo, tonelagem, valor recebido e funcionários
2. THE Sistema SHALL calcular automaticamente total pago aos funcionários
3. THE Sistema SHALL calcular automaticamente lucro (valor recebido - total pago)
4. THE Sistema SHALL validar que tonelagem seja maior que zero
5. THE Sistema SHALL validar que valor recebido seja maior ou igual a zero
6. THE Sistema SHALL permitir registrar múltiplos funcionários por trabalho com valores individuais
7. WHEN usuário visualiza trabalhos, THE Sistema SHALL exibir apenas trabalhos da sua empresa

### Requisito 6: Gestão de Funcionários

**User Story:** Como Dono_Empresa, quero gerenciar informações de funcionários, para controlar equipe operacional.

#### Acceptance Criteria

1. WHEN Dono_Empresa cadastra funcionário, THE Sistema SHALL armazenar nome e informações básicas
2. THE Sistema SHALL manter histórico de trabalhos por funcionário
3. THE Sistema SHALL calcular total recebido por funcionário em período selecionado
4. THE Sistema SHALL exibir quantos trabalhos cada funcionário realizou
5. WHEN Dono_Empresa visualiza funcionários, THE Sistema SHALL exibir apenas funcionários da sua empresa

### Requisito 7: Relatórios Financeiros e Operacionais

**User Story:** Como usuário autorizado, quero visualizar relatórios de operações e finanças, para analisar desempenho.

#### Acceptance Criteria

1. THE Sistema SHALL gerar relatórios diários, semanais e mensais
2. WHEN usuário solicita relatório, THE Sistema SHALL calcular faturamento total do período
3. WHEN usuário solicita relatório, THE Sistema SHALL calcular custos totais do período
4. WHEN usuário solicita relatório, THE Sistema SHALL calcular lucro total do período
5. THE Sistema SHALL permitir filtrar relatórios por funcionário
6. THE Sistema SHALL permitir exportar relatórios em formato PDF
7. THE Sistema SHALL permitir exportar relatórios em formato Excel
8. WHEN usuário visualiza relatórios, THE Sistema SHALL exibir apenas dados da sua empresa

### Requisito 8: Integração com WhatsApp

**User Story:** Como Dono_Empresa, quero integrar WhatsApp com o sistema, para receber e responder mensagens automaticamente.

#### Acceptance Criteria

1. THE Sistema SHALL integrar com WhatsApp via biblioteca Baileys
2. WHEN Dono_Empresa ativa WhatsApp, THE Sistema SHALL exibir QR Code para autenticação
3. WHEN WhatsApp recebe mensagem, THE Sistema SHALL armazenar mensagem no Firestore
4. THE Sistema SHALL permitir que Dono_Empresa configure respostas automáticas
5. WHEN WhatsApp_Integration está ativa, THE Sistema SHALL processar mensagens recebidas
6. THE Sistema SHALL registrar todas as interações do WhatsApp em logs

### Requisito 9: Assistente de Inteligência Artificial

**User Story:** Como Dono_Empresa, quero configurar assistente de IA para responder consultas, para automatizar atendimento.

#### Acceptance Criteria

1. THE Sistema SHALL suportar integração com OpenAI (ChatGPT) e Google Gemini
2. THE Sistema SHALL permitir três estados de IA: Ativada, Desativada, Bloqueada
3. WHEN IA está ativada, THE Sistema SHALL processar consultas usando dados do Firestore
4. THE Sistema SHALL impedir que IA invente valores não existentes no Firestore
5. THE Sistema SHALL categorizar modelos de IA em: Baratos, Médios, Caros
6. THE Sistema SHALL registrar uso mensal de IA por empresa no Firestore
7. THE Sistema SHALL registrar uso mensal de IA por usuário no Firestore
8. WHEN IA processa consulta, THE Sistema SHALL registrar em logs
9. THE Sistema SHALL permitir configurar prompt global do sistema
10. THE Sistema SHALL permitir que Dono_Empresa configure prompt personalizado da empresa
11. THE Sistema SHALL permitir que usuário configure prompt personalizado individual
12. THE Sistema SHALL usar bibliotecas oficiais OpenAI e Google Gemini
13. THE Sistema SHALL usar versões estáveis dos modelos de IA

### Requisito 10: Controle de Custos de IA

**User Story:** Como Admin_Plataforma, quero monitorar custos de uso de IA, para controlar despesas operacionais.

#### Acceptance Criteria

1. WHEN IA processa requisição, THE Sistema SHALL calcular custo baseado no modelo usado
2. THE Sistema SHALL acumular custos mensais por empresa
3. THE Sistema SHALL acumular custos mensais por usuário
4. WHEN Admin_Plataforma acessa dashboard, THE Sistema SHALL exibir custos totais de IA
5. THE Sistema SHALL permitir visualizar custos por categoria de modelo (Barato, Médio, Caro)
6. THE Sistema SHALL alertar quando empresa atingir limite de uso de IA (se configurado)

### Requisito 11: Dashboard Mobile-First com Design Profissional

**User Story:** Como usuário, quero visualizar dashboard responsivo com design moderno e gráficos interativos, para acessar informações de qualquer dispositivo.

#### Acceptance Criteria

1. THE Sistema SHALL renderizar interface mobile-first com breakpoints responsivos
2. THE Sistema SHALL suportar modo escuro (dark mode) completo com toggle visível
3. THE Sistema SHALL adaptar layout para mobile (320px+), tablet (768px+) e desktop (1024px+)
4. WHEN usuário acessa dashboard, THE Sistema SHALL exibir cards com ícones profissionais e cores semânticas
5. THE Sistema SHALL exibir gráficos interativos de faturamento mensal com biblioteca Recharts ou Chart.js
6. THE Sistema SHALL exibir indicadores de: Faturamento, Custos, Lucro, Uso de IA, Funcionários com ícones contextuais
7. THE Sistema SHALL incluir sidebar lateral com ícones para navegação entre módulos
8. WHEN usuário visualiza dashboard, THE Sistema SHALL exibir apenas dados da sua empresa
9. THE Sistema SHALL implementar animações suaves em cards (hover, click)
10. THE Sistema SHALL usar gradientes e sombras para profundidade visual
11. THE Sistema SHALL exibir skeleton loaders durante carregamento
12. THE Sistema SHALL implementar gráficos com tooltip interativo mostrando valores detalhados
13. THE Sistema SHALL permitir alternar entre visualizações de gráfico (linha, barra, área)
14. THE Sistema SHALL usar biblioteca de ícones profissional (Lucide React ou Heroicons)
15. THE Sistema SHALL implementar cards com hover effects e transições suaves

### Requisito 12: Sistema de Logs e Auditoria

**User Story:** Como Admin_Plataforma, quero visualizar logs completos do sistema, para auditoria e troubleshooting.

#### Acceptance Criteria

1. THE Sistema SHALL registrar logs de acesso de usuários
2. THE Sistema SHALL registrar logs de uso de IA com detalhes de modelo e custo
3. THE Sistema SHALL registrar logs de interações do WhatsApp
4. THE Sistema SHALL registrar logs de alterações críticas (criação de empresa, mudança de permissões)
5. WHEN log é criado, THE Sistema SHALL incluir timestamp, empresa, usuário e ação
6. THE Sistema SHALL permitir que Admin_Plataforma filtre logs por empresa
7. THE Sistema SHALL permitir que Admin_Plataforma filtre logs por tipo de ação
8. THE Sistema SHALL permitir que Dono_Empresa visualize logs apenas da sua empresa

### Requisito 13: Regras de Segurança do Firestore

**User Story:** Como desenvolvedor, quero implementar regras de segurança no Firestore, para proteger dados das empresas.

#### Acceptance Criteria

1. THE Sistema SHALL implementar Firestore Rules que isolam dados por empresa
2. THE Sistema SHALL impedir que usuários acessem dados de outras empresas
3. THE Sistema SHALL permitir que Admin_Plataforma acesse dados de todas as empresas
4. THE Sistema SHALL validar permissões antes de permitir leitura ou escrita
5. WHEN empresa tem plano vencido, THE Sistema SHALL bloquear acesso aos dados via Firestore Rules
6. THE Sistema SHALL validar tipos de dados nas operações de escrita

### Requisito 14: Configuração de Valores de Carga e Descarga

**User Story:** Como Dono_Empresa, quero configurar valores padrão de carga e descarga, para agilizar registro de trabalhos.

#### Acceptance Criteria

1. THE Sistema SHALL permitir que Dono_Empresa defina valor padrão por tonelada para carga
2. THE Sistema SHALL permitir que Dono_Empresa defina valor padrão por tonelada para descarga
3. WHEN usuário cria trabalho, THE Sistema SHALL sugerir valor baseado na configuração
4. THE Sistema SHALL permitir que usuário sobrescreva valor sugerido
5. THE Sistema SHALL armazenar configurações de valores por empresa

### Requisito 15: Progressive Web App (PWA)

**User Story:** Como usuário, quero instalar o sistema como PWA, para acesso offline e experiência nativa.

#### Acceptance Criteria

1. THE Sistema SHALL implementar Service Worker para funcionalidade PWA
2. THE Sistema SHALL permitir instalação como aplicativo no dispositivo
3. THE Sistema SHALL funcionar offline para visualização de dados em cache
4. WHEN conexão é restaurada, THE Sistema SHALL sincronizar dados pendentes
5. THE Sistema SHALL exibir indicador de status de conexão
6. THE Sistema SHALL armazenar dados críticos em cache local

### Requisito 16: Integração IA com WhatsApp

**User Story:** Como Dono_Empresa, quero que IA responda mensagens do WhatsApp, para automatizar atendimento.

#### Acceptance Criteria

1. WHEN WhatsApp recebe mensagem e IA está ativada, THE Sistema SHALL processar mensagem com IA
2. THE Sistema SHALL consultar dados do Firestore para responder consultas
3. THE Sistema SHALL enviar resposta da IA via WhatsApp
4. THE Sistema SHALL impedir que IA invente dados não existentes
5. WHEN IA não consegue responder, THE Sistema SHALL enviar mensagem padrão
6. THE Sistema SHALL registrar interações IA-WhatsApp em logs
7. THE Sistema SHALL contabilizar uso de IA em interações do WhatsApp

### Requisito 17: Serialização de Dados

**User Story:** Como desenvolvedor, quero garantir consistência na serialização de dados, para integridade do sistema.

#### Acceptance Criteria

1. WHEN Sistema armazena dados no Firestore, THE Sistema SHALL serializar objetos em formato JSON
2. WHEN Sistema recupera dados do Firestore, THE Sistema SHALL desserializar JSON em objetos
3. THE Sistema SHALL validar estrutura de dados durante serialização
4. THE Sistema SHALL validar estrutura de dados durante desserialização

### Requisito 18: Soft Delete e Preservação de Histórico

**User Story:** Como administrador, quero que dados críticos sejam preservados mesmo após exclusão, para manter histórico financeiro e auditoria.

#### Acceptance Criteria

1. WHEN usuário exclui trabalho, THE Sistema SHALL marcar com deletedAt ao invés de deletar
2. WHEN usuário exclui funcionário, THE Sistema SHALL marcar com deletedAt ao invés de deletar
3. WHEN usuário exclui agendamento, THE Sistema SHALL marcar com deletedAt ao invés de deletar
4. WHEN usuário exclui usuário, THE Sistema SHALL marcar com deletedAt ao invés de deletar
5. THE Sistema SHALL filtrar automaticamente registros com deletedAt != null em todas as queries
6. THE Sistema SHALL permitir que Admin_Plataforma execute delete real (permanente)
7. WHEN Admin_Plataforma executa delete real, THE Sistema SHALL registrar em logs
8. THE Sistema SHALL permitir restauração de registros soft-deleted

### Requisito 19: Valores Monetários em Centavos

**User Story:** Como desenvolvedor, quero armazenar valores monetários em centavos, para prevenir fraudes e erros de arredondamento.

#### Acceptance Criteria

1. THE Sistema SHALL armazenar TODOS os valores monetários como integer (centavos)
2. WHEN usuário insere valor em reais, THE Sistema SHALL converter para centavos antes de salvar
3. WHEN Sistema exibe valor, THE Sistema SHALL converter centavos para reais na UI
4. THE Sistema SHALL validar que valores monetários sejam sempre integers não-negativos
5. THE Sistema SHALL usar aritmética de inteiros para todos os cálculos financeiros
6. WHEN Sistema calcula totalPago, THE Sistema SHALL somar valores em centavos
7. WHEN Sistema calcula lucro, THE Sistema SHALL subtrair valores em centavos
8. THE Sistema SHALL arredondar corretamente ao converter centavos para reais (divisão por 100)

### Requisito 20: Rate Limiting WhatsApp e IA

**User Story:** Como Admin_Plataforma, quero limitar uso de WhatsApp e IA por empresa, para controlar custos operacionais.

#### Acceptance Criteria

1. THE Sistema SHALL limitar mensagens WhatsApp a 1000 por dia por empresa
2. THE Sistema SHALL limitar mensagens WhatsApp a 10 por minuto por número
3. THE Sistema SHALL implementar cooldown de 30 segundos entre mensagens do mesmo número
4. THE Sistema SHALL limitar requisições IA a 60 por minuto por empresa
5. THE Sistema SHALL limitar requisições IA a 500 por dia por usuário
6. WHEN limite é atingido, THE Sistema SHALL retornar erro descritivo
7. WHEN limite é atingido, THE Sistema SHALL registrar em logs
8. THE Sistema SHALL resetar contadores diários à meia-noite
9. THE Sistema SHALL permitir que Admin_Plataforma configure limites por empresa

### Requisito 21: Fallback Operacional

**User Story:** Como usuário, quero que o sistema continue funcionando mesmo quando serviços externos falham, para garantir continuidade operacional.

#### Acceptance Criteria

1. WHEN IA falha ao processar consulta, THE Sistema SHALL enviar mensagem padrão predefinida
2. WHEN IA falha, THE Sistema SHALL notificar no painel do Dono_Empresa
3. WHEN WhatsApp desconecta, THE Sistema SHALL executar desconexão graciosa
4. WHEN WhatsApp desconecta, THE Sistema SHALL alertar Dono_Empresa no painel
5. WHEN mensagem não é compreendida pela IA, THE Sistema SHALL enviar resposta padrão
6. WHEN mensagem não é compreendida, THE Sistema SHALL registrar em logs para análise
7. THE Sistema SHALL permitir que Dono_Empresa configure mensagens padrão de fallback
8. WHEN serviço externo falha, THE Sistema SHALL tentar novamente com backoff exponencial (máximo 3 tentativas)
9. THE Sistema SHALL exibir status de saúde dos serviços no painel admin

### Requisito 22: Resolução de Conflitos Offline

**User Story:** Como usuário, quero que conflitos de sincronização offline sejam resolvidos automaticamente, para evitar perda de dados.

#### Acceptance Criteria

1. WHEN dois usuários editam mesmo registro offline, THE Sistema SHALL usar last-write-wins baseado em timestamp
2. WHEN há conflito em arrays, THE Sistema SHALL fazer merge inteligente (união de elementos únicos)
3. WHEN há conflito irreconciliável, THE Sistema SHALL notificar usuário
4. THE Sistema SHALL preservar versão anterior em logs antes de resolver conflito
5. THE Sistema SHALL exibir indicador visual quando houver conflito resolvido
6. WHEN usuário volta online, THE Sistema SHALL sincronizar dados pendentes em ordem cronológica
7. THE Sistema SHALL validar integridade dos dados após resolução de conflito

### Requisito 23: Design System e UI/UX Profissional

**User Story:** Como usuário, quero uma interface moderna e profissional com ícones intuitivos e gráficos interativos, para melhor experiência de uso.

#### Acceptance Criteria

1. THE Sistema SHALL usar biblioteca de ícones profissional (Lucide React, Heroicons ou Phosphor Icons)
2. THE Sistema SHALL implementar biblioteca de gráficos interativos (Recharts ou Chart.js)
3. THE Sistema SHALL usar biblioteca de componentes UI (Shadcn/ui, Radix UI ou Headless UI)
4. THE Sistema SHALL implementar animações suaves com Framer Motion ou CSS transitions
5. THE Sistema SHALL usar paleta de cores consistente definida no Design System
6. THE Sistema SHALL implementar tipografia hierárquica (títulos, subtítulos, corpo, caption)
7. THE Sistema SHALL usar espaçamento consistente baseado em escala (4px, 8px, 16px, 24px, 32px)
8. THE Sistema SHALL implementar estados visuais claros (hover, active, disabled, loading)
9. THE Sistema SHALL usar skeleton loaders durante carregamento de dados
10. THE Sistema SHALL implementar empty states ilustrados quando não houver dados
11. THE Sistema SHALL usar toasts/notifications para feedback de ações
12. THE Sistema SHALL implementar modais e drawers para formulários e detalhes
13. THE Sistema SHALL usar badges e chips para status e categorias
14. THE Sistema SHALL implementar tooltips informativos em ícones e ações
15. THE Sistema SHALL usar gradientes sutis e sombras para profundidade visual
16. THE Sistema SHALL implementar micro-interações (botões, cards, inputs)
17. THE Sistema SHALL usar ícones contextuais em todos os módulos (trabalhos, agendamentos, etc)
18. THE Sistema SHALL implementar gráficos com múltiplas visualizações (linha, barra, pizza, área)
19. THE Sistema SHALL permitir interação com gráficos (zoom, tooltip, legenda clicável)
20. THE Sistema SHALL usar cores semânticas (success: verde, error: vermelho, warning: amarelo, info: azul)

