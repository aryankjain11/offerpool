# Research: A platform that matches shoppers with cardholders to unlock bank-card offers

*Research notes to support the case study. These are working notes, not the one-pager: the one-pager has to be in your own words.*

---

## 1. Summary

- **The idea is validated: two Indian apps already do it.** [PiePay](https://www.piepay.in/) (Gurugram, founded 2023, part of the Razorpay Rize community, live on Flipkart, Amazon and Shopsy) and [Yaper](https://yaper.co/about-us) (founded 2019) both match shoppers with cardholders, who place the order on their own card in return for a commission. People are paying for this today.
- **That shifts the case study from "is this a need?" to "why do the current solutions still fail people?"** Public reviews of PiePay point to four gaps:
  1. **No cardholder available:** the buyer can't find a match.
  2. **Price mismatch:** the final amount doesn't match the offer the buyer was shown.
  3. **Slow refunds:** after a cancellation, the buyer waits until the merchant's refund reaches the cardholder's card, which can take up to 45 days.
  4. **App glitches and lag.**
- **The "inventory" isn't money. It's unused offer quota.** Every bank offer has caps (per card, per month, per offer period). Cardholders also have unused reward potential and spend milestones they're trying to hit. Your platform turns that idle, expiring capacity into something that can be sold.
- **The one step you can't automate is the cardholder placing the order.** Card details can't be shared (RBI card-on-file tokenisation, PCI rules, 3-D Secure OTP). So "seamless" really means getting the cardholder's part down to about 60 seconds, a bit like a ride-hailing driver accepting a trip.
- **The biggest risks are policy risks, not technical ones:** merchant terms that limit buying to personal use, banks clawing back points for "commercial" spend, and RBI payment-aggregator rules on holding money. Each has a mitigation, and naming them in your case study shows maturity.

---

## 2. Reframing the problem

**Surface problem:** "I want this offer but don't have the HDFC/ICICI/Axis card."

**Underlying problem:** Bank offers are a discount that only cardholders can claim. Across ~15–20 issuing banks, no single person holds more than a few of the cards. Meanwhile, cardholders leave most of their offer capacity unused every month, and it expires.

| | Buyer (demand) | Cardholder (supply) |
|---|---|---|
| Who | Someone making a one-off, often big purchase (phone, laptop, TV, appliance), especially during sale events | People with several cards, reward and milestone chasers (e.g. the TechnoFino community), students with a parent's card, people with idle debit-card offers |
| Pain | Gives up a discount of ₹1,000–₹5,000 or more, or opens a card they don't need | Offer caps and reward potential expire unused; annual-fee-waiver spend targets are hard to reach |
| What they want | The lowest net price, now, without risk | Easy money and points with no risk to their card or their account |
| Main fear | "I pay a stranger and get nothing" | "I pay ₹60k on my card and never get reimbursed" / "my Flipkart account gets banned" |

**A detail worth putting in your write-up:** bank offers are almost always **capped**. For example, "10% up to ₹1,500" on a ₹60,000 phone is really 2.5%. A deal-site listing found during research described a "10% bank offer" that was actually a flat ₹2,000. So the product's first job is honest net-price maths, and that is exactly where PiePay users complain.

---

## 3. Competitive landscape

| Player | Model | Notes |
|---|---|---|
| **PiePay** (2023, India) | Real-time match between buyer and cardholder. Buyer pays PiePay upfront by UPI or card. Cardholder places the order. Cardholder is reimbursed plus commission after delivery and the return window. | Buyers keep **50–80%** of the discount. Cardholders get "up to 5%" commission plus points. If the buyer returns or cancels, the cardholder's commission is cancelled. Buyer refunds happen only after the merchant refunds the cardholder (up to 45 days). PiePay's liability is capped at the platform fee. App Store rating about 4.0 from 27 ratings. |
| **Yaper** (2019, India) | Same model, framed as "earn a second income from your credit card." Buyer's prepayment is held in escrow; cardholder is reimbursed within 3–4 days of completion. | Visible reviews are mostly from 2021. Unclear how active it still is (couldn't verify). |
| Informal Telegram/WhatsApp groups and friends | "Order on your card, I'll UPI you" | No escrow, so scams happen. This is the behaviour you're formalising. |
| **Grabr** (global analogue) | Matches shoppers with travellers who bring items across borders. Funds held in escrow until delivery. About 7% commission plus affiliate revenue. | Proves the structure works: escrow, an untrusted stranger fulfils the order, commission on top. Its payout delays were also its main complaint. |
| CRED and NoBroker rent payments | Users pay roughly 1–2% fees to put rent on a credit card | Shows that cardholders pay to generate card spend for points and milestones. That is your supply-side motivation. |

