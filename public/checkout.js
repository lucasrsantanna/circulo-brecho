// === CIRCULÔ BRECHÓ - CHECKOUT SYSTEM ===
// Sistema de checkout completo com Mercado Pago

// Inicialização
let app, db;
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentStep = 1;
let selectedPaymentMethod = null;
let customerData = {};
let mercadopago = null;

// Elementos DOM
const elements = {
  stepIndicators: document.querySelectorAll('.step'),
  formSections: document.querySelectorAll('.form-section'),
  cartItems: document.getElementById('checkoutCartItems'),
  subtotal: document.getElementById('checkoutSubtotal'),
  total: document.getElementById('checkoutTotal'),
  loading: document.getElementById('loadingOverlay')
};

// Inicializar Firebase
function initializeFirebase() {
  try {
    app = firebase.initializeApp(window.CONFIG.FIREBASE_CONFIG);
    db = firebase.firestore();
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    showError('Erro ao conectar com o servidor. Tente recarregar a página.');
  }
}

// Inicializar Mercado Pago
function initializeMercadoPago() {
  try {
    if (window.CONFIG.MERCADO_PAGO.PUBLIC_KEY === 'TEST-your-public-key-here') {
      console.warn('⚠️ ATENÇÃO: Configure suas credenciais do Mercado Pago no config.js');
      return;
    }
    
    mercadopago = new MercadoPago(window.CONFIG.MERCADO_PAGO.PUBLIC_KEY);
  } catch (error) {
    console.error('Erro ao inicializar Mercado Pago:', error);
  }
}

// Função utilitária para formatação de moeda
function currency(v) { 
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); 
}

// Mostrar loading
function showLoading(show, message = 'Processando...') {
  const overlay = elements.loading;
  const content = overlay.querySelector('.loading-content p');
  content.textContent = message;
  overlay.style.display = show ? 'flex' : 'none';
}

// Mostrar erro
function showError(message) {
  alert('Erro: ' + message); // TODO: Implementar toast/modal de erro mais elegante
}

// Mostrar sucesso
function showSuccess(message) {
  alert('Sucesso: ' + message); // TODO: Implementar toast/modal de sucesso mais elegante
}

