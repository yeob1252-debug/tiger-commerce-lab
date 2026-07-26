"""assets/characters/logo.png에서 원형 배지(호랑이 얼굴) 부분만 정확히
잘라내 카카오톡 등 링크 공유 시 쓰이는 og:image(1200x630)를 새로 만든다.

로고 원본은 실제 원형 배지보다 훨씬 넓은 캔버스(체크무늬 배경 포함)를
갖고 있어서, 원의 중심/반지름을 채도 기준으로 계산해 그 원만 정확히
크롭 + 원형 마스크 처리한 뒤, 사이트 크림색 배경 위에 올린다.
크롭 사각형의 모서리에 체크무늬가 살짝 걸려도 원형 마스크가 가려주므로
결과물에는 체크무늬가 전혀 남지 않는다.
"""
import os
from PIL import Image, ImageDraw
import numpy as np

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "assets", "characters", "logo.png")
DST = os.path.join(BASE, "assets", "og-image.png")

CANVAS_W, CANVAS_H = 1200, 630
BG_COLOR = (255, 243, 225, 255)  # --bg-alt #FFF3E1, 사이트 크림톤
BADGE_DIAMETER = 480  # 캔버스에 배치할 원형 로고 지름

# 1) 원본에서 배지 원의 중심/반지름을 채도 기준으로 계산
src = Image.open(SRC).convert("RGBA")
arr = np.array(src)
rgb = arr[:, :, :3].astype(np.int16)
sat = rgb.max(axis=2) - rgb.min(axis=2)
ys, xs = np.where(sat > 15)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
radius = max(x1 - x0, y1 - y0) / 2
print(f"badge circle: center=({cx:.1f},{cy:.1f}) radius={radius:.1f}")

# 2) 배지 원을 정사각형으로 크롭
pad = 4
left = int(cx - radius - pad)
top = int(cy - radius - pad)
size = int((radius + pad) * 2)
crop = src.crop((left, top, left + size, top + size))

# 3) 크롭 정사각형과 같은 크기의 원형 마스크를 만들어 원 밖(체크무늬 모서리 포함)을 투명 처리
mask = Image.new("L", (size, size), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((pad, pad, pad + radius * 2, pad + radius * 2), fill=255)
crop.putalpha(mask)

# 4) 최종 og:image 캔버스: 크림색 배경 + 중앙에 원형 로고
badge = crop.resize((BADGE_DIAMETER, BADGE_DIAMETER), Image.LANCZOS)
canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), BG_COLOR)
paste_x = (CANVAS_W - BADGE_DIAMETER) // 2
paste_y = (CANVAS_H - BADGE_DIAMETER) // 2
canvas.paste(badge, (paste_x, paste_y), badge)

canvas.convert("RGB").save(DST, "PNG")
print(f"saved {DST} size={canvas.size}")
