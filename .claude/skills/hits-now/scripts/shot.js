// 사용: NODE_PATH=$(npm root -g) node shot.js <out 폴더>
// out/*.html 을 1080x1350 PNG 로 저장하고, 영역 끝 위치를 출력한다(넘침 점검용).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[2] || 'out';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
    await p.goto('file://' + path.resolve(dir, f));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const ext = await p.evaluate(() => {
      const r = [];
      document.querySelectorAll('.txt,.tb,.src,.refs,.big,.sub').forEach(e => {
        const b = e.getBoundingClientRect();
        r.push([e.className, Math.round(b.top), Math.round(b.bottom)]);
      });
      const broken = [...document.images].filter(i => !(i.complete && i.naturalWidth > 0)).length;
      return { r, broken };
    });
    console.log(f, JSON.stringify(ext));
    await p.screenshot({ path: path.join(dir, f.replace('.html', '.png')) });
  }
  await b.close();
})();
