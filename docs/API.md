# REST API (base: `/api`)

Auth uses an httpOnly cookie set at login/register. `A` = admin only.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | - | name, email, phone (10-digit), password (min 8) |
| POST | /auth/login | - | email, password |
| POST | /auth/logout | - | clears cookie |
| GET / PUT | /auth/me | user | current user / update name, phone |
| POST | /auth/forgot-password | - | emails reset link |
| PUT | /auth/reset-password/:token | - | set new password |
| GET | /products | - | `?category=&q=&featured=true&page=&limit=` |
| GET | /products/:slug | - | product details |
| GET | /content/home | - | landing page content |
| POST | /orders/checkout | user | `{productId}` -> creates order, returns Cashfree session (or `free:true`) |
| GET | /orders/:orderId/status | user | verifies with Cashfree and returns status |
| GET | /orders/my | user | my orders |
| POST | /orders/:orderId/mock-pay | user | mock mode only |
| POST | /payments/webhook | Cashfree | signed webhook (raw body) |
| GET | /library | user | unlocked products |
| GET | /library/:productId/open | user | link URL or download route (needs access) |
| GET | /library/:productId/download | user | file stream (needs access) |
| GET | /admin/stats | A | revenue, counts, recent orders |
| GET / PUT | /admin/users, /admin/users/:id/toggle-status | A | manage users |
| GET | /admin/orders | A | `?status=&q=` |
| POST | /admin/orders/:orderId/verify | A | re-check with gateway |
| GET / POST / PUT / DELETE | /admin/products(/:id) | A | multipart: thumbnail, file |
| PUT | /admin/content/:key | A | `{data}` |
