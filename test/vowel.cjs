// 母音の見積もりの試験：あ・い・う・え・お を作った声（声帯の音を 2 つの共鳴に通したもの）で 0.6 秒ずつ鳴らし、
// voiceEnv・voiceVowel・mouthShape で見積もった母音が順に合うかを見る。NOISE=0.5 などで声の大きさに対する割合の雑音（楽器の代わり）を混ぜ、FEMALE=1 で高い声（共鳴 1.17 倍・220Hz）
//   python3 -m http.server 8805 &  node test/vowel.cjs
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('pageerror',e.message));
await p.goto('http://localhost:8805/');
const r=await p.evaluate(([noise,fem])=>{const sr=44100,seg=.6,F={a:[800,1200],i:[300,2300],u:[330,1400],e:[480,1900],o:[500,850]},order='aiueo',N=Math.round(sr*seg*order.length),x=new Float32Array(N);
  let rnd=1;const rand=()=>{rnd=(rnd*16807)%2147483647;return rnd/2147483647-.5;};
  const res=(f,bw)=>{const R=Math.exp(-Math.PI*bw/sr),th=2*Math.PI*f/sr;return{a1:2*R*Math.cos(th),a2:-R*R,y1:0,y2:0};};
  for(let s=0;s<order.length;s++){const fs=F[order[s]].map((f,q)=>res(f*(fem?1.17:1),q?90:70)),n0=Math.round(s*seg*sr),n1=Math.round((s+1)*seg*sr),f0=(fem?220:120)+15*s;
    for(let i=n0;i<n1;i++){let e=(i%Math.round(sr/f0))===0?1:0;for(const r of fs){const y=e+r.a1*r.y1+r.a2*r.y2;r.y2=r.y1;r.y1=y;e=y;}
      const env=Math.min(1,(i-n0)/800,(n1-i)/800);x[i]=e*.02*env;}}
  // 雑音は声の大きさ（RMS）に対する割合で足す
  let rms=0;for(let i=0;i<N;i++)rms+=x[i]*x[i];rms=Math.sqrt(rms/N);for(let i=0;i<N;i++)x[i]+=noise*rms*rand()*3.46;
  const buf={sampleRate:sr,length:N,numberOfChannels:1,getChannelData:()=>x,duration:N/sr};
  const env=voiceEnv(buf),vow=voiceVowel(buf,env);snd={buf,env,vow,lyrics:[]};
  const out=[];for(let s=0;s<order.length;s++){const cnt={};for(let t=s*seg+.15;t<(s+1)*seg-.1;t+=1/60){const sim={time:t,tImp:1e9,seed:1};const v=mouthShape(sim).v;cnt[v]=(cnt[v]||0)+1;}
    const k=Math.floor((s+.5)*seg*60);out.push({raw:(()=>{const l=vow.E[0][k],m=vow.E[1][k];let ws=0,wf=0;const g=vow.F.slice(2).map((f,b)=>vow.E[b+2][k]*(f/1000)**2);return [+(m/(l+m)).toFixed(2),vow.F[2+g.indexOf(Math.max(...g))]];})(),want:order[s],got:Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0],count:cnt,op:+vow.op[k].toFixed(2),fr:+vow.fr[k].toFixed(2)});}
  snd=null;return out;},[+(process.env.NOISE||0),!!process.env.FEMALE]);
let ok=0;for(const o of r){console.log(o.want,'→',o.got,JSON.stringify(o.raw),JSON.stringify(o.count),'開き',o.op,'横',o.fr);if(o.want===o.got)ok++;}
console.log(`${ok}/5 合った`);await b.close();process.exit(ok>=4?0:1);})();
