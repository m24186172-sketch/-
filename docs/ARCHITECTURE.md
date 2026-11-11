# بنية الكود: site/index.html

ملف واحد مقسّم بتعليقات واضحة. ابحث عنها بـgrep.

## 1) `<head>` و CSS
- الخطوط من Google Fonts: Amiri وReem Kufi وTajawal.
- متغيرات الألوان في `:root`: `--navy` و`--blue` و`--bg` و`--card` و`--card2` و`--line` و`--green` و`--red`. (`--gold` صار يساوي الأزرق، واسمه قديم من النسخة الأولى.)
- الأقسام بالترتيب: الأساس، ثم إضافات (الحروف، البنك، القصاصات، الأوراق، الخانات)، ثم قسم `/* ===== تحسينات ===== */` (الحركات والمؤقت الدائري).

## 2) HTML
- `#home`: يحتوي `.hero` (النقشة والشعار والعنوان)، ثم `.secTitle`، ثم `#menu` (تُبنى بالـJS)، ثم `.foot`.
- `#game`: يحتوي `.top` (الرجوع و`#gTitle` و⛶)، ثم `#chips` (فلاتر التصنيفات)، ثم `#stage` (المحتوى)، ثم `#btns`، ثم `#count`.

## 3) البيانات (`/* ===================== البيانات`)
| الثابت | الشكل | اللعبة |
|---|---|---|
| `WHO` | `{c, a, k:[تلميحات]}` | who |
| `TABOO` | `[كلمة, م1..م4]` | taboo |
| `SCRAMBLE` | `[تصنيف, كلمة]` | **غير مستخدم** (لعبة محذوفة) |
| `PROVERBS` | `[بداية, نهاية]` | prov |
| `FLAGS` | `[إيموجي, دولة, عاصمة]` | flag |
| `QUOTES` | `[تصنيف, نص, قائل, تلميح, معلومة]` | dots (أول 3 حقول) |
| `PHRASES` | `[تصنيف, نص, قائل]` | dots |
| `HUROF` | `{حرف: [[سؤال, جواب]...]}` (28 حرفاً) | hurof |
| `BANK` | `[تصنيف, سؤال, جواب]` | bank + cards |
| `LISTS` | `{c, t, a:[عناصر]}` | list |

التصنيفات: دين، صحابة، تاريخ، علماء، جغرافيا، عام (وفي dots: شعر ومثل).

## 4) المحرك (`/* ===================== المحرك`)
- `GAMES`: لكل لعبة `{t, col, i (SVG), d, cats?, data, cat?}`، وترتيبه = ترتيب الصفحة الرئيسية.
- `TXT[g](x)`: النص المميِّز للعنصر. ومنه `idOf` = `hash(norm(text))`. التطبيع يشيل التشكيل وعلامات الترقيم ويوحّد أ/إ/آ وة/ه وى/ي.

### الحفظ («اللي انفتح ما يرجع»)
- `seen(g)` و`markSeen(g,x)` و`isSeen` و`resetSeen` و`persist(g)`.
- localStorage: `seen2_<g>`. وdb: `data/users/<uid>/seen_<g>` بصيغة `{ids, recent}`، وكتابة واحدة في كل مرة (`saving` و`dirty`).
- عند التحميل: `claude.use("db"|"user"|"sample")`، ثم دمج المحفوظ في db، ثم `build()`.

### التوليد (`/* ---------- توليد أسئلة جديدة`)
- `RULES`: القواعد العامة (بدون رياضة، صعب، معلومات مؤكدة، JSON فقط).
- `GEN[g](key)` يرجّع `{p: prompt, map, ok}`. للبنك `key="mix"` (نصفه ديني) أو اسم تصنيف، ولحروف `key` = الحرف.
- `generate(g,key)` يستدعي `SAMPLE.json(prompt,{modelTier:"default"})`، ويطبّع النتيجة، ويستبعد المكرر، ويضيفها لـ`POOL[g]`.
- `maybeGen(force)`: يولّد لما يبقى في الـdeck ≤4. وعند `rate_limited` أو `not_granted` تظهر رسالة، ومع `not_granted` يُعطَّل التوليد.

### الواجهة
- `openGame` و`build` و`show` و`next` و`render`: ألعاب الـdeck (bank, who, taboo, prov, flag, dots, list) تشترك في نفس التدفق.
- `unseenItems(g)` = البيانات + `POOL[g]`، ناقص اللي انشاف.
- `render()` فيه فرع لكل لعبة. `cards` و`hurof` لهما دوال خاصة: `renderCards` و`renderHurof`.
- `list`: `listOpen` (Set) و`toggleSlot` و`x_all`.
- `cards`: `dealCards` (12 ورقة: 4 منها خاصة من `SPECIAL`) و`flipCard` و`closeCard`. والنافذة `#ov` تُضاف لـbody.
- `hurof`: `newBoard` و`pick` و`nextHQ` و`take` و`checkWin` (BFS على تجاور odd-r) و`confetti()`.
- `taboo`: `ringHTML` و`updRing` و`startTimer` (60ث).
- `undot(t)`: جدول `UNDOT` يحوّل الحروف المنقوطة لأشكالها بلا نقاط (ب ت ث→ٮ، ن→ں، ق→ٯ، ف→ڡ، ي→ى ...).
- `toggleFS()`: ملء الشاشة.

## إضافة محتوى
- سؤال بنك: أضف `["تصنيف","السؤال؟","الجواب"]` داخل `BANK`.
- قائمة: أضف `{c:"تصنيف",t:"العنوان",a:[...]}` داخل `LISTS`.
- بعدها شغّل `node tools/check-data.js`.
