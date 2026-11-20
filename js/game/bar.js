/* MILE ZERO — Drink and food stations: mixing, validation, serving, waiting, garnishes.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

const WAIT_SECONDS=[3.5,5,6,4.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5];

function unlockedGarnishes(){
 const saved=Array.isArray(s.unlockedExtras)?s.unlockedExtras:[];
 return garnishCatalog.filter(g=>g.source==='combination'?g.id==='mintchoco'&&s.day>=10&&hasMarketItem('mint')&&hasMarketItem('chocoball'):saved.includes(g.id)||g.source==='market'&&hasMarketItem(g.id)||g.source==='daily'&&s.day>=g.unlockDay||g.id==='sunfruit'&&s.day>=3&&(s.phase==='closing'||s.day>3));
}

function garnishById(id){return garnishCatalog.find(g=>g.id===id)}

function findGarnishReaction(v){
  // The first-time sunfruit discovery is an early Torban story event, not a recurring line.
  // Old saves already carry its one-time discovery in garnishDiscoveries.
  if(v.who==='토르반'){
    if(s.day>20)return null;
    if((s.garnishDiscoveries||[]).some(d=>d&&d.who==='토르반'&&d.garnish==='석양열매'))return null;
  }
  const table=guestGarnishReactions[v.who];if(!table)return null;
 const served=s.completed.filter(c=>c.type==='drink'&&c.extra);
 for(const cup of served){const garnish=garnishById(cup.extra);if(!garnish)continue;
  for(const tag of materialTags(garnish.id)?.hiddenTags||[]){if(table[tag])return {tag,garnish:garnish.name,lines:table[tag]};}
 }
 return null;
}

function currentAfterLines(v){
 if(s.specialOutcome==='ignored-request'&&v.afterBad)return v.afterBad;
 // Older DAY35 saves may contain SNS imported into the auxiliary dialogue.
 // The final DAY35 visitor has no authored auxiliary reactions.
 if(s.day===35&&v&&v.who==='퇴근길 인쇄소 직원')return v.after;
 return v.after.concat(Array.isArray(s.garnishDialogue)?s.garnishDialogue:[]);
}

function garnishCard(g,selected,disabled=false){
 const art=`<span class="v54-garnish-art v54-garnish-${esc(g.id)}" aria-hidden="true"><i></i><i></i><i></i></span>`;
 return `<button type="button" class="v32-extra-choice v35-garnish-choice ${selected?'is-selected':''}" data-garnish="${esc(g.id)}" aria-pressed="${selected?'true':'false'}" ${disabled?'disabled':''}>${art}<span class="v32-extra-copy"><strong>${esc(g.name)}</strong><small>${esc(g.taste.join(' · '))}</small></span><span class="v32-extra-mark" aria-hidden="true">${selected?'✓':'+'}</span></button>`;
}

function current(){
 const key=JSON.stringify([s.day,s.visit,s.randomSeed,s.ownedMarket||[],s.customRecipes||[],s.regularUnlocks||[],s.unlockedExtras||[],s.foodAddons||[],s.sunsetRoadRecipe||null,s.dayTenMechanicScheduled,s.mechanicRetryActive]);
 if(key!==mzCurrentVisitCacheKey){
  mzCurrentVisitCacheValue=todayVisits()[s.visit];
  mzCurrentVisitCacheKey=key;
 }
 return mzCurrentVisitCacheValue;
}

function orderDone(o){return s.completed.some(v=>v.index===current().orders.indexOf(o)&&(v.type===o.type||o.type==='either'))}

function selectedOrder(type){return current()?.orders.find(o=>(o.type===type||o.type==='either')&&!orderDone(o))}

function iceVisual(count,served=false){return count?'<span class="'+(served?'served-ice-cubes':'cup-ice')+'" aria-label="얼음 '+count+'회">'+Array.from({length:Math.min(3,count)},()=>'<i class="ice-cube"></i>').join('')+'</span>':'';}

function blendColor(seq){const rgb=seq.map(k=>ingredients.find(a=>a[0]===k)[2]).map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));return '#'+[0,1,2].map(j=>Math.round(rgb.reduce((sum,c)=>sum+c[j],0)/rgb.length).toString(16).padStart(2,'0')).join('')}

function countStr(){return ingredients.map(a=>{let n=s.mix.filter(c=>c===a[0]).length;return n?a[0]+'×'+n:''}).filter(Boolean).join(' · ')||'컵이 비어 있습니다.'}

function clearDrink(){s.mix=[];s.ice=false;s.iceCount=0;s.stirred=false;s.mixAt=0;s.extra=null;s.stationError=null}

function addIng(id){if(s.phase!=='open'||s.sub!=='order')return;const cnt=s.mix.filter(x=>x===id).length;if(cnt>=5||s.mix.length>=10)return;s.mix.push(id);s.stationError=null;render()}

// Flavor-only orders use public ingredient taste tags. Several familiar recipes may qualify.
function hasRequestedFlavors(tags,rule){
 // Legacy authored requests may contain pre-v178 tags; compare using canonical names.
 const canonical=t=>({'허브향':'허브 향','과일향':'과실 향','단맛':'달콤함','매운맛':'매콤함','향긋함':'허브 향','야채':'채소','초콜릿향':'초콜릿 향'})[t]||t;
 const available=new Set(tags.map(canonical));
 // Alcohol is a factual drink-base property, not a sensory taste tag.
 const satisfies=tag=>canonical(tag)==='알코올'?s.mix.includes('C'):available.has(canonical(tag));
 return (rule.require||[]).every(satisfies) &&
        !(rule.exclude||[]).some(satisfies);
}

function preparedDrinkMatchesRecipe(d){
 if(!d||!d.seq)return false;
 const seq=s.mix.join('');
 if(d.mode==='mix')return s.stirred&&s.mixAt===s.mix.length&&s.mix.slice().sort().join('')===d.seq.split('').sort().join('');
 if(d.mode==='partial')return s.stirred&&s.mixAt===d.mixAt&&s.mixAt<s.mix.length&&s.mix.slice(0,d.mixAt).sort().join('')===d.seq.slice(0,d.mixAt).split('').sort().join('')&&seq.slice(d.mixAt)===d.seq.slice(d.mixAt);
 return !s.stirred&&seq===d.seq;
}

// v304: All trait orders use prepared sensory tags, garnish and food add-ons.
// A specific named recipe may need a mandatory topping; generic trait orders do not.
function mzDrinkTasteTags(){
 const parts=[...s.mix].flatMap(ch=>{
  const m=materialTags(ch);return m?[...m.taste]:[];
 });
 return [...new Set([...parts,...(garnishById(s.extra)?.taste||[])])];
}

function mzFoodTasteTags(){
 const base=materialTags(s.foodBase),sauce=materialTags(s.foodSauce);
 const baseTaste=base?.taste||[],sauceTaste=sauce?.taste||[];
 const extras=(s.foodAddons||[]).flatMap(id=>marketCatalog.find(m=>m.id===id)?.tags||[]); // sensory tags only (v304)
 return [...new Set([...baseTaste,...sauceTaste,...extras])];
}

function mzToppingConstraint(o,type){
 const rule=o.toppingRule||{};
 const active=type==='drink'?(s.extra?[s.extra]:[]):(s.foodAddons||[]);
 const demanded=[...(type==='drink'?[o.requestedGarnish].filter(Boolean):(o.addons||[])),...(rule.require||[]),...(type==='drink'?(o.requestedToppings||[]):(o.requestedAddons||[]))];
 const forbidden=[...(rule.exclude||[]),...(type==='drink'?(o.omitGarnishes||[]):(o.omitAddons||[]))];
 if(type==='drink'&&o.omitGarnish)forbidden.push(o.omitGarnish);
 if((rule.none||o.noTopping||(type==='drink'?o.noGarnish:o.noAddons))&&active.length)return false;
 if(rule.any===true&&!active.length)return false;
 if(!demanded.every(id=>active.includes(id))||forbidden.some(id=>active.includes(id)))return false;
 return true;
}

// Story reward lives outside customRecipes. Equal ingredient signatures are deliberate:
// a player-created menu and this story reward remain distinct recipe-book entries.
function mzValidSunsetSpec(seq,mixAt,extra,iceCount=0){
 if(typeof seq!=='string'||!/^B+C+R+A+$/.test(seq)||seq.length<6||seq.length>10)return false;
 if([...new Set(seq)].some(k=>seq.split(k).length-1>5))return false;
 const bottom=(seq.match(/^B+C+/)||[''])[0].length;
 return Number.isInteger(mixAt)&&mixAt===bottom&&bottom<seq.length&&extra==='sunfruit'&&Number(iceCount)===0;
}

function mzSunsetRoadRecipe(){
 if(!(s.regularUnlocks||[]).includes('sunsetRoad'))return null;
 const saved=s.sunsetRoadRecipe;
 if(saved&&mzValidSunsetSpec(saved.seq,saved.mixAt,saved.extra))
  return {name:'선셋 로드',seq:saved.seq,mode:'partial',mixAt:saved.mixAt,extra:'sunfruit',source:'story'};
 // Backward compatibility with v232 saves in which the reward had already been given.
 return {name:'선셋 로드',seq:'BBCCRRAA',mode:'partial',mixAt:4,extra:'sunfruit',source:'story'};
}

function mzSunsetStoryDrinkCandidates(){
 const recipe=mzSunsetRoadRecipe();return recipe?[recipe]:[];
}

// v304: A flavor order is based on the *registered recipe definition* and the
// prepared ingredient sensory tags, never on the player's unlock state.
// User-created recipes only count if actually registered. Market/story recipes
// are defined in the official catalogs even before purchase/unlock.
function flavorDrinkCandidates(ignoreUnlock=false){
 const user=(s.customRecipes||[]).filter(r=>r.registered&&r.kind==='drink'&&r.seq&&r.source!=='market');
 const market=ignoreUnlock?marketRecipeRewards.filter(r=>r.kind==='drink'):
  (s.customRecipes||[]).filter(r=>r.registered&&r.kind==='drink'&&r.source==='market');
 const regular=drinks.filter(d=>d.name!=='선셋 로드'&&(ignoreUnlock||!d.unlockDay||s.day>=d.unlockDay));
 const sunset=ignoreUnlock?[mzSunsetRoadRecipe()||{name:'선셋 로드',seq:'BBCCRRAA',mode:'partial',mixAt:4,extra:'sunfruit',source:'story'}]:mzSunsetStoryDrinkCandidates();
 return [...user,...market,...regular,...sunset];
}

function matchedFlavorDrink(rule){
 if(!hasRequestedFlavors(mzDrinkTasteTags(),rule))return undefined;
 return flavorDrinkCandidates(true).find(d=>preparedDrinkMatchesRecipe(d)&&(!d.extra||d.extra===s.extra));
}

function flavorFoodCandidates(ignoreUnlock=false){
 const user=(s.customRecipes||[]).filter(r=>r.registered&&r.kind==='food'&&r.source!=='market');
 const market=ignoreUnlock?marketRecipeRewards.filter(r=>r.kind==='food'):
  (s.customRecipes||[]).filter(r=>r.registered&&r.kind==='food'&&r.source==='market');
 const story=ignoreUnlock||((s.regularUnlocks||[]).includes('mechanic'))?[mechanicRecipe]:[];
 return [...user,...market,...(ignoreUnlock?[
  ...foods,...friedRecipes,...fishRecipes,...nonheatRecipes
 ]:availableFoods()),...story];
}

function matchedFlavorFood(rule){
 if(!hasRequestedFlavors(mzFoodTasteTags(),rule))return undefined;
 const addons=(s.foodAddons||[]).slice().sort().join('|');
 const candidates=flavorFoodCandidates(true).filter(f=>{
  const spec=foodRecipeSpec(f)||f;
  return s.foodBase===spec.base&&s.foodSauce===spec.sauce&&s.foodKind===spec.kind;
 });
 // Prefer an exact registered signature. Regular menu recipes with no required
 // add-ons allow optional purchased toppings, as the existing cooking UI does.
 // This keeps the authored DAY 16 spicy + crunchy request solvable without
 // treating an arbitrary base/sauce/cooking combination as a registered recipe.
 const found=candidates.find(f=>{
  const spec=foodRecipeSpec(f)||f;
  return (spec.addons||[]).slice().sort().join('|')===addons;
 })||candidates.find(f=>{
  const spec=foodRecipeSpec(f)||f;
  return !spec.addons?.length && !f.source && (s.foodAddons||[]).every(id=>hasMarketItem(id));
 });
 return found?{...found,...(foodRecipeSpec(found)||found)}:undefined;
}

// v129: An open-choice order accepts any currently available, registered recipe.
// Add {type:'drink'|'food', anyMenu:true} to a future visit's orders array.
// Flavor, required/excluded toppings and explicit ice restrictions still apply.
function mzIsAnyMenuOrder(o){return o?.anyMenu===true;}

function mzAnyDrinkCandidates(){
 return flavorDrinkCandidates();
}

function mzAnyDrinkRecipe(o){
 if(!mzIsAnyMenuOrder(o))return undefined;
 if(o.flavorRequest&&!hasRequestedFlavors(mzDrinkTasteTags(),o.flavorRequest))return undefined;
 return mzAnyDrinkCandidates().find(d=>(!o.modePreference||['layer','mix','partial'].includes(o.modePreference)&&d.mode===o.modePreference)&&preparedDrinkMatchesRecipe(d)&&(!d.extra||d.extra===s.extra));
}

function mzFoodMatchesDiet(o){
 const rule=o?.dietRequest;
 if(!rule||!rule.vegetarian)return true;
 // The current pantry has no meat/seafood-derived sauces or garnish addons.
 // Reject both animal-based primary ingredients; eggs and dairy are allowed.
 return !['육류','해산물','생선','새우'].includes(s.foodBase);
}

function mzAnyFoodRecipe(o){
 if(!mzIsAnyMenuOrder(o)||!mzFoodMatchesDiet(o))return undefined;
 if(o.flavorRequest&&!hasRequestedFlavors(mzFoodTasteTags(),o.flavorRequest))return undefined;
 const candidates=flavorFoodCandidates();
 const found=candidates.find(f=>{
  const spec=foodRecipeSpec(f)||f;
  return s.foodBase===spec.base&&s.foodSauce===spec.sauce&&s.foodKind===spec.kind&&
    (spec.addons||[]).slice().sort().join('|')===(s.foodAddons||[]).slice().sort().join('|');
 });
 return found?{...found,...(foodRecipeSpec(found)||found)}:undefined;
}

// A requested base ingredient uses the actual prepared registered recipe, never the display name.
// C/A/R/V/B correspond to CLEAR/AMBER/RUBY/VERDE/BLUE.
function mzIngredientDrinkRecipe(o){
 const rule=o?.ingredientRequest||{};
 const allowed=new Set(['C','A','R','V','B']);
 const normalize=id=>({CLEAR:'C',AMBER:'A',RUBY:'R',VERDE:'V',BLUE:'B'})[String(id).toUpperCase()]||String(id).toUpperCase();
 const required=(rule.require||[]).map(normalize),excluded=(rule.exclude||[]).map(normalize);
 if(!required.every(x=>allowed.has(x))||!excluded.every(x=>allowed.has(x)))return undefined;
 if(!required.every(x=>s.mix.includes(x))||excluded.some(x=>s.mix.includes(x)))return undefined;
 return mzAnyDrinkCandidates().find(d=>(!o.modePreference||['layer','mix','partial'].includes(o.modePreference)&&d.mode===o.modePreference)&&preparedDrinkMatchesRecipe(d)&&(!d.extra||d.extra===s.extra));
}

function mzResolveDrink(o){if(o.regularSpecial==='sunsetRoad'&&s.day===29&&current()?.sunsetQuest)return {name:'노을빛 음료',seq:s.mix.join(''),mode:'partial',mixAt:s.mixAt,extra:'sunfruit'};if(o.name==='선셋 로드'&&!o.custom)return mzSunsetRoadRecipe();return o.flavorRequest?matchedFlavorDrink(o.flavorRequest):drinks.find(v=>v.name===o.name&&v.name!=='선셋 로드')||((s.customRecipes||[]).find(v=>v.name===o.name&&v.kind==='drink'&&(o.custom?v.source!=='market':v.source==='market')))||((s.customRecipes||[]).find(v=>v.name===o.name&&v.kind==='drink'));}

function mzDrinkValidation(o){
 if(o.regularSpecial==='sunsetRoad'){
  const eligible=s.day===29&&current()?.sunsetQuest&&!orderDone(o);
  const seq=s.mix.join('');
  const ok=eligible&&s.stirred&&mzValidSunsetSpec(seq,s.mixAt,s.extra,s.iceCount);
  return {ok:!!ok,d:ok?{name:'노을빛 음료',seq,mode:'partial',mixAt:s.mixAt,extra:'sunfruit'}:null,adapted:false};
 }
 const d=mzIsAnyMenuOrder(o)?mzAnyDrinkRecipe(o):o.ingredientRequest?mzIngredientDrinkRecipe(o):mzResolveDrink(o);if(!d||!preparedDrinkMatchesRecipe(d)&&!(o.omit||o.adjust))return {ok:false,d};
 const baseSeq=d.seq||'',mode=d.mode||'layer';
 const matches=(seq)=>{
  if(mode==='mix')return s.stirred&&s.mixAt===s.mix.length&&s.mix.slice().sort().join('')===seq.split('').sort().join('');
  if(mode==='partial')return s.stirred&&s.mixAt===d.mixAt&&s.mixAt<s.mix.length&&s.mix.slice(0,d.mixAt).sort().join('')===seq.slice(0,d.mixAt).split('').sort().join('')&&s.mix.slice(d.mixAt).join('')===seq.slice(d.mixAt);
  return !s.stirred&&s.mix.join('')===seq;
 };
 const standard=matches(baseSeq);
 let adapted=false;
 if(!o.flavorRequest){
  if(o.omit)adapted=matches(baseSeq.split('').filter(c=>c!==o.omit).join(''));
  if(o.adjust){const ch=o.adjust.ingredient,delta=o.adjust.delta,base=baseSeq.split('');let remain=Math.max(0,-delta);const changed=delta>0?base.concat(Array(delta).fill(ch)):base.filter(c=>{if(c===ch&&remain-->0)return false;return true});adapted=matches(changed.join(''));}
 }
 let extrasOK=true;
 if(!o.flavorRequest&&!mzIsAnyMenuOrder(o)&&!o.ingredientRequest){
  // Exact menu orders preserve mandatory recipe toppings, while explicit requests can add toppings.
  if(d.extra)extrasOK=s.extra===d.extra;
  else if(o.custom||d.source==='market')extrasOK=!s.extra||!!o.requestedGarnish||!!o.toppingRule?.require?.length;
 }
 const ice=Number.isFinite(Number(o.iceCount))?Number(o.iceCount):(o.ice?1:0);
 const iceOK=o.iceRequest?((s.iceCount||0)>=o.iceRequest.min&&(s.iceCount||0)<=o.iceRequest.max):((mzIsAnyMenuOrder(o)||o.ingredientRequest)&&o.iceCount==null&&o.ice==null&&!o.noIce?true:(s.iceCount||0)===(o.noIce?0:ice));
 // Story-authored disappointed responses allow a valid unmodified drink to be served.
 // Do not allow this fallback for ordinary mandatory variant requests.
 const allowBad=!!current()?.afterBad;
 const recipeOK=(o.omit||o.adjust)?(adapted||(allowBad&&standard)):standard;
 return {ok:!!recipeOK&&extrasOK&&mzToppingConstraint(o,'drink')&&iceOK,d,adapted:adapted&&!standard};
}

function preparedDrinkMatchesOrder(o){return mzDrinkValidation(o).ok;}

function makeDrink(){
 const pending=current()?.orders.filter(o=>(o.type==='drink'||o.type==='either')&&!orderDone(o))||[];
 if(!pending.length)return;
 const o=pending.find(preparedDrinkMatchesOrder);
 if(!o){
  s.mistakes++;
  // Diagnose against every pending drink, including DAY34 random flavor and
  // ingredient requests. Validation still demands an exact registered recipe.
  const matches=pending.map(order=>{
   const validation=mzDrinkValidation(order);
   const recipe=validation.d||(order.flavorRequest?mzAnyDrinkCandidates().find(d=>preparedDrinkMatchesRecipe(d)&&(!d.extra||d.extra===s.extra)):null);
   return {order,recipe};
  }).filter(x=>x.recipe&&preparedDrinkMatchesRecipe(x.recipe));
  const entry=matches.find(({order})=>{
   const hasIceRule=!!order.iceRequest||order.iceCount!=null||order.ice!=null||order.noIce||(!mzIsAnyMenuOrder(order)&&!order.ingredientRequest);
   if(!hasIceRule)return false;
   const actual=s.iceCount||0;
   return order.iceRequest?actual<order.iceRequest.min||actual>order.iceRequest.max:actual!==(order.noIce?0:Number(order.iceCount??(order.ice?1:0)));
  });
  if(entry)s.stationError='DRINK / 얼음 수량을 확인해 주세요';
  else if(matches.some(({order,recipe})=>!mzToppingConstraint(order,'drink')||(recipe.extra&&s.extra!==recipe.extra)))s.stationError='DRINK / 토핑 조건을 확인해 주세요';
  else if(matches.some(({order})=>order.flavorRequest&&!hasRequestedFlavors(mzDrinkTasteTags(),order.flavorRequest)))s.stationError='DRINK / 요청한 맛 조건을 확인해 주세요';
  else if(matches.length)s.stationError='DRINK / 추가·제외 요청과 제조 조건을 확인해 주세요';
  else s.stationError='DRINK / 레시피의 재료·서순·혼합 방식을 확인해 주세요';
  render();return;
 }
 const check=mzDrinkValidation(o),d=check.d;
 s.stationError=null;
 s.completed.push({type:'drink',name:o.flavorRequest||mzIsAnyMenuOrder(o)||o.ingredientRequest?d.name:o.name,index:current().orders.indexOf(o),ice:s.ice,iceCount:s.iceCount,seq:[...s.mix],mode:d.mode==='partial'?'partial':s.stirred?'mix':'layer',mixAt:s.mixAt,extra:s.extra,variation:o.requestedGarnish?'requested':o.omit||o.adjust?(check.adapted?'requested':'standard'):null});
 clearDrink();const paidTip=(o.omit||o.adjust)&&!check.adapted?0:2;s.tips+=paidTip;s.wallet=(s.wallet||0)+5+paidTip;playEffect('complete');render();
}

function foodRecipeSpec(custom){
 if(!custom)return null;
 if(custom.foodBase&&custom.foodSauce&&custom.foodKind)return {base:custom.foodBase,sauce:custom.foodSauce,kind:custom.foodKind,addons:custom.addons||[]};
 const legacy=foods.find(f=>f.name===custom.base);
 return legacy?{base:legacy.base,sauce:legacy.sauce,kind:legacy.kind}:null;
}

// ===== FOOD PREPARATION / VALIDATION =====
// A guest may order multiple foods (including a late quest order). Resolve the
// prepared dish against *all* outstanding food orders, rather than assuming
// the first food is what the player intended to prepare.
function preparedFoodForOrder(order){
 const custom=(s.customRecipes||[]).find(v=>v.name===order.name&&v.kind==='food'&&(order.custom?v.source!=='market':v.source==='market'))||(s.customRecipes||[]).find(v=>v.name===order.name&&v.kind==='food');
 return mzIsAnyMenuOrder(order)?mzAnyFoodRecipe(order):
   order.regularSpecial==='mechanic'?mechanicRecipe:
   order.flavorRequest?matchedFlavorFood(order.flavorRequest):
   custom?foodRecipeSpec(custom):availableFoods().find(v=>v.name===order.name);
}

function preparedFoodMatchesOrder(order){
 const f=preparedFoodForOrder(order);
 if(!f||!mzFoodMatchesDiet(order)||s.foodBase!==f.base||s.foodSauce!==f.sauce||s.foodKind!==f.kind)return false;
 const addons=(s.foodAddons||[]).slice().sort();
 const custom=(s.customRecipes||[]).find(v=>v.name===order.name&&v.kind==='food');
 const expected=(order.addons||((mzIsAnyMenuOrder(order)||order.flavorRequest)?f.addons:custom?.addons)||f.addons||[]).slice().sort();
 const allowBadAddons=!!current()?.afterBad&&Array.isArray(order.addons)&&order.addons.length>0;
 const plainRecipe=availableFoods().some(base=>base.base===s.foodBase&&base.sauce===s.foodSauce&&base.kind===s.foodKind&&!((base.addons||[]).length));
 const addonMatch=addons.join('|')===expected.join('|')||(allowBadAddons&&addons.length===0&&plainRecipe);
 const toppingOrder=(allowBadAddons&&addons.length===0&&plainRecipe)?{...order,addons:[]}:order;
 if(!addons.every(id=>hasMarketItem(id))||!mzToppingConstraint(toppingOrder,'food'))return false;
 // Explicitly named dishes keep their recipe add-ons. Trait-only orders can vary them.
 if(!order.flavorRequest&&!addonMatch)return false;
 return (Number(s.foodHeat)||0)===(Number(order.heat)||0);
}

function makeFood(){
 const pending=current()?.orders.filter(o=>(o.type==='food'||o.type==='either')&&!orderDone(o))||[];
 if(!pending.length)return;
 const heat=Math.max(0,Number(s.foodHeat)||0);
 if(heat>=10&&s.day>=10){s.darkMatterFound=true;s.stationError='암흑물질처럼 새카맣게 타버렸습니다... 당신, 혹시.. 칼리스토?';s.foodBase=s.foodSauce=s.foodKind=null;s.foodAddons=[];s.foodHeat=0;render();return;}
 const o=pending.find(preparedFoodMatchesOrder);
 if(!o){s.mistakes++;s.stationError='FOOD / 재료 또는 조리법 불일치';render();return;}
 const f=preparedFoodForOrder(o);
 const addons=(s.foodAddons||[]).slice().sort();
 const expected=(o.addons||(s.customRecipes||[]).find(v=>v.name===o.name&&v.kind==='food')?.addons||[]).slice().sort();
 s.stationError=null;
 s.completed.push({type:'food',name:o.flavorRequest||mzIsAnyMenuOrder(o)?f.name:o.name,index:current().orders.indexOf(o),addons:[...addons],heat,variation:o.addons?(expected.join('|')===addons.join('|')?'requested':'standard'):null});
 s.foodBase=null;s.foodSauce=null;s.foodKind=null;s.foodAddons=[];s.foodHeat=0;s.extra=null;s.tips+=2;s.wallet=(s.wallet||0)+7;
 playEffect('complete');render();
}

function allDone(){return current()?.orders.every(orderDone)}

function nextLine(){const v=current(),source=s.sub==='after'?currentAfterLines(v):v.dialogue;s.line++;if(s.line>=source.length){if(s.sub==='dialogue'){s.sub='order';s.line=0;/* 제조대는 사용자가 직접 선택한다. */}else{if(mz35FreightCompleted()){mz35OpenCareDialogue();return;}const offer=v.appointmentOffer;if(offer&&mzOfferAppointment(offer)){s.sub='appointment';s.line=0;}else{advanceGuest();return}}}render()}

