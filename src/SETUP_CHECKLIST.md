# OnlyBuddy — Setup Checklist
## ⚠️ Do these BEFORE going live with real customers

### 1. LEGAL (Do this week)
- [ ] Register at Companies House → get company number
- [ ] Register with ICO at ico.org.uk/fee (£47/yr on Direct Debit)
- [ ] Add company number to: TermsPage.js + PrivacyPage.js + Footer.js
- [ ] Add ICO number to: PrivacyPage.js + Footer.js
- [ ] Add registered address to: TermsPage.js + PrivacyPage.js

### 2. CONTACT INFO (Replace fake placeholders)
- [ ] Footer.js line ~27 → replace 01482 000 000 with real phone
- [ ] Footer.js line ~70 → replace ZB000000 with real ICO number
- [ ] Footer.js line ~71 → replace 00000000 with real Companies House number

### 3. AD TRACKING PIXELS (Before spending on ads)
- [ ] JoinPage.js line 13 → META_PIXEL_ID from Facebook Ads Manager
- [ ] JoinPage.js line 14 → TIKTOK_PIXEL_ID from TikTok Ads Manager
- [ ] JoinPage.js line 15 → SNAPCHAT_PIXEL_ID from Snapchat Ads Manager

### 4. BUDDY APPLICATION NOTIFICATIONS
- [ ] BuddyApply.js line 10 → replace admin@onlybuddy.co.uk with your email
- [ ] BuddyApply.js line 11 → replace 447700000000 with your WhatsApp
- [ ] BuddyApply.js lines 12-14 → fill in EmailJS keys from emailjs.com

### 5. FIREBASE
- [ ] Enable Firebase Storage → europe-west2
- [ ] Set your Firestore user document role = "admin"

### 6. PAYMENTS (Before real orders)
- [ ] BookingPage.js → replace pk_test_placeholder with real Stripe key
- [ ] Build Stripe serverless function (not yet built — next session)

### 7. DOMAIN
- [ ] Buy onlybuddy.co.uk and connect in Vercel Settings → Domains

---
## Deploy command (Command Prompt only — NOT PowerShell)
cd C:\Projects\onlybuddy-CLEAN\onlybuddy-clean
git add .
git commit -m "master update"
git push
