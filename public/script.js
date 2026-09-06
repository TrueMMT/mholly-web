document.querySelectorAll('.menu-btn').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('.site-header nav')?.classList.toggle('open')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Jemné červené častice v pozadí – bez externých knižníc.
const emberLayer=document.querySelector('.embers');
if(emberLayer){
  for(let i=0;i<24;i++){
    const e=document.createElement('i'); e.className='ember';
    e.style.left=`${Math.random()*100}%`; e.style.top=`${70+Math.random()*45}%`;
    e.style.animationDuration=`${14+Math.random()*18}s`; e.style.animationDelay=`-${Math.random()*24}s`;
    emberLayer.appendChild(e);
  }
}

// Balík z URL alebo z tlačidla vložíme automaticky do formulára.
const params=new URLSearchParams(location.search); const packageSelect=document.querySelector('#paket');
if(packageSelect && params.get('paket')) packageSelect.value=params.get('paket');
document.querySelectorAll('[data-package]').forEach(a=>a.addEventListener('click',()=>sessionStorage.setItem('mholly-package',a.dataset.package)));
if(packageSelect && sessionStorage.getItem('mholly-package')){packageSelect.value=sessionStorage.getItem('mholly-package');sessionStorage.removeItem('mholly-package')}

// Projektový formulár: validácia -> pravidlá -> AJAX odoslanie bez opustenia webu.
const form=document.querySelector('#project-form');
const modal=document.querySelector('#rules-modal');
const closeModal=document.querySelectorAll('[data-close-modal]');
const confirmBtn=document.querySelector('#confirm-submit');
const formStatus=document.querySelector('#form-status');
if(form && modal && confirmBtn){
  const requestIdField=form.querySelector('[name="Anfrage-ID"]');
  const acceptedAtField=form.querySelector('[name="Zustimmung-Zeitpunkt"]');
  const rulesField=form.querySelector('[name="Bestätigte_Projektregeln"]');
  const startEarlyField=form.querySelector('[name="Vorzeitiger_Leistungsbeginn"]');
  const replyToField=form.querySelector('[name="_replyto"]');
  const emailCopyField=form.querySelector('[name="E-Mail-Adresse"]');
  const emailField=form.querySelector('[name="email"]');
  const generateId=()=>`MH-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const resetButton=()=>{confirmBtn.disabled=false;confirmBtn.textContent='Bestätigen & Anfrage senden'};
  const showStatus=(type,title,text)=>{
    if(!formStatus) return;
    formStatus.className=`form-status ${type}`;
    formStatus.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    formStatus.hidden=false;
    formStatus.scrollIntoView({behavior:'smooth',block:'center'});
  };
  if(requestIdField) requestIdField.value=generateId();
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    if(formStatus) formStatus.hidden=true;
    modal.classList.add('open'); document.body.style.overflow='hidden';
  });
  closeModal.forEach(b=>b.addEventListener('click',()=>{modal.classList.remove('open');document.body.style.overflow=''}));
  modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('open');document.body.style.overflow=''}});
  confirmBtn.addEventListener('click',async()=>{
    const ruleCheck=document.querySelector('#rules-confirm');
    if(!ruleCheck?.checked){ruleCheck?.focus();return}
    const now=new Date();
    if(acceptedAtField) acceptedAtField.value=now.toLocaleString('de-DE',{dateStyle:'full',timeStyle:'long'});
    if(rulesField) rulesField.value='JA – Projektablauf, Anzahlung/Abrechnung, Stornierung nach Leistungsbeginn und Datenschutzhinweise im Bestätigungsfenster gelesen und bestätigt.';
    const early=document.querySelector('#early-start');
    if(startEarlyField) startEarlyField.value=early?.checked?'JA – ausdrücklicher Wunsch, vor Ablauf einer ggf. bestehenden Widerrufsfrist mit der Leistung zu beginnen.':'NEIN – kein vorzeitiger Leistungsbeginn angefordert.';
    if(replyToField && emailField) replyToField.value=emailField.value;
    if(emailCopyField && emailField) emailCopyField.value=emailField.value;

    confirmBtn.disabled=true; confirmBtn.textContent='Wird gesendet …';
    try{
      const payload=new FormData(form);
      const response=await fetch('https://formsubmit.co/ajax/mholly.development@gmail.com',{
        method:'POST',
        headers:{'Accept':'application/json'},
        body:payload
      });
      let data={};
      try{data=await response.json()}catch(_){ }
      if(!response.ok || data.success===false || data.success==='false') throw new Error(data.message||'Formular konnte nicht gesendet werden.');

      modal.classList.remove('open'); document.body.style.overflow='';
      showStatus('success','✓ Anfrage erfolgreich gesendet','Danke! Deine Projektanfrage wurde an M.HOLLY übermittelt. Du bleibst auf unserer Website. Wir melden uns per E-Mail zurück.');
      form.reset();
      if(requestIdField) requestIdField.value=generateId();
      document.querySelector('#rules-confirm').checked=false;
      if(early) early.checked=false;
    }catch(err){
      modal.classList.remove('open'); document.body.style.overflow='';
      showStatus('error','Anfrage konnte nicht gesendet werden','Bitte versuche es erneut. Falls das Problem bleibt, schreibe direkt an mholly.development@gmail.com.');
      console.error('M.HOLLY form error:',err);
    }finally{resetButton()}
  });
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
