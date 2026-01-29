# Configuração do Firebase Admin SDK

## Status Atual
✅ Frontend configurado corretamente  
⚠️ Backend aguardando credenciais do Admin SDK

## Como Configurar

### Opção 1: Arquivo JSON (Recomendado)

1. Acesse: https://console.firebase.google.com/project/straxis-6e4bc/settings/serviceaccounts/adminsdk
2. Clique em **"Gerar nova chave privada"**
3. Baixe o arquivo JSON
4. Renomeie para: `straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json`
5. Coloque na pasta: `backend/`

### Opção 2: Variáveis de Ambiente

Edite o arquivo `backend/.env` e adicione:

```env
FIREBASE_PROJECT_ID=straxis-6e4bc
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@straxis-6e4bc.iam.gserviceaccount.com
```

## Configuração Atual do Frontend

```javascript
projectId: "straxis-6e4bc"
authDomain: "straxis-6e4bc.firebaseapp.com"
storageBucket: "straxis-6e4bc.firebasestorage.app"
```

## Após Configurar

Reinicie o backend:
```bash
cd backend
npm run dev
```

## Verificação

O backend deve mostrar:
```
✅ Firebase Admin inicializado com arquivo JSON
🚀 Servidor rodando na porta 5000
```
