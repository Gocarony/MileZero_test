/* Global visual preference: independent of game-save slots. */
(()=>{
 const KEY='milezero_scene_backgrounds_enabled_v1';
 let enabled=true;
 try {enabled=localStorage.getItem(KEY)!=='false';} catch(e) {}
 const apply=()=>document.body.classList.toggle('mz-scene-backgrounds-off',!enabled);
 window.mzSceneBackground={
  enabled:()=>enabled,
  setEnabled(value){
   enabled=!!value;
   try{localStorage.setItem(KEY,String(enabled));}catch(e){}
   apply();
  }
 };
 apply();
})();
