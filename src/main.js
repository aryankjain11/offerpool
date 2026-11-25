// OfferPool: UI, simulated marketplace and event handling
import './styles.css';
import { TODAY, MIN_MATCH, RETURN_DAYS, ACCEPT_SECONDS, SPLIT, fmt, parseD, addDays, fdate, esc, clone, clock, bankTag, aBank, ord } from './utils.js';
import { PRODUCTS, OFFERS, BANKS, INITIAL_ME, INITIAL_POOL, INITIAL_VOUCHERS, SCANNED_SAMPLE, DEMAND } from './data.js';
import { offerById, productById, offerLabel, cardName, computeOffer, offerMath, splitDiscount, eligibleCardholders, scoreCandidate, rankCandidates, buildOptions, verifyOrder, dueDateFor, payoutDate, refundOnCancel, daysLeft, voucherTitle, marketVouchers, voucherApplicable, suggestPrice, voucherFee, validateListing, resolveVoucher, parseLink } from './logic.js';
import { chk, EVALS, runEvals } from './evals.js';

const ICONS = {
  bag: '<path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14.5h2"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M14 7.5v1.5M14 11.2v1.6M14 15v1.5"/>',
  flow: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M8.2 6h7.6M7.2 8l3.6 8M16.8 8l-3.6 8"/>',
  checkc: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-5.2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.2 3 7.6 7 9.5 4-1.9 7-5.3 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h3"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
  scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7 12h10"/>',
  ext: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.2"/>',
  spark: '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6.3 6.3l2.6 2.6M15.1 15.1l2.6 2.6M17.7 6.3l-2.6 2.6M8.9 15.1l-2.6 2.6"/>',
  refund: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  truck: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  hands: '<path d="M7 12.5 10 9.5a2 2 0 0 1 2.8 0l.7.7M17 12.5 14 15.5a2 2 0 0 1-2.8 0l-.7-.7"/><path d="M3 11l4 4M21 13l-4-4"/>',
};
const icon = n => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const swapIcons = (a, b) => `<span class="icons"><span class="ia">${icon(a)}</span><span class="ib">${icon(b)}</span></span>`;
const ART = {
  phone: '<rect x="34" y="7" width="28" height="58" rx="6"/><path d="M44 12.5h8"/><circle cx="40" cy="14" r="1.8"/><circle cx="40" cy="20" r="1.8"/>',
  laptop: '<rect x="22" y="13" width="52" height="34" rx="3"/><rect x="27" y="18" width="42" height="24" rx="1"/><path d="M13 53h70l-5 6H18z"/>',
  ac: '<rect x="10" y="16" width="76" height="26" rx="6"/><path d="M16 34h64M70 23h8"/><path d="M28 48c3 4 3 8 0 12M48 48c3 4 3 8 0 12M68 48c3 4 3 8 0 12"/>',
  headphones: '<path d="M25 46V37a23 23 0 0 1 46 0v9"/><rect x="18" y="41" width="13" height="20" rx="5.5"/><rect x="65" y="41" width="13" height="20" rx="5.5"/>',
  earbuds: '<rect x="28" y="32" width="40" height="28" rx="13"/><path d="M28 43h40"/><circle cx="40" cy="20" r="6"/><path d="M40 26v6"/><circle cx="56" cy="20" r="6"/><path d="M56 26v6"/>',
};
const art = k => `<svg viewBox="0 0 96 72" aria-hidden="true"><rect width="96" height="72" fill="#ffffff"/><g fill="none" stroke="#1d2a33" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ART[k]}</g></svg>`;

/* ---------- state ---------- */
let S;
function freshState() {
  return {
    view: 'shop', linkInput: '', linkError: '', analysis: null, sheet: null,
    buyer: { id: 'riya', name: 'Riya', cards: [{ bank: 'ICICI', type: 'credit' }, { bank: 'SBI', type: 'debit' }], address: 'Riya Sharma\n14, 2nd Cross, Indiranagar, Bengaluru 560038\n+91 98450 12345' },
    me: clone(INITIAL_ME), pool: clone(INITIAL_POOL), vouchers: clone(INITIAL_VOUCHERS),
    orders: [], vbuys: [], log: [], seq: 1042, vseq: 1, scanned: null, vTab: 'buy', vf: { brand: '', cart: '' }, sellErrors: [], sellerStrikes: {},
    settings: { preferMe: false, sayNo: false, priceChange: false }, stats: { platform: 0, voucher: 0 },
    ui: { guideHidden: readPref('guideHidden') === '1', open: {}, earnTab: 'cards' },
  };
}
function readPref(k) { try { return localStorage.getItem('offerpool.' + k); } catch (e) { return null; } }
function writePref(k, v) { try { localStorage.setItem('offerpool.' + k, v); } catch (e) { } }
S = freshState();
const fullPool = () => [S.me, ...S.pool];
const basePool = () => clone([INITIAL_ME, ...INITIAL_POOL]);
const findCh = id => fullPool().find(c => c.id === id);
const chName = id => id === 'me' ? 'Kabir (you)' : (findCh(id) || {}).name;
function log(orderId, text, kind = '') { S.log.unshift({ t: clock(), order: orderId, text, kind }); if (S.log.length > 200) S.log.pop(); }
function tl(order, text) { order.timeline.push({ t: clock(), text }); }
let toastTimer;
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.hidden = true, 3400); }

/* ---------- marketplace engine (simulated) ---------- */
function currentChoice() {
  const a = S.analysis; if (!a) return null;
  const p = productById(a.pid);
  const v = a.voucherId ? S.vouchers.find(x => x.id === a.voucherId && x.status === 'listed') : null;
  const r = buildOptions(p, S.buyer.cards, fullPool(), v, S.buyer.id);
  const o = r.opts.find(x => x.offer.id === a.choice && r.usable(x)) || r.best;
  return { p, v, r, o };
}
function placeOrder({ forceMe = false } = {}) {
  const ch = currentChoice(); if (!ch) return null;
  const { p, v, o } = ch;
  if (!o || o.route !== 'match' || !o.supply) { toast('Choose an offer that a helper can take.'); return null; }
  const addr = (S.buyer.address || '').trim();
  if (addr.length < 15) { toast('Add your full delivery address first.'); return null; }
  if (v) v.status = 'sold';
  const order = {
    id: 'OP-' + (S.seq++), createdAt: Date.now(), pid: p.id, art: p.art, name: p.name, merchant: p.merchant, price: p.price,
    offerId: o.offer.id, offerBank: o.offer.bank, offerText: `${o.offer.bank} credit card offer (${offerLabel(o.offer)})`,
    voucher: v ? { id: v.id, code: v.code, face: v.face, price: v.price, title: voucherTitle(v) } : null,
    base: o.base, discount: o.calc.discount, split: o.split, buyerPays: o.buyerPays, cardholderPays: o.cardholderPays,
    address: addr, status: 'matching', queue: [], offeredTo: null, fulfillerId: null, timeline: [],
  };
  S.orders.unshift(order);
  tl(order, `You paid ${fmt(order.buyerPays)} by UPI. OfferPool is holding it safely until your order arrives.`);
  log(order.id, `New order: ${p.name} on ${p.merchant}. ${order.offerText}. Helper will pay ${fmt(order.cardholderPays)}.`);
  const offer = offerById(order.offerId);
  const el = eligibleCardholders(fullPool(), offer, order.merchant, order.cardholderPays, order.split.card, S.buyer.id);
  order.funnel = el.funnel;
  log(order.id, 'Who can help: ' + el.funnel.map(f => `${f.label} (${f.count})`).join(' → '));
  const ranked = rankCandidates(el.list, offer);
  order.ranked = ranked.map(x => ({ id: x.c.id, name: chName(x.c.id), score: x.score }));
  let q = ranked.map(x => x.c.id);
  if (ranked.length) log(order.id, 'Ranked: ' + ranked.map(x => `${chName(x.c.id)} ${x.score.toFixed(2)}`).join(', '));
  if ((forceMe || S.settings.preferMe) && q.includes('me')) { q = ['me', ...q.filter(id => id !== 'me')]; log(order.id, 'Demo: this request goes to Kabir (you) first.'); }
  else q = q.filter(id => id !== 'me').concat(q.includes('me') ? ['me'] : []);
  order.queue = q; S.analysis = null; S.linkInput = '';
  offerNext(order);
  return order;
}
function offerNext(order) {
  const nextId = order.queue.shift();
  if (!nextId) {
    order.status = 'refunded'; order.offeredTo = null;
    order.refund = { amount: order.buyerPays, reason: 'No helper with this card could take it right now' };
    if (order.voucher) { const v = S.vouchers.find(x => x.id === order.voucher.id); if (v) v.status = 'listed'; }
    tl(order, `No helper could take it. ${fmt(order.buyerPays)} went back to your UPI account.`);
    log(order.id, 'Nobody left to ask. Full refund sent.', 'bad');
    render(); return;
  }
  order.offeredTo = nextId; order.status = 'offered';
  if (nextId === 'me') {
    tl(order, 'Asked Kabir (you, in the Earn tab) to place it.');
    if (S.me.autoAccept) { log(order.id, 'Kabir (you) accepts matching requests automatically.'); acceptJob(order, 'me'); return; }
    order.deadline = Date.now() + ACCEPT_SECONDS * 1000;
    log(order.id, `Request sent to Kabir (you). ${ACCEPT_SECONDS} s to accept.`);
    render(); return;
  }
  const c = findCh(nextId);
  tl(order, `Asked ${c.name} from ${c.city}, who has ${aBank(order.offerBank)} credit card.`);
  log(order.id, `Request sent to ${c.name} (${c.city}). Accepts ${Math.round(c.accept * 100)}% of requests.`);
  render();
  setTimeout(() => {
    if (order.status !== 'offered' || order.offeredTo !== nextId) return;
    if (!S.settings.sayNo || Math.random() < c.accept) acceptJob(order, nextId);
    else { log(order.id, `${c.name} said no.`, 'warn'); tl(order, `${c.name} couldn't take it. Asking the next helper.`); offerNext(order); }
  }, 1500 + Math.random() * 900);
}
function acceptJob(order, id) {
  const c = findCh(id);
  order.fulfillerId = id; order.offeredTo = null; order.status = 'accepted'; order.acceptedAt = Date.now();
  c.lastJobMins = 0;
  const card = c.cards.find(k => k.bank === order.offerBank && k.type === 'credit');
  order.cardDueDay = card ? card.dueDay : 15;
  order.fulfillerName = id === 'me' ? 'Kabir (you)' : `${c.name} from ${c.city}`;
  order.fulfillerMeta = `${c.rating}★ · ${c.jobs} orders placed`;
  tl(order, `${id === 'me' ? 'Kabir' : c.name} (${c.rating}★) said yes and is ordering it on ${order.merchant}.`);
  log(order.id, `${chName(id)} accepted after ${Math.round((order.acceptedAt - order.createdAt) / 1000)} s.`, 'good');
  if (id !== 'me') setTimeout(() => botPlace(order), 2200);
  render();
}
function genOrderId(m) { const d = n => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join(''); return m === 'Flipkart' ? 'OD' + d(18) : '40' + d(1) + '-' + d(7) + '-' + d(7); }
function botPlace(order) {
  if (order.status !== 'accepted') return;
  const expected = order.cardholderPays, bump = S.settings.priceChange; S.settings.priceChange = false;
  const paid = bump ? expected + 1200 : expected, oid = genOrderId(order.merchant);
  applyVerification(order, verifyOrder({ merchant: order.merchant, orderId: oid, paid, expected, cardBank: order.offerBank, offerBank: order.offerBank, addressOk: true }), paid, oid);
  render();
}
function applyVerification(order, res, paid, oid) {
  order.verification = res;
  if (res.outcome === 'failed') { log(order.id, 'Order check failed: ' + res.checks.filter(c => !c.pass).map(c => c.label).join('; '), 'bad'); return false; }
  order.merchantOrderId = oid; order.paid = paid;
  const c = findCh(order.fulfillerId); c.quota[order.offerId] = (c.quota[order.offerId] || 0) + 1;
  if (res.outcome === 'price_changed') {
    order.status = 'price_check'; order.priceDelta = res.diff;
    tl(order, `${order.merchant}'s price went up by ${fmt(res.diff)}. Waiting for your OK.`);
    log(order.id, `Price went up by ${fmt(res.diff)}. Asking the shopper first.`, 'warn');
  } else {
    if (res.diff < -10) { order.buyerPays += res.diff; order.cardholderPays = paid; tl(order, `The price dropped by ${fmt(-res.diff)}. That goes back to you.`); }
    order.status = 'placed';
    tl(order, `Order placed on ${order.merchant} with the ${order.offerBank} offer. Order number ${oid}. We checked it: right card, right price, your address.`);
    log(order.id, `Order ${oid} checked and confirmed (4 of 4).`, 'good');
  }
  return true;
}
function advance(order, step) {
  if (step === 'ship' && order.status === 'placed') { order.status = 'shipped'; tl(order, `On its way. ${order.merchant} will text the delivery code to your phone.`); log(order.id, 'Shipped.'); }
  else if (step === 'deliver' && order.status === 'shipped') {
    order.status = 'delivered'; order.deliveredOn = addDays(TODAY, 3);
    const due = dueDateFor(TODAY, order.cardDueDay);
    order.payout = payoutDate(order.deliveredOn, RETURN_DAYS, due); order.due = due;
    tl(order, `Delivered on ${fdate(order.deliveredOn)}. You can return it until ${fdate(addDays(order.deliveredOn, RETURN_DAYS))}.`);
    log(order.id, `Delivered. Helper gets paid on ${fdate(order.payout.date)}${order.payout.early ? ' (early, so it lands before their card bill)' : ''}; their bill is due ${fdate(due)}.`);
  } else if (step === 'settle' && order.status === 'delivered') {
    order.status = 'settled';
    tl(order, `Return period over. All done. You saved ${fmt(order.price - order.buyerPays)}, and the helper was paid back ${fmt(order.cardholderPays + order.split.card)}.`);
    log(order.id, `Complete: ${fmt(order.cardholderPays)} paid back + ${fmt(order.split.card)} reward to ${chName(order.fulfillerId)}; ${fmt(order.split.platform)} OfferPool fee.`, 'good');
    S.stats.platform += order.split.platform;
    if (order.fulfillerId === 'me') { S.me.earnings.commission += order.split.card; S.me.earnings.points += Math.round(order.cardholderPays * 0.02); S.me.milestone.spent += order.cardholderPays; S.me.jobs++; }
  }
  render();
}
function cancelOrder(order, why) {
  const r = refundOnCancel(order); if (!r.allowed) return;
  const placed = !!order.merchantOrderId;
  order.status = 'refunded';
  const reasons = { cancel: 'You cancelled the order', return: 'You returned the item', price: "You didn't accept the higher price" };
  order.refund = { amount: r.buyerRefund, reason: reasons[why] };
  tl(order, `${reasons[why]}. ${fmt(r.buyerRefund)} went straight back to you.` + (placed ? ` ${order.merchant} refunds the helper's card, and they get no reward.` : ''));
  log(order.id, `${reasons[why]}. Shopper refunded ${fmt(r.buyerRefund)} at once; no reward paid.`, 'warn');
  render();
}

/* ---------- shared bits ---------- */
const STATUS = {
  matching: ['Finding a helper', 'info'], offered: ['Finding a helper', 'info'], accepted: ['Helper is ordering', 'info'],
  price_check: ['Needs your OK', 'warn'], placed: ['Order placed', 'good'], shipped: ['On the way', 'good'], delivered: ['Delivered', 'good'],
  settled: ['Complete', 'gold'], refunded: ['Refunded', 'bad'],
};
const pill = (text, kind = '', ic = '') => `<span class="pill ${kind}">${ic ? icon(ic) : ''}${esc(text)}</span>`;
const statusPill = s => pill(STATUS[s][0], STATUS[s][1]);
const STAGES = ['Paid', 'Helper found', 'Ordered', 'On the way', 'Delivered', 'Done'];
const stageOf = s => ({ matching: 0, offered: 0, accepted: 1, price_check: 2, placed: 2, shipped: 3, delivered: 4, settled: 5 }[s] ?? -1);
const seam = () => `<svg class="seam" viewBox="0 0 520 28" preserveAspectRatio="none" aria-hidden="true"><path d="M0 18 L70 15 L104 23 L170 8 L214 17 L282 5 L320 15 L392 9 L430 20 L520 12"/><path d="M170 8 L188 1" style="stroke-width:1.1"/><path d="M320 15 L334 25" style="stroke-width:1.1"/></svg>`;
const intro = (ic, eyebrow, h1, lede) => `<section class="hero"><p class="eyebrow">${icon(ic)} ${eyebrow}</p><h1>${h1}</h1>${seam()}<p class="lede">${lede}</p></section>`;

function guideStep() {
  const live = S.orders.filter(o => !['settled', 'refunded'].includes(o.status));
  if (S.orders.some(o => o.status === 'offered' && o.offeredTo === 'me')) return { n: 4, title: 'A request is waiting for you', text: 'You sent an order to Kabir, the helper you play in Earn. Accept it there.', btn: 'Open Earn', go: 'earn' };
  if (S.orders.some(o => o.fulfillerId === 'me' && o.status === 'accepted')) return { n: 4, title: 'Place the order as Kabir', text: 'Press "Fill in sample details", then "Check my order".', btn: 'Open Earn', go: 'earn' };
  if (live.some(o => ['placed', 'shipped', 'delivered'].includes(o.status))) return { n: 4, title: 'Follow your order to your door', text: 'Use the demo shortcuts on your order to ship it, deliver it and finish the return period.', btn: 'Show my order', go: 'shop', scroll: 'orders' };
  if (S.orders.some(o => o.status === 'settled')) return { n: 5, title: 'Done. Now try the other side', text: 'See what it looks like for someone who has the card, or buy a coupon code.', btn: 'Open Earn', go: 'earn' };
  if (S.analysis) return { n: 2, title: 'Check your price, then continue', text: "We've picked the cheapest way to buy. Press Continue to pay.", btn: 'Show my price', go: 'shop', scroll: 'results' };
  return { n: 1, title: 'Pick something to buy', text: "We'll show what you'd pay with each bank offer.", btn: 'Try the iPhone 16', go: 'shop', sample: 'iphone16' };
}
function guideBar() {
  document.getElementById('showGuide').hidden = !S.ui.guideHidden;
  if (S.ui.guideHidden) return '';
  const g = guideStep();
  return `<aside class="guide" aria-label="Step-by-step guide">
    <span class="guide-ico">${icon('compass')}</span>
    <div class="guide-body"><span class="label">Guide · ${g.n <= 4 ? `step ${g.n} of 4` : 'complete'}</span><b>${esc(g.title)}</b><span class="meta">${esc(g.text)}</span></div>
    <div class="dots" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i < g.n ? 'done' : i === g.n ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary sm go" data-act="guide">${esc(g.btn)} ${icon('arrow')}</button>
    <button class="btn quiet sm icon-only hide" data-act="hideGuide" aria-label="Hide the guide">${icon('x')}</button>
  </aside>`;
}

