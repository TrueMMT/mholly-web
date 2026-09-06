# M.HOLLY v6.3 — unified update

Obsahuje:
- mobilný responsive rebuild pre celý web,
- 4 balíčky vrátane Commerce / E-Commerce,
- čisté balíčky bez zbytočných tlačidiel pod kartami,
- e-shop doplnený medzi služby a formulár,
- vlastný formulárový backend bez FormSubmit,
- unikátne číslo každej žiadosti/objednávky,
- branded čierno-červený e-mail pre M.HOLLY,
- branded potvrdzovací e-mail zákazníkovi s logom a jeho zhrnutím,
- e-mailová tabuľka obsahuje iba reálne vyplnené otázky a odpovede,
- priložený PNG/JPG/PDF súbor príde M.HOLLY ako príloha,
- zákazník po odoslaní zostáva na webe.

## Dôležité — Render už musí bežať ako Node Web Service
Tento update nepoužíva FormSubmit. E-maily odosiela server priamo cez Gmail účet M.HOLLY.

### Render nastavenie
Build Command:
`npm install`

Start Command:
`npm start`

Environment Variables:
- `SMTP_USER` = `mholly.development@gmail.com`
- `SMTP_APP_PASSWORD` = Google App Password pre tento Gmail účet
- `ADMIN_EMAIL` = `mholly.development@gmail.com`

Súbor `render.yaml` je pripravený tiež.

### Google App Password
Pre Gmail treba mať zapnuté 2-Step Verification a vytvoriť App Password. Tento 16-znakový App Password vlož iba do Render Environment Variable `SMTP_APP_PASSWORD`. Nedávaj ho do GitHubu ani do HTML/JS.

## E-mailový systém
M.HOLLY dostane predmet:
`Neue Bestellung M.HOLLY – #MH-YYYYMMDD-XXXXXX`

Zákazník dostane predmet:
`Deine Anfrage bei M.HOLLY – #MH-YYYYMMDD-XXXXXX`

Číslo generuje server pri každom úspešnom odoslaní, takže zákazníci nedostávajú rovnaké číslo.
