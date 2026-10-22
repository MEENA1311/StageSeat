# StageSeat — Local Theatre Booking

A full-stack React + Express + MongoDB theatre discovery and ticket booking app with a polished responsive UI.

## Features
- Browse and search theatre performances; filter by genre and date
- Event details, seat selection, quantity/price summary
- Register/login with JWT authentication
- Book tickets, view/cancel your bookings
- MongoDB models for users, shows and bookings
- Demo shows automatically seeded when the backend connects to MongoDB
- Responsive design, loading/error states, toast notifications

## Requirements
- Node.js 18+
- MongoDB Community running locally OR a MongoDB Atlas connection string

## Run it
1. Extract the ZIP and open the `StageSeat` folder in VS Code.
2. In a terminal:
   ```bash
   npm run install:all
   ```
3. Copy `server/.env.example` to `server/.env` and update `MONGO_URI` if needed.
4. Start MongoDB, then run from the project root:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173`.

Frontend runs on port 5173 and API on port 5000. The Vite dev server proxies `/api` to the backend.

## Demo flow
Register an account, open a show, select seats and book. Your bookings are stored in MongoDB. Shows are seeded on the first successful database connection. Prices and event details are sample data for a college project and are not live venue inventory.

## Project structure
```
StageSeat/
  client/                 React + Vite frontend
    src/App.jsx
    src/main.jsx
    src/styles.css
  server/
    models/                Mongoose schemas
    routes/                auth, shows, bookings APIs
    middleware/auth.js
    server.js
    .env.example
```

## API overview
- `GET /api/shows` — list/filter shows
- `GET /api/shows/:id` — show details
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in
- `GET /api/auth/me` — current user (JWT)
- `POST /api/bookings` — create booking (JWT)
- `GET /api/bookings/mine` — list own bookings (JWT)
- `DELETE /api/bookings/:id` — cancel own booking (JWT)

For a production deployment, add payment integration, email confirmations, rate limiting, admin management, and venue-specific seat inventory/locking.
