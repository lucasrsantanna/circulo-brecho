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

  // Criar formulário de cartão do Mercado Pago
  document.getElementById('form-checkout').innerHTML = `
    <div class="card-form">
      <div class="form-group">
        <label class="form-label" for="cardNumber">Número do Cartão</label>
        <input type="text" id="cardNumber" class="form-input" placeholder="0000 0000 0000 0000" data-checkout="cardNumber">
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="cardExpirationDate">Validade</label>
          <input type="text" id="cardExpirationDate" class="form-input" placeholder="MM/YY" data-checkout="cardExpirationDate">
        </div>
        <div class="form-group">
          <label class="form-label" for="securityCode">CVV</label>
          <input type="text" id="securityCode" class="form-input" placeholder="123" data-checkout="securityCode">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="cardholderName">Nome no Cartão</label>
        <input type="text" id="cardholderName" class="form-input" placeholder="Como está no cartão" data-checkout="cardholderName">
      </div>
      
      <div class="form-group">
        <label class="form-label" for="docType">Tipo de Documento</label>
        <select id="docType" class="form-input" data-checkout="docType">
          <option value="CPF">CPF</option>
          <option value="CNPJ">CNPJ</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="docNumber">CPF</label>
        <input type="text" id="docNumber" class="form-input" placeholder="000.000.000-00" data-checkout="docNumber">
      </div>
      
      <div class="form-group">
        <label class="form-label" for="installments">Parcelamento</label>
        <select id="installments" class="form-input" disabled>
          <option>Calculando parcelas...</option>
        </select>
      </div>
      
      <div id="cardErrors" class="form-errors" style="color: #dc3545; margin-top: 16px; display: none;"></div>
    </div>
  `;
  
  // Aplicar máscaras
  applyCardMasks();
  
  // Buscar opções de parcelamento
  getInstallments();
}

// Aplicar máscaras nos campos do cartão
function applyCardMasks() {
  // Máscara para número do cartão
  document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    if (value.length > 19) value = value.substring(0, 19);
    e.target.value = value;
  });

  // Máscara para data de expiração
  document.getElementById('cardExpirationDate').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
  });

  // Máscara para CVV
  document.getElementById('securityCode').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 4);
  });

  // Máscara para CPF
  document.getElementById('docNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    e.target.value = value;
  });
}

// Buscar opções de parcelamento
async function getInstallments() {
  try {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Para teste, vamos criar opções de parcelamento simuladas
    // Em produção, isso viria da API do Mercado Pago
    const installments = [
      { installments: 1, installment_amount: subtotal, total_amount: subtotal },
      { installments: 2, installment_amount: subtotal / 2, total_amount: subtotal },
      { installments: 3, installment_amount: subtotal / 3, total_amount: subtotal * 1.05 },
      { installments: 6, installment_amount: subtotal / 6, total_amount: subtotal * 1.10 },
      { installments: 12, installment_amount: subtotal / 12, total_amount: subtotal * 1.20 }
    ];
    
    const installmentsSelect = document.getElementById('installments');
    installmentsSelect.innerHTML = installments.map(option => `
      <option value="${option.installments}">
        ${option.installments}x de ${currency(option.installment_amount)}
        ${option.installments > 1 ? ` (Total: ${currency(option.total_amount)})` : ''}
      </option>
    `).join('');
    
    installmentsSelect.disabled = false;
    
  } catch (error) {
    console.error('Erro ao buscar parcelamento:', error);
    document.getElementById('installments').innerHTML = '<option value="1">1x sem juros</option>';
  }
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
    
    // Adicionar ID ao orderData para uso no email
    orderData.id = orderId;
    
    // Enviar email de confirmação
    try {
      if (typeof window.EmailService !== 'undefined') {
        await window.EmailService.sendOrderConfirmationEmail(orderData);
      }
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }

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
    showLoading(true, 'Gerando código PIX...');
    
    // Criar preferência de pagamento no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: `Pedido Circulô Brechó #${orderId.slice(-8).toUpperCase()}`,
          description: cart.map(item => `${item.name} (${item.size})`).join(', '),
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL'
        }
      ],
      payment_methods: {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ],
        included_payment_methods: [
          { id: 'pix' }
        ]
      },
      back_urls: {
        success: `${window.location.origin}/public/order-success.html?order=${orderId}`,
        failure: `${window.location.origin}/public/checkout.html`,
        pending: `${window.location.origin}/public/pix-payment.html?order=${orderId}`
      },
      auto_return: 'approved',
      external_reference: orderId,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      notification_url: `${window.location.origin}/api/webhooks/mercadopago`, // Para futuro
      metadata: {
        order_id: orderId,
        customer_email: customerData.email
      }
    };

    // Por enquanto, vamos simular a criação do PIX pois precisamos do backend para fazer a chamada real
    // Em produção, isso seria feito via Cloud Function ou backend
    console.log('Dados da preferência PIX:', preferenceData);
    
    // Simular resposta da API do Mercado Pago
    const mockPixResponse = {
      id: 'pix_' + Date.now(),
      init_point: '#',
      pix_code: generateRealisticPIXCode(amount, orderId),
      qr_code_base64: generateMockQRCode()
    };
    
    // Salvar dados do PIX
    const pixData = {
      orderId: orderId,
      amount: amount,
      pixCode: mockPixResponse.pix_code,
      qrCodeUrl: mockPixResponse.qr_code_base64,
      preferenceId: mockPixResponse.id
    };
    
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
    showLoading(true, 'Processando pagamento com cartão...');
    
    // Validar dados do cartão
    if (!validateCardData()) {
      showLoading(false);
      return;
    }
    
    // Obter token do cartão
    const cardToken = await createCardToken();
    if (!cardToken) {
      showLoading(false);
      return;
    }
    
    // Criar pagamento
    const paymentData = {
      token: cardToken.id,
      installments: parseInt(document.getElementById('installments').value),
      payment_method_id: cardToken.payment_method_id,
      payer: {
        email: customerData.email,
        identification: {
          type: document.getElementById('docType').value,
          number: document.getElementById('docNumber').value.replace(/\D/g, '')
        }
      },
      transaction_amount: amount,
      description: `Pedido Circulô Brechó #${orderId.slice(-8).toUpperCase()}`,
      external_reference: orderId,
      metadata: {
        order_id: orderId,
        customer_email: customerData.email
      }
    };
    
    // Simular processamento (em produção seria uma chamada real para a API)
    console.log('Dados do pagamento:', paymentData);
    
    // Simular resposta de sucesso após 2 segundos
    setTimeout(async () => {
      // Atualizar pedido no Firestore como pago
      await updateOrderPaymentStatus(orderId, 'paid', 'card');
      
      // Enviar email de pagamento confirmado
      try {
        if (typeof window.EmailService !== 'undefined') {
          const orderDoc = await db.collection('orders').doc(orderId).get();
          if (orderDoc.exists) {
            const orderData = orderDoc.data();
            orderData.id = orderId;
            await window.EmailService.sendPaymentConfirmedEmail(orderData);
          }
        }
      } catch (error) {
        console.error('Erro ao enviar email de pagamento confirmado:', error);
      }
      
      // Limpar carrinho
      localStorage.removeItem('cart');
      
      // Redirecionar para página de sucesso
      window.location.href = `/public/order-success.html?order=${orderId}`;
    }, 2000);
    
  } catch (error) {
    console.error('Erro ao processar cartão:', error);
    showError('Erro ao processar cartão: ' + error.message);
    showLoading(false);
  }
}

