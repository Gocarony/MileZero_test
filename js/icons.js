/* Loaded with <script defer>: deferred like the original inline module, scoped and strict like a module,
   and loadable from file:// (external module scripts are blocked there by CORS). */
(function(){
'use strict';
/* Lucian Icons v2.0.13 | MIT (c) 2026 Lucian | https://lucianlabs.dev/icons/ */
const VERSION = '2.0.13';

// Motion vocabulary ---------------------------------------------------------
// Springs follow Apple's (duration, bounce) model. The runtime samples each
// spring once into a CSS linear() curve and uses its settle time as duration.
const SPRINGS = { snappy: [0.32, 0.18], bouncy: [0.42, 0.38], smooth: [0.38, 0], gentle: [0.6, 0.12] };
const CURVES = {
  out: 'cubic-bezier(.22,1,.36,1)', in: 'cubic-bezier(.55,0,.75,.2)', inOut: 'cubic-bezier(.65,0,.35,1)',
  linear: 'linear', swing: 'cubic-bezier(.37,0,.63,1)'
};
const FALLBACK = { snappy: 'cubic-bezier(.3,1.25,.5,1)', bouncy: 'cubic-bezier(.3,1.6,.45,1)', smooth: CURVES.out, gentle: 'cubic-bezier(.25,1.12,.45,1)' };
const springs = new Map();
const supportsLinear = typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)');
function spring(name) {
  if (springs.has(name)) return springs.get(name);
  const [perceptual, bounce] = SPRINGS[name];
  const w = (2 * Math.PI) / perceptual, z = 1 - bounce, wd = w * Math.sqrt(Math.max(0, 1 - z * z));
  const x = t => z < 1 ? 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t)) : 1 - Math.exp(-w * t) * (1 + w * t);
  let settle = perceptual;
  for (let t = perceptual; t < 3; t += 0.005) { settle = t; if (Math.abs(1 - x(t)) < 0.002 && Math.abs(1 - x(t + 0.05)) < 0.002) break; }
  const points = Array.from({ length: 41 }, (_, i) => +x((settle * i) / 40).toFixed(4));
  points[40] = 1;
  const result = { duration: Math.round(settle * 1000), easing: supportsLinear ? `linear(${points.join(',')})` : FALLBACK[name] };
  springs.set(name, result);
  return result;
}
function timing(spec = {}, fallback = {}) {
  const e = spec.e ?? fallback.e ?? 'snappy';
  if (SPRINGS[e]) { const s = spring(e); return { duration: spec.d ?? s.duration, easing: s.easing, delay: spec.delay ?? 0 }; }
  return { duration: spec.d ?? fallback.d ?? 320, easing: CURVES[e] || e, delay: spec.delay ?? 0 };
}

