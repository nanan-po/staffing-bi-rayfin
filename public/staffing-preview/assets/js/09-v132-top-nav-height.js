/* AcacyONE Staffing BI | v132-top-nav-height */
(function(){
 const n=document.querySelector('.acacy-sidebar');
 if(!n)return;
 const sync=()=>document.documentElement.style.setProperty('--acacy-topnav-h',Math.ceil(n.getBoundingClientRect().height)+'px');
 sync();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);
 window.addEventListener('resize',sync,{passive:true});
 if(window.ResizeObserver)new ResizeObserver(sync).observe(n);
})();
