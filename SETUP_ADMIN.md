# Como Criar seu Usuário Admin

## Passo 1: Criar usuário no Firebase Authentication

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto **straxis-6e4bc**
3. Vá em **Authentication** > **Users**
4. Clique em **Add user**
5. Preencha:
   - **Email**: seu@email.com
   - **Password**: sua senha segura
6. Clique em **Add user**
7. **COPIE o UID** do usuário criado (ex: `abc123xyz456`)

## Passo 2: Criar documento no Firestore

### Opção A: Usando o script (Recomendado)

```bash
cd backend
node create-admin-user.js "SEU_UID_AQUI" "seu@email.com" "Seu Nome"
```

**Exemplo:**
```bash
node create-admin-user.js "abc123xyz456" "kaynan@straxis.com" "Kaynan Moreira"
```

### Opção B: Manualmente no Firebase Console

1. Acesse **Firestore Database**
2. Crie a coleção `users` (se não existir)
3. Adicione um documento com ID = **UID do usuário**
4. Adicione os campos:

```
email: "seu@email.com"
name: "Seu Nome"
companyId: "platform"
role: "admin_platform"
permissions: []
active: true
createdAt: [timestamp atual]
updatedAt: [timestamp atual]
deletedAt: null
```

## Passo 3: Fazer Login

1. Acesse a aplicação: http://localhost:3000
2. Faça login com:
   - **Email**: o email que você criou
   - **Password**: a senha que você definiu
3. Você será logado como **Admin da Plataforma**! 🎉

## Verificar se funcionou

Após o login, verifique no console do navegador:
- `localStorage.getItem('userRole')` deve retornar `"admin_platform"`
- `localStorage.getItem('userName')` deve retornar seu nome
- `localStorage.getItem('companyId')` deve retornar `"platform"`

## Roles disponíveis

- **`admin_platform`**: Acesso total a todas as empresas
- **`owner`**: Dono de uma empresa específica
- **`user`**: Usuário comum com permissões limitadas

## Troubleshooting

### "Email ou senha incorretos"
- Verifique se o usuário foi criado no Firebase Authentication
- Confirme que está usando o email e senha corretos

### "Usuário não encontrado no sistema"
- O documento não foi criado no Firestore
- Execute o script ou crie manualmente

### "Usuário inativo"
- Verifique se o campo `active` está como `true`

### Ainda logando como "Dev User"
- Não use o botão "Login Rápido (Dev)"
- Use o formulário de login normal
- Limpe o localStorage: `localStorage.clear()`
