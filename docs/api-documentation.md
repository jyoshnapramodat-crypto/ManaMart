# ManaMart / LocalLoop — RESTful API Documentation (`/api/v1`)

All endpoints are prefixed with `/api/v1`. Authentication uses `Bearer <JWT_TOKEN>` in the `Authorization` header.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/auth/send-otp` | Sends/simulates SMS OTP to phone number | No |
| POST | `/auth/verify-otp` | Verifies OTP and returns access & refresh tokens | No |
| POST | `/auth/quick-login` | Demo fast login switcher for any role | No |
| POST | `/auth/refresh-token`| Generates new access token via refresh token | No |
| GET  | `/auth/me` | Fetches authenticated user profile & addresses | Yes |
| POST | `/auth/logout` | Revokes active session tokens | Yes |

---

## 2. Customer Endpoints (`/api/v1/customers`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET  | `/customers/profile` | Get full customer profile & saved preferences | Yes |
| PUT  | `/customers/profile` | Update name, email, preferred language | Yes |
| POST | `/customers/addresses` | Add a new saved address with Geo coordinates | Yes |
| DELETE| `/customers/addresses/:id`| Remove saved address | Yes |

---

## 3. Discovery & Catalog Endpoints (`/api/v1/discovery`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET  | `/discovery/cities` | List supported cities & active zones | No |
| GET  | `/discovery/nearby` | Hyperlocal stores query with lat/lng & radius | No |
| GET  | `/discovery/search` | Search stores, dishes, groceries, or medicines | No |
| GET  | `/discovery/categories` | Browse all 10+ merchant categories | No |
| GET  | `/discovery/merchants/:id`| Get store details, menu, reviews, & status | No |

---

## 4. Following & Social Updates (`/api/v1/follows`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/follows/:merchantId` | Follow a verified local business | Yes |
| DELETE| `/follows/:merchantId`| Unfollow a business | Yes |
| GET  | `/follows/my-shops` | List of all followed merchants for customer | Yes |
| GET  | `/follows/feed` | Stories & post feed from followed stores | Yes |

---

## 5. Orders & Checkout (`/api/v1/orders`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/orders/create` | Place new order, calculates taxes & generates OTP | Yes |
| GET  | `/orders/my-orders` | Fetch customer order history | Yes |
| GET  | `/orders/:id` | Get real-time order tracking & timeline | Yes |
| POST | `/orders/:id/cancel` | Cancel order if not yet accepted/preparing | Yes |

---

## 6. Automated Monthly Shopping Lists (`/api/v1/recurring-lists`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/recurring-lists` | Create new recurring subscription list | Yes |
| GET  | `/recurring-lists` | Fetch all customer recurring lists | Yes |
| PUT  | `/recurring-lists/:id`| Edit list items, scheduled day or address | Yes |
| POST | `/recurring-lists/:id/pause`| Temporarily pause recurring schedule | Yes |
| POST | `/recurring-lists/:id/resume`| Resume paused list | Yes |
| POST | `/recurring-lists/:id/execute`| Trigger monthly review & merchant check | Yes |
| DELETE| `/recurring-lists/:id`| Delete recurring list | Yes |

---

## 7. Merchant Operations (`/api/v1/merchants`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/merchants/register` | Merchant registration & profile setup | Yes |
| POST | `/merchants/documents` | Upload FSSAI, Drug license, GST, PAN | Yes |
| GET  | `/merchants/my-store` | Fetch current merchant store status | Yes (Merchant) |
| PUT  | `/merchants/my-store` | Update opening status, hours, banner | Yes (Merchant) |
| GET  | `/merchants/products` | Manage store products & menu | Yes (Merchant) |
| POST | `/merchants/products` | Create new product / dish | Yes (Merchant) |
| PUT  | `/merchants/products/:id`| Update stock or price | Yes (Merchant) |
| GET  | `/merchants/orders` | Live incoming orders dashboard | Yes (Merchant) |
| PUT  | `/merchants/orders/:id/status`| Update status: accept, preparing, ready | Yes (Merchant) |
| POST | `/merchants/posts` | Create new social post / promo alert | Yes (Merchant) |
| GET  | `/merchants/reservations`| View & confirm table reservations | Yes (Merchant) |

---

## 8. Delivery Partners / Riders (`/api/v1/riders`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/riders/register` | Register rider profile & vehicle details | Yes |
| POST | `/riders/documents` | Submit DL, RC, insurance for admin audit | Yes |
| PUT  | `/riders/status` | Toggle online/offline status | Yes (Rider) |
| GET  | `/riders/tasks/nearby` | Available pickup tasks in current radius | Yes (Rider) |
| POST | `/riders/tasks/:id/accept`| Accept delivery task | Yes (Rider) |
| POST | `/riders/tasks/:id/counter`| Offer custom payout fare for task | Yes (Rider) |
| POST | `/riders/tasks/:id/verify-otp`| Verify customer delivery OTP & complete | Yes (Rider) |
| GET  | `/riders/earnings` | Daily, weekly earnings & completed deliveries | Yes (Rider) |

---

## 9. Platform Administration (`/api/v1/admin`)

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET  | `/admin/stats` | GMV, order counts, active riders, commission | Yes (Admin) |
| GET  | `/admin/merchants/pending`| Verification audit queue for businesses | Yes (Admin) |
| POST | `/admin/merchants/:id/verify`| Approve or reject merchant license | Yes (Admin) |
| GET  | `/admin/riders/pending`| Rider DL and RC verification queue | Yes (Admin) |
| POST | `/admin/riders/:id/verify`| Approve or reject rider documents | Yes (Admin) |
| GET  | `/admin/orders` | Real-time platform-wide order monitor | Yes (Admin) |
| POST | `/admin/refunds/:id` | Process order dispute / refund | Yes (Admin) |