/* ---------- shop ---------- */
function viewShop() {
  const cards = S.buyer.cards;
  return intro('bag', "Shopping · you're Riya", 'Bank offers, <em>unlocked</em>.',
    "Found a bank offer but don't have that bank's card? Someone who does will buy it for you, and you keep most of the discount.") + `
  <section class="panel finder" aria-label="Find a product">
    <form id="linkForm" class="searchbar" novalidate>
      ${icon('link')}<label for="link" class="sr">Product link</label>
      <input id="link" data-bound type="url" placeholder="Paste a Flipkart or Amazon product link" value="${esc(S.linkInput)}" autocomplete="off">
      <button class="btn primary" type="submit">Find my price ${icon('arrow')}</button>
    </form>
    <div class="finder-body">
      ${S.linkError ? `<p class="field-error">${icon('info')} ${esc(S.linkError)}</p>` : ''}
      <div class="between"><span class="label">Or pick a product to try</span><span class="meta">Scroll sideways for more</span></div>
      <div class="carousel" role="list">${PRODUCTS.map(p => `<button class="pcard ${S.analysis && S.analysis.pid === p.id ? 'on' : ''}" role="listitem" data-act="sample" data-id="${p.id}">
        <span class="ptile">${art(p.art)}</span><span class="pname">${esc(p.title)}</span><span class="meta">${p.merchant} · ${fmt(p.price)}</span></button>`).join('')}</div>
      <details class="mycards" data-ui="cards" ${S.ui.open.cards ? 'open' : ''}>
        <summary>${icon('card')} <span>Cards you have: <b>${cards.length ? cards.map(k => `${esc(k.bank)} ${k.type}`).join(', ') : 'none'}</b></span> <span class="edit">Change</span></summary>
        <div class="sub"><span class="meta">If one of your own cards already gets an offer, we'll tell you to just use it. No fee.</span>
          <div class="row">${cards.map((k, i) => `<span class="chip">${esc(k.bank)} ${k.type}<button data-act="rmBuyerCard" data-i="${i}" aria-label="Remove ${esc(k.bank)} ${k.type}">${icon('x')}</button></span>`).join('')}</div>
          <div class="row"><label class="sr" for="nb-bank">Bank</label><select id="nb-bank" style="width:auto">${BANKS.map(b => `<option>${b}</option>`).join('')}</select>
            <label class="sr" for="nb-type">Card type</label><select id="nb-type" style="width:auto"><option value="credit">Credit</option><option value="debit">Debit</option></select>
            <button class="btn sm" data-act="addBuyerCard">Add card</button></div></div>
      </details>
    </div>
  </section>
  ${S.analysis ? resultsBlock() : `<ol class="how" aria-label="How it works">
    <li><span class="n">1</span><b>Pick a product</b><span>We show what you'd pay with each bank offer.</span></li>
    <li><span class="n">2</span><b>Pay OfferPool</b><span>We hold your money safely until your order arrives.</span></li>
    <li><span class="n">3</span><b>A helper buys it for you</b><span>Someone with the right card orders it to your address.</span></li>
    <li><span class="n">4</span><b>You save</b><span>It arrives with the discount. Full refund if anything goes wrong.</span></li></ol>`}
  ${ordersBlock()}`;
}
function resultsBlock() {
  const a = S.analysis, ch = currentChoice(), { p, v, r, o } = ch;
  const vlist = marketVouchers(S.vouchers, TODAY).filter(x => x.brand === p.merchant && voucherApplicable(x, p.merchant, p.price, TODAY).ok);
  const good = r.opts.filter(r.usable), bad = r.opts.filter(x => !r.usable(x));
  const vSave = v ? v.face - v.price : 0;
  const others = good.filter(x => x !== o);
  const head = `<div class="results-head"><span class="mini-tile">${art(p.art)}</span><div><span class="label">${esc(p.merchant)} · ${fmt(p.price)}</span><h2>${esc(p.name)}</h2></div></div>`;
  let main;
  if (!o) {
    main = `<div class="callout warn"><b>${icon('alert')} None of the bank offers work for this order right now.</b><span>${bad.length ? 'See why below.' : 'No bank offer applies at this price.'}${vlist.length ? ' A coupon code from another shopper can still cut the price.' : ''}</span></div>`;
  } else {
    const isBest = o === r.best;
    const save = p.price - o.buyerPays;
    main = `<div class="best">
      <span class="tag">${isBest ? 'Your best price' : 'Your choice'}</span>
      <div class="bigpay"><span class="now">${fmt(o.buyerPays)}</span><span class="was">${fmt(p.price)}</span>${pill('You save ' + fmt(save), 'good', 'check')}</div>
      ${o.route === 'own'
        ? `<p class="how-line">${icon('card')}<span>Your own <b>${esc(cardName(o.offer))}</b> gets this offer (${esc(offerLabel(o.offer))}). Buy it straight from ${esc(p.merchant)}. There's nothing to pay us.</span></p>`
        : `<p class="how-line">${icon('card')}<span>Uses the <b>${esc(cardName(o.offer))} offer</b> (${esc(offerLabel(o.offer))}). You don't need the card.</span></p>
           <p class="how-line">${icon('hands')}<span>A verified helper who has the card orders it for you, delivered to your address. <b>${o.supply} ${o.supply === 1 ? 'helper is' : 'helpers are'} available now.</b></span></p>`}
      ${o.route === 'own'
        ? `<a class="btn primary wide" href="https://www.${p.merchant === 'Flipkart' ? 'flipkart.com/search?q=' : 'amazon.in/s?k='}${encodeURIComponent(p.name)}" target="_blank" rel="noopener">Buy it on ${esc(p.merchant)} ${icon('ext')}</a>`
        : `<button class="btn primary wide" data-act="openCheckout">Continue to pay ${fmt(o.buyerPays)} ${icon('arrow')}</button>`}
      ${o.route === 'match' ? `<details class="breakdown" data-ui="breakdown" ${S.ui.open.breakdown ? 'open' : ''}><summary><span>How is this price worked out?</span>${icon('chev')}</summary>${priceBreakdown(p, o, v)}</details>` : ''}
    </div>`;
  }
  const addon = vlist.length ? vlist.map(x => `<label class="addon"><input type="checkbox" data-act="pickVoucher" data-id="${x.id}" ${a.voucherId === x.id ? 'checked' : ''}><span class="stack" style="gap:2px"><b>Save ${fmt(x.face - x.price)} more with a coupon code</b><span class="meta">Another shopper is selling a ${esc(voucherTitle(x))} ${esc(p.merchant)} code${x.note ? ' (' + esc(x.note.toLowerCase()) + ')' : ''} for ${fmt(x.price)}. We add it to your order.</span></span></label>`).join('') : '';
  const othersBlock = others.length ? `<details class="more" data-ui="others" ${S.ui.open.others ? 'open' : ''}><summary><span>${others.length} other way${others.length > 1 ? 's' : ''} to pay</span>${icon('chev')}</summary><div class="rows">
      ${others.map(x => `<label class="opt"><input type="radio" name="opt" value="${x.offer.id}" aria-label="Use the ${esc(cardName(x.offer))} offer"><span class="bank" aria-hidden="true">${bankTag(x.offer.bank)}</span>
        <span class="opt-main"><span class="opt-title">${esc(cardName(x.offer))} · ${esc(offerLabel(x.offer))}</span><span class="meta">${esc(offerMath(x.offer, x.base, x.calc))}</span>
        <span>${x.route === 'own' ? pill('Your own card · no fee', 'good', 'check') : pill(`${x.supply} helper${x.supply > 1 ? 's' : ''} available`, 'info', 'user')}</span></span>
        <span class="opt-num"><span class="pay">${fmt(x.buyerPays)}</span><span class="save">save ${fmt(x.buyerSaves + vSave)}</span></span></label>`).join('')}</div></details>` : '';
  const badBlock = bad.length ? `<details class="more" data-ui="bad" ${S.ui.open.bad || !o ? 'open' : ''}><summary><span>${bad.length} offer${bad.length > 1 ? 's' : ''} that won't work for this order</span>${icon('chev')}</summary><div class="rows">
      ${bad.map(x => `<div class="opt off"><span class="bank">${bankTag(x.offer.bank)}</span><span class="opt-main"><span class="opt-title">${esc(cardName(x.offer))} · ${esc(offerLabel(x.offer))}</span><span class="meta">${esc(x.reason)}</span></span></div>`).join('')}</div></details>` : '';
  const vOnly = !o && v ? `<div class="best"><span class="tag">With the coupon code</span><div class="bigpay"><span class="now">${fmt(p.price - v.face + v.price)}</span><span class="was">${fmt(p.price)}</span></div><button class="btn primary wide" data-act="buyVoucher" data-id="${v.id}">Buy the code for ${fmt(v.price)}</button><p class="meta">Then use it at your own ${esc(p.merchant)} checkout.</p></div>` : '';
  return `<section class="focus-col" id="results" aria-label="Your price for ${esc(p.name)}">${head}${main}${vOnly}${addon}${othersBlock}${badBlock}
    <p class="meta">Sample offers. A real version would read ${esc(p.merchant)}'s offer page and each bank's terms.</p></section>`;
}
function priceBreakdown(p, o, v) {
  const s = o.split, d = o.calc.discount, pc = x => Math.round(x / d * 100);
  return `<div class="receipt">
      <div class="ln"><span>Price on ${esc(p.merchant)}</span><span>${fmt(p.price)}</span></div>
      ${v ? `<div class="ln"><span>Coupon code</span><span>${fmt(-v.face)}</span></div>` : ''}
      <div class="ln"><span>${esc(o.offer.bank)} card discount</span><span>${fmt(-d)}</span></div>
      <div class="rule"></div>
      <div class="ln"><span>Helper pays ${esc(p.merchant)}</span><span>${fmt(o.cardholderPays)}</span></div>
      <div class="ln sub2"><span>+ helper's reward</span><span>${fmt(s.card)}</span></div>
      <div class="ln sub2"><span>+ OfferPool fee</span><span>${fmt(s.platform)}</span></div>
      ${v ? `<div class="ln sub2"><span>+ coupon code price</span><span>${fmt(v.price)}</span></div>` : ''}
      <div class="rule"></div>
      <div class="ln tot"><span>You pay</span><span>${fmt(o.buyerPays)}</span></div>
    </div>
    <div class="stack" style="gap:8px;margin-top:12px"><span class="meta">The ${fmt(d)} discount is shared: you keep ${pc(s.buyer)}%, the helper gets ${pc(s.card)}% for placing your order, and OfferPool keeps ${pc(s.platform)}%.</span>
    <div class="splitbar" role="img" aria-label="Discount split: you ${pc(s.buyer)}%, helper ${pc(s.card)}%, OfferPool ${pc(s.platform)}%"><span style="width:${pc(s.buyer)}%"></span><span style="width:${pc(s.card)}%"></span><span style="width:${pc(s.platform)}%"></span></div>
    <div class="legend"><span><i style="background:var(--good)"></i>You ${fmt(s.buyer)}</span><span><i style="background:var(--gold)"></i>Helper ${fmt(s.card)}</span><span><i style="background:var(--text-3)"></i>OfferPool ${fmt(s.platform)}</span></div></div>`;
}

/* ---------- checkout sheet ---------- */
function sheetView() {
  const sh = S.sheet; if (!sh) return '';
  let title = '', body = '';
  if (sh.mode === 'checkout') {
    const ch = currentChoice();
    if (!ch || !ch.o || ch.o.route !== 'match') { S.sheet = null; return ''; }
    const { p, v, o } = ch;
    title = 'Pay for your order';
    body = `<div class="results-head"><span class="mini-tile">${art(p.art)}</span><div><h3>${esc(p.name)}</h3><span class="meta">${esc(p.merchant)} · with the ${esc(cardName(o.offer))} offer</span></div></div>
      <div class="stack" style="gap:8px">
        <div class="sumline"><span>Price on ${esc(p.merchant)}</span><span>${fmt(p.price)}</span></div>
        <div class="sumline green"><span>Your saving</span><span>${fmt(o.buyerPays - p.price)}</span></div>
        <div class="sumline tot"><span>You pay</span><span>${fmt(o.buyerPays)}</span></div>
      </div>
      <div class="field"><label for="addr">Deliver to</label><textarea id="addr" data-bound rows="3">${esc(S.buyer.address)}</textarea><span class="meta">Your helper sees this only after saying yes, so they can send it to you.</span></div>
      <div class="sub"><div class="between"><span><b>UPI</b> <span class="meta">· riya@okbank (demo)</span></span>${pill('Demo payment', 'gold')}</div></div>
      <div class="trust">${icon('shield')}<span>Your money is safe. OfferPool holds it and only pays the helper after your item arrives and the return period ends. If no helper can take it, you get every rupee back.</span></div>
      <button class="btn primary wide" data-act="pay">Pay ${fmt(o.buyerPays)}</button>`;
  } else {
    const o = S.orders.find(x => x.id === sh.orderId); if (!o) { S.sheet = null; return ''; }
    const helperStep = o.fulfillerId ? 'done' : (['matching', 'offered'].includes(o.status) ? 'now' : 'todo');
    const orderStep = ['placed', 'shipped', 'delivered', 'settled'].includes(o.status) ? 'done' : o.status === 'accepted' ? 'now' : o.status === 'price_check' ? 'now' : 'todo';
    if (o.status === 'refunded') {
      title = 'We couldn’t place this order';
      body = `<div class="callout bad"><b>${icon('refund')} ${fmt(o.refund.amount)} is back in your account.</b><span>${esc(o.refund.reason)}. Nothing was charged.</span></div>
        <button class="btn primary wide" data-act="retry" data-pid="${o.pid}">Choose another way to pay</button>
        <button class="btn quiet" data-act="closeSheet">Close</button>`;
    } else if (['placed', 'shipped', 'delivered', 'settled'].includes(o.status)) {
      title = '';
      body = `<div class="success"><span class="seal">${icon('check')}</span><h2>Your order is placed</h2>${seam()}
          <p class="lede" style="font-size:16px">You paid <b style="color:var(--text)">${fmt(o.buyerPays)}</b> instead of ${fmt(o.price)}. That's <b style="color:var(--good)">${fmt(o.price - o.buyerPays)} saved</b> with the ${esc(o.offerBank)} offer.</p></div>
        <div class="facts"><div><span>Product</span><span>${esc(o.name)}</span></div><div><span>${esc(o.merchant)} order number</span><span class="mono">${esc(o.merchantOrderId)}</span></div>
          <div><span>Ordered by</span><span>${esc(o.fulfillerName)} · ${esc(o.fulfillerMeta || '')}</span></div><div><span>Arrives by</span><span>${fdate(addDays(TODAY, 3))}</span></div></div>
        <ul class="next"><li>${icon('truck')}<span>${esc(o.merchant)} ships it to your address and texts you the delivery code.</span></li>
          <li>${icon('shield')}<span>We pay the helper only after it arrives and the 7-day return period ends.</span></li>
          <li>${icon('refund')}<span>If it doesn't arrive or you return it, you get your money back.</span></li></ul>
        <button class="btn primary wide" data-act="trackOrder">Track my order</button>
        <button class="btn quiet" data-act="shopMore">Buy something else</button>`;
    } else {
      title = 'Placing your order';
      const waitingMe = o.status === 'offered' && o.offeredTo === 'me';
      const helperText = o.fulfillerId ? `<b>${esc(o.fulfillerName)} said yes</b><span class="meta">${esc(o.fulfillerMeta || '')} · has ${esc(aBank(o.offerBank))} credit card</span>`
        : waitingMe ? `<b>Waiting for Kabir (you)</b><span class="meta">You asked to try the helper side. Accept it in Earn within <span class="mono" data-deadline="${o.deadline}">1:00</span>.</span>`
        : `<b>Finding a helper with ${esc(aBank(o.offerBank))} credit card</b><span class="meta">Usually takes a few seconds</span>`;
      const orderText = o.status === 'price_check' ? `<b>${esc(o.merchant)}'s price went up by ${fmt(o.priceDelta)}</b><span class="meta">Pay the difference to go ahead, or cancel and get all your money back.</span>`
        : orderStep === 'now' ? `<b>Ordering it on ${esc(o.merchant)} with the ${esc(o.offerBank)} offer</b><span class="meta">We check the order number, card, price and your address</span>`
        : `<b>Order it on ${esc(o.merchant)} with the ${esc(o.offerBank)} offer</b>`;
      const dot = st => st === 'done' ? icon('check') : st === 'now' ? '<span class="spin" aria-hidden="true"></span>' : '';
      body = `<div class="results-head"><span class="mini-tile">${art(o.art)}</span><div><h3>${esc(o.name)}</h3><span class="meta">You paid ${fmt(o.buyerPays)} · saving ${fmt(o.price - o.buyerPays)}</span></div></div>
        <ol class="prog" aria-live="polite">
          <li class="done"><span class="dot">${dot('done')}</span><span class="txt"><b>Payment received</b><span class="meta">${fmt(o.buyerPays)} held safely by OfferPool</span></span></li>
          <li class="${helperStep}"><span class="dot">${dot(helperStep)}</span><span class="txt">${helperText}</span></li>
          <li class="${orderStep}"><span class="dot">${dot(orderStep)}</span><span class="txt">${orderText}</span></li>
        </ol>
        ${o.status === 'price_check' ? `<div class="row"><button class="btn primary" data-act="priceOk" data-id="${o.id}">Pay ${fmt(o.priceDelta)} more</button><button class="btn" data-act="priceNo" data-id="${o.id}">Cancel and refund</button></div>` : ''}
        ${waitingMe ? `<button class="btn primary wide" data-act="toEarn">Open Earn to accept</button>` : ''}
        <div class="trust">${icon('shield')}<span>If no helper can take it, your money comes straight back.</span></div>`;
    }
  }
  return `<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title || 'Order placed')}">
    <div class="sheet-head">${title ? `<h2>${esc(title)}</h2>` : '<span></span>'}<button class="btn quiet icon-only" data-act="closeSheet" aria-label="Close">${icon('x')}</button></div>${body}</div></div>`;
}

