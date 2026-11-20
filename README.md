# Project T01

> **Starting small. Building meaningful solutions.**
> A career-products platform for students and young graduates in India - roadmaps, learning guides and interview resources, sold (or given free) as digital products.

This is **Phase 1** of the vision in `docs/Clarification_Project-T01.pdf`: a small, low-budget website that validates what people need, with real online payments and instant product access.

| Layer | Tech |
|---|---|
| Client | React 18, Vite, Tailwind CSS, React Router (design tokens from `docs/design-reference`) |
| Server | Node.js 18+, Express, Mongoose (MongoDB), JWT (httpOnly cookie) |
| Payments | Cashfree Payment Gateway (UPI / Card / Net Banking) + a built-in **mock mode** for local testing |

---

## 1. Run it locally (step by step)

**Prerequisites:** Node.js 18 or newer, and MongoDB (local install, or a free MongoDB Atlas connection string).

```bash
# 1) Install everything (server + client)
npm run install:all

# 2) Configure the server
cd server
cp .env.example .env          # Windows: copy .env.example .env
#   -> open .env and set MONGO_URI and JWT_SECRET (a long random string)
#   -> leave PAYMENT_MODE=mock for now
cd ..

# 3) Create the admin account, sample products and landing content
npm run seed

# 4) Start the API (terminal 1)         -> http://localhost:5000
npm run dev:server

# 5) Start the website (terminal 2)     -> http://localhost:5173
npm run dev:client
```

Open **http://localhost:5173**.

**Admin login** (from `.env`): `admin@t01.local` / `ChangeMe@123` -> change these in `.env` before seeding on any real server.

### Try the full purchase flow (mock payments)
1. Open *Products* -> pick **Career Roadmap Starter Pack (₹199)** -> **Buy Now**.
2. You are sent to *Login / Create account* (flowchart: "Already Registered?"). Create an account.
3. *Checkout* -> **Pay ₹199** -> the mock gateway page appears -> **Simulate successful payment**.
4. The status page verifies the order on the server, then **My Dashboard** shows the unlocked product. Choose *Simulate failed payment* to test **Retry**.
5. Log in as admin -> `/admin` to manage products, orders, users and landing-page text.

> Seeded products point to a placeholder link. In **Admin -> Products** set the real Drive/Notion link or upload a PDF/ZIP.

---

## 2. Go live with real Cashfree payments

1. Create a Cashfree account and copy your **App ID** and **Secret Key** (start with the *Sandbox* keys).
2. In `server/.env`:
   ```
   PAYMENT_MODE=cashfree
   CASHFREE_ENV=sandbox            # change to production after Cashfree approves your account
   CASHFREE_APP_ID=...
   CASHFREE_SECRET_KEY=...
   ```
3. Restart the server and run a sandbox payment (Cashfree provides test UPI/cards in their docs).
4. **Webhook (recommended):** expose the API over **https** (ngrok locally, your domain in production), set `SERVER_PUBLIC_URL`, and in the Cashfree dashboard add the webhook URL
   `https://YOUR-API/api/payments/webhook`. Even without the webhook, the app verifies payment on return.
5. For production also set `NODE_ENV=production`, `CASHFREE_ENV=production`, `CLIENT_URL=https://yourdomain.com`.

`PAYMENT_MODE=mock` is **blocked in production** by design, so you cannot accidentally ship free access.

### Deploy as one app
```bash
npm run build            # builds client/dist
NODE_ENV=production npm start   # Express serves the API and the built site on one origin
```
Works on any Node host (Render, Railway, VPS). Put Nginx/Caddy in front for HTTPS. Persist `server/storage` and `server/uploads` on a disk/volume.

---

## 3. Project structure

```
T01/
├── README.md
├── package.json              helper scripts (install:all, seed, dev:server, dev:client, build)
├── docs/                     clarification PDF, flowcharts, architecture, payment flow, API
├── client/                   React app
│   └── src/
│       ├── components/       Navbar, Footer, ProductCard, ProtectedRoute, Spinner
│       ├── context/          AuthContext
│       ├── services/         api.js (all HTTP calls), cashfree.js (checkout SDK)
│       ├── pages/            Home, Products, ProductDetail, Auth, Checkout,
│       │                     PaymentStatus, PaymentMock, Dashboard
│       └── pages/admin/      Overview, AdminProducts, AdminOrders, AdminUsers, AdminContent
└── server/                   Express API
    ├── server.js             entry point
    └── src/
        ├── app.js            security, middleware, routes, static serving
        ├── config/           env validation, database
        ├── models/           User, Product, Order, Access, Content
        ├── controllers/      auth, product, order, payment, library, admin, content
        ├── routes/           one file per resource
        ├── services/         cashfree.js, fulfillment.js, mailer.js, defaultContent.js
        ├── middleware/       auth, upload, validate, errorHandler
        └── utils/            seed.js, helpers
```

## 4. Flowchart -> code map

| Flowchart step | Where it lives |
|---|---|
| Choose Journey: *User 1 explore products* / *User 2 explore landing page* | `pages/Home.jsx`, `pages/Products.jsx` |
| Understand Problems and Solutions | `Home.jsx` (content editable by admin) |
| Product Details -> Click Buy Now | `pages/ProductDetail.jsx` |
| Already Registered? -> Create Account -> Login | `pages/Auth.jsx`, `authController.js` |
| Checkout -> Create Pending Order | `pages/Checkout.jsx`, `orderController.checkout` |
| Online Payment (Cashfree) | `services/cashfree.js` (server + client) |
| Payment Verified? yes / no (retry) | `PaymentStatus.jsx`, `fulfillment.syncOrderStatus`, webhook |
| Confirm Order -> Create Product Access -> Unlock | `fulfillment.fulfillOrder` -> `Access` model |
| User Dashboard -> Use Purchased Product | `Dashboard.jsx`, `libraryController.js` |
| Admin: products / users / orders & payments / landing content | `pages/admin/*`, `adminController.js` |

More detail: `docs/ARCHITECTURE.md`, `docs/PAYMENT-FLOW.md`, `docs/API.md`, `docs/MIGRATION-FROM-UNITRACK.md`.

## 5. Security notes
- Prices are always read from the database; the browser never sends an amount.
- Access is granted **only** after the server confirms payment with Cashfree (amount is re-checked). Fulfilment is idempotent, so the webhook and the return page can both run safely.
- Webhooks are authenticated with Cashfree's HMAC signature over the raw body.
- Paid files are stored outside the public folder and streamed only to buyers.
- Passwords hashed with bcrypt (cost 12), httpOnly SameSite cookie, Helmet, rate limiting, input validation, role is never accepted from the client.
- **Never commit `.env`.** Rotate any key that was ever shared in a zip (see migration notes).
