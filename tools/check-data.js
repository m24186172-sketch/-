// يعدّ المحتوى لكل لعبة وتصنيف، ويكشف التكرار والكلمات الرياضية الممنوعة
const { loadPage } = require("./load-page");
const P = loadPage();
let problems = 0;

function dupCheck(name, g, arr) {
  const seen = new Map();
  arr.forEach(x => {
    const id = P.idOf(g, x);
    if (seen.has(id)) { problems++; console.log(`  ✗ تكرار في ${name}:`, JSON.stringify(x).slice(0, 80)); }
    seen.set(id, 1);
  });
}
const byCat = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});

console.log("بنك الأسئلة:", P.BANK.length, JSON.stringify(byCat(P.BANK, x => x[0])));
console.log("اذكر وتكشف:", P.LISTS.length, JSON.stringify(byCat(P.LISTS, x => x.c)));
console.log("من أنا:", P.WHO.length, JSON.stringify(byCat(P.WHO, x => x.c)));
console.log("لا تقول الكلمة:", P.TABOO.length);
console.log("كمّل المثل:", P.PROVERBS.length);
console.log("حزّر الدولة:", P.FLAGS.length);
console.log("بدون نقاط:", P.GAMES.dots.data.length);
console.log("حروف:", Object.keys(P.HUROF).length, "حرف،", Object.values(P.HUROF).reduce((a, b) => a + b.length, 0), "سؤال");

dupCheck("البنك", "bank", P.BANK);
dupCheck("القوائم", "list", P.LISTS);
dupCheck("من أنا", "who", P.WHO);
dupCheck("لا تقول الكلمة", "taboo", P.TABOO);
dupCheck("الأمثال", "prov", P.PROVERBS);
dupCheck("الأعلام", "flag", P.FLAGS);
dupCheck("بدون نقاط", "dots", P.GAMES.dots.data);

P.BANK.forEach(x => { if (x.length !== 3 || !x[1] || !x[2]) { problems++; console.log("  ✗ سؤال ناقص:", x); } });
const sport = /كرة|كأس العالم|أولمبي|منتخب|هوكي|ملعب|دوري|بطولة/;
const all = JSON.stringify([P.BANK, P.LISTS, P.TABOO, P.WHO, P.GAMES.dots.data]);
P.BANK.forEach(x => { if (sport.test(x[1] + x[2])) { problems++; console.log("  ✗ محتوى رياضي:", x[1]); } });

console.log(problems ? `\n✗ ${problems} مشكلة` : "\n✓ لا تكرار ولا محتوى رياضي");
process.exit(problems ? 1 : 0);
