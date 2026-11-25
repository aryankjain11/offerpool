# The original prototype

[`offerpool-prototype.html`](offerpool-prototype.html) is the single-file prototype that came before the real website. Everything is in one HTML page: the styles, the sample data, the rules, the simulated marketplace and the 28 evals. It was first published as a Claude artifact, and went through three versions:

1. **First build:** a light, teal-accented layout with Shop, Earn, Vouchers, Engine and Evals tabs.
2. **Redesign:** the dark kintsugi look and the ten design rules (see [DESIGN.md](../docs/DESIGN.md)).
3. **Plain language and a smooth checkout:** this file, the last version.

The real website in [`src/`](../src/) is this same prototype split into modules, with a Vite build, `npm test`, and Vercel hosting. The behaviour and the evals are unchanged.

To run it, download the file and open it in any modern browser. Nothing needs installing.