function ordersBlock() {
  if (!S.orders.length) return '';
  return `<section class="stack" id="orders"><div class="between"><h2>Your orders</h2><span class="meta">${S.orders.length} so far</span></div>${S.orders.map(orderCard).join('')}</section>`;
}
function orderCard(o) {
  const st = stageOf(o.status), acts = [], user = [], demo = [];
  if (o.status === 'offered' && o.offeredTo === 'me') acts.push(`<div class="callout info"><span>${icon('clock')} This order is waiting for <b>Kabir</b>, the helper you play in Earn. Accept it there within <b class="mono" data-deadline="${o.deadline}">1:00</b>, or it goes to the next helper.</span><div><button class="btn sm primary" data-act="go" data-view="earn">Open Earn ${icon('arrow')}</button></div></div>`);
  if (o.status === 'price_check') acts.push(`<div class="callout warn"><b>${icon('alert')} ${esc(o.merchant)}'s price went up by ${fmt(o.priceDelta)}.</b><span>Pay the difference and the order goes ahead, or cancel and get all ${fmt(o.buyerPays)} back.</span><div class="row"><button class="btn sm primary" data-act="priceOk" data-id="${o.id}">Pay ${fmt(o.priceDelta)} more</button><button class="btn sm" data-act="priceNo" data-id="${o.id}">Cancel and refund</button></div></div>`);
  if (o.status === 'refunded') acts.push(`<div class="callout bad"><b>${icon('refund')} ${fmt(o.refund.amount)} refunded.</b><span>${esc(o.refund.reason)}.</span></div>`);
  if (o.status === 'settled') acts.push(`<div class="callout good"><b>${icon('spark')} All done. You saved ${fmt(o.price - o.buyerPays)}.</b></div>`);
  if (['offered', 'accepted', 'placed', 'shipped'].includes(o.status)) user.push(`<button class="btn sm danger" data-act="cancel" data-id="${o.id}">Cancel order</button>`);
  if (o.status === 'delivered') user.push(`<button class="btn sm danger" data-act="return" data-id="${o.id}">Return item</button>`);
  if (o.status === 'placed') demo.push(`<button class="btn sm demo" data-act="adv" data-step="ship" data-id="${o.id}">Ship it</button>`);
  if (o.status === 'shipped') demo.push(`<button class="btn sm demo" data-act="adv" data-step="deliver" data-id="${o.id}">Deliver it</button>`);
  if (o.status === 'delivered') demo.push(`<button class="btn sm demo" data-act="adv" data-step="settle" data-id="${o.id}">Skip the 7-day return period</button>`);
  const k = 'act:' + o.id;
  return `<article class="panel order">
    <div class="order-head"><div class="who"><span class="mini-tile">${art(o.art)}</span><div><h3>${esc(o.name)}</h3><span class="meta">${esc(o.merchant)} · ${esc(o.offerBank)} card offer${o.voucher ? ' + coupon code' : ''}${o.fulfillerName ? ' · ordered by ' + esc(o.fulfillerName) : ''}</span></div></div>
      <div class="amt">${statusPill(o.status)}<span class="num" style="font-weight:800;font-size:17px">${fmt(o.buyerPays)}</span><span class="meta">saved ${fmt(o.price - o.buyerPays)}</span></div></div>
    <ol class="tracker ${st < 0 ? 'off' : ''}" aria-label="Order progress">${STAGES.map((s, i) => `<li class="${st < 0 ? '' : i < st || (i === st && st === 5) ? 'done' : i === st ? 'now' : ''}" ${i === st ? 'aria-current="step"' : ''}>${s}</li>`).join('')}</ol>
    ${acts.join('')}
    ${user.length || demo.length ? `<div class="actions">${user.join('')}${demo.length ? '<span class="lbl">Demo shortcuts</span>' + demo.join('') : ''}</div>` : ''}
    <details class="activity" data-ui="${k}" ${S.ui.open[k] ? 'open' : ''}><summary>${icon('chev')} What's happened so far (${o.timeline.length})</summary>
      <ol class="timeline">${o.timeline.map(e => `<li><time>${e.t}</time>${esc(e.text)}</li>`).join('')}</ol></details>
  </article>`;
}

