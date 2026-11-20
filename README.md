# MILE ZERO

관문 구역의 바 & 다이너에서 저녁 근무(18:00–02:00)를 맡아 손님에게 음료와 안주를 만들어 주는 내러티브 경영 게임입니다. 빌드나 서버 없이 브라우저에서 바로 실행되는 정적 웹 게임입니다.

## 실행

- **GitHub Pages / 정적 호스팅**: 저장소 루트를 그대로 배포하면 됩니다.
- **로컬**: `index.html`을 브라우저로 열거나, 루트에서 `python3 -m http.server`를 실행한 뒤 `http://localhost:8000`에 접속합니다.

## 폴더 구조

```
index.html                  화면 골격(HTML)과 CSS/JS 로딩 순서
css/style.css               스타일 전체 (기본 + 버전별 패치를 하나로 통합)
js/
  data/                     순수 데이터. 게임 코드보다 먼저 로드
    recipes.js              재료, 음료/안주 레시피, 가니시, 특별 주문
    messages.js             사장님 메일(inbox), SNS 피드, 일정
    characters.js           초상화 레이어, 단골 프로필, 단서/표정 카탈로그
    story-visits.js         DAY별 손님 방문 대본
    arcade-ghost-eater.js   아케이드 미니게임 문서 (iframe srcdoc)
  game/                     게임 로직 (기능별)
    core.js                 공용 상태 s, DOM 헬퍼, 새 게임 초기값
    ui.js                   타이틀 화면, 패널, 설정, 테마, 글자 크기, 효과음
    visits.js               오늘 올 손님 결정 (DAY별 변형, 랜덤 주문)
    bar.js                  음료·안주 제조, 판정, 서빙, 대기, 가니시
    scene.js                바 장면, 초상화·표정, 대사 출력, 메인 렌더
    recipes.js              레시피북, 메뉴 개발
    guests.js               손님 기록, 단서, 단골, 재료 도감
    market.js               마감 후 마켓, 데스크 장식, 친구 코드
    phone.js                CITY NETWORK (SNS, 좋아요, 메일, 일정)
    weekend.js              주말, 일기, 주간 체크포인트
    save-format.js          세이브 형식 버전과 마이그레이션
    save.js                 슬롯 저장/불러오기, 백업 내보내기/가져오기
    dev.js                  개발자 모드
    main.js                 시작 처리: 이벤트 연결, 첫 렌더 (항상 마지막에 로드)
  bgm.js                    BGM 플레이리스트, 아케이드·오르골 사운드
  icons.js                  Lucian Icons (애니메이션 아이콘)
  scene-backgrounds.js      배경 표시 설정
assets/                     이미지는 WebP, 소리는 MP3
asset_manifest.json         assets/ 전체 파일 목록과 SHA-256
```

모든 스크립트는 같은 전역 스코프를 공유하는 일반 `<script>`입니다.

- `js/game/` 안의 파일(main.js 제외)에는 **선언만** 둡니다(함수, 상수). 불러오는 순간 실행되는 코드는 `main.js`에 넣으세요. 이 규칙을 지키면 `js/game/` 파일끼리는 로드 순서가 상관없습니다.
- `js/data/*.js` → `js/game/*.js` → `js/game/main.js` 순서는 유지해야 합니다.

## 콘텐츠 수정 위치

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 손님 대사·방문 순서 | `js/data/story-visits.js` |
| 메일·SNS 글 | `js/data/messages.js` |
| 레시피·재료 | `js/data/recipes.js` |
| 캐릭터 이미지 매핑 | `js/data/characters.js` |
| 배경음악 목록 | `js/bgm.js`의 `library` |
| 게임 로직 | `js/game/` 아래 기능별 파일 |

에셋을 추가하거나 바꾼 뒤에는 `asset_manifest.json`도 갱신해 주세요.

## 세이브

세이브는 브라우저 `localStorage`에 사이트 주소별로 저장됩니다(슬롯 1–3, 주말 기록, 설정).

### 세이브 형식 버전

모든 세이브(슬롯, 주간 체크포인트, 백업 파일 안의 슬롯)에는 `schemaVersion`과 저장한 빌드 이름(`savedBy`)이 기록됩니다. 버전 필드가 없는 예전 세이브는 버전 1로 보고 그대로 불러옵니다.

게임 상태 `s`의 구조를 바꿀 때는 `js/game/save-format.js`에서:

1. `SAVE_SCHEMA_VERSION`을 1 올리고,
2. `SAVE_MIGRATIONS`에 이전 버전을 한 단계 올려 주는 변환 함수를 추가합니다.

더 새로운 버전의 게임에서 만든 세이브는 예전 빌드에서 불러오지 않고 안내 문구를 보여 줍니다(타이틀 화면 슬롯에 "새 버전 세이브" 표시).

### 세이브를 다른 사이트로 이전할 때

기존 호스팅에서 세이브 내보내기로 JSON 백업을 만든 뒤, 새로운 GitHub Pages 사이트에서 세이브 가져오기로 복원하세요. 브라우저의 기존 저장소는 사이트 주소가 바뀌면 자동으로 따라오지 않습니다.

## 크레딧

- BGM: Sharou — Cassette Tape Dream, 週末京都現実逃避, さみしいおばけと東京の月, INFP, SuperStar
- UI 프롬프트: Lucian UX/UI Prompt #228 (MIT)
- 아이콘: Lucian Icons v2.0.13 (MIT)
