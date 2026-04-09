require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateSupabaseWithMockData() {
  try {
    const ordersPath = path.join(__dirname, '..', 'mock_orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

    console.log('Получение заказов из Supabase...');
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, external_id, customer_name')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Ошибка получения заказов: ${error.message}`);
    }

    console.log(`Найдено ${orders.length} заказов в Supabase`);

    let updatedCount = 0;

    for (let i = 0; i < Math.min(ordersData.length, orders.length); i++) {
      const mockOrder = ordersData[i];
      const dbOrder = orders[i];
      
      const utmSource = mockOrder.customFields?.utm_source || null;
      const orderType = mockOrder.orderType || 'main';
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          utm_source: utmSource,
          order_type: orderType
        })
        .eq('id', dbOrder.id);

      if (updateError) {
        console.error(`✗ Ошибка обновления заказа #${dbOrder.id}:`, updateError.message);
      } else {
        updatedCount++;
        console.log(`✓ Заказ #${dbOrder.id} (${dbOrder.customer_name}): utm=${utmSource}, type=${orderType}`);
      }
    }

    console.log(`\nИтого обновлено: ${updatedCount} заказов`);
    
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
    throw error;
  }
}

updateSupabaseWithMockData();
