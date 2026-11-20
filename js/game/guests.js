/* MILE ZERO — Guest archive, clues, regulars, ingredient atlas.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

function materialTags(id){
 if(materialTagCatalog[id])return materialTagCatalog[id];
 const g=garnishCatalog.find(x=>x.id===id);
 if(g)return {id:g.id,name:g.name,kind:'garnish',category:[...g.category],taste:[...g.taste],hiddenTags:[...(g.hiddenTags||[])]};
 const f=v32FoodAtlas.find(x=>x[0]===id);
 if(f)return {id,name:f[0],kind:'food',category:[...f[1]],taste:[...f[2]],hiddenTags:[]};
 return null;
}

function recordGuestClue(who,day,visit){
 if(!Array.isArray(s.guestClues))s.guestClues=[];
 const clue=customerClueCatalog.find(c=>c.who===who&&c.day===day&&c.visit===visit);
 if(clue){const id=`${day}:${visit}:${who}`;if(!s.guestClues.some(c=>c.id===id))s.guestClues.push({...clue,id});}
}

// Multi-person visits are authored with archiveGuests instead of day/name checks.
function rememberAdditionalGuests(visitData,day,visit){
 const guests=Array.isArray(visitData?.archiveGuests)?visitData.archiveGuests:[];
 for(const name of guests)rememberGuestVisit(name,day,visit);
}

function rememberGuestVisit(who,day,visit){
 if(!Array.isArray(s.guestVisits))s.guestVisits=[];
 const id=`${day}:${visit}`;
 if(!s.guestVisits.some(x=>x.who===who&&x.day===day&&x.visit===visit)){const uniqueId=s.guestVisits.some(x=>x.id===id)?`${id}:${who}`:id;s.guestVisits.push({id:uniqueId,who,day,visit});}
 if(!Array.isArray(s.guestClues))s.guestClues=[];
 for(const clue of customerClueCatalog.filter(x=>x.day===day&&x.visit===visit&&x.who===who)){
  const clueId=`${day}:${visit}:${who}`;
  if(!s.guestClues.some(x=>x.id===clueId))s.guestClues.push({...clue,id:clueId});
 }
}

function backfillGuestHistory(){
 // Never infer WHO completed a visit from dayStats.served (a count only).
 // guestClues and garnishDiscoveries can be recorded before the visitor leaves,
 // so they are not completion evidence either. Keep existing exact guestVisits.
 // An older save without named completion history cannot be reconstructed safely.
 if(!Array.isArray(s.guestVisits))s.guestVisits=[];
}

function mzHasFinishedRegularVisit(name,day){
 return (s.guestVisits||[]).some(x=>x.who===name&&x.day===day);
}

function mzRegularPrefsVisible(name){
 const meta=mzRegularPreferences[name]||{like:[],dislike:[],discover:{}};
 const unlocked=t=>Number.isInteger(meta.discover[t])&&mzHasFinishedRegularVisit(name,meta.discover[t]);
 return {like:meta.like.filter(unlocked),dislike:meta.dislike.filter(unlocked)};
}

function mzRegularStoryVisible(name){
 return (mzRegularStoryMilestones[name]||[]).filter(x=>mzHasFinishedRegularVisit(name,x.day)&&(!x.requiresUnlock||(Array.isArray(s.regularUnlocks)&&s.regularUnlocks.includes(x.requiresUnlock)))&&(!x.requiresWeekendStory||(Array.isArray(s.weekendStoriesDone)&&s.weekendStoriesDone.includes(x.requiresWeekendStory))));
}

function mzGuestArchiveEvents(name){
 const p=mzRegularPrefsVisible(name), stories=mzRegularStoryVisible(name);
 return [...stories.map(x=>({id:`story:${name}:${x.day}${x.requiresUnlock?':'+x.requiresUnlock:''}${x.requiresWeekendStory?':weekend:'+x.requiresWeekendStory:''}`,day:x.day,text:x.text})),
 ...p.like.map(x=>({id:`pref:${name}:like:${x}`,day:mzRegularPreferences[name].discover[x],text:x})),
 ...p.dislike.map(x=>({id:`pref:${name}:dislike:${x}`,day:mzRegularPreferences[name].discover[x],text:x}))];
}

function v48ArchiveEvents(name){return mzGuestArchiveEvents(name)}

function v48ArchiveNew(name){return v48ArchiveEvents(name).some(x=>!(s.guestArchiveSeen||[]).includes(x.id))}

function mzRefreshGuestNewBadge(){const badge=$('v48GuestUnread');if(!badge)return;const hasNew=regularCustomerNames.some(name=>v48ArchiveNew(name));badge.hidden=!hasNew;}

function guestArchiveMarkup(){
 const history=Array.isArray(s.guestVisits)?s.guestVisits:[];
 const active=s.phase==='open'&&s.sub!=='interlude'&&s.visit<todayVisits().length?{who:current().who,day:s.day,visit:s.visit,id:`${s.day}:${s.visit}`,active:true}:null;
 const all=history.concat(active&&!history.some(x=>x.id===active.id)?[active]:[]);
 const regular=regularCustomerNames.filter(name=>all.some(x=>x.who===name));
 const visitors=all.filter(x=>!regularCustomerNames.includes(x.who));
 const tiles=regular.map(name=>{const entries=all.filter(x=>x.who===name);const hasFace=['마렌','야간 정비사','인근 직장인','리안','정기 화물 기사','황무지 출신 정착민','카이렌','미카','토르반'].includes(name);const faceSrc=name==='마렌'?MAREN_FACE_WEBP:name==='야간 정비사'?MECHANIC_FACE_WEBP:name==='인근 직장인'?OFFICEWORKER_FACE_WEBP:name==='리안'?RIAN_FACE_WEBP:name==='정기 화물 기사'?FREIGHT_FACE_WEBP:name==='황무지 출신 정착민'?SETTLER_FACE_WEBP:name==='카이렌'?KAIREN_FACE_WEBP:name==='미카'?MIKA_FACE_WEBP:TORBAN_FACE_WEBP;return `<button type="button" class="v48-guest-tile" data-v48-guest="${esc(name)}" aria-expanded="false"><span class="v48-guest-symbol" aria-hidden="true">${hasFace?`<img class="mz-custom-character-image mz-guest-face" src="${faceSrc}" alt=""><span class="mz-guest-fallback">${['◇','✦','◈','⌁','▣','◆','⬡'][regularCustomerNames.indexOf(name)%7]}</span>`:['◇','✦','◈','⌁','▣','◆','⬡'][regularCustomerNames.indexOf(name)%7]}</span><strong>${esc(name)}</strong><small>첫 방문 ${dayLabel(entries[0].day)} · ${entries.filter(x=>!x.active).length}회</small>${v48ArchiveNew(name)?'<span class="v48-new">NEW</span>':''}</button>`}).join('');
 const visitorCards=visitors.map(x=>{const v=(dailyVisits[x.day]||[])[x.visit];return `<div class="v39-guest-card"><h3>${esc(x.who)}</h3><div class="v39-small">${dayLabel(x.day)} · ${x.active?'방문 중':esc(v?.orders.map(o=>o.name).join(', ')||'방문 기록')}</div></div>`}).join('');
 return `<h2>단골 손님</h2><div class="v39-archive-tabs"><button type="button" class="btn active" id="v39RegularTab" aria-pressed="true">단골</button><button type="button" class="btn" id="v39VisitorTab" aria-pressed="false">방문객</button></div><section id="v39RegularPanel"><div class="v48-guest-grid">${tiles||'<p class="note">아직 만난 단골이 없습니다.</p>'}</div></section><section id="v39VisitorPanel" hidden>${visitorCards||'<p class="note">아직 만난 방문객이 없습니다.</p>'}</section>`;
}

function v48GuestDetail(name){
 const records=(s.guestVisits||[]).filter(x=>x.who===name).sort((a,b)=>a.day-b.day||a.visit-b.visit);
 const active=s.phase==='open'&&s.sub!=='interlude'&&current()?.who===name?{day:s.day,visit:s.visit,active:true}:null;
 if(active)records.push(active);
 const p=mzRegularPrefsVisible(name);
 const stories=mzRegularStoryVisible(name);
 const preferenceTags=values=>values.length?v32Tags([],values):'<p class="v39-empty">아직 확인한 취향이 없습니다.</p>';
 const orders=records.filter(x=>!x.active).map(x=>{const v=(dailyVisits[x.day]||[])[x.visit];return v?`${dayLabel(x.day)} · ${v.orders.map(o=>o.name).join(', ')}`:null}).filter(Boolean);
  return `<div class="v48-guest-detail">${['마렌','야간 정비사','인근 직장인','리안','정기 화물 기사','황무지 출신 정착민','카이렌','미카','토르반'].includes(name)?`<img class="mz-custom-character-image mz-guest-detail-face" src="${name==='마렌'?MAREN_FACE_WEBP:name==='야간 정비사'?MECHANIC_FACE_WEBP:name==='인근 직장인'?OFFICEWORKER_FACE_WEBP:name==='리안'?RIAN_FACE_WEBP:name==='정기 화물 기사'?FREIGHT_FACE_WEBP:name==='황무지 출신 정착민'?SETTLER_FACE_WEBP:name==='카이렌'?KAIREN_FACE_WEBP:name==='미카'?MIKA_FACE_WEBP:TORBAN_FACE_WEBP}" alt="${esc(name)} 얼굴">`:``}<h3>${esc(name)}</h3><p class="v39-small">첫 방문 ${records.length?dayLabel(records[0].day):''} · 완료된 방문 ${orders.length}회</p><h4>취향</h4><div class="mz-regular-preferences"><div class="mz-pref-group"><strong>선호</strong>${preferenceTags(p.like)}</div><div class="mz-pref-group"><strong>비선호</strong>${preferenceTags(p.dislike)}</div></div><h4>기억에 남는 이야기</h4>${stories.length?stories.map(e=>`<div class="v39-memory"><p>${esc(e.text)}</p><small>${dayLabel(e.day)}</small></div>`).join(''):'<p class="v39-empty">아직 기록된 이야기가 없습니다.</p>'}<details><summary>지금까지의 주문 (${orders.length})</summary>${orders.map(x=>`<p class="v39-small">${esc(x)}</p>`).join('')}</details></div>`;
}

function bindGuestArchive(){
 const a=$('v39RegularTab'),b=$('v39VisitorTab'),pa=$('v39RegularPanel'),pb=$('v39VisitorPanel');if(!a||!b||!pa||!pb)return;
 const select=regular=>{pa.hidden=!regular;pb.hidden=regular;a.classList.toggle('active',regular);b.classList.toggle('active',!regular);a.setAttribute('aria-pressed',String(regular));b.setAttribute('aria-pressed',String(!regular));};
 a.onclick=()=>select(true);b.onclick=()=>select(false);
 const grid=pa.querySelector('.v48-guest-grid');
 const oldDetail=$('v48GuestDetail');if(oldDetail)oldDetail.remove();
 grid.querySelectorAll('[data-v48-guest]').forEach(btn=>btn.addEventListener('click',()=>{
  const name=btn.dataset.v48Guest,was=btn.getAttribute('aria-expanded')==='true';
  grid.querySelectorAll('[data-v48-guest]').forEach(el=>el.setAttribute('aria-expanded','false'));
  grid.querySelector('.v56-inline-detail')?.remove();
  if(was)return;
  btn.setAttribute('aria-expanded','true');
  const panel=document.createElement('div');panel.className='v56-inline-detail';panel.setAttribute('role','region');panel.setAttribute('aria-label',name+' 상세 기록');
  panel.innerHTML=v48GuestDetail(name);
  // Insert after the last tile on the same visual row to keep the expanded record next to its owner.
  const y=btn.offsetTop;let last=btn;
  for(let next=btn.nextElementSibling;next&&next.matches('[data-v48-guest]')&&Math.abs(next.offsetTop-y)<3;next=next.nextElementSibling)last=next;
  last.insertAdjacentElement('afterend',panel);
  s.guestArchiveSeen=Array.isArray(s.guestArchiveSeen)?s.guestArchiveSeen:[];
  for(const ev of v48ArchiveEvents(name))if(!s.guestArchiveSeen.includes(ev.id))s.guestArchiveSeen.push(ev.id);
  btn.querySelector('.v48-new')?.remove();
  // Refresh the guest sidebar badge immediately, independently of mail rendering.
  mzRefreshGuestNewBadge();
  // Ensure the record is visible without jumping the parent feed to its end.
 }));
}

function v32Tags(category,taste){return `<div class="v32-tag-row">${category.map(v=>`<span class="v32-tag v32-category">${esc(v)}</span>`).join('')}${taste.map(v=>`<span class="v32-tag v32-taste">${esc(v)}</span>`).join('')}</div>`}

// ===== INGREDIENT ATLAS =====
function ingredientAtlas(){
 const base=ingredientEntries.map(x=>`<article class="ingredient-card"><div class="ingredient-swatch" style="background:${x.color}"></div><div><strong>${esc(x.title)}</strong>${v32Tags(materialTags(x.id).category,materialTags(x.id).taste)}<p>${esc(x.desc)}</p></div></article>`).join('');
 const food=v32FoodAtlas.filter(([name])=>name!=='생선'||s.day>=21).map(([name])=>`<article class="v41-food-card"><strong>${esc(name)}</strong>${v32Tags(materialTags(name).category,materialTags(name).taste)}<p>${esc(v41FoodDescriptions[name]||'')}</p></article>`).join('');
 const extra=unlockedGarnishes().length?`<h3 class="atlas-section">가니쉬</h3>${unlockedGarnishes().map(g=>`<article class="ingredient-card"><div class="ingredient-swatch" style="background:#c57545"></div><div><strong>${esc(g.name)}</strong>${v32Tags([],materialTags(g.id).taste)}<p>${esc(g.description)}</p></div></article>`).join('')}`:'';
 // Keep the atlas in sync with MILE MARKET: only purchased food add-ons are revealed.
 const ownedFoodExtras=marketCatalog.filter(m=>['smoke','crisp','spiceoil','curry','rice','vinegar','cheese','kimchi'].includes(m.id)&&hasMarketItem(m.id));
 const foodExtras=ownedFoodExtras.length?`<h3 class="atlas-section">추가 재료 · 추가 소스 · 토핑</h3><div class="v41-food-list">${ownedFoodExtras.map(m=>`<article class="v41-food-card"><strong>${esc(m.name)}</strong>${v32Tags([],m.tags)}<p>${esc(m.description)}</p></article>`).join('')}</div>`:'';
 return `<h2>식재료 도감</h2><div class="v119-atlas-search"><input id="v119IngredientSearch" type="search" placeholder="재료명, 맛, 특징 검색" aria-label="식재료 키워드 검색" autocomplete="off"></div><div id="v119AtlasResult" class="v119-atlas-empty" hidden>검색 결과가 없습니다.</div><div class="v41-atlas-tabs" role="tablist" aria-label="식재료 분류"><button class="btn active" id="v41DrinkTab" type="button" role="tab" aria-selected="true" aria-controls="v41DrinkAtlas">음료</button><button class="btn" id="v41FoodTab" type="button" role="tab" aria-selected="false" aria-controls="v41FoodAtlas">안주</button></div><section id="v41DrinkAtlas" role="tabpanel" aria-labelledby="v41DrinkTab"><h3 class="atlas-section">기본 음료 베이스</h3>${base}<p class="atlas-rule">기본 재료 각 5단위까지 · 한 잔 합계 10단위까지</p>${extra}</section><section id="v41FoodAtlas" role="tabpanel" aria-labelledby="v41FoodTab" hidden><h3 class="atlas-section">주재료 · 양념 · 소스</h3><div class="v41-food-list">${food}</div>${foodExtras}</section>`;
}

function bindIngredientAtlas(){
 const drink=$('v41DrinkTab'),food=$('v41FoodTab'),dPanel=$('v41DrinkAtlas'),fPanel=$('v41FoodAtlas');
 if(!drink||!food||!dPanel||!fPanel)return;
 const search=$('v119IngredientSearch'),empty=$('v119AtlasResult');
 const filter=()=>{
  const panel=dPanel.hidden?fPanel:dPanel;
  const query=(search?.value||'').trim().toLocaleLowerCase();
  let visible=0;
  panel.querySelectorAll('.ingredient-card,.v41-food-card').forEach(card=>{
   const match=!query||card.textContent.toLocaleLowerCase().includes(query);
   card.classList.toggle('v119-atlas-card-hidden',!match);
   if(match)visible++;
  });
  if(empty)empty.hidden=visible!==0;
 };
 if(search)search.addEventListener('input',filter);
 const select=isDrink=>{
  dPanel.hidden=!isDrink;fPanel.hidden=isDrink;
  drink.classList.toggle('active',isDrink);food.classList.toggle('active',!isDrink);
  drink.setAttribute('aria-selected',String(isDrink));food.setAttribute('aria-selected',String(!isDrink));filter();
 };
 drink.onclick=()=>select(true);food.onclick=()=>select(false);
 for(const [button,next] of [[drink,food],[food,drink]])button.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();next.click();next.focus();}
 });
 select(true);
}
