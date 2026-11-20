/* MILE ZERO — start-up: wiring and initial render, in original order.
   Loaded last, after js/data/* and the other js/game/* files. */
'use strict';

const dailyVisits={1:visits,2:dayTwoVisits,3:dayThreeVisits,4:dayFourVisits,5:dayFiveVisits,6:daySixVisits,7:daySevenVisits,8:dayEightVisits,9:dayNineVisits,10:dayTenVisits,11:dayElevenVisits,12:dayTwelveVisits,13:day13Visits,14:day14Visits,15:day15Visits,16:day16Visits,17:day17Visits,18:day18Visits,19:day19Visits,20:day20Visits,21:day21Visits,22:day22Visits,23:day23Visits,24:day24Visits,25:day25Visits,26:day26Visits,27:day27Visits,28:day28Visits,29:day29Visits,30:day30Visits,31:day31Visits,32:day32Visits,33:day33Visits,34:day34Visits,35:day35Visits,36:day36Visits,37:day37Visits,38:day38Visits,39:day39Visits,40:day40Visits,41:day41Visits,42:day42Visits,43:day43Visits};

let mzFontSize=mzReadFontSize();

mzApplyFontSize(mzFontSize);

window.mzFontSettings={get:()=>mzFontSize,set:mzSetFontSize};

let mzVisualPrefs=mzReadVisualPrefs();

document.body?.classList.toggle('mz-custom-images-disabled',mzVisualPrefs.portraits===false);

window.mzVisuals={getPrefs:()=>({...mzVisualPrefs}),isPanoramaEnabled:()=>mzVisualPrefs.panorama!==false,setPanoramaEnabled:v=>mzWriteVisualPrefs({panorama:!!v}),isPortraitEnabled:()=>mzVisualPrefs.portraits!==false,setPortraitEnabled:v=>{mzWriteVisualPrefs({portraits:!!v});scene();},apply:mzApplyVisualPrefs};

let s=initial(),modal=null;

let expandedPosts=new Set(), phoneMail=null;

applyThemePreference();

// SNS hearts belong to the active game state and are included in save slots.
// Previous global browser likes are deliberately not restored.
let mzHearts=new Set();

document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-like-post]');if(btn){e.preventDefault();mzToggleHeart(btn.dataset.likePost)} });

// Apply user-authored revisions LAST so subsequent day additions cannot overwrite them.
for(const p of feedPosts){const update=mzScriptPostOverrides[p.id];if(update)Object.assign(p,update)}

$('dialogueText').addEventListener('click',()=>revealDialogue());

mzDevOptions.history=true;

setInterval(waitTick,250);

$('prevStation').onclick=$('nextStation').onclick=()=>{s.station=s.station==='drink'?'food':'drink';render()};

$('drinkIndicator').onclick=()=>{s.station='drink';render()};

$('foodIndicator').onclick=()=>{s.station='food';render()};

$('headerBgmButton').onclick=()=>openPanel('settings');

$('returnToTitle').onclick=showExitDialog;

$('headerLightButton').onclick=()=>switchLight(bootScreen==='none'&&s.phase==='open'?'bar':'settings');

document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal)closePanel()});

const effectPlayers = Object.fromEntries(Object.entries(EFFECT_DATA).map(([key,src])=>{
 const player=new Audio(src);player.preload='auto';return [key,player];
}));

try { const saved=JSON.parse(localStorage.getItem(SFX_CONFIG_KEY)||'{}'); if(Number.isFinite(saved.volume))sfxVolume=Math.max(0,Math.min(1,saved.volume)); } catch(e) {}

window.mileEffects={
 getVolume:()=>Math.round(sfxVolume*100),
 setVolume(v){sfxVolume=Math.max(0,Math.min(1,Number(v)/100));try{localStorage.setItem(SFX_CONFIG_KEY,JSON.stringify({volume:sfxVolume}))}catch(e){}window.mzMusicBox?.sync?.();window.mzArcadeMusic?.sync?.();},
 preview(){playEffect('ice')},
 play(key){playEffect(key)}
};

// One effect per interaction: actions with bespoke sounds supersede default clicks.
document.addEventListener('click',function(event){
 const b=event.target.closest('button, input[type="checkbox"]');
 if(!b||b.disabled)return;
 if(b.matches('[data-like-post]'))return; // Heart on-only has its own sound.
 const id=b.id||'';
 if(b.matches('[data-add], [data-adddev]')){playEffect('pour');return;}
 if(id==='iceBtn'){if(!s.ice)playEffect('ice');return;}
 if(id==='stirBtn'){if(!s.stirred&&s.mix.length)playEffect('mix');return;}
 if(id==='clearBtn'||id==='foodClear'||id==='devReset'){playEffect('clear');return;}
 if(b.matches('[data-field], [data-base], [data-food-addon]')){playEffect('food');return;}
 if(id==='extraBtn')return; // Sound on add is handled in extraBtn; removal is silent.
 if(id==='devTopping'){if(!b.checked)playEffect('topping');return;}
 if(id==='finishBtn'||id==='foodMake'||id==='devSave')return; // success-only below
 if(b.matches('[data-recipe]')||id==='recipeDrink'||id==='recipeFood'||b.matches('[data-panel="recipes"]')){playEffect('recipe');return;}
 if(id==='mailBack'||b.matches('[data-mail], [data-pmail]')){playEffect('recipe');return;}
 playEffect('click');
},true);

render();