/* ---------- earn ---------- */
function viewEarn() {
  const me = S.me, ms = me.milestone, pct = Math.min(100, ms.spent / ms.target * 100);
  const incoming = S.orders.filter(o => o.status === 'offered' && o.offeredTo === 'me');
  const active = S.orders.filter(o => o.fulfillerId === 'me' && o.status === 'accepted');
  const tab = S.ui.earnTab;
  return intro('wallet', "Helping · you're Kabir", 'Earn from offers your cards <em>don’t use</em>.',
    "Shoppers without your bank's card send you order requests. You buy the item on your card and ship it to them. We pay you back with a reward, always before your card bill is due.") + `
  <section class="panel sm"><div class="between">
    <label class="toggle"><input type="checkbox" id="online" data-act="online" ${me.online ? 'checked' : ''}> <span>${me.online ? 'Available for requests' : 'Not taking requests'}</span></label>
    <span class="meta">${icon('user')} Kabir · ${me.city} · ${me.rating}★ · ${me.jobs} orders placed</span></div></section>
  <section class="grid3">
    <div class="tile"><span class="v gold">${fmt(me.earnings.commission)}</span><span class="k">Rewards earned this month</span></div>
    <div class="tile"><span class="v">${fmt(me.earnings.points)}</span><span class="k">Card reward points earned, roughly</span></div>
    <div class="tile"><div class="between"><span class="k">${esc(ms.label)}</span><span class="meta num">${Math.round(pct)}%</span></div><div class="meter" role="img" aria-label="${Math.round(pct)}% of spend target"><span style="width:${pct}%"></span></div><span class="k">Spend ${fmt(ms.target - ms.spent)} more and your card's yearly fee is waived. Orders you place here count.</span></div>
  </section>
  <section class="stack"><h2>Order requests</h2>
    ${incoming.map(jobOffer).join('')}${active.map(fulfilCard).join('')}
    ${!incoming.length && !active.length ? `<div class="empty">${icon('clock')}<b>${me.online ? 'No requests right now' : "You're not taking requests"}</b><span class="meta">${me.online ? 'Want to see how it works? Get a sample request from Riya.' : 'Switch on "Available for requests" to get them.'}</span>${me.online ? `<button class="btn outline sm" data-act="sampleRequest">Get a sample request ${icon('arrow')}</button>` : ''}</div>` : ''}
  </section>
  <section class="panel">
    <div class="seg" role="group" aria-label="Your settings">${[['cards', 'Your cards'], ['rules', 'Your preferences'], ['history', 'Past requests']].map(([k2, l]) => `<button aria-pressed="${tab === k2}" data-act="earnTab" data-tab="${k2}">${l}</button>`).join('')}</div>
    ${tab === 'cards' ? earnCards() : tab === 'rules' ? earnRules() : earnHistory()}
  </section>`;
}
function jobOffer(o) {
  const card = S.me.cards.find(k => k.bank === o.offerBank && k.type === 'credit') || { variant: 'card', dueDay: 15 };
  const due = dueDateFor(TODAY, card.dueDay), p = payoutDate(addDays(TODAY, 3), RETURN_DAYS, due);
  return `<div class="job" role="alert"><div class="between"><span class="eyebrow">${icon('spark')} New request · ${esc(o.merchant)}</span><span class="timer" data-deadline="${o.deadline}">1:00</span></div>
    <div style="display:flex;gap:14px;align-items:center"><span class="mini-tile">${art(o.art)}</span><h2>${esc(o.name)}</h2></div>
    <div class="kv"><div><span class="v">${fmt(o.cardholderPays)}</span><span class="k">You pay on your ${esc(o.offerBank)} ${esc(card.variant)}</span></div>
      <div><span class="v" style="color:var(--good)">+${fmt(o.split.card)}</span><span class="k">Your reward, plus about ${fmt(o.cardholderPays * 0.02)} in card points</span></div>
      <div><span class="v">${fdate(p.date)}</span><span class="k">You're paid back by this date, ${Math.round((due - p.date) / 864e5)} days before your bill is due</span></div></div>
    <div class="trust">${icon('shield')}<span>Riya has already paid ${fmt(o.buyerPays)} to OfferPool, so your money is covered. You'll see her address after you say yes.</span></div>
    <div class="row"><button class="btn primary" data-act="accept" data-id="${o.id}">Yes, I'll order it ${icon('check')}</button><button class="btn" data-act="decline" data-id="${o.id}">Not now</button></div></div>`;
}
function fulfilCard(o) {
  const card = S.me.cards.find(k => k.bank === o.offerBank && k.type === 'credit');
  const url = o.merchant === 'Flipkart' ? 'https://www.flipkart.com/search?q=' + encodeURIComponent(o.name) : 'https://www.amazon.in/s?k=' + encodeURIComponent(o.name);
  const v = o.verification;
  return `<div class="job"><div class="between"><span class="eyebrow">${icon('bag')} Order this for Riya</span>${pill('In progress', 'info')}</div><h2>${esc(o.name)}</h2>
    <ol class="steps">
      <li><div class="stack"><b>Open the product on ${esc(o.merchant)}</b><div><a class="btn sm" href="${url}" target="_blank" rel="noopener">Open ${esc(o.merchant)} ${icon('ext')}</a></div></div></li>
      <li><div class="stack"><b>Use Riya's address for delivery</b><div class="addr" id="addr-${o.id}">${esc(o.address)}</div><div><button class="btn sm swap" data-act="copyAddr" data-id="${o.id}">${swapIcons('copy', 'check')} Copy address</button></div></div></li>
      ${o.voucher ? `<li><div class="stack"><b>Add Riya's coupon code at checkout</b><div class="row"><span class="vcode open">${esc(o.voucher.code)}</span><span class="meta">${esc(o.voucher.title)}</span></div></div></li>` : ''}
      <li><div class="stack"><b>Pay with your ${esc(o.offerBank)} ${esc(card ? card.variant : '')} card</b><span class="meta">After the offer, it should cost <b class="num" style="color:var(--text)">${fmt(o.cardholderPays)}</b>. If ${esc(o.merchant)} shows something different, enter what you actually paid.</span></div></li>
      <li><div class="stack"><b>Tell us about the order</b>
        <div class="fgrid"><div class="field"><label for="f-oid-${o.id}">${esc(o.merchant)} order number</label><input id="f-oid-${o.id}" type="text" placeholder="${o.merchant === 'Flipkart' ? 'Starts with OD' : 'Like 403-…'}" autocomplete="off"></div>
          <div class="field"><label for="f-amt-${o.id}">Amount you paid (₹)</label><input id="f-amt-${o.id}" type="number"></div>
          <div class="field"><label for="f-card-${o.id}">Card you used</label><select id="f-card-${o.id}">${S.me.cards.map(k => `<option value="${esc(k.bank)}">${esc(k.bank)} ${esc(k.variant)}</option>`).join('')}</select></div></div>
        <label class="check"><input type="checkbox" id="f-addr-${o.id}"> I used Riya's address</label>
        <div class="row"><button class="btn primary" data-act="submitOrder" data-id="${o.id}">Check my order</button><button class="btn sm demo" data-act="fillSample" data-id="${o.id}">Fill in sample details</button><button class="btn sm demo" data-act="fillBad" data-id="${o.id}">Try a wrong order number</button></div>
        ${v ? `<ul class="checks">${v.checks.map(c => `<li><span class="${c.pass ? 'ok' : 'no'}">${icon(c.pass ? 'check' : 'x')}</span><span>${esc(c.label)}${c.pass ? '' : '. ' + esc(c.detail)}</span></li>`).join('')}</ul>` : ''}
      </div></li>
    </ol></div>`;
}
function earnCards() {
  const me = S.me, live = OFFERS.filter(o => o.type === 'credit' && parseD(o.validTill) >= TODAY);
  return `<p class="meta">We never ask for your card number. Just the bank, the card's name and when your bill is due.</p>
    <div>${me.cards.map((k, i) => `<div class="cardrow"><span class="bank">${bankTag(k.bank)}</span><div class="stack" style="gap:4px"><b>${esc(k.bank)} ${esc(k.variant)}</b><span class="meta">Credit card · bill due on the ${ord(k.dueDay)}</span>
      ${live.filter(o => o.bank === k.bank && o.type === k.type).map(o => `<span class="quota">${esc(o.merchant)} · ${esc(offerLabel(o))}: used <b style="color:var(--text-2)">${me.quota[o.id] || 0} of ${o.perCardMonthly}</b> times this month</span>`).join('') || '<span class="quota">No offers for this card in the demo</span>'}</div>
      <button class="btn quiet sm" data-act="rmCard" data-i="${i}">Remove</button></div>`).join('')}</div>
    <div class="sub"><b>Add a credit card</b><div class="fgrid"><div class="field"><label for="ac-bank">Bank</label><select id="ac-bank">${BANKS.map(b => `<option>${b}</option>`).join('')}</select></div>
      <div class="field"><label for="ac-var">Card name</label><input id="ac-var" type="text" placeholder="e.g. Millennia"></div>
      <div class="field"><label for="ac-due">Bill due day</label><input id="ac-due" type="number" min="1" max="28" value="10"></div></div>
      <div><button class="btn" data-act="addCard">Add card</button></div></div>`;
}
function earnRules() {
  const me = S.me;
  return `<p class="meta">You only get requests that fit these.</p>
    <div class="stack" style="gap:6px"><span class="field"><label>Stores I'll order from</label></span><div class="row"><label class="check"><input type="checkbox" id="r-fk" data-bound ${me.merchants.includes('Flipkart') ? 'checked' : ''}> Flipkart</label><label class="check"><input type="checkbox" id="r-am" data-bound ${me.merchants.includes('Amazon') ? 'checked' : ''}> Amazon</label></div></div>
    <div class="fgrid"><div class="field"><label for="r-max">Most I'll spend on one order (₹)</label><input id="r-max" data-bound type="number" step="1000" value="${me.maxOrder}"></div>
      <div class="field"><label for="r-minc">Smallest reward I'll accept (₹)</label><input id="r-minc" data-bound type="number" step="50" value="${me.minCommission}"></div></div>
    <label class="check"><input type="checkbox" id="r-auto" data-bound ${me.autoAccept ? 'checked' : ''}> Say yes automatically to requests that fit</label>
    <div><button class="btn primary" data-act="saveRules">Save</button></div>`;
}
function earnHistory() {
  const h = S.orders.filter(o => o.fulfillerId === 'me' && o.status !== 'accepted');
  if (!h.length) return `<div class="empty">${icon('clock')}<span>Orders you place for shoppers show up here, with when you'll be paid back.</span></div>`;
  return `<div class="tablewrap"><table class="data"><thead><tr><th>Order</th><th>Status</th><th>You paid</th><th>Your reward</th><th>Paid back on</th></tr></thead><tbody>${h.map(o => `<tr><td><b>${esc(o.name)}</b><div class="mono meta">${o.merchantOrderId || o.id}</div></td><td>${statusPill(o.status)}</td><td>${o.paid ? fmt(o.paid) : '–'}</td><td>${o.status === 'refunded' ? fmt(0) : fmt(o.split.card)}</td><td>${o.payout ? fdate(o.payout.date) + (o.payout.early ? ' (early)' : '') : o.status === 'refunded' ? 'The store refunds your card' : 'After delivery'}</td></tr>`).join('')}</tbody></table></div>`;
}

