# Бизнес Дашборд

React-приложение для просмотра данных из Google Sheets через Apps Script.

## Запуск

```bash
npm install
npm run dev
```

Открой http://localhost:5173 — перейди в раздел ⚙️ **Настройки** и вставь URL твоего Web App.

## Деплой Apps Script

1. В редакторе Apps Script: **Deploy → New deployment → Web App**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. Скопируй URL и вставь в настройки дашборда

## Сборка для продакшена

```bash
npm run build
```

Папка `dist/` — можно задеплоить на Vercel, Netlify или любой хостинг.
