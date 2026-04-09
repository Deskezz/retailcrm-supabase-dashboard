require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  });

  return response.json();
}

async function checkLargeOrders() {
  try {
    console.log('Проверка крупных заказов...');
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gt('amount', 50000)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Ошибка получения заказов: ${error.message}`);
    }

    console.log(`Найдено ${orders.length} крупных заказов (> 50,000 ₸)`);

    for (const order of orders) {
      const utmSource = order.utm_source || 'не указан';
      const orderType = order.order_type || 'не указан';
      
      const message = `🚨 *КРУПНЫЙ ЧЕК!*

👤 *Клиент:* ${order.customer_name}
💰 *Сумма:* ${order.amount.toLocaleString('ru-RU')} ₸
🌍 *Источник:* ${utmSource}
📊 *Статус:* ${order.status}
🛠 *Тип:* ${orderType}
🆔 *ID:* ${order.external_id}`;

      const result = await sendTelegramMessage(message);
      
      if (result.ok) {
        console.log(`✓ Уведомление отправлено для заказа #${order.external_id}`);
      } else {
        console.error(`✗ Ошибка отправки для заказа #${order.external_id}:`, result.description);
      }
    }

    console.log(`\nИтого отправлено уведомлений: ${orders.length}`);
    
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
    throw error;
  }
}

checkLargeOrders();
