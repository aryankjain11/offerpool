# OfferPool: a description of the website

*What it is, how it works, and how it was built. This is the Markdown version of [OfferPool - Website Description.pdf](pdf/OfferPool%20-%20Website%20Description.pdf).*

**Live website:** https://offerpool.vercel.app

## 1. Introduction

OfferPool is a website that lets people get bank-card discounts without owning the bank card. When an online store such as Flipkart or Amazon offers "10% off with an HDFC credit card", only HDFC cardholders can claim it. OfferPool connects a shopper who wants that discount with a verified person, called a *helper*, who does have the card. The helper buys the item on their card and has it delivered to the shopper's address. The shopper pays less than the store price, the helper earns a reward for their trouble, and OfferPool keeps a small fee.

The website also has a second, smaller marketplace for coupon codes. Apps such as CRED, Google Pay and PhonePe hand out discount codes that people often never use. OfferPool lets them sell those codes to someone who will, with protection for the buyer if a code turns out not to work.

This document describes the website in full: the problem it solves, how a purchase flows from start to finish, what each part of the website does, how it keeps everyone's money safe, how it looks and reads, how it is built, how it is tested and deployed, and what it would take to turn the demo into a real service. The complete source code is in this repository, and also compiled into one document, [OfferPool - Complete Source Code.pdf](pdf/OfferPool%20-%20Complete%20Source%20Code.pdf).

## 2. The problem

Indian e-commerce runs on bank offers. During a big sale, a product page may list half a dozen of them: 10% off with one bank's credit card, a flat ₹5,000 off with another, 7.5% off with a third. These discounts are large, often ₹1,000 to ₹5,000 on a phone, laptop or appliance. But each offer works only with one bank's card, and most people hold one or two cards at most. So most shoppers look at a long list of offers they cannot use, and either pay full price or apply for a card they do not really want.

On the other side are people with several credit cards. Bank offers have monthly limits per card, and those limits mostly go unused. These cardholders also care about reward points and about reaching yearly spending targets that waive their card's annual fee. Every month, they leave value on the table that someone else could have used.

The gap is easy to see. One group wants a discount it cannot reach. The other group can reach it and has no use for it. People already close this gap informally, by asking a friend with the right card to place an order for them, or through Telegram and WhatsApp groups where strangers do the same for a fee. The informal version works between friends but is risky between strangers, because one person has to trust the other with a large sum of money.

Two Indian apps, PiePay and Yaper, already offer this as a service, which shows that the demand is real. Their public reviews point to three recurring complaints: shoppers sometimes cannot find a cardholder at all, the final price does not always match the price they were shown, and refunds after a cancellation can take weeks. OfferPool's design takes each of these on directly.

## 3. The idea

OfferPool does not try to be a chat app that introduces strangers to each other. It works more like a ride-hailing service. Shoppers describe what they want to buy, helpers tell the service which cards they hold and which orders they are happy to take, and the service matches the two automatically. Nobody needs to negotiate, message or trust a stranger, because OfferPool stands in the middle.

The key to making this safe is the order in which money moves. The shopper pays OfferPool first. OfferPool holds that money while the helper places the order and the item is delivered. The helper is paid back, with their reward, only after the item has arrived and the return period has ended. At no point does a shopper hand money to a stranger, or a helper spend money they might not get back.

## 4. How a purchase works, start to finish

A purchase on OfferPool moves through seven steps.

