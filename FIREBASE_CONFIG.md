# Configuração do Firebase - Straxis SaaS

**Data:** 26/01/2026  
**Status:** ✅ Configurado e Testado

---

## Backend (Node.js + Firebase Admin SDK)

### Arquivo de Configuração
- **Localização:** `backend/src/config/firebase.config.ts`
- **Método:** Arquivo JSON do Firebase Admin SDK

### Credenciais
- **Arquivo JSON:** `backend/straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json`
- **Project ID:** `straxis-6e4bc`
- **Client Email:** `firebase-adminsdk-fbsvc@straxis-6e4bc.iam.gserviceaccount.com`
- **Storage Bucket:** `straxis-6e4bc.firebasestorage.app`

### Como Funciona
1. O backend tenta carregar o arquivo JSON primeiro
2. Se o arquivo não for encontrado, usa variáveis de ambiente como fallback
3. Exporta `db`, `auth`, `storage` e `firestore` para uso em todo o backend

### Teste
Execute o script de teste para verificar a configuração:

```bash
cd backend
node test-firebase.js
```

**Resultado esperado:**
```
✅ Arquivo JSON carregado com sucesso
✅ Firebase Admin inicializado com sucesso!
✅ Firestore conectado
✅ Auth conectado
✅ Storage conectado
🎉 Todas as configurações estão corretas!
```

---

## Frontend (React + Firebase SDK)

### Arquivo de Configuração
- **Localização:** `frontend/src/config/firebase.config.ts`
- **Método:** Credenciais hardcoded (seguro para frontend)

### Credenciais
```typescript
{
  apiKey: "AIzaSyDl5ZStMzyjtkLApdK4rsFuG_XIm1ewUOY",
  authDomain: "straxis-6e4bc.firebaseapp.com",
  projectId: "straxis-6e4bc",
  storageBucket: "straxis-6e4bc.firebasestorage.app",
  messagingSenderId: "648877578703",
  appId: "1:648877578703:web:c2871c4f370436590a1aba",
  measurementId: "G-2NXVBFE03P"
}
```

### Como Funciona
1. Inicializa o Firebase com as credenciais
2. Exporta `auth`, `db`, `storage` e `analytics` para uso em todo o frontend
3. Analytics é inicializado apenas em produção

### Uso no Frontend

```typescript
import { auth, db, storage } from '@/config/firebase.config';

// Autenticação
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);

// Firestore
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'companies'));

// Storage
import { ref, uploadBytes } from 'firebase/storage';
const storageRef = ref(storage, 'path/to/file');
await uploadBytes(storageRef, file);
```

---

## Segurança

### Backend
- ✅ Arquivo JSON do Admin SDK **NÃO** deve ser commitado no Git
- ✅ Adicionar `*.json` no `.gitignore` (exceto package.json)
- ✅ Usar variáveis de ambiente em produção

### Frontend
- ✅ API Key do Firebase é **segura** para uso público
- ✅ Segurança é garantida pelas Firestore Rules
- ✅ Nunca expor chaves privadas ou secrets no frontend

---

## Firestore Rules

As regras de segurança estão definidas em `firestore.rules` e garantem:
- Isolamento completo entre empresas (multi-tenant)
- Validação de permissões por role (Admin, Owner, User)
- Bloqueio de acesso para planos vencidos
- Validação de tipos de dados

---

## Variáveis de Ambiente

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=straxis-6e4bc
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## Troubleshooting

### Erro: "Cannot find module firebase-admin"
```bash
cd backend
npm install firebase-admin
```

### Erro: "Cannot find module firebase"
```bash
cd frontend
npm install firebase
```

### Erro: "ENOENT: no such file or directory"
Verifique se o arquivo JSON existe em `backend/straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json`

### Erro: "Permission denied"
Verifique as Firestore Rules em `firestore.rules`

---

## Próximos Passos

1. ✅ Backend configurado com arquivo JSON
2. ✅ Frontend configurado com credenciais
3. ⏳ Implementar AuthContext no frontend
4. ⏳ Implementar serviços de autenticação
5. ⏳ Testar fluxo completo de login

---

**Documento criado em:** 26/01/2026  
**Última atualização:** 26/01/2026
