# Multi-Vendor eCommerce App

## Backend Setup

1. Copy `.env.example` to `.env` in backend/
2. Update `MONGO_URI` with MongoDB Atlas connection string
3. Update `JWT_SECRET` (use strong secret)
4. cd backend && npm install
5. npm run dev

**API Base:** http://localhost:5000/api

**Auth:**
- POST /auth/register {name, email, password, role}
- POST /auth/login {email, password}

**Products:**
- GET /products?search= &category= &minPrice= &maxPrice= &sort=price:asc&page=1&limit=10
- GET /products/own (owner)
- POST /products (owner)
- PUT /products/:id (owner)
- DELETE /products/:id (owner)

**Orders:**
- POST /orders {products, totalPrice} (user)
- GET /orders (user)
- GET /orders/own (owner)
- PUT /orders/:id/status {status} (owner)

**Wishlist:**
- POST /wishlist {productId}
- DELETE /wishlist/:productId
- GET /wishlist

**Admin:**
- GET /users (staff)
- GET /users/stats (staff)
- DELETE /users/:id (staff)

## Frontend

Open `frontend/index.html` in browser (use Live Server extension for CORS).

## Notes
- Cart/Wishlist use localStorage
- Role-based UI in dashboard
- Responsive design mobile-first
- All APIs have JWT auth protection where needed
- Stock auto-decrements on order

