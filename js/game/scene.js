/* MILE ZERO — Bar scene: portraits, expressions, dialogue typing, main render.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

function mzParseExpressionLine(raw){
 if(typeof raw!=='string')return {text:raw==null?'':String(raw),expression:null};
 const match=raw.match(/^(.*?)(?:\s*\[([^\[\]]+)\])\s*$/);
 if(!match)return {text:raw,expression:null};
 const key=(match[2]||'').trim();
 const expression=MZ_EXPRESSION_TAGS[key]||null;
 return expression?{text:match[1].replace(/\s+$/,''),expression}:{text:raw,expression:null};
}

function mzTaggedLineDisplay(raw){return mzParseExpressionLine(raw).text;}

function mzVisitPortraitExpression(v,sub,lineIndex){
 if(!v||v.who!=='마렌')return 'normal';
 let current='normal';
 const apply=(raw)=>{const parsed=mzParseExpressionLine(raw);if(parsed.expression)current=parsed.expression;};
 if(sub==='dialogue'||sub==='after'){
  const dialogLines=Array.isArray(v.dialogue)?v.dialogue:[];
  const afterLines=currentAfterLines(v);
  if(sub==='dialogue'){
   for(let i=0;i<=Math.min(lineIndex,dialogLines.length-1);i++)apply(dialogLines[i]?.[1]);
  }else{
   for(const line of dialogLines)apply(line?.[1]);
   for(let i=0;i<=Math.min(lineIndex,afterLines.length-1);i++)apply(afterLines[i]?.[1]);
  }
  return current;
 }
 if(sub==='appointment'||sub==='appointmentReply'){
  const offer=v.appointmentOffer||{};
  if(typeof offer.prompt==='string')apply(offer.prompt);
  if(sub==='appointmentReply')apply(lineIndex===1?offer.acceptReply:offer.declineReply);
 }
 return current;
}

function mzActivePortraitExpression(v){
 if(!v)return 'normal';
 if(v.who!=='마렌')return 'normal';
 if(s.sub==='dialogue'||s.sub==='after')return mzVisitPortraitExpression(v,s.sub,s.line);
 if(s.sub==='order')return mzVisitPortraitExpression(v,'dialogue',Math.max(0,(Array.isArray(v.dialogue)?v.dialogue.length:1)-1));
 if(s.sub==='appointment'||s.sub==='appointmentReply')return mzVisitPortraitExpression(v,s.sub,s.line);
 return 'normal';
}

function mzPortraitBackLayerSrc(id){
 if(id==='freight'&&s.day>=36)return FREIGHT_DAY36_PARTS_GIF;
 return null;
}

// Use the drink's actual mix boundary for the serving counter.
// The mixed portion takes up as much of the glass as its ingredient count;
// older saves sometimes store mode='mix' even when mixAt marks a partial mix.
function mzServedLiquidStrips(drink){
 const seq=Array.isArray(drink.seq)?drink.seq:[];
 const colorOf=key=>ingredients.find(a=>a[0]===key)?.[2]||'#cb83a6';
 const boundary=Number(drink.mixAt)||0;
 const partial=(drink.mode==='partial'||drink.mode==='mix')&&boundary>0&&boundary<seq.length;
 if(partial){
  return `<i style="background:${blendColor(seq.slice(0,boundary))};flex:${boundary} 1 0"></i>`+
   seq.slice(boundary).map(key=>`<i style="background:${colorOf(key)};flex:1 1 0"></i>`).join('');
 }
 if(drink.mode==='mix')return `<i style="background:${seq.length?blendColor(seq):'#b58caa'};flex:1 1 0"></i>`;
 return seq.map(key=>`<i style="background:${colorOf(key)};flex:1 1 0"></i>`).join('');
}

function mzPortraitIdForWho(who){
 if(who==='마렌')return 'maren';
 if(who==='야간 정비사')return 'mechanic';
 if(who==='인근 직장인')return 'officeworker';
 if(who==='리안')return 'rian';
 if(who==='정기 화물 기사')return 'freight';
 if(who==='황무지 출신 정착민')return 'settler';
 if(who==='카이렌')return 'kairen';
 if(who==='미카')return 'mika';
 if(who==='토르반')return 'torban';
 if(who==='토르반의 아내')return 'torbanwife';
 return null;
}

function mzGenericPortraitState(){
 if(!s.genericPortraitAssignments||typeof s.genericPortraitAssignments!=='object'||Array.isArray(s.genericPortraitAssignments))s.genericPortraitAssignments={};
 return s.genericPortraitAssignments;
}

function mzGenericPortraitHash(text){
 const str=String(text||'');
 let h=2166136261>>>0;
 for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),16777619)>>>0;
 return h>>>0;
}

function mzGenericPortraitLikelyGroup(v){
 // Group detection is based on the visit's participants and speakers, not on order count.
 // One person can order several dishes, so order quantity must never imply a party.
 if(!v)return false;
 if(Array.isArray(v.participants)&&v.participants.length>1)return true;
 const who=String(v.who||'').trim();
 if(!who)return false;
 // Cover authored group names written as words, digits, A/B labels, or named rosters.
 if(/(?:두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(?:명|사람|손님|인|분)|[2-9]\s*(?:명|인|사람)|\b(?:10|11|12)\s*(?:명|인|사람)/.test(who))return true;
 if(/(?:부부|일행|단체|모임|커플|친구들|동료들|\s팀$|팀\s*$)/.test(who))return true;
 if(/(?:[A-Za-zＡ-Ｚ]|[가-힣])\s*[·&＆/]\s*(?:[A-Za-zＡ-Ｚ]|[가-힣])/.test(who))return true;
 if(/(?:^|\s)(?:A[·/&]B|A\s*(?:와|과|및|그리고|\+)\s*B)(?:$|\s)/i.test(who))return true;
 if(/(?:^|\s)(?:두|세|네)\s*사람(?:$|\s)/.test(who))return true;
 // Phrases such as '공연 보러 온 친구' may not reveal the headcount.
 // Distinct A/B speakers in dialogue / after lines signal multiple people.
 const speakers=new Set();
 for(const lines of [v.dialogue,v.after,v.afterBad]){
  if(!Array.isArray(lines))continue;
  for(const line of lines){
   if(!Array.isArray(line)||typeof line[0]!=='string')continue;
   const match=line[0].trim().match(/^(.*?)\s+([A-Z])$/i);
   if(match)speakers.add(match[1]+'|'+match[2].toUpperCase());
  }
 }
 if(speakers.size>1){
  const tags=[...speakers].map(label=>label.split('|')[1]);
  if(new Set(tags).size>1)return true;
 }
 return false;
}

function mzGenericPortraitPool(group,type){
 if(group==='group')return MZ_GENERIC_GROUP_PORTRAIT_POOLS[type]||[];
 if(group==='solo')return MZ_GENERIC_SOLO_PORTRAIT_POOLS[type]||[];
 return [];
}

function mzGenericPortraitPick(v,group,type){
 const pool=mzGenericPortraitPool(group,type).filter(id=>!!STANDING_LAYERS[id]);
 if(!pool.length)return [];
 const key='generic:'+group+':'+type+':'+s.day+':'+s.visit+':'+String(v?.who||'');
 const state=mzGenericPortraitState();
 const saved=state[key];
 if(pool.includes(saved))return [saved];
 const salt=7000+(mzGenericPortraitHash(key)%1000000);
 const pick=pool[Math.floor(seedPick(s,s.day,s.visit,salt)*pool.length)]||pool[0];
 state[key]=pick;
 return [pick];
}

function mzGenericPortraitIdsForVisit(v){
 if(!v)return [];
 const explicitGroup=v.portraitGroup==='group'?'group':(v.portraitGroup==='solo'?'solo':null);
 const group=explicitGroup||(mzGenericPortraitLikelyGroup(v)?'group':'solo');
 const type=(typeof v.portraitType==='string'&&v.portraitType)?v.portraitType:(group==='solo'?'casual':null);
 if(!type)return [];
 return mzGenericPortraitPick(v,group,type);
}

function mzPortraitIdsForCurrentVisit(v){
 if(bootScreen==='devPortrait')return mzDevPortraitChoice==='couple'?['torbanwife','torban']:[mzDevPortraitChoice];
 if(mzVisualPrefs.portraits===false||s.phase!=='open'||s.sub==='interlude'||!v)return [];
 if(v.who==='토르반'&&s.day===29)return ['torbanwife','torban'];
 if(v.who==='카이렌과 미카'||v.who==='미카와 카이렌')return ['mika','kairen'];
 if(v.who==='먹방 인플루언서')return ['mukbanginfluencer'];
 if(v.who==='ZERO 현장 점검 직원')return ['zeroinspector'];
 if((s.day===19&&v.who==='빨간 노래를 부르는 두 손님')||(s.day===32&&v.who==='인근 학생 두 명'))return ['redsonga','redsongb'];
 if(s.day===30&&v.who==='관문 대기객')return ['gatewaiter30'];
 const id=mzPortraitIdForWho(v.who);
 if(id)return [id];
 return mzGenericPortraitIdsForVisit(v);
}

function mzPortraitHTML(id,face){
 const portrait=STANDING_LAYERS[id];
 if(!portrait)return '';
 const backLayer=mzPortraitBackLayerSrc(id);
 return '<div class="mz267-layered-portrait" data-portrait-id="'+id+'" role="img" aria-label="'+portrait.label+' 스탠딩">'+
  (backLayer?'<img class="mz267-back-layer" src="'+backLayer+'" alt="" draggable="false">':'')+
  '<img class="mz267-base-layer" src="'+portrait.base+'" alt="" draggable="false">'+
  '<img class="mz267-expression-layer" src="'+face+'" alt="" draggable="false">'+
  '</div>';
}

function scene(){document.querySelector('.scene')?.classList.toggle('mz256-friend-counter-active',Number.isInteger(s.friendCounterUnlockDay)&&s.day>=s.friendCounterUnlockDay);const v=current();const figure=$('figure');const portraitIds=mzPortraitIdsForCurrentVisit(v);figure.style.display=portraitIds.length?'flex':'none';if(portraitIds.length){const portraits=portraitIds.map(id=>({id,portrait:STANDING_LAYERS[id]})).filter(x=>x.portrait);const portraitKey=portraits.map(x=>x.id+(mzPortraitBackLayerSrc(x.id)?':back':'')).join(',');const expressionId=bootScreen==='devPortrait'?'normal':mzActivePortraitExpression(v);if(figure.dataset.portraits!==portraitKey){figure.innerHTML=portraits.map(x=>{const face=(x.portrait.expressions&&x.portrait.expressions[expressionId])||x.portrait.expressions.normal;return mzPortraitHTML(x.id,face)}).join('');figure.dataset.portraits=portraitKey;}portraits.forEach(x=>{const face=(x.portrait.expressions&&x.portrait.expressions[expressionId])||x.portrait.expressions.normal;const expressionLayer=figure.querySelector('[data-portrait-id="'+x.id+'"] .mz267-expression-layer');if(expressionLayer&&expressionLayer.getAttribute('src')!==face)expressionLayer.setAttribute('src',face);});figure.classList.toggle('mz267-dual-portraits',portraits.length>1);figure.classList.toggle('mz-mika-kairen-pair',portraits.length===2&&portraits[0].id==='mika'&&portraits[1].id==='kairen');figure.classList.toggle('mz-redsong-pair',portraits.length===2&&portraits[0].id==='redsonga'&&portraits[1].id==='redsongb');figure.dataset.expression=expressionId;}else{if(figure.dataset.portraits){figure.innerHTML='';delete figure.dataset.portraits;delete figure.dataset.expression;}figure.classList.remove('mz267-dual-portraits','mz-mika-kairen-pair','mz-redsong-pair');}$('guestIdentity').innerHTML=bootScreen==='devPortrait'?'<strong>'+esc(mzDevPortraitChoices.find(x=>x[0]===mzDevPortraitChoice)?.[1]||'스탠딩')+'</strong>':s.phase==='open'&&s.sub==='interlude'?'':s.phase==='open'?`<strong>${esc(v.who)}</strong>`:s.phase==='closing'?dayLabel(s.day)+'<br><strong>영업 종료</strong>':'관문 구역<br><strong>영업 준비 중</strong>';let c=s.completed.map(x=>{let preview;if(x.type==='food'){preview='<span class="plate-pixel" aria-hidden="true"><i></i></span>'}else{const strips=mzServedLiquidStrips(x);preview=`<span class="served-cup" aria-hidden="true"><span class="served-liquid">${strips}</span>${iceVisual(x.iceCount??(x.ice?1:0),true)}${x.extra?`<span class="served-extra v54-served-${esc(x.extra)}" title="${esc(garnishById(x.extra)?.name||'가니쉬')}">${esc(({sunfruit:'✿',citrus:'◉',mint:'❧',cherry:'●',chocoball:'◉',tapioca:'◌',coffeejelly:'▦',whippedcream:'❀',berrymix:'✿',mintchoco:'❧',fire:'♨',flower:'✿'})[x.extra]||'✦')}</span>`:''}</span>`}return `<div class="served ${x.type==='food'?'food':''}" title="${esc(x.name)}">${preview}<span>${esc(x.name)}</span></div>`}).join('');$('counter').classList.toggle('mz-bulk-order',s.completed.length>=5);$('counter').innerHTML=c||'';}

let activeTypeKey=null,activeTypeTimer=null,activeTypeComplete=true,activeTypeFull='';

function revealDialogue(){
 if(activeTypeComplete)return false;
 if(activeTypeTimer){clearInterval(activeTypeTimer);activeTypeTimer=null}
 const el=$('dialogueText');el.textContent=activeTypeFull;el.classList.remove('typing');activeTypeComplete=true;return true;
}

function typeDialogue(who,line,key){
 const el=$('dialogueText');
 if(activeTypeKey===key){if(activeTypeComplete){el.textContent=line;el.classList.remove('typing')}return}
 if(activeTypeTimer)clearInterval(activeTypeTimer);
 activeTypeKey=key;activeTypeFull=line;activeTypeComplete=false;el.textContent='';el.classList.add('typing');
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){revealDialogue();return}
 let i=0;
 activeTypeTimer=setInterval(()=>{
  if(activeTypeKey!==key){clearInterval(activeTypeTimer);activeTypeTimer=null;return}
  i=Math.min(line.length,i+2);el.textContent=line.slice(0,i);
  if(i>=line.length){clearInterval(activeTypeTimer);activeTypeTimer=null;activeTypeComplete=true;el.classList.remove('typing')}
 },32);
}

function dialogueClick(fn){return ()=>{if(revealDialogue())return;fn()}}

function mzOpenArcadePlaceholder({developerPreview=false}={}){
 // Developer preview bypasses the story unlock without changing game or save state.
 if(!developerPreview&&(s.phase!=='closing'||!s.arcadeRepaired||s.day<32))return;
 if(document.getElementById('mzArcadeV312'))return;
 const overlay=document.createElement('div');
 overlay.id='mzArcadeV312';overlay.className='mz-v312-arcade-overlay';
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','아케이드 게임기 · GHOST EATER');
 overlay.innerHTML='<div class="mz-v312-arcade-shell"><div class="mz-v312-arcade-top"><div class="mz-v312-arcade-heading"><strong>MILE ZERO / ARCADE</strong><small>GHOST EATER · 수리된 게임기</small></div><button type="button" class="btn mz-v312-exit">닫기 ×</button></div><iframe class="mz-v312-arcade-frame" title="GHOST EATER 미니게임" allow="autoplay"></iframe></div>';
 const close=()=>{window.removeEventListener('keydown',onKey);window.mzArcadeMusic?.stop?.();overlay.remove();};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 overlay.querySelector('.mz-v312-exit').addEventListener('click',close);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.body.appendChild(overlay);
 window.addEventListener('keydown',onKey);
 const arcadeDoc=mzArcadeHTML;
 overlay.querySelector('iframe').srcdoc=arcadeDoc;
 overlay.querySelector('iframe').addEventListener('load',()=>window.mzArcadeMusic?.sync?.());
 window.mzMusicBox?.stop?.();
 window.mzArcadeMusic?.start?.();
 overlay.querySelector('.mz-v312-exit').focus();
}

function dialog(){if(s.phase!=='open'||!['dialogue','after'].includes(s.sub)){if(activeTypeTimer){clearInterval(activeTypeTimer);activeTypeTimer=null}activeTypeKey=null;activeTypeComplete=true;$('dialogueText').classList.remove('typing')}const choices=$('choices');choices.innerHTML='';let oldMarket=$('v54ClosingMarket');if(oldMarket)oldMarket.remove();document.getElementById('mzDay32ArcadeButton')?.remove();const add=(title,fn,primary=false)=>{const b=document.createElement('button');b.className='btn'+(primary?' primary':'');b.textContent=title;b.onclick=fn;choices.appendChild(b)};if(s.phase==='prep'){$('speaker').textContent='MILE ZERO · 영업 준비';$('dialogueText').textContent='오늘의 영업을 준비합니다.';add('레시피북 확인',()=>openPanel('recipes'));add('영업 시작',()=>{if(s.devPreview&&!todayVisits().length){s.phase='closing';render();}else start()},true);return;}if(s.phase==='closing'){$('speaker').textContent='MILE ZERO · 마감';$('dialogueText').innerHTML=`${dayLabel(s.day)} 영업이 끝났습니다. 오늘 완료한 주문은 <b>${(s.dayStats[s.day]||{}).orders||0}건</b>입니다. 누적 팁 <b>${s.tips}</b> · 현재 잔액 <b>${marketBalance()} 크레딧</b>.<br><span class="note">${canDevelopToday()?(s.day===3?'첫 번째 지점 한정 메뉴 개발이 가능합니다.':'지점 한정 메뉴 개발이 가능합니다.'):s.day===1?'첫날 영업을 마쳤습니다.':'오늘의 영업을 마쳤습니다.'}</span>`;add('오늘의 손님 기록',()=>openPanel('guests'));add('저장하기',()=>openPanel('save'),true);if(canDevelopToday())add('신메뉴 개발',()=>openDevelopment(),true);if(mzWeekendEligible())add('주말 보내기',()=>mzOpenWeekend(),true);else if(s.day>=mzDayLimit())add('현재 버전 종료',()=>openPanel('save'),true);else add('다음 날로 넘어가기',()=>nextDay(),true);if(s.day>=7){const market=document.createElement('div');market.id='v54ClosingMarket';market.className='v54-closing-market';market.innerHTML='<button type="button" class="v54-closing-market-button"><span class="v54-market-symbol" aria-hidden="true">▦</span><span><strong>관문 시장 둘러보기</strong><small>마감 후 식재료 구매 · 보유 '+marketBalance().toLocaleString()+' CR</small></span>'+mzMarketNewBadgeMarkup()+'<span aria-hidden="true">›</span></button>';market.querySelector('button').onclick=()=>openPanel('market');choices.insertAdjacentElement('afterend',market);if(s.day>=32&&s.arcadeRepaired)market.insertAdjacentElement('afterend',mzDay32ArcadeButton());}return;}
if(s.sub==='interlude'){$('speaker').textContent='MILE ZERO';$('dialogueText').textContent=s.visit>=todayVisits().length?interludes[interludes.length-1]:interludes[Math.min(Math.max(s.visit-1,0),interludes.length-2)];return;}const v=current();if(s.lightComment && s.sub!=='order'){$('speaker').textContent=v.who;const lightLine=mzTaggedLineDisplay(s.lightComment);typeDialogue(v.who,'“'+lightLine+'”','light:'+s.visit+':'+lightLine);add('계속',dialogueClick(()=>{s.lightComment=null;render()}),true);return;}if(s.sub==='order'){$('speaker').textContent=v.who+' · 주문 접수';$('dialogueText').innerHTML=`<b>${v.orders.map(o=>esc(o.name)+(o.type==='drink'&&o.ice?' (얼음 추가)':'')).join(' + ')}</b><br><span class="note"></span>`;if(allDone())add('카운터의 메뉴 서빙하기',deliver,true);else add('레시피북 열기',()=>openPanel('recipes'));return;}
if(s.sub.startsWith('mz35Care')){mz35CareDialogue(add);return;}
 if(s.sub==='appointment'||s.sub==='appointmentReply'){
  const offer=v.appointmentOffer||{};
  if(s.sub==='appointment'){
   $('speaker').textContent=v.who;$('dialogueText').textContent=mzTaggedLineDisplay(offer.prompt||'이번 주말에 함께 갈래요?');
   add(offer.acceptLabel||'좋아요. 같이 가요.',()=>mzAnswerAppointment(true),true);
   add(offer.declineLabel||'이번에는 어려울 것 같아요.',()=>mzAnswerAppointment(false));
  }else{
   const accepted=s.line===1;
   $('speaker').textContent=v.who;$('dialogueText').textContent=mzTaggedLineDisplay(accepted?(offer.acceptReply||'그럼 주말에 봐요!'):(offer.declineReply||'알겠어요. 다음에 기회가 있겠죠.'));
   add('다음 손님',()=>advanceGuest(),true);
  }
  return;
 }
 const lines=s.sub==='after'?currentAfterLines(v):v.dialogue;const [who,line]=lines[s.line];const displayWho=s.day>=23&&((who==='방문객'&&v.who==='퇴근길 방문객')||(who==='화물 기사'&&v.who==='정기 화물 기사'))?v.who:who;const shownLine=mzTaggedLineDisplay(line);$('speaker').textContent=displayWho;typeDialogue(who,shownLine,s.visit+':'+s.sub+':'+s.line+':'+shownLine);add(s.line===lines.length-1?s.sub==='after'?'손님 배웅하기':'주문 받기':'계속',dialogueClick(()=>{note(who,shownLine);if(s.day===6&&s.visit===2&&s.sub==='dialogue'&&s.line===2){recordGuestClue('야간 정비사',6,2)}nextLine()}),true);}

function render(){mzRestoreHearts();if(!Array.isArray(s.readPosts))s.readPosts=[];if(!Array.isArray(s.readMessages))s.readMessages=[];if(!Array.isArray(s.deliveredMessages))s.deliveredMessages=['welcome','schedule'];const unread=s.deliveredMessages.filter(id=>!s.readMessages.includes(id)).length;mzRefreshGuestNewBadge();const recipeBadge=$('v57RecipeUnread');if(recipeBadge)recipeBadge.hidden=!v57UnseenRecipes().length;const dot=$('messageUnread');dot.hidden=unread===0;dot.textContent=unread;const side=$('messageSide');side.classList.toggle('mail-alert',unread>0);side.setAttribute('aria-label',unread?'새 메시지 '+unread+'개, 받은편지함':'받은편지함');side.title=unread?'새 메시지 '+unread+'개':'메시지';document.body.classList.toggle('light',s.light==='light');window.mzVisuals?.apply?.();$('clock').textContent=s.phase==='open'?(s.sub==='interlude'?(todayVisits()[Math.max(0,s.visit-1)]?.time||'18:00'):current().time):s.phase==='closing'?'02:00':'18:00';$('branchDay').textContent='ZERO GATE BRANCH · '+dayLabel(s.day);v48RenderWallet();scene();dialog();renderStation();bootView();phoneView();mz289DecorateLiquid();waitTick();$('headerLightButton').textContent=s.light==='dark'?'☀ 라이트 모드':'☾ 다크 모드';$('headerLightButton').setAttribute('aria-pressed',s.light==='light'?'true':'false');u219SyncThemeButtons();}
