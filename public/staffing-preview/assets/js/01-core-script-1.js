/* AcacyONE Staffing BI | core-script-1 */
const demo = {
  2026:{hc:[2529,2531,2586,2662,2692,2740,2809,2918,3021,3063,3063,3063],hire:[6.1,5.0,9.9,9.9,8.2,7.6,7.8,8.4,6.7,4.1,0,0],quit:[4.6,4.9,7.7,6.9,7.0,5.8,5.2,4.5,4.8,3.2,0,0],new:[154,126,256,264,220,208,219,245,202,125,0,0],quitCount:[116,124,199,184,188,159,146,131,145,98,0,0]},
  2025:{hc:[1850,1910,1995,2080,2140,2200,2270,2340,2410,2475,2510,2520],hire:[5.2,5.5,6.0,6.2,5.8,6.1,5.9,6.3,6.0,5.8,5.7,5.9],quit:[3.8,4.0,4.1,4.4,4.2,4.5,4.1,4.3,4.0,4.2,4.1,4.0],new:[96,102,120,128,124,134,132,148,145,144,143,149],quitCount:[70,74,82,91,90,99,92,101,96,104,103,101]}
};
let importedEmployees = null;
let importedFileName = '';
let selectedChartMonth = 0;
const positions=[["NVBH",2106],["NVHT",609],["CHT-S",337],["NVBHCC",16]];
const demoManagerMapping=[
 {channel:"CH",level1Code:"28173",level1Name:"Cao Phương Anh",level1Phone:"",level1Email:"",level2Code:"25145",level2Name:"Đỗ Thị Hà"},
 {channel:"CH",level1Code:"23199",level1Name:"Nguyễn Thị Thu Hằng",level1Phone:"",level1Email:"",level2Code:"26364",level2Name:"Hoàng Tiến Đạt"},
 {channel:"CH",level1Code:"23199",level1Name:"Nguyễn Thị Thu Hằng",level1Phone:"",level1Email:"",level2Code:"26364",level2Name:"Hoàng Tiến Đạt"},
 {channel:"CH",level1Code:"23199",level1Name:"Nguyễn Thị Thu Hằng",level1Phone:"",level1Email:"",level2Code:"26364",level2Name:"Hoàng Tiến Đạt"},
 {channel:"CH",level1Code:"2441",level1Name:"Nguyễn Thị Xuân Thảo",level1Phone:"",level1Email:"",level2Code:"26485",level2Name:"Hồ Nghĩa Tuấn"}
];
const ages=[["31–35 tuổi",631],["26–30 tuổi",506],["21–25 tuổi",385],["36–40 tuổi",301],["41–45 tuổi",153],["46–50 tuổi",36],["Trên 50 tuổi",10],["18–20 tuổi",7]];
const genders=[["Nam",1650],["Nữ",1413]];
const education=[["THPT",1240],["Đại học",850],["Cao đẳng",520],["Trung cấp",250],["Khác/Trống",203]];
const statuses=[["Chính thức",2045],["Thử việc",919],["Thời vụ",45],["Thời hạn",41],["Nghỉ việc",10],["Nuôi con nhỏ dưới 12T",2],["Trống",1]];
const tenure=[["Dưới 1 năm",850],["1–3 năm",1120],["3–5 năm",710],["Trên 5 năm",373]];
const rows = [
 ["Miền Nam","NVBH","31–35 tuổi","Thử việc",0,2,0,0,0,2,2],
 ["Miền Nam","CHT-S","—","Thử việc",0,1,0,0,0,1,1],
 ["Miền Bắc","NVBH","—","Thử việc",1,2,0,0,0,2,2],
 ["Miền Bắc","NVBH","21–25 tuổi","Thử việc",0,5,0,0,0,5,5],
 ["Miền Bắc","NVBH","26–30 tuổi","Thử việc",1,7,0,0,0,7,7],
 ["Miền Trung","NVBH","26–30 tuổi","Thử việc",0,7,0,0,0,7,7],
 ["Miền Nam","NVBH","31–35 tuổi","Thử việc",0,1,0,0,0,1,1],
 ["Miền Nam","NVHT","31–35 tuổi","Thử việc",0,3,0,1,0,2,2],
 ["Miền Bắc","NVBH","—","Chính thức",5,5,88.9,0,0,5,5],
 ["Miền Bắc","CHT-S","—","Chính thức",1,8,87.5,12,87.5,-4,8],
 ["Miền Nam","NVBH","26–30 tuổi","Chính thức",3,3,25,0,0,3,3],
 ["Miền Trung","CHT-S","36–40 tuổi","Chính thức",3,1,50,1,100,0,3]
];
const fmt=n=>Number(n).toLocaleString('en-US');
const pct=n=>`${Number(n).toFixed(1)}%`;
function maxMonthForYear(y){return y===2026?10:12}
function syncMonthOptions(){const y=+document.querySelector('#year').value,sel=document.querySelector('#month'),max=maxMonthForYear(y);[...sel.options].forEach(o=>{if(o.value==='0')return;o.hidden=+o.value>max;o.disabled=+o.value>max});if(+sel.value>max)sel.value=String(max)}
function selectedData(){const y=+document.querySelector('#year').value;syncMonthOptions();let m=+document.querySelector('#month').value;const d=demo[y];if(!m)m=maxMonthForYear(y);if(importedEmployees)return {y,m,d:aggregateImported(y,m)};return {y,m,d}}
function getPlanValues(actual){const planGap=[-0.018,0.025,-0.012,0.032,-0.022,0.015,-0.008,0.028,-0.017,0.012,-0.025,0.020];return actual.map((v,i)=>Math.round(Number(v||0)*(1+(planGap[i]??0.015))))}
function drawTrend(){if(window.STAFFING_NATIVE_DATA)return;
 const {y,m,d}=selectedData();
 const c=document.getElementById('trend');if(!c)return;
 const rect=c.getBoundingClientRect(),W=Math.max(1,rect.width),H=Math.max(1,rect.height),dpr=window.staffingChartDPR?.()||Math.min(3,Math.max(2,window.devicePixelRatio||1));
 const bw=Math.round(W*dpr),bh=Math.round(H*dpr);if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh}
 const ctx=c.getContext('2d');ctx.setTransform(bw/W,0,0,bh/H,0,0);ctx.clearRect(0,0,W,H);
 const n=Math.min(maxMonthForYear(y),d.hc.length);if(!n)return;
 const left=42,right=12,top=30,lineBottom=H*0.46,barTop=H*0.60,barBottom=H*0.82,monthY=H-9;
 const plotW=W-left-right,step=plotW/n,xAt=i=>left+step*i+step/2;
 const actual=d.hc.slice(0,n).map(v=>Number(v)||0);
 const planVals=Array.isArray(d.plan)?d.plan.slice(0,n).map(v=>Number(v)||0):null;
 const allGraphVals=planVals?[...actual,...planVals]:actual;
 const min=Math.min(...allGraphVals)*.985,max=Math.max(...allGraphVals)*1.015;
 const yAt=v=>lineBottom-(v-min)/(max-min||1)*(lineBottom-top);
 // Clear, high-DPI line styling aligned with the turnover trend chart.
 ctx.strokeStyle='#e8eef8';ctx.lineWidth=1;
 for(let k=0;k<3;k++){const yy=top+k*(lineBottom-top)/2;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(W-right,yy);ctx.stroke()}
 if(planVals){
  ctx.beginPath();ctx.strokeStyle='#7b8494';ctx.lineWidth=1.7;ctx.setLineDash([5,4]);
  planVals.forEach((v,i)=>{const x=xAt(i),yy=yAt(v);if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)});ctx.stroke();ctx.setLineDash([]);
  planVals.forEach((v,i)=>{
   const x=xAt(i),yy=yAt(v);
   ctx.beginPath();ctx.arc(x,yy,2.8,0,Math.PI*2);ctx.fillStyle='#7b8494';ctx.fill();
   // HC Plan: draw every available numeric value, visually separated from Current HC.
   ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#596779';
   ctx.font=(i+1===m?'700 ':'600 ')+'10px "Segoe UI",Arial,sans-serif';
   ctx.fillText(fmt(v),x,Math.max(12,yy-13));
  });
 }
 ctx.beginPath();ctx.strokeStyle='#086ad9';ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.lineCap='round';
 actual.forEach((v,i)=>{const x=xAt(i),yy=yAt(v);if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)});ctx.stroke();
 actual.forEach((v,i)=>{const x=xAt(i),yy=yAt(v),selected=i+1===m;
  ctx.beginPath();ctx.arc(x,yy,selected?4.5:3,0,Math.PI*2);ctx.fillStyle='#086ad9';ctx.fill();
  if(selected){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke()}
  ctx.fillStyle='#086ad9';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font=(selected?'700 ':'600 ')+(planVals?'10':'11')+'px "Segoe UI",Arial,sans-serif';
  // Below the blue Current line when HC Plan exists so both series can be read clearly.
  ctx.fillText(fmt(v),x,planVals?Math.min(barTop-7,yy+16):Math.max(13,yy-10));
 });
 // No missing-plan placeholders when the demo HC Plan series is available.
 if(!planVals)for(let i=0;i<n;i++){
  const x=xAt(i),selected=i+1===m;
  ctx.textAlign='center';ctx.font=(selected?'bold ':'')+'12px "Segoe UI", sans-serif';ctx.fillStyle='#71809c';ctx.fillText('--',x,H*0.535);
  ctx.font='10px "Segoe UI", sans-serif';ctx.fillText('--',x,H*0.575);
 }
 const trendHint=document.querySelector('#pageHC .chart-hint');
 if(trendHint)trendHint.textContent=planVals?`HC Plan T${String(m).padStart(2,'0')}/${y}: ${fmt(planVals[m-1])} · HC thực tế: ${fmt(actual[m-1])} · Số xám = Plan, số xanh = Thực tế`:'Chọn tháng trên biểu đồ để xem HC; dữ liệu Excel chưa có HC Plan.';
 c.title=planVals?`HC Plan: ${fmt(planVals[m-1])} | HC thực tế: ${fmt(actual[m-1])} (T${m}/${y})`:`HC thực tế: ${fmt(actual[m-1])} (T${m}/${y})`;
 const newVals=(d.new||d.newCount||[]).slice(0,n).map(v=>Number(v)||0),quitVals=(d.quitCount||[]).slice(0,n).map(v=>Number(v)||0);
 const bmax=Math.max(1,...newVals,...quitVals),bscale=(barBottom-barTop)/bmax*.82,bwBar=Math.min(13,step*.19);
 ctx.strokeStyle='#edf1f7';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,barBottom+2);ctx.lineTo(W-right,barBottom+2);ctx.stroke();
 for(let i=0;i<n;i++){
  const x=xAt(i),nh=newVals[i]||0,qh=quitVals[i]||0,selected=i+1===m;
  const h1=nh*bscale,h2=qh*bscale,barGap=Math.min(5,step*.06),labelOffset=Math.max(12,Math.min(step*.30,22));
  ctx.fillStyle='#1ab674';ctx.fillRect(x-bwBar-barGap/2,barBottom-h1,bwBar,h1);
  ctx.fillStyle='#e87862';ctx.fillRect(x+barGap/2,barBottom-h2,bwBar,h2);
  ctx.textAlign='center';ctx.font=(selected?'bold ':'')+'9px "Segoe UI", sans-serif';
  ctx.fillStyle='#128d52';ctx.fillText('+'+fmt(nh),x-labelOffset,Math.max(barTop-3,barBottom-h1-5));
  ctx.fillStyle='#c65c49';ctx.fillText('-'+fmt(qh),x+labelOffset,Math.max(barTop-3,barBottom-h2-5));
  ctx.fillStyle=selected?'#071b9b':'#465774';ctx.font=(selected?'bold ':'')+'10px "Segoe UI", sans-serif';
  ctx.fillText(String(i+1).padStart(2,'0')+'/'+String(y).slice(-2),x,monthY);
 }
}
function drawQuitTrend(){if(window.STAFFING_NATIVE_DATA)return;const {y,m,d}=selectedData();const c=document.getElementById('quitTrend');if(!c)return;const rect=c.getBoundingClientRect(),W=Math.max(1,rect.width),H=Math.max(1,rect.height),dpr=window.staffingChartDPR?.()||Math.min(3,Math.max(2,window.devicePixelRatio||1));const bw=Math.round(W*dpr),bh=Math.round(H*dpr);if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh}const ctx=c.getContext('2d');ctx.setTransform(bw/W,0,0,bh/H,0,0);ctx.clearRect(0,0,W,H);const n=Math.min(maxMonthForYear(y),(d.quit||[]).length);if(!n){ctx.fillStyle='#71809c';ctx.font='13px "Segoe UI"';ctx.fillText('Chưa có dữ liệu',20,30);return}const vals=d.quit.slice(0,n).map(v=>Number(v)||0),max=Math.max(1,Math.ceil(Math.max(...vals)*1.25));const left=38,right=12,top=14,bottom=31,plotW=W-left-right,plotH=H-top-bottom,step=plotW/Math.max(1,n-1);ctx.font='10px "Segoe UI"';ctx.strokeStyle='#dce6f3';ctx.fillStyle='#71809c';ctx.lineWidth=1;for(let k=0;k<4;k++){const yy=top+k*plotH/3;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(W-right,yy);ctx.stroke();ctx.textAlign='right';ctx.fillText((max*(1-k/3)).toFixed(1)+'%',left-6,yy+3)}ctx.beginPath();ctx.strokeStyle='#e87862';ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.lineCap='round';vals.forEach((v,i)=>{const x=left+(n===1?plotW/2:i*step),yy=top+plotH-(v/max)*plotH;if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy)});ctx.stroke();vals.forEach((v,i)=>{const x=left+(n===1?plotW/2:i*step),yy=top+plotH-(v/max)*plotH,selected=i+1===m;ctx.beginPath();ctx.arc(x,yy,selected?4.5:3,0,Math.PI*2);ctx.fillStyle=selected?'#c65c49':'#e87862';ctx.fill();if(selected){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke()}const showMonth=n<=8||i===0||i===n-1||i%2===0||selected;if(showMonth){ctx.fillStyle=selected?'#071b9b':'#526783';ctx.textAlign='center';ctx.font=(selected?'bold ':'')+'9px "Segoe UI"';ctx.fillText(String(i+1).padStart(2,'0')+'/'+String(y).slice(-2),x,H-9)}if(n<=10||selected){ctx.fillStyle=selected?'#c65c49':'#e87862';ctx.font=(selected?'bold ':'')+'10px "Segoe UI"';ctx.textAlign='center';ctx.fillText(v.toFixed(1)+'%',x,Math.max(12,yy-9))}});const note=document.getElementById('quitTrendNote');if(note)note.textContent=`${m}/${y} · Tỷ lệ nghỉ việc: ${Number(vals[m-1]||0).toFixed(1)}%`;}

