"""اختبار متصفح: يفتح الصفحة وكل لعبة، يرصد أخطاء JS، ويحفظ صوراً في tests/shots/
التشغيل: python3 tests/smoke.py   (يحتاج: pip install playwright && playwright install chromium)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = "file://" + os.path.join(ROOT, "site", "index.html")
SHOTS = os.path.join(ROOT, "tests", "shots"); os.makedirs(SHOTS, exist_ok=True)
GAMES = ["bank", "cards", "list", "who", "taboo", "hurof", "prov", "flag", "dots"]

errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(PAGE); pg.wait_for_timeout(800)
    tiles = pg.locator("#menu .tile").count()
    print("مربعات الألعاب:", tiles)
    pg.screenshot(path=os.path.join(SHOTS, "home.png"), full_page=True)
    for g in GAMES:
        pg.evaluate(f'openGame("{g}")'); pg.wait_for_timeout(250)
        if g == "cards":
            pg.evaluate("flipCard(0)"); pg.wait_for_timeout(500)
        elif g == "hurof":
            pg.evaluate("pick(12)"); pg.wait_for_timeout(200)
        elif g == "list":
            pg.evaluate("toggleSlot(0)")
        else:
            pg.evaluate("revealed=true;render()")
        pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(SHOTS, f"{g}.png"))
        stage = pg.inner_text("#stage") if g != "cards" else pg.inner_text("#ov")
        print(f"✓ {g}: {stage.strip()[:50]!r}")
        if g == "cards": pg.evaluate("closeCard()")
        pg.evaluate("goHome()")
    b.close()

if tiles != len(GAMES): errs.append(f"expected {len(GAMES)} tiles, got {tiles}")
print("\n✗ أخطاء:\n" + "\n".join(errs) if errs else "\n✓ لا أخطاء JavaScript")
sys.exit(1 if errs else 0)
