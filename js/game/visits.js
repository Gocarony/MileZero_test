/* MILE ZERO — Which guests come today: daily scripts, variants, random orders.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

let dayEightCacheKey=null,dayEightCache=null,dayFiveCacheKey=null,dayFiveCache=null,dayTenCacheKey=null,dayTenCache=null;

// DAY 12 local trend. Fixed per save seed and inventory; never reroll on rendering.
const trendCandidateIds=['citrus','mint','cherry','sugar','chocoball','tapioca'];

function dayTwelveTrend(){
 const ids=trendCandidateIds.filter(id=>unlockedGarnishes().some(g=>g.id===id));
 return garnishById(ids[Math.floor(seedPick(s,12,0,812)*ids.length)]);
}

function authoredMenuRecipes(){return (s.customRecipes||[]).filter(r=>r.registered&&r.source!=='market'&&r.name&&['food','drink'].includes(r.kind));}

// Player-created snacks are independent of drinks. If none exist, order a seeded regular snack.
function authoredSnackVisit(v,day,index){
 const snacks=authoredMenuRecipes().filter(r=>r.kind==='food');
 const recipe=snacks.length?snacks[Math.floor(seedPick(s,day,index,920)*snacks.length)]:null;
 if(recipe){
  const heat=day>=10?1+Math.floor(seedPick(s,day,index,921)*3):0;
  return withReplacedMenuOrder(v,customOrderLines(v,recipe,day,index,heat),
   {type:'food',name:recipe.name,custom:true,heat,addons:recipe.addons||[]},'food');
 }
 const regulars=availableFoods().filter(f=>f&&f.name);
 const chosen=regulars[Math.floor(seedPick(s,day,index,922)*regulars.length)];
 if(!chosen)return v;
 return withReplacedMenuOrder(v,[[v.who,'오늘은 '+chosen.name+' 하나 부탁할게요.']],
  {type:'food',name:chosen.name},'food');
}

let dayElevenCacheKey=null,dayElevenCache=null,dayTwelveCacheKey=null,dayTwelveCache=null;

function dayElevenVariants(base){
 const made=authoredMenuRecipes();
 const key=String(s.randomSeed)+'|'+JSON.stringify(made.map(r=>[r.name,r.kind,r.addons]));
 if(dayElevenCache&&dayElevenCacheKey===key)return dayElevenCache;
 dayElevenCacheKey=key;
 return dayElevenCache=base.map((v,i)=>{
  if(!v.customVariant11)return v;
  if(v.orders.some(o=>o.type==='food'))return authoredSnackVisit(v,11,i);
  if(!made.length)return v;
  const recipe=made[Math.floor(seedPick(s,11,i,810)*made.length)];
  if(recipe.kind==='drink'){
   const count=Math.floor(seedPick(s,11,i,811)*4);
   return withReplacedMenuOrder(v,customOrderLines(v,recipe,11,i,count),
    {type:'drink',name:recipe.name,custom:true,iceCount:count},'drink');
  }
  const heat=1+Math.floor(seedPick(s,11,i,812)*3);
  return withReplacedMenuOrder(v,customOrderLines(v,recipe,11,i,heat),
   {type:'food',name:recipe.name,custom:true,heat,addons:recipe.addons||[]},'food');
 });
}

function dayTwelveVariants(base){
 const trend=dayTwelveTrend();
 // When no trending garnish is unlocked, guests cannot claim to have tasted one.
 if(!trend)return base.map(v=>{
  const orderLineIndex=v.dialogue.findIndex(entry=>menuOrderLine(v,entry?.[1]));
  const neutralIntros={
   '관문 청소 직원':'아침부터 동네가 꽤 시끄럽네요. 무슨 이야기가 그렇게 많은지 모르겠어요.',
   '마렌':'오늘은 가게에 들르는 사람마다 서로 다른 이야기를 하더라고요.',
   '관문 경비 보조':'오늘은 유난히 관문 앞이 분주하네요.',
   '야간 정비사':'오늘은 익숙한 메뉴로 먹고 쉬어야겠어요.',
   '관문 근처 학생':'같이 온 친구들이 전부 다른 말을 해서 메뉴 고르기가 어렵네요.',
   '정기 화물 기사':'운송대 대기실이 오늘은 꽤 북적였어요.',
   '인근 직장인':'오늘도 퇴근이 늦었어요. 간신히 한숨 돌리네요.',
   '황무지 출신 정착민':'오늘은 관문 앞이 유난히 소란스러웠어요.'
  };
  const neutralAfters={
   '관문 청소 직원':'오늘도 잘 마셨습니다. 이제 다시 일하러 가야겠네요.',
   '마렌':'잘 마셨어요. 오늘은 이만 가봐야겠네요.',
   '관문 경비 보조':'오늘은 익숙한 맛으로 충분하네요. 잘 마셨습니다.',
   '야간 정비사':'잘 먹었습니다. 이제 들어가서 좀 쉬어야겠어요.',
   '관문 근처 학생':'잘 마셨어요. 다음엔 친구들하고 다시 와볼게요.',
   '정기 화물 기사':'식사하니 이제 슬슬 졸리네요. 내일 운전 준비해야죠.',
   '인근 직장인':'잘 마셨어요. 집에 가서 좀 자야겠네요.',
   '황무지 출신 정착민':'오늘은 익숙한 맛이 좋네요. 잘 먹었습니다.'
  };
  const rewritten=v.dialogue.map((entry,i)=>i===0&&neutralIntros[v.who]?[entry[0],neutralIntros[v.who]]:entry);
  // All fallback orders remain unchanged; only false taste impressions are removed.
  return {...v,dialogue:rewritten,after:neutralAfters[v.who]?[[v.who,neutralAfters[v.who]]]:v.after};
 });
 const key=String(s.randomSeed)+'|'+(s.ownedMarket||[]).slice().sort().join('|')+'|'+trend.id;
 if(dayTwelveCache&&dayTwelveCacheKey===key)return dayTwelveCache;
 dayTwelveCacheKey=key;
 const indexes=base.map((v,i)=>({v,i})).filter(({v})=>v.orders.some(o=>o.type==='drink'))
  .map(({i})=>i).sort((a,b)=>seedPick(s,12,a,813)-seedPick(s,12,b,813));
 const participants=new Set(indexes.slice(0,Math.ceil(base.length*.70)));
 // The response must follow what this guest actually ordered, not a generic
 // topping reaction inherited from the unmodified Day 12 visit.
 const toppingReplies={
  '관문 청소 직원':'아, 오늘 사람들이 왜 그렇게 떠드는지 알 것 같기도 하네요.',
  '마렌':'가게 손님들이 왜 그렇게 찾는지 알겠어요. 새로운 맛이네요.',
  '여행 중인 부부':'여행길에 유행하는 맛까지 경험했네요. 잘 쉬었다 갑니다.',
  '관문 경비 보조':'이 조합, 생각보다 잘 어울리네요.',
  '야간 정비사':'평소와 조금 다른 맛이네요. 새로운 걸 시험하는 재미가 있어요.',
  '관문 근처 학생':'친구들이 왜 다들 찾는지 조금 알 것 같아요.',
  '정기 화물 기사':'대기실에서도 얘기가 많던데, 직접 먹어보니 알겠네요.',
  '인근 직장인':'SNS에서 보던 그 음료를 직접 마셔보네요. 잘 마셨어요.',
  '황무지 출신 정착민':'처음엔 조금 낯설었는데, 이런 맛도 괜찮네요.',
  '야간 물류 직원':'오늘 그렇게들 얘기하던 토핑이 이거군요. 잘 마셨습니다.',
  '산책 나온 주민':'사진으로 보던 것과는 또 다르네요. 다음에는 다른 조합도 먹어볼래요.',
  '교대 대기 기사':'소문만 들었는데 직접 맛보니 알겠네요. 이제 다시 일하러 가야겠어요.',
  '다른 도시 여행객':'관문 지역에서 유행하는 맛까지 경험했네요. 재미있었어요.',
  '심야 막차 승객':'막차 전에 유행하는 맛도 마셔봤네요. 잘 마셨습니다.'
 };
 const regularReplies={
  '관문 청소 직원':'오늘은 평소 마시던 맛이 역시 편하네요.',
  '마렌':'이런 유행도 가끔은 재미있네요. [웃음] 저는 평소 마시던 게 좋지만요.',
  '여행 중인 부부':'덕분에 편히 쉬었다 갑니다.',
  '관문 경비 보조':'오늘은 익숙한 맛으로 충분하네요. 잘 마셨습니다.',
  '야간 정비사':'오늘은 평소 먹던 게 좋네요. 잘 먹었습니다.',
  '관문 근처 학생':'오늘은 그냥 익숙한 게 좋네요. 다음엔 친구들과 와볼게요.',
  '정기 화물 기사':'식사하니 슬슬 졸리네요. 내일 운전 준비해야죠.',
  '인근 직장인':'유행이란 게 참 빨리 퍼지네요. 저는 오늘 평소대로 마셨어요.',
  '황무지 출신 정착민':'오늘은 익숙한 맛이 좋네요. 잘 먹었습니다.',
  '야간 물류 직원':'잘 마셨습니다. 이제 집에 가서 쉬어야겠네요.',
  '산책 나온 주민':'다음번에는 다른 조합도 먹어볼래요.',
  '교대 대기 기사':'충분히 쉬었으니 이제 다시 일하러 가야겠네요.',
  '다른 도시 여행객':'여행 중에 이런 유행도 구경하네요. 재미있었어요.',
  '심야 막차 승객':'오늘 참 시끌벅적한 날이었네요. 잘 마셨습니다.'
 };
 return dayTwelveCache=base.map((v,i)=>{
  const orderIndex=v.orders.findIndex(o=>o.type==='drink');
  if(orderIndex<0)return v;
  const otherItems=v.orders.filter(o=>o.type!=='drink').map(o=>o.name).filter(Boolean);
  const orderedLineIndex=v.dialogue.findIndex(entry=>menuOrderLine(v,entry?.[1]));
  // Replace the original order at its authored position, keeping personal
  // conversation before AND after it in the same order.
  const before=orderedLineIndex>=0?v.dialogue.slice(0,orderedLineIndex):v.dialogue;
  const after=orderedLineIndex>=0?v.dialogue.slice(orderedLineIndex+1):[];
  const wantsTopping=participants.has(i);
  if(!wantsTopping){
   const drinkName=v.orders[orderIndex].name;
   const iceCount=v.orders[orderIndex].iceCount;
   const iceText=Number.isInteger(iceCount)?' 얼음은 '+(['영 번','한 번','두 번','세 번'][iceCount]||iceCount+'번')+' 넣어 주세요.':'';
   const line='오늘은 유행하는 '+trend.name+' 토핑 없이 '+drinkName+' 기본으로 부탁할게요.'+iceText+(otherItems.length?' 그리고 '+otherItems.join(', ')+'도 주세요.':'');
   const neutralFirst={
    '관문 청소 직원':'아침부터 동네에 '+trend.name+' 이야기가 끊이지 않네요.',
    '야간 정비사':'다들 '+trend.name+' 얘기를 하던데, 오늘은 익숙한 메뉴가 더 당기네요.',
    '관문 경비 보조':'오늘은 다들 '+trend.name+' 토핑을 찾는다면서요?',
    '관문 근처 학생':'친구들이 모두 '+trend.name+' 얘기를 하네요. 메뉴 고르기 어려워요.'
   };
   const safeBefore=neutralFirst[v.who]&&before.length?[[before[0][0],neutralFirst[v.who]],...before.slice(1)]:before;
   return {...v,dialogue:[...safeBefore,[v.who,line],...after],
    orders:v.orders.map((o,j)=>j===orderIndex?{...o,noTopping:true}:o),
    after:[[v.who,regularReplies[v.who]||'잘 먹었습니다.']]};
  }
  const order=v.orders[orderIndex];
  const changed=v.orders.map((o,j)=>j===orderIndex?{...o,requestedGarnish:trend.id}:o);
  const last=trend.name.charCodeAt(trend.name.length-1);
  const suffix=(last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28!==0)?'은':'는';
  const start=[
   '요즘 다들 '+trend.name+' 토핑 얘기만 하더라고요. 저도 궁금해졌어요.',
   '오늘 유행한다는 '+trend.name+' 말이에요. 한번 먹어봐도 괜찮겠죠?',
   '이 근처에서는 지금 '+trend.name+' 토핑이 유행이라면서요? 정말인가요?',
   '평소엔 토핑을 잘 안 먹는데, '+trend.name+suffix+' 한번 먹어보고 싶네요.'
  ][i%4];
  const iceCount=order.iceCount;
  const iceText=Number.isInteger(iceCount)?' 얼음은 '+(['영 번','한 번','두 번','세 번'][iceCount]||iceCount+'번')+' 넣어 주세요.':'';
  const request=order.name+'에 '+trend.name+(trend.id==='tapioca'?' 넣어':' 올려')+' 주세요.'+iceText;
  const tail=v.orders.filter((o,j)=>j!==orderIndex).map(o=>o.name).join('하고 ');
  const orderLine=tail?request+' 그리고 '+tail+'도 부탁할게요.':request;
  const originalFirst=before[0]?.[1]||'';
  const problemIntro=/(저도|궁금|비슷하|토핑|유행|같은 얘기|똑같)/.test(originalFirst);
  const safeBefore=problemIntro?before.slice(1):before;
  return {...v,dialogue:[...safeBefore,[v.who,start],[v.who,orderLine],...after],orders:changed,
   after:[[v.who,toppingReplies[v.who]||'유행하는 이유를 알 것 같네요. 잘 먹었습니다.']]};
 });
}

// DAY 08 mechanic quest retry. Original order stays first; the special dish is an
// additional order after the guest's existing dialogue. A discovered recipe never
// causes a second quest. No inventory item is consumed by a failed attempt.
function mechanicQuestAvailable(){
 return hasMarketItem('smoke') && hasMarketItem('crisp') &&
  !(Array.isArray(s.regularUnlocks) && s.regularUnlocks.includes('mechanic'));
}

function mechanicExtraOrder(v,force=false){
 if(!force && !mechanicQuestAvailable() && !(s.mechanicRetryActive && s.phase==='open' && s.sub==='after'))return v;
 const who='야간 정비사';
 const extra=[
  [who,'아, 그리고 한 가지 더 부탁드려도 될까요? 지난번에 말씀드린 그 식당 음식 말이에요.'],
  [who,'여기 스모크 에센스랑 크리스피 플레이크가 있네요. 고기로 만든 꼬치에 훈연 향과 바삭한 토핑을 더해 주실 수 있을까요?']
 ];
 const good=[
  [who,'……잠깐만요. 이 냄새. 이 맛...'],
  [who,'...그 식당에서 먹던 게 딱 이런 느낌이었는데.'],
  [who,'그 집은 정비소에서 조금만 걸으면 나오는 곳이었어요. 야간 점검이 끝나면 거기서 꼭 뭔가를 먹고 돌아가곤 했죠.'],
  [who,'지금 먹는 건 그때 그 음식이랑 똑같지는 않아요. 그래도 이상하네요. 문을 열고 들어가던 길이며, 그때 들리던 소리까지 생각나서……'],
  [who,'예전에 한 번 얘기한 걸 기억해 주신 거잖아요. 정말 고맙습니다. 오늘은 오래 기억할 것 같아요.']
 ];
 return {...v,dialogue:[...v.dialogue,...extra],
  orders:[...v.orders,{type:'food',name:'훈연 바삭 꼬치',addons:['smoke','crisp'],regularSpecial:'mechanic'}],
  after:[...v.after,...good],
  afterBad:[[who,'아, 제가 말씀드린 바삭한 토핑이랑 훈연 향은 조금 부족한 것 같네요.'],[who,'그래도 이렇게 만들어 주시려고 한 게 고마워요. 다음에 또 부탁드려도 될까요?']]};
}

// One retry at DAY 09; if the ingredients arrive after that shift,
// the mechanic makes a short extra visit on DAY 10.
function dayTenMechanicVisit(){
 return {who:'야간 정비사',time:'01:35',
  dialogue:[[ '야간 정비사','정비 일정이 길어져서 늦었네요. 아직 식사할 수 있을까요?'],['야간 정비사','소금구이 꼬치 하나 부탁드릴게요.']],
  orders:[{type:'food',name:'소금구이 꼬치'}],
  after:[[ '야간 정비사','늦게까지 고맙습니다. 오늘도 잘 먹었어요.']]};
}

function menuOrderLine(v, text){
 const words=String(text||'');
 const names=(v.orders||[]).map(o=>o.name).filter(Boolean);
 return names.some(name=>words.includes(name))&&/(주세요|부탁|먹어|마셔|하나|한 잔|잔|주실|올려|넣어|골라|시켜|주문)/.test(words);
}

function storyBeforeOrder(v){
 const lines=Array.isArray(v.dialogue)?v.dialogue:[];
 // A changed order also replaces its dependent follow-up lines (such as
 // "없으면 평소 레시피로 주세요"). Otherwise the remaining dialogue can contradict
 // the actual randomly selected order. Personal conversation is kept intact.
 const result=[];
 let removedOrder=false;
 for(const entry of lines){
  const text=String(entry?.[1]||'').trim();
  if(menuOrderLine(v,text)){removedOrder=true;continue;}
  const dependent=removedOrder&&/^(?:없으면|그게 없으면|그 재료가 없으면|재료가 없으면|안 되면|어려우면|불가능하면|그렇지 않으면|그럼|그러면|대신|아니면|원래대로|평소대로|평소 레시피|기본 레시피|그것도|그것만|그걸|그것|그렇게|추가 재료는|토핑은|장식은)/.test(text)
   &&/(?:주세요|부탁|괜찮|만들|해주|해 주|넣어|올려|먹|마실|레시피|재료|토핑|장식|대신|없으면|원래대로)/.test(text);
  if(dependent)continue;
  // Narrative dialogue unrelated to the replaced order breaks the dependency.
  removedOrder=false;
  result.push(entry);
 }
 return result;
}

function withChangedOrder(v, lines, orders, after){
 return {...v,dialogue:[...storyBeforeOrder(v),...lines],orders,
  ...(after?{after}:{} )};
}

// Change exactly one requested item; preserve all other drinks/foods and their quantities.
// When a variable-order branch replaces a drink with a dish (or vice versa),
// preserve the visitor's personal epilogue while correcting its meal verb.
function mzServingReactionForKind(lines,kind){
 const switches=kind==='food'?
  [['잘 마셨습니다','잘 먹었습니다'],['잘 마셨어요','잘 먹었어요'],['잘 마셨네요','잘 먹었네요']]:
  [['잘 먹었습니다','잘 마셨습니다'],['잘 먹었어요','잘 마셨어요'],['잘 먹었네요','잘 마셨네요']];
 return (lines||[]).map(([who,line])=>{
  let updated=String(line||'');
  for(const [from,to] of switches)updated=updated.split(from).join(to);
  return [who,updated];
 });
}

function withReplacedMenuOrder(v,lines,newOrder,replacedType){
 const original=Array.isArray(v.orders)?v.orders:[];
 const index=original.findIndex(o=>o.type===replacedType);
 if(index<0){
  // A single fallback can change kind (e.g. the DAY 11 customer's drink
  // becomes a player-made snack). Do not silently keep the old drink order.
  if(original.length===1){
   const result=withChangedOrder(v,lines,[newOrder]);
   return original[0].type===newOrder.type?result:{...result,after:mzServingReactionForKind(result.after,newOrder.type)};
  }
  const retained=original.length?[[v.who,'그리고 '+original.map(o=>o.name).join(', ')+'도 부탁할게요.']]:[];
  return withChangedOrder(v,[...lines,...retained],[...original,newOrder]);
 }
 const orders=original.map((o,i)=>i===index?newOrder:o);
 const remaining=original.filter((o,i)=>i!==index);
 const rest=remaining.length?[[v.who,'그리고 '+remaining.map(o=>o.name).join(', ')+'도 부탁할게요.']]:[];
 return withChangedOrder(v,[...lines,...rest],orders);
}

function orderTemplate(v,kind,name,day,index){
 const options=customOrderTemplates[kind];
 return [v.who,options[Math.floor(seedPick(s,day,index,970+(kind==='food'?1:0))*options.length)](name)];
}

function customOrderLines(v,recipe,day,index,amount){
 const lines=[orderTemplate(v,recipe.kind,recipe.name,day,index)];
 if(recipe.kind==='drink')lines.push([v.who,amount===0?'얼음은 빼주세요.':`얼음은 ${amount}회 넣어 주세요.`]);
 else lines.push([v.who,`추가로 ${amount}번 더 가열해 주세요.`]);
 return lines;
}

// Older patches call this helper for DAY 10. Its name is preserved for safety.
function keepDayTenIntro(original,orderDialogue){return [...storyBeforeOrder(original),...orderDialogue]}

function mzSpecialMenuChoices(source,day=s.day){
 return (s.customRecipes||[]).filter(r=>{
  if(!r||!r.registered||!r.name||!['drink','food'].includes(r.kind)||
    (source==='market'?r.source!=='market':r.source==='market'))return false;
  if(r.source==='market'&&!(r.required||[]).every(id=>hasMarketItem(id)))return false;
  if(r.kind==='drink')return !!r.seq&&(!r.extra||unlockedGarnishes().some(g=>g.id===r.extra));
  if(r.foodKind==='비가열'&&!mzNonheatUnlocked())return false;
  const spec=foodRecipeSpec(r);return !!spec&&(!spec.addons||spec.addons.every(id=>hasMarketItem(id)))&&(spec.kind!=='튀김'||day>=10);
 });
}

function mzOptionalSpecialOrder(v,day,index,source){
 const choices=mzSpecialMenuChoices(source,day).filter(r=>!v.optionalSpecialKind||r.kind===v.optionalSpecialKind);if(!choices.length)return v;
 const recipe=choices[Math.floor(seedPick(s,day,index,729)*choices.length)];
 const order=recipe.kind==='drink'?{type:'drink',name:recipe.name,custom:recipe.source!=='market',iceCount:0}:
  {type:'food',name:recipe.name,custom:recipe.source!=='market',addons:(recipe.addons||[]).slice()};
 const before=storyBeforeOrder(v);
 const introTemplates=MZ_SPECIAL_ORDER_INTROS[source];
 const intro=introTemplates[Math.floor(seedPick(s,day,index,733)*introTemplates.length)](recipe.name,recipe.kind);
 const originalOrders=v.orders||[];const replaceIndex=originalOrders.findIndex(o=>o.type===order.type);
 // Single-item conditional orders replace their fallback even if the kind changes.
 const replacementIndex=replaceIndex>=0?replaceIndex:(originalOrders.length===1?0:-1);
 const existingOtherOrders=originalOrders.filter((o,i)=>i!==replacementIndex);
 const extra=existingOtherOrders.length?[[v.who,'그리고 '+existingOtherOrders.map(o=>o.name).filter(Boolean).join(', ')+'도 부탁할게요.']]:[];
 // Preserve authored, character-specific after-dialogue; only update reactions that are
 // clearly the replaceable generic meal acknowledgment on an ordinary one-off visitor.
 const generic=/^(?:잘 먹었습니다\.?|잘 마셨습니다\.?|맛있네요\.?|좋네요\.?)$/;
 const originalAfter=Array.isArray(v.after)?v.after:[];
 const standalone=originalAfter.length===1&&generic.test(String(originalAfter[0]?.[1]||''))&&
  !['카이렌','리안','인근 직장인','정기 화물 기사','황무지 출신 정착민','마렌','토르반','야간 정비사'].includes(v.who);
 const afterBase=standalone?[[v.who,MZ_SPECIAL_ORDER_REACTIONS[recipe.kind][Math.floor(seedPick(s,day,index,741)*MZ_SPECIAL_ORDER_REACTIONS[recipe.kind].length)]]]:originalAfter;
 const after=originalOrders.length===1&&originalOrders[0].type!==recipe.kind?mzServingReactionForKind(afterBase,recipe.kind):afterBase;
 return {...v,dialogue:[...before,[v.who,intro],...extra],orders:[...existingOtherOrders,order],after};
}

// General purpose scripted order variants. Put optionalSpecialSource on any visit
// rather than adding each future DAY to a numeric switch. Custom variants always
// use available, registered recipes; fallback preserves the authored order.
// DAY 20: select only available market DRINK recipes; keep the guest's no-ice
// preference and their personally authored after-serving dialogue unchanged.
function mzDay20SettlerMarketDrink(v,day,index){
 const choices=mzSpecialMenuChoices('market',day).filter(r=>r.kind==='drink');
 if(!choices.length)return v;
 const recipe=choices[Math.floor(seedPick(s,day,index,2020)*choices.length)];
 const dialogue=v.dialogue.map(line=>line.slice());
 const last=dialogue.findIndex(line=>String(line[1]).includes('게이트 라이트 한 잔 부탁드려요'));
 if(last>=0)dialogue[last][1]=`저는 ${recipe.name} 한 잔 부탁드려요. 얼음은 빼주세요.`;
 return {...v,dialogue,orders:[{type:'drink',name:recipe.name,iceCount:0}]};
}

// A reusable manufacturing-method request for ordinary visits that opt in.
// It is seeded per save slot and only replaces a named DRINK in the selected
// guest's existing order. Story dialogue, food orders and post-serving lines remain.
// Future days may set optionalMethodVariant:true on a non-story guest.
function mzRandomMethodOrderVariant(v,day,index){
 if(!v.optionalMethodVariant||!Array.isArray(v.orders))return v;
 // Keep named orders on some playthroughs: method-only requests should not
 // overwhelm the day's usual named/menu/ingredient/food orders.
 if(seedPick(s,day,index,2250)>=0.60)return v;
 const orderIndex=v.orders.findIndex(o=>o.type==='drink'&&o.name&&!o.anyMenu&&!o.ingredientRequest&&!o.flavorRequest);
 if(orderIndex<0)return v;
 const original=v.orders[orderIndex];
 const lineIndex=(v.dialogue||[]).findIndex(entry=>{
  const text=String(entry?.[1]||'');
  const namePos=text.indexOf(original.name);
  return namePos>=0&&text.lastIndexOf('음료는',namePos)>=0;
 });
 if(lineIndex<0)return v;
 const candidates=mzAnyDrinkCandidates().filter(d=>{
  if(!d?.seq||!['layer','mix','partial'].includes(d.mode)||
    (d.unlockDay&&day<d.unlockDay))return false;
  if(d.source==='market'&&!(d.required||[]).every(id=>hasMarketItem(id)))return false;
  if(d.extra&&!unlockedGarnishes().some(g=>g.id===d.extra))return false;
  return true;
 });
 const modes=['layer','mix','partial'].filter(mode=>candidates.some(d=>d.mode===mode));
 if(!modes.length)return v;
 const mode=modes[Math.floor(seedPick(s,day,index,2251)*modes.length)];
 const methods={
  layer:{name:'층 유지 음료',line:'음료는 재료를 섞지 않고 층이 나뉘어 보이는 걸로 한 잔 주세요. 메뉴는 아무거나 괜찮아요.'},
  mix:{name:'완전 혼합 음료',line:'음료는 재료를 전부 섞어 만든 걸로 한 잔 주세요. 메뉴는 아무거나 괜찮아요.'},
  partial:{name:'부분 혼합 음료',line:'음료는 일부만 섞고 나머지는 층으로 남기는 걸로 한 잔 주세요. 메뉴는 아무거나 괜찮아요.'}
 };
 const text=String(v.dialogue[lineIndex][1]);
 const head=text.slice(0,text.lastIndexOf('음료는',text.indexOf(original.name)));
 // Limit the automatic text replacement to a final drink clause. Anything
 // following the clause might be story dialogue and must not be discarded.
 if(!/^(?:음료는)\s*[^.!?]*[.!?]?\s*$/.test(text.slice(head.length)))return v;
 const dialogue=v.dialogue.map(([who,line],i)=>[who,i===lineIndex?head+methods[mode].line:line]);
 const orders=v.orders.map((o,i)=>i===orderIndex?
  {type:'drink',name:methods[mode].name,anyMenu:true,modePreference:mode}:o);
 return {...v,dialogue,orders};
}

// DAY 27 topping day: lock the chosen garnish for this playthrough once.
// No rerolls on customer switching, rendering, save/reload, or inventory updates.
function mzDay27TrendId(){
 if(s.day27TrendId&&garnishById(s.day27TrendId))return s.day27TrendId;
 const options=unlockedGarnishes().filter(g=>g&&g.id).map(g=>g.id);
 if(!options.length)return null; // Damaged save fallback: no invalid mandatory order.
 const id=options[Math.floor(seedPick(s,27,0,27027)*options.length)];
 s.day27TrendId=id;
 return id;
}

function mzDay27Variants(v,day,index){
 const id=mzDay27TrendId(),g=id?garnishById(id):null;
 const dialogue=(v.dialogue||[]).map(([who,line])=>{
  if(who!=='__D27_DYNAMIC__')return [who,line];
  const opts=v.day27LineVariants?.[Number(line)]||[];
  const selected=opts[Math.floor(seedPick(s,27,index,27100+Number(line))*opts.length)];
  // A damaged save without unlocked garnish remains playable.
  if(!g)return [selected?.[0]||v.who,'오늘은 평소 주문대로 부탁드릴게요.'];
  return [selected?.[0]||v.who,String(selected?.[1]||'').replaceAll('{T_NAME}',g.name)];
 });
 const orders=(v.orders||[]).map(o=>{
  const {D27,...item}=o;
  if(D27==='T')return g?{...item,requestedGarnish:id}:{...item,toppingRule:{none:true}};
  if(D27==='N')return {...item,toppingRule:{none:true}};
  return item;
 });
 return {...v,dialogue,orders,after:g?.id==='fire'&&v.day27FireAfter?v.day27FireAfter:v.after};
}

// DAY 28 single source of truth for menu-name substitutions and order objects.
// Snapshot-like deterministic resolution: same save seed, roster position and
// currently registered menus -> same selection. Menu editing is only available
// during closing, so it cannot mutate an actively served guest's selection.
function mzDay28Variants(v,day,index){
 const branch=v.day28Branch;
 if(!branch)return v;
 const choose=(source,kind,salt)=>{
  const choices=mzSpecialMenuChoices(source,day).filter(r=>r.kind===kind);
  return choices.length?choices[Math.floor(seedPick(s,day,index,salt)*choices.length)]:null;
 };
 let active=false,extra={},findAndReplace={};
 const menuOrders=v.orders.map(o=>({...o}));
 const replace=(at,recipe)=>{
  menuOrders[at]=recipe.kind==='drink'?{
   type:'drink',name:recipe.name,iceCount:0,custom:recipe.source!=='market'
  }: {
   type:'food',name:recipe.name,custom:recipe.source!=='market',addons:[...(recipe.addons||[])]
  };
 };
 switch(index){
  case 1:{
   const recipe=choose('market','drink',2802);
   if(recipe){active=true;findAndReplace.MARKET_DRINK_NAME=recipe.name;replace(0,recipe);}
   break;
  }
  case 3:{
   const recipe=choose('custom','food',2804);
   if(recipe){active=true;findAndReplace.CUSTOM_FOOD_NAME=recipe.name;replace(0,recipe);}
   break;
  }
  case 5:{
   const recipe=choose('custom','drink',2806);
   if(recipe){active=true;findAndReplace.CUSTOM_DRINK_NAME=recipe.name;replace(0,recipe);}
   break;
  }
  case 7:{
   // An eligible registered drink must exist, not merely the topping purchase.
   // This also future-proofs the order for other '연출적' garnishes.
   const hasVisual=mzSpecialMenuChoices('market',day).concat(mzSpecialMenuChoices('custom',day))
    .some(r=>r.kind==='drink'&&r.extra&&garnishById(r.extra)?.taste?.includes('연출적'));
   if(hasVisual){active=true;menuOrders[0]={type:'drink',name:'연출적 음료',anyMenu:true,flavorRequest:{require:['연출적']}};}
   break;
  }
  case 9:{
   const recipe=choose('market','food',2810);
   if(recipe){active=true;findAndReplace.MARKET_FOOD_NAME=recipe.name;replace(0,recipe);}
   break;
  }
  case 10:{
   const recipe=mzSpecialMenuChoices('market',day).find(r=>r.kind==='drink'&&r.name==='파이어 앤드 저스티스');
   if(hasMarketItem('fire')&&recipe){active=true;replace(0,recipe);}
   break;
  }
 }
 const sub=line=>String(line).replace(/\{(MARKET_DRINK_NAME|CUSTOM_FOOD_NAME|CUSTOM_DRINK_NAME|MARKET_FOOD_NAME)\}/g,(all,key)=>findAndReplace[key]??all);
 const intro=(branch.common||[]).concat(active?branch.A||[]:branch.B||[]).map(([who,line])=>[who,sub(line)]);
 const outro=(branch.afterCommon?.length?branch.afterCommon:(active?branch.afterA:branch.afterB)||[]).map(([who,line])=>[who,sub(line)]);
 return {...v,dialogue:intro,after:outro,orders:menuOrders};
}

function mzDay29Variants(v,day,index){
 if(!v.day29Branch)return v;
 const choices=mzSpecialMenuChoices(v.day29Branch==='marketFood'?'market':'custom',day)
  .filter(r=>r.kind===(v.day29Branch==='marketFood'?'food':'drink'));
 const choice=choices.length?choices[Math.floor(seedPick(s,day,index,2900+index)*choices.length)]:null;
 const active=!!choice, branches=v.day29BranchDialogue||{};
 const lines=(branches[active?'A':'B']||[]).map(([who,text])=>[who,String(text).replace(/\{MARKET_FOOD_NAME\}|\{CUSTOM_DRINK_NAME\}/g,choice?.name||'')]);
 const orders=v.orders.map(o=>({...o}));
 if(active){
  const i=v.day29VariantOrderIndex;
  orders[i]=choice.kind==='food'?{type:'food',name:choice.name,addons:[...(choice.addons||[])],custom:choice.source!=='market'}:{type:'drink',name:choice.name,custom:true,iceCount:0};
 }
 return {...v,dialogue:v.dialogue.concat(lines),orders};
}

function mzDay30Variants(v,day,index){
 if(!v.day30Branch)return v;
 const source=v.day30Branch==='marketFood'?'market':'custom';
 const kind=v.day30Branch==='customDrink'?'drink':'food';
 const pool=mzSpecialMenuChoices(source,day).filter(r=>r.kind===kind&&(v.day30Branch!=='marketFood'||r.name==='훈연 허브 버섯구이'));
 const recipe=pool.length?pool[Math.floor(seedPick(s,day,index,3030)*pool.length)]:null;
 const branch=v.day30BranchDialogue;
 if(!recipe)return {...v,dialogue:[...branch.common,...branch.B],after:branch.afterB};
 const token=v.day30Branch==='customDrink'?'{실제 커스텀 음료명}':'{현재 등록된 커스텀 안주명}';
 const text=(line)=>String(line).replaceAll(token,recipe.name);
 const recipeOrder=kind==='drink'?{type:'drink',name:recipe.name,custom:true,iceCount:0}:{type:'food',name:recipe.name,custom:recipe.source!=='market',addons:[...(recipe.addons||[])]};
 const orders=v.day30OrdersA.map(o=>({...o,addons:o.addons?[...o.addons]:undefined}));
 const target=orders.findIndex(o=>o.name.startsWith('{')||o.name==='훈연 허브 버섯구이');
 if(target>=0)orders[target]=recipeOrder;
 return {...v,dialogue:[...branch.common,...branch.A.map(([who,line])=>[who,text(line)])],after:branch.afterA,orders};
}

// DAY 31: Freeze one branch result for each visit until it is served.
// The saved market inventory / registered recipes are checked on resolution.
function mzDay31Variants(v,day,index){
 if(!v.day31Branch)return v;
 const b=v.day31Branch;
 let choices=mzSpecialMenuChoices(b.source,day).filter(r=>r.kind===b.kind);
 if(b.name)choices=choices.filter(r=>r.name===b.name);
 const recipe=choices.length?choices[Math.floor(seedPick(s,day,index,3131)*choices.length)]:null;
 if(!recipe)return v;
 const name=recipe.name;
 const dialogue=[...b.common,...b.A.map(([who,line])=>[who,String(line).replaceAll('{DAY31_SPECIAL_NAME}',name)])];
 const orders=b.ordersA.map(order=>{
   if(order.name!=='{DAY31_SPECIAL_NAME}')return {...order};
   return b.kind==='drink'?{type:'drink',name,custom:true,iceCount:0}:
     {type:'food',name,custom:true,addons:[...(recipe.addons||[])]};
 });
 return {...v,dialogue,orders};
}

function mzDay32Variants(v,day,index){
 if(!v.day32Branch)return v;
 const choose=(pool,salt)=>pool.length?pool[Math.floor(seedPick(s,day,index,salt)*pool.length)]:null;
 const b=v.day32Branch;
 let name=null,kind=null;
 if(index===4){
  const market=mzSpecialMenuChoices('market',day).filter(r=>r.kind==='drink');
  const preferred=market.find(r=>r.name==='그린 플로트')||market.find(r=>r.name==='앰버 누아르');
  const picked=preferred||choose(market,3205);
  if(picked){name=picked.name;kind=name==='그린 플로트'?'A':name==='앰버 누아르'?'B':'C';}
  else {kind='D';name='게이트 라이트';}
 }else if(index===11){
  const selected=choose(mzSpecialMenuChoices('market',day).filter(r=>r.kind==='drink'),3212);
  kind=selected?'A':'B';name=selected?.name||'프리즘';
 }else if(index===12){
  const selected=choose(mzSpecialMenuChoices('custom',day).filter(r=>r.kind==='drink'),3213);
  kind=selected?'A':'B';name=selected?.name||'오버 더 호라이즌';
 }else return v;
 const lines=(b.choices[kind]||[]).map(([speaker,line])=>[speaker,String(line).replaceAll('[실제 선택한 시장 음료명]',name||'').replaceAll('[선택한 시장 음료명]',name||'').replaceAll('[선택한 지점 한정 음료명]',name||'')]);
 const orders=index===4?[{type:'drink',name}]:index===11?[{type:'drink',name},{type:'food',name:'소금구이 꼬치'}]:[{type:'drink',name,iceCount:0,...(kind==='A'?{custom:true}:{})}];
 return {...v,dialogue:[...v.dialogue,...lines],orders};
}

function mzDay33Variants(v,day,index){
 if(!v.day33Special)return v;
 const source=v.day33Special.source;
 const choices=mzSpecialMenuChoices(source,day).filter(r=>r.kind==='drink');
 const recipe=choices.length?choices[Math.floor(seedPick(s,day,index,3300+index)*choices.length)]:null;
 if(!recipe)return v;
 const name=recipe.name;
 const suffix=index===9?'메뉴에 '+name+', 이런게 있네요. 이걸로 부탁드릴게요.':'여기서 만든 메뉴인가 봐요. '+name+' 한 잔 부탁드릴게요.';
 const lines=[...v.dialogue.slice(0,-1),[v.who,suffix]];
 const orders=[{type:'drink',name,custom:source==='custom'}];
 return {...v,dialogue:lines,orders};
}

// v322: Add an optional, *solvable* garnish request to randomized named drinks.
// Drinks have exactly one garnish slot. Never request a different topping when
// a named recipe (including a registered custom/market recipe) already requires one.
// Generic flavor/ingredient orders are excluded because their matching recipe
// is not fixed in advance and might have its own mandatory garnish.
function mzRandomDrinkGarnishRequest(order,recipe,day,index,salt,alreadyRolled=false){
 if(order?.type!=='drink'||order.anyMenu||order.flavorRequest||order.ingredientRequest||recipe?.extra)return null;
 const choices=unlockedGarnishes().filter(g=>g&&g.id&&g.name);
 if(!choices.length||(!alreadyRolled&&seedPick(s,day,index,salt)>=0.20))return null;
 return choices[Math.floor(seedPick(s,day,index,salt+1)*choices.length)]||null;
}

// DAY 34 random-order pilot. Reusable in the future endless mode.
// Only randomized visits receive this flag; all plot visits retain their authored orders.
// No random call is made without the saved randomSeed/day/visit index.
// v323: Generate validated, varied orders and phrase them as natural guest speech.
// All probabilities are independent deterministic rolls from saved seed/day/visit.
// Story orders are untouched. This same entry point can be reused in endless mode.
function mzRandomVisitOrder(v,day,index,config={}){
 if(!v.randomOrderV1)return v;
 const roll=salt=>seedPick(s,day,index,salt);
 const pick=(items,salt)=>items.length?items[Math.floor(roll(salt)*items.length)]:null;
 const drinkPool=drinks.filter(d=>d.name!=='선셋 로드'&&(!d.unlockDay||day>=d.unlockDay))
  .map(r=>({name:r.name,kind:'drink',source:'regular',recipe:r}));
 const sunset=mzSunsetRoadRecipe();
 if(sunset)drinkPool.push({name:'선셋 로드',kind:'drink',source:'story',recipe:sunset});
 const foodPool=availableFoods().map(r=>({name:r.name,kind:'food',source:'regular',recipe:r}));
 if((s.regularUnlocks||[]).includes('mechanic')&&mechanicRecipe.addons.every(hasMarketItem))
  foodPool.push({name:'훈연 바삭 꼬치',kind:'food',source:'story',recipe:mechanicRecipe});
 const specialPool=[...mzSpecialMenuChoices('market',day).map(r=>({name:r.name,kind:r.kind,source:'market',recipe:r})),
  ...mzSpecialMenuChoices('custom',day).map(r=>({name:r.name,kind:r.kind,source:'custom',recipe:r}))];
 const basePool=[...drinkPool,...foodPool];
 const customPool=specialPool.filter(x=>x.source==='custom');
 const marketPool=specialPool.filter(x=>x.source==='market');
 const customChance=config.customChance??(day===34?0.43:0.14);
 const iceChance=config.iceChance??0.43;
 const foodHeatChance=config.foodHeatChance??0.32;
 const foodAddonChance=config.foodAddonChance??0.32;
 const flavorChance=config.flavorChance??0.25;
 const ingredientChance=config.ingredientChance??0.17;
 const toppingChance=config.toppingChance??0.20;
 const countRoll=roll(4100);
 const count=countRoll<0.20?1:countRoll<0.84?2:3;
 // Mixed drink/food orders should be more common than a table ordering
 // exclusively drinks or exclusively food. Each decision stays seeded.
 const kinds=[];
 if(count===1){kinds.push(roll(4140)<0.55?'drink':'food');}
 else if(count===2){
  if(roll(4140)<0.72){kinds.push('drink','food');if(roll(4141)<0.5)kinds.reverse();}
  else {const k=roll(4141)<0.55?'drink':'food';kinds.push(k,k);}
 }else{
  if(roll(4140)<0.80){
   const lone=roll(4141)<0.55?'drink':'food';
   kinds.push(lone,lone==='drink'?'food':'drink',lone==='drink'?'food':'drink');
   const rotate=Math.floor(roll(4142)*3);for(let n=0;n<rotate;n++)kinds.push(kinds.shift());
  }else {const k=roll(4141)<0.55?'drink':'food';kinds.push(k,k,k);}
 }
 const orders=[],phrases=[],modifiers=[];
 const particle=(word,a,b)=>{
  const c=String(word).charCodeAt(String(word).length-1);
  return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28?a:b;
 };
 const iceWords=['얼음 빼 주세요','얼음 한 번 넣어 주세요','얼음 두 번 넣어 주세요','얼음 세 번 넣어 주세요'];
 const timeWords=['','한 번','두 번','세 번'];
 for(let j=0;j<count;j++){
  const salt=4200+j*37;
  const kindPref=kinds[j];
  const chance=roll(salt+2);
  const availableCustom=customPool.filter(x=>x.kind===kindPref);
  const availableMarket=marketPool.filter(x=>x.kind===kindPref);
  let pool=basePool.filter(x=>x.kind===kindPref);
  if(availableCustom.length&&chance<customChance)pool=availableCustom;
  else if(availableMarket.length&&chance<customChance+0.14)pool=availableMarket;
  let unused=pool.filter(x=>!orders.some(o=>o.name===x.name));
  if(!unused.length)unused=basePool.filter(x=>x.kind===kindPref&&!orders.some(o=>o.name===x.name));
  if(!unused.length)unused=basePool;
  const selected=pick(unused,salt+3);
  if(!selected)continue;
  const {kind}=selected,r=selected.recipe;
  const order={type:kind,name:selected.name};
  if(selected.source==='custom')order.custom=true;
  if(selected.source==='story'&&kind==='food')order.regularSpecial='mechanic';
  const recipeAddons=kind==='food'?[...(r.addons||[])]:[];
  if(recipeAddons.length)order.addons=[...recipeAddons];
  let phrase=selected.name+(kind==='drink'?' 한 잔':' 하나');
  const extras=[];
  // Create a condition only from the characteristics of an actual available
  // regular recipe. This prevents mutually impossible taste/ingredient demands.
  const variant=roll(salt+4);
  if(selected.source==='regular'&&variant<flavorChance){
   const tags=kind==='drink'?
    [...new Set([...r.seq].flatMap(k=>materialTags(k)?.taste||[]).concat(garnishById(r.extra)?.taste||[]))]:
    [...new Set([...(materialTags(r.base)?.taste||[]),...(materialTags(r.sauce)?.taste||[]),
     ...recipeAddons.flatMap(id=>marketCatalog.find(item=>item.id===id)?.tags||[])])];
   const eligible=tags.filter(t=>t!=='알코올'&&t!=='연출적');
   if(eligible.length){
    const tag=pick(eligible,salt+5);
    // Exclusion requests must use the sensory vocabulary of the ordered category.
    // Do not ask a drink to omit food-only tastes such as 매콤함.
    const categoryTasteTags=kind==='drink'?
     new Set([...Object.values(materialTagCatalog).flatMap(item=>item.taste||[]),
      ...garnishCatalog.flatMap(item=>item.taste||[])]):
     new Set([...v32FoodAtlas.flatMap(item=>item[2]||[]),
      ...foodMarketItems().flatMap(item=>item.tags||[])]);
    const excludedPool=['달콤함','매콤함','고소함','청량함','담백함','과실 향','허브 향']
     .filter(t=>categoryTasteTags.has(t)&&!tags.includes(t));
    const excluded=excludedPool.length&&roll(salt+6)<0.27?pick(excludedPool,salt+7):null;
    order.anyMenu=true;
    order.flavorRequest={require:[tag],...(excluded?{exclude:[excluded]}:{})};
    order.name=tag+' '+(kind==='drink'?'음료':'안주');
    phrase=excluded?`${excluded}${particle(excluded,'은','는')} 빼고 ${tag}${particle(tag,'이','가')} 느껴지는 ${kind==='drink'?'음료 한 잔':'안주 하나'}`:
     `${tag}${particle(tag,'이','가')} 느껴지는 ${kind==='drink'?'음료 한 잔':'안주 하나'}`;
   }
  }else if(kind==='drink'&&selected.source==='regular'&&variant<flavorChance+ingredientChance){
   const code=pick([...new Set(r.seq.split(''))],salt+8);
   if(code){
    order.ingredientRequest={require:[code]};
    const material=ingredients.find(x=>x[0]===code)?.[1];
    if(material){order.name=material+'가 들어간 음료';phrase=material+'가 들어간 음료 한 잔';}
   }
  }
  if(kind==='drink'){
   if(roll(salt+9)<iceChance){
    const max=day>=10?3:1;
    const n=Math.floor(roll(salt+10)*(max+1));
    order.iceCount=n;
    extras.push(iceWords[n]);
   }
   // A named drink with a mandatory topping uses its original garnish slot.
   // Flavor/ingredient requests do not have a fixed recipe, so never attach a
   // second garnish requirement to them.
   const fixedNamed=!order.anyMenu&&!order.flavorRequest&&!order.ingredientRequest;
   const garnish=fixedNamed&&roll(salt+13)<toppingChance?
    mzRandomDrinkGarnishRequest(order,r,day,index,salt+14,true):null;
   if(garnish){
    order.requestedGarnish=garnish.id;
    extras.unshift(`${garnish.name}${particle(garnish.name,'을','를')} 올려 주세요`);
   }
  }else{
   // Food recipes may already require addons. Keep those mandatory ingredients,
   // and request an optional addition only if a free slot remains (max two).
   // The order validator compares the explicit full addon list to preparation.
   if(!order.anyMenu&&!order.flavorRequest&&roll(salt+15)<foodAddonChance&&recipeAddons.length<2){
    const available=foodMarketItems().filter(item=>!recipeAddons.includes(item.id));
    const addon=pick(available,salt+16);
    if(addon){
     order.addons=[...recipeAddons,addon.id];
     extras.push(`${addon.name}${particle(addon.name,'을','를')} 추가해 주세요`);
    }
   }
   if(r.kind!=='비가열'&&r.foodKind!=='비가열'&&roll(salt+11)<foodHeatChance){
    const heat=1+Math.floor(roll(salt+12)*3);
    order.heat=heat;
    extras.push(`${timeWords[heat]} 더 가열해 주세요`);
   }
  }
  phrases.push(phrase);
  if(extras.length){
   // Remember the order index, not the absolute ordinal: numbering is by
   // drink/food category and is only needed for unnamed conditional orders.
   const part=extras.map((word,i)=>i===extras.length-1?word:word.replace(/ 주세요$/,' 주시고')).join(' ');
   modifiers.push({orderIndex:orders.length,needsCategoryRef:!!(order.anyMenu||order.ingredientRequest),name:selected.name,part});
  }
  orders.push(order);
 }
 // Resolve references only after all orders are built, so a single food in
 // a mixed drink+food order is called '안주', never '2번째 안주'.
 const koreanOrdinals=['첫 번째','두 번째','세 번째'];
 const modifierText=modifiers.map(m=>{
  const o=orders[m.orderIndex];
  const kind=o.type;
  const sameKind=orders.filter(x=>x.type===kind);
  const ordinal=orders.slice(0,m.orderIndex+1).filter(x=>x.type===kind).length-1;
  const category=kind==='drink'?'음료':'안주';
  const ref=m.needsCategoryRef?(sameKind.length===1?category:`${koreanOrdinals[ordinal]||`${ordinal+1}번째`} ${category}`):m.name;
  return `${ref}에는 ${m.part}.`;
 });
 // Never expose debugging parentheses or internal fields to customers.
 const baseLine=phrases.length===1?`${phrases[0]} 주세요.`:
  (phrases.length===2?phrases.join('하고 '):phrases.slice(0,-1).join(', ')+'하고 '+phrases.at(-1))+' 주세요.';
 const suffix=modifierText.length?' '+modifierText.join(' '):'';
 const orderLine=(roll(4999)<0.5?'그럼 ':'')+baseLine+suffix;
 return {...v,dialogue:[...v.dialogue.slice(0,-1),[v.who,orderLine]],orders,after:v.after.map(pair=>[...pair])};
}

// DAY 36: condition-locked 4-person filming challenge. Names and toppings resolve
// from existing player recipes and inventory; no future market items are exposed.
function mzDay36Mukbang(v,day,index){
 const pick=(items,salt)=>items.length?items[Math.floor(seedPick(s,day,index,salt)*items.length)]:null;
 const specials=(source,kind)=>mzSpecialMenuChoices(source,day).filter(r=>r.kind===kind);
 const userDrink=pick(specials('custom','drink'),3601),userFood=pick(specials('custom','food'),3602);
 const market=(name)=>mzSpecialMenuChoices('market',day).find(r=>r.name===name)||null;
 const garnishes=unlockedGarnishes().filter(g=>g&&g.id&&g.id!=='fire');
 function baseDrink(name,iceCount,salt){
  const garnish=pick(garnishes,salt);
  return {type:'drink',name,iceCount,...(garnish?{requestedGarnish:garnish.id}:{})};
 }
 const registeredDrink=(r)=>({type:'drink',name:r.name,custom:true,iceCount:0});
 const registeredFood=(r)=>({type:'food',name:r.name,custom:true,addons:[...(r.addons||[])]});
 const marketDrink=(r)=>({type:'drink',name:r.name,iceCount:0});
 const marketFood=(r)=>({type:'food',name:r.name,addons:[...(r.addons||[])]});
 const aDrink=userDrink?registeredDrink(userDrink):baseDrink('프리즘 믹스',0,3611);
 const aFood=userFood?registeredFood(userFood):{type:'food',name:'스파이시 그릴 미트'};
 // Both recipes are earned upon completing the DAY35 freight-driver story.
 const aRaw={type:'food',name:'육회'};
 const berry=market('베리 피즈'),green=market('그린 플로트'),amber=market('앰버 누아르');
 const rice=market('제육볶음밥'),curry=market('스파이시 카레 우동');
 const bDrink=berry?marketDrink(berry):baseDrink('루비 라인',3,3621);
 const bFood=rice?marketFood(rice):{type:'food',name:'칠리 버섯볶음'};
 const cDrink=green?marketDrink(green):baseDrink('블루 아워',0,3631);
 const cRaw={type:'food',name:'샐러드'};
 const dDrink=amber?marketDrink(amber):baseDrink('라스트 마일',2,3641);
 const dFood=curry?marketFood(curry):{type:'food',name:'매운탕'};
 const all=[
   [aDrink,aFood,aRaw,{type:'food',name:'양념 치킨'}],
   [bDrink,bFood,{type:'food',name:'허브구이 감자'}],
   [cDrink,cRaw,{type:'food',name:'피쉬 커틀릿'},{type:'food',name:'소금구이 꼬치'}],
   [dDrink,dFood,{type:'food',name:'허니 팬케이크'}]
 ];
 const line=(id,orders)=>{
  const list=orders.map(o=>o.name).join(', ');
  const drink=orders.find(o=>o.type==='drink');
  let mods='';
  if(drink?.requestedGarnish)mods+=' 음료에는 '+garnishById(drink.requestedGarnish).name+'도 올려주세요.';
  if(drink&&Number.isInteger(drink.iceCount)&&!market(drink.name)&&!userDrink?.name?.includes(drink.name)){
   mods+=drink.iceCount===0?' 얼음은 빼주세요.':' 얼음은 '+drink.iceCount+'번 넣어주세요.';
  }
  return [id, '저는 '+list+' 주세요!'+mods];
 };
 const dialogue=[
 ['참가자 A','안녕하세요! 여기서 촬영 좀 해도 될까요? 다른 손님은 안 나오게 할게요.'],
 ['참가자 B','전에 여기 소개하는 영상 봤거든요. 저희도 이 지점 메뉴로 먹방 챌린지를 해 보려고요.'],
 ['참가자 C','특이한 음료랑 새 메뉴 위주로 골랐어요. 한꺼번에 주문해도 괜찮을까요?'],
 line('참가자 A',all[0]),line('참가자 B',all[1]),line('참가자 C',all[2]),line('참가자 D',all[3]),
 ['참가자 A','하하! 이렇게 잔뜩 상을 채우는 게 또 챌린지의 재미지!']
 ];
 return {...v,dialogue,orders:all.flat(),after:[
 ['참가자 A','와, 다 나왔다! 그럼 촬영 시작할게요!'],
 ['참가자 B','잠깐, 벌써 하나 먹은 거 아니야?'],
 ['참가자 A','맛만 본 거야. 시청자 여러분들 안녕하세요!'],
 ['참가자 D','그럼 나도 팬케이크 한 조각 먹을래.'],
 ['참가자 C','야, 제대로 인트로하고 먹으라고!']
 ]};
}

// DAY38 conditional visits: keep player-inventory-dependent orders deterministic.
function mzDay38Variants(v,day,index){
 if(v.day38RandomGarnish){
  const available=unlockedGarnishes().filter(g=>g&&g.id&&g.id!=='fire');
  if(!available.length){
   const dialogue=v.dialogue.map(([who,line])=>[who,line.replace('그리고, 위에 (랜덤 토핑) 하나 올려주세요.','')]);
   return {...v,dialogue};
  }
  const item=available[Math.floor(seedPick(s,day,index,3801)*available.length)];
  return {...v,
   dialogue:v.dialogue.map(([who,line])=>[who,line.replace('(랜덤 토핑)',item.name)]),
   orders:v.orders.map((o,i)=>i===0?{...o,requestedGarnish:item.id}:o)};
 }
 if(v.day38RiceFallback){
  // Market rice may be unpurchased; never give an unsatisfiable food order.
  const found=availableFoods().some(f=>f.name==='제육볶음밥');
  if(!found){
   const required=mzSpecialMenuChoices('market',day).some(r=>r.name==='제육볶음밥'&&r.kind==='food');
   if(!required)return {...v,dialogue:v.dialogue.map(([who,line])=>[who,line.replace('제육볶음밥','가든 야채스프')]),orders:v.orders.map(o=>o.name==='제육볶음밥'?{...o,name:'가든 야채스프'}:o)};
  }
 }
 if(v.day38CustomFood){
  const all=mzSpecialMenuChoices('custom',day);
  const recipes=all.filter(r=>r.kind==='food');
  const pool=recipes.length?recipes:all;
  const chosen=pool.length?pool[Math.floor(seedPick(s,day,index,3802)*pool.length)]:null;
  const name=chosen?chosen.name:'소금구이 꼬치';
  const dialogue=v.dialogue.map(([who,line])=>[who,line.replace('(사용자 커스텀 안주)',name)]);
  const orders=v.orders.map((o,i)=>i===1?{type:chosen?.kind==='drink'?'drink':'food',name,...(chosen?{custom:true,...(chosen.kind==='food'?{addons:[...(chosen.addons||[])]}:{})}:{})}:o);
  return {...v,dialogue,orders};
 }
 return v;
}

// DAY39: one saved trend for the whole day. Fire wins only when owned;
// otherwise choose from the player's actually unlocked garnishes.
function mzDay39TrendId(){
 if(s.day39TrendId && garnishById(s.day39TrendId))return s.day39TrendId;
 const available=unlockedGarnishes().filter(g=>g&&g.id);
 // At least sunfruit and citrus are available by DAY39.
 if(!available.length)return null;
 const id=available.some(g=>g.id==='fire')?'fire':available[Math.floor(seedPick(s,39,0,39039)*available.length)].id;
 s.day39TrendId=id;
 return id;
}

function mzDay39Variants(v,day,index){
 const id=mzDay39TrendId(),g=garnishById(id);
 const dialogue=(v.dialogue||[]).map(([who,line])=>[who,String(line).replaceAll('{유행 토핑}',g?.name||'오늘의 토핑')]);
 const after=(v.after||[]).map(([who,line])=>[who,String(line).replaceAll('{유행 토핑}',g?.name||'오늘의 토핑')]);
 const orders=(v.orders||[]).map(o=>{
  const {D39,...item}=o;
  return D39==='T'?{...item,requestedGarnish:id}:item;
 });
 return {...v,dialogue,after,orders};
}

function mzDay39MailText(value){
 const raw=String(value);
 if(!raw.includes('{유행 토핑}'))return raw;
 return raw.replaceAll('{유행 토핑}',garnishById(mzDay39TrendId())?.name||'오늘의 토핑');
}

// DAY40: resolve only inventory-dependent, reviewer-authored orders.
// Never unlock merchandise, change a standard recipe, or use an unregistered custom dish.
function mzDay40Variants(v,day,index){
 if(v.day40RandomGarnish){
  const available=unlockedGarnishes().filter(g=>g&&g.id);
  const chosen=available.length?available[Math.floor(seedPick(s,40,index,4001)*available.length)]:null;
  const name=chosen?.name||'시트러스 슬라이스';
  return {...v,
   dialogue:v.dialogue.map(([who,line])=>[who,String(line).replaceAll('(랜덤 토핑)',name)]),
   orders:v.orders.map((o,i)=>i===1?{...o,requestedGarnish:chosen?.id||'citrus'}:o)};
 }
 if(v.day40CustomDrink||v.day40CustomFood||v.day40MarketFood||v.day40MarketDrink){
  const market=!!(v.day40MarketFood||v.day40MarketDrink);
  const food=!!(v.day40CustomFood||v.day40MarketFood);
  const pool=mzSpecialMenuChoices(market?'market':'custom',day).filter(r=>r.kind===(food?'food':'drink'));
  const chosen=pool.length?pool[Math.floor(seedPick(s,40,index,4002)*pool.length)]:null;
  const fallback=food?'소금구이 꼬치':'게이트 라이트';
  const name=chosen?.name||fallback;
  const placeholder=market?(food?'(상점 해금 안주)':'(상점 해금 음료)'):(v.day40CustomFood?'(사용자 커스텀 안주)':v.who==='인근 직장인'?'(사용자 커스텀 메뉴)':'(사용자 커스텀 음료)');
  const orders=v.orders.map(o=>o.name===placeholder?{
   type:food?'food':'drink',name,
   ...(chosen?{custom:true,...(food?{addons:[...(chosen.addons||[])]}:{})}:{})
  }:o);
  return {...v,
   dialogue:v.dialogue.map(([who,line])=>[who,String(line).replaceAll(placeholder,name)]),
   after:v.after.map(([who,line])=>[who,String(line).replaceAll(placeholder,name)]),orders};
 }
 return v;
}

// DAY41 state-dependent orders. Do not change authored fixed recipes.
function mzDay41Variants(v,day,index){
 if(v.day41SushiBranch){
  const sushi=mzSpecialMenuChoices('market',day).some(r=>r.kind==='food'&&r.name==='초밥');
  return sushi?v:{...v,dialogue:v.day41SushiAltDialogue,orders:v.orders.map(o=>o.name==='초밥'?{type:'food',name:'생선구이'}:o)};
 }
 // 01: any ONE currently owned garnish is accepted; do not preselect a specific garnish.
 if(v.day41MildCustomFood||v.day41CustomFood||v.day41MarketDrink||v.day41MarketFood){
  const market=!!(v.day41MarketDrink||v.day41MarketFood);
  const food=!v.day41MarketDrink;
  const placeholder=market?(food?'(상점 해금 안주)':'(상점 해금 음료)'):'(사용자 커스텀 안주)';
  let choices=mzSpecialMenuChoices(market?'market':'custom',day).filter(r=>r.kind===(food?'food':'drink'));
  if(v.day41MildCustomFood){
   choices=choices.filter(r=>{
    const spec=foodRecipeSpec(r);
    return spec&&spec.sauce!=='매운 양념'&&!(spec.addons||[]).some(id=>marketCatalog.find(x=>x.id===id)?.tags?.includes('매콤함'));
   });
  }
  const chosen=choices.length?choices[Math.floor(seedPick(s,day,index,4102)*choices.length)]:null;
  const fallback=food?(v.day41MildCustomFood?'소금구이 꼬치':'허브구이 감자'):'게이트 라이트';
  const name=chosen?.name||fallback;
  const orders=v.orders.map(o=>o.name!==placeholder?o:{type:food?'food':'drink',name,...(chosen?{custom:chosen.source!=='market',...(food?{addons:[...(chosen.addons||[])]}:{})}:{})});
  return {...v,orders,
   dialogue:v.dialogue.map(([w,t])=>[w,String(t).replaceAll(placeholder,name)]),
   after:v.after.map(([w,t])=>[w,String(t).replaceAll(placeholder,name)])};
 }
 return v;
}

function mzDay43Variants(v,day,index){
 if(index===2){
  const choices=mzSpecialMenuChoices('market',day).filter(r=>r.kind==='food');
  const chosen=choices.length?choices[Math.floor(seedPick(s,day,index,4303)*choices.length)]:null;
  const name=chosen?chosen.name:'허브구이 감자';
  return {...v,dialogue:v.dialogue.map(([who,line])=>[who,line.replace('(상점 해금 안주)',name)]),orders:[{type:'food',name,...(chosen?.addons?{addons:[...chosen.addons]}:{})}]};
 }
 if(index===3){
  const choices=mzSpecialMenuChoices('custom',day);
  const chosen=choices.length?choices[Math.floor(seedPick(s,day,index,4304)*choices.length)]:null;
  if(!chosen){return {...v,dialogue:v.dialogue.map(([who,line])=>[who,line.replace('(사용자 커스텀 메뉴)','스파이시 그릴 미트')]),orders:[v.orders[0],{type:'food',name:'스파이시 그릴 미트'}]};}
  return {...v,dialogue:v.dialogue.map(([who,line])=>[who,line.replace('(사용자 커스텀 메뉴)',chosen.name)]),orders:[v.orders[0],{type:chosen.kind,name:chosen.name,custom:true,...(chosen.kind==='food'?{addons:[...(chosen.addons||[])]}:{})}]};
 }
 if(index===4&&!hasMarketItem('rice')){
  // DAY43: the market rice addon is optional; never request an unavailable recipe.
  return {...v,
   dialogue:v.dialogue.map(([who,line])=>[who,line.replace('난 제육볶음밥. 음료도 하나 마셔야지.','난 스파이시 그릴 미트. 음료도 하나 마셔야지.')]),
   orders:v.orders.map(o=>o.type==='food'&&o.name==='제육볶음밥'?{type:'food',name:'스파이시 그릴 미트'}:o)};
 }
 if(index===8){return {...v,orders:[v.orders[0],{type:'drink',name:'추천 음료',anyMenu:true}]};}
 if(index===10){return {...v,orders:[{type:'food',name:'달콤한 안주',anyMenu:true,flavorRequest:{require:['달콤함']}}]};}
 if(index===12){if(hasMarketItem('rice'))return v;
  return {...v,dialogue:v.dialogue.map(([who,line])=>[who,line.replace('혹시 여기에 공깃밥 하나도 주실 수 있나요?','이거 따뜻하게 부탁드릴게요.')]),orders:[{type:'food',name:'가든 야채스프'}]};}
 return v;
}

function mzResolveVisitVariants(v,day,index){
 if(day===43)return mzDay43Variants(v,day,index);
 if(day===41)return mzDay41Variants(v,day,index);
 if(day===40)return mzDay40Variants(v,day,index);
 if(day===39)return mzDay39Variants(v,day,index);
 if(day===38)return mzDay38Variants(v,day,index);
 if(day===36&&v.day36Mukbang)return mzDay36Mukbang(v,day,index);
 if(v.randomOrderV1)return mzRandomVisitOrder(v,day,index);
 if(day===33)return mzDay33Variants(v,day,index);
 if(day===32)return mzDay32Variants(v,day,index);
 if(day===31)return mzDay31Variants(v,day,index);
 if(day===30)return mzDay30Variants(v,day,index);
 if(day===29)return mzDay29Variants(v,day,index);
 if(day===28)return mzDay28Variants(v,day,index);
 if(day===27)return mzDay27Variants(v,day,index);
 if(day===26&&index===7&&v.day26MarketDrink){
   const options=mzSpecialMenuChoices('market',day).filter(r=>r.kind==='drink');
   const recipe=options.length?options[Math.floor(seedPick(s,day,index,2608)*options.length)]:null;
   const name=recipe?recipe.name:'게이트 라이트';
   const dialogue=v.dialogue.map(pair=>[pair[0],pair[1].replace('(선택 메뉴)',name)]);
   return {...v,dialogue,orders:[{type:'drink',name,iceCount:2,...(recipe?{custom:false}:{})},{type:'food',name:'허브구이 감자'}]};
 }

 if(day===25&&v.day25MechanicUnlocked){const r=(s.regularUnlocks||[]).includes('mechanic')?v.day25MechanicUnlocked:null;return r?{...v,dialogue:r.dialogue,after:r.after,orders:r.orders}:v;}

 if(day===22&&v.day22NoRiceDialogue&&!hasMarketItem('rice'))return {...v,dialogue:v.day22NoRiceDialogue,orders:[{type:'food',name:'스파이시 그릴 미트'},{type:'drink',name:'게이트 라이트'}]};
 if(day===20&&v.optionalMarketDrinkNoIce)return mzDay20SettlerMarketDrink(v,day,index);
 if(day===17&&v.who==='먹방 인플루언서')return mzDay17Mukbang(v,index);
 if(v.optionalSpecialSource){return mzOptionalSpecialOrder(v,day,index,v.optionalSpecialSource);}
 if(v.optionalMethodVariant)return mzRandomMethodOrderVariant(v,day,index);
 if(day===16&&v.who==='야간 정비사')return mzDay16Mechanic(v);
 if(day===17&&v.day17Garnish){
  const available=unlockedGarnishes().filter(g=>hasMarketItem(g.id));
  if(!available.length)return v;
  const item=available[Math.floor(seedPick(s,day,index,81)*available.length)];
  return {...v,dialogue:[[v.who,'배송 경로가 바뀌는 바람에 골목을 두 번이나 돌았어요.'],[v.who,`블루 아워에 ${item.name} 올려주시고, 소금구이 꼬치 하나 주세요.`]],orders:[{type:'drink',name:'블루 아워',requestedGarnish:item.id},{type:'food',name:'소금구이 꼬치'}]};
 }
 return v;
}

function mzDay16Mechanic(v){
 if(v.who!=='야간 정비사')return v;
 const hasCrisp=hasMarketItem('crisp');
 const preference=hasCrisp?'매콤하고 바삭하며 달지 않은 안주':'매콤하고 달지 않은 안주';
 return {...v,
  dialogue:[[v.who,'안녕하세요. 오늘은 조금 일찍 끝났어요.'],[v.who,'오늘은 메뉴 이름 대신 제가 좋아하는 맛으로 부탁드려도 될까요?'],[v.who,hasCrisp?'매콤하고 바삭한 안주가 좋겠어요. 단맛은 빼 주시고요. 음료는 루비 라인에 얼음을 넉넉히 넣어주세요.':'매콤한 안주로 부탁드려요. 단맛은 빼 주시고요. 음료는 루비 라인에 얼음을 넉넉히 넣어주세요.']],
  orders:[{type:'food',name:preference,flavorRequest:{require:hasCrisp?['매콤함','바삭함']:['매콤함'],exclude:['달콤함']}},{type:'drink',name:'루비 라인',iceCount:3}]};
}

// DAY 17: preserve the full eight-item filming order while varying the two special snacks.
// All menu names and preparation constraints are resolved from the player's actual saved unlocks.
function mzDay17Mukbang(v,index){
 const who=v.who, day=17;
 const fixedFoods=['소금구이 꼬치','칠리 버섯볶음','허브구이 감자'];
 const marketFoods=mzSpecialMenuChoices('market',day).filter(r=>r.kind==='food');
 const customFoods=mzSpecialMenuChoices('custom',day).filter(r=>r.kind==='food');
 const choose=(pool,salt)=>pool.length?pool[Math.floor(seedPick(s,day,index,salt)*pool.length)]:null;
 const market=choose(marketFoods,1771), custom=choose(customFoods,1772);
 const marketOrder=market?{type:'food',name:market.name,custom:false,addons:(market.addons||[]).slice()}:{type:'food',name:'허니 팬케이크'};
 const customOrder=custom?{type:'food',name:custom.name,custom:true,addons:(custom.addons||[]).slice()}:{type:'food',name:'스파이시 그릴 미트'};
 const garnishChoices=unlockedGarnishes().filter(g=>g&&g.id&&g.name);
 const garnish=choose(garnishChoices,1773);
 const garnishDrink={type:'drink',name:'프리즘 믹스',iceCount:0,...(garnish?{requestedGarnish:garnish.id}:{})};
 const foods=[...fixedFoods.map(name=>({type:'food',name})),marketOrder,customOrder];
 const drinks=[{type:'drink',name:'게이트 라이트'},{type:'drink',name:'블루 아워'},garnishDrink];
 const foodLine=`안주는 ${foods.map(o=>o.name).join(', ')}까지 다섯 접시요.`;
 const specialLine=market&&custom?'시장 신메뉴랑 여기서 직접 개발한 메뉴도 넣어 봤어요. 메뉴 종류가 참 많네요!':market?'시장 신메뉴도 있네요. 지점 한정 안주는 다음에 도전해볼게요.':custom?'지점에서 만든 안주도 시켜볼게요. 시장 신메뉴는 다음번에 먹어보죠.':'오늘은 기본 메뉴를 골고루 먹어보려고요.';
 const drinkLine=garnish?`음료는 게이트 라이트, 블루 아워, 프리즘 믹스 세 잔이요. 프리즘 믹스에는 ${garnish.name} 올려주시고 얼음은 빼주세요.`:'음료는 게이트 라이트, 블루 아워, 프리즘 믹스 세 잔 주세요. 프리즘 믹스에는 얼음을 빼주세요.';
 return {...v,dialogue:[...v.dialogue.slice(0,2),[who,foodLine],[who,specialLine],[who,drinkLine],[who,'여덟 가지 모두 준비되면 한 번에 부탁드릴게요!']],orders:[...foods,...drinks]};
}

function todayVisits(){
 const base=dailyVisits[s.day]||[];
 if(s.day===21){const accepted=(s.weekendStoriesDone||[]).includes('maren_market');const adjusted=base.map(v=>v.who==='마렌'?{...v,dialogue:accepted?[["마렌","어머, 안녕하세요! 주말에 같이 돌아다녔던 게 아직도 생생하네요."],["마렌","사진은 잘 챙겨 두셨어요? 저도 집에 두고 가끔 보고 있어요. 히히."],["마렌","오늘은 새 생선 메뉴가 궁금해요. 생선구이하고 게이트 라이트 부탁할게요."]]:v.dialogue}:v);return adjusted.map((v,i)=>mzResolveVisitVariants(v,s.day,i));}

 if(s.day>=13)return base.map((v,i)=>mzResolveVisitVariants(v,s.day,i));
 if(s.day===11)return dayElevenVariants(base);
 if(s.day===12)return dayTwelveVariants(base);
 // DAY 07: market opens only after closing; no market-dependent orders before closing.
 if(s.day===7)return base;
 if(s.day===8){const key=(s.ownedMarket||[]).slice().sort().join('|');if(dayEightCache&&dayEightCacheKey===key)return dayEightCache;dayEightCacheKey=key;return dayEightCache=base.map(v=>{
  if(!v.mechanicVariant)return v;
  if(!hasMarketItem('smoke')||!hasMarketItem('crisp'))return v;
  return {...v,dialogue:[...storyBeforeOrder(v), ["야간 정비사", "어, 여기 스모크 에센스랑 크리스피 플레이크도 들여놓으셨네요."], ["야간 정비사", "혹시 그때 말했던 음식을 한번 만들어 주실 수 있을까요? 훈연 향이 나는 꼬치에 바삭한 토핑을 올려서요."]],orders:[{type:'food',name:'훈연 바삭 꼬치',addons:['smoke','crisp'],regularSpecial:'mechanic'}],after:[["야간 정비사", "……잠깐만요. 이 냄새. 이 맛..."], ["야간 정비사", "...그 식당에서 먹던 게 딱 이런 느낌이었는데."], ["야간 정비사", "그 집은 정비소에서 조금만 걸으면 나오는 곳이었어요. 야간 점검이 끝나면 거기서 꼭 뭔가를 먹고 돌아가곤 했죠."], ["야간 정비사", "지금 먹는 건 그때 그 음식이랑 똑같지는 않아요. 그래도 이상하네요. 문을 열고 들어가던 길이며, 그때 들리던 소리까지 생각나서……"], ["야간 정비사", "예전에 한 번 얘기한 걸 기억해 주신 거잖아요. 정말 고맙습니다. 오늘은 오래 기억할 것 같아요."]],afterBad:[["야간 정비사", "아, 제가 말씀드린 바삭한 토핑이랑 훈연 향은 조금 부족한 것 같네요."], ["야간 정비사", "그래도 이렇게 만들어 주시려고 한 게 고마워요. 다음에 또 부탁드려도 될까요?"]]};
 });}
 if(s.day===9){
  // A single stored playthrough seed + current inventory determines optional requests.
  // Do not reroll when rendering, saving, or reopening panels.
  const inventory=(s.ownedMarket||[]).slice().sort();
  return base.map((v,i)=>{
   if(v.who==='야간 정비사')return mechanicExtraOrder(v);
   if(v.marketGarnishVariant){
     const choices=['cherry','mint'].filter(id=>inventory.includes(id));
     if(!choices.length)return {...v,dialogue:keepDayTenIntro(v,[[v.who,'루비 라인 한 잔 부탁해요. 오늘은 음료 색이 예쁜 걸 마시고 싶어요.']]),after:[[v.who,'잘 마셨습니다. 다음에는 다른 장식도 구경하고 싶네요.']]};
     const id=choices[Math.floor(seedPick(s,9,i,1)*choices.length)],name=garnishById(id).name;
     return {...v,dialogue:keepDayTenIntro(v,[[v.who,'혹시 '+name+'도 있나요? 루비 라인에 그걸 올려주시면 좋겠어요.']]),orders:[{type:'drink',name:'루비 라인',ice:false,requestedGarnish:id}],after:[[v.who,'위에 올린 '+name+', 참 예쁘네요. 감사합니다.']]};
   }
   if(v.randomAddonVariant){
     const choices=['smoke','crisp','spiceoil','curry'].filter(id=>inventory.includes(id));
     if(!choices.length)return {...v,dialogue:keepDayTenIntro(v,[[v.who,'스파이시 그릴 미트 하나 부탁해요.']]),after:[[v.who,'이제 충전기 찾아야겠네요. 잘 먹었습니다.']]};
     // Some customers request extras, but not every eligible visitor does.
     if(seedPick(s,9,i,3)<0.25)return {...v,dialogue:keepDayTenIntro(v,[[v.who,'오늘은 평소대로 스파이시 그릴 미트 하나 주세요.']]),after:[[v.who,'잘 먹었어요. 이만 퇴근해야겠네요.']]};
     const id=choices[Math.floor(seedPick(s,9,i,2)*choices.length)],item=marketCatalog.find(m=>m.id===id);
     return {...v,dialogue:keepDayTenIntro(v,[[v.who,'스파이시 그릴 미트에 '+item.name+'도 추가해 주시겠어요? 오늘은 조금 다르게 먹어 보고 싶어서요.']]),orders:[{type:'food',name:'스파이시 그릴 미트',addons:[id]}],after:[[v.who,item.name+' 덕분에 평소랑 또 다르네요. 잘 먹었어요.']],afterBad:[[v.who,'추가 재료는 빠졌네요. 그래도 잘 먹었습니다. 다음에는 부탁드릴게요.']]};
   }
   return v;
  });
 }
 if(s.day===10){
  const inventory=(s.ownedMarket||[]).slice().sort();
  const key=inventory.join('|')+'@'+s.randomSeed+'@'+JSON.stringify((s.customRecipes||[]).filter(r=>r.source!=='market').map(r=>[r.name,r.kind,r.registered]));
  // Resolve once per playthrough and persist it across save/load and recipe unlock.
  if(typeof s.dayTenMechanicScheduled!=='boolean'){
   const dayTenHadMechanic=(Array.isArray(s.guestClues)&&s.guestClues.some(c=>c.who==='야간 정비사'&&c.day===10&&c.tags?.includes('훈연 향')));
   s.dayTenMechanicScheduled=mechanicQuestAvailable()||dayTenHadMechanic||s.visit>=base.length;
  }
  const rosterKey=key+'@mechanic:'+s.dayTenMechanicScheduled;
  if(dayTenCache&&dayTenCacheKey===rosterKey)return dayTenCache;
  dayTenCacheKey=rosterKey;
  const dayTenBase=s.dayTenMechanicScheduled?base.concat([mechanicExtraOrder(dayTenMechanicVisit(),true)]):base;
  return dayTenCache=dayTenBase.map((v,i)=>{
    // 10th shift: repeat orders for a player-created menu, with optional variations.
    // Random selections depend on saved seed and inventory, not redraws.
    if(i===6){
      // Keep the named regulars' authored day-10 order and story intact.
      if(!authoredMenuRecipes().some(r=>r.kind==='food'))return v;
      const variant=authoredSnackVisit(v,10,i);
      return variant;
    }
    if(i===10){
      const made=authoredMenuRecipes();
      if(made.length){
        const recipe=made[Math.floor(seedPick(s,10,i,80)*made.length)];
        if(recipe.kind==='drink'){
          const iceCount=Math.floor(seedPick(s,10,i,81)*4);
          return withReplacedMenuOrder(v,customOrderLines(v,recipe,10,i,iceCount),{type:'drink',name:recipe.name,custom:true,iceCount},'drink');
        }
        const heat=1+Math.floor(seedPick(s,10,i,82)*3);
        return withReplacedMenuOrder(v,customOrderLines(v,recipe,10,i,heat),{type:'food',name:recipe.name,custom:true,heat,addons:recipe.addons||[]},'food');
      }
    }
    if(v.garnishVariant10){
      const ids=['mint','cherry','sugar','chocoball','tapioca'].filter(id=>inventory.includes(id));
      if(!ids.length)return v;
      const id=ids[Math.floor(seedPick(s,10,i,51)*ids.length)],name=garnishById(id).name;
      return {...v,dialogue:keepDayTenIntro(v,[[v.who,'나이트 드라이브에 '+name+'도 올려 주세요. 새로 들여온 재료가 궁금해서요.'],[v.who,'그리고 크리스피 치킨도 하나 부탁해요.']]),orders:[{type:'drink',name:'나이트 드라이브',requestedGarnish:id},{type:'food',name:'크리스피 치킨'}]};
    }
    if(v.addonVariant10){
      const ids=['smoke','crisp','spiceoil','curry'].filter(id=>inventory.includes(id));
      if(!ids.length)return v;
      const id=ids[Math.floor(seedPick(s,10,i,52)*ids.length)],name=marketCatalog.find(m=>m.id===id).name;
      return {...v,dialogue:keepDayTenIntro(v,[[v.who,'스파이시 그릴 미트에 '+name+'도 넣어 주세요. 평소와 다른 맛이 궁금해요.']]),orders:[{type:'food',name:'스파이시 그릴 미트',addons:[id]}],after:[[v.who,'추가해 주신 재료가 잘 어울리네요. 잘 먹었습니다.']]};
    }
    // All other Day 10 guests use their authored scene and order unchanged.
    // Do not replace their stories with seeded one-line orders.
    return v;
  });
 }
 if(s.day!==5)return base;
 const key=JSON.stringify(s.customRecipes||[]);if(dayFiveCache&&dayFiveCacheKey===key)return dayFiveCache;dayFiveCacheKey=key;
 return dayFiveCache=base.map(v=>{
  if(!v.dynamicCustom)return v;
  const recipe=(s.customRecipes||[]).find(r=>r&&r.registered&&r.name&&['drink','food'].includes(r.kind));
  if(!recipe)return {...v,dialogue:[...v.dialogue.slice(0,1),['신메뉴 소문을 듣고 온 손님','여기서만 파는 메뉴가 있다고 들었는데 아직 준비 중인가 보네요.'],['신메뉴 소문을 듣고 온 손님','그럼 게이트 라이트 하나 주세요.']],orders:[{type:'drink',name:'게이트 라이트',ice:false}]};
  return {...v,dialogue:[...v.dialogue.slice(0,1),['신메뉴 소문을 듣고 온 손님','여기에서 직접 개발한 메뉴가 있다면서요?'],['신메뉴 소문을 듣고 온 손님','이름이 '+recipe.name+' 맞죠? 그걸로 부탁드려요.']],orders:[{type:recipe.kind,name:recipe.name,ice:false,custom:true}],after:[['신메뉴 소문을 듣고 온 손님','직접 만든 메뉴라고요? 꽤 근사한데요!'],['신메뉴 소문을 듣고 온 손님','다음에 오면 또 주문해야겠어요.']]};
 });
}

// Keep one stable order-object identity throughout a guest encounter.
// Conditional visits rebuild objects, so resolving current() anew on each action
// previously made indexOf(order) return -1 and blocked all multi-item service.
let mzCurrentVisitCacheKey=null,mzCurrentVisitCacheValue=null;

function mzDay32ArcadeButton(){
 const el=document.createElement('div');el.id='mzDay32ArcadeButton';el.className='v54-closing-market';
 el.innerHTML='<button type="button" class="v54-closing-market-button"><span class="v54-market-symbol" aria-hidden="true">▣</span><span><strong>미니게임</strong><small>오래된 아케이드 게임기 · GHOST EATER</small></span><span aria-hidden="true">›</span></button>';
 el.querySelector('button').onclick=mzOpenArcadePlaceholder;
 return el;
}
