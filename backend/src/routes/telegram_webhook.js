import { Router } from 'express';
import { 
  getRecargaById, updateRecarga, 
  getRetiroById, updateRetiro, 
  findUserById, updateUser 
} from '../lib/queries.js';

const router = Router();

// Endpoint para recibir webhooks de Telegram
// NOTA: Deberás configurar este webhook en Telegram usando:
// https://api.telegram.org/bot<TOKEN>/setWebhook?url=<TU_URL>/api/telegram-webhook
router.post('/', async (req, res) => {
  console.log('[Telegram Webhook] Received update:', JSON.stringify(req.body));
  const { callback_query } = req.body;
  
  if (!callback_query) {
    console.log('[Telegram Webhook] No callback_query in body.');
    return res.status(200).send('OK');
  }

  const { data, message, id: callbackQueryId } = callback_query;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  console.log(`[Telegram Webhook] Button clicked! Data: ${data}, From: ${callback_query.from.username || callback_query.from.id}`);

  try {
    const parts = data.split('_'); // ej: recarga_aprobar_uuid
    const type = parts[0];
    const action = parts[1];
    const id = parts.slice(2).join('_'); // Reensamblar el ID por si tiene guiones bajos

    console.log(`[Telegram Webhook] Type: ${type}, Action: ${action}, ID: ${id}`);

    if (type === 'recarga') {
      const recarga = await getRecargaById(id);
      if (!recarga || recarga.estado !== 'pendiente') {
        console.warn(`[Telegram Webhook] Recarga ${id} not found or not pending.`);
        return answerCallback(callbackQueryId, 'Esta recarga ya no está pendiente o no existe.');
      }

      if (action === 'aprobar') {
        console.log(`[Telegram Webhook] Approving recharge ${id}`);
        const user = await findUserById(recarga.usuario_id);
        await updateRecarga(id, { estado: 'aprobada' });
        await updateUser(user.id, { saldo_principal: (user.saldo_principal || 0) + recarga.monto });
        await editTelegramMessage(chatId, messageId, message.text || message.caption, '✅ Aprobada');
      } else {
        console.log(`[Telegram Webhook] Rejecting recharge ${id}`);
        await updateRecarga(id, { estado: 'rechazada' });
        await editTelegramMessage(chatId, messageId, message.text || message.caption, '❌ Rechazada');
      }
      await answerCallback(callbackQueryId, 'Operación procesada.');
    } 
    else if (type === 'retiro') {
      const retiro = await getRetiroById(id);
      if (!retiro || retiro.estado !== 'pendiente') {
        console.warn(`[Telegram Webhook] Retiro ${id} not found or not pending.`);
        return answerCallback(callbackQueryId, 'Este retiro ya no está pendiente o no existe.');
      }

      if (action === 'aprobar') {
        console.log(`[Telegram Webhook] Approving withdrawal ${id}`);
        await updateRetiro(id, { estado: 'completado' });
        await editTelegramMessage(chatId, messageId, message.text || message.caption, '✅ Aprobado (Completado)');
      } else {
        console.log(`[Telegram Webhook] Rejecting withdrawal ${id}`);
        // RECHAZAR RETIRO: Devolver saldo
        const user = await findUserById(retiro.usuario_id);
        const updates = {};
        if (retiro.tipo_billetera === 'comisiones') {
          updates.saldo_comisiones = (user.saldo_comisiones || 0) + retiro.monto;
        } else {
          updates.saldo_principal = (user.saldo_principal || 0) + retiro.monto;
        }
        await updateRetiro(id, { estado: 'rechazado' });
        await updateUser(user.id, updates);
        await editTelegramMessage(chatId, messageId, message.text || message.caption, '❌ Rechazado (Saldo devuelto)');
      }
      await answerCallback(callbackQueryId, 'Operación procesada.');
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Error in Telegram Webhook:', err);
    res.status(200).send('OK');
  }
});

// Helpers para interactuar con Telegram
async function editTelegramMessage(chatId, messageId, oldText, statusText) {
  // Intentar determinar qué bot envió el mensaje basado en el tipo de operación
  // Para simplificar, usamos los tokens de las variables de entorno
  const tokens = [process.env.TELEGRAM_RECARGAS_TOKEN, process.env.TELEGRAM_RETIROS_TOKEN];
  
  const newText = `${oldText}\n\n📢 *Estado:* ${statusText}`;

  for (const token of tokens) {
    if (!token) continue;
    
    // Primero intentamos editar como mensaje de texto
    const urlText = `https://api.telegram.org/bot${token}/editMessageText`;
    const resText = await fetch(urlText, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [] } // Quitar botones
      })
    });

    // Si falla, intentamos editar el caption (para fotos)
    if (!resText.ok) {
      const urlCaption = `https://api.telegram.org/bot${token}/editMessageCaption`;
      await fetch(urlCaption, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          caption: newText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] }
        })
      });
    }
  }
}

async function answerCallback(callbackQueryId, text) {
  const tokens = [process.env.TELEGRAM_RECARGAS_TOKEN, process.env.TELEGRAM_RETIROS_TOKEN];
  for (const token of tokens) {
    if (!token) continue;
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: true
      })
    });
  }
}

export default router;
