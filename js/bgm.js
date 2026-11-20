/* MILE ZERO — BGM playlist, arcade and music-box audio, cursor glow (u228). */
(function(){
 const audio=document.getElementById('mileBgm');
 const key='MILE_ZERO_BGM_CONFIG';
 const listKey='MILE_ZERO_BGM_PLAYLIST_V1';
 // Retain original track IDs so previously saved playlists continue to work.
 // All five BGM tracks ship as files in assets/audio/bgm/.
 const library=[
  {id:'default',name:'Cassette Tape Dream',artist:'Sharou',src:'assets/audio/bgm/cassette-tape-dream.mp3'},
  {id:'kyoto',name:'週末京都現実逃避',artist:'Sharou',src:'assets/audio/bgm/kyoto.mp3'},
  {id:'tokyo',name:'さみしいおばけと東京の月',artist:'Sharou',src:'assets/audio/bgm/tokyo.mp3'},
  {id:'infp',name:'INFP',artist:'Sharou',src:'assets/audio/bgm/infp.mp3'},
  {id:'superstar',name:'SuperStar',artist:'Sharou',src:'assets/audio/bgm/superstar.mp3'}
 ];
 // Tracks are regular files under assets/audio/bgm/ and are only downloaded when played.
 function resolveSongUrl(track){
   if(!track.src)throw new Error('Missing BGM source: '+track.id);
   return track.src;
 }
 const byId=id=>library.find(t=>t.id===id);
 let cfg={muted:false,volume:0.33};
 try{cfg={...cfg,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(e){}
 audio.volume=Math.min(1,Math.max(0,Number(cfg.volume)||0));audio.muted=!!cfg.muted;
 let playlist=library.map(track=>track.id);
 try{const ids=JSON.parse(localStorage.getItem(listKey)||'null');if(Array.isArray(ids)){const valid=[...new Set(ids.filter(id=>!!byId(id)))];if(valid.length){playlist=(valid.join(',')==='default,kyoto,tokyo')?library.map(t=>t.id):valid}}}catch(e){}
 let currentId=playlist[0],played=0,hasStarted=false;
 // Keep the user's volume separate from temporary transition attenuation.
 let targetVolume=audio.volume;
 let fadeToken=0, fading=false, fadeFrame=null, endWatch=null;
 const FADE_SECONDS=2.5;
 const escapeHTML=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function persist(){try{localStorage.setItem(key,JSON.stringify({muted:audio.muted,volume:targetVolume}))}catch(e){}}
 function persistList(){try{localStorage.setItem(listKey,JSON.stringify(playlist))}catch(e){}}
 function stopWatcher(){if(endWatch!==null){clearInterval(endWatch);endWatch=null}}
 function cancelFade(restoreVolume=true){
   fadeToken++;
   if(fadeFrame!==null){cancelAnimationFrame(fadeFrame);fadeFrame=null}
   stopWatcher();fading=false;
   if(restoreVolume)audio.volume=targetVolume;
 }
 function nextId(){const index=playlist.indexOf(currentId);return playlist[(index+1+playlist.length)%playlist.length]}
 function applySong(id,autoPlay=true){
   const track=byId(id);if(!track)return;
   cancelFade(false);
   currentId=id;played=0;
   // Resolve bundled audio on demand. Keep the user's volume and playlist intact.
   const source=resolveSongUrl(track);
   // Set the normal volume on the *new* track, not at the end of the old one.
   if(audio.getAttribute('src')!==source){audio.setAttribute('src',source);audio.load()}
   else {try{audio.currentTime=0}catch(e){}}
   audio.volume=targetVolume;
   if(autoPlay&&hasStarted)audio.play().catch(()=>{});
   refreshPlaylist();
 }
 function fadeToSong(id,autoPlay=true){
   if(!byId(id))return;
   if(id===currentId||!hasStarted||audio.paused||audio.ended){applySong(id,autoPlay);return}
   cancelFade(false);fading=true;
   const token=fadeToken;
   const start=performance.now(),initial=audio.volume;
   const frame=now=>{
     if(token!==fadeToken)return;
     const t=Math.min(1,(now-start)/(FADE_SECONDS*1000));
     audio.volume=Math.max(0,initial*(1-t));
     if(t>=1||audio.ended){fadeFrame=null;applySong(id,autoPlay)}
     else fadeFrame=requestAnimationFrame(frame);
   };
   fadeFrame=requestAnimationFrame(frame);
 }
 function setSong(id,autoPlay=true){fadeToSong(id,autoPlay)}
 function next(){setSong(nextId(),true)}
 // Every selected track is played twice. Only the second pass fades, and
 // only if the following playlist entry is a different track.
 audio.removeAttribute('loop');audio.loop=false;
 function checkAutoFade(){
   if(fading||played!==1||playlist.length<2||!hasStarted||audio.paused||audio.ended)return;
   if(nextId()===currentId)return;
   const duration=audio.duration;
   if(!Number.isFinite(duration)||duration<=0)return;
   const remaining=duration-audio.currentTime;
   if(remaining<=0||remaining>FADE_SECONDS)return;
   // A separate short ticker helps when timeupdate events are sparse.
   fading=true;
   const token=++fadeToken;
   const startingVolume=audio.volume;
   const startingRemaining=remaining;
   const frame=()=>{
     if(token!==fadeToken)return;
     if(audio.ended){fadeFrame=null;return}
     const left=Math.max(0,duration-audio.currentTime);
     const progress=Math.max(0,Math.min(1,(startingRemaining-left)/startingRemaining));
     audio.volume=Math.max(0,startingVolume*(1-progress));
     if(left>0)fadeFrame=requestAnimationFrame(frame);
     else{fadeFrame=null;audio.volume=0}
   };
   fadeFrame=requestAnimationFrame(frame);
 }
 function watchSecondPlay(){
   stopWatcher();
   if(played===1&&playlist.length>1&&nextId()!==currentId){
     endWatch=setInterval(checkAutoFade,80);
     checkAutoFade();
   }
 }
 audio.addEventListener('timeupdate',checkAutoFade);
 audio.addEventListener('playing',watchSecondPlay);
 audio.addEventListener('seeked',()=>{if(fading){cancelFade();}watchSecondPlay()});
 audio.addEventListener('ended',()=>{
   // The old song has finished. Cancel its fade without restoring its volume.
   const wasFading=fading;
   cancelFade(false);
   played++;
   if(played<2){
     // Same track replay: full volume, without any transition effect.
     audio.volume=targetVolume;
     try{audio.currentTime=0}catch(e){}
     audio.play().catch(()=>{});
     refreshPlaylist();
   }else{
     // Next song starts at the configured volume. One-song playlists also
     // repeat without a fade.
     applySong(nextId(),true);
   }
 });
 function update(){
   const btn=document.getElementById('headerBgmButton');
   if(btn){btn.textContent='⚙ SOUND';btn.setAttribute('aria-label','음향 설정 열기')}
   const check=document.getElementById('creditsBgm');if(check)check.checked=!audio.muted;
   const slider=document.getElementById('creditsVolume');if(slider)slider.value=String(Math.round(targetVolume*100));
 }
 function start(){
   if(hasStarted)return;
   if(!audio.getAttribute('src'))setSong(currentId,false);
   hasStarted=true;
   if(!mzBoxActive&&!mzArcadeActive)audio.play().catch(()=>{hasStarted=false});
 }

 // Keep arcade sounds in the parent document so that deployment and
 // single-file TEST builds use the same reliable audio playback path.
 const mzArcadeSfxPaths = {"item":"assets/audio/arcade-item-pop.mp3","ghost":"assets/audio/arcade-ghost-eat.mp3","hurt":"assets/audio/arcade-hurt.mp3","gameover":"assets/audio/arcade-gameover-wilhelm-v351.mp3"};
 const mzArcadeSfxPlayers = Object.fromEntries(Object.entries(mzArcadeSfxPaths).map(([name,source]) => {
   const player=new Audio(source);
   player.preload='auto';
   return [name,player];
 }));
 // Audio paths are in the parent document. The game-over sound is constructed
 // directly rather than cloned, so it can start reliably even if not preloaded.
 // If the clip cannot load or play, do not leave the final hit silent.
 function mzArcadePlaySfx(name){
   if(!mzArcadeActive || sfxVolume<=0) return;
   const source=mzArcadeSfxPaths[name];
   if(!source)return;
   let fellBack=false;
   const fallback=()=>{
     if(name!=='gameover' || fellBack)return;
     fellBack=true;
     console.warn('MILE ZERO game-over clip unavailable; playing hurt sound instead');
     mzArcadePlaySfx('hurt');
   };
   const clip=new Audio(source);
   clip.preload='auto';
   clip.volume=sfxVolume;
   clip.muted=false;
   clip.addEventListener('error',fallback,{once:true});
   clip.play().catch(err=>{
     console.warn('MILE ZERO arcade SFX playback failed',name,err);
     fallback();
   });
   clip.addEventListener('ended',()=>{clip.removeAttribute('src');clip.load()}, {once:true});
 }
 window.addEventListener('message',event=>{
   const iframe=document.querySelector('#mzArcadeV312 iframe');
   if(!iframe || event.source!==iframe.contentWindow || !event.data)return;
   if(event.data.type==='mz-arcade-play-sfx')mzArcadePlaySfx(event.data.which);
   if(event.data.type==='mz-arcade-user-gesture' && mzArcadeActive && !audio.muted && targetVolume>0 && mzArcadeAudio.paused){
     mzArcadeAudio.play().catch(err=>console.warn('MILE ZERO arcade BGM playback failed',err));
   }
 });
 // Mini-game sound stays outside the regular playlist and is bound to the arcade overlay lifetime.
 let mzArcadeActive=false;
 const mzArcadeAudio=new Audio('assets/audio/arcade-powerup.mp3');
 mzArcadeAudio.preload='none';
 mzArcadeAudio.loop=true;
 function mzArcadeSyncSound(){
   mzArcadeAudio.muted=audio.muted;
   mzArcadeAudio.volume=targetVolume;
   // Mini-game SFX are synchronized directly through sfxVolume in the parent.
 }
 function mzArcadeStop(){
   if(!mzArcadeActive)return;
   mzArcadeActive=false;
   mzArcadeAudio.pause();
   try{mzArcadeAudio.currentTime=0}catch(e){}
   if(hasStarted&&!audio.muted&&!mzBoxActive)audio.play().catch(()=>{});
 }
 function mzArcadeStart(){
   if(mzArcadeActive)return;
   mzArcadeSyncSound();
   mzArcadeActive=true;
   audio.pause();
   try{mzArcadeAudio.currentTime=0}catch(e){}
   mzArcadeAudio.play().catch(err=>{
     // A user click inside the iframe can retry when autoplay is restricted.
     console.warn('MILE ZERO arcade BGM playback pending user interaction',err);
   });
 }
 window.mzArcadeMusic={start:mzArcadeStart,stop:mzArcadeStop,sync:mzArcadeSyncSound,isActive:()=>mzArcadeActive,
   resume:()=>{if(mzArcadeActive && !audio.muted && targetVolume>0 && mzArcadeAudio.paused){mzArcadeAudio.play().catch(err=>console.warn('MILE ZERO arcade BGM retry failed',err))}}
 };

 // The weekend music box plays the supplied recording, separate from the BGM playlist.
 let mzBoxActive=false;
 const mzBoxAudio=new Audio('assets/audio/musicbox-starry-night.mp3');
 mzBoxAudio.preload='none';
 mzBoxAudio.loop=true;
 function mzBoxSyncSound(){
   mzBoxAudio.muted=sfxVolume<=0;
   mzBoxAudio.volume=sfxVolume;
 }
 function mzBoxStop(){
   if(!mzBoxActive)return;
   mzBoxActive=false;
   mzBoxAudio.pause();
   try{mzBoxAudio.currentTime=0}catch(e){}
   if(hasStarted&&!audio.muted&&!mzArcadeActive)audio.play().catch(()=>{});
 }
 function mzBoxToggle(){
   if(mzBoxActive){mzBoxStop();return;}
   mzBoxSyncSound();
   mzBoxActive=true;
   audio.pause();
   try{mzBoxAudio.currentTime=0}catch(e){}
   mzBoxAudio.play().catch(()=>{
     mzBoxActive=false;
     if(hasStarted&&!audio.muted&&!mzArcadeActive)audio.play().catch(()=>{});
   });
 }
 window.mzMusicBox={toggle:mzBoxToggle,stop:mzBoxStop,isActive:()=>mzBoxActive};
 function playlistMarkup(){
   const name=byId(currentId)?.name||'알 수 없는 곡';
   return `<div class="mz-pl-head"><strong>PLAYLIST</strong><span>각 곡 2회 재생 · 마지막 곡 이후 처음부터 반복</span></div>
    <div class="mz-pl-now">NOW PLAYING · ${escapeHTML(name)} <span>(${played+1}/2)</span></div>
    <div class="mz-pl-track-list">${library.map(t=>{
      const on=playlist.includes(t.id),idx=playlist.indexOf(t.id);
      return `<div class="mz-pl-track" data-pl-item="${escapeHTML(t.id)}">
       <label><input type="checkbox" data-pl-toggle="${escapeHTML(t.id)}" ${on?'checked':''}><span><strong>${escapeHTML(t.name)}</strong><small>${escapeHTML(t.artist)}</small></span></label>
       <div class="mz-pl-track-actions"><button type="button" class="btn" data-pl-up="${escapeHTML(t.id)}" ${!on||idx===0?'disabled':''} title="위로">↑</button><button type="button" class="btn" data-pl-down="${escapeHTML(t.id)}" ${!on||idx===playlist.length-1?'disabled':''} title="아래로">↓</button><button type="button" class="btn" data-pl-play="${escapeHTML(t.id)}" ${!on?'disabled':''}>재생</button></div>
      </div>`}).join('')}</div>
    <div class="mz-pl-foot"><span>선택한 곡만 설정한 순서대로 재생합니다. 한 곡만 선택하면 그 곡만 반복됩니다.</span><button class="btn" type="button" data-pl-reset>기본값</button></div>`;
 }
 function refreshPlaylist(){document.querySelectorAll('#milePlaylistManager').forEach(el=>{el.innerHTML=playlistMarkup();bindPlaylist(el)})}
 function updateList(ids){
   const valid=[...new Set(ids.filter(id=>byId(id)))];
   if(!valid.length){refreshPlaylist();return}
   playlist=valid;persistList();
   if(!playlist.includes(currentId))setSong(playlist[0]);
   refreshPlaylist();
 }
 function bindPlaylist(root){
   if(!root)return;
   root.querySelectorAll('[data-pl-toggle]').forEach(input=>input.onchange=()=>{
      const id=input.dataset.plToggle;
      if(input.checked)updateList([...playlist,id]);else updateList(playlist.filter(x=>x!==id));
   });
   root.querySelectorAll('[data-pl-up],[data-pl-down]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.plUp||b.dataset.plDown,i=playlist.indexOf(id),j=i+(b.dataset.plUp?-1:1);
      if(i<0||j<0||j>=playlist.length)return;
      const nextList=[...playlist];[nextList[i],nextList[j]]=[nextList[j],nextList[i]];updateList(nextList);
   });
   root.querySelectorAll('[data-pl-play]').forEach(b=>b.onclick=()=>{setSong(b.dataset.plPlay);start()});
   const reset=root.querySelector('[data-pl-reset]');if(reset)reset.onclick=()=>{updateList(library.map(t=>t.id));setSong(playlist[0])};
 }
 document.addEventListener('pointerdown',start,{passive:true});
 document.addEventListener('keydown',start);
 window.mileMusic={
  getVolume:()=>Math.round(targetVolume*100),isEnabled:()=>!audio.muted,
  toggle(){audio.muted=!audio.muted;mzBoxSyncSound();mzArcadeSyncSound();persist();start();update()},
  setEnabled(v){audio.muted=!v;mzBoxSyncSound();mzArcadeSyncSound();persist();start();update()},
  setVolume(v){targetVolume=Math.min(1,Math.max(0,Number(v)/100));if(!fading)audio.volume=targetVolume;mzBoxSyncSound();mzArcadeSyncSound();persist();start();update()},
  playlistMarkup,bindPlaylist,getPlaylist:()=>[...playlist],getCurrent:()=>currentId,
  next,refresh:update
 };
 document.addEventListener('DOMContentLoaded',update);
})();

// u228: a single cursor light shared by all neighboring existing controls.
(function u228CursorGlow(){
  function update(host,e){
    if(e.pointerType==='touch')return;
    const cards=host.querySelectorAll(':scope > .side, :scope > .boot-btn');
    for(const card of cards){
      const r=card.getBoundingClientRect();
      card.style.setProperty('--u228-x',(e.clientX-r.left).toFixed(1)+'px');
      card.style.setProperty('--u228-y',(e.clientY-r.top).toFixed(1)+'px');
    }
    host.classList.add('u228-active');
  }
  document.addEventListener('pointermove',e=>{
    const host=e.target.closest?.('.u228-host');
    if(host)update(host,e);
  },{passive:true});
  document.addEventListener('pointerout',e=>{
    const host=e.target.closest?.('.u228-host');
    if(host&&!host.contains(e.relatedTarget))host.classList.remove('u228-active');
  },{passive:true});
})();
