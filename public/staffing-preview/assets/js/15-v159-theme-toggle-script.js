/* AcacyONE Staffing BI | v159-theme-toggle-script */
(function(){
  const THEME_KEY='acacy_theme';
  const COMPACT_KEY='acacy_compact';
  function applyTheme(mode){
    document.body.classList.toggle('acacy-dark', mode==='dark');
    try{localStorage.setItem(THEME_KEY,mode);}catch(e){}
    const darkInput=document.getElementById('themeDark');
    const lightInput=document.getElementById('themeLight');
    if(darkInput) darkInput.checked = mode==='dark';
    if(lightInput) lightInput.checked = mode!=='dark';
    requestAnimationFrame(()=>{try{if(typeof drawTrend==='function') drawTrend();if(typeof drawQuitTrend==='function') drawQuitTrend();}catch(_e){}});
  }
  function applyCompact(enabled){
    document.body.classList.toggle('acacy-compact', !!enabled);
    try{localStorage.setItem(COMPACT_KEY, enabled?'1':'0');}catch(e){}
    const compact=document.getElementById('compactToggle');
    if(compact) compact.checked=!!enabled;
  }
  function ensurePopover(){
    if(document.getElementById('acacySettingsPopover')) return;
    const pop=document.createElement('div');
    pop.id='acacySettingsPopover';
    pop.className='acacy-settings-popover';
    pop.setAttribute('role','dialog');
    pop.setAttribute('aria-label','Cài đặt giao diện');
    pop.innerHTML=`
      <div class="acacy-settings-head">
        <div><strong>Cài đặt giao diện Dashboard</strong><span>Chọn chế độ sáng hoặc tối cho người xem.</span></div>
        <button type="button" class="acacy-settings-close" aria-label="Đóng">×</button>
      </div>
      <div class="acacy-settings-group">
        <div class="acacy-settings-label">Chế độ hiển thị</div>
        <div class="acacy-theme-options">
          <label class="acacy-theme-option">
            <input type="radio" name="acacyThemeMode" id="themeLight" value="light">
            <span class="swatch light" aria-hidden="true"></span>
            <span class="meta"><b>Dashboard sáng</b><small>Nền trắng, dễ nhìn trong môi trường văn phòng.</small></span>
          </label>
          <label class="acacy-theme-option">
            <input type="radio" name="acacyThemeMode" id="themeDark" value="dark">
            <span class="swatch dark" aria-hidden="true"></span>
            <span class="meta"><b>Dashboard tối</b><small>Giảm chói mắt, phù hợp khi trình chiếu hoặc xem buổi tối.</small></span>
          </label>
        </div>
      </div>
      <div class="acacy-settings-group">
        <div class="acacy-toggle-row">
          <div class="meta"><b>Thu gọn chú thích</b><small>Ẩn bớt ghi chú phụ của Headcount để màn hình gọn hơn.</small></div>
          <label class="acacy-switch"><input type="checkbox" id="compactToggle"><span></span></label>
        </div>
      </div>`;
    document.body.appendChild(pop);
    pop.querySelector('.acacy-settings-close').addEventListener('click',()=>pop.classList.remove('open'));
    pop.querySelectorAll('input[name="acacyThemeMode"]').forEach(input=>input.addEventListener('change',e=>applyTheme(e.target.value)));
    pop.querySelector('#compactToggle').addEventListener('change',e=>applyCompact(e.target.checked));
  }
  function openPopover(){ensurePopover();document.getElementById('acacySettingsPopover').classList.add('open');}
  function closePopover(){document.getElementById('acacySettingsPopover')?.classList.remove('open');}
  document.addEventListener('click',function(e){
    const settingsBtn=e.target.closest('.acacy-side-item[data-side-action="settings"]');
    if(settingsBtn){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
      const pop=document.getElementById('acacySettingsPopover');
      if(pop && pop.classList.contains('open')) closePopover(); else openPopover();
      return;
    }
    const pop=e.target.closest('#acacySettingsPopover');
    if(!pop) closePopover();
  }, true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closePopover();});
  function initTheme(){
    ensurePopover();
    let saved='light'; let compact='0';
    try{saved=localStorage.getItem(THEME_KEY)||'light'; compact=localStorage.getItem(COMPACT_KEY)||'0';}catch(e){}
    applyTheme(saved==='dark'?'dark':'light');
    applyCompact(compact==='1');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initTheme); else initTheme();
})();
