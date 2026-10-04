# Liquid Shelf

Sell Shopify sections for $2 each, with a private admin panel and customization requests.

- `/` storefront, `/sections/[slug]` section page with Buy + Customize form
- `/admin` upload sections, hide/publish/delete, see sales and customization requests
- Payments: Razorpay (cards, UPI, international cards once enabled)
- Database: Postgres (Neon), Files: Vercel Blob, Hosting: Vercel

## Deploy (about 20 minutes)

1. Push this folder to a new GitHub repo.
2. On Vercel: Add New Project, import the repo.
3. In the project: Storage, create a **Neon Postgres** database and a **Blob** store, and connect both. This fills `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
4. Settings, Environment Variables: add everything else from `.env.example`
   (`ADMIN_PASSWORD`, `ADMIN_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SITE_URL`, optional Resend keys).
   Generate `ADMIN_SECRET` with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. Create the tables once from your machine:
   `DATABASE_URL="<from Vercel>" npm run db:setup`
6. Redeploy, open `/admin`, sign in, upload your first section.

## Local development

```
cp .env.example .env.local   # fill in values
npm install
npm run db:setup
npm run dev
```

## Payments

- Start with Razorpay **test** keys (`rzp_test_...`) and test cards.
- To charge in USD, enable **International Payments** in the Razorpay dashboard (needs website + policy pages approved).
  Until then, set prices in INR (e.g. 169.00 INR) from the admin upload form.
- Razorpay requires Terms, Privacy, Refund and Contact pages on your site before going live.

## What to upload per section

A `.zip` with the `.liquid` file, any snippet/asset files, and a short `INSTALL.txt`. Keep it under 4 MB.

## Notes

- File URLs are random and only revealed after payment, but a buyer could share the direct file link. That's an acceptable trade-off at $2.
- With `RESEND_API_KEY` set, buyers get their download link by email and you get notified about sales and requests.
