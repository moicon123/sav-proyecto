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

export const telegram = {
  sendRecarga: (text) => send(RECARGAS_TOKEN, RECARGAS_CHAT_ID, text),
  sendRetiro: (text) => send(RETIROS_TOKEN, RETIROS_CHAT_ID, text),
};
