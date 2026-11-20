/* MILE ZERO data — Ingredients, drink/food recipes, garnishes, special orders, food atlas.
   Plain top-level constants shared with js/game.js; load before it. */
'use strict';

// ===== BASE RECIPES / DRINK & FOOD =====
const ingredients=[['C','클리어','#c7d4dc'],['A','앰버','#dfa84a'],['R','루비','#d66378'],['V','베르데','#6ead88'],['B','블루','#75a9df']];

const drinks=[
{name:'게이트 라이트',seq:'BBRRA',mode:'mix'}, {name:'블루 아워',seq:'VABBB',mode:'layer'}, {name:'애프터 시프트',seq:'CCAAV',mode:'mix'}, {name:'루비 라인',seq:'RRBBV',mode:'layer'}, {name:'나이트 드라이브',seq:'CCRRBB',mode:'mix'}, {name:'라스트 마일',seq:'AACCB',mode:'layer'}, {name:'프리즘',seq:'RRAVBB',mode:'layer'}, {name:'프리즘 믹스',seq:'RRAVBB',mode:'mix'}, {name:'오버 더 호라이즌',seq:'AARRBBB',mode:'partial',mixAt:4,extra:'citrus',unlockDay:5}, {name:'선셋 로드',seq:'BBCCRRAA',mode:'partial',mixAt:4,extra:'sunfruit',unlockDay:9999}];

const foods=[{name:'소금구이 꼬치',base:'육류',sauce:'소금',kind:'구이'},{name:'칠리 버섯볶음',base:'버섯',sauce:'매운 양념',kind:'볶음'},{name:'허브구이 감자',base:'감자',sauce:'허브',kind:'구이'},{name:'가든 야채스프',base:'채소',sauce:'소금',kind:'국물'},{name:'허니 팬케이크',base:'곡물 반죽',sauce:'달콤한 소스',kind:'구이'},{name:'스파이시 그릴 미트',base:'육류',sauce:'매운 양념',kind:'구이'}];

const fishRecipes=[{name:'피쉬 커틀릿',base:'생선',sauce:'허브',kind:'튀김'},{name:'생선구이',base:'생선',sauce:'소금',kind:'구이'},{name:'매운탕',base:'생선',sauce:'매운 양념',kind:'국물'}];

const friedRecipes=[{name:'크리스피 치킨',base:'육류',sauce:'소금',kind:'튀김',unlockDay:10},{name:'허니버터 감자튀김',base:'감자',sauce:'달콤한 소스',kind:'튀김',unlockDay:10},{name:'양념 치킨',base:'육류',sauce:'매운 양념',kind:'튀김',unlockDay:10}];

const nonheatRecipes=[
 {name:'육회',base:'육류',sauce:'소금',kind:'비가열'},
 {name:'샐러드',base:'채소',sauce:'허브',kind:'비가열'}
];

const mechanicRecipe={name:'훈연 바삭 꼬치',base:'육류',sauce:'소금',kind:'구이',addons:['smoke','crisp']};

