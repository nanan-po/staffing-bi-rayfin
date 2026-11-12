/* AcacyONE Staffing BI | v153-recruitment-green-redesign-script */
(function(){
  const $=id=>document.getElementById(id);
  function ensureRecruitmentKpiStrip(){
    const page=$('pageREC');
    const filters=$('recFilters');
    if(!page||!filters) return null;
    let strip=page.querySelector('.rec-kpi-strip');
    if(strip) return strip;
    strip=document.createElement('section');
    strip.className='rec-kpi-strip';
    strip.setAttribute('aria-label','Tổng quan KPI tuyển dụng');
    strip.innerHTML=[
      ['recKpiTotal','📋','Tổng yêu cầu','--','100% tổng yêu cầu'],
      ['recKpiOpen','👥','Đang tuyển','--','--'],
      ['recKpiDone','✅','Đã tuyển','--','--'],
      ['recKpiFill','🎯','Tỷ lệ lấp đầy','--','Đã tuyển / Tổng yêu cầu'],
      ['recKpiSLA','☑','SLA đúng hạn','--','--']
    ].map((item,idx)=>`<article class="rec-kpi-card ${idx===0?'is-primary':''}"><div class="rec-kpi-content"><p class="rec-kpi-label">${item[2]}</p><p class="rec-kpi-value" id="${item[0]}">${item[3]}</p><p class="rec-kpi-sub" id="${item[0]}Sub">${item[4]}</p></div></article>`).join('');
    filters.insertAdjacentElement('afterend',strip);
    return strip;
  }
  function syncRecruitmentKpiStrip(){
    ensureRecruitmentKpiStrip();
    const total=$('recTotal')?.textContent?.trim()||'--';
    const open=$('recProcessing')?.textContent?.trim()||'--';
    const done=$('recDone')?.textContent?.trim()||'--';
    const totalSub='100% tổng yêu cầu';
    const openSub=$('recProcessingPercent')?.textContent?.trim()||'--';
    const doneSub=$('recDonePercent')?.textContent?.trim()||'--';
    const fill=$('recDonePercent')?.textContent?.trim()?.split(' ')[0]||'--';
    const sla=$('recOnTime')?.textContent?.trim()||'--';
    const slaNote=$('recOnTimeNote')?.textContent?.trim()||'--';
    if($('recKpiTotal')) $('recKpiTotal').textContent=total;
    if($('recKpiTotalSub')) $('recKpiTotalSub').textContent=totalSub;
    if($('recKpiOpen')) $('recKpiOpen').textContent=open;
    if($('recKpiOpenSub')) $('recKpiOpenSub').textContent=openSub;
    if($('recKpiDone')) $('recKpiDone').textContent=done;
    if($('recKpiDoneSub')) $('recKpiDoneSub').textContent=doneSub;
    if($('recKpiFill')) $('recKpiFill').textContent=fill;
    if($('recKpiFillSub')) $('recKpiFillSub').textContent='Đã tuyển / Tổng yêu cầu';
    if($('recKpiSLA')) $('recKpiSLA').textContent=sla;
    if($('recKpiSLASub')) $('recKpiSLASub').textContent=slaNote;
    const exportBtn=$('pageREC')?.querySelector('.module-table .outline-action');
    if(exportBtn) exportBtn.textContent='Xuất Excel';
  }
  const tryPatch=()=>{
    ensureRecruitmentKpiStrip();
    syncRecruitmentKpiStrip();
    if(typeof window.recRender==='function' && !window.recRender.__v153patched){
      const original=window.recRender;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        syncRecruitmentKpiStrip();
        return result;
      };
      wrapped.__v153patched=true;
      window.recRender=wrapped;
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tryPatch);
  else tryPatch();
  setTimeout(syncRecruitmentKpiStrip,0);
  setTimeout(syncRecruitmentKpiStrip,200);
})();
