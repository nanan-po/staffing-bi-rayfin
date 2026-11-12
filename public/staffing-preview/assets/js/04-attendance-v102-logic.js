/* AcacyONE Staffing BI | attendance-v102-logic */
(function(){
'use strict';
const $=id=>document.getElementById(id), fmt=n=>Number(n).toLocaleString('vi-VN');
const locs=[['Miền Bắc','Hà Nội'],['Miền Trung','Đà Nẵng'],['Miền Nam','TP. Hồ Chí Minh'],['Miền Nam','Cần Thơ']];
const positions=['NVBH','NVHT','CHT-S','CVQL'];
const surnames=['Nguyễn','Trần','Lê','Phạm','Hoàng','Đỗ','Vũ','Bùi'];
const middles=['Minh','Thị','Văn','Ngọc','Thanh','Quốc','Hồng'];
const names=['Anh','Bình','Chi','Dũng','Hà','Hùng','Lan','Linh','Mai','Nam','Phúc','Trang','Tuấn'];
const employees=Array.from({length:96},(_,i)=>({id:'NV'+String(i+1).padStart(3,'0'),name:surnames[i%8]+' '+middles[(i*3)%7]+' '+names[(i*5)%13],region:locs[i%4][0],province:locs[i%4][1],position:positions[(i*7+Math.floor(i/4))%4]}));
const events=[];
for(const year of [2025,2026])for(let month=1;month<=12;month++){
 if(year===2026&&month>10)continue;
 const last=year===2026&&month===10?30:new Date(year,month,0).getDate();
 for(let day=1;day<=last;day++){
  const date=new Date(year,month-1,day);if(date.getDay()===0||date.getDay()===6)continue;
  employees.forEach((e,i)=>{
   const h=(i*37+day*13+month*19+(year-2025)*7)%100;
   const status=h<3?'absent':h<9?'leave':h<20?'late':'ontime';
   events.push({year,month,day,employee:e,status});
  });
 }
}
const filters=['attYear','attMonth','attRegion','attProvince','attPosition'];
function scope(monthOverride){
 const year=+$('attYear').value,month=monthOverride===undefined?+$('attMonth').value:monthOverride,region=$('attRegion').value,province=$('attProvince').value,position=$('attPosition').value;
 return events.filter(e=>e.year===year&&(!month||e.month===month)&&(region==='All'||e.employee.region===region)&&(province==='All'||e.employee.province===province)&&(position==='All'||e.employee.position===position));
}
function counts(rows){const c={ontime:0,late:0,leave:0,absent:0};rows.forEach(r=>c[r.status]++);return {...c,total:rows.length,present:c.ontime+c.late,rate:rows.length?(c.ontime+c.late)/rows.length*100:0};}
function renderTrend(){
 const year=+$('attYear').value,selected=+$('attMonth').value,n=year===2026?10:12,values=Array.from({length:n},(_,i)=>counts(scope(i+1)).rate);const W=700,H=200,l=38,r=19,t=17,b=31,w=W-l-r,h=H-t-b;
 const x=i=>l+(n===1?0:i*w/(n-1)),y=v=>t+h-(v-70)/30*h;
 let out='';
 for(let v=70;v<=100;v+=10){let yy=y(v);out+=`<line x1="${l}" y1="${yy}" x2="${W-r}" y2="${yy}" stroke="#e5edf8"/><text x="${l-8}" y="${yy+3}" text-anchor="end" fill="#7b8ca3" font-size="10">${v}%</text>`}
 const pts=values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
 out+=`<polyline points="${pts}" fill="none" stroke="#1665b7" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>`;
 values.forEach((v,i)=>{const xx=x(i),yy=y(v),on=selected===i+1; if(on)out+=`<line x1="${xx}" y1="${t}" x2="${xx}" y2="${t+h}" stroke="#e88dab" stroke-dasharray="4 4"/>`;
 out+=`<circle cx="${xx}" cy="${yy}" r="${on?5:3.2}" fill="${on?'#d94b7b':'#1665b7'}" stroke="white" stroke-width="1.5"/>`;
 out+=`<text x="${xx}" y="${Math.max(9,yy-11)}" fill="${on?'#bd3668':'#496588'}" font-size="${on?12:10}" font-weight="${on?700:400}" text-anchor="middle">${v.toFixed(1).replace('.',',')}%</text>`;
 out+=`<text x="${xx}" y="${H-9}" fill="${on?'#bd3668':'#667c9d'}" font-size="11" font-weight="${on?700:400}" text-anchor="middle">T${i+1}</text>`;
 out+=`<rect class="att-hit" data-month="${i+1}" x="${xx-14}" y="${t}" width="28" height="${h+8}" fill="transparent"/>`;});
 $('attTrend').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Xu hướng tỷ lệ hiện diện theo tháng">${out}</svg>`;
 $('attTrend').querySelectorAll('.att-hit').forEach(e=>e.addEventListener('click',()=>{$('attMonth').value=String(+$('attMonth').value===+e.dataset.month?0:+e.dataset.month);render();}));
}
function render(){const rows=scope(),c=counts(rows),unique=new Set(rows.map(r=>r.employee.id));
 $('attStaff').textContent=fmt(unique.size);$('attScheduled').textContent=fmt(c.total);$('attPresent').textContent=fmt(c.present);$('attRate').textContent=c.rate.toFixed(1).replace('.',',')+'%';$('attLate').textContent=fmt(c.late);$('attLeaveAbsent').textContent=fmt(c.leave)+' / '+fmt(c.absent);
 const cats=[['Đúng giờ',c.ontime,'#1b6fc0'],['Đi muộn',c.late,'#69b5df'],['Nghỉ phép',c.leave,'#a0aeca'],['Vắng không phép',c.absent,'#e28b76']];
 $('attBreakdown').innerHTML=cats.map(([name,n,col])=>`<div class="att-break-row"><span>${name}</span><b>${fmt(n)} (${c.total?(100*n/c.total).toFixed(1).replace('.',','):0}%)</b><div class="att-break-track"><div class="att-break-fill" style="width:${c.total?100*n/c.total:0}%;background:${col}"></div></div></div>`).join('');
 const grouped=new Map();rows.forEach(row=>{let key=row.employee.id;if(!grouped.has(key))grouped.set(key,{e:row.employee,ontime:0,late:0,leave:0,absent:0,total:0});const g=grouped.get(key);g[row.status]++;g.total++});
 $('attRows').innerHTML=[...grouped.values()].sort((a,b)=>a.e.id.localeCompare(b.e.id)).map(g=>`<tr><td>${g.e.id}</td><td style="text-align:left">${g.e.name}</td><td>${g.e.region}</td><td>${g.e.province}</td><td>${g.e.position}</td><td>${g.total}</td><td>${g.ontime}</td><td>${g.late}</td><td>${g.leave}</td><td>${g.absent}</td><td>${(100*(g.ontime+g.late)/g.total).toFixed(1).replace('.',',')}%</td></tr>`).join('')||'<tr><td colspan="11">Không có dữ liệu phù hợp</td></tr>';
 renderTrend();
}
filters.forEach(id=>$(id)?.addEventListener('change',()=>{if(id==='attYear'&&$('attYear').value==='2026'&&+$('attMonth').value>10)$('attMonth').value='0';render();}));
$('attMonth').value='10';render();
})();
