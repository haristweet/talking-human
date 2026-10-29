// 写真の顔の口の確認：口の寄りを、開き 0・0.5・1 で正面から、1 で斜め・横・下から並べ、続けて母音（あいうえお を正面から、う・い を横から、お を斜めから）を並べる。口の中が穴（奥行き）に見えること、歯と舌が見えることを見る
//   python3 -m http.server 8805 &  node test/mouth.cjs 出力.png 顔写真.png [横顔.png]
const { chromium } = require('playwright');
(async()=>{const [out,...imgs]=process.argv.slice(2);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>{if(!/textContent/.test(e.message))console.log('pageerror',e.message);});
await p.goto('http://localhost:8805/');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.setInputFiles('#pfile',imgs);await p.waitForFunction(()=>/作りました/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
const cells=[];for(const[op,d]of[[0,[0,0,1]],[.5,[0,0,1]],[1,[0,0,1]],[1,[.6,0,.8]],[1,[.95,0,.3]],[1,[.15,-.55,.82]]])cells.push(await p.evaluate(([op,d])=>{Object.assign(cfg,{style:'solid',crt:true});const s=newSim();s.time=.25;window.mouthOpen=()=>op;
  const F=KINDS.p1.photo,mc=[13,14].reduce((a,i)=>a.map((v,q)=>v+F.pts[i*3+q]/2),[0,0,0]);mc[1]-=.08;
  const c=document.createElement('canvas');c.width=640;c.height=360;s.shot=()=>({eye:mc.map((v,q)=>v+d[q]*1.5),target:mc,roll:0});drawFrame(c.getContext('2d'),640,360,s,lookFor(s));return c.toDataURL();},[op,d]));
// 母音：あいうえお を正面から、う・い を横から（声の大きさ 1 のときの形）
for(const[v,d]of[['a',[0,0,1]],['i',[0,0,1]],['u',[0,0,1]],['e',[0,0,1]],['o',[0,0,1]],['u',[.95,0,.3]],['i',[.95,0,.3]],['o',[.6,0,.8]]])cells.push(await p.evaluate(([v,d])=>{Object.assign(cfg,{style:'solid',crt:true});const s=newSim();s.time=.25;
  const sh=VOWELS[v].sh;window.mouthShape=()=>({open:sh[0],wid:sh[1],rnd:sh[2],v});
  const F=KINDS.p1.photo,mc=[13,14].reduce((a,i)=>a.map((x,q)=>x+F.pts[i*3+q]/2),[0,0,0]);mc[1]-=.08;
  const c=document.createElement('canvas');c.width=640;c.height=360;s.shot=()=>({eye:mc.map((x,q)=>x+d[q]*1.5),target:mc,roll:0});drawFrame(c.getContext('2d'),640,360,s,lookFor(s));return c.toDataURL();},[v,d]));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=426>`).join('')+'</body>');await p.setViewportSize({width:1280,height:1200});await p.screenshot({path:out});await b.close();})();
