const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 10000;
const PUBLIC = path.join(__dirname, 'public');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png','image/jpeg','application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('Nur PNG, JPG oder PDF erlaubt.'), ok);
  }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(PUBLIC));

const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const clean = (v='') => String(v).trim();
const orderId = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `MH-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const FIELD_MAP = [
  ['name','Name / Firma'],
  ['email','E-Mail'],
  ['phone','Telefon / WhatsApp'],
  ['branche','Branche / Projektart'],
  ['paket','Gewünschtes Paket'],
  ['type','Art der Website'],
  ['goal','Was soll die Website erreichen?'],
  ['pages','Gewünschte Seiten / Bereiche'],
  ['colors','Farben / Stil'],
  ['deadline','Wunschtermin'],
  ['reference','Beispiel-Websites / Links'],
  ['message','Zusätzliche Informationen']
];

function answers(body, file){
  const rows = FIELD_MAP.map(([key,label]) => ({ label, value: clean(body[key]) })).filter(r => r.value);
  if (file) rows.push({label:'Angehängte Datei', value:file.originalname});
  return rows;
}

function rowsHtml(rows){
  return rows.map((r,i)=>`<tr>
    <td style="padding:15px 16px;border-bottom:1px solid #2b2b30;width:42%;vertical-align:top;background:${i%2?'#0e0e11':'#111115'};color:#ff4a55;font-size:12px;font-weight:800;letter-spacing:.25px">${esc(r.label)}</td>
    <td style="padding:15px 16px;border-bottom:1px solid #2b2b30;vertical-align:top;background:${i%2?'#0e0e11':'#111115'};color:#f2f2f4;font-size:14px;line-height:1.55;white-space:pre-wrap">${esc(r.value)}</td>
  </tr>`).join('');
}

function emailShell({title, intro, id, rows, customer=false}){
  return `<!doctype html><html><body style="margin:0;padding:0;background:#08080a;font-family:Arial,Helvetica,sans-serif;color:#f4f4f5">
  <div style="display:none;max-height:0;overflow:hidden">${esc(title)} – ${esc(id)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#08080a;padding:28px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;background:#0c0c0f;border:1px solid #2d2d33;border-radius:18px;overflow:hidden;box-shadow:0 20px 70px rgba(0,0,0,.45)">
      <tr><td style="height:4px;background:linear-gradient(90deg,#8f0d18,#ff3342,#8f0d18)"></td></tr>
      <tr><td style="padding:28px 28px 16px">
        <div style="font-size:11px;letter-spacing:2px;color:#ff4a55;font-weight:800">M.HOLLY · WEB DESIGN & DEVELOPMENT</div>
        <h1 style="margin:10px 0 8px;font-size:28px;line-height:1.15;color:#fff">${esc(title)}</h1>
        <p style="margin:0;color:#aaaab2;font-size:14px;line-height:1.65">${esc(intro)}</p>
      </td></tr>
      <tr><td style="padding:8px 28px 22px"><div style="display:inline-block;padding:10px 14px;border:1px solid #5c1b22;border-radius:10px;background:#150b0d;color:#fff;font-size:13px"><span style="color:#ff4a55;font-weight:800">BESTELLNUMMER</span>&nbsp;&nbsp;${esc(id)}</div></td></tr>
      <tr><td style="padding:0 28px 28px">
        <table role="table" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;border:1px solid #2d2d33;border-radius:12px;overflow:hidden">
          <tr><th align="left" style="padding:12px 16px;background:#1b0d10;color:#ff5963;font-size:11px;letter-spacing:1px">FRAGE</th><th align="left" style="padding:12px 16px;background:#1b0d10;color:#ff5963;font-size:11px;letter-spacing:1px">ANTWORT</th></tr>
          ${rowsHtml(rows)}
        </table>
      </td></tr>
      ${customer?`<tr><td style="padding:0 28px 26px;color:#94949c;font-size:13px;line-height:1.6">Wir prüfen deine Anfrage und melden uns per E-Mail. Diese Nachricht bestätigt nur den Eingang deiner Anfrage und ist noch keine verbindliche Auftragsbestätigung.</td></tr>`:''}
      <tr><td align="center" style="padding:24px;border-top:1px solid #242429;background:#09090b"><img src="cid:mholly-logo" width="76" height="76" alt="M.HOLLY" style="display:block;border-radius:50%;margin:0 auto 10px"><div style="font-size:12px;font-weight:800;letter-spacing:1.5px;color:#fff">M.HOLLY</div><div style="margin-top:5px;font-size:10px;letter-spacing:1.4px;color:#777780">WEB DESIGN · DEVELOPMENT</div></td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function plainText(title,id,rows){
  return `${title}\nBestellnummer: ${id}\n\n${rows.map(r=>`${r.label}:\n${r.value}`).join('\n\n')}\n\nM.HOLLY – Web Design & Development`;
}

async function brevoSend(payload){
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY fehlt.');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:'POST',
    headers:{'accept':'application/json','content-type':'application/json','api-key':apiKey},
    body:JSON.stringify(payload)
  });
  if (!response.ok){
    const detail = await response.text();
    throw new Error(`Brevo ${response.status}: ${detail}`);
  }
  return response.json();
}

