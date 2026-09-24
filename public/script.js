document.querySelectorAll('.menu-btn').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('.site-header nav')?.classList.toggle('open')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Jemné červené častice v pozadí – bez externých knižníc.
const emberLayer=document.querySelector('.embers');
if(emberLayer){
  for(let i=0;i<86;i++){
    const e=document.createElement('i'); e.className='ember';
    e.style.left=`${Math.random()*100}%`; e.style.top=`${Math.random()*115}%`;
    e.style.animationDuration=`${12+Math.random()*16}s`; e.style.animationDelay=`-${Math.random()*24}s`;
    emberLayer.appendChild(e);
  }
}

// Balík z URL alebo z tlačidla vložíme automaticky do formulára.
const params=new URLSearchParams(location.search); const packageSelect=document.querySelector('#paket');
if(packageSelect && params.get('paket')) packageSelect.value=params.get('paket');
document.querySelectorAll('[data-package]').forEach(a=>a.addEventListener('click',()=>sessionStorage.setItem('mholly-package',a.dataset.package)));
if(packageSelect && sessionStorage.getItem('mholly-package')){packageSelect.value=sessionStorage.getItem('mholly-package');sessionStorage.removeItem('mholly-package')}

// Projektformular: prüfen -> Regeln bestätigen -> über M.HOLLY Backend senden.
const form=document.querySelector('#project-form');
const modal=document.querySelector('#rules-modal');
const closeModal=document.querySelectorAll('[data-close-modal]');
const confirmBtn=document.querySelector('#confirm-submit');
const formStatus=document.querySelector('#form-status');
const successOverlay=document.querySelector('#success-overlay');
const successOrder=document.querySelector('#success-order-id');
const successClose=document.querySelector('#success-close');
if(form && modal && confirmBtn){
  const submitBtn=form.querySelector('button[type="submit"]');
  const resetButton=()=>{confirmBtn.disabled=false;confirmBtn.textContent='Anfrage jetzt senden →';if(submitBtn)submitBtn.disabled=false};
  const showError=(text)=>{if(!formStatus)return;formStatus.className='form-status error';formStatus.innerHTML=`<strong>Bitte prüfen</strong><span>${text}</span>`;formStatus.hidden=false;formStatus.style.display='grid';formStatus.scrollIntoView({behavior:'smooth',block:'center'})};
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;if(formStatus){formStatus.hidden=true;formStatus.style.display='none'}modal.classList.add('open');document.body.style.overflow='hidden'});
  const close=()=>{modal.classList.remove('open');document.body.style.overflow=''};
  closeModal.forEach(b=>b.addEventListener('click',close));
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  confirmBtn.addEventListener('click',async()=>{
    const rules=document.querySelector('#rules-confirm');
    if(!rules?.checked){rules?.focus();return}
    const file=document.querySelector('#attachment')?.files?.[0];
    if(file && file.size>10*1024*1024){close();showError('Die Datei darf maximal 10 MB groß sein.');return}
    confirmBtn.disabled=true;confirmBtn.textContent='Wird gesendet …';if(submitBtn)submitBtn.disabled=true;
    const data=new FormData(form);data.set('rules','yes');
    try{
      const response=await fetch(form.action,{method:'POST',body:data});
      const result=await response.json().catch(()=>({ok:false,message:'Unbekannte Serverantwort.'}));
      if(!response.ok || !result.ok)throw new Error(result.message||'Die Anfrage konnte nicht gesendet werden.');
      close();
      form.reset();
      form.classList.add('form-sent');
      setTimeout(()=>{form.style.display='none'},260);
      if(successOrder)successOrder.textContent=result.orderId||'—';
      if(successOverlay){successOverlay.hidden=false;requestAnimationFrame(()=>successOverlay.classList.add('open'));document.body.style.overflow='hidden'}
    }catch(err){close();showError(err.message||'Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.');resetButton()}
  });
  successClose?.addEventListener('click',()=>{successOverlay?.classList.remove('open');setTimeout(()=>{if(successOverlay)successOverlay.hidden=true},220);document.body.style.overflow=''});
}

// v5.8 isolated Services / Website-Pakete menu.
(() => {
  const trigger = document.querySelector('.mh-services-trigger');
  const pop = document.getElementById('mh-services-popover');
  if (!trigger || !pop) return;

  const position = () => {
    const r = trigger.getBoundingClientRect();
    const w = Math.min(330, window.innerWidth - 24);
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
    pop.style.width = w + 'px';
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(r.bottom + 8) + 'px';
  };
  const close = () => {
    pop.hidden = true;
    trigger.setAttribute('aria-expanded','false');
  };
  const open = () => {
    position();
    pop.hidden = false;
    trigger.setAttribute('aria-expanded','true');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pop.hidden ? open() : close();
  });

  // Explicit navigation fallback. Normal href remains in place too.
  pop.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const href = link.getAttribute('href');
      close();
      window.location.assign(href);
    });
  });

  document.addEventListener('click', (e) => {
    if (!pop.hidden && !pop.contains(e.target) && !trigger.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (!pop.hidden) position(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) position(); }, {passive:true});
})();