// Recipes obtained by buying ingredients. No second purchase or experimental crafting needed.
// Stored as registered recipes so the existing recipe book and save format still apply.
const marketRecipeRewards=[
 {required:['mint'],name:'베르단트 헤이즈',kind:'drink',seq:'BBCVVV',mode:'layer',extra:'mint'},
 {required:['smoke'],name:'훈연 허브 버섯구이',kind:'food',foodBase:'버섯',foodSauce:'허브',foodKind:'구이',addons:['smoke']},
 {required:['fire'],name:'파이어 앤드 저스티스',kind:'drink',seq:'CCCCC',mode:'mix',extra:'fire'},
 {required:['chocoball'],name:'카라멜 쇼콜라',kind:'drink',seq:'AAAAARR',mode:'mix',extra:'chocoball'},
 {required:['mint','chocoball'],name:'프로스트 카카오',kind:'drink',seq:'AAVBB',mode:'mix',extra:'mintchoco'},
 {required:['rice'],name:'제육볶음밥',kind:'food',foodBase:'육류',foodSauce:'매운 양념',foodKind:'볶음',addons:['rice']},
 {required:['curry'],name:'스파이시 카레 우동',kind:'food',foodBase:'곡물 반죽',foodSauce:'매운 양념',foodKind:'국물',addons:['curry']},
 // DAY 36: fish is a DAY 21 automatic base ingredient, NOT a market purchase.
 // Sushi unlocks only after the DAY 35 nonheat story reward and BOTH addon purchases.
 {required:['rice','vinegar'],name:'초밥',kind:'food',foodBase:'생선',foodSauce:'소금',foodKind:'비가열',addons:['rice','vinegar']},
 // DAY40 weekend market additions: automatically register on purchasing required addons.
 {required:['cheese'],name:'치즈퐁듀',kind:'food',foodBase:'육류',foodSauce:'달콤한 소스',foodKind:'구이',addons:['cheese']},
 {required:['rice','kimchi'],name:'김치볶음밥',kind:'food',foodBase:'육류',foodSauce:'매운 양념',foodKind:'볶음',addons:['rice','kimchi']},
 // DAY 16: mix A2+C2, then place A2 above the mixed base.
 {required:['coffeejelly'],name:'앰버 누아르',kind:'drink',seq:'AACCAA',mode:'partial',mixAt:4,extra:'coffeejelly'},
 // DAY 19: mix V2+B3, then layer V2 and B1; finish with whipped cream.
 {required:['whippedcream'],name:'그린 플로트',kind:'drink',seq:'VVBBBVVB',mode:'partial',mixAt:5,extra:'whippedcream'},
 // DAY 24: mix the bottom R2+B2, then layer R, B, R in this exact order.
 {required:['berrymix'],name:'베리 피즈',kind:'drink',seq:'RRBBRBR',mode:'partial',mixAt:4,extra:'berrymix'}
];

// Preserve the authored introduction for the two explicitly designated custom-order guests.
// All other Day 10 guests keep their full authored dialogue and orders.
// ===== STORY / ORDER SEPARATION =====
// Author-written personal scenes are preserved. Only the original order request
// is replaced when a seeded variant changes the actual requested recipe.
const customOrderTemplates={
 drink:[
  (n)=>`이 지점에서 만든 ${n}, 그걸로 한 잔 부탁할게요.`,
  (n)=>`전에 본 ${n} 그게 궁금했어요. 오늘은 그걸 마셔볼게요.`,
  (n)=>`늘 마시던 것 말고 ${n} 이걸로 골라볼게요.`,
  (n)=>`여기서 직접 만든 메뉴라면서요? ${n} 한 잔 주세요.`,
  (n)=>`메뉴판에 있는 ${n}, 유독 눈에 띄네요. 그걸로 부탁해요.`
 ],
 food:[
  (n)=>`여기서 개발한 ${n}, 그런 이름의 음식이 있네요. 그걸로 먹어볼게요.`,
  (n)=>`늘 먹던 것 말고 ${n} 메뉴로 부탁해요.`,
  (n)=>`이 지점에서만 파는 ${n}, 한번 먹어보고 싶네요.`,
  (n)=>`오늘은 ${n} 메뉴로 먹어볼게요.`,
  (n)=>`직접 개발하셨다는 ${n} 하나 주세요.`
 ]
};

