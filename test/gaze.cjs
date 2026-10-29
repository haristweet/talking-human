// 目の動きの確認：目の動きのボタン、きょろきょろのときの目線（0.2 秒ごと）と 1 コマの最大の動き、
// カメラを見るときの目を 6 方向のカメラから描く（どこから撮っても目がこちらを向くこと）
//   python3 -m http.server 8805 &  node test/gaze.cjs 出力.png 顔写真.png
const { chromium } = require('playwright');
(async()=>{const [out,...imgs]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>{if(!/textContent/.test(e.message))console.log('pageerror',e.message);});
await p.goto('http://localhost:8805/');await p.evaluate(()=>localStorage.clear());await p.reload();
console.log(await p.$$eval('.seg[data-key=gazeMode] .chip',e=>e.map(x=>x.textContent+(x.classList.contains('on')?'*':''))));
console.log(await p.evaluate(()=>{const s=newSim();const r=[];for(let k=0;k<8*30;k++){s.update(1/30);if(k%6==0){const g=s.gaze();r.push(g.map(v=>v.toFixed(2)).join(','));}}return r.join(' ');}));
// 跳ぶ速さ：1 コマの最大の動き
console.log('max step/frame',await p.evaluate(()=>{const s=newSim();let m=0,pv=s.gaze();for(let k=0;k<20*60;k++){s.update(1/60);const g=s.gaze();m=Math.max(m,Math.hypot(g[0]-pv[0],g[1]-pv[1]));pv=g;}return m.toFixed(3);}));
await p.setInputFiles('#pfile',imgs);await p.waitForFunction(()=>/作りました/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
const cells=[];for(const eye of[[0,.15,3],[1.6,.4,2.4],[-1.6,-.3,2.4],[0,1.4,2.6],[2.3,.15,1.4],[-1,.2,2.9]])cells.push(await p.evaluate(eye=>{Object.assign(cfg,{style:'solid',crt:true,gazeMode:'camera'});const s=newSim();s.time=.25;s.shot=()=>({eye,target:[0,.15,.6],roll:0});s.sacTarget=function(k){const e=this.shot().eye,d=[e[0],e[1]-.15,e[2]-.8];return[clamp(Math.atan2(d[0],d[2])/.8,-.6,.6),clamp(-Math.atan2(d[1],Math.hypot(d[0],d[2]))/.8,-.35,.35)];};
  const c=document.createElement('canvas');c.width=640;c.height=360;drawFrame(c.getContext('2d'),640,360,s,lookFor(s));return c.toDataURL();},eye));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=426>`).join('')+'</body>');await p.setViewportSize({width:1280,height:480});await p.screenshot({path:out});await b.close();})();
