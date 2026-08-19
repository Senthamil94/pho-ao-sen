/* Phở Ao Sen — site behaviour. Shared by index.html and menu.html */
(function(){
"use strict";
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s,c)=>(c||document).querySelector(s);
const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));
const ORDER = "https://order.boons.io/site/pho-ao-sen/218/y";

/* ---------- preloader ---------- */
const pre = $("#preload");
if(pre){
  window.addEventListener("load", ()=> setTimeout(()=> pre.classList.add("done"), RM?150:1200));
  setTimeout(()=> pre.classList.add("done"), 4000);
}

/* ---------- year ---------- */
$$(".yr").forEach(e=> e.textContent = new Date().getFullYear());

/* ---------- sticky nav, progress, floating bits ---------- */
const nav = $("#nav"), prog = $("#progress"), topBtn = $("#top"), mobar = $("#mobar");
function onScroll(){
  const y = scrollY;
  if(nav) nav.classList.toggle("stuck", y>40);
  if(prog){
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h>0 ? (y/h)*100 : 0) + "%";
  }
  if(topBtn) topBtn.classList.toggle("on", y>800);
  if(mobar) mobar.classList.toggle("on", y>500);
}
addEventListener("scroll", onScroll, {passive:true});
onScroll();
if(topBtn) topBtn.addEventListener("click", ()=> scrollTo({top:0, behavior: RM?"auto":"smooth"}));

/* ---------- drawer ---------- */
const burger = $("#burger"), drawer = $("#drawer"), drawerClose = $("#drawerClose");
let drawerScrollY = 0;

function mountDrawer(){
  if(!drawer) return;
  /* Must live on <html>, not <body>. Body gets position:fixed / CSS filter,
     which turns position:fixed children into page-relative layers — blank after scroll. */
  if(drawer.parentNode !== document.documentElement){
    document.documentElement.appendChild(drawer);
  }
}

function lockPage(){
  drawerScrollY = window.scrollY || window.pageYOffset || 0;
  document.documentElement.classList.add("nav-open");
  document.body.style.position = "fixed";
  document.body.style.top = "-" + drawerScrollY + "px";
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockPage(){
  document.documentElement.classList.remove("nav-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, drawerScrollY);
}

function toggleDrawer(force){
  if(!drawer || !burger) return;
  const on = force!==undefined ? force : !drawer.classList.contains("on");
  mountDrawer();
  if(on){
    lockPage();
    drawer.scrollTop = 0;
    drawer.classList.add("on");
  } else {
    drawer.classList.remove("on");
    unlockPage();
  }
  burger.classList.toggle("on", on);
  burger.setAttribute("aria-expanded", String(on));
  burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
}

mountDrawer();
if(burger) burger.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); toggleDrawer(); });
if(drawerClose) drawerClose.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); toggleDrawer(false); });
$$("#drawer nav a").forEach(a=>{
  a.addEventListener("click", e=>{
    const href = a.getAttribute("href") || "";
    if(href.charAt(0) !== "#" || href.length < 2){
      toggleDrawer(false);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const t = document.querySelector(href);
    toggleDrawer(false);
    if(!t) return;
    requestAnimationFrame(()=>{
      const off = (nav ? nav.offsetHeight : 0) + 12;
      window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - off, behavior: RM ? "auto" : "smooth"});
    });
  });
});
addEventListener("keydown", e=>{ if(e.key==="Escape") toggleDrawer(false); });

/* ---------- reveal ---------- */
const io = new IntersectionObserver(ents=>{
  ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
},{threshold:.12, rootMargin:"0px 0px -7% 0px"});
$$(".rv,.mask").forEach(el=> io.observe(el));

