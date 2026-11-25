# Evals for OfferPool

**App:** https://claude.ai/artifact/GgeULbqvWKGdbFdxAuP8wK (open the **Evals** tab to run them live)

I tested OfferPool in two ways:

1. **Automated checks (28):** fixed inputs with expected outputs, run against the same functions the app uses. They run every time the Evals tab opens. **Result: 28 of 28 pass.**
2. **End-to-end scenarios (12):** I clicked through the real flows as the buyer (Riya) and the cardholder (Kabir), and checked what each screen showed and how the money moved.

Each eval maps to a risk from the research. A marketplace like this fails on five things:
- the wrong price,
- a bad match,
- a fake or wrong order,
- paying the cardholder late,
- voucher fraud.

---

## 1. Automated checks

| ID | Area | What it checks | Expected | Why it matters |
|---|---|---|---|---|
| E01 | Pricing | % offer under its cap | 10% of ₹15,000 = ₹1,500, not capped | Basic maths |
| E02 | Pricing | % offer hits its cap | 10% of ₹69,900 = ₹6,990 → **₹4,000** | Caps are where PiePay users saw "amount didn't match" |
| E03 | Pricing | Order below the minimum | Rejected, with "needs ₹25,000+" | Don't show savings the buyer can't get |
| E04 | Pricing | Expired offer | Rejected: "Offer ended 20 Nov" | Stale offers are a top trust-breaker |
| E05 | Pricing | Product-specific offer | Shows on iPhone only, not on MacBook | Offers are often tied to one product |
| E06 | Pricing | Own card vs. via a cardholder | HDFC flat ₹5,000 via a cardholder (keep ₹3,500) beats own ICICI card (₹1,500) | The app must find the cheapest path |
| E07 | Pricing | Own card wins when better | Own HDFC card, save ₹5,000, no fee | Don't charge a fee when the buyer doesn't need us |
| E08 | Money | Split sums to the discount | ₹4,000 → 2,800 / 600 / 600; odd amounts also sum | No rupee created or lost by rounding |
| E09 | Money | Money is conserved | Buyer pays = cardholder reimbursement + commission + fee | Escrow must balance |
| E10 | Matching | Tiny savings aren't matched | ₹125 saving shown, not sent for matching | Below ₹400 the split isn't worth anyone's time |
| E11 | Matching | Eligibility filter | Only Ananya and Kabir qualify. Farhan is out of offer quota, Sneha is offline, Rohan is over his order limit | Core matching correctness |
| E12 | Matching | No self-matching | The buyer is never offered her own order | Fraud and collusion guard |
| E13 | Matching | Ranking | A 95% acceptance rate ranks above 60% | Reliability first |
| E14 | Matching | No supply | No option offered; the buyer is told "nobody online" before paying | Fixes PiePay's "couldn't find a cardholder" complaint |
| E15 | Verification | Order ID format per site | `OD` + 18 digits passes; `12345` fails | Catches fake order IDs |
| E16 | Verification | Price went up at checkout | The buyer is asked to approve the extra ₹1,200 | Price lock |
| E17 | Verification | Wrong bank card used | Rejected | The offer wouldn't actually apply |
| E18 | Payouts | Paid before the card bill is due | For due days 1, 5, 15 and 28, payout is after delivery and before the due date | The main promise to cardholders |
| E19 | Refunds | Cancellation | Instant full refund, ₹0 commission; settled orders can't be cancelled | Fixes slow refunds |
| E20 | Scope | Debit offers not matched | Shown, but "needs your own card" | v1 scope decision |
| E21 | Stacking | Voucher + bank offer | The bank offer drops out when the voucher takes the order below its ₹10,000 minimum | Subtle pricing bug |
| E22 | Vouchers | Voucher fits the cart | ₹500 off ₹30k+ is rejected on ₹25k and fits ₹69,900 | Don't sell a code that won't apply |
| E23 | Vouchers | Expired listings | Taken off the market automatically | — |
| E24 | Vouchers | Duplicate code | The same code can't be listed twice (case-insensitive) | Stops one code being sold twice |
| E25 | Vouchers | Price decay | Suggested price: far expiry > this week > tomorrow | Supply clears before it expires |
| E26 | Vouchers | Rejected code | Buyer refunded ₹50, seller gets ₹0 and a strike; if it works, seller gets ₹42 | Buyer protection |
| E27 | Vouchers | Fees | 15% on promo codes (₹8 on ₹50), 3% on gift cards (₹28 on ₹920) | Pricing model |
| E28 | Input | Bad links | Myntra and unknown products get a clear message | Graceful errors |

---

