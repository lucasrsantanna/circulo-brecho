// === CIRCULÔ BRECHÓ - SISTEMA DE EMAILS ===
// Sistema para envio de emails automáticos de acompanhamento de pedidos

// Configurações do EmailJS (para demonstração)
// Em produção, recomenda-se usar um serviço mais robusto como SendGrid, Amazon SES, etc.
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_circulo_brecho',
  TEMPLATE_ID: {
    ORDER_CONFIRMATION: 'template_order_confirmation',
    PAYMENT_CONFIRMED: 'template_payment_confirmed',
    ORDER_SHIPPED: 'template_order_shipped',
    ORDER_DELIVERED: 'template_order_delivered'
  },
  USER_ID: 'your_emailjs_user_id'
};

// Templates de email
const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: {
    subject: '✨ Pedido Confirmado - Circulô Brechó #{orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e9785f, #dca53a); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Pedido Confirmado!</h1>
          <p style="margin: 16px 0 0; font-size: 16px;">Obrigada por escolher o Circulô Brechó ✨</p>
        </div>
        
        <div style="padding: 32px; background: white;">
          <h2 style="color: #2f4046; margin: 0 0 24px;">📦 Detalhes do seu pedido</h2>
          
          <div style="background: #f6efdf; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pedido:</strong> #{orderNumber}</p>
            <p><strong>Data:</strong> {orderDate}</p>
            <p><strong>Total:</strong> {orderTotal}</p>
            <p><strong>Forma de Pagamento:</strong> {paymentMethod}</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h3 style="color: #2f4046;">Itens do pedido:</h3>
            {itemsList}
          </div>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px; color: #155724;">📍 Número de Acompanhamento</h4>
            <p style="font-family: monospace; font-size: 20px; font-weight: bold; margin: 8px 0; letter-spacing: 2px;">{trackingNumber}</p>
            <p style="margin: 12px 0 0; font-size: 14px; color: #155724;">Use este número para acompanhar seu pedido</p>
          </div>
          
          <h3 style="color: #2f4046;">🚀 Próximos passos:</h3>
          <ol style="color: #666; line-height: 1.6;">
            <li><strong>Confirmação:</strong> Processaremos seu pagamento em instantes</li>
            <li><strong>Preparação:</strong> Separaremos suas peças com muito carinho</li>
            <li><strong>Envio:</strong> Enviaremos em até 2 dias úteis</li>
            <li><strong>Entrega:</strong> Você receberá em casa em até 7 dias úteis</li>
          </ol>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="{whatsappLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">💬 Falar Conosco no WhatsApp</a>
          </div>
        </div>
        
        <div style="background: #2f4046; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0;">🌱 <strong>Obrigada por escolher moda sustentável!</strong></p>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.8;">Cada compra no Circulô é um passo rumo a um futuro mais consciente.</p>
        </div>
      </div>
    `
  },
  
  PAYMENT_CONFIRMED: {
    subject: '✅ Pagamento Confirmado - Pedido #{orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #28a745; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Pagamento Confirmado! ✅</h1>
          <p style="margin: 16px 0 0; font-size: 16px;">Agora vamos preparar seu pedido com muito carinho</p>
        </div>
        
        <div style="padding: 32px; background: white;">
          <p>Olá {customerName}! 😊</p>
          
          <p>Recebemos a confirmação do seu pagamento e já começamos a preparar seu pedido.</p>
          
          <div style="background: #f6efdf; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pedido:</strong> #{orderNumber}</p>
            <p><strong>Rastreamento:</strong> {trackingNumber}</p>
            <p><strong>Total Pago:</strong> {orderTotal}</p>
          </div>
          
          <h3 style="color: #2f4046;">📦 O que acontece agora:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li><strong>Hoje:</strong> Separamos suas peças e embalamos com cuidado</li>
            <li><strong>Até amanhã:</strong> Postamos nos Correios</li>
            <li><strong>Em 24h:</strong> Você recebe o código de rastreio</li>
            <li><strong>5-7 dias úteis:</strong> Chegada na sua casa! 🎉</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="{whatsappLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">💬 Dúvidas? Fale Conosco</a>
          </div>
        </div>
      </div>
    `
  },
  
  ORDER_SHIPPED: {
    subject: '🚚 Pedido a Caminho - #{orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #17a2b8; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Pedido a Caminho! 🚚</h1>
          <p style="margin: 16px 0 0; font-size: 16px;">Suas peças estão indo até você</p>
        </div>
        
        <div style="padding: 32px; background: white;">
          <p>Olá {customerName}! 😊</p>
          
          <p>Seu pedido foi postado e está a caminho! Em breve suas peças estarão em suas mãos.</p>
          
          <div style="background: #cce5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px; color: #004085;">📦 Código de Rastreamento dos Correios</h4>
            <p style="font-family: monospace; font-size: 18px; font-weight: bold; margin: 8px 0; letter-spacing: 2px; color: #004085;">{shippingCode}</p>
            <p style="margin: 12px 0 0; font-size: 14px; color: #004085;">
              <a href="https://www2.correios.com.br/sistemas/rastreamento/" target="_blank" style="color: #004085;">👉 Rastrear no site dos Correios</a>
            </p>
          </div>
          
          <div style="background: #f6efdf; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pedido:</strong> #{orderNumber}</p>
            <p><strong>Rastreamento Interno:</strong> {trackingNumber}</p>
            <p><strong>Previsão de Entrega:</strong> {deliveryEstimate}</p>
          </div>
          
          <h3 style="color: #2f4046;">📱 Acompanhe pelo WhatsApp</h3>
          <p>Prefere receber atualizações pelo WhatsApp? É só nos chamar!</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="{whatsappLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">💬 Acompanhar pelo WhatsApp</a>
          </div>
        </div>
      </div>
    `
  },
  
  ORDER_DELIVERED: {
    subject: '🎉 Entregue! Como ficaram as peças? - #{orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Entregue! 🎉</h1>
          <p style="margin: 16px 0 0; font-size: 16px;">Esperamos que tenha adorado suas novas peças!</p>
        </div>
        
        <div style="padding: 32px; background: white;">
          <p>Olá {customerName}! 😊</p>
          
          <p>Seu pedido foi entregue! Esperamos que tenha gostado de suas novas peças do Circulô Brechó.</p>
          
          <div style="background: #f6efdf; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pedido:</strong> #{orderNumber}</p>
            <p><strong>Status:</strong> ✅ Entregue</p>
            <p><strong>Data de Entrega:</strong> {deliveryDate}</p>
          </div>
          
          <h3 style="color: #2f4046;">💚 Compartilhe sua Nova Aquisição</h3>
          <p>Que tal mostrar para as amigas como ficou estilosa com suas peças sustentáveis?</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px; color: #155724;">📸 Marque @circulo.brecho nas suas fotos!</h4>
            <p style="margin: 0; color: #155724;">Adoramos ver como nossas clientes arrasam com as peças do brechó!</p>
          </div>
          
          <h3 style="color: #2f4046;">⭐ Como foi sua experiência?</h3>
          <p>Sua opinião é muito importante! Nos conte como foi:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="{whatsappLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0 8px;">💬 Deixar Feedback</a>
            <a href="{instagramLink}" style="background: linear-gradient(45deg, #f09433, #bc1888); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 0 8px;">📷 Seguir no Insta</a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h4 style="margin: 0 0 12px; color: #2f4046;">🛍️ Gostou da Experiência?</h4>
            <p style="margin: 0 0 16px; color: #666;">Continue garimpando peças incríveis no nosso catálogo!</p>
            <a href="{storeLink}" style="background: #e9785f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Novas Peças</a>
          </div>
        </div>
        
        <div style="background: #2f4046; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0;">🌱 <strong>Obrigada por fazer parte do movimento sustentável!</strong></p>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.8;">Cada compra consciente faz a diferença para o nosso planeta.</p>
        </div>
      </div>
    `
  }
};