/* ---------- cursor + magnetic ---------- */
if(matchMedia("(hover:hover) and (pointer:fine)").matches && !RM){
  const cur = $("#cursor"), dot = $("#cursorDot");
  if(cur && dot){
    let cx=innerWidth/2, cy=innerHeight/2, tx=cx, ty=cy;
    addEventListener("mousemove", e=>{
      tx=e.clientX; ty=e.clientY;
      dot.style.transform = `translate(${tx-2.5}px,${ty-2.5}px)`;
    });
    (function loop(){
      cx+=(tx-cx)*.16; cy+=(ty-cy)*.16;
      cur.style.transform = `translate(${cx-15}px,${cy-15}px)`;
      requestAnimationFrame(loop);
    })();
    $$("a,button,.card,.gal figure,.node,.svc,.dish").forEach(el=>{
      el.addEventListener("mouseenter", ()=> cur.classList.add("grow"));
      el.addEventListener("mouseleave", ()=> cur.classList.remove("grow"));
    });
  }
  $$(".mag").forEach(el=>{
    el.addEventListener("mousemove", e=>{
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    el.addEventListener("mouseleave", ()=> el.style.transform = "");
  });
}

/* ---------- ambient petals ---------- */
(function petals(){
  const c = $("#petals"); if(!c || RM) return;
  const ctx = c.getContext("2d");
  let w,h,parts=[];
  const COLORS = ["rgba(124,145,55,","rgba(225,192,153,","rgba(107,77,52,"];
  function size(){ w=c.width=c.offsetWidth*devicePixelRatio; h=c.height=c.offsetHeight*devicePixelRatio; }
  function make(){
    parts=[];
    const n = Math.min(30, Math.round(c.offsetWidth/44));
    for(let i=0;i<n;i++) parts.push({
      x:Math.random()*w, y:Math.random()*h,
      r:(Math.random()*2.2+.5)*devicePixelRatio,
      vy:-(Math.random()*.22+.05)*devicePixelRatio,
      vx:(Math.random()-.5)*.14*devicePixelRatio,
      a:Math.random()*.22+.05,
      col:COLORS[Math.floor(Math.random()*COLORS.length)],
      ph:Math.random()*Math.PI*2
    });
  }
  function draw(t){
    ctx.clearRect(0,0,w,h);
    parts.forEach(p=>{
      p.y+=p.vy; p.x+=p.vx+Math.sin(t/2800+p.ph)*.2*devicePixelRatio;
      if(p.y<-10){ p.y=h+10; p.x=Math.random()*w; }
      if(p.x<-10) p.x=w+10; if(p.x>w+10) p.x=-10;
      ctx.beginPath(); ctx.fillStyle=p.col+p.a+")"; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  size(); make(); requestAnimationFrame(draw);
  addEventListener("resize", ()=>{ size(); make(); });
})();

/* ---------- live open / closed ---------- */
const HOURS = {0:[660,1230],1:[690,1230],2:[690,1230],3:null,4:[690,1230],5:[690,1230],6:[660,1260]};
const DAYNAME = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function laNow(){
  const p = new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
  const g = k => p.find(x=>x.type===k).value;
  const map = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  let hh = parseInt(g("hour"),10); if(hh===24) hh=0;
  return {d:map[g("weekday")], m:hh*60+parseInt(g("minute"),10)};
}
function fmt(mins){
  let h=Math.floor(mins/60), m=mins%60, ap=h>=12?"pm":"am", hd=h%12||12;
  return hd + (m ? ":"+String(m).padStart(2,"0") : "") + " " + ap;
}
function nextOpen(d){
  for(let i=1;i<=7;i++){ const nd=(d+i)%7; if(HOURS[nd]) return {day:DAYNAME[nd], t:fmt(HOURS[nd][0])}; }
  return null;
}
function updateStatus(){
  const {d,m} = laNow(), today = HOURS[d];
  let open=false, text="";
  if(today && m>=today[0] && m<today[1]){
    open = true;
    text = (today[1]-m<=45) ? "Open · closing at "+fmt(today[1]) : "Open now until "+fmt(today[1]);
  } else if(today && m<today[0]){
    text = "Opens today at "+fmt(today[0]);
  } else {
    const n = nextOpen(d);
    text = n ? "Closed · opens "+n.day+" "+n.t : "Closed";
  }
  $$(".status").forEach(el=>{
    el.classList.toggle("open", open);
    el.classList.toggle("closed", !open);
    const s = el.querySelector("span"); if(s) s.textContent = text;
  });
  $$("#hoursList li").forEach(li=> li.classList.toggle("today", +li.dataset.d === d));
}
updateStatus(); setInterval(updateStatus, 60000);

/* ---------- serving-since counter ---------- */
(function counter(){
  const Y=$("#cY"); if(!Y) return;
  const START = new Date("2001-01-01T00:00:00-08:00");
  const D=$("#cD"), H=$("#cH"), M=$("#cM"), S=$("#cS");
  function tick(){
    const now = new Date();
    let y = now.getFullYear()-START.getFullYear();
    const anniv = new Date(START); anniv.setFullYear(START.getFullYear()+y);
    if(anniv>now){ y--; anniv.setFullYear(anniv.getFullYear()-1); }
    let diff = now-anniv;
    const d=Math.floor(diff/864e5); diff-=d*864e5;
    const h=Math.floor(diff/36e5);  diff-=h*36e5;
    const m=Math.floor(diff/6e4);   diff-=m*6e4;
    Y.textContent=y; D.textContent=d;
    H.textContent=String(h).padStart(2,"0");
    M.textContent=String(m).padStart(2,"0");
    S.textContent=String(Math.floor(diff/1000)).padStart(2,"0");
  }
  tick(); setInterval(tick,1000);
})();

/* ---------- inside the bowl ---------- */
const BOWL = [
  {vn:"Nước dùng", en:"The broth", img:"https://phoaosen.us/wp-content/uploads/2025/09/image-16.png",
   txt:"Beef bones and marrow, charred ginger and onion, star anise, cassia and clove. It goes on the stove a full day before it's served — never rushed, never boiled hard, never reused."},
  {vn:"Bánh phở", en:"The noodles", img:"https://phoaosen.us/wp-content/uploads/2025/09/SNY02587-1010x660.jpeg",
   txt:"Flat rice noodles blanched to order in seconds, so they arrive soft but still with a little bite. Any longer in the water and the bowl is already lost."},
  {vn:"Thịt bò", en:"The beef", img:"https://phoaosen.us/wp-content/uploads/2025/09/SNY04976-2-modified.jpg",
   txt:"Rare eye round sliced thin enough to cook in the pour, plus well-done brisket, flank, soft tendon and tripe in the house combination."},
  {vn:"Rau thơm", en:"The herbs", img:"https://phoaosen.us/wp-content/uploads/2025/09/SNY01653-1010x660.jpg",
   txt:"Thai basil, culantro, bean sprouts, lime and jalapeño arrive on their own plate. Add them a handful at a time so the broth stays hot."},
  {vn:"Gia vị", en:"The spices", img:"https://phoaosen.us/wp-content/uploads/2025/09/SNY01631-scaled-1010x660.jpg",
   txt:"The whole spices are toasted before they ever meet water. That's where the sweetness in the broth comes from — not sugar."},
  {vn:"Nước chấm", en:"The sauces", img:"https://phoaosen.us/wp-content/uploads/2025/09/SNY04915-1-scaled.jpg",
   txt:"Hoisin and sriracha belong in the side dish for dipping meat, not stirred into the broth. Taste it clean first — we spent a day on it."}
];
(function bowlInit(){
  const nodes=$$(".node"), img=$("#bowlImg"), read=$("#bowlRead");
  if(!nodes.length || !img) return;
  function pick(i){
    nodes.forEach(n=> n.classList.toggle("on", +n.dataset.i===i));
    const b = BOWL[i];
    img.classList.add("off");
    const p = new Image();
    p.onload = ()=>{ img.src=b.img; img.classList.remove("off"); };
    p.onerror = ()=> img.classList.remove("off");
    p.src = b.img;
    read.innerHTML = `<div class="vnname">${b.vn}</div><h3>${b.en}</h3><p>${b.txt}</p>`;
    read.classList.remove("swap"); void read.offsetWidth; read.classList.add("swap");
  }
  nodes.forEach(n=>{
    n.addEventListener("click", ()=> pick(+n.dataset.i));
    n.addEventListener("mouseenter", ()=>{ if(matchMedia("(hover:hover)").matches) pick(+n.dataset.i); });
  });
})();

/* ---------- dish spotlight ---------- */
$$(".dish").forEach(d=> d.addEventListener("mousemove", e=>{
  const r = d.getBoundingClientRect();
  d.style.setProperty("--mx",(e.clientX-r.left)+"px");
  d.style.setProperty("--my",(e.clientY-r.top)+"px");
}));

/* ---------- specials rail drag ---------- */
(function railDrag(){
  const r=$("#rail"); if(!r) return;
  let down=false, sx=0, sl=0, moved=0;
  r.addEventListener("pointerdown", e=>{ if(e.pointerType==="touch") return; down=true; moved=0; sx=e.clientX; sl=r.scrollLeft; r.classList.add("drag"); });
  addEventListener("pointerup", ()=>{ down=false; r.classList.remove("drag"); });
  addEventListener("pointermove", e=>{ if(!down) return; const dx=e.clientX-sx; moved=Math.abs(dx); r.scrollLeft=sl-dx; });
  r.addEventListener("click", e=>{ if(moved>6) e.preventDefault(); }, true);
})();

/* ---------- lightbox ---------- */
(function lightbox(){
  const figs=$$("#gal figure img"), box=$("#lbox");
  if(!figs.length || !box) return;
  const im=$("#lbImg"), cnt=$("#lbCount");
  let i=0;
  function open(n){
    i=(n+figs.length)%figs.length;
    im.src=figs[i].src; im.alt=figs[i].alt;
    cnt.textContent=(i+1)+" / "+figs.length;
    box.classList.add("on"); document.body.classList.add("is-locked");
  }
  function close(){ box.classList.remove("on"); document.body.classList.remove("is-locked"); }
  figs.forEach((f,n)=> f.parentElement.addEventListener("click", ()=> open(n)));
  $(".lb-x").addEventListener("click", close);
  $(".lb-next").addEventListener("click", e=>{ e.stopPropagation(); open(i+1); });
  $(".lb-prev").addEventListener("click", e=>{ e.stopPropagation(); open(i-1); });
  box.addEventListener("click", e=>{ if(e.target===box) close(); });
  addEventListener("keydown", e=>{
    if(!box.classList.contains("on")) return;
    if(e.key==="Escape") close();
    if(e.key==="ArrowRight") open(i+1);
    if(e.key==="ArrowLeft") open(i-1);
  });
})();

/* ---------- marquee loop ---------- */
(function mq(){ const t=$("#mqTrack"); if(t) t.innerHTML += t.innerHTML; })();

/* ---------- menu page: scrollspy on category nav ---------- */
(function spy(){
  const links=$$(".catnav a"); if(!links.length) return;
  const secs = links.map(a=> document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spyIO = new IntersectionObserver(ents=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=> l.classList.toggle("on", l.getAttribute("href")==="#"+e.target.id));
      }
    });
  },{rootMargin:"-140px 0px -70% 0px"});
  secs.forEach(s=> spyIO.observe(s));
})();

/* ---------- anchor offset for sticky header ---------- */
$$('a[href^="#"]').forEach(a=>{
  if(a.closest("#drawer")) return;
  a.addEventListener("click", e=>{
    const id=a.getAttribute("href"); if(id.length<2) return;
    const t=document.querySelector(id); if(!t) return;
    e.preventDefault();
    const cat=$(".catnav");
    const off=(nav?nav.offsetHeight:0)+(cat?cat.offsetHeight:0)+12;
    scrollTo({top:t.getBoundingClientRect().top+scrollY-off, behavior:RM?"auto":"smooth"});
  });
});
})();
