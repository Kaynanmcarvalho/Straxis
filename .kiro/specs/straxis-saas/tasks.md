# Plano de Implementação - Straxis SaaS

**Data de Criação:** 26/01/2026  
**Linguagem:** TypeScript (Frontend: React, Backend: Node.js)  
**Desenvolvedores:** Kaynan e Renier  
**Versão:** 1.1

---

## 🆕 Changelog v1.1

**Novas Tasks Adicionadas:**
- Task 28: Implementar soft delete
- Task 29: Implementar valores monetários em centavos
- Task 30: Implementar rate limiting
- Task 31: Implementar fallback operacional
- Task 32: Implementar resolução de conflitos offline

---

## Overview

Este plano detalha a implementação incremental do sistema Straxis, dividida em módulos funcionais. Cada tarefa constrói sobre as anteriores, garantindo progresso contínuo e testável.

---

## Tasks

- [x] 1. Setup inicial do projeto e configuração base
  - Criar estrutura de pastas frontend e backend
  - Configurar TypeScript, ESLint, Prettier
  - Configurar Firebase (Firestore, Auth, Storage)
  - Configurar variáveis de ambiente
  - Criar arquivos de configuração (tsconfig.json, package.json)
  - _Requirements: Todos_

- [x] 2. Implementar sistema de autenticação e multi-tenancy
  - [x] 2.1 Criar modelos TypeScript de User e Company
    - Implementar interfaces User, Company, Permission
    - Criar tipos auxiliares (UserRole, CompanyConfig)
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 2.2 Implementar Firebase Auth integration
    - Criar auth.service.ts com login/logout/refresh
    - Implementar middleware de autenticação
    - Implementar extração de companyId e role do token
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.3 Implementar middleware de tenant isolation
    - Criar tenant.middleware.ts
    - Validar companyId em todas as requisições
    - Bloquear acesso para planos vencidos
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 2.4 Escrever testes de propriedade para autenticação
    - **Property 3: Identificação de empresa e role no login**
    - **Validates: Requirements 1.2**
  
  - [ ]* 2.5 Escrever testes de propriedade para isolamento multi-tenant
    - **Property 1: Isolamento completo de dados entre empresas**
    - **Validates: Requirements 1.3, 4.5, 5.7, 6.5, 7.8, 11.8, 12.8, 13.1, 13.2**
  
  - [ ]* 2.6 Escrever testes de propriedade para bloqueio de planos vencidos
    - **Property 2: Bloqueio de acesso para planos vencidos**
    - **Validates: Requirements 1.4, 13.5**

- [x] 3. Implementar Firestore Rules e estrutura de dados
  - [x] 3.1 Criar Firestore Rules completas
    - Implementar helper functions (isAuthenticated, belongsToCompany, etc.)
    - Criar regras para companies collection
    - Criar regras para subcollections (trabalhos, agendamentos, etc.)
    - Criar regras para users, logs, globalConfig
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [x] 3.2 Criar firestore.service.ts
    - Implementar funções CRUD genéricas
    - Implementar queries com filtro automático por companyId
    - Implementar batch operations
    - _Requirements: 1.3_
  
  - [ ]* 3.3 Escrever testes de segurança Firestore Rules
    - **Property 39: Bloqueio de acesso cross-tenant**
    - **Property 40: Validação de permissões antes de operações**
    - **Property 41: Validação de tipos de dados em escrita**
    - **Validates: Requirements 13.2, 13.4, 13.6**

- [ ] 4. Checkpoint - Garantir que autenticação e isolamento funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 5. Implementar módulo de gestão de empresas (Admin)
  - [x] 5.1 Criar empresa.controller.ts e empresa.routes.ts
    - Implementar endpoints: GET, POST, PUT, DELETE, PATCH /empresas
    - Validar que apenas Admin_Plataforma pode acessar
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 5.2 Implementar criação de estrutura completa de empresa
    - Criar documento em companies/
    - Inicializar subcoleções vazias
    - Calcular planEndDate baseado em planMonths
    - _Requirements: 2.1_
  
  - [x] 5.3 Criar componentes React para painel admin
    - EmpresaForm.tsx (criar/editar empresa)
    - EmpresaList.tsx (listar empresas)
    - Integrar com API
    - _Requirements: 2.4_
  
  - [ ]* 5.4 Escrever testes de propriedade para gestão de empresas
    - **Property 4: Criação completa de estrutura de empresa**
    - **Property 5: Alteração de status de empresa**
    - **Validates: Requirements 2.1, 2.3**