function startWaiting(){
 s.sub='interlude';s.waitUntil=Date.now()+WAIT_SECONDS[Math.min(s.visit,WAIT_SECONDS.length-1)]*1000;
}

function endWaiting(){
 if(s.phase!=='open'||s.sub!=='interlude')return;
 s.waitUntil=null;
 if(s.visit>=todayVisits().length){
   s.phase='closing';
   const mid=s.day===1?'closing':s.day>=2?'closing'+s.day:'closing';if(!s.deliveredMessages.includes(mid))s.deliveredMessages.push(mid);
   note('시스템',dayLabel(s.day)+' 영업 종료');
 }else{s.sub='dialogue';s.line=0;playEffect('door');const stage=document.querySelector('.scene');if(stage){stage.classList.remove('guest-arriving');void stage.offsetWidth;stage.classList.add('guest-arriving');setTimeout(()=>stage.classList.remove('guest-arriving'),650)}}
 render();
}

function mzFinishTorbanSunsetQuest(v){
 if(s.day!==29||!v?.sunsetQuest)return;
 const idx=v.orders.findIndex(o=>o.regularSpecial==='sunsetRoad');
 const product=(s.completed||[]).find(x=>x.index===idx&&x.type==='drink');
 if(idx<0||!product||!mzValidSunsetSpec((product.seq||[]).join(''),product.mixAt,product.extra,product.iceCount))return;
 if(!s.sunsetRoadRecipe){
  s.sunsetRoadRecipe={seq:product.seq.join(''),mode:'partial',mixAt:product.mixAt,extra:'sunfruit'};
 }
 if(!Array.isArray(s.regularUnlocks))s.regularUnlocks=[];
 if(!s.regularUnlocks.includes('sunsetRoad')){
  s.regularUnlocks.push('sunsetRoad');
  if(!Array.isArray(s.recipeNotices))s.recipeNotices=[];
  if(!s.recipeNotices.includes('선셋 로드'))s.recipeNotices.push('선셋 로드');
  note('시스템','특별 음료 「선셋 로드」 레시피 해금');
 }
 if(!Array.isArray(s.deskOwned))s.deskOwned=[];
 if(!s.deskOwned.includes('torban_wasteland_bouquet')){
  s.deskOwned.push('torban_wasteland_bouquet');
  note('시스템','MY DESK 선물 획득: 황무지의 꽃다발');
 }
}

