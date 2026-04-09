# Role: Senior AI Automation Engineer
Task: Build an Order Dashboard Integration.

## Rules for AI Agent:
1. **Security:** NEVER hardcode API keys. Use `process.env`. Ensure `.env` is in `.gitignore`.
2. **Persistence:** Check for existing Order IDs in Supabase before inserting to avoid duplicates.
3. **Logging:** Every time you fix a bug or change a prompt strategy, you MUST update `Development_Log.md`.
4. **Docs:** Create a `.env.example` with all required variable names.

## Tech Stack:
- Next.js (App Router), Tailwind CSS, Recharts.
- Supabase (DB), RetailCRM API.
- Telegraf or custom fetch for Telegram Bot.