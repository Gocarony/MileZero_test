/* MILE ZERO setting, confirmed: the player runs the evening shift (18:00-02:00);
   the owner runs the daytime shift. A past virus intrusion into the gate-side
   commercial district forced multiple businesses to close; details may emerge
   gradually through patrons' stories. Do not assume further event details. */

/* MILE ZERO — Shared state, DOM helpers, new-game state, day flow.
   Declarations only: nothing here runs at load time (see js/game/main.js). */
'use strict';

function dayLabel(d){return 'DAY '+String(d).padStart(2,'0')}

function initial(){return {day:1,phase:'prep',visit:0,line:0,sub:'dialogue',waitUntil:null,station:'drink',mix:[],ice:false,iceCount:0,stirred:false,mixAt:0,extra:null,foodBase:null,foodSauce:null,foodKind:null,foodHeat:0,completed:[],tips:0,served:0,mistakes:0,light:'dark',lightSeen:{},log:[],remarked:false,lightComment:null,seenIntro:false,phoneTab:'feed',readPosts:[],readMessages:[],deliveredMessages:['welcome','schedule'],dayStats:{},customRecipes:[],unlockedExtras:[],developmentDone:false,developmentDays:[],ownedMarket:[],wallet:0,friendCounterUnlockDay:null,randomSeed:Math.floor(Math.random()*2147483647),day27TrendId:null,day39TrendId:null,sunsetRoadRecipe:null,regularUnlocks:[],mechanicRegularFrom:null,dayTenMechanicScheduled:null,foodAddons:[],specialOutcome:null,garnishDialogue:[],garnishDiscoveries:[],snsHearts:[],guestVisits:[],guestClues:[],guestArchiveSeen:[],recipeNotices:[],recipeNoticeSeen:[],darkMatterFound:false,weekendDiaries:{},weekendsCompleted:[],appointments:[],weekendStoriesDone:[],weekendStoryCursor:0,weekendStoryAnswers:{},appointmentDecisions:[],deskOwned:[],deskPlaced:[],marketSeenStockIds:[],genericPortraitAssignments:{},weekendActive:false,arcadeRepaired:false};}

function seedPick(state,day,index,salt){let h=((state.randomSeed||104729) ^ Math.imul(day+1,0x45d9f3b) ^ Math.imul(index+1,0x119de1f3) ^ Math.imul(salt+1,0x27d4eb2d))>>>0;h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return (h>>>0)/4294967296;}

const $=x=>document.getElementById(x),esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const note=(who,line)=>s.log.push({who,line});

function nextDay(){
 if(s.day>=mzDayLimit()||mzWeekendEligible()&&!s.devPreview)return;
 s.day++;if(s.day===21){s.recipeNotices=Array.isArray(s.recipeNotices)?s.recipeNotices:[];for(const r of fishRecipes)if(!s.recipeNotices.includes(r.name))s.recipeNotices.push(r.name);}if(s.day===10){s.recipeNotices=Array.isArray(s.recipeNotices)?s.recipeNotices:[];for(const r of friedRecipes)if(!s.recipeNotices.includes(r.name))s.recipeNotices.push(r.name);}s.phase='prep';s.visit=0;s.line=0;s.sub='dialogue';s.waitUntil=null;if(s.day===27)mzDay27TrendId();if(s.day===39)mzDay39TrendId();
 s.station='drink';s.completed=[];clearDrink();s.foodBase=s.foodSauce=s.foodKind=null;s.foodHeat=0;
 s.remarked=false;s.lightComment=null;s.specialOutcome=null;s.garnishDialogue=[];s.phoneTab='feed';
 const id='day'+s.day;if(!s.deliveredMessages.includes(id)){s.deliveredMessages.push(id);playEffect('mail');}
 mzWeekCheckpoint(s.day);
 bootScreen='phone';expandedPosts=new Set();phoneMail=null;render();
}