// Poses -----------------------------------------------------------------------
// A pose is a small object: rotate (deg), translate [x, y], scale (n or [x, y]),
// opacity, draw (0..1 of a stroked path). Values are in 24-unit icon space.
// Effect keyframes may also set an ellipse's rx (absolute, see frame()).
const REST = { rotate: 0, translate: [0, 0], scale: 1, skewX: 0, skewY: 0, opacity: 1, draw: 1 };
const PROPS = Object.keys(REST);
const pair = v => Array.isArray(v) ? v : [v, v];
function cssValue(prop, v) {
  if (prop === 'rotate') return `${v}deg`;
  if (prop === 'translate') { const [x, y] = pair(v); return `${x}px ${y}px`; }
  if (prop === 'scale') { const [x, y] = pair(v); return x === y ? `${x}` : `${x} ${y}`; }
  if (prop === 'draw') return `${+(1 - v).toFixed(4)}`;
  return `${v}`;
}
// Both skews share the transform property, so they are written together.
const cssProp = prop => prop === 'draw' ? 'strokeDashoffset' : prop === 'skewX' || prop === 'skewY' ? 'transform' : prop;
function frame(pose) {
  const out = {};
  for (const [k, v] of Object.entries(pose)) {
    if (k === 'offset' || k === 'easing') out[k] = k === 'easing' ? (CURVES[v] || v) : v;
    // rx reshapes an <ellipse> itself, so its stroke keeps its width. rx cannot be negative, so a
    // keyframe with rx is absolute (replace) for every property in it, even inside an additive effect.
    else if (k === 'rx') { out.rx = `${v}px`; out.composite = 'replace'; }
    else if (k === 'skewX' || k === 'skewY') out.transform = `skewX(${pose.skewX ?? 0}deg) skewY(${pose.skewY ?? 0}deg)`;
    else if (PROPS.includes(k)) out[cssProp(k)] = cssValue(k, v);
  }
  return out;
}
function poseOf(def, state, progress = 0) {
  const all = def.poses?.['*'] || {}, own = def.poses?.[state] || {};
  const result = {};
  for (const part of new Set([...Object.keys(all), ...Object.keys(own)])) result[part] = { ...REST, ...all[part], ...own[part] };
  if (def.progress && state === def.progress.state) result[def.progress.part] = { ...REST, ...result[def.progress.part], ...progressPose(def, progress) };
  return result;
}
// Progress drives either how much of a stroke is drawn or how wide a fill is.
const progressPose = (def, value) => def.progress.axis === 'x' ? { scale: [Math.max(value, 0.001) / 100, 1] } : { draw: value / 100 };
function posedParts(def) {
  const parts = new Set();
  for (const pose of Object.values(def.poses || {})) for (const p of Object.keys(pose)) parts.add(p);
  for (const t of Object.values(def.transitions || {})) for (const p of Object.keys(t)) parts.add(p);
  if (def.progress) parts.add(def.progress.part);
  return [...parts];
}
function drawParts(def) {
  const parts = new Set();
  const scan = (group = {}) => { for (const [p, v] of Object.entries(group)) if (JSON.stringify(v).includes('"draw"')) parts.add(p); };
  for (const pose of Object.values(def.poses || {})) scan(pose);
  for (const t of Object.values(def.transitions || {})) scan(t);
  for (const l of Object.values(def.loops || {})) scan(l);
  scan(def.effect);
  if (def.progress && def.progress.axis !== 'x') parts.add(def.progress.part);
  return parts;
}

