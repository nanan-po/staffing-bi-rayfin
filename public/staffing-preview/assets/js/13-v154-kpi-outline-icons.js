/* AcacyONE Staffing BI | v154-kpi-outline-icons */
(function(){
 const paths=[
  '<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 10h6M9 14h6M9 18h4"/>',
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16m-12 5 3 3 5-5"/>'
 ];
 const apply=()=>document.querySelectorAll('#pageREC .rec-kpi-strip .rec-kpi-icon').forEach((el,i)=>{if(paths[i])el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+paths[i]+'</svg>';});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
