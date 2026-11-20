/* MILE ZERO — Closing-time market, desk decorations, friend code.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

const marketCatalog=[
 {id:'coffeejelly',name:'커피 젤리',price:600,unlockDay:16,category:'음료 가니쉬',tags:['쌉싸름함', '쫀득함'],description:garnishCatalog.find(g=>g.id==='coffeejelly').description},
 {id:'whippedcream',name:'휘핑 크림',price:550,unlockDay:19,category:'음료 가니쉬',tags:['달콤함', '고소함'],description:garnishCatalog.find(g=>g.id==='whippedcream').description},
 {id:'berrymix',name:'베리 믹스',price:650,unlockDay:24,category:'음료 가니쉬',tags:['상큼함', '신맛'],description:garnishCatalog.find(g=>g.id==='berrymix').description},
 {id:'fire',name:'불',price:750,unlockDay:26,category:'음료 가니쉬',tags:['연출적'],description:garnishCatalog.find(g=>g.id==='fire').description},
 {id:'rice',name:'밥',price:90,unlockDay:21,category:'안주 추가 재료',tags:['고소함', '담백함'],description:'쌀을 지어 만든 고슬고슬한 흰 밥.'},
 {id:'vinegar',name:'식초',price:150,unlockDay:36,category:'안주 추가 재료',tags:['신맛','상큼함'],description:'새콤한 맛을 내는 조미료. 밥에 곁들이면 초밥을 만들 수 있다.'},
 {id:'cheese',name:'치즈',price:220,unlockDay:40,category:'안주 추가 재료',tags:['고소함'],description:'누가 내 치즈를 옮겼을까?'},
 {id:'kimchi',name:'김치',price:500,unlockDay:40,category:'안주 추가 재료',tags:['매콤함','신맛'],description:'두유노킴취? 아이테르에는 김치가 있다. 김치가 없는 아이테르는 존재할 수 없다.'},
 {id:'chocoball',name:'초코칩',price:500,unlockDay:10,category:'음료 가니쉬',tags:['달콤함', '쌉싸름함'],description:garnishCatalog.find(g=>g.id==='chocoball').description},
 {id:'tapioca',name:'타피오카 펄',price:550,unlockDay:10,category:'음료 가니쉬',tags:['고소함', '쫀득함'],description:garnishCatalog.find(g=>g.id==='tapioca').description},
 {id:'mint',name:'민트 리프',price:45,category:'음료 가니쉬',tags:['청량함', '허브 향'],description:garnishCatalog.find(g=>g.id==='mint').description},
 {id:'smoke',name:'스모크 에센스',price:75,category:'안주 추가 재료',tags:['훈연 향', '쌉싸름함'],description:'구이와 볶음에 은은한 훈연 향을 더하는 향료. 안전도시에서 간간히 쓰는 수법이다.'},
 {id:'crisp',name:'크리스피 플레이크',price:60,category:'안주 추가 재료',tags:['바삭함', '고소함'],description:'안주에 바삭한 식감을 더하는 플레이크. 양파와 마늘, 밀가루 반죽을 얇게 썰어 튀겼다.'},
 {id:'curry',name:'카레 가루',price:115,unlockDay:14,category:'안주 추가 재료',tags:['매콤함', '감칠맛'],description:'여러 향신료를 혼합한 가루. 국물 요리에 넣으면 진한 카레 향과 매콤한 풍미가 더해진다.'},
 {id:'spiceoil',name:'스파이스 오일',price:100,category:'안주 추가 소스',tags:['매콤함'],description:'매운 풍미가 도는 기름. 고추와 식용유를 함께 넣고 볶아내면 만들 수 있다.'},
 {id:'sugar',name:'슈가 크리스털',price:400,unlockDay:9,category:'음료 가니쉬',tags:['달콤함', '바삭함'],description:garnishCatalog.find(g=>g.id==='sugar').description},
 {id:'cherry',name:'캔디드 체리',price:110,category:'음료 가니쉬',tags:['과실 향', '달콤함'],description:garnishCatalog.find(g=>g.id==='cherry').description}
];

// v306: shop arrival notifications track each stock item, not whether it was bought.
// A single entry to the market acknowledges ALL goods currently on sale.
function mzMarketAvailableStockIds(day=s.day){
 if(day<7)return [];
 return [
  ...marketCatalog.filter(item=>!item.unlockDay||day>=item.unlockDay).map(item=>'market:'+item.id),
  ...MZ_DESK_CATALOG.filter(item=>item.source!=='gift'&&day>=item.unlockDay).map(item=>'desk:'+item.id)
 ];
}

function mzMarketUnseenStockIds(){
 const seen=new Set(Array.isArray(s.marketSeenStockIds)?s.marketSeenStockIds:[]);
 return mzMarketAvailableStockIds().filter(id=>!seen.has(id));
}

function mzMarketNewBadgeMarkup(){
 return mzMarketUnseenStockIds().length?'<span class="unread-badge mz306-market-new" aria-label="신규 입고">NEW</span>':'';
}

function mzMarketAcknowledgeStock(){
 const seen=Array.isArray(s.marketSeenStockIds)?s.marketSeenStockIds:[];
 s.marketSeenStockIds=[...new Set([...seen,...mzMarketAvailableStockIds()])];
 const button=document.querySelector('#v54ClosingMarket .v54-closing-market-button');
 button?.querySelector('.mz306-market-new')?.remove();
}

const hasMarketItem=id=>(s.ownedMarket||[]).includes(id);

const marketBalance=()=>Math.max(0,Number(s.wallet)||0);

const foodMarketItems=()=>marketCatalog.filter(m=>['smoke','crisp','spiceoil','curry','rice','vinegar','cheese','kimchi'].includes(m.id)&&hasMarketItem(m.id));

let mzDeskSelection=null;

function mzDeskState(){
 if(!Array.isArray(s.deskOwned))s.deskOwned=[];
 if(!Array.isArray(s.deskPlaced))s.deskPlaced=[];
 // Silent, idempotent retroactive awards. No toast, NEW badge or journal edits.
 const award=(id,done)=>{if(done&&!s.deskOwned.includes(id))s.deskOwned.push(id)};
 award('mile_logo_sticker',s.day>5||(s.day===5&&s.phase==='closing'));
 award('mile_branch_certificate',s.day>15||(s.day===15&&s.phase==='closing'));
 award('maren_market_photo',Array.isArray(s.weekendStoriesDone)&&s.weekendStoriesDone.includes('maren_market'));
 award('torban_wasteland_bouquet',(s.guestVisits||[]).some(x=>x.who==='토르반'&&x.day===29));
 award('freight_animal_photo',Array.isArray(s.weekendStoriesDone)&&s.weekendStoriesDone.includes('freight_care_35'));

 return s.deskPlaced;
}

function mzDeskItem(id){return MZ_DESK_CATALOG.find(item=>item.id===id)}

function mzDeskMarketStock(day=s.day){return MZ_DESK_CATALOG.filter(item=>item.source!=='gift'&&day>=item.unlockDay)}

function mzDeskBuy(id){
 const item=mzDeskItem(id);mzDeskState();if(s.phase!=='closing'||s.day<7||!item||item.source==='gift'||s.day<item.unlockDay||s.deskOwned.includes(id)||s.wallet<item.price)return false;
 s.wallet-=item.price;s.deskOwned.push(id);return true;
}

function mzDeskPlace(id,x,y){
 const item=mzDeskItem(id);mzDeskState();if(!item||!s.deskOwned.includes(id))return false;
 x=Math.max(.055,Math.min(.945,Number(x)||0.5));y=Math.max(.08,Math.min(.92,Number(y)||0.5));
 // wall is upper area, shelf in the middle, desk surface at the bottom.
 if(item.zone==='wall'&&y>.49)return false;
 if(item.zone==='surface'&&y<.46)return false;
 const old=s.deskPlaced.find(p=>p.id===id);
 if(old){old.x=x;old.y=y;old.z=Date.now();}else s.deskPlaced.push({id,x,y,z:Date.now()});
 return true;
}

function mzDeskClearPlace(id){mzDeskState();s.deskPlaced=s.deskPlaced.filter(p=>p.id!==id)}

function mzDeskBoard(){
 mzDeskState();const itemMap=new Map(MZ_DESK_CATALOG.map(i=>[i.id,i]));
 const placed=s.deskPlaced.filter(p=>itemMap.has(p.id)&&s.deskOwned.includes(p.id)).sort((a,b)=>(a.z||0)-(b.z||0));
 return `<div class="mz167-board mz186-board" id="mz167Board" aria-label="자유배치 책상"><div class="mz167-wallhint">WALL</div><div class="mz167-shelf"></div><div class="mz167-desk"></div><div class="mz167-deskhint">DESK</div>${placed.map(p=>{const item=itemMap.get(p.id);return `<button type="button" class="mz167-placed" data-desk-id="${item.id}" style="left:${(p.x*100).toFixed(2)}%;top:${(p.y*100).toFixed(2)}%" title="${item.name} · ${item.id==='box'?'클릭하여 음악 전환 · 드래그하여 이동':'드래그하여 이동'}"><span>${item.icon}</span><small>${item.name}</small></button>`}).join('')}</div>`;
}

function mzDeskPanel(){
 mzDeskState();const itemMap=new Map(MZ_DESK_CATALOG.map(i=>[i.id,i]));
 const placed=s.deskPlaced.filter(p=>itemMap.has(p.id)&&s.deskOwned.includes(p.id)).sort((a,b)=>(a.z||0)-(b.z||0));
 return `<div class="mz186-inventory"><section class="mz167-controls"><div class="mz167-summary"><b>MY DESK</b><span>보유 소품 ${s.deskOwned.length}/${MZ_DESK_CATALOG.length}</span></div><p class="mz167-note"><span style="display:block">소품 선택 후 클릭하여 배치 · 드래그하여 이동</span><span style="display:block">벽 장식은 벽에, 탁상 소품은 선반·책상에 배치 가능</span></p><div class="mz167-stock">${MZ_DESK_CATALOG.filter(item=>s.deskOwned.includes(item.id)).map(item=>{const owned=s.deskOwned.includes(item.id),selected=mzDeskSelection===item.id,placedAlready=!!s.deskPlaced.find(p=>p.id===item.id);return `<div class="mz167-stockitem"><span class="mz167-icon">${item.icon}</span><span class="mz167-itemname">${item.name}${placedAlready?'<em class="mz310-placed-badge">배치됨</em>':''}<small>${item.zone==='wall'?'벽':'책상·선반'}</small><small class="mz169-description">${esc(item.description||'')}</small></span>${owned?`<button type="button" class="boot-btn ${selected?'highlight':''}" data-desk-select="${item.id}">${selected?'선택됨':placedAlready?'이동':'배치'}</button>${placedAlready?`<button type="button" class="boot-btn" data-desk-remove="${item.id}">회수</button>`:''}`:''}</div>`}).join('')}</div>${s.deskOwned.length?'':'<p class="mz167-note">보유한 소품이 없습니다. 마감 후 관문시장에서 구입해 보세요.</p>'}</section></div>`;
}

function mzBindDesk(root){
 const board=root.querySelector('#mz167Board');if(!board)return;
 const redraw=()=>{const inventory=root.querySelector('.mz187-desk-inventory');const scroll=inventory?.scrollTop??0;bootView();const next=document.querySelector('#bootOverlay .mz187-desk-inventory');if(next)next.scrollTop=scroll;};
 root.querySelectorAll('[data-desk-select]').forEach(b=>b.onclick=()=>{mzDeskSelection=b.dataset.deskSelect;redraw()});
 root.querySelectorAll('[data-desk-remove]').forEach(b=>b.onclick=()=>{mzDeskClearPlace(b.dataset.deskRemove);redraw()});
 function coords(e){const r=board.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
 let dragging=null,moved=false;
 board.querySelectorAll('[data-desk-id]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{dragging={id:b.dataset.deskId,pointer:e.pointerId};moved=false;b.setPointerCapture(e.pointerId);e.preventDefault()});
  b.addEventListener('pointermove',e=>{if(!dragging||dragging.pointer!==e.pointerId)return;const [x,y]=coords(e);b.style.left=`${Math.max(5,Math.min(95,x*100))}%`;b.style.top=`${Math.max(8,Math.min(92,y*100))}%`;moved=true;});
  b.addEventListener('pointerup',e=>{if(!dragging||dragging.pointer!==e.pointerId)return;const [x,y]=coords(e);if(moved)mzDeskPlace(dragging.id,x,y);else if(dragging.id==='box')window.mzMusicBox?.toggle?.();else mzDeskSelection=dragging.id;dragging=null;redraw()});
  b.addEventListener('pointercancel',()=>{dragging=null;redraw()});
 });
 board.addEventListener('click',e=>{if(e.target.closest('[data-desk-id]')||!mzDeskSelection)return;const [x,y]=coords(e);if(mzDeskPlace(mzDeskSelection,x,y))redraw();});
}

let v48MarketCategory='all';

// ===== MARKET / CLOSING-ONLY SHOP =====
function mzDeskMarketMarkup(){
 const stock=mzDeskMarketStock().slice().sort((a,b)=>Number((s.deskOwned||[]).includes(a.id))-Number((s.deskOwned||[]).includes(b.id)));
 return `<div class="mz168-inventory-note">현재 판매 소품 ${stock.length}종 · 구매한 상품은 계속 보유합니다.</div>${stock.map(item=>{const owned=(s.deskOwned||[]).includes(item.id);return `<article class="v48-market-card ${owned?'is-owned v54-sold':''}"><div class="v48-market-top"><span class="v48-market-icon" aria-hidden="true">${item.icon}</span><div><strong>${esc(item.name)}</strong><small class="note">${item.zone==='wall'?'벽 장식':'책상·선반'}</small></div></div><p>${esc(item.description||'MY DESK에 자유롭게 배치할 수 있는 소품입니다.')}</p><button type="button" class="btn ${owned?'active':''}" data-market-desk-buy="${item.id}" ${owned||marketBalance()<item.price?'disabled':''}>${owned?'구매 완료':item.price+' CR · 구매'}</button></article>`}).join('')}`;
}

function buyMarketDeskItem(id){
 if(!mzDeskBuy(id))return;
 note('시스템',mzDeskItem(id).name+' 구매');
 const drawer=$('modalRoot')?.querySelector('.drawer');const keep=drawer?.scrollTop||0;
 if(drawer){const head=drawer.querySelector('header');drawer.innerHTML='';drawer.append(head);drawer.insertAdjacentHTML('beforeend',marketMarkup());v48BindMarket();drawer.scrollTop=keep;}
 render();
}

/* v256: one-time code redemption, persisted in every ordinary save slot. */
const MZ256_FRIEND_CODE='MILEZERO-FRIEND';

