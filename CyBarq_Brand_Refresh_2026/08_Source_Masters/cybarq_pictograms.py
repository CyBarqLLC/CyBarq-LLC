"""CyBarq pictograms: 48 unit grid, 1.25 stroke, one blade of the symbol as the point of energy."""
import math, sys
sys.path.insert(0, 'build')
import pattern
def B(x, y, deg, ln):
    return f'<polygon class="blade" points="{pattern.pts(pattern.blade(x, y, math.radians(deg), ln))}"/>'

PICTOS = [
 ('Software', 'برمجيات', '<polyline points="18 14 8 24 18 34"/><polyline points="30 14 40 24 30 34"/>'),
 ('Platform', 'منصّة', '<path d="M24 9l16 8-16 8-16-8z"/><path d="M8 27l16 8 16-8"/>'),
 ('Cloud', 'سحابة', '<path d="M14 36a7 7 0 0 1-1-13.9A10.5 10.5 0 0 1 33.5 18a8 8 0 0 1 .5 18H14z"/>'),
 ('Data centre', 'مركز بيانات', '<rect x="8" y="10" width="32" height="12" rx="2"/><rect x="8" y="26" width="32" height="12" rx="2"/><line x1="14" y1="16" x2="20" y2="16"/><line x1="14" y1="32" x2="20" y2="32"/>'),
 ('Database', 'قاعدة بيانات', '<ellipse cx="24" cy="12" rx="15" ry="5.5"/><path d="M9 12v24c0 3 6.7 5.5 15 5.5S39 39 39 36V12"/>'),
 ('Network', 'شبكة', '<circle cx="24" cy="10" r="4"/><circle cx="10" cy="38" r="4"/><circle cx="38" cy="38" r="4"/><line x1="24" y1="14" x2="24" y2="24"/><line x1="24" y1="24" x2="13" y2="35"/><line x1="24" y1="24" x2="35" y2="35"/>'),
 ('Cybersecurity', 'أمن سيبراني', '<path d="M11 33c0-11 5.5-19 13-19s13 8 13 19"/><path d="M18 37c0-7 2.5-12 6-12s6 5 6 12"/><line x1="24" y1="31" x2="24" y2="40"/>'),
 ('Identity', 'هوية', '<circle cx="24" cy="15" r="7"/><path d="M8 40a16 16 0 0 1 32 0"/>'),
 ('Monitoring', 'مراقبة', '<rect x="6" y="9" width="36" height="26" rx="2"/><polyline points="12 24 18 24 22 16 26 30 30 24 36 24"/>'),
 ('Response', 'استجابة', '<path d="M13 35.5a16 16 0 0 1 0-23"/><path d="M35 12.5a16 16 0 0 1 0 23"/><circle cx="24" cy="24" r="3"/>'),
 ('Protection', 'حماية', '<circle cx="24" cy="24" r="17"/><line x1="24" y1="10" x2="24" y2="16"/><line x1="24" y1="32" x2="24" y2="38"/><line x1="10" y1="24" x2="16" y2="24"/><line x1="32" y1="24" x2="38" y2="24"/>'),
 ('AI', 'ذكاء اصطناعي', '<rect x="13" y="13" width="22" height="22" rx="2"/><path d="M24 6v7M24 35v7M6 24h7M35 24h7"/><rect x="20" y="20" width="8" height="8"/>'),
 ('Analytics', 'تحليلات', '<line x1="6" y1="40" x2="42" y2="40"/><line x1="13" y1="40" x2="13" y2="26"/><line x1="24" y1="40" x2="24" y2="12"/><line x1="35" y1="40" x2="35" y2="20"/>'),
 ('Integration', 'تكامل', '<path d="M17 8c-4 0-6 2-6 6v6c0 2-2 4-4 4 2 0 4 2 4 4v6c0 4 2 6 6 6"/><path d="M31 8c4 0 6 2 6 6v6c0 2 2 4 4 4-2 0-4 2-4 4v6c0 4-2 6-6 6"/>'),
 ('Mobile', 'تطبيق', '<rect x="14" y="5" width="20" height="38" rx="3"/><line x1="21" y1="37" x2="27" y2="37"/>'),
 ('Web', 'ويب', '<circle cx="24" cy="24" r="17"/><line x1="7" y1="24" x2="41" y2="24"/><ellipse cx="24" cy="24" rx="7" ry="17"/>'),
 ('Consulting', 'استشارات', '<circle cx="17" cy="15" r="6"/><path d="M5 40a12 12 0 0 1 24 0"/><circle cx="33" cy="17" r="5"/><path d="M31 27a10 10 0 0 1 12 12"/>'),
 ('Support', 'دعم', '<circle cx="24" cy="24" r="17"/><polyline points="24 13 24 24 31 28"/>'),
 ('Automation', 'أتمتة', '<rect x="6" y="19" width="10" height="10" rx="1.5"/><rect x="32" y="19" width="10" height="10" rx="1.5"/><line x1="16" y1="24" x2="31" y2="24"/><polyline points="27 20 31 24 27 28"/>'),
 ('Assessment', 'تقييم', '<rect x="10" y="9" width="28" height="34" rx="2"/><rect x="18" y="5" width="12" height="7" rx="1.5"/><line x1="17" y1="24" x2="31" y2="24"/><line x1="17" y1="31" x2="27" y2="31"/>'),
 ('Certification', 'شهادات', '<rect x="6" y="9" width="36" height="28" rx="2"/><line x1="13" y1="19" x2="29" y2="19"/><rect x="28" y="26" width="8" height="8"/>'),
 ('Deployment', 'نشر', '<path d="M13 32a7 7 0 0 1-1-13.9A10.5 10.5 0 0 1 32.5 14a8 8 0 0 1 .5 18"/><line x1="24" y1="42" x2="24" y2="27"/><polyline points="19 32 24 27 29 32"/>'),
 ('Compliance', 'امتثال', '<path d="M12 5h16l8 8v30H12z"/><polyline points="28 5 28 13 36 13"/><polyline points="17 29 21 33 30 22"/>'),
 ('Performance', 'أداء', '<path d="M8 35a16 16 0 1 1 32 0"/><line x1="24" y1="35" x2="33" y2="24"/><circle cx="24" cy="35" r="2"/>'),
]

def svg(body, ink='#0D0E13', blade=None, size='13mm', bg=None):
    blade = blade or ink
    return (f'<svg viewBox="0 0 48 48" style="width:{size};height:{size};display:block" fill="none" stroke="{ink}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
            f'<style>.blade{{fill:{blade};stroke:none}}</style>{body}</svg>')
def file_svg(body, ink='#0D0E13', blade='#0D0E13', title=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="{ink}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
            f'<title>{title}</title><style>.blade{{fill:{blade};stroke:none}}</style>{body}</svg>')
