// 写真から顔を作る機能の絵の確認：顔写真を1枚入れて、カットの違う時刻のコマ（ポリゴン・線画・カットなし）、口を大きく開けたところ、頭の全体（髪の形）を5方向から並べる
//   python3 -m http.server 8805 &  node test/photo.cjs 顔写真.png [横顔.png] 出力.png
//   顔写真は、正面を向いて口を閉じたもの。写真はリポジトリには入れない
const { chromium } = require('playwright');
(async()=>{const args=process.argv.slice(2),out=args.pop(),img=args;
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>console.error('pageerror',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console',m.text().slice(0,200));});
await p.goto('http://localhost:8805/');await p.evaluate(()=>localStorage.clear());await p.reload();
const t0=Date.now();await p.setInputFiles('#pfile',img);
await p.waitForFunction(()=>/枚から顔を作りました|見つから/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
console.log('pinfo:',await p.textContent('#pinfo'),((Date.now()-t0)/1000).toFixed(1)+'s');
console.log(await p.evaluate(()=>{const K=KINDS.p1;return K?JSON.stringify({n:K.photo.pts.length/3,tris:K.photo.tris.length/3,hw:K.photo.hw,rs:K.photo.rs&&K.photo.rs.join(','),hair:K.hair,skin:K.skin,scenes:cfg.scenes,stored:(localStorage.getItem('endless-human-photos')||'').length}):'none';}));
const cells=[];
for(const[style,t,cut]of[['solid',1,4],['solid',3,4],['solid',5.2,4],['wire',1,4],['wire',9.4,4],['solid',2,0],['solid',6,0],['wire',13,4]])cells.push(await p.evaluate(([style,t,cut])=>{playing=false;exporting=true;Object.assign(cfg,{style,cutLen:cut,crt:style==='wire',seed:1234,aspect:'16:9'});const s=newSim();for(let k=0;k<Math.round(t*30);k++)s.update(1/30);
  const c=document.createElement('canvas');c.width=480;c.height=270;drawFrame(c.getContext('2d'),480,270,s,lookFor(s));return c.toDataURL();},[style,t,cut]));
// 口を開けたところ・まばたき
cells.push(await p.evaluate(()=>{const K=KINDS.p1,d=headMesh(K,{open:1,blink:0,gaze:[0,0]});const s=newSim();s.time=.25;Object.assign(cfg,{style:'solid',crt:false});
  const c=document.createElement('canvas');c.width=480;c.height=270;s.shot=()=>({eye:[0,-.2,3.2],target:[0,-.2,.3],roll:0});window.mouthOpen=()=>1;drawFrame(c.getContext('2d'),480,270,s,lookFor(s));return c.toDataURL();}));
// 頭の全体（髪の形）：正面・斜め・横・後ろ寄り・上から
for(const eye of[[0,.5,4.6],[2.9,.7,3.5],[4.6,.5,-.3],[3.1,.8,-3.4],[1.3,3.9,2.1]])cells.push(await p.evaluate(eye=>{const s=newSim();s.time=.25;Object.assign(cfg,{style:'solid',crt:false});window.mouthOpen=()=>0;
  const c=document.createElement('canvas');c.width=480;c.height=270;s.shot=()=>({eye,target:[0,.3,-.3],roll:0});drawFrame(c.getContext('2d'),480,270,s,lookFor(s));return c.toDataURL();},eye));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=320>`).join('')+'</body>');await p.setViewportSize({width:1300,height:900});
await p.screenshot({path:out,fullPage:true});await b.close();})();
