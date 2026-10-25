"""アプリアイコン(1024x1024 PNG)を生成する。

使い方: python3 scripts/make_icon.py <出力PNG>
その後 `npx tauri icon <出力PNG>` で各サイズ・icns を生成する。
"""
import sys
from PIL import Image, ImageDraw

SIZE = 1024
SS = 4  # スーパーサンプリング倍率(縁を滑らかにする)
S = SIZE * SS


def px(v):
    return int(v * SS)


def bezier(p0, p1, p2, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2[1]
        pts.append((px(x), px(y)))
    return pts


def main(out):
    # 背景: 角丸の四角形(macOSの余白付き)+縦グラデーション
    grad = Image.new("RGB", (S, S))
    gd = ImageDraw.Draw(grad)
    top, bottom = (72, 104, 224), (38, 52, 140)
    for y in range(S):
        t = y / (S - 1)
        gd.line([(0, y), (S, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([px(100), px(100), px(924), px(924)], radius=px(190), fill=255)
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)

    # 紙
    d.rounded_rectangle([px(282), px(236), px(742), px(796)], radius=px(36), fill=(255, 255, 255, 255))
    # 文章の行
    for y, w in ((336, 340), (416, 340), (496, 250)):
        d.rounded_rectangle([px(332), px(y), px(332 + w), px(y + 28)], radius=px(14), fill=(150, 168, 238, 255))

    gold = (247, 185, 66, 255)
    thread = (238, 96, 84, 255)
    # 並縫い(破線)
    x = 332
    while x < 692:
        d.rounded_rectangle([px(x), px(650), px(min(x + 44, 692)), px(670)], radius=px(10), fill=thread)
        x += 72

    # 針と糸
    d.line(bezier((812, 214), (880, 470), (700, 650)), fill=thread, width=px(12), joint="curve")
    d.line([(px(822), px(190)), (px(560), px(560))], fill=gold, width=px(22))
    d.ellipse([px(804), px(174), px(844), px(214)], fill=gold)
    d.ellipse([px(816), px(186), px(832), px(202)], fill=(55, 80, 190, 255))

    img.resize((SIZE, SIZE), Image.LANCZOS).save(out)


if __name__ == "__main__":
    main(sys.argv[1])
