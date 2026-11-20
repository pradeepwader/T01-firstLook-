# What changed from UnitrackT01

UniTrack was a **college directory** (colleges, reviews, chat, notifications, Gemini chatbot, Google Maps). Project T01 is a **career-products store** with payments, so the domain code was replaced and the reusable foundation was kept.

## Kept and improved
- Express app skeleton: helmet, CORS, rate limiting, morgan, central error handler, multer uploads.
- Mongoose + JWT auth, bcrypt hashing, role-based `protect/authorize`, password reset flow.
- React + Vite + Tailwind client, Auth context, protected routes, react-hot-toast.

## Removed (not in the T01 clarification/flowchart)
Colleges, reviews, chat + Socket.IO, notifications, Gemini AI chat, Google Maps, `sharp`, `uuid`, `socket.io*`, `date-fns`, `@googlemaps/js-api-loader`.

## Added
Products, Orders, Access, Content models; Cashfree service with backend verification + webhook; free-product claim; private file delivery; user dashboard; admin (products, users, orders & payments, landing content); mock payment mode; seed script; docs.

## Problems found in the old code and fixed
1. **`.env` with real secrets was inside the zip** (JWT, DB, email, API keys). It is **not** included here. **Rotate every key/password from that file** (MongoDB user, JWT secrets, Gmail app password, Gemini and Google Maps keys).
2. `auth.js` read `req.cookies` but `cookie-parser` was never installed -> cookie auth never worked. Now installed and used.
3. JWT was stored in `localStorage` (readable by any XSS). Now an **httpOnly** cookie only.
4. Cookie `sameSite: 'strict'` would drop the session when returning from a payment page; now `lax`.
5. Users could register with role `college`; role is now never taken from the request.
6. Forgot-password revealed whether an email exists; now returns the same message.
7. Uploads allowed 10 MB public images only; now separate public thumbnails vs **private** paid files.
8. Folder structure flattened into `src/{config,models,controllers,routes,services,middleware,utils}` with one entry point (`server.js`) and an `app.js` that can be tested.
9. Config is validated at start-up; missing secrets stop the server with a clear message.
10. `dist/` build output and `node_modules` no longer shipped; `.gitignore` added.
