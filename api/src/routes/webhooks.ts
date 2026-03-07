import { Router } from 'express';
import { mercadoPagoWebhook, googleFormsWebhook, webhookHealth, getNotificationStatus } from '../controllers/webhookController';

const router = Router();

// Health check
router.get('/health', webhookHealth);

// Mercado Pago webhook
router.post('/mercadopago', mercadoPagoWebhook);

// Google Forms webhook - recibe solicitudes del formulario
router.post('/google-forms', googleFormsWebhook);

// Debug: consultar estado de notificación de MP
router.get('/status/:paymentId', getNotificationStatus);

export default router;
