/* Phở Ao Sen — site behaviour. Shared by index.html and menu.html */
(function(){
"use strict";
const $  = (s,c)=>(c||document).querySelector(s);
const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));

$$(".yr").forEach(e=> e.textContent = new Date().getFullYear());

const nav = $("#nav"), topBtn = $("#top"), mobar = $("#mobar");
function onScroll(){
  const y = scrollY;
  if(nav) nav.classList.toggle("stuck", y>40);
  if(topBtn) topBtn.classList.toggle("on", y>800);
  if(mobar) mobar.classList.toggle("on", y>500);
}
addEventListener("scroll", onScroll, {passive:true});
onScroll();
if(topBtn) topBtn.addEventListener("click", ()=> scrollTo({top:0, behavior:"smooth"}));

const burger = $("#burger"), drawer = $("#drawer"), drawerClose = $("#drawerClose");
let drawerScrollY = 0;

function mountDrawer(){
  if(!drawer) return;
  if(drawer.parentNode !== document.documentElement){
    document.documentElement.appendChild(drawer);
  }
}
function lockPage(){
  drawerScrollY = window.scrollY || 0;
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
  if(on){ lockPage(); drawer.scrollTop = 0; drawer.classList.add("on"); }
  else { drawer.classList.remove("on"); unlockPage(); }
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
    if(href.charAt(0) !== "#" || href.length < 2){ toggleDrawer(false); return; }
    e.preventDefault();
    const t = document.querySelector(href);
    toggleDrawer(false);
    if(!t) return;
    requestAnimationFrame(()=>{
      const off = (nav ? nav.offsetHeight : 0) + 12;
      window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - off, behavior:"smooth"});
    });
  });
});
addEventListener("keydown", e=>{ if(e.key==="Escape") toggleDrawer(false); });

/* Sun–Thu 11:30–8:30, Fri–Sat 11:00–9:00, Wed closed */
const HOURS = {0:[690,1230],1:[690,1230],2:[690,1230],3:null,4:[690,1230],5:[660,1260],6:[660,1260]};
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

(function spy(){
  const links=$$(".catnav a"); if(!links.length) return;
  const secs = links.map(a=> document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spyIO = new IntersectionObserver(ents=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=> l.classList.toggle("on", l.getAttribute("href")==="#"+e.target.id));
      }
    });
  },{rootMargin:"-160px 0px -65% 0px"});
  secs.forEach(s=> spyIO.observe(s));
})();

$$('a[href^="#"]').forEach(a=>{
  if(a.closest("#drawer")) return;
  a.addEventListener("click", e=>{
    const id=a.getAttribute("href"); if(id.length<2) return;
    const t=document.querySelector(id); if(!t) return;
    e.preventDefault();
    const cat=$(".catnav");
    const off=(nav?nav.offsetHeight:0)+(cat?cat.offsetHeight:0)+12;
    scrollTo({top:t.getBoundingClientRect().top+scrollY-off, behavior:"smooth"});
  });
});
})();
