require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function randomizeDates() {
  try {
    console.log('Получение заказов из Supabase...');
    
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .order('id', { ascending: true });

    if (fetchError) {
      throw new Error(`Ошибка получения заказов: ${fetchError.message}`);
    }

    console.log(`Найдено ${orders.length} заказов`);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let updatedCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      // Равномерное распределение за 30 дней
      const dayOffset = Math.floor((i / orders.length) * 30);
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const orderDate = new Date(thirtyDaysAgo);
      orderDate.setDate(orderDate.getDate() + dayOffset);
      orderDate.setHours(randomHour, randomMinute, 0, 0);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ created_at: orderDate.toISOString() })
        .eq('id', order.id);

      if (updateError) {
        console.error(`✗ Ошибка обновления заказа #${order.id}:`, updateError.message);
      } else {
        updatedCount++;
        console.log(`✓ Заказ #${order.id}: ${orderDate.toLocaleDateString('ru-RU')}`);
      }
    }

    console.log(`\nИтого обновлено: ${updatedCount} заказов`);
    
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
    throw error;
  }
}

randomizeDates();
