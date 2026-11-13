// يحمّل سكربت site/index.html داخل Node مع DOM وهمي ومحاكاة اختيارية لـ claude.use
const fs = require("fs");
const path = require("path");

function loadPage({ withSample = false } = {}) {
  const html = fs.readFileSync(path.join(__dirname, "..", "site", "index.html"), "utf8");
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if (!m) throw new Error("no <script> found in index.html");
  const store = {};
  const els = {};
  const ctx = {
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = String(v)), removeItem: k => delete store[k] },
    document: {
      getElementById: id => els[id] || (els[id] = { innerHTML: "", textContent: "", classList: { add() {}, remove() {}, toggle() {} }, remove() {} }),
      createElement: () => ({ style: {}, appendChild() {}, remove() {}, className: "", innerHTML: "" }),
      body: { appendChild() {} },
    },
    calls: 0,
  };
  let sample = null;
  if (withSample) {
    let n = 0;
    sample = async () => ({ text: "" });
    sample.json = async p => {
      n++; ctx.calls++;
      const A = (k, f) => Array.from({ length: k }, (_, i) => f(i));
      if (p.includes("«من أنا؟»")) return A(8, i => ({ a: `شخص${n}_${i}`, k: ["a", "b", "c", "d"] }));
      if (p.includes("Taboo")) return A(15, i => ({ w: `كلمة${n}_${i}`, f: ["1", "2", "3", "4"] }));
      if (p.includes("ISO")) return [{ iso: "mx", n: "المكسيك", c: "x" }, { iso: "aq", n: `دولة${n}`, c: "y" }];
      if (p.includes("يبدأ بحرف")) return { items: A(6, i => ({ q: `س${n}_${i}`, a: "ج" })) };
      if (p.includes("مثلاً")) return A(12, i => ({ s: `بداية${n}_${i}`, e: "نهاية" }));
      if (p.includes("اذكر وتكشف")) return A(6, i => ({ t: `قائمة${n}_${i}`, a: ["1", "2", "3", "4"] }));
      if (p.includes("عبارة")) return A(12, i => ({ t: `عبارة رقم ${n}_${i}`, by: "" }));
      return A(12, i => ({ c: ["دين", "عام", "جغرافيا"][i % 3], q: `سؤال${n}_${i}`, a: "جواب" }));
    };
  }
  const claude = { use: async k => (k === "sample" ? sample : null) };
  const window = { scrollTo() {}, claude, addEventListener() {}, location: { hash: "" }, history: { pushState() {}, replaceState() {}, back() {} } };
  const fn = new Function("window", "claude", "localStorage", "document", "setTimeout", "setInterval", "clearInterval", "location", "history",
    m[1] + "\n;return {GAMES,BANK,LISTS,WHO,TABOO,PROVERBS,FLAGS,QUOTES,PHRASES,HUROF,idOf,seen,unseenItems,undot,checkWin," +
    "get deck(){return deck},get pos(){return pos},set revealed(v){revealed=v},openGame,next,render,show,dealCards,flipCard,closeCard,get cardsArr(){return cardsArr}," +
    "toggleSlot,x_all,get listOpen(){return listOpen},newBoard,pick,take,get winner(){return winner},get hq(){return hq},get board(){return board},get SAMPLE(){return SAMPLE}};");
  const api = fn(window, claude, ctx.localStorage, ctx.document, setTimeout, () => 0, () => {}, window.location, window.history);
  api._ctx = ctx; api._store = store;
  return api;
}
module.exports = { loadPage };
