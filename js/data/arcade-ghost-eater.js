/* GHOST EATER — arcade mini-game document, injected into an iframe via srcdoc. */
'use strict';
const mzArcadeHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Ghost Eater - Standalone Prototype</title>
<style>
:root{--base:#101626;--panel:#171c30;--panel2:#242a42;--text:#e9e7f1;--sub:#9d9fb8;--line:#40445e;--orange:#ff9c4e;--cyan:#35cddd;--pink:#f05b9d}
*{box-sizing:border-box;border-radius:0!important;box-shadow:none!important}
html,body{margin:0;min-height:100%;color:var(--text);background:#101626;font-family:'Courier New','D2Coding','Nanum Gothic Coding','Apple SD Gothic Neo',monospace;font-size:12px}
.wrap{max-width:1120px;display:grid;grid-template-columns:minmax(0,1fr) 235px;gap:10px;padding:8px;margin:auto}
.gamebox,.panel{background:var(--panel);border:2px solid var(--line);padding:10px}
canvas{display:block;width:100%;aspect-ratio:4/3;image-rendering:pixelated;background:#101626;border:2px solid var(--line)}
.side{display:grid;align-content:start;gap:8px}.panel{padding:12px}
h1{margin:0 0 7px;color:var(--orange);font-size:19px;letter-spacing:.14em}
h2{margin:0 0 8px;color:var(--orange);font-size:13px;letter-spacing:.07em}
.sub,.note{color:var(--sub);line-height:1.6;margin:0;font-size:12px}
ul{margin:0;padding-left:16px;line-height:1.7;font-size:12px}li+li{margin-top:2px}
.legend{display:grid;gap:8px;font-size:12px}.legend-row{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:center}
.dot{display:block;width:15px;height:15px;border:1px solid var(--line)}
.btnrow{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
button{font:inherit;border:1px solid var(--line);background:var(--panel2);color:var(--text);padding:9px 12px;cursor:pointer}
button:hover,button:focus-visible{border-color:var(--orange)}
#startBtn{background:var(--orange);color:#161c30;border-color:var(--orange);font-weight:bold}
@media(max-width:860px){.wrap{grid-template-columns:1fr}.side{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.side{grid-template-columns:1fr}.wrap{padding:4px}}
</style>

<style id="mz318-arcade-guide-layout">
html,body{height:100%;min-height:0!important;margin:0!important;overflow:auto}
body{display:block!important;background:#101626!important}
.wrap{width:100%!important;max-width:none!important;display:grid!important;grid-template-columns:minmax(0,1fr) 245px!important;align-items:start;gap:10px!important;padding:9px!important;margin:0!important}
.gamebox{padding:9px!important;min-width:0}
.side{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;align-content:start}
.side .panel{padding:11px!important}
.arcade-guide h2{margin:0 0 8px;font-size:13px;line-height:1.3}
.arcade-guide ul{padding-left:16px;line-height:1.48;font-size:12px}
.arcade-guide li+li{margin-top:4px}
.guide-line{display:flex;gap:8px;align-items:baseline;justify-content:space-between;font-size:12px;line-height:1.65}
.guide-line span{color:var(--sub)}
.guide-line strong{color:var(--text);font-weight:600;text-align:right}
.legend{gap:9px;font-size:12px;line-height:1.45}
.legend-row{grid-template-columns:15px minmax(0,1fr);gap:7px}
.legend-row strong{color:var(--text)}
.dot{width:13px;height:13px;margin-top:2px}
canvas{width:100%!important;max-width:800px!important;margin:0 auto!important;aspect-ratio:4/3!important}
.btnrow{max-width:800px!important;margin:8px auto 0!important}
@media(max-width:800px){.wrap{grid-template-columns:1fr!important}.side{grid-template-columns:repeat(3,minmax(0,1fr))!important}.arcade-guide{min-width:0}.guide-line{flex-wrap:wrap}}
@media(max-width:560px){.side{grid-template-columns:1fr!important}.wrap{padding:6px!important}.gamebox{padding:6px!important}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="gamebox">
      <canvas id="game" width="800" height="600"></canvas>
      <div class="btnrow">
        <button id="startBtn">시작 / 다시 시작</button>
        <button id="pauseBtn" class="secondary">일시정지</button>
      </div>
    </div>
    <aside class="side" aria-label="게임 도움말">
      <div class="panel arcade-guide">
        <h2>조작 방법</h2>
        <div class="guide-line"><span>이동</span><strong>방향키 / WASD</strong></div>
        <div class="guide-line"><span>시작</span><strong>Enter</strong></div>
        <div class="guide-line"><span>일시정지</span><strong>P</strong></div>
        <div class="guide-line"><span>다시 시작</span><strong>R</strong></div>
      </div>
      <div class="panel arcade-guide">
        <h2>기본 규칙</h2>
        <ul>
          <li>자신보다 작은 유령을 먹으면 점수와 성장치를 얻습니다.</li>
          <li>자신보다 크거나 같은 유령에 닿으면 생명 −1.</li>
          <li>생명 3으로 시작하며, 0이 되면 게임 오버.</li>
          <li>총 3단계 성장. 단계가 올라갈수록 큰 유령이 등장합니다.</li>
          <li>유령 종류마다 얻는 점수가 다릅니다.</li>
        </ul>
      </div>
      <div class="panel arcade-guide">
        <h2>아이템</h2>
        <div class="legend">
          <div class="legend-row"><span class="dot" style="background:#6fc6ff"></span><span><strong>파란 구슬</strong> · 6초 보호막</span></div>
          <div class="legend-row"><span class="dot" style="background:#ffe16f"></span><span><strong>노란 구슬</strong> · 6초 가속</span></div>
          <div class="legend-row"><span class="dot" style="background:#ff6f9f"></span><span><strong>빨간 구슬</strong> · 5초 모든 유령 흡수</span></div>
          <div class="legend-row"><span class="dot" style="background:#95ff95"></span><span><strong>하트</strong> · 생명 +1 (최대 5)</span></div>
        </div>
      </div>
    </aside>
  </div>

<script>
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  const W = canvas.width;
  const H = canvas.height;

  const STORAGE_KEY = 'ghost_munch_highscore';
  let highScore = 0;
  try { highScore = Number(localStorage.getItem(STORAGE_KEY) || 0); } catch (_err) { highScore = 0; }

  const state = {
    mode: 'title', // title, playing, paused, gameover
    time: 0,
    spawnTimer: 0,
    itemTimer: 0,
    hurtFlash: 0,
    score: 0,
    lives: 3,
    entities: [],
    items: [],
    particles: [],
    invuln: 0,
    stage: 1,
    growth: 0,
    messages: [],
    player: null,
    bgScroll: 0,
  };

  // Audio is handled by the parent MILE ZERO page. Relative media URLs in
  // iframe srcdoc do not work in standalone, media-embedded HTML builds.
  function mzPlaySfx(which) {
    if (!['item', 'ghost', 'hurt', 'gameover'].includes(which)) return;
    window.parent.postMessage({type:'mz-arcade-play-sfx', which}, '*');
  }
  // If browser policy postpones music until interaction inside this iframe,
  // allow the parent to resume it from the next real user input.
  for (const eventName of ['pointerdown', 'keydown']) {
    window.addEventListener(eventName, () => {
      try { window.parent.mzArcadeMusic?.resume?.(); } catch (_) {
        window.parent.postMessage({type:'mz-arcade-user-gesture'}, '*');
      }
    }, {passive:true});
  }

  const keys = new Set();

  const stageData = {
    1: { minRadius: 10, maxRadius: 24, weights: [55, 28, 12, 5], speed: [40, 95] },
    2: { minRadius: 11, maxRadius: 32, weights: [30, 34, 24, 12], speed: [55, 115] },
    3: { minRadius: 12, maxRadius: 40, weights: [18, 26, 31, 25], speed: [65, 135] },
  };

  const growthThresholds = [0, 120, 320]; // stage 1 -> 2 -> 3


  const UI = {
    bgDark: '#101626',
    bgPanel: '#171c30',
    line: '#40445e',
    text: '#e9e7f1',
    accent: '#ff9c4e',
    accent2: '#35cddd',
    accent3: '#9d9fb8'
  };

  // Original 7-frame GIF silhouettes, nearest-neighbor scaled.
  // Player retains eyes; nonplayer ghosts deliberately have no eyes.
  const GHOST_FRAME_URLS = {"player":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA/0lEQVR42u2aMQ6DMAxFY6tzh94EiQNw9B6gUm/CwIwEa4dKFSV2bPLe1CFN6pfvUBClAAAAAECfSO0Jl3ndjn7n/rhJegH/FB5BgrQuvLUIiVR8CxEasXiP+U8L8GCZ181ahEbeHY/1QifAQ4JG333rtdMkwEqCZtn9FGfAME5lGKfqY1MI+CzmV2FHxlonUUvnaM/9nzoBtTaEFkAAAurwfj2/fj471vocEM/FLDj74IQWQAACEIAABDhcbkjAFQRES0GN30MCWlhPfwZEkVDj/kRb9l8ECeHeD/A+KNV6gehIxL70vERKxL70TKRrfK3EXPVvOgAAAAAAAIAROyUwdWh6E5YSAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABAUlEQVR42u2YPQ7CMAxG46gzAzep1AP06BwAiZswMCPByoBUlfo3vDd1CEn8+bPr0hoAAADAnyLaGz7uz9fe35zOk5QX4JfAM4gg0YFHCyGZgo8QomcM3mP/wwKMQs+cHY9z0jvAWoSeNfteZ9IDsmff+mxVB8zL2uZlVV9bogl+BrMV2J611i4o1wO0RegV6p9J0DAZvAarXlzLBThAa6Pb9fL1+ehaa8Tbcppo/GlCCVS+vIYrcQACODYcHFBdgBFdgAMiho/yg9BIpUAJRNovwyQoWS4S1QskUzYihJBslvQWQrLWppcIpo2sQm9w7eRWgoz6oQYAAAAAAAAANrwBE7l5ZpK6N6AAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABDElEQVR42u2XOw6DMBAFvVbqFLkJEgfg6DlApNyEghqJVJFSRArI6/2QmYrCMt7nWYNLAQAA+FtEa6JlXrc94663i5wqgL2FRw1DPAqPFEL1LF57LhMDei7Yw4ZaAuFhQ422QOsQQhngEYJE1tPiXAhpQLgW8PxU9X63igHDOJVhnNTHpjgEP4v5VdiRsVYWcAZkWWgvCzCAABLRow0woHWC5+P+9bl1LHcBo7sBLUAAydBuxerVexiQMYAzWoAB3t/hlAacKQRaIMovaUoDvELQ/BlqboHsIaQ+A5Z53VqDkIhaWtookfvTIoQaYRc8N0AiLspyEyT6Dh0p6D33Wa/uAAAAAAAAAAAqvABKt32O+hWm7QAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABIElEQVR42u2YMQ7CMAxFE4uZgZtU6gF6dA6AxE0YmJFg7VBEQ2L72/1v6hBF9ut3UiiFEEIOTO3d4Pl4vfesO19ONZWAvY2ji6hWjaOKEI/mR+9lIkCjYAQJ4l2AtwRBKNJTgpSDIyhvxysFUAnwkNAlYJqXMs3L8LUhBKyb+dVYy1rrFEAegpYSYG8BKwm8BpGLs0gBExDt9ztMAu636+Zz71rrMagos+iVQvEugLeAcwIFIYZMQBQBGVMQJgFa50CzgGwp4BmA9mHCBEQRkCUFXQnIIKF7BCwlaFyFQ86AyEkYdghGlVCjRFVLtqAXqC1YIrwlTQkmc4s8EqYHV6uIrca+7fGvhNAfMmsZ2f++dx0xQgghhBBCCCGEkFR8ADEqhbceEKrzAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABDElEQVR42u2XOw6DMBAFvVbqFLkJEgfg6DlApNyEghqJVJFSRArI6/2QmYrCMt7nWYNLAQAA+FtEa6JlXrc94663i5wqgL2FRw1DPAqPFEL1LF57LhMDei7Yw4ZaAuFhQ422QOsQQhngEYJE1tPiXAhpQLgW8PxU9X63igHDOJVhnNTHpjgEP4v5VdiRsVYWcAZkWWgvCzCAABLRow0woHWC5+P+9bl1LHcBo7sBLUAAydBuxerVexiQMYAzWoAB3t/hlAacKQRaIMovaUoDvELQ/BlqboHsIaQ+A5Z53VqDkIhaWtookfvTIoQaYRc8N0AiLspyEyT6Dh0p6D33Wa/uAAAAAAAAAAAqvABKt32O+hWm7QAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABAUlEQVR42u2YPQ7CMAxG46gzAzep1AP06BwAiZswMCPByoBUlfo3vDd1CEn8+bPr0hoAAADAnyLaGz7uz9fe35zOk5QX4JfAM4gg0YFHCyGZgo8QomcM3mP/wwKMQs+cHY9z0jvAWoSeNfteZ9IDsmff+mxVB8zL2uZlVV9bogl+BrMV2J611i4o1wO0RegV6p9J0DAZvAarXlzLBThAa6Pb9fL1+ehaa8Tbcppo/GlCCVS+vIYrcQACODYcHFBdgBFdgAMiho/yg9BIpUAJRNovwyQoWS4S1QskUzYihJBslvQWQrLWppcIpo2sQm9w7eRWgoz6oQYAAAAAAAAANrwBE7l5ZpK6N6AAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA/0lEQVR42u2aMQ6DMAxFY6tzh94EiQNw9B6gUm/CwIwEa4dKFSV2bPLe1CFN6pfvUBClAAAAAECfSO0Jl3ndjn7n/rhJegH/FB5BgrQuvLUIiVR8CxEasXiP+U8L8GCZ181ahEbeHY/1QifAQ4JG333rtdMkwEqCZtn9FGfAME5lGKfqY1MI+CzmV2FHxlonUUvnaM/9nzoBtTaEFkAAAurwfj2/fj471vocEM/FLDj74IQWQAACEIAABDhcbkjAFQRES0GN30MCWlhPfwZEkVDj/kRb9l8ECeHeD/A+KNV6gehIxL70vERKxL70TKRrfK3EXPVvOgAAAAAAAIAROyUwdWh6E5YSAAAAAElFTkSuQmCC"],"lilac":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhUJs6sqwHsuwKRvREm68C/Awu/8aWV5QR5cFAAAAAObERp/w2M/r6TGfbbX2An4pXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZHPt5RYtw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwncrPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgBmtpbpfd23aQAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkQpJU5SReigjTaWRpAUIepyc3X8je3XWwLBtAAAAAH+KRT/wdbw/V9fsz4eNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDF+d2X6Np4ZQrAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEYWkqZSRelyGm3Ijzit/MCAtyswbY7GM8FEKAADA32KzJjqP624Z9/68LFUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DyuezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfNm5lYAKbPp0AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABA0lEQVR42u2YyxHCMAwFbRVCU5RBPZSRpmgErhxgxomtr3fPjkfePCmf1gAANqbPbnA8X++RdffHrZcSMHrw6CK61cGjihCPw6/ey0SARsERJIh3Ad4SJEKRnhKkbY5EuTteKQiVAA8JtEC0gqxTEDIBlhLCtoCVBGZA5OIsUkACsn2/b5cA7TagBUYWVW6DFAnQbINhAVVTwAw4s7hiCtIkQGsOnBZQLQXMgCsXVUoBCbh6YZUUTCWggoTpFrCUoPEoXDIDMidh2RDMKqFniaqWbIleoLZgyXCXNCWY9G3kljAdXGdF/DrYvz2uSkj9IvMto/rve9cWAwAAAAAAAAAoxQfKt21kVkImLgAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEYWkqZSRelyGm3Ijzit/MCAtyswbY7GM8FEKAADA32KzJjqP624Z9/68LFUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DyuezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfNm5lYAKbPp0AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkQpJU5SReigjTaWRpAUIepyc3X8je3XWwLBtAAAAAH+KRT/wdbw/V9fsz4eNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDF+d2X6Np4ZQrAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhUJs6sqwHsuwKRvREm68C/Awu/8aWV5QR5cFAAAAAObERp/w2M/r6TGfbbX2An4pXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZHPt5RYtw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwncrPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgBmtpbpfd23aQAAAAASUVORK5CYII="],"cyan":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA00lEQVR42u2awRGEQAgEhXT8X2ZGcZn5Nx4N4UpvgcHt/utKM4tauiwAAAAAMCc2+oTbfpx3j/l+Vmsv4EnhChKsuvBqEaZUfIUIVyw+4/x/C8hg248zWoQrdydjPekEZEhw9e5Hr90mAVESvEv3p58BCAhKIgmYef+3TsCohrAFEICAvoyYAyQAAQhAAAIQgIDfVH6+IgEqAtRSMOJ6SECF9fYzQEVC6cvQWyTI/R+QPSg9egF1THFfZt4iTXFfZiYyNb5RYt76mA4AAAAAAAAQxAXF71sFkBuZNgAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA2klEQVR42u2ZyxGDMAwFkdrJnc5SBZ3lnnqSFiDo8+Ts3o3s1bMGhm0DAAAA+FMs+oHP1/tzdc2xP2y8gF8OriDBug/eLcKUDt8hwhUPX/H82wJWwZW7U1FHPgHZEly1+1U1mQHq3c+uTQImbTYjBeMSEC3BJ9x/rkBiMxiCUzcelQISgAAEIGAsEYOQBCDgJJ0/L0iAioAVU0ACri5QSkHEXryrMFdgugCFFES8CZrKRrpmgSl1o0OEqUWyWoSp3s0qCamDbMJsKJ3kWUJW/VADAAAAAAAAgBy+jXlfA7kRYDoAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA60lEQVR42u2YuwHDIAwFEeukz2aeIpu59zxOlR4MSA/lrsZYPE74UwoAAMDfYrMmOs7rbhn3eb8sVQCtC1cNwyIWrhRCjVz87LlcDFhZcIQNtQgRYUNVK9A7BCkDIkIwZT09zgVJA+RaIPJRtfreGLBDkSstwIBdCl1lAQYQwEasaAMMIADR73QMIAACcHkSNAeQ9RygBXoGZ7QAA3ovyGbBIwMyhUALPL0wiwVDBkSFMPNlaLgFdg9h6zPgOK97NAhT1NLTRlPuT48QqsIuRG6AKRbluQmmvkM9C/rNnfkXHgAAAAAAAADAMF+D4WTgdRJYdgAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABAklEQVR42u2YuxHCMBAFpWuHnM6ogs6cUw+kBDAjW7qvdmNZc1q/O39aAwDYmD67weN4vUfWPe+3XkrA6MGji+hWB48qQjwOv3ovEwEaBUeQIN4FeEuQCEV6SpC2ORLl7nilIFQCPCTQAtEKsk5ByARYSgjbAlYSmAGRi7NIAQnI9v2+XQK024AWGFlUuQ1SJECzDYYFVE0BM+DM4oopSJMArTlwWkC1FDADrlxUKQUk4OqFVVIwlYAKEqZbwFKCxqNwyQzInIRlQzCrhJ4lqlqyJXqB2oIlw13SlGDSt5FbwnRwnRXx62D/9rgqIfWLzLeM6r/vXVsMAAAAAAAAAKAUHzmvbOQyGPspAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA60lEQVR42u2YuwHDIAwFEeukz2aeIpu59zxOlR4MSA/lrsZYPE74UwoAAMDfYrMmOs7rbhn3eb8sVQCtC1cNwyIWrhRCjVz87LlcDFhZcIQNtQgRYUNVK9A7BCkDIkIwZT09zgVJA+RaIPJRtfreGLBDkSstwIBdCl1lAQYQwEasaAMMIADR73QMIAACcHkSNAeQ9RygBXoGZ7QAA3ovyGbBIwMyhUALPL0wiwVDBkSFMPNlaLgFdg9h6zPgOK97NAhT1NLTRlPuT48QqsIuRG6AKRbluQmmvkM9C/rNnfkXHgAAAAAAAADAMF+D4WTgdRJYdgAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA2klEQVR42u2ZyxGDMAwFkdrJnc5SBZ3lnnqSFiDo8+Ts3o3s1bMGhm0DAAAA+FMs+oHP1/tzdc2xP2y8gF8OriDBug/eLcKUDt8hwhUPX/H82wJWwZW7U1FHPgHZEly1+1U1mQHq3c+uTQImbTYjBeMSEC3BJ9x/rkBiMxiCUzcelQISgAAEIGAsEYOQBCDgJJ0/L0iAioAVU0ACri5QSkHEXryrMFdgugCFFES8CZrKRrpmgSl1o0OEqUWyWoSp3s0qCamDbMJsKJ3kWUJW/VADAAAAAAAAgBy+jXlfA7kRYDoAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA00lEQVR42u2awRGEQAgEhXT8X2ZGcZn5Nx4N4UpvgcHt/utKM4tauiwAAAAAMCc2+oTbfpx3j/l+Vmsv4EnhChKsuvBqEaZUfIUIVyw+4/x/C8hg248zWoQrdydjPekEZEhw9e5Hr90mAVESvEv3p58BCAhKIgmYef+3TsCohrAFEICAvoyYAyQAAQhAAAIQgIDfVH6+IgEqAtRSMOJ6SECF9fYzQEVC6cvQWyTI/R+QPSg9egF1THFfZt4iTXFfZiYyNb5RYt76mA4AAAAAAAAQxAXF71sFkBuZNgAAAABJRU5ErkJggg=="],"amber":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhULs6EqxmivFjmxES7jRC/Awu/8aWV5QR5cFAAAAAObERp/w2Lfz7jHr52vtBTwpXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZHPt2Rotw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwm8rPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgAoKJaUWhRiKAAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkQpJR5SSaiglHaWRpAUIepyc3X8je3XWwLBtAAAAAH+KRT/w/Xp+rq557IeNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDFxJ0Xk/QAcw2AAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEYWko5TialKKO3Ijzit/MCAtyswbY7GM8FEKAADA32KzJrrO424Z93p/LFUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DqPezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfgzNkUJexn34AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABA0lEQVR42u2YyxHCMAwFbRVCR5RCNZSSjmgErhxgxomtr3fPjkfePCmf1gAANqbPbvA6Hu+Rdbf7s5cSMHrw6CK61cGjihCPw6/ey0SARsERJIh3Ad4SJEKRnhKkbY5EuTteKQiVAA8JtEC0gqxTEDIBlhLCtoCVBGZA5OIsUkACsn2/b5cA7TagBUYWVW6DFAnQbINhAVVTwAw4s7hiCtIkQGsOnBZQLQXMgCsXVUoBCbh6YZUUTCWggoTpFrCUoPEoXDIDMidh2RDMKqFniaqWbIleoLZgyXCXNCWY9G3kljAdXGdF/DrYvz2uSkj9IvMto/rve9cWAwAAAAAAAAAoxQeeomxUFfB0pwAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEYWko5TialKKO3Ijzit/MCAtyswbY7GM8FEKAADA32KzJrrO424Z93p/LFUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DqPezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfgzNkUJexn34AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkQpJR5SSaiglHaWRpAUIepyc3X8je3XWwLBtAAAAAH+KRT/w/Xp+rq557IeNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDFxJ0Xk/QAcw2AAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhULs6EqxmivFjmxES7jRC/Awu/8aWV5QR5cFAAAAAObERp/w2Lfz7jHr52vtBTwpXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZHPt2Rotw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwm8rPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgAoKJaUWhRiKAAAAAASUVORK5CYII="],"rose":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhWYs6QqxDguxJKvREm68C/Awu/8aWV5QR5cFAAAAAObERp/w3I/r6THr9rH2An4pXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZnPtxRYtw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwncrPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgB6Yta04JXd8YAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkZpJSRSSOigkJaWapAUIepyc3X8je3XWwLBtAAAAAH+KRT/wfbw+V9c8nruNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDFyeFXtEUVTKlAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEc2kpBSSOlyIS3I1zit/MCAtyswbY7GM8FEKAADA32KzJrqO824Z9/q8LVUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DrOezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfMQdkuEF4G8gAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABA0lEQVR42u2YyxHCMAwFbTVDSRRCHRSSkqgGrhxgxomtr3fPjkfePCmf1gAANqbPbvB6Hu+RdbfHvZcSMHrw6CK61cGjihCPw6/ey0SARsERJIh3Ad4SJEKRnhKkbY5EuTteKQiVAA8JtEC0gqxTEDIBlhLCtoCVBGZA5OIsUkACsn2/b5cA7TagBUYWVW6DFAnQbINhAVVTwAw4s7hiCtIkQGsOnBZQLQXMgCsXVUoBCbh6YZUUTCWggoTpFrCUoPEoXDIDMidh2RDMKqFniaqWbIleoLZgyXCXNCWY9G3kljAdXGdF/DrYvz2uSkj9IvMto/rve9cWAwAAAAAAAAAoxQcRSGy8GGqU5QAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA7ElEQVR42u2YyQHDIAwEEc2kpBSSOlyIS3I1zit/MCAtyswbY7GM8FEKAADA32KzJrqO824Z9/q8LVUArQtXDcMiFq4UQo1c/Oy5XAxYWXCEDbUIEWFDVSvQOwQpAyJCMGU9Pc4FSQPkWiDyUbX63hiwQ5ErLcCAXQpdZQEGEMBGrGgDDCAA0e90DCAAAnB5EjQHkPUcoAV6Bme0AAN6L8hmwSMDMoVACzy9MIsFQwZEhTDzZWi4BXYPYesz4DrOezQIU9TS00ZT7k+PEKrCLkRugCkW5bkJpr5DPQv6zZ35Fx4AAAAAAAAAwDBfMQdkuEF4G8gAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA20lEQVR42u2Z2xGDMAwEkZpJSRSSOigkJaWapAUIepyc3X8je3XWwLBtAAAAAH+KRT/wfbw+V9c8nruNF/DLwRUkWPfBu0WY0uE7RLji4Suef1vAKrhydyrqyCcgW4Krdr+qJjNAvfvZtUnApM1mpGBcAqIl+IT7zxVIbAZDcOrGo1JAAhCAAASMJWIQkgAEnKTz5wUJUBGwYgpIwNUFSimI2It3FeYKTBegkIKIN0FT2UjXLDClbnSIMLVIVosw1btZJSF1kE2YDaWTPEvIqh9qAAAAAAAAAJDDFyeFXtEUVTKlAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA1ElEQVR42u2a0RGEMAgFhWYs6QqxDguxJKvREm68C/Awu/8aWV5QR5cFAAAAAObERp/w3I/r6THr9rH2An4pXEGCVRdeLcKUiq8Q4YrFZ5z/bwEZnPtxRYtw5e5krCedgAwJrt796LXbJCBKgnfp/vQzAAFBSSQBM+//1gkY1RC2AAIQ0JcRc4AEIAABCEAAAhDwncrPVyRARYBaCkZcDwmosN5+BqhIKH0ZeosEuf8DsgelRy+gjinuy8xbpCnuy8xEpsY3SsxbH9MBAAAAAAAAgrgB6Yta04JXd8YAAAAASUVORK5CYII="]};
  const GHOST_FRAMES = Object.fromEntries(Object.entries(GHOST_FRAME_URLS).map(([name, urls]) =>
    [name, urls.map(url => { const im = new Image(); im.src = url; return im; })]
  ));
  const GHOST_PALETTES = {
    player: ['transparent','#23223c','#f2eefc','#f2eefc','#23223c'],
    lilac: ['transparent','#ad95e2','#ad95e2','#ad95e2','#ad95e2'],
    cyan: ['transparent','#75cad5','#75cad5','#75cad5','#75cad5'],
    amber: ['transparent','#e2b36d','#e2b36d','#e2b36d','#e2b36d'],
    rose: ['transparent','#d98da9','#d98da9','#d98da9','#d98da9']
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function createPlayer() {
    return {
      x: W / 2,
      y: H / 2,
      radius: 20,
      baseSpeed: 180,
      speedBoost: 0,
      shield: 0,
      frenzy: 0,
      dirX: 0,
      dirY: 0,
    };
  }

  function resetGame() {
    state.mode = 'playing';
    state.time = 0;
    state.spawnTimer = 0;
    state.itemTimer = 2.5;
    state.hurtFlash = 0;
    state.score = 0;
    state.lives = 3;
    state.entities = [];
    state.items = [];
    state.particles = [];
    state.invuln = 0;
    state.stage = 1;
    state.growth = 0;
    state.messages = [];
    state.player = createPlayer();
  }

  function currentStage() {
    if (state.growth >= growthThresholds[2]) return 3;
    if (state.growth >= growthThresholds[1]) return 2;
    return 1;
  }

  function edibleRadius() {
    const p = state.player;
    if (p.frenzy > 0) return Infinity;
    return p.radius * 0.9;
  }

  function addMessage(text, color = '#fff2bd') {
    state.messages.push({ text, color, t: 2.0 });
    if (state.messages.length > 4) state.messages.shift();
  }

  function emitParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x, y,
        vx: rand(-60, 60),
        vy: rand(-60, 60),
        life: rand(0.4, 0.9),
        maxLife: rand(0.4, 0.9),
        r: rand(2, 5),
        color,
      });
    }
  }

  function weightedGhostKind() {
    const cfg = stageData[state.stage];
    const weights = cfg.weights;
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return i;
    }
    return 0;
  }

  function ghostByKind(kind) {
    // 0 tiny, 1 small, 2 medium, 3 big
    const defs = [
      { radius: rand(10, 15), points: 10, growth: 14, sprite: 'tiny', palette: 'lilac' },
      { radius: rand(16, 20), points: 22, growth: 18, sprite: 'small', palette: 'cyan' },
      { radius: rand(21, 27), points: 40, growth: 25, sprite: 'medium', palette: 'amber' },
      { radius: rand(28, 38), points: 70, growth: 38, sprite: 'big', palette: 'rose' },
    ];
    return defs[kind];
  }

  function spawnGhost() {
    const kind = weightedGhostKind();
    const g = ghostByKind(kind);
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const speedRange = stageData[state.stage].speed;
    const baseSpeed = rand(speedRange[0], speedRange[1]);
    const entity = {
      type: 'ghost',
      x: side === 'left' ? -g.radius - 8 : W + g.radius + 8,
      y: rand(70, H - 55),
      radius: g.radius,
      points: g.points,
      growth: g.growth,
      sprite: g.sprite,
      palette: g.palette,
      vx: side === 'left' ? baseSpeed : -baseSpeed,
      vy: rand(-15, 15),
      bob: rand(0, Math.PI * 2),
      blink: rand(0, 2),
    };
    state.entities.push(entity);
  }

  function spawnItem() {
    const roll = Math.random();
    let item;
    if (roll < 0.32) item = { kind: 'shield', color: '#6fc6ff' };
    else if (roll < 0.60) item = { kind: 'speed', color: '#ffe16f' };
    else if (roll < 0.84) item = { kind: 'frenzy', color: '#ff6f9f' };
    else item = { kind: 'heart', color: '#95ff95' };

    state.items.push({
      ...item,
      x: rand(60, W - 60),
      y: rand(70, H - 70),
      radius: item.kind === 'heart' ? 13 : 11,
      life: 8,
      pulse: rand(0, Math.PI * 2),
    });
  }

  function updateStage() {
    const nextStage = currentStage();
    if (nextStage !== state.stage) {
      state.stage = nextStage;
      const targetRadius = nextStage === 1 ? 20 : nextStage === 2 ? 28 : 38;
      state.player.radius = targetRadius;
      addMessage(\`STAGE \${state.stage}!\`, '#fff39b');
      emitParticles(state.player.x, state.player.y, '#fff39b', 22);
    }
  }

  function applyItem(kind) {
    const p = state.player;
    if (kind === 'shield') {
      p.shield = 6;
      addMessage('보호막 획득!', '#9be4ff');
    } else if (kind === 'speed') {
      p.speedBoost = 6;
      addMessage('속도 증가!', '#fff39b');
    } else if (kind === 'frenzy') {
      p.frenzy = 5;
      addMessage('폭식 모드!', '#ff9bbc');
    } else if (kind === 'heart') {
      state.lives = Math.min(5, state.lives + 1);
      addMessage('생명 +1', '#b5ffb5');
    }
  }

  function hurtPlayer() {
    if (state.invuln > 0 || state.player.shield > 0) return;
    state.lives -= 1;
    // Play the scream only for the final hit; ordinary damage keeps its own sound.
    mzPlaySfx(state.lives <= 0 ? 'gameover' : 'hurt');
    state.invuln = 1.4;
    state.hurtFlash = 0.4;
    emitParticles(state.player.x, state.player.y, '#ff7a9c', 20);

    if (state.lives <= 0) {
      state.mode = 'gameover';
      if (state.score > highScore) {
        highScore = state.score;
        try { localStorage.setItem(STORAGE_KEY, String(highScore)); } catch (_err) { /* local-only preview */ }
        addMessage('최고 점수 갱신!', '#fff39b');
      }
    }
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function update(dt) {
    if (state.mode !== 'playing') return;

    state.time += dt;
    state.bgScroll += dt * 18;
    state.spawnTimer -= dt;
    state.itemTimer -= dt;
    state.hurtFlash = Math.max(0, state.hurtFlash - dt);
    state.invuln = Math.max(0, state.invuln - dt);

    const p = state.player;
    p.shield = Math.max(0, p.shield - dt);
    p.speedBoost = Math.max(0, p.speedBoost - dt);
    p.frenzy = Math.max(0, p.frenzy - dt);

    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) dx += 1;
    if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) dy -= 1;
    if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;

    const speed = p.baseSpeed * (p.speedBoost > 0 ? 1.55 : 1);
    p.x = clamp(p.x + dx * speed * dt, p.radius, W - p.radius);
    p.y = clamp(p.y + dy * speed * dt, p.radius + 10, H - p.radius - 8);

    if (state.spawnTimer <= 0) {
      spawnGhost();
      const interval = state.stage === 1 ? rand(0.45, 0.85) : state.stage === 2 ? rand(0.35, 0.7) : rand(0.28, 0.58);
      state.spawnTimer = interval;
    }

    if (state.itemTimer <= 0) {
      if (state.items.length < 2) spawnItem();
      state.itemTimer = rand(5.5, 9.5);
    }

    for (const e of state.entities) {
      e.x += e.vx * dt;
      e.y += e.vy * dt + Math.sin(state.time * 2.3 + e.bob) * 10 * dt;
      if (e.y < 55) e.y = 55;
      if (e.y > H - 45) e.y = H - 45;
    }
    state.entities = state.entities.filter(e => e.x > -80 && e.x < W + 80);

    for (const item of state.items) {
      item.life -= dt;
      item.pulse += dt * 4;
    }
    state.items = state.items.filter(i => i.life > 0);

    for (let i = state.entities.length - 1; i >= 0; i--) {
      const e = state.entities[i];
      if (dist(p, e) < p.radius + e.radius - 2) {
        if (e.radius <= edibleRadius()) {
          mzPlaySfx('ghost');
          state.score += e.points;
          state.growth += e.growth;
          emitParticles(e.x, e.y, ghostPalette(e.palette)[2], 14);
          state.entities.splice(i, 1);
          updateStage();
        } else {
          hurtPlayer();
        }
      }
    }

    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      if (dist(p, item) < p.radius + item.radius) {
        mzPlaySfx('item');
        applyItem(item.kind);
        emitParticles(item.x, item.y, item.color, 12);
        state.items.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const part = state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.messages.length - 1; i >= 0; i--) {
      state.messages[i].t -= dt;
      if (state.messages[i].t <= 0) state.messages.splice(i, 1);
    }
  }

  function drawBackground() {
    // MILE ZERO의 절제된 UI에 맞춘 단색 아케이드 화면.
    ctx.fillStyle = '#101626';
    ctx.fillRect(0, 0, W, H);
  }

  function ghostPalette(name) {
    return GHOST_PALETTES[name] || GHOST_PALETTES.lilac;
  }

  function drawGhost(x, y, r, paletteName, options = {}) {
    const group = GHOST_FRAMES[paletteName] || GHOST_FRAMES.lilac;
    const animationTime = state.mode === 'title' ? performance.now() / 1000 : state.time;
    const index = Math.floor(animationTime * 10 + (options.phase || 0)) % group.length;
    const frame = group[index];
    if (!frame.complete || !frame.naturalWidth) return;
    // GIF 원본은 64px 프레임 안에 실제 유령 본체가 약 46px 폭으로 들어 있다.
    // 충돌 반경 r를 그대로 읽기 어려웠기 때문에, 보이는 본체 폭을 반경 기반으로 직접 환산해
    // 작은/중간/큰 유령의 차이가 확실히 보이도록 연속 스케일링한다.
    const visibleBodyWidth = 46;
    const desiredBodyWidth = Math.max(24, Math.round(r * 2.6));
    const renderSize = Math.max(32, Math.round(64 * (desiredBodyWidth / visibleBodyWidth)));
    const drawX = Math.round(x - renderSize / 2);
    const drawY = Math.round(y - renderSize / 2 + (options.bobOffset || 0));
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (options.outline) {
      ctx.strokeStyle = options.outline;
      ctx.lineWidth = 2;
      const box = Math.round(r + 10);
      ctx.strokeRect(Math.round(x - box), Math.round(y - box), Math.round(box * 2), Math.round(box * 2));
    }
    ctx.drawImage(frame, drawX, drawY, renderSize, renderSize);
    ctx.restore();
  }

  function drawHeart(x, y, size, color) {
    const s = Math.max(2, Math.round(size / 4));
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = color;
    const px = [
      [-2,-1],[-1,-2],[0,-2],[1,-1],[2,-2],[3,-2],[4,-1],
      [-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],
      [-2,1],[-1,1],[0,1],[1,1],[2,1],[3,1],[4,1],
      [-1,2],[0,2],[1,2],[2,2],[3,2],
      [0,3],[1,3],[2,3]
    ];
    px.forEach(([cx,cy]) => ctx.fillRect(cx*s, cy*s, s, s));
    ctx.restore();
  }

  function drawItem(item) {
    ctx.save();
    const pulse = 1 + Math.sin(item.pulse) * 0.06;
    ctx.translate(Math.round(item.x), Math.round(item.y));
    ctx.scale(pulse, pulse);
    const unit = 4;

    function pixelBall(main, hi) {
      ctx.fillStyle = main;
      const coords = [
        [0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]
      ];
      coords.forEach(([x,y]) => ctx.fillRect(x*unit, y*unit, unit, unit));
      ctx.fillStyle = hi;
      [[-1,-1],[0,-2]].forEach(([x,y]) => ctx.fillRect(x*unit, y*unit, unit, unit));
    }

    if (item.kind === 'heart') {
      drawHeart(0, 0, item.radius, item.color);
    } else if (item.kind === 'shield') {
      pixelBall('#69cfff', '#eaf8ff');
    } else if (item.kind === 'speed') {
      pixelBall('#ffe16f', '#fff7c9');
    } else {
      pixelBall('#ff7ea8', '#ffe3ee');
    }
    ctx.restore();
  }

  function drawHud() {
    ctx.fillStyle = 'rgba(23, 28, 48, 0.96)';
    ctx.fillRect(14, 14, W - 28, 64);
    ctx.strokeStyle = UI.line;
    ctx.strokeRect(14, 14, W - 28, 64);

    ctx.fillStyle = UI.accent;
    ctx.font = 'bold 22px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
    ctx.fillText(\`GHOST EATER\`, 30, 39);
    ctx.fillStyle = UI.text;
    ctx.font = 'bold 16px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
    ctx.fillText(\`SCORE  \${state.score}\`, 30, 61);
    ctx.fillText(\`BEST  \${highScore}\`, 175, 61);
    ctx.fillText(\`STAGE  \${state.stage}\`, 310, 61);

    const barX = 435, barY = 36, barW = 170, barH = 10;
    ctx.fillStyle = '#2a324d';
    ctx.fillRect(barX, barY, barW, barH);
    const growthCurrent = state.stage === 1 ? state.growth : state.stage === 2 ? state.growth - growthThresholds[1] : state.growth - growthThresholds[2];
    const growthNeed = state.stage === 1 ? growthThresholds[1] : state.stage === 2 ? growthThresholds[2] - growthThresholds[1] : 120;
    ctx.fillStyle = UI.accent2;
    ctx.fillRect(barX, barY, Math.min(1, growthCurrent / growthNeed) * barW, barH);
    ctx.strokeStyle = UI.line;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#cfd7ee';
    ctx.font = '13px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
    ctx.fillText('GROWTH', barX, 60);

    for (let i = 0; i < state.lives; i++) {
      drawHeart(W - 114 + i * 28, 44, 12, '#ff8aa3');
    }

    const p = state.player;
    const effects = [];
    if (p.shield > 0) effects.push({ name: 'SHIELD', color: '#6fc6ff', t: p.shield });
    if (p.speedBoost > 0) effects.push({ name: 'SPEED', color: '#ffe16f', t: p.speedBoost });
    if (p.frenzy > 0) effects.push({ name: 'FRENZY', color: '#ff84aa', t: p.frenzy });

    effects.forEach((fx, idx) => {
      const x = 14;
      const y = 88 + idx * 22;
      ctx.fillStyle = '#1a2036';
      ctx.fillRect(x, y, 146, 16);
      ctx.fillStyle = fx.color;
      ctx.fillRect(x, y, Math.max(0, Math.min(1, fx.t / (fx.name === 'FRENZY' ? 5 : 6))) * 146, 16);
      ctx.strokeStyle = UI.line;
      ctx.strokeRect(x, y, 146, 16);
      ctx.fillStyle = '#101522';
      ctx.font = 'bold 11px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
      ctx.fillText(fx.name, x + 6, y + 12);
    });

    state.messages.forEach((m, i) => {
      ctx.fillStyle = '#101522';
      ctx.fillRect(560, 84 + i * 24, 220, 18);
      ctx.strokeStyle = UI.line;
      ctx.strokeRect(560, 84 + i * 24, 220, 18);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 14px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
      ctx.fillText(m.text, 568, 98 + i * 24);
    });
  }

  function drawGame() {
    drawBackground();

    for (const item of state.items) drawItem(item);

    for (const e of state.entities) {
      e.blink += 0.03;
      drawGhost(e.x, e.y, e.radius, e.palette, { blink: e.blink, sprite: e.sprite, bobOffset: Math.sin(state.time * 5 + e.bob) * 1.5 });
    }

    const p = state.player;
    let outline = null;
    if (p.frenzy > 0) outline = '#ff6f9f';
    else if (p.shield > 0) outline = '#6fc6ff';

    if (state.invuln > 0 && Math.floor(state.time * 10) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }
    drawGhost(p.x, p.y, p.radius, 'player', { outline, sprite: 'player', bobOffset: Math.sin(state.time * 6) * 1.5 });
    ctx.globalAlpha = 1;

    if (p.shield > 0) {
      ctx.strokeStyle = 'rgba(111,198,255,0.95)';
      ctx.lineWidth = 2;
      const sz = p.radius + 16;
      ctx.strokeRect(Math.round(p.x - sz), Math.round(p.y - sz), Math.round(sz * 2), Math.round(sz * 2));
    }

    for (const part of state.particles) {
      ctx.globalAlpha = part.life / part.maxLife;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    drawHud();

    if (state.hurtFlash > 0) {
      ctx.fillStyle = \`rgba(255,100,130,\${state.hurtFlash * 0.22})\`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawOverlay(title, lines, footer) {
    ctx.fillStyle = 'rgba(10, 14, 24, 0.76)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#171c30';
    ctx.fillRect(130, 118, W - 260, H - 236);
    ctx.strokeStyle = UI.line;
    ctx.lineWidth = 2;
    ctx.strokeRect(130, 118, W - 260, H - 236);

    ctx.fillStyle = UI.accent;
    ctx.font = 'bold 40px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 184);

    ctx.fillStyle = '#eaf1ff';
    ctx.font = '18px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
    let y = 238;
    lines.forEach(line => {
      ctx.fillText(line, W / 2, y);
      y += 32;
    });

    if (footer) {
      ctx.fillStyle = UI.accent2;
      ctx.font = 'bold 17px Courier New, D2Coding, Nanum Gothic Coding, Apple SD Gothic Neo, monospace';
      ctx.fillText(footer, W / 2, H - 146);
    }
    ctx.textAlign = 'left';
  }

  function render() {
    if (state.mode === 'title') {
      drawBackground();
      const preview = createPlayer();
      drawGhost(W / 2, H / 2 - 20, 36, 'player');
      drawOverlay('GHOST EATER', [
        '작은 유령을 먹고 성장하세요.',
        '더 큰 유령과 부딪히면 생명이 줄어듭니다.',
        \`최고 점수  \${highScore}\`
      ], 'ENTER 또는 시작 버튼으로 플레이');
      return;
    }

    drawGame();

    if (state.mode === 'paused') {
      drawOverlay('PAUSED', ['잠시 쉬는 중입니다.'], 'P를 누르면 계속');
    } else if (state.mode === 'gameover') {
      drawOverlay('GAME OVER', [
        \`이번 점수  \${state.score}\`,
        \`최고 점수  \${highScore}\`,
        \`도달 단계  \${state.stage}\`
      ], 'R 또는 시작 버튼으로 다시 플레이');
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key);

    if (e.key === 'Enter') {
      if (state.mode === 'title' || state.mode === 'gameover') resetGame();
    }
    if (e.key === 'r' || e.key === 'R') {
      resetGame();
    }
    if (e.key === 'p' || e.key === 'P') {
      if (state.mode === 'playing') state.mode = 'paused';
      else if (state.mode === 'paused') state.mode = 'playing';
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key);
  });

  startBtn.addEventListener('click', () => {
    resetGame();
  });

  pauseBtn.addEventListener('click', () => {
    if (state.mode === 'playing') state.mode = 'paused';
    else if (state.mode === 'paused') state.mode = 'playing';
  });

  render();
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>
`;
