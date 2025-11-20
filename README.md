# Wandenreich - Business Management System

Run your business smarter with Wandenreich—a clean, modern system that handles inventory, sales, purchases, and customer relationships. Built for real businesses, not tech experts.

## ✨ What You Can Do

**Track Your Inventory**
- See what's in stock at a glance
- Get alerts when products run low
- View complete purchase history for every item
- Set minimum stock levels to avoid stockouts

**Manage Sales**
- Create professional invoices with automatic GST calculation
- Add multiple products to one bill
- Stock updates automatically when you sell
- Handle walk-in customers without creating accounts

**Handle Purchases**
- Record supplier orders easily
- Track payment status (Paid, Partial, Unpaid)
- Inventory updates automatically when stock arrives
- Keep supplier contact info organized

**Know Your Customers**
- Store customer details and contact information
- Track outstanding balances per customer
- View complete transaction history
- GSTIN validation for business customers

**Stay Informed**
- Dashboard shows your business at a glance
- See revenue, costs, and pending payments
- Get instant stock alerts
- Mobile-friendly so you can check from anywhere

**Secure & Professional**
- Sign in with email/password or Google account
- Your data is encrypted and protected
- Clean, modern interface that's easy to use
- Built-in safeguards prevent accidental deletions

## 🛠️ Built With

- **Next.js 15** - Fast, modern web framework
- **MongoDB** - Reliable cloud database
- **TypeScript** - Fewer bugs, better code
- **Tailwind CSS** - Beautiful, responsive design
- **NextAuth.js** - Secure authentication

## 🚀 Getting Started

### What You'll Need

- **Node.js** installed on your computer
- **MongoDB** (you can use the free cloud version at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google Account** (if you want Google sign-in)

### Quick Setup

**1. Download the code and install:**
```bash
npm install
```

**2. Set up your configuration:**

Copy the example file:
```bash
cp .env.example .env.local
```

Open `.env.local` in a text editor and fill in these values:

**MongoDB Connection:**
- Get this from MongoDB Atlas (it's free!)
- Looks like: `mongodb+srv://username:password@cluster.mongodb.net/wandenreich`

**Security Keys:**
Generate these by running:
```bash
# For NEXTAUTH_SECRET:
openssl rand -base64 32

# For ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Google Sign-In (Optional):**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth credentials
5. Add redirect URL: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Secret to your `.env.local`

**3. Start the app:**
```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) and you're ready to go!

## 🔒 Keeping Your Data Safe

**Important Security Tips:**

- ✅ **Never share your `.env.local` file** - It contains secret keys
- ✅ **Use a strong password** - At least 8 characters with letters and numbers
- ✅ **Turn on 2-factor authentication** for your MongoDB and Google accounts
- ✅ **Keep the software updated** - Run `npm audit` monthly to check for security issues
- ✅ **Use HTTPS in production** - Required for secure sign-ins
- ✅ **Back up your database** - Set up automatic backups in MongoDB Atlas

**Built-in Protection:**

This system already includes:
- Input validation to prevent bad data
- Rate limiting to stop abuse
- Encrypted storage for sensitive information
- Protection against common web attacks

## 💡 Need Help?

**Common Questions:**

**"Where do I get MongoDB?"**
Sign up for free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - takes 5 minutes!

**"I'm getting authentication errors"**
Check that your `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly in `.env.local`

**"Can I use this for my shop/warehouse?"**
Yes! It's designed for small to medium businesses managing inventory and sales.

**"Is my data secure?"**
Yes - your data is encrypted, passwords are hashed, and we follow security best practices.

## 📄 License

This project is private and proprietary.

---

**Made with ❤️ for small businesses**

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
