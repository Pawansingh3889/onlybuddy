# OnlyBuddy — Hull's Errand & Grocery Sharing App

**Live:** [onlybuddy.vercel.app](https://onlybuddy.vercel.app)

A community-driven web app where neighbours in Hull can post errands, share grocery runs, and help each other out. Built as a real product — not a tutorial project.

---

## What It Does

- **Post errands** — request help with groceries, pickups, or deliveries
- **Browse & accept** — see nearby requests and offer to help
- **Real-time updates** — Firebase-powered live data sync
- **Stripe payments** — integrated payment flow for delivery fees
- **Maps integration** — location-based errand discovery
- **Push notifications** — stay updated on errand status
- **PWA support** — installable on mobile devices

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Backend | Firebase (Auth, Firestore, Cloud Functions) |
| Payments | Stripe |
| Maps | Google Maps API |
| Hosting | Vercel |
| Notifications | Firebase Cloud Messaging |

---

## Project Structure

```
onlybuddy/
├── api/              # Serverless API routes (Vercel)
├── components/       # Reusable React components
├── contexts/         # React context providers (auth, cart, etc.)
├── pages/            # Next.js page routes
├── public/           # Static assets & PWA manifest
├── src/              # Core application logic
├── .env.example      # Environment variable template
├── package.json      # Dependencies
└── vercel.json       # Deployment config
```

---

## Run Locally

```bash
git clone https://github.com/Pawansingh3889/onlybuddy.git
cd onlybuddy
npm install
cp .env.example .env.local   # add your Firebase + Stripe keys
npm run dev
```

---

## Why I Built This

I moved to Hull in 2024 and noticed there was no easy way for neighbours to help each other with quick errands. Instead of waiting for someone else to build it, I built it myself — from auth flows to payment integration to deployment.