function mzShowTorbanRewardNotice(){
 if(document.getElementById('mzTorbanReward'))return;
 const overlay=document.createElement('div');overlay.id='mzTorbanReward';overlay.className='mz183-unlock-overlay';
 const popup=document.createElement('div');popup.className='mz183-unlock-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','true');popup.setAttribute('aria-label','토르반의 이야기 완료');
 const title=document.createElement('h2');title.textContent='토르반의 이야기 완료';
 const kicker=document.createElement('div');kicker.className='mz183-unlock-kicker';kicker.textContent='STORY COMPLETE';
 const details=document.createElement('p');details.textContent='특별 음료 「선셋 로드」 레시피를 해금했습니다.';
 const gift=document.createElement('p');gift.textContent='MY DESK 선물 「황무지의 꽃다발」을 획득했습니다.';
 const hint=document.createElement('p');hint.textContent='레시피북과 MY DESK에서 확인할 수 있습니다.';
 const button=document.createElement('button');button.className='btn primary';button.type='button';button.textContent='확인';
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 button.addEventListener('click',close);document.addEventListener('keydown',onKey);
 popup.append(kicker,title,details,gift,hint,button);overlay.appendChild(popup);document.body.appendChild(overlay);button.focus();
}

function mzShowMechanicRewardNotice(){
 if(document.getElementById('mzMechanicReward'))return;
 const overlay=document.createElement('div');overlay.id='mzMechanicReward';overlay.className='mz183-unlock-overlay';
 const popup=document.createElement('div');popup.className='mz183-unlock-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','true');popup.setAttribute('aria-label','야간 정비사의 이야기 완료');
 const title=document.createElement('h2');title.textContent='야간 정비사의 이야기 완료';
 const kicker=document.createElement('div');kicker.className='mz183-unlock-kicker';kicker.textContent='STORY COMPLETE';
 const details=document.createElement('p');details.textContent='특별 안주 「훈연 바삭 꼬치」 레시피를 해금했습니다.';
 const hint=document.createElement('p');hint.textContent='레시피북에서 확인할 수 있습니다.';
 const button=document.createElement('button');button.className='btn primary';button.type='button';button.textContent='확인';
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
 button.addEventListener('click',close);document.addEventListener('keydown',onKey);
 popup.append(kicker,title,details,hint,button);overlay.appendChild(popup);document.body.appendChild(overlay);button.focus();
}