1. **The shopper picks a product.** They paste a Flipkart or Amazon product link, or pick one of the sample products on the page. OfferPool reads which store it is from and its price.
2. **OfferPool works out the best price.** It checks every bank offer for that product, including each offer's cap and minimum order value, and compares two routes. If the shopper's own card qualifies, they can use it directly at no cost. If not, a helper can use theirs. The cheapest route is picked automatically.
3. **The shopper pays.** They confirm their delivery address and pay by UPI. OfferPool holds the money.
4. **A helper is found.** OfferPool filters its helpers down to the ones who can take this particular order, ranks them, and asks the best one first. If that helper does not answer within a minute, the next one is asked.
5. **The helper places the order.** They buy the item on their card, using the shopper's address for delivery, and tell OfferPool the order number and the amount they paid. OfferPool checks that the details are right.
6. **The item is delivered.** The store ships it straight to the shopper, who receives the delivery code on their own phone. A seven-day return period then begins.
7. **Everyone is settled.** Once the return period ends, OfferPool pays the helper back what they spent plus their reward, timed so the money arrives before the helper's credit card bill is due.

If anything goes wrong along the way, the shopper gets a full refund and the helper earns nothing. Section 9 describes each of these cases.

## 5. Where the money goes

The discount is shared three ways. The shopper keeps 70%, the helper earns 15% as a reward, and OfferPool keeps 15% as its fee. The worked example below uses an iPhone 16 on Flipkart, priced at ₹69,900, with a flat ₹5,000 discount for HDFC credit cards.

| Line | Amount |
|---|---:|
| Price on Flipkart | ₹69,900 |
| HDFC card discount | −₹5,000 |
| What the helper pays Flipkart | ₹64,900 |
| Shopper's share of the discount (70%) | ₹3,500 |
| Helper's reward (15%) | ₹750 |
| OfferPool's fee (15%) | ₹750 |
| What the shopper pays OfferPool | ₹66,400 |

The shopper pays ₹66,400 instead of ₹69,900 and saves ₹3,500. The helper spends ₹64,900 on their card and gets back ₹65,650, so they earn ₹750 in cash plus the card's reward points on a ₹64,900 purchase, roughly another ₹1,300 at a typical 2% rate. That purchase also counts towards the spending target that waives their card's annual fee. OfferPool earns ₹750. The three shares always add up exactly to the discount, and the website's tests check this for awkward amounts where rounding could otherwise lose or create a rupee.

Discounts are often smaller than their headline suggests, because most offers are capped. "10% off up to ₹1,500" on a ₹69,900 phone is really about 2%. OfferPool always shows the real figure, written out in words such as "10% of ₹69,900 is ₹6,990, but this offer stops at ₹4,000." When the saving would be under ₹400, OfferPool does not send the order to helpers at all, because each person's share would be too small to be worth the effort.

## 6. The shopper's experience

The website opens on the Shop tab, where the visitor plays Riya, a shopper in Bengaluru. A short guide bar at the top of the page always says what to do next, such as "Pick something to buy", with a button that does it. First-time visitors can follow it from start to finish without reading anything else, and it can be hidden at any time.

### Finding a product

The page offers a search bar for a Flipkart or Amazon link and, below it, a sideways-scrolling row of six sample products: an iPhone 16, a MacBook Air, an LG air conditioner, a Samsung Galaxy S25, Sony headphones and boAt earbuds. Each sample appears as a card with a simple drawing of the product, its name, its store and its price. A link from any other store, or an unknown product, gets a clear message explaining what the demo supports. The shopper can also tell OfferPool which cards they already hold, by bank and type only and never by card number, so that the website can point out when their own card is the best deal.

### Seeing the best price

Choosing a product brings up one large card headed "Your best price". It shows the price the shopper would pay in large type, the store's price struck through beside it, and the saving in green. Two short lines explain the deal: which bank offer it uses, that the shopper does not need the card, and how many helpers are available right now. A link underneath, "How is this price worked out?", opens a receipt that lists every line, from the store price down to the shopper's total, with a coloured bar showing how the discount is split.

Everything else is folded away so it does not distract. "Other ways to pay" lists the remaining usable offers, and choosing one makes it the main card. "Offers that won't work for this order" lists the rest, each with a plain reason, such as "Only works on orders of ₹25,000 or more", "This offer ended on 20 Nov", "No helper with this card is online right now" or "Debit-card offers only work with your own card". If another shopper is selling a coupon code that fits the order, a dashed box offers to add it with one tick. The bank discount is then recalculated on the lower price, and its minimum order value is checked again.

When the shopper's own card is the cheapest route, the main card says so plainly: "Your own ICICI credit card gets this offer. Buy it straight from Flipkart. There's nothing to pay us." The button then links straight to the store. OfferPool does not charge for a deal the shopper can get alone.

### Paying

The main button reads, for example, "Continue to pay ₹66,400". It opens a short checkout panel that slides up over the page. The panel shows the store price, the saving and the total, a box for the delivery address, the UPI payment method, and one sentence explaining why the money is safe. One button pays.

### Watching the order being placed

After payment, the panel turns into a live progress screen with three steps. "Payment received" is ticked straight away. A spinner then shows "Finding a helper with an HDFC credit card", which changes within a couple of seconds to, for example, "Ananya from Pune said yes", with her rating and number of past orders. The last step, "Ordering it on Flipkart with the HDFC offer", explains that OfferPool is checking the order number, card, price and address. Once that check passes, the panel shows a success screen with a gold seal and the message "Your order is placed". It gives the amount saved, the store's order number, who placed the order, the expected arrival date and three short lines on what happens next. The whole sequence takes about five seconds in the demo, and the shopper never has to leave the page.

### Following the order

Each order then appears under "Your orders" with a progress bar of six stages: Paid, Helper found, Ordered, On the way, Delivered and Done. A folded history lists every event with its time. Because nothing really ships in a demo, dashed "demo shortcut" buttons move the order along: ship it, deliver it, and skip the seven-day return period. A real cancel or return button sits beside them for as long as the order can still be cancelled or returned.

## 7. The helper's experience

The Earn tab shows the same marketplace from the other side. Here the visitor plays Kabir, a helper in Delhi with an HDFC Regalia Gold card and an SBI Cashback card. A switch at the top says whether he is available for requests. Below it, three tiles show his rewards this month, the approximate value of the card points he has earned, and his progress towards the spending target that waives his HDFC card's yearly fee. Orders placed through OfferPool count towards that target, which is one of the strongest reasons for a cardholder to join.

### Receiving a request

By default the demo's other helpers handle shoppers' orders, so a first-time shopper is never sent off to the helper side mid-purchase. Anyone who wants to try the helper side can press "Get a sample request", or switch a setting under Behind the scenes, and a request arrives for Kabir. The request card shows the product, a 60-second countdown, and three facts: how much Kabir will pay on which card, his reward (for example "+₹750, plus about ₹1,298 in card points"), and the date he will be paid back, with how many days that leaves before his bill is due. It also reassures him that the shopper has already paid OfferPool, so his money is covered. If he does not answer in time, the request moves on to the next helper.

### Placing the order

Accepting the request opens a numbered set of steps: open the product on the store, copy the shopper's address (shown only now, after accepting), apply the shopper's coupon code if there is one, pay with the right card, and enter the order number and amount paid. A "Fill in sample details" button completes the form for demo purposes, and a "Try a wrong order number" button shows what happens when a check fails. Pressing "Check my order" runs four checks. The order number must look like a real number from that store (Flipkart's start with OD and have 18 digits), the card must be from the right bank, the shopper's address must have been used, and the amount must be within ₹10 of the quote. A higher amount is sent to the shopper to approve; a lower one is refunded to them.

### Cards, preferences and history

Three tabs at the bottom of the page hold Kabir's settings. "Your cards" lists his cards by bank, name and bill due date, never by number, and shows how many times each offer has been used this month against its monthly limit. "Your preferences" sets which stores he will order from, the most he will spend on one order, the smallest reward he will accept, and whether to accept fitting requests automatically. "Past requests" lists each order with its status, what he paid, his reward and when he was or will be paid back.

## 8. Coupon codes

The Coupon codes tab is a simple marketplace for codes people will not use themselves. It works on the same principle as the main service: the buyer pays first, and the seller is paid only once the code has been shown to work.

Codes for sale appear as ticket-shaped cards, each with a notch and a dashed gold line across it. A card shows the store, what the code is worth, any minimum order, how many days are left before it expires, its price and the seller's rating. Only the first four characters of the code are visible before purchase. A sideways-scrolling row at the top highlights codes ending this week, which are priced lower. Shoppers can filter by store and enter their order total to see which codes fit.

After buying, the full code is revealed with a copy button. The buyer has 30 minutes to try it and tap either "It worked" or "It didn't work". If it did not work and the buyer attaches a screenshot of the error, they are refunded in full, and the seller gets nothing plus a warning shown beside their name on future listings. If it worked, the seller is paid a day later.

Selling takes a short form: store, type (discount code or gift card), value, minimum order, expiry date and the code. OfferPool suggests a price automatically. For discount codes it starts at 30% of the code's value, adjusted for how popular the store is (higher for Flipkart and Amazon, lower for ride and ticket apps). Gift cards start at 92% of their balance. The suggested price drops by 20% in a code's last week and by half in its last two days, so codes sell before they expire. The seller sees exactly what they will receive after OfferPool's fee, which is 15% on discount codes and 3% on gift cards, with a minimum of ₹5. Expired codes cannot be listed and are removed from sale automatically, and the same code cannot be listed twice, whatever its capitalisation. A "Try a sample screenshot" button shows how a seller could add several codes at once from a screenshot of their rewards page; in the demo, reading the screenshot is simulated.

## 9. When things go wrong

A service that handles strangers' money has to plan for failure as carefully as for success. OfferPool handles each failure case as follows.

- **No helper is available.** If nobody with the right card is online, the shopper is told before paying, and that option is not offered. If every helper who is asked says no, the shopper is refunded in full at once and offered another way to pay.
- **The store's price goes up.** If the helper finds a higher price at checkout, the shopper is asked first: pay the difference and go ahead, or cancel for a full refund. Nothing extra is charged without the shopper's agreement.
- **The store's price goes down.** The difference goes back to the shopper.
- **The shopper cancels or returns the item.** Because OfferPool still holds the shopper's money and has not yet paid the helper, the shopper is refunded immediately. The store refunds the helper's card directly, and the helper earns no reward. This is where OfferPool improves on existing apps, whose refunds wait for the store's refund to reach the cardholder first.
- **A helper does not respond.** After 60 seconds the request moves to the next helper.
- **An order fails its checks.** The helper is shown which check failed and why, and the order does not go ahead until it passes.
- **A coupon code does not work.** The buyer is refunded and the seller gets nothing plus a warning.

The Behind the scenes tab has switches that trigger each of these situations on purpose, so anyone reviewing the website can see them happen.

## 10. How a helper is chosen

For every order, OfferPool narrows its full list of helpers down through seven filters, in order. A helper must have the right bank's credit card, must not be the shopper, must be available now, must be willing to order from that store, must still be able to use this offer this month, must be comfortable spending that much on one order, and must be happy with the size of the reward. The Behind the scenes tab draws this narrowing as a set of bars for the most recent order, so it is easy to see where helpers dropped out.

The helpers who remain are ranked by a score that weighs four things: how often they say yes (40%), how quickly they usually place orders (25%), how long it has been since their last order (20%), and how many uses of the offer they have left this month (15%). The third factor spreads the work around. A helper who has just taken an order drops down the list, so the same reliable person is not asked every time. OfferPool asks the top-ranked helper first and works down the list.

The same tab shows running totals: orders so far, the share that found a helper, the average wait, how much money OfferPool is holding for shoppers, and OfferPool's earnings. It also shows a table of all nine helpers with switches to make each available or unavailable, and an activity log of every event, with timestamps.

## 11. Trust and safety by design

Most of OfferPool's design choices exist to make a transaction between strangers feel as safe as buying from the store directly.

- **Money is held, not passed on.** The shopper pays OfferPool, not the helper, and the helper is paid only after delivery and the return period.
- **Helpers are paid before their bill is due.** A helper's payout normally lands the day after the return period ends. If that would be after the card's due date, it is brought forward, so a helper never has to pay interest or use their own savings. The website's tests check this for bills due on the 1st, 5th, 15th and 28th of the month.
- **No card numbers, ever.** Shoppers and helpers describe their cards only by bank, type and name.
- **Addresses stay private.** A helper sees the shopper's address only after accepting the order.
- **Every order is checked.** The order number, card, address and amount are checked before an order counts as placed.
- **No self-matching.** A shopper is never matched with themselves, even when they are also a helper.
- **Usage limits.** Each offer can be used only a limited number of times per card each month, which keeps a helper's volume at the level of "helping a friend".

## 12. Design and language

The website's look takes its inspiration from *kintsugi*, the Japanese craft of repairing broken pottery with gold. The image suits a service that mends offers people could not otherwise use. The pages are dark: deep ink-blue surfaces, pale celadon-green headings like the glaze on old ceramics, and gold kept only for money and for the main button on each screen. A thin gold "seam" line, like a mended crack, runs under each page heading and through the logo, and it draws itself across the success screen when an order is placed.

Headings and large prices use Cormorant Garamond, an elegant serif. Everything else uses Figtree, a clear and friendly sans-serif, and receipts and order numbers use JetBrains Mono. On a computer the tabs sit along the top of the page; on a phone they move to a bar along the bottom within reach of the thumb, and the checkout panel slides up from the bottom of the screen.

Ten specific design rules were applied throughout:

- **Corners:** inner rounded corners are the outer radius minus the padding, so nested shapes look concentric.
- **Borders:** semi-transparent, so they blend into any surface.
- **Colours:** defined in the OKLCH colour space, where equal lightness values really do look equally light.
- **Gradients:** blended in OKLCH so they do not turn grey in the middle.
- **Icons:** stroke widths match the weight of the text beside them.
- **Scrolling rows:** fade out at their edges.
- **Copy buttons:** the copy icon blurs away as a tick fades in.
- **Depth:** shown by lighter surfaces rather than shadows, which barely show on a dark page.
- **Full-height layout:** uses `100dvh`, which behaves correctly in Safari.
- **Product drawings:** drawn on white and blended so the white disappears into their pale green tiles.

The language was simplified just as deliberately. An early version used industry terms such as escrow, job, cardholder, matching, commission and quota, which confused first-time users. Every one was replaced with everyday words: "we hold your money safely until your order arrives", "order request", "helper", "finding a helper", "reward" and "used 1 of 2 times this month". Error messages say what went wrong and what to do next, and nothing on the page assumes the reader knows how payments or credit cards work behind the scenes.

## 13. How the website is built

OfferPool is a static website: plain JavaScript, HTML and CSS, built with the Vite tool, with no framework, server or database. Everything runs in the visitor's browser. This keeps the demo fast, free to host and easy to read.

The code is split so that the business rules are separate from the screens. Three files hold everything that decides prices and matches: `utils.js` (shared constants and helpers for money and dates), `data.js` (the sample products, offers, helpers and coupon codes) and `logic.js` (the rules). The rules are pure functions that compute an offer's discount, split it, decide which helpers qualify and how they rank, find the best price, check an order, work out payout dates and handle refunds and coupon codes. Because these files contain no screen code, the automated tests can use exactly the same rules the website uses.

The fourth file, `main.js`, holds the user interface and the simulated marketplace. One object holds the whole state of the demo: orders, helpers, codes, settings and which panels are open. Every click changes that object and redraws the current screen, keeping anything the visitor has typed into forms. The simulated helpers respond on timers, taking about two seconds to say yes and another two to place the order, which makes the live progress screen feel real. The address bar's `#shop`, `#earn`, `#vouchers`, `#engine` and `#evals` endings link straight to each tab. The fifth file, `evals.js`, holds the tests, and `styles.css` holds the whole design system.

The finished website is small: about 3 kB of HTML, 33 kB of styles and 91 kB of script before compression, and about a third of that after it.

## 14. How it is tested

The website carries 28 automated tests, called evals, each written to catch one specific way a service like this could go wrong. Seven check pricing: caps, minimum orders, expired offers, offers limited to one product, and the choice between the shopper's own card and a helper's. Two check the money: that the three shares always add up to the discount, and that what the shopper pays equals what the helper gets back plus the reward plus the fee. Five check matching, from the ₹400 threshold to self-matching and the "nobody available" case. Three check the order checks, one checks payout timing, one checks refunds, one checks that debit-card offers are kept to the shopper's own card, one checks that a coupon code and a bank offer combine correctly, six check the coupon-code rules, and one checks how bad links are handled.

All 28 pass. They run in two places from the same file: on the command line with `npm test`, and live inside the website on its Tests tab, which shows a pass ring and a table of what each test expected and what it got. Beyond the automated tests, 17 scenarios were clicked through by hand in a browser, covering the full purchase, a helper saying no, the 60-second timeout, a price rise, cancellations, coupon codes, phone-sized screens and the plain-language check. This testing found and fixed several bugs: the same helper always ranked first, unusable offers showed a price, labels overflowed on phones, the article in "a HDFC card" was wrong, and first-time shoppers were being sent to the helper side halfway through a purchase.

## 15. How it is deployed

The code lives in a private GitHub repository, `aryankjain11/offerpool`. The website is hosted on Vercel at `offerpool.vercel.app`, where anyone can open it without signing in. Vercel is connected to the repository, so every change pushed to its main branch is built and published automatically, usually within ten seconds. To run the website on a computer, a developer installs Node.js and runs `npm install` followed by `npm run dev`; `npm test` runs the evals and `npm run build` produces the files that Vercel serves.

## 16. What it is not yet, and what comes next

OfferPool is a working demonstration, not a live service. It proves the flow, the rules and the experience, but several pieces are simulated. The products, offers and prices are sample data, and the date is fixed at 25 November 2026 so the tests always give the same results. Payments are not real, the helpers other than Kabir are simulated, and reading coupon codes from a screenshot is pretended.

Turning it into a real service would need real data and real money handling. Offers would have to be read from the stores' pages and the banks' terms. Payments would go through a licensed payment company's marketplace product, because under the Reserve Bank of India's rules a business like this should not hold customers' money itself. Helpers would need identity checks (PAN and bank account) before being paid. Order checks could read the store's invoice or confirmation email automatically, and coupon screenshots would need real text recognition.

There are also policy risks to plan around. Amazon and Flipkart limit purchases to personal use, and banks can claw back reward points for spending they consider commercial. Keeping each helper's volume low, through monthly limits, is the main safeguard. Helpers' rewards are income, so tax rules on deductions and GST would need checking with an accountant.

The most important next step is to talk to real people. Talking to a handful of shoppers who have given up an offer, and a handful of people with several cards, would test whether shoppers will pay a stranger's service upfront and whether helpers find a reward of a few hundred rupees worth their time. Beyond that, natural additions include booking a deal and a helper ahead of a big sale day, price alerts for a product, and letting people at the same address, such as a hostel or office, pool their orders to reach minimum-order offers together.

## 17. Closing

OfferPool takes a habit people already have, asking a friend with the right card to place an order for them, and makes it safe between strangers. It does this by holding the money until the goods arrive, by choosing helpers fairly and automatically, by checking every order, and by explaining every number and every step in plain language. The demo shows the whole journey working end to end, from a shopper choosing a phone to a helper being paid back before their bill is due. The question it leaves open is not whether the idea works, but whether enough people on both sides will choose to use it.
