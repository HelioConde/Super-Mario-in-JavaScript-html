/* Classic level additions. Uses original image assets; does not replace Mario's sprite. */
(()=>{
"use strict";
const TILE=54;
const stages=[
 {from:0,to:2800,pipes:[870,1730,2500],enemies:[560,1120,1510,2140],coins:[400,950,1200,1540,2320,2680]},
 {from:2800,to:6300,pipes:[3290,4170,5300,6010],enemies:[3050,3620,4450,4920,5660],coins:[2930,3340,3820,4170,4610,5100,5470,5880]},
 {from:6300,to:10000,pipes:[6760,7420,8240,9070],enemies:[6580,7060,7630,8040,8590,9480],coins:[6520,6870,7820,8180,8530,8890,9610]},
 {from:10000,to:12680,pipes:[10450,11380,11920],enemies:[10200,10740,11500,12100],coins:[10340,10800,11100,11580,12000,12380]}
];
const el=document.createElement("div");el.id="classic-challenges";el.setAttribute("aria-hidden","true");
el.style.cssText="position:absolute;top:0;left:0;width:12680px;height:100%;pointer-events:none;z-index:3";
document.body.append(el);
const style=document.createElement("style");
style.textContent=`
#classic-challenges .pipe{position:absolute;width:64px;height:var(--pipe-h);background:linear-gradient(90deg,#087d27 0 10%,#55e870 22%,#189c37 55%,#056923 95%);border:3px solid #075d23;border-top:0;box-sizing:border-box}
#classic-challenges .pipe::before{content:"";position:absolute;left:-8px;top:0;width:74px;height:18px;background:linear-gradient(90deg,#087d27,#7bf596 28%,#20b23e 70%,#076322);border:3px solid #075d23;box-sizing:border-box;border-radius:3px}
#classic-challenges .enemy{position:absolute;width:37px;height:37px;box-sizing:border-box;border-radius:47% 47% 18% 18%;background:#ad572c;border:3px solid #613219;box-shadow:inset 0 -8px #d7a16e,0 3px 1px #0008;image-rendering:pixelated}
#classic-challenges .enemy::before{content:"";position:absolute;top:10px;left:8px;width:5px;height:12px;background:#fff;border-right:2px solid #24201d;box-shadow:11px 0 #fff,13px 0 #24201d}
#classic-challenges .enemy::after{content:"";position:absolute;bottom:-4px;left:0;width:12px;height:7px;background:#59301c;box-shadow:17px 0 #59301c}
#classic-challenges .coin{position:absolute;width:19px;height:25px;border-radius:45%;background:linear-gradient(90deg,#c27804,#fff59b 40%,#f5b71b 75%);border:3px solid #f0a408;box-shadow:inset 0 0 0 2px #ffe773;animation:classic-coin .8s ease-in-out infinite alternate}
#classic-challenges .checkpoint{position:absolute;width:5px;height:80px;background:#e4eefb}
#classic-challenges .checkpoint::before{content:"";position:absolute;left:5px;top:0;width:34px;height:22px;background:#ffd747;clip-path:polygon(0 0,100% 50%,0 100%)}
.classic-level-hud{position:fixed;top:58px;right:12px;z-index:85;background:#092941dc;color:#fff;border:2px solid #fff5;border-radius:9px;font:bold 14px system-ui;padding:8px 12px;text-shadow:0 1px #000}
@keyframes classic-coin{to{transform:scaleX(.5)}}
@media(prefers-reduced-motion:reduce){#classic-challenges .coin{animation:none}}
`;
document.head.append(style);
let floor=[],entities=[],hud=document.createElement("div"),hits=0,score=0,coinCount=0,checkpoint=0,invulnerable=0;
hud.className="classic-level-hud";hud.textContent="🍄 Fase 1  ·  🪙 0  ·  ⭐ 0";document.body.append(hud);
const make=(cls,x,y,extra={})=>{const node=document.createElement("div");node.className=cls;node.style.left=x+"px";node.style.top=y+"px";for(const [k,v] of Object.entries(extra))node.style.setProperty(k,v);el.append(node);return node;};
function surface(x,{upper=false}={}){
 const candidates=floor.filter(p=>x>=p.x+2&&x<=p.x+p.w-2&&p.y>innerHeight*.34&&p.y<innerHeight*.99).map(p=>p.y);
 if(!candidates.length)return null;
 // Airborne platforms take priority for coins and pipes; lower floor for enemies.
 return upper?Math.min(...candidates):Math.max(...candidates);
}
function supportsWidth(x,width,height){
 const left=surface(x+8,{upper:true}),right=surface(x+width-8,{upper:true});
 return left!==null&&right!==null&&Math.abs(left-right)<=10&&Math.abs(left-height)<=10;
}
function reset(platforms){
 floor=platforms;el.replaceChildren();entities=[];score=0;hits=0;coinCount=0;checkpoint=0;invulnerable=0;
 for(const [stageIndex,stage] of stages.entries()){
  for(const [i,x] of stage.pipes.entries()){
   const ground=surface(x+32,{upper:true});if(ground===null||!supportsWidth(x,64,ground))continue;
   const h=65+(i%3)*24,y=ground-h;
   const node=make("pipe",x,y,{"--pipe-h":h+"px"});
   entities.push({type:"pipe",x,y,w:64,h,node});
  }
  for(const [i,x] of stage.enemies.entries()){
   const ground=surface(x+18);if(ground===null)continue;
   const y=ground-37,node=make("enemy",x,y);
   entities.push({type:"enemy",x,y,w:37,h:37,start:x,dir:i%2?-1:1,alive:true,node,limit:70+stageIndex*14});
  }
  for(const x of stage.coins){
   const ground=surface(x+9,{upper:true});if(ground===null)continue;
   const y=ground-58;
   // Avoid burying rewards in pipes or placing them inside other scenery.
   if(entities.some(e=>e.type==="pipe"&&x+19>e.x-8&&x<e.x+e.w+8&&y+25>e.y-8))continue;
   const node=make("coin",x,y);
   entities.push({type:"coin",x,y,w:19,h:25,alive:true,node});
  }
 }
 for(const x of [2900,6400,10100]){
  const ground=surface(x,{upper:true});if(ground===null)continue;
  const node=make("checkpoint",x,ground-80);
  entities.push({type:"checkpoint",x,y:ground-80,w:16,h:80,node,active:false});
 }
 updateHUD();
}
function updateHUD(){hud.textContent="🍄 Trecho "+(Math.min(4,Math.floor((window.__classicMarioX||0)/3100)+1))+"  ·  🪙 "+coinCount+"  ·  ⭐ "+score+"  ·  ❤ "+Math.max(0,3-hits);}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function update(player,dt){
 invulnerable=Math.max(0,invulnerable-dt);
 window.__classicMarioX=player.x;
 let damaged=false,stomped=false,blocking=null;
 for(const e of entities){
  if(e.type==="enemy"&&e.alive){
   const next=e.x+e.dir*(42+Math.min(30,Math.floor(player.x/3000)*8))*dt;
   const nextGround=surface(next+18);
   if(Math.abs(next-e.start)>e.limit||nextGround===null||Math.abs(nextGround-(e.y+e.h))>12||
      entities.some(pipe=>pipe.type==="pipe"&&next<pipe.x+pipe.w&&next+e.w>pipe.x&&e.y+e.h>pipe.y)){
     e.dir*=-1;
   }else e.x=next;
   e.node.style.left=e.x+"px";
   if(collide(player,e)){
    if(player.vy>80&&player.oldBottom<=e.y+14){e.alive=false;e.node.remove();score+=200;stomped=true;}
    else if(invulnerable===0){damaged=true;hits++;invulnerable=1.8;}
   }
  }else if(e.type==="pipe"&&collide(player,e))blocking=e;
  else if(e.type==="coin"&&e.alive&&collide(player,e)){e.alive=false;e.node.remove();coinCount++;score+=100;}
  else if(e.type==="checkpoint"&&!e.active&&player.x>=e.x){e.active=true;checkpoint=e.x;score+=250;e.node.style.setProperty("filter","hue-rotate(90deg)");}
 }
 updateHUD();
 return {blocking,damaged,stomped,checkpoint,gameOver:hits>=3};
}
window.ClassicChallenges={reset,update,getCheckpoint:()=>checkpoint};
})();
