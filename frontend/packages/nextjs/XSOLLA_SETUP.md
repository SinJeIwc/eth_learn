Xsolla setup (краткая инструкция)

RU:
1) Зарегистрируйтесь на https://publisher.xsolla.com/ (создайте Publisher account).
2) Откройте Players → Login → Dashboard и скопируйте Login Project ID (PROJECT_ID).
3) Перейдите в Players → Login → Security → OAuth 2.0 и скопируйте Client ID (CLIENT_ID).
4) В корне пакета `frontend/packages/nextjs` скопируйте `.env.example` в файл `.env.local` и заполните значения:

   NEXT_PUBLIC_XSOLLA_PROJECT_ID=ВАШ_PROJECT_ID
   NEXT_PUBLIC_XSOLLA_CLIENT_ID=ВАШ_CLIENT_ID

5) В настройках OAuth на Publisher добавьте Redirect URI для разработки:

   http://localhost:3000/api/xsolla/callback

6) При деплое (Vercel/другие) добавьте те же переменные в настройки окружения (XSOLLA_CLIENT_SECRET — только на сервере, не публикуйте).

EN:
1) Create a Publisher account at https://publisher.xsolla.com/.
2) Go to Players → Login → Dashboard and copy the Login Project ID (PROJECT_ID).
3) Go to Players → Login → Security → OAuth 2.0 and copy the Client ID (CLIENT_ID).
4) In `frontend/packages/nextjs`, copy `.env.example` to `.env.local` and set:

   NEXT_PUBLIC_XSOLLA_PROJECT_ID=YOUR_PROJECT_ID
   NEXT_PUBLIC_XSOLLA_CLIENT_ID=YOUR_CLIENT_ID

5) Add the redirect URI in Xsolla OAuth settings (for local dev):

   http://localhost:3000/api/xsolla/callback

6) For production, set the same env vars in your hosting provider. Keep `XSOLLA_CLIENT_SECRET` server-side only.

Notes:
- If you prefer a PKCE-only client-side flow, adjust the implementation accordingly. Current code uses server-side token exchange.
- After filling `.env.local` restart the dev server (`yarn dev` or `npm run dev`).