function mz256FriendOwned(){return Number.isInteger(s.friendCounterUnlockDay)&&s.friendCounterUnlockDay>=1;}

function mz256FriendRedeemMarkup(){
 const owned=mz256FriendOwned();
 const message=owned?(s.day>=s.friendCounterUnlockDay?'획득 완료 · 현재 바 카운터에 적용 중입니다.':`${dayLabel(s.friendCounterUnlockDay)}부터 바 카운터에 적용됩니다.`):'사전 플레이 보상 교환코드를 입력할 수 있습니다.';
 return `<section class="mz256-friend-redeem"><h3>교환코드</h3><p>${esc(message)}</p>${owned?'':`<form id="mz256FriendRedeemForm"><input id="mz256FriendRedeemInput" type="text" maxlength="80" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="교환코드" placeholder="교환코드 입력" required><button class="btn primary" type="submit">교환</button></form>`}<p id="mz256FriendStatus" class="mz256-redeem-status" role="status" aria-live="polite"></p></section>`;
}

function mz256BindFriendRedeem(){
 const form=$('mz256FriendRedeemForm');if(!form)return;
 form.addEventListener('submit',e=>{
   e.preventDefault();const input=$('mz256FriendRedeemInput');
   const code=(input?.value||'').trim().toUpperCase();
   const status=$('mz256FriendStatus');
   if(mz256FriendOwned()){if(status)status.textContent='이미 획득한 보상입니다.';return;}
   if(code!==MZ256_FRIEND_CODE){if(status)status.textContent='올바르지 않은 교환코드입니다.';return;}
   s.friendCounterUnlockDay=s.day+1;
   note('시스템','사전 플레이 보상 「친구」 획득 · '+dayLabel(s.friendCounterUnlockDay)+'부터 카운터 적용');
   const drawer=$('modalRoot')?.querySelector('.drawer');
   const keep=drawer?.scrollTop||0;
   if(drawer){const head=drawer.querySelector('header');drawer.innerHTML='';drawer.append(head);drawer.insertAdjacentHTML('beforeend',marketMarkup());v48BindMarket();drawer.scrollTop=keep;}
   render();
 });
}

