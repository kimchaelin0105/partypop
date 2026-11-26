// 통합 캐릭터 데이터를 준비한 뒤 페이지 기능을 연결합니다.
window.PartyPopPalette.ready.then(() => {
// 메인 배너는 로고를 클릭한 뒤에만 영상을 표시·재생합니다.
(() => {
 const hero=document.querySelector('#home');
 const video=hero?.querySelector('.hero-video');
 const start=hero?.querySelector('.hero-start');
 const burst=hero?.querySelector('.hero-burst');
 const status=hero?.querySelector('.hero-play-status');
 if(!hero||!video||!start||!burst)return;
 const palette=['#fff06a','#ff82d9','#a5eaff','#ffffff','#ce9aff'];
 for(let i=0;i<24;i++){
  const particle=document.createElement('i');
  particle.className='hero-particle';
  const angle=i/24*Math.PI*2;
  const distance=110+(i%4)*35;
  particle.style.setProperty('--particle-x',Math.round(Math.cos(angle)*distance)+'px');
  particle.style.setProperty('--particle-y',Math.round(Math.sin(angle)*distance*.72)+'px');
  particle.style.setProperty('--particle-size',(10+(i%3)*6)+'px');
  particle.style.setProperty('--particle-spin',(i%2?150:-150)+'deg');
  particle.style.setProperty('--particle-color',palette[i%palette.length]);
  particle.style.setProperty('--particle-delay',(i%3)*.025+'s');
  burst.appendChild(particle);
 }
 video.pause();
 video.muted=true;
 let starting=false;
 let playAttempt=0;
 let burstCleanupTimer=null;
 function resetHero(){
  playAttempt++;
  starting=false;
  if(burstCleanupTimer!==null){clearTimeout(burstCleanupTimer);burstCleanupTimer=null;}
  video.pause();
  try{video.currentTime=0}catch{}
  video.setAttribute('aria-hidden','true');
  hero.classList.remove('is-playing');
  hero.classList.remove('is-bursting');
  start.hidden=false;
  start.disabled=false;
  status.textContent='';
 }
 const heroVisibility=new IntersectionObserver(entries=>{
  for(const entry of entries)if(!entry.isIntersecting||entry.intersectionRatio<.1)resetHero();
 },{threshold:[0,.1]});
 heroVisibility.observe(hero);
 start.addEventListener('click',async()=>{
  if(starting||hero.classList.contains('is-playing'))return;
  starting=true;
  const attempt=++playAttempt;
  start.disabled=true;
  status.textContent='';
  hero.classList.add('is-bursting');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{
   video.currentTime=0;
   // 사용자 클릭 안에서 play를 요청해 자동 재생 제한을 피합니다.
   const playResult=video.play();
   await Promise.all([Promise.resolve(playResult),new Promise(resolve=>setTimeout(resolve,reduced?0:580))]);
   if(attempt!==playAttempt)return;
   hero.classList.add('is-playing');
   video.setAttribute('aria-hidden','false');
   start.hidden=true;
   burstCleanupTimer=setTimeout(()=>{if(attempt===playAttempt)hero.classList.remove('is-bursting')},500);
  }catch{
   if(attempt!==playAttempt)return;
   video.pause();
   hero.classList.remove('is-bursting');
   hero.classList.remove('is-playing');
   start.disabled=false;
   starting=false;
   status.textContent='영상을 불러오지 못했어요. 로고를 눌러 다시 시도해 주세요.';
  }
 });
})();

function setSelection(text){const label=document.querySelector('#selection');if(label)label.textContent=text}
const asset = name => window.PartyPopPalette.has(name)?window.PartyPopPalette.get(name):`assets/images/main/${name}`;
const characters = [
 ['POPPY','poppy.png','에너지가 넘치는<br>파티의 분위기 메이커!'],
 ['LUNA','luna.png','승부를 좋아하는<br>열정적인 챌린저!'],
 ['MINT','mint.png','밝고 신나는<br>우리 팀의 활력소!'],
 ['ZEZE','zeze.png','감각적인 센스와<br>유니크한 멋쟁이!']
];
document.querySelector('.character-grid').innerHTML = characters.map(([name,img,copy])=>`<article class="glass character-card reveal"><img src="${asset(img)}" alt="${name}" loading="lazy"><h3>${name}</h3><p>${copy}</p></article>`).join('');
// 캐릭터 카드 전체에서 움직임을 유지하고, 이탈 시 부드럽게 복귀합니다.
document.querySelectorAll('.character-card').forEach(card=>{
 const img=card.querySelector('img');
 let motion=null;
 card.addEventListener('pointerenter',event=>{
  if(event.pointerType==='touch'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const current=getComputedStyle(img).transform;
  motion?.cancel();
  motion=img.animate([
   {transform:current==='none'?'translateX(0) rotate(0deg)':current,offset:0},
   {transform:'translateX(-3px) rotate(-1.5deg)',offset:.25},
   {transform:'translateX(3px) rotate(1.5deg)',offset:.75},
   {transform:'translateX(0) rotate(0deg)',offset:1}
  ],{duration:3000,iterations:Infinity,easing:'cubic-bezier(.45,0,.55,1)'});
 });
 card.addEventListener('pointerleave',()=>{
  if(!motion)return;
  const current=getComputedStyle(img).transform;
  motion.cancel();
  motion=img.animate([{transform:current},{transform:'translateX(0) rotate(0deg)'}],{duration:500,easing:'cubic-bezier(.22,.61,.36,1)'});
 });
});
const rewards=[['coin.png','게임 코인','게임 플레이 보상'],['Gift box.png','스킨 패키지','한정 의상, 액세서리!'],['crown.png','시즌 패스','시즌 한정 스킨!'],['reward_badge.png','한정 보상','특별한 업적 뱃지']];
const rewardImageClasses=['reward-coin','reward-gift','reward-crown','reward-badge'];
document.querySelector('.reward-grid').innerHTML=rewards.map(([img,title,copy],i)=>`<article class="glass reward-card reveal"><img class="${rewardImageClasses[i]}" src="${asset(img)}" alt="" loading="lazy"><h3>${title}</h3><p>${copy}</p></article>`).join('');
const modes=[['team.png','팀 대전','친구들과 한 팀이 되어 함께 승리에 도전해 보세요!'],['item.png','아이템 팡팡','어떤 아이템이 나올까요? 뜻밖의 재미가 기다리고 있어요!'],['color_paint.png','컬러 페인트','알록달록 나만의 컬러로 파티 월드를 물들여 보세요!']];
// 파티 모드 개체는 index.html에서 각각 편집합니다.
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false')});button.classList.add('selected');button.setAttribute('aria-pressed','true');const detail=document.querySelector('#mode-detail');if(detail)detail.textContent=modes[button.dataset.mode][2]}));
// CUSTOMIZE: 부위 선택과 컬러 선택은 각각 독립적으로 유지합니다.
const characterSets=[
 {face:'face.png',hair:'hair.png',upper:'upper.png',lower:'lower.png',hue:270},
 {face:'face_2.png',hair:'hair_2.png',upper:'upper_2.png',lower:'lower_2.png',hue:170},
 {face:'face_3.png',hair:'hair_3.png',upper:'upper_3.png',lower:'lowe_3.png',hue:350},
 {face:'face_4.png',hair:'hair_4.png',upper:'upper_4.png',lower:'lower_4.png',hue:25}
];
const categories=[['헤어','h_icon.svg',['hair.png','hair_2.png','hair_3.png','hair_4.png']],['상의','c_icon.svg',['upper.png','upper_2.png','upper_3.png','upper_4.png']],['하의','p_icon.svg',['lower.png','lower_2.png','lowe_3.png','lower_4.png']],['액세서리','a_icon.svg',['hairpin_1.png','hairpin_2.png','glasses_1.png','glasses_2.png']]];
const customTabNames=['hair','upper','lower','accessory'];
const colors=[['pink.png','핑크',330],['yellow.png','노랑',48],['green.png','초록',105],['blue.png','파랑',195]];
let category=0,activeCharacter=0;
const partColors=[null,null,null,null];
let equippedPin=null,equippedGlasses=null;
const accessoryPin=document.createElement('img');accessoryPin.className='avatar-layer avatar-accessory-pin';accessoryPin.alt='';accessoryPin.style.display='none';
const accessoryGlasses=document.createElement('img');accessoryGlasses.className='avatar-layer avatar-accessory-glasses';accessoryGlasses.alt='';accessoryGlasses.style.display='none';
document.querySelector('#avatar').appendChild(accessoryGlasses);document.querySelector('#avatar').appendChild(accessoryPin);
const paletteKeys=['pink','yellow','green','blue'];
function outfitSource(part,index){return window.PartyPopPalette.get(categories[part][2][index],partColors[part]);}
function syncColorButtons(){swatches.querySelectorAll('[data-color]').forEach(button=>{button.disabled=category===3&&equippedPin===null&&equippedGlasses===null;button.setAttribute('aria-pressed',String(partColors[category]===Number(button.dataset.color)));button.setAttribute('aria-label',colors[Number(button.dataset.color)][1]+' '+categories[category][0]+' 색상 선택')})}
const selections=[0,0,0,0];
const hairLayer=document.querySelector('.avatar-hair');
const waistRows=[308,335,341,328];
const beltRows=[69,34,37,40];
const feetRows=[405,439,444,432];
function fitOutfit(){
 const avatar=document.querySelector('#avatar');
 // 의상 자체는 모두 원본 237×237px로 유지합니다.
 const upperTop=126;
 const waist=upperTop+waistRows[selections[1]]*.5;
 const lowerTop=waist-beltRows[selections[2]]*.5-1;
 const foot=lowerTop+feetRows[selections[2]]*.5;
 avatar.style.setProperty('--outfit-upper-size','237px');
 avatar.style.setProperty('--outfit-upper-top',upperTop+'px');
 avatar.style.setProperty('--outfit-lower-size','237px');
 avatar.style.setProperty('--outfit-lower-top',lowerTop+'px');
 avatar.style.setProperty('--outfit-position-y',(445-foot)+'px');
 const faceTops=[-15,-15,-15,-24];
 const hairTops=[-18,-12,0,-13];
 avatar.style.setProperty('--outfit-hair-top',(hairTops[selections[0]]-15-faceTops[selections[0]])+'px');
}
// 헤어 파일이 없으면 사용 가능한 기본 헤어로 복귀합니다.
hairLayer.addEventListener('error',()=>{if(selections[0]===0)return;selections[0]=0;hairLayer.dataset.style='0';hairLayer.src=asset('hair.png');applyHairColor();if(category===0)renderOptions()});
const tabs=document.querySelector('.tabs');
const swatches=document.querySelector('.swatches');
function applyHairColor(){hairLayer.style.filter=''}
let outfitPaintVersion=0;
const outfitReady=new Map();
function readyOutfitImage(src){
 if(!outfitReady.has(src))outfitReady.set(src,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.decode?image.decode().then(resolve,resolve):resolve();image.onerror=reject;image.src=src}));
 return outfitReady.get(src);
}
async function renderCharacter(){
 const version=++outfitPaintVersion;
 const sources=[asset(characterSets[activeCharacter].face),...[0,1,2].map(i=>outfitSource(i,selections[i]))];
 if(equippedPin!==null)sources.push(outfitSource(3,equippedPin));
 if(equippedGlasses!==null)sources.push(outfitSource(3,equippedGlasses));
 try{await Promise.all(sources.map(readyOutfitImage))}catch{return}
 if(version!==outfitPaintVersion)return;
 const set=characterSets[activeCharacter];
 document.querySelector('.avatar-face').src=asset(set.face);
 for(let i=0;i<3;i++)document.querySelector('.avatar-'+customTabNames[i]).src=outfitSource(i,selections[i]);
 document.querySelector('.avatar-upper').dataset.style=String(selections[1]);
 document.querySelector('.avatar-lower').dataset.style=String(selections[2]);
 hairLayer.dataset.style=String(selections[0]);
 document.querySelector('#avatar').dataset.character=String(activeCharacter+1);
 accessoryPin.style.display=equippedPin===null?'none':'block';
 accessoryGlasses.style.display=equippedGlasses===null?'none':'block';
 if(equippedPin!==null){accessoryPin.src=outfitSource(3,equippedPin);accessoryPin.dataset.kind=equippedPin===0?'star':'butterfly';}
 if(equippedGlasses!==null)accessoryGlasses.src=outfitSource(3,equippedGlasses);
 fitOutfit();
 applyHairColor();
}
function changeCharacter(index){activeCharacter=index;selections.fill(index);partColors.fill(null);equippedPin=null;equippedGlasses=null;swatches.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));renderCharacter();renderOptions();syncColorButtons()}
for(const [selector,step] of [['.previous',-1],['.next',1]]){const b=document.querySelector('.avatar-stage '+selector);b.disabled=false;b.removeAttribute('title');b.onclick=()=>changeCharacter((activeCharacter+step+characterSets.length)%characterSets.length)}
tabs.innerHTML='<button type="button" class="custom-reset">RESET</button>'+categories.map(([label,icon],i)=>'<button type="button" class="custom-tab custom-tab-'+customTabNames[i]+'" role="tab" aria-selected="'+(i===0)+'" data-tab="'+i+'" aria-label="'+label+'"><img src="'+asset(icon)+'" alt=""></button>').join('');
function renderOptions(){
 const options=document.querySelector('#options');
 options.dataset.category=String(category);
 options.innerHTML=Array.from({length:4},(_,i)=>{const img=categories[category][2][i];return img?'<button type="button" class="custom-option-'+(i+1)+'" data-option="'+i+'" aria-pressed="'+(category===3?(i===equippedPin||i===equippedGlasses):selections[category]===i)+'" aria-label="'+categories[category][0]+' 스타일 '+(i+1)+'"><img src="'+asset(img)+'" alt=""></button>':'<div class="option-empty custom-option-'+(i+1)+'" aria-hidden="true"></div>'}).join('');
 options.querySelectorAll('[data-option]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.option);if(category===3){if(index<2)equippedPin=equippedPin===index?null:index;else equippedGlasses=equippedGlasses===index?null:index;}else selections[category]=index;renderCharacter();renderOptions();syncColorButtons();setSelection(categories[category][0]+' 스타일 선택')});
}
tabs.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{category=Number(button.dataset.tab);tabs.querySelectorAll('[data-tab]').forEach(tab=>tab.setAttribute('aria-selected',String(tab===button)));renderOptions();syncColorButtons()});
swatches.innerHTML=colors.map(([img,name],i)=>'<button type="button" class="custom-color-'+['pink','yellow','green','blue'][i]+'" data-color="'+i+'" aria-pressed="false" aria-label="'+name+' 머리색 선택"><img src="'+asset(img)+'" alt=""></button>').join('');
swatches.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{if(category===3&&equippedPin===null&&equippedGlasses===null)return;partColors[category]=Number(button.dataset.color);renderCharacter();syncColorButtons();setSelection(categories[category][0]+' '+colors[partColors[category]][1]+' 선택')});
document.querySelector('.custom-reset').onclick=()=>{category=0;tabs.querySelectorAll('[data-tab]').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.tab==='0')));changeCharacter(activeCharacter);setSelection('현재 캐릭터 기본 상태로 초기화했습니다')};
renderCharacter();renderOptions();syncColorButtons();
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
menu.onclick=()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));if(open&&window.matchMedia('(max-width: 1400px)').matches){nav.classList.remove('sections-collapsed');nav.querySelector('.home-link')?.setAttribute('aria-expanded','true')}};
nav.querySelectorAll('a').forEach(a=>a.onclick=()=>{
 if(a.classList.contains('home-link')){
  const collapsed=nav.classList.toggle('sections-collapsed');
  a.setAttribute('aria-expanded',String(!collapsed));
  return;
 }
 nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const sections=[...document.querySelectorAll('main>section')];
const activeObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',e.target.id!=='registration' && a.hash===`#${e.target.id}`))}})},{rootMargin:'-35% 0px -45% 0px'});sections.forEach(s=>activeObserver.observe(s));
// 분리된 캐릭터즈 장식 레이어를 배경의 실제 크기·위치와 맞춥니다.
(() => {
 const section=document.querySelector('#characters');
 const sheet=section?.querySelector('.character-decoration-sheet');
 if(!section||!sheet)return;
 function fitDecoration(){
  const width=section.clientWidth,height=section.clientHeight;
  if(window.matchMedia('(min-width: 1401px)').matches){Object.assign(sheet.style,{width:'100%',height:'100%',left:'0px',top:'0px'});return;}
  const scale=Math.max(width/1914,height/900);
  Object.assign(sheet.style,{width:(1914*scale)+'px',height:(900*scale)+'px',left:((width-1914*scale)/2)+'px',top:((height-900*scale)/2)+'px'});
 }
 fitDecoration();
 new ResizeObserver(fitDecoration).observe(section);
 new IntersectionObserver(entries=>{for(const entry of entries)sheet.classList.toggle('is-active',entry.isIntersecting)},{threshold:0}).observe(section);
})();

// PC 풀페이지 이동. 모바일·낮은 화면은 원래 일반 스크롤을 유지합니다.
(() => {
 const pages=[...document.querySelectorAll('main > section.scene')];
 if(!pages.length)return;
 const desktop=window.matchMedia('(min-width: 1401px) and (min-height: 560px)');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let enabled=false,index=0,lockedUntil=0,lastWheel=0,consumed=false,wheelSum=0,scrollTimer;
 function nearest(){let best=0,distance=Infinity;pages.forEach((page,i)=>{const d=Math.abs(page.getBoundingClientRect().top);if(d<distance){distance=d;best=i}});return best}
 function go(next,animate=true){
  if(!enabled)return;
  index=Math.max(0,Math.min(pages.length-1,next));
  lockedUntil=performance.now()+(animate&&!reduced.matches?850:120);
  window.scrollTo({top:pages[index].offsetTop,behavior:animate&&!reduced.matches?'smooth':'instant'});

 }
 function editable(target){return Boolean(target?.closest('input,textarea,select,button,[contenteditable="true"],dialog[open]'))||Boolean(document.querySelector('dialog[open]'))}
 function configure(){
  const keep=nearest();enabled=desktop.matches;
  document.documentElement.classList.toggle('fullpage-enabled',enabled);
  document.documentElement.style.setProperty('--fullpage-fit',String(Math.min(1,window.innerHeight/900)));
  wheelSum=0;consumed=false;lastWheel=0;
  if(enabled)requestAnimationFrame(()=>go(keep,false));
 }
 window.addEventListener('wheel',event=>{
  if(!enabled||event.ctrlKey||event.defaultPrevented||Math.abs(event.deltaX)>Math.abs(event.deltaY)||document.querySelector('dialog[open]'))return;
  const nested=event.target.closest('[data-fullpage-scroll],textarea,select');
  if(nested&&nested.scrollHeight>nested.clientHeight){const forward=event.deltaY>0;if((forward&&nested.scrollTop+nested.clientHeight<nested.scrollHeight-1)||(!forward&&nested.scrollTop>0))return}
  event.preventDefault();
  const now=performance.now();
  if(now-lastWheel>180){consumed=false;wheelSum=0}
  lastWheel=now;
  if(consumed||now<lockedUntil)return;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
  if(wheelSum&&Math.sign(wheelSum)!==Math.sign(delta))wheelSum=0;
  wheelSum+=delta;
  if(Math.abs(wheelSum)<35)return;
  consumed=true;
  go(nearest()+(wheelSum>0?1:-1));
  wheelSum=0;
 },{passive:false});
 document.addEventListener('keydown',event=>{
  if(!enabled||event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||editable(event.target))return;
  const keys={ArrowDown:1,PageDown:1,' ':event.shiftKey?-1:1,ArrowUp:-1,PageUp:-1};
  if(!(event.key in keys)&&event.key!=='Home'&&event.key!=='End')return;
  event.preventDefault();
  if(performance.now()<lockedUntil)return;
  go(event.key==='Home'?0:event.key==='End'?pages.length-1:nearest()+keys[event.key]);
 });
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href^="#"]');if(!link)return;
  const next=pages.findIndex(page=>'#'+page.id===link.getAttribute('href'));if(next<0)return;
  event.preventDefault();
  if(enabled)go(next);else pages[next].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 });
 window.addEventListener('scroll',()=>{if(!enabled)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{index=nearest()},160)},{passive:true});
 let resizeTimer;
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(configure,150)});
 desktop.addEventListener('change',configure);
 configure();
})();

