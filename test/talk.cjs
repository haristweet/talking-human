// しゃべる確認：あいうえお・まみむめも を SAM でしゃべらせ、音ごとの時刻を出し、写真の顔の口を音ごとに描いて並べる（左上に音と口の形）
//   python3 -m http.server 8805 &  node test/talk.cjs 出力.png 顔写真.png
const { chromium } = require('playwright');
(async()=>{const [out,img]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>{if(!/textContent/.test(e.message))console.log('pageerror',e.message);});
await p.goto('http://localhost:8805/');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(500);
await p.click('.seg[data-key=sayMode] .chip >> nth=1');await p.fill('#say','あいうえお。まみむめも。');await p.waitForTimeout(900);
await p.setInputFiles('#pfile',img);await p.waitForFunction(()=>/作りました/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
console.log(await p.evaluate(()=>snd.tl.map(x=>x.p+'@'+x.t0.toFixed(2)).join(' ')));
const ts=await p.evaluate(()=>snd.tl.filter(x=>x.m!=='c').slice(0,12).map(x=>[(x.t0+x.t1)/2,x.p]));
const cells=[];for(const[t,ph]of ts)cells.push(await p.evaluate(([t,ph])=>{Object.assign(cfg,{style:'solid',crt:true});const s=newSim();s.time=t;
  const F=KINDS.p1.photo,mc=[13,14].reduce((a,i)=>a.map((x,q)=>x+F.pts[i*3+q]/2),[0,0,0]);mc[1]-=.05;s.shot=()=>({eye:[mc[0],mc[1],mc[2]+1.7],target:mc,roll:0});
  const c=document.createElement('canvas');c.width=480;c.height=270;const g=c.getContext('2d');drawFrame(g,480,270,s,lookFor(s));g.fillStyle='#ff0';g.font='20px sans-serif';g.fillText(ph+' '+mouthShape(s).v,10,24);return c.toDataURL();},[t,ph]));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=320>`).join('')+'</body>');await p.setViewportSize({width:1280,height:540});await p.screenshot({path:out});await b.close();})();
