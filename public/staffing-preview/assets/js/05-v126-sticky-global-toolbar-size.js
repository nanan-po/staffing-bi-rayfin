/* AcacyONE Staffing BI | v126-sticky-global-toolbar-size */
(function(){
  function updateStickyOffsets(){
    var header=document.querySelector('.shell > .header');
    var subline=document.querySelector('.page-view.active > .subline');
    if(header)document.documentElement.style.setProperty('--sticky-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
    document.documentElement.style.setProperty('--sticky-subline-height',subline?Math.ceil(subline.getBoundingClientRect().height)+'px':'0px');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
  function start(){
    updateStickyOffsets();
    window.addEventListener('resize',updateStickyOffsets,{passive:true});
    if(window.ResizeObserver){
      var obs=new ResizeObserver(updateStickyOffsets);
      var header=document.querySelector('.shell > .header');
      if(header)obs.observe(header);
      document.querySelectorAll('.page-view > .subline').forEach(function(el){obs.observe(el)});
    }
    /* Update after switching the active module, preserving existing navigation handlers. */
    document.querySelectorAll('.module-tab').forEach(function(el){
      el.addEventListener('click',function(){requestAnimationFrame(updateStickyOffsets)});
    });
  }
})();
