# M.HOLLY V6.4 — Brevo API

Táto verzia už NEPOUŽÍVA Gmail App Password ani SMTP. Objednávky posiela cez Brevo Transactional Email API.

## Render
- Language: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Free plan je na začiatok OK.

## Environment Variables
Na Renderi nastav:
- `BREVO_API_KEY` = API kľúč z Brevo
- `SENDER_EMAIL` = `mholly.development@gmail.com`
- `ADMIN_EMAIL` = `mholly.development@gmail.com`
- `SITE_URL` = verejná URL nového Render Web Service, bez lomky na konci

## Brevo
1. Vytvor bezplatný Brevo účet.
2. Pridaj a over sender `mholly.development@gmail.com` (Brevo pošle overovací mail).
3. V SMTP & API vytvor API key.
4. API key vlož iba do Render Environment Variables — nikdy nie do GitHubu.

Formulár po odoslaní zostáva na webe. Server vytvorí unikátne číslo MH-YYYYMMDD-XXXXXX, pošle adminovi čierno-červenú tabuľku iba s vyplnenými odpoveďami a zákazníkovi branded potvrdenie s rovnakým číslom.