- [x] 6. Implementar módulo de gestão de usuários
  - [x] 6.1 Criar user.controller.ts e user.routes.ts
    - Implementar endpoints: GET, POST, PUT, DELETE, PATCH /usuarios
    - Validar permissões (Admin ou Dono_Empresa)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 6.2 Implementar lógica de associação de usuário à empresa
    - Extrair companyId do criador
    - Associar automaticamente ao criar usuário
    - _Requirements: 3.1_
  
  - [x] 6.3 Criar componentes React para gestão de usuários
    - UserForm.tsx (criar/editar usuário)
    - UserList.tsx (listar usuários)
    - PermissionsEditor.tsx (editar permissões)
    - _Requirements: 3.2, 3.4_
  
  - [ ]* 6.4 Escrever testes de propriedade para gestão de usuários
    - **Property 6: Associação correta de usuário à empresa**
    - **Property 7: Alteração de status de usuário**
    - **Property 8: Filtragem de usuários por empresa**
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 7. Implementar sistema de logs e auditoria
  - [x] 7.1 Criar log.service.ts
    - Implementar função createLog()
    - Implementar queries de logs com filtros
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 7.2 Integrar logging em todas as ações críticas
    - Logs de acesso (auth.middleware.ts)
    - Logs de alterações de permissões (user.controller.ts)
    - Logs de criação de empresa (empresa.controller.ts)
    - _Requirements: 1.6, 3.5, 12.4_
  
  - [x] 7.3 Criar componente LogsViewer.tsx
    - Exibir logs com filtros (empresa, usuário, tipo)
    - Paginação
    - _Requirements: 2.6, 12.6, 12.7, 12.8_
  
  - [ ]* 7.4 Escrever testes de propriedade para logs
    - **Property 33: Registro de logs de acesso**
    - **Property 34: Registro de logs de alterações de permissões**
    - **Property 37: Presença de campos obrigatórios em logs**
    - **Property 38: Filtragem de logs por empresa para Dono_Empresa**
    - **Validates: Requirements 1.6, 12.1, 3.5, 12.4, 12.5, 12.8**

- [ ] 8. Checkpoint - Garantir que gestão de empresas, usuários e logs funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 9. Implementar módulo de funcionários
  - [x] 9.1 Criar funcionario.model.ts, funcionario.controller.ts e funcionario.routes.ts
    - Implementar interface Funcionario
    - Implementar endpoints: GET, POST, PUT, DELETE /funcionarios
    - Implementar endpoint GET /funcionarios/:id/stats
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 9.2 Implementar cálculos de estatísticas de funcionário
    - Total recebido em período
    - Contagem de trabalhos
    - Histórico de trabalhos
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 9.3 Criar componentes React para funcionários
    - FuncionarioForm.tsx (criar/editar)
    - FuncionarioList.tsx (listar)
    - FuncionarioStats.tsx (estatísticas)
    - _Requirements: 6.5_
  
  - [ ]* 9.4 Escrever testes de propriedade para funcionários
    - **Property 18: Presença de campos obrigatórios em funcionários**
    - **Property 19: Histórico de trabalhos por funcionário**
    - **Property 20: Cálculo correto de total recebido por funcionário**
    - **Property 21: Contagem correta de trabalhos por funcionário**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 10. Implementar módulo de agendamentos
  - [x] 10.1 Criar agendamento.model.ts, agendamento.controller.ts e agendamento.routes.ts
    - Implementar interface Agendamento
    - Implementar endpoints: GET, POST, PUT, DELETE, PATCH /agendamentos
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [x] 10.2 Implementar validações de agendamento
    - Validar tonelagem > 0
    - Validar valor >= 0
    - Validar campos obrigatórios
    - _Requirements: 4.3, 4.4_
  
  - [x] 10.3 Implementar sugestão de valor baseada em configuração
    - Buscar valorCargaPorTonelada ou valorDescargaPorTonelada
    - Calcular valor sugerido = config * tonelagem
    - _Requirements: 14.3_
  
  - [x] 10.4 Criar componentes React para agendamentos
    - AgendamentoForm.tsx (criar/editar)
    - AgendamentoCalendar.tsx (visualização em calendário)
    - _Requirements: 4.5_
  
  - [ ]* 10.5 Escrever testes de propriedade para agendamentos
    - **Property 9: Validação de tonelagem positiva**
    - **Property 10: Validação de valores não-negativos**
    - **Property 12: Presença de campos obrigatórios em agendamentos**
    - **Property 42: Sugestão de valor baseada em configuração**
    - **Validates: Requirements 4.3, 5.4, 4.4, 5.5, 4.1, 14.3**

