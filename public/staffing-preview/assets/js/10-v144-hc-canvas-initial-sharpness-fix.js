/* AcacyONE Staffing BI | v144-hc-canvas-initial-sharpness-fix */
/* Render both canvas charts at their FINAL CSS size.
   The earlier initial draw can run before the flex/grid sizing finishes,
   leaving a lower-resolution bitmap stretched until the user clicks. */
(function(){
  'use strict';
  let frame=0;
  window.staffingChartDPR=()=>Math.min(3,Math.max(2,window.devicePixelRatio||1));
  function needsRedraw(el){
    if (!el || !el.getClientRects().length) return false;
    const r=el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const ratio=window.staffingChartDPR();
    return Math.abs(el.width-Math.round(r.width*ratio))>1 ||
           Math.abs(el.height-Math.round(r.height*ratio))>1;
  }
  function renderIfRequired(force){
    if (!document.querySelector('#pageHC.page-view.active')) return;
    const trend=document.getElementById('trend');
    const quit=document.getElementById('quitTrend');
    const trendChanged=force||needsRedraw(trend);
    if(window.STAFFING_NATIVE_DATA){
      if(trendChanged&&typeof window.staffingNativeRefresh==='function')window.staffingNativeRefresh();
    }else{
      if(trendChanged&&typeof drawTrend==='function')drawTrend();
      if((force||needsRedraw(quit))&&typeof drawQuitTrend==='function')drawQuitTrend();
    }
  }
  function schedule(force){
    if (frame) cancelAnimationFrame(frame);
    frame=requestAnimationFrame(function(){
      frame=requestAnimationFrame(function(){
        frame=0;
        renderIfRequired(Boolean(force));
      });
    });
  }
  function init(){
    schedule(false);
    if (window.ResizeObserver){
      const observer=new ResizeObserver(()=>schedule(false));
      ['trend','quitTrend'].forEach(id=>{
        const canvas=document.getElementById(id);
        if(canvas)observer.observe(canvas);
      });
    }
    window.addEventListener('load',()=>schedule(false),{once:true});
    window.addEventListener('resize',()=>schedule(false),{passive:true});
    window.addEventListener('pageshow',()=>schedule(false));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(false)});
    document.querySelectorAll('.module-tab').forEach(tab=>{
      tab.addEventListener('click',()=>schedule(false));
    });
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(()=>schedule(false)).catch(()=>{});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