function mzShowDay32ArcadeNotice(){
 if(document.getElementById('mzDay32ArcadeReward'))return;
 const overlay=document.createElement('div');overlay.id='mzDay32ArcadeReward';overlay.className='mz183-unlock-overlay';
 const popup=document.createElement('div');popup.className='mz183-unlock-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','true');popup.setAttribute('aria-label','카이렌·미카의 이야기 완료');
 const kicker=document.createElement('div');kicker.className='mz183-unlock-kicker';kicker.textContent='STORY COMPLETE';
 const title=document.createElement('h2');title.textContent='카이렌·미카의 이야기 완료';
 const detail=document.createElement('p');detail.textContent='MILE ZERO의 오래된 게임기가 수리되었습니다.';
 const hint=document.createElement('p');hint.textContent='DAY 32 영업 마감 후부터 미니게임 메뉴를 이용할 수 있습니다.';
 const button=document.createElement('button');button.className='btn primary';button.type='button';button.textContent='확인';
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey)};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
 button.addEventListener('click',close);document.addEventListener('keydown',onKey);
 popup.append(kicker,title,detail,hint,button);overlay.appendChild(popup);document.body.appendChild(overlay);button.focus();
}

function advanceGuest(){const completedGuest=current();if(s.day===43&&completedGuest?.who==='리안'&&!s.unlockedExtras.includes('flower')){s.unlockedExtras.push('flower');note('시스템','리안 개인 서사 완료 · 신규 음료 토핑 「꽃」 영구 해금');} const day32ArcadeFinish=s.day===32&&s.visit===2&&!s.arcadeRepaired;if(day32ArcadeFinish){s.arcadeRepaired=true;note('시스템','카이렌·미카의 이야기 완료 · 아케이드 게임기 수리');}mzFinishTorbanSunsetQuest(completedGuest);const showMechanicNotice=!!s.mechanicStoryNoticePending&&completedGuest?.who==='야간 정비사'&&completedGuest?.orders?.some(o=>o.regularSpecial==='mechanic');if(showMechanicNotice)s.mechanicStoryNoticePending=false;s.mechanicRetryActive=false;rememberGuestVisit(current().who,s.day,s.visit);rememberAdditionalGuests(current(),s.day,s.visit);s.stationError=null;s.served++;s.dayStats[s.day]??={served:0,orders:0,tips:0};s.dayStats[s.day].served++;s.dayStats[s.day].orders+=current().orders.length;s.visit++;startWaiting();s.line=0;s.completed=[];s.mix=[];s.ice=false;s.iceCount=0;s.stirred=false;s.mixAt=0;s.extra=null;s.foodBase=null;s.foodSauce=null;s.foodKind=null;s.foodAddons=[];s.foodHeat=0;s.remarked=false;s.lightComment=null;s.specialOutcome=null;s.garnishDialogue=[];render();if(completedGuest?.sunsetQuest)mzShowTorbanRewardNotice();if(showMechanicNotice)mzShowMechanicRewardNotice();if(day32ArcadeFinish)mzShowDay32ArcadeNotice()}

