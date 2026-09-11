"""Flux Field pattern family as vector SVG. Mirrors src/app.js exactly (same blade, same field maths)."""
import math
DELTA = math.radians(20.2); E1 = 0.83

def hash_(i, j, s=0):
    x = math.sin(i*127.1 + j*311.7 + s*74.7) * 43758.5453
    return x - math.floor(x)

def blade(x, y, a, ln):
    tx, ty = x + math.cos(a)*ln*.5, y + math.sin(a)*ln*.5; b = a + math.pi
    return [(tx, ty), (tx + math.cos(b)*ln*E1, ty + math.sin(b)*ln*E1), (tx + math.cos(b+DELTA)*ln, ty + math.sin(b+DELTA)*ln)]

def f(v): return ('%.2f' % v).rstrip('0').rstrip('.')
def pts(p): return ' '.join(f(a)+','+f(b) for a, b in p)

def flux(w, h, step=None, cx=.62, cy=.5, ring=.34, spread=.2, twist=.3, alpha=.9, share=.07, ink='#0D0E13', accent='#1AA6E6',
         seed=0, lenk=1.0, floor=.04, orbit_only=False, t=0.0, mask=None, raw=False):
    """Field mode. mask(x,y) -> multiplier 0..1 for crops/fades."""
    s = step or max(14, w/64); cxp, cyp = w*cx, h*cy; m = min(w, h); R = m*ring; sp = m*spread
    groups = {}
    j = -1; y = s/2
    while y < h + s:
        i = -1; x = s/2
        while x < w + s:
            dx, dy = x - cxp, y - cyp; r = math.hypot(dx, dy)
            band = math.exp(-((r - R)/sp)**2); core = math.exp(-(r/(R*.45))**2)*.5
            k = max(band, core*.6)
            if k < floor: k = floor
            a = math.atan2(dy, dx) + math.pi/2 + twist + .22*math.sin(r*.012 - t*.55)
            ln = s*(.18 + .8*k)*lenk
            isA = band > .62 and hash_(i, j, seed) < share
            al = 1.0 if isA else alpha*(.07 + .93*k)
            if mask: al *= mask(x/w, y/h)
            if orbit_only and band < .12: al = 0
            if al > .02:
                key = ('a' if isA else 'i', round(al*20))
                groups.setdefault(key, []).append(blade(x, y, a, ln))
            x += s; i += 1
        y += s; j += 1
    return groups_raw(groups, ink, accent) if raw else _emit(groups, ink, accent)

def stream(w, h, step=None, alpha=.85, spread=.2, share=.05, ink='#0D0E13', accent='#1AA6E6', seed=0, fade_right=False, t=0.0, mask=None, raw=False):
    s = step or max(12, h/14); groups = {}
    j = 0; y = s/2
    while y < h + s:
        i = 0; x = s/2
        while x < w + s:
            u, v = x/w, y/h
            a = -.36 + .28*math.sin(u*5.2 + v*2.4 + t*.35) + .16*math.sin(u*11 - v*4)
            band = math.exp(-((v - (.5 + .22*math.sin(u*3.4 + .6)))/spread)**2)
            fade = min(1, u*1.8) * (min(1, (1-u)*3) if fade_right else 1)
            k = max(.05, band*fade); ln = s*(.2 + .95*k)
            isA = band > .7 and hash_(i, j, seed) < share and u > .35
            al = 1.0 if isA else alpha*(.14 + .86*k)
            if mask: al *= mask(u, v)
            if al > .02:
                groups.setdefault(('a' if isA else 'i', round(al*20)), []).append(blade(x, y, a, ln))
            x += s; i += 1
        y += s; j += 1
    return groups_raw(groups, ink, accent) if raw else _emit(groups, ink, accent)

def groups_raw(groups, ink, accent):
    return [((accent if k == 'a' else ink), lv/20, polys) for (k, lv), polys in sorted(groups.items())]

def _emit(groups, ink, accent):
    out = []
    for (kind, lv), polys in sorted(groups.items()):
        col = accent if kind == 'a' else ink
        d = ''.join('M' + pts(p) + 'Z' for p in polys)
        out.append(f'<path fill="{col}" fill-opacity="{f(lv/20)}" d="{d}"/>')
    return ''.join(out)

def svg(w, h, body, bg=None, extra='', vb=None):
    vb = vb or f'0 0 {w} {h}'
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">{bgr}{extra}{body}</svg>'

# masks
def mask_right(u, v): return min(1, max(0, (u - .34)/.36))
def mask_bottom(u, v): return min(1, max(0, (v - .45)/.35))
def mask_top(u, v): return min(1, max(0, 1 - (v - .3)/.35))
def mask_left(u, v): return min(1, max(0, 1 - (u - .3)/.4))

FAMILY = {
  # name: (fn, kwargs, dark?)
  'field':  ('flux',   dict(cx=.62, cy=.5, ring=.34, spread=.18, alpha=.85, share=.06)),
  'stream': ('stream', dict(alpha=.85, spread=.16, share=.05)),
  'ring':   ('flux',   dict(cx=.78, cy=.28, ring=.5, spread=.11, alpha=.8, share=.05, orbit_only=True, floor=.02)),
  'fine':   ('flux',   dict(cx=.7, cy=.6, ring=.5, spread=.3, alpha=.5, share=0, floor=.35, lenk=.75)),
  'macro':  ('flux',   dict(cx=.78, cy=.42, ring=.55, spread=.14, alpha=.9, share=.05, floor=.03)),
  'edge':   ('flux',   dict(cx=1.02, cy=.9, ring=.52, spread=.16, alpha=.85, share=.05)),
  'dense':  ('flux',   dict(cx=.5, cy=.5, ring=.34, spread=.2, alpha=.8, share=.06)),
  'calm':   ('flux',   dict(cx=.62, cy=.5, ring=.34, spread=.18, alpha=.42, share=0, floor=.06)),
}
STEP = {'fine': 1/110, 'macro': 1/22, 'dense': 1/96, 'edge': 1/64, 'field': 1/64, 'ring': 1/64, 'calm': 1/64, 'stream': None}

def family(name, w, h, dark=False, accent='#1AA6E6', mask=None, raw=False):
    fn, kw = FAMILY[name]; kw = dict(kw); kw['raw'] = raw
    ink = '#F5F6F7' if dark else '#0D0E13'
    st = STEP.get(name)
    if fn == 'flux':
        return flux(w, h, step=(max(6, w*st) if st else None), ink=ink, accent=accent, mask=mask, **kw)
    return stream(w, h, step=max(10, h/14), ink=ink, accent=accent, mask=mask, **kw)

def river(w, h, step, spread=.16, amp=.22, freq=3.4, alpha=.92, share=.05, ink='#0D0E13', accent='#74C3F2', fade_in=1.8, fade_right=False, fade_out=3, opening=None, floor=.14, cy0=.5, seed=0, raw=False):
    """The Stream, generalised (Brand Refresh 2026): spread may open along x, the resting grid may vanish (floor 0), any density."""
    s = step; groups = {}
    j = 0; y = s/2
    while y < h + s:
        i = 0; x = s/2
        while x < w + s:
            u, v = x/w, y/h
            a = -.36 + .28*math.sin(u*5.2 + v*2.4) + .16*math.sin(u*11 - v*4)
            sp = spread if opening is None else opening[0] + (opening[1] - opening[0])*min(1, max(0, u))
            band = math.exp(-((v - (cy0 + amp*math.sin(u*freq + .6)))/sp)**2)
            fade = min(1, u*fade_in) * (min(1, (1-u)*fade_out) if fade_right else 1)
            k = max(.05, band*fade); ln = s*(.2 + .95*k)
            isA = band > .7 and hash_(i, j, seed) < share and u > .3
            al = 1.0 if isA else alpha*(floor + (1-floor)*k)
            if al > .02:
                groups.setdefault(('a' if isA else 'i', round(al*20)), []).append(blade(x, y, a, ln))
            x += s; i += 1
        y += s; j += 1
    return groups_raw(groups, ink, accent) if raw else _emit(groups, ink, accent)