**How to position yourself:** don't claim the idea is new. Say: *"PiePay and Yaper show the demand is real. Their reviews show where they fail: matching reliability, price accuracy and refund speed. My design attacks those three."*

---

## 4. How the transaction works

```
BUYER                         PLATFORM                          CARDHOLDER
 │ paste product link ───────► parse merchant, price, offers
 │ ◄──────── net price per option ("you pay ₹56,800, save ₹2,800")
 │ pay ₹56,800 + fee via UPI ─► escrow (licensed payment aggregator)
 │                             match engine: eligible + online + quota left
 │                             ─────────────── offer job (3-min timer) ──────► accept
 │                             (no accept → next cardholder; none → instant refund)
 │                             ◄─────── order ID + invoice screenshot ────── places order on own card,
 │                             verify: price, address, merchant, card BIN    buyer's address
 │ ◄──── tracking + delivery OTP goes to the buyer's phone
 │ confirm delivery ─────────► hold until the return window closes
 │                             release reimbursement + commission ─────────► paid before the card's due date
```

### Design choices that address the known gaps

1. **Match guarantee:** if nobody accepts within N minutes, the buyer gets an automatic full refund, or a choice of "retry / wait for pre-booking". This fixes "couldn't find a cardholder".
2. **Price lock with tolerance:** the quote is valid for about 10 minutes. If the merchant's price or offer changes by more than ₹X when the cardholder checks out, the buyer gets a one-tap re-confirm. This fixes "the amount didn't match".
3. **Hold, then release:** the cardholder's reimbursement stays in escrow until the return window closes, so **a cancellation can refund the buyer immediately**. The cardholder was never paid and gets their own money back from the merchant. This fixes slow buyer refunds.
4. **Pay the cardholder before their statement is due:** a credit card's interest-free period is about 20–50 days. If you pay out before the cardholder's due date, they never actually use their own money. This is a strong supply-side promise. Debit-card holders need much faster payouts, or should be excluded from the MVP.

---

## 5. Unit economics (illustrative)

Example: a ₹60,000 phone with the offer "10% instant discount, up to ₹4,000", so the discount is ₹4,000.

| Who | Share | Amount |
|---|---|---|
| Buyer saves | 70% | ₹2,800 |
| Cardholder commission | 15% | ₹600 (plus about ₹600–₹3,000 of reward points, and progress towards spend milestones) |
| Platform fee | 15% | ₹600 (≈1% of order value; GST at 18% applies to the fee) |

Your original framing ("a 10% discount effectively becomes 7–8%") matches the market: PiePay buyers keep 50–80%. Because of caps, a more honest way to put it is **"you keep 70% of the offer value."** A **dynamic split** is worth a feature: during sale peaks, when cardholders are scarce, their share goes up (like surge pricing). When supply is plentiful, buyers keep more.

---

## 6. Feature list (prioritised)

### MVP: must-haves
1. **Deal checker:** paste any Flipkart or Amazon link. See every applicable bank offer, with **cap maths** and the net price. If you already own an eligible card, the app tells you to use it. That honesty builds trust and is useful even with no matching.
2. **Card wallet with no card numbers:** cardholders register bank, network and variant only, plus the last 4 digits / BIN for verification later.
3. **Offer quota tracker:** the platform keeps track of how much of each offer's cap each card has left. The quota is the inventory.
4. **"Go online" toggle and auto-accept rules:** for example, "Flipkart, HDFC offers, up to ₹70k, 9am–11pm, minimum commission ₹300". This is how supply gets stored in advance.
5. **Matching engine:**
   - Filter by eligibility, then rank by reliability, speed, fairness rotation and soon-to-expire quota.
   - Cascade the job down the list with timers.
   - During sale peaks, broadcast to the top 3; first to accept wins.
