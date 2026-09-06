# M.HOLLY V6.5 — Static + FormSubmit

This version is designed for the existing Render **Static Site**. No Node server, SMTP, Brevo or API key is required.

## What changed
- FormSubmit restored using the already-issued invisible form key.
- Submission posts into a hidden iframe, so the customer stays on the M.HOLLY page.
- Each request gets a unique order number such as `MH-20260906-48372`.
- Owner subject becomes `Neue Bestellung M.HOLLY – <order number>`.
- Email uses FormSubmit's `table` template.
- Only filled optional fields are included; blank optional answers are disabled for submission.
- Human-readable German field labels are used so question and answer are easy to distinguish.
- Customer autoresponse includes the same order number and a copy of the submitted data.
- File upload remains supported (PNG/JPG/PDF, FormSubmit limit 10 MB total).

## Render
Use the existing **Static Site** `mholly-web`. Publish directory: `public`.
No Environment Variables are needed.

## Important FormSubmit limitation
FormSubmit controls the actual HTML email template and sender infrastructure. The site can choose the `table` template and subject, but cannot fully replace that email with a custom red/black M.HOLLY HTML template or force Gmail to show a custom sender address/logo. For that level of email branding, a transactional mail provider/backend is required.
