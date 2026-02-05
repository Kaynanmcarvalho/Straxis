# 🚀 Deploy Straxis no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no Railway (https://railway.app)
- Código no GitHub
- Variáveis de ambiente configuradas

## 🎯 Passo a Passo

### 1. Preparar o Projeto

**A. Criar arquivo `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**B. Atualizar `backend/package.json`:**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "tsx watch src/server.ts"
  }
}
```

**C. Criar `.railwayignore`:**
```
node_modules/
.git/
.env
*.log
dist/
whatsapp-auth/session_*
```

### 2. Configurar Persistência de Sessão

**IMPORTANTE:** Railway reinicia containers. Você precisa persistir sessões WhatsApp.

**Opção A: Volume Persistente (Recomendado)**

```typescript
// backend/src/services/whatsapp.service.ts

// Usar diretório persistente
private static authDir = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'whatsapp-auth')
  : path.join(__dirname, '../../whatsapp-auth');
```

**Opção B: Firestore (Mais Confiável)**

```typescript
// Salvar creds.json e keys no Firestore
// Carregar na inicialização
// Mais complexo, mas 100% confiável
```

### 3. Deploy no Railway

**A. Via Dashboard:**

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório Straxis
5. Railway detecta automaticamente Node.js

**B. Via CLI:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### 4. Configurar Variáveis de Ambiente

No Railway Dashboard → Variables:

```env
NODE_ENV=production
PORT=5000

# Firebase
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_PRIVATE_KEY=sua-chave
FIREBASE_CLIENT_EMAIL=seu-email

# OpenAI (opcional)
OPENAI_API_KEY=sua-chave

# Google Gemini (opcional)
GEMINI_API_KEY=sua-chave

# Outros
JWT_SECRET=seu-secret-seguro
```

### 5. Configurar Volume Persistente

**No Railway Dashboard:**

1. Vá em Settings → Volumes
2. Clique em "Add Volume"
3. Mount Path: `/app/whatsapp-auth`
4. Size: 1GB (suficiente para sessões)

**Atualizar código:**

```typescript
// backend/src/services/whatsapp.service.ts
private static authDir = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'whatsapp-auth')
  : path.join(__dirname, '../../whatsapp-auth');
```

### 6. Testar Conexão WhatsApp

**A. Acessar logs:**
```bash
railway logs
```

**B. Conectar via frontend:**
```
https://seu-app.railway.app/whatsapp
```

**C. Escanear QR Code:**
- Deve funcionar sem erro 515
- IP do Railway é limpo

## 🎯 Estrutura Final

```
straxis-saas/
├── backend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   └── package.json
├── railway.json          # ← Novo
├── .railwayignore        # ← Novo
└── README.md
```

## ⚠️ Problemas Comuns

### 1. Sessão Perdida Após Restart

**Causa:** Sem volume persistente

**Solução:**
```bash
# Configurar volume no Railway Dashboard
# Ou usar Firestore para persistir sessões
```

### 2. Erro de Build

**Causa:** TypeScript não compilado

**Solução:**
```json
// package.json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### 3. Porta Incorreta

**Causa:** Railway usa porta dinâmica

**Solução:**
```typescript
// backend/src/server.ts
const PORT = process.env.PORT || 5000;
```

### 4. Erro 515 Ainda Acontece

**Causa:** Número ainda em cooldown

**Solução:**
```bash
# Aguardar 24-48h desde última tentativa
# Ou usar número completamente novo
```

## 💰 Custos Railway

### Plano Hobby (Grátis)
- $5 de crédito/mês
- Suficiente para testes
- Dorme após inatividade

### Plano Pro ($20/mês)
- $20 de crédito/mês
- Sem sleep
- Volumes persistentes inclusos
- Recomendado para produção

## 🔒 Segurança

### 1. Variáveis de Ambiente
```bash
# NUNCA commitar .env
# Usar Railway Variables
```

### 2. Firebase Credentials
```bash
# Usar variáveis de ambiente
# Não commitar arquivo JSON
```

### 3. CORS
```typescript
// backend/src/app.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## 📊 Monitoramento

### Logs em Tempo Real
```bash
railway logs --follow
```

### Métricas
```
Railway Dashboard → Metrics
- CPU usage
- Memory usage
- Network traffic
```

### Alertas
```
Railway Dashboard → Settings → Notifications
- Deploy failures
- High resource usage
```

## 🚀 Deploy Automático

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## ✅ Checklist de Deploy

- [ ] Código no GitHub
- [ ] `railway.json` criado
- [ ] `.railwayignore` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Volume persistente configurado (se necessário)
- [ ] Build script configurado
- [ ] Start script configurado
- [ ] Porta dinâmica configurada
- [ ] CORS configurado
- [ ] Firebase credentials configuradas
- [ ] Deploy realizado
- [ ] Logs verificados
- [ ] WhatsApp testado

## 🆘 Suporte

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Twitter: @Railway

### Straxis
- Issues: GitHub Issues
- Desenvolvedor: Kaynan Moreira
- Contato: (62) 99451-0649

---

**Última atualização:** 05/02/2026  
**Versão:** 1.30.9  
**Desenvolvedor:** Kaynan Moreira

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Testar conexão WhatsApp
2. ✅ Verificar persistência de sessão
3. ✅ Configurar domínio customizado
4. ✅ Configurar SSL/HTTPS
5. ✅ Configurar backup automático
6. ✅ Monitorar logs e métricas
7. ✅ Documentar processo para equipe

**Boa sorte com o deploy! 🚀**
