// Services dropdown — click to open, click submenu to navigate reliably.
(function(){
  const menus=[...document.querySelectorAll('.nav-services')];
  const closeAll=(except=null)=>menus.forEach(m=>{
    if(m!==except){m.classList.remove('is-open');m.querySelector('.services-trigger')?.setAttribute('aria-expanded','false');}
  });

  menus.forEach(menu=>{
    const trigger=menu.querySelector('.services-trigger');
    if(!trigger) return;

    trigger.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      const next=!menu.classList.contains('is-open');
      closeAll(menu);
      menu.classList.toggle('is-open',next);
      trigger.setAttribute('aria-expanded', next ? 'true' : 'false');
    });

    menu.querySelectorAll('.services-menu a[data-nav-target]').forEach(link=>{
      link.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        const target=this.getAttribute('data-nav-target') || this.getAttribute('href');
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded','false');
        // Explicit browser navigation avoids any stale dropdown handler intercepting the link.
        window.location.href=target;
      });
    });
  });

  document.addEventListener('click', ()=>closeAll());
  document.addEventListener('keydown', e=>{if(e.key==='Escape') closeAll();});
})();

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

// Projektový formulár: najprv validácia, potom zobrazenie pravidiel, až následne odoslanie.
const form=document.querySelector('#project-form');
const modal=document.querySelector('#rules-modal');
const closeModal=document.querySelectorAll('[data-close-modal]');
const confirmBtn=document.querySelector('#confirm-submit');
if(form && modal && confirmBtn){
  const requestIdField=form.querySelector('[name="Anfrage-ID"]');
  const acceptedAtField=form.querySelector('[name="Zustimmung-Zeitpunkt"]');
  const rulesField=form.querySelector('[name="Bestätigte_Projektregeln"]');
  const startEarlyField=form.querySelector('[name="Vorzeitiger_Leistungsbeginn"]');
  const generateId=()=>`MH-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  if(requestIdField) requestIdField.value=generateId();
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    modal.classList.add('open'); document.body.style.overflow='hidden';
  });
  closeModal.forEach(b=>b.addEventListener('click',()=>{modal.classList.remove('open');document.body.style.overflow=''}));
  modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('open');document.body.style.overflow=''}});
  confirmBtn.addEventListener('click',()=>{
    const ruleCheck=document.querySelector('#rules-confirm');
    if(!ruleCheck?.checked){ruleCheck?.focus();return}
    const now=new Date();
    if(acceptedAtField) acceptedAtField.value=now.toLocaleString('de-DE',{dateStyle:'full',timeStyle:'long'});
    if(rulesField) rulesField.value='JA – Projektablauf, Anzahlung/Abrechnung, Stornierung nach Leistungsbeginn und Datenschutzhinweise im Bestätigungsfenster gelesen und bestätigt.';
    const early=document.querySelector('#early-start');
    if(startEarlyField) startEarlyField.value=early?.checked?'JA – ausdrücklicher Wunsch, vor Ablauf einer ggf. bestehenden Widerrufsfrist mit der Leistung zu beginnen.':'NEIN – kein vorzeitiger Leistungsbeginn angefordert.';
    confirmBtn.disabled=true; confirmBtn.textContent='Wird gesendet …';
    form.submit();
  });
}