// ===== SERVING / OUTCOME / RECIPE DISCOVERY =====
function deliver(){
 if(!allDone())return;
 const v=current();
 if((s.day===9||s.day===10)&&v.orders.some(o=>o.regularSpecial==='mechanic'))s.mechanicRetryActive=true;
 s.specialOutcome=v.orders.some(o=>(o.omit||o.adjust||o.addons)&&s.completed.find(c=>c.index===v.orders.indexOf(o))?.variation==='standard')?'ignored-request':null;
 // A quest recipe is learned only after the requested additions were actually served.
 // The disappointed response uses the already-authored afterBad dialogue.
 s.garnishDialogue=[];
 // Mandatory order conditions always override garnish easter eggs.
 if(!s.specialOutcome){
  const event=findGarnishReaction(v);
  if(event){
   s.garnishDialogue=event.lines.map(pair=>pair.slice());
   if(!Array.isArray(s.garnishDiscoveries))s.garnishDiscoveries=[];if(!Array.isArray(s.guestVisits))s.guestVisits=[];if(!Array.isArray(s.guestClues))s.guestClues=[];backfillGuestHistory();
   const id=s.day+':'+s.visit+':'+event.tag+':'+event.garnish;
   if(!s.garnishDiscoveries.some(x=>x.id===id))s.garnishDiscoveries.push({id,day:s.day,visit:s.visit,who:v.who,garnish:event.garnish,lines:event.lines.map(x=>x.slice())});
  }
 }
 if(v.orders.some(o=>o.regularSpecial==='mechanic')&&!s.specialOutcome){s.regularUnlocks=Array.isArray(s.regularUnlocks)?s.regularUnlocks:[];if(!s.regularUnlocks.includes('mechanic')){s.regularUnlocks.push('mechanic');s.mechanicStoryNoticePending=true;}if(!Number.isInteger(s.mechanicRegularFrom))s.mechanicRegularFrom=s.day; if(!Array.isArray(s.recipeNotices))s.recipeNotices=[];if(!s.recipeNotices.includes('훈연 바삭 꼬치'))s.recipeNotices.push('훈연 바삭 꼬치');if(!Array.isArray(s.guestClues))s.guestClues=[];const id='8:'+s.visit+':야간 정비사:recipe';if(!s.guestClues.some(c=>c.id===id))s.guestClues.push({id,who:'야간 정비사',day:8,visit:s.visit,tags:['훈연 향','바삭함'],quote:'기억 속의 맛을 닮은 훈연 바삭 꼬치를 맛보았다.'});}
 note('시스템',v.orders.map(o=>o.name).join(', ')+' 제공 완료');s.sub='after';s.line=0;render();
}

