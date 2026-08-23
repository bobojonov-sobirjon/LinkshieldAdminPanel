# LinkShield Admin Panel

Vue 3 + Vite admin dashboard (English / Russian) for [LinkShield](https://linkshield.artresinrf.ru).

## Stack

- Vue 3, Vue Router, Pinia, vue-i18n, Axios
- API: `https://linkshield.artresinrf.ru/api/v1`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

### Login

Admin or moderator account, e.g. seed:

- Phone: `+998700000001`
- Password: `FakePass123!`

## Build

```bash
npm run build
```

Output: `dist/`. For production, set `VITE_API_BASE` to the API base URL.

## Features

- Dashboard (geo / ads / FAQ counts)
- FAQ CRUD (eng / rus)
- Ads slots monitor
- Users (role / active)
- Reviews moderation
- Billing payments
- Links & ownership verification
- UI language: EN / RU
