/* AcacyONE Staffing BI | v180-flat-header-filter-mount */
(function(){
  'use strict';
  const pairs={HC:'filters',REC:'recFilters',ATD:'attFilters',PAYROLL:'payFilters'};
  const slot=document.getElementById('dashboardFilterSlot');
  if(!slot)return;
  function activeModule(){
    const page=document.querySelector('.page-view.active');
    return page ? page.id.slice(4) : 'HC';
  }
  function sync(){
    const active=pairs[activeModule()]||pairs.HC;
    for(const id of Object.values(pairs)){
      const filter=document.getElementById(id);
      if(filter){
        filter.classList.toggle('is-active',id===active);
        filter.setAttribute('aria-hidden',id===active?'false':'true');
      }
    }
    // Update Data remains tied to the currently selected dashboard period.
    const current=document.querySelector('.page-view.active');
    const map={pageHC:['year','month'],pageREC:['recYear','recMonth'],pageATD:['attYear','attMonth'],pagePAYROLL:['payYear','payMonth']};
    const ids=map[current?.id]||map.pageHC;
    const year=document.getElementById(ids[0])?.value;
    const month=document.getElementById(ids[1])?.value;
    const period=document.getElementById('staffingApiPeriod');
    if(period&&year)period.textContent=month&&month!=='0'?String(month).padStart(2,'0')+'/'+year:'YTD '+year;
  }
  function mount(){
    for(const id of Object.values(pairs)){
      const el=document.getElementById(id);
      if(el)slot.appendChild(el); // Move real controls: event listeners and filter values stay intact.
    }
    sync();
    document.querySelectorAll('.module-tab').forEach(tab=>tab.addEventListener('click',()=>requestAnimationFrame(sync)));
    for(const id of Object.values(pairs))document.getElementById(id)?.addEventListener('change',sync);
    window.staffingSyncHeaderFilters=sync;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();
