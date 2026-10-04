const contactCopy = {
  nl: {
    nav: ['Home', 'Over Mij', 'Projecten', 'CV', 'Contact'],
    heroEyebrow: 'Contact',
    heroTitle: 'Laten we iets sterk bouwen',
    heroText: 'Heb je een vraag, stagevoorstel of projectidee? Stuur gerust een bericht en ik antwoord zo snel mogelijk.',
    channelsEyebrow: 'Directe Kanalen',
    channelsTitle: 'Kies de snelste manier om te connecteren',
    emailLabel: 'Email',
    emailAction: 'Stuur E-mail',
    githubAction: 'Bekijk Profiel',
    linkedinAction: 'Connecteer',
    formEyebrow: 'Stuur een bericht',
    formTitle: 'Laat je gegevens achter en ik antwoord via e-mail',
    formText: 'Vertel kort waarvoor je mij wilt contacteren, dan neem ik via e-mail terug contact op.',
    name: 'Naam',
    email: 'E-mail',
    subject: 'Onderwerp',
    message: 'Bericht',
    namePlaceholder: 'Jouw naam',
    emailPlaceholder: 'Jouw e-mail',
    subjectPlaceholder: 'Waarover gaat dit?',
    messagePlaceholder: 'Schrijf je bericht...',
    submit: 'Verstuur bericht',
    asideTitle: 'Rechtstreeks naar inbox',
    asideText: 'Berichten uit dit formulier worden verzonden naar <a href="mailto:seppe.vanroy@telenet.be">seppe.vanroy@telenet.be</a>.',
    asideItems: ['Ideaal voor stages en projectvragen', 'Antwoord meestal op dezelfde dag', 'GitHub en LinkedIn blijven ook beschikbaar'],
    footer: {
      description: 'Tweedejaars Application Development-student met interesse in webontwikkeling, praktische IT-support en duidelijke oplossingen.',
      connect: 'Connecteer',
      copyright: '&copy; 2026 Seppe Vanroy. Alle rechten voorbehouden.',
      socialsLabel: 'Sociale profielen',
      emailLabel: 'Stuur een e-mail naar Seppe',
      githubLabel: 'Open GitHub profiel',
      linkedinLabel: 'Open LinkedIn profiel'
    },
    allFields: 'Vul eerst alle velden correct in.',
    short: 'Naam, onderwerp of bericht is te kort.',
    badEmail: 'Vul een geldig e-mailadres in.',
    sending: 'Bericht wordt verzonden...',
    sent: 'Bericht verzonden. Ik neem snel contact op.',
    fallback: 'Online verzenden lukt even niet. Ik open je mailapp met het bericht ingevuld. Klik daar nog op verzenden.'
  },
  en: {
    nav: ['Home', 'About Me', 'Projects', 'CV', 'Contact'],
    heroEyebrow: 'Contact',
    heroTitle: 'Let us build something strong',
    heroText: 'Have a question, internship proposal, or project idea? Send a message and I will reply as soon as possible.',
    channelsEyebrow: 'Direct Channels',
    channelsTitle: 'Choose the fastest way to connect',
    emailLabel: 'Email',
    emailAction: 'Send Email',
    githubAction: 'View Profile',
    linkedinAction: 'Connect',
    formEyebrow: 'Send a message',
    formTitle: 'Leave your details and I will reply by email',
    formText: 'Briefly tell me why you want to get in touch, and I will reply by email.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Your email',
    subjectPlaceholder: 'What is this about?',
    messagePlaceholder: 'Write your message...',
    submit: 'Send message',
    asideTitle: 'Straight to inbox',
    asideText: 'Messages from this form are sent to <a href="mailto:seppe.vanroy@telenet.be">seppe.vanroy@telenet.be</a>.',
    asideItems: ['Ideal for internships and project questions', 'Usually replies the same day', 'GitHub and LinkedIn remain available too'],
    footer: {
      description: 'Second-year Application Development student with an interest in web development, practical IT support, and clear solutions.',
      connect: 'Connect',
      copyright: '&copy; 2026 Seppe Vanroy. All rights reserved.',
      socialsLabel: 'Social profiles',
      emailLabel: 'Send Seppe an email',
      githubLabel: 'Open GitHub profile',
      linkedinLabel: 'Open LinkedIn profile'
    },
    allFields: 'Please fill in all required fields.',
    short: 'Name, subject, or message is too short.',
    badEmail: 'Please enter a valid email address.',
    sending: 'Sending message...',
    sent: 'Message sent. I will reply soon.',
    fallback: 'Online sending is not available right now. Opening your mail app with the message filled in. Please press send there.'
  }
};

let currentLanguage = localStorage.getItem('language') || 'nl';

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
};

const setHtml = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
};

const setPlaceholder = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('placeholder', value);
};

const setAttribute = (selector, attribute, value) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attribute, value);
};

