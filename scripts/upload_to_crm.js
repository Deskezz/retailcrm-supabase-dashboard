require('dotenv').config();
const fs = require('fs');
const path = require('path');

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;

async function uploadOrders() {
  try {
    const ordersPath = path.join(__dirname, '..', 'mock_orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

    console.log(`Загрузка ${ordersData.length} заказов в RetailCRM...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < ordersData.length; i++) {
      const order = ordersData[i];
      
      const orderPayload = {
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        email: order.email,
        orderMethod: order.orderMethod,
        status: order.status,
        items: order.items,
        delivery: order.delivery
      };

      const url = `${RETAILCRM_URL}api/v5/orders/create`;
      
      const formData = new URLSearchParams();
      formData.append('apiKey', RETAILCRM_API_KEY);
      formData.append('order', JSON.stringify(orderPayload));
      
      // Добавляем customFields отдельно
      if (order.customFields && order.customFields.utm_source) {
        formData.append('order[customFields][utm_source]', order.customFields.utm_source);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        successCount++;
        console.log(`✓ Заказ ${i + 1}/${ordersData.length}: ${order.firstName} ${order.lastName}`);
      } else {
        errorCount++;
        if (i === 0) {
          console.log('Полный ответ первого заказа:', JSON.stringify(result, null, 2));
        }
        console.error(`✗ Заказ ${i + 1}/${ordersData.length}: ${result.errorMsg || JSON.stringify(result.errors)}`);
      }
    }

    console.log(`\nИтого: успешно ${successCount}, ошибок ${errorCount}`);
    
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
    throw error;
  }
}

uploadOrders();
