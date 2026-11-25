// Runs the same 28 evals the app shows in its Tests tab.
import { describe, it, expect } from 'vitest';
import { EVALS } from '../src/evals.js';

describe('OfferPool evals', () => {
  for (const [id, area, name, fn] of EVALS) {
    it(`${id} · ${area} · ${name}`, () => {
      const r = fn();
      expect(r.pass, `expected: ${r.expected} | got: ${r.actual}`).toBe(true);
    });
  }
});
