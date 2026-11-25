// OfferPool: pricing, matching, order checks, payouts and coupon rules (pure functions)
import { TODAY, MIN_MATCH, RETURN_DAYS, ACCEPT_SECONDS, SPLIT, fmt, parseD, addDays, fdate, esc, clone, clock, bankTag, aBank, ord } from './utils.js';
import { PRODUCTS, OFFERS, BANKS, INITIAL_ME, INITIAL_POOL, INITIAL_VOUCHERS, SCANNED_SAMPLE, DEMAND } from './data.js';

/* ---------- pure logic (exercised by the Tests tab) ---------- */
export const offerById = id => OFFERS.find(o => o.id === id);
export const productById = id => PRODUCTS.find(p => p.id === id);
export const offerLabel = o => o.kind === 'flat' ? `Flat ${fmt(o.amount)} off` : `${o.pct}% off up to ${fmt(o.cap)}` + (o.min ? ` on ${fmt(o.min)}+` : '');
export const cardName = o => `${o.bank} ${o.type} card`;

export function computeOffer(offer, amount, productId, today) {
  if (offer.products && !offer.products.includes(productId)) return { applicable: false };
  const r = { applicable: true, eligible: false, discount: 0, raw: 0, capped: false, reason: '' };
  if (parseD(offer.validTill) < today) { r.reason = 'This offer ended on ' + fdate(parseD(offer.validTill)); return r; }
  if (amount < offer.min) { r.reason = 'Only works on orders of ' + fmt(offer.min) + ' or more'; return r; }
  if (offer.kind === 'flat') { r.raw = offer.amount; r.discount = Math.min(offer.amount, amount); }
  else { r.raw = amount * offer.pct / 100; r.discount = Math.floor(Math.min(r.raw, offer.cap)); r.capped = r.raw > offer.cap; }
  r.eligible = true; return r;
}
export function offerMath(offer, amount, c) {
  if (!c.eligible) return c.reason;
  if (offer.kind === 'flat') return `Flat ${fmt(offer.amount)} off this product`;
  return `${offer.pct}% of ${fmt(amount)} is ${fmt(c.raw)}` + (c.capped ? `, but this offer stops at ${fmt(offer.cap)}` : '');
}
export function splitDiscount(d, s = SPLIT) { const buyer = Math.round(d * s.buyer), card = Math.round(d * s.card); return { buyer, card, platform: d - buyer - card }; }
export function eligibleCardholders(pool, offer, merchant, amount, commission, buyerId) {
  const steps = [
    [`Has ${aBank(offer.bank)} ${offer.type} card`, c => c.cards.some(k => k.bank === offer.bank && k.type === offer.type)],
    ['Is not the shopper', c => c.id !== buyerId],
    ['Is online now', c => c.online],
    [`Shops on ${merchant}`, c => c.merchants.includes(merchant)],
    ['Can still use this offer this month', c => (c.quota[offer.id] || 0) < offer.perCardMonthly],
    ['Order is within their limit', c => c.maxOrder >= amount],
    ['Reward meets their minimum', c => commission >= c.minCommission],
  ];
  let list = pool.slice(); const funnel = [{ label: 'All helpers', count: list.length }];
  for (const [label, fn] of steps) { list = list.filter(fn); funnel.push({ label, count: list.length }); }
  return { list, funnel };
}
export function scoreCandidate(c, offer) {
  const reliability = c.accept, speed = 1 - Math.min(c.speedMin, 30) / 30, fairness = Math.min(c.lastJobMins / 240, 1);
  const quotaLeft = (offer.perCardMonthly - (c.quota[offer.id] || 0)) / offer.perCardMonthly;
  const score = 0.4 * reliability + 0.25 * speed + 0.2 * fairness + 0.15 * quotaLeft;
  return { score: Math.round(score * 1000) / 1000, parts: { reliability, speed, fairness, quotaLeft } };
}
export function rankCandidates(list, offer) { return list.map(c => ({ c, ...scoreCandidate(c, offer) })).sort((a, b) => b.score - a.score); }
export function buildOptions(product, buyerCards, pool, voucher, buyerId) {
  const base = product.price - (voucher ? voucher.face : 0), extra = voucher ? voucher.price : 0, opts = [];
  for (const offer of OFFERS.filter(o => o.merchant === product.merchant)) {
    const calc = computeOffer(offer, base, product.id, TODAY);
    if (!calc.applicable) continue;
    const o = { offer, calc, base, route: 'none', buyerSaves: 0, buyerPays: base + extra, split: null, supply: 0, reason: calc.reason };
    if (calc.eligible) {
      const own = buyerCards.some(k => k.bank === offer.bank && k.type === offer.type);
      if (own) { o.route = 'own'; o.buyerSaves = calc.discount; o.buyerPays = base - calc.discount + extra; o.reason = ''; }
      else if (offer.type === 'debit') { o.reason = 'Debit-card offers only work with your own card. Helpers use credit cards for now.'; }
      else if (calc.discount < MIN_MATCH) { o.reason = `A saving under ${fmt(MIN_MATCH)} is too small to share with a helper`; }
      else {
        o.route = 'match'; o.split = splitDiscount(calc.discount); o.buyerSaves = o.split.buyer;
        o.buyerPays = base - o.split.buyer + extra; o.cardholderPays = base - calc.discount;
        o.supply = eligibleCardholders(pool, offer, product.merchant, o.cardholderPays, o.split.card, buyerId).list.length;
        o.reason = o.supply ? '' : 'No helper with this card is online right now';
      }
    }
    opts.push(o);
  }
  const usable = o => o.route === 'own' || (o.route === 'match' && o.supply > 0);
  const key = o => (usable(o) ? 0 : o.route === 'match' ? 1e9 : 2e9) + o.buyerPays - (o.route === 'own' ? 0.5 : 0);
  opts.sort((a, b) => key(a) - key(b));
  return { opts, best: opts.find(usable) || null, base, usable };
}
export function verifyOrder({ merchant, orderId, paid, expected, cardBank, offerBank, addressOk }) {
  const pat = merchant === 'Flipkart' ? /^OD\d{18}$/ : /^\d{3}-\d{7}-\d{7}$/;
  const diff = Math.round(paid - expected);
  const checks = [
    { label: 'The order number looks like a real ' + merchant + ' order', pass: pat.test(String(orderId || '').trim()), detail: merchant === 'Flipkart' ? 'Flipkart order numbers start with OD and have 18 digits' : 'Amazon order numbers look like 403-1234567-1234567' },
    { label: 'Paid with ' + aBank(offerBank) + ' card', pass: cardBank === offerBank, detail: 'The offer only works with ' + aBank(offerBank) + ' card' },
    { label: "Sent to the shopper's address", pass: !!addressOk, detail: "Tick the box once you've used the shopper's address" },
    { label: 'The amount matches what we quoted', pass: !isNaN(diff) && diff <= 10, detail: isNaN(diff) ? 'Enter the amount you paid' : Math.abs(diff) <= 10 ? 'Within ₹10 of ' + fmt(expected) : diff > 0 ? fmt(diff) + ' more than quoted. We will ask the shopper first.' : fmt(-diff) + ' less than quoted. The difference goes back to the shopper.' },
  ];
  const hardFail = checks.slice(0, 3).some(c => !c.pass) || isNaN(diff) || !(paid > 0);
  return { checks, diff, outcome: hardFail ? 'failed' : diff > 10 ? 'price_changed' : 'verified' };
}
export function dueDateFor(purchase, dueDay) { return new Date(purchase.getFullYear(), purchase.getMonth() + 1, dueDay); }
export function payoutDate(delivered, returnDays, due) {
  const normal = addDays(delivered, returnDays + 1), latest = addDays(due, -2), floor = addDays(delivered, 1);
  let date = normal, early = false;
  if (normal > latest) { date = latest < floor ? floor : latest; early = true; }
  return { date, early, beforeDue: date < due };
}
export function refundOnCancel(order) {
  if (order.status === 'settled' || order.status === 'refunded') return { allowed: false };
  return { allowed: true, buyerRefund: order.buyerPays, commission: 0, instant: true };
}
export const daysLeft = (v, today) => Math.round((parseD(v.expires) - today) / 864e5);
export const voucherTitle = v => v.kind === 'gift' ? `Gift card · ${fmt(v.face)} balance` : `${fmt(v.face)} off` + (v.minOrder ? ` on ${fmt(v.minOrder)}+` : '');
export const marketVouchers = (list, today) => list.filter(v => v.status === 'listed' && daysLeft(v, today) >= 0);
export function voucherApplicable(v, brand, cart, today) {
  if (daysLeft(v, today) < 0) return { ok: false, reason: 'Expired' };
  if (brand && v.brand !== brand) return { ok: false, reason: 'Different store' };
  if (cart < v.minOrder) return { ok: false, reason: 'Needs a ' + fmt(v.minOrder) + '+ order' };
  return { ok: true, reason: 'Works on your order' };
}
export function suggestPrice(v, today) {
  const dl = daysLeft(v, today), decay = dl <= 2 ? 0.5 : dl <= 7 ? 0.8 : 1;
  const p = v.kind === 'gift' ? Math.min(v.face * 0.92 * decay, v.face * 0.97) : v.face * 0.30 * (DEMAND[v.brand] || 0.8) * decay;
  return Math.max(10, Math.round(p / 5) * 5);
}
export const voucherFee = (v, price) => v.kind === 'gift' ? Math.max(5, Math.round(price * 0.03)) : Math.max(5, Math.round(price * 0.15));
export function validateListing(v, market, today) {
  const errs = [];
  if (!v.code || v.code.trim().length < 6) errs.push('Enter the full code (6 or more characters).');
  if (!(v.face > 0)) errs.push('Enter how much the code is worth.');
  if (!v.expires) errs.push('Add the expiry date.');
  else if (daysLeft(v, today) < 0) errs.push("This code has expired, so it can't be sold.");
  if (v.code && market.some(m => m.code.trim().toUpperCase() === v.code.trim().toUpperCase())) errs.push('This code is already listed. Each code can be sold once.');
  return errs;
}
export function resolveVoucher(p, worked) {
  if (worked) return { buyerRefund: 0, sellerPayout: p.paid - p.fee, platform: p.fee, strike: false };
  return { buyerRefund: p.paid, sellerPayout: 0, platform: 0, strike: true };
}
export function parseLink(raw) {
  const s = (raw || '').trim().toLowerCase();
  if (!s) return { error: 'Paste a product link first, or pick one of the products below.' };
  const merchant = /flipkart\.com/.test(s) ? 'Flipkart' : /amazon\.in|amzn\.in|amazon\.com/.test(s) ? 'Amazon' : null;
  if (!merchant) return { error: 'This demo works with Flipkart and Amazon links. Paste one of those, or pick a product below.' };
  const p = PRODUCTS.find(p => p.merchant === merchant && p.keys.some(k => s.includes(k)));
  if (!p) return { error: `We don't have this ${merchant} product in the demo yet. Pick one of the products below.` };
  return { product: p };
}
