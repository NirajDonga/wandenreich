# Wandenreich - Business Management System

A comprehensive business management system built with Next.js 15, featuring inventory, sales, purchases, and customer relationship management.

## ✨ Features

### Core Functionality
- ✅ **Authentication System**
  - Email/Password authentication
  - Google OAuth integration
  - Protected routes with middleware
  - Session management

- ✅ **Inventory Management**
  - Product CRUD operations
  - Stock level tracking
  - Low stock alerts
  - Stock transaction history

- ✅ **Customer & Supplier Management**
  - Customer database with contact info
  - Supplier database with GSTIN
  - Relationship tracking

- ✅ **Sales Management**
  - Create sales invoices
  - Multi-product line items
  - Automatic stock deduction
  - Payment tracking (cash, card, UPI, credit)
  - Balance due calculation

- ✅ **Purchase Management**
  - Create purchase orders
  - Multi-product line items
  - Automatic stock increment
  - Unit cost tracking
  - Payment tracking

- ✅ **Dashboard & Analytics**
  - Real-time business statistics
  - Revenue and cost tracking
  - Pending payment summaries
  - Quick action buttons

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Language**: TypeScript (100% typed)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
wandenreich/
├── app/
│   ├── (pages)/           # Protected pages
│   │   ├── dashboard/     # Business dashboard
│   │   ├── products/      # Product management
│   │   ├── customers/     # Customer management
│   │   ├── suppliers/     # Supplier management
│   │   ├── sales/         # Sales transactions
│   │   └── purchases/     # Purchase orders
│   ├── api/               # API routes
│   └── auth/              # Auth pages
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── mongodb.ts         # Database connection
│   └── models/            # Mongoose models
└── middleware.ts          # Route protection
```

## 🛠️ Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/wandenreich
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Start MongoDB (if local):
   ```bash
   mongod
   ```

4. Run dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Structure

```
app/
├── (pages)/dashboard/    # Protected dashboard
├── auth/                 # Auth pages
├── api/auth/            # Auth API routes
├── page.tsx             # Home
└── layout.tsx           # Root layout
```

## Routes

- `/` - Home
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/dashboard` - Protected dashboard