const applyLanguage = (lang) => {
  currentLanguage = lang === 'en' ? 'en' : 'nl';
  localStorage.setItem('language', currentLanguage);
  document.documentElement.lang = currentLanguage;

  const copy = contactCopy[currentLanguage];
  document.querySelectorAll('.main-nav > a').forEach((link, index) => {
    if (copy.nav[index]) link.textContent = copy.nav[index];
    link.classList.toggle('active', link.getAttribute('href') === 'contact.html');
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLanguage);
  });

  setText('.hub-hero .eyebrow', copy.heroEyebrow);
  setText('.hub-hero h1', copy.heroTitle);
  setText('.hub-hero p:not(.eyebrow)', copy.heroText);
  setText('.hub-grid-wrap > .eyebrow', copy.channelsEyebrow);
  setText('.hub-grid-wrap > h2', copy.channelsTitle);
  setText('.contact-grid .hub-card:nth-child(1) h3', copy.emailLabel);
  setText('.contact-grid .hub-card:nth-child(1) span', copy.emailAction);
  setText('.contact-grid .hub-card:nth-child(2) span', copy.githubAction);
  setText('.contact-grid .hub-card:nth-child(3) span', copy.linkedinAction);
  setText('.contact-form-head .eyebrow', copy.formEyebrow);
  setText('.contact-form-head h2', copy.formTitle);
  setText('.contact-form-head p:not(.eyebrow)', copy.formText);
  setText('.contact-form-grid label:nth-child(1) span', copy.name);
  setText('.contact-form-grid label:nth-child(2) span', copy.email);
  setText('.contact-form > label:nth-of-type(1) span', copy.subject);
  setText('.contact-form > label:nth-of-type(2) span', copy.message);
  setPlaceholder('.contact-form input[name="name"]', copy.namePlaceholder);
  setPlaceholder('.contact-form input[name="email"]', copy.emailPlaceholder);
  setPlaceholder('.contact-form input[name="subject"]', copy.subjectPlaceholder);
  setPlaceholder('.contact-form textarea[name="message"]', copy.messagePlaceholder);
  setText('.contact-form button[type="submit"]', copy.submit);
  setText('.contact-form-aside h3', copy.asideTitle);
  setHtml('.contact-form-aside p', copy.asideText);
  copy.asideItems.forEach((item, index) => {
    setText(`.contact-form-aside li:nth-child(${index + 1})`, item);
  });

  setText('.footer-description', copy.footer.description);
  setText('.footer-connect-label', copy.footer.connect);
  setHtml('.footer-copyright', copy.footer.copyright);
  setText('.footer-links a[href="index.html"]', copy.nav[0]);
  setText('.footer-links a[href="projects.html"]', copy.nav[2]);
  setText('.footer-links a[href="cv.html"]', copy.nav[3]);
  setText('.footer-links a[href="contact.html"]', copy.nav[4]);
  setAttribute('.footer-socials', 'aria-label', copy.footer.socialsLabel);
  setAttribute('.footer-socials a[href^="mailto:"]', 'aria-label', copy.footer.emailLabel);
  setAttribute('.footer-socials a[href*="github.com"]', 'aria-label', copy.footer.githubLabel);
  setAttribute('.footer-socials a[href*="linkedin.com"]', 'aria-label', copy.footer.linkedinLabel);
};

const initReveal = () => {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
};

const initProgress = () => {
  const bar = document.getElementById('aboutProgressBar');
  if (!bar) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = `${Math.min(100, Math.max(0, (window.scrollY / max) * 100)).toFixed(2)}%`;
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  request();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
};

const initContactForm = () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactFormStatus');
  if (!form || !status) return;

  const button = form.querySelector('button[type="submit"]');
  const msg = (key) => contactCopy[currentLanguage][key] || contactCopy.en[key] || '';
  const setStatus = (message, tone = 'info') => {
    status.textContent = message;
    status.classList.remove('is-info', 'is-success', 'is-error');
    status.classList.add(`is-${tone}`);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    const botField = String(data.get('website') || '').trim();

    if (botField) {
      setStatus(msg('sent'), 'success');
      form.reset();
      return;
    }
    if (!name || !email || !subject || !message) return setStatus(msg('allFields'), 'error');
    if (name.length < 2 || subject.length < 3 || message.length < 10) return setStatus(msg('short'), 'error');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setStatus(msg('badEmail'), 'error');

    const fallbackEmail = form.getAttribute('data-fallback-email') || 'seppe.vanroy@telenet.be';
    const fallbackSubject = `Portfolio contact: ${subject}`;
    const fallbackBody = [`Naam: ${name}`, `E-mail: ${email}`, `Onderwerp: ${subject}`, '', 'Bericht:', message].join('\n');
    const fallbackHref = `mailto:${fallbackEmail}?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(fallbackBody)}`;
    const payload = new URLSearchParams({
      name,
      email,
      subject,
      message,
      _subject: fallbackSubject,
      _template: 'table',
      _captcha: 'false'
    });
    const idleLabel = button ? button.textContent : '';
    const endpoint = form.getAttribute('data-endpoint') || form.action;

    if (button) {
      button.disabled = true;
      button.textContent = msg('sending');
    }
    setStatus(msg('sending'), 'info');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: payload
      });
      if (!response.ok) throw new Error('Submit failed');
      setStatus(msg('sent'), 'success');
      form.reset();
    } catch (error) {
      setStatus(msg('fallback'), 'info');
      window.location.href = fallbackHref;
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = idleLabel;
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLanguage);
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });
  initReveal();
  initProgress();
  initContactForm();
});