function start(){if(s.devPreview&&!todayVisits().length){bootScreen='none';s.phase='closing';render();return;}bootScreen='none';s.phase='open';s.visit=0;startWaiting();s.line=0;s.seenIntro=true;note('시스템',dayLabel(s.day)+' 영업 시작');render()}

let v119GarnishPage=0;

function renderStation(){v119GarnishPage=Math.min(v119GarnishPage,Math.max(0,Math.ceil(unlockedGarnishes().length/4)-1));const isOpen=s.phase==='open'&&s.sub==='order';$('stationName').textContent=s.station==='drink'?'DRINK STATION':'FOOD STATION';for(const [id,type] of [['drinkIndicator','drink'],['foodIndicator','food']]){const el=$(id);el.classList.toggle('selected',s.station===type);el.setAttribute('aria-current',s.station===type?'page':'false')} $('orderLabel').textContent=isOpen?current().orders.filter(o=>!orderDone(o)).map(o=>o.name).join(' · ')||'서빙 대기':'주문 대기';let html='';if(s.station==='drink'){
html=`<div class="view"><div><div class="materials">${ingredients.map(a=>`<button class="material" style="background:${a[2]}" data-add="${a[0]}" ${!isOpen||!selectedOrder('drink')||s.mix.length>=10||s.mix.filter(x=>x===a[0]).length>=5?'disabled':''}>${a[0]}<small>${a[1]}</small></button>`).join('')}</div>${unlockedGarnishes().length?`<section class="v32-extra v35-garnish" aria-label="가니쉬 조리대"><div class="v32-extra-head"><span>GARNISH / 가니쉬</span><span class="v32-extra-count">${String(unlockedGarnishes().length).padStart(2,'0')} AVAILABLE</span></div><div class="v120-garnish-row">${unlockedGarnishes().length>4?`<button type="button" class="btn v120-garnish-arrow" data-garnish-page="prev"  aria-label="이전 가니시 4개">‹</button>`:`<span class="v120-garnish-arrow-placeholder" aria-hidden="true"></span>`}<div class="v35-garnish-grid">${unlockedGarnishes().slice(Math.min(v119GarnishPage,Math.max(0,Math.ceil(unlockedGarnishes().length/4)-1))*4,Math.min(v119GarnishPage,Math.max(0,Math.ceil(unlockedGarnishes().length/4)-1))*4+4).map(g=>garnishCard(g,s.extra===g.id,!isOpen||!selectedOrder('drink'))).join('')}</div>${unlockedGarnishes().length>4?`<button type="button" class="btn v120-garnish-arrow" data-garnish-page="next"  aria-label="다음 가니시 4개">›</button>`:`<span class="v120-garnish-arrow-placeholder" aria-hidden="true"></span>`}</div></section>`:''}<div class="ingredient-count">${esc(countStr())} · ${s.mix.length}/10</div><div class="tools"><button class="btn ${s.ice?'active':''}" id="iceBtn" ${!isOpen||!selectedOrder('drink')?'disabled':''}>❄ 얼음 ${s.iceCount?`${s.iceCount}회`:'추가'}</button><button class="btn ${s.stirred?'active':''}" id="stirBtn" ${!isOpen||!selectedOrder('drink')||!s.mix.length||s.mixAt===s.mix.length&&s.stirred?'disabled':''}>↻ 섞기 ${s.stirred&&s.mixAt===s.mix.length?'완료':'실행'}</button><button class="btn" id="clearBtn" ${!s.mix.length&&!s.ice&&!s.stirred&&!s.extra?'disabled':''}>▤ 쓰레기통</button></div><div class="actions"><button class="btn primary" id="finishBtn" ${!isOpen||!selectedOrder('drink')||!s.mix.length?'disabled':''}>완성 · 카운터에 놓기</button></div></div><div class="cupbox"><div class="note">제조 중인 컵</div><div class="cup">${s.stirred?`<div class="layer" style="height:${s.mixAt*14}px;background:${blendColor(s.mix.slice(0,s.mixAt))}"></div>`+s.mix.slice(s.mixAt).map(x=>`<div class="layer" style="background:${ingredients.find(a=>a[0]===x)[2]}"></div>`).join(''):s.mix.map(x=>`<div class="layer" style="background:${ingredients.find(a=>a[0]===x)[2]}"></div>`).join('')}${iceVisual(s.iceCount)}${s.extra?`<span class="v54-cup-garnish v54-garnish-${esc(s.extra)}" title="${esc(garnishById(s.extra)?.name||'가니쉬')}">${esc(({sunfruit:'✿',citrus:'◉',mint:'❧',cherry:'●',chocoball:'◉',tapioca:'◌',coffeejelly:'▦',whippedcream:'❀',berrymix:'✿',mintchoco:'❧',fire:'♨',flower:'✿'})[s.extra]||'✦')}</span>`:''}</div><div class="note">${s.stirred?`혼합 ${s.mixAt}단위${s.mix.length>s.mixAt?' + 위쪽 층 '+(s.mix.length-s.mixAt)+'단위':''}`:esc(s.mix.join(' → ')||'—')}</div></div></div>`;
}else{let bases=['육류','버섯','감자','채소','곡물 반죽',...(s.day>=21?['생선']:[])],sauces=['소금','매운 양념','허브','달콤한 소스'],kinds=s.day>=10?['구이','볶음','국물','튀김',...(mzNonheatUnlocked()?['비가열']:[])]:['구이','볶음','국물'];const buttons=(arr,field)=>arr.map(v=>`<button class="btn ${s[field]===v?'active':''}" data-field="${field}" data-value="${esc(v)}" ${!isOpen||!selectedOrder('food')?'disabled':''}>${esc(v)}</button>`).join('');html=`<div class="foodgrid"><div><div class="note">주재료</div><div class="actions">${buttons(bases,'foodBase')}</div><div class="note" style="margin-top:14px">양념</div><div class="actions">${buttons(sauces,'foodSauce')}</div>${s.day>=7&&foodMarketItems().length?`<section class="v54-food-addons"><div class="note">추가 재료 · 최대 2종</div><div class="actions">${foodMarketItems().map(m=>`<button type="button" class="btn v54-food-addon ${s.foodAddons.includes(m.id)?'active is-selected':''}" data-food-addon="${m.id}" aria-pressed="${s.foodAddons.includes(m.id)?'true':'false'}" ${!isOpen||!selectedOrder('food')?'disabled':''}>${s.foodAddons.includes(m.id)?'✓ ':''}${esc(m.name)}</button>`).join('')}</div></section>`:''}</div><div><div class="note">조리 방식</div><div class="actions">${buttons(kinds,'foodKind')}</div>${s.day>=10?`<div class="note" style="margin-top:14px">추가 가열 · 선택 사항</div><div class="actions"><button class="btn" id="heatMinus" ${!isOpen||s.foodHeat<=0?'disabled':''}>−</button><span class="note" style="align-self:center;min-width:54px;text-align:center">${s.foodHeat||0}회</span><button class="btn" id="heatPlus" ${!isOpen||s.foodHeat>=10||s.foodKind==='비가열'?'disabled':''}>+</button></div>`:''}<div class="cupbox" style="min-height:90px;margin-top:12px"><div style="font-size:30px">◉</div><div class="note">${esc([s.foodBase,s.foodSauce,s.foodKind,...(s.foodAddons||[]).map(id=>marketCatalog.find(m=>m.id===id)?.name||id),...(s.foodHeat?['추가 가열 '+s.foodHeat+'회']:[])].filter(Boolean).join(' · ')||'—')}</div></div></div></div><div class="station-foot" style="margin-top:12px"><button class="btn" id="foodClear">재료 비우기</button><button class="btn primary" id="foodMake" ${!isOpen||!selectedOrder('food')||!s.foodBase||!s.foodSauce||!s.foodKind?'disabled':''}>조리 완료 · 카운터에 놓기</button></div>`;}
$('stationBody').innerHTML=(s.stationError&&isOpen?`<div class="station-error" role="status">! ${esc(s.stationError)}</div>`:'')+html;
$('stationBody').querySelectorAll('[data-food-addon]').forEach(b=>b.onclick=()=>{const id=b.dataset.foodAddon;if(!hasMarketItem(id))return;const list=s.foodAddons||[];s.foodAddons=list.includes(id)?list.filter(x=>x!==id):list.length<2?[...list,id]:list;s.stationError=null;render()});$('stationBody').querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addIng(b.dataset.add));$('stationBody').querySelectorAll('[data-field]').forEach(b=>b.onclick=()=>{s[b.dataset.field]=b.dataset.value;if(b.dataset.field==='foodKind'&&s.foodKind==='비가열')s.foodHeat=0;s.stationError=null;render()});$('stationBody').querySelectorAll('[data-garnish-page]').forEach(b=>b.onclick=()=>{const max=Math.max(0,Math.ceil(unlockedGarnishes().length/4)-1);v119GarnishPage=(v119GarnishPage+(b.dataset.garnishPage==='next'?1:-1)+(max+1))%(max+1);renderStation()});$('stationBody').querySelectorAll('[data-garnish]').forEach(b=>b.onclick=()=>{const id=b.dataset.garnish;if(!unlockedGarnishes().some(g=>g.id===id))return;const adding=s.extra!==id;s.extra=adding?id:null;s.stationError=null;if(adding)playEffect('topping');render()});for(let [id,fn] of [['iceBtn',()=>{const max=s.day>=10?3:1;s.iceCount=((s.iceCount||0)+1)%(max+1);s.ice=!!s.iceCount;s.stationError=null;render()}],['clearBtn',()=>{clearDrink();render()}],['stirBtn',()=>{if(s.mix.length&&(!s.stirred||s.mixAt<s.mix.length)){s.stirred=true;s.mixAt=s.mix.length;s.stationError=null;render()}}],['finishBtn',makeDrink],['heatMinus',()=>{s.foodHeat=Math.max(0,(s.foodHeat||0)-1);render()}],['heatPlus',()=>{if(s.foodKind!=='비가열')s.foodHeat=Math.min(10,(s.foodHeat||0)+1);render()}],['foodClear',()=>{s.foodBase=s.foodSauce=s.foodKind=null;s.foodAddons=[];s.foodHeat=0;s.extra=null;s.stationError=null;render()}],['foodMake',makeFood]]){let el=$(id);if(el)el.onclick=fn}}

