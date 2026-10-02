const SUPABASE_URL='https://dzlmtvodpyhetvektfuo.supabase.co';
const SUPABASE_KEY='sb_publishable_ekvoOK6QQ05dUZuWgzQfUw_2RgbWPFR';
const slug='winter-wonderland';
const q=s=>document.querySelector(s);
const qa=s=>[...document.querySelectorAll(s)];

setTimeout(()=>document.body.classList.add('ready'),1100);

document.addEventListener('pointermove',e=>{
  document.documentElement.style.setProperty('--mx',e.clientX+'px');
  document.documentElement.style.setProperty('--my',e.clientY+'px');
},{passive:true});

addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  document.documentElement.style.setProperty('--progress',`${Math.max(0,scrollY/max*100)}%`);
  q('#nav').classList.toggle('scrolled',scrollY>35);
},{passive:true});

const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting)entry.target.classList.add('on');
}),{threshold:.12});
qa('.reveal').forEach(el=>io.observe(el));

const zones={
  festival:{number:'World 01',title:'The Frozen Festival',code:'01-FROZEN',description:'Snow-filled arrival, glowing landscape, carnival movement, music, spectacle, and the first impossible view of the night.',features:['Snowfall arrival','Main-stage energy','Games + spectacle']},
  fire:{number:'World 02',title:'Fire + Ice Lounge',code:'02-EMBER',description:'Heated domes, fire pits, winter cocktails, private tables, and a dramatic warm core inside the frozen world.',features:['Heated lounge','Winter cocktails','Premium seating']},
  crystal:{number:'World 03',title:'Crystal After Dark',code:'03-CRYSTAL',description:'Reflective rooms, late-night DJs, colder light, sharper fashion, and the shift from immersive festival to elevated nightlife.',features:['Late-night DJs','Reflective environment','Fashion-forward energy']},
  market:{number:'World 04',title:'The Winter Market',code:'04-MARKET',description:'Curated food, seasonal products, visual vendors, interactive installations, and a slower discovery lane through the village.',features:['Food + retail','Brand activations','Interactive discovery']}
};

qa('.world-tab').forEach(tab=>tab.addEventListener('click',()=>{
  qa('.world-tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  const key=tab.dataset.zone;
  const data=zones[key];
  const stage=q('#worldStage');
  stage.dataset.zone=key;
  q('#zoneNumber').textContent=data.number;
  q('#zoneTitle').textContent=data.title;
  q('#zoneCode').textContent=data.code;
  q('#zoneDescription').textContent=data.description;
  q('#zoneFeatures').innerHTML=data.features.map(item=>`<span>${item}</span>`).join('');
}));

qa('.pass').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(innerWidth<900)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-5px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
});

let temp=-7;
setInterval(()=>{
  temp=temp===-7?-8:-7;
  q('#tempReadout').textContent=`${temp}°`;
},4200);

async function loadSettings(){
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/event_site_settings?event_slug=eq.${slug}&select=*`,{headers:{apikey:SUPABASE_KEY}});
    const [d]=await r.json();
    if(!d)return;
    if(d.eyebrow)q('#eyebrow').textContent=d.eyebrow;
    if(d.subheadline)q('#subheadline').textContent=d.subheadline;
    if(d.date_label){q('#dateLabel').textContent=d.date_label;q('#season').textContent=d.date_label}
    if(d.doors_time)q('#doorsTime').textContent=d.doors_time;
    if(d.city)q('#city').textContent=d.city;
    if(d.venue_name)q('#venueName').textContent=d.venue_name;
    if(d.metadata?.dress_code)q('#dressCode').textContent=d.metadata.dress_code;
  }catch(e){console.warn('Using launch placeholders')}
}

q('#leadForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const btn=form.querySelector('button');
  const status=q('#formStatus');
  const fd=new FormData(form);
  const p=new URLSearchParams(location.search);
  btn.disabled=true;
  btn.textContent='Freezing your access…';
  status.textContent='';
  const body={
    event_slug:slug,
    first_name:fd.get('first_name'),
    last_name:fd.get('last_name')||null,
    email:fd.get('email'),
    phone:fd.get('phone')||null,
    interest_type:fd.get('interest_type'),
    party_size:Number(fd.get('party_size')||1),
    website:fd.get('website')||'',
    source_url:location.href,
    utm_source:p.get('utm_source'),
    utm_medium:p.get('utm_medium'),
    utm_campaign:p.get('utm_campaign'),
    consent_marketing:true
  };
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/event_site_leads`,{
      method:'POST',
      headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify(body)
    });
    if(!r.ok)throw new Error(await r.text());
    status.textContent='Your name is inside the Winter Wonderland access file.';
    form.reset();
  }catch(err){
    status.textContent='Your request did not save. Please retry.';
  }finally{
    btn.disabled=false;
    btn.textContent='Enter Winter Wonderland';
  }
});

const canvas=q('#snow');
const ctx=canvas.getContext('2d');
let flakes=[];
function resizeSnow(){
  canvas.width=innerWidth*devicePixelRatio;
  canvas.height=innerHeight*devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  flakes=Array.from({length:Math.min(190,Math.floor(innerWidth/6))},()=>({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:Math.random()*2.7+.35,
    v:Math.random()*.7+.18,
    w:Math.random()*1.1-.55,
    a:Math.random()*.62+.22,
    swing:Math.random()*Math.PI*2
  }));
}
function drawSnow(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const f of flakes){
    f.swing+=.008;
    f.y+=f.v;
    f.x+=f.w+Math.sin(f.swing)*.15;
    if(f.y>innerHeight+6){f.y=-6;f.x=Math.random()*innerWidth}
    if(f.x<-6)f.x=innerWidth+6;
    if(f.x>innerWidth+6)f.x=-6;
    ctx.beginPath();
    ctx.fillStyle=`rgba(235,253,255,${f.a})`;
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(drawSnow);
}
addEventListener('resize',resizeSnow);
resizeSnow();
drawSnow();
loadSettings();
