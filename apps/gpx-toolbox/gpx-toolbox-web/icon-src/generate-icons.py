"""Generates the GPX-Toolcat app icon (cat playing with a hiking route coming out of a map).

Writes favicon.svg, favicon.ico and all PNG variants (Apple touch, Android/PWA, maskable).
PNGs are rendered with headless Google Chrome, which keeps real transparency
(macOS QuickLook flattens onto white), and resized with sips. macOS only.

Usage: python3 generate-icons.py [target dir]   (default: ../public)
"""
import os
import re
import struct
import subprocess
import sys
import tempfile

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

BG = '#33568a'
ROUTE = '#e5382f'

# trails in map coordinates; the route follows the first two of them
TRAILS = ' '.join([
    'M32 50 C44 44 52 40 62 42 C76 44 84 60 96 62 C112 64 124 56 140 60',
    'M96 62 C108 64 112 76 106 84 C98 96 118 100 120 110 C122 120 100 126 102 138 C103 146 106 150 106 158',
    'M32 84 C52 80 50 70 74 70 C90 70 98 80 106 84',
    'M120 110 C136 108 146 96 162 100',
    'M102 138 C86 136 70 128 32 134',
])

MAP = f'''
  <rect x="32" y="30" width="144" height="128" rx="24" fill="#1f3558" transform="translate(0 4)"/>
  <clipPath id="tile"><rect x="32" y="30" width="144" height="128" rx="24"/></clipPath>
  <g clip-path="url(#tile)">
    <rect x="32" y="30" width="144" height="128" fill="#e9f0dc"/>
    <path d="M32 30 H92 C96 44 86 52 70 52 C58 52 54 62 42 66 C38 67 34 66 32 64 Z" fill="#c2dea9"/>
    <path d="M32 120 C46 112 60 118 66 132 C70 142 84 146 88 158 H32 Z" fill="#c2dea9"/>
    <path d="M150 104 C162 98 176 102 176 102 V158 H140 C136 140 140 112 150 104 Z" fill="#c2dea9"/>
    <g fill="none" stroke="#d3e2bb" stroke-width="2.5">
      <ellipse cx="66" cy="96" rx="26" ry="16"/>
      <ellipse cx="66" cy="96" rx="15" ry="9"/>
    </g>
    <path d="M62 97 L66 90 L70 97 Z" fill="#9db58a"/>
    <path d="M132 30 H176 V76 C160 80 146 70 140 58 C136 50 132 40 132 30 Z" fill="#a9d3f5"/>
    <path d="M144 66 C132 82 146 98 136 114 C128 128 140 142 134 158" fill="none" stroke="#a9d3f5" stroke-width="6" stroke-linecap="round"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="{TRAILS}" stroke="#cfdcbc" stroke-width="7"/>
      <path d="{TRAILS}" stroke="#ffffff" stroke-width="4"/>
    </g>
    <g fill="#acd093">
      <circle cx="44" cy="40" r="3.5"/><circle cx="56" cy="44" r="3"/><circle cx="76" cy="40" r="3.5"/><circle cx="46" cy="140" r="3.5"/><circle cx="58" cy="148" r="3"/>
    </g>
  </g>'''

ROUTE_ON_MAP = f'''
  <path d="M62 42 C76 44 84 60 96 62 C108 64 112 76 106 84 C98 96 118 100 120 110 C122 120 100 126 102 138 C103 146 106 150 106 158" fill="none" stroke="{ROUTE}" stroke-width="5.85" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="62" cy="42" r="8" fill="#ffffff" stroke="{ROUTE}" stroke-width="4.5"/>'''

# map is scaled by 1.2 around its top-left corner, so the route leaves the map at (109, 172)
MAP_GROUP = '<g transform="translate(20 18) scale(1.2) translate(-32 -30)">' + MAP + ROUTE_ON_MAP + '</g>'

ROUTE_OFF_MAP = f'''
  <path d="M109 170 C109 194 118 208 134 206 C148 204 150 188 140 186 C133 185 131 192 135 195" fill="none" stroke="{ROUTE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'''

OUTLINE = '#3a2a22'
FUR = '#a39684'
WARM = '#b98e62'
SHADE = '#857867'
LIGHT = '#eee6d8'
PINK = '#e4979a'
NOSE = '#c98778'


def cat(head_tilt):
    # local coordinates: head centre at (0,0), body bottom at y=76
    return f'''
  <g stroke="{OUTLINE}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 74 C46 74 54 56 44 44" fill="none" stroke-width="6"/>
    <path d="M-20 16 C-26 38 -28 60 -26 76 L26 76 C28 60 26 38 20 16 Z" fill="{FUR}" stroke-width="5"/>
    <ellipse cx="0" cy="48" rx="10" ry="17" fill="{LIGHT}" stroke="none"/>
    <path d="M-19 22 Q0 32 19 22 L20 17 Q0 26 -20 17 Z" fill="{SHADE}" stroke="none"/>
    <path d="M18 40 L25 41 M19 52 L26 52 M-18 52 L-25 52" fill="none" stroke-width="3.5"/>
    <path d="M8 58 L8 75" fill="none" stroke-width="4.5"/>
    <path d="M-14 40 Q-30 36 -42 20" fill="none" stroke-width="17"/>
    <path d="M-14 40 Q-30 36 -42 20" fill="none" stroke="{FUR}" stroke-width="8"/>
    <path d="M-25 33 L-30 40 M-33 26 L-39 31" fill="none" stroke-width="3.5"/>
    <circle cx="-43" cy="18" r="7.5" fill="{LIGHT}" stroke-width="4"/>
    <g transform="rotate({head_tilt})">
      <path d="M-27 -8 L-25 -38 L-5 -24 Z" fill="{FUR}" stroke-width="5"/>
      <path d="M27 -8 L25 -38 L5 -24 Z" fill="{WARM}" stroke-width="5"/>
      <path d="M-21 -16 L-20 -30 L-11 -23 Z M21 -16 L20 -30 L11 -23 Z" fill="{PINK}" stroke="none"/>
      <ellipse cx="0" cy="0" rx="31" ry="27" fill="{FUR}" stroke-width="5"/>
      <path d="M-6 -24 L-5 -16 M0 -26 L0 -17 M6 -24 L5 -16" fill="none" stroke-width="3.5"/>
      <circle cx="-11" cy="-2" r="3.4" fill="{OUTLINE}" stroke="none"/>
      <circle cx="11" cy="-2" r="3.4" fill="{OUTLINE}" stroke="none"/>
      <ellipse cx="0" cy="5" rx="4.2" ry="2.8" fill="{NOSE}" stroke="none"/>
      <path d="M0 7 L0 10 M-7 10 Q-3.5 15 0 10 Q3.5 15 7 10" fill="none" stroke-width="3"/>
      <path d="M-24 3 L-41 1 M-24 10 L-39 13 M24 3 L41 1 M24 10 L39 13" fill="none" stroke-width="3.5"/>
    </g>
  </g>'''


def icon(head_tilt=-14):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs><clipPath id="icon"><rect width="256" height="256" rx="56"/></clipPath></defs>
  <g clip-path="url(#icon)">
  <rect width="256" height="256" fill="{BG}"/>{MAP_GROUP}{ROUTE_OFF_MAP}
  <g transform="translate(198 150) scale(1.32)">{cat(head_tilt)}</g>
  </g>
</svg>'''


def variants():
    rounded = icon()
    # iOS rounds the corners itself
    full_bleed = rounded.replace('<rect width="256" height="256" rx="56"/>', '<rect width="256" height="256"/>')
    # Android maskable icons: keep everything inside the 80 % safe zone on a full-bleed background
    inner = re.sub(r'<defs>.*?</defs>', '', rounded, flags=re.S).replace(' clip-path="url(#icon)"', '')
    inner = inner.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">', '').replace('</svg>', '')
    maskable = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="{BG}"/>
  <g transform="translate(25.6 25.6) scale(0.8)">{inner}</g>
</svg>'''
    return {'rounded': rounded, 'full': full_bleed, 'maskable': maskable}


def render(svg, name, work):
    page = os.path.join(work, name + '.html')
    with open(page, 'w') as fh:
        fh.write('<!doctype html><html><head><style>html,body{margin:0;background:transparent}'
                 'svg{display:block;width:1024px;height:1024px}</style></head><body>' + svg + '</body></html>')
    out = os.path.join(work, name + '.png')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--default-background-color=00000000', '--window-size=1024,1024',
                    f'--screenshot={out}', 'file://' + page], check=True, capture_output=True, timeout=60)
    return out


def resize(master, size, out):
    subprocess.run(['sips', '-z', str(size), str(size), master, '--out', out], check=True, capture_output=True)
    return out


def write_ico(pngs, out):
    # ICO container with embedded PNGs, supported by all current browsers
    header = struct.pack('<HHH', 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries = b''
    for size, data in pngs:
        entries += struct.pack('<BBBBHHII', size, size, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
    with open(out, 'wb') as fh:
        fh.write(header + entries + b''.join(data for _, data in pngs))


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
    os.makedirs(target, exist_ok=True)
    svgs = variants()

    with open(os.path.join(target, 'favicon.svg'), 'w') as fh:
        fh.write(svgs['rounded'])

    work = tempfile.mkdtemp(prefix='gpx-toolcat-icons-')
    masters = {name: render(svg, name, work) for name, svg in svgs.items()}

    for master, size, name in [
        ('rounded', 96, 'favicon-96x96.png'),
        ('full', 180, 'apple-touch-icon.png'),
        ('rounded', 192, 'icon-192.png'),
        ('rounded', 512, 'icon-512.png'),
        ('maskable', 192, 'icon-maskable-192.png'),
        ('maskable', 512, 'icon-maskable-512.png'),
    ]:
        resize(masters[master], size, os.path.join(target, name))

    ico_pngs = []
    for size in [16, 32, 48]:
        with open(resize(masters['rounded'], size, os.path.join(work, f'ico-{size}.png')), 'rb') as fh:
            ico_pngs.append((size, fh.read()))
    write_ico(ico_pngs, os.path.join(target, 'favicon.ico'))


if __name__ == '__main__':
    main()