/* ---------- vouchers ---------- */
function viewVouchers() {
  const tab = S.vTab, nMine = S.vbuys.length + S.vouchers.filter(v => v.mine).length;
  return intro('ticket', 'Coupon codes', 'Unused coupon codes, <em>put to use</em>.',
    "Got coupon codes from CRED, GPay or PhonePe that you won't use? Sell them here. Buyers see a code only after paying, and get their money back if it doesn't work.") + `
  <div class="seg" role="group" aria-label="Coupon code views">${[['buy', 'Buy a code'], ['sell', 'Sell a code'], ['mine', 'My codes' + (nMine ? ` (${nMine})` : '')]].map(([k, l]) => `<button aria-pressed="${tab === k}" data-act="vtab" data-tab="${k}">${l}</button>`).join('')}</div>
  ${tab === 'buy' ? vBuy() : tab === 'sell' ? vSell() : vMine()}`;
}
function ticket(v, cart) {
  const dl = daysLeft(v, TODAY), ap = cart ? voucherApplicable(v, null, cart, TODAY) : null;
  return `<article class="ticket"><span class="brandname">${esc(v.brand)}</span>
    <div class="vtitle">${esc(voucherTitle(v))}${v.note ? ` <span class="meta">· ${esc(v.note)}</span>` : ''}</div>
    <div class="row">${pill(dl === 0 ? 'Ends today' : dl + (dl === 1 ? ' day' : ' days') + ' left', dl <= 2 ? 'bad' : dl <= 7 ? 'warn' : '', 'clock')}<span class="vcode">${esc(v.code.slice(0, 4))}••••••</span></div>
    <div class="vprice"><b>${fmt(v.price)}</b> <span class="meta">${v.kind === 'gift' ? 'for ' + fmt(v.face) + ' to spend' : 'for ' + fmt(v.face) + ' off'}</span></div>
    <span class="meta">Sold by ${esc(v.seller)}${v.mine ? ' (you)' : ''} · ${v.sellerRating}★${S.sellerStrikes[v.seller] ? ` · ${S.sellerStrikes[v.seller]} code didn't work` : ''}</span>
    ${ap ? pill(ap.reason, ap.ok ? 'good' : '', ap.ok ? 'check' : 'info') : ''}
    ${v.mine ? '<span class="meta">Your code</span>' : `<button class="btn ${ap && !ap.ok ? '' : 'primary'}" data-act="buyVoucher" data-id="${v.id}">Buy for ${fmt(v.price)}</button>`}</article>`;
}
function vBuy() {
  const brands = [...new Set(INITIAL_VOUCHERS.map(v => v.brand))], cart = Number(S.vf.cart) || 0;
  const market = marketVouchers(S.vouchers, TODAY);
  let list = market.filter(v => !S.vf.brand || v.brand === S.vf.brand);
  if (cart) list = list.slice().sort((a, b) => voucherApplicable(b, null, cart, TODAY).ok - voucherApplicable(a, null, cart, TODAY).ok);
  const soon = market.filter(v => daysLeft(v, TODAY) <= 7 && !v.mine);
  return `${soon.length ? `<section class="stack vcarousel"><div class="between"><span class="label">${icon('clock')} Ending this week, cheaper</span><span class="meta">Scroll sideways</span></div><div class="carousel">${soon.map(v => ticket(v, cart)).join('')}</div></section>` : ''}
  <section class="stack"><div class="between"><h2>All codes</h2>
    <div class="filters"><div class="field"><label for="vf-brand">Store</label><select id="vf-brand" data-bound><option value="">All stores</option>${brands.map(b => `<option ${S.vf.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
    <div class="field"><label for="vf-cart">Your order total (₹)</label><input id="vf-cart" data-bound type="number" placeholder="e.g. 450" value="${esc(S.vf.cart)}"></div></div></div>
  ${list.length ? `<div class="vgrid">${list.map(v => ticket(v, cart)).join('')}</div>` : `<div class="empty">${icon('ticket')}<span>No codes for this store right now.</span></div>`}
  <p class="meta">Expired codes are removed automatically. Sample listings.</p></section>`;
}
function readSellForm() { const g = id => (document.getElementById(id) || {}).value || ''; return { brand: g('s-brand') || 'Swiggy', kind: g('s-kind') || 'promo', face: Number(g('s-face')), minOrder: Number(g('s-min')) || 0, expires: g('s-exp'), code: g('s-code'), price: Number(g('s-price')) || 0 }; }
function sellPreview() {
  const v = readSellForm();
  if (!(v.face > 0) || !v.expires) return { text: "Enter what it's worth and when it expires to see a price.", net: '' };
  const price = v.price > 0 ? v.price : suggestPrice(v, TODAY), fee = voucherFee(v, price);
  return { text: `${v.price > 0 ? 'Your price' : 'We suggest'}: ${fmt(price)}`, net: `You get ${fmt(price - fee)} after our ${fmt(fee)} fee, paid a day after the buyer confirms the code worked.` };
}
function vSell() {
  const brands = Object.keys(DEMAND).concat('Other');
  return `<section class="grid2"><form class="panel" id="sellForm" novalidate><h2>Sell a code</h2>
    <div class="fgrid"><div class="field"><label for="s-brand">Store</label><select id="s-brand">${brands.map(b => `<option>${b}</option>`).join('')}</select></div>
      <div class="field"><label for="s-kind">Type</label><select id="s-kind"><option value="promo">Discount code</option><option value="gift">Gift card</option></select></div>
      <div class="field"><label for="s-face">Worth (₹)</label><input id="s-face" type="number" placeholder="150"></div>
      <div class="field"><label for="s-min">Minimum order (₹)</label><input id="s-min" type="number" placeholder="399"></div>
      <div class="field"><label for="s-exp">Expires on</label><input id="s-exp" type="date" value="2026-12-15"></div>
      <div class="field"><label for="s-price">Your price (optional)</label><input id="s-price" type="number" placeholder="Use ours"></div></div>
    <div class="field"><label for="s-code">The code</label><input id="s-code" type="text" autocomplete="off" placeholder="Kept hidden until someone buys it"></div>
    <div class="callout info"><b id="s-sug"></b><span id="s-net" class="meta"></span></div>
    ${S.sellErrors.length ? `<div class="callout bad">${S.sellErrors.map(e => `<span>${icon('alert')} ${esc(e)}</span>`).join('')}</div>` : ''}
    <div><button class="btn primary" type="submit">Put it up for sale</button></div></form>
    <div class="panel"><h2>Add codes from a screenshot</h2><p class="meta">Take a screenshot of your CRED, GPay or PhonePe rewards page. We read each code's store, value and expiry, and price it for you.</p>
      <div><button class="btn outline" data-act="scanSample">${icon('scan')} Try a sample screenshot</button></div><p class="meta">In this demo, reading the screenshot is simulated.</p>
      ${S.scanned ? `<div class="sub">${S.scanned.map(v => `<div class="cardrow" style="grid-template-columns:minmax(0,1fr) auto"><div><b>${esc(v.brand)} · ${esc(voucherTitle(v))}</b><div class="meta">Expires ${fdate(parseD(v.expires))} · code ${esc(v.code.slice(0, 4))}••••</div></div><div class="num" style="text-align:right"><b style="color:var(--gold)">${fmt(suggestPrice(v, TODAY))}</b><div class="meta">you get ${fmt(suggestPrice(v, TODAY) - voucherFee(v, suggestPrice(v, TODAY)))}</div></div></div>`).join('')}
        <div><button class="btn primary" data-act="listScanned">Sell all ${S.scanned.length}</button></div></div>` : ''}
    </div></section>`;
}
function vMine() {
  const mine = S.vouchers.filter(v => v.mine);
  return `<section class="grid2"><div class="stack"><h2>Codes you bought</h2>${S.vbuys.length ? S.vbuys.map(b => `<article class="panel sm"><div class="between"><b>${esc(b.brand)} · ${esc(b.title)}</b>${pill(b.status === 'revealed' ? 'Try it now' : b.status === 'confirmed' ? 'Worked' : 'Refunded', b.status === 'revealed' ? 'info' : b.status === 'confirmed' ? 'good' : 'bad')}</div>
      ${b.status !== 'refunded' ? `<div class="row"><span class="vcode open" id="code-${b.id}">${esc(b.code)}</span><button class="btn sm swap" data-act="copyCode" data-id="${b.id}">${swapIcons('copy', 'check')} Copy code</button></div>` : ''}
      ${b.status === 'revealed' ? `<span class="meta">You paid ${fmt(b.paid)}. Use the code within 30 minutes and tell us if it worked. The seller isn't paid until you do.</span>
        <div class="row"><button class="btn sm primary" data-act="vWorked" data-id="${b.id}">It worked</button><button class="btn sm danger" data-act="vFailed" data-id="${b.id}">It didn't work</button></div>
        <div class="row"><label class="meta" for="shot-${b.id}">Screenshot of the error</label><input type="file" id="shot-${b.id}" accept="image/*" class="meta" style="max-width:230px"><button class="btn sm demo" data-act="sampleShot" data-id="${b.id}">Use a sample screenshot</button></div>
        ${b.needShot ? `<p class="field-error">${icon('info')} Add a screenshot of the error so we can refund you.</p>` : ''}${b.shot ? `<span class="meta">Added: ${esc(b.shot)}</span>` : ''}`
      : b.status === 'confirmed' ? `<span class="meta">${esc(b.seller)} gets ${fmt(b.paid - b.fee)} tomorrow. Our fee is ${fmt(b.fee)}.</span>` : `<span class="meta">${fmt(b.paid)} refunded to you. The seller gets nothing and a warning.</span>`}
    </article>`).join('') : `<div class="empty">${icon('ticket')}<span>Codes you buy show up here.</span><button class="btn outline sm" data-act="vtab" data-tab="buy">Browse codes</button></div>`}</div>
    <div class="stack"><h2>Codes you're selling</h2>${mine.length ? mine.map(v => `<article class="panel sm"><div class="between"><b>${esc(v.brand)} · ${esc(voucherTitle(v))}</b>${pill(v.status === 'listed' ? 'For sale' : 'Sold', v.status === 'listed' ? 'info' : 'good')}</div>
      <span class="meta">Price ${fmt(v.price)} · you get ${fmt(v.price - voucherFee(v, v.price))} · expires ${fdate(parseD(v.expires))}</span>
      ${v.status === 'listed' ? `<div><button class="btn sm demo" data-act="simBuyer" data-id="${v.id}">Pretend someone buys it</button></div>` : `<span class="meta">Sold. You get ${fmt(v.price - voucherFee(v, v.price))} a day after the buyer confirms it worked.</span>`}</article>`).join('') : `<div class="empty">${icon('scan')}<span>You're not selling any codes yet.</span><button class="btn outline sm" data-act="vtab" data-tab="sell">Sell a code</button></div>`}</div></section>`;
}

/* ---------- behind the scenes ---------- */
function viewEngine() {
  const os = S.orders, matched = os.filter(o => o.fulfillerId), done = os.filter(o => o.fulfillerId || o.status === 'refunded');
  const times = matched.map(o => (o.acceptedAt - o.createdAt) / 1000);
  const held = os.filter(o => !['settled', 'refunded'].includes(o.status)).reduce((s, o) => s + o.buyerPays, 0);
  const last = os.find(o => o.funnel), pool = fullPool();
  const kpi = (v, k, gold) => `<div class="tile"><span class="v ${gold ? 'gold' : ''}">${v}</span><span class="k">${k}</span></div>`;
  return intro('flow', 'Behind the scenes', 'How we find a <em>helper</em>.',
    "For every order we look for helpers who have the right card and can take it, rank them, and ask one at a time. If nobody can, the shopper gets their money back.") + `
  <div class="kpis">${kpi(os.length, 'Orders so far')}${kpi(done.length ? Math.round(matched.length / done.length * 100) + '%' : '–', 'Found a helper')}${kpi(times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0) + ' s' : '–', 'Average wait for a helper')}${kpi(fmt(held), 'Money we’re holding for shoppers')}${kpi(fmt(S.stats.platform + S.stats.voucher), 'OfferPool earnings', true)}${kpi(pool.filter(c => c.online).length + ' / ' + pool.length, 'Helpers available')}</div>
  <section class="grid2">
    <div class="panel"><h2>${last ? 'Who could take the latest order' : 'How we choose a helper'}</h2>
      ${last ? `<p class="meta">${last.id} · ${esc(last.offerText)} · helper pays ${fmt(last.cardholderPays)}, reward ${fmt(last.split.card)}</p>
        <div class="funnel">${last.funnel.map(f => `<div class="f"><span>${esc(f.label)}</span><span class="bar"><span style="width:${f.count / last.funnel[0].count * 100}%"></span></span><b class="num">${f.count}</b></div>`).join('')}</div>
        ${last.ranked.length ? `<p class="meta"><b style="color:var(--text-2)">Asked in this order:</b> ${last.ranked.map(r => `${esc(r.name)} (${r.score.toFixed(2)})`).join(' · ')}</p>` : ''}`
      : `<p class="meta">Buy something in Shop to see it here. A helper must have the card, not be the shopper, be available, use that store, still be able to use the offer this month, and be happy with the order size and reward.</p>`}
      <div class="sub"><span class="meta"><b style="color:var(--text-2)">Ranking</b> = 40% how often they say yes + 25% how fast they order + 20% how long since their last order (so work is shared) + 15% how many offer uses they have left.</span></div>
    </div>
    <div class="panel"><h2>Try other situations</h2>
      <label class="check"><input type="checkbox" data-act="setPreferMe" ${S.settings.preferMe ? 'checked' : ''}><span>Send my next order to Kabir (me) so I can try the helper side</span></label>
      <label class="check"><input type="checkbox" data-act="setSayNo" ${S.settings.sayNo ? 'checked' : ''}><span>Let helpers sometimes say no (they say yes as often as their rating shows)</span></label>
      <label class="check"><input type="checkbox" data-act="setPriceChange" ${S.settings.priceChange ? 'checked' : ''}><span>On the next order, the store's price goes up by ₹1,200</span></label>
      <div class="row"><button class="btn sm" data-act="allOffline">Make every helper unavailable</button><button class="btn sm" data-act="allOnline">Make every helper available</button><button class="btn sm danger" data-act="reset">Start the demo again</button></div>
      <p class="meta">Helpers other than Kabir are simulated.</p></div>
  </section>
  <section class="stack"><h2>Helpers</h2><div class="tablewrap"><table class="data"><thead><tr><th>Helper</th><th>Cards</th><th>Available</th><th>Says yes</th><th>Orders in</th><th>Limits</th><th>Offer uses this month</th></tr></thead><tbody>
    ${pool.map(c => `<tr><td><b>${esc(chName(c.id))}</b><div class="meta">${esc(c.city)} · ${c.rating}★</div></td><td>${c.cards.map(k => `${esc(k.bank)} ${k.type}`).join('<br>')}</td>
      <td><label class="toggle"><input type="checkbox" data-act="toggleOnline" data-id="${c.id}" ${c.online ? 'checked' : ''} aria-label="${esc(c.name)} available"></label></td>
      <td>${Math.round(c.accept * 100)}%</td><td>~${c.speedMin} min</td><td>Up to ${fmt(c.maxOrder)}<br>Reward ${fmt(c.minCommission)}+ · ${c.merchants.join(', ')}</td>
      <td>${Object.entries(c.quota).filter(([, n]) => n).map(([id, n]) => `${id}: ${n}/${offerById(id).perCardMonthly}`).join('<br>') || '–'}</td></tr>`).join('')}
  </tbody></table></div></section>
  <section class="stack"><h2>Activity log</h2>${S.log.length ? `<div class="log" aria-live="polite">${S.log.map(l => `<div class="${l.kind}"><span>${l.t}</span><span>${l.order}</span><span>${esc(l.text)}</span></div>`).join('')}</div>` : `<div class="empty">${icon('flow')}<span>Everything that happens to an order shows up here.</span></div>`}</section>`;
}

function viewEvals() {
  const res = runEvals(), passed = res.filter(r => r.pass).length, pct = Math.round(passed / res.length * 100);
  return `<section class="hero"><p class="eyebrow">${icon('checkc')} Behind the scenes</p>
    <div class="row" style="gap:20px"><div class="ring" style="--p:${pct}%" role="img" aria-label="${passed} of ${res.length} passing"><span>${pct}%</span></div>
    <h1>${passed} of ${res.length} <em>tests pass</em>.</h1></div>${seam()}
    <p class="lede">Each time you open this tab, these run the app's real pricing, helper-matching, order-checking, payment and coupon-code rules against fixed examples. Each one guards against something that could go wrong: a wrong price, the wrong helper, a fake order, a late payment or a bad code.</p>
    <div><button class="btn outline" data-act="go" data-view="evals">Run again ${icon('refund')}</button></div></section>
  <div class="tablewrap"><table class="data"><thead><tr><th>ID</th><th>Area</th><th>What it checks</th><th>Expected</th><th>Got</th><th>Result</th></tr></thead><tbody>
  ${res.map(r => `<tr><td class="mono">${r.id}</td><td>${esc(r.area)}</td><td><b>${esc(r.name)}</b></td><td>${esc(r.expected)}</td><td>${esc(r.actual)}</td><td><span class="${r.pass ? 'pass' : 'fail'}">${icon(r.pass ? 'check' : 'x')}${r.pass ? 'Pass' : 'Fail'}</span></td></tr>`).join('')}
  </tbody></table></div>`;
}

/* ---------- render & routing ---------- */
const VIEWS = { shop: ['Shop', 'bag', viewShop], earn: ['Earn', 'wallet', viewEarn], vouchers: ['Coupon codes', 'ticket', viewVouchers], engine: ['Behind the scenes', 'flow', viewEngine], evals: ['Tests', 'checkc', viewEvals] };
const SHORT = { vouchers: 'Codes', engine: 'Inside' };
function renderNav() {
  const n = S.orders.filter(o => (o.status === 'offered' && o.offeredTo === 'me') || (o.fulfillerId === 'me' && o.status === 'accepted')).length;
  const btn = (k, minor, short) => `<button class="tab ${minor ? 'minor' : ''}" data-act="go" data-view="${k}" ${S.view === k ? 'aria-current="page"' : ''}>${icon(VIEWS[k][1])}<span>${short && SHORT[k] ? SHORT[k] : VIEWS[k][0]}</span>${k === 'earn' && n ? `<span class="badge">${n}</span>` : ''}</button>`;
  document.getElementById('tabs').innerHTML = btn('shop') + btn('earn') + btn('vouchers') + '<span class="sep" aria-hidden="true"></span>' + btn('engine', 1) + btn('evals', 1);
  document.getElementById('bnav').innerHTML = Object.keys(VIEWS).map(k => btn(k, 0, 1)).join('');
}
function render(opts = {}) {
  const view = document.getElementById('view'), sheetEl = document.getElementById('sheet'), saved = {}; let focusId = null, sel = null;
  if (!opts.fresh) {
    [view, sheetEl].forEach(c => c.querySelectorAll('input,select,textarea').forEach(el => { if (!el.id || el.type === 'radio' || el.type === 'file' || el.hasAttribute('data-bound')) return; saved[el.id] = el.type === 'checkbox' ? el.checked : el.value; }));
    const ae = document.activeElement; if (ae && ae.id && (view.contains(ae) || sheetEl.contains(ae))) { focusId = ae.id; try { sel = ae.selectionStart; } catch (e) { } }
  }
  const hadSheet = !!sheetEl.firstElementChild;
  view.innerHTML = guideBar() + VIEWS[S.view][2]();
  sheetEl.innerHTML = sheetView();
  document.body.classList.toggle('locked', !!S.sheet);
  for (const [id, v] of Object.entries(saved)) { const el = document.getElementById(id); if (!el) continue; if (el.type === 'checkbox') el.checked = v; else el.value = v; }
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) { } } }
  else if (S.sheet && !hadSheet) { const b = sheetEl.querySelector('.btn.primary') || sheetEl.querySelector('[data-act="closeSheet"]'); if (b) b.focus({ preventScroll: true }); }
  if (S.view === 'vouchers' && S.vTab === 'sell') updateSellPreview();
  renderNav(); tick();
}
function go(view) { if (!VIEWS[view]) view = 'shop'; S.view = view; S.sheet = null; if (location.hash.slice(1) !== view) history.replaceState(null, '', '#' + view); render({ fresh: true }); window.scrollTo(0, 0); }
function scrollToId(id) { requestAnimationFrame(() => { const el = document.getElementById(id); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } }); }
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (VIEWS[v] && v !== S.view) { S.view = v; S.sheet = null; render({ fresh: true }); } });
function updateSellPreview() { const p = sellPreview(), a = document.getElementById('s-sug'), b = document.getElementById('s-net'); if (a) a.textContent = p.text; if (b) b.textContent = p.net; }
function analyse(product) { S.analysis = { pid: product.id, choice: null, voucherId: null }; S.linkError = ''; S.linkInput = product.url; S.ui.open.others = false; S.ui.open.bad = false; S.ui.open.breakdown = false; }
function closeSheet() { S.sheet = null; render(); }

/* ---------- events ---------- */
document.addEventListener('toggle', e => { const d = e.target; if (d.matches && d.matches('details[data-ui]')) S.ui.open[d.dataset.ui] = d.open; }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet) closeSheet(); });
document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'linkForm') { const r = parseLink(S.linkInput); if (r.error) { S.linkError = r.error; S.analysis = null; } else analyse(r.product); render(); if (S.analysis) scrollToId('results'); }
  if (e.target.id === 'sellForm') {
    const f = readSellForm(), v = { ...f, price: f.price > 0 ? f.price : suggestPrice(f, TODAY) };
    const errs = validateListing(v, S.vouchers, TODAY); S.sellErrors = errs;
    if (errs.length) { render(); return; }
    S.vouchers.unshift({ id: 'm' + (S.vseq++), ...v, code: v.code.trim(), seller: 'Kabir', sellerRating: 4.8, status: 'listed', mine: true });
    S.vTab = 'mine'; toast(`Up for sale at ${fmt(v.price)}. Buyers see the code only after paying.`); render({ fresh: true });
  }
});
document.addEventListener('input', e => { const t = e.target; if (t.id === 'link') S.linkInput = t.value; if (t.id === 'addr') S.buyer.address = t.value; if (t.closest && t.closest('#sellForm')) updateSellPreview(); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.name === 'opt' && S.analysis) { S.analysis.choice = t.value; S.ui.open.others = false; render(); scrollToId('results'); return; }
  if (t.id === 'vf-brand') { S.vf.brand = t.value; render(); return; }
  if (t.id === 'vf-cart') { S.vf.cart = t.value; render(); return; }
  if (t.closest && t.closest('#sellForm')) updateSellPreview();
});
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id, order = id ? S.orders.find(o => o.id === id) : null;
  switch (act) {
    case 'scrim': if (e.target === t) closeSheet(); break;
    case 'closeSheet': closeSheet(); break;
    case 'go': go(t.dataset.view); break;
    case 'guide': { const g = guideStep(); if (g.sample) analyse(productById(g.sample)); go(g.go); if (g.sample) scrollToId('results'); else if (g.scroll) scrollToId(g.scroll); break; }
    case 'hideGuide': S.ui.guideHidden = true; writePref('guideHidden', '1'); render(); break;
    case 'showGuide': S.ui.guideHidden = false; writePref('guideHidden', '0'); render(); window.scrollTo(0, 0); break;
    case 'sample': analyse(productById(id)); render(); scrollToId('results'); break;
    case 'addBuyerCard': { const bank = document.getElementById('nb-bank').value, type = document.getElementById('nb-type').value; if (!S.buyer.cards.some(k => k.bank === bank && k.type === type)) S.buyer.cards.push({ bank, type }); render(); break; }
    case 'rmBuyerCard': S.buyer.cards.splice(+t.dataset.i, 1); render(); break;
    case 'pickVoucher': S.analysis.voucherId = t.checked ? id : null; render(); break;
    case 'openCheckout': S.sheet = { mode: 'checkout' }; render(); break;
    case 'pay': { const o = placeOrder(); if (o) { S.sheet = { mode: 'progress', orderId: o.id }; render(); } break; }
    case 'retry': S.sheet = null; analyse(productById(t.dataset.pid)); render(); scrollToId('results'); break;
    case 'trackOrder': S.sheet = null; render(); scrollToId('orders'); break;
    case 'shopMore': S.sheet = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'toEarn': go('earn'); break;
    case 'sampleRequest': {
      analyse(productById('mba'));
      const ch = currentChoice();
      if (!ch.o || ch.o.route !== 'match' || !fullPool().some(c => c.id === 'me' && c.online)) { S.analysis = null; toast('No sample request fits your cards and preferences right now.'); render(); break; }
      const o = placeOrder({ forceMe: true });
      if (o && o.offeredTo !== 'me' && o.fulfillerId !== 'me') toast('Your cards or preferences don’t fit this request, so another helper took it.');
      render(); break; }
    case 'priceOk': if (order && order.status === 'price_check') { order.buyerPays += order.priceDelta; order.cardholderPays += order.priceDelta; order.status = 'placed'; tl(order, `You agreed to pay ${fmt(order.priceDelta)} more. Order ${order.merchantOrderId} goes ahead.`); log(order.id, 'Shopper approved the new price.', 'good'); render(); } break;
    case 'priceNo': if (order) cancelOrder(order, 'price'); break;
    case 'cancel': if (order) cancelOrder(order, 'cancel'); break;
    case 'return': if (order) cancelOrder(order, 'return'); break;
    case 'adv': if (order) advance(order, t.dataset.step); break;
    case 'online': S.me.online = t.checked; log('—', `Kabir (you) is ${t.checked ? 'available' : 'not available'}.`); render(); break;
    case 'accept': if (order && order.status === 'offered' && order.offeredTo === 'me') acceptJob(order, 'me'); break;
    case 'decline': if (order && order.offeredTo === 'me') { log(order.id, 'Kabir (you) said not now.', 'warn'); tl(order, 'Kabir couldn’t take it. Asking the next helper.'); offerNext(order); } break;
    case 'copyAddr': case 'copyCode': {
      const el = document.getElementById(act === 'copyAddr' ? 'addr-' + id : 'code-' + id), text = el.textContent;
      const done = () => { t.classList.add('done'); setTimeout(() => t.classList.remove('done'), 1600); };
      try { await navigator.clipboard.writeText(text); done(); toast('Copied'); } catch (err) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done(); toast('Selected. Press Ctrl+C to copy.'); }
      break; }
    case 'fillSample': case 'fillBad': {
      document.getElementById('f-oid-' + id).value = act === 'fillBad' ? 'OD12345' : genOrderId(order.merchant);
      document.getElementById('f-amt-' + id).value = order.cardholderPays;
      document.getElementById('f-card-' + id).value = order.offerBank;
      document.getElementById('f-addr-' + id).checked = true; break; }
    case 'submitOrder': {
      if (!order || order.status !== 'accepted') break;
      const oid = document.getElementById('f-oid-' + id).value, paid = Number(document.getElementById('f-amt-' + id).value);
      const res = verifyOrder({ merchant: order.merchant, orderId: oid, paid, expected: order.cardholderPays, cardBank: document.getElementById('f-card-' + id).value, offerBank: order.offerBank, addressOk: document.getElementById('f-addr-' + id).checked });
      if (applyVerification(order, res, paid, oid.trim())) toast(res.outcome === 'price_changed' ? "We've asked Riya to approve the new price." : 'All checks passed. Riya can track her order now.');
      render(); break; }
    case 'earnTab': S.ui.earnTab = t.dataset.tab; render({ fresh: true }); break;
    case 'rmCard': if (S.me.cards.length > 1) { S.me.cards.splice(+t.dataset.i, 1); render(); } else toast('Keep at least one card.'); break;
    case 'addCard': {
      const bank = document.getElementById('ac-bank').value, variant = document.getElementById('ac-var').value.trim() || 'Credit card', due = Math.min(28, Math.max(1, Number(document.getElementById('ac-due').value) || 10));
      if (S.me.cards.some(k => k.bank === bank)) { toast(`You already have a ${bank} card here.`); break; }
      S.me.cards.push({ bank, type: 'credit', variant, dueDay: due }); toast(`${bank} ${variant} added.`); render({ fresh: true }); break; }
    case 'saveRules': {
      const m = []; if (document.getElementById('r-fk').checked) m.push('Flipkart'); if (document.getElementById('r-am').checked) m.push('Amazon');
      S.me.merchants = m; S.me.maxOrder = Number(document.getElementById('r-max').value) || 0; S.me.minCommission = Number(document.getElementById('r-minc').value) || 0; S.me.autoAccept = document.getElementById('r-auto').checked;
      toast('Saved. New requests will follow these.'); render(); break; }
    case 'vtab': S.vTab = t.dataset.tab; S.sellErrors = []; render({ fresh: true }); break;
    case 'buyVoucher': {
      const v = S.vouchers.find(x => x.id === id && x.status === 'listed'); if (!v) break;
      v.status = 'sold';
      S.vbuys.unshift({ id: 'VB' + (S.vseq++), vid: v.id, brand: v.brand, title: voucherTitle(v), code: v.code, paid: v.price, fee: voucherFee(v, v.price), seller: v.seller, status: 'revealed' });
      S.sheet = null; S.view = 'vouchers'; S.vTab = 'mine'; history.replaceState(null, '', '#vouchers'); toast(`Paid ${fmt(v.price)}. Here's your code.`); render({ fresh: true }); window.scrollTo(0, 0); break; }
    case 'sampleShot': { const b = S.vbuys.find(x => x.id === id); if (b) { b.shot = 'checkout-error.png'; b.needShot = false; render(); } break; }
    case 'vWorked': case 'vFailed': {
      const b = S.vbuys.find(x => x.id === id); if (!b || b.status !== 'revealed') break;
      if (act === 'vFailed') { const f = document.getElementById('shot-' + id); if (!b.shot && f && f.files && f.files[0]) b.shot = f.files[0].name; if (!b.shot) { b.needShot = true; render(); break; } }
      const r = resolveVoucher(b, act === 'vWorked');
      b.status = act === 'vWorked' ? 'confirmed' : 'refunded';
      if (r.strike) S.sellerStrikes[b.seller] = (S.sellerStrikes[b.seller] || 0) + 1; else S.stats.voucher += r.platform;
      log(b.id, act === 'vWorked' ? `Code worked. ${b.seller} gets ${fmt(r.sellerPayout)} tomorrow; fee ${fmt(r.platform)}.` : `Code didn't work. Buyer refunded ${fmt(r.buyerRefund)}; warning for ${b.seller}.`, act === 'vWorked' ? 'good' : 'bad');
      toast(act === 'vWorked' ? 'Thanks. The seller will be paid.' : `${fmt(r.buyerRefund)} refunded.`); render(); break; }
    case 'scanSample': S.scanned = clone(SCANNED_SAMPLE); render(); break;
    case 'listScanned': {
      let n = 0; const skipped = [];
      for (const v of S.scanned) { const price = suggestPrice(v, TODAY); if (validateListing({ ...v, price }, S.vouchers, TODAY).length) { skipped.push(v.brand); continue; } S.vouchers.unshift({ id: 'm' + (S.vseq++), ...v, price, seller: 'Kabir', sellerRating: 4.8, status: 'listed', mine: true }); n++; }
      S.scanned = null; S.vTab = 'mine'; toast(`${n} code${n === 1 ? '' : 's'} up for sale${skipped.length ? `. Skipped ${skipped.join(', ')} (already for sale)` : ''}.`); render({ fresh: true }); break; }
    case 'simBuyer': { const v = S.vouchers.find(x => x.id === id); if (v) { v.status = 'sold'; S.stats.voucher += voucherFee(v, v.price); log(v.id, `Your ${v.brand} code sold for ${fmt(v.price)}.`, 'good'); toast('Sold. You get paid once the buyer confirms it worked.'); render(); } break; }
    case 'setPreferMe': S.settings.preferMe = t.checked; break;
    case 'setSayNo': S.settings.sayNo = t.checked; break;
    case 'setPriceChange': S.settings.priceChange = t.checked; break;
    case 'toggleOnline': { const c = findCh(id); if (c) { c.online = t.checked; log('—', `${chName(id)} is ${c.online ? 'available' : 'not available'}.`); render(); } break; }
    case 'allOffline': fullPool().forEach(c => c.online = false); log('—', 'Every helper is unavailable.', 'warn'); render(); break;
    case 'allOnline': fullPool().forEach(c => c.online = true); log('—', 'Every helper is available.'); render(); break;
    case 'reset': { const hidden = S.ui.guideHidden; S = freshState(); S.ui.guideHidden = hidden; go('shop'); toast('The demo has started again.'); break; }
  }
});
function tick() {
  const now = Date.now();
  for (const o of S.orders) if (o.status === 'offered' && o.offeredTo === 'me' && o.deadline && now > o.deadline) {
    o.deadline = null; log(o.id, `Kabir (you) didn't answer in ${ACCEPT_SECONDS} s. Asking the next helper.`, 'warn'); tl(o, 'Kabir didn’t answer in time. Asking the next helper.'); offerNext(o); return;
  }
  document.querySelectorAll('[data-deadline]').forEach(el => { const left = Math.max(0, Math.ceil((+el.dataset.deadline - now) / 1000)); el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); });
}
setInterval(tick, 1000);
go(location.hash.slice(1) || 'shop');
