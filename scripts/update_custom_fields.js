require('dotenv').config();
const fs = require('fs');
const path = require('path');

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;

async function updateOrdersWithCustomFields() {
  try {
    const ordersPath = path.join(__dirname, '..', 'mock_orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

    console.log('Получение заказов из RetailCRM...');
    
    const url = `${RETAILCRM_URL}api/v5/orders?apiKey=${RETAILCRM_API_KEY}&limit=100`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Ошибка получения заказов из CRM');
    }

    const crmOrders = result.orders || [];
    console.log(`Найдено ${crmOrders.length} заказов в CRM`);

    let updatedCount = 0;

    for (let i = 0; i < Math.min(ordersData.length, crmOrders.length); i++) {
      const mockOrder = ordersData[i];
      const crmOrder = crmOrders[crmOrders.length - 1 - i]; // Берем в обратном порядке
      
      const updateUrl = `${RETAILCRM_URL}api/v5/orders/${crmOrder.id}/edit`;
      
      const orderData = {
        customFields: {}
      };
      
      if (mockOrder.customFields && mockOrder.customFields.utm_source) {
        orderData.customFields.utm_source = mockOrder.customFields.utm_source;
      }
      
      const formData = new URLSearchParams();
      formData.append('apiKey', RETAILCRM_API_KEY);
      formData.append('order', JSON.stringify(orderData));
      
      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const updateResult = await updateResponse.json();

      if (updateResult.success) {
        updatedCount++;
        console.log(`✓ Заказ #${crmOrder.id} обновлен (utm: ${mockOrder.customFields?.utm_source})`);
      } else {
        console.error(`✗ Ошибка обновления заказа #${crmOrder.id}:`, updateResult.errorMsg);
      }
    }

    console.log(`\nИтого обновлено: ${updatedCount} заказов`);
    
  } catch (error) {
    console.error('✗ Ошибка:', error.message);
    throw error;
  }
}

updateOrdersWithCustomFields();
