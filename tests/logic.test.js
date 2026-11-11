// اختبار منطق كل الألعاب: منع التكرار، التجديد بالتوليد، حروف، الأوراق، القوائم، بدون نقاط
const { loadPage } = require("../tools/load-page");
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const ok = (c, msg) => { console.log((c ? "✓ " : "✗ ") + msg); if (!c) fails++; };

(async () => {
  // ---- بدون sample: الأسئلة الثابتة + منع التكرار + الخلاص
  {
    const P = loadPage();
    await wait(30);
    for (const g of ["bank", "who", "taboo", "prov", "flag", "dots", "list"]) {
      P.openGame(g);
      const n = P.deck.length;
      const shown = new Set();
      for (let i = 0; i < n; i++) { shown.add(P.idOf(g, P.deck[P.pos])); P.revealed = true; P.render(); P.next(); }
      ok(shown.size === n && n > 0, `${P.GAMES[g].t}: ${n} عنصر ظهرت كلها بدون تكرار`);
      P.openGame(g);
      ok(P.deck.length === 0, `${P.GAMES[g].t}: بعد ما خلصت ما يرجع ولا عنصر`);
    }
    ok(P._store["seen2_bank"] && JSON.parse(P._store["seen2_bank"]).ids.length === P.BANK.length, "الحفظ في localStorage يشمل كل أسئلة البنك");
  }
  // ---- مع sample: تجديد لا نهائي
  {
    const P = loadPage({ withSample: true });
    await wait(30);
    ok(!!P.SAMPLE, "sample متاح (محاكاة)");
    for (const g of ["bank", "who", "taboo", "prov", "dots", "list"]) {
      P.openGame(g);
      const n0 = P.deck.length;
      for (let i = 0; i < n0 + 25; i++) { P.revealed = true; P.render(); P.next(); await wait(3); }
      ok(!!P.deck[P.pos], `${P.GAMES[g].t}: بعد ${n0} عنصر تجدد تلقائياً وما زال فيه أسئلة`);
    }
    // البنك: التصنيفات مختلطة
    P.openGame("bank");
    const cats = new Set(); for (let i = 0; i < 10 && P.deck[P.pos]; i++) { cats.add(P.deck[P.pos][0]); P.next(); }
    ok(cats.size >= 1, "البنك يعرض أسئلة");
  }
  // ---- اسحب ورقة
  {
    const P = loadPage();
    await wait(30);
    P.openGame("cards"); await wait(10);
    ok(P.cardsArr.length === 12, "اسحب ورقة: 12 ورقة");
    ok(P.cardsArr.filter(c => c.s).length === 4, "اسحب ورقة: 4 أوراق مفاجأة");
    const before = P.seen("bank").size;
    P.flipCard(0); P.closeCard(); P.flipCard(0);
    ok(P.seen("bank").size === before + 1, "قلب الورقة يعلّم السؤال ولا يُقلب مرتين");
  }
  // ---- اذكر وتكشف
  {
    const P = loadPage();
    await wait(30);
    P.openGame("list");
    const L = P.deck[P.pos];
    P.toggleSlot(0); ok(P.listOpen.has(0), "اذكر وتكشف: كشف خانة");
    P.toggleSlot(0); ok(!P.listOpen.has(0), "اذكر وتكشف: إخفاء خانة");
    P.x_all(); ok(P.listOpen.size === L.a.length, "اذكر وتكشف: اكشف الكل");
  }
  // ---- حروف
  {
    const P = loadPage();
    await wait(30);
    P.openGame("hurof");
    ok(P.board.length === 25 && new Set(P.board).size === 25, "حروف: 25 حرف مختلف");
    for (const i of [2, 7, 12, 17, 22]) { P.pick(i); await wait(2); P.take("r"); }
    ok(P.winner === "r", "حروف: الأحمر يفوز بطريق فوق↕تحت");
    P.newBoard();
    for (const i of [10, 11, 12, 13, 14]) { P.pick(i); await wait(2); P.take("g"); }
    ok(P.winner === "g", "حروف: الأخضر يفوز بطريق يمين↔يسار");
  }
  // ---- بدون نقاط
  {
    const P = loadPage();
    const u = P.undot("بيت ثقيف جنة غزة قلب في شيء");
    ok(!/[بتثنيقفجخذزشضظغة]/.test(u), "بدون نقاط: ما بقي أي حرف منقوط → " + u);
  }
  console.log(fails ? `\n✗ ${fails} فشل` : "\n✓ كل الاختبارات نجحت");
  process.exit(fails ? 1 : 0);
})();
