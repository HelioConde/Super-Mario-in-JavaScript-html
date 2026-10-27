/* Original layout and sprite art retained; physics/input updated independently. */
(()=>{
"use strict";
const player=document.querySelector("#player"),intro=document.querySelector("#home"),logo=document.querySelector("#logo1"),config=document.querySelector("#keyConfig");
const $=id=>document.getElementById(id);
const defaults={ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",Jump:"KeyD",Run:"KeyA",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",JumpSpin:"KeyS",Getting:"KeyF"};
let bindings={...defaults};try{const raw=JSON.parse(localStorage.getItem("marioClassicKeys")||"null");if(raw&&typeof raw==="object")bindings={...bindings,...raw};}catch{}
const pressed=new Set();
let started=false,paused=false,vy=0,vx=0,onGround=false,look=1,clock=0,last=0,camera=0,platforms=[],worldWidth=12680;
let x=120,y=110,groundY=0;const W=35,H=51;
const music=$("thema"),jumpAudio=$("jump");
const originalSprite="./img/mario.png";
const frameStyle={idle:{x:532,y:0,w:35,h:51},walk:{x:836,y:0,w:38,h:48},jump:{x:532,y:99,w:38,h:56}};
const spriteImage=new Image();spriteImage.src=originalSprite;
let spriteAvailable=false;
spriteImage.onload=()=>{spriteAvailable=true;player.dataset.spriteStatus="ready";};
spriteImage.onerror=()=>{player.dataset.spriteStatus="error";console.error("Falha ao carregar sprites originais:",originalSprite);};
function applySprite(frame){
 const f=frameStyle[frame]||frameStyle.idle;
 player.style.backgroundImage='url("'+originalSprite+'")';
 player.style.backgroundSize="1000px auto";
 player.style.backgroundRepeat="no-repeat";
 player.style.backgroundPosition="-"+f.x+"px -"+f.y+"px";
 player.style.width=f.w+"px";player.style.height=f.h+"px";
 player.dataset.animation=frame;player.dataset.sprite=originalSprite;
}
const styles=document.createElement("style");
styles.textContent=`
  .table,.piso1X,.piso1O,.piso1Y,.piso2X,.piso2O,.piso2Y,.piso3X,.piso3O1,.piso3O2,.piso3Y{border:0!important}
  #player{border:0!important;pointer-events:none;background-image:url("./img/mario.png")!important;background-size:1000px auto!important;image-rendering:pixelated;transform-origin:center bottom}
  #keyConfig{z-index:150!important;position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%);width:min(90vw,410px)!important;height:auto!important;max-height:85vh;overflow:auto;padding:24px!important;background:#f8fafc!important;border:4px solid #243c73;box-shadow:0 15px 60px #0008;font:15px system-ui!important;border-radius:12px}
  #keyConfig>div:nth-child(odd){margin-top:5px;font-weight:650}#keyConfig input{padding:5px;text-align:center}
  #keyConfig button,.classic-actions button{padding:8px 12px;border:2px solid #fff;border-radius:8px;background:#fbc548;color:#222;font-weight:bold;cursor:pointer}
  #keyConfig button:focus-visible,.classic-actions button:focus-visible{outline:3px solid #2862db}
  .classic-actions{position:fixed;right:12px;top:12px;z-index:90;display:flex;gap:7px;flex-wrap:wrap}
  #logo1{left:50%!important;top:42%!important;transform:translate(-50%,-50%);width:90%!important;font-size:clamp(18px,3vw,29px)!important}
  #logo2{display:block!important;left:50%!important;transform:translateX(-50%);width:min(75vw,460px)!important;top:7%!important;z-index:30!important}
  #logo2 #config{display:none!important}
  .classic-start{position:fixed;z-index:110;top:68%;left:50%;transform:translateX(-50%);padding:12px 24px;border:3px solid white;border-radius:12px;background:#f6cd45;font:bold 18px system-ui;cursor:pointer}
  #home{background:rgba(0,0,0,.68)!important;z-index:90!important}
  body{background:#79d2ed url("./img/bg1.jpg") center center / auto 100vh repeat-x fixed!important;min-height:100vh}
  #backgrounds{pointer-events:none;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background-image:url("./img/bg1.jpg")!important;background-size:auto 100%!important;background-repeat:repeat-x!important;z-index:0!important}
  #fase1{z-index:2!important}
  #logo2{pointer-events:none}
  body.classic-playing #logo2{display:none!important}
  body.classic-playing #logo1{display:none!important}
  body.classic-playing #backgrounds{display:block!important}

  #fase1{pointer-events:none}
  .classic-touch{display:none;position:fixed;bottom:15px;left:12px;right:12px;z-index:80;justify-content:space-between;pointer-events:none}
  .classic-touch>div{display:flex;gap:9px}.classic-touch button{pointer-events:auto;touch-action:none;border:2px solid #fff9;border-radius:15px;background:#203c6acb;color:white;width:62px;height:62px;font:bold 24px system-ui}
  @media(pointer:coarse),(max-width:650px){.classic-touch{display:flex}}
`;
document.head.append(styles);
const actions=document.createElement("div");actions.className="classic-actions";
actions.innerHTML='<button id="classic-photo">📷 Foto</button><button id="classic-pause">Pausar</button><button id="classic-keys">Teclas</button><a href="./modern.html" style="background:#23477c;color:white;padding:10px;border-radius:8px;text-decoration:none;font:bold 13px system-ui">Versão moderna</a>';
document.body.append(actions);
const touch=document.createElement("div");touch.className="classic-touch";
touch.innerHTML='<div><button data-key="left" aria-label="Esquerda">◀</button><button data-key="right" aria-label="Direita">▶</button></div><div><button data-key="run" aria-label="Correr">⚡</button><button data-key="jump" aria-label="Pular">▲</button></div>';
document.body.append(touch);const mobile=new Set();
const button=document.createElement("button");button.className="classic-start";button.textContent="Jogar";document.body.append(button);
const active=a=>pressed.has(bindings[a])||mobile.has(a)|| (a==="ArrowLeft"&&pressed.has("KeyA")) ||(a==="ArrowRight"&&pressed.has("KeyD"))||(a==="Jump"&&pressed.has("Space"));
function collect(){
 platforms=[...document.querySelectorAll('[class*="piso"]')].filter(e=>/^piso\d/.test(e.className)).map(e=>{const r=e.getBoundingClientRect();return{x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};}).filter(p=>p.w>0&&p.h>0);
 worldWidth=Math.max(12680,document.querySelector("#fase1")?.scrollWidth||12680);
}
function start(){collect();window.ClassicChallenges?.reset(platforms);const p=platforms.find(q=>q.x>60&&q.x<700)||platforms[0];x=p?p.x+10:130;y=p?p.y-H:Math.max(100,innerHeight*.55);vy=0;vx=0;onGround=!!p;started=true;paused=false;document.body.classList.add("classic-playing");intro.style.display="none";button.style.display="none";config.style.display="none";clock=0;last=performance.now();if(music){music.volume=.25;music.loop=true;music.play().catch(()=>{});}}
button.addEventListener("click",start);function jump(){if(!started||paused||!onGround)return;vy=-540;onGround=false;jumpAudio?.play().catch(()=>{});}
function save(){localStorage.setItem("marioClassicKeys",JSON.stringify(bindings));}
for(const name of Object.keys(defaults)){const input=$(name);if(!input)continue;input.readOnly=true;input.value=bindings[name];input.title="Clique e pressione uma tecla";input.addEventListener("keydown",e=>{e.preventDefault();e.stopPropagation();if(e.code==="Escape")return;if(Object.entries(bindings).some(([k,v])=>k!==name&&v===e.code)){input.value="Em uso";return;}bindings[name]=e.code;input.value=e.code;save();pressed.clear();});}
$("saveKeyConfig")?.addEventListener("click",()=>{config.style.display="none";if(started)paused=false;});
$("saveKeyReturn")?.addEventListener("click",()=>{config.style.display="none";if(started)paused=false;});
function keysMenu(){config.style.display="block";paused=started;pressed.clear();config.querySelector("input")?.focus();}
$("classic-keys").onclick=keysMenu;
$("classic-pause").onclick=()=>{if(!started)return;paused=!paused;pressed.clear();$("classic-pause").textContent=paused?"Continuar":"Pausar";};
$("classic-photo").onclick=async()=>{try{
 const snapshot=document.createElement("canvas");snapshot.width=innerWidth;snapshot.height=innerHeight;
 const c=snapshot.getContext("2d");
 const bg=new Image();bg.src="./img/bg1.jpg";await bg.decode();
 c.drawImage(bg,0,0,snapshot.width,snapshot.height);
 const elements=[...document.querySelectorAll('[class*="piso"]')];
 const ground=new Image();ground.src="./img/piso1.png";await ground.decode();
 elements.forEach(e=>{const r=e.getBoundingClientRect();if(r.right<0||r.left>innerWidth)return;c.drawImage(ground,62,0,54,82,r.x,r.y,r.width,r.height);});
 const sprite=new Image();sprite.src="./img/mario.png";await sprite.decode();
 const pr=player.getBoundingClientRect();c.drawImage(sprite,532,onGround?0:99,35,51,pr.x,pr.y,W,H);
 const a=document.createElement("a");a.download="mario-classico-"+Date.now()+".png";a.href=snapshot.toDataURL("image/png");a.click();
 }catch(err){console.error(err);alert("Não foi possível salvar a foto.");}};
document.addEventListener("keydown",e=>{if(config.style.display==="block"||e.target.matches("input"))return;if(Object.values(bindings).includes(e.code)||["ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();if(!e.repeat&&(e.code===bindings.Jump||e.code==="Space"))jump();pressed.add(e.code);if(!started&&["Enter","Space"].includes(e.code))start();if(e.code==="Escape"&&started){paused=!paused;pressed.clear();}});
document.addEventListener("keyup",e=>pressed.delete(e.code));
touch.querySelectorAll("button").forEach(b=>{let k=b.dataset.key;const a=k==="left"?"ArrowLeft":k==="right"?"ArrowRight":k==="run"?"Run":"Jump";b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);mobile.add(a);if(a==="Jump")jump();});for(const name of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(name,()=>mobile.delete(a));});
window.addEventListener("blur",()=>{pressed.clear();mobile.clear();if(started)paused=true;});
function frame(now){const dt=Math.min(.03,(now-last)/1000||0);last=now;if(started&&!paused){
 const dir=Number(active("ArrowRight"))-Number(active("ArrowLeft"));vx=dir*(active("Run")?350:225);if(dir)look=dir;
 const oldX=x,oldBottom=y+H;
 x=Math.max(0,Math.min(worldWidth-W,x+vx*dt));
 vy=Math.min(950,vy+1450*dt);y+=vy*dt;onGround=false;
 const challenge=window.ClassicChallenges?.update({x,y,w:W,h:H,vy,oldBottom},dt);
 if(challenge?.blocking){
  const pipe=challenge.blocking;
  if(oldBottom<=pipe.y+12&&vy>=0){y=pipe.y-H;vy=0;onGround=true;}
  else if(oldX+W<=pipe.x+8){x=pipe.x-W;vx=0;}
  else if(oldX>=pipe.x+pipe.w-8){x=pipe.x+pipe.w;vx=0;}
  else if(vy<0){y=pipe.y+pipe.h;vy=0;}
 }
 if(challenge?.stomped){vy=-330;onGround=false;}
 if(challenge?.damaged){
  x=Math.max(80,challenge.checkpoint||100);y=100;vy=0;
 }
 if(challenge?.gameOver){
  paused=true;alert("Fim de jogo! Aperte Jogar para tentar novamente.");
  start();return;
 }
 for(const p of platforms){if(x+W<=p.x+3||x>=p.x+p.w-3)continue;if(vy>=0&&oldBottom<=p.y+10&&y+H>=p.y){y=p.y-H;vy=0;onGround=true;break;}}
 if(y>innerHeight+250){const checkpoint=window.ClassicChallenges?.getCheckpoint()||100;const p=platforms.find(q=>checkpoint>=q.x&&checkpoint<=q.x+q.w)||platforms[0];x=checkpoint;y=p?p.y-H:150;vy=0;}
 clock+=dt;
 const desired=Math.max(0,Math.min(worldWidth-innerWidth,x-innerWidth*.4));camera+=(desired-camera)*Math.min(1,dt*8);window.scrollTo({left:camera,top:0,behavior:"instant"});
 player.style.left=x+"px";player.style.top=y+"px";player.style.transform=look<0?"scaleX(-1)":"none";
 applySprite(!onGround?"jump":Math.abs(vx)>10&&Math.floor(clock*8)%2?"walk":"idle");
 }
 requestAnimationFrame(frame);}
applySprite("idle");
logo.style.display="block";$("pressMsg").textContent="Pressione Espaço ou clique em Jogar";
requestAnimationFrame(frame);
})();
