/* AcacyONE Staffing BI | v127-acacy-presentation-only */
(function(){
 'use strict';
 const $=id=>document.getElementById(id), fmt=n=>Number(n).toLocaleString('en-US');
 const colors=['#0751be','#119af2','#60cbff','#9fdefe','#497bd9','#88b5f4','#b8d7f8','#dceaff'];
 function groupsFromExistingBars(){
  return Array.from(document.querySelectorAll('#currentCompositionBars .quit-composition-row')).map(row=>({
   label:(row.querySelector('.quit-composition-label')?.textContent||'Nhóm khác').trim(),
   count:Number((row.querySelector('.quit-composition-value')?.textContent||'0').replace(/[^\d]/g,''))||0
  })).filter(g=>g.count>0);
 }
 function draw(){
  const donut=$('hcDonut'),legend=$('hcDonutLegend'),donutTotal=$('hcDonutTotal');if(!donut||!legend)return;
  const current=Number(($('kpiCurrent')?.textContent||'0').replace(/[^\d]/g,''))||0;
  const y=Number($('year')?.value||2026),yearData=typeof demo!=='undefined'?demo[y]:null;
  const month=Number($('month')?.value||0)||((y===2026)?10:12);
  const region=$('region')?.value||'All',position=$('position')?.value||'All',province=$('province')?.value||'All';
  const hasFilter=region!=='All'||position!=='All'||province!=='All'||($('tbhv')?.value||'All')!=='All'||($('cvql')?.value||'All')!=='All';
  const groups=groupsFromExistingBars(),sum=groups.reduce((s,g)=>s+g.count,0);
  donutTotal.textContent=fmt(sum||current);
  const display=groups.length>4?[...groups.slice(0,3),{label:'Nhóm khác',count:groups.slice(3).reduce((s,g)=>s+g.count,0)}]:groups;
  let cursor=0;const stops=[];
  display.forEach((g,i)=>{const extent=sum?g.count/sum*100:0;stops.push(`${colors[i%colors.length]} ${cursor.toFixed(3)}% ${(cursor+extent).toFixed(3)}%`);cursor+=extent});
  donut.style.background=stops.length?`conic-gradient(${stops.join(',')})`:'#e6f2f4';
  donut.setAttribute('aria-label',display.map(g=>`${g.label}: ${fmt(g.count)} nhân sự`).join(', ')||'Chưa có cơ cấu nhân sự');
  legend.replaceChildren();
  display.forEach((g,i)=>{const row=document.createElement('div');row.className='hc-legend-item';const dot=document.createElement('span');dot.className='hc-legend-dot';dot.style.background=colors[i];const label=document.createElement('span');label.className='hc-legend-name';label.textContent=g.label;const val=document.createElement('span');val.className='hc-legend-value';val.textContent=`${fmt(g.count)} (${sum?(100*g.count/sum).toFixed(1):'0.0'}%)`;row.append(dot,label,val);legend.appendChild(row)});
  if(!display.length)legend.textContent='Chưa có dữ liệu theo bộ lọc';
  const dim=$('currentCompositionDimension');$('hcDonutCaption').textContent=`Cơ cấu theo ${dim?.selectedOptions[0]?.textContent||'Miền'} · ${String(month).padStart(2,'0')}/${y}`;
  const first=yearData?.hc?.[0];const last=yearData?.hc?.[month-1];const delta=Number(last||0)-Number(first||0);const deltaPct=first?100*delta/first:0;
  const growth=$('hcGrowthChip');const context=$('hcGrowthContext');
  if(growth){growth.textContent=hasFilter?'Theo bộ lọc':(delta>=0?'+':'−')+fmt(Math.abs(delta))+' NV';growth.style.color=delta>=0?'#167d40':'#b85b41';}
  if(context)context.textContent=hasFilter?'Đã áp dụng bộ lọc':(delta>=0?'+':'')+deltaPct.toFixed(1)+'% so đầu năm';
  const noteGrowth=$('hcNoteGrowth');
  if(noteGrowth){noteGrowth.textContent=hasFilter?`Quy mô hiện tại theo bộ lọc: ${fmt(current)} nhân sự.`:first?`Quy mô nhân sự ${delta>=0?'tăng':'giảm'} ${fmt(Math.abs(delta))} người (${delta>=0?'+':''}${deltaPct.toFixed(1)}%) so với tháng 01/${y}.`:'Dữ liệu chưa đủ để so sánh biến động đầu năm.';}
  const rate=yearData?.quit?.[month-1],prevRate=month>1?yearData?.quit?.[month-2]:null;
  const rateText=Number.isFinite(rate)?`${rate.toFixed(1)}%`:($('quitTrendNote')?.textContent||'--');
  const noteQuit=$('hcNoteQuit');
  if(noteQuit)noteQuit.textContent=Number.isFinite(rate)&&Number.isFinite(prevRate)?`Tỷ lệ nghỉ việc ${rateText}, ${rate>prevRate?'tăng':rate<prevRate?'giảm':'không đổi'} ${Math.abs(rate-prevRate).toFixed(1)} điểm % so với tháng trước.`:`Tỷ lệ nghỉ việc kỳ hiện tại: ${rateText}.`;
  const noteShare=$('hcNoteShare');
  if(noteShare){const g=groups[0];noteShare.textContent=g?`${g.label} chiếm ${(g.count/(sum||1)*100).toFixed(1)}% tổng nhân sự (${fmt(g.count)} người), cao nhất trong các nhóm.`:'Chưa có dữ liệu nhóm nhân sự cho kỳ đang xem.';}
 }
 let pending=false;
 function queueDraw(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;try{draw()}catch(e){console.warn('HC infographic:',e)}})}
 const bars=$('currentCompositionBars');if(bars)new MutationObserver(queueDraw).observe(bars,{childList:true,subtree:true,characterData:true});
 const current=$('kpiCurrent');if(current)new MutationObserver(queueDraw).observe(current,{characterData:true,childList:true,subtree:true});
 for(const id of ['year','month','region','province','position','tbhv','cvql','currentCompositionDimension'])$(id)?.addEventListener('change',queueDraw);
 document.querySelectorAll('.acacy-side-item').forEach(button=>button.addEventListener('click',function(){
  const page=this.dataset.sidePage,action=this.dataset.sideAction;
  if(page){const tab=document.querySelector(`.module-tab[data-page="${page}"]`);if(tab)tab.click();else if(page==='HC')document.querySelector('.module-tab[data-page="HC"]')?.click();}
  if(action==='settings'){document.body.classList.toggle('acacy-compact');this.title=document.body.classList.contains('acacy-compact')?'Đang bật chế độ thu gọn biểu đồ':'Nhấn để thu gọn chú thích biểu đồ';}
  if(page){document.querySelectorAll('.acacy-side-item').forEach(b=>b.classList.remove('active'));this.classList.add('active');}
 }));
 document.querySelectorAll('.module-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.acacy-side-item').forEach(b=>b.classList.toggle('active',b.dataset.sidePage===tab.dataset.page&&b.textContent.trim()!=='Tổng quan'));
 }));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueDraw);else queueDraw();
 window.addEventListener('resize',()=>{queueDraw();if(typeof drawTrend==='function')drawTrend();if(typeof drawQuitTrend==='function')drawQuitTrend();});
})();