// Carregar carrinho no checkout
function loadCheckoutCart() {
  if (cart.length === 0) {
    showError('Seu carrinho está vazio!');
    window.location.href = '/public/index.html';
    return;
  }

  // Renderizar itens do carrinho
  elements.cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="item-thumb" style="background: ${item.color || '#e9785f'}">
        ${item.images && item.images.length > 0 
          ? `<img src="${item.images[0]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`
          : item.category?.charAt(0) || 'P'
        }
      </div>
      <div class="item-details">
        <h4>${item.name}</h4>
        <p class="item-meta">Tamanho ${item.size} • Condição ${item.condition}</p>
        <p class="item-meta">${currency(item.price)} x ${item.qty} = ${currency(item.price * item.qty)}</p>
      </div>
    </div>
  `).join('');

  // Calcular totais
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = 0; // Frete grátis por enquanto
  const total = subtotal + shipping;

  elements.subtotal.textContent = currency(subtotal);
  elements.total.textContent = currency(total);
}

// Navegação entre steps
function nextStep(step) {
  if (step === 2) {
    // Validar dados pessoais
    if (!validateCustomerData()) {
      return;
    }
    collectCustomerData();
  }
  
  if (step === 3) {
    // Validar método de pagamento
    if (!selectedPaymentMethod) {
      showError('Selecione um método de pagamento');
      return;
    }
  }

  currentStep = step;
  updateStepIndicators();
  showStep(step);
}

function previousStep(step) {
  currentStep = step;
  updateStepIndicators();
  showStep(step);
}

function updateStepIndicators() {
  elements.stepIndicators.forEach((indicator, index) => {
    const stepNumber = index + 1;
    indicator.classList.remove('active', 'completed', 'inactive');
    
    if (stepNumber < currentStep) {
      indicator.classList.add('completed');
    } else if (stepNumber === currentStep) {
      indicator.classList.add('active');
    } else {
      indicator.classList.add('inactive');
    }
  });
}

function showStep(step) {
  elements.formSections.forEach((section, index) => {
    section.classList.remove('active');
    if (index + 1 === step) {
      section.classList.add('active');
    }
  });
}

// Validação dos dados do cliente
function validateCustomerData() {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'zipCode', 'street', 'number', 'neighborhood', 'city'];
  
  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.focus();
      showError(`Por favor, preencha o campo ${field.previousElementSibling.textContent}`);
      return false;
    }
  }

  // Validar email
  const email = document.getElementById('email').value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Por favor, digite um email válido');
    document.getElementById('email').focus();
    return false;
  }

  return true;
}

// Coletar dados do cliente
function collectCustomerData() {
  customerData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: {
      zipCode: document.getElementById('zipCode').value.trim(),
      street: document.getElementById('street').value.trim(),
      number: document.getElementById('number').value.trim(),
      neighborhood: document.getElementById('neighborhood').value.trim(),
      city: document.getElementById('city').value.trim(),
      complement: document.getElementById('complement').value.trim()
    }
  };
}

// Seleção de método de pagamento
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  
  // Atualizar visual
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  document.querySelector(`[data-method="${method}"]`).classList.add('selected');

  // Mostrar/ocultar formulários
  document.getElementById('pixPayment').style.display = method === 'pix' ? 'block' : 'none';
  document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';

  // Habilitar botão continuar
  document.getElementById('continuePayment').disabled = false;

  // Se cartão, inicializar formulário do Mercado Pago
  if (method === 'card') {
    initializeCardForm();
  }
}

// Inicializar formulário de cartão
function initializeCardForm() {
  if (!mercadopago) {
    showError('Mercado Pago não inicializado. Verifique as credenciais.');
    return;
  }

  // TODO: Implementar formulário de cartão do Mercado Pago
  document.getElementById('form-checkout').innerHTML = `
    <div style="padding: 20px; border: 1px solid #e8dec9; border-radius: 12px; text-align: center;">
      <p>⚠️ <strong>Formulário de cartão será implementado após configurar credenciais do Mercado Pago</strong></p>
      <p>Por enquanto, selecione PIX para testar o sistema.</p>
    </div>
  `;
}

// Finalizar pedido
async function finalizeOrder() {
  try {
    showLoading(true, 'Criando seu pedido...');

    // Calcular totais
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    // Criar pedido no Firestore
    const orderData = {
      customer: {
        name: `${customerData.firstName} ${customerData.lastName}`,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address
      },
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        condition: item.condition,
        qty: item.qty,
        image: item.images && item.images.length > 0 ? item.images[0] : null
      })),
      payment: {
        method: selectedPaymentMethod,
        status: 'pending',
        total: total,
        subtotal: subtotal,
        shipping: shipping
      },
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      trackingNumber: generateTrackingNumber()
    };

    // Salvar no Firestore
    const orderRef = await db.collection('orders').add(orderData);
    const orderId = orderRef.id;

    showLoading(true, 'Processando pagamento...');

    if (selectedPaymentMethod === 'pix') {
      // Processar PIX
      await processPIXPayment(orderId, total);
    } else if (selectedPaymentMethod === 'card') {
      // Processar cartão
      await processCardPayment(orderId, total);
    }

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    showError('Erro ao processar pedido. Tente novamente.');
  } finally {
    showLoading(false);
  }
}

// Processar pagamento PIX
async function processPIXPayment(orderId, amount) {
  try {
    // TODO: Implementar integração real com Mercado Pago PIX
    // Por enquanto, simular criação do PIX
    
    showLoading(true, 'Gerando código PIX...');
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Por enquanto, redirecionar para página de PIX mockada
    const pixData = {
      orderId: orderId,
      amount: amount,
      pixCode: generateMockPIXCode(),
      qrCodeUrl: generateMockQRCode()
    };
    
    // Salvar dados do PIX no localStorage temporariamente
    localStorage.setItem('currentPIXPayment', JSON.stringify(pixData));
    
    // Limpar carrinho
    localStorage.removeItem('cart');
    
    // Redirecionar para página de PIX
    window.location.href = `/public/pix-payment.html?order=${orderId}`;
    
  } catch (error) {
    console.error('Erro ao processar PIX:', error);
    showError('Erro ao gerar PIX. Tente novamente.');
  }
}

// Processar pagamento com cartão
async function processCardPayment(orderId, amount) {
  try {
    // TODO: Implementar integração real com Mercado Pago
    showError('Pagamento com cartão será implementado após configurar credenciais do Mercado Pago. Use PIX por enquanto.');
  } catch (error) {
    console.error('Erro ao processar cartão:', error);
    showError('Erro ao processar cartão. Tente novamente.');
  }
}

// Funções auxiliares
function generateTrackingNumber() {
  return 'CB' + Date.now().toString().slice(-8);
}

function generateMockPIXCode() {
  // Gerar código PIX mockado para demonstração
  return '00020126580014BR.GOV.BCB.PIX013614329876543210204000053039865802BR5913CIRCULO BRECHO6009SAO PAULO62140510CB' + Date.now().toString().slice(-8) + '6304ABCD';
}

function generateMockQRCode() {
  // URL mockada do QR Code - em produção viria da API do Mercado Pago
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

// Máscara para CEP
document.getElementById('zipCode')?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 8) {
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value;
  }
});

// Máscara para telefone
document.getElementById('phone')?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 11) {
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value;
  }
});

// Buscar CEP automaticamente
document.getElementById('zipCode')?.addEventListener('blur', async function(e) {
  const cep = e.target.value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        document.getElementById('street').value = data.logradouro;
        document.getElementById('neighborhood').value = data.bairro;
        document.getElementById('city').value = data.localidade;
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }
});

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebase();
  initializeMercadoPago();
  loadCheckoutCart();
  
  // Se não há itens no carrinho, redirecionar
  if (cart.length === 0) {
    showError('Seu carrinho está vazio!');
    setTimeout(() => {
      window.location.href = '/public/index.html';
    }, 2000);
  }
});

// Função global para ser chamada pelos botões HTML
window.nextStep = nextStep;
window.previousStep = previousStep;
window.selectPaymentMethod = selectPaymentMethod;
window.finalizeOrder = finalizeOrder;