/* MILE ZERO — Save slots, restore, backup export/import, exit dialog.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

const KEY='milezero_day1_save_v1_';

// ===== SAVE MIGRATION / RESTORE =====
function restoreState(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('invalid save');
 // Upgrade older save formats; version metadata is re-stamped on the next save.
 {const {schemaVersion,savedBy,...migrated}=mzMigrateSave(raw);raw=migrated;}
 mzCurrentVisitCacheKey=null;mzCurrentVisitCacheValue=null;
 const base=initial();s={...base,...raw};if(typeof raw.arcadeRepaired!=='boolean')s.arcadeRepaired=s.day>=32&&(s.day>32||s.visit>=3);activeTypeKey=null;if(!Number.isInteger(s.friendCounterUnlockDay)||s.friendCounterUnlockDay<1)s.friendCounterUnlockDay=null;
 if(s.day===10&&typeof raw.dayTenMechanicScheduled!=='boolean'&&raw.visit>=(dailyVisits[10]||[]).length)s.dayTenMechanicScheduled=true;
 if(!s.weekendDiaries||typeof s.weekendDiaries!=='object')s.weekendDiaries={};if(!Array.isArray(s.weekendsCompleted))s.weekendsCompleted=[];if(!Array.isArray(s.appointments))s.appointments=[];if(!Array.isArray(s.weekendStoriesDone))s.weekendStoriesDone=[];if(!Array.isArray(s.appointmentDecisions))s.appointmentDecisions=[];if(!Number.isInteger(s.weekendStoryCursor))s.weekendStoryCursor=0;if(!s.weekendStoryAnswers||typeof s.weekendStoryAnswers!=='object')s.weekendStoryAnswers={};if(!s.genericPortraitAssignments||typeof s.genericPortraitAssignments!=='object'||Array.isArray(s.genericPortraitAssignments))s.genericPortraitAssignments={};
 for(const key of ['completed','mix','readMessages','readPosts','deliveredMessages'])if(!Array.isArray(s[key]))s[key]=base[key]||[];
 if(!s.day||s.day<1||s.day>50)s.day=1;if(s.day>LAST_SCRIPTED_DAY&&!s.devPreview){s.day=LAST_SCRIPTED_DAY;s.phase='closing';s.visit=0;s.line=0;s.sub='dialogue';s.completed=[];s.waitUntil=null;}if(!Number.isInteger(s.randomSeed))s.randomSeed=104729;if(!Array.isArray(s.ownedMarket))s.ownedMarket=[];if(!Array.isArray(s.marketSeenStockIds))s.marketSeenStockIds=[];s.marketSeenStockIds=[...new Set(s.marketSeenStockIds.filter(id=>typeof id==='string'))];if(s.ownedMarket.includes('floral'))s.ownedMarket=[...new Set(s.ownedMarket.map(id=>id==='floral'?'cherry':id))];if(!Array.isArray(s.foodAddons))s.foodAddons=[];s.foodHeat=Math.max(0,Math.min(10,Math.trunc(Number(s.foodHeat)||0)));s.iceCount=Math.max(0,Math.min(s.day>=10?3:1,Object.prototype.hasOwnProperty.call(raw,'iceCount')?Number(s.iceCount):(raw.ice?1:0)));s.ice=!!s.iceCount;if(!Number.isFinite(s.wallet))s.wallet=(Object.values(s.dayStats||{}).reduce((t,d)=>t+(Number(d.orders)||0),0)+(s.completed||[]).length)*5+(Number(s.tips)||0);if(!s.dayStats||typeof s.dayStats!=='object')s.dayStats={};if(!Array.isArray(s.customRecipes))s.customRecipes=[];migrateMarketRecipeNames();if(!Array.isArray(s.developmentDays))s.developmentDays=s.developmentDone?[3]:[];s.developmentDays=[...new Set(s.developmentDays.filter(d=>Number.isInteger(d)&&d>=3&&d<=LAST_SCRIPTED_DAY&&d%3===0))];if(s.developmentDone&&!s.developmentDays.includes(3))s.developmentDays.unshift(3);
 // v65: migrate displayed market recipe names without changing the stable ingredient ID.
 const oldChocolate='초코볼 라스트 마일',newChocolate='카라멜 쇼콜라';
 for(const r of s.customRecipes)if(r.name===oldChocolate){r.name=newChocolate;if(r.signature==='market:'+oldChocolate)r.signature='market:'+newChocolate;}
 for(const field of ['recipeNotices','recipeNoticeSeen'])if(Array.isArray(s[field]))s[field]=[...new Set(s[field].map(n=>n===oldChocolate?newChocolate:n))];
 // v64 placed three discoveries together on day 10; they now belong to days 7, 8 and 9.
 if(Array.isArray(s.guestClues))s.guestClues=s.guestClues.filter(c=>!(c.day===10&&['마렌','토르반','황무지 출신 정착민'].includes(c.who)));
 if(Array.isArray(s.guestArchiveSeen))s.guestArchiveSeen=s.guestArchiveSeen.filter(id=>!/^clue:10:(3:마렌|7:토르반|9:황무지 출신 정착민)$/.test(id));
 if(s.sunsetRoadRecipe&&!mzValidSunsetSpec(s.sunsetRoadRecipe.seq,s.sunsetRoadRecipe.mixAt,s.sunsetRoadRecipe.extra))s.sunsetRoadRecipe=null;if(!Array.isArray(s.regularUnlocks))s.regularUnlocks=[];if(s.regularUnlocks.includes('mechanic')&&!Number.isInteger(s.mechanicRegularFrom))s.mechanicRegularFrom=8;if(!Array.isArray(s.recipeNotices))s.recipeNotices=[];if(!Array.isArray(s.recipeNoticeSeen))s.recipeNoticeSeen=[];if(s.day>=10){for(const recipe of friedRecipes)if(!s.recipeNotices.includes(recipe.name))s.recipeNotices.push(recipe.name);}
 if(mzNonheatUnlocked()){for(const dish of nonheatRecipes)if(!s.recipeNotices.includes(dish.name))s.recipeNotices.push(dish.name);}
 if(s.regularUnlocks.includes('mechanic')){s.mechanicRegularFrom=8;if(!s.recipeNotices.includes('훈연 바삭 꼬치'))s.recipeNotices.push('훈연 바삭 꼬치');}for(const r of s.customRecipes){if(r.kind==='food'){const spec=foodRecipeSpec(r);if(spec){r.foodBase=spec.base;r.foodSauce=spec.sauce;r.foodKind=spec.kind;}r.extra=null;}}syncMarketRecipeRewards();mzEnsureCustomIds();if(!Array.isArray(s.unlockedExtras))s.unlockedExtras=[];if(s.day===43&&s.visit>5&&!s.unlockedExtras.includes('flower'))s.unlockedExtras.push('flower');if(!Array.isArray(s.garnishDiscoveries))s.garnishDiscoveries=[];if(!Array.isArray(s.garnishDialogue))s.garnishDialogue=[];
 // Sanitize only the in-memory DAY35 final-visitor state; preserve save slots.
 if(s.day===35&&s.visit===14){
  s.garnishDialogue=[];
  if(s.phase==='open'&&s.sub==='after'&&(!Number.isInteger(s.line)||s.line<0||s.line>=day35Visits[14].after.length))s.line=0;
 }
 // v361: Restore visits only from explicit named visit records.
 // A served count is not proof of which person visited, particularly across builds.
 if(!Array.isArray(s.guestVisits))s.guestVisits=[];
 if(!Array.isArray(s.guestClues))s.guestClues=[];
 backfillGuestHistory();
 mzRestoreHearts();if(!Number.isInteger(s.mixAt)||s.mixAt<0||s.mixAt>s.mix.length)s.mixAt=s.stirred?s.mix.length:0;if(!s.lightSeen||typeof s.lightSeen!=='object')s.lightSeen={};if(!unlockedGarnishes().some(g=>g.id===s.extra))s.extra=null;
 if(s.phase==='open'&&s.sub==='interlude'&&!(Number.isFinite(s.waitUntil)&&s.waitUntil>0))s.waitUntil=Date.now()+WAIT_SECONDS[Math.min(s.visit,WAIT_SECONDS.length-1)]*1000;
 s.stationError=null;
}

// ===== MAIN MENU RETURN / OPTIONAL SAVE =====
// ===== VERIFIED SLOT SAVE / IN-GAME OVERWRITE CONFIRMATION =====
// v254: Portable save backup for hosting migrations.
const MZ_BACKUP_PREFIXES=['milezero_','MILE_ZERO_','MZ_','mz_'];

function mzPortableKey(key){return MZ_BACKUP_PREFIXES.some(prefix=>key.startsWith(prefix));}

function mzBackupKeys(){const keys=[];for(let n=1;n<=3;n++)keys.push(KEY+n);for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&mzPortableKey(k)&&!keys.includes(k))keys.push(k);}return keys;}

function mzTransferStatus(message,error=false){
 const e=document.getElementById('mzTransferStatus');if(e){e.textContent=message;e.style.color=error?'#f09b91':'';e.setAttribute('role',error?'alert':'status');}else if(error){alert(message)}
}

function mzExportBackup(){
 try{
  const entries={};for(const k of mzBackupKeys()){const v=localStorage.getItem(k);if(v!==null)entries[k]=v;}
  const slots=[1,2,3].filter(n=>Object.prototype.hasOwnProperty.call(entries,KEY+n));
  if(!slots.length){mzTransferStatus('저장된 슬롯이 없습니다. 먼저 슬롯에 저장해 주세요.',true);return;}
  const backup={format:'MILE_ZERO_SAVE_BACKUP',version:1,saveSchemaVersion:SAVE_SCHEMA_VERSION,build:mzBuildId(),exportedAt:new Date().toISOString(),entries};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;
  link.download='MILE_ZERO_Save_Backup_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  mzTransferStatus('백업 파일을 저장했습니다. 새 사이트에서 이 파일을 가져오세요.');
 }catch(e){mzTransferStatus('백업 파일을 만들지 못했습니다. 브라우저의 다운로드·저장 권한을 확인해 주세요.',true);}
}

function mzBackupValidate(json){
 if(!json||json.format!=='MILE_ZERO_SAVE_BACKUP'||json.version!==1||!json.entries||typeof json.entries!=='object'||Array.isArray(json.entries))throw Error('MILE ZERO 백업 파일이 아니거나 지원하지 않는 형식입니다.');
 const entries=json.entries,keys=Object.keys(entries);
 if(!keys.length||keys.length>500||keys.some(k=>!mzPortableKey(k)||typeof entries[k]!=='string'))throw Error('백업 파일의 저장 항목이 올바르지 않습니다.');
 const slots=[1,2,3].filter(n=>Object.prototype.hasOwnProperty.call(entries,KEY+n));
 if(!slots.length)throw Error('백업 파일에 저장 슬롯이 없습니다.');
 for(const n of slots){let state;try{state=JSON.parse(entries[KEY+n])}catch{throw Error('슬롯 '+n+'의 저장 데이터가 손상되었습니다.')}
  if(!state||typeof state!=='object'||!Number.isInteger(state.day)||state.day<1||state.day>999||!['prep','open','closing'].includes(state.phase)||!Array.isArray(state.customRecipes))throw Error('슬롯 '+n+'의 게임 데이터 구조가 올바르지 않습니다.');
  if(mzSaveTooNew(state))throw Error('슬롯 '+n+': '+MZ_SAVE_TOO_NEW_MESSAGE);
 }
 return {entries,keys,slots};
}

function mzTransferConfirm(info){
 const host=document.getElementById('modalRoot')?.querySelector('.drawer')||document.getElementById('bootOverlay');
 if(!host)throw Error('가져오기 창을 열 수 없습니다.');
 const mask=document.createElement('div');mask.className='mz-save-confirm-mask';mask.style.zIndex='99999';
 mask.innerHTML='<section class="mz-save-confirm" role="alertdialog" aria-modal="true" aria-label="백업 데이터 가져오기"><div class="mz-exit-kicker">SAVE TRANSFER</div><h3>저장 데이터를 가져올까요?</h3><p>백업 파일의 슬롯 '+info.slots.join(', ')+'과 설정을 복원합니다. 같은 번호의 현재 슬롯 및 설정은 덮어씁니다. 현재 진행 중인 미저장 내용은 옮겨지지 않습니다.</p><div class="mz-save-confirm-actions"><button type="button" class="btn primary" data-mz-import-confirm>가져오기</button><button type="button" class="btn" data-mz-import-cancel>취소</button></div><p data-mz-import-error role="alert"></p></section>';
 host.appendChild(mask);
 mask.querySelector('[data-mz-import-cancel]').onclick=()=>mask.remove();
 mask.querySelector('[data-mz-import-confirm]').onclick=()=>{
  const original={};let written=[];
  try{
   for(const k of info.keys)original[k]=localStorage.getItem(k);
   for(const k of info.keys){localStorage.setItem(k,info.entries[k]);if(localStorage.getItem(k)!==info.entries[k])throw Error('저장 검증 실패');written.push(k)}
   mask.remove();
   // Reload to apply imported audio, visual and theme preferences consistently.
   alert('백업 데이터를 가져왔습니다. 게임을 새로고침하면 적용됩니다.');
   location.reload();
  }catch(e){for(const k of written){try{original[k]===null?localStorage.removeItem(k):localStorage.setItem(k,original[k])}catch{}}
   mask.querySelector('[data-mz-import-error]').textContent='저장 공간 또는 접근 권한 문제로 가져오지 못했습니다. 기존 데이터 복원을 시도했습니다.';
  }
 };
 mask.querySelector('[data-mz-import-cancel]').focus();
}

function mzImportBackup(file){
 if(!file)return;
 if(file.size>10*1024*1024){mzTransferStatus('백업 파일이 10MB를 초과합니다.',true);return;}
 const reader=new FileReader();reader.onerror=()=>mzTransferStatus('파일을 읽지 못했습니다.',true);
 reader.onload=()=>{try{const backup=JSON.parse(String(reader.result));const info=mzBackupValidate(backup);mzTransferConfirm(info)}catch(e){mzTransferStatus(e.message||'백업 파일을 읽지 못했습니다.',true)}};
 reader.readAsText(file,'UTF-8');
}

function mzBindTransferButtons(root){
 if(!root)return;
 const exp=root.querySelector('#mzExportSaves'),imp=root.querySelector('#mzImportSaves'),input=root.querySelector('#mzImportFile');
 if(exp)exp.onclick=mzExportBackup;
 if(imp&&input){imp.onclick=()=>input.click();input.onchange=()=>{const f=input.files&&input.files[0];input.value='';if(f)mzImportBackup(f)}}
}

function mzTransferMarkup(){return `<section class="item" aria-label="세이브 파일 백업"><h3>세이브 파일 백업 / 이전</h3><p>슬롯 1~3과 주말 기록, 관련 설정을 JSON 파일 하나로 백업합니다. 다른 호스팅 주소에서 가져올 수 있습니다.</p><div class="actions"><button class="btn" type="button" id="mzExportSaves">세이브 내보내기 (.json)</button><button class="btn" type="button" id="mzImportSaves">세이브 가져오기</button><input id="mzImportFile" type="file" accept=".json,application/json" hidden></div><p id="mzTransferStatus" class="note" aria-live="polite">가져오기는 동일한 번호의 기존 저장 슬롯과 설정을 덮어씁니다.</p></section>`;}

function saveSessionToSlot(slot){
 if(![1,2,3].includes(Number(slot)))return false;
 try{
  s.snsHearts=[...mzHearts];
  const snapshot=JSON.parse(JSON.stringify(s));
  const payload=JSON.stringify({...mzStampSave(snapshot),at:new Date().toLocaleString('ko-KR')});
  localStorage.setItem(KEY+slot,payload);
  if(localStorage.getItem(KEY+slot)!==payload)throw new Error('save verification failed');
  return true;
 }catch(error){
  const status=$('mzSaveStatus')||$('mzExitStatus');
  if(status){status.textContent='저장에 실패했습니다. 브라우저 저장 공간이나 저장 권한을 확인해 주세요.';status.setAttribute('role','alert')}
  return false;
 }
}

function confirmDeleteSlot(slot,source='panel'){
 if(![1,2,3].includes(Number(slot)))return;
 let existing;
 try{existing=localStorage.getItem(KEY+slot)}catch(e){return}
 if(existing===null)return;
 const root=source==='boot'?$('bootOverlay'):$('modalRoot');
 if(!root)return;
 const mask=document.createElement('div');
 mask.className='mz-save-confirm-mask mz-delete-mask';
 mask.innerHTML=`<section class="mz-save-confirm" role="alertdialog" aria-modal="true" aria-labelledby="mzDeleteTitle"><div class="mz-exit-kicker">SAVE DATA</div><h3 id="mzDeleteTitle">정말 삭제하시겠습니까?</h3><p>슬롯 0${slot}의 저장 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p><div class="mz-save-confirm-actions"><button type="button" class="btn mz-delete-btn" data-confirm-delete>삭제하기</button><button type="button" class="btn" data-cancel-delete>취소</button></div></section>`;
 root.appendChild(mask);
 const cancel=()=>{mask.remove()};
 mask.querySelector('[data-cancel-delete]').onclick=cancel;
 mask.querySelector('[data-confirm-delete]').onclick=()=>{
  try{
   localStorage.removeItem(KEY+slot);
   if(localStorage.getItem(KEY+slot)!==null)throw new Error('delete verification failed');
   mask.remove();
   if(source==='boot'){render();return}
   openPanel('save');
   const drawer=$('modalRoot').querySelector('.drawer');
   if(drawer){const message=document.createElement('p');message.className='mz-save-success';message.setAttribute('role','status');message.textContent=`슬롯 0${slot}의 저장 데이터를 삭제했습니다.`;drawer.insertBefore(message,drawer.children[1]||null)}
  }catch(error){let note=mask.querySelector('[data-delete-error]');if(!note){note=document.createElement('p');note.setAttribute('role','alert');note.dataset.deleteError='';mask.querySelector('.mz-save-confirm').appendChild(note)}note.textContent='삭제하지 못했습니다. 브라우저 저장 권한을 확인해 주세요.'}
 };
 mask.querySelector('[data-cancel-delete]').focus();
}

function confirmOverwriteSlot(slot,onConfirmed){
 const existing=localStorage.getItem(KEY+slot);
 if(!existing){onConfirmed();return}
 const root=$('modalRoot');
 const parent=root.querySelector('.drawer,.mz-exit-dialog');
 if(!parent)return;
 const mask=document.createElement('div');
 mask.className='mz-save-confirm-mask';
 mask.innerHTML=`<section class="mz-save-confirm" role="alertdialog" aria-modal="true" aria-labelledby="mzOverwriteTitle"><div class="mz-exit-kicker">SAVE DATA</div><h3 id="mzOverwriteTitle">슬롯 0${slot}을 덮어쓸까요?</h3><p>기존 저장 내용이 현재 진행 상황으로 교체됩니다.</p><div class="mz-save-confirm-actions"><button type="button" class="btn" data-confirm-overwrite>덮어쓰기</button><button type="button" class="btn" data-cancel-overwrite>취소</button></div></section>`;
 root.appendChild(mask);
 const cancel=()=>{mask.remove()};
 mask.querySelector('[data-cancel-overwrite]').onclick=cancel;
 mask.querySelector('[data-confirm-overwrite]').onclick=()=>{mask.remove();onConfirmed()};
 mask.querySelector('[data-cancel-overwrite]').focus();
}

function returnToTitleNow(){
 window.mzMusicBox?.stop?.();
 const currentTheme=s.light;
 if(activeTypeTimer){clearInterval(activeTypeTimer);activeTypeTimer=null;}
 activeTypeKey=null;activeTypeComplete=true;
 closePanel();
 const phone=$('prePhone');if(phone)phone.remove();
 const boot=$('bootOverlay');if(boot)boot.remove();
 s=initial();s.light=currentTheme;
 bootScreen='title';introStep=0;phoneMail=null;
 expandedPosts=new Set();
 mzPhoneScroll={feed:0,mail:0,schedule:0};
 render();
}

function showExitDialog(){
 if(bootScreen==='title'||bootScreen==='slots'||bootScreen==='settings'||bootScreen==='credits')return;
 if(modal)closePanel();
 modal='exit';
 const slots=[1,2,3].map(n=>{
  let label='빈 슬롯';
  try{const data=JSON.parse(localStorage.getItem(KEY+n)||'null');if(data)label=`${dayLabel(data.day||1)} · ${data.phase==='closing'?'마감':data.phase==='open'?'영업 중':'출근 전'}`;}catch{label='손상된 데이터';}
  return `<button class="btn mz-exit-slot" type="button" data-exit-save="${n}">SLOT 0${n} <small>${esc(label)}</small></button>`;
 }).join('');
 $('modalRoot').innerHTML=`<div class="overlay mz-exit-overlay" id="overlay"><section class="mz-exit-dialog" role="dialog" aria-modal="true" aria-labelledby="mzExitTitle"><div class="mz-exit-kicker">MILE ZERO / SYSTEM</div><h2 id="mzExitTitle">메인 화면으로 돌아갈까요?</h2><p>현재 진행을 저장하시겠습니까?</p><div class="mz-exit-subtitle">저장하고 나가기 · 슬롯 선택</div><div class="mz-exit-slots">${slots}</div><p id="mzExitStatus" class="mz-exit-status" role="status" aria-live="polite"></p><div class="mz-exit-actions"><button class="btn" id="mzExitDiscard" type="button">저장하지 않고 나가기</button><button class="btn" id="mzExitCancel" type="button">취소 · 게임으로 돌아가기</button></div></section></div>`;
 $('mzExitCancel').onclick=closePanel;
 $('mzExitDiscard').onclick=returnToTitleNow;
 $('overlay').onclick=e=>{if(e.target.id==='overlay')closePanel()};
 document.querySelectorAll('[data-exit-save]').forEach(b=>b.onclick=()=>{const slot=Number(b.dataset.exitSave);confirmOverwriteSlot(slot,()=>{if(saveSessionToSlot(slot))returnToTitleNow()})});
 $('mzExitCancel').focus();
}