## 2. End-to-end scenarios (run by hand in the browser)

| # | Scenario | Steps | What happened | Result |
|---|---|---|---|---|
| S1 | Happy path, I'm the cardholder | iPhone 16 → pay ₹66,400 → Earn → accept → fill order → submit → ship → deliver → close the return window | Six offers listed with cap maths. Job reached Kabir with a 60 s timer. 4/4 checks passed. Buyer saved ₹3,500. Kabir's commission went from ₹3,150 to ₹3,900. Payout 6 Dec, before the 15 Dec due date. | Pass |
| S2 | Cardholder declines and there's no backup | Galaxy S25 (only Farhan holds Axis) → he declined | "A cardholder passed", then a full ₹77,499 refund | Pass |
| S3 | Timeout cascade | Order offered to Kabir, no response | After 60 s it moved to the next cardholder | Pass |
| S4 | Price goes up at checkout | Engine → "next cardholder sees ₹1,200 more" → Sony XM5 | Buyer saw "Needs your OK". After approving: buyer pays ₹26,790 = cardholder ₹26,190 + ₹300 + ₹300 | Pass |
| S5 | Buyer cancels after the order is placed | LG AC → placed → cancel | ₹39,690 refunded at once; cardholder refunded by Flipkart; commission ₹0 | Pass |
| S6 | No bank offer applies | boAt earbuds ₹1,299 | "No bank offer works for this order." Suggested a ₹100-off voucher for ₹30, so the buyer pays ₹1,229 | Pass |
| S7 | Voucher + bank offer together | iPhone + Flipkart ₹500 voucher | Bank offer recalculated on ₹69,400. Buyer pays ₹66,080 and saves ₹3,820 | Pass |
| S8 | Voucher rejected, no proof | Buy Swiggy code → "It was rejected" with no screenshot | Asked for a screenshot; no refund yet | Pass |
| S9 | Voucher rejected, with proof | Attach screenshot → rejected | ₹50 refunded; seller strike shown on their listings | Pass |
| S10 | Bad listings | Expired date + an already-listed code | Both errors shown; not listed | Pass |
| S11 | Import from rewards screenshot | Scan sample → list all 3 | 3 vouchers listed with suggested prices | Pass |
| S12 | Phone width and dark mode | All 5 tabs at 375 px; dark theme | No sideways scrolling; readable in both themes | Pass |

### Round 3: plain language and a smoother checkout (re-run after the redesign)

| # | Scenario | What happened | Result |
|---|---|---|---|
| S13 | A first-time shopper buys the iPhone, start to finish | Pick product → "Your best price ₹66,400 (you save ₹3,500)" → Continue → checkout sheet → Pay → live "Placing your order" (payment received ✓, helper said yes ✓, ordering ✓) → "Your order is placed". About 5 seconds, no tab switching. | Pass |
| S14 | Price goes up while the helper is ordering | The live screen asks "Amazon's price went up by ₹1,200": pay more or cancel. Paying more leads to the success screen. | Pass |
| S15 | Your own card is the best deal | Shows "Your own ICICI credit card gets this offer… nothing to pay us" with a link to the store. No checkout. | Pass |
| S16 | Trying the helper side | Earn → "Get a sample request" → accept → fill in sample details → "All checks passed" | Pass |
| S17 | Jargon check | No "escrow", "job", "match", "commission", "quota" or "settle" left in what shoppers see. They now read "we hold your money safely", "order request", "helper", "reward", "offer uses left this month" and "done". | Pass |

## Bugs the evals caught and I fixed
- **Wrong article before bank names:** the app said "a HDFC card". It now says "an HDFC", "an SBI" and "a Kotak" card.
- **The buyer flow was interrupted:** by default, orders went to Kabir (the helper you play), which forced first-time shoppers to switch tabs. Orders now go to the other helpers by default; the helper side is opt-in.
- **Fairness:** a cardholder's "time since last job" didn't reset after taking a job, so the same person kept ranking first. It now resets on accept.
- **Unusable options showed a price:** offers that couldn't be matched still showed a "you save" price. They now show n/a.
- **Text overflow on phones:** long status labels ran off the side of the screen at phone width. They now wrap.

## What these evals don't cover (honest gaps)
- **Prices and offers are sample data.** Nothing is pulled from Flipkart, Amazon or the banks yet.
- **Cardholders other than Kabir are simulated.** They accept at random based on their acceptance rate.
- **Payments and screenshot reading are mocked.** No real UPI, escrow, KYC or text recognition.
- **Untested with real people:** whether buyers will prepay a stranger and whether cardholders accept ₹300–₹750 per job. Those are the next things to check in conversations.
