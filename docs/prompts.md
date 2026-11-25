# Prompts used to build OfferPool

Tool: Claude (Claude Code, desktop app). The prompts are listed in order, exactly as typed. Claude did the web research, wrote the research notes, and built and tested the app in response to these four prompts.

**App:** https://claude.ai/artifact/GgeULbqvWKGdbFdxAuP8wK

---

### Prompt 1: Understand the brief
> @"Product Case Study_Lakshmi.pdf"
> Go through this problem statement and understand what is to be done

**Output:** A breakdown of the brief and its four deliverables, plus a reminder that the one-pager has to be written by me.

### Prompt 2: Research the idea
> Ok, my idea gets its inspiration from shopping and ordering things online. This has been a personal experience and I am quite certain it is something that others have felt too. Imagine you're planning to buy something online and you see that there an offer on that purchase but you can avail it only if you have a specific bank card (debit or credit). Unfortunately, for most of us, we don't always have the specific card required and we have to give up on that offer. I want to build an app/website that matches this requirement between people who want to purchase something immediately and want to avail the specific offer with people who have the necessary resources to fulfill this requirement. Basically acting as an intermediary between people who want to instantly avail the offer with their purchase and the people who are willing and have the necessary infrastructure or resources to help the people avail those offers. And this could be expanded not just to credit/debit/bank card offers, but to other things as well. Can you do some proper research on how we can make such an app and what it top features will be. We don't want to connect people in the literal sense and become a messaging platform, but we want to pool in immediate demand and match it with stored supply automatically, and then transact/transfer seamlessly and take some commission from that transfer (if you get what I mean). A 10% discount could effectively become 7-8% depending on the commission we charge. If messaging is essential for some things, we can keep that as well. Think very thoroughly and deeply and research on what can be done and how to go about building it.

**Output:** `Research - Card Offer Matching Platform.md`. This covered:
- Competitors: PiePay and Yaper already run this model.
- The gaps in those apps, taken from their reviews.
- How a transaction flows, the unit economics and a prioritised feature list.
- Risks: merchant terms, bank clawbacks, RBI payment-aggregator rules.
- Scope, and the assumptions to verify.

### Prompt 3: Widen the idea, then narrow it
> Instead of limiting our platform to just bank offers, what other feasible offers can we exchange between people? You think we can match people who maybe want to purchase or enter a position in the stock market but can't do so cause of some reason and the app does it for them by virtually matching people who do access to markets? Is that feasible. Also, I think this is very doable, can we also match coupon codes with people? People with vouchers can post them on the app and people who want to use them can use them and the app takes some commission. Ideate

**Output:** Section 12 of the research notes:
- A five-question test for whether an offer can be exchanged between people.
- Proxy stock trading ruled out: SEBI broker rules and the ban on dabba trading.
- Gift-card resale judged too crowded.
- Unused app-reward vouchers chosen as the best second category, with a design that stops a seller using or reselling a code after selling it.

### Prompt 4: Build it
> Card offers + vouchers

This answered Claude's question on whether the prototype should include the voucher exchange or only card offers.

**Output:** The OfferPool prototype (`app/index.html`, published at the link above) with five tabs:
- **Shop:** paste a product link and see every bank offer with its cap maths.
- **Earn:** the cardholder's side of each job.
- **Vouchers:** buy, sell, and import from a rewards screenshot.
- **Engine:** the matching funnel, supply pool, event log and demo controls.
- **Evals:** 28 automated checks that run inside the app.
