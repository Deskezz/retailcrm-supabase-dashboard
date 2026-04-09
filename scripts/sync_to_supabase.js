require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getOrdersFromCRM(page = 1) {
  try {
    const url = `${RETAILCRM_URL}api/v5/orders?apiKey=${RETAILCRM_API_KEY}&page=${page}&limit=100`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.errorMsg || 'Failed to fetch orders from CRM');
    }

    return result;
  } catch (error) {
    console.error('✗ Ошибка получения заказов из CRM:', error.message);
    throw error;
  }
}

async function syncToSupabase() {
  try {
    console.log('Получение заказов из RetailCRM...');
    
    const result = await getOrdersFromCRM();
    const orders = result.orders || [];
    
    console.log(`Найдено ${orders.length} заказов`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
      const { data: existing, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('external_id', order.id.toString())
        .single();

      const orderData = {
        external_id: order.id.toString(),
        amount: order.totalSumm || 0,
        status: order.status || 'new',
        customer_name: `${order.firstName || ''} ${order.lastName || ''}`.trim(),
        created_at: order.createdAt || new Date().toISOString(),
        utm_source: order.customFields?.utm_source || null,
        order_type: order.orderType || null
      };

      if (existing) {
        // Обновляем существующий заказ
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            utm_source: orderData.utm_source,
            order_type: orderData.order_type
          })
          .eq('external_id', order.id.toString());

        if (updateError) {
          console.error(`✗ Ошибка обновления заказа #${order.id}:`, updateError.message);
        } else {
          skippedCount++;
          console.log(`↻ Заказ #${order.id} обновлен (utm: ${orderData.utm_source}, type: ${orderData.order_type})`);
        }
        continue;
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (insertError) {
        console.error(`✗ Ошибка вставки заказа #${order.id}:`, insertError.message);
      } else {
        insertedCount++;
        console.log(`✓ Заказ #${order.id}: ${orderData.customer_name}`);
      }
    }

    console.log(`\nИтого: добавлено ${insertedCount}, пропущено ${skippedCount}`);
    
  } catch (error) {
    console.error('✗ Ошибка синхронизации:', error.message);
    throw error;
  }
}

syncToSupabase();