- [x] 11. Implementar módulo de trabalhos (carga/descarga)
  - [x] 11.1 Criar trabalho.model.ts, trabalho.controller.ts e trabalho.routes.ts
    - Implementar interface Trabalho e TrabalhoFuncionario
    - Implementar endpoints: GET, POST, PUT, DELETE /trabalhos
    - _Requirements: 5.1, 5.6_
  
  - [x] 11.2 Implementar cálculos automáticos de trabalho
    - Calcular totalPago (soma de valores pagos aos funcionários)
    - Calcular lucro (valorRecebido - totalPago)
    - _Requirements: 5.2, 5.3_
  
  - [x] 11.3 Implementar validações de trabalho
    - Validar tonelagem > 0
    - Validar valorRecebido >= 0
    - Validar campos obrigatórios
    - _Requirements: 5.4, 5.5, 5.1_
  
  - [x] 11.4 Criar componentes React para trabalhos
    - TrabalhoForm.tsx (criar/editar)
    - TrabalhoList.tsx (listar)
    - TrabalhoDetail.tsx (detalhes)
    - _Requirements: 5.7_
  
  - [ ]* 11.5 Escrever testes de propriedade para trabalhos
    - **Property 11: Presença de campos obrigatórios em trabalhos**
    - **Property 13: Cálculo correto de total pago**
    - **Property 14: Cálculo correto de lucro**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 12. Checkpoint - Garantir que funcionários, agendamentos e trabalhos funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 13. Implementar módulo de relatórios
  - [x] 13.1 Criar relatorio.controller.ts e relatorio.routes.ts
    - Implementar endpoints: GET /relatorios/diario, /semanal, /mensal
    - Implementar endpoint GET /relatorios/funcionario/:id
    - _Requirements: 7.1, 7.5_
  
  - [x] 13.2 Implementar cálculos de relatórios
    - Calcular faturamento total (soma de valorRecebido)
    - Calcular custos totais (soma de totalPago)
    - Calcular lucro total (faturamento - custos)
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 13.3 Implementar export.service.ts
    - Implementar exportação para PDF (usando biblioteca como pdfkit)
    - Implementar exportação para Excel (usando biblioteca como exceljs)
    - _Requirements: 7.6, 7.7_
  
  - [x] 13.4 Criar componentes React para relatórios
    - RelatorioFilter.tsx (filtros de período e funcionário)
    - RelatorioTable.tsx (tabela de dados)
    - RelatorioExport.tsx (botões de exportação)
    - _Requirements: 7.8_
  
  - [ ]* 13.5 Escrever testes de propriedade para relatórios
    - **Property 15: Cálculo correto de faturamento em relatório**
    - **Property 16: Cálculo correto de custos em relatório**
    - **Property 17: Cálculo correto de lucro em relatório**
    - **Validates: Requirements 7.2, 7.3, 7.4**

- [x] 14. Implementar integração com WhatsApp (Baileys)
  - [x] 14.1 Criar whatsapp.service.ts
    - Configurar Baileys
    - Implementar geração de QR Code
    - Implementar handlers de conexão/desconexão
    - _Requirements: 8.1, 8.2_
  
  - [x] 14.2 Implementar handlers de mensagens
    - Handler para mensagens recebidas
    - Salvar mensagens no Firestore
    - Handler para envio de mensagens
    - _Requirements: 8.3, 8.5_
  
  - [x] 14.3 Criar whatsapp.controller.ts e whatsapp.routes.ts
    - Implementar endpoints: POST /whatsapp/connect, GET /qrcode, GET /status
    - Implementar endpoints: POST /disconnect, GET /messages, POST /send
    - _Requirements: 8.4_
  
  - [x] 14.4 Integrar logging de WhatsApp
    - Registrar todas as mensagens enviadas/recebidas em logs
    - _Requirements: 8.6_
  
  - [x] 14.5 Criar componentes React para WhatsApp
    - QRCodeDisplay.tsx (exibir QR Code)
    - MessageList.tsx (listar mensagens)
    - WhatsAppConfig.tsx (configurações)
    - _Requirements: 8.2_
  
  - [ ]* 14.6 Escrever testes de propriedade para WhatsApp
    - **Property 22: Armazenamento de mensagens recebidas**
    - **Property 35: Registro de logs de interações WhatsApp**
    - **Validates: Requirements 8.3, 8.6, 12.3**

