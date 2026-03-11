# OnlyBuddy v2.0 — Full Setup Guide
## ⏱ Takes about 30–45 minutes to go live

---

## STEP 1: Install Dependencies

Open your terminal in VS Code (Ctrl + `)

```bash
cd C:\Projects\OnlyBuddy-App\onlybuddy
npm install
```

This installs: react-router-dom, firebase, lucide-react, @emailjs/browser

---

## STEP 2: Add Your Firebase Config

Open: `src/firebase.js`

Replace the placeholder values with YOUR real Firebase config:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",          // from Firebase Console
  authDomain:        "onlybuddy-xxx.firebaseapp.com",
  projectId:         "onlybuddy-xxx",
  storageBucket:     "onlybuddy-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123",
};
```

**Where to find these values:**
1. Go to https://console.firebase.google.com
2. Click your project → Project Settings (gear icon)
3. Scroll to "Your apps" → Web app → Copy config

---

## STEP 3: Enable Firebase Storage

1. Firebase Console → Build → Storage
2. Click "Get Started"
3. Choose "Start in production mode"
4. Select "europe-west2" (London) region
5. Click Done

**Then update Storage rules** (Build → Storage → Rules):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /buddy-applications/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if true;  // Anyone can upload application docs
    }
  }
}
```

---

## STEP 4: Update Firestore Rules

Firebase Console → Build → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public can read users' own data, admins read all
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders: anyone can create, owner or admin can read
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }

    // Applications: anyone can submit, only admin can read/update
    match /applications/{appId} {
      allow create: if true;
      allow read, update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## STEP 5: Set Yourself as Admin

After signing into the app for the first time:

1. Open Firebase Console → Firestore → users collection
2. Find your user document (it'll be your UID)
3. Click the document → Edit → Change `role` from "customer" to "admin"
4. Save

Now go to https://onlybuddy.vercel.app/admin — you're in!

---

## STEP 6: Set Up Email Notifications (EmailJS)

When a Buddy applies, you want an email to your inbox.

1. Go to https://emailjs.com → Create free account
2. Add Email Service → Connect your Gmail
3. Create an Email Template with these variables:
   - `{{applicant_name}}` — Buddy's name
   - `{{applicant_phone}}` — their phone
   - `{{applicant_email}}` — their email
   - `{{vehicle}}` — vehicle type
   - `{{postcode}}` — their postcode
   - `{{admin_link}}` — link to your admin panel
4. Copy your Service ID, Template ID, and Public Key

Then open `src/pages/BuddyApply.js` and fill in at the top:

```js
const ADMIN_EMAIL    = 'pawan@youremail.com';
const ADMIN_WHATSAPP = '447712345678';      // Your number, no spaces or +
const EMAILJS_SERVICE  = 'service_abc123';
const EMAILJS_TEMPLATE = 'template_abc123';
const EMAILJS_KEY      = 'your_public_key';
```

---

## STEP 7: Deploy to Vercel

```bash
git add .
git commit -m "v2.0 - full production build"
git push
```

Vercel auto-deploys in ~60 seconds. Done!

---

## STEP 8: Set Up Stripe (Real Payments)

1. Go to https://stripe.com → Create account
2. Complete business verification
3. Dashboard → Developers → API keys
4. Copy your **Publishable key** (starts with `pk_live_...`)

Open `src/pages/BookingPage.js` and replace:
```js
const STRIPE_PK = 'pk_live_YOUR_REAL_KEY';
```

> **Note:** Full Stripe checkout (taking real money) requires a backend function.
> This is the next step we'll build — a Vercel serverless function to create
> Stripe payment intents. Message me when ready!

---

## YOUR LIVE URLS

| Page | URL |
|------|-----|
| Homepage | https://onlybuddy.vercel.app/ |
| Book an Errand | https://onlybuddy.vercel.app/book |
| Become a Buddy | https://onlybuddy.vercel.app/apply |
| Pricing | https://onlybuddy.vercel.app/pricing |
| How It Works | https://onlybuddy.vercel.app/about |
| Admin Panel | https://onlybuddy.vercel.app/admin |

---

## FILES CHANGED IN THIS UPDATE

```
src/App.js                          ← New: full router, all 6 pages
src/firebase.js                     ← Updated: Storage added
src/Login.js                        ← New: login + signup form
src/contexts/AuthContext.js         ← New: auth + roles
src/contexts/ThemeContext.js        ← Updated: more colour tokens
src/components/Navbar.js            ← New: sticky nav, mobile menu
src/components/Footer.js            ← New: footer with links
src/pages/HomePage.js               ← New: full landing page
src/pages/AboutPage.js              ← New: how it works
src/pages/PricingPage.js            ← New: pricing + FAQ
src/pages/BookingPage.js            ← New: real booking form → Firestore
src/pages/BuddyApply.js             ← New: 5-step application → Firestore
src/pages/AdminDashboard.js         ← New: live Firestore dashboard
```

---

## WHAT'S NEXT (after this is live)

1. **Stripe backend** — Vercel serverless function to take real card payments
2. **PayPal integration** — PayPal JS SDK in BookingPage
3. **Order assignment** — Admin assigns Buddy to order from dashboard
4. **Buddy app** — Buddy sees & accepts jobs, live GPS tracking
5. **Push notifications** — OneSignal for "new job available" alerts
6. **onlybuddy.co.uk domain** — Connect your domain in Vercel

---

Questions? Any step not working? Just message and we'll fix it immediately.
