// 写真の顔の目の確認：両目の寄りを、まばたき（開く・半分・閉じる）と目線（右・左上・下）で並べる。閉じたまぶたから黒目が出ないこと、目線で黒目が動くことを見る
//   python3 -m http.server 8805 &  node test/eyes.cjs 出力.png 顔写真.png [横顔.png]
const { chromium } = require('playwright');
(async()=>{const [out,...imgs]=process.argv.slice(2);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>console.log('pageerror',e.message));
await p.goto('http://localhost:8805/');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.setInputFiles('#pfile',imgs);await p.waitForFunction(()=>/作りました/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
const cells=[];for(const[bl,gz]of[[0,[0,0]],[.5,[0,0]],[1,[0,0]],[0,[.25,0]],[0,[-.25,.1]],[0,[0,-.12]]])cells.push(await p.evaluate(([bl,gz])=>{Object.assign(cfg,{style:'solid',crt:true});const s=newSim();s.time=.25;s.blink=()=>bl;s.gaze=()=>gz;window.mouthOpen=()=>0;
  const F=KINDS.p1.photo,ec=[0,1,2].map(q=>(EYES[0].concat(EYES[1])).reduce((a,i)=>a+F.pts[i*3+q],0)/32);
  const c=document.createElement('canvas');c.width=640;c.height=360;s.shot=()=>({eye:[ec[0],ec[1],ec[2]+1.6],target:ec,roll:0});drawFrame(c.getContext('2d'),640,360,s,lookFor(s));return c.toDataURL();},[bl,gz]));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=426>`).join('')+'</body>');await p.setViewportSize({width:1280,height:480});await p.screenshot({path:out});await b.close();})();