- [x] 15. Checkpoint - Garantir que relatórios e WhatsApp funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 16. Implementar integração com IA (OpenAI e Gemini)
  - [x] 16.1 Criar openai.service.ts e gemini.service.ts
    - Configurar bibliotecas oficiais (openai, @google/generative-ai)
    - Implementar funções de processamento de consultas
    - Implementar cálculo de tokens e custos
    - _Requirements: 9.1, 9.12, 9.13_
  
  - [x] 16.2 Criar ia.service.ts (orquestrador)
    - Implementar seleção de provider (OpenAI ou Gemini)
    - Implementar lógica de consulta ao Firestore
    - Implementar validação de respostas (prevenir alucinação)
    - Implementar fallback para mensagem padrão em caso de erro
    - _Requirements: 9.2, 9.3, 9.4, 16.2, 16.4, 16.5_
  
  - [x] 16.3 Implementar registro de uso de IA
    - Salvar em iaUsage subcollection
    - Incluir userId, provider, model, tokensUsed, estimatedCost
    - Categorizar modelo (cheap, medium, expensive)
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [x] 16.4 Implementar logging de uso de IA
    - Registrar todas as consultas em logs
    - Incluir modelo e custo
    - _Requirements: 9.8_
  
  - [x] 16.5 Implementar sistema de prompts
    - Prompt global (globalConfig/system)
    - Prompt por empresa (company.config.iaPrompt)
    - Prompt por usuário (user.iaConfig.customPrompt)
    - Lógica de composição de prompts
    - _Requirements: 9.9, 9.10, 9.11_
  
  - [x] 16.6 Criar ia.controller.ts e ia.routes.ts
    - Implementar endpoints: POST /ia/query, GET /ia/usage
    - Implementar endpoints: PUT /ia/config, PUT /ia/prompt
    - _Requirements: 9.2_
  
  - [ ]* 16.7 Escrever testes de propriedade para IA
    - **Property 24: Consulta de dados reais para respostas**
    - **Property 26: Prevenção de alucinação da IA**
    - **Property 28: Registro de uso de IA**
    - **Property 29: Cálculo correto de custo de IA**
    - **Validates: Requirements 9.3, 16.2, 9.4, 16.4, 9.6, 9.7, 16.7, 10.1**

- [x] 17. Implementar controle de custos de IA
  - [x] 17.1 Implementar agregação de custos mensais
    - Função para calcular custo total por empresa
    - Função para calcular custo total por usuário
    - _Requirements: 10.2, 10.3_
  
  - [x] 17.2 Implementar sistema de alertas de limite
    - Verificar limite configurado
    - Gerar alerta quando limite atingido
    - _Requirements: 10.6_
  
  - [x] 17.3 Criar componentes React para monitoramento de IA
    - IAConfig.tsx (configurar provider, modelo, limites)
    - PromptEditor.tsx (editar prompts)
    - UsageStats.tsx (estatísticas de uso e custos)
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 17.4 Escrever testes de propriedade para custos de IA
    - **Property 30: Acumulação de custos mensais por empresa**
    - **Property 31: Acumulação de custos mensais por usuário**
    - **Property 32: Alerta de limite de uso de IA**
    - **Validates: Requirements 10.2, 10.3, 10.6**

- [x] 18. Integrar IA com WhatsApp
  - [x] 18.1 Implementar processamento de mensagens com IA
    - Verificar se IA está ativada para a empresa
    - Processar mensagem recebida com ia.service
    - Enviar resposta via WhatsApp
    - _Requirements: 16.1, 16.3_
  
  - [x] 18.2 Integrar logging e contabilização
    - Registrar interação IA-WhatsApp em logs
    - Contabilizar uso de IA
    - _Requirements: 16.6, 16.7_
  
  - [ ]* 18.3 Escrever testes de propriedade para integração IA-WhatsApp
    - **Property 23: Processamento de mensagens com IA ativa**
    - **Property 25: Envio de resposta via WhatsApp**
    - **Property 27: Mensagem padrão em caso de falha**
    - **Property 36: Registro de logs de uso de IA**
    - **Validates: Requirements 16.1, 16.3, 16.5, 9.8, 12.2**

- [ ] 19. Checkpoint - Garantir que IA e integração IA-WhatsApp funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 20. Implementar Dashboard e indicadores
  - [x] 20.1 Implementar cálculo de indicadores do dashboard
    - Faturamento do mês atual
    - Custos do mês atual
    - Lucro do mês atual
    - Uso de IA do mês atual
    - Número de funcionários ativos
    - _Requirements: 11.5, 11.6_
  
  - [x] 20.2 Criar componentes React para dashboard
    - DashboardCard.tsx (card de indicador)
    - MetricsChart.tsx (gráfico de faturamento mensal)
    - RecentActivity.tsx (atividades recentes)
    - _Requirements: 11.4_
  
  - [ ]* 20.3 Escrever testes de propriedade para dashboard
    - **Property 48: Cálculo correto de indicadores do dashboard**
    - **Validates: Requirements 11.5**