function monthFromQuitChartEvent(e){const c=document.getElementById('quitTrend'),rect=c.getBoundingClientRect(),x=e.clientX-rect.left,W=rect.width;const y=+document.querySelector('#year').value;const d=importedEmployees?aggregateImported(y,1):demo[y];const n=Math.min(maxMonthForYear(y),(d.quit||[]).length);const left=38,right=12,plotW=W-left-right;if(x<left||x>W-right)return;const idx=Math.round((x-left)/(plotW/Math.max(1,n-1)));if(idx>=0&&idx<n){const monthSel=document.getElementById('month');monthSel.value=(+monthSel.value===idx+1)?'0':String(idx+1);selectedChartMonth=+monthSel.value||0;renderTable()}}
function monthFromChartEvent(e){const c=document.getElementById('trend'),rect=c.getBoundingClientRect(),x=e.clientX-rect.left,W=rect.width;const y=+document.querySelector('#year').value;const d=importedEmployees?aggregateImported(y,1):demo[y];const n=Math.min(maxMonthForYear(y),d.hc.length);const left=42,right=12,plotW=W-left-right;if(x<left||x>W-right)return;const idx=Math.floor((x-left)/(plotW/n));if(idx>=0&&idx<n){const monthSel=document.getElementById('month');monthSel.value=(+monthSel.value===idx+1)?'0':String(idx+1);selectedChartMonth=+monthSel.value||0;renderTable()}}
function drawBars(target,data){const el=document.getElementById(target);el.innerHTML='';if(!data||!data.length){el.innerHTML='<div style="color:#71809c;padding:12px">Không có dữ liệu</div>';return}const max=Math.max(1,...data.map(x=>x[1]));data.forEach(([label,value])=>{const row=document.createElement('div');row.className='bar-row';row.innerHTML=`<div class="bar-label" title="${label}">${label}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,value/max*100))}%"></div><span class="bar-value">${fmt(value)}</span></div>`;el.appendChild(row)})}
function drawAnalysis(){const {y,m,d}=selectedData();const current=Number(d.hc[m-1]||0);const baseTotal=3068;const scale=current/baseTotal;const scaleData=a=>a.map(([label,value])=>[label,Math.max(0,Math.round(value*scale))]);const demoMap={region:[['Miền Nam',1400],['Miền Bắc',1050],['Miền Trung',613]],province:[['TP. Hồ Chí Minh',1100],['Hà Nội',620],['Đà Nẵng',320],['Cần Thơ',210]],position:positions,tbhv:[['TBHV',650],['CVQL',210],['Khác',2203]]};const demoMap2={gender:genders,age:ages,education};const demoMap3={status:statuses,tenure};const actual=importedEmployees?importedEmployees.filter(p=>{const end=new Date(y,m,0,23,59,59,999);return p.join&&p.join<=end&&(!p.resign||p.resign>end)&&(document.getElementById('region').value==='All'||p.region===document.getElementById('region').value)&&(document.getElementById('position').value==='All'||p.position===document.getElementById('position').value)}):null;function grouped(field,fallback){if(!actual)return scaleData(fallback);const counts=new Map();actual.forEach(p=>{const k=String(p[field]||'Trống');counts.set(k,(counts.get(k)||0)+1)});return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8)}const a1=document.querySelector('input[name="a1"]:checked')?.value||'position';const a2=document.querySelector('input[name="a2"]:checked')?.value||'age';const a3=document.querySelector('input[name="a3"]:checked')?.value||'status';const fields={region:'region',province:'province',position:'position',tbhv:'position',gender:'status',age:'age',education:'status',status:'status',tenure:'join'};const map={...demoMap};const map2={...demoMap2};const map3={...demoMap3};let one=map[a1]||map.position,two=map2[a2]||map2.age,three=map3[a3]||map3.status;if(actual){if(a1==='region')one=grouped('region',one);else if(a1==='province')one=grouped('province',one);else if(a1==='position')one=grouped('position',one);else one=grouped('position',one);if(a2==='age')two=grouped('age',two);else if(a2==='gender')two=grouped('status',two);else two=grouped('status',two);if(a3==='status')three=grouped('status',three);else three=grouped('join',three)}else{one=scaleData(one);two=scaleData(two);three=scaleData(three)}drawBars('bars1',one);drawBars('bars2',two);drawBars('bars3',three)}
function renderHotspot(y,m,current){if(window.STAFFING_NATIVE_DATA)return;
 const holder=document.getElementById('hotspotRows'); if(!holder)return;
 const dimensionOrder=['region','province','position','tbhvName','cvName'];
 const activeDims=new Set([...document.querySelectorAll('#hotspotDimensionButtons .hotspot-chip.active')].map(b=>b.dataset.dim));
 const selectedDims=dimensionOrder.filter(dim=>activeDims.has(dim));
 if(!selectedDims.length)selectedDims.push('position');
 const dimNames={position:'Vị trí',region:'Miền',province:'Tỉnh',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2'};
 let groups=[];
 if(importedEmployees){
  const end=new Date(y,m,0,23,59,59,999),region=document.getElementById('region')?.value||'All',pos=document.getElementById('position')?.value||'All';
  const counts=new Map();
  importedEmployees.forEach(p=>{
   if(!p.join||p.join>end||(p.resign&&p.resign<=end))return;
   if(region!=='All'&&p.region!==region)return;if(pos!=='All'&&p.position!==pos)return;const l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';if(l1!=='All'&&p.tbhvName!==l1)return;if(l2!=='All'&&p.cvName!==l2)return;
   const label=selectedDims.map(dim=>String(p[dim]||'Trống').trim()||'Trống').join(' · ');
   counts.set(label,(counts.get(label)||0)+1);
  });groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
 }else{
  const sources={region:['Miền Nam','Miền Bắc','Miền Trung'],position:positions.map(x=>x[0]),province:['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ'],tbhvName:[...new Set(demoManagerMapping.map(x=>x.level1Name))],cvName:[...new Set(demoManagerMapping.map(x=>x.level2Name))]};
  if(selectedDims.length===1){const d=selectedDims[0],fallback={position:positions,region:[['Miền Nam',1400],['Miền Bắc',1050],['Miền Trung',613]],province:[['TP. Hồ Chí Minh',1100],['Hà Nội',620],['Đà Nẵng',320],['Cần Thơ',210]],tbhvName:[['Cao Phương Anh',0],['Nguyễn Thị Thu Hằng',0],['Nguyễn Thị Xuân Thảo',0]],cvName:[['Đỗ Thị Hà',0],['Hoàng Tiến Đạt',0],['Hồ Nghĩa Tuấn',0]]};const src=fallback[d]||positions;const base=src.reduce((a,x)=>a+x[1],0)||1;groups=src.map(([label,value])=>[label,Math.round(value*current/base)]).sort((a,b)=>b[1]-a[1]);}
  else {const first=selectedDims[0],second=selectedDims[1],a=sources[first]||['Khác'],b=sources[second]||['Khác'];groups=a.flatMap((x,i)=>b.slice(0,Math.min(3,b.length)).map((z,j)=>[`${x} · ${z}`,0])).slice(0,8);const totalWeight=groups.length||1;groups=groups.map((g,i)=>[g[0],i===0?current:0]);}
 }
 const toolbar=document.querySelector('.hotspot-card .placeholder-toolbar');if(toolbar)toolbar.innerHTML=`<span>${selectedDims.map(d=>dimNames[d]).join(' + ')}</span><span>HC kế hoạch</span><span>HC hiện tại</span><span>% thực đạt</span><span>Vacant</span>`;
 holder.innerHTML='';
 const visible=groups.slice(0,5);for(let i=0;i<Math.max(3,visible.length);i++){const item=visible[i];const row=document.createElement('div');row.className='placeholder-row';const label=item?item[0]:'--',value=item?fmt(item[1]):'--';row.innerHTML=`<b title="${label.replace(/"/g,'&quot;')}">${label}</b><span>--</span><span>${value}</span><span>--</span><span>--</span>`;holder.appendChild(row)}
 const total=importedEmployees?groups.reduce((a,x)=>a+x[1],0):current;
 document.getElementById('hotspotCurrent').textContent=groups.length?fmt(total):'--';
 const note=document.querySelector('.hotspot-card .placeholder-note');if(note)note.textContent=`Đang xem theo ${selectedDims.map(d=>dimNames[d]).join(' + ')}. HC kế hoạch, % thực đạt và Vacant hiển thị -- do chưa có dữ liệu kế hoạch.`;
}
function renderQuitComposition(){if(window.STAFFING_NATIVE_DATA)return;
 const holder=document.getElementById('quitCompositionBars');if(!holder)return;
 const dim=document.getElementById('quitCompositionDimension')?.value||'region';
 const {y,m,d}=selectedData();const monthFilter=Number(document.getElementById('month')?.value||0);
 const start=monthFilter===0?new Date(y,0,1):new Date(y,m-1,1);
 const end=new Date(y,m,0,23,59,59,999);
 const labels={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',gender:'Giới tính',age:'Nhóm tuổi',education:'Học vấn',tenure:'Thâm niên',status:'Trạng thái NV'};
 const category=p=>{
  if(dim==='region')return p.region||'Trống';
  if(dim==='province')return p.province||'Trống';
  if(dim==='position')return p.position||'Trống';
  if(dim==='tbhvName')return p.tbhvName||'Trống';
  if(dim==='cvName')return p.cvName||'Trống';
  if(dim==='gender')return p.gender||'Chưa cập nhật';
  if(dim==='age'){const raw=String(p.age||'Chưa cập nhật').trim();const n=Number(raw);if(raw!=='Chưa cập nhật'&&Number.isFinite(n)&&n>0)return n<25?'Dưới 25 tuổi':n<35?'25–34 tuổi':n<45?'35–44 tuổi':'Từ 45 tuổi';return raw;} 
  if(dim==='education')return p.education||'Chưa cập nhật';
  if(dim==='status')return p.status||'Chưa cập nhật';
  const years=p.join&&p.resign?Math.max(0,(p.resign-p.join)/(365.25*86400000)):0;
  return years<1?'Dưới 1 năm':years<3?'1– dưới 3 năm':years<5?'3– dưới 5 năm':'Từ 5 năm trở lên';
 };
 let groups=[];
 if(importedEmployees){
  const counts=new Map();
  importedEmployees.forEach(p=>{
   if(!p.resign||p.resign<start||p.resign>end)return;
   const region=document.getElementById('region')?.value||'All',pos=document.getElementById('position')?.value||'All',l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';
   if(region!=='All'&&p.region!==region)return;if(pos!=='All'&&p.position!==pos)return;if(l1!=='All'&&p.tbhvName!==l1)return;if(l2!=='All'&&p.cvName!==l2)return;
   const label=String(category(p)||'Chưa cập nhật').trim()||'Chưa cập nhật';counts.set(label,(counts.get(label)||0)+1);
  });groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
 }else{
  const total=monthFilter===0?(d.quitCount||[]).slice(0,m).reduce((a,v)=>a+Number(v||0),0):Number((d.quitCount||[])[m-1]||0);
  const presets={
   region:[['Miền Nam',.46],['Miền Bắc',.32],['Miền Trung',.22]],
   province:[['TP. Hồ Chí Minh',.34],['Hà Nội',.22],['Đồng Nai',.13],['Bình Dương',.11],['Đà Nẵng',.09],['Cần Thơ',.06],['Khác',.05]],
   position:[['NVBH',.42],['NVHT',.25],['CHT-S',.17],['CVQL',.10],['Khác',.06]],
   tbhvName:[['Nguyễn Thị Thu Hằng',.30],['Cao Phương Anh',.26],['Nguyễn Thị Xuân Thảo',.24],['Khác',.20]],
   cvName:[['Đỗ Thị Hà',.28],['Hoàng Tiến Đạt',.25],['Hồ Nghĩa Tuấn',.22],['Khác',.25]],
   gender:[['Nam',.57],['Nữ',.41],['Chưa cập nhật',.02]],
   age:[['Dưới 25 tuổi',.18],['25–34 tuổi',.43],['35–44 tuổi',.29],['Từ 45 tuổi',.10]],
   education:[['THPT',.44],['Cao đẳng',.27],['Đại học',.22],['Trung cấp',.07]],
   tenure:[['Dưới 1 năm',.28],['1– dưới 3 năm',.34],['3– dưới 5 năm',.23],['Từ 5 năm trở lên',.15]],
   status:[['Đã nghỉ việc',.84],['Không hoạt động',.10],['Khác / chưa cập nhật',.06]]
  };
  groups=(presets[dim]||presets.region).map(([label,share])=>[label,Math.round(total*share)]);
  if(groups.length){const diff=total-groups.reduce((a,x)=>a+x[1],0);groups[0][1]+=diff;}
 }
 // Always rank categories from the highest count to the lowest, for both demo and imported Excel data.
 groups.sort((a,b)=>Number(b[1]||0)-Number(a[1]||0));
 holder.innerHTML='';if(!groups.length){holder.innerHTML='<div class="placeholder-note">Không có dữ liệu nghỉ việc theo tiêu chí này trong kỳ đã chọn.</div>';}
 else{const max=Math.max(1,...groups.map(x=>x[1]));groups.forEach(([label,value])=>{const row=document.createElement('div');row.className='quit-composition-row';const safe=String(label).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');row.innerHTML=`<div class="quit-composition-label" title="${safe}">${safe}</div><div class="quit-composition-track"><div class="quit-composition-fill" style="width:${Math.max(value>0?2:0,Math.min(100,value/max*100))}%"></div><span class="quit-composition-value">${fmt(value)}</span></div>`;holder.appendChild(row);});}
 const note=document.getElementById('quitCompositionNote');if(note)note.textContent=`Theo ${labels[dim]} · ${monthFilter===0?`YTD ${y}`:`Tháng ${String(m).padStart(2,'0')}/${y}`} · ${importedEmployees?'Tính từ dữ liệu Excel đã nạp':'Dữ liệu demo'}.`;
}
function renderCurrentComposition(){if(window.STAFFING_NATIVE_DATA)return;
 const holder=document.getElementById('currentCompositionBars');if(!holder)return;
 const dim=document.getElementById('currentCompositionDimension')?.value||'region';
 const {y,m,d}=selectedData();const monthFilter=Number(document.getElementById('month')?.value||0);
 const end=new Date(y,m,0,23,59,59,999);
 const labels={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',gender:'Giới tính',age:'Nhóm tuổi',education:'Học vấn',tenure:'Thâm niên',status:'Trạng thái NV'};
 const category=p=>{
  if(dim==='region')return p.region||'Trống';if(dim==='province')return p.province||'Trống';if(dim==='position')return p.position||'Trống';if(dim==='tbhvName')return p.tbhvName||'Trống';if(dim==='cvName')return p.cvName||'Trống';
  if(dim==='gender')return p.gender||'Chưa cập nhật';
  if(dim==='age'){const raw=String(p.age||'Chưa cập nhật').trim();const n=Number(raw);if(raw!=='Chưa cập nhật'&&Number.isFinite(n)&&n>0)return n<25?'Dưới 25 tuổi':n<35?'25–34 tuổi':n<45?'35–44 tuổi':'Từ 45 tuổi';return raw;}
  if(dim==='education')return p.education||'Chưa cập nhật';
  if(dim==='status')return p.status||'Đang làm việc';
  const years=p.join?Math.max(0,(end-p.join)/(365.25*86400000)):0;return years<1?'Dưới 1 năm':years<3?'1– dưới 3 năm':years<5?'3– dưới 5 năm':'Từ 5 năm trở lên';
 };
 let groups=[];
 if(importedEmployees){
  const counts=new Map();const region=document.getElementById('region')?.value||'All',pos=document.getElementById('position')?.value||'All',l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';
  importedEmployees.forEach(p=>{if(!p.join||p.join>end||(p.resign&&p.resign<=end))return;if(region!=='All'&&p.region!==region)return;if(pos!=='All'&&p.position!==pos)return;if(l1!=='All'&&p.tbhvName!==l1)return;if(l2!=='All'&&p.cvName!==l2)return;const label=String(category(p)||'Chưa cập nhật').trim()||'Chưa cập nhật';counts.set(label,(counts.get(label)||0)+1);});
  groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
 }else{
  const total=Number(d.hc[m-1]||0);
  const presets={
   region:[['Miền Nam',.46],['Miền Bắc',.34],['Miền Trung',.20]],
   province:[['TP. Hồ Chí Minh',.36],['Hà Nội',.21],['Đồng Nai',.12],['Bình Dương',.11],['Đà Nẵng',.08],['Cần Thơ',.06],['Khác',.06]],
   position:[['NVBH',.42],['NVHT',.25],['CHT-S',.17],['CVQL',.10],['Khác',.06]],
   tbhvName:[['Nguyễn Thị Thu Hằng',.30],['Cao Phương Anh',.27],['Nguyễn Thị Xuân Thảo',.25],['Khác',.18]],
   cvName:[['Đỗ Thị Hà',.28],['Hoàng Tiến Đạt',.26],['Hồ Nghĩa Tuấn',.24],['Khác',.22]],
   gender:[['Nam',.58],['Nữ',.41],['Chưa cập nhật',.01]],
   age:[['Dưới 25 tuổi',.18],['25–34 tuổi',.43],['35–44 tuổi',.29],['Từ 45 tuổi',.10]],
   education:[['THPT',.44],['Cao đẳng',.27],['Đại học',.22],['Trung cấp',.07]],
   tenure:[['Dưới 1 năm',.22],['1– dưới 3 năm',.35],['3– dưới 5 năm',.25],['Từ 5 năm trở lên',.18]],
   status:[['Đang làm việc',.94],['Thử việc',.04],['Nghỉ thai sản',.02]]
  };
  groups=(presets[dim]||presets.region).map(([label,share])=>[label,Math.round(total*share)]);if(groups.length)groups[0][1]+=total-groups.reduce((a,x)=>a+x[1],0);
 }
 groups.sort((a,b)=>Number(b[1]||0)-Number(a[1]||0));holder.innerHTML='';
 if(!groups.length){holder.innerHTML='<div class="placeholder-note">Không có nhân sự đang làm việc theo tiêu chí này trong kỳ đã chọn.</div>';}
 else{const max=Math.max(1,...groups.map(x=>x[1]));groups.forEach(([label,value])=>{const row=document.createElement('div');row.className='quit-composition-row';const safe=String(label).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');row.innerHTML=`<div class="quit-composition-label" title="${safe}">${safe}</div><div class="quit-composition-track"><div class="quit-composition-fill" style="width:${Math.max(value>0?2:0,Math.min(100,value/max*100))}%"></div><span class="quit-composition-value">${fmt(value)}</span></div>`;holder.appendChild(row);});}
 const note=document.getElementById('currentCompositionNote');if(note)note.textContent=`Theo ${labels[dim]} · ${monthFilter===0?`Nhân sự hiện tại đến tháng ${String(m).padStart(2,'0')}/${y}`:`Tháng ${String(m).padStart(2,'0')}/${y}`} · ${importedEmployees?'Tính từ nhân viên đang làm việc trong dữ liệu Excel đã nạp':'Dữ liệu demo'}.`;
}
function getWorkforceDims(){
 const order=['region','province','position','tbhvName','cvName','age','status'];
 const active=[...document.querySelectorAll('#workforceDimensionButtons .hotspot-chip.active')].map(b=>b.dataset.dim);
 return order.filter(d=>active.includes(d)).length?order.filter(d=>active.includes(d)):['region'];
}
function syncWorkforceTableColumns(dims){
 const names={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',age:'Nhóm tuổi',status:'Trạng thái NV'};
 const header=document.getElementById('workforceTableHeaders');
 if(header)header.innerHTML=[...dims.map(d=>`<th>${names[d]}</th>`),'<th>HC Tháng trước</th>','<th>HC Mới</th>','<th>Tỷ lệ Tuyển mới</th>','<th class="pink">HC Nghỉ</th>','<th class="pink">Tỷ lệ Nghỉ việc</th>','<th>Biến động Mới - Nghỉ</th>','<th>HC Hiện tại</th>'].join('');
 const footer=document.getElementById('workforceTableTotals');
 if(footer)footer.innerHTML=`<td colspan="${dims.length}">Total</td><td class="num" id="totalPrev">0</td><td class="num" id="totalNew">0</td><td class="num" id="totalHireRate">0.0%</td><td class="num" id="totalQuit">0</td><td class="num" id="totalQuitRate">0.0%</td><td class="num" id="totalMovement">0</td><td class="num" id="totalCurrent">0</td>`;
}
function renderTableLegacy(){if(window.STAFFING_NATIVE_DATA)return;const {y,m,d}=selectedData();if(importedEmployees){renderImportedTable(y,m,d);drawTrend();drawQuitTrend();renderQuitComposition();renderCurrentComposition();renderResignationReasons();return;}
 const region=document.getElementById('region').value,pos=document.getElementById('position').value;
 const dims=getWorkforceDims(),dimNames={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2'};
 const provinces=['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ'];
 const body=document.getElementById('detailRows');body.innerHTML='';
 const grouped=new Map();
 rows.filter(r=>(region==='All'||r[0]===region)&&(pos==='All'||r[1]===pos)).forEach((r,i)=>{
  const manager=demoManagerMapping[i%demoManagerMapping.length];
  const person={region:r[0],province:provinces[(i*3+1)%provinces.length],position:r[1],tbhvName:manager.level1Name,cvName:manager.level2Name,age:r[2],status:r[3]};
  const key=dims.map(dim=>person[dim]||'Trống').join(' | ');
  if(!grouped.has(key))grouped.set(key,{person,base:0,newc:0,quit:0,current:0});
  const g=grouped.get(key);g.base+=Number(r[4])||0;g.newc+=Number(r[5])||0;g.quit+=Number(r[7])||0;g.current+=Number(r[10])||0;
 });
 const groups=[...grouped.values()].sort((a,b)=>b.current-a.current);
 groups.forEach(g=>{const p=g.person;const shown=d=>dims.includes(d)?(p[d]||'Trống'):'—';const rate=g.base?g.newc/g.base*100:0,quitRate=g.base?g.quit/g.base*100:0;const vals=[shown('region'),shown('position'),shown('tbhvName'),shown('cvName'),dims.includes('province')?p.province:'—','—',g.base,g.newc,pct(rate),g.quit,pct(quitRate),g.newc-g.quit,g.current];const tr=document.createElement('tr');vals.forEach((v,i)=>{const td=document.createElement('td');td.textContent=(i===6||i===7||i===9||i===11||i===12)?fmt(v):v;if(i>=4)td.className='num';tr.appendChild(td)});body.appendChild(tr)});
 document.getElementById('rowCount').textContent=`Dữ liệu minh họa · Phân tích theo ${dims.map(d=>dimNames[d]).join(' + ')} · ${groups.length} nhóm`;
 const idx=m-1,prev=idx>0?d.hc[idx-1]:(y===2026?2520:1800),cur=Number(d.hc[idx]||0),newc=d.new[idx],quit=d.quitCount[idx];
 document.getElementById('kpiPrev').textContent='--';document.getElementById('kpiCurrent').textContent=fmt(cur);document.getElementById('kpiHire').textContent='--';document.getElementById('kpiVacant').innerHTML='-- <em>HC</em>';document.getElementById('kpiVacantPct').textContent='--';renderHotspot(y,m,cur);
 const monthFilter=+document.getElementById('month').value,isYtd=monthFilter===0,movementEnd=m,monthNew=isYtd?(d.new||[]).slice(0,movementEnd).reduce((a,v)=>a+Number(v||0),0):Number((d.new||[])[m-1]||0),monthQuit=isYtd?(d.quitCount||[]).slice(0,movementEnd).reduce((a,v)=>a+Number(v||0),0):Number((d.quitCount||[])[m-1]||0),monthNet=monthNew-monthQuit;
 document.getElementById('movementTitle').textContent=isYtd?`BIẾN ĐỘNG NHÂN SỰ (YTD ${y})`:`BIẾN ĐỘNG NHÂN SỰ (THÁNG ${String(m).padStart(2,'0')}/${y})`;document.getElementById('movementHire').textContent=fmt(monthNew);document.getElementById('kpiQuit').textContent=fmt(monthQuit);document.getElementById('movementNet').textContent=(monthNet<0?'−':'')+fmt(Math.abs(monthNet));document.getElementById('totalPrev').textContent=fmt(prev);document.getElementById('totalNew').textContent=fmt(newc);document.getElementById('totalHireRate').textContent=pct(d.hire[idx]);document.getElementById('totalQuit').textContent=fmt(quit);document.getElementById('totalQuitRate').textContent=pct(d.quit[idx]);document.getElementById('totalMovement').textContent=fmt(newc-quit);document.getElementById('totalCurrent').textContent=fmt(cur);drawTrend();drawQuitTrend();renderQuitComposition();renderCurrentComposition()}

const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
function findCol(headers, aliases){for(const a of aliases){const idx=headers.findIndex(h=>norm(h)===norm(a));if(idx>=0)return idx}return -1}
function parseExcelDate(v){if(v instanceof Date&&!isNaN(v))return v;if(typeof v==='number'&&window.XLSX){const d=XLSX.SSF.parse_date_code(v);if(d)return new Date(d.y,d.m-1,d.d)}if(!v)return null;const s=String(v).trim();let m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);const d=new Date(s);return isNaN(d)?null:d}
function aggregateImported(year,month){const monthEnd=new Date(year,month,0,23,59,59,999),monthStart=new Date(year,month-1,1),prevEnd=new Date(year,month-1,0,23,59,59,999);const people=importedEmployees;const hired=people.filter(p=>p.join&&p.join>=monthStart&&p.join<=monthEnd);const quit=people.filter(p=>p.resign&&p.resign>=monthStart&&p.resign<=monthEnd);const hcAt=date=>people.filter(p=>p.join&&p.join<=date&&(!p.resign||p.resign>date)).length;const hc=[] ,newArr=[],quitArr=[],hireArr=[],quitRateArr=[];for(let i=1;i<=12;i++){const end=new Date(year,i,0,23,59,59,999),start=new Date(year,i-1,1),before=new Date(year,i-1,0,23,59,59,999);const h=people.filter(p=>p.join&&p.join>=start&&p.join<=end).length,q=people.filter(p=>p.resign&&p.resign>=start&&p.resign<=end).length,base=hcAt(before);hc.push(hcAt(end));newArr.push(h);quitArr.push(q);hireArr.push(base?h/base*100:0);quitRateArr.push(base?q/base*100:0)}return {hc,new:newArr,quitCount:quitArr,hire:hireArr,quit:quitRateArr,prev:hcAt(prevEnd),current:hcAt(monthEnd),monthNew:hired.length,monthQuit:quit.length}}
function renderImportedTableLegacy(y,m,d){const end=new Date(y,m,0,23,59,59,999),start=new Date(y,m-1,1);const region=document.getElementById('region').value,pos=document.getElementById('position').value,l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';const dims=getWorkforceDims(),dimNames={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2'};const eligible=importedEmployees.filter(p=>p.join&&p.join<=end&&(!p.resign||p.resign>end));const groups=new Map();eligible.forEach(p=>{if((region!=='All'&&p.region!==region)||(pos!=='All'&&p.position!==pos)||(l1!=='All'&&p.tbhvName!==l1)||(l2!=='All'&&p.cvName!==l2))return;const key=dims.map(dim=>String(p[dim]||'Trống').trim()||'Trống').join('|');if(!groups.has(key))groups.set(key,{person:p,base:0,join:0,quit:0,current:0});const g=groups.get(key);g.current++;if(p.join&&p.join>=start&&p.join<=end)g.join++;});importedEmployees.forEach(p=>{if(p.resign&&p.resign>=start&&p.resign<=end&&(region==='All'||p.region===region)&&(pos==='All'||p.position===pos)&&(l1==='All'||p.tbhvName===l1)&&(l2==='All'||p.cvName===l2)){const key=dims.map(dim=>String(p[dim]||'Trống').trim()||'Trống').join('|');if(!groups.has(key))groups.set(key,{person:p,base:0,join:0,quit:0,current:0});groups.get(key).quit++}});const body=document.getElementById('detailRows');body.innerHTML='';let totals={join:0,quit:0,current:0};for(const g of [...groups.values()].sort((a,b)=>b.current-a.current)){const p=g.person;const shown=dim=>dims.includes(dim)?(p[dim]||'Trống'):'—';const vals=[shown('region'),shown('position'),shown('tbhvName'),shown('cvName'),dims.includes('province')?(p.province||'Trống'):'—','—','—',g.join,'—',g.quit,'—',g.join-g.quit,g.current];const tr=document.createElement('tr');vals.forEach((v,i)=>{const td=document.createElement('td');td.textContent=(i===7||i===9||i===11||i===12)?fmt(v):v;if(i>=4)td.className='num';tr.appendChild(td)});body.appendChild(tr);totals.join+=g.join;totals.quit+=g.quit;totals.current+=g.current}document.getElementById('rowCount').textContent=`Excel: ${importedFileName} · Phân tích theo ${dims.map(d=>dimNames[d]).join(' + ')} · ${groups.size.toLocaleString()} nhóm`;
 const base=d.prev??0;document.getElementById('rowCount').textContent=`Excel: ${importedFileName} · ${eligible.length.toLocaleString()} nhân viên đang làm tại cuối tháng`;document.getElementById('kpiPrev').textContent='--';document.getElementById('kpiCurrent').textContent=fmt(d.current);document.getElementById('kpiHire').textContent='--';document.getElementById('kpiVacant').innerHTML='-- <em>HC</em>';document.getElementById('kpiVacantPct').textContent='--';renderHotspot(y,m,d.current);const monthFilter=+document.getElementById('month').value;const isYtd=monthFilter===0;const movementEnd=m;const monthNew=isYtd?(d.new||[]).slice(0,movementEnd).reduce((a,v)=>a+Number(v||0),0):Number((d.new||[])[m-1]||0);const monthQuit=isYtd?(d.quitCount||[]).slice(0,movementEnd).reduce((a,v)=>a+Number(v||0),0):Number((d.quitCount||[])[m-1]||0);const monthNet=monthNew-monthQuit;document.getElementById('movementTitle').textContent=isYtd?`BIẾN ĐỘNG NHÂN SỰ (YTD ${y})`:`BIẾN ĐỘNG NHÂN SỰ (THÁNG ${String(m).padStart(2,'0')}/${y})`;document.getElementById('movementHire').textContent=fmt(monthNew);document.getElementById('kpiQuit').textContent=fmt(monthQuit);document.getElementById('movementNet').textContent=(monthNet<0?'−':'')+fmt(Math.abs(monthNet));document.getElementById('totalPrev').textContent=fmt(base);document.getElementById('totalNew').textContent=fmt(d.monthNew);document.getElementById('totalHireRate').textContent=pct(d.hire[m-1]||0);document.getElementById('totalQuit').textContent=fmt(d.monthQuit);document.getElementById('totalQuitRate').textContent=pct(d.quit[m-1]||0);document.getElementById('totalMovement').textContent=fmt(d.monthNew-d.monthQuit);document.getElementById('totalCurrent').textContent=fmt(d.current);document.getElementById('dataMode').textContent='ĐÃ NẠP EXCEL · tính trên trình duyệt';}
async function loadExcel(file){try{if(!window.XLSX)throw new Error('Không tải được bộ đọc Excel. Hãy kiểm tra kết nối Internet rồi mở lại file.');const ab=await file.arrayBuffer();const wb=XLSX.read(ab,{type:'array',cellDates:true});const sheet=wb.Sheets[wb.SheetNames[0]];const data=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true});if(!data.length)throw new Error('Sheet đầu tiên không có dữ liệu.');const headers=Object.keys(data[0]);const cols={id:findCol(headers,['Employee Code (Company)','Employee Code','Employee ID','employeeNumber','Ma nhan vien','Employee Code (Client)']),join:findCol(headers,['Join Date (Company)','Join Date','Hiring Date','Date of Join','date_of_join','Company Join Date']),resign:findCol(headers,['Resign Date','Resignation Date','Date of Leaving','date_of_leaving','Leaving Date']),region:findCol(headers,['Region','Mien','Area']),province:findCol(headers,['Province','Tinh']),position:findCol(headers,['Position','Job Title','Chuc vu','Vi tri']),age:findCol(headers,['Age Group','Nhom tuoi','Age']),gender:findCol(headers,['Gender','Sex','Gioi tinh']),education:findCol(headers,['Education','Education Level','Trinh do hoc van','Hoc van']),status:findCol(headers,['Employee Status','Working Status','Status','working_status']),tbhvName:findCol(headers,['TBHV Name','TBHV_Name','Tên TBHV','TBHV']),cvName:findCol(headers,['CV Name','CV_Name','Tên CV','CVQL Name']),resignReason:findCol(headers,['Resign Reason','Resignation Reason','Reason for Leaving','Leaving Reason','Quit Reason','Lý do nghỉ việc','Lý do nghỉ','Ly do nghi viec','Ly do nghi'])};if(cols.join<0||cols.resign<0||cols.id<0)throw new Error('Không nhận diện được cột bắt buộc. Cần có Employee Code, Join Date và Resign Date (có thể để trống nếu còn làm).');const seen=new Set();importedEmployees=data.map(r=>({id:String(r[headers[cols.id]]??'').trim(),join:parseExcelDate(r[headers[cols.join]]),resign:parseExcelDate(r[headers[cols.resign]]),region:cols.region>=0?String(r[headers[cols.region]]||'Trống').trim():'Trống',province:cols.province>=0?String(r[headers[cols.province]]||'Trống').trim():'Trống',position:cols.position>=0?String(r[headers[cols.position]]||'Trống').trim():'Trống',age:cols.age>=0?String(r[headers[cols.age]]||'Chưa cập nhật').trim():'Chưa cập nhật',gender:cols.gender>=0?String(r[headers[cols.gender]]||'Chưa cập nhật').trim():'Chưa cập nhật',education:cols.education>=0?String(r[headers[cols.education]]||'Chưa cập nhật').trim():'Chưa cập nhật',status:cols.status>=0?String(r[headers[cols.status]]||'Chưa cập nhật').trim():'Chưa cập nhật',tbhvName:cols.tbhvName>=0?String(r[headers[cols.tbhvName]]||'—').trim():'—',cvName:cols.cvName>=0?String(r[headers[cols.cvName]]||'—').trim():'—',resignReason:cols.resignReason>=0?String(r[headers[cols.resignReason]]||'Chưa cập nhật').trim():'Chưa cập nhật'})).filter(p=>p.id&&p.join).filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true});if(!importedEmployees.length)throw new Error('Không tìm thấy nhân viên hợp lệ sau khi đọc file.');importedFileName=file.name;document.getElementById('importStatus').textContent=`Đã nạp ${importedEmployees.length.toLocaleString()} nhân viên từ ${file.name}. Dữ liệu chỉ xử lý trong trình duyệt. TBHV Name = Quản lý Cấp 1; CV Name = Quản lý Cấp 2.`;document.querySelector('#year').value=String(new Date().getFullYear());if(!demo[+document.querySelector('#year').value])document.querySelector('#year').value='2026';document.querySelector('#month').value=String(Math.min(new Date().getMonth()+1,maxMonthForYear(+document.querySelector('#year').value)));syncMonthOptions();const regionSel=document.getElementById('region');regionSel.innerHTML='<option value="All">All</option>'+[...new Set(importedEmployees.map(p=>p.region).filter(Boolean))].map(v=>`<option>${v}</option>`).join('');const posSel=document.getElementById('position');posSel.innerHTML='<option value="All">All</option>'+[...new Set(importedEmployees.map(p=>p.position).filter(Boolean))].map(v=>`<option>${v}</option>`).join('');const l1Sel=document.getElementById('tbhv');l1Sel.innerHTML='<option value="All">All</option>'+[...new Set(importedEmployees.map(p=>p.tbhvName).filter(v=>v&&v!=='—'))].map(v=>`<option>${v}</option>`).join('');const l2Sel=document.getElementById('cvql');l2Sel.innerHTML='<option value="All">All</option>'+[...new Set(importedEmployees.map(p=>p.cvName).filter(v=>v&&v!=='—'))].map(v=>`<option>${v}</option>`).join('');renderTable()}catch(e){document.getElementById('importStatus').textContent='Lỗi: '+e.message;alert('Chưa nạp được Excel: '+e.message)}}
// v23: keep workforce rows, totals, and selected parameter dimensions consistent.
function workforceAllocate(total, weights){
 const n=weights.length;if(!n)return[];let w=weights.map(v=>Math.max(0,Number(v)||0));if(w.reduce((a,b)=>a+b,0)===0)w=w.map(()=>1);const sum=w.reduce((a,b)=>a+b,0);const exact=w.map(v=>Number(total||0)*v/sum);const out=exact.map(Math.floor);let left=Math.max(0,Math.round(Number(total||0))-out.reduce((a,b)=>a+b,0));const order=exact.map((v,i)=>({i,frac:v-out[i]})).sort((a,b)=>b.frac-a.frac);for(let i=0;i<left;i++)out[order[i%order.length].i]++;return out;
}
function renderTable(){if(window.STAFFING_NATIVE_DATA)return;
 const {y,m,d}=selectedData();
 if(importedEmployees){renderImportedTable(y,m,d);drawTrend();drawQuitTrend();renderQuitComposition();renderCurrentComposition();renderResignationReasons();return;}
 const region=document.getElementById('region').value,pos=document.getElementById('position').value,l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';
 const dims=getWorkforceDims(),dimNames={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',age:'Nhóm tuổi',status:'Trạng thái NV'};syncWorkforceTableColumns(dims);
 const provinces=['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ'];
 const idx=m-1,prev=idx>0?Number(d.hc[idx-1]||0):(y===2026?2520:1800),newTotal=Number(d.new[idx]||0),quitTotal=Number(d.quitCount[idx]||0),currentTotal=Number(d.hc[idx]||0);
 const allRows=rows.map((r,i)=>{const manager=demoManagerMapping[i%demoManagerMapping.length];return {row:r,person:{region:r[0],province:provinces[(i*3+1)%provinces.length],position:r[1],tbhvName:manager.level1Name,cvName:manager.level2Name,age:r[2],status:r[3]}}});
 const scaleMetric=(total,index)=>workforceAllocate(total,allRows.map(x=>Number(x.row[index])||0));
 const bases=scaleMetric(prev,4),news=scaleMetric(newTotal,5),quits=scaleMetric(quitTotal,7),currents=scaleMetric(currentTotal,10);
 const eligible=allRows.map((x,i)=>({...x,base:bases[i]||0,newc:news[i]||0,quit:quits[i]||0,current:currents[i]||0})).filter(x=>(region==='All'||x.person.region===region)&&(pos==='All'||x.person.position===pos)&&(l1==='All'||x.person.tbhvName===l1)&&(l2==='All'||x.person.cvName===l2));
 const grouped=new Map();eligible.forEach(x=>{const p=x.person,key=dims.map(dim=>String(p[dim]||'Trống').trim()||'Trống').join('|');if(!grouped.has(key))grouped.set(key,{person:p,base:0,newc:0,quit:0,current:0});const g=grouped.get(key);g.base+=x.base;g.newc+=x.newc;g.quit+=x.quit;g.current+=x.current;});
 const groups=[...grouped.values()].sort((a,b)=>b.current-a.current),body=document.getElementById('detailRows');body.innerHTML='';
 groups.forEach(g=>{const p=g.person,dimValue=dim=>String(p[dim]??'').trim()||'Trống',rate=g.base?g.newc/g.base*100:0,quitRate=g.base?g.quit/g.base*100:0;const metrics=[g.base,g.newc,pct(rate),g.quit,pct(quitRate),g.newc-g.quit,g.current],vals=[...dims.map(dimValue),...metrics];const tr=document.createElement('tr');vals.forEach((v,i)=>{const td=document.createElement('td');const metricIndex=i-dims.length;td.textContent=(metricIndex===0||metricIndex===1||metricIndex===3||metricIndex===5||metricIndex===6)?fmt(v):v;if(i>=dims.length)td.className='num';tr.appendChild(td)});body.appendChild(tr)});
 document.getElementById('rowCount').textContent=`Dữ liệu minh họa · Phân tích theo ${dims.map(d=>dimNames[d]).join(' + ')} · ${groups.length} nhóm`;
 document.getElementById('kpiPrev').textContent='--';document.getElementById('kpiCurrent').textContent=fmt(currentTotal);document.getElementById('kpiHire').textContent='--';document.getElementById('kpiVacant').innerHTML='-- <em>HC</em>';document.getElementById('kpiVacantPct').textContent='--';renderHotspot(y,m,currentTotal);
 const monthFilter=+document.getElementById('month').value,isYtd=monthFilter===0,monthNew=isYtd?(d.new||[]).slice(0,m).reduce((a,v)=>a+Number(v||0),0):newTotal,monthQuit=isYtd?(d.quitCount||[]).slice(0,m).reduce((a,v)=>a+Number(v||0),0):quitTotal,monthNet=monthNew-monthQuit;
 document.getElementById('movementTitle').textContent=isYtd?`BIẾN ĐỘNG NHÂN SỰ (YTD ${y})`:`BIẾN ĐỘNG NHÂN SỰ (THÁNG ${String(m).padStart(2,'0')}/${y})`;document.getElementById('movementHire').textContent=fmt(monthNew);document.getElementById('kpiQuit').textContent=fmt(monthQuit);document.getElementById('movementNet').textContent=(monthNet<0?'−':'')+fmt(Math.abs(monthNet));
 const totals={base:groups.reduce((a,g)=>a+g.base,0),newc:groups.reduce((a,g)=>a+g.newc,0),quit:groups.reduce((a,g)=>a+g.quit,0),current:groups.reduce((a,g)=>a+g.current,0)};
 document.getElementById('totalPrev').textContent=fmt(totals.base);document.getElementById('totalNew').textContent=fmt(totals.newc);document.getElementById('totalHireRate').textContent=pct(totals.base?totals.newc/totals.base*100:0);document.getElementById('totalQuit').textContent=fmt(totals.quit);document.getElementById('totalQuitRate').textContent=pct(totals.base?totals.quit/totals.base*100:0);document.getElementById('totalMovement').textContent=fmt(totals.newc-totals.quit);document.getElementById('totalCurrent').textContent=fmt(totals.current);drawTrend();drawQuitTrend();renderQuitComposition();renderCurrentComposition();renderResignationReasons();
}
function renderImportedTable(y,m,d){
 const end=new Date(y,m,0,23,59,59,999),start=new Date(y,m-1,1),prevEnd=new Date(y,m-1,0,23,59,59,999);
 const region=document.getElementById('region').value,pos=document.getElementById('position').value,l1=document.getElementById('tbhv')?.value||'All',l2=document.getElementById('cvql')?.value||'All';
 const dims=getWorkforceDims(),dimNames={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',age:'Nhóm tuổi',status:'Trạng thái NV'};syncWorkforceTableColumns(dims);
 const matches=p=>(region==='All'||p.region===region)&&(pos==='All'||p.position===pos)&&(l1==='All'||p.tbhvName===l1)&&(l2==='All'||p.cvName===l2);
 const groups=new Map();function ensureGroup(p){const key=dims.map(dim=>String(p[dim]||'Trống').trim()||'Trống').join('|');if(!groups.has(key))groups.set(key,{person:p,base:0,newc:0,quit:0,current:0});return groups.get(key)}
 importedEmployees.forEach(p=>{if(!matches(p))return;const isCurrent=!!(p.join&&p.join<=end&&(!p.resign||p.resign>end)),isBase=!!(p.join&&p.join<=prevEnd&&(!p.resign||p.resign>prevEnd)),isNew=!!(p.join&&p.join>=start&&p.join<=end),isQuit=!!(p.resign&&p.resign>=start&&p.resign<=end);if(!isCurrent&&!isBase&&!isNew&&!isQuit)return;const g=ensureGroup(p);if(isBase)g.base++;if(isNew)g.newc++;if(isQuit)g.quit++;if(isCurrent)g.current++;});
 const body=document.getElementById('detailRows');body.innerHTML='';const list=[...groups.values()].sort((a,b)=>b.current-a.current);list.forEach(g=>{const p=g.person,dimValue=dim=>String(p[dim]??'').trim()||'Trống',hireRate=g.base?g.newc/g.base*100:0,quitRate=g.base?g.quit/g.base*100:0;const metrics=[g.base,g.newc,pct(hireRate),g.quit,pct(quitRate),g.newc-g.quit,g.current],vals=[...dims.map(dimValue),...metrics];const tr=document.createElement('tr');vals.forEach((v,i)=>{const td=document.createElement('td');const metricIndex=i-dims.length;td.textContent=(metricIndex===0||metricIndex===1||metricIndex===3||metricIndex===5||metricIndex===6)?fmt(v):v;if(i>=dims.length)td.className='num';tr.appendChild(td)});body.appendChild(tr)});
 const totals=list.reduce((a,g)=>({base:a.base+g.base,newc:a.newc+g.newc,quit:a.quit+g.quit,current:a.current+g.current}),{base:0,newc:0,quit:0,current:0});document.getElementById('rowCount').textContent=`Excel: ${importedFileName} · Phân tích theo ${dims.map(d=>dimNames[d]).join(' + ')} · ${list.length.toLocaleString()} nhóm`;
 document.getElementById('kpiPrev').textContent=fmt(totals.base);document.getElementById('kpiCurrent').textContent=fmt(totals.current);document.getElementById('kpiHire').textContent=fmt(totals.newc);document.getElementById('kpiVacant').innerHTML='-- <em>HC</em>';document.getElementById('kpiVacantPct').textContent='--';renderHotspot(y,m,totals.current);
 const monthFilter=+document.getElementById('month').value,isYtd=monthFilter===0,monthNew=isYtd?importedEmployees.filter(p=>matches(p)&&p.join&&p.join>=new Date(y,0,1)&&p.join<=end).length:totals.newc,monthQuit=isYtd?importedEmployees.filter(p=>matches(p)&&p.resign&&p.resign>=new Date(y,0,1)&&p.resign<=end).length:totals.quit,monthNet=monthNew-monthQuit;
 document.getElementById('movementTitle').textContent=isYtd?`BIẾN ĐỘNG NHÂN SỰ (YTD ${y})`:`BIẾN ĐỘNG NHÂN SỰ (THÁNG ${String(m).padStart(2,'0')}/${y})`;document.getElementById('movementHire').textContent=fmt(monthNew);document.getElementById('kpiQuit').textContent=fmt(monthQuit);document.getElementById('movementNet').textContent=(monthNet<0?'−':'')+fmt(Math.abs(monthNet));
 document.getElementById('totalPrev').textContent=fmt(totals.base);document.getElementById('totalNew').textContent=fmt(totals.newc);document.getElementById('totalHireRate').textContent=pct(totals.base?totals.newc/totals.base*100:0);document.getElementById('totalQuit').textContent=fmt(totals.quit);document.getElementById('totalQuitRate').textContent=pct(totals.base?totals.quit/totals.base*100:0);document.getElementById('totalMovement').textContent=fmt(totals.newc-totals.quit);document.getElementById('totalCurrent').textContent=fmt(totals.current);document.getElementById('dataMode').textContent='ĐÃ NẠP EXCEL · tính trên trình duyệt';
}


// Resignation reason pivot. Uses actual employee records when loaded; demo is explicitly illustrative.
let resignationDimension='region';
function renderResignationReasons(){if(window.STAFFING_NATIVE_DATA)return;
 const rows=document.getElementById('resignationReasonRows');if(!rows)return;
 const {y,m,d}=selectedData();const monthSelection=Number(document.getElementById('month')?.value||0);
 const start=monthSelection===0?new Date(y,0,1):new Date(y,m-1,1);
 const end=new Date(y,m,0,23,59,59,999);
 document.getElementById('resignationPeriod').textContent=monthSelection===0?`${y} (YTD đến T${String(m).padStart(2,'0')})`:`${y}${String(m).padStart(2,'0')}`;
 document.getElementById('resignationDimHeader').textContent={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',gender:'Giới tính',age:'Nhóm tuổi',education:'Học vấn',tenure:'Thâm niên',status:'Trạng thái NV'}[resignationDimension]||'Miền';
 const counts=new Map();let total=0;
 function put(group,reason,count){if(!counts.has(group))counts.set(group,new Map());const item=counts.get(group);item.set(reason,(item.get(reason)||0)+count);total+=count;}
 if(importedEmployees){
  const filterIds=[['region','region'],['province','province'],['position','position'],['tbhv','tbhvName'],['cvql','cvName']];
  importedEmployees.forEach(p=>{
   if(!p.resign||p.resign<start||p.resign>end)return;
   if(filterIds.some(([id,key])=>{const val=document.getElementById(id)?.value||'All';return val!=='All'&&p[key]!==val;}))return;
   let group='Chưa cập nhật';
   if(resignationDimension==='age'){
    const v=String(p.age||'').trim(),n=Number(v);
    group=v&&Number.isFinite(n)&&n>0?(n<25?'Dưới 25 tuổi':n<35?'25–34 tuổi':n<45?'35–44 tuổi':'Từ 45 tuổi'):(v||'Chưa cập nhật');
   }else if(resignationDimension==='tenure'){
    const years=p.join?Math.max(0,(p.resign-p.join)/(365.25*86400000)):null;
    group=years===null?'Chưa cập nhật':years<1?'Dưới 1 năm':years<3?'1– dưới 3 năm':years<5?'3– dưới 5 năm':'Từ 5 năm trở lên';
   }else{
    group=String(p[resignationDimension]||'Chưa cập nhật').trim()||'Chưa cập nhật';
   }
   put(group,p.resignReason||'Chưa cập nhật',1);
  });
 }else{
  const count=monthSelection===0?(d.quitCount||[]).slice(0,m).reduce((a,x)=>a+Number(x||0),0):Number((d.quitCount||[])[m-1]||0);
  const groups={
   region:['Miền Nam','Miền Bắc','Miền Trung'],
   province:['TP. Hồ Chí Minh','Hà Nội','Đồng Nai','Bình Dương','Đà Nẵng','Cần Thơ','Khác'],
   position:['NVBH','NVHT','CHT-S','CVQL','Khác'],
   tbhvName:['Nguyễn Thị Thu Hằng','Cao Phương Anh','Nguyễn Thị Xuân Thảo','Khác'],
   cvName:['Đỗ Thị Hà','Hoàng Tiến Đạt','Hồ Nghĩa Tuấn','Khác'],
   gender:['Nam','Nữ','Chưa cập nhật'],
   age:['Dưới 25 tuổi','25–34 tuổi','35–44 tuổi','Từ 45 tuổi'],
   education:['THPT','Cao đẳng','Đại học','Trung cấp'],
   tenure:['Dưới 1 năm','1– dưới 3 năm','3– dưới 5 năm','Từ 5 năm trở lên'],
   status:['Đã nghỉ việc']
  }[resignationDimension]||['Chưa cập nhật'];
  const weights=groups.map((_,i)=>groups.length-i),sum=weights.reduce((a,b)=>a+b,0);let left=count;
  groups.forEach((g,i)=>{const v=i===groups.length-1?left:Math.round(count*weights[i]/sum);left-=v;if(v>0)put(g,'Chưa cập nhật',v);});
 }
 const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const pct=v=>total?(v/total*100).toFixed(2)+'%':'0.00%';
 let html=`<tr class="resignation-total"><td colspan="2">Total</td><td>${fmt(total)}</td><td>${pct(total)}</td></tr>`;
 [...counts.entries()].sort((a,b)=>[...b[1].values()].reduce((s,n)=>s+n,0)-[...a[1].values()].reduce((s,n)=>s+n,0)).forEach(([group,reasons])=>{
  const n=[...reasons.values()].reduce((a,b)=>a+b,0);
  [...reasons.entries()].sort((a,b)=>b[1]-a[1]).forEach(([reason,value])=>{html+=`<tr class="resignation-detail"><td>${esc(group)}</td><td>${esc(reason)}</td><td>${fmt(value)}</td><td>${pct(value)}</td></tr>`;});
 });
 if(!total)html='<tr><td colspan="4" style="text-align:center;padding:18px">Không có nhân viên nghỉ việc trong kỳ đã chọn.</td></tr>';
 rows.innerHTML=html;
 document.getElementById('resignationReasonNote').textContent=importedEmployees?'Nguồn: dữ liệu Excel · % tính trên tổng số nghỉ trong kỳ. Nếu thiếu cột lý do nghỉ, hiển thị “Chưa cập nhật”.':'Dữ liệu demo · Nhóm phân bổ minh họa; chưa có dữ liệu lý do nghỉ thực tế. % tính trên tổng số nghỉ trong kỳ.';
}
/* v146: one consistent scoped data engine for every Headcount visualization.
   The demo's published monthly totals stay unchanged. Synthetic dimension weights
   are illustrative because the demo has no employee-level monthly source. */
const hcFilterKeys = {region:'region',province:'province',position:'position',tbhv:'tbhvName',cvql:'cvName'};
const hcDimNames = {region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',age:'Nhóm tuổi',status:'Trạng thái NV',gender:'Giới tính',education:'Học vấn',tenure:'Thâm niên'};
const hcHtmlEsc = value => String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function hcFilters(){return Object.fromEntries(Object.entries(hcFilterKeys).map(([id,k])=>[k,document.getElementById(id)?.value||'All']));}
function hcMatches(person,filter=hcFilters()){
 return Object.entries(filter).every(([k,v])=>v==='All'||String(person[k]||'Trống')===v);
}
const hcDemoSegments=(()=>{
 const regions=[['Miền Nam',1400/3063,[['TP. Hồ Chí Minh',.75],['Cần Thơ',.25]]],['Miền Bắc',1050/3063,[['Hà Nội',1]]],['Miền Trung',613/3063,[['Đà Nẵng',1]]]];
 const jobCategories=positions.map(([name,n])=>[name,n/positions.reduce((s,x)=>s+x[1],0)]);
 const managers=[...new Map(demoManagerMapping.map(x=>[x.level1Name+'|'+x.level2Name,x])).values()];
 const managerWeights=[.25,.47,.28];
 const segments=[];
 regions.forEach(([region,rweight,provinces])=>provinces.forEach(([province,pweight])=>jobCategories.forEach(([position,jobWeight],j)=>managers.forEach((manager,k)=>{
  const idx=segments.length;
  segments.push({person:{region,province,position,tbhvName:manager.level1Name,cvName:manager.level2Name,age:ages[(j*2+k)%ages.length][0],status:statuses[(j+k)%4][0],gender:(j+k)%2?'Nữ':'Nam',education:education[(j+k)%4][0],tenure:tenure[(j+k)%4][0]},weight:rweight*pweight*jobWeight*managerWeights[k]});
 }))));
 return segments;
})();
/* MỤC TIÊU HC PLAN GIẢ LẬP theo tháng – không phải dữ liệu kế hoạch thực tế.
   Mỗi nhóm kế hoạch gồm HC đang làm + chỉ tiêu còn thiếu, tổng phân nhóm khớp tổng công ty. */
const hcDemoPlanRates={
  2026:[.965,.969,.974,.976,.978,.975,.979,.973,.982,.985,.982,.986],
  2025:[.968,.971,.973,.976,.974,.978,.979,.977,.981,.983,.984,.986]
};
const hcDemoPlanCache=new Map();
function hcDemoPlanAllocated(y,m){
 const key=`${y}/${m}`;
 if(hcDemoPlanCache.has(key))return hcDemoPlanCache.get(key);
 const actual=hcDemoAllocated(y,'hc',m),actualTotal=actual.reduce((a,n)=>a+n,0);
 const target=(hcDemoPlanRates[y]||hcDemoPlanRates[2026])[m-1]||.975;
 const targetPlan=actualTotal?Math.max(actualTotal,Math.round(actualTotal/target)):0;
 const vacant=targetPlan-actualTotal;
 const weighted=actual.map((n,i)=>{
  const p=hcDemoSegments[i].person;
  const regionPressure=p.region==='Miền Bắc'?1.09:p.region==='Miền Trung'?1.05:1;
  const jobPressure=p.position==='NVBH'?1.12:p.position==='CHT-S'?1.06:1;
  return n*regionPressure*jobPressure;
 });
 const vacancySplit=workforceAllocate(vacant,weighted);
 const result=actual.map((n,i)=>n+vacancySplit[i]);
 hcDemoPlanCache.set(key,result);
 return result;
}
const hcDemoCache=new Map();
function hcDemoAllocated(y,metric,month){
 const key=`${y}/${metric}/${month}`;
 if(!hcDemoCache.has(key)){
  const total=Number(demo[y][metric][month-1]||0);
  const targetByRegion=workforceAllocate(total,[1400,1050,613]);
  const result=Array(hcDemoSegments.length).fill(0);
  ['Miền Nam','Miền Bắc','Miền Trung'].forEach((region,r)=>{
   const indices=hcDemoSegments.map((seg,i)=>seg.person.region===region?i:-1).filter(i=>i>=0);
   const shares=workforceAllocate(targetByRegion[r],indices.map(i=>hcDemoSegments[i].weight));
   indices.forEach((idx,i)=>{result[idx]=shares[i];});
  });
  hcDemoCache.set(key,result);
 }
 return hcDemoCache.get(key);
}
function hcScopeRows(y,m){
 const filter=hcFilters();
 if(importedEmployees){
  const end=new Date(y,m,0,23,59,59,999),start=new Date(y,m-1,1),before=new Date(y,m-1,0,23,59,59,999),ystart=new Date(y,0,1);
  return importedEmployees.filter(p=>hcMatches(p,filter)).map(p=>{
   const joined=!!p.join;
   return {person:p,
     base:joined&&p.join<=before&&(!p.resign||p.resign>before)?1:0,
     newc:joined&&p.join>=start&&p.join<=end?1:0,
     quit:p.resign&&p.resign>=start&&p.resign<=end?1:0,
     current:joined&&p.join<=end&&(!p.resign||p.resign>end)?1:0,
     ytdNew:joined&&p.join>=ystart&&p.join<=end?1:0,
     ytdQuit:p.resign&&p.resign>=ystart&&p.resign<=end?1:0
   };
  }).filter(x=>x.base||x.newc||x.quit||x.current||x.ytdNew||x.ytdQuit);
 }
 const current=hcDemoAllocated(y,'hc',m),plan=hcDemoPlanAllocated(y,m),prev=m>1?hcDemoAllocated(y,'hc',m-1):workforceAllocate(y===2026?2520:1800,hcDemoSegments.map(x=>x.weight)),hire=hcDemoAllocated(y,'new',m),quit=hcDemoAllocated(y,'quitCount',m);
 const ytdNew=Array.from({length:m},(_,i)=>hcDemoAllocated(y,'new',i+1));
 const ytdQuit=Array.from({length:m},(_,i)=>hcDemoAllocated(y,'quitCount',i+1));
 return hcDemoSegments.map((seg,i)=>({person:seg.person,base:prev[i],newc:hire[i],quit:quit[i],current:current[i],plan:plan[i],ytdNew:ytdNew.reduce((s,x)=>s+x[i],0),ytdQuit:ytdQuit.reduce((s,x)=>s+x[i],0)})).filter(x=>hcMatches(x.person,filter));
}
function hcTotals(list){return list.reduce((out,r)=>{['base','newc','quit','current','plan','ytdNew','ytdQuit'].forEach(k=>out[k]+=(Number(r[k])||0));return out;},{base:0,newc:0,quit:0,current:0,plan:0,ytdNew:0,ytdQuit:0});}
function hcSelectedData(){
 const y=+document.getElementById('year').value;syncMonthOptions();const raw=+document.getElementById('month').value,m=raw||maxMonthForYear(y);
 const all=Object.values(hcFilters()).every(v=>v==='All');
 if(!importedEmployees&&all)return {y,m,d:{...demo[y],plan:demo[y].hc.map((_,i)=>hcDemoPlanAllocated(y,i+1).reduce((a,n)=>a+n,0))}};
 const monthly=Array.from({length:12},(_,i)=>hcTotals(hcScopeRows(y,i+1)));
 const hc=monthly.map(x=>x.current),newArr=monthly.map(x=>x.newc),quitCount=monthly.map(x=>x.quit);
 const hire=monthly.map(x=>x.base?x.newc/x.base*100:0),quit=monthly.map(x=>x.base?x.quit/x.base*100:0);
 return {y,m,d:{hc,new:newArr,quitCount,hire,quit,plan:importedEmployees?null:monthly.map(x=>x.plan),prev:monthly[m-1].base,current:monthly[m-1].current}};
}
function hcSyncCascadingOptions(changedId){
 const source=importedEmployees?importedEmployees:hcDemoSegments.map(x=>x.person);
 const values=hcFilters(),changedKey=hcFilterKeys[changedId];
 const provinceOptions=[...new Set(source.filter(x=>values.region==='All'||x.region===values.region).map(x=>String(x.province||'Trống')))].sort((a,b)=>a.localeCompare(b,'vi'));
 if(values.province!=='All'&&!provinceOptions.includes(values.province))values.province='All';
 // Manager levels are dependent, but parent menu stays independently selectable.
 if(changedKey==='tbhvName'&&values.tbhvName!=='All'){
  if(!source.some(x=>x.tbhvName===values.tbhvName&&(values.cvName==='All'||x.cvName===values.cvName)))values.cvName='All';
 }
 const optionsFor=(key)=>[...new Set(source.filter(x=>key==='province'?(values.region==='All'||x.region===values.region):key==='cvName'?(values.tbhvName==='All'||x.tbhvName===values.tbhvName):true).map(x=>String(x[key]||'Trống')))].sort((a,b)=>a.localeCompare(b,'vi'));
 Object.entries(hcFilterKeys).forEach(([id,key])=>{
  const element=document.getElementById(id);if(!element)return;
  const options=optionsFor(key),value=values[key];
  element.replaceChildren(new Option('Tất cả','All'),...options.map(v=>new Option(v,v)));
  element.value=options.includes(value)?value:'All';
  values[key]=element.value;
 });
}

function hcGroupRows(list,dimension,metric){
 const map=new Map();list.forEach(x=>{const label=String(x.person?.[dimension]||'Chưa cập nhật');map.set(label,(map.get(label)||0)+(Number(x[metric])||0));});
 return [...map.entries()].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
}
function hcRenderHotspot(){
 const {y,m}=hcSelectedData(),rows=hcScopeRows(y,m),totals=hcTotals(rows);
 const hasPlan=!importedEmployees;
 const dims=['region','province','position','tbhvName','cvName'].filter(k=>document.querySelector(`#hotspotDimensionButtons .hotspot-chip[data-dim="${k}"]`)?.classList.contains('active'));
 if(!dims.length)dims.push('region');
 const map=new Map();
 rows.forEach(x=>{
  const key=dims.map(k=>x.person[k]||'Chưa cập nhật').join(' · ');
  if(!map.has(key))map.set(key,{name:key,current:0,plan:0});
  const v=map.get(key);v.current+=Number(x.current)||0;v.plan+=Number(x.plan)||0;
 });
 const sorted=[...map.values()].filter(x=>x.current||x.plan).sort((a,b)=>b.current-a.current);
 const visible=sorted.slice(0,4);
 if(sorted.length>4)visible.push({name:'Nhóm khác',current:sorted.slice(4).reduce((n,x)=>n+x.current,0),plan:sorted.slice(4).reduce((n,x)=>n+x.plan,0)});
 const header=document.querySelector('.hotspot-card .placeholder-toolbar');
 if(header)header.innerHTML=`<span>${dims.map(k=>hcDimNames[k]).join(' + ')}</span><span>HC kế hoạch</span><span>HC hiện tại</span><span>% thực đạt</span><span>Vacant</span>`;
 const body=document.getElementById('hotspotRows');body.replaceChildren();
 if(!visible.length){const line=document.createElement('div');line.className='placeholder-row';line.innerHTML='<b>Không có dữ liệu</b><span>--</span><span>0</span><span>--</span><span>--</span>';body.appendChild(line);}
 visible.forEach(x=>{
  const plan=x.plan,current=x.current,vacant=Math.max(0,plan-current),ratio=plan?(current/plan*100).toFixed(1)+'%':'--';
  const line=document.createElement('div');line.className='placeholder-row';
  line.innerHTML=`<b title="${hcHtmlEsc(x.name)}">${hcHtmlEsc(x.name)}</b><span>${hasPlan?fmt(plan):'--'}</span><span>${fmt(current)}</span><span>${hasPlan?ratio:'--'}</span><span>${hasPlan?fmt(vacant):'--'}</span>`;
  body.appendChild(line);
 });
 const totalLine=document.querySelector('#pageHC .kpis > .hotspot-card .placeholder-row.total');
 if(totalLine)totalLine.innerHTML=`<b>Tổng</b><span>${hasPlan?fmt(totals.plan):'--'}</span><span id="hotspotCurrent">${fmt(totals.current)}</span><span>${hasPlan&&totals.plan?(totals.current/totals.plan*100).toFixed(1)+'%':'--'}</span><span>${hasPlan?fmt(Math.max(0,totals.plan-totals.current)):'--'}</span>`;
 const note=document.querySelector('.hotspot-card .placeholder-note');
 if(note)note.textContent=hasPlan?`Theo ${dims.map(k=>hcDimNames[k]).join(' + ')} · HC Plan giả lập theo tháng, cộng đúng tổng nhóm; Vacant = Plan − Thực tế.`:`Theo ${dims.map(k=>hcDimNames[k]).join(' + ')} · Excel chưa có nguồn HC Plan; không tự tạo kế hoạch.`;
}
function hcRenderComposition(type){
 const quit=type==='quit',id=quit?'quitComposition':'currentComposition',dim=document.getElementById(id+'Dimension')?.value||'region',holder=document.getElementById(id+'Bars');if(!holder)return;
 const {y,m}=hcSelectedData(),isYTD=+document.getElementById('month').value===0,rows=hcScopeRows(y,m),metric=quit?(isYTD?'ytdQuit':'quit'):'current';
 const list=hcGroupRows(rows,dim,metric);holder.replaceChildren();
 const max=Math.max(1,...list.map(x=>x[1]));
 if(!list.length)holder.innerHTML=`<div class="placeholder-note">Không có ${quit?'nhân sự nghỉ việc':'nhân sự hiện tại'} theo bộ lọc này.</div>`;
 list.forEach(([name,count])=>{
  const row=document.createElement('div');row.className='quit-composition-row';row.innerHTML=`<div class="quit-composition-label" title="${hcHtmlEsc(name)}">${hcHtmlEsc(name)}</div><div class="quit-composition-track"><div class="quit-composition-fill" style="width:${Math.max(count?2:0,100*count/max)}%"></div><span class="quit-composition-value">${fmt(count)}</span></div>`;holder.appendChild(row);
 });
 const note=document.getElementById(id+'Note');if(note)note.textContent=`Theo ${hcDimNames[dim]||dim} · ${quit?(isYTD?`YTD ${y}`:`Tháng ${String(m).padStart(2,'0')}/${y}`):`Đến tháng ${String(m).padStart(2,'0')}/${y}`} · ${importedEmployees?'Dữ liệu Excel':'Dữ liệu demo phân bổ minh họa'}.`;
}
function hcRenderReasons(){
 const body=document.getElementById('resignationReasonRows');if(!body)return;
 const {y,m}=hcSelectedData(),isYTD=+document.getElementById('month').value===0,metric=isYTD?'ytdQuit':'quit',list=hcScopeRows(y,m),dim=resignationDimension;
 document.getElementById('resignationPeriod').textContent=isYTD?`${y} (YTD đến T${String(m).padStart(2,'0')})`:`${y}${String(m).padStart(2,'0')}`;
 document.getElementById('resignationDimHeader').textContent=hcDimNames[dim]||dim;
 const groups=new Map();list.forEach(x=>{const value=Number(x[metric])||0;if(!value)return;const name=String(x.person[dim]||'Chưa cập nhật'),reason=importedEmployees?(x.person.resignReason||'Chưa cập nhật'):'Chưa cập nhật';const key=JSON.stringify([name,reason]);groups.set(key,(groups.get(key)||0)+value)});
 const total=[...groups.values()].reduce((s,v)=>s+v,0),pct2=v=>total?(v/total*100).toFixed(2)+'%':'0.00%';
 body.innerHTML=total?`<tr class="resignation-total"><td colspan="2">Total</td><td>${fmt(total)}</td><td>100.00%</td></tr>`+[...groups.entries()].sort((a,b)=>b[1]-a[1]).map(([key,n])=>{const [name,reason]=JSON.parse(key);return `<tr class="resignation-detail"><td>${hcHtmlEsc(name)}</td><td>${hcHtmlEsc(reason)}</td><td>${fmt(n)}</td><td>${pct2(n)}</td></tr>`}).join(''):'<tr><td colspan="4" style="text-align:center;padding:18px">Không có nhân sự nghỉ việc theo bộ lọc.</td></tr>';
 document.getElementById('resignationReasonNote').textContent=importedEmployees?'Dữ liệu Excel · % tính trên tổng nghỉ của bộ lọc.':'Dữ liệu demo phân bổ minh họa · % tính trên tổng nghỉ của bộ lọc.';
}
function hcRenderAll(){
 const {y,m,d}=hcSelectedData(),isYTD=+document.getElementById('month').value===0;
 const items=hcScopeRows(y,m),t=hcTotals(items),dims=getWorkforceDims();
 syncWorkforceTableColumns(dims);
 const groupMap=new Map();items.forEach(x=>{const key=JSON.stringify(dims.map(k=>String(x.person[k]||'Chưa cập nhật')));if(!groupMap.has(key))groupMap.set(key,{person:x.person,base:0,newc:0,quit:0,current:0});const group=groupMap.get(key);['base','newc','quit','current'].forEach(k=>group[k]+=Number(x[k])||0);});
 const grouped=[...groupMap.values()].filter(x=>x.base||x.newc||x.quit||x.current).sort((a,b)=>b.current-a.current);
 const body=document.getElementById('detailRows');body.replaceChildren();
 grouped.forEach(x=>{const vals=[...dims.map(k=>String(x.person[k]||'Chưa cập nhật')),fmt(x.base),fmt(x.newc),pct(x.base?x.newc*100/x.base:0),fmt(x.quit),pct(x.base?x.quit*100/x.base:0),fmt(x.newc-x.quit),fmt(x.current)];const tr=document.createElement('tr');vals.forEach((value,index)=>{const td=document.createElement('td');td.textContent=value;if(index>=dims.length)td.className='num';tr.appendChild(td);});body.appendChild(tr);});
 const suffix=grouped.length?`${grouped.length} nhóm`:'Không có dữ liệu';document.getElementById('rowCount').textContent=`${importedEmployees?'Excel · '+importedFileName:'Dữ liệu minh họa'} · Theo ${dims.map(k=>hcDimNames[k]).join(' + ')} · ${suffix}`;
 document.getElementById('kpiCurrent').textContent=fmt(t.current);
 const hasPlan=!importedEmployees;
 document.getElementById('kpiPrev').textContent=hasPlan?fmt(t.plan):'--';
 document.getElementById('kpiHire').textContent=hasPlan&&t.plan?(t.current/t.plan*100).toFixed(1)+'%':'--';
 document.getElementById('kpiVacant').innerHTML=hasPlan?fmt(Math.max(0,t.plan-t.current))+' <em>HC</em>':'-- <em>HC</em>';
 document.getElementById('kpiVacantPct').textContent=hasPlan&&t.plan?(Math.max(0,t.plan-t.current)/t.plan*100).toFixed(1)+'%':'--';
 const planLabel=document.querySelector('#pageHC .hc-plan-caption');if(planLabel?.firstChild)planLabel.firstChild.textContent=hasPlan?'HC Plan: ':'Định biên kế hoạch: ';
 const newValue=isYTD?t.ytdNew:t.newc,quitValue=isYTD?t.ytdQuit:t.quit;
 document.getElementById('movementTitle').textContent=isYTD?`BIẾN ĐỘNG NHÂN SỰ (YTD ${y})`:`BIẾN ĐỘNG NHÂN SỰ (THÁNG ${String(m).padStart(2,'0')}/${y})`;
 document.getElementById('movementHire').textContent=fmt(newValue);document.getElementById('kpiQuit').textContent=fmt(quitValue);
 document.getElementById('movementNet').textContent=(newValue-quitValue<0?'−':'')+fmt(Math.abs(newValue-quitValue));
 const numbers={totalPrev:t.base,totalNew:t.newc,totalHireRate:pct(t.base?100*t.newc/t.base:0),totalQuit:t.quit,totalQuitRate:pct(t.base?100*t.quit/t.base:0),totalMovement:t.newc-t.quit,totalCurrent:t.current};
 Object.entries(numbers).forEach(([id,v])=>document.getElementById(id).textContent=typeof v==='number'?fmt(v):v);
 if(importedEmployees)document.getElementById('dataMode').textContent='ĐÃ NẠP EXCEL · dữ liệu theo bộ lọc';
 drawTrend();drawQuitTrend();hcRenderHotspot();hcRenderComposition('quit');hcRenderComposition('current');hcRenderReasons();
}


// Unified Headcount handlers supersede older independent demo table calculations.
selectedData = hcSelectedData;
renderTable = function(evt){hcSyncCascadingOptions(evt?.target?.id);hcRenderAll();};
renderHotspot = hcRenderHotspot;
renderQuitComposition = function(){hcRenderComposition('quit');};
renderCurrentComposition = function(){hcRenderComposition('current');};
renderResignationReasons = hcRenderReasons;

document.getElementById('resignationDimension').addEventListener('change',e=>{
 resignationDimension=e.target.value;
 renderResignationReasons();
});
document.querySelectorAll('#filters select').forEach(el=>el.addEventListener('change',renderTable));document.querySelectorAll('#hotspotDimensionButtons .hotspot-chip').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');if(!document.querySelector('#hotspotDimensionButtons .hotspot-chip.active'))btn.classList.add('active');const {y,m,d}=selectedData();renderHotspot(y,m,Number(d.hc[m-1]||0))}));document.querySelectorAll('#workforceDimensionButtons .hotspot-chip').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');if(!document.querySelector('#workforceDimensionButtons .hotspot-chip.active'))btn.classList.add('active');const dims=[...document.querySelectorAll('#workforceDimensionButtons .hotspot-chip.active')].map(b=>b.dataset.dim);const names={region:'Miền',province:'Tỉnh',position:'Vị trí',tbhvName:'Quản lý Cấp 1',cvName:'Quản lý Cấp 2',age:'Nhóm tuổi',status:'Trạng thái NV'};document.getElementById('rowCount').textContent=(importedEmployees?`Excel: ${importedFileName} · `:'Dữ liệu minh họa · ')+`Phân tích theo ${dims.map(d=>names[d]).join(' + ')}`;renderTable();}));document.getElementById('year').addEventListener('change',()=>{syncMonthOptions();renderTable()});document.getElementById('currentCompositionDimension').addEventListener('change',renderCurrentComposition);document.getElementById('trend').addEventListener('click',monthFromChartEvent);document.getElementById('quitTrend').addEventListener('click',monthFromQuitChartEvent);document.getElementById('quitCompositionDimension').addEventListener('change',renderQuitComposition);document.getElementById('uploadBtn').addEventListener('click',()=>document.getElementById('excelFile').click());document.getElementById('excelFile').addEventListener('change',e=>{if(e.target.files[0])loadExcel(e.target.files[0])});document.getElementById('resetDemo').addEventListener('click',()=>{importedEmployees=null;importedFileName='';document.getElementById('importStatus').textContent='Tải Excel nhân sự để cập nhật KPI và biểu đồ trên trình duyệt.';document.getElementById('dataMode').textContent='AcacyONE · Headcount v3';location.reload()});document.getElementById('clear').addEventListener('click',()=>{document.querySelector('#year').value='2026';document.querySelector('#month').value='0';['region','province','position','tbhv','cvql'].forEach(id=>document.getElementById(id).value='All');renderTable()});syncMonthOptions();renderTable();
