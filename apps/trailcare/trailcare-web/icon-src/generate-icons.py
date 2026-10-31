"""Generates the Trailcare app icon (a green painted trail blaze with a broom on spruce).

Writes favicon.svg and the PNG variants (Apple touch, Android/PWA, maskable).
PNGs are rendered with headless Google Chrome and resized with sips. macOS only.

Usage: python3 generate-icons.py [target dir]   (default: ../public)
"""
import os
import subprocess
import sys
import tempfile

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

BG = '#1d3a2c'
BLAZE = '#3fa152'

# blaze path from components/blaze.tsx (40x52), broom from components/icons.tsx (24x24)
MARK = f'''
  <g transform="translate(60 34) scale(3.4)">
    <path d="M3.5 4.2 C11 2.6 27 3.4 36.8 2.9 C37.6 14 36.4 32 37.4 48.6 C27 49.8 12 48.4 2.8 49.4 C2 36 3.6 17 3.5 4.2 Z" fill="{BLAZE}"/>
  </g>
  <g transform="translate(70 66) scale(5)" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 3 13.5 10.5"/>
    <path d="m10.5 9.5 4 4"/>
    <path d="M11 10.5 3 16l5 5 5.5-8"/>
    <path d="m6.5 13.8 2.2 4.6M9 12.2l2 4.3"/>
  </g>'''


def variants():
    rounded = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="{BG}"/>{MARK}</svg>'
    # iOS rounds the corners itself
    full = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="{BG}"/>{MARK}</svg>'
    # Android maskable icons: keep the mark inside the 80 % safe zone
    maskable = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="{BG}"/>'
        f'<g transform="translate(25.6 25.6) scale(0.8)">{MARK}</g></svg>'
    )
    return {'rounded': rounded, 'full': full, 'maskable': maskable}


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


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'public')
    svgs = variants()
    with open(os.path.join(target, 'favicon.svg'), 'w') as fh:
        fh.write(svgs['rounded'])

    with tempfile.TemporaryDirectory() as work:
        rounded = render(svgs['rounded'], 'rounded', work)
        full = render(svgs['full'], 'full', work)
        maskable = render(svgs['maskable'], 'maskable', work)
        resize(full, 180, os.path.join(target, 'apple-touch-icon.png'))
        for size in (192, 512):
            resize(rounded, size, os.path.join(target, f'icon-{size}.png'))
            resize(maskable, size, os.path.join(target, f'icon-maskable-{size}.png'))


if __name__ == '__main__':
    main()