// Validar dados do cartão
function validateCardData() {
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expirationDate = document.getElementById('cardExpirationDate').value;
  const securityCode = document.getElementById('securityCode').value;
  const cardholderName = document.getElementById('cardholderName').value;
  const docNumber = document.getElementById('docNumber').value;
  
  if (!cardNumber || cardNumber.length < 13) {
    showError('Número do cartão inválido');
    document.getElementById('cardNumber').focus();
    return false;
  }
  
  if (!expirationDate || expirationDate.length !== 5) {
    showError('Data de expiração inválida');
    document.getElementById('cardExpirationDate').focus();
    return false;
  }
  
  if (!securityCode || securityCode.length < 3) {
    showError('CVV inválido');
    document.getElementById('securityCode').focus();
    return false;
  }
  
  if (!cardholderName.trim()) {
    showError('Nome do portador é obrigatório');
    document.getElementById('cardholderName').focus();
    return false;
  }
  
  if (!docNumber || docNumber.replace(/\D/g, '').length !== 11) {
    showError('CPF inválido');
    document.getElementById('docNumber').focus();
    return false;
  }
  
  return true;
}

// Criar token do cartão
async function createCardToken() {
  try {
    // Para teste, vamos simular a criação do token
    // Em produção, isso usaria mercadopago.createCardToken()
    
    const cardData = {
      cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
      cardExpirationMonth: document.getElementById('cardExpirationDate').value.split('/')[0],
      cardExpirationYear: '20' + document.getElementById('cardExpirationDate').value.split('/')[1],
      securityCode: document.getElementById('securityCode').value,
      cardholderName: document.getElementById('cardholderName').value
    };
    
    console.log('Criando token para:', cardData);
    
    // Simular token de resposta
    const mockToken = {
      id: 'card_token_' + Date.now(),
      payment_method_id: 'visa', // Seria detectado automaticamente
      card_number_length: cardData.cardNumber.length,
      security_code_length: cardData.securityCode.length
    };
    
    return mockToken;
    
  } catch (error) {
    console.error('Erro ao criar token:', error);
    showError('Erro ao processar dados do cartão');
    return null;
  }
}

// Atualizar status do pagamento no Firestore
async function updateOrderPaymentStatus(orderId, status, method) {
  try {
    await db.collection('orders').doc(orderId).update({
      'payment.status': status,
      'payment.method': method,
      'payment.paidAt': firebase.firestore.FieldValue.serverTimestamp(),
      'updatedAt': firebase.firestore.FieldValue.serverTimestamp(),
      'status': status === 'paid' ? 'confirmed' : 'pending'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
  }
}

// Funções auxiliares
function generateTrackingNumber() {
  return 'CB' + Date.now().toString().slice(-8);
}

function generateRealisticPIXCode(amount, orderId) {
  // Gerar código PIX mais realista baseado no padrão BR Code
  const merchantName = 'CIRCULO BRECHO';
  const merchantCity = 'SAO PAULO';
  const txid = orderId.slice(-8).toUpperCase();
  const amountStr = amount.toFixed(2);
  
  // Estrutura básica de um PIX (simplificada para demonstração)
  let pixCode = '00020126';
  pixCode += '580014BR.GOV.BCB.PIX';
  pixCode += '0136' + window.CONFIG.WHATSAPP_PHONE; // Usar WhatsApp como chave PIX
  pixCode += '0204' + '0000';
  pixCode += '5303986'; // Código da moeda BRL
  pixCode += '54' + String(amountStr.length).padStart(2, '0') + amountStr;
  pixCode += '5802BR';
  pixCode += '59' + String(merchantName.length).padStart(2, '0') + merchantName;
  pixCode += '60' + String(merchantCity.length).padStart(2, '0') + merchantCity;
  pixCode += '6214';
  pixCode += '0510' + txid;
  pixCode += '6304';
  
  // Calcular CRC16 (simplificado)
  const crc = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  pixCode += crc;
  
  return pixCode;
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