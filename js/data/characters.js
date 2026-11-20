/* MILE ZERO data — Portrait layers and pools, regular-customer profiles, clue/expression/desk catalogs.
   Plain top-level constants shared with js/game.js; load before it. */
'use strict';

const MZ_EXPRESSION_TAGS={일반:'normal',웃음:'smile',의문:'question',normal:'normal',smile:'smile',question:'question'};

// MY DESK: image-free, free-position wall/shelf/table display. Save state stays in the normal slot.
const MZ_DESK_CATALOG=[
 {id:'smallframe',name:'작은 액자',icon:'▣',zone:'wall',price:550,unlockDay:13,description:'작은 그림이나 사진을 걸어 둘 수 있는 액자. 빈 벽 한쪽을 채운다.'},
 {id:'glassbottle',name:'유리병 장식',icon:'♙',zone:'surface',price:600,unlockDay:18,description:'유리병 안에 작은 이끼 공이 들어 있다. 이게 그 \'마리오\'라는 건가?'},
 {id:'minivase',name:'미니 화병',icon:'❀',zone:'surface',price:700,unlockDay:23,description:'아담한 도자기 화병. 사장님이 준 주황색 꽃을 꽂았다.'},
 {id:'minilight',name:'관문 모형 조명',icon:'✺',zone:'surface',price:1100,unlockDay:28,description:'관문의 빛 기둥을 본뜬 작은 조명. 실물보다 훨씬 얌전하게 빛난다.'},
 {id:'postcard',name:'엽서',icon:'▧',zone:'wall',price:250,unlockDay:7,description:'관문시장 좌판에서 발견한 엽서. 작은 그림 한 장만으로도 낯선 곳을 떠올릴 수 있다.'},
 {id:'poster',name:'작은 포스터',icon:'▤',zone:'wall',price:450,unlockDay:11,description:'작은 공간에도 걸기 좋은 포스터. 빈 벽에 색을 더한다.'},
 {id:'memo',name:'메모 장식',icon:'▥',zone:'wall',price:350,unlockDay:16,description:'짧은 메모를 붙여 둘 수 있는 벽 장식. 장 볼 목록을 적기에 딱 좋다.'},
 {id:'clock',name:'벽시계',icon:'◷',zone:'wall',price:750,unlockDay:21,description:'기나긴 밤을 보내는 사람을 위한 벽시계. 조용히 시간을 가리킨다.'},
 {id:'plant',name:'작은 화분',icon:'♧',zone:'surface',price:400,unlockDay:7,description:'작은 화분. 책상 한쪽에 싱그러운 색을 더해 준다.'},
 {id:'cup',name:'기념 컵',icon:'▱',zone:'surface',price:300,unlockDay:7,description:'관문시장에서 구한 안전도시 기념 컵. 마시는 용도보다는 장식에 가깝다.'},
 {id:'books',name:'책 묶음',icon:'▥',zone:'surface',price:550,unlockDay:11,description:'얇은 책 몇 권. 대충 읽을 만한 내용들이다.'},
 {id:'lamp',name:'봉제 인형',icon:'♧',zone:'surface',price:1000,unlockDay:21,description:'작은 봉제 인형. 꾹 누르면 부드럽게 떨린다. 따뜻하다.'},
 {id:'figure',name:'작은 장식품',icon:'✦',zone:'surface',price:850,unlockDay:26,description:'어디서 만들어졌는지 알 수 없는 작은 장식품. 반짝이는 모양이 눈길을 끈다.'},
 {id:'box',name:'태엽 오르골',icon:'♫',zone:'surface',price:1500,unlockDay:31,description:'태엽을 감으면 느린 멜로디가 흘러나온다. 생각보다 오래 간다.'},
 {id:'foldcalendar',name:'접이식 탁상 달력',icon:'▤',zone:'surface',price:650,unlockDay:40,description:'한 장씩 넘겨 쓰는 작은 달력. 날짜마다 적어 둔 메모가 조금씩 다르다.'},
 {id:'glassweight',name:'투명 문진',icon:'◇',zone:'surface',price:800,unlockDay:40,description:'반투명한 유리 문진. 빛을 받으면 아래쪽에 작은 그림자가 생긴다.'}
 ,{id:'mile_logo_sticker',name:'MILE ZERO 로고 스티커',icon:'✧',zone:'wall',price:0,unlockDay:9999,source:'gift',description:'첫 주의 영업을 마친 뒤 얻은 MILE ZERO 로고 스티커. 작은 시작을 기념한다.'}
 ,{id:'mile_branch_certificate',name:'MILE ZERO 우수 지점 인증서',icon:'▣',zone:'wall',price:0,unlockDay:9999,source:'gift',description:'DAY 15에 공식 추천 지점으로 선정된 것을 기념하는 인증서. 관문 지점의 성과를 기록한다.'}
 ,{id:'maren_market_photo',name:'마렌과 찍은 장터 구경 사진',icon:'▧',zone:'wall',price:0,unlockDay:9999,source:'gift',description:'운송대 장터에서 마렌과 나란히 찍은 기념사진. 그날의 풍경이 남아 있다.'},
 {id:'freight_animal_photo',name:'작은 동물 사진',icon:'▧',zone:'wall',price:0,unlockDay:9999,source:'gift',description:'정기 화물 기사가 보내 준 사진. 새로 만든 작은 집 안에서 몸을 웅크리고 쉬는 동물의 모습이 담겨 있다.'},
 {id:'torban_wasteland_bouquet',name:'황무지의 꽃다발',icon:'✿',zone:'surface',price:0,unlockDay:9999,source:'gift',description:'토르반의 아내가 황무지에서 가져온 꽃들을 직접 묶어 준 꽃다발. 오래 보관할 수 있도록 손질되어 있다.'}
];

// v268: standing portraits share one 900x1200 base + transparent animated expression system.
// Add future expression paths under the corresponding character, keeping the base image unchanged.
const STANDING_LAYERS={
 maren:{label:'마렌',base:'assets/characters/maren-base.webp',expressions:{normal:'assets/characters/maren-expression-normal.webp',smile:'assets/characters/maren-expression-smile.webp',question:'assets/characters/maren-expression-question.webp'}},
 mechanic:{label:'야간 정비사',base:'assets/characters/night-mechanic-base.webp',expressions:{normal:'assets/characters/night-mechanic-expression-normal.webp'}},
 officeworker:{label:'인근 직장인',base:'assets/characters/office-worker-base.webp',expressions:{normal:'assets/characters/office-worker-expression-normal.webp'}},
 rian:{label:'리안',base:'assets/characters/rian-base.webp',expressions:{normal:'assets/characters/rian-expression-normal.webp'}},
 freight:{label:'정기 화물 기사',base:'assets/characters/freight-driver-base.webp',expressions:{normal:'assets/characters/freight-driver-expression-normal.webp'}},
 settler:{label:'황무지 출신 정착민',base:'assets/characters/settler-base.webp',expressions:{normal:'assets/characters/settler-expression-normal.webp'}},
 kairen:{label:'카이렌',base:'assets/characters/kairen-base.webp',expressions:{normal:'assets/characters/kairen-expression-normal.webp'}},
 mika:{label:'미카',base:'assets/characters/mika-base.webp',expressions:{normal:'assets/characters/mika-expression-normal.webp'}},
 torban:{label:'토르반',base:'assets/characters/torban-base.webp',expressions:{normal:'assets/characters/torban-expression-normal.webp'}},
 torbanwife:{label:'토르반의 아내',base:'assets/characters/torban-wife-base.webp',expressions:{normal:'assets/characters/torban-wife-expression-normal.webp'}},
 genericcasuala:{label:'일반 손님 · 일상복 A',base:'assets/characters/generic-casual-a.webp',expressions:{normal:'assets/characters/generic-casual-a.webp'}},
 genericcasualb:{label:'일반 손님 · 일상복 B',base:'assets/characters/generic-casual-b.webp',expressions:{normal:'assets/characters/generic-casual-b.webp'}},
 generictravela:{label:'일반 손님 · 여행복 A',base:'assets/characters/generic-travel-a.webp',expressions:{normal:'assets/characters/generic-travel-a.webp'}},
 generictravelb:{label:'일반 손님 · 여행복 B',base:'assets/characters/generic-travel-b.webp',expressions:{normal:'assets/characters/generic-travel-b.webp'}},
 genericworka:{label:'일반 손님 · 업무복 A',base:'assets/characters/generic-work-a.webp',expressions:{normal:'assets/characters/generic-work-a.webp'}},
 genericworkb:{label:'일반 손님 · 업무복 B',base:'assets/characters/generic-work-b.webp',expressions:{normal:'assets/characters/generic-work-b.webp'}},
 mukbanginfluencer:{label:'먹방 인플루언서',base:'assets/characters/mukbang-influencer.webp',expressions:{normal:'assets/characters/mukbang-influencer.webp'}},
 zeroinspector:{label:'ZERO 현장 점검 직원',base:'assets/characters/zero-field-inspector.webp',expressions:{normal:'assets/characters/zero-field-inspector.webp'}},
 redsonga:{label:'빨간 노래 손님 A',base:'assets/characters/red-song-guest-a.webp',expressions:{normal:'assets/characters/red-song-guest-a.webp'}},
 redsongb:{label:'빨간 노래 손님 B',base:'assets/characters/red-song-guest-b.webp',expressions:{normal:'assets/characters/red-song-guest-b.webp'}},
 gatewaiter30:{label:'DAY30 · 관문 대기객',base:'assets/characters/gate-waiting-guest-day30.webp',expressions:{normal:'assets/characters/gate-waiting-guest-day30.webp'}}
};

const MZ_GENERIC_SOLO_PORTRAIT_POOLS={casual:['genericcasuala','genericcasualb','generictravela','generictravelb','genericworka','genericworkb'],work:['genericworka','genericworkb'],travel:['generictravela','generictravelb']};

const MZ_GENERIC_GROUP_PORTRAIT_POOLS={duo:[],trio:[],crowd:[]};

const RIAN_FACE_WEBP='assets/characters/rian-face.webp';

const MECHANIC_FACE_WEBP='assets/characters/night-mechanic-face.webp';

const OFFICEWORKER_FACE_WEBP='assets/characters/office-worker-face.webp';

const MAREN_FACE_WEBP='assets/characters/maren-face.webp';

const FREIGHT_FACE_WEBP='assets/characters/freight-face.webp';

const SETTLER_FACE_WEBP='assets/characters/settler-face.webp';

const KAIREN_FACE_WEBP='assets/characters/kairen-face.webp';

const MIKA_FACE_WEBP='assets/characters/mika-face.webp';

const TORBAN_FACE_WEBP='assets/characters/torban-face.webp';

const FREIGHT_DAY36_PARTS_GIF='assets/characters/freight-driver-animal.webp';

// Discoveries are attached to actual dialogue events, not inferred from menu choices.
// A later regular-customer request may add a new evidence-backed entry here.
const customerClueCatalog=[
 {who:'야간 정비사',day:1,visit:3,tags:[],quote:''},
 {who:'황무지 출신 정착민',day:4,visit:2,tags:[],quote:''},
 {who:'리안',day:4,visit:4,tags:[],quote:''},
 {who:'야간 정비사',day:6,visit:2,tags:[],quote:''},
 {who:'마렌',day:7,visit:0,tags:[],quote:''},
 {who:'토르반',day:8,visit:3,tags:[],quote:''},
 {who:'황무지 출신 정착민',day:9,visit:5,tags:[],quote:''}
];

const regularCustomerNames=['야간 정비사','정기 화물 기사','인근 직장인','황무지 출신 정착민','마렌','리안','토르반','카이렌','미카'];

// Canonical preferences are authored, not inferred from every menu ordered.
// An unlock is shown only after a visit where the script establishes it.
// Undiscovered entries remain hidden until a later authored scene supplies evidence.
const mzRegularPreferences={
 "야간 정비사":{"like": ["얼음", "매콤함", "바삭함", "훈연 향"], "dislike": ["달콤함"], "discover": {"얼음": 1, "매콤함": 9, "바삭함": 11, "훈연 향": 8, "달콤함": 16}},
 "정기 화물 기사":{"like": ["육류", "매콤함", "청량함"], "dislike": ["알코올"], "discover": {"육류": 3, "매콤함": 17, "청량함": 17, "알코올": 6}},
 "인근 직장인":{"like": ["달콤함", "곡물 반죽", "담백함"], "dislike": ["매콤함", "신맛"], "discover": {"달콤함": 2, "곡물 반죽": 6, "담백함": 28, "매콤함": 11, "신맛": 11}},
 "황무지 출신 정착민":{"like": ["과실 향", "국물"], "dislike": ["얼음"], "discover": {"과실 향": 4, "국물": 22, "얼음": 7}},
 "마렌":{"like": ["담백함", "감자", "과실 향"], "dislike": [], "discover": {"담백함": 18, "감자": 6, "과실 향": 16}},
 "리안":{"like": ["국물", "채소", "층 유지"], "dislike": [], "discover": {"국물": 20, "채소": 4, "층 유지": 18}},
 "토르반":{"like": ["알코올", "깔끔함", "구이"], "dislike": [], "discover": {"알코올": 10, "깔끔함": 8, "구이": 36}},
 "카이렌":{"like": ["채소", "튀김", "생선"], "dislike": ["과실 향", "얼음"], "discover": {"채소": 17, "튀김": 21, "생선": 21, "과실 향": 15, "얼음": 30}},
 "미카":{"like": ["육류", "튀김", "얼음", "바삭함"], "dislike": ["신맛"], "discover": {"육류": 19, "튀김": 17, "얼음": 20, "바삭함": 27, "신맛": 37}}
};

// Narrative snapshots: show the story's *current* state, never later spoilers.
const mzRegularStoryMilestones={
 '야간 정비사':[
  {day:1,text:'관문 인근에서 야간 정비 일을 하며, 근무가 끝나면 가게에 들러 식사를 한다.'},
  {day:6,text:'오래전에 사라진 식당에서 먹던 바삭하고 훈연 향이 나는 음식을 기억한다.'},
  {day:8,text:'그 음식이 고기 꼬치였다는 사실을 떠올렸다. 익숙한 맛을 다시 찾고 싶어 한다.'},
  {day:8,requiresUnlock:'mechanic',text:'의뢰했던 훈연 바삭 꼬치를 맛보고 오래전 식당의 기억을 떠올렸다. 레시피 「훈연 바삭 꼬치」가 해금되었다.'}
 ],
 '정기 화물 기사':[
  {day:3,text:'정기 운송 노선을 오가며 운전 전후로 MILE ZERO에 들른다.'},
  {day:15,text:'최근 차 안에서 정체 모를 소리가 나기 시작해 차량 상태를 걱정하고 있다.'},
  {day:17,text:'짐칸에서 작은 동물을 발견했다. 먹을 것을 챙겨 주면서도 절대 정을 주지 않겠다고 주장한다.'},
  {day:24, text:"차 안에 눌러앉은 작은 동물의 사진을 보여 주었다. 처음에는 잠시 맡아 둘 생각이었지만 이제는 일상에서 계속 신경 쓰고 있다."},
  {day:33, text:"작은 동물을 처음 발견했던 황무지 근처로 다시 갈 기회가 생겼다. 돌려보내는 것이 맞을지 고민하며, 그곳이 안전한지 확인하려 한다."},
  {day:35, text:"결국 작은 동물과 계속 함께 지내기로 결정했다. 녀석의 먹이를 알아보다 식재료 납품업자에게 들은 비가열 조리법을 전해 주었다.", requiresUnlock:"nonheat"},
  {day:35, text:"차량 옆에서 작은 동물을 돌보는 동안 기사가 직접 쉴 자리를 만들었다. 완성된 집에 들어간 녀석의 사진을 기념으로 받았다.", requiresWeekendStory:"freight_care_35"}
 ],
 '인근 직장인':[
  {day:2,text:'늦은 퇴근과 잦은 야근에 지쳐 MILE ZERO에서 잠시 숨을 돌린다.'},
  {day:11,text:'퇴근 후에도 상사와 회의 걱정에서 쉽게 벗어나지 못한다.'},
  {day:23,text:'회사에서 급하다던 업무들이 미뤄지고, 자신이 맡던 일도 다른 쪽으로 넘어가고 있다. 이유를 알 수 없어 불안해한다.'},
  {day:25,text:'회사에서 해고 통보를 받았다. 술에 취해 가게를 찾아와 울면서, 이제 어디로 가야 할지 모르겠다고 털어놓았다.'},
  {day:31, text:"구직 공고를 보기 시작했지만, 지원 버튼을 누르는 것조차 망설이고 있다. 다시 비슷한 직장 생활을 반복할까 두려워한다."}
 ],
 '황무지 출신 정착민':[
  {day:2,text:'황무지에서 안전도시로 이주한 뒤, 어디서나 같은 메뉴를 먹을 수 있는 생활을 반가워한다.'},
  {day:9,text:'안전도시 안쪽에서 황무지 출신이라는 이유로 차별을 경험했다.'},
  {day:16,text:'안전도시 생활을 좋아하지만, 동료들 앞에서 자신의 출신을 어떻게 이야기해야 할지 망설였다.'},
  {day:18, text:"안전도시에 처음 들어왔을 때 마신 음료가 게이트 라이트였다고 이야기했다. 낯선 도시에서 마신 첫 잔을 지금도 기억하고 있다."},
  {day:36, text:"사실 황무지 시절의 동료들은 사고로 모두 세상을 떠났으며, 본인은 동료들이 없는 곳에서 더는 지내기 어려워 안전도시로 자리를 옮겼다고 털어놓았다."}
 ],
 '마렌':[
  {day:1,text:'관문 거리에서 오랫동안 점포를 운영해 온 상인이다.'},
  {day:9,text:'떠났던 옛 이웃이 다시 돌아와 가게를 열었다는 소식을 반가워했다.'},
  {day:16,text:'MILE ZERO의 추천 지점 선정을 축하하며, 늘어난 거리의 손님들 이야기를 들려줬다.'},
  {day:29, text:"관문 상권을 처음 찾는 손님들이 길을 헷갈리는 일이 잦아지자, 골목을 안내할 방법을 생각하기 시작했다."}
 ],
 '리안':[
  {day:2,text:'관문에서 근무하며, 교대가 끝나면 이 가게에 들른다.'},
  {day:11,text:'서류 문제로 방문객을 돌려보낸 뒤, 규정을 유지하면서도 더 잘 안내할 방법을 고민한다.'},
  {day:14,text:'방문 목적별 서류 안내표를 동료와 검토하며 누락된 경우를 보완하고 있다.'},
  {day:17,text:'안내표를 일부 창구에서 시험하고 이용객 반응을 반영해 표현을 개선하려 한다.'},
  {day:32, text:"관문 안내 개선의 성과를 인정받아, 새 정착민들이 지역 생활에 필요한 정보와 사람을 찾도록 돕는 업무로 승진했다."}
 ],
 '토르반':[
  {day:3,text:'황무지와 안전도시를 오가며 물자를 납품하는 운송대원이다.'},
  {day:8,text:'황무지에 있는 아내가 간식을 챙겨 주었다며 즐겁게 이야기한다. 아내는 달콤한 음식을 좋아하는 듯 하다.'},
  {day:11,text:'아내에게 도시에서만 맛볼 수 있는 것을 선물하고 싶어 한다.'},
  {day:16,text:'일 때문에 안전도시에 다시 들렀다. 아내와 함께 올 만한 장소를 여전히 알아보는 중이다.'},
  {day:29,text:'아내와 함께 MILE ZERO에 방문했다. 저물녘 운송길을 닮은 「선셋 로드」를 만들어 주었고, 아내에게서 「황무지의 꽃다발」을 선물받았다.'}
 ],
 '카이렌':[
  {day:13,text:'관문 출입 서류를 다시 준비한 끝에 안전도시에 들어와 가게를 찾았다.'},
  {day:15,text:'가게에 다시 들러 퉁명스럽지만 나름대로 음식 맛을 칭찬했다.'},
  {day:17,text:'미카를 데리고 가게에 방문했다. 서로 편하게 농담을 주고받는 사이로 보인다.'},
  {day:21, text:"새로운 튀김 메뉴를 먹고 감동했다."},
  {day:22, text:"도시에서의 일을 마무리하고 돌아갈 준비를 하면서도 다시 들렀다. 동료들과 함께 와 볼 생각도 내비쳤다."},
  {day:30, text:"미카가 예약한 일행과 함께 가게에 방문했다. 여럿이 둘러앉는 자리를 어색해하면서도 끝까지 함께했다."}
 ],
 '미카':[
  {day:17,text:'카이렌과 함께 처음 방문했다. 카이렌과 편하게 농담을 주고받는다.'},
  {day:19, text:"혼자서 다시 찾아와 고기 요리를 먹고 얼음을 넉넉히 넣은 음료를 주문했다."},
  {day:28, text:"동료들과 함께 가게를 방문할 수 있도록 DAY30 단체 자리를 예약했다."},
  {day:30, text:"카이렌을 비롯한 일행과 함께 가게를 방문했다. 여러 사람이 함께하는 식사 자리를 즐겼다."}
 ]
};
