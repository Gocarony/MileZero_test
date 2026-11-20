/* MILE ZERO — Recipe book, custom recipe development and editing.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

// DAY 35 story reward: three new dishes use the same base/sauce/method validation.
// Do not unlock by date alone; the freight driver's story must grant the flag.
const mzNonheatUnlocked=()=>Array.isArray(s.regularUnlocks)&&s.regularUnlocks.includes('nonheat');

function mzUnlockNonheatCooking(){
 if(!Array.isArray(s.regularUnlocks))s.regularUnlocks=[];
 if(s.regularUnlocks.includes('nonheat'))return false;
 s.regularUnlocks.push('nonheat');
 if(!Array.isArray(s.recipeNotices))s.recipeNotices=[];
 for(const name of ['육회','샐러드'])if(!s.recipeNotices.includes(name))s.recipeNotices.push(name);
 syncMarketRecipeRewards();
 return true;
}

const availableFoods=()=>[...foods,...(s.day>=10?friedRecipes:[]),...(s.day>=21?fishRecipes:[]),...(mzNonheatUnlocked()?nonheatRecipes:[])];

function migrateMarketRecipeNames(){
 if(!Array.isArray(s.customRecipes))s.customRecipes=[];
 const renamed={'민트 블루 아워':'베르단트 헤이즈','스모키 버섯볶음':'훈연 허브 버섯구이','초코칩 라스트 마일':'카라멜 쇼콜라','초코볼 라스트 마일':'카라멜 쇼콜라','민트 초코 믹스':'프로스트 카카오'};
 for(const r of s.customRecipes){
  if(!r||!renamed[r.name]||(r.source!=='market'&&!String(r.signature||'').startsWith('market:')))continue;
  const target=marketRecipeRewards.find(x=>x.name===renamed[r.name]);if(!target)continue;
  Object.assign(r,target,{source:'market',registered:true,signature:'market:'+target.name});
 }
 for(const field of ['recipeNotices','recipeNoticeSeen'])if(Array.isArray(s[field]))s[field]=[...new Set(s[field].map(n=>renamed[n]||n))];
}

function mzEnsureCustomIds(){
 if(!Array.isArray(s.customRecipes))s.customRecipes=[];
 const seen=new Set();
 for(const r of s.customRecipes){
  if(!r||r.source==='market')continue;
  if(typeof r.uid!=='string'||!r.uid.startsWith('user:')||seen.has(r.uid)){
   let i=1;while(seen.has('user:'+i)||s.customRecipes.some(x=>x!==r&&x.uid==='user:'+i))i++;
   r.uid='user:'+i;
  }
  seen.add(r.uid);
 }
}

function mzRecipeEditDay(){return s.phase==='closing'&&s.day>=3;}

function mzRecipeSignature(r){
 if(r.kind==='food')return 'F:'+r.foodBase+':'+r.foodSauce+':'+r.foodKind+':'+(r.addons||[]).slice().sort().join(',');
 const mode=r.mode||'layer',seq=r.seq||'';
 return 'D:'+mode+':'+(mode==='mix'?seq.split('').sort().join(''):mode==='partial'?seq.slice(0,r.mixAt||0).split('').sort().join('')+'|'+seq.slice(r.mixAt||0):seq)+':'+(mode==='partial'?(r.mixAt||0)+':':'')+(r.extra||'none');
}

function syncMarketRecipeRewards(){
 if(!Array.isArray(s.customRecipes))s.customRecipes=[];
 migrateMarketRecipeNames();mzEnsureCustomIds();if(!Array.isArray(s.developmentDays))s.developmentDays=s.developmentDone?[3]:[];s.developmentDays=[...new Set(s.developmentDays.filter(d=>Number.isInteger(d)&&d>=3&&d<=(s.devPreview?50:LAST_SCRIPTED_DAY)&&d%3===0))];if(s.developmentDone&&!s.developmentDays.includes(3))s.developmentDays.unshift(3);
 if(!Array.isArray(s.recipeNotices))s.recipeNotices=[];
 for(const reward of marketRecipeRewards){
  if(!reward.required.every(id=>(s.ownedMarket||[]).includes(id)))continue;
  if(reward.foodKind==='비가열'&&!mzNonheatUnlocked())continue;
  if(s.customRecipes.some(r=>r.source==='market'&&r.name===reward.name))continue;
  s.customRecipes.push({...reward,source:'market',registered:true,signature:'market:'+reward.name});
  if(!s.recipeNotices.includes(reward.name))s.recipeNotices.push(reward.name);
 }
}

// Menu development is available once per closing on every third day.
function canDevelopToday(){return s.phase==='closing'&&s.day>=3&&s.day%3===0&&!(s.developmentDays||[]).includes(s.day);}

function completeDevelopment(){if(!Array.isArray(s.developmentDays))s.developmentDays=[];if(!s.developmentDays.includes(s.day))s.developmentDays.push(s.day);if(s.day===3){s.developmentDone=true;if(!s.unlockedExtras.includes('sunfruit'))s.unlockedExtras.push('sunfruit');}}

function mzDeleteCustomRecipe(uid){
 if(!mzRecipeEditDay())return;
 const r=(s.customRecipes||[]).find(x=>x.uid===uid&&x.source!=='market');
 if(!r)return;
 if(!confirm('「'+r.name+'」 지점 한정 메뉴를 삭제하시겠습니까?'))return;
 s.customRecipes=s.customRecipes.filter(x=>x!==r);
 closePanel();render();
}

function openDevelopment(editUid=null){
 const existing=editUid?(s.customRecipes||[]).find(x=>x.uid===editUid&&x.source!=='market'):null;
 if(existing?!mzRecipeEditDay():!canDevelopToday())return;
 modal='development';
 let kind=existing?.kind||'drink',seq=existing?.seq||'',method=existing?.mode||'layer',devMixAt=existing?.mixAt||0,foodBase=existing?.foodBase||null,foodSauce=existing?.foodSauce||null,foodKind=existing?.foodKind||null,selectedGarnish=existing?.extra||null,recipeName=existing?.name||'',foodAddons=[...(existing?.addons||[])],error='';
 const draw=()=>{
  const recipeCup=seq?(devMixAt>0?`<div class="layer" style="height:${devMixAt*13}px;background:${blendColor(seq.slice(0,devMixAt).split(''))}"></div>`+seq.slice(devMixAt).split('').map(x=>`<div class="layer" style="background:${ingredients.find(i=>i[0]===x)[2]}"></div>`).join(''):seq.split('').map(x=>`<div class="layer" style="background:${ingredients.find(i=>i[0]===x)[2]}"></div>`).join('')):'';
  const drinkUI=`<div class="dev-workbench"><div><div class="note">기본 재료 ${seq.length}/10 · 재료당 최대 5</div><div class="actions">${ingredients.map(i=>`<button class="btn" data-adddev="${i[0]}" ${seq.length>=10||seq.split('').filter(x=>x===i[0]).length>=5?'disabled':''}>${i[1]}</button>`).join('')}</div><div class="actions"><button class="btn" id="devUndo" ${!seq?'disabled':''}>한 단계 취소</button><button class="btn" id="devReset" ${!seq?'disabled':''}>비우기</button></div><div class="note" style="margin-top:14px">제조 방식</div><div class="actions"><button class="btn ${devMixAt>0?'active':''}" id="devMix" ${!seq||devMixAt>0?'disabled':''}>↻ 섞기 실행</button></div></div><div class="dev-cup-area"><span class="note">개발 중인 컵</span><div class="cup">${recipeCup}${selectedGarnish?`<span class="dev-fruit v54-cup-garnish v54-garnish-${esc(selectedGarnish)}" title="${esc(garnishById(selectedGarnish)?.name||'가니쉬')}">${esc(({sunfruit:'✿',citrus:'◉',mint:'❧',cherry:'●',chocoball:'◉',tapioca:'◌',coffeejelly:'▦',whippedcream:'❀',berrymix:'✿',mintchoco:'❧',fire:'♨',flower:'✿'})[selectedGarnish]||'✦')}</span>`:''}</div><span class="note">${devMixAt>0?(seq.length>devMixAt?`혼합 ${devMixAt}단위 + 위쪽 층 ${seq.length-devMixAt}단위`:`혼합 ${devMixAt}단위`):'층 유지'}</span></div></div><div class="note">${seq?esc(seq.split('').map(x=>ingredients.find(i=>i[0]===x)[1]).join(' → ')):'빈 컵'}</div>`;
  const foodOptions=(items,field,val)=>items.map(item=>`<button class="btn ${val===item?'active':''}" data-dev-food="${field}" data-food-value="${esc(item)}" aria-pressed="${val===item?'true':'false'}">${esc(item)}</button>`).join('');
  const foodUI=`<div class="dev-food-builder"><p class="note">주재료, 양념, 조리 방식을 조합해서 새 안주를 개발합니다.</p><div class="note">주재료</div><div class="actions">${foodOptions(['육류','버섯','감자','채소','곡물 반죽',...(s.day>=21||foodBase==='생선'?['생선']:[])],'foodBase',foodBase)}</div><div class="note" style="margin-top:12px">양념 · 소스</div><div class="actions">${foodOptions(['소금','매운 양념','허브','달콤한 소스'],'foodSauce',foodSauce)}</div><div class="note" style="margin-top:12px">조리 방식</div><div class="actions">${foodOptions(['구이','볶음','국물',...(s.day>=10||foodKind==='튀김'?['튀김']:[]),...(mzNonheatUnlocked()||foodKind==='비가열'?['비가열']:[])],'foodKind',foodKind)}</div><div class="note" style="margin-top:12px">추가 재료 · 선택 사항</div><div class="actions">${marketCatalog.filter(item=>hasMarketItem(item.id)&&['smoke','crisp','spiceoil','curry','rice','vinegar','cheese','kimchi'].includes(item.id)).map(item=>`<button class="btn ${foodAddons.includes(item.id)?'active':''}" data-dev-addon="${esc(item.id)}" aria-pressed="${foodAddons.includes(item.id)}" ${!foodAddons.includes(item.id)&&foodAddons.length>=2?'disabled':''}>${esc(item.name)}</button>`).join('')}</div><div class="dev-food-preview">${esc([foodBase,foodSauce,foodKind,...foodAddons.map(id=>marketCatalog.find(item=>item.id===id)?.name||id)].filter(Boolean).join(' · ')||'조합을 선택하세요')}</div></div>`;
  $('modalRoot').innerHTML=`<div class="overlay" id="overlay"><div class="drawer" role="dialog" aria-modal="true"><header><span class="note">MILE ZERO · MENU LAB</span><button class="btn" id="closeDev">닫기 ×</button></header><h2>${existing?'지점 한정 메뉴 수정':'지점 한정 메뉴 개발'}</h2><p class="note">원하는 재료로 직접 구성하세요.</p><div class="tabs"><button class="btn ${kind==='drink'?'active':''}" data-kind="drink">음료</button><button class="btn ${kind==='food'?'active':''}" data-kind="food">안주</button></div>${kind==='drink'?drinkUI:foodUI}${kind==='drink'?`<div class="dev-topping v35-dev-garnish"><div class="note" style="margin-bottom:9px">GARNISH / 음료 가니쉬 · 선택 사항</div><div class="v35-garnish-grid">${unlockedGarnishes().map(g=>garnishCard(g,selectedGarnish===g.id)).join('')}</div>${!unlockedGarnishes().length?'<p class="note">사용 가능한 가니쉬가 없습니다.</p>':''}</div>`:''}<div class="item"><label for="devName">메뉴 이름</label><input id="devName" maxlength="24" autocomplete="off" placeholder="지점 한정 메뉴 이름 입력" value="${esc(recipeName)}" style="display:block;width:100%;margin-top:8px;padding:9px;background:var(--panel);color:var(--text);border:1px solid var(--line)"></div><div class="actions"><button class="btn primary" id="devSave">${existing?'수정 저장':'레시피 저장'}</button><button class="btn" id="devSkip">${existing?'수정 취소':'이번 개발 건너뛰기'}</button></div><div id="devError" role="status" class="note">${esc(error)}</div></div></div>`;
  // The same liquid-fx layer is used in the normal manufacturing cup.
  // Apply it after replacing the lab's HTML on every ingredient/mix change.
  if(kind==='drink')mz289DecorateLiquid($('overlay'));
  $('overlay').onclick=e=>{if(e.target.id==='overlay')closePanel()};
  $('closeDev').onclick=closePanel;
  document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.kind;error='';draw()});
  document.querySelectorAll('[data-adddev]').forEach(b=>b.onclick=()=>{seq+=b.dataset.adddev;error='';draw()});
  const reset=$('devReset');if(reset)reset.onclick=()=>{seq='';devMixAt=0;draw()};
  const undo=$('devUndo');if(undo)undo.onclick=()=>{if(devMixAt===seq.length)devMixAt=0;seq=seq.slice(0,-1);draw()};
  const mixButton=$('devMix');if(mixButton)mixButton.onclick=()=>{if(seq&&!devMixAt){devMixAt=seq.length;draw()}};
  document.querySelectorAll('[data-dev-food]').forEach(b=>b.onclick=()=>{const field=b.dataset.devFood,value=b.dataset.foodValue;if(field==='foodBase')foodBase=value;else if(field==='foodSauce')foodSauce=value;else if(field==='foodKind')foodKind=value;error='';draw()});
  document.querySelectorAll('[data-dev-addon]').forEach(b=>b.onclick=()=>{const id=b.dataset.devAddon;foodAddons=foodAddons.includes(id)?foodAddons.filter(x=>x!==id):foodAddons.length<2?[...foodAddons,id]:foodAddons;draw()});
  document.querySelectorAll('[data-garnish]').forEach(b=>b.onclick=()=>{selectedGarnish=selectedGarnish===b.dataset.garnish?null:b.dataset.garnish;error='';draw()});
  $('devName').oninput=e=>{recipeName=e.target.value};
  $('devSkip').onclick=()=>{if(!existing)completeDevelopment();closePanel();render()};
  $('devSave').onclick=()=>{
   recipeName=$('devName').value.trim();
   if(!recipeName){error='메뉴 이름을 입력하세요.';draw();return}
   if(kind==='drink'&&!seq.length){error='재료를 한 종류 이상 넣어 주세요.';draw();return}
   if(kind==='food'&&(!foodBase||!foodSauce||!foodKind)){error='주재료, 양념, 조리 방식을 모두 선택해 주세요.';draw();return}
   if(kind==='food'&&foodAddons.length>2){error='추가 재료는 최대 2종까지 선택할 수 있습니다.';draw();return}
   method=devMixAt>0?(devMixAt<seq.length?'partial':'mix'):'layer';
   const candidate={name:recipeName,kind,foodBase:kind==='food'?foodBase:null,foodSauce:kind==='food'?foodSauce:null,foodKind:kind==='food'?foodKind:null,addons:kind==='food'?[...foodAddons]:[],seq:kind==='drink'?seq:null,mode:kind==='drink'?method:null,mixAt:kind==='drink'?devMixAt:0,extra:kind==='drink'?(selectedGarnish||null):null,registered:true,source:'user'};
   candidate.signature=mzRecipeSignature(candidate);
   // Same recipes may coexist with official releases. Only avoid duplicating a user's own recipe.
   if(s.customRecipes.some(r=>r!==existing&&r.source!=='market'&&mzRecipeSignature(r)===candidate.signature)){error='동일한 지점 한정 메뉴 레시피가 이미 있습니다.';draw();return}
   if(existing)Object.assign(existing,candidate,{uid:existing.uid});
   else{s.customRecipes.push(candidate);mzEnsureCustomIds();completeDevelopment();}
   closePanel();note('메뉴 개발',recipeName+(existing?' 수정':' 등록'));render();
  };
 };
 draw();
}

function v57UnseenRecipes(){return (s.recipeNotices||[]).filter(name=>!(s.recipeNoticeSeen||[]).includes(name));}

function v57ReadRecipe(name){if(!(s.recipeNotices||[]).includes(name))return;if(!Array.isArray(s.recipeNoticeSeen))s.recipeNoticeSeen=[];if(!s.recipeNoticeSeen.includes(name))s.recipeNoticeSeen.push(name);const badge=$('v57RecipeUnread');if(badge)badge.hidden=!v57UnseenRecipes().length;}

let recipeCategory='drink',recipeSelected=0,recipeSearch='';

// v146: keep the quick-reference position while open and between sessions.
const mzRecipeWindowPositionKey='mz_recipe_window_position_v176';

function mzRecipeEnableDrag(){
 const panel=document.querySelector('#modalRoot .recipe-float');
 if(!panel)return;
 const header=panel.querySelector('.recipe-header');
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const place=(left,top)=>{
   const rect=panel.getBoundingClientRect();
   panel.style.left=clamp(left,8,Math.max(8,innerWidth-rect.width-8))+'px';
   panel.style.top=clamp(top,8,Math.max(8,innerHeight-rect.height-8))+'px';
   panel.style.right='auto';
 };
 try{
   const saved=JSON.parse(localStorage.getItem(mzRecipeWindowPositionKey)||'null');
   if(saved&&Number.isFinite(saved.left)&&Number.isFinite(saved.top))place(saved.left,saved.top);
 }catch(e){}
 let dragging=null;
 header.addEventListener('pointerdown',e=>{
   if(e.button!==0||e.target.closest('button,input,a'))return;
   const rect=panel.getBoundingClientRect();
   dragging={id:e.pointerId,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top};
   header.setPointerCapture(e.pointerId);
   e.preventDefault();
 });
 header.addEventListener('pointermove',e=>{
   if(!dragging||dragging.id!==e.pointerId)return;
   place(e.clientX-dragging.offsetX,e.clientY-dragging.offsetY);
 });
 function endDrag(e){
   if(!dragging||dragging.id!==e.pointerId)return;
   dragging=null;
   const rect=panel.getBoundingClientRect();
   try{localStorage.setItem(mzRecipeWindowPositionKey,JSON.stringify({left:rect.left,top:rect.top}));}catch(err){}
 }
 header.addEventListener('pointerup',endDrag);
 header.addEventListener('pointercancel',endDrag);
 // Keep a previously saved position on screen after viewport resizing.
 if(!window.mzRecipeDragResizeBound){
   window.mzRecipeDragResizeBound=true;
   window.addEventListener('resize',()=>{
     const pane=document.querySelector('#modalRoot .recipe-float');
     if(!pane||!pane.style.left)return;
     const r=pane.getBoundingClientRect();
     pane.style.left=clamp(r.left,8,Math.max(8,innerWidth-r.width-8))+'px';
     pane.style.top=clamp(r.top,8,Math.max(8,innerHeight-r.height-8))+'px';
   });
 }
}

function openRecipeQuick(){
 if(modal==='recipes'){closePanel();return;}
 modal='recipes';
 $('modalRoot').innerHTML=`<section class="recipe-float" role="region" aria-label="레시피북"><div class="recipe-header"><strong>RECIPE BOOK</strong><button class="btn" id="closeRecipe" aria-label="레시피북 닫기">×</button></div><div class="recipe-toolbar"><button class="btn" id="recipeDrink">음료</button><button class="btn" id="recipeFood">안주</button><input id="recipeSearch" aria-label="레시피 검색" placeholder="검색" autocomplete="off"></div><div class="recipe-layout"><div class="recipe-index" id="recipeIndex"></div><div class="recipe-detail" id="recipeDetail"></div></div></section>`;
 mzRecipeEnableDrag();
 // v176: wheel-scrolling should target the hovered recipe pane, not the page.
 for(const pane of [$('recipeIndex'),$('recipeDetail')]){
   pane.addEventListener('wheel',event=>{
     if(pane.scrollHeight<=pane.clientHeight+1)return;
     const before=pane.scrollTop;
     pane.scrollTop+=event.deltaY;
     if(pane.scrollTop!==before)event.preventDefault();
   },{passive:false});
 }
 $('closeRecipe').onclick=closePanel;
 $('recipeDrink').onclick=()=>{recipeCategory='drink';recipeSelected=0;drawRecipeQuick()};
 $('recipeFood').onclick=()=>{recipeCategory='food';recipeSelected=0;drawRecipeQuick()};
 $('recipeSearch').value=recipeSearch;
 $('recipeSearch').oninput=e=>{recipeSearch=e.target.value;drawRecipeQuick()};
 drawRecipeQuick();
}

function drawRecipeQuick(){
 const food=recipeCategory==='food',arr=[...(food?[...availableFoods(),...(((s.regularUnlocks||[]).includes('mechanic') && s.day >= (s.mechanicRegularFrom||8))?[mechanicRecipe]:[])]:[...drinks.filter(d=>d.name!=='선셋 로드'&&(!d.unlockDay||s.day>=d.unlockDay)),...mzSunsetStoryDrinkCandidates()]),...(s.customRecipes||[]).filter(x=>x.registered&&x.kind===(food?'food':'drink')).map(r=>food?{name:r.name,source:r.source,uid:r.uid,...(foodRecipeSpec(r)||{base:'정보 없음',sauce:'정보 없음',kind:'정보 없음'})}:{name:r.name,source:r.source,uid:r.uid,seq:r.seq,mode:r.mode,mixAt:r.mixAt,extra:r.extra})];
 $('recipeDrink').classList.toggle('active',!food);$('recipeFood').classList.toggle('active',food);
 const filtered=arr.map((v,i)=>({...v,index:i})).filter(x=>x.name.includes(recipeSearch.trim()));
 if(!filtered.some(x=>x.index===recipeSelected))recipeSelected=filtered.length?filtered[0].index:-1;
 $('recipeIndex').innerHTML=filtered.length?filtered.map(v=>`<button class="recipe-link ${v.index===recipeSelected?'active':''}" data-recipe="${v.index}">${esc(v.name)}${v57UnseenRecipes().includes(v.name)?'<span class="v57-recipe-new">NEW</span>':''}</button>`).join(''):'<div class="recipe-hint" style="padding:10px">검색 결과 없음</div>';
 $('recipeIndex').querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{recipeSelected=Number(b.dataset.recipe);v57ReadRecipe(arr[recipeSelected]?.name);drawRecipeQuick()});
 const v=arr[recipeSelected];if(!v){$('recipeDetail').innerHTML='';return;}
 const managementButtons=(v.source!=='market'&&v.uid)?`<div class="actions mz-recipe-actions"><button class="btn" id="mzRecipeEdit" ${mzRecipeEditDay()?'':'disabled'}>메뉴 수정</button><button class="btn" id="mzRecipeDelete" ${mzRecipeEditDay()?'':'disabled'}>메뉴 삭제</button></div><p class="note">${mzRecipeEditDay()?'마감 후 메뉴 관리 가능 · 개발 기회 소모 없음':'메뉴 수정·삭제는 영업 마감 후 가능'}</p>`:'';const bindManage=()=>{const edit=$('mzRecipeEdit'),del=$('mzRecipeDelete');if(edit)edit.onclick=()=>openDevelopment(v.uid);if(del)del.onclick=()=>mzDeleteCustomRecipe(v.uid);};
 if(food){$('recipeDetail').innerHTML=`<h3>${esc(v.name)}${v57UnseenRecipes().includes(v.name)?' <span class="v57-recipe-new">NEW</span>':''}</h3><div class="recipe-food-spec"><div class="spec-row"><span class="spec-label">주재료</span><span class="spec-value">${esc(v.base)}</span></div><div class="spec-row"><span class="spec-label">양념</span><span class="spec-value">${esc(v.sauce)}</span></div><div class="spec-row"><span class="spec-label">조리</span><span class="spec-value">${esc(v.kind)}</span></div>${Array.isArray(v.addons)&&v.addons.length?`<div class="mz184-required-extra" role="note"><span class="mz184-required-label">필수 추가 재료</span><strong>${v.addons.map(id=>esc(marketCatalog.find(x=>x.id===id)?.name||id)).join(' · ')}</strong></div>`:''}</div>${managementButtons}`;bindManage();return;}
 const steps=v.seq.split('');const mode=v.mode==='mix'?'섞기':v.mode==='partial'?'부분 혼합':'층 유지';
 const counts=ingredients.map(a=>({...a,n:steps.filter(c=>c===a[0]).length})).filter(a=>a.n);
 $('recipeDetail').innerHTML=`<h3>${esc(v.name)}</h3><div class="recipe-mode">${mode}</div>${v.extra?`<div class="mz184-required-extra" role="note"><span class="mz184-required-label">필수 토핑</span><strong>${esc(garnishById(v.extra)?.name||v.extra)}</strong></div>`:''}<div class="recipe-amount">${counts.map(a=>`<div><i class="recipe-dot" style="background:${a[2]}"></i>${esc(a[1])} ×${a.n}</div>`).join('')}</div>${v.mode==='layer'||v.mode==='partial'?`<div class="recipe-steps">${steps.map(c=>{const a=ingredients.find(x=>x[0]===c);return `<span class="recipe-chip" style="border-bottom:3px solid ${a[2]}">${a[0]}</span>`}).join('')}</div><div class="recipe-hint">${v.mode==='partial'?steps.slice(0,v.mixAt||4).join(' → ')+' → 섞기 → '+steps.slice(v.mixAt||4).join(' → ')+(v.extra?' → '+(garnishById(v.extra)?.name||v.extra):''):'투입 순서 →'}</div>`:'<div class="recipe-hint">투입 순서 무관</div>'}${managementButtons}`;bindManage();
}