- [x] 21. Implementar PWA e funcionalidades offline
  - [x] 21.1 Configurar Service Worker
    - Criar service-worker.js
    - Implementar estratégias de cache
    - Registrar service worker
    - _Requirements: 15.1_
  
  - [x] 21.2 Configurar manifest.json
    - Definir ícones, nome, cores
    - Configurar para instalação
    - _Requirements: 15.2_
  
  - [x] 21.3 Implementar cache local
    - Armazenar dados críticos em IndexedDB
    - Implementar indicador de status de conexão
    - _Requirements: 15.3, 15.5, 15.6_
  
  - [x] 21.4 Implementar sincronização offline
    - Queue de operações pendentes
    - Sincronizar quando conexão restaurada
    - _Requirements: 15.4_
  
  - [ ]* 21.5 Escrever testes de propriedade para sincronização offline
    - **Property 44: Sincronização de dados offline**
    - **Validates: Requirements 15.4**

- [x] 22. Implementar tema dark mode e responsividade
  - [x] 22.1 Criar theme.ts com variáveis de tema
    - Definir cores para light e dark mode
    - Definir breakpoints responsivos
    - _Requirements: 11.2_
  
  - [x] 22.2 Criar ThemeContext e hook useTheme
    - Implementar toggle de tema
    - Persistir preferência em localStorage
    - _Requirements: 11.2_
  
  - [x] 22.3 Implementar Sidebar lateral
    - Criar componente Sidebar.tsx
    - Implementar navegação entre módulos
    - Adaptar para mobile (drawer)
    - _Requirements: 11.7_
  
  - [x] 22.4 Garantir responsividade mobile-first
    - Testar todos os componentes em mobile
    - Ajustar layouts para diferentes tamanhos
    - _Requirements: 11.1, 11.3_

- [x] 23. Implementar serialização e validação de dados
  - [x] 23.1 Criar validators.ts
    - Implementar validadores para todos os modelos
    - Validar estrutura de dados
    - _Requirements: 17.3, 17.4_
  
  - [x] 23.2 Integrar validação em serialização/desserialização
    - Validar antes de salvar no Firestore
    - Validar ao recuperar do Firestore
    - _Requirements: 17.1, 17.2_
  
  - [ ]* 23.3 Escrever testes de propriedade para serialização
    - **Property 45: Round-trip de serialização Firestore**
    - **Property 46: Validação de estrutura na serialização**
    - **Property 47: Validação de estrutura na desserialização**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

- [x] 24. Implementar configuração de valores padrão
  - [x] 24.1 Adicionar campos de configuração em CompanyConfig
    - valorCargaPorTonelada
    - valorDescargaPorTonelada
    - _Requirements: 14.1, 14.2, 14.5_
  
  - [x] 24.2 Criar interface de configuração
    - Permitir Dono_Empresa editar valores
    - Salvar em company.config
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 24.3 Escrever testes de propriedade para configuração de valores
    - **Property 43: Armazenamento de configurações por empresa**
    - **Validates: Requirements 14.5**

- [x] 25. Checkpoint final - Garantir que todo o sistema funciona
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [ ] 26. Testes de integração e E2E
  - [ ]* 26.1 Escrever testes de integração de APIs
    - Testar fluxo completo de criação de trabalho
    - Testar fluxo completo de agendamento
    - Testar fluxo de relatórios
  
  - [ ]* 26.2 Escrever testes E2E
    - Fluxo completo: Login → Criar trabalho → Visualizar relatório
    - Fluxo completo: Admin cria empresa → Dono cria usuário
    - Fluxo completo: WhatsApp recebe mensagem → IA responde

- [x] 27. Documentação e deploy
  - [x] 27.1 Criar README.md consolidado
    - Instruções de instalação
    - Instruções de configuração
    - Arquitetura resumida
    - Diagramas principais
  
  - [x] 27.2 Configurar CI/CD
    - Configurar pipeline (lint, test, build, deploy)
    - Configurar deploy para staging
    - Configurar deploy para produção
  
  - [x] 27.3 Deploy inicial
    - Deploy de staging
    - Testes E2E em staging
    - Deploy de produção (após aprovação)

- [x] 28. Implementar soft delete
  - [x] 28.1 Adicionar campo deletedAt aos modelos
    - Adicionar deletedAt: Date | null em Trabalho
    - Adicionar deletedAt: Date | null em Agendamento
    - Adicionar deletedAt: Date | null em Funcionario
    - Adicionar deletedAt: Date | null em User
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [x] 28.2 Implementar soft delete em controllers
    - Modificar DELETE endpoints para usar update com deletedAt
    - Implementar endpoint de restauração (PATCH /restore)
    - Implementar hard delete apenas para Admin_Plataforma
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.6_
  
  - [x] 28.3 Atualizar queries para filtrar deletedAt
    - Adicionar filtro .where('deletedAt', '==', null) em todas as queries
    - Criar helper function para queries com soft delete
    - _Requirements: 18.5_
  
  - [x] 28.4 Integrar logging de soft delete
    - Registrar soft delete em logs
    - Registrar hard delete em logs
    - Registrar restauração em logs
    - _Requirements: 18.7_
  
  - [ ]* 28.5 Escrever testes de propriedade para soft delete
    - **Property 49: Soft delete preserva registros**
    - **Property 50: Queries filtram soft-deleted**
    - **Property 51: Admin pode fazer delete real**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7**

