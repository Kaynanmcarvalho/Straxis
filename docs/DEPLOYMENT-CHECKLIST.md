# Checklist de Deploy - Straxis SaaS

## 📋 Pré-Deploy (Staging)

### Configuração

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Firebase project criado (staging)
- [ ] Firebase CLI instalado e autenticado
- [ ] Secrets do GitHub configurados
- [ ] Domínio configurado (staging.straxis.app)

### Código

- [ ] Todos os testes passando
- [ ] Cobertura de código >= 80%
- [ ] Lint sem erros
- [ ] Build sem erros (backend e frontend)
- [ ] Sem warnings críticos

### Firebase

- [ ] Firestore Rules validadas
- [ ] Firestore Indexes criados
- [ ] Firebase Auth configurado
- [ ] Firebase Storage configurado
- [ ] Emuladores testados localmente

### Segurança

- [ ] Scan de dependências executado
- [ ] Scan de código executado
- [ ] Scan de secrets executado
- [ ] Nenhuma vulnerabilidade crítica

### Documentação

- [ ] README.md atualizado
- [ ] API documentada
- [ ] Changelog atualizado
- [ ] Diagramas atualizados

## 🚀 Deploy Staging

### Execução

- [ ] Branch `staging` atualizada
- [ ] CI/CD pipeline executado com sucesso
- [ ] Firestore Rules deployadas
- [ ] Firestore Indexes deployados
- [ ] Frontend deployado (Firebase Hosting)
- [ ] Backend deployado

### Validação

- [ ] URL acessível (https://staging.straxis.app)
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] API respondendo
- [ ] WhatsApp conectando
- [ ] IA respondendo (se configurada)

### Testes E2E

- [ ] Fluxo de login
- [ ] Criação de empresa (Admin)
- [ ] Criação de usuário (Dono)
- [ ] Criação de trabalho
- [ ] Criação de agendamento
- [ ] Geração de relatório
- [ ] Integração WhatsApp
- [ ] Integração IA

### Performance

- [ ] Lighthouse Score >= 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Sem memory leaks
- [ ] API response time < 500ms

### Monitoramento

- [ ] Logs funcionando
- [ ] Métricas sendo coletadas
- [ ] Alertas configurados
- [ ] Error tracking ativo

## ✅ Aprovação para Produção

### Critérios

- [ ] Todos os testes E2E passaram
- [ ] Performance aceitável
- [ ] Sem bugs críticos
- [ ] Aprovação do Product Owner
- [ ] Aprovação do Tech Lead

### Comunicação

- [ ] Equipe notificada sobre deploy
- [ ] Janela de manutenção agendada (se necessário)
- [ ] Plano de rollback preparado
- [ ] Documentação de release pronta

## 🎯 Deploy Produção

### Pré-Deploy

- [ ] Backup do Firestore criado
- [ ] Plano de rollback testado
- [ ] Equipe de suporte alertada
- [ ] Monitoramento intensificado

### Execução

- [ ] Branch `main` atualizada
- [ ] CI/CD pipeline executado com sucesso
- [ ] Firestore Rules deployadas
- [ ] Firestore Indexes deployados
- [ ] Frontend deployado (Firebase Hosting)
- [ ] Backend deployado
- [ ] Tag de release criada

### Validação Pós-Deploy

- [ ] URL acessível (https://app.straxis.app)
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] API respondendo
- [ ] Smoke tests passaram
- [ ] Sem erros nos logs

### Monitoramento (Primeiras 24h)

- [ ] Taxa de erro < 1%
- [ ] Uptime >= 99.9%
- [ ] Performance estável
- [ ] Sem alertas críticos
- [ ] Feedback dos usuários positivo

## 🔄 Rollback (Se Necessário)

### Critérios para Rollback

- Taxa de erro > 5%
- Uptime < 95%
- Bug crítico descoberto
- Performance degradada significativamente
- Perda de dados

### Procedimento

- [ ] Notificar equipe
- [ ] Executar script de rollback
- [ ] Validar versão anterior
- [ ] Investigar causa do problema
- [ ] Documentar incidente

## 📊 Pós-Deploy

### Documentação

- [ ] Changelog atualizado
- [ ] Release notes publicadas
- [ ] Documentação técnica atualizada
- [ ] Comunicado aos usuários

### Retrospectiva

- [ ] O que funcionou bem?
- [ ] O que pode melhorar?
- [ ] Lições aprendidas
- [ ] Ações de melhoria

### Métricas

- [ ] Tempo de deploy registrado
- [ ] Downtime registrado (se houver)
- [ ] Bugs encontrados registrados
- [ ] Feedback dos usuários coletado

## 🛠️ Ferramentas

### Comandos Úteis

**Verificar status do deploy:**
```bash
firebase hosting:releases:list --project production
```

**Ver logs em tempo real:**
```bash
firebase hosting:logs --project production --tail
```

**Fazer rollback:**
```bash
firebase hosting:rollback --project production
```

**Criar backup:**
```bash
firebase firestore:export gs://seu-bucket/backups/$(date +%Y%m%d-%H%M%S)
```

**Restaurar backup:**
```bash
firebase firestore:import gs://seu-bucket/backups/BACKUP_ID
```

### Links Importantes

- [Firebase Console](https://console.firebase.google.com)
- [GitHub Actions](https://github.com/seu-repo/actions)
- [Monitoring Dashboard](https://console.firebase.google.com/project/straxis-production/overview)
- [Error Tracking](https://console.firebase.google.com/project/straxis-production/crashlytics)

## 📞 Contatos de Emergência

**Desenvolvedor Principal:**
- Kaynan Moreira - (62) 99451-0649

**Colaborador:**
- Renier - (62) 99278-2003

**Suporte Firebase:**
- [Firebase Support](https://firebase.google.com/support)

---

**Última Atualização:** 26/01/2026  
**Versão:** 1.0
