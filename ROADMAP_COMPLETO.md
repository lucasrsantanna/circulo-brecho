# 🗺️ Roadmap Completo - Circulô Brechó Evolution

## ✅ ETAPA 1 - Setup do Admin (CONCLUÍDA)
- [x] Sistema de login com Firebase Auth
- [x] Dashboard protegido com guard de rota  
- [x] Configuração centralizada
- [x] Estrutura organizada (admin/public)

---

## 🔥 ETAPA 2 - Firestore/Storage & Regras (PRÓXIMA)

### 🎯 **Objetivo**: Preparar banco de dados e armazenamento

#### ✅ **Tarefas**:
- [ ] **Configurar Firestore Database**
  - Ativar Firestore no Firebase Console
  - Escolher localização (southamerica-east1 - São Paulo)
  
- [ ] **Configurar Firebase Storage**
  - Ativar Storage para upload de imagens
  - Configurar estrutura de pastas

- [ ] **Criar coleção 'products' com esquema**:
  ```javascript
  {
    id: string (auto),
    name: string,
    price: number,
    size: string,
    condition: 'A' | 'B' | 'C',
    category: string,
    brand: string,
    description: string,
    status: 'disponivel' | 'reservado' | 'vendido',
    images: string[], // URLs do Storage
    colorHex: string,
    uniquePiece: boolean,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  ```

- [ ] **Security Rules (Firestore)**:
  ```javascript
  // Público: apenas leitura de produtos disponíveis
  // Admin: full access após autenticação
  ```

- [ ] **Security Rules (Storage)**:
  ```javascript
  // Público: read de imagens
  // Admin: upload/delete em products/{uid}/*
  ```

#### 🎯 **Aceite**: Regras funcionando, coleção criada, configurações documentadas

---

## 🛠️ ETAPA 3 - CRUD no Admin (Interface para leigos)

### 🎯 **Objetivo**: Interface completa de gestão de produtos

#### ✅ **Tarefas**:
- [ ] **Dashboard com estatísticas reais**
  - Total de peças, disponíveis, vendidas, reservadas
  - Gráficos simples (opcional)

- [ ] **Página de listagem de produtos**
  - Tabela paginada com busca
  - Filtros: status, categoria, tamanho, condição
  - Ações rápidas: editar, alterar status, excluir

- [ ] **Formulário de produtos (muito amigável)**:
  ```
  📝 Informações Básicas
  - Nome da peça
  - Marca
  - Preço (R$)
  - Tamanho
  - Condição (A/B/C com descrição)
  - Categoria (dropdown)
  
  📷 Fotos (arrastar e soltar)
  - Upload múltiplo (até 5 fotos)
  - Preview com possibilidade de remover
  - Redimensionamento automático
  
  📄 Detalhes
  - Descrição
  - Cor (opcional)
  - ✅ Peça única (checkbox)
  ```

- [ ] **Upload de imagens**:
  - Arrastar e soltar
  - Preview imediato
  - Redimensionamento client-side
  - Upload para Storage
  - Fallback se drag-drop não funcionar

#### 🎯 **Aceite**: CRUD completo funcionando, interface intuitiva para leigos

---

## 🌐 ETAPA 4 - API Pública (Cloud Function OU leitura direta)

### 🎯 **Objetivo**: Endpoint seguro para o site público

#### ✅ **Opção A - Cloud Function**:
- [ ] Criar função `GET /api/products`
- [ ] Retornar apenas produtos com `status='disponivel'`  
- [ ] Paginação com cursor
- [ ] CORS configurado
- [ ] Deploy e teste

#### ✅ **Opção B - Leitura direta (mais simples)**:
- [ ] Configurar regras para leitura pública restrita
- [ ] Implementar consultas diretas no frontend
- [ ] Filtros de segurança no client-side

#### 🎯 **Aceite**: Endpoint/consulta funcionando, dados seguros

---

## 🏪 ETAPA 5 - Site Público: Catálogo Real

### 🎯 **Objetivo**: Substituir dados fake por dados reais

#### ✅ **Tarefas**:
- [ ] **Substituir array local por API/Firestore**
  - Fetch dos produtos reais
  - Loading states bonitos
  - Error handling

- [ ] **Grid de produtos melhorado**:
  - Imagem real (primeira foto)
  - Selo "Peça única" quando `uniquePiece=true`
  - Lazy loading das imagens
  - Skeleton loading

- [ ] **Modal de produto completo**:
  - Carrossel de fotos (swipe mobile)
  - Informações completas: marca, descrição, condição
  - Botões: "Adicionar ao carrinho", "Perguntar no WhatsApp"
  - Compartilhar produto (opcional)

- [ ] **Filtros avançados**:
  - Tamanho (chips)
  - Faixa de preço (slider)
  - Condição (A/B/C)  
  - Categoria
  - Cor (se tiver colorHex)
  - Filtros combináveis + contador de resultados

#### 🎯 **Aceite**: Catálogo dinâmico, modal funcional, filtros working

---

## 🛒 ETAPA 6 - Experiência de Compra

