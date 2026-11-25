// OfferPool: shared helpers and constants
/* ---------- helpers ---------- */
export const TODAY = new Date(2026, 10, 25);
export const MIN_MATCH = 400;
export const RETURN_DAYS = 7;
export const ACCEPT_SECONDS = 60;
export const SPLIT = { buyer: 0.70, card: 0.15 };
export const fmt = n => (n < 0 ? '−' : '') + '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
export const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const fdate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const clone = x => JSON.parse(JSON.stringify(x));
export const clock = () => new Date().toLocaleTimeString('en-IN', { hour12: false });
export const bankTag = b => b.split(' ')[0].slice(0, 5).toUpperCase();
export const aBank = b => (b === 'Kotak' ? 'a ' : 'an ') + b;  // "an HDFC", "an SBI", "a Kotak"
export const ord = n => n + (([11, 12, 13].includes(n % 100)) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