function marketMarkup(){
 if(s.day<7)return '<h2>MILE MARKET</h2><p>7일 차부터 이용할 수 있습니다.</p>';
 const category=m=>m.category.includes('음료')?'drink':'food';
 const visible=marketCatalog.filter(m=>(!m.unlockDay||s.day>=m.unlockDay)&&(v48MarketCategory==='all'||category(m)===v48MarketCategory)).sort((a,b)=>Number(hasMarketItem(a.id))-Number(hasMarketItem(b.id)));
 const ico={fire:'♨',fish:'◇',rice:'▦',coffeejelly:'▦',whippedcream:'❀',berrymix:'✿',chocoball:'●',tapioca:'◌',mint:'♧',cherry:'◉',smoke:'♨',crisp:'✦',spiceoil:'◇',sugar:'✧'};
 return `<div class="v55-market-banner"><div class="v55-market-banner-copy"><div style="display:flex;align-items:center;gap:16px"><span class="v55-market-sign" aria-hidden="true">▤</span><span><small>관문 시장 / 재료와 인테리어</small><strong>관문 야시장<span class="v55-market-kicker">관문 너머의 물건과 저녁빛이 모이는 곳</span></strong></span></div></div><div class="v55-market-hero" aria-hidden="true"></div></div><div class="v48-market-title"><h2>MILE MARKET</h2><div class="v48-market-wallet">잔액 <strong>${marketBalance().toLocaleString()} CR</strong></div></div><p class="note">관문 시장 · 재료와 소품은 한번 구매하면 영구 보유합니다.</p>${mz256FriendRedeemMarkup()}<nav class="v48-market-tabs" aria-label="상품 분류">${[['all','전체'],['drink','음료 가니쉬'],['food','안주 재료'],['interior','인테리어']].map(([id,label])=>`<button type="button" class="btn" data-v48-market-tab="${id}" aria-pressed="${v48MarketCategory===id}">${label}</button>`).join('')}</nav><div class="v48-market-grid">${v48MarketCategory==='interior'?mzDeskMarketMarkup():visible.map(m=>{const owned=hasMarketItem(m.id);return `<article class="v48-market-card ${owned?'is-owned v54-sold':''}" ${owned?'aria-label="구매 완료"':''}>${owned?'<span class="v54-sold-label">SOLD OUT</span>':''}<div class="v48-market-top"><span class="v48-market-icon" aria-hidden="true">${ico[m.id]||'◇'}</span><div><strong>${esc(m.name)}</strong><small class="note">${esc(m.category)}</small></div></div><div class="market-tag-list">${m.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p>${esc(m.description)}</p><button class="btn ${owned?'active':''}" data-market-buy="${m.id}" ${owned||marketBalance()<m.price?'disabled':''}>${owned?'구매 완료':m.price+' CR · 구매'}</button></article>`}).join('')}${v48MarketCategory==='all'?`<section class="mz293-market-interior-group"><h3>인테리어</h3><p class="note">MY DESK에 배치할 수 있는 소품</p><div class="v48-market-grid">${mzDeskMarketMarkup()}</div></section>`:''}</div>`;
}

function v48BindMarket(){mz256BindFriendRedeem();const root=$('modalRoot');root?.querySelectorAll('[data-market-desk-buy]').forEach(b=>b.onclick=()=>buyMarketDeskItem(b.dataset.marketDeskBuy));root?.querySelectorAll('[data-market-buy]').forEach(b=>b.onclick=()=>buyMarketItem(b.dataset.marketBuy));root?.querySelectorAll('[data-v48-market-tab]').forEach(b=>b.onclick=()=>{v48MarketCategory=b.dataset.v48MarketTab;const drawer=root.querySelector('.drawer');const pos=drawer?.scrollTop||0;const content=drawer?.querySelector('.v48-market-title')?.parentElement;if(!content)return;const html=marketMarkup();const header=drawer.querySelector('header');drawer.innerHTML='';drawer.append(header);drawer.insertAdjacentHTML('beforeend',html);v48BindMarket();drawer.scrollTop=pos;});}

// Show recipe unlocks only for an actual market purchase, never during save migration.
function mzShowMarketRecipeUnlock(names){
 const newly=[...new Set(names)].filter(Boolean);
 if(!newly.length)return;
 document.getElementById('mz183UnlockOverlay')?.remove();
 const overlay=document.createElement('div');
 overlay.id='mz183UnlockOverlay';overlay.className='mz183-unlock-overlay';
 overlay.setAttribute('role','presentation');
 const popup=document.createElement('div');popup.className='mz183-unlock-popup';
 popup.setAttribute('role','alertdialog');popup.setAttribute('aria-modal','true');
 popup.setAttribute('aria-labelledby','mz183UnlockTitle');
 const subtitle=document.createElement('div');subtitle.className='mz183-unlock-kicker';subtitle.textContent='RECIPE UNLOCKED';
 const title=document.createElement('h2');title.id='mz183UnlockTitle';title.textContent=newly.length===1?'새로운 레시피가 해금되었습니다!':'새로운 레시피가 해금되었습니다!';
 const list=document.createElement('ul');list.className='mz183-unlock-list';
 for(const name of newly){const item=document.createElement('li');item.textContent=name;list.appendChild(item);}
 const message=document.createElement('p');message.textContent='레시피북에서 확인할 수 있습니다.';
 const ok=document.createElement('button');ok.type='button';ok.className='btn primary';ok.textContent='확인';
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 ok.addEventListener('click',close);document.addEventListener('keydown',onKey);
 popup.append(subtitle,title,list,message,ok);overlay.appendChild(popup);
 document.body.appendChild(overlay);ok.focus();
}

function buyMarketItem(id){
 if(s.day<7||!marketCatalog.some(m=>m.id===id&&(!m.unlockDay||s.day>=m.unlockDay))||hasMarketItem(id))return;
 const item=marketCatalog.find(m=>m.id===id);if(marketBalance()<item.price)return;
 const previouslyUnlocked=new Set((s.customRecipes||[]).filter(r=>r.source==='market'&&r.registered).map(r=>r.name));
 s.wallet-=item.price;s.ownedMarket.push(id);syncMarketRecipeRewards();
 const freshlyUnlocked=(s.customRecipes||[]).filter(r=>r.source==='market'&&r.registered&&!previouslyUnlocked.has(r.name)).map(r=>r.name);
 if(!Array.isArray(s.recipeNoticeSeen))s.recipeNoticeSeen=[];
 for(const name of freshlyUnlocked)if(!s.recipeNoticeSeen.includes(name))s.recipeNoticeSeen.push(name);
 if(['mint','cherry','sugar','chocoball','tapioca','coffeejelly','whippedcream','berrymix','fire'].includes(id)&&!s.unlockedExtras.includes(id))s.unlockedExtras.push(id);
 note('시스템',item.name+' 구매');const drawer=$('modalRoot')?.querySelector('.drawer');const keep=drawer?.scrollTop||0;const top=drawer?.querySelector('.v48-market-title');if(drawer&&top){const head=drawer.querySelector('header');drawer.innerHTML='';drawer.append(head);drawer.insertAdjacentHTML('beforeend',marketMarkup());v48BindMarket();drawer.scrollTop=keep;}else openPanel('market');render();mzShowMarketRecipeUnlock(freshlyUnlocked);
}

// Navigation keeps the existing market and closing-screen DOM/events intact.
let u321MarketBusy=false;

function u321MarketNavigate(enter){
  if(u321MarketBusy)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    if(enter)openPanel('market',true);else closePanel(true);
    return;
  }
  u321MarketBusy=true;
  let wrap=document.getElementById('u321MzNav');
  if(!wrap){wrap=document.createElement('div');wrap.id='u321MzNav';wrap.className='u321-mz';wrap.setAttribute('aria-hidden','true');wrap.innerHTML='<div class="u321-mz-curtain"><span class="u321-mz-name"></span></div>';document.body.appendChild(wrap)}
  wrap.querySelector('.u321-mz-name').textContent=enter?'관문 시장':'MILE ZERO';
  wrap.className='u321-mz u321-mz-active';
  void wrap.offsetWidth;
  wrap.classList.add('u321-mz-cover');
  setTimeout(()=>{
    if(enter){openPanel('market',true);const market=document.getElementById('overlay');if(market)market.classList.add('u321-mz-reveal')}
    else closePanel(true);
    setTimeout(()=>{
      wrap.classList.remove('u321-mz-cover');wrap.classList.add('u321-mz-lift');
      setTimeout(()=>{
        wrap.className='u321-mz';
        u321MarketBusy=false;
        const dest=enter?document.getElementById('closeModal'):document.querySelector('[data-market-return-focus]');
        if(dest)dest.focus({preventScroll:true});
      },600);
    },380);
  },520);
}