// DAY 13–15: one optional special-menu order per day, using only recipes the player actually has.
// Existing narrative and fallback orders stay fixed; the selected option never rerolls on re-render.
// Deterministic, extensible special-menu requests for normal and endless shifts.
// Each choice is generated once from a stable save seed and visit key: no reroll on render.
const MZ_SPECIAL_ORDER_INTROS={
 market:[
  (n,kind)=>`관문 시장에서 새 재료를 들여왔다고 하더라고요. ${n}${kind==='drink'?' 한 잔':' 하나'} 맛볼 수 있을까요?`,
  (n,kind)=>`메뉴를 보다가 ${n}에 눈이 갔어요. 오늘은 그걸 부탁할게요.`,
  (n,kind)=>`평소 먹던 것 말고 ${n}${kind==='drink'?'으로 한 잔':'으로 한 접시'} 주문해 볼게요.`,
  (n,kind)=>`${n}라는 메뉴가 있네요? 이름이 궁금해서요. 하나 주세요.`,
  (n,kind)=>`오늘은 새로 들여온 재료가 들어간 ${n}로 부탁드려요.`,
  (n,kind)=>`잠깐 고민했는데 결정했어요. ${n} 주세요.`
 ],
 custom:[
  (n,kind)=>`여기에서 직접 개발한 ${n}, 오늘은 그걸로 해볼게요.`,
  (n,kind)=>`지점 한정이라고 적힌 ${n}이 궁금했어요. 하나 부탁합니다.`,
  (n,kind)=>`다른 가게에는 없다는 ${n}${kind==='drink'?' 한 잔':' 한 접시'} 주세요.`,
  (n,kind)=>`${n}은 이름부터 특이하네요. 한번 먹어보고 싶어요.`,
  (n,kind)=>`단골이 추천해 준 ${n}, 그거 하나 부탁드릴게요.`,
  (n,kind)=>`이곳에서만 판매하는 ${n}로 골랐어요.`
 ]
};

const MZ_SPECIAL_ORDER_REACTIONS={
 drink:[
  '잘 마셨습니다. 생각보다 향이 오래 남네요.',
  '이런 맛이었군요. 다음에도 생각날 것 같아요.',
  '오, 마시고 나니 기분이 달라지네요. 고맙습니다.',
  '처음 마셔 봤는데 제법 취향에 맞아요.',
  '색도 재미있고 맛도 좋네요. 잘 마셨어요.',
  '오늘 메뉴 선택은 성공이네요.'
 ],
 food:[
  '잘 먹었습니다. 재료가 잘 어울리네요.',
  '한 접시 시키길 잘했어요. 든든하네요.',
  '향이 좋네요. 다음엔 다른 안주도 먹어보고 싶어요.',
  '생각하던 맛과 조금 다른데, 마음에 들어요.',
  '따뜻한 음식 먹고 나니까 피로가 풀리네요.',
  '좋은 선택이었어요. 잘 먹었습니다.'
 ]
};

