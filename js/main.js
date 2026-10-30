(()=>{
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// theme toggle
const root=document.documentElement;
try{const t=localStorage.getItem('theme'); if(t) root.dataset.theme=t;}catch(e){}
document.getElementById('theme').addEventListener('click',()=>{
  const dark = root.dataset.theme ? root.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try{localStorage.setItem('theme',root.dataset.theme)}catch(e){}
  drawAll();
});

// cursor glow
const glow=document.getElementById('glow');
if(!reduce) addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});

// magnetic buttons
if(!reduce) document.querySelectorAll('.magnetic').forEach(b=>{
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();
    b.style.setProperty('--x',(e.clientX-r.left-r.width/2)*.25+'px');b.style.setProperty('--y',(e.clientY-r.top-r.height/2)*.35+'px')});
  b.addEventListener('pointerleave',()=>{b.style.setProperty('--x','0px');b.style.setProperty('--y','0px')});
});

// header + nav pill
const header=document.getElementById('top'), pill=document.getElementById('pill'), navLinks=[...document.querySelectorAll('#links a')];
const movePill=a=>{ if(!a){pill.style.opacity=0;navLinks.forEach(l=>l.classList.remove('on'));return}
  navLinks.forEach(l=>l.classList.toggle('on',l===a)); pill.style.left=a.offsetLeft+'px'; pill.style.width=a.offsetWidth+'px'; pill.style.opacity=1;};
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href')));
const onScroll=()=>{ header.classList.toggle('scrolled',scrollY>10);
  let cur=null; sections.forEach((s,i)=>{ if(s.getBoundingClientRect().top < innerHeight*.4) cur=navLinks[i]; }); movePill(cur);};
addEventListener('scroll',onScroll,{passive:true}); onScroll();

// count-up
const counters=document.querySelectorAll('[data-count]');
const run=el=>{const end=+el.dataset.count, dec=+(el.dataset.dec||0), t0=performance.now(), d=1600;
  const tick=t=>{const p=Math.min(1,(t-t0)/d), v=end*(1-Math.pow(1-p,4)); el.textContent=v.toFixed(dec); if(p<1) requestAnimationFrame(tick)};
  requestAnimationFrame(tick)};
counters.forEach(el=> reduce ? el.textContent=(+el.dataset.count).toFixed(+(el.dataset.dec||0)) : setTimeout(()=>run(el),700));

// copy email
const toast=document.getElementById('toast');
const show=m=>{toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2000)};
document.getElementById('copy').addEventListener('click',()=>{
  const txt=document.getElementById('addr').textContent;
  try{ navigator.clipboard.writeText(txt).then(()=>show('Email copied'),()=>sel()); }catch(e){ sel(); }
  function sel(){const r=document.createRange();r.selectNodeContents(document.getElementById('addr'));const s=getSelection();s.removeAllRanges();s.addRange(r);show('Email selected, press Ctrl+C to copy')}
});

// generative project art
const canvases=[...document.querySelectorAll('canvas[data-art]')];
let tStart=performance.now();
function draw(c,t){
  const dpr=Math.min(2,devicePixelRatio||1), w=c.clientWidth, h=c.clientHeight;
  if(c.width!==w*dpr){c.width=w*dpr;c.height=h*dpr}
  const g=c.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0);
  const A=css('--accent'), T=css('--teal'), L=css('--line'), B=css('--bg');
  g.fillStyle=B; g.fillRect(0,0,w,h);
  const k=c.dataset.art;
  if(k==='flow'){
    for(let i=0;i<14;i++){ g.beginPath(); g.strokeStyle=i%4===0?A:(i%3===0?T:L); g.lineWidth=i%4===0?2:1;
      for(let x=0;x<=w;x+=6){const y=h*.5+Math.sin(x*.012+i*.45+t*.6)*(30+i*6)+Math.cos(x*.004+t*.3)*20; x?g.lineTo(x,y):g.moveTo(x,y)} g.stroke(); }
  } else if(k==='grid'){
    const s=26; for(let y=s/2;y<h;y+=s)for(let x=s/2;x<w;x+=s){
      const v=(Math.sin(x*.02+t)+Math.cos(y*.025-t*.8)+2)/4; g.fillStyle=v>.72?A:(v>.55?T:L);
      g.beginPath(); g.arc(x,y,1.5+v*5,0,7); g.fill(); }
  } else {
    const cx=w*.5, cy=h*.5; for(let i=1;i<16;i++){ g.beginPath(); g.strokeStyle=i%5===0?A:(i%3===0?T:L); g.lineWidth=i%5===0?2:1;
      const r=i*16, a=t*(i%2?.4:-.3); g.ellipse(cx,cy,r*1.4,r*.7,a,0,Math.PI*2); g.stroke(); }
  }
}
function drawAll(t=0){canvases.forEach(c=>draw(c,t))}
const visible=new Set();
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target)));
canvases.forEach(c=>io.observe(c));
drawAll(0);
if(!reduce){ const loop=now=>{const t=(now-tStart)/1000; visible.forEach(c=>draw(c,t)); requestAnimationFrame(loop)}; requestAnimationFrame(loop); }
addEventListener('resize',()=>drawAll((performance.now()-tStart)/1000));
})();