- [x] 29. Implementar valores monetários em centavos
  - [x] 29.1 Atualizar interfaces TypeScript
    - Renomear valorRecebido → valorRecebidoCentavos (integer)
    - Renomear totalPago → totalPagoCentavos (integer)
    - Renomear lucro → lucroCentavos (integer)
    - Renomear valorPago → valorPagoCentavos (integer)
    - Renomear valorEstimado → valorEstimadoCentavos (integer)
    - Renomear estimatedCost → estimatedCostCentavos (integer)
    - Renomear valorCargaPorTonelada → valorCargaPorToneladaCentavos (integer)
    - Renomear valorDescargaPorTonelada → valorDescargaPorToneladaCentavos (integer)
    - _Requirements: 19.1_
  
  - [x] 29.2 Criar funções de conversão
    - Implementar reaisToCentavos(reais: number): number
    - Implementar centavosToReais(centavos: number): number
    - Implementar formatCurrency(centavos: number): string
    - _Requirements: 19.2, 19.3_
  
  - [x] 29.3 Atualizar cálculos financeiros
    - Modificar cálculo de totalPago para usar centavos
    - Modificar cálculo de lucro para usar centavos
    - Modificar cálculo de relatórios para usar centavos
    - _Requirements: 19.5, 19.6, 19.7_
  
  - [x] 29.4 Atualizar validações
    - Validar que valores monetários sejam integers
    - Validar que valores monetários sejam não-negativos
    - _Requirements: 19.4_
  
  - [x] 29.5 Atualizar componentes React
    - Converter valores para centavos antes de enviar para API
    - Converter valores para reais ao exibir na UI
    - Usar formatCurrency para exibição
    - _Requirements: 19.2, 19.3, 19.8_
  
  - [ ]* 29.6 Escrever testes de propriedade para valores monetários
    - **Property 52: Valores armazenados em centavos**
    - **Property 53: Conversão reais para centavos**
    - **Property 54: Conversão centavos para reais na UI**
    - **Property 55: Cálculos financeiros em centavos**
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.5, 19.6, 19.7**

- [x] 30. Implementar rate limiting
  - [x] 30.1 Criar estrutura de rate limit counters
    - Criar interface RateLimitCounter
    - Criar coleção rateLimitCounters no Firestore
    - Implementar funções de contagem por janela de tempo
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [x] 30.2 Implementar middleware de rate limit
    - Criar rateLimitMiddleware
    - Implementar checkRateLimit()
    - Implementar incrementRateLimit()
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [x] 30.3 Aplicar rate limit em endpoints
    - Aplicar em endpoints de WhatsApp
    - Aplicar em endpoints de IA
    - Retornar erro 429 quando limite atingido
    - _Requirements: 20.6_
  
  - [x] 30.4 Implementar reset de contadores
    - Criar job para resetar contadores diários à meia-noite
    - Implementar limpeza de contadores expirados
    - _Requirements: 20.8_
  
  - [x] 30.5 Adicionar configuração de limites
    - Adicionar RateLimits em CompanyConfig
    - Permitir Admin_Plataforma configurar limites por empresa
    - _Requirements: 20.9_
  
  - [x] 30.6 Integrar logging de rate limit
    - Registrar quando limite é atingido
    - _Requirements: 20.7_
  
  - [ ]* 30.7 Escrever testes de propriedade para rate limiting
    - **Property 56: Rate limit WhatsApp por dia**
    - **Property 57: Rate limit WhatsApp por minuto**
    - **Property 58: Cooldown entre mensagens**
    - **Property 59: Rate limit IA por minuto**
    - **Property 60: Rate limit IA por dia por usuário**
    - **Property 61: Reset de contadores diários**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.8**