// ===== GARNISH / MARKET DATA =====
const garnishCatalog=[
 {id:'citrus',name:'시트러스 슬라이스',source:'daily',unlockDay:5,group:'안전도시',category:['가니쉬','과실'],taste:['과실 향', '상큼함'],description:'안전도시 재배 시설에서 공급되는 얇은 감귤류 슬라이스.',hiddenTags:[],symbol:'◉'},
 {id:'mint',name:'민트 리프',source:'market',unlockDay:7,group:'안전도시 유통',category:['가니쉬','허브'],taste:['청량함', '허브 향'],description:'신선한 허브 잎. 안전도시에서는 드물게 느껴지는 자연의 향이다.',hiddenTags:[],symbol:'✣'},
 {id:'cherry',name:'캔디드 체리',source:'market',unlockDay:7,group:'안전도시 유통',category:['가니쉬','과실'],taste:['과실 향', '달콤함'],description:'음료 위에 얹는 설탕절임 체리 장식. 부드러운 단맛과 과일 향이 특징이다.',hiddenTags:[],symbol:'●'},
 {id:'sugar',name:'슈가 크리스털',source:'market',unlockDay:9,group:'안전도시 유통',category:['가니쉬','당류'],taste:['달콤함', '바삭함'],description:'안전도시에서 생산하는 식용 결정 장식. 음료 가장자리에 반짝이는 단맛을 더한다.',hiddenTags:[],symbol:'✧'},
 {id:'chocoball',name:'초코칩',source:'market',unlockDay:10,group:'안전도시 유통',category:['가니쉬','토핑'],taste:['달콤함', '쌉싸름함'],description:'작게 부순 초콜릿 조각. 음료에 달콤한 맛과 씹는 재미를 더한다.',hiddenTags:[],symbol:'●'},
 {id:'tapioca',name:'타피오카 펄',source:'market',unlockDay:10,group:'안전도시 유통',category:['가니쉬','토핑'],taste:['고소함', '쫀득함'],description:'말랑하고 쫀득한 식감이 특징인 음료용 펄 토핑.',hiddenTags:[],symbol:'◌'},
 {id:'mintchoco',name:'민트초코 토핑',source:'combination',unlockDay:10,group:'조합 토핑',category:['가니쉬','토핑'],taste:['허브 향', '쌉싸름함', '달콤함'],description:'민트향과 초콜릿 맛이 입안을 가득 채운다. 듣자하니 이 맛의 마니아들이 많다며?',hiddenTags:[],symbol:'❧'},
 {id:'coffeejelly',name:'커피 젤리',source:'market',unlockDay:16,group:'안전도시 유통',category:['가니쉬','토핑'],taste:['쌉싸름함','쫀득함'],description:'쌉싸름한 커피 맛 젤리 큐브. 화려한 카페인이 당신을 감싼다.',hiddenTags:[],symbol:'▦'},
 {id:'whippedcream',name:'휘핑 크림',source:'market',unlockDay:19,group:'안전도시 유통',category:['가니쉬','토핑'],taste:['달콤함','고소함'],description:'휘핑크림 마니 쥬세요! (귀엽다는 듯 웃기)',hiddenTags:[],symbol:'❀'},
 {id:'berrymix',name:'베리 믹스',source:'market',unlockDay:24,group:'안전도시 유통',category:['가니쉬','과실'],taste:['상큼함','신맛'],description:'여러 종류의 베리를 섞은 믹스. 김곡게는 못 먹는다.',hiddenTags:[],symbol:'✿'},
 {id:'fire',name:'불',source:'market',unlockDay:26,group:'안전도시 유통',category:['가니쉬','연출'],taste:['연출적'],description:'불입니다. 정말로요.',hiddenTags:[],symbol:'♨'},
 {id:'flower',name:'꽃',source:'event',unlockDay:43,group:'황무지 교류',category:['가니쉬','연출'],taste:['연출적'],description:'황무지 정착지에서 보내온 식용 꽃. 말려서 음료에 올릴 수 있다.',hiddenTags:[],symbol:'✿'},
 {id:'sunfruit',name:'석양열매',source:'event',unlockDay:3,group:'황무지 운송',category:['가니쉬','과실'],taste:['달콤함', '과실 향', '신맛'],description:'황무지에서 들여온 과실. 특유의 붉은 이파리가 석양빛을 닮아 석양열매라 부른다.',hiddenTags:['황무지'],symbol:'◆'}
];

// A hidden tag is narrative metadata, never rendered in the public atlas.
const guestGarnishReactions={
 '황무지 출신 정착민':{'황무지':[
  ['황무지 출신 정착민','어, 이거 석양열매 아닌가요?'],
  ['황무지 출신 정착민','밖에 있을 때 가끔 먹곤 했어요. 안전도시에 와서 다시 볼 줄은 몰랐네요.'],
  ['황무지 출신 정착민','여기서도 이걸 먹을 수 있네요. 잘 마셨습니다.']
 ]},
 '토르반':{'황무지':[
  ['토르반','오, 이거 제가 가져온 석양열매잖아요!'],
  ['토르반','음료에 얹어 놓으니 또 다르게 보이네요. 다음번에 가져올 물건도 기대해 주세요.']
 ]}
};

