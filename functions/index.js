const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const fetch = require('node-fetch');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configurações do Mercado Pago
const MP_CONFIG = {
  ACCESS_TOKEN: 'APP_USR-7584358912448345-082823-393cc8c4376525c171c7ee3c75967b22-43481797',
  BASE_URL: 'https://api.mercadopago.com'
};

/**
 * Cloud Function para criar preferência PIX no Mercado Pago
 */
exports.createPixPayment = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      // Validar método
      if (req.method !== 'POST') {
        return res.status(405).json({error: 'Método não permitido'});
      }

      const { orderId, amount, description, customerEmail } = req.body;

      // Validar dados obrigatórios
      if (!orderId || !amount || !customerEmail) {
        return res.status(400).json({
          error: 'Dados obrigatórios: orderId, amount, customerEmail'
        });
      }

      console.log('Criando PIX para:', { orderId, amount, description, customerEmail });

      // Dados da preferência para o Mercado Pago
      const preferenceData = {
        items: [
          {
            title: description || `Pedido Circulô Brechó #${orderId.slice(-8).toUpperCase()}`,
            quantity: 1,
            unit_price: parseFloat(amount),
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
          success: `${req.headers.origin}/public/order-success.html?order=${orderId}`,
          failure: `${req.headers.origin}/public/checkout.html`,
          pending: `${req.headers.origin}/public/pix-payment.html?order=${orderId}`
        },
        auto_return: 'approved',
        external_reference: orderId,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        notification_url: `${req.headers.origin}/api/webhooks/mercadopago`,
        metadata: {
          order_id: orderId,
          customer_email: customerEmail
        }
      };

      // Fazer requisição para API do Mercado Pago
      const response = await fetch(`${MP_CONFIG.BASE_URL}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_CONFIG.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      const mpResponse = await response.json();

      if (!response.ok) {
        console.error('Erro do Mercado Pago:', mpResponse);
        throw new Error(`Mercado Pago API Error: ${mpResponse.message || 'Unknown error'}`);
      }

      console.log('PIX criado com sucesso:', mpResponse.id);

      // Atualizar pedido no Firestore com dados do PIX
      await db.collection('orders').doc(orderId).update({
        'payment.mercadoPagoId': mpResponse.id,
        'payment.initPoint': mpResponse.init_point,
        'payment.pixQrCode': mpResponse.point_of_interaction?.transaction_data?.qr_code,
        'payment.pixQrCodeBase64': mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        'payment.pixCode': mpResponse.point_of_interaction?.transaction_data?.qr_code,
        'updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });

      // Retornar dados do PIX
      res.status(200).json({
        success: true,
        preferenceId: mpResponse.id,
        initPoint: mpResponse.init_point,
        qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        pixCode: mpResponse.point_of_interaction?.transaction_data?.qr_code
      });

    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });
});

/**
 * Webhook para receber notificações do Mercado Pago
 */
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Webhook recebido:', req.body);

    const { type, data } = req.body;

    // Processar notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar informações do pagamento
      const paymentResponse = await fetch(`${MP_CONFIG.BASE_URL}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MP_CONFIG.ACCESS_TOKEN}`
        }
      });

      const payment = await paymentResponse.json();
      console.log('Dados do pagamento:', payment);

      // Atualizar status no Firestore
      if (payment.external_reference) {
        const orderId = payment.external_reference;
        const status = payment.status === 'approved' ? 'paid' : 'pending';
        
        await db.collection('orders').doc(orderId).update({
          'payment.status': status,
          'payment.mpPaymentId': paymentId,
          'payment.mpStatus': payment.status,
          'payment.paidAt': status === 'paid' ? admin.firestore.FieldValue.serverTimestamp() : null,
          'updatedAt': admin.firestore.FieldValue.serverTimestamp(),
          'status': status === 'paid' ? 'confirmed' : 'pending'
        });

        console.log(`Pedido ${orderId} atualizado: ${status}`);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({error: error.message});
  }
});

/**
 * Função para verificar status de pagamento
 */
exports.checkPaymentStatus = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({error: 'orderId é obrigatório'});
      }

      // Buscar pedido no Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        return res.status(404).json({error: 'Pedido não encontrado'});
      }

      const orderData = orderDoc.data();
      const paymentStatus = orderData.payment?.status || 'pending';
      
      res.status(200).json({
        orderId,
        status: paymentStatus,
        mpStatus: orderData.payment?.mpStatus,
        paidAt: orderData.payment?.paidAt
      });

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({error: error.message});
    }
  });
});

/**
 * Função de teste
 */
exports.testFunction = functions.https.onRequest((req, res) => {
  res.status(200).json({
    message: 'Cloud Functions funcionando!',
    timestamp: new Date().toISOString(),
    config: {
      hasAccessToken: !!MP_CONFIG.ACCESS_TOKEN,
      nodeVersion: process.version
    }
  });
});