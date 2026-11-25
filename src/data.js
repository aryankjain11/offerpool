// OfferPool: sample data (banks, offers, products, helpers, coupon codes)
import { fmt } from './utils.js';

/* ---------- sample data ---------- */
export const PRODUCTS = [
  { id: 'iphone16', title: 'iPhone 16 · 128 GB', name: 'Apple iPhone 16 (Black, 128 GB)', merchant: 'Flipkart', price: 69900, art: 'phone', url: 'https://www.flipkart.com/apple-iphone-16-black-128-gb/p/itm7c0281cd247be', keys: ['iphone-16', 'iphone 16', 'iphone16'] },
  { id: 'mba', title: 'MacBook Air M3', name: 'Apple MacBook Air M3 13" (16 GB, 256 GB SSD)', merchant: 'Flipkart', price: 99990, art: 'laptop', url: 'https://www.flipkart.com/apple-macbook-air-m3-16-gb-256-gb-ssd/p/itm2b9f3e5d1c0aa', keys: ['macbook'] },
  { id: 'ac', title: 'LG 1.5 ton split AC', name: 'LG 1.5 Ton 5 Star AI Dual Inverter Split AC', merchant: 'Flipkart', price: 42490, art: 'ac', url: 'https://www.flipkart.com/lg-1-5-ton-5-star-split-inverter-ac/p/itm5e6c1f0b7d2c1', keys: ['split-ac', 'split-inverter-ac', 'lg-1-5-ton'] },
  { id: 's25', title: 'Galaxy S25 · 256 GB', name: 'Samsung Galaxy S25 5G (Navy, 256 GB)', merchant: 'Amazon', price: 80999, art: 'phone', url: 'https://www.amazon.in/Samsung-Galaxy-Navy-256GB-Storage/dp/B0DSKMQ1VF', keys: ['galaxy', 'samsung'] },
  { id: 'xm5', title: 'Sony WH-1000XM5', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', merchant: 'Amazon', price: 26990, art: 'headphones', url: 'https://www.amazon.in/Sony-WH-1000XM5-Cancelling-Headphones/dp/B09XS7JWHH', keys: ['wh-1000xm5', 'sony'] },
  { id: 'buds', title: 'boAt Airdopes 141', name: 'boAt Airdopes 141 Wireless Earbuds', merchant: 'Amazon', price: 1299, art: 'earbuds', url: 'https://www.amazon.in/boAt-Airdopes-141-Wireless-Earbuds/dp/B09N3ZNHTY', keys: ['airdopes', 'boat'] },
];
export const OFFERS = [
  { id: 'fk-hdfc-cc', merchant: 'Flipkart', bank: 'HDFC', type: 'credit', kind: 'pct', pct: 10, cap: 4000, min: 10000, perCardMonthly: 2, validTill: '2026-12-31' },
  { id: 'fk-iphone-hdfc', merchant: 'Flipkart', bank: 'HDFC', type: 'credit', kind: 'flat', amount: 5000, min: 0, products: ['iphone16'], perCardMonthly: 1, validTill: '2026-12-15' },
  { id: 'fk-sbi-cc', merchant: 'Flipkart', bank: 'SBI', type: 'credit', kind: 'pct', pct: 10, cap: 3000, min: 25000, perCardMonthly: 1, validTill: '2026-12-31' },
  { id: 'fk-icici-cc', merchant: 'Flipkart', bank: 'ICICI', type: 'credit', kind: 'pct', pct: 10, cap: 1500, min: 5000, perCardMonthly: 3, validTill: '2026-12-31' },
  { id: 'fk-axis-cc', merchant: 'Flipkart', bank: 'Axis', type: 'credit', kind: 'pct', pct: 5, cap: 750, min: 2000, perCardMonthly: 4, validTill: '2026-12-31' },
  { id: 'fk-idfc-dc', merchant: 'Flipkart', bank: 'IDFC FIRST', type: 'debit', kind: 'pct', pct: 10, cap: 750, min: 3000, perCardMonthly: 2, validTill: '2026-12-31' },
  { id: 'am-axis-cc', merchant: 'Amazon', bank: 'Axis', type: 'credit', kind: 'pct', pct: 10, cap: 5000, min: 50000, perCardMonthly: 1, validTill: '2026-12-31' },
  { id: 'am-sbi-cc', merchant: 'Amazon', bank: 'SBI', type: 'credit', kind: 'pct', pct: 10, cap: 2000, min: 5000, perCardMonthly: 2, validTill: '2026-12-31' },
  { id: 'am-kotak-cc', merchant: 'Amazon', bank: 'Kotak', type: 'credit', kind: 'pct', pct: 7.5, cap: 1750, min: 10000, perCardMonthly: 2, validTill: '2026-12-31' },
  { id: 'am-hdfc-dc', merchant: 'Amazon', bank: 'HDFC', type: 'debit', kind: 'pct', pct: 10, cap: 1000, min: 5000, perCardMonthly: 2, validTill: '2026-12-31' },
  { id: 'am-icici-cc', merchant: 'Amazon', bank: 'ICICI', type: 'credit', kind: 'pct', pct: 10, cap: 3000, min: 10000, perCardMonthly: 2, validTill: '2026-11-20' },
];
export const BANKS = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'IDFC FIRST'];
export const INITIAL_ME = {
  id: 'me', name: 'Kabir', city: 'Delhi', online: true, autoAccept: false, accept: 0.9, speedMin: 5, rating: 4.8, jobs: 12, lastJobMins: 600,
  maxOrder: 150000, minCommission: 150, merchants: ['Flipkart', 'Amazon'], quota: { 'fk-hdfc-cc': 1 },
  cards: [{ bank: 'HDFC', type: 'credit', variant: 'Regalia Gold', dueDay: 15 }, { bank: 'SBI', type: 'credit', variant: 'Cashback', dueDay: 5 }],
  earnings: { commission: 3150, points: 2480 }, milestone: { label: 'Regalia Gold annual fee waiver', target: 400000, spent: 286500 },
};
export const INITIAL_POOL = [
  { id: 'c-ananya', name: 'Ananya', city: 'Pune', online: true, accept: 0.92, speedMin: 4, rating: 4.9, jobs: 38, lastJobMins: 190, maxOrder: 120000, minCommission: 200, merchants: ['Flipkart', 'Amazon'], quota: {}, cards: [{ bank: 'HDFC', type: 'credit', variant: 'Millennia', dueDay: 18 }] },
  { id: 'c-farhan', name: 'Farhan', city: 'Hyderabad', online: true, accept: 0.85, speedMin: 6, rating: 4.8, jobs: 61, lastJobMins: 25, maxOrder: 200000, minCommission: 300, merchants: ['Flipkart', 'Amazon'], quota: { 'fk-hdfc-cc': 2, 'fk-iphone-hdfc': 1 }, cards: [{ bank: 'HDFC', type: 'credit', variant: 'Infinia', dueDay: 22 }, { bank: 'Axis', type: 'credit', variant: 'Atlas', dueDay: 10 }] },
  { id: 'c-sneha', name: 'Sneha', city: 'Chennai', online: false, accept: 0.9, speedMin: 5, rating: 4.7, jobs: 20, lastJobMins: 900, maxOrder: 100000, minCommission: 150, merchants: ['Flipkart', 'Amazon'], quota: {}, cards: [{ bank: 'HDFC', type: 'credit', variant: 'Swiggy', dueDay: 3 }] },
  { id: 'c-vikram', name: 'Vikram', city: 'Jaipur', online: true, accept: 0.7, speedMin: 9, rating: 4.6, jobs: 17, lastJobMins: 600, maxOrder: 60000, minCommission: 150, merchants: ['Amazon', 'Flipkart'], quota: {}, cards: [{ bank: 'SBI', type: 'credit', variant: 'SimplyCLICK', dueDay: 12 }, { bank: 'Kotak', type: 'credit', variant: 'League', dueDay: 8 }] },
  { id: 'c-priya', name: 'Priya', city: 'Mumbai', online: true, accept: 0.95, speedMin: 3, rating: 5.0, jobs: 84, lastJobMins: 45, maxOrder: 150000, minCommission: 250, merchants: ['Amazon'], quota: {}, cards: [{ bank: 'SBI', type: 'credit', variant: 'Elite', dueDay: 28 }, { bank: 'ICICI', type: 'credit', variant: 'Amazon Pay', dueDay: 20 }] },
  { id: 'c-rohan', name: 'Rohan', city: 'Kolkata', online: true, accept: 0.6, speedMin: 12, rating: 4.4, jobs: 9, lastJobMins: 1440, maxOrder: 45000, minCommission: 100, merchants: ['Flipkart'], quota: {}, cards: [{ bank: 'HDFC', type: 'credit', variant: 'Regalia', dueDay: 6 }] },
  { id: 'c-isha', name: 'Isha', city: 'Noida', online: true, accept: 0.88, speedMin: 5, rating: 4.7, jobs: 23, lastJobMins: 300, maxOrder: 100000, minCommission: 200, merchants: ['Amazon', 'Flipkart'], quota: {}, cards: [{ bank: 'Kotak', type: 'credit', variant: 'Myntra', dueDay: 14 }, { bank: 'ICICI', type: 'credit', variant: 'Coral', dueDay: 2 }] },
  { id: 'c-arjun', name: 'Arjun', city: 'Ahmedabad', online: false, accept: 0.8, speedMin: 7, rating: 4.5, jobs: 14, lastJobMins: 2000, maxOrder: 150000, minCommission: 200, merchants: ['Flipkart', 'Amazon'], quota: {}, cards: [{ bank: 'Axis', type: 'credit', variant: 'Magnus', dueDay: 25 }] },
  { id: 'riya', name: 'Riya', city: 'Bengaluru', online: true, accept: 0.9, speedMin: 6, rating: 4.8, jobs: 5, lastJobMins: 800, maxOrder: 80000, minCommission: 150, merchants: ['Flipkart', 'Amazon'], quota: {}, cards: [{ bank: 'ICICI', type: 'credit', variant: 'Coral', dueDay: 9 }] },
];
export const INITIAL_VOUCHERS = [
  { id: 'v1', brand: 'Swiggy', kind: 'promo', face: 150, minOrder: 399, expires: '2026-12-05', price: 50, code: 'SWGY150XK9', seller: 'Meera', sellerRating: 4.9, status: 'listed' },
  { id: 'v2', brand: 'Zomato', kind: 'promo', face: 120, minOrder: 299, expires: '2026-11-27', price: 20, code: 'ZOM120PQ7T', seller: 'Dev', sellerRating: 4.7, status: 'listed' },
  { id: 'v3', brand: 'Myntra', kind: 'promo', face: 500, minOrder: 2499, expires: '2026-12-20', price: 150, code: 'MYN500TRZ4', seller: 'Aisha', sellerRating: 4.8, status: 'listed' },
  { id: 'v4', brand: 'Flipkart', kind: 'promo', face: 500, minOrder: 30000, expires: '2026-12-10', price: 180, code: 'FKELEC500A', seller: 'Nikhil', sellerRating: 4.6, status: 'listed', note: 'Electronics only' },
  { id: 'v5', brand: 'Amazon', kind: 'gift', face: 1000, minOrder: 0, expires: '2027-11-01', price: 920, code: 'AQ7M-9KD1-ZT4P', seller: 'Sana', sellerRating: 5.0, status: 'listed' },
  { id: 'v6', brand: 'Amazon', kind: 'promo', face: 100, minOrder: 999, expires: '2026-12-01', price: 30, code: 'AMZ100OFFB', seller: 'Karan', sellerRating: 4.5, status: 'listed' },
  { id: 'v7', brand: 'BookMyShow', kind: 'promo', face: 200, minOrder: 400, expires: '2026-11-30', price: 45, code: 'BMS200DUO8', seller: 'Tara', sellerRating: 4.9, status: 'listed', note: 'For 2 tickets' },
  { id: 'v8', brand: 'Uber', kind: 'promo', face: 100, minOrder: 0, expires: '2026-12-15', price: 25, code: 'UBR100RIDE', seller: 'Om', sellerRating: 4.4, status: 'listed' },
  { id: 'v9', brand: 'Swiggy', kind: 'promo', face: 100, minOrder: 299, expires: '2026-11-20', price: 30, code: 'SWGYOLD77X', seller: 'Ravi', sellerRating: 4.2, status: 'listed' },
];
export const SCANNED_SAMPLE = [
  { brand: 'Swiggy', kind: 'promo', face: 100, minOrder: 349, expires: '2026-12-08', code: 'GPAYSWG100' },
  { brand: 'Myntra', kind: 'promo', face: 300, minOrder: 1999, expires: '2026-11-28', code: 'CREDMYN300' },
  { brand: 'Uber', kind: 'promo', face: 75, minOrder: 0, expires: '2026-12-31', code: 'PPUBER75XQ' },
];
export const DEMAND = { Swiggy: 1.1, Zomato: 1.1, Flipkart: 1.2, Amazon: 1.2, Myntra: 1.0, BookMyShow: 0.9, Uber: 0.9 };
