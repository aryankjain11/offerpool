# OfferPool

**Live site: https://offerpool.vercel.app**

**Bank offers, unlocked.** You find an online deal that needs a specific bank card you don't have. OfferPool finds a verified *helper* who has that card. They buy the item on their card and ship it to you, and you keep most of the discount.

The app also lets people sell coupon codes they won't use (CRED, GPay and PhonePe rewards) to someone who will.

> This is a working demo built for a product case study. Banks, offers, prices and people are sample data. Payments, helpers (other than the one you play) and screenshot reading are simulated.

## What you can do in the app

| Tab | What it shows |
|---|---|
| **Shop** (you're Riya, a shopper) | Pick a product, see your best price with every bank offer, pay in a short checkout, and watch a helper place the order live. |
| **Earn** (you're Kabir, a helper) | Get an order request, see your reward and when you're paid back (always before your card bill is due), place the order, and pass the order check. |
| **Coupon codes** | Buy a code (shown only after paying, refunded if it doesn't work), sell one, or add several from a rewards screenshot. |
| **Behind the scenes** | How a helper is chosen: who qualifies, the ranking, the activity log, and switches to try other situations (helpers saying no, the price going up, nobody available). |
| **Tests** | The 28 evals, run live against the app's real rules. |

## How the money works

For a ₹69,900 phone with a flat ₹5,000 HDFC card discount:

- The helper pays Flipkart **₹64,900** on their HDFC card.
- The ₹5,000 discount is shared: **you keep ₹3,500 (70%)**, the helper gets ₹750 (15%), and OfferPool keeps ₹750 (15%).
- **You pay ₹66,400.** OfferPool holds that until the item arrives and the 7-day return period ends. Then it pays the helper back ₹64,900 + ₹750. If anything goes wrong, you get a full refund.

## Run it locally

Needs Node 18 or newer.

```bash
npm install
npm run dev       # local dev server
npm test          # runs the 28 evals with Vitest
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Project layout

```
index.html          page shell
src/main.js         UI, simulated marketplace, event handling
src/logic.js        pricing, helper matching, order checks, payouts, coupon rules (pure functions)
src/evals.js        the 28 evals, shared by the Tests tab and `npm test`
src/data.js         sample banks, offers, products, helpers and coupon codes
src/utils.js        shared helpers and constants
src/styles.css      design system (OKLCH palette, dark "kintsugi" theme)
tests/              Vitest entry for the evals
docs/               research notes, prompts used, and eval write-up
```

## Deploying

The site is static. On Vercel it's detected as a Vite project: build command `npm run build`, output folder `dist`. Every push to `main` deploys again.

## Docs

- [Research notes](docs/research.md): competitors (PiePay, Yaper), risks, regulation and features
- [Prompts used to build it](docs/prompts.md)
- [Evals and test scenarios](docs/evals.md)
