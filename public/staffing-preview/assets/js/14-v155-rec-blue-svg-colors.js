/* AcacyONE Staffing BI | v155-rec-blue-svg-colors */
(function(){
  function recolorRecBlue(){
    const svg=document.querySelector('#pageREC .rec-source-infographic');
    if(svg){
      const palette=['#0f4fc4','#1c69e3','#1f78ff','#33a1ff'];
      svg.querySelectorAll('[data-segment-index]').forEach((el,i)=>{el.setAttribute('fill', palette[i % palette.length]);});
      svg.querySelectorAll('.rec-source-bullet').forEach((el,i)=>{el.setAttribute('fill', palette[i % palette.length]);});
    }
    const trend=document.querySelectorAll('#pageREC .demo-chart svg .series-line, #pageREC .demo-chart svg .point');
    trend.forEach((el)=>{
      if(el.classList.contains('series-line')) { el.setAttribute('stroke','#1f78ff'); }
      else { el.setAttribute('fill','#1f78ff'); el.setAttribute('stroke','#ffffff'); }
    });
    document.querySelectorAll('#pageREC .demo-chart svg .series-area').forEach(el=>el.setAttribute('fill','rgba(31,120,255,0.12)'));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{setTimeout(recolorRecBlue,50);setTimeout(recolorRecBlue,400);});
  else {setTimeout(recolorRecBlue,50);setTimeout(recolorRecBlue,400);} 
  document.querySelectorAll('#recFilters select').forEach(el=>el.addEventListener('change',()=>setTimeout(recolorRecBlue,50)));
})();
