/* MILE ZERO — Title screen, panels, settings, theme, font/visual preferences, sound effects.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

// 기존 3개 슬롯을 그대로 사용
const THEME_KEY='milezero_ui_light_preference_v1';

function rememberedTheme(){try{return localStorage.getItem(THEME_KEY)==='light'?'light':'dark'}catch(e){return 'dark'}}

function applyThemePreference(){s.light=rememberedTheme()}

// MILE ZERO: user-selected text size is a browser preference, not save-slot state.
const MZ_FONT_SCALE_KEY='MZ_FONT_SCALE_V1';

const MZ_FONT_SIZES=[100,115,130,145];

function mzReadFontSize(){
 try{const value=Number(localStorage.getItem(MZ_FONT_SCALE_KEY));return MZ_FONT_SIZES.includes(value)?value:100;}catch(e){return 100;}
}

function mzApplyFontSize(percent){
 mzFontSize=MZ_FONT_SIZES.includes(Number(percent))?Number(percent):100;
 document.documentElement.style.setProperty('--mz-text-scale',String(mzFontSize/100));
 document.documentElement.dataset.mzFontSize=String(mzFontSize);
}

function mzSetFontSize(percent){
 mzApplyFontSize(percent);
 try{localStorage.setItem(MZ_FONT_SCALE_KEY,String(mzFontSize));}catch(e){}
}

const MZ_VISUAL_KEY='MZ_VISUAL_PREFS_V1';

function mzReadVisualPrefs(){try{const raw=JSON.parse(localStorage.getItem(MZ_VISUAL_KEY)||'{}');return {panorama: raw.panorama!==false, portraits:raw.portraits!==false};}catch(e){return {panorama:true,portraits:true};}}

function mzWriteVisualPrefs(next){mzVisualPrefs={...mzVisualPrefs,...next};try{localStorage.setItem(MZ_VISUAL_KEY,JSON.stringify(mzVisualPrefs));}catch(e){};mzApplyVisualPrefs();}

function mzApplyVisualPrefs(root=document){const enabled=mzVisualPrefs.panorama!==false;document.body.classList.toggle('mz-panorama-disabled',!enabled);document.body.classList.toggle('mz-custom-images-disabled',mzVisualPrefs.portraits===false);const strip=root.getElementById?root.getElementById('mzPanoramaStrip'):document.getElementById('mzPanoramaStrip');if(strip){strip.dataset.enabled=enabled?'true':'false';strip.dataset.running=enabled?'true':'false';}}

let bootScreen='title',introStep=0;

function audioSettingsMarkup(){
 const bgm=window.mileMusic?.getVolume?.()??33;
 const sfx=window.mileEffects?.getVolume?.()??75;
 const playing=window.mileMusic?.isEnabled?.()??true;
 return `<div class="audio-settings">
 <div class="audio-setting-row"><div class="audio-setting-label"><span>BACKGROUND MUSIC</span><strong>BGM</strong></div><label class="audio-enabled"><input type="checkbox" id="audioBgmEnabled" ${playing?'checked':''}> 재생</label></div>
 <div class="audio-setting-range"><input type="range" id="audioBgmVolume" min="0" max="100" step="1" value="${bgm}" aria-label="배경음악 음량"><output id="audioBgmValue">${bgm}%</output></div>
 <div class="mile-playlist-manager" id="milePlaylistManager">${window.mileMusic?.playlistMarkup?.()??'<p>재생목록을 불러오는 중입니다.</p>'}</div>
 <div class="audio-setting-row"><div class="audio-setting-label"><span>SOUND EFFECTS · 12 FILES</span><strong>효과음</strong></div></div>
 <div class="audio-setting-range"><input type="range" id="audioSfxVolume" min="0" max="100" step="1" value="${sfx}" aria-label="효과음 전체 음량"><output id="audioSfxValue">${sfx}%</output></div>
 <button class="btn audio-preview" id="audioPreview" type="button">효과음 미리 듣기</button>
 <section class="mz-font-settings" aria-label="글자 크기 설정">
  <label class="mz-font-setting-heading" for="mzFontSizeSelect">글자 크기</label>
  <div class="mz-font-control"><select id="mzFontSizeSelect" aria-label="게임 글자 크기">
   ${MZ_FONT_SIZES.map(value=>`<option value="${value}" ${mzFontSize===value?'selected':''}>${value}%${value===100?' · 기본':''}</option>`).join('')}
  </select></div>
  <p>대화, 주문, 메뉴, 단말기와 설정의 글자 크기에 적용됩니다.</p>
 </section>
 <div class="mz-visual-settings">
  <div class="audio-setting-row"><div class="audio-setting-label"><span>SCENE BACKGROUNDS</span><strong>장면 배경 이미지</strong></div><label class="audio-enabled"><input type="checkbox" id="visualSceneBackgroundEnabled" ${window.mzSceneBackground?.enabled()!==false?'checked':''}> 켜기</label></div>
  <div class="audio-setting-row"><div class="audio-setting-label"><span>VISUAL DECORATION</span><strong>움직이는 파노라마 배경</strong></div><label class="audio-enabled"><input type="checkbox" id="visualPanoramaEnabled" ${(window.mzVisuals?.isPanoramaEnabled?.()??true)?'checked':''}> 켜기</label></div>
  <p class="mz-visual-help">도시 풍경이 천천히 왼쪽으로 흐르는 연출입니다.</p>
   <div class="audio-setting-row"><div class="audio-setting-label"><span>CHARACTER DISPLAY</span><strong>추가 캐릭터 이미지</strong></div><label class="audio-enabled"><input type="checkbox" id="visualGuestPortraitEnabled" ${(window.mzVisuals?.isPortraitEnabled?.()??true)?'checked':''}> 켜기</label></div>
 </div>
 </div>`;
}

function bindAudioSettings(root){
 const bgm=root.querySelector('#audioBgmVolume'),sfx=root.querySelector('#audioSfxVolume'),enabled=root.querySelector('#audioBgmEnabled');
 if(!bgm||!sfx)return;
 enabled.onchange=()=>window.mileMusic.setEnabled(enabled.checked);
 bgm.oninput=()=>{window.mileMusic.setVolume(bgm.value);root.querySelector('#audioBgmValue').textContent=bgm.value+'%'};
 sfx.oninput=()=>{window.mileEffects.setVolume(sfx.value);root.querySelector('#audioSfxValue').textContent=sfx.value+'%'};
 root.querySelector('#audioPreview').onclick=()=>window.mileEffects.preview();
 const visual=root.querySelector('#visualPanoramaEnabled');
 if(visual){visual.onchange=()=>window.mzVisuals?.setPanoramaEnabled?.(visual.checked);}
  const backgrounds=root.querySelector('#visualSceneBackgroundEnabled');
  if(backgrounds){backgrounds.onchange=()=>window.mzSceneBackground?.setEnabled(backgrounds.checked);}
 const fontSizeSelect=root.querySelector('#mzFontSizeSelect');
 if(fontSizeSelect){fontSizeSelect.onchange=()=>mzSetFontSize(fontSizeSelect.value);}
 const portraits=root.querySelector('#visualGuestPortraitEnabled');
 if(portraits){portraits.onchange=()=>window.mzVisuals?.setPortraitEnabled?.(portraits.checked);}
 window.mileMusic?.bindPlaylist?.(root.querySelector('#milePlaylistManager'));
}

function bootView(){
  let el=$('bootOverlay');
  if(bootScreen==='devPortrait'){
   if(el)el.remove();
   let controls=$('mzDevPortraitControls');
   if(!controls){controls=document.createElement('div');controls.id='mzDevPortraitControls';controls.className='mz-dev-portrait-controls';document.body.appendChild(controls)}
   controls.innerHTML='<label for="mzDevPortraitSelect">BAR CAMERA · 스탠딩</label><select id="mzDevPortraitSelect">'+
     mzDevPortraitChoices.map(([id,label])=>'<option value="'+id+'"'+(id===mzDevPortraitChoice?' selected':'')+'>'+label+'</option>').join('')+
     '</select><button type="button" id="mzDevPortraitBack">개발자 모드로 돌아가기</button>';
   controls.querySelector('#mzDevPortraitSelect').onchange=e=>{mzDevPortraitChoice=e.target.value;render()};
   controls.querySelector('#mzDevPortraitBack').onclick=()=>{bootScreen='developer';render()};
   return;
  }
  $('mzDevPortraitControls')?.remove();
  if(bootScreen==='phone'||(s.phase!=='prep'&&!['weekend','weekendStory'].includes(bootScreen))){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='bootOverlay';el.className='boot-overlay';document.body.appendChild(el)}
  // Bind the boot settings palette to the saved theme, independent of body CSS timing.
  el.classList.toggle('mz-title-settings-light',bootScreen==='settings'&&s.light==='light');
  const shell=(title,body)=>`<div class="boot-window ${bootScreen==='settings'?'boot-window-scroll mz329-settings-window':''}" role="dialog" aria-modal="true" aria-label="${title}"><div class="boot-bar"><span>ZERO TERMINAL / ${title}</span><button class="boot-btn mz275-weekend-save" type="button" id="mz275WeekendSave" ${title.startsWith('WEEKEND')?'':'hidden'}>저장 / 불러오기</button><button class="boot-theme" type="button" id="bootTheme">${s.light==='dark'?'☀ LIGHT':'☾ DARK'}</button></div><div class="boot-content ${bootScreen==='settings'?'boot-content-scroll':''}">${body}</div></div>`;
  if(bootScreen==='weekendStory'){
    const appointment=mzPendingWeekendStory(),event=appointment&&mzAppointmentCatalog[appointment.id];
    if(!event){bootScreen='weekend';bootView();return;}
    const index=Math.max(0,Math.min(s.weekendStoryCursor||0,event.scenes.length-1));
    let [speaker,body]=event.scenes[index];
    if(appointment.id==='freight_care_35'&&speaker==='선택결과'){
      const options=event.scenes[index-1][1].options;
      const choice=Number(s.weekendStoryAnswers?.[index-1]);
      speaker='서술';body=options[Number.isInteger(choice)&&choice>=0&&choice<options.length?choice:0].text;
    }
    el.innerHTML=shell(appointment.id==='freight_care_35'?'WEEKEND':'WEEKEND STORY',`<div class="mz161-story">${appointment.id==='freight_care_35'?'':`<p class="boot-meta">${esc(event.title)}</p>`}${speaker&&speaker!=='서술'&&speaker!=='선택지'?`<h3>${esc(speaker)}</h3>`:''}<p>${speaker==='선택지'?'':esc(body)}</p><button type="button" class="boot-btn highlight" id="mz161StoryNext">${index===event.scenes.length-1?'주말 화면으로':'계속 ›'}</button></div>`);
    if(appointment.id==='freight_care_35'&&speaker==='선택지'){
      const next=el.querySelector('#mz161StoryNext');next.hidden=true;
      const actions=document.createElement('div');actions.className='mz112-options';
      body.options.forEach((option,chosen)=>{
        const b=document.createElement('button');b.type='button';b.className='boot-btn';b.textContent=option.label;
        b.onclick=()=>{s.weekendStoryAnswers??={};s.weekendStoryAnswers[index]=chosen;s.weekendStoryCursor=index+1;bootView()};
        actions.appendChild(b);
      });
      el.querySelector('.mz161-story').appendChild(actions);
    }
     el.querySelector('#mz161StoryNext').onclick=()=>{if(index===event.scenes.length-1)mzFinishWeekendStory();else{s.weekendStoryCursor=index+1;bootView()}};
    el.querySelector('#mz275WeekendSave').onclick=()=>openPanel('save');
    el.querySelector('#bootTheme').onclick=()=>{switchLight('settings');bootView()};
    return;
  }
  if(bootScreen==='weekend'){
    const day=s.day,week=Math.floor((day-1)/5)+1;
    const weekends=s.weekendsCompleted||[];
    const journal=esc(mzGetJournal(day));
    const journalDays=MZ_WEEKEND_DAYS.filter(d=>d<=day);
    const diaryNav=journalDays.map(d=>`<button type="button" class="boot-btn" data-diary-day="${d}">DAY ${String(d).padStart(2,'0')}</button>`).join('');
    const messages=receivedMail();
    const posts=visiblePosts();
    const home=`<p class="mz115-home-copy">영업을 마치고 돌아온 주말. 오늘은 일에서 잠시 벗어나도 좋겠습니다.</p><div class="mz115-actions"><button class="mz115-action" data-weekend-tab="diary" type="button"><span class="mz115-action-icon">▤</span><span><strong>일기 쓰기</strong><small>이번 주의 기록</small></span><span class="mz115-chevron">›</span></button><button class="mz115-action" data-weekend-tab="phone" type="button"><span class="mz115-action-icon">▣</span><span><strong>핸드폰</strong><small>SNS와 받은 메일</small></span><span class="mz115-chevron">›</span></button><button class="mz115-action" data-weekend-tab="desk" type="button"><span class="mz115-action-icon">▦</span><span><strong>내 책상</strong><small>보유 소품 자유배치</small></span><span class="mz115-chevron">›</span></button><button class="mz115-action mz115-rest" id="mz112Rest" type="button"><span class="mz115-action-icon">☾</span><span><strong>쉬기</strong><small>다음 주차로 이동</small></span><span class="mz115-chevron">›</span></button></div>`;
    const diary=`<div class="mz112-intro">${week}주차 · 일기</div><div class="mz112-diary-nav">${diaryNav}</div><textarea id="mz112Journal" aria-label="주말 일기" maxlength="20000" placeholder="이번 주의 이야기를 자유롭게 적어보세요.">${journal}</textarea><div class="mz116-diary-save"><p class="boot-meta" id="mz112Saved">저장 버튼을 누르면 기록됩니다.</p><button class="boot-btn" type="button" id="mz116SaveDiary">일기 저장</button></div>`;
    const phone='';
    const sns='';
    const mail='';
    const desk=mzDeskPanel();
    const weekendSection=({home:'',diary:'일기',desk:'내 책상',phone:'핸드폰',sns:'SNS',mail:'메일'})[mzWeekendTab]||'';
    const scene=mzWeekendTab==='desk'?`<div class="mz187-desk-layout"><div class="mz186-desk-stage">${mzDeskBoard()}</div><aside class="mz187-desk-inventory">${desk}</aside></div>`:`<div class="mz186-room-stage" role="img" aria-label="주말의 주인공 방"></div>`;
    const diaryOverlay=mzWeekendTab==='diary'?`<div class="mz187-diary-overlay"><div class="mz187-diary-window" role="dialog" aria-modal="true" aria-label="주말 일기"><div class="mz187-diary-title"><strong>WEEKEND ${String(week).padStart(2,'0')} / 일기</strong><button type="button" class="boot-btn" data-weekend-tab="home">닫기 ×</button></div><div class="mz187-diary-body">${diary}</div></div></div>`:'';
    el.innerHTML=shell('WEEKEND',`<div class="mz112-weekend mz115-weekend"><header class="mz115-heading"><div><span class="mz115-eyebrow">OFF DUTY / GATE DISTRICT</span><h2>WEEKEND ${String(week).padStart(2,'0')}</h2><span class="mz115-date">DAY ${String(day).padStart(2,'0')} 영업 종료</span></div>${weekendSection?`<span class="mz115-location">${weekendSection}</span>`:''}</header>${scene}<div class="mz115-content">${mzWeekendTab!=='home'&&mzWeekendTab!=='diary'?'<div class="mz116-topnav"><button class="boot-btn" type="button" data-weekend-tab="home">‹ 이전으로</button><span>'+weekendSection+'</span></div>':''}${mzWeekendTab==='desk'?'':home}</div>${diaryOverlay}</div>`);
    el.querySelector('.boot-window')?.classList.add('mz115-window-shell');
    el.querySelectorAll('[data-weekend-tab]').forEach(b=>b.onclick=()=>{if(mzWeekendTab==='desk'&&b.dataset.weekendTab!=='desk')window.mzMusicBox?.stop?.();if(b.dataset.weekendTab==='phone'){mzWeekendPhoneOpen=true;s.phoneTab='feed';phoneMail=null;mzPhoneScroll={feed:0,mail:0,schedule:0};phoneView();return;}mzWeekendTab=b.dataset.weekendTab;bootView()});
    if(mzWeekendTab==='desk')mzBindDesk(el);
    const text=el.querySelector('#mz112Journal');let diaryDay=day;
    if(text){
      const info=el.querySelector('#mz112Saved');
      const save=el.querySelector('#mz116SaveDiary');
      const update=()=>{const dirty=text.value!==mzGetJournal(diaryDay);info.textContent=dirty?'저장하지 않은 변경 사항이 있습니다.':`DAY ${diaryDay} · 저장된 일기`;save.disabled=!dirty;};
      text.oninput=update;
      save.onclick=()=>{mzSetJournal(diaryDay,text.value);info.textContent=`DAY ${diaryDay} · 저장되었습니다.`;save.disabled=true;};
      el.querySelectorAll('[data-diary-day]').forEach(b=>b.onclick=()=>{const target=Number(b.dataset.diaryDay);if(text.value!==mzGetJournal(diaryDay)&&!confirm('저장하지 않은 글이 있습니다. 저장하지 않고 다른 일기로 이동할까요?'))return;diaryDay=target;text.value=mzGetJournal(diaryDay);update();});
      el.querySelectorAll('[data-weekend-tab="home"]').forEach(b=>{const previous=b.onclick;b.onclick=()=>{if(text.value!==mzGetJournal(diaryDay)&&!confirm('저장하지 않은 글이 있습니다. 저장하지 않고 돌아갈까요?'))return;previous();};});
      update();
    }
    el.querySelector('#mz275WeekendSave').onclick=()=>{const journal=el.querySelector('#mz112Journal');if(journal&&journal.value!==mzGetJournal(diaryDay)&&!confirm('저장하지 않은 일기가 있습니다. 일기를 저장하지 않고 세이브 메뉴로 갈까요?'))return;openPanel('save')};
    const rest=el.querySelector('#mz112Rest');if(rest)rest.onclick=mzFinishWeekend;
    const theme=el.querySelector('#bootTheme');if(theme)theme.onclick=()=>{switchLight('settings');bootView()};
    if(mzWeekendPhoneOpen)phoneView();
    return;
  }
  if(bootScreen==='title'){
    el.innerHTML=shell('START',`<h2 class="boot-title">MILE ZERO</h2><p class="boot-sub">GATE DISTRICT · BAR & DINER</p><div class="boot-menu u228-host"><button class="boot-btn highlight" id="newBoot">NEW GAME</button><button class="boot-btn" id="loadBoot">CONTINUE</button><button class="boot-btn" id="settingsBoot">SETTINGS</button><button class="boot-btn" id="creditsBoot">CREDITS</button></div>`);
    $('newBoot').onclick=()=>{const selectedLight=s.light,previousSeed=s.randomSeed;s=initial();if(s.randomSeed===previousSeed)s.randomSeed=(s.randomSeed+1)%2147483647;s.light=selectedLight;introStep=0;bootScreen='intro';render()};
    $('loadBoot').onclick=()=>{bootScreen='slots';render()};
    $('settingsBoot').onclick=()=>{bootScreen='settings';render()};
    $('creditsBoot').onclick=()=>{bootScreen='credits';render()};
  }else if(bootScreen==='weeks'){
    const options=[1,...MZ_WEEK_STARTS].filter(d=>d<=LAST_SCRIPTED_DAY).map(d=>{
      const cp=d===1?{day:1}:mzGetWeekCheckpoint(d);
      return `<button class="boot-btn" data-week-day="${d}" ${cp?'':'disabled'}>DAY ${String(d).padStart(2,'0')} <span class="boot-slot">${d===1?'처음부터':cp?'기록된 주차 시작 상태':'체크포인트 없음'}</span></button>`;
    }).join('');
    el.innerHTML=shell('WEEK START',`<div class="boot-meta">실제 플레이 시점의 해금·퀘스트·메뉴 상태를 복원합니다. 미도달 주차는 잠겨 있습니다.</div><div class="boot-menu u228-host">${options}<button class="boot-btn" id="backWeek">‹ BACK</button></div>`);
    $('backWeek').onclick=()=>{bootScreen='slots';render()};
    el.querySelectorAll('[data-week-day]').forEach(b=>b.onclick=()=>{
      const day=Number(b.dataset.weekDay);
      if(day===1){const light=s.light;s=initial();s.light=light;introStep=0;bootScreen='intro';render();}
      else mzRestoreWeek(day);
    });
  }else if(bootScreen==='developer'){
    mzDeveloperBoot(el,shell);
  }else if(bootScreen==='settings'){
    el.innerHTML=shell('SETTINGS',`<div class="mz329-settings-scroll"><div class="boot-meta">AUDIO SETTINGS</div>${audioSettingsMarkup()}</div><div class="boot-foot"><button class="boot-btn" id="backSettings">‹ BACK</button></div>`);
    $('backSettings').onclick=()=>{bootScreen='title';render()};
    bindAudioSettings(el);
  }else if(bootScreen==='credits'){
    el.innerHTML=shell('CREDITS',`<div class="boot-meta">MUSIC CREDITS</div><div class="credit-track"><span class="credit-caption">BACKGROUND MUSIC</span><strong>Cassette Tape Dream</strong><span>Sharou</span></div><div class="credit-track"><span class="credit-caption">BACKGROUND MUSIC</span><strong>週末京都現実逃避</strong><span>Sharou</span></div><div class="credit-track"><span class="credit-caption">BACKGROUND MUSIC</span><strong>さみしいおばけと東京の月</strong><span>Sharou</span></div><div class="credit-track"><span class="credit-caption">BACKGROUND MUSIC</span><strong>INFP</strong><span>Sharou</span></div><div class="credit-track"><span class="credit-caption">BACKGROUND MUSIC</span><strong>SuperStar</strong><span>Sharou</span></div><div class="credit-track"><span class="credit-caption">MUSIC BOX</span><strong>Starry Night</strong><span>Aerygarden</span></div><div class="credit-track"><span class="credit-caption">MINIGAME</span><strong>Powerup!</strong><span>Jeremy Blake</span></div><div class="boot-foot"><button class="boot-btn" id="backCredits">‹ BACK</button></div>`);
    $('backCredits').onclick=()=>{bootScreen='title';render()};
  }else if(bootScreen==='slots'){
    let slots=[1,2,3].map(n=>{let raw=localStorage.getItem(KEY+n),description='EMPTY';if(raw){try{let obj=JSON.parse(raw);description=`${dayLabel(obj.day||1)} · ${obj.weekendActive?'주말':obj.phase==='closing'?'마감':obj.phase==='open'?'영업':'준비'} / ${obj.at||'저장됨'}${mzSaveTooNew(obj)?' · 새 버전 세이브':''}`}catch(e){description='손상된 데이터'}}return `<button class="boot-btn" data-boot-slot="${n}" ${!raw?'disabled':''}>SLOT 0${n} <span class="boot-slot">${esc(description)}</span></button>${raw?`<button type="button" class="boot-btn mz-boot-delete" data-boot-delete="${n}" aria-label="슬롯 0${n} 삭제">삭제 · SLOT 0${n}</button>`:''}`}).join('');
    el.innerHTML=shell('LOAD',`<div class="boot-meta">SAVE DATA</div><div class="boot-menu u228-host">${slots}<div class="mz-boot-transfer">${mzTransferMarkup()}</div><button class="boot-btn" id="weekBoot">WEEK START</button><button class="boot-btn" id="devBoot">DEVELOPER MODE</button><button class="boot-btn" id="backBoot">‹ BACK</button></div>`);
    $('backBoot').onclick=()=>{bootScreen='title';render()};
    $('weekBoot').onclick=()=>{bootScreen='weeks';render()};
    $('devBoot').onclick=()=>{bootScreen='developer';render()};
    mzBindTransferButtons(el);
    el.querySelectorAll('[data-boot-slot]').forEach(b=>b.onclick=()=>{try{let data=JSON.parse(localStorage.getItem(KEY+b.dataset.bootSlot));restoreState(data);s.light=rememberedTheme();bootScreen=s.weekendActive&&mzWeekendEligible()?(mzPendingWeekendStory()?'weekendStory':'weekend'):s.phase==='prep'?'phone':'none';mzWeekendTab='home';mzWeekendPhoneOpen=false;s.seenIntro=true;mzWeekCheckpoint(s.day);render()}catch(e){alert(e&&e.message===MZ_SAVE_TOO_NEW_MESSAGE?e.message:'저장 데이터를 읽지 못했습니다.')}});
    el.querySelectorAll('[data-boot-delete]').forEach(b=>b.onclick=()=>confirmDeleteSlot(Number(b.dataset.bootDelete),'boot'));
  }else if(bootScreen==='intro'){
    const texts=["관문으로 향하는 도로에는 여전히 차량이 오가고 있다.\n\nMILE ZERO로의 첫 출근을 시작할 시간이다.",'가게로 향하던 중, 휴대 단말기가 짧게 울린다.\n\n사장님에게서 새로운 메시지가 도착했다.'];
    el.innerHTML=shell('DAY 01',`<div class="boot-meta">DAY 01 / 17:42</div><div class="boot-copy">${texts[introStep]}</div><div class="boot-foot"><button class="boot-btn highlight" id="nextBoot">${introStep?'단말기 확인 ›':'계속 ›'}</button></div>`);
    $('nextBoot').onclick=()=>{if(introStep===0){introStep=1;render()}else{bootScreen='phone';s.seenIntro=true;s.phoneTab='mail';phoneMail=null;render()}};
  }
  const themeControl=$('bootTheme');if(themeControl){u219RefreshThemeButton(themeControl);themeControl.onclick=()=>switchLight('settings');}
}

const U219_SUN='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l-1 1"/></g></svg>';

const U219_MOON='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.8A5.6 5.6 0 0 1 6.2 2.5a5.6 5.6 0 1 0 7.3 7.3z" fill="currentColor"/></svg>';

function u219RefreshThemeButton(button){
 if(!button)return;
 const nextLight=s.light==='dark';
 button.classList.add('u219-theme');
 button.dataset.mode=s.light;
 const symbol=nextLight?U219_SUN:U219_MOON;
 const compact=button.id==='headerLightButton'?'':(nextLight?' LIGHT':' DARK');
 button.innerHTML='<span class="u219-symbol">'+symbol+'</span>'+compact;
 button.setAttribute('aria-label',nextLight?'라이트 모드로 바꾸기':'다크 모드로 바꾸기');
 button.setAttribute('aria-pressed',s.light==='light'?'true':'false');
 button.title=nextLight?'라이트 모드로 바꾸기':'다크 모드로 바꾸기';
}

function u219SyncThemeButtons(){['headerLightButton','bootTheme','phoneTheme'].forEach(id=>u219RefreshThemeButton($(id)))}

function u219ThemeOrigin(){
 const active=document.activeElement;
 const t=active?.classList?.contains('u219-theme')?active:
   (bootScreen==='phone'?$('phoneTheme'):(bootScreen==='title'||bootScreen==='intro'||bootScreen==='settings'||bootScreen==='credits'||bootScreen==='continue')?$('bootTheme'):$('headerLightButton'));
 const r=t?.getBoundingClientRect();
 const x=r?(r.left+r.width/2):window.innerWidth-70;
 const y=r?(r.top+r.height/2):35;
 const radius=Math.ceil(Math.max(Math.hypot(x,y),Math.hypot(window.innerWidth-x,y),Math.hypot(x,window.innerHeight-y),Math.hypot(window.innerWidth-x,window.innerHeight-y)))+4;
 document.documentElement.style.setProperty('--u219-cx',x+'px');
 document.documentElement.style.setProperty('--u219-cy',y+'px');
 document.documentElement.style.setProperty('--u219-radius',radius+'px');
 return {x,y,radius};
}

function u219CommitTheme(origin){
  const before=s.light;
  s.light=before==='dark'?'light':'dark';
  try{localStorage.setItem(THEME_KEY,s.light)}catch(e){}
  const inService=origin==='bar'&&bootScreen==='none'&&s.phase==='open'&&s.sub!=='interlude';
  const guest=inService?current():null;
  if(guest&&!s.lightSeen[guest.who]&&!s.lightComment){
    s.lightSeen[guest.who]=true;
    s.lightComment=s.light==='light'?'오늘은 불을 환하게 켰군요. 분위기가 달라졌네요.':'조명을 조금 낮췄네요. 은은해서 좋군요.';
    note(guest.who,s.lightComment);
  }
  // 테마 변경에서는 마감/신메뉴/저장 버튼 DOM을 재구성하지 않는다.
  // 교체되는 버튼에 클릭 이벤트가 이어져 다른 메뉴가 열리는 현상을 방지한다.
  document.body.classList.toggle('light',s.light==='light');
  u219SyncThemeButtons();
  if(inService && s.lightComment) dialog();
  // 아이콘은 올바른 방향으로 고정하고, 화면 전체의 원형 테마 전환만 유지한다.
}

let u219Changing=false;

function switchLight(origin='settings'){
 if(u219Changing)return;
 const {x,y,radius}=u219ThemeOrigin();
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced){u219CommitTheme(origin);return}
 const active=document.activeElement;
 u219Changing=true;
 if(typeof document.startViewTransition==='function'){
  document.documentElement.classList.add('u219-transitioning');
  let transition;
  try{transition=document.startViewTransition(()=>u219CommitTheme(origin))}
  catch(err){document.documentElement.classList.remove('u219-transitioning');u219Changing=false;u219CommitTheme(origin);return}
  transition.finished.catch(()=>{}).finally(()=>{
   document.documentElement.classList.remove('u219-transitioning');
   u219Changing=false;
   const next=active?.id?$(active.id):null;
   if(next&&next.isConnected)next.focus({preventScroll:true});
  });
 }else{
  const cover=document.createElement('div');
  cover.className='u219-fallback';
  const next=s.light==='dark'?'light':'dark';
  // The fallback keeps the previous screen visible until the circle has covered it.
  cover.style.setProperty('--u219-cx',x+'px');
  cover.style.setProperty('--u219-cy',y+'px');
  cover.style.setProperty('--u219-radius',radius+'px');
  cover.style.setProperty('--u219-color',next==='light'?'#bbb8c7':'#101322');
  document.body.appendChild(cover);
  cover.addEventListener('animationend',()=>{
    try{u219CommitTheme(origin)}finally{cover.remove();u219Changing=false;const nextButton=active?.id?$(active.id):null;if(nextButton?.isConnected)nextButton.focus({preventScroll:true})}
  },{once:true});
 }
}

function panelMarkup(type){if(type==='settings')return `<h2>설정</h2>${audioSettingsMarkup()}`;if(type==='ingredients')return ingredientAtlas();if(type==='recipes')return `<h2>레시피북</h2><div class="tabs"><button class="btn active" id="rtDrink">음료 8종</button><button class="btn" id="rtFood">안주 레시피</button></div><div id="recipesList"></div>`;
if(type==='market')return marketMarkup();if(type==='wallet')return `<h2>보유 자금</h2><div class="market-wallet">현재 잔액 <strong>${marketBalance()} CR</strong></div><p class="note">영업으로 얻은 크레딧. 관문 시장은 7일 차부터 이용할 수 있어.</p>`;if(type==='guests')return guestArchiveMarkup();
if(type==='messages')return `<h2>시티 네트워크</h2><div class="v32-network-tabs" role="tablist" aria-label="시티 네트워크 보기"><button type="button" class="btn active" role="tab" id="v32MailTab" aria-selected="true">MAIL</button><button type="button" class="btn" role="tab" id="v32SnsTab" aria-selected="false">SNS ${unreadPosts()?`<span class="v32-unread">${unreadPosts()}</span>`:''}</button></div><div id="mailContent" role="tabpanel"></div>`;
if(type==='log')return `<h2>대화 기록</h2>${s.log.length?s.log.slice().reverse().map(x=>`<div class="item"><h3>${esc(x.who)}</h3><p>${esc(x.line)}</p></div>`).join(''):'<p class="note">아직 기록이 없습니다.</p>'}`;
if(type==='save')return `<h2>저장 / 불러오기</h2><p class="note">저장 데이터는 현재 브라우저에 보관됩니다. 브라우저 데이터를 삭제하면 사라질 수 있습니다.</p>${[1,2,3].map(n=>{let raw=null;try{raw=JSON.parse(localStorage.getItem(KEY+n))}catch{}return `<div class="item"><h3>SLOT 0${n}</h3><p>${raw?`${dayLabel(raw.day||1)} · ${esc(raw.weekendActive?'주말':raw.phase==='closing'?'마감':raw.phase==='prep'?'영업 준비':'완료 주문 '+(raw.dayStats?.[raw.day||1]?.orders||0)+'건')} · ${esc(raw.at||'')}`:'빈 슬롯'}</p><div class="actions"><button class="btn" data-save="${n}">저장</button><button class="btn" data-load="${n}" ${raw?'':'disabled'}>불러오기</button>${raw?`<button class="btn mz-delete-btn" type="button" data-delete-slot="${n}">삭제</button>`:''}</div></div>`}).join('')}<div class="mz-boot-transfer mz263-save-transfer">${mzTransferMarkup()}</div>`;return ''}

// v271: Give the terminal controls a non-scrolling surface and the content its own scroll pane.
// Move the original elements (rather than recreating them) to retain listeners and styling.
function mz271FixPanelHeader(type){
 if(!['ingredients','guests','messages'].includes(type))return;
 const drawer=$('modalRoot')?.querySelector('.drawer');
 if(!drawer||drawer.classList.contains('mz271-fixed-drawer'))return;
 const elements=[drawer.querySelector(':scope > header'),drawer.querySelector(':scope > h2')];
 const selectors=type==='ingredients'?['.v119-atlas-search','.v41-atlas-tabs']:
  type==='guests'?['.v39-archive-tabs']:['.v32-network-tabs'];
 for(const selector of selectors)elements.push(drawer.querySelector(':scope > '+selector));
 if(elements.some(el=>!el))return;
 const head=document.createElement('div');head.className='mz271-fixed-head';
 const body=document.createElement('div');body.className='mz271-scroll-body';
 drawer.insertBefore(head,elements[0]);
 for(const el of elements)head.appendChild(el);
 while(head.nextSibling)body.appendChild(head.nextSibling);
 drawer.appendChild(body);
 drawer.classList.add('mz271-fixed-drawer');
}

function mz271PanelScrollElement(pane){return pane?.closest('.mz271-scroll-body')||pane?.closest('.drawer');}

function openPanel(type, u321SkipCurtain=false){if(type==='market'&&(s.day<7||s.phase!=='closing'))return;if(type==='market'&&!u321SkipCurtain){u321MarketNavigate(true);return;}if(type==='recipes'){openRecipeQuick();return;}modal=type;$('modalRoot').innerHTML=`<div class="overlay ${type==='market'?'v55-market-overlay':''}" id="overlay"><div class="drawer ${type==='market'?'v55-market-screen':''} ${type==='save'?'mz263-save-drawer':''}" role="dialog" aria-modal="true" aria-label="${type==='market'?'관문 시장':'게임 메뉴'}"><header><span class="note">${type==='market'?'GATE DISTRICT / MILE MARKET':'MILE ZERO TERMINAL'}</span><button class="btn" id="closeModal">${type==='market'?'가게로 돌아가기':'닫기 ×'}</button></header>${panelMarkup(type)}</div></div>`;if(type==='save'&&['weekend','weekendStory'].includes(bootScreen))$('modalRoot').querySelector('.overlay')?.classList.add('mz275-weekend-save-overlay');mz271FixPanelHeader(type);if(type==='market'){mzMarketAcknowledgeStock();v48BindMarket();}if(type==='settings'){bindAudioSettings($('modalRoot'));}if(type==='guests')bindGuestArchive();if(type==='ingredients')bindIngredientAtlas();$('closeModal').onclick=()=>closePanel();$('overlay').onclick=e=>{if(e.target.id==='overlay')closePanel()};if(type==='messages'){v32NetworkTab='mail';mzNetworkScroll={mail:0,sns:0};showInbox();return;}if(type==='recipes'){const draw=food=>{let box=$('recipesList');box.innerHTML=(food?foods:drinks).map(v=>`<div class="item"><h3>${esc(v.name)}</h3><p>${food?`주재료 ${v.base} · 양념 ${v.sauce} · ${v.kind}`:`${v.seq.split('').map(k=>ingredients.find(i=>i[0]===k)[1]).join(' → ')} · ${v.mode==='mix'?'섞기 (순서 무관)':'층 유지 (순서대로)'}`}</p></div>`).join('');$('rtDrink').classList.toggle('active',!food);$('rtFood').classList.toggle('active',food)};$('rtDrink').onclick=()=>draw(false);$('rtFood').onclick=()=>draw(true);draw(false)}if(type==='save'){mzBindTransferButtons($('modalRoot'));document.querySelectorAll('[data-delete-slot]').forEach(b=>b.onclick=()=>confirmDeleteSlot(Number(b.dataset.deleteSlot)));document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{const slot=Number(b.dataset.save);confirmOverwriteSlot(slot,()=>{if(saveSessionToSlot(slot)){openPanel('save');const status=document.createElement('p');status.id='mzSaveStatus';status.className='mz-save-success';status.setAttribute('role','status');status.textContent=`슬롯 0${slot}에 저장했습니다.`;const drawer=$('modalRoot').querySelector('.drawer');if(drawer)drawer.insertBefore(status,drawer.children[1]||null);}})});document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{let n=b.dataset.load;if(!confirm(`슬롯 ${n}을 불러오시겠어요? 현재 진행은 덮어씌워집니다.`))return;try{let data=JSON.parse(localStorage.getItem(KEY+n));restoreState(data);bootScreen=s.weekendActive&&mzWeekendEligible()?(mzPendingWeekendStory()?'weekendStory':'weekend'):s.phase==='prep'?'phone':'none';mzWeekendTab='home';mzWeekendPhoneOpen=false;if(!Array.isArray(s.readMessages))s.readMessages=[];if(!Array.isArray(s.deliveredMessages))s.deliveredMessages=['welcome','schedule',...(s.phase==='closing'?['closing']:[])];closePanel();render()}catch(e){alert('저장 데이터를 불러올 수 없습니다.')}})}}

function closePanel(u321SkipCurtain=false){if(modal==='market'&&!u321SkipCurtain){u321MarketNavigate(false);return;}modal=null;$('modalRoot').innerHTML=''}

// Uploaded effect sounds: mapped by upload order, not by filenames.
const EFFECT_DATA = {"pour": "assets/audio/pour.mp3", "ice": "assets/audio/ice.mp3", "mix": "assets/audio/mix.mp3", "complete": "assets/audio/complete.mp3", "clear": "assets/audio/clear.mp3", "food": "assets/audio/food.mp3", "topping": "assets/audio/topping.mp3", "door": "assets/audio/door.mp3", "click": "assets/audio/click.mp3", "recipe": "assets/audio/recipe.mp3", "mail": "assets/audio/mail.mp3","sns":"assets/audio/sns.mp3"};

const SFX_CONFIG_KEY='MILE_ZERO_SFX_CONFIG';

let sfxVolume=0.75;

function playEffect(key){
 const player=effectPlayers[key];if(!player || sfxVolume===0)return;
 try{player.pause();player.currentTime=0;player.volume=sfxVolume*(key==='click'?0.82:1.0);player.play().catch(()=>{});}catch(e){}
}
