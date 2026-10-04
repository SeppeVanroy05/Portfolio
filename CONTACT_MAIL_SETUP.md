# Contactformulieren

De formulieren op Home en Contact gebruiken dezelfde verzendcode in `script.js` en FormSubmit:
- Naar: seppe.vanroy@telenet.be
- CC: svsolutions.support@gmail.com
- Reply-To: het e-mailadres van de bezoeker

Ook zonder JavaScript bevatten de formulieren het CC-adres, de e-mailtemplate en spamval.

FormSubmit kan bij het eerste gebruik een activatiemail sturen. Bevestig deze in de ontvangende mailbox; verstuur daarna opnieuw. Een succesvolle HTTP-reactie bevestigt acceptatie door de maildienst, geen ontvangst in beide inboxen.

Documentatie: https://formsubmit.co/documentation

De alternatieve backend `api/contact.php` gebruikt dezelfde twee ontvangers. De website gebruikt deze backend momenteel niet. Voor gebruik ervan zijn SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS en CONTACT_FROM nodig. Zonder SMTP probeert de backend PHP mail().
