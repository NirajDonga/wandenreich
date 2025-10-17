# ✅ Next.js App Router Structure - CORRECTED

## Overview

The project has been reorganized to follow **Next.js App Router conventions**. The `src/` folder has been removed and all code is now properly organized in the `app/` directory structure.

---

## 📁 Current Structure

```
wandenreich/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # Route groups
│   │   ├── purchases/
│   │   │   └── create/
│   │   │       └── page.tsx      # Purchase creation page
│   │   └── customers/
│   │       └── create/
│   │           └── page.tsx      # Customer creation page
│   ├── auth/                     # Auth pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── purchases/                # Purchase-related components
│   │   ├── AddItemForm.tsx
│   │   ├── PaymentDetailsForm.tsx
│   │   ├── ProductSelector.tsx
│   │   ├── PurchaseItemsTable.tsx
│   │   └── SupplierSelector.tsx
│   ├── shared/                   # Shared/reusable components
│   │   └── forms/
│   │       └── SearchSelect.tsx  # Generic search select component
│   └── providers/
│       └── Providers.tsx         # Auth providers
│
├── hooks/                        # Custom React Hooks
│   └── purchases/
│       └── usePurchaseItems.ts   # Purchase items state management
│
├── lib/                          # Library code (utilities, services, types)
│   ├── services/                 # Business logic services
│   │   └── pdf.service.ts        # PDF generation service
│   ├── types/                    # TypeScript type definitions
│   │   └── purchases.ts          # Purchase-related types
│   ├── utils/                    # Utility functions
│   │   └── purchases.ts          # Purchase calculations
│   ├── auth.ts                   # NextAuth configuration
│   ├── mongodb.ts                # MongoDB connection
│   └── models/                   # Mongoose models
│
├── public/                       # Static assets
├── docs/                         # Documentation
└── config files                  # next.config.ts, tsconfig.json, etc.
```

---

## 🎯 Why This Structure?

### ✅ Follows Next.js Conventions
- **`app/`** - Pages and routing (App Router)
- **`components/`** - React components (organized by feature)
- **`lib/`** - Utilities, services, types (business logic)
- **`hooks/`** - Custom React hooks
- **`public/`** - Static files

### ❌ What We Removed
- **`src/`** folder - Not needed for App Router
- Removed feature-based `src/features/` structure
- Removed barrel exports (`index.ts` files)
- Removed custom path aliases (`@features/*`, `@shared/*`)

---

## 📦 Import Patterns

### Components
```typescript
// Import from components folder
import AddItemForm from '@/components/purchases/AddItemForm';
import SearchSelect from '@/components/shared/forms/SearchSelect';
```

### Types
```typescript
// Import from lib/types
import type { Product, Supplier } from '@/lib/types/purchases';
```

### Hooks
```typescript
// Import from hooks folder
import { usePurchaseItems } from '@/hooks/purchases/usePurchaseItems';
```

### Services & Utils
```typescript
// Import from lib
import { generatePurchasePDF } from '@/lib/services/pdf.service';
import { calculateTotal } from '@/lib/utils/purchases';
```

---

## 🗂️ Organization Rules

### 1. Components (`components/`)
- Organized by feature: `purchases/`, `customers/`, `sales/`
- Shared components go in: `shared/`
- Each component is a single `.tsx` file

### 2. Hooks (`hooks/`)
- Organized by feature: `purchases/`, `customers/`
- Named with `use` prefix: `usePurchaseItems.ts`

### 3. Library Code (`lib/`)
- **`types/`** - TypeScript types and interfaces
- **`utils/`** - Pure utility functions
- **`services/`** - Business logic and API calls
- **`models/`** - Database models

### 4. Pages (`app/`)
- Use App Router structure
- Route groups: `(pages)/`
- Page files: `page.tsx`
- Layouts: `layout.tsx`

---

## 📋 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `AddItemForm.tsx` |
| **Hooks** | camelCase with `use` | `usePurchaseItems.ts` |
| **Utils** | camelCase | `purchases.ts` |
| **Types** | camelCase | `purchases.ts` |
| **Services** | camelCase with `.service` | `pdf.service.ts` |
| **Pages** | lowercase | `page.tsx` |

---

## 🚀 Adding New Features

### Example: Adding a Sales Feature

1. **Create Components**
   ```
   components/sales/
   ├── SaleForm.tsx
   ├── SalesList.tsx
   └── SaleDetails.tsx
   ```

2. **Create Types**
   ```
   lib/types/sales.ts
   ```

3. **Create Utils**
   ```
   lib/utils/sales.ts
   ```

4. **Create Hooks (if needed)**
   ```
   hooks/sales/useSales.ts
   ```

5. **Create Page**
   ```
   app/(pages)/sales/create/page.tsx
   ```

---

## ✅ Benefits of This Structure

1. **✅ Standard Next.js** - Follows official conventions
2. **✅ Simple Imports** - Clear `@/` prefix for all imports
3. **✅ Easy Navigation** - Files are where you expect them
4. **✅ Scalable** - Easy to add new features
5. **✅ Clean** - No complex barrel exports or aliases
6. **✅ Familiar** - Standard for Next.js developers

---

## 📚 Quick Reference

### Where to Put New Files?

| File Type | Location | Example |
|-----------|----------|---------|
| Page | `app/(pages)/feature/page.tsx` | `app/(pages)/sales/page.tsx` |
| Component | `components/feature/` | `components/sales/SaleForm.tsx` |
| Shared Component | `components/shared/` | `components/shared/Modal.tsx` |
| Hook | `hooks/feature/` | `hooks/sales/useSales.ts` |
| Type | `lib/types/` | `lib/types/sales.ts` |
| Utility | `lib/utils/` | `lib/utils/sales.ts` |
| Service | `lib/services/` | `lib/services/api.service.ts` |
| Model | `lib/models/` | `lib/models/Sale.ts` |

---

## 🎯 Summary

**Before** (WRONG):
```
src/
├── features/purchases/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts (barrel export)
└── shared/
```

**After** (CORRECT):
```
app/          # Pages
components/   # UI Components
hooks/        # React Hooks
lib/          # Business Logic
```

---

**Date**: October 15, 2025  
**Status**: ✅ App Router Structure Implemented  
**Structure**: Next.js Standard Conventions
