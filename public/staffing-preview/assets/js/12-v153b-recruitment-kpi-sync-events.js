/* AcacyONE Staffing BI | v153b-recruitment-kpi-sync-events */
(function(){
  function afterRender(){
    const fn=window.document.getElementById('recKpiTotal')?()=>{
      const total=document.getElementById('recTotal')?.textContent?.trim()||'--';
      const open=document.getElementById('recProcessing')?.textContent?.trim()||'--';
      const done=document.getElementById('recDone')?.textContent?.trim()||'--';
      const fill=(document.getElementById('recDonePercent')?.textContent?.trim()||'--').split(' ')[0];
      const sla=document.getElementById('recOnTime')?.textContent?.trim()||'--';
      const map={recKpiTotal:total,recKpiOpen:open,recKpiDone:done,recKpiFill:fill,recKpiSLA:sla,recKpiOpenSub:document.getElementById('recProcessingPercent')?.textContent?.trim()||'--',recKpiDoneSub:document.getElementById('recDonePercent')?.textContent?.trim()||'--',recKpiSLASub:document.getElementById('recOnTimeNote')?.textContent?.trim()||'--'};
      Object.entries(map).forEach(([id,val])=>{const el=document.getElementById(id); if(el) el.textContent=val;});
    }:()=>{};
    setTimeout(fn,0);
  }
  function bind(){
    document.querySelectorAll('#recFilters select').forEach(el=>el.addEventListener('change',afterRender));
    document.getElementById('recVacancyDimension')?.addEventListener('change',afterRender);
    document.getElementById('recTrend')?.addEventListener('click',afterRender);
    document.getElementById('recTrend')?.addEventListener('keydown',afterRender);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