// 푸터 장식은 배경과 같은 비율로 맞추고 화면에 보일 때 반짝입니다.
(() => {
 const section=document.querySelector('#registration');
 const sheet=section?.querySelector('.footer-decoration-sheet');
 if(!section||!sheet)return;
 function fitDecoration(){
  const width=section.clientWidth,height=section.clientHeight;
  if(window.matchMedia('(min-width: 1401px)').matches){Object.assign(sheet.style,{width:'100%',height:'100%',left:'0px',top:'0px'});return;}
  const scale=Math.max(width/2048,height/1012);
  Object.assign(sheet.style,{width:(2048*scale)+'px',height:(1012*scale)+'px',left:((width-2048*scale)/2)+'px',top:((height-1012*scale)/2)+'px'});
 }
 fitDecoration();
 new ResizeObserver(fitDecoration).observe(section);
 new IntersectionObserver(entries=>{for(const entry of entries)sheet.classList.toggle('is-active',entry.isIntersecting)},{threshold:0}).observe(section);
})();

const dialog=document.querySelector('#register-dialog');
if(dialog && document.querySelector('.close') && document.querySelector('#register-form')){
document.querySelector('#register-open').onclick=()=>dialog.showModal();
document.querySelector('.close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelector('#register-form').onsubmit=e=>{e.preventDefault();document.querySelector('#form-result').textContent='데모 참여가 완료됐어요! 실제 사전 등록은 접수되지 않습니다.';document.querySelector('#email').value='';document.querySelector('.consent input').checked=false};





}

// 별 커서와 짧게 사라지는 빛 꼬리. 터치 기기에는 적용하지 않습니다.
(() => {
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const image=new Image();
 image.src='assets/images/main/mouse_curser.png';
 let canvas,ctx,frame=0,ready=false,visible=false,x=0,y=0,lastX=0,lastY=0,lastTime=0,lastEmit=0;
 const particles=[];
 function resize(){
  if(!canvas)return;
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);wake();
 }
 function wake(){if(!frame&&ctx)frame=requestAnimationFrame(draw);}
 function draw(time){
  frame=0;
  const dt=Math.min((time-lastTime)/1000||0,.04);lastTime=time;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];p.life-=dt;
   if(p.life<=0){particles.splice(i,1);continue;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=dt;
   const alpha=p.life/p.total;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
   ctx.globalAlpha=alpha*.85;ctx.shadowColor='#fff0a0';ctx.shadowBlur=10;
   ctx.fillStyle=p.color;ctx.beginPath();
   for(let n=0;n<8;n++){const a=n*Math.PI/4;const r=(n%2?.25:1)*p.size*(.5+alpha*.5);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
   ctx.closePath();ctx.fill();ctx.restore();
  }
  if(visible&&ready){
   // 정지 중에도 별 주위 노란 후광이 부드럽게 반짝입니다.
   const pulse=reduced.matches?.5:(Math.sin(time/280)+1)/2;
   const radius=25+pulse*9;
   ctx.save();
   const halo=ctx.createRadialGradient(x,y,5,x,y,radius);
   halo.addColorStop(0,'rgba(255,249,201,'+(.35+pulse*.2)+')');
   halo.addColorStop(.45,'rgba(255,224,100,'+(.18+pulse*.16)+')');
   halo.addColorStop(1,'rgba(255,221,95,0)');
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
   ctx.shadowColor='#fff0a0';ctx.shadowBlur=12+pulse*15;
   ctx.drawImage(image,x-17,y-17,34,34);ctx.restore();
  }
  if(particles.length||(visible&&ready&&!reduced.matches))wake();
 }
 function hide(){visible=false;particles.length=0;document.documentElement.classList.remove('star-cursor-active');wake();}
 function move(event){
  if(!fine.matches||!ready||event.pointerType==='touch')return;
  x=event.clientX;y=event.clientY;
  const first=!visible;visible=true;document.documentElement.classList.add('star-cursor-active');
  const now=performance.now(),distance=Math.hypot(x-lastX,y-lastY);
  if(!first&&!reduced.matches&&distance>3&&now-lastEmit>18){
   particles.push({x:x+(Math.random()-.5)*12,y:y+(Math.random()-.5)*12,vx:(Math.random()-.5)*16,vy:10+Math.random()*14,life:.55,total:.55,size:3+Math.random()*4,angle:Math.random()*Math.PI,color:Math.random()>.5?'#fff8cf':'#ffe775'});
   if(particles.length>32)particles.shift();lastEmit=now;
  }
  lastX=x;lastY=y;wake();
 }
 image.onload=()=>{
  if(ready)return;ready=true;canvas=document.createElement('canvas');canvas.className='star-cursor-canvas';canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);ctx=canvas.getContext('2d');
  if(!ctx){canvas.remove();ready=false;return;}resize();
 };
 // 캐시된 이미지도 처리합니다.
 if(image.complete&&image.naturalWidth)image.onload();
 window.addEventListener('resize',resize);
 window.addEventListener('pointermove',move,{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);
 window.addEventListener('blur',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
 fine.addEventListener('change',hide);
 reduced.addEventListener('change',()=>{particles.length=0;wake();});
})();

// 실제 스크롤 위치에 따라 오른쪽의 현재 섹션 아이콘을 전환합니다.
(() => {
 const navigation=document.querySelector('.page-indicators');
 if(!navigation)return;
 const links=[...navigation.querySelectorAll('.page-indicator')];
 const pages=links.map(link=>document.querySelector(link.getAttribute('href')));
 let pending=false;
 function update(){
  pending=false;let current=0,distance=Infinity;
  pages.forEach((page,i)=>{if(!page)return;const d=Math.abs(page.getBoundingClientRect().top);if(d<distance){distance=d;current=i;}});
  links.forEach((link,i)=>{const active=i===current;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 window.addEventListener('pageshow',schedule);
 update();
})();

// 기존 주소의 섹션 해시는 제거하고 파일 경로와 쿼리만 유지합니다.
if(window.location.hash){history.replaceState(history.state,'',window.location.href.split('#')[0]);}

}).catch(error=>console.error("Party Pop 초기화 실패:",error));