### 🎯 **Objetivo**: Melhorar jornada de compra

#### ✅ **Tarefas**:
- [ ] **Sistema de favoritos**:
  - Coração nos cards
  - Persistir no localStorage
  - Página "Meus Favoritos"
  - Remover item se vendido

- [ ] **Checkout WhatsApp otimizado**:
  - Mensagem formatada com detalhes
  - Incluir fotos (links)
  - Calcular frete (futuro)

- [ ] **Controle automático de estoque**:
  - Item vendido = some do catálogo
  - Ou mostrar "VENDIDO" com opção de wishlist

- [ ] **Interface para checkout nativo (preparar)**:
  - Estrutura pronta para Mercado Pago/PIX
  - Desabilitado por enquanto

#### 🎯 **Aceite**: Favoritos funcionando, checkout WA otimizado

---

## 🎨 ETAPA 7 - Storytelling & Sustentabilidade  

### 🎯 **Objetivo**: Contar a história da marca

#### ✅ **Tarefas**:
- [ ] **Seção "Nossa Curadoria"**:
  - Texto sobre seleção manual
  - Processo de qualidade
  - Valores de sustentabilidade

- [ ] **Lookbook inspiracional**:
  - 6-8 fotos de looks montados
  - Grid responsivo
  - Links para peças (se disponíveis)

- [ ] **Blog/Dicas estático**:
  - "Como cuidar de peças de brechó"
  - "Monte looks incríveis gastando pouco"  
  - "Benefícios da moda circular"
  - Estrutura SEO-friendly

#### 🎯 **Aceite**: Seções implementadas, conteúdo envolvente

---

## ⭐ ETAPA 8 - Gatilhos de Confiança

### 🎯 **Objetivo**: Transmitir credibilidade

#### ✅ **Tarefas**:
- [ ] **Depoimentos de clientes**:
  - 4-6 avaliações reais
  - Fotos (opcional)
  - Rating com estrelas

- [ ] **Prova social**:
  - "+200 clientes satisfeitas"
  - "+500 peças já encontraram novo lar"
  - Contador dinâmico (opcional)

- [ ] **Selos de confiança**:
  - "Troca em até 7 dias"
  - "Compra 100% segura"
  - "PIX e cartão aceitos"
  - Ícones no rodapé/checkout

#### 🎯 **Aceite**: Elementos visuais implementados, credibilidade aumentada

---

## 📱 ETAPA 9 - Marketing & Redes Sociais

### 🎯 **Objetivo**: Integração com marketing

#### ✅ **Tarefas**:
- [ ] **Feed do Instagram**:
  - Embed do Instagram (via oEmbed)
  - Ou galeria estática com links
  - Seção "Nos siga"

- [ ] **WhatsApp flutuante**:
  - Botão fixo canto inferior direito
  - Mensagem pré-definida
  - Animação sutil

- [ ] **Newsletter**:
  - Campo de email no rodapé
  - Integração com Mailchimp/Buttondown
  - Success/error states
  - "Receba novidades das peças"

#### 🎯 **Aceite**: Instagram integrado, WA flutuante, newsletter funcionando

---

## ⚡ ETAPA 10 - Performance & UX Final

### 🎯 **Objetivo**: Site ultrarrápido e acessível

#### ✅ **Tarefas**:
- [ ] **Otimização de imagens**:
  - WebP + fallback
  - Thumbnails no admin (700px max)
  - Lazy loading
  - Placeholder blur

- [ ] **Performance**:
  - Minificação CSS/JS
  - Gzip compression
  - Critical CSS inline
  - Lighthouse Score ≥ 90

- [ ] **Acessibilidade**:
  - Alt texts das imagens
  - Navegação por teclado
  - Alto contraste
  - Screen readers

- [ ] **PWA (opcional)**:
  - Service Worker
  - Cache offline
  - Add to homescreen

#### 🎯 **Aceite**: Lighthouse ≥ 90, acessibilidade OK, UX fluida

---

## 🚀 ENTREGÁVEIS FINAIS

### 📦 **Admin Completo**:
- Dashboard com estatísticas
- CRUD de produtos com upload
- Interface amigável para leigos
- Sistema de autenticação

### 🛍️ **Site Público**:
- Catálogo dinâmico com filtros
- Modal de produtos
- Sistema de favoritos
- Checkout WhatsApp
- Seções de storytelling
- Integração com redes sociais

### ⚙️ **Infraestrutura**:
- Firebase (Auth, Firestore, Storage)
- Security Rules configuradas
- Deploy automático (Vercel/Netlify)
- Config centralizada

### 📚 **Documentação**:
- README para a cliente (como usar o admin)
- README técnico (deploy e configuração)
- Guia de troubleshooting

---

## 🎯 **PRÓXIMO PASSO IMEDIATO**

Vamos começar com a **ETAPA 2** - configurando o Firestore e Storage no Firebase Console. Isso vai preparar a base de dados para receber os produtos reais.

**Está pronto para começar a Etapa 2?** 🚀