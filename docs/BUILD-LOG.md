# Build log: how OfferPool was made

OfferPool was built for a product case study, working with Claude (Claude Code in the Claude desktop app) as a pair. This log tells the story in order and quotes every prompt word for word. The case study is graded partly on the prompts used and the evals that test the result.

## The brief

The case study asked for:
1. A real problem seen up close, with a digital app that solves it, showing who has the problem, why it matters, why an app is the right answer, what's assumed and what's verified.
2. Four deliverables:
   - a one-page write-up in the author's own words (not AI-written);
   - the prompts used to build the tool;
   - the evals used to test it;
   - a link to the working app.

The problem chosen was personal: giving up a bank-card offer at checkout because the right card wasn't in the wallet.

## Timeline

| Stage | What happened | Result |
|---|---|---|
| 1. Understand the brief | Read the case study and listed the deliverables | Plan for the four deliverables |
| 2. Research | Searched competitors, regulation and economics | Found PiePay and Yaper already doing it; gaps from their reviews; RBI, store and bank risks ([RESEARCH.md](RESEARCH.md)) |
| 3. Ideate wider, then narrow | Tested other "exchangeable" offers | Stock-market proxy trading ruled out as illegal; unused coupon codes chosen as the second feature |
| 4. First prototype | One HTML page, published as a Claude artifact | Shop, Earn, Vouchers, Engine and Evals tabs; 28 evals |
| 5. Redesign | Kintsugi palette and ten design rules | Dark gold-and-celadon look; guided demo bar; phone tab bar |
| 6. Plain language and a smooth flow | Removed jargon; rebuilt checkout | Best price → checkout sheet → live progress → success in about 5 s |
| 7. Real website | Split into a Vite project; GitHub; Vercel | [offerpool.vercel.app](https://offerpool.vercel.app), auto-deploy on push |
| 8. Documentation | Guide doc, PDFs, this organised repo | [docs/](README.md), [pdf/](pdf/) |

## Prompts, word for word

### 1. Understand the brief
> @"Product Case Study_Lakshmi.pdf"
> Go through this problem statement and understand what is to be done

### 2. Research the idea
> Ok, my idea gets its inspiration from shopping and ordering things online. This has been a personal experience and I am quite certain it is something that others have felt too. Imagine you're planning to buy something online and you see that there an offer on that purchase but you can avail it only if you have a specific bank card (debit or credit). Unfortunately, for most of us, we don't always have the specific card required and we have to give up on that offer. I want to build an app/website that matches this requirement between people who want to purchase something immediately and want to avail the specific offer with people who have the necessary resources to fulfill this requirement. Basically acting as an intermediary between people who want to instantly avail the offer with their purchase and the people who are willing and have the necessary infrastructure or resources to help the people avail those offers. And this could be expanded not just to credit/debit/bank card offers, but to other things as well. Can you do some proper research on how we can make such an app and what it top features will be. We don't want to connect people in the literal sense and become a messaging platform, but we want to pool in immediate demand and match it with stored supply automatically, and then transact/transfer seamlessly and take some commission from that transfer (if you get what I mean). A 10% discount could effectively become 7-8% depending on the commission we charge. If messaging is essential for some things, we can keep that as well. Think very thoroughly and deeply and research on what can be done and how to go about building it.

**Result:** [RESEARCH.md](RESEARCH.md). The research covered competitors, the transaction design, unit economics, a prioritised feature list, risks (RBI payment-aggregator rules, store terms, bank clawbacks, tax) and the scope.

### 3. Widen the idea, then narrow it
> Instead of limiting our platform to just bank offers, what other feasible offers can we exchange between people? You think we can match people who maybe want to purchase or enter a position in the stock market but can't do so cause of some reason and the app does it for them by virtually matching people who do access to markets? Is that feasible. Also, I think this is very doable, can we also match coupon codes with people? People with vouchers can post them on the app and people who want to use them can use them and the app takes some commission. Ideate

**Result:** section 12 of [RESEARCH.md](RESEARCH.md).
- A five-question test for whether an offer can be exchanged between people.
- Proxy trading ruled out: only SEBI-registered brokers may trade for clients, and dabba trading is illegal.
- Gift-card resale judged too crowded.
- Unused app-reward codes chosen, with a design that stops a seller using a code or selling it twice.

### 4. Build the prototype
> Card offers + vouchers

This answered whether the prototype should include coupon codes as well as card offers.

**Result:** the single-file prototype ([`prototype/`](../prototype/)), with a simulated marketplace, a live matching engine and 28 evals running inside the page.

### 5. Sharing it
> how can one open this website on their device?

### 6. Redesign
> before we deploy and make it a proper website and all, can you improve the aesthetics of it. It seems unorganised and not at all user-friendly. Can you take inspiration from the colour scheme in the image. Make the site easy for humans/user to follow and use. Follow these design rules in every UI you build:
> - Nested rounded corners: make the inner radius the outer radius minus the padding
> - Borders: use alpha colours like rgb(0 0 0 / 0.12) instead of solid hex, so they blend into any background
> - Palettes: build them in OKLCH instead of HSL, so equal lightness actually looks equal
> - Gradients: add “in oklch”, like linear-gradient(90deg in oklch, blue, orange), so they don’t go grey in the middle
> - Icons: match the icon’s stroke width to the weight of the text next to it
> - Carousels: fade the edges with mask: linear-gradient(90deg, transparent, black 15% 85%, transparent)
> - Icon swaps: blur the outgoing icon as it fades out (filter: blur(4px))
> - Dark mode: show depth with lighter surfaces, because shadows barely show up
> - Full-height sections: use 100dvh instead of 100vh, which breaks in Safari
> - Product shots on a white background: mix-blend-mode: multiply, so the white disappears

(This prompt had a reference image attached: a dark website about kintsugi, with gold-mended pottery and pale celadon lettering.)

**Result:** the kintsugi design system ([DESIGN.md](DESIGN.md)), a step-by-step guide bar, folded-away secondary options, an order progress bar and a phone tab bar.

### 7. Plain language and a smooth flow
> the language used like "escrow", "job" is making the website very confusing for a first time user. Can you fix that? And if possible, make the flow from selecting the item to successfully having paid and availed offer smooth

**Result:**
- Every jargon word was replaced (table in [DESIGN.md](DESIGN.md#language)).
- Checkout became a single path:
  1. one "Your best price" card;
  2. "Continue to pay";
  3. a checkout sheet;
  4. a live "Placing your order" screen;
  5. "Your order is placed".
- Simulated helpers now say yes by default, so a first-time shopper isn't sent to the helper tab halfway through.

### 8. The real website
> now, build the actual website and upload the entire code and whatever on my GitHub (aryankjain11) and deploy it using vercel

Two choices were made along the way: the repo would be **private**, and sign-in to GitHub and Vercel would happen **from the terminal**.

**Result:** the prototype was split into a Vite project ([ARCHITECTURE.md](ARCHITECTURE.md)), the evals became `npm test`, and the repo was created and pushed. Vercel deploys it at [offerpool.vercel.app](https://offerpool.vercel.app) and redeploys on every push.

### 9–11. Documentation
> can you make a doc describing this app and all its features and everything. Include all the code today

> generate a pdf document describing the app

> can you make a completely descriptive document describing the website and also compile the codes and all into a file but keeping the codes and the desciritve, essay like document separate from the codes but in the same folder

**Result:**
- An online guide doc with the code in tabs.
- The two PDFs in [`pdf/`](pdf/): an essay-style description and the complete source code.
- The essay is also in Markdown as [PRODUCT.md](PRODUCT.md).

### 12. This repo
> can you push all the necessary things to github so anyone looking at it can see how the website was built and what was the vision behind it and everything. Organise the github repo

**Result:**
- A new README.
- The docs reorganised into this folder.
- Screenshots of the live site.
- The PDFs.
- The original prototype.

## What testing caught along the way

| Bug | Fix |
|---|---|
| The same helper always ranked first | "Time since last order" now resets when a helper accepts |
| Offers that couldn't be used still showed a price | They show a reason instead |
| Long labels overflowed on phones | Labels wrap; every view checked at 375 px |
| "a HDFC card" | "an HDFC", "an SBI", "a Kotak" |
| First-time shoppers were sent to the helper tab mid-checkout | Orders go to simulated helpers by default; the helper side is opt-in |

The full list of evals and scenarios is in [EVALS.md](EVALS.md).

## Tools used

- **Claude Code** (Claude Opus 5.5) in the Claude desktop app: research, writing and the code.
- **Claude artifacts:** the first prototype was published as a Claude-hosted page before becoming a real site.
- **Vite** and **Vitest:** build and tests.
- **GitHub** and **Vercel:** hosting and auto-deploy.
- **Headless Chrome:** the screenshots in [`screenshots/`](screenshots/) and the PDFs in [`pdf/`](pdf/).