6. **Escrow payments:** UPI in and bank payouts out, through a licensed payment aggregator's marketplace or split product.
7. **Guided fulfilment:** a deep link to the product, a one-tap copy of the buyer's address, then upload of the order ID and invoice. Automatic checks confirm the price, address and card BIN.
8. **Order state machine:**
   - Placed → shipped → delivered → return window → settled.
   - Separate branches for cancellation and return.
9. **Trust and safety:**
   - KYC: PAN and bank account for cardholders; phone number and UPI for buyers.
   - Reliability scores.
   - Per-user monthly caps on orders and order value, which keep usage at "helping a friend" levels.

### V2: differentiators
10. **Sale-day pre-booking:** buyers reserve a deal before Big Billion Days or the Great Indian Festival, and cardholders commit quota ahead of time. This is the purest form of "pool demand, match it with stored supply", and it smooths out the peak.
11. **Cardholder earnings dashboard:** commission plus the value of points earned, and **milestone progress** ("₹18k more spend gets your annual fee waived"). This is the main hook for supply.
12. **Price and offer alerts:** "Tell me when this product plus some bank offer drops below ₹55k."
13. **Templated status messages instead of free chat:** for example "order placed", "address issue" or "item delayed". Free chat leads people to swap numbers and go around the platform. You were right to avoid becoming a messaging app.
14. **Dispute centre** with evidence attached: invoice, tracking, photos of the delivered item.
15. **Cart pooling:** combine several buyers into one order to clear a minimum-order threshold (e.g. "₹500 off above ₹5,000").

---

## 7. Expanding beyond bank cards, and where to draw the line

| Category | Verdict | Why |
|---|---|---|
| Membership-only deals (Flipkart VIP/Plus, Prime-only deals) | ✅ Natural extension | Same mechanics; the "resource" is a membership instead of a card |
| Cart-threshold and group-buy offers (quick commerce, "buy 2 get 1") | ✅ Good, and the most legitimate | Real demand pooling, with no identity or card involved |
| Gift-card / voucher resale (buying vouchers with accelerated points) | ⚠️ High risk | Real stored inventory, but many voucher terms ban resale, and prepaid-instrument rules apply |
| No-cost EMI on someone else's card | ❌ Out | Moves the buyer's credit risk onto the cardholder for months |
| Employee pricing, student discounts, defence canteen (CSD) | ❌ Out | Eligibility is tied to identity, so proxy buying is misrepresentation (and CSD misuse is an offence) |
| International cards / forex offers | ❌ Out | Cross-border and FEMA complexity |

Including this table, especially the ❌ rows, in your scope section shows judgment.

---

## 8. Risks and mitigations