const ingredientEntries=[
 {id:'C',title:'클리어 / CLEAR',category:['알코올','베이스'],taste:['드라이', '깔끔함'],desc:'투명한 증류주 베이스. 음료에 알코올 성분과 드라이한 맛을 더한다.',color:'#c7d4dc'},
 {id:'A',title:'앰버 / AMBER',category:['시럽','베이스'],taste:['달콤함', '고소함'],desc:'곡물과 당밀을 사용한 시럽. 단맛과 구수한 향을 더한다.',color:'#dfa84a'},
 {id:'R',title:'루비 / RUBY',category:['과실','베이스'],taste:['신맛', '과실 향'],desc:'붉은 과실의 농축액. 새콤한 과일 풍미를 더한다.',color:'#d66378'},
 {id:'V',title:'베르데 / VERDE',category:['허브','베이스'],taste:['쌉싸름함', '허브 향'],desc:'향이 진한 허브 추출액. 쌉쌀한 허브 향을 더한다.',color:'#6ead88'},
 {id:'B',title:'블루 / BLUE',category:['탄산','베이스'],taste:['청량함', '깔끔함'],desc:'미네랄을 함유한 탄산수. 음료에 청량감을 더한다.',color:'#75a9df'}
];

// Centralized tag definitions for the ingredient atlas, guest memories and later research market.
// Category and sensory tags are visible. Narrative tags stay hidden from the UI.
const materialTagCatalog={
 C:{id:'C',name:'클리어',kind:'drink',category:['알코올','베이스'],taste:['드라이', '깔끔함'],hiddenTags:[]},
 A:{id:'A',name:'앰버',kind:'drink',category:['시럽','베이스'],taste:['달콤함', '고소함'],hiddenTags:[]},
 R:{id:'R',name:'루비',kind:'drink',category:['과실','베이스'],taste:['신맛', '과실 향'],hiddenTags:[]},
 V:{id:'V',name:'베르데',kind:'drink',category:['허브','베이스'],taste:['쌉싸름함', '허브 향'],hiddenTags:[]},
 B:{id:'B',name:'블루',kind:'drink',category:['탄산','베이스'],taste:['청량함', '깔끔함'],hiddenTags:[]}
};

const v32FoodAtlas=[
 ['생선',['식재료','단백질'],['담백함', '감칠맛']],['육류',['식재료','단백질'],['감칠맛']],['버섯',['식재료','채소'],['담백함', '감칠맛']],
 ['감자',['식재료','채소'],['고소함', '담백함']],['채소',['식재료','채소'],['담백함', '깔끔함']],
 ['곡물 반죽',['식재료','곡물'],['고소함', '담백함']],['소금',['양념'],['짠맛']],
 ['매운 양념',['양념'],['매콤함']],['허브',['양념'],['허브 향']],
 ['달콤한 소스',['양념'],['달콤함']]
];

// Food descriptions are concise reference copy, not additional recipe requirements.
const v41FoodDescriptions={
 '생선':'새로 발견된 황무지의 커다란 호수에서 잡힌 식용 생선. 담백한 살은 굽거나 튀기고, 국물에 넣어도 어울린다.',
 '육류':'풍부한 감칠맛과 묵직한 풍미가 특징인 단백질 재료. 잉크 보존 기술 덕분에 이 곳까지 유통되어 올 수 있다.',
 '버섯':'은은한 향과 감칠맛을 가진 재료. 볶거나 국물에 넣으면 풍미가 깊어진다.',
 '감자':'담백하고 고소한 전분질 재료. 안전도시민과 황무지민 모두 감자를 사랑한다.',
 '채소':'산뜻하고 부드러운 맛을 내는 재료. 한때 싱싱한 채소는 안전도시 내에서는 보기 힘들었다.',
 '곡물 반죽':'곡물의 고소한 풍미가 있는 반죽. 구우면 빵이 되고, 길게 늘이면 면이 되는 가능성의 집합체.',
 '소금':'재료 본연의 맛을 또렷하게 살리는 기본 양념.',
 '매운 양념':'음식에 알싸한 매운맛과 강한 풍미를 더하는 양념.',
 '허브':'허브 향을 더하는 향신 재료. 구운 재료에 산뜻한 인상을 준다.',
 '달콤한 소스':'음식에 부드러운 단맛을 더하는 소스. 이것만 먹으면 어린이 입맛이다.'
};
