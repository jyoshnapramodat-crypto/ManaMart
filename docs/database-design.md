# ManaMart / LocalLoop — Database Design & Schema Architecture

## 1. Data Modeling Strategy

The database uses MongoDB with Mongoose ODM schemas. Geo-spatial features leverage GeoJSON `Point` coordinates indexed with `2dsphere` indexes for high-speed radius queries (`$nearSphere` and `$geoWithin`).

---

## 2. Core Collections

### 2.1 `users`
- `_id`: ObjectId
- `name`: String
- `email`: String (sparse, unique)
- `phone`: String (unique)
- `role`: Enum (`'customer'`, `'merchant'`, `'rider'`, `'admin'`)
- `status`: Enum (`'active'`, `'pending'`, `'suspended'`)
- `language`: Enum (`'en'`, `'te'`) (default: `'en'`)
- `addresses`: Array of:
  - `label`: String ('Home', 'Work', 'Other')
  - `street`: String
  - `landmark`: String
  - `city`: String
  - `pincode`: String
  - `location`: GeoJSON Point `{ type: 'Point', coordinates: [lng, lat] }`
  - `isDefault`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### 2.2 `cities` & `serviceZones`
- `name`: String (e.g., 'Hyderabad', 'Vijayawada', 'Vizag', 'Warangal')
- `state`: String ('Telangana', 'Andhra Pradesh')
- `isActive`: Boolean
- `serviceRadiusKm`: Number (default: 10)
- `center`: GeoJSON Point
- `localities`: Array of String names

### 2.3 `merchants`
- `userId`: Ref -> `users`
- `businessName`: String
- `tagline`: String
- `category`: Enum ('food', 'grocery', 'kirana', 'pharmacy', 'bakery', 'flowers', 'stationery', 'electronics', 'fashion', 'services')
- `description`: String
- `phone`: String
- `email`: String
- `bannerImage`: String
- `logo`: String
- `address`: Object (street, locality, city, pincode, GeoJSON location)
- `openingHours`: Object (openTime, closeTime, isOpen)
- `verificationStatus`: Enum ('pending', 'verified', 'rejected', 'action_required')
- `documents`: Ref -> `merchantDocuments`
- `followersCount`: Number
- `rating`: Number (1.0 to 5.0)
- `totalRatings`: Number
- `isPureVeg`: Boolean
- `hasTableBooking`: Boolean
- `deliveryRadiusKm`: Number
- `bankDetails`: Object (accountNumber, ifsc, bankName, upiId)

### 2.4 `merchantDocuments`
- `merchantId`: Ref -> `merchants`
- `fssaiNumber`: String
- `fssaiDocUrl`: String
- `drugLicenseNumber`: String
- `drugLicenseDocUrl`: String
- `gstin`: String
- `panNumber`: String
- `idProofUrl`: String
- `verifiedAt`: Date
- `verifiedBy`: Ref -> `users`
- `rejectionReason`: String

### 2.5 `products`
- `merchantId`: Ref -> `merchants`
- `name`: String
- `teluguName`: String
- `category`: String
- `description`: String
- `price`: Number
- `mrp`: Number (discount calculation)
- `image`: String
- `isVeg`: Boolean
- `inStock`: Boolean
- `unit`: String ('kg', 'gm', 'plate', 'item', 'liter', 'strip')
- `tags`: Array of String
- `rating`: Number

### 2.6 `follows`
- `userId`: Ref -> `users`
- `merchantId`: Ref -> `merchants`
- `notifyOnPost`: Boolean
- `notifyOnOffer`: Boolean
- `createdAt`: Date
*(Unique compound index on `{ userId: 1, merchantId: 1 }`)*

### 2.7 `merchantPosts`
- `merchantId`: Ref -> `merchants`
- `title`: String
- `content`: String
- `imageUrl`: String
- `tag`: Enum ('offer', 'new_arrival', 'daily_special', 'announcement', 'stock_update')
- `discountCode`: String
- `likesCount`: Number
- `createdAt`: Date

### 2.8 `orders` & `subOrders`
- `orderNumber`: String (e.g. `MM-2026-8910`)
- `customerId`: Ref -> `users`
- `merchantId`: Ref -> `merchants`
- `items`: Array of `{ productId, name, price, quantity, unit, isVeg }`
- `subtotal`: Number
- `deliveryFee`: Number
- `taxesAndCharges`: Number
- `discount`: Number
- `totalAmount`: Number
- `paymentStatus`: Enum ('pending', 'paid', 'refunded', 'failed')
- `paymentMethod`: Enum ('upi', 'card', 'netbanking', 'cod')
- `orderStatus`: Enum ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'rejected')
- `deliveryAddress`: Object
- `deliveryOtp`: String (4-digit numeric code)
- `riderId`: Ref -> `riders`
- `riderFare`: Number
- `platformCommission`: Number
- `timeline`: Array of `{ status, timestamp, note }`

### 2.9 `riders` & `riderDocuments`
- `userId`: Ref -> `users`
- `vehicleType`: Enum ('bike', 'scooter', 'bicycle', 'ev')
- `vehicleNumber`: String
- `drivingLicenseNumber`: String
- `drivingLicenseDocUrl`: String
- `vehicleRcDocUrl`: String
- `insuranceDocUrl`: String
- `verificationStatus`: Enum ('pending', 'verified', 'rejected')
- `isOnline`: Boolean
- `currentLocation`: GeoJSON Point
- `activeDeliveryId`: Ref -> `orders`
- `walletBalance`: Number
- `totalDeliveries`: Number
- `rating`: Number

### 2.10 `recurringLists`
- `customerId`: Ref -> `users`
- `merchantId`: Ref -> `merchants`
- `title`: String (e.g., 'Monthly Pantry & Kirana')
- `frequency`: Enum ('monthly', 'biweekly', 'weekly')
- `scheduledDay`: Number (1 to 28)
- `scheduledTime`: String ('09:00 AM')
- `items`: Array of `{ productId, name, quantity, unit, price }`
- `deliveryAddress`: Object
- `status`: Enum ('active', 'paused', 'skipped')
- `customerApprovalRequired`: Boolean (true by default)
- `nextScheduledDate`: Date
- `lastExecutionDate`: Date
- `history`: Array of `{ date, orderId, totalAmount, status }`

### 2.11 `reservations`
- `customerId`: Ref -> `users`
- `merchantId`: Ref -> `merchants`
- `guestName`: String
- `guestPhone`: String
- `partySize`: Number
- `reservationDate`: String
- `reservationTime`: String
- `specialRequests`: String
- `status`: Enum ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')

### 2.12 `notifications`
- `userId`: Ref -> `users`
- `title`: String
- `message`: String
- `type`: Enum ('order', 'offer', 'post', 'recurring', 'verification', 'rider')
- `data`: Object (orderId, merchantId, link)
- `isRead`: Boolean
- `createdAt`: Date

