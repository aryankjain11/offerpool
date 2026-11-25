# Vision

> Bank offers you can't use, matched with people who can.

## The problem

Indian online shopping runs on bank offers: "10% off with an HDFC credit card", "flat ₹5,000 off with SBI". The discounts are large, often ₹1,000 to ₹5,000 on a phone or laptop. But each offer works with one bank's card, and most people hold one or two cards. So most shoppers scroll past a list of offers they can't use.

On the other side, people with several credit cards leave most of their offer limits unused every month. They care about reward points and about reaching yearly spending targets that waive their card's annual fee.

People already close this gap informally. They ask a friend with the right card to place the order, or join Telegram and WhatsApp groups where strangers do it for a fee. Between friends this works. Between strangers it's risky, because someone has to trust someone else with tens of thousands of rupees.

This problem comes from personal experience: giving up an offer at checkout because the card it needed wasn't in the wallet.

## Who it's for

| Who | Their problem | What they want |
|---|---|---|
| **Shopper** | Misses ₹1,000–₹5,000 on a big purchase because they don't have the card | The lowest price now, with no risk |
| **Helper** (a person with several cards) | Offer limits, reward points and fee-waiver spend targets go unused | Easy extra money and points, with no risk to their card |
| **Coupon-code holder** | CRED, GPay and PhonePe reward codes expire unused | A few rupees back for codes they'll never use |

## The idea

OfferPool is not a chat app that introduces strangers. It works more like ride-hailing:
- **Shoppers** say what they want to buy.
- **Helpers** say which cards they hold and which orders they'll take.
- **OfferPool** matches them automatically and stands in the middle of the money.

The core trust mechanism is **the order in which money moves**:

1. The shopper pays OfferPool first.
2. The helper buys the item on their card and ships it to the shopper's address.
3. OfferPool pays the helper back, plus a reward, only after the item arrives and the return period ends. The timing always lands before the helper's card bill is due.

The discount is shared: the shopper keeps **70%**, the helper earns **15%**, and OfferPool keeps **15%**. A 10% discount becomes about 7% for the shopper, which is still money they'd otherwise have lost.

## Principles

1. **Nobody trusts a stranger with money.** OfferPool holds it until the goods arrive.
2. **Show the real number.** Offers are capped, so "10% off up to ₹1,500" on a ₹69,900 phone is about 2%. OfferPool shows what each offer actually gives.
3. **Don't charge for what you can do alone.** If the shopper's own card gets the best offer, OfferPool says so and sends them to the store.
4. **Fix what existing apps get wrong.** PiePay and Yaper prove the demand. Their reviews complain about no cardholder being available, prices that don't match the quote, and slow refunds. OfferPool tells shoppers about availability before they pay, asks before any price change, and refunds at once.
5. **Plain words.** No "escrow", "job" or "commission". Instead: "we hold your money safely", "order request", "reward".

## Scope

| In scope (built) | Out of scope (deliberately) |
|---|---|
| Flipkart and Amazon | Other stores |
| Instant-discount offers on credit cards | Debit-card offers through helpers; cashback-later offers; no-cost EMI on someone else's card |
| Coupon codes and gift cards with refund protection | Employee, student or defence-canteen discounts (identity-bound, so proxy use is misrepresentation) |
| Automatic matching with structured status updates | Free-form chat (it invites people to go around the platform) |
| Prepaid shoppers, checked orders, payouts timed to card bills | Proxy stock trading (illegal under SEBI rules) |

The reasoning behind each line is in [RESEARCH.md](RESEARCH.md) (sections 7 and 12).

## What success would look like

- A first-time shopper goes from product to placed order in under a minute, without needing an explanation. The demo does it in about 5 seconds.
- Helpers are always paid before their bill is due.
- A refund never waits on a store's refund.

## What's next

1. **Talk to real people.** 3–5 shoppers who gave up an offer, and 3–5 people with several cards. Would shoppers prepay? Is a ₹300–₹750 reward worth a helper's time?
2. **Sale-day pre-booking:** reserve a deal and a helper before Big Billion Days.
3. **Price and offer alerts** for a product.
4. **Pooled orders** for minimum-order offers among people at one address (a hostel or office).
5. **For a real launch:**
   - live offer data;
   - a licensed payment partner, since RBI rules mean OfferPool shouldn't hold money itself;
   - identity checks for helpers;
   - per-helper volume caps to stay within store and bank rules.
