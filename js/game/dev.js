/* MILE ZERO — Developer tools (day jump, portrait preview, test history).
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

// Developer previews are deliberately separate from ordinary day gates.
let mzDevDay=12;

let mzDevOwned=[];

let mzDevRewards=[];

let mzDevOptions={daily:true,market:true,mechanic:false,fried:true};

let mzDevPortraitChoice='maren';

const mzDevPortraitChoices=[
 ['maren','마렌'],['mechanic','야간 정비사'],['officeworker','인근 직장인'],['rian','리안'],
 ['freight','정기 화물 기사'],['settler','황무지 출신 정착민'],['kairen','카이렌'],['mika','미카'],['torban','토르반'],
 ['genericcasuala','일반 손님 · 일상복 A'],['genericcasualb','일반 손님 · 일상복 B'],
 ['generictravela','일반 손님 · 여행복 A'],['generictravelb','일반 손님 · 여행복 B'],
 ['genericworka','일반 손님 · 업무복 A'],['genericworkb','일반 손님 · 업무복 B'],
 ['gatewaiter30','DAY30 · 관문 대기객'],
 ['mukbanginfluencer','먹방 인플루언서'],['zeroinspector','ZERO 현장 점검 직원'],
 ['redsonga','빨간 노래 손님 A'],['redsongb','빨간 노래 손님 B'],
 ['torbanwife','토르반의 아내'],['couple','토르반 부부']
];

function mzDevPortraitPreview(){
 bootScreen='devPortrait';render();
}

// Only explicitly scripted days are playable. Raise this constant after adding and testing the next day's script.
const LAST_SCRIPTED_DAY=43;

function mzDayLimit(){return s.devPreview?50:LAST_SCRIPTED_DAY;}

function mz186PopulateDeveloperHistory(){
 if(!mzDevOptions.history)return;
 s.guestVisits=[];
 for(let d=1;d<s.day;d++){
  for(const [i,v] of (dailyVisits[d]||[]).entries()){
   const names=[v.who];
   if(d===17&&String(v.who).includes('카이렌')&&String(v.who).includes('미카'))names.push('카이렌','미카');
   for(const who of new Set(names))s.guestVisits.push({id:`${d}:${i}:${who}`,day:d,visit:i,who,devSynthetic:true});
  }
 }
 s.guestClues=[];s.guestArchiveSeen=[];
}

function mz186DeveloperWeekend(){
 const selected=mzDevDay;let weekend=MZ_WEEKEND_DAYS.filter(d=>d<=selected).pop()||5;
 const light=s.light;s=initial();s.light=light;s.day=weekend;s.phase='closing';s.seenIntro=true;s.devPreview=true;s.wallet=2500;
 s.ownedMarket=[...new Set([...mzDevOwned,...(mzDevOptions.market?marketCatalog.filter(m=>!m.unlockDay||m.unlockDay<=weekend).map(m=>m.id):[])])];
 // Developer weekend preview only: unlock all MY DESK furniture and collectibles without changing regular saves.
 s.deskOwned=MZ_DESK_CATALOG.map(i=>i.id);
 mz186PopulateDeveloperHistory();mzDeskState();mzWeekendTab='home';mzWeekendPhoneOpen=false;bootScreen='weekend';render();
}

function mzDeveloperBegin(){
 const light=s.light; s=initial();s.light=light;s.day=mzDevDay;s.devPreview=true;s.seenIntro=true;
 s.wallet=2500; s.ownedMarket=[...new Set([...mzDevOwned,...marketRecipeRewards.filter(r=>mzDevRewards.includes(r.name)).flatMap(r=>r.required)])];
 s.unlockedExtras=[];
 if(mzDevOptions.daily){if(s.day>=3)s.unlockedExtras.push('sunfruit');if(s.day>=5)s.unlockedExtras.push('citrus');}
 if(mzDevOptions.market){s.ownedMarket=[...new Set([...s.ownedMarket,...marketCatalog.filter(m=>!m.unlockDay||m.unlockDay<=s.day).map(m=>m.id)])];}
 if(mzDevOptions.mechanic){s.regularUnlocks=['mechanic'];s.mechanicRegularFrom=8;s.recipeNotices.push('훈연 바삭 꼬치');}
 if(mzDevOptions.fried && s.day>=10){for(const r of friedRecipes)s.recipeNotices.push(r.name);}
 // Developer direct-jump to DAY36+ skips DAY35's reward scene.
 // Only the isolated developer preview receives this prerequisite automatically.
 if(s.day>=36&&!s.regularUnlocks.includes('nonheat'))s.regularUnlocks.push('nonheat');
 syncMarketRecipeRewards();
 if(mzDevRewards.includes('mechanic')&&!s.regularUnlocks.includes('mechanic')){s.regularUnlocks.push('mechanic');s.mechanicRegularFrom=8;}
 s.phase='prep';s.visit=0;s.sub='dialogue';s.completed=[];s.waitUntil=null;
 mz186PopulateDeveloperHistory();
 bootScreen='phone';render();
}

function mzDeveloperBoot(el,shell){
 const days=Array.from({length:50},(_,i)=>i+1);
 const dateChoice=days.map(d=>`<option value="${d}" ${d===mzDevDay?'selected':''}>DAY ${String(d).padStart(2,'0')}${d>LAST_SCRIPTED_DAY?' · 미작성':''}</option>`).join('');
 const recipeChoices=marketRecipeRewards.map(r=>`<label class=\"mz-dev-check\"><input type=\"checkbox\" data-dev-recipe=\"${esc(r.name)}\" ${mzDevRewards.includes(r.name)?'checked':''}> ${esc(r.name)}</label>`).join('');
 const quickWeeks=[1,6,11,16,21,26,31,36,41,46].map(d=>`<button type=\"button\" data-dev-day=\"${d}\" class=\"mz-dev-daybtn\">DAY ${String(d).padStart(2,'0')}</button>`).join('');
 const marketChoices=marketCatalog.map(m=>`<label class="mz-dev-check"><input type="checkbox" data-dev-market="${esc(m.id)}" ${mzDevOwned.includes(m.id)?'checked':''}> ${esc(m.name)}</label>`).join('');
 el.innerHTML=shell('DEVELOPER MODE',`<div class="boot-meta">테스트 전용 · 일반 플레이 저장과 별도 · 미작성 DAY는 손님 없음</div><div class="mz-dev-settings"><label>이동 날짜 <select id="mzDevSelect">${dateChoice}</select></label><div class="mz-dev-section">해금 상태</div><label class="mz-dev-check"><input type="checkbox" id="mzDevAllMarket" ${mzDevOptions.market?'checked':''}> 이동 날짜까지 상점 상품 모두 구매한 상태</label><label class="mz-dev-check"><input type="checkbox" id="mzDevDaily" ${mzDevOptions.daily?'checked':''}> 날짜 해금 재료(석양열매·시트러스)</label><label class="mz-dev-check"><input type="checkbox" id="mzDevMechanic" ${mzDevOptions.mechanic?'checked':''}> 야간 정비사 의뢰 완료 · 보상 레시피</label><label class="mz-dev-check"><input type="checkbox" id="mzDevFried" ${mzDevOptions.fried?'checked':''}> DAY 10 튀김 메뉴 해금</label><label class="mz-dev-check"><input type="checkbox" id="mzDevHistory" ${mzDevOptions.history?'checked':''}> 이동 날짜 이전 단골 방문 기록 재현 (테스트용)</label><div class="mz-dev-section">상점 아이템 개별 선택 (위의 전체 구매를 해제하면 적용)</div><div class="mz-dev-item-grid">${marketChoices}</div><p class="boot-meta">상점 레시피는 선택한 재료의 구매 상태에 따라 자동 등록됩니다. 직접 개발한 사용자 메뉴와 과거 대화·퀘스트의 임의 완료 기록은 만들지 않습니다.</p></div><div class="boot-menu u228-host"><button class="boot-btn highlight" id="mzDevLaunch">선택한 상태로 테스트 시작</button><button class="boot-btn" id="mzDevWeekend">주말 화면 / MY DESK 미리보기</button><button class="boot-btn" id="mzDevPortraitPreview">바 카메라 · 단골 스탠딩 미리보기</button><button class="boot-btn" id="mzDevArcadePreview">미니게임 · GHOST EATER 테스트</button><button class="boot-btn" id="mzDevBack">‹ BACK</button></div>`);
 el.querySelector('#mzDevBack').onclick=()=>{bootScreen='slots';render()};
 el.querySelector('#mzDevSelect').onchange=e=>{mzDevDay=Number(e.target.value)};
 for(const [id,k] of [['mzDevAllMarket','market'],['mzDevDaily','daily'],['mzDevMechanic','mechanic'],['mzDevFried','fried']])el.querySelector('#'+id).onchange=e=>{mzDevOptions[k]=e.target.checked};
 el.querySelectorAll('[data-dev-day]').forEach(b=>b.onclick=()=>{mzDevDay=Number(b.dataset.devDay);el.querySelector('#mzDevSelect').value=String(mzDevDay)});
 el.querySelectorAll('[data-dev-recipe]').forEach(b=>b.onchange=e=>{const name=e.target.dataset.devRecipe;mzDevRewards=e.target.checked?[...new Set([...mzDevRewards,name])]:mzDevRewards.filter(x=>x!==name)});
 el.querySelectorAll('[data-dev-market]').forEach(b=>b.onchange=e=>{const id=e.target.dataset.devMarket;mzDevOwned=e.target.checked?[...new Set([...mzDevOwned,id])]:mzDevOwned.filter(x=>x!==id)});
 el.querySelector('#mzDevHistory').onchange=e=>{mzDevOptions.history=e.target.checked};
 el.querySelector('#mzDevWeekend').onclick=()=>{mz186DeveloperWeekend()};
 el.querySelector('#mzDevPortraitPreview').onclick=()=>mzDevPortraitPreview();
 el.querySelector('#mzDevArcadePreview').onclick=()=>mzOpenArcadePlaceholder({developerPreview:true});
 el.querySelector('#mzDevLaunch').onclick=()=>{mzDeveloperBegin()};
}