- [x] 31. Implementar fallback operacional
  - [x] 31.1 Criar mensagens padrão de fallback
    - Adicionar FallbackMessages em CompanyConfig
    - Definir mensagens padrão (iaFailure, whatsappDisconnected, etc.)
    - Permitir Dono_Empresa configurar mensagens
    - _Requirements: 21.7_
  
  - [x] 31.2 Implementar fallback para IA
    - Envolver processamento IA em try-catch
    - Retornar mensagem padrão em caso de erro
    - Notificar no painel do Dono_Empresa
    - _Requirements: 21.1, 21.2_
  
  - [x] 31.3 Implementar fallback para WhatsApp
    - Implementar desconexão graciosa
    - Alertar Dono_Empresa no painel
    - Atualizar status de conexão
    - _Requirements: 21.3, 21.4_
  
  - [x] 31.4 Implementar fallback para mensagem não compreendida
    - Detectar quando IA não compreende mensagem
    - Enviar resposta padrão
    - Registrar em logs para análise
    - _Requirements: 21.5, 21.6_
  
  - [x] 31.5 Implementar retry com backoff exponencial
    - Criar função retryWithBackoff()
    - Aplicar em chamadas de serviços externos
    - Máximo 3 tentativas
    - _Requirements: 21.8_
  
  - [x] 31.6 Criar dashboard de saúde dos serviços
    - Implementar endpoint GET /api/admin/health
    - Exibir status de IA, WhatsApp, Firebase
    - Exibir taxa de erro e tempo de resposta
    - _Requirements: 21.9_
  
  - [ ]* 31.7 Escrever testes de propriedade para fallback
    - **Property 62: Fallback quando IA falha**
    - **Property 63: Fallback quando WhatsApp desconecta**
    - **Property 64: Fallback para mensagem não compreendida**
    - **Property 65: Retry com backoff exponencial**
    - **Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.8**

- [x] 32. Implementar resolução de conflitos offline
  - [x] 32.1 Criar estrutura de versionamento
    - Adicionar campo version em documentos
    - Adicionar campo lastModifiedBy
    - Implementar interface DocumentVersion
    - _Requirements: 22.1_
  
  - [x] 32.2 Implementar resolução last-write-wins
    - Criar função resolveConflict()
    - Comparar timestamps
    - Preservar versão anterior em logs
    - _Requirements: 22.1, 22.4_
  
  - [x] 32.3 Implementar merge inteligente de arrays
    - Criar função mergeArrays()
    - Fazer união de elementos únicos
    - Usar timestamp para resolver conflitos em elementos
    - _Requirements: 22.2_
  
  - [x] 32.4 Implementar queue de operações pendentes
    - Criar estrutura PendingOperation
    - Armazenar operações offline em IndexedDB
    - Implementar sincronização em ordem cronológica
    - _Requirements: 22.6_
  
  - [x] 32.5 Implementar notificação de conflitos
    - Notificar usuário quando conflito é resolvido
    - Exibir indicador visual de conflito
    - Permitir usuário revisar resolução
    - _Requirements: 22.3, 22.5_
  
  - [x] 32.6 Implementar validação pós-conflito
    - Validar integridade dos dados após resolução
    - Reverter se validação falhar
    - _Requirements: 22.7_
  
  - [ ]* 32.7 Escrever testes de propriedade para resolução de conflitos
    - **Property 66: Last-write-wins para conflitos**
    - **Property 67: Merge inteligente de arrays**
    - **Property 68: Preservação de versão anterior**
    - **Property 69: Sincronização em ordem cronológica**
    - **Validates: Requirements 22.1, 22.2, 22.4, 22.6**

