// Run inside the Playwright container; see docs/promo.md.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');

const root = process.env.CYCLE_SOURCE || path.resolve(__dirname, '..');
const output = process.env.CYCLE_OUTPUT || path.join(root, 'docs');
const scratch = process.env.CYCLE_SCRATCH || '/tmp/cycle-promo-frames';
const width = 1280, height = 720, fps = 24, duration = 18;
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(scratch, { recursive: true });

// Fictional calendar, held only in memory. Never opens the deployment database.
let days = ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21'];
const scenes = [
  ['Your cycle.<br>Your server.', 'A simple period calendar<br>you host yourself.', '01 / YOUR OWN SPACE'],
  ['Tap to log.<br>Tap to undo.', 'A few taps keep your<br>calendar up to date.', '02 / KEEP IT SIMPLE'],
  ['See what’s<br>coming next.', 'Estimated forecasts, based<br>on your recent cycles.', '03 / SEE YOUR PATTERN'],
  ['Make room<br>for Cycle.', 'A small calendar.<br>A place on your own server.', '04 / HOST IT YOURSELF']
];
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cycle promo render</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#fff7f8;color:#30272a;font-family:Arial,sans-serif}
.stage{position:relative;width:1280px;height:720px;overflow:hidden;background:radial-gradient(ellipse at 76% 45%,#f8dfe7 0%,#fff7f8 61%)}
.brand{position:absolute;left:64px;top:43px;display:flex;gap:10px;align-items:center;font-weight:700;font-size:26px;letter-spacing:-1px}
.mark{width:31px;height:31px;background:#d44f73;color:white;border-radius:50%;display:grid;place-items:center;font:25px Georgia,serif}
.eyebrow{position:absolute;left:66px;top:139px;color:#a33354;font-size:12px;font-weight:700;letter-spacing:2px}
h1{position:absolute;left:60px;top:182px;margin:0;font-size:72px;line-height:1.04;letter-spacing:-3px;font-weight:700}
.sub{position:absolute;left:65px;top:371px;font-size:23px;color:#75646a;line-height:1.45;margin:0}
.cta{position:absolute;left:65px;top:486px;display:none}
.cta strong{display:inline-block;background:#d44f73;color:#fff;padding:15px 19px;border-radius:11px;font-size:19px}
.cta p{font:15px monospace;color:#75646a;margin-top:15px}
.browser{position:absolute;top:39px;right:56px;width:554px;height:606px;background:#fff7f8;border:1px solid #e6ced5;border-radius:19px;overflow:hidden;box-shadow:0 24px 60px #78384b17}
.chrome{height:35px;background:#fffcfd;border-bottom:1px solid #efdee3;display:flex;align-items:center;padding:0 15px;gap:6px}
.chrome i{width:7px;height:7px;border-radius:50%;background:#e9c7d1}.address{font-size:11px;color:#947c84;margin-left:14px}
iframe{border:0;width:720px;height:765px;transform:scale(.77);transform-origin:top left;display:block}
.footer{position:absolute;bottom:25px;left:65px;color:#8d747c;font-size:11px;letter-spacing:.3px}
.sample{position:absolute;right:69px;bottom:25px;color:#8d747c;font-size:11px}
.cursor{position:absolute;width:19px;height:19px;border:2px solid #9a2749;border-radius:50%;background:#d44f7320;transform:translate(-50%,-50%);pointer-events:none;display:none;z-index:5}
.ring{position:absolute;width:52px;height:52px;border:2px solid #d44f73;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;display:none;z-index:4}
.progress{position:absolute;bottom:0;left:0;height:3px;background:#d44f73}
</style></head><body><div class="stage">
<div class="brand"><span class="mark">c</span>cycle</div><div class="eyebrow"></div>
<h1></h1><p class="sub"></p><div class="cta"><strong>Explore Cycle on GitHub ↗</strong><p>github.com/dermute/cycle</p></div>
<div class="browser"><div class="chrome"><i></i><i></i><i></i><span class="address">cycle / your private network</span></div><iframe title="Cycle with fictional demo data" src="/app/index.html"></iframe></div>
<div class="footer">SELF-HOSTED · OPEN SOURCE</div><div class="sample">Fictional demo data · Forecasts are estimates</div>
<div class="cursor"></div><div class="ring"></div><div class="progress"></div></div>
<script>
const scenes=${JSON.stringify(scenes)};
window.paint=(t,cursor,clickAge)=>{
const scene=t<3?0:t<9?1:t<13?2:3;
document.querySelector('h1').innerHTML=scenes[scene][0];
document.querySelector('.sub').innerHTML=scenes[scene][1];
document.querySelector('.eyebrow').textContent=scenes[scene][2];
document.querySelector('.cta').style.display=scene===3?'block':'none';
document.querySelector('.progress').style.width=(t/18*1280)+'px';
for(const selector of ['.cursor','.ring']){
const el=document.querySelector(selector);el.style.left=cursor.x+'px';el.style.top=cursor.y+'px';
el.style.display=(t>=3&&t<11&&(selector==='.cursor'||clickAge<.32))?'block':'none';
if(selector==='.ring'){el.style.opacity=1-clickAge/.32;el.style.width=el.style.height=(25+clickAge*95)+'px';}
}
};window.paint(0,{x:1050,y:450},1);
</script></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(html); }
  if (url.pathname.endsWith('/api/periods')) {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'PUT') {
      let body = ''; req.on('data', chunk => body += chunk);
      return req.on('end', () => { days = JSON.parse(body).days; res.end(JSON.stringify({days})); });
    }
    return res.end(JSON.stringify({days}));
  }
  const relative = decodeURIComponent(url.pathname).replace(/^\/app\//, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !['.html','.css','.js'].includes(path.extname(file))) {
    res.writeHead(404); return res.end();
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', {'.html':'text/html','.css':'text/css','.js':'text/javascript'}[path.extname(file)]);
    res.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true});
  try {
    const context = await browser.newContext({viewport:{width,height},locale:'en-US',timezoneId:'Europe/Berlin',deviceScaleFactor:1});
    await context.addInitScript(() => {
      const OriginalDate = Date;
      globalThis.Date = class extends OriginalDate {
        constructor(...args) { super(...(args.length ? args : ['2026-09-22T12:00:00+02:00'])); }
        static now() { return new OriginalDate('2026-09-22T12:00:00+02:00').getTime(); }
      };
    });
    const page = await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const app = page.frames().find(frame => frame.url().includes('/app/index.html'));
    await app.waitForFunction(() => document.querySelectorAll('.day').length === 42);
    await app.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
    const steps = [
      {at:3.9,day:14},{at:4.6,day:15},{at:5.3,day:16},{at:6,day:17},{at:6.7,day:18},
      {at:7.5,day:18},{at:8.2,day:18},{at:9.5,next:true}
    ];
    const targets=[];
    for(const step of steps){
      const locator=step.next?app.locator('#nextMonth'):app.locator('.day:not(.outside)').filter({hasText:new RegExp('^'+step.day+'$')});
      const box=await locator.boundingBox();targets.push({...step,locator,x:box.x+box.width/2,y:box.y+box.height/2});
    }
    let stepIndex=0,lastClick=-10,cursor={x:1050,y:450};
    for(let frame=0;frame<fps*duration;frame++){
      const t=frame/fps;
      if(stepIndex<targets.length&&t>=targets[stepIndex].at){
        const target=targets[stepIndex++];await target.locator.click();lastClick=t;
        await app.waitForFunction(() => document.getElementById('nextPeriod').textContent!=='—');
        if(target.next){
          const forecast=await app.locator('.day.forecast:not(.outside)').count();
          if(forecast!==5)throw new Error('Expected five forecast days in October, got '+forecast);
        }
      }
      const target=targets[Math.min(stepIndex,targets.length-1)];
      const previous=stepIndex?targets[stepIndex-1]:{x:1050,y:450,at:3};
      const moveStart=Math.max(previous.at,target.at-.5);
      const p=Math.max(0,Math.min(1,(t-moveStart)/Math.max(.01,target.at-moveStart)));
      const eased=p*p*(3-2*p);
      cursor={x:previous.x+(target.x-previous.x)*eased,y:previous.y+(target.y-previous.y)*eased};
      await page.evaluate(({t,cursor,age})=>window.paint(t,cursor,age),{t,cursor,age:t-lastClick});
      await page.screenshot({path:path.join(scratch,`frame-${String(frame).padStart(4,'0')}.png`)});
      if(frame%fps===0)process.stdout.write(`Rendered ${frame/fps}/${duration}s\n`);
    }
    if(errors.length)throw new Error(errors.join('\n'));
    if(days.length!==10)throw new Error('Demo should end with two fictional five-day periods');
  } finally { await browser.close();server.close(); }
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',path.join(scratch,'frame-%04d.png'),'-filter_complex','fps=10,scale=896:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5','-loop','0',path.join(output,'cycle-promo.gif')],{stdio:'inherit'});
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
