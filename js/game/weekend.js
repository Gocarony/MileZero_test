/* MILE ZERO — Weekends, journal, weekly checkpoints, Day 35 freight care event.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

let mzWeekendTab='home';

let mzWeekendPhoneOpen=false;

const MZ_WEEKEND_DAYS=[5,10,15,20,25,30,35,40,45];

// Weekly checkpoints are exact snapshots of actual play, never fabricated unlock states.
// Each checkpoint is kept separately from the three manual save slots.
const MZ_WEEK_CHECKPOINT_PREFIX='milezero_week_checkpoint_v2_fiveday_';

const MZ_WEEK_STARTS=[6,11,16,21,26,31,36,41,46];

// Weekly weekend journals live in the save snapshot; a separate draft prevents loss before slot saving.
const MZ_JOURNAL_DRAFT='milezero_weekend_journal_draft_v1_';

function mzJournalKey(day){return MZ_JOURNAL_DRAFT+String(s.randomSeed||0)+'_'+day}

function mzGetJournal(day){
 return s.weekendDiaries?.[day]!=null?String(s.weekendDiaries[day]):''
}

function mzSetJournal(day,value){
 if(!s.weekendDiaries||typeof s.weekendDiaries!=='object')s.weekendDiaries={};
 s.weekendDiaries[day]=String(value);
 try{localStorage.setItem(mzJournalKey(day),String(value))}catch(e){}
}

// DAY 35 end-of-story state machine; no unlock is dependent on accepting the weekend invitation.
const mz35FreightText={
  "start": "그런데 한 가지 부탁드려도 될까요?",
  "explain": "이번 주말에 차량 안쪽에 녀석이 쉴 작은 집을 만들어 주려고 합니다. 작업하는 동안만 옆에서 녀석을 좀 봐주실 수 있을까요?",
  "prompt": "혹시 이런 작은 동물 돌보는 일에 익숙하십니까? 자신 없으시면 편하게 말씀하셔도 됩니다.",
  "choices": [
    "어느 정도는 알고 있다.",
    "잘 모르지만 도울 수는 있다.",
    "자신이 없다."
  ],
  "answers": [
    "그렇다면 다행이네요. 괜찮으시면 주말에 차량이 서 있는 곳으로 잠깐 와 주시겠습니까? 필요한 건 제가 준비해 두겠습니다.",
    "그 정도면 충분합니다. 물이랑 먹을 것, 주의할 점은 제가 준비해 두겠습니다. 옆에서 위험한 곳으로 가지 않는지만 봐주시면 돼요.",
    "아, 그럴 수 있죠. 괜히 갑작스럽게 여쭤봤네요. 다른 방법을 찾아보겠습니다."
  ],
  "accept": "감사합니다. 주말에 뵙겠습니다. 차량이 서 있는 곳은 단말기로 알려 드릴게요. 오래 걸리진 않을 겁니다.",
  "decline": "괜찮습니다. 그래도 물어봐도 된다고 해 주셔서 고마워요."
};

function mz35FreightCompleted(){return s.day===35&&current()?.day35FreightEnding&&s.sub==='after'&&s.line>=currentAfterLines(current()).length-1;}

function mz35GrantFreightReward(){
 const unlocked=mzUnlockNonheatCooking();
 if(unlocked){note('시스템','정기 화물 기사 개인 이야기 완료 · 조리법 「비가열」 해금 · 「육회」·「샐러드」 레시피 해금');}
 return unlocked;
}

function mz35RewardPopup(){
 if(document.getElementById('mz35Reward'))return;
 const overlay=document.createElement('div');overlay.id='mz35Reward';overlay.className='mz183-unlock-overlay';
 const popup=document.createElement('div');popup.className='mz183-unlock-popup';popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','true');
 const kicker=document.createElement('div');kicker.className='mz183-unlock-kicker';kicker.textContent='STORY COMPLETE';
 const title=document.createElement('h2');title.textContent='정기 화물 기사의 이야기 완료';
 const detail=document.createElement('p');detail.textContent='새 조리법 「비가열」과 안주 「육회」·「샐러드」가 해금되었습니다.';
 const button=document.createElement('button');button.type='button';button.className='btn primary';button.textContent='확인';
 button.onclick=()=>overlay.remove();popup.append(kicker,title,detail,button);overlay.appendChild(popup);document.body.appendChild(overlay);button.focus();
}

function mz35OpenCareDialogue(){
 const fresh=mz35GrantFreightReward();
 s.sub='mz35Care';s.line=0;
 render();if(fresh)mz35RewardPopup();
}

function mz35CareAnswer(choice){
 s.mz35CareChoice=choice;
 s.sub=choice===2?'mz35CareDecline':'mz35CareConfirm';
 render();
}

function mz35CareFinal(accepted){
 if(!Array.isArray(s.appointmentDecisions))s.appointmentDecisions=[];
 if(!s.appointmentDecisions.includes('freight_care_35'))s.appointmentDecisions.push('freight_care_35');
 if(accepted&&!mzScheduleAppointments().some(a=>a.id==='freight_care_35')){
  s.appointments??=[];s.appointments.push({id:'freight_care_35',weekendAfterDay:35,status:'accepted',acceptedDay:35});
 }
 s.sub=accepted?'mz35CareAccepted':'mz35CareDeclineFinal';render();
}

function mz35CareDialogue(add){
 const v=current(), t=mz35FreightText;
 $('speaker').textContent=v.who;
 if(s.sub==='mz35Care'){
  $('dialogueText').textContent=[t.start,t.explain,t.prompt][Math.min(s.line,2)];
  if(s.line<2)add('계속',()=>{s.line++;render()},true);
  else t.choices.forEach((choice,i)=>add(choice,()=>mz35CareAnswer(i),i===0));
 }else if(s.sub==='mz35CareConfirm'){
  $('dialogueText').textContent=t.answers[s.mz35CareChoice||0];
  add('계속',()=>mz35CareFinal(true),true);
 }else{
  const line=s.sub==='mz35CareDecline'?t.answers[2]:s.sub==='mz35CareAccepted'?t.accept:t.decline;
  $('dialogueText').textContent=line;add(s.sub==='mz35CareDecline'?'계속':'다음 손님',()=>s.sub==='mz35CareDecline'?mz35CareFinal(false):advanceGuest(),true);
 }
 return true;
}

function mzPendingWeekendStory(){return mzScheduleAppointments().find(a=>a.weekendAfterDay===s.day&&!s.weekendStoriesDone?.includes(a.id))||null}

function mzFinishWeekendStory(){const a=mzPendingWeekendStory();if(a){s.weekendStoriesDone??=[];s.weekendStoriesDone.push(a.id);a.status='completed';}mzDeskState();s.weekendStoryCursor=0;s.weekendStoryAnswers={};bootScreen='weekend';mzWeekendTab='home';render()}

function mzWeekendEligible(){return s.phase==='closing' && MZ_WEEKEND_DAYS.includes(s.day) && !s.weekendsCompleted?.includes(s.day)}

function mzOpenWeekend(){if(!mzWeekendEligible())return;const id='mzweek'+s.day+'mail';if(inbox.some(m=>m.id===id)&&!s.deliveredMessages.includes(id))s.deliveredMessages.push(id);s.weekendActive=true;bootScreen=mzPendingWeekendStory()?'weekendStory':'weekend';s.weekendStoryCursor=0;s.weekendStoryAnswers={};mzWeekendTab='home';mzWeekendPhoneOpen=false;render()}

function mzFinishWeekend(){
 if(!mzWeekendEligible())return;
 window.mzMusicBox?.stop?.();
 if(!Array.isArray(s.weekendsCompleted))s.weekendsCompleted=[];
 if(!s.weekendsCompleted.includes(s.day))s.weekendsCompleted.push(s.day);
 s.weekendActive=false;bootScreen='none';mzWeekendPhoneOpen=false;
 if(s.day<mzDayLimit())nextDay();else render();
}

function mzWeekCheckpoint(day){
 if(!MZ_WEEK_STARTS.includes(day)||day>LAST_SCRIPTED_DAY)return;
 if(s.day!==day||s.phase!=='prep'||s.visit!==0)return;
 try{
  const key=MZ_WEEK_CHECKPOINT_PREFIX+day;
  // The first arrival snapshot is the canonical beginning of the week.
  if(localStorage.getItem(key))return;
  s.snsHearts=[...mzHearts];
  const copy=JSON.parse(JSON.stringify(s));
  localStorage.setItem(key,JSON.stringify({version:1,day,recordedAt:new Date().toLocaleString('ko-KR'),state:mzStampSave(copy)}));
 }catch(err){console.warn('Weekly checkpoint could not be saved:',err)}
}

function mzGetWeekCheckpoint(day){
 if(!MZ_WEEK_STARTS.includes(day)||day>LAST_SCRIPTED_DAY)return null;
 try{
  const raw=JSON.parse(localStorage.getItem(MZ_WEEK_CHECKPOINT_PREFIX+day)||'null');
  if(raw?.version!==1||raw.day!==day||!raw.state||raw.state.day!==day||raw.state.phase!=='prep'||raw.state.visit!==0||mzSaveTooNew(raw.state))return null;
  return raw;
 }catch(err){return null}
}

function mzRestoreWeek(day){
 const cp=mzGetWeekCheckpoint(day);if(!cp)return;
 if(!confirm(`DAY ${String(day).padStart(2,'0')} 시작 시점으로 이동할까요?\n이 시점에 기록된 재료, 메뉴, 의뢰, 단골 정보가 복원되며 현재 진행 상태는 변경됩니다.\n기존 저장 슬롯은 유지됩니다.`))return;
 restoreState(JSON.parse(JSON.stringify(cp.state)));
 s.light=rememberedTheme();s.seenIntro=true;
 bootScreen='phone';introStep=0;expandedPosts=new Set();phoneMail=null;
 render();
}