app.post('/api/order', upload.single('attachment'), async (req,res) => {
  try{
    if (clean(req.body.website)) return res.status(200).json({ok:true}); // honeypot
    const required = ['name','email','branche','paket','type','goal'];
    if (required.some(k=>!clean(req.body[k]))) return res.status(400).json({ok:false,message:'Bitte alle Pflichtfelder ausfüllen.'});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(req.body.email))) return res.status(400).json({ok:false,message:'Ungültige E-Mail-Adresse.'});
    if (req.body.privacy !== 'yes' || req.body.rules !== 'yes') return res.status(400).json({ok:false,message:'Bestätigungen fehlen.'});

    const senderEmail = process.env.SENDER_EMAIL || 'mholly.development@gmail.com';
    const admin = process.env.ADMIN_EMAIL || 'mholly.development@gmail.com';
    const siteUrl = (process.env.SITE_URL || '').replace(/\/$/,'');
    if (!process.env.BREVO_API_KEY) return res.status(503).json({ok:false,message:'E-Mail-Versand ist noch nicht konfiguriert.'});

    const id = orderId();
    const rows = answers(req.body, req.file);
    const logoUrl = siteUrl ? `${siteUrl}/assets/mholly-logo.png` : '';
    const shell = (opts) => emailShell(opts).replace(
      '<img src="cid:mholly-logo" width="76" height="76"',
      logoUrl ? `<img src="${esc(logoUrl)}" width="76" height="76"` : '<div style="font-size:22px;font-weight:900;color:#fff">M.HOLLY</div><img src="" width="0" height="0"'
    );

    const adminPayload = {
      sender:{name:'M.HOLLY Bestellung',email:senderEmail},
      to:[{email:admin,name:'M.HOLLY'}],
      replyTo:{email:clean(req.body.email),name:clean(req.body.name)},
      subject:`Neue Bestellung M.HOLLY – #${id}`,
      textContent:plainText('Neue Projektanfrage',id,rows),
      htmlContent:shell({title:'Neue Projektanfrage',intro:'Ein Kunde hat eine neue Anfrage über die M.HOLLY Website gesendet.',id,rows})
    };
    if (req.file){
      adminPayload.attachment=[{name:req.file.originalname,content:req.file.buffer.toString('base64')}];
    }
    await brevoSend(adminPayload);

    await brevoSend({
      sender:{name:'M.HOLLY',email:senderEmail},
      to:[{email:clean(req.body.email),name:clean(req.body.name)}],
      replyTo:{email:admin,name:'M.HOLLY'},
      subject:`Deine Anfrage bei M.HOLLY – #${id}`,
      textContent:plainText('Danke für deine Anfrage',id,rows),
      htmlContent:shell({title:'Danke für deine Anfrage',intro:`Hallo ${clean(req.body.name)}, wir haben deine Projektanfrage erhalten. Unten findest du deine Angaben als Zusammenfassung.`,id,rows,customer:true})
    });

    res.json({ok:true,orderId:id});
  }catch(err){
    console.error('ORDER_MAIL_ERROR', err);
    res.status(500).json({ok:false,message:'Die Anfrage konnte nicht gesendet werden.'});
  }
});

app.use((err,_req,res,_next)=>{
  console.error(err);
  res.status(400).json({ok:false,message:err.message || 'Ungültige Anfrage.'});
});

app.listen(PORT,()=>console.log(`M.HOLLY running on port ${PORT}`));
