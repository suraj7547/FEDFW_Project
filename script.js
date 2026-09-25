const state = {
  distanceKm: 6.2, selectedOption: null, selectedPay: 'upi', ratingValue: 0,
  history: [
    {route:'Home → Tech Park', fare:186, when:'Yesterday, 6:42 PM', rating:5},
    {route:'Cafe Row → City Mall', fare:94, when:'Mon, 1:05 PM', rating:4}
  ]
};

const drivers = [
  {name:'Arjun Mehta', car:'White Swift · KA 05 AB 4521', rating:'4.8★', initial:'A'},
  {name:'Priya Nair', car:'Silver i20 · KA 03 CD 7810', rating:'4.9★', initial:'P'},
  {name:'Rohan Iyer', car:'Grey Baleno · KA 01 EF 2290', rating:'4.7★', initial:'R'}
];
let currentDriver = drivers[0];

function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.dataset.screen===name));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
}

function jumpTracking(){
  const el = document.querySelector('.screen[data-screen="tracking"]');
  if(el.classList.contains('active') || el.innerHTML.includes('carDot')){
    showScreen('tracking');
  } else {
    showScreen('home');
  }
}

function buildOptions(){
  const base = 40;
  const perKm = {Economy:12, Comfort:19, Pool:8};
  const eta = {Economy:4, Comfort:3, Pool:7};
  const wrap = document.getElementById('rideOptions');
  wrap.innerHTML = '';
  Object.keys(perKm).forEach((tier,i)=>{
    const price = Math.round(base + perKm[tier]*state.distanceKm);
    const card = document.createElement('div');
    card.className = 'ride-card' + (i===0 ? ' selected':'');
    card.dataset.tier = tier;
    card.dataset.price = price;
    card.innerHTML = `<div class="ride-icon">${tier==='Economy'?'🚗':tier==='Comfort'?'🚙':'👥'}</div>
      <div class="ride-info"><div class="name">${tier}</div><div class="meta">${eta[tier]} min away · ${state.distanceKm.toFixed(1)} km</div></div>
      <div class="ride-price">₹${price}</div>`;
    card.onclick = ()=>selectRide(card);
    wrap.appendChild(card);
  });
  selectRide(wrap.firstChild);
}

function selectRide(card){
  document.querySelectorAll('.ride-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');
  state.selectedOption = {tier:card.dataset.tier, price:Number(card.dataset.price)};
  document.getElementById('bookBtn').disabled = false;
}

function goEstimate(){
  const pu = document.getElementById('pickup').value.trim();
  const dr = document.getElementById('drop').value.trim();
  state.distanceKm = Math.round((4 + Math.random()*8) * 10)/10;
  state.pickup = pu || 'Pickup point';
  state.drop = dr || 'Drop point';
  buildOptions();
  showScreen('estimate');
}

function goFinding(){
  showScreen('finding');
  setTimeout(()=>{
    currentDriver = drivers[Math.floor(Math.random()*drivers.length)];
    document.getElementById('driverInitial').textContent = currentDriver.initial;
    document.getElementById('driverName').textContent = currentDriver.name;
    document.getElementById('driverCar').textContent = currentDriver.car;
    document.getElementById('driverRating').textContent = currentDriver.rating;
    document.getElementById('rateDriverName').textContent = currentDriver.name.split(' ')[0];
    showScreen('matched');
  }, 1800);
}

let trackTimer = null;
function goTracking(){
  showScreen('tracking');
  const path = document.getElementById('routeDone');
  const carDot = document.getElementById('carDot');
  const guide = document.getElementById('routePath');
  const len = guide.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  const fill = document.getElementById('progFill');
  const distLeft = document.getElementById('distLeft');
  const etaLeft = document.getElementById('etaLeft');
  const arriveBtn = document.getElementById('arriveBtn');
  arriveBtn.disabled = true; arriveBtn.textContent = 'Waiting for arrival…';
  const totalDist = state.distanceKm;
  const durationMs = 6000;
  const start = performance.now();
  if(trackTimer) cancelAnimationFrame(trackTimer);
  function step(now){
    const t = Math.min(1, (now-start)/durationMs);
    path.style.strokeDashoffset = String(len*(1-t));
    const pt = guide.getPointAtLength(len*t);
    carDot.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    fill.style.width = (t*100).toFixed(0)+'%';
    distLeft.textContent = (totalDist*(1-t)).toFixed(1)+' km';
    etaLeft.textContent = Math.max(0, Math.round((1-t)*9))+' min';
    if(t < 1){ trackTimer = requestAnimationFrame(step); }
    else{
      arriveBtn.disabled = false;
      arriveBtn.textContent = 'Arrived — continue to payment';
    }
  }
  trackTimer = requestAnimationFrame(step);
}

function goPayment(){
  const price = state.selectedOption ? state.selectedOption.price : Math.round(40 + 15*state.distanceKm);
  const distCost = Math.round(price - 40 - 8);
  document.getElementById('fDist').textContent = state.distanceKm.toFixed(1);
  document.getElementById('fDistCost').textContent = '₹'+distCost;
  document.getElementById('fTotal').textContent = '₹'+price;
  showScreen('payment');
}

function selectPay(el){
  document.querySelectorAll('.pay-chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedPay = el.dataset.pay;
}

function goRate(){
  state.ratingValue = 0;
  document.querySelectorAll('.star').forEach(s=>s.classList.remove('filled'));
  showScreen('rate');
}

document.getElementById('starRow').addEventListener('click', (e)=>{
  if(!e.target.classList.contains('star')) return;
  const v = Number(e.target.dataset.v);
  state.ratingValue = v;
  document.querySelectorAll('.star').forEach(s=>s.classList.toggle('filled', Number(s.dataset.v)<=v));
});

function submitRating(){
  const price = state.selectedOption ? state.selectedOption.price : Math.round(40+15*state.distanceKm);
  state.history.unshift({
    route: (state.pickup||'Pickup') + ' → ' + (state.drop||'Drop'),
    fare: price, when: 'Just now', rating: state.ratingValue || 5
  });
  renderHistory();
  showHistory();
}

function renderHistory(){
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  state.history.forEach(h=>{
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<div class="history-top"><span>${h.route}</span><span>₹${h.fare}</span></div>
      <div class="history-route">${h.when}</div>
      <div class="history-meta"><span>Trip completed</span><span class="tag-rating">${'★'.repeat(h.rating)}${'☆'.repeat(5-h.rating)}</span></div>`;
    list.appendChild(div);
  });
}
function showHistory(){ renderHistory(); showScreen('history'); }

function resetDemo(){
  if(trackTimer) cancelAnimationFrame(trackTimer);
  document.getElementById('pickup').value = 'MG Road Metro Station';
  document.getElementById('drop').value = 'Terminal 2, City Airport';
  showScreen('home');
}

function tickClock(){
  const d = new Date();
  const h = d.getHours()%12 || 12;
  const m = String(d.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = h+':'+m;
}
tickClock();
setInterval(tickClock, 30000);
renderHistory();
