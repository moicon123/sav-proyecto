const getRecargasConfig = () => ({
  token: process.env.TELEGRAM_RECARGAS_TOKEN,
  chatId: process.env.TELEGRAM_RECARGAS_CHAT_ID
});

const getRetirosConfig = () => ({
  token: process.env.TELEGRAM_RETIROS_TOKEN,
  chatId: process.env.TELEGRAM_RETIROS_CHAT_ID
});

async function send(token, chatId, text, replyMarkup = null) {
  if (!token || !chatId) {
    console.error('Telegram bot not configured. Token or ChatID missing.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    };
    if (replyMarkup) body.reply_markup = replyMarkup;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram API error:', err);
    }
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
}

async function sendPhoto(token, chatId, base64Photo, caption, replyMarkup = null) {
  if (!token || !chatId || !base64Photo) return;

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  
  try {
    const base64Data = base64Photo.split(',')[1] || base64Photo;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
    if (replyMarkup) formData.append('reply_markup', JSON.stringify(replyMarkup));
    
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('photo', blob, 'comprobante.jpg');

    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram sendPhoto error:', err);
    }
  } catch (err) {
    console.error('Failed to send Telegram photo:', err.message);
  }
}

export const telegram = {
  sendRecarga: (text, id) => {
    const config = getRecargasConfig();
    const markup = {
      inline_keyboard: [[
        { text: '✅ Aceptar', callback_data: `recarga_aprobar_${id}` },
        { text: '❌ Rechazar', callback_data: `recarga_rechazar_${id}` }
      ]]
    };
    return send(config.token, config.chatId, text, markup);
  },
  sendRecargaConFoto: (text, base64Photo, id) => {
    const config = getRecargasConfig();
    const markup = {
      inline_keyboard: [[
        { text: '✅ Aceptar', callback_data: `recarga_aprobar_${id}` },
        { text: '❌ Rechazar', callback_data: `recarga_rechazar_${id}` }
      ]]
    };
    return sendPhoto(config.token, config.chatId, base64Photo, text, markup);
  },
  sendRetiro: (text, id) => {
    const config = getRetirosConfig();
    const markup = {
      inline_keyboard: [[
        { text: '✅ Aceptar', callback_data: `retiro_aprobar_${id}` },
        { text: '❌ Rechazar', callback_data: `retiro_rechazar_${id}` }
      ]]
    };
    return send(config.token, config.chatId, text, markup);
  },
  sendRetiroConFoto: (text, base64Photo, id) => {
    const config = getRetirosConfig();
    const markup = {
      inline_keyboard: [[
        { text: '✅ Aceptar', callback_data: `retiro_aprobar_${id}` },
        { text: '❌ Rechazar', callback_data: `retiro_rechazar_${id}` }
      ]]
    };
    return sendPhoto(config.token, config.chatId, base64Photo, text, markup);
  },
};