- [ ] 33. Checkpoint final v1.1 - Garantir que todas as novas features funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [-] 34. Implementar Design System Profissional
  - [x] 34.1 Instalar e configurar bibliotecas de UI
    - Instalar Lucide React para ícones
    - Instalar Recharts para gráficos
    - Instalar Shadcn/ui ou Radix UI para componentes
    - Instalar Framer Motion para animações
    - Instalar React Hot Toast ou Sonner para notificações
    - Instalar React Hook Form e Zod para formulários
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.11_
  
  - [x] 34.2 Criar Design System base
    - Criar arquivo design-tokens.ts com cores, tipografia, espaçamento
    - Criar arquivo theme.config.ts com configuração completa
    - Implementar CSS variables para todas as cores
    - Criar arquivo tailwind.config.js com design tokens
    - _Requirements: 23.5, 23.6, 23.7, 23.20_
  
  - [x] 34.3 Criar componentes base reutilizáveis
    - Criar Button component com variants (primary, secondary, outline, ghost, danger)
    - Criar Card component com hover effects
    - Criar Badge component com variants (success, error, warning, info)
    - Criar Input component com validação visual
    - Criar Select component customizado
    - Criar Modal/Dialog component
    - Criar Drawer component para mobile
    - Criar Tooltip component
    - Criar Dropdown component
    - _Requirements: 23.8, 23.12, 23.13, 23.14_
  
  - [x] 34.4 Implementar sistema de ícones
    - Criar IconWrapper component para tamanhos consistentes
    - Mapear ícones para cada módulo do sistema
    - Criar ícones contextuais para ações (edit, delete, view, add)
    - Implementar ícones em todos os botões e cards
    - _Requirements: 23.1, 23.17_
  
  - [x] 34.5 Implementar estados visuais
    - Criar skeleton loaders para cards, tabelas e listas
    - Criar empty states ilustrados para cada módulo
    - Implementar loading states em botões e formulários
    - Criar error states com mensagens claras
    - Implementar success states com feedback visual
    - _Requirements: 23.8, 23.9, 23.10_
  
  - [x] 34.6 Implementar sistema de notificações
    - Configurar React Hot Toast ou Sonner
    - Criar toasts para success, error, warning, info
    - Implementar toasts com ícones contextuais
    - Adicionar toasts em todas as ações (criar, editar, deletar)
    - _Requirements: 23.11_
  
  - [x] 34.7 Implementar animações e micro-interações
    - Configurar Framer Motion
    - Criar animações de entrada para cards (fade in, slide up)
    - Implementar hover effects em cards e botões
    - Criar transições suaves entre páginas
    - Implementar stagger animations em listas
    - Adicionar loading spinners animados
    - _Requirements: 23.4, 23.16_
  
  - [x] 34.8 Criar biblioteca de gráficos interativos
    - Configurar Recharts com tema customizado
    - Criar LineChart component para faturamento mensal
    - Criar BarChart component para trabalhos por tipo
    - Criar PieChart component para distribuição de custos
    - Criar AreaChart component para tendências
    - Implementar tooltips customizados em gráficos
    - Adicionar legendas clicáveis
    - Implementar zoom e pan em gráficos
    - _Requirements: 23.2, 23.18, 23.19_
  
  - [x] 34.9 Refatorar Dashboard com novo design
    - Remover inline styles do DashboardPage
    - Implementar cards com ícones Lucide React
    - Adicionar gradientes e sombras nos cards
    - Implementar gráficos interativos com Recharts
    - Adicionar animações de entrada com Framer Motion
    - Implementar skeleton loaders durante carregamento
    - Adicionar empty state quando não houver dados
    - _Requirements: 11.4, 11.5, 11.9, 11.10, 11.11, 11.12, 11.13, 11.14, 11.15_
  
  - [x] 34.10 Refatorar todas as páginas com novo design
    - Remover inline styles de todas as páginas
    - Aplicar componentes do Design System
    - Adicionar ícones contextuais em todas as ações
    - Implementar skeleton loaders em todas as listas
    - Adicionar empty states em todas as páginas
    - Implementar toasts para feedback de ações
    - Adicionar animações de entrada
    - _Requirements: 23.8, 23.9, 23.10, 23.11, 23.16, 23.17_
  
  - [x] 34.11 Implementar Sidebar com navegação
    - Criar Sidebar component com ícones Lucide React
    - Implementar navegação entre módulos
    - Adicionar indicador de página ativa
    - Implementar drawer mobile com animação
    - Adicionar toggle de dark mode na sidebar
    - Adicionar avatar e nome do usuário
    - Implementar collapse/expand da sidebar
    - _Requirements: 11.7, 11.14_
  
  - [ ] 34.12 Implementar Dark Mode completo
    - Criar toggle de dark mode visível
    - Implementar transição suave entre temas
    - Garantir que todos os componentes suportam dark mode
    - Testar contraste de cores no dark mode
    - Persistir preferência de tema no localStorage
    - _Requirements: 11.2_
  
  - [ ] 34.13 Implementar responsividade mobile-first
    - Testar todos os componentes em mobile (320px+)
    - Ajustar grids para mobile, tablet e desktop
    - Implementar drawer mobile para sidebar
    - Ajustar tabelas para scroll horizontal em mobile
    - Testar formulários em mobile
    - Ajustar gráficos para mobile
    - _Requirements: 11.1, 11.3_
  
  - [ ] 34.14 Criar documentação do Design System
    - Criar Storybook ou documentação visual
    - Documentar todos os componentes com exemplos
    - Documentar paleta de cores
    - Documentar tipografia e espaçamento
    - Documentar ícones disponíveis
    - Criar guia de uso do Design System
    - _Requirements: 23.5, 23.6, 23.7_

- [x] 35. Checkpoint Design System - Validar implementação visual
  - Garantir que todos os componentes estão estilizados
  - Validar responsividade em todos os breakpoints
  - Testar dark mode em todas as páginas
  - Validar animações e transições
  - Garantir que ícones estão aplicados corretamente as melhorias funcionam
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

---

## Notas

- Tasks marcadas com `*` são opcionais e focam em testes
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam correção universal
- Testes unitários validam exemplos específicos e casos de borda
- **v1.1**: Adicionadas 6 tasks críticas (28-33) para segurança e operação

---

**Documento criado em:** 26/01/2026  
**Última atualização:** 26/01/2026  
**Versão:** 1.1
