const storageKey = 'cycle-period-days-v1';
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fromKey = key => new Date(`${key}T12:00:00`);
const dayMs = 86400000;
const today = () => { const d = new Date(); d.setHours(12,0,0,0); return d; };
let logged = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
let view = new Date(today().getFullYear(), today().getMonth(), 1, 12);

function save() { localStorage.setItem(storageKey, JSON.stringify([...logged].sort())); }
function groups() {
  const days = [...logged].sort().map(fromKey); const result = [];
  days.forEach(day => { const previous = result.at(-1); if (previous && (day - previous.end) === dayMs) previous.end = day; else result.push({ start:day, end:day }); });
  return result;
}
function recentGroups() { const cutoff = new Date(today()); cutoff.setMonth(cutoff.getMonth() - 6); return groups().filter(g => g.end >= cutoff); }
function average(values, fallback) { return values.length ? Math.round(values.reduce((a,b) => a+b,0) / values.length) : fallback; }
function cycleInfo() {
  const periods = recentGroups();
  const lengths = periods.map(p => Math.round((p.end-p.start)/dayMs)+1);
  const gaps = periods.slice(1).map((p,i) => Math.round((p.start-periods[i].start)/dayMs));
  const periodLength = average(lengths, 5); const cycleLength = average(gaps, 28);
  const last = periods.at(-1);
  const predictions = [];
  if (last) { let start = new Date(last.start); do { start = new Date(start.getTime()+cycleLength*dayMs); predictions.push(start); } while (predictions.length < 7); }
  return { periods, periodLength, cycleLength, predictions };
}
function forecastKeys() { const {periodLength, predictions} = cycleInfo(); const keys = new Set(); predictions.forEach(start => { for(let i=0;i<periodLength;i++) keys.add(dateKey(new Date(start.getTime()+i*dayMs))); }); return keys; }
function renderCalendar() {
  const grid = document.getElementById('calendarGrid'); grid.innerHTML = '';
  document.getElementById('monthLabel').textContent = view.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const firstWeekday = (view.getDay()+6)%7; const start = new Date(view); start.setDate(1-firstWeekday);
  const forecast = forecastKeys(); const nowKey = dateKey(today());
  for(let i=0;i<42;i++) { const d = new Date(start.getTime()+i*dayMs); const key = dateKey(d); const ownMonth = d.getMonth()===view.getMonth();
    const b = document.createElement('button'); b.className='day' + (!ownMonth?' outside':'') + (logged.has(key)?' period':'') + (!logged.has(key)&&forecast.has(key)?' forecast':'') + (key===nowKey?' today':'');
    b.type='button'; b.textContent=d.getDate(); b.setAttribute('aria-label', `${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${logged.has(key)?', logged period':''}${forecast.has(key)&&!logged.has(key)?', forecast period':''}`);
    b.onclick=()=>{ logged.has(key) ? logged.delete(key) : logged.add(key); save(); render(); }; grid.appendChild(b);
  }
}
function renderSummary() { const info=cycleInfo(); const next=info.predictions.find(d=>d>=today()); document.getElementById('averageCycle').textContent=info.periods.length>1?`${info.cycleLength} days`:'—'; document.getElementById('averagePeriod').textContent=info.periods.length?`${info.periodLength} days`:'—'; document.getElementById('nextPeriod').textContent=next?next.toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'; document.getElementById('nextPeriodDetail').textContent=next?`in ${Math.round((next-today())/dayMs)} days · estimate`:'Log a period to begin'; }
function render(){ renderCalendar(); renderSummary(); }
document.getElementById('previousMonth').onclick=()=>{view.setMonth(view.getMonth()-1);renderCalendar();};
document.getElementById('nextMonth').onclick=()=>{view.setMonth(view.getMonth()+1);renderCalendar();};
document.getElementById('todayButton').onclick=()=>{const d=today();view=new Date(d.getFullYear(),d.getMonth(),1,12);renderCalendar();};
render();