// Função principal para enviar emails
async function sendOrderEmail(orderData, emailType) {
  try {
    const template = EMAIL_TEMPLATES[emailType];
    if (!template) {
      console.error('Template de email não encontrado:', emailType);
      return false;
    }

    // Preparar dados para o template
    const emailData = prepareEmailData(orderData, template);
    
    // Para demonstração, vamos apenas logar o email
    // Em produção, aqui seria integrado com EmailJS, SendGrid, etc.
    console.log('📧 Enviando email:', {
      to: orderData.customer.email,
      subject: emailData.subject,
      type: emailType,
      orderNumber: orderData.orderNumber
    });
    
    console.log('Email HTML:', emailData.html);
    
    // Simular envio bem-sucedido
    return true;
    
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

// Preparar dados do email com base no template
function prepareEmailData(orderData, template) {
  const orderNumber = orderData.id?.slice(-8).toUpperCase() || 'UNKNOWN';
  const trackingNumber = orderData.trackingNumber || `CB${orderNumber}`;
  const orderDate = orderData.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR');
  const orderTotal = currency(orderData.payment?.total || 0);
  const paymentMethod = orderData.payment?.method === 'pix' ? 'PIX' : 'Cartão de Crédito';
  
  const whatsappPhone = window.CONFIG?.WHATSAPP_PHONE || '5511914813028';
  const whatsappMessage = `Olá! Gostaria de acompanhar meu pedido ${trackingNumber}. Obrigada!`;
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  
  const itemsList = orderData.items?.map(item => `
    <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
      <strong>${item.name}</strong> - Tam. ${item.size} - ${currency(item.price)}
    </div>
  `).join('') || '<p>Itens não encontrados</p>';
  
  // Substituir variáveis no template
  let htmlContent = template.template
    .replace(/{orderNumber}/g, orderNumber)
    .replace(/{trackingNumber}/g, trackingNumber)
    .replace(/{orderDate}/g, orderDate)
    .replace(/{orderTotal}/g, orderTotal)
    .replace(/{paymentMethod}/g, paymentMethod)
    .replace(/{customerName}/g, orderData.customer?.name || 'Cliente')
    .replace(/{itemsList}/g, itemsList)
    .replace(/{whatsappLink}/g, whatsappLink)
    .replace(/{shippingCode}/g, orderData.shippingCode || 'BR123456789BR')
    .replace(/{deliveryEstimate}/g, '5-7 dias úteis')
    .replace(/{deliveryDate}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/{instagramLink}/g, 'https://instagram.com/')
    .replace(/{storeLink}/g, window.location.origin + '/public/index.html');
  
  let subject = template.subject.replace(/{orderNumber}/g, orderNumber);
  
  return {
    subject,
    html: htmlContent
  };
}

// Função utilitária para formatação de moeda
function currency(v) { 
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); 
}

// Funções para diferentes tipos de email
async function sendOrderConfirmationEmail(orderData) {
  return await sendOrderEmail(orderData, 'ORDER_CONFIRMATION');
}

async function sendPaymentConfirmedEmail(orderData) {
  return await sendOrderEmail(orderData, 'PAYMENT_CONFIRMED');
}

async function sendOrderShippedEmail(orderData) {
  return await sendOrderEmail(orderData, 'ORDER_SHIPPED');
}

async function sendOrderDeliveredEmail(orderData) {
  return await sendOrderEmail(orderData, 'ORDER_DELIVERED');
}

// Monitor de mudanças de status do pedido
function setupOrderStatusMonitor() {
  // Esta função seria chamada quando há mudanças no Firestore
  // Em um ambiente real, isso seria implementado com Cloud Functions
  console.log('🔍 Monitor de status de pedidos ativo');
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
  window.EmailService = {
    sendOrderConfirmationEmail,
    sendPaymentConfirmedEmail,
    sendOrderShippedEmail,
    sendOrderDeliveredEmail,
    setupOrderStatusMonitor
  };
}