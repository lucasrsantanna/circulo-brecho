# Circulô Brechó - Etapa 1: Setup do Admin (Login)

## 📋 O que foi implementado

✅ **Estrutura organizada**: Separação entre site público (`/public`) e admin (`/admin`)  
✅ **Configuração centralizada**: Arquivo `config.js` com todas as configurações  
✅ **Sistema de Login**: Página de login com Firebase Authentication  
✅ **Dashboard protegido**: Guard de rota que só permite acesso autenticado  
✅ **Interface responsiva**: Design consistente com a identidade do Circulô  

## 🔥 Como configurar o Firebase

### Passo 1: Criar projeto no Firebase
1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto" 
3. Digite o nome: `circulo-brecho` (ou outro de sua escolha)
4. Desabilite Google Analytics (opcional para este projeto)
5. Clique em "Criar projeto"

### Passo 2: Configurar Authentication
1. No painel do Firebase, vá em **Authentication** > **Get started**
2. Na aba **Sign-in method**, clique em **Email/Password**
3. **Ative** a primeira opção (Email/Password)
4. Clique em **Salvar**

### Passo 3: Obter credenciais do projeto
1. Vá em **Configurações do projeto** (ícone engrenagem)
2. Na seção **Seus apps**, clique em **</>** (Web)
3. Digite um nome para o app: `circulo-admin`
4. **Não** marque "Configure também o Firebase Hosting"
5. Clique em **Registrar app**
6. **COPIE** a configuração que aparece (algo como):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto", 
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Passo 4: Configurar o arquivo config.js
1. Abra o arquivo `config.js` na raiz do projeto
2. Substitua as configurações do Firebase:

```javascript
FIREBASE_CONFIG: {
  apiKey: "SUA_API_KEY_AQUI", // ← Cole aqui
  authDomain: "seu-projeto.firebaseapp.com", // ← Cole aqui  
  projectId: "seu-projeto", // ← Cole aqui
  storageBucket: "seu-projeto.appspot.com", // ← Cole aqui
  messagingSenderId: "123456789", // ← Cole aqui
  appId: "1:123456789:web:abcdef123456" // ← Cole aqui
},
```

3. **Também atualize** o número do WhatsApp:
```javascript
WHATSAPP_PHONE: '5511999999999', // ← Seu número real
```

### Passo 5: Criar usuário administrativo
1. No Firebase Console, vá em **Authentication** > **Users**
2. Clique em **Add user**
3. Digite o email e senha da sua cliente (ex: `admin@circulobrecho.com`)
4. Clique em **Add user**

## 🚀 Como testar

### Opção 1: Servidor local com Python
```bash
cd "C:\Users\itfacil\Desktop\Circulo Brecho"
python -m http.server 8000
```
Acesse: http://localhost:8000/admin/login.html

### Opção 2: Abrir diretamente no navegador
- Navegue até a pasta do projeto
- Abra o arquivo `admin/login.html` no seu navegador

## 🧪 Teste o fluxo

1. **Acesse** http://localhost:8000/admin/login.html
2. **Digite** o email e senha que você criou no Firebase
3. **Clique** em "Entrar no Admin"
4. **Verifique** se você é redirecionado para o dashboard
5. **Teste** o botão "Sair" e veja se volta para o login
6. **Teste** acessar `/dashboard.html` diretamente sem estar logado (deve redirecionar para login)

## 📁 Estrutura atual

```
Circulo Brecho/
├── config.js                 # ← Configurações centralizadas
├── admin/
│   ├── login.html            # ← Página de login
│   └── dashboard.html        # ← Dashboard protegido
├── public/                   # ← Site público (antigos arquivos)
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── assets/
│       └── logo.png
└── README_ETAPA1.md          # ← Este arquivo
```

## ✨ Próximos passos (Etapa 2)

- Configurar Firestore (banco de dados)
- Configurar Firebase Storage (imagens)  
- Definir regras de segurança
- Criar coleção `products`

## 🆘 Problemas comuns

**❌ "Erro de configuração"**: Verifique se copiou todas as credenciais corretamente no `config.js`

**❌ "E-mail não cadastrado"**: Certifique-se de ter criado o usuário no Firebase Authentication

**❌ "Erro de conexão"**: Verifique sua conexão com internet e se o projeto Firebase está ativo

**❌ Redirecionamento infinito**: Limpe o cache do navegador (Ctrl+Shift+R)

## 🎯 Critérios de aceite da Etapa 1

- [x] Login funciona com email/senha
- [x] Dashboard só abre se autenticado  
- [x] Botão logout funciona
- [x] Redirecionamento automático funciona
- [x] Interface responsiva e bonita
- [x] Preserva identidade visual do Circulô