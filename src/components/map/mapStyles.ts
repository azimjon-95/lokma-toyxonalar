import type { VenueListItem } from '../../types';
import { formatPinPrice } from '../../lib/format';
import { colors } from '../../theme';

/* Leaflet (OSM) va Yandex xaritalari uchun UMUMIY: belgi/kluster/"Siz" nuqtasi CSS'i va HTML'i */
export const WINE = colors.primary;

export const MAP_CSS = `
.lk-map{position:absolute;inset:0;z-index:0;isolation:isolate;background:#EEE7DC;outline:none;font-family:'Onest_500Medium',system-ui,sans-serif}
.lk-map .leaflet-control-attribution{background:rgba(255,255,255,.78);backdrop-filter:blur(4px);border-radius:8px 8px 0 0;font-size:9px;color:#6b645a;padding:1px 6px;margin:0 0 0 0}
.lk-map .leaflet-control-attribution a{color:#6b645a}
.lk-map .leaflet-tile-pane{filter:saturate(.92) contrast(.98)}
.lk-pin-wrap,.lk-me-wrap,.lk-rl-wrap,.lk-cl-wrap{background:none!important;border:0!important}
.lk-pin{position:absolute;left:0;top:0;transform:translate(-50%,-100%);transform-origin:50% 100%;cursor:pointer;-webkit-tap-highlight-color:transparent;filter:drop-shadow(0 4px 8px rgba(40,20,28,.28))}
.lk-pin-body{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;background:#fff;color:#2a1a20;border:1.5px solid #f0e1e6;font:800 12px/1 'Onest_800ExtraBold',system-ui,sans-serif;letter-spacing:.1px;white-space:nowrap;transition:background .2s,color .2s,border-color .2s}
.lk-pin-tip{position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;background:#fff;border-right:1.5px solid #f0e1e6;border-bottom:1.5px solid #f0e1e6;transform:rotate(45deg);border-radius:0 0 3px 0;transition:background .2s,border-color .2s}
.lk-pin-free{width:7px;height:7px;border-radius:50%;background:#1f9d55;box-shadow:0 0 0 2px rgba(31,157,85,.22)}
.lk-pin:hover .lk-pin-body{border-color:${WINE}}
.lk-pin.is-new{animation:lk-drop .55s cubic-bezier(.2,1.3,.4,1) both;animation-delay:var(--d,0ms)}
.lk-pin.is-active{z-index:5;animation:lk-bounce .7s cubic-bezier(.2,1.4,.4,1) both}
.lk-pin.is-active .lk-pin-body{background:${WINE};color:#fff;border-color:${WINE};padding:8px 14px;font-size:13px}
.lk-pin.is-active .lk-pin-tip{background:${WINE};border-color:${WINE}}
@keyframes lk-drop{0%{opacity:0;transform:translate(-50%,-190%) scale(.4)}100%{opacity:1;transform:translate(-50%,-100%) scale(1)}}
@keyframes lk-bounce{0%{transform:translate(-50%,-100%) scale(.85)}45%{transform:translate(-50%,-140%) scale(1.18)}100%{transform:translate(-50%,-100%) scale(1.12)}}
.lk-cl{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,#c2365f,${WINE} 55%,#7a1234);color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px/1 'Onest_800ExtraBold',system-ui,sans-serif;border:3px solid #fff;box-shadow:0 6px 16px rgba(122,18,52,.4);cursor:pointer;animation:lk-pop .35s cubic-bezier(.2,1.4,.4,1) both}
.lk-cl::after{content:'';position:absolute;inset:-9px;border-radius:50%;border:2px solid rgba(166,30,77,.25)}
@keyframes lk-pop{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
.lk-me{position:absolute;left:0;top:0;width:0;height:0}
.lk-me-dot{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:#2f6bff;border:3px solid #fff;box-shadow:0 2px 10px rgba(47,107,255,.6);z-index:2}
.lk-me-ring{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:rgba(47,107,255,.35);animation:lk-radar 2.8s cubic-bezier(.2,.6,.3,1) infinite}
.lk-me-ring.r2{animation-delay:1.4s}
@keyframes lk-radar{0%{transform:scale(1);opacity:.7}100%{transform:scale(6.5);opacity:0}}
.lk-me-label{position:absolute;left:0;top:14px;transform:translateX(-50%);background:#2f6bff;color:#fff;font:700 10px/1 'Onest_700Bold',system-ui,sans-serif;padding:3px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(47,107,255,.4)}
.lk-rl{position:absolute;left:0;top:0;transform:translate(-50%,-50%);background:${WINE};color:#fff;font:800 11px/1 'Onest_800ExtraBold',system-ui,sans-serif;padding:5px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(122,18,52,.35);border:2px solid #fff}
`;

export function ensureMapStyle() {
  if (document.getElementById('lk-map-css')) return;
  const s = document.createElement('style');
  s.id = 'lk-map-css';
  s.textContent = MAP_CSS;
  document.head.appendChild(s);
}

const esc = (t: string) => t.replace(/"/g, '');

/** Narx belgisi HTML'i (bugun bo'sh bo'lsa yashil nuqta) */
export function pinMarkup(v: VenueListItem, o: { active: boolean; fresh: boolean; index: number; today: string }) {
  const free = v.next_free?.date === o.today;
  return `<div class="lk-pin${o.active ? ' is-active' : ''}${o.fresh ? ' is-new' : ''}" style="--d:${Math.min(o.index, 14) * 70}ms" role="button" aria-label="${esc(v.name)}, ${formatPinPrice(v.price_from)}">
      <div class="lk-pin-body">${free ? '<i class="lk-pin-free"></i>' : ''}<span>${formatPinPrice(v.price_from)}</span></div><i class="lk-pin-tip"></i></div>`;
}

export const clusterMarkup = (n: number) => `<div class="lk-cl" role="button" aria-label="${n} ta to'yxona">${n}</div>`;
export const meMarkup = '<div class="lk-me"><i class="lk-me-ring"></i><i class="lk-me-ring r2"></i><i class="lk-me-dot"></i><span class="lk-me-label">Siz</span></div>';
export const radiusMarkup = (km: number) => `<div class="lk-rl">${km} km</div>`;
