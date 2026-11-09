#!/usr/bin/env python3
"""HITS NOW 카드 7장 제작 + (선택) 사이트 반영.

사용:
  python3 build_cards.py <작업폴더>            # 카드 PNG/모아보기 시트만 만든다 (미리보기)
  python3 build_cards.py <작업폴더> --publish  # + images/now/<id>/01~07.jpg 저장, data/now.json 갱신

작업폴더에는 edition.json 과 img/<뉴스 id>.jpg 가 있어야 한다(형식은 SKILL.md).
저장소 안에서 실행해야 --publish 가 올바른 경로를 쓴다(저장소 루트를 자동으로 찾음).
"""
import html, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')
E = lambda s: html.escape(s, quote=False)


def repo_root():
    p = HERE
    while p != '/' and not os.path.isdir(os.path.join(p, '.git')):
        p = os.path.dirname(p)
    return p


def ensure_fonts(work):
    f = os.path.join(work, 'fonts', 'node_modules', 'pretendard')
    if not os.path.isdir(f):
        os.makedirs(os.path.join(work, 'fonts'), exist_ok=True)
        subprocess.run(['npm', 'init', '-y'], cwd=os.path.join(work, 'fonts'), capture_output=True)
        subprocess.run(['npm', 'install', 'pretendard', '--silent'], cwd=os.path.join(work, 'fonts'), check=True)


def build_html(work, d):
    n = d['news']
    total = len(n) + 2
    dots = lambda i: ('<div class="wm">HITS Brand Lab</div><div class="dots">' +
                      ''.join('<i class="on"></i>' if k == i else '<i></i>' for k in range(1, total + 1)) + '</div>')
    bar = lambda i: f'<div class="bar"><b>HITS NOW</b><span>{i:02d} / {total:02d}</span></div>'
    strip = ''.join(f'<div><img src="../img/{x["id"]}.jpg" style="object-position:{x.get("pos", "50% 50%")}"></div>' for x in n)
    pages = [('cover', f'<div class="card dark cover">{bar(1)}<div class="lab">{E(d["label"])}</div>'
                       f'<div class="big">HITS<br><i>NOW</i></div><p class="sub">{E(d["subtitle"])}</p>'
                       f'<div class="strip">{strip}</div>{dots(1)}</div>')]
    for k, x in enumerate(n, start=2):
        pages.append((f'news{k - 1}',
                      f'<div class="card">{bar(k)}<div class="photo"><img src="../img/{x["id"]}.jpg" style="object-position:{x.get("pos", "50% 50%")}">'
                      f'<span class="credit">이미지 출처: {E(x["imgcredit"])}</span></div>'
                      f'<div class="txt"><div class="chip">{E(x["region"])} · {E(x["brand"])} <em>{E(x["tag"])}</em></div>'
                      f'<h2 class="hl">{E(x["headline"])}</h2><p class="bd">{E(x["body"])}</p></div>'
                      f'<div class="src">출처 · {E(x["source"])}</div>{dots(k)}</div>'))
    refs = ''.join(f'<li>{E(x["title"])} — {E(x["outlet"])}<small>{E(x["url"].replace("https://", "").replace("www.", ""))[:72]}…</small></li>' for x in n)
    ins = E(d['insight'])
    hl = d.get('insight_highlight')
    if hl and E(hl) in ins:
        ins = ins.replace(E(hl), f'<u>{E(hl)}</u>')
    pages.append(('insight', f'<div class="card dark ins">{bar(total)}<span class="k">오늘의 인사이트</span>'
                             f'<div class="big">{ins}</div><div class="refs"><h4>참고한 기사</h4><ul>{refs}</ul></div>{dots(total)}</div>'))
    out = os.path.join(work, 'out')
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    for name, body in pages:
        open(os.path.join(out, name + '.html'), 'w', encoding='utf-8').write(
            f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="../card.css"></head><body>{body}</body></html>')
    return [p[0] for p in pages]


def main():
    work = os.path.abspath(sys.argv[1])
    publish = '--publish' in sys.argv
    d = json.load(open(os.path.join(work, 'edition.json'), encoding='utf-8'))
    for x in d['news']:
        if not os.path.exists(os.path.join(work, 'img', x['id'] + '.jpg')):
            sys.exit(f'사진 없음: img/{x["id"]}.jpg')
    shutil.copy(os.path.join(ASSETS, 'card.css'), os.path.join(work, 'card.css'))
    ensure_fonts(work)
    names = build_html(work, d)
    npm_root = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
    r = subprocess.run(['node', os.path.join(HERE, 'shot.js'), os.path.join(work, 'out')],
                       env={**os.environ, 'NODE_PATH': npm_root}, capture_output=True, text=True)
    print(r.stdout, r.stderr)
    if r.returncode:
        sys.exit('렌더 실패')
    from PIL import Image
    ims = [Image.open(os.path.join(work, 'out', n + '.png')).convert('RGB') for n in names]
    w, h = 360, 450
    sheet = Image.new('RGB', (w * 4 + 50, h * 2 + 30), '#DCDCD6')
    for k, im in enumerate(ims):
        sheet.paste(im.resize((w, h)), (10 + (k % 4) * (w + 10), 10 + (k // 4) * (h + 10)))
    sheet.save(os.path.join(work, 'sheet.jpg'), quality=88)
    print('모아보기:', os.path.join(work, 'sheet.jpg'))
    if not publish:
        return
    root = repo_root()
    dst = os.path.join(root, 'images', 'now', d['id'])
    os.makedirs(dst, exist_ok=True)
    total = 0
    for i, im in enumerate(ims, 1):
        p = os.path.join(dst, f'{i:02d}.jpg')
        im.save(p, quality=82, optimize=True, progressive=True)
        total += os.path.getsize(p)
    path = os.path.join(root, 'data', 'now.json')
    data = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else []
    data = [x for x in data if x['no'] != d['no']]
    data.append({'no': d['no'], 'id': d['id'], 'insight': d['insight'],
                 'cards': [f'{i:02d}.jpg' for i in range(1, len(ims) + 1)],
                 'news': [{k: x[k] for k in ['region', 'brand', 'tag', 'headline', 'title', 'outlet', 'url']} for x in d['news']]})
    data.sort(key=lambda x: -x['no'])
    json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'저장: {dst} ({total // 1024}KB), data/now.json 회차 {[x["no"] for x in data]}')


if __name__ == '__main__':
    main()
