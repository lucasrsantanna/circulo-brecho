// Configurações centralizadas do Circulô Brechó
const CONFIG = {
  // === FIREBASE CONFIGURATION ===
  // IMPORTANTE: Substitua pelas suas credenciais do Firebase
  // 1. Acesse https://console.firebase.google.com
  // 2. Crie um novo projeto ou use existente  
  // 3. Vá em Project Settings > General > Your apps
  // 4. Clique em "Add app" (web) e copie a config abaixo
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDRiLpXgnzbGRcznh1MJKuE2rLSaoGHims",
    authDomain: "circulo-brecho.firebaseapp.com", 
    projectId: "circulo-brecho",
    storageBucket: "circulo-brecho.firebasestorage.app",
    messagingSenderId: "366841351863",
    appId: "1:366841351863:web:1df8ac8f0ca5ee735c8732"
  },

  // === CONTATO E VENDAS ===
  // Substitua pelo número real do WhatsApp (formato: 5511999999999)
  WHATSAPP_PHONE: '5511914813028',
  
  // === CONFIGURAÇÕES DE MOEDA ===
  CURRENCY: 'BRL',
  LOCALE: 'pt-BR',

  // === CATEGORIAS DE PRODUTOS ===
  // Você pode adicionar ou remover categorias conforme necessário
  CATEGORIES: [
    'Vestidos',
    'Blusas', 
    'Jeans',
    'Blazers',
    'Acessórios',
    'Saias',
    'Calças',
    'Shorts'
  ],

  // === TAMANHOS DISPONÍVEIS ===
  SIZES: [
    'PP', 'P', 'M', 'G', 'GG',
    '36', '38', '40', '42', '44', '46'
  ],

  // === CONDIÇÕES DAS PEÇAS ===
  CONDITIONS: {
    'A': 'Excelente - Como novo',
    'B': 'Muito bom - Pequenos sinais de uso',
    'C': 'Bom - Sinais visíveis de uso'
  },

  // === STATUS DOS PRODUTOS ===
  PRODUCT_STATUS: {
    'disponivel': 'Disponível',
    'reservado': 'Reservado', 
    'vendido': 'Vendido'
  },

  // === CONFIGURAÇÕES DA API ===
  API_BASE_URL: '', // Será preenchido quando configurarmos as Cloud Functions
  
  // === MERCADO PAGO ===
  // CREDENCIAIS DE PRODUÇÃO - ATIVAS! ✅
  MERCADO_PAGO: {
    // Credenciais de produção
    PUBLIC_KEY: 'APP_USR-9796b444-3966-4e17-9dd2-724582171c1d',
    ACCESS_TOKEN: 'APP_USR-7584358912448345-082823-393cc8c4376525c171c7ee3c75967b22-43481797',
    SANDBOX: false, // false = PRODUÇÃO ATIVA
    
    // Credenciais de teste (backup para desenvolvimento)
    TEST_PUBLIC_KEY: 'TEST-76ca8bde-d9bb-445a-976c-9eb0fa27b45e',
    TEST_ACCESS_TOKEN: 'TEST-7584358912448345-082823-acfe38e8815ca202145c3f47334d1c35-43481797'
  },
  
  // === CONFIGURAÇÕES DE EMAIL ===
  EMAIL: {
    FROM_NAME: 'Circulô Brechó',
    FROM_EMAIL: 'noreply@circulobrecho.com',
    REPLY_TO: 'contato@circulobrecho.com'
  },

  // === EMAILJS CONFIGURATION ===
  EMAILJS: {
    SERVICE_ID: 'service_3dsr6pm',
    PUBLIC_KEY: 'LeEQHGDEY8wXfn_Uw',
    TEMPLATE_IDS: {
      ORDER_CONFIRMATION: 'template_order_confirmation',
      PAYMENT_CONFIRMED: 'template_payment_confirmed', 
      ORDER_SHIPPED: 'template_order_shipped',
      ORDER_DELIVERED: 'template_order_delivered'
    }
  },
  
  // === STATUS DOS PEDIDOS ===
  ORDER_STATUS: {
    'pending': 'Aguardando Pagamento',
    'paid': 'Pago - Preparando Envio', 
    'processing': 'Preparando Envio',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado'
  },

  // === CONFIGURAÇÕES DE UPLOAD ===
  MAX_IMAGES_PER_PRODUCT: 5,
  MAX_IMAGE_SIZE_MB: 5,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // === CONFIGURAÇÕES DE PAGINAÇÃO ===
  PRODUCTS_PER_PAGE: 20,
  ADMIN_PRODUCTS_PER_PAGE: 50
};

// Exportar para uso nos módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}