const RECARGAS_TOKEN = process.env.TELEGRAM_RECARGAS_TOKEN;
const RECARGAS_CHAT_ID = process.env.TELEGRAM_RECARGAS_CHAT_ID;

const RETIROS_TOKEN = process.env.TELEGRAM_RETIROS_TOKEN;
const RETIROS_CHAT_ID = process.env.TELEGRAM_RETIROS_CHAT_ID;

async function send(token, chatId, text) {
  if (!token || !chatId) {
    console.log('Telegram bot not configured for this category. Message skipped:', text);
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
    if (!res.ok) {
      const err = await res.json();
      console.error('Telegram API error:', err);
    }
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
}

async function sendPhoto(token, chatId, base64Photo, caption) {
  if (!token || !chatId || !base64Photo) return;

  // Si es base64, necesitamos convertirlo a un Blob/Buffer para Telegram o usar la URL si ya es una
  // Para simplificar, si el bot recibe base64 muy grandes puede fallar. 
  // Pero Telegram permite enviar fotos por URL o por multipart/form-data.
  // Como estamos en Node y recibimos base64, lo más robusto es enviarlo como multipart.
  
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  
  try {
    // Extraer el contenido base64 puro (sin el prefijo data:image/...)
    const base64Data = base64Photo.split(',')[1] || base64Photo;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
    
    // Crear un blob para el archivo
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
  sendRecarga: (text) => send(RECARGAS_TOKEN, RECARGAS_CHAT_ID, text),
  sendRecargaConFoto: (text, base64Photo) => sendPhoto(RECARGAS_TOKEN, RECARGAS_CHAT_ID, base64Photo, text),
  sendRetiro: (text) => send(RETIROS_TOKEN, RETIROS_CHAT_ID, text),
  sendRetiroConFoto: (text, base64Photo) => sendPhoto(RETIROS_TOKEN, RETIROS_CHAT_ID, base64Photo, text),
};
