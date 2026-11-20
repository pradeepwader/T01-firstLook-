# Architecture

## 1. User and admin journey (from your flowchart - `user-flowchart.png`)

```mermaid
flowchart TD
  A([Website Visit]) --> B{Choose Journey}
  B --> C[User 1: Explore Products]
  B --> D[User 2: Explore Landing Page]
  D --> E[Understand Problems and Solutions]
  E --> F[Explore Products]
  C --> G[Product Details]
  F --> G
  G --> H[Click Buy Now]
  H --> I{Already Registered?}
  I -- No --> J[Create Account] --> K[Login]
  I -- Yes --> K
  K --> L[Checkout] --> M[Create Pending Order] --> N[Online Payment]
  N --> O{Payment Verified?}
  O -- Yes --> P[Confirm Order] --> Q[Create Product Access] --> R[Unlock Product] --> S[User Dashboard] --> T([Use Purchased Product])
  O -- No --> U[Payment Failed / Retry] --> N

  AL([Admin Login]) --> AD[Admin Dashboard]
  AD --> MP[Manage Products]
  AD --> MU[Manage Users]
  AD --> MO[Manage Orders and Payments]
  AD --> ML[Manage Landing Pages and Content]
  MP --> G
```

## 2. System components

```mermaid
flowchart LR
  subgraph Browser
    R[React client]
  end
  subgraph Server[Node.js / Express]
    API[REST API /api/*]
    SVC[Services: cashfree, fulfillment, mailer]
  end
  DB[(MongoDB)]
  CF[Cashfree]
  FS[(storage/products - private files)]
  R -- cookie auth --> API
  API --> DB
  API --> SVC
  SVC -- create / verify order --> CF
  CF -- webhook --> API
  API --> FS
  R -- hosted checkout --> CF
```

## 3. Data model

| Collection | Key fields | Purpose |
|---|---|---|
| `User` | name, email, phone, password(hash), role `user|admin`, isActive | accounts |
| `Product` | title, slug, category, price (INR, 0 = free), thumbnail, deliveryType `file|link`, filePath/externalUrl (hidden), isPublished, isFeatured | catalogue |
| `Order` | orderId (Cashfree `order_id`), user, product, amount, status `PENDING|PAID|FAILED|CANCELLED`, gateway, cfPaymentId, paidAt | "Create Pending Order" -> "Confirm Order" |
| `Access` | user, product, order (unique user+product) | "Create Product Access" / "Unlock Product" |
| `Content` | key (`home`), data | editable landing page |

## 4. Order state machine

`PENDING` --(Cashfree reports PAID, amount matches)--> `PAID` -> access created
`PENDING` --(failed / dropped / expired)--> `FAILED` --(user retries)--> new `PENDING` order, old one `CANCELLED`
