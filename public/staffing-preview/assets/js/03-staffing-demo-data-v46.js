/* AcacyONE Staffing BI | staffing-demo-data-v46 */
(()=>{
 const $=id=>document.getElementById(id), fmt=n=>Math.round(n).toLocaleString('vi-VN'), money=n=>(n/1e9).toFixed(2)+' tỷ', months=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
 const regions=['Miền Bắc','Miền Trung','Miền Nam'], positions=['NVBH','NVHT','CHT-S','CVQL'];
 const recMonthly={2026:[108,124,132,145,153,167,175,184,198,212,0,0],2025:[82,94,103,110,124,136,148,157,169,177,185,198]};
 const payMonthly={2026:[16.8,17.1,17.4,17.6,17.8,18.0,18.1,18.3,18.4,18.42,0,0],2025:[14.8,15.0,15.2,15.4,15.6,15.8,16.0,16.2,16.4,16.5,16.6,16.7]};
 const recRequests=[
  ['REQ-26001','05/01/2026','Miền Bắc','Hà Nội','NVBH',24,24,'Done','Nguyễn An','External','20/02/2026','15/02/2026'],
  ['REQ-26002','12/02/2026','Miền Nam','TP. Hồ Chí Minh','NVHT',18,12,'Processing','Trần Bình','Referral','15/04/2026',''],
  ['REQ-26003','08/03/2026','Miền Trung','Đà Nẵng','CHT-S',12,12,'Done','Lê Chi','Job Portal','30/04/2026','05/05/2026'],
  ['REQ-26004','16/04/2026','Miền Nam','Đồng Nai','NVBH',30,30,'Done','Nguyễn An','External','30/06/2026','25/06/2026'],
  ['REQ-26005','03/06/2026','Miền Bắc','Hà Nội','CVQL',8,6,'Processing','Trần Bình','Internal','15/11/2026',''],
  ['REQ-26006','19/08/2026','Miền Nam','TP. Hồ Chí Minh','NVHT',20,14,'Processing','Lê Chi','Referral','15/10/2026',''],
  ['REQ-26007','11/09/2026','Miền Trung','Đà Nẵng','NVBH',16,16,'Done','Nguyễn An','Job Portal','15/10/2026','10/10/2026'],
  ['REQ-26008','06/10/2026','Miền Bắc','Hà Nội','CHT-S',10,8,'Processing','Trần Bình','External','20/12/2026','']
 ];
 // Dữ liệu DEMO mở rộng, cố định để số liệu ổn định qua mỗi lần mở/đổi bộ lọc.
 // Không tác động dữ liệu HC hoặc PAYROLL. Giữ 8 yêu cầu gốc phía trên.
 const demoProvinces={
  'Miền Bắc':['Hà Nội','Hải Phòng','Quảng Ninh'],
  'Miền Trung':['Đà Nẵng','Huế','Nghệ An'],
  'Miền Nam':['TP. Hồ Chí Minh','Đồng Nai','Bình Dương']
 };
 const demoRecruiters=['Nguyễn An','Trần Bình','Lê Chi'];
 const demoSources=['External','Referral','Job Portal','Internal'];
 const pad2=n=>String(n).padStart(2,'0');
 const demoDate=(year,month,day)=>`${pad2(day)}/${pad2(month)}/${year}`;
 const addDemoRequests=(year,count,maxMonth)=>{
  for(let i=0;i<count;i++){
   const month=1+(i*7+Math.floor(i/11))%maxMonth;
   const day=1+(i*13+Math.floor(i/9))%25;
   const region=regions[(i*5+Math.floor(i/7))%regions.length];
   const province=demoProvinces[region][(i+Math.floor(i/6))%3];
   const position=positions[(i*3+Math.floor(i/5))%positions.length];
   const target=4+(i*5)%8;
   const done=(i%7!==0 && i%7!==3); // 5/7 hoàn thành, 2/7 đang tuyển
   const filled=done?target:Math.max(0,target-1-(i%4));
   const created=new Date(year,month-1,day);
   const due=new Date(year,month-1,day+24+(i%39));
   const completed=done?new Date(due.getFullYear(),due.getMonth(),due.getDate()+(i%5===0?4:-(2+i%11))):null;
   const dstr=d=>d?demoDate(d.getFullYear(),d.getMonth()+1,d.getDate()):'';
   recRequests.push([
    `REQ-${String(year).slice(-2)}${String(i+101).padStart(3,'0')}`,
    dstr(created),region,province,position,target,filled,
    done?'Done':'Processing',demoRecruiters[i%3],demoSources[(i+Math.floor(i/4))%4],
    dstr(due),dstr(completed)
   ]);
  }
 };
 addDemoRequests(2026,72,10);
 addDemoRequests(2025,48,12);
 // Giới hạn chỉ tiêu của tám yêu cầu mẫu ban đầu cùng mặt bằng quy mô với bộ demo mới.
 recRequests.slice(0,8).forEach(r=>{
   const originalTarget=Number(r[5])||0, originalFilled=Number(r[6])||0;
   const target=Math.min(9,originalTarget);
   r[5]=target;
   r[6]=r[7]==='Done'?target:Math.min(target-1,Math.round(target*originalFilled/Math.max(1,originalTarget)));
 });
 const provinceFilter=$('recProvince');
 [...new Set(recRequests.map(r=>r[3]))].sort((a,b)=>a.localeCompare(b,'vi')).forEach(name=>{if(![...provinceFilter.options].some(o=>o.value===name))provinceFilter.add(new Option(name,name));});
 const payRows=[
  ['VNM0001','Nguyễn Văn An','Miền Bắc','NVBH',9.2,1.8,.9],['VNM0002','Trần Thị Bình','Miền Nam','NVHT',8.4,1.2,.8],['VNM0003','Lê Minh Chi','Miền Trung','CHT-S',12.5,2.4,1.1],['VNM0004','Phạm Quốc Dũng','Miền Nam','NVBH',9.0,2.0,.9],['VNM0005','Hoàng Thu Hà','Miền Bắc','CVQL',18.0,3.5,1.8],['VNM0006','Đỗ Anh Khoa','Miền Trung','NVHT',8.1,1.1,.7],['VNM0007','Vũ Ngọc Lan','Miền Nam','CHT-S',13.2,2.8,1.2],['VNM0008','Bùi Đức Long','Miền Bắc','NVBH',9.4,1.9,.9]
 ];
 function val(id){return $(id)?.value||'All'}
 function filterFactor(region,position,province){let f=region==='All'?1:region==='Miền Bắc'?.34:region==='Miền Trung'?.20:.46;if(position!=='All')f*=({NVBH:.42,NVHT:.25,'CHT-S':.20,CVQL:.13})[position];if(province!=='All')f*=.55;return f}
 function chart(id,arr,unit,selected){const el=$(id);if(!el)return;let max=Math.max(...arr,1);el.innerHTML=arr.map((v,i)=>`<div class="chart-col"><span class="chart-value">${unit==='cost'?v.toFixed(1):v}</span><div class="chart-bar ${selected===i+1?'selected':''}" style="height:${Math.max(3,v/max*72)}%" title="${months[i]}: ${v}"></div><span class="chart-label">${months[i]}</span></div>`).join('')}
 function bars(id,items,suffix=''){const el=$(id);if(!el)return;let max=Math.max(...items.map(x=>x[1]),1);el.innerHTML=items.map(([name,v])=>`<div class="demo-bar-row"><span>${name}</span><div class="demo-bar-track"><div class="demo-bar-fill" style="width:${v/max*100}%"></div></div><strong>${v.toFixed(1)}${suffix}</strong></div>`).join('')}
 function recRender(){if(window.STAFFING_NATIVE_DATA)return;
  const y=+val('recYear'),m=+val('recMonth');
  const selectedRegion=val('recRegion'),selectedProvince=val('recProvince'),selectedPosition=val('recPosition'),selectedSource=val('recSource'),selectedRecruiter=val('recRecruiter');
  const reportCutoff=y===2026?new Date(2026,9,30):new Date(y,11,31);
  const requestedCutoff=m?new Date(y,m,0):reportCutoff;
  const asOf=new Date(Math.min(+reportCutoff,+requestedCutoff));
  // Áp dụng các bộ lọc REC chung trước; chỉ giới hạn tháng cho KPI/bảng và các biểu đồ chi tiết.
  const yearRows=recRequests.filter(r=>+r[1].split('/')[2]===y)
   .filter(r=>(selectedRegion==='All'||r[2]===selectedRegion)&&(selectedProvince==='All'||r[3]===selectedProvince)&&(selectedPosition==='All'||r[4]===selectedPosition)&&(selectedRecruiter==='All'||r[8]===selectedRecruiter)&&(selectedSource==='All'||r[9]===selectedSource));
  const rows=yearRows.filter(r=>{const dt=r[1].split('/').map(Number);return new Date(dt[2],dt[1]-1,dt[0])<=asOf && (!m||dt[1]===m);});
  const parseDate=str=>{if(!str)return null;const [d,mo,yr]=str.split('/').map(Number);return new Date(yr,mo-1,d)};
  // Mỗi chỉ tiêu đã tuyển demo được phân bổ thành sự kiện nhận việc có ngày cụ thể.
  // Những nhân sự dự kiến nhận việc sau ngày chốt KHÔNG được cộng vào kết quả thực tế.
  const hireDates=r=>{
    const start=parseDate(r[1]), due=parseDate(r[10]), completed=parseDate(r[11]);
    const quantity=Math.max(0,Math.min(Number(r[5])||0,Number(r[6])||0));
    if(!start||!quantity)return [];
    const end=(r[7]==='Done'&&completed)?completed:(due&&due>start?due:new Date(start.getFullYear(),start.getMonth(),start.getDate()+60));
    const endMs=Math.max(+start,+end);
    // Ngày nhận việc cuối của yêu cầu Done phải không trước ngày hoàn thành.
    return Array.from({length:quantity},(_,i)=>new Date(+start+Math.round((endMs-(+start))*(i+1)/quantity)));
  };
  const hiredBy=(r,cutoff)=>hireDates(r).filter(d=>d<=cutoff).length;
  const vacanciesAt=(r,cutoff)=>Math.max(0,(Number(r[5])||0)-hiredBy(r,cutoff));
  // Trạng thái được xét tại ngày chốt; không tính yêu cầu hoàn thành trong tương lai là Done.
  const isDone=r=>r[7]==='Done'&&parseDate(r[11])&&parseDate(r[11])<=asOf&&hiredBy(r,asOf)>=Number(r[5]);
  const isLate=r=>!isDone(r)&&parseDate(r[10])&&parseDate(r[10])<asOf;
  const total=rows.length,done=rows.filter(isDone).length,processing=rows.filter(r=>!isDone(r)).length,late=rows.filter(isLate).length;
  const doneOnTime=rows.filter(r=>isDone(r)&&parseDate(r[11])&&parseDate(r[11])<=parseDate(r[10])).length;
  const onTimeRate=done?doneOnTime/done*100:0;
  $('recTotal').textContent=fmt(total);$('recDone').textContent=fmt(done);$('recProcessing').textContent=fmt(processing);$('recLate').textContent=fmt(late);
  const within=processing-late;
  const pct=(n,d)=>d?(n/d*100).toFixed(1).replace('.',',')+'%':'0%';
  $('recWithin').textContent=fmt(within);
  $('recDonePercent').textContent=pct(done,total)+' tổng yêu cầu';
  $('recProcessingPercent').textContent=pct(processing,total)+' tổng yêu cầu';
  $('recProcessingSummary').textContent=fmt(processing)+' yêu cầu';
  $('recWithinPercent').textContent=pct(within,processing);
  $('recLatePercent').textContent=pct(late,processing);
  $('recWithinBar').style.width=(processing?within/processing*100:0)+'%';
  $('recLateBar').style.width=(processing?late/processing*100:0)+'%';
  $('recOnTime').textContent=done?onTimeRate.toFixed(1).replace('.',',')+'%':'--';
  $('recOnTimeNote').textContent=done?`${doneOnTime}/${done} yêu cầu hoàn thành đúng hạn`:'Chưa có yêu cầu hoàn thành trong kỳ';
  // Xu hướng = nhân sự đã nhận việc đến NGÀY CHỐT, phân nhóm theo THÁNG MỞ YÊU CẦU.
  // Như vậy khi chọn tháng T10, điểm T10 bằng tổng Đã nhận việc trong phễu T10.
  // Dữ liệu chỉ gồm yêu cầu mở từ đầu năm tới ngày chốt; các bộ lọc khác giống KPI.
  const trendCutoff=reportCutoff; // Cố định đường xu hướng theo ngày chốt năm, không thay hình khi click tháng.
  const trend=Array.from({length:12},(_,i)=>yearRows.reduce((sum,r)=>{
    const opened=parseDate(r[1]);
    return sum+(opened&&opened<=trendCutoff&&opened.getMonth()===i?hiredBy(r,trendCutoff):0);
  },0));
  const trendEl=$('recTrend');
  const trendMax=Math.max(1,...trend), w=1200, baseline=210, top=42, plotHeight=baseline-top;
  const trendPoints=trend.map((v,i)=>({x:45+i*101, y:baseline-(v/trendMax)*(plotHeight-12), v, month:i+1}));
  // Clean BI-style line: restrained stroke and markers; no decorative gradients.
  const cleanPath=trendPoints.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  const svgSafe=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const axis=Array.from({length:4},(_,i)=>{const yAxis=baseline-i*(plotHeight/3);return `<line x1="24" x2="1172" y1="${yAxis}" y2="${yAxis}" stroke="${i===0?'#cfdcec':'#edf2f8'}" stroke-width="1"/>`;}).join('');
  const pointsSvg=trendPoints.map(p=>{
    const active=m===p.month;
    const clr=active?'#0b4fb5':'#1479e6';
    const yLabel=Math.max(16,p.y-13);
    const label=svgSafe(months[p.month-1]);
    return `<g class="rec-month-col ${active?'rec-month-active':''}" data-month="${p.month}" role="button" tabindex="0" aria-pressed="${active}" aria-label="${label}: ${fmt(p.v)} nhân sự; ${active?'nhấn để xem lũy kế':'nhấn để xem tháng'}" style="cursor:pointer;outline:none">
      <rect x="${p.x-47}" y="4" width="94" height="230" fill="transparent"/>
      <circle cx="${p.x}" cy="${p.y}" r="${active?5.3:3.5}" fill="#fff" stroke="${clr}" stroke-width="${active?2.8:1.8}"/>
      <text x="${p.x}" y="${yLabel}" text-anchor="middle" font-size="11" fill="${active?'#0b4fb5':'#375b8c'}" font-weight="${active?700:400}">${fmt(p.v)}</text>
      <text x="${p.x}" y="231" text-anchor="middle" font-size="11" fill="${active?'#0b4fb5':'#6d7f99'}" font-weight="${active?700:400}">${label}</text>
      <title>${label}: ${fmt(p.v)} nhân sự. ${active?'Nhấn lần nữa để quay về YTD.':'Nhấn để lọc theo tháng.'}</title>
    </g>`;
  }).join('');
  trendEl.innerHTML=`<svg class="rec-trend-line" viewBox="0 0 ${w} 244" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-label="Số nhân sự đã nhận việc theo tháng mở yêu cầu">`+
    axis+`<path class="rec-trend-area" d="${cleanPath} L ${trendPoints[trendPoints.length-1].x} ${baseline} L ${trendPoints[0].x} ${baseline} Z" fill="#e7f2ff" opacity=".82"/>`+(m?`<line x1="${trendPoints[m-1].x}" x2="${trendPoints[m-1].x}" y1="35" y2="222" stroke="#94bdf0" stroke-width="1.4" stroke-dasharray="4 5" pointer-events="none"/>`:'')+`<path d="${cleanPath}" stroke="#1479e6" stroke-width="3.3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`+pointsSvg+'</svg>';
  const labels=['Tiếp nhận hồ sơ','Sàng lọc hồ sơ','Phỏng vấn','Đề nghị nhận việc','Đã nhận việc'];
  // Phễu mô phỏng dựa trên số nhân sự đã tuyển của tập yêu cầu được lọc.
  // Bảo đảm số lượng giảm dần và 'Đã nhận việc' là người, không phải yêu cầu Done.
  const hires=rows.reduce((sum,r)=>sum+hiredBy(r,asOf),0);
  // Mô phỏng ứng viên theo từng yêu cầu: một ứng viên luôn trải qua các bước
  // Tiếp nhận -> Sàng lọc -> Phỏng vấn -> Offer -> Nhận việc.
  // Ngày ở mỗi bước không thể trước ngày mở yêu cầu hay sau kỳ báo cáo.
  // Số nhận việc dùng đúng các sự kiện nhận việc của yêu cầu, không nhân hệ số.
  const funnelOf=r=>{
    const start=parseDate(r[1]), n=hiredBy(r,asOf), target=Number(r[5])||0;
    if(!start||start>asOf)return [0,0,0,0,0];
    const days=Math.max(0,Math.floor((asOf-start)/86400000));
    const applied=n+Math.round(target*1.5);
    const screened=n+Math.round(target*1.0);
    const interviewed=n+Math.round(target*.55);
    const offered=n+Math.round(target*.18);
    // Extra ứng viên được ghi nhận theo tiến độ thực tế của từng kỳ (không ghi nhận trước ngày phát sinh).
    const stage=(extra,delay)=>days>=delay?extra:Math.round(extra*Math.max(0,days+1)/(delay+1));
    const a=n+stage(applied-n,2), b=n+stage(screened-n,5);
    const c=n+stage(interviewed-n,9), d=n+stage(offered-n,13);
    return [Math.max(a,b,c,d,n),Math.max(b,c,d,n),Math.max(c,d,n),Math.max(d,n),n];
  };
  const pipe=rows.reduce((tot,r)=>{const part=funnelOf(r);return tot.map((v,i)=>v+part[i]);},[0,0,0,0,0]);
  const stageRates=pipe.map((v,i)=>i===0?100:(pipe[0]?v/pipe[0]*100:0));
  const stepLoss=pipe.map((v,i)=>i===0?0:Math.max((pipe[i-1]||0)-v,0));
  const stepLossPct=pipe.map((v,i)=>i===0?0:((pipe[i-1]||0)?stepLoss[i]/pipe[i-1]*100:0));
  const bottleneckIndex=stepLossPct.slice(1).reduce((best,cur,idx,arr)=>cur>arr[best]?idx:best,0)+1;
  const noteLabels=['','','Tỷ lệ qua sàng lọc','Tỷ lệ vào phỏng vấn','Tỷ lệ offer','Tỷ lệ nhận việc'];
  const noteText=pipe.map((v,i)=>{
    if(i===0)return `<span class="rec-funnel-metric-muted">100% đầu vào</span>`;
    if(i===pipe.length-1)return `<span class="rec-funnel-metric-good">${stageRates[i].toFixed(1).replace('.',',')}% nhận việc</span>`;
    return `<span class="rec-funnel-metric-warn">-${stepLossPct[i].toFixed(1).replace('.',',')}% giảm</span>`;
  });
  $('recPipeline').innerHTML=`
    <div class="rec-funnel-layout">
      <div class="rec-funnel-labels">${labels.map((lb,i)=>`<div class="rec-funnel-label-row"><b>${i+1}.</b><span>${lb}</span></div>`).join('')}</div>
      <div class="rec-funnel-visual">${pipe.map((v,i)=>`<div class="rec-funnel-step rec-funnel-step-${i+1}" style="--step-width:${100-i*12}%"><strong>${fmt(v)}</strong></div>`).join('')}</div>
      <div class="rec-funnel-metrics">${pipe.map((v,i)=>`<div class="rec-funnel-metric-row"><span class="rec-funnel-metric-title">${i===0?'Tổng đầu vào':(i===pipe.length-1?'Hiệu suất cuối':'Chuyển bước')}</span>${noteText[i]}</div>`).join('')}</div>
    </div>`;
  const bottleLoss=stepLoss[bottleneckIndex];
  const bottlePct=stepLossPct[bottleneckIndex];
  const noteEl=$('recPipeline')?.closest('.rec-pipeline-card')?.querySelector('.module-note');
  if(noteEl){
    noteEl.innerHTML=`<span class="rec-funnel-note-tag">ĐIỂM NGHẼN TUYỂN DỤNG</span> Ứng viên rơi nhiều nhất ở bước <b>${bottleneckIndex+1}. ${labels[bottleneckIndex]}</b>: giảm <b>${fmt(bottleLoss)}</b> ứng viên (${bottlePct.toFixed(1).replace('.',',')}%) so với bước trước.`;
  }
  // Phân tích nhu cầu tuyển dụng theo tham số, dùng chính tập dữ liệu đã lọc ở REC.
  const dim=val('recVacancyDimension');
  const dimNames={region:'miền',province:'tỉnh',position:'vị trí tuyển',recruiter:'chuyên viên tuyển dụng',status:'trạng thái yêu cầu',sla:'tình trạng SLA'};
  const sourceNames={'External':'Nguồn bên ngoài','Referral':'Giới thiệu ứng viên','Job Portal':'Website tuyển dụng','Internal':'Nguồn nội bộ'};
  const groupValue=r=>{
   if(dim==='region')return r[2];
   if(dim==='province')return r[3];
   if(dim==='position')return r[4];
   if(dim==='recruiter')return r[8];
   if(dim==='status')return isDone(r)?'Đã hoàn thành':'Đang tuyển';
   if(dim==='sla')return isDone(r)?'Đã hoàn thành':(isLate(r)?'Quá hạn':'Trong hạn');
   return r[2];
  };
  const grouped=new Map();
  rows.forEach(r=>{
   const vacancy=vacanciesAt(r,asOf);
   const name=String(groupValue(r)||'Chưa cập nhật');
   grouped.set(name,(grouped.get(name)||0)+vacancy);
  });
  const vacancyGroups=[...grouped.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'vi'));
  const vacancyEl=$('recVacancy');
  const maxVacancy=Math.max(1,...vacancyGroups.map(r=>r[1]));
  const safeRec=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  vacancyEl.innerHTML=vacancyGroups.length?vacancyGroups.map(([name,n])=>`<div class="demo-bar-row"><span title="${safeRec(name)}">${safeRec(name)}</span><div class="demo-bar-track"><div class="demo-bar-fill" style="width:${n/maxVacancy*100}%"></div></div><strong>${fmt(n)}</strong></div>`).join(''):'<div class="rec-dimension-empty">Không có dữ liệu phù hợp bộ lọc.</div>';
  $('recVacancySubtitle').textContent=`Số vị trí còn thiếu theo ${dimNames[dim]||'miền'}`;
  $('recVacancyNote').textContent=`${m?'Tháng '+String(m).padStart(2,'0')+'/'+y:'Lũy kế năm '+y} · Theo bộ lọc REC · Tổng còn thiếu: ${fmt(vacancyGroups.reduce((sum,r)=>sum+r[1],0))} vị trí`;

  const allSourceNames=['External','Referral','Job Portal','Internal'];
  let src=allSourceNames.map(name=>[name,rows.filter(r=>r[9]===name).length]);
  if(selectedSource!=='All')src=src.filter(x=>x[0]===selectedSource);
  const sourcePalette={'External':'#0b4fb5','Referral':'#147fe1','Job Portal':'#1ba2fa','Internal':'#8bd6ff'};
  const sourceShortNames={'External':'NGUỒN NGOÀI','Referral':'GIỚI THIỆU','Job Portal':'WEBSITE','Internal':'NỘI BỘ'};
  const sourceTotal=src.reduce((sum,item)=>sum+item[1],0);
  const fmtShare=n=>sourceTotal?(100*n/sourceTotal).toFixed(2).replace(/\.00$/,'').replace('.',',')+'%':'0%';
  const legend=src.map(([name,n])=>`<span class="rec-source-legend-item" title="${safeRec(sourceNames[name]||name)}: ${fmt(n)}"><i class="rec-source-swatch" style="background:${sourcePalette[name]}"></i><span class="rec-source-label">${safeRec(sourceNames[name]||name)}</span><span class="rec-source-count">${fmt(n)}</span><span class="rec-source-percent">${fmtShare(n)}</span></span>`).join('');
  // v167: basic thin donut. Source legend remains unchanged at right.
  const polar=(cx,cy,r,a)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
  const donutPath=(cx,cy,rOuter,rInner,start,end)=>{
    const large=end-start>Math.PI?1:0;
    const p1=polar(cx,cy,rOuter,start),p2=polar(cx,cy,rOuter,end);
    const p3=polar(cx,cy,rInner,end),p4=polar(cx,cy,rInner,start);
    return `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(3)} ${p4.y.toFixed(3)} Z`;
  };
  let donut='<div class="rec-source-empty">Không có dữ liệu phù hợp bộ lọc</div>';
  if(sourceTotal){
    const active=src.filter(x=>x[1]>0);
    const cx=220,cy=178,rOuter=138,rInner=106; // thinner ring, generous central whitespace
    const gap=0.003;
    let offset=0;
    const segments=active.map(([name,n],idx)=>{
      const sweep=2*Math.PI*(n/sourceTotal);
      const start=-Math.PI/2+offset+gap/2;
      const end=-Math.PI/2+offset+sweep-gap/2;
      offset+=sweep;
      // For one source, split into two half-donut paths to avoid an ambiguous full-circle SVG arc.
      const d=active.length===1
        ? donutPath(cx,cy,rOuter,rInner,start,start+Math.PI-gap)+" "+donutPath(cx,cy,rOuter,rInner,start+Math.PI,end)
        : donutPath(cx,cy,rOuter,rInner,start,end);
      return `<path d="${d}" class="rec-source-segment" fill="${sourcePalette[name]}"><title>${safeRec(sourceNames[name]||name)}: ${fmt(n)} (${fmtShare(n)})</title></path>`;
    }).join('');
    const center=`<circle cx="${cx}" cy="${cy}" r="96" class="rec-source-center-core"/>`+
      `<text x="${cx}" y="${cy-7}" text-anchor="middle" class="rec-source-center-sub">TỔNG YÊU CẦU</text>`+
      `<text x="${cx}" y="${cy+26}" text-anchor="middle" class="rec-source-center-total">${fmt(sourceTotal)}</text>`;
    donut=`<svg class="rec-source-infographic" viewBox="0 0 440 340" role="img" aria-label="Cơ cấu nguồn tuyển dụng, tổng ${fmt(sourceTotal)} yêu cầu">${segments}${center}</svg>`;
  }
  $('recSources').innerHTML=`<div class="rec-source-legend" aria-label="Chú giải nguồn tuyển dụng">${legend}</div><div class="rec-source-chart">${donut}</div>`;
  $('recRows').innerHTML=rows.map(r=>{
   const sla=isDone(r)?(parseDate(r[11])&&parseDate(r[11])<=parseDate(r[10])?'On-time':'Late'):(isLate(r)?'Late':'On-time');
   const due=r[10]||'--';
   return `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td class="num">${fmt(r[5])}</td><td class="num">${fmt(hiredBy(r,asOf))}</td><td class="num">${fmt(vacanciesAt(r,asOf))}</td><td>${isDone(r)?'Đã hoàn thành':'Đang tuyển'}</td><td>${due}</td><td><span class="sla-pill ${sla==='Late'?'late':'ontime'}">${sla==='Late'?'Quá hạn':'Đúng hạn'}</span></td><td>${r[8]}</td></tr>`;
  }).join('')||'<tr><td colspan="12" class="empty-cell">Không có yêu cầu phù hợp bộ lọc</td></tr>';
 }

 // DEMO model: relative allocations by region, province, role and project.
 // These are synthetic weights, normalized to the currently filtered Payroll KPI totals.
 const payrollDemoGeo=[
  {region:'Miền Bắc',province:'Hà Nội',weight:.34},
  {region:'Miền Trung',province:'Đà Nẵng',weight:.20},
  {region:'Miền Nam',province:'TP. Hồ Chí Minh',weight:.28},
  {region:'Miền Nam',province:'Đồng Nai',weight:.18}
 ];
 const payrollDemoPositions=[['NVBH',.42,.82],['NVHT',.25,.75],['CHT-S',.20,1.15],['CVQL',.13,1.55]];
 const payrollDemoProjects=[['VNM - Sales',.56],['VNM - Operations',.29],['VNM - Office',.15]];
 const payrollDemoAllocation=payrollDemoGeo.flatMap(g=>payrollDemoPositions.flatMap(([position,pw,mult])=>payrollDemoProjects.map(([project,jw])=>({region:g.region,province:g.province,position,project,weight:g.weight*pw*jw,avgFactor:mult})))) ;
 const payrollDimensionNames={region:'MIỀN',province:'TỈNH',position:'VỊ TRÍ',project:'ĐƠN VỊ / DỰ ÁN',type:'LOẠI CHI PHÍ'};
 function payRenderDimensions({total,average,components,year,month}){
  const f={region:val('payRegion'),province:val('payProvince'),position:val('payPosition'),project:val('payProject')};
  let pool=payrollDemoAllocation.filter(r=>Object.entries(f).every(([key,chosen])=>chosen==='All'||r[key]===chosen));
  const expenseDim=val('payCostDimension'),avgDim=val('payAvgDimension'),incentiveDim=val('payIncentiveDimension');
  const group=(dimension,kind)=>{
   if(kind==='cost'&&dimension==='type'){
    const names=['Lương cơ bản','Thưởng / Hoa hồng','Phụ cấp'];
    return names.map((n,i)=>[n,components[i]||0]).filter(r=>r[1]>0);
   }
   const map=new Map();
   const base=pool.reduce((acc,r)=>acc+r.weight,0);
   const avgWeight=pool.reduce((acc,r)=>acc+r.weight*r.avgFactor,0);
   for(const r of pool){
    const k=r[dimension];if(!map.has(k))map.set(k,{w:0,wAvg:0});
    const item=map.get(k);item.w+=r.weight;item.wAvg+=r.weight*r.avgFactor;
   }
   return [...map].map(([k,v])=>[k,kind==='cost'?(base?total*v.w/base:0):(v.w&&avgWeight?average*(v.wAvg/v.w)/(avgWeight/base):0)]).filter(v=>v[1]>0.00001).sort((a,b)=>b[1]-a[1]);
  };
  const costRows=group(expenseDim,'cost'),avgRows=group(avgDim,'avg');
  const incentiveTotal=components[1]||0;
  const incentiveGroups=new Map();
  const incentiveWeight=pool.reduce((a,r)=>a+r.weight,0);
  for(const r of pool) incentiveGroups.set(r[incentiveDim],(incentiveGroups.get(r[incentiveDim])||0)+r.weight);
  const incentiveRows=[...incentiveGroups].map(([k,w])=>[k,incentiveWeight?incentiveTotal*w/incentiveWeight:0]).filter(v=>v[1]>0.00001).sort((a,b)=>b[1]-a[1]);
  const period=month?'Tháng '+String(month).padStart(2,'0')+'/'+year:'YTD '+year;
  $('payCostDimensionTitle').textContent='TỔNG CHI PHÍ LƯƠNG PHÂN BỔ THEO '+payrollDimensionNames[expenseDim];
  $('payAvgDimensionTitle').textContent='CHI PHÍ BÌNH QUÂN PHÂN BỔ THEO '+payrollDimensionNames[avgDim];
  $('payIncentiveDimensionTitle').textContent='CHI PHÍ INCENTIVE PHÂN BỔ THEO '+payrollDimensionNames[incentiveDim];
  $('payCostDimensionDescription').textContent='Phân bổ tổng chi phí theo '+val('payCostDimension')+' (dữ liệu demo)';
  $('payAvgDimensionDescription').textContent='Chi phí bình quân / nhân sự theo tiêu chí (dữ liệu demo)';
  bars('payRegionBars',costRows,'');bars('payIncentiveBars',incentiveRows,'');bars('payPositionBars',avgRows,'');
  $('payIncentiveDimensionNote').textContent=period+' · Theo bộ lọc PAYROLL · Tổng Incentive: '+incentiveTotal.toFixed(2).replace('.',',')+' tỷ đồng';
  $('payCostDimensionNote').textContent=period+' · Theo bộ lọc PAYROLL · Tổng: '+total.toFixed(2).replace('.',',')+' tỷ đồng';
  $('payAvgDimensionNote').textContent=period+' · Đơn vị: triệu đồng / nhân sự · Bình quân nhóm: demo';
  if(!costRows.length)$('payRegionBars').innerHTML='<div class="empty-cell">Không có dữ liệu phù hợp bộ lọc</div>';
  if(!incentiveRows.length)$('payIncentiveBars').innerHTML='<div class="empty-cell">Không có dữ liệu Incentive phù hợp bộ lọc</div>';
  if(!avgRows.length)$('payPositionBars').innerHTML='<div class="empty-cell">Không có dữ liệu phù hợp bộ lọc</div>';
 }
 function payRender(){if(window.STAFFING_NATIVE_DATA)return;
  const y=+val('payYear'),m=+val('payMonth');
  let f=filterFactor(val('payRegion'),val('payPosition'),val('payProvince'));
  if(val('payProject')!=='All')f*=.48;
  const type=val('payType');
  const mix=type==='Fixed'?[13.1,0,0]:type==='Variable'?[0,3.72,0]:type==='Allowance'?[0,0,1.6]:[13.1,3.72,1.6];
  const lastMonth=y===2026?10:12;
  const prevYear=(y===2026?2025:2025);
  const currentSource=payMonthly[y].map((v,i)=>i<lastMonth?Number(v):null);
  const prevSource=payMonthly[prevYear].map(v=>Number(v));
  const mixTotal=mix.reduce((a,b)=>a+b,0);
  const baseTotal=18.42;
  const scale=mixTotal/baseTotal;
  const currentTrend=currentSource.map(v=>v==null?null:+(v*f*scale).toFixed(2));
  const prevTrend=prevSource.map(v=>+(v*f*scale).toFixed(2));
  const periodMonth=(m&&m<=lastMonth)?m:lastMonth;
  const monthsCount=m?1:lastMonth;
  const currentValue=m?(currentTrend[m-1]||0):currentTrend.slice(0,lastMonth).reduce((a,b)=>a+(b||0),0);
  const prevValue=m?(prevTrend[m-1]||0):prevTrend.slice(0,lastMonth).reduce((a,b)=>a+(b||0),0);
  const factor=(currentValue/baseTotal)*f || 0;
  const vals=mix.map(x=>x*factor),total=vals.reduce((a,b)=>a+b,0);
  const hcSeries=demo[y]?.new||[];
  const hcCurrentSeries=demo[y]?.new||[];
  const hcBaseSeries=demo[y]?.hc||[];
  const prevHcBaseSeries=demo[prevYear]?.hc||[];
  const hc=(Math.max(1,Math.round(((hcBaseSeries[(periodMonth||1)-1]||hcBaseSeries[lastMonth-1]||3063)*f/11.1))));
  const hcPrev=(Math.max(1,Math.round(((prevHcBaseSeries[(periodMonth||1)-1]||prevHcBaseSeries[lastMonth-1]||2520)*f/8))));
  const avgCurrent=hc?total*1000/(hc*monthsCount):0;
  const prevMixTotal=(type==='Fixed'?13.1:type==='Variable'?3.72:type==='Allowance'?1.6:18.42);
  const prevFactor=(prevValue/baseTotal)*f || 0;
  const prevVals=(type==='Fixed'?[13.1,0,0]:type==='Variable'?[0,3.72,0]:type==='Allowance'?[0,0,1.6]:[13.1,3.72,1.6]).map(x=>x*prevFactor);
  const prevTotal=prevVals.reduce((a,b)=>a+b,0);
  const avgPrev=hcPrev?prevTotal*1000/(hcPrev*monthsCount):0;
  const incentiveCur=vals[1]||0, incentivePrev=prevVals[1]||0;

  const avgTrendCurrent=currentTrend.map((v,i)=>{
    if(v==null)return null;
    const hcMonth=Math.max(1,Math.round((hcBaseSeries[i]||1)*f/11.1));
    return +(v*1000/hcMonth).toFixed(1);
  });
  const avgTrendPrev=prevTrend.map((v,i)=>{
    const hcMonth=Math.max(1,Math.round((prevHcBaseSeries[i]||1)*f/8));
    return +(v*1000/hcMonth).toFixed(1);
  });

  const pct=(curr,prev)=>prev?((curr-prev)/prev*100):0;
  const pctText=n=>(n>=0?'+':'')+n.toFixed(1).replace('.',',')+'%';
  const numText=n=>Math.round(n).toLocaleString('vi-VN');
  const bnText=n=>n.toFixed(2).replace('.',',')+' tỷ';
  const mnText=n=>n.toFixed(2).replace('.',',')+' triệu';
  const setDelta=(id,n)=>{const el=$(id); if(el){el.textContent=pctText(n); el.classList.toggle('neg',n<0);} };

  $('payTopHC').textContent=numText(hc);
  $('payTopHCCompare').textContent='Cùng kỳ: '+numText(hcPrev);
  setDelta('payTopHCVar',pct(hc,hcPrev));
  $('payTopTotal').textContent=bnText(currentValue);
  $('payTopTotalCompare').textContent='Cùng kỳ: '+bnText(prevValue);
  setDelta('payTopTotalVar',pct(currentValue,prevValue));
  $('payTopIncentive').textContent=bnText(incentiveCur);
  $('payTopIncentiveCompare').textContent='Cùng kỳ: '+bnText(incentivePrev);
  setDelta('payTopIncentiveVar',pct(incentiveCur,incentivePrev));
  $('payTopAvg').textContent=mnText(avgCurrent);
  $('payTopAvgCompare').textContent='Cùng kỳ: '+mnText(avgPrev);
  setDelta('payTopAvgVar',pct(avgCurrent,avgPrev));

  // Keep lower section calculations consistent with selected period
  payRenderDimensions({total,average:avgCurrent,components:vals,year:y,month:m});
  let rows=payRows.filter(r=>(val('payRegion')==='All'||r[2]===val('payRegion'))&&(val('payPosition')==='All'||r[3]===val('payPosition')));
  if(type==='Fixed')rows=rows.map(r=>[...r.slice(0,4),r[4],0,0]);
  if(type==='Variable')rows=rows.map(r=>[...r.slice(0,4),0,r[5],0]);
  if(type==='Allowance')rows=rows.map(r=>[...r.slice(0,4),0,0,r[6]]);
  const rowFactor = currentValue? currentValue/18.42 : 0;
  $('payRows').innerHTML=rows.map(r=>{const a=r[4]*rowFactor,b=r[5]*rowFactor,c=r[6]*rowFactor;return `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${m?'T'+String(m).padStart(2,'0')+'/'+y:'YTD T01–T'+String(lastMonth).padStart(2,'0')+'/'+y}</td><td>${a.toFixed(2)} tr</td><td>${b.toFixed(2)} tr</td><td>${c.toFixed(2)} tr</td><td><b>${(a+b+c).toFixed(2)} tr</b></td></tr>`}).join('')||'<tr><td colspan="9" class="empty-cell">Không có nhân sự phù hợp bộ lọc</td></tr>';
  const note=$('payPeriodNote');if(note)note.textContent=m?`Chi phí tháng ${String(m).padStart(2,'0')}/${y} · Nhấn lại T${m} để xem YTD`:`Chi phí lũy kế T01–T${String(lastMonth).padStart(2,'0')}/${y} (YTD)`;
  payTrendChart(currentTrend,prevTrend,m,y,'payTrend',{valueSuffix:' tỷ', decimals:1});
  const incentiveShare = type==='Fixed'||type==='Allowance'?0:type==='Variable'?1:3.72/18.42;
  const incentiveTrendCurrent=currentTrend.map(v=>v==null?null:+(v*incentiveShare).toFixed(3));
  const incentiveTrendPrev=prevTrend.map(v=>v==null?null:+(v*incentiveShare).toFixed(3));
  payTrendChart(incentiveTrendCurrent,incentiveTrendPrev,m,y,'payIncentiveTrend',{valueSuffix:' tỷ', decimals:2});
  payTrendChart(avgTrendCurrent,avgTrendPrev,m,y,'payAvgTrend',{valueSuffix:' triệu', decimals:1});
 }
 function payTrendChart(currentValues,compareValues,selected,year,targetId,options={}){
  const el=$(targetId);if(!el)return;
  const decimals=options.decimals??1;
  const values=[...currentValues.filter(v=>v!=null),...compareValues.filter(v=>v!=null)];
  const max=Math.max(1,...values)*1.18;
  const w=620,h=210,m={l:36,r:12,t:22,b:32};
  const innerW=w-m.l-m.r, innerH=h-m.t-m.b;
  const x=i=>m.l + innerW*(i/11);
  const yVal=v=>m.t + innerH - (v/max)*innerH;
  const makePath=vals=>vals.reduce((acc,v,i)=>{ if(v==null)return acc; const cmd=(acc?'L':'M')+x(i)+' '+yVal(v); return acc+cmd; },'');
  const currentPath=makePath(currentValues), comparePath=makePath(compareValues);
  const guideY=[0,.25,.5,.75,1].map(p=>m.t+innerH*p);
  const grid=guideY.map(y=>`<line class="payline-grid" x1="${m.l}" y1="${y}" x2="${w-m.r}" y2="${y}"/>`).join('');
  const xLabels=months.map((mo,i)=>`<text class="payline-x${selected===i+1?' selected':''}" x="${x(i)}" y="${h-7}" text-anchor="middle">${mo}</text>`).join('');
  const yLabels=[0,.25,.5,.75,1].map((p,idx)=>{const val=(max*(1-p)); return `<text class="payline-y" x="${m.l-8}" y="${guideY[idx]+4}" text-anchor="end">${val.toFixed(decimals).replace('.',',')}</text>`;}).join('');
  const selectedGuide=(selected&&currentValues[selected-1]!=null)?`<line class="payline-guide" x1="${x(selected-1)}" y1="${m.t}" x2="${x(selected-1)}" y2="${h-m.b}"/>`:'';
  const comparePoints=compareValues.map((v,i)=>v==null?'':`<circle class="payline-point compare" cx="${x(i)}" cy="${yVal(v)}" r="2.6"/>`).join('');
  const currentPoints=currentValues.map((v,i)=>{ if(v==null) return ''; const sel=selected===i+1; return `<circle class="payline-point${sel?' selected':''}" cx="${x(i)}" cy="${yVal(v)}" r="${sel?4.3:3.1}"/>`; }).join('');
  const currentLabels=currentValues.map((v,i)=>{ if(v==null) return ''; const sel=selected===i+1; return `<text class="payline-label${sel?' selected':''}" x="${x(i)}" y="${yVal(v)-9}" text-anchor="middle">${v.toFixed(decimals).replace('.',',')}</text>`; }).join('');
  const hits=months.map((mo,i)=>`<rect class="payline-hit" data-month="${i+1}" x="${x(i)-16}" y="0" width="32" height="${h}" rx="2"/>`).join('');
  el.innerHTML=`<svg class="payline-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Biểu đồ payroll ${targetId}">${grid}<line class="payline-axis" x1="${m.l}" y1="${h-m.b}" x2="${w-m.r}" y2="${h-m.b}"/>${yLabels}${selectedGuide}<path class="payline-compare" d="${comparePath}"/><path class="payline-current" d="${currentPath}"/>${comparePoints}${currentPoints}${currentLabels}${xLabels}${hits}</svg>`;
 }
 document.querySelectorAll('#recFilters select').forEach(x=>x.addEventListener('change',recRender));
 // Click lại cùng tháng hoặc chọn 'Lũy kế năm / Tất cả' để quay về YTD.
 const recSelectMonth=month=>{const monthFilter=$('recMonth');monthFilter.value=String(Number(monthFilter.value)===month?0:month);recRender();};
 $('recTrend').addEventListener('click',event=>{const col=event.target.closest('.rec-month-col');if(col&&$('recTrend').contains(col))recSelectMonth(Number(col.dataset.month));});
 $('recTrend').addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const col=event.target.closest('.rec-month-col');if(col&&$('recTrend').contains(col)){event.preventDefault();recSelectMonth(Number(col.dataset.month));$('recTrend').querySelector(`[data-month="${col.dataset.month}"]`)?.focus();}});
 document.getElementById('recVacancyDimension').addEventListener('change',recRender);document.querySelectorAll('#payFilters select').forEach(x=>x.addEventListener('change',payRender));$('payCostDimension').addEventListener('change',payRender);$('payAvgDimension').addEventListener('change',payRender);$('payIncentiveDimension').addEventListener('change',payRender);const payChartClick=e=>{const hit=e.target.closest('.payline-hit');if(!hit)return;const month=Number(hit.dataset.month);$('payMonth').value=String(Number($('payMonth').value)===month?0:month);payRender();};$('payTrend').addEventListener('click',payChartClick);$('payIncentiveTrend').addEventListener('click',payChartClick);$('payAvgTrend').addEventListener('click',payChartClick);window.exportDemoTable=(id,name)=>{let t=$(id);if(!t)return;let csv=[...t.rows].map(r=>[...r.cells].map(c=>'"'+c.innerText.replace(/"/g,'""')+'"').join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();URL.revokeObjectURL(a.href)};recRender();payRender();
})();