| Risk | What the research shows | Mitigation |
|---|---|---|
| **Merchant terms** | Amazon.in's Conditions of Use limit buying to personal, non-business use, and Flipkart/Shopsy terms forbid buying for resale. Accounts can be terminated. | Per-cardholder caps that keep volume at friend-level. No resellers on the buyer side (cap quantity per product). Long term, partner with banks: the spend still lands on their card, so they benefit too. |
| **Bank clawback** | In 2020 HDFC sent letters to cardholders flagged for "business spend" on personal cards and debited their points. HSBC India has cracked down on reward abuse. | Monthly caps. Tell cardholders about the risk upfront. Stay away from patterns banks treat as abuse. |
| **Holding money (RBI)** | RBI's Payment Aggregator Master Direction (Sept 2025) needs ₹15–25 crore net worth for a licence. Split settlement is allowed only to entities that deal directly with the customer. | Never hold funds yourself. Use a licensed payment aggregator's marketplace/escrow product. **Get a legal opinion on whether cardholders count as "service providers" who can receive split settlements.** |
| **Tax** | Cardholder commission is taxable income. An e-commerce operator may have TDS (194-O) and GST TCS duties. | Collect PAN, issue annual earnings statements, and check with a CA. |
| **Fraud** | Fake order IDs, buyers who are really resellers, colluding pairs, abuse of cancellations | Automatic invoice checks, BIN match, delivery OTP sent to the buyer's phone, holding funds until the return window closes, risk scores |
| **Privacy** | The cardholder sees the buyer's name, address and phone number, which they need for shipping | Show them only after the cardholder accepts and hide them once the order is done. No free chat. |
| **Going around the platform** | Once matched, the pair could deal directly next time | The escrow guarantee is the value. Rotate matches; don't encourage repeat pairing. |
| **Cold start** | PiePay's complaint: "couldn't find a cardholder" | Recruit cardholders first from card-enthusiast communities. Launch around sale events. Narrow to one merchant and the top 5 bank offers. |

---

## 9. Suggested scope for the case study

**In scope:**
- One or two merchants (Flipkart first)
- Instant-discount offers on credit cards only
- India, prepaid buyers
- Deal checker, matching, escrow, guided fulfilment, tracking, settlement, and returns/cancellations