// Normalization and static export -----------------------------------------------
const COLOR = /^(#[\da-f]{3,8}|currentColor|(rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\([\w\s.,%#/+-]+\)|[a-z]{3,20})$/i;
function normalize(def, options = {}) {
  const size = Number(options.size ?? 24), weight = Number(options.weight ?? 1.75), progress = Number(options.progress ?? def.progress?.value ?? 0);
  const states = statesOf(def);
  const color = (v, fallback) => typeof v === 'string' && COLOR.test(v.trim()) ? v.trim() : fallback;
  return {
    state: states.includes(options.state) ? options.state : def.defaultState ?? null,
    size: Number.isFinite(size) ? Math.min(512, Math.max(8, size)) : 24,
    weight: Number.isFinite(weight) ? Math.min(3, Math.max(0.5, weight)) : 1.75,
    progress: Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0,
    tone: options.tone === 'line' ? 'line' : 'color',
    color: color(options.color, 'currentColor'),
    accent: color(options.accent, null)
  };
}
function statesOf(def) { return Array.isArray(def.states) ? def.states : []; }
const origin = (def, part) => def.origins?.[part] || [12, 12];
function transformAttr(def, part, p) {
  const [ox, oy] = origin(def, part), [tx, ty] = pair(p.translate), [sx, sy] = pair(p.scale);
  if (!p.rotate && !tx && !ty && sx === 1 && sy === 1 && !p.skewX && !p.skewY) return '';
  const n = v => +(+v).toFixed(3);
  return `translate(${n(ox + tx)} ${n(oy + ty)})${p.rotate ? ` rotate(${n(p.rotate)})` : ''}${sx !== 1 || sy !== 1 ? ` scale(${n(sx)}${sx === sy ? '' : ' ' + n(sy)})` : ''}${p.skewX ? ` skewX(${n(p.skewX)})` : ''}${p.skewY ? ` skewY(${n(p.skewY)})` : ''} translate(${n(-ox)} ${n(-oy)})`;
}

// Custom element ------------------------------------------------------------------
const TINT = 0.24, SUN = '#F4AF2D', ERROR = '#F05465';
const TRIGGER = 'button,a[href],summary,label,[role=button],[role=link],[role=menuitem],[role=tab],[role=switch],[role=checkbox],[role=option]';
// Dark color scheme (the page declares color-scheme: dark): a thin tint over a dark page turns
// yellow olive and orange brown, so surfaces are painted solid in the icon's color, a little darker
// and richer (OKLCH lightness x.93, chroma x1.08; less chroma looks faded, less lightness turns
// yellow mustard), and accent details move part of
// the way to white so they stay apart from the surface. --li-tint
// still scales the surface (0 = none). Browsers without light-dark() or relative colors keep the
// light rendering.
const DARK_TINT = 'oklch(from var(--_c) calc(l * .93) calc(c * 1.08) h / clamp(0, var(--_t) / .24, 1))';
const DARK_ACCENT = 'oklch(from var(--_c) calc(l + (1 - l) * .4) c h)';
const DARK_IF = '@supports (color:light-dark(#000,#fff)) and (color:oklch(from red calc(l * pow(max(0, cos(1deg)), 2)) c h / clamp(0, .5, 1))) and (color:color-mix(in srgb,red calc(.24 * 100%),transparent)){';
const DARK = `${DARK_IF}.s,.t{fill:light-dark(color-mix(in srgb,var(--_c) calc(var(--_t) * 100%),transparent),${DARK_TINT});fill-opacity:1}.a{stroke:light-dark(var(--_c),${DARK_ACCENT})}.f{fill:light-dark(var(--_c),${DARK_ACCENT})}.e{stroke:light-dark(${ERROR},oklch(from ${ERROR} calc(l + (1 - l) * .4) c h))}:host([tone=line]) .a{stroke:var(--_c)}:host([tone=line]) .f{fill:var(--_c)}}`;
// Icons whose state fills the whole shape (a .f part named fill or glow: heart, star, bookmark,
// thumbs up, toggle, filter, bulb, lamp) are just an outline when empty in the dark scheme, so the
// empty and filled states still read apart, and fill with the icon's own color.
const HOLLOW = `${DARK_IF}.s,.t{fill:light-dark(color-mix(in srgb,var(--_c) calc(var(--_t) * 100%),transparent),transparent)}.a{stroke:var(--_c)}.f{fill:var(--_c)}}`;
const hollowOf = def => def.states?.length > 1 && ['fill', 'glow'].some(part => {
  if (!new RegExp(`<[^>]*data-part="${part}"[^>]*class="f"|<[^>]*class="f"[^>]*data-part="${part}"`).test(def.svg)) return false;
  const o = def.states.map(st => poseOf(def, st)[part]?.opacity ?? 1);
  return Math.min(...o) === 0 && Math.max(...o) > 0;
});
// Color tone: ink strokes, the icon's own color on tinted surfaces (.s, .t) and
// on one or two signal details (.a strokes, .f fills). .e is a fixed red for error marks
// (it ignores accent so a failure never reads as success). .y is a fixed sun yellow
// for the rare detail that must not take the icon's color. Line tone is monochrome.
const STYLE = (color, hollow) => `:host{display:inline-block;width:var(--li-size,24px);height:var(--li-size,24px);flex:none;line-height:0;vertical-align:middle;contain:layout style;--_c:var(--li-accent,${color});--_t:var(--li-tint,${TINT})}:host([tone=line]){--_c:var(--li-accent,currentColor);--_t:0}svg{display:block;width:100%;height:100%;overflow:visible;stroke-width:var(--li-weight,1.75)}[data-part]{transform-box:view-box}.s{fill:var(--_c);fill-opacity:var(--_t)}.t{fill:var(--_c);fill-opacity:var(--_t);stroke:none}.a{stroke:var(--_c)}.f{fill:var(--_c);stroke:none}.k{fill:currentColor;stroke:none}.y{fill:${SUN};stroke:none}:host([tone=line]) .y{fill:currentColor}.e{stroke:${ERROR}}:host([tone=line]) .e{stroke:var(--_c)}${DARK}${hollow ? HOLLOW : ''}`;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
function defineIcon(def) {
  const tag = `lucian-${def.id}`;
  if (customElements.get(tag)) return customElements.get(tag);
  const states = statesOf(def), parts = posedParts(def), draws = drawParts(def), hollow = hollowOf(def);
  const transition = (from, to) => def.transitions?.[`${from}>${to}`] || def.transitions?.[`*>${to}`] || def.transitions?.[`${from}>*`] || {};
  class LucianIcon extends HTMLElement {
    static observedAttributes = ['state', 'size', 'accent', 'tone', 'weight', 'progress', 'label', 'animate'];
    #nodes = new Map(); #running = new Map(); #loops = []; #effect = []; #state = null; #progress = 0; #target = null; #ready = false;
    constructor() {
      super();
      this.#progress = normalize(def).progress;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${STYLE(def.color || 'currentColor', hollow)}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g data-part="*">${def.svg}</g></svg>`;
      for (const node of root.querySelectorAll('[data-part]')) {
        const name = node.dataset.part, [x, y] = origin(def, name);
        node.style.transformOrigin = `${x}px ${y}px`;
        if (draws.has(name)) for (const shape of [node, ...node.querySelectorAll('path,line,polyline,circle,rect,ellipse')]) {
          shape.setAttribute('pathLength', '1'); shape.style.strokeDasharray = '1 1';
        }
        this.#nodes.set(name, node);
      }
    }
    #part(name) { return this.#nodes.get(name); }
    #frame(name, pose) { const f = frame(pose); if (!draws.has(name)) delete f.strokeDashoffset; return f; }
    #apply(name, pose) { const node = this.#part(name); if (node) for (const [k, v] of Object.entries(this.#frame(name, pose))) node.style[k] = v; }
    #settle(name, pose) {
      // A part that is still animating continues from its current rendered value.
      const node = this.#part(name), running = this.#running.get(name), from = {};
      if (running) { const cs = getComputedStyle(node); for (const p of PROPS) from[cssProp(p)] = cs[cssProp(p)]; running.cancel(); this.#running.delete(name); }
      this.#apply(name, pose);
      return running ? from : null;
    }
    #go(to, animate = true) {
      const from = this.#state; this.#state = to;
      const target = poseOf(def, to, this.#progress), plan = transition(from, to);
      const motion = animate && this.#ready && from !== to && !reduced();
      for (const name of parts) {
        const node = this.#part(name); if (!node) continue;
        const pose = target[name] || REST, interrupted = this.#settle(name, pose);
        if (!motion) continue;
        const spec = plan[name], end = this.#frame(name, pose);
        let frames;
        if (spec?.k && !interrupted) {
          frames = spec.k.map(frame);
          // Authored keyframes always end exactly on the target pose.
          frames[frames.length - 1] = { ...frames[frames.length - 1], ...end };
        } else {
          const before = interrupted || this.#frame(name, poseOf(def, from, this.#progress)[name] || REST);
          const keys = Object.keys(end).filter(k => before[k] !== end[k]);
          if (!keys.length) continue;
          frames = [Object.fromEntries(keys.map(k => [k, before[k]])), Object.fromEntries(keys.map(k => [k, end[k]]))];
        }
        const anim = node.animate(frames, { ...timing(spec, def.motion), fill: 'backwards' });
        this.#running.set(name, anim);
        anim.onfinish = () => { if (this.#running.get(name) === anim) this.#running.delete(name); };
      }
      if (this.#ready) this.#loop(to, !reduced());
    }
    #loop(state, allowed) {
      // Leaving a looping state lets the current cycle finish, so nothing snaps.
      for (const anim of this.#loops) { const t = anim.effect.getComputedTiming(); if (Number.isFinite(t.currentIteration)) anim.effect.updateTiming({ iterations: t.currentIteration + 1 }); else anim.cancel(); }
      this.#loops = [];
      const spec = def.loops?.[state]; if (!spec || !allowed || !this.isConnected) return;
      for (const [name, s] of Object.entries(spec)) {
        const node = this.#part(name); if (!node) continue;
        this.#loops.push(node.animate(s.k.map(frame), { ...timing(s, { e: 'linear', d: 1200 }), iterations: Infinity, composite: 'add' }));
      }
    }
    play() {
      if (!def.effect || reduced() || this.#effect.some(a => a.playState === 'running')) return false;
      this.#effect = Object.entries(def.effect).map(([name, s]) => this.#part(name)?.animate(s.k.map(frame), { ...timing(s, { e: 'inOut', d: 600 }), composite: 'add', fill: 'backwards' })).filter(Boolean);
      return true;
    }
    setState(state) {
      if (!states.includes(state)) throw new RangeError(`Unsupported ${def.id} state: ${state}`);
      this.setAttribute('state', state);
    }
    setProgress(value) {
      if (!def.progress) throw new TypeError(`${def.id} does not support progress`);
      if (!Number.isFinite(Number(value))) throw new TypeError('Progress must be finite');
      this.setAttribute('progress', String(Math.max(0, Math.min(100, Number(value)))));
    }
    next() {
      if (!states.length) { this.play(); return null; }
      const to = states[(states.indexOf(this.#state) + 1) % states.length];
      this.setState(to); return to;
    }
    get state() { return this.#state; }
    get states() { return [...states]; }
    get definition() { return def; }
    connectedCallback() {
      this.#sync(); this.#bind();
      if (!this.#ready) { this.#go(normalize(def, { state: this.getAttribute('state') }).state, false); this.#ready = true; }
      this.#loop(this.#state, !reduced());
    }
    disconnectedCallback() { this.#unbind(); for (const a of this.#loops) a.cancel(); this.#loops = []; }
    attributeChangedCallback(name) {
      if (name === 'state') { const next = normalize(def, { state: this.getAttribute('state') }).state; if (this.#ready && next !== this.#state) this.#go(next); }
      else if (name === 'progress') this.#setProgress();
      else if (name === 'animate') { this.#unbind(); if (this.isConnected) this.#bind(); }
      else this.#sync();
    }
    #setProgress() {
      const value = normalize(def, { progress: this.getAttribute('progress') ?? undefined }).progress;
      if (!def.progress || value === this.#progress) return;
      const previous = this.#progress; this.#progress = value;
      if (!this.#ready || this.#state !== def.progress.state) return;
      const name = def.progress.part, node = this.#part(name), before = this.#settle(name, poseOf(def, this.#state, value)[name]);
      if (!node || reduced()) return;
      const key = def.progress.axis === 'x' ? 'scale' : 'strokeDashoffset';
      const from = before ? { [key]: before[key] } : frame(progressPose(def, previous));
      const anim = node.animate([from, frame(progressPose(def, value))], { ...timing({ e: 'smooth' }), fill: 'backwards' });
      this.#running.set(name, anim);
      anim.onfinish = () => { if (this.#running.get(name) === anim) this.#running.delete(name); };
    }
    #sync() {
      const o = normalize(def, Object.fromEntries(['size', 'accent', 'weight'].map(k => [k, this.getAttribute(k) ?? undefined])));
      if (this.hasAttribute('size')) this.style.setProperty('--li-size', `${o.size}px`); else this.style.removeProperty('--li-size');
      if (this.hasAttribute('weight')) this.style.setProperty('--li-weight', String(o.weight)); else this.style.removeProperty('--li-weight');
      if (o.accent) this.style.setProperty('--li-accent', o.accent); else this.style.removeProperty('--li-accent');
      const svg = this.shadowRoot.querySelector('svg'), label = this.getAttribute('label');
      if (label) { svg.removeAttribute('aria-hidden'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
      else { svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role'); svg.removeAttribute('aria-label'); }
    }
    #bind() {
      this.#unbind();
      const mode = this.getAttribute('animate') || 'hover';
      if (mode === 'none') return;
      const target = this.parentElement?.closest(TRIGGER) || this;
      const play = () => this.play();
      const handlers = mode === 'click'
        ? { click: play }
        : { pointerenter: e => { if (e.pointerType !== 'touch') play(); }, pointerdown: e => { if (e.pointerType === 'touch') play(); }, focusin: () => { if (target.matches(':focus-visible')) play(); } };
      for (const [type, fn] of Object.entries(handlers)) target.addEventListener(type, fn);
      this.#target = { target, handlers };
    }
    #unbind() {
      if (!this.#target) return;
      for (const [type, fn] of Object.entries(this.#target.handlers)) this.#target.target.removeEventListener(type, fn);
      this.#target = null;
    }
  }
  customElements.define(tag, LucianIcon);
  return LucianIcon;
}
/* Lucian Icons heart v2.0.13 | MIT (c) 2026 Lucian */

const definition = {"id":"heart","version":"2.0.13","order":197,"name":{"ko":"하트","en":"Heart"},"keywords":["좋아요","하트","즐겨찾기","사랑","like","heart","favorite","love"],"category":"lifestyle","description":{"ko":"누르면 살짝 움츠렸다가 부드럽게 차오르며 색이 채워집니다.","en":"It dips a little, then springs back softly as it fills."},"color":"#F05465","states":["off","on"],"defaultState":"off","stateLabels":{"ko":{"off":"꺼짐","on":"좋아요"},"en":{"off":"Off","on":"Liked"}},"svg":"<g data-part=\"heart\"><path data-part=\"fill\" class=\"f\" d=\"M12 20s-8.25-4.67-8.25-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.25 2.5C20.25 15.33 12 20 12 20z\"/><path class=\"s\" d=\"M12 20s-8.25-4.67-8.25-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.25 2.5C20.25 15.33 12 20 12 20z\"/></g>","origins":{"heart":[12,13],"fill":[12,13.5]},"poses":{"*":{"fill":{"scale":0,"opacity":0}},"on":{"fill":{"scale":1,"opacity":1}}},"transitions":{"off>on":{"heart":{"k":[{"scale":1},{"scale":0.93,"offset":0.28,"easing":"out"},{"scale":1.05,"offset":0.62,"easing":"inOut"},{"scale":1}],"d":480,"e":"linear","delay":0},"fill":{"k":[{"scale":0.55,"opacity":0},{"scale":0.8,"opacity":1,"offset":0.3},{"scale":1,"opacity":1}],"d":460,"e":"out","delay":0}},"on>off":{"heart":{"k":[{"scale":1},{"scale":0.95,"offset":0.4},{"scale":1}],"d":320,"e":"out","delay":0},"fill":{"e":"smooth","d":240}}},"effect":{"heart":{"k":[{"scale":1},{"scale":1.06,"offset":0.16,"easing":"out"},{"scale":0.995,"offset":0.34,"easing":"inOut"},{"scale":1.035,"offset":0.52,"easing":"out"},{"scale":1}],"d":720,"e":"linear","delay":0}}};
defineIcon(definition);
})();
