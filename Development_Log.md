# Лог разработки

## 2026-04-09

### Инициализация проекта
- Установлен Next.js (App Router) + React + Tailwind CSS
- Установлены зависимости: Recharts, Supabase, dotenv
- Создана базовая структура: `app/layout.js`, `app/page.js`, `app/globals.css`
- Настроены конфигурации: `tailwind.config.js`, `postcss.config.js`

### Скрипт загрузки в RetailCRM
**Файл:** `scripts/upload_to_crm.js`

**Проблемы и решения:**
1. API возвращал HTML вместо JSON → изменен формат запроса на `application/x-www-form-urlencoded`
2. Ошибка "non-scalar value" → использован `URLSearchParams` для формирования body
3. Ошибка "OrderType not exists" → удалено поле `orderType` из payload (тип "eshop-individual" отсутствует в CRM)

**Результат:** Все 50 заказов из `mock_orders.json` успешно загружены в RetailCRM через API `/api/v5/orders/create`

### Скрипт синхронизации с Supabase
**Файл:** `scripts/sync_to_supabase.js`

- Создан скрипт для получения заказов из RetailCRM и сохранения в Supabase
- Реализована проверка по `external_id` для предотвращения дубликатов
- Создана SQL-схема таблицы `orders` в `supabase_schema.sql`
- Команда запуска: `npm run sync`

### Фронтенд (Next.js App Router)
**Установлены библиотеки:**
- `lucide-react` - иконки для UI
- `typescript` + типы для React/Node
- `recharts` - графики (уже установлен)

**Созданные файлы:**
- `app/page.tsx` - главная страница с серверным компонентом
- `app/layout.tsx` - корневой layout (TypeScript)
- `app/components/MetricCard.tsx` - карточки метрик
- `app/components/SalesChart.tsx` - график продаж
- `lib/supabase.ts` - Supabase клиент
- `tsconfig.json` - конфигурация TypeScript

**Дизайн:** Minimalist Professional Dark (черный фон, zinc-900 карточки, синие акценты)

**Метрики:** Total Sales, Order Count, Average Check с иконками

**График:** Area chart продаж по датам с градиентной заливкой

### Безопасность
- Создан `.env.example` с шаблоном переменных
- `.env` добавлен в `.gitignore`
- Все API ключи используются через `process.env`

### Ошибка сборки Tailwind CSS v4
| Фаза | Задача/Проблема | Причина | Решение | 
|------|-----------------|---------|---------|
| Сборка | PostCSS plugin error | Переход Tailwind CSS на версию 4 | Установлен `@tailwindcss/postcss`, создан `postcss.config.mjs` |
| Сборка | Module format mismatch | package.json с "type": "commonjs" конфликтует с ES модулями | Изменен на "type": "module", обновлены tailwind.config.js на ES export |

**Итоговое решение:**
1. Установлен `@tailwindcss/postcss`
2. Изменен `app/globals.css` на `@import "tailwindcss"`
3. Создан `postcss.config.mjs` с ES синтаксисом
4. Изменен `package.json` на `"type": "module"`
5. Обновлен `tailwind.config.js` на ES export
6. Удален старый `postcss.config.js`

### Даунгрейд на LTS стек
**Причина:** Критическая нагрузка на систему (100% CPU) из-за экспериментальных версий Next.js 16, React 19, Tailwind v4, TypeScript 6

**Откат на стабильные версии:**
- Next.js: 16.2.3 → 15.1.0 (LTS)
- React: 19.2.5 → 18.3.1 (LTS)
- React-DOM: 19.2.5 → 18.3.1 (LTS)
- Tailwind CSS: 4.2.2 → 3.4.1 (стабильная v3)
- TypeScript: 6.0.2 → 5.3.3 (стабильная)
- Supabase: 2.103.0 → 2.39.0
- Recharts: 3.8.1 → 2.10.3
- Lucide-react: 1.8.0 → 0.294.0

**Изменения конфигурации:**
1. Удален `postcss.config.mjs`, создан классический `postcss.config.js`
2. Возврат к `@tailwind base/components/utilities` в `globals.css`
3. Возврат к `module.exports` в `tailwind.config.js`
4. Удалено `"type": "module"` из `package.json`

**Следующий шаг:** Удалить `node_modules` и `.next`, затем выполнить `npm install`

### Исправление дат заказов
**Проблема:** Все заказы в базе имели одинаковую дату (сегодня), график выглядел плоским

**Решение:**
- Создан скрипт `scripts/randomize_dates.js`
- Распределил 50 заказов равномерно за последние 30 дней (10.03.2026 - 08.04.2026)
- Команда: `npm run randomize`
- Результат: График продаж теперь показывает реалистичную динамику

### Telegram Bot для уведомлений
**Файл:** `scripts/telegram_bot.js`

**Функционал:**
- Проверяет заказы в Supabase с суммой > 50,000 ₸
- Получает дополнительные данные из RetailCRM (utm_source, orderType)
- Отправляет уведомления в Telegram с форматированием Markdown

**Формат сообщения:**
```
🚨 КРУПНЫЙ ЧЕК!
👤 Клиент: [firstName] [lastName]
💰 Сумма: [amount] ₸
🌍 Источник: [utm_source]
📊 Статус: [status]
🛠 Тип: [orderType]
🆔 ID: [externalId]
```

**Результат:** Отправлено 24 уведомления о крупных заказах. Команда: `npm run notify`

### Локализация интерфейса
**Изменения:**
- Название вкладки: "Order Dashboard" → "Панель заказов"
- Заголовок страницы: "Order Dashboard" → "Панель заказов"
- Метрики: "Total Sales" → "Общая сумма", "Order Count" → "Количество заказов", "Average Check" → "Средний чек"
- График tooltip: "amount" → "Сумма" с форматированием в тенге

### Добавление utm_source и order_type в Supabase
**Проблема:** Telegram бот показывал "не указан" для источника и типа заказа

**Решение:**
1. Добавлены колонки `utm_source` и `order_type` в таблицу orders в Supabase
2. Создан скрипт `scripts/update_supabase_fields.js` для обновления данных из `mock_orders.json`
3. Обновлен `scripts/sync_to_supabase.js` для синхронизации этих полей при будущих загрузках
4. Обновлен `scripts/telegram_bot.js` для получения данных напрямую из Supabase (без запросов к RetailCRM)

**Результат:** Все 50 заказов обновлены. Telegram бот теперь показывает реальные данные (instagram, google, tiktok, direct, referral)

---

**Формат лога:** Краткие записи с датой, описанием задачи, ключевыми проблемами и решениями. Без лишних деталей.

## Итоговая структура проекта

**Скрипты:**
- `npm run upload` - загрузка заказов в RetailCRM
- `npm run sync` - синхронизация из RetailCRM в Supabase
- `npm run randomize` - распределение дат заказов
- `npm run update-fields` - обновление utm_source и order_type в Supabase
- `npm run notify` - отправка уведомлений о крупных заказах
- `npm run dev` - запуск Next.js дашборда

**Готово к финальной проверке.**