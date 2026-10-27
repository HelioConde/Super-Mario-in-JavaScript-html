import {LEVELS} from "./levels.js";
const canvas=document.querySelector("#game"),ctx=canvas.getContext("2d");
ctx.imageSmoothingEnabled=false;
const $=q=>document.querySelector(q),T=32,W=canvas.width,H=canvas.height;
const keys=new Set(),touch=new Set();
let index=0,level,coins=[],enemies=[],blocks=[],powerups=[],movers=[],checkpoint,goal,particles=[];
let player,cam=0,lives=3,score=0,money=0,time=0,playing=false,paused=false,muted=false,last=0,anim=0,completed=0;
let checkpointX=2*T,checkpointY=12*T,invulnerable=0,high=0;
try{high=Number(localStorage.getItem("marioRecord")||0)||0;completed=Number(localStorage.getItem("marioUnlocked")||0)||0;}catch{}
const sound=(freq=440,dur=.09,type="square")=>{
 if(muted)return;
 try{const ac=sound.audio||(sound.audio=new (window.AudioContext||window.webkitAudioContext)());
 if(ac.state==="suspended")ac.resume();
 const osc=ac.createOscillator(),gain=ac.createGain();
 osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.045,ac.currentTime);
 gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);
 osc.connect(gain).connect(ac.destination);osc.start();osc.stop(ac.currentTime+dur);
 }catch{}
};
function tile(x,y){if(x<0||y<0||y>=level.tiles.length||x>=level.tiles[0].length)return x<0||x>=level.tiles[0].length?"#":".";return level.tiles[y][x];}
function solid(x,y){return tile(x,y)==="#"||tile(x,y)==="?"||tile(x,y)==="B";}
function collides(x,y,w,h){const left=Math.floor(x/T),right=Math.floor((x+w-.01)/T),top=Math.floor(y/T),bottom=Math.floor((y+h-.01)/T);
 for(let ty=top;ty<=bottom;ty++)for(let tx=left;tx<=right;tx++)if(solid(tx,ty))return {x:tx,y:ty};return null;}
function rebuild(n,retain=false){
 index=n;level=LEVELS[n];coins=[];enemies=[];blocks=[];powerups=[];movers=[];particles=[];time=0;cam=0;
 level.tiles=level.tiles.map(r=>r.split(""));
 for(let y=0;y<level.tiles.length;y++)for(let x=0;x<level.tiles[y].length;x++){
  const c=tile(x,y);
  if(c==="C"){coins.push({x:x*T+T/2,y:y*T+T/2,active:true});level.tiles[y][x]=".";}
  if(c==="E"){enemies.push({x:x*T,y:y*T,vx:0,dir:x%2?-1:1,alive:true});level.tiles[y][x]=".";}
  if(c==="P"){powerups.push({x:x*T+5,y:y*T,active:true});level.tiles[y][x]=".";}
  if(c==="M"){movers.push({x:x*T,y:y*T,initial:x*T,phase:x*2,width:64});level.tiles[y][x]=".";}
  if(c==="H"){checkpoint={x:x*T,y:y*T,active:false};level.tiles[y][x]=".";}
  if(c==="G"){goal={x:x*T,y:y*T};level.tiles[y][x]=".";}
  if(c==="?"||c==="B")blocks.push({x,y,type:c,used:false});
 }
 player={x:2*T,y:12*T,w:24,h:29,vx:0,vy:0,grounded:false,big:false,shield:0,face:1,coyote:0,jumpBuffer:0};
 checkpointX=player.x;checkpointY=player.y;invulnerable=0;
 if(!retain){lives=3;score=0;money=0;}
 updateHUD();
}
function addParticles(x,y,color,count=7){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*210,vy:-Math.random()*180,life:.4+Math.random()*.3,color});}
function reward(points,x,y){score+=points;addParticles(x,y,"#ffe083");sound(870,.08);updateHUD();}
function hitBlock(tx,ty){
 const b=blocks.find(b=>b.x===tx&&b.y===ty);if(!b)return;
 if(b.type==="B"&&player.big){level.tiles[ty][tx]=".";addParticles(tx*T+16,ty*T+16,"#bd7040",14);sound(160,.12);return;}
 if(b.used)return;
 b.used=true;
 if(b.type==="?"){level.tiles[ty][tx]="#";money++;reward(100,tx*T+16,ty*T);if(money%10===0)lives=Math.min(9,lives+1);}
 else sound(260,.07);
}
function moveAxis(axis,dist){
 if(!dist)return;
 const sign=Math.sign(dist);const chunk=6;let rem=Math.abs(dist);
 while(rem>0){const step=Math.min(chunk,rem)*sign;const nx=player.x+(axis==="x"?step:0),ny=player.y+(axis==="y"?step:0);
 const contact=collides(nx,ny,player.w,player.h);
 if(contact){if(axis==="y"){if(sign>0){player.grounded=true;player.coyote=.095;}else hitBlock(contact.x,contact.y);player.vy=0;}else player.vx=0;return;}
 player.x=nx;player.y=ny;rem-=Math.abs(step);
 }
}
function takeDamage(){
 if(invulnerable>0)return;
 if(player.shield>0){player.shield=0;invulnerable=1.5;sound(180,.12);return;}
 if(player.big){player.big=false;player.y+=16;player.h=29;invulnerable=2;sound(180,.18);return;}
 lives--;sound(120,.28);if(lives<=0){finish("Fim de jogo","Você pode tentar de novo! Pontuação: "+score,"Recomeçar",()=>start(false));return;}
 player.x=checkpointX;player.y=checkpointY;player.vx=0;player.vy=0;invulnerable=2;updateHUD();
}
function intersects(a,b){return a.x<b.x+(b.w||24)&&a.x+a.w>b.x&&a.y<b.y+(b.h||24)&&a.y+a.h>b.y;}
function update(dt){
 time+=dt;anim+=dt;invulnerable=Math.max(0,invulnerable-dt);
 const left=keys.has("ArrowLeft")||keys.has("KeyA")||touch.has("left"),right=keys.has("ArrowRight")||keys.has("KeyD")||touch.has("right");
 const running=keys.has("ShiftLeft")||keys.has("ShiftRight")||touch.has("run"),dir=Number(right)-Number(left),speed=running?295:205;
 const accel=player.grounded?1800:1120;
 if(dir){player.vx+=Math.sign(dir)*accel*dt;player.vx=Math.max(-speed,Math.min(speed,player.vx));player.face=dir;}
 else player.vx=Math.sign(player.vx)*Math.max(0,Math.abs(player.vx)-(player.grounded?2300:620)*dt);
 if(player.grounded){player.coyote=.09;}else player.coyote=Math.max(0,player.coyote-dt);
 if(player.jumpBuffer>0){player.jumpBuffer-=dt;if(player.coyote>0){player.vy=-520;player.grounded=false;player.coyote=0;player.jumpBuffer=0;sound(510,.09);}}
 const holding=keys.has("Space")||keys.has("ArrowUp")||keys.has("KeyW")||touch.has("jump");
 if(!holding&&player.vy< -180)player.vy=-180;
 player.vy=Math.min(820,player.vy+1350*dt);
 const oldY=player.y;
 player.grounded=false;
 moveAxis("x",player.vx*dt);moveAxis("y",player.vy*dt);
 player.x=Math.max(0,Math.min(level.tiles[0].length*T-player.w,player.x));
 for(const m of movers){m.x=m.initial+Math.sin(time*1.25+m.phase)*35;
 if(player.vy>=0&&oldY+player.h<=m.y+10&&player.y+player.h>=m.y&&player.x+player.w>m.x&&player.x<m.x+m.width){player.y=m.y-player.h;player.vy=0;player.grounded=true;}}
 for(const c of coins){if(c.active&&intersects(player,{x:c.x-9,y:c.y-9,w:18,h:18})){c.active=false;money++;reward(100,c.x,c.y);if(money%10===0)lives=Math.min(9,lives+1);}}
 for(const p of powerups){if(p.active&&intersects(player,{x:p.x,y:p.y,w:22,h:24})){p.active=false;player.shield=1;score+=500;addParticles(p.x,p.y,"#5dffbb",15);sound(730,.24);}}
 for(const e of enemies){if(!e.alive)continue;
 e.vx=e.dir*(index+1)*26+e.dir*34;
 const next=e.x+e.vx*dt;
 const obstacle=collides(next,e.y,25,25),hasFloor=solid(Math.floor((next+(e.dir>0?25:0))/T),Math.floor((e.y+28)/T));
 if(obstacle||!hasFloor)e.dir*=-1;else e.x=next;
 const body={x:e.x,y:e.y,w:25,h:25};
 if(intersects(player,body)){
 if(player.vy>50&&oldY+player.h<=e.y+12){e.alive=false;player.vy=-330;reward(200,e.x,e.y);sound(370,.13);}
 else takeDamage();
 }}
 if(checkpoint&&!checkpoint.active&&player.x>=checkpoint.x){checkpoint.active=true;checkpointX=checkpoint.x;checkpointY=checkpoint.y-32;reward(250,checkpoint.x,checkpoint.y);}
 if(goal&&player.x+player.w>goal.x&&player.y<goal.y+70){
 score+=Math.max(0,Math.floor(400-time))*10;updateHUD();
 if(index===LEVELS.length-1){completed=LEVELS.length;persist();finish("Aventura concluída!","Você completou as três fases! Pontos: "+score+".","Jogar novamente",()=>start(false));}
 else{completed=Math.max(completed,index+1);persist();finish("Fase concluída!","Você desbloqueou "+LEVELS[index+1].name+". Pontos: "+score+".","Próxima fase",()=>{rebuild(index+1,true);resume();});}
 }
 if(player.y>H+100){takeDamage();if(!playing)return;}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;}
 particles=particles.filter(p=>p.life>0);
 const target=Math.max(0,Math.min(level.tiles[0].length*T-W,player.x-W*.38));
 cam+=(target-cam)*Math.min(1,dt*6);
 updateHUD();
}
function persist(){try{if(score>high){high=score;localStorage.setItem("marioRecord",String(high));}localStorage.setItem("marioUnlocked",String(completed));}catch{}}
function updateHUD(){
 $("#level").textContent="FASE "+(index+1)+" · "+LEVELS[index].name;
 $("#score").textContent="⭐ "+String(score).padStart(6,"0");
 $("#coins").textContent="🟡 "+String(money).padStart(2,"0");
 $("#lives").textContent="❤ "+String(lives).padStart(2,"0");
 $("#time").textContent="⏱ "+Math.floor(time).toString().padStart(3,"0");
}
const themes={day:["#76cafa","#b6ecff","#63a85b"],sunset:["#ff9c7e","#ffd8a0","#a65e7a"],night:["#252c68","#6174a9","#34456d"]};
function rect(color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
function draw(){
 const [sky,light,hill]=themes[level.theme];ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 rect(light,0,H-210,W,210);
 for(let i=-1;i<12;i++){let x=i*125-(cam*.22%125);ctx.fillStyle=hill;ctx.beginPath();ctx.arc(x,H-70,120,Math.PI,0);ctx.fill();}
 ctx.save();ctx.translate(-Math.round(cam),0);
 const first=Math.max(0,Math.floor(cam/T)-1),end=Math.min(level.tiles[0].length,Math.ceil((cam+W)/T)+1);
 for(let y=0;y<level.tiles.length;y++)for(let x=first;x<end;x++){const c=tile(x,y);if(c==="#"){rect("#845536",x*T,y*T,T,T);rect("#70b352",x*T,y*T,T,6);rect("#573a2a",x*T+3,y*T+9,T-6,3);}
 else if(c==="?"||c==="B"){rect(c==="?"?"#f6b842":"#b9693b",x*T+1,y*T+1,T-2,T-2);rect("#fff1a7",x*T+5,y*T+5,6,5);if(c==="?"){ctx.fillStyle="#553c14";ctx.font="bold 23px system-ui";ctx.fillText("?",x*T+9,y*T+25);}}
 }
 for(const c of coins)if(c.active){const wobble=Math.sin(anim*8+c.x)*3;rect("#ffcf32",c.x-8+wobble,c.y-11,16,22);rect("#fff6a7",c.x-2+wobble,c.y-8,4,12);}
 for(const m of movers){rect("#6e5bba",m.x,m.y,m.width,12);rect("#d2c2ff",m.x+5,m.y+2,m.width-10,4);}
 for(const e of enemies)if(e.alive){rect("#864025",e.x,e.y+7,25,19);rect("#b76635",e.x+3,e.y+3,19,13);rect("#fff",e.x+6,e.y+8,5,6);rect("#fff",e.x+15,e.y+8,5,6);rect("#222",e.x+8,e.y+9,2,4);rect("#222",e.x+17,e.y+9,2,4);}
 for(const p of powerups)if(p.active){rect("#0d9d75",p.x,p.y,22,23);rect("#d7ffdd",p.x+8,p.y+4,6,12);}
 if(checkpoint){rect("#34435d",checkpoint.x+6,checkpoint.y-42,4,74);rect(checkpoint.active?"#5effba":"#ffe15d",checkpoint.x+10,checkpoint.y-42,27,18);}
 if(goal){rect("#dbeafe",goal.x+5,goal.y-210,5,242);rect("#ffda48",goal.x+10,goal.y-210,43,30);}
 for(const p of particles)rect(p.color,p.x,p.y,5,5);
 if(!(invulnerable>0&&Math.floor(invulnerable*12)%2)){
 ctx.save();ctx.translate(player.x+player.w/2,player.y);ctx.scale(player.face,1);
 const step=player.grounded&&Math.abs(player.vx)>20?Math.sin(anim*15)*3:0;
 const offset=player.big?-8:0;
 rect("#df3937",-11,offset+2,22,10);rect("#ffcb98",-8,offset+12,16,12);
 rect("#d83433",-12,offset+24,24,6);rect("#396cc9",-9,offset+28,18,player.h-30+Math.abs(step));
 rect("#482c24",-12,offset+player.h-6+step,10,6);rect("#482c24",2,offset+player.h-6-step,10,6);
 rect("#fff",player.face===1?2:-7,offset+15,4,5);
 if(player.shield){ctx.strokeStyle="#b3ffdf";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,player.h/2,27,0,Math.PI*2);ctx.stroke();}
 ctx.restore();}
 ctx.restore();
}
function show(title,description,button,callback){
 playing=false;keys.clear();touch.clear();
 $("#overlay-title").textContent=title;$("#overlay-description").textContent=description;$("#play").textContent=button;
 $("#overlay").hidden=false;$("#play").onclick=()=>{callback();canvas.focus();};
 $("#options").hidden=false;
}
function finish(title,description,button,callback){persist();show(title,description,button,callback);}
function resume(){playing=true;paused=false;$("#overlay").hidden=true;last=performance.now();$("#pause").textContent="Pausar";}
function start(retain=false){rebuild(0,retain);resume();}
function pause(){if(!playing)return;playing=false;paused=true;show("Jogo pausado","Pressione continuar ou P para voltar à aventura.","Continuar",resume);}
$("#play").onclick=()=>start();
$("#options").onclick=()=>show("Como jogar","Setas ou A/D movem. Espaço, W ou ↑ pula; segure para pular mais alto. Shift corre. P pausa, R reinicia. Recolha moedas e chegue à bandeira!","Voltar",()=>show("SUPER MARIO WEB","Três fases com moedas, inimigos, segredos e checkpoints.","Começar aventura",()=>start()));
$("#pause").onclick=()=>paused?resume():pause();
$("#restart").onclick=()=>show("Reiniciar jogo?","O progresso desta partida será perdido.","Reiniciar",()=>start());
$("#sound").onclick=()=>{muted=!muted;$("#sound").textContent=muted?"Som desligado":"Som ligado";$("#sound").setAttribute("aria-pressed",String(!muted));};
const jump=()=>{if(player)player.jumpBuffer=.13;};
document.addEventListener("keydown",e=>{
 if(e.target.matches("button,input"))return;
 if(["ArrowLeft","ArrowRight","ArrowUp","Space"].includes(e.code))e.preventDefault();
 if(!e.repeat&&["Space","KeyW","ArrowUp"].includes(e.code))jump();
 if(e.code==="KeyP"||e.code==="Escape"){if(paused)resume();else pause();return;}
 if(e.code==="KeyR"){start();return;}
 keys.add(e.code);
});
document.addEventListener("keyup",e=>keys.delete(e.code));
for(const b of document.querySelectorAll("[data-key]")){
 const action=b.dataset.key;
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(action);if(action==="jump")jump();});
 for(const event of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(event,()=>touch.delete(action));
}
window.addEventListener("blur",()=>{keys.clear();touch.clear();if(playing)pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)pause();});
function frame(now){let dt=Math.min(.032,(now-last)/1000||0);last=now;if(playing)update(dt);draw();requestAnimationFrame(frame);}
rebuild(0);requestAnimationFrame(frame);