// Zusammenarbeit: separate Anfrage mit derselben E-Mail-Logik wie Projektanfragen.
(() => {
  const form=document.querySelector('#collaboration-form');
  if(!form) return;
  const status=document.querySelector('#collab-status');
  const overlay=document.querySelector('#collab-success');
  const order=document.querySelector('#collab-order-id');
  const close=document.querySelector('#collab-success-close');
  const button=form.querySelector('button[type="submit"]');
  const showError=(msg)=>{if(!status)return;status.className='form-status error';status.innerHTML=`<strong>Bitte prüfen</strong><span>${msg}</span>`;status.hidden=false;status.style.display='grid';status.scrollIntoView({behavior:'smooth',block:'center'})};
  form.addEventListener('submit',async(e)=>{
    e.preventDefault(); if(!form.reportValidity()) return;
    const file=document.querySelector('#collab-attachment')?.files?.[0];
    if(file && file.size>10*1024*1024){showError('Die Datei darf maximal 10 MB groß sein.');return}
    if(status){status.hidden=true;status.style.display='none'}
    button.disabled=true;button.textContent='Wird gesendet …';
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form)});
      const result=await response.json().catch(()=>({ok:false,message:'Unbekannte Serverantwort.'}));
      if(!response.ok||!result.ok) throw new Error(result.message||'Die Anfrage konnte nicht gesendet werden.');
      form.reset(); if(order)order.textContent=result.orderId||'—';
      if(overlay){overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('open'));document.body.style.overflow='hidden'}
    }catch(err){showError(err.message||'Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.')}finally{button.disabled=false;button.textContent='Anfrage senden ↗'}
  });
  close?.addEventListener('click',()=>{overlay?.classList.remove('open');setTimeout(()=>{if(overlay)overlay.hidden=true},220);document.body.style.overflow=''});
})();

// V10.7 — language switching is handled by GTranslate.
// Source language is German and browser-language auto switching is disabled.

// V10.5 — reliable mobile "copy current page link" button inside hamburger menu.
(() => {
  const nav = document.querySelector('.site-header nav');
  if (!nav || nav.querySelector('.mobile-copy-link')) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mobile-copy-link notranslate';
  b.setAttribute('translate','no');
  b.innerHTML = '<span aria-hidden="true">🔗</span><span>Link kopieren</span>';
  nav.appendChild(b);

  async function copyText(text){
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta=document.createElement('textarea');
    ta.value=text; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.opacity='0'; ta.style.pointerEvents='none';
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,99999);
    const ok=document.execCommand('copy'); ta.remove();
    if(!ok) throw new Error('copy failed');
  }

  b.addEventListener('click', async () => {
    const label=b.querySelector('span:last-child');
    try {
      await copyText(location.href);
      b.classList.add('copied'); label.textContent='Link kopiert ✓';
      setTimeout(()=>{b.classList.remove('copied');label.textContent='Link kopieren'},1800);
    } catch (_) {
      // Last-resort mobile fallback: expose the URL for native long-press/copy.
      window.prompt('Link kopieren:', location.href);
    }
  });
})();


// V10.8 — hide translation transitions so visitors never see a wrong language flash.
(() => {
  const html=document.documentElement;
  let settleTimer=0, hardTimer=0;
  const finish=()=>{
    clearTimeout(settleTimer); clearTimeout(hardTimer);
    html.classList.remove('mh-translation-loading');
    document.body?.classList.remove('mh-language-switching');
  };
  const scheduleFinish=(ms=450)=>{ clearTimeout(settleTimer); settleTimer=setTimeout(finish,ms); };

  // Existing translated session: GTranslate restores from its cookie after load.
  if(html.classList.contains('mh-translation-loading')){
    const obs=new MutationObserver(()=>scheduleFinish(420));
    const start=()=>{
      if(!document.body) return;
      obs.observe(document.body,{subtree:true,childList:true,characterData:true});
      scheduleFinish(900);
      hardTimer=setTimeout(()=>{obs.disconnect();finish()},2600);
    };
    document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
  }

  // Manual selector: cover the page before GTranslate starts replacing text.
  document.addEventListener('change',(e)=>{
    const sel=e.target;
    if(!(sel instanceof HTMLSelectElement) || !sel.closest('.gtranslate_wrapper')) return;
    document.body?.classList.add('mh-language-switching');
    const obs=new MutationObserver(()=>scheduleFinish(420));
    if(document.body) obs.observe(document.body,{subtree:true,childList:true,characterData:true});
    scheduleFinish(1000);
    hardTimer=setTimeout(()=>{obs.disconnect();finish()},2600);
  },true);
})();

/* ===== V11.5 LANGUAGE-STABLE HERO =====
   Font geometry is fixed by CSS so translation can change only text, not layout. */
(function(){
  const title=document.querySelector('.hero.hero-v2 h1');
  if(!title) return;
  title.style.removeProperty('font-size');
  title.style.removeProperty('line-height');
})();
