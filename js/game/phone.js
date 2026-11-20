/* MILE ZERO — City Network phone: SNS feed, hearts, mail, schedule/appointments.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

let mzPhoneScroll={feed:0,mail:0,schedule:0};

let mzNetworkScroll={mail:0,sns:0};

function mzScheduleAppointments(){return Array.isArray(s.appointments)?s.appointments.filter(a=>a&&mzAppointmentCatalog[a.id]&&a.status==='accepted'):[]}

function mzOfferAppointment(offer){
 if(!offer||!mzAppointmentCatalog[offer.id]||s.appointmentDecisions?.includes(offer.id))return false;
 return !mzScheduleAppointments().some(a=>a.weekendAfterDay===mzAppointmentCatalog[offer.id].weekendAfterDay);
}

function mzAnswerAppointment(accepted){
 const offer=current()?.appointmentOffer;if(!offer||s.sub!=='appointment')return;
 if(!Array.isArray(s.appointmentDecisions))s.appointmentDecisions=[];if(!Array.isArray(s.deskOwned))s.deskOwned=[];if(!Array.isArray(s.deskPlaced))s.deskPlaced=[];
 if(!s.appointmentDecisions.includes(offer.id))s.appointmentDecisions.push(offer.id);
 if(accepted&&mzAppointmentCatalog[offer.id]&&!mzScheduleAppointments().some(a=>a.weekendAfterDay===mzAppointmentCatalog[offer.id].weekendAfterDay)){
  s.appointments.push({id:offer.id,weekendAfterDay:mzAppointmentCatalog[offer.id].weekendAfterDay,status:'accepted',acceptedDay:s.day});
 }
 s.sub='appointmentReply';s.line=accepted?1:0;render();
}

function mzScheduleMarkup(){
 const currentDay=s.day,week=Math.floor((currentDay-1)/5)+1,weekStart=(week-1)*5+1;
 const work=Array.from({length:5},(_,i)=>weekStart+i);
 const upcoming=mzScheduleAppointments().filter(a=>a.weekendAfterDay>=currentDay).sort((a,b)=>a.weekendAfterDay-b.weekendAfterDay);
 const calendar=work.map(d=>`<div class="mz161-calday ${d===currentDay?'is-today':''}"><small>DAY ${String(d).padStart(2,'0')}</small><strong>${d===currentDay?'오늘':'영업'}</strong></div>`).join('');
 const end=weekStart+4;
 const events=[`<div class="mz161-schedule-item"><strong>18:00–02:00 · MILE ZERO 관문 지점</strong><small>오늘의 정규 근무</small></div>`,
  `<div class="mz161-schedule-item"><strong>DAY ${String(end).padStart(2,'0')} · 주간 마감</strong><small>영업 종료 후 주말 휴무</small></div>`];
 if(currentDay>=3){const next=Array.from({length:52},(_,i)=>currentDay+i).find(d=>d>=3&&d%3===0&&d<=mzDayLimit()&&!(s.developmentDays||[]).includes(d));if(next)events.push(`<div class="mz161-schedule-item"><strong>DAY ${String(next).padStart(2,'0')} · 지점 한정 메뉴 개발</strong><small>${next===currentDay?'오늘 개발 가능':'다음 개발 가능 영업일'}</small></div>`)}
 if(s.regularUnlocks?.includes('mechanic'))events.push('<div class="mz161-schedule-item"><strong>야간 정비사의 특별 메뉴</strong><small>의뢰 완료 · 레시피 해금</small></div>');
 for(const a of upcoming){const event=mzAppointmentCatalog[a.id];events.push(`<div class="mz161-schedule-item mz161-personal"><strong>DAY ${a.weekendAfterDay} 영업 후 주말 · ${esc(event.title)}</strong><small>${esc(event.with)}와의 약속 · 수락함</small></div>`)}
 return `<div class="mz161-schedule"><h3>WEEK ${String(week).padStart(2,'0')} · 근무 달력</h3><div class="mz161-workweek">${calendar}<div class="mz161-calday mz161-off"><small>주말</small><strong>휴무</strong></div></div><h3>예정된 일정</h3>${events.join('')}</div>`;
}

function snsDisplayText(value){const item=dayTwelveTrend();return String(value).replaceAll('{유행_토핑}',item?item.name:'그 토핑');}

// DAY41 SNS: the user-custom-menu reference must show a real registered title.
function mzDay41DisplaySnsPost(p){
 if(p.id!=='p41_03')return p;
 const choices=mzSpecialMenuChoices('custom',41).filter(r=>r?.name);
 const selected=choices.length?choices[Math.floor(seedPick(s,41,3,4103)*choices.length)]:null;
 const name=selected?.name||'블루 아워';
 return {...p,comments:(p.comments||[]).map(([who,line])=>[who,String(line).replaceAll('(사용자 커스텀 메뉴)',name)])};
}

function mzSnsPublicationOrder(p){return (Number(p.day)||1)*2+(p.weekendOnly?1:0)}

function visiblePosts(){return feedPosts.filter(p=>(!p.day||p.day<=s.day)&&(!p.weekendOnly||s.day>p.day||(s.day===p.day&&(bootScreen==='weekend'||(s.weekendsCompleted||[]).includes(p.day))))).map(mzDay41DisplaySnsPost).slice().sort((a,b)=>mzSnsPublicationOrder(b)-mzSnsPublicationOrder(a)||String(b.time||'').localeCompare(String(a.time||'')))}

function unreadPosts(){return visiblePosts().filter(p=>!(s.readPosts||[]).includes(p.id)).length}

function mzRestoreHearts(){
 if(!Array.isArray(s.snsHearts))s.snsHearts=[];
 mzHearts=new Set(s.snsHearts.filter(id=>typeof id==='string'));
}

function mzHeartMarkup(id){const liked=mzHearts.has(id);return `<button type="button" class="mz-heart-btn${liked?' is-liked':''}" data-like-post="${esc(id)}" aria-label="${liked?'좋아요 취소':'좋아요'}" aria-pressed="${liked?'true':'false'}" title="${liked?'좋아요 취소':'좋아요'}"><lucian-heart state="${liked?'on':'off'}" size="24" weight="1.75" tone="color" animate="none" aria-hidden="true"></lucian-heart></button>`}

function mzToggleHeart(id){
 if(mzHearts.has(id))mzHearts.delete(id);else {mzHearts.add(id);window.mileEffects?.play?.('sns');}
 s.snsHearts=[...mzHearts];
 document.querySelectorAll('[data-like-post]').forEach(b=>{
   if(b.dataset.likePost!==id)return;
   const liked=mzHearts.has(id);b.classList.toggle('is-liked',liked);b.setAttribute('aria-pressed',String(liked));b.setAttribute('aria-label',liked?'좋아요 취소':'좋아요');b.title=liked?'좋아요 취소':'좋아요';
   const icon=b.querySelector('lucian-heart');if(icon){if(typeof icon.setState==='function')icon.setState(liked?'on':'off');else icon.setAttribute('state',liked?'on':'off')}
 });
}

function phoneView(){const mzWeekendPhone=bootScreen==='weekend'&&mzWeekendPhoneOpen;if(!mzWeekendPhone&&(bootScreen!=='phone'||s.phase!=='prep')){const old=$('prePhone');if(old)old.remove();return;}let el=$('prePhone');if(!el){el=document.createElement('div');el.id='prePhone';el.className='prephone-wrap';document.body.appendChild(el)}el.classList.toggle('mz116-weekend-phone',mzWeekendPhone);let tab=s.phoneTab||'feed';const oldBody=el.querySelector('.phone-body');if(oldBody)mzPhoneScroll[el.dataset.activeTab||tab]=oldBody.scrollTop;const nav=['feed','mail','schedule'].map((id,i)=>`<button class="phone-tab ${tab===id?'active':''}" data-ptab="${id}">${['FEED','MAIL','SCHEDULE'][i]}${id==='feed'&&unreadPosts()?` <span class="phone-count">${unreadPosts()}</span>`:''}${id==='mail'&&inbox.filter(m=>s.deliveredMessages.includes(m.id)&&!s.readMessages.includes(m.id)).length?` <span class="phone-count">${inbox.filter(m=>s.deliveredMessages.includes(m.id)&&!s.readMessages.includes(m.id)).length}</span>`:''}</button>`).join('');let body='';
if(tab==='feed'){body=visiblePosts().map(p=>`<article class="post"><div class="post-head"><strong>${esc(p.author)}</strong><small>${dayLabel(p.day||1)}${p.weekendOnly?' · 주말':''} · ${p.time} ${!(s.readPosts||[]).includes(p.id)?'<span class="phone-new">NEW</span>':''}</small></div><p>${esc(snsDisplayText(p.text))}</p><div class="post-actions">${mzHeartMarkup(p.id)}<button class="phone-link" data-post="${p.id}">댓글 ${p.comments.length} ${expandedPosts.has(p.id)?'▴':'▾'}</button></div>${expandedPosts.has(p.id)?p.comments.map(c=>`<div class="comment"><strong>${esc(c[0])}</strong> ${esc(c[1])}</div>`).join(''):''}</article>`).join('')}
else if(tab==='mail'){const messages=receivedMail();const m=messages.find(m=>m.id===phoneMail);body=m?`<button class="phone-link phone-back" id="backPhoneMail">‹ 받은편지함</button><div class="post"><div class="mail-head"><strong>${esc(m.title)}</strong></div><div class="phone-muted">${esc(m.sender)}</div><hr><p class="phone-copy">${esc(mzDay39MailText(m.body))}</p></div>`:messages.map(m=>`<button class="phone-row" data-pmail="${m.id}"><strong>${esc(m.title)} ${!s.readMessages.includes(m.id)?'<span class="phone-new">NEW</span>':''}</strong><small>${esc(m.sender)}</small></button>`).join('')}
else {body=mzScheduleMarkup()}
el.innerHTML=`<div class="phone" role="dialog" aria-label="출근 전 휴대 단말기"><div class="phone-head"><strong>CITY NETWORK</strong><span>${dayLabel(s.day)} · 17:42</span><button class="phone-theme" type="button" id="phoneTheme">${s.light==='dark'?'☀ LIGHT':'☾ DARK'}</button></div><nav class="phone-tabs">${nav}</nav><div class="phone-body">${body}</div><footer class="phone-footer"><button id="phoneStart">${mzWeekendPhone?'‹ 주말 화면으로 돌아가기':'출근하기 ›'}</button></footer></div>`;
el.dataset.activeTab=tab;const phoneBody=el.querySelector('.phone-body');if(phoneBody)phoneBody.scrollTop=mzPhoneScroll[tab]||0;el.querySelectorAll('[data-ptab]').forEach(b=>b.onclick=()=>{if(phoneBody)mzPhoneScroll[tab]=phoneBody.scrollTop;s.phoneTab=b.dataset.ptab;phoneMail=null;phoneView()});el.querySelectorAll('[data-post]').forEach(b=>b.onclick=()=>{const id=b.dataset.post;if(phoneBody)mzPhoneScroll.feed=phoneBody.scrollTop;expandedPosts.has(id)?expandedPosts.delete(id):expandedPosts.add(id);if(!s.readPosts.includes(id))s.readPosts.push(id);phoneView()});el.querySelectorAll('[data-pmail]').forEach(b=>b.onclick=()=>{phoneMail=b.dataset.pmail;if(!s.readMessages.includes(phoneMail))s.readMessages.push(phoneMail);phoneView()});const back=$('backPhoneMail');if(back)back.onclick=()=>{phoneMail=null;phoneView()};$('phoneStart').onclick=()=>{if(mzWeekendPhone){mzWeekendPhoneOpen=false;phoneMail=null;phoneView();return;}start();phoneView()};u219RefreshThemeButton($('phoneTheme'));$('phoneTheme').onclick=()=>switchLight('settings');}

function receivedMail(){return inbox.filter(m=>s.deliveredMessages.includes(m.id)).slice().sort((a,b)=>s.deliveredMessages.lastIndexOf(b.id)-s.deliveredMessages.lastIndexOf(a.id))}

let v32NetworkTab='mail';

function mzRememberNetworkScroll(){const pane=$('mailContent');if(pane)mzNetworkScroll[v32NetworkTab]=mz271PanelScrollElement(pane)?.scrollTop||0;}

function mzRestoreNetworkScroll(){const pane=$('mailContent');const scrollPane=mz271PanelScrollElement(pane);if(scrollPane)scrollPane.scrollTop=mzNetworkScroll[v32NetworkTab]||0;}

function v32NetworkBind(){
 const mail=$('v32MailTab'),sns=$('v32SnsTab');if(!mail||!sns)return;
 for(const [b,selected] of [[mail,v32NetworkTab==='mail'],[sns,v32NetworkTab==='sns']]){b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));}
 mail.onclick=()=>{mzRememberNetworkScroll();v32NetworkTab='mail';showInbox()};sns.onclick=()=>{mzRememberNetworkScroll();v32NetworkTab='sns';v32ShowFeed()};
}

function v32ShowFeed(){
 const target=$('mailContent');if(!target)return;v32NetworkTab='sns';v32NetworkBind();
 const posts=visiblePosts();
 target.innerHTML=posts.length?posts.map(p=>{const read=(s.readPosts||[]).includes(p.id);return `<article class="v32-feed-post"><div class="v32-post-head"><strong>${esc(p.author)}</strong><small>${dayLabel(p.day||1)} · ${esc(p.time)}</small></div><p>${esc(snsDisplayText(p.text))}</p><div class="v32-post-actions">${mzHeartMarkup(p.id)}<button type="button" class="btn v32-post-open" data-v32post="${esc(p.id)}" aria-expanded="false">댓글 ${p.comments?.length||0} ${read?'':'· NEW'}</button></div><div class="v32-post-comments" id="v32comments-${esc(p.id)}" hidden></div></article>`}).join(''):'<p class="note">게시물이 없습니다.</p>';
 mzRestoreNetworkScroll();target.querySelectorAll('[data-v32post]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.v32post,p=feedPosts.find(x=>x.id===id),holder=target.querySelectorAll('.v32-post-comments');
  const pane=[...holder].find(x=>x.id==='v32comments-'+id);if(!p||!pane)return;
  const scrollPane=mz271PanelScrollElement(target);const beforeTop=scrollPane?.scrollTop||0;const expanded=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!expanded));pane.hidden=expanded;
  if(!expanded){pane.innerHTML=(p.comments||[]).map(([who,line])=>`<div class="v32-comment"><strong>${esc(who)}</strong> ${esc(line)}</div>`).join('')||'<p class="note">댓글 없음</p>';if(!s.readPosts.includes(id))s.readPosts.push(id);}
  b.textContent=`댓글 ${p.comments?.length||0}`;if(scrollPane){scrollPane.scrollTop=beforeTop;mzNetworkScroll.sns=scrollPane.scrollTop;}
 });
}

function showInbox(){v32NetworkTab='mail';v32NetworkBind();
 const received=receivedMail();
 $('mailContent').innerHTML=received.length?received.map(m=>{const unread=!s.readMessages.includes(m.id);return `<button type="button" class="inbox-row ${unread?'unread':''}" data-mail="${esc(m.id)}"><span aria-hidden="true">${unread?'✉':'□'}</span><span class="inbox-copy"><span class="inbox-from">${esc(m.sender)}</span><span class="inbox-subject">${esc(m.title)}</span></span>${unread?'<span class="inbox-mark">NEW</span>':''}<span aria-hidden="true">›</span></button>`}).join(''):'<p class="note">받은 메시지가 없습니다.</p>';
 mzRestoreNetworkScroll();$('mailContent').querySelectorAll('[data-mail]').forEach(b=>b.onclick=()=>{mzRememberNetworkScroll();showMail(b.dataset.mail)});
}

function showMail(id){
 const m=inbox.find(m=>m.id===id&&s.deliveredMessages.includes(id));if(!m)return;
 if(!s.readMessages.includes(id))s.readMessages.push(id);
 render();
 $('mailContent').innerHTML=`<button class="btn mail-back" id="mailBack">‹ 받은편지함</button><h3>${esc(m.title)}</h3><div class="mail-meta"><span>${esc(m.sender)}</span><span>${dayLabel(s.day)}</span></div><div class="mail-body">${esc(mzDay39MailText(m.body))}</div>`;
 $('mailBack').onclick=showInbox;
}