**Out of scope:**
- EMI offers and cashback offers (the cashback reaches the cardholder months later)
- Debit cards in v1 (the cardholder's float hurts more)
- Gift cards and vouchers
- Identity-gated discounts (employee, student, defence)
- Cross-border purchases
- Free-form chat
- Automating the merchant checkout

---

## 10. What to verify vs. what you're guessing (the brief asks for this)

**Assumptions to test with 10-minute conversations:**
1. Buyers will pay the full amount upfront to a third-party app. (Ask 3–5 people who gave up an offer: "Would you prepay ₹56k to an app?")
2. Cardholders will place an order for a stranger for about ₹300–₹600 plus points. (Ask 3–5 friends who hold several cards.)
3. Cardholders accept waiting about 2–3 weeks to be reimbursed, as long as it comes before their due date.
4. Merchants don't cancel such orders at low volume.
5. There are enough offers outside sale events to sustain the business, or is it purely seasonal?

**Interview prompts:**
- "Tell me about the last time you gave up a bank offer. What did you do instead?"
- "What would make you trust an app to hold your money until delivery?"
- (Cardholder) "What's the smallest amount you'd accept for placing an order for a stranger? What would worry you most?"

**Already verified by this research:** competitors exist and have paying users; the size of the buyer's share (50–80%); the main failure modes (from reviews); the regulatory constraints.

---

## 11. How to build the prototype (deliverable #4)

**A demo-grade prototype on Claude, Lovable or Bolt:**
- **Buyer flow:**
  - Paste a link, which loads mock product and offer data.
  - Show offer comparison with cap maths and net price.
  - Mock UPI payment, a matching animation, then order tracking.
- **Cardholder flow:**
  - Add cards (no numbers), set auto-accept rules, go online.
  - Receive a job, place the order, upload the order ID.
  - Earnings and milestone dashboard.
- **Ops/admin view:** a live board of open demand vs. available supply, showing how matching decides.
- **Data:** a mocked offer catalogue for a handful of real-looking products. Matching logic runs in the app. A Supabase back end is enough if you want shared state across both flows.

**Production stack (for the "how would you build it" section):**
- Mobile app (React Native or Flutter)
- Postgres
- A job queue for matching timers
- A licensed payment aggregator's marketplace/split product
- A KYC vendor for PAN and bank checks
- OCR for invoices
- Push notifications (FCM)
- An offer-ingestion service (merchant offer pages and bank T&Cs, curated by hand at first)

**Evals (deliverable #3), sketch:**
- **Net-price correctness:**
  - Offer caps and minimum order values
  - Debit vs. credit cards
  - Expired offers
- **Matching:**
  - Correct eligibility
  - Fallback when nobody accepts
  - No self-matching
  - Fairness rotation
  - Quota decreases after each order
- **Money flows:**
  - Refund on cancellation
  - Clawback on a return
  - Payout timing vs. the cardholder's due date
- **Abuse:**
  - Fake order ID
  - Price-mismatch invoice
  - Over-cap user

---

## 12. Ideation: what else could be exchanged?

### 12.1 A test for "can this offer be exchanged?"

Run every candidate through five questions:

1. **Transferable?** Is the benefit tied to a card, account or person (needs a fulfiller), or is it a bearer code (anyone can use it)? If it's tied to an identity (student, employee, PAN), stop: proxy use is misrepresentation.
2. **Verifiable before money moves?** Can the platform confirm the offer is real and unused without using it up?
3. **Double-spend risk?** Could the seller use it, or sell it twice, after selling it once?
4. **Regulated?** SEBI, RBI prepaid-instrument rules, the Railways Act, brand terms.
5. **Value per transaction vs. commission:** is there enough margin to pay for trust and safety?

### 12.2 The stock-market idea: not feasible, and it's illegal

The idea: match people who can't access the market with people who can, and have the second group take positions for the first.

**Why it fails:**
- **Only SEBI-registered stockbrokers (and their authorised persons) may execute trades for clients.** An app that collects money and has others trade for the payer is acting as an unregistered broker or portfolio manager.
- **If the trades aren't actually placed on an exchange,** it's *dabba trading*. SEBI has repeatedly called this illegal under the Securities Contracts (Regulation) Act 1956, the SEBI Act 1992 and the Bharatiya Nyaya Sanhita 2023. The NSE has publicly warned about Facebook groups offering it.
- **If the trades are placed in the helper's own demat account,** the shares legally belong to the helper. The payer has no claim, tax falls on the wrong person, and it breaks KYC and anti-money-laundering rules. Lending or renting accounts is also a known pattern for mule accounts and fraud.
- **Most reasons someone "can't access" the market are deliberate regulatory barriers:** insider-trading windows, SEBI bans, KYC failures, foreign-investment limits. A proxy is a way around the barrier, not a fix for an access gap.
- **Where the barrier is only friction, there are already legal routes:**
  - Minors can have guardian-operated accounts.
  - NRIs can invest through NRE/NRO accounts.
  - Small amounts can go into mutual-fund SIPs from about ₹100.
  - Shares can be gifted through an off-market transfer.

**Since this is a Groww case study:** proposing proxy trading would be a red flag. Saying you considered it and ruled it out, and why, is a green flag. If you want an investing angle, a legitimate one is reducing the friction of *legal* access, such as KYC help or family accounts. That isn't peer matching, though.

### 12.3 Coupons and vouchers: feasible, but the details decide it

| Voucher type | Transferable? | Verifiable? | Competition | Verdict |
|---|---|---|---|---|
| **Gift cards with a balance** (Amazon, Flipkart, Myntra) | Usually a bearer code, but some brands' terms forbid resale | Partly, through balance-check tools | **Crowded:** GiftSell, Vouchrs (~1% commission), VouchrEx, Redimo, GiftZO, CashCry, Zingoy | ⚠️ A low-margin commodity. Don't make it your core. |
| **Unused app-reward vouchers** (CRED, GPay and PhonePe scratch-card brand vouchers, credit-card milestone vouchers) | Often generic codes | Expiry and format yes; validity only when used | Mostly informal (Telegram) | ✅ **Best fit.** Huge forgotten supply that is worth zero to the holder, so any price is a gain. |
| **Account-bound promo codes** (first order, "₹150 off your next order") | ❌ Tied to the account | n/a | n/a | ❌ Can't be moved. Doing it means creating fake accounts. |
| **Referral codes** | ✅ Shared by design | ✅ | Many referral-listing sites | ✅ Legal but low value. A nice add-on to grow supply. |
| **Splitting a BOGO deal** (movie 1+1 offers with a card, buy-2-get-1 in fashion) | The holder buys both and transfers one | ✅ Ticket or order | None that I know of | ✅ A fun extension of the card-offer model: two strangers each pay half. |
| **Pooling for a minimum order** (quick-commerce free delivery, "₹500 off above ₹5k") | n/a: buyers are combined | ✅ | None | ✅ Only where everyone shares an address: a hostel, office or housing society. |
| Train tickets, concert resale, airline credit shells, lounge passes, employee/student/defence (CSD) pricing | ❌ Name-bound or identity-bound | n/a | n/a | ❌ Out of scope. Several are offences (e.g. unauthorised railway-ticket resale). |
| Proxy trading, IPO applications on other people's PANs | ❌ | n/a | n/a | ❌ Illegal (see 12.2) |

### 12.4 How a voucher exchange would work (reusing the escrow infrastructure)

**Supply side:**
- **"Import my rewards":** upload a screenshot of your CRED, GPay or PhonePe rewards page. OCR reads the brand, value, minimum order and expiry, and lists everything in bulk. Codes are stored encrypted and never shown in a listing.
- **Suggested price:** set automatically from the brand's demand and how close the voucher is to expiry (e.g. 20–40% of face value for promo vouchers). The price drops automatically as expiry nears, so supply clears.

**Demand side, at the moment of checkout:**
- "I'm ordering on Swiggy, cart ₹450." The app shows the vouchers that actually apply (minimum order ≤ cart, not expired, right brand).
- **Combine with the core product:** paste a product link and the app shows the **cheapest stack**: the bank offer through a cardholder, plus a community voucher, plus anything the buyer already holds.

**Trust mechanics for the core problem, double-spending:**
1. Buyer pays into escrow, then the code is revealed **once**.
2. The buyer gets a 30-minute "Did it work?" window. Yes, or no answer, releases the seller's payout. "No" plus a screenshot of the error triggers an automatic refund and a strike against the seller.
3. **Seller payouts are held for 24–72 hours,** and the same code can't be listed twice.
4. **Sellers must complete KYC before withdrawing,** and the platform can claw back future earnings from sellers with a history of failed codes. CardCash's terms allow this kind of recovery.
5. Avoid keeping a stored-value "wallet" for sellers. Balances you can withdraw to a bank can fall under RBI's prepaid-instrument rules. Pay out through the escrow instead.

**Economics:** a ₹200 Swiggy voucher sells for about ₹60, and a 15% commission is ₹9. That's small per trade, so it only works with **high volume, automated listing and no manual support** for each trade. That's another reason it's a **companion feature** that brings people back daily, while card-offer matching (₹500+ per deal) remains the revenue engine.

### 12.5 Recommendation

**The unifying idea: "Offers you can't use, matched with people who can."** Two kinds of supply share one trust layer (escrow, KYC, disputes, ratings):

1. **Card-offer fulfilment** (core): high value, low frequency, sale-season peaks.
2. **Voucher exchange** (companion): low value, high frequency, keeps people opening the app between sales. It also grows supply, because anyone with a phone full of unused rewards can join.

For the case study, show the wide ideation (this table), then **narrow to one**. Build the card-offer flow, and list vouchers as V2 and the ❌ rows as out of scope. Converging like that is what "show us how you think" is testing.

---

## Sources

- [PiePay homepage](https://www.piepay.in/)
- [PiePay FAQs](https://www.piepay.in/faqs)
- [PiePay reimbursement & commission policy](https://www.piepay.in/reimbursement-and-commission-policy)
- [PiePay cancellation & return policy](https://www.piepay.in/cancellation-and-return-policy)
- [PiePay terms of service](https://www.piepay.in/terms-of-service)
- [PiePay on the Play Store](https://play.google.com/store/apps/details?id=com.piepay&hl=en_IN)
- [PiePay on the App Store](https://apps.apple.com/in/app/piepay-avail-card-offers/id6759895746)
- [PiePay App Store reviews](https://apps.apple.com/in/app/6759895746?see-all=reviews&platform=iphone)
- [PiePay on AppBrain](https://www.appbrain.com/app/piepay-avail-card-offers/com.piepay)
- [PiePay in the Razorpay Rize directory](https://razorpay.com/rize/startup-directory/piepay/)
- [TechnoFino thread on PiePay](https://technofino.in/community/threads/piepay-use-your-credit-card-to-earn-money.32559/)
- [DesiDime discussion of PiePay](https://www.desidime.com/discussions/piepay)
- [Yaper: about us](https://yaper.co/about-us)
- [Yaper on the Play Store](https://play.google.com/store/apps/details?id=com.yaper.android&hl=en_IN)
- [Grabr launch (TechCrunch)](https://techcrunch.com/?p=1355381)
- [Grabr's revenue model (AdExchanger)](https://www.adexchanger.com/mobile/grabr-connects-community-global-commerce-collects-data-along-way/)
- [Grabr review (MoneyPantry)](https://moneypantry.com/grabr-review/)
- [RBI Payment Aggregator Master Direction](https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- [Ikigai Law on the PA rulebook (Mondaq)](https://webiis10.mondaq.com/india/financial-services/1681402/rbi-rewrites-the-payment-aggregator-rulebook)
- [Khaitan & Co. on the PA Master Directions](https://www.khaitanco.com/sites/default/files/2025-10/ERGO%20-%20PA%20Master%20Directions%20-%203%20Oct%202025.pdf)
- [Outlook Business on the new PA directions](https://www.outlookbusiness.com/news/rbi-issues-new-master-directions-for-payment-aggregators-rules-take-effect-immediately)
- [HDFC "business spend" reward clawback (LiveFromALounge)](https://livefromalounge.com/business-spend-on-personal-credit-cards/)
- [HSBC India reward-abuse crackdown (LiveFromALounge)](https://livefromalounge.com/hsbc-india-cracks-down-on-credit-card-reward-point-abuse/)
- [Amazon Conditions of Use: acceptable use (ConductAtlas)](https://conductatlas.com/platform/amazon/amazon-conditions-of-use/acceptable-use-and-prohibited-conduct/)
- [Shopsy terms of use](https://www.flipkart.com/pages/shopsy-terms-of-use)
- [Bank-offer T&Cs (Canara Bank / Flipkart)](https://canarabank.com/UploadedFiles/Pdf/FLIPKART_T_&_C.pdf)
- [Flipkart Big Billion Days bank offers (DesiDime)](https://www.desidime.com/news/flipkart-big-billion-days-2026-bbd-sale)
- [SEBI warning on dabba trading (Business Standard)](https://www.business-standard.com/markets/news/sebi-raises-concerns-dabba-trading-players-125072101289_1.html)
- [SEBI flags dabba trading ad (Business Today)](https://www.businesstoday.in/markets/market-commentary/story/sebi-flags-dabba-trading-ad-warns-investors-of-high-risk-illegal-activity-485616-2025-07-21)
- [Why dabba trading is banned (Upstox)](https://upstox.com/learning-center/share-market/what-is-dabba-trading/article-1766/)
- [NSE warning on Facebook dabba groups (Moneylife)](https://moneylife.in/article/beware-of-3-facebook-groups-offering-illegal-dabba-trading-services/80946.html)
- [Gift card selling sites in India (Gyftr blog)](https://www.gyftr.com/blog/best-gift-card-selling-sites-india/)
- [GiftSell](https://www.giftsell.in/)
- [Vouchrs](https://www.vouchrs.in/orders)
- [VouchrEx](https://vouchrex.com/)
- [Redimo](https://redimo.in/)
- [GiftZO](https://giftzo.in/)
- [CashCry Xchange](https://www.cashcry.com/xchange)
- [CardCash seller terms (DeleteMe summary)](https://joindeleteme.com/is-it-scam/is-cardcash-a-scam/)
- [Raise one-year buyer protection (Doctor of Credit)](https://doctorofcredit.com/raise-extends-buyer-protection-year/amp)

*Note: some figures, such as PiePay's fee structure, come from policy pages that are over a year old. Re-check them before quoting.*
