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

// Projektformular: Validierung -> Regeln -> FormSubmit ohne sichtbare Weiterleitung.
const form=document.querySelector('#project-form');
const modal=document.querySelector('#rules-modal');
const closeModal=document.querySelectorAll('[data-close-modal]');
const confirmBtn=document.querySelector('#confirm-submit');
const formStatus=document.querySelector('#form-status');
if(form && modal && confirmBtn){
  let pendingOrderId='';
  const resetButton=()=>{confirmBtn.disabled=false;confirmBtn.textContent='Bestätigen & Anfrage senden'};
  const showStatus=(type,title,text)=>{
    if(!formStatus) return;
    formStatus.className=`form-status ${type}`;
    formStatus.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    formStatus.hidden=false;
    formStatus.scrollIntoView({behavior:'smooth',block:'center'});
  };
  const makeOrderId=()=>{
    const d=new Date();
    const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
    const rand=crypto?.getRandomValues ? Array.from(crypto.getRandomValues(new Uint32Array(1)))[0].toString().slice(-5).padStart(5,'0') : Math.floor(10000+Math.random()*90000);
    return `MH-${y}${m}${day}-${rand}`;
  };
  const restoreDisabled=[];
  const prepareSubmission=()=>{
    pendingOrderId=makeOrderId();
    const orderField=document.querySelector('#order-id-field');
    const subject=document.querySelector('#form-subject');
    const auto=document.querySelector('#form-autoresponse');
    const next=document.querySelector('#form-next');
    if(orderField) orderField.value=pendingOrderId;
    if(subject) subject.value=`Neue Bestellung M.HOLLY – ${pendingOrderId}`;
    if(auto) auto.value=`Vielen Dank für deine Anfrage bei M.HOLLY. Deine Bestellnummer lautet ${pendingOrderId}. Wir haben deine Angaben erhalten und melden uns per E-Mail. Unten findest du eine Kopie deiner übermittelten Angaben.`;
    if(next) next.value=`${location.origin}/form-success.html`;
    // Leere optionale Felder werden für diese Übertragung deaktiviert, damit im Mail nur ausgefüllte Antworten erscheinen.
    restoreDisabled.length=0;
    form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea, select').forEach(el=>{
      if(!el.required && !el.value){ restoreDisabled.push(el); el.disabled=true; }
    });
  };
  const restoreFields=()=>{restoreDisabled.forEach(el=>el.disabled=false);restoreDisabled.length=0};

  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    if(formStatus) formStatus.hidden=true;
    modal.classList.add('open'); document.body.style.overflow='hidden';
  });
  closeModal.forEach(b=>b.addEventListener('click',()=>{modal.classList.remove('open');document.body.style.overflow=''}));
  modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('open');document.body.style.overflow=''}});
  confirmBtn.addEventListener('click',()=>{
    const ruleCheck=document.querySelector('#rules-confirm');
    if(!ruleCheck?.checked){ruleCheck?.focus();return}
    confirmBtn.disabled=true; confirmBtn.textContent='Wird gesendet …';
    prepareSubmission();
    modal.classList.remove('open'); document.body.style.overflow='';
    form.submit();
    // Native iframe-submit: Hauptseite bleibt sichtbar. Erfolg kommt über form-success.html zurück.
    setTimeout(()=>{
      if(confirmBtn.disabled){
        restoreFields(); resetButton();
        showStatus('error','Übertragung dauert länger','Falls keine Bestätigung erscheint, versuche es bitte erneut. Eine Sicherheitsprüfung von FormSubmit kann die Übertragung verzögern.');
      }
    },15000);
  });
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin || e.data?.type!=='mholly-form-success') return;
    restoreFields();
    modal.classList.remove('open'); document.body.style.overflow='';
    showStatus('success','✓ Anfrage erfolgreich gesendet',`Danke! Deine Bestellnummer ist ${pendingOrderId}. Eine Kopie deiner Angaben wurde an deine E-Mail-Adresse gesendet.`);
    form.reset();
    const ruleCheck=document.querySelector('#rules-confirm'); if(ruleCheck) ruleCheck.checked=false;
    const early=document.querySelector('#early-start'); if(early) early.checked=false;
    resetButton();
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