function waitingLeft(){
 return Math.max(0,Math.ceil(((s.waitUntil||0)-Date.now())/1000));
}

function waitTick(){
 if(s.phase!=='open'||s.sub!=='interlude'||bootScreen!=='none')return;
 if(!s.waitUntil){s.waitUntil=Date.now()+WAIT_SECONDS[Math.min(s.visit,WAIT_SECONDS.length-1)]*1000}
 if(waitingLeft()===0){endWaiting();return}
}

function v48RenderWallet(){
 let chip=$('v48Wallet');if(!chip){chip=document.createElement('span');chip.id='v48Wallet';chip.className='v54-wallet-status';chip.setAttribute('aria-label','현재 보유 자금');$('phaseLabel').replaceWith(chip);}
 chip.innerHTML='<span aria-hidden="true" class="v54-wallet-dot"></span><b>'+marketBalance().toLocaleString()+'</b><small>CR</small>';
}

/* v290: position CSS decoration from REAL rendered liquid bounds. This avoids
   fixed pixel positions, percent-of-cup guessing and bubbles escaping the fill. */
let mz289ResizeBound=false;

function mz289DecorateLiquid(root=document){
 // The menu lab redraws its preview independently from the main game.
 // Limit each refresh to that screen so unrelated cups keep their animation.
 if(!root||typeof root.querySelectorAll!=='function')root=document;
 if(!mz289ResizeBound){window.addEventListener('resize',()=>mz289DecorateLiquid(),{passive:true});mz289ResizeBound=true;}
 const holders=root.querySelectorAll('.cup, .served-cup');
 holders.forEach(holder=>{
  const liquid=holder.classList.contains('served-cup')?holder.querySelector('.served-liquid'):holder;
  if(!liquid)return;
  const layers=holder.classList.contains('served-cup')?[...liquid.children].filter(x=>x.tagName==='I'):[...holder.children].filter(x=>x.classList.contains('layer'));
  liquid.querySelector('.mz289-fluid-fx')?.remove();
  if(!layers.length)return;
  const containerBox=liquid.getBoundingClientRect();
  const bounds=layers.map(x=>x.getBoundingClientRect());
  const top=Math.max(0,Math.min(...bounds.map(x=>x.top))-containerBox.top);
  const bottom=Math.min(containerBox.height,Math.max(...bounds.map(x=>x.bottom))-containerBox.top);
  if(!(bottom-top>1))return;
  const fx=document.createElement('div');
  fx.className='mz289-fluid-fx';
  fx.setAttribute('aria-hidden','true');
  // Keep animation coordinates in the full cup instead of the changing
  // filled-height box. Only the visible section is clipped to actual liquid.
  // Adding a layer now reveals more liquid without moving existing bubbles.
  fx.style.top='0px';
  fx.style.height=containerBox.height+'px';
  fx.style.clipPath='inset('+top+'px 0px '+Math.max(0,containerBox.height-bottom)+'px 0px)';
  // A small set of independently animated bubbles; positions and travel
  // always resolve against the CURRENT fluid container, not the viewport.
  const tiny=holder.classList.contains('served-cup');
  const specs=tiny?[[27,'small',13.5,-4.2,2],[70,'large',18.5,-9.0,3]]:
   [[20,'small',14.5,-2.0,3],[64,'large',21.0,-11.0,4],[43,'small',17.5,-7.5,2],[79,'small',24.0,-16.5,3]];
  specs.forEach(([left,size,duration,delay,wiggle])=>{
   const b=document.createElement('span');
   b.className='mz289-bubble '+size;
   b.style.setProperty('--bubble-x',left+'%');
   b.style.setProperty('--bubble-wiggle',wiggle+'%');
   b.style.setProperty('--bubble-duration',duration+'s');
   // renderStation recreates the whole cup on every ingredient addition.
   // Synchronize each replacement animation to a stable page clock so it
   // resumes at the same phase rather than restarting from its first frame.
   b.style.setProperty('--bubble-delay',(delay-performance.now()/1000)+'s');
   fx.appendChild(b);
  });
  liquid.appendChild(fx);
 });
}
