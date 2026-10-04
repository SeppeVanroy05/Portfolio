(() => {
  const storage = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {}
    },
  };
  let language = storage.get("language") === "en" ? "en" : "nl";
  function setLanguage(lang) {
    language = lang;
    storage.set("language", lang);
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-nl][data-en]").forEach((el) => {
      el.innerHTML = el.dataset[lang];
    });
    document
      .querySelectorAll("[data-language]")
      .forEach((el) =>
        el.setAttribute("aria-pressed", String(el.dataset.language === lang)),
      );
    document
      .querySelector(".chat-toggle")
      ?.setAttribute(
        "aria-label",
        lang === "nl" ? "Portfolio assistent" : "Portfolio assistant",
      );
    document
      .querySelector(".chat-close")
      ?.setAttribute("aria-label", lang === "nl" ? "Sluiten" : "Close");
    document
      .querySelector("#chat-panel")
      ?.setAttribute(
        "aria-label",
        lang === "nl" ? "Portfolio assistent" : "Portfolio assistant",
      );
    document
      .querySelector("#chat-input")
      ?.setAttribute(
        "placeholder",
        lang === "nl" ? "Typ je vraag…" : "Type your question…",
      );
    document
      .querySelector("#navigation")
      ?.setAttribute(
        "aria-label",
        lang === "nl" ? "Hoofdnavigatie" : "Main navigation",
      );
  }
  document
    .querySelectorAll("[data-language]")
    .forEach((el) =>
      el.addEventListener("click", () => setLanguage(el.dataset.language)),
    );
  setLanguage(language);
  const menu = document.querySelector(".menu-button"),
    nav = document.querySelector("#navigation");
  function closeMenu() {
    menu?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("open");
  }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeChat();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header")) closeMenu();
  });
  // Preserve the existing FormSubmit integration, with clear validation and recovery.
  document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    if (fd.get("_honey") || fd.get("website")) return;
    const status = form.querySelector(".form-status"),
      btn = form.querySelector("[type=submit]");
    if (btn.disabled) return;
    const copy = (nl, en) => (language === "nl" ? nl : en);
    status.textContent = copy(
      "Je bericht wordt verzonden…",
      "Sending your message…",
    );
    btn.disabled = true;
    try {
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch(
          "https://formsubmit.co/ajax/seppe.vanroy@telenet.be",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              name: fd.get("name"),
              email: fd.get("email"),
              message: fd.get("message"),
              subject: fd.get("subject"),
              _subject: "SV-Solutions contact: " + fd.get("subject"),
              _cc: "svsolutions.support@gmail.com",
              _replyto: fd.get("email"),
              _honey: "",
              _captcha: "false",
              _template: "table",
            }),
            signal: controller.signal,
          },
        );
      } finally {
        clearTimeout(timer);
      }
      const result = await response.json();
      if (/activat|confirm.*email|email.*confirm/i.test(result.message || "")) {
        throw new Error("activation");
      }
      if (
        !response.ok ||
        !(result.success === true || result.success === "true")
      )
        throw new Error("send");
      status.textContent = copy(
        "Bericht verzonden. Bedankt! Ik neem contact met je op.",
        "Message sent. Thank you! I’ll get back to you.",
      );
      form.reset();
    } catch {
      status.textContent = copy(
        "Verzenden lukt momenteel niet. Je bericht staat nog klaar.",
        "Sending is unavailable right now. Your message is still here.",
      );
      const link = document.createElement("a");
      link.textContent = copy(" Open je mailapp.", " Open your email app.");
      link.style.textDecoration = "underline";
      link.href =
        "mailto:seppe.vanroy@telenet.be,svsolutions.support@gmail.com?subject=" +
        encodeURIComponent(fd.get("subject")) +
        "&body=" +
        encodeURIComponent(
          fd.get("message") + "\n\n" + fd.get("name") + "\n" + fd.get("email"),
        );
      status.append(link);
    } finally {
      btn.disabled = false;
    }
  });
  });
  const toggle = document.querySelector(".chat-toggle"),
    panel = document.querySelector("#chat-panel"),
    input = document.querySelector("#chat-input"),
    messages = document.querySelector(".chat-messages");
  function closeChat() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }
  toggle?.addEventListener("click", () => {
    if (!panel.hidden) {
      closeChat();
      return;
    }
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  });
  document.querySelector(".chat-close")?.addEventListener("click", closeChat);
  const history = [];
  function addMessage(text, user = false) {
    const p = document.createElement("p");
    p.textContent = text;
    if (user) p.className = "user";
    messages.append(p);
    messages.scrollTop = messages.scrollHeight;
  }
  function fallback(question) {
    const q = question.toLowerCase(),
      nl = language === "nl";
    if (/skolio/.test(q))
      return nl
        ? "Met Skolio bouwt Seppe samen met een team aan een platform voor overzichtelijke communicatie tussen ouders en scholen. Meer info vind je op de Skolio-projectpagina."
        : "Seppe is working with a team on Skolio, a platform for clear communication between parents and schools. See the Skolio project page for more.";
    if (/sv.?solutions|bedrijf|business|company|website/.test(q))
      return nl
        ? "Naast zijn studies runt Seppe SV-Solutions, waarmee hij websites maakt voor bedrijven. Interesse in een website? Stuur gerust een bericht via de contactpagina."
        : "Alongside his studies, Seppe runs SV-Solutions, building websites for companies. Interested in a website? Get in touch through the contact page.";
    if (/mission|zebra/.test(q))
      return nl
        ? "MissionZebra helpt gezinnen met schermtijd, taken en beloningen. Seppe werkt hieraan als medeoprichter / co-owner."
        : "MissionZebra helps families manage screen time, tasks and rewards. Seppe works on it as co-founder / co-owner.";
    if (/contact|mail|linkedin|github/.test(q))
      return nl
        ? "Mail naar seppe.vanroy@telenet.be of gebruik het contactformulier. GitHub en LinkedIn staan onderaan elke pagina."
        : "Email seppe.vanroy@telenet.be or use the contact form. GitHub and LinkedIn are in every page’s footer.";
    if (/skill|vaardig|tech|code/.test(q))
      return nl
        ? "Seppe werkt onder meer met React, .NET, C#, HTML, CSS, JavaScript, Python, SQL en Git. Zijn focus ligt op praktische applicaties, websites en probleemoplossing."
        : "Seppe works with React, .NET, C#, HTML, CSS, JavaScript, Python, SQL and Git, among others. He focuses on practical applications, websites and problem solving.";
    if (/stud|stage|aurubis|experience|ervaring/.test(q))
      return nl
        ? "Seppe studeert Application Development, bouwt graag met React, .NET en C# en deed praktijkervaring op bij Aurubis Olen. Hij zoekt een stageplek waar hij veel kan leren en aan echte applicaties kan meewerken."
        : "Seppe studies Application Development, enjoys building with React, .NET and C# and gained practical experience at Aurubis Olen. He is looking for an internship where he can learn and contribute to real applications.";
    if (/project|werk|work|portfolio/.test(q))
      return nl
        ? "Bekijk Skolio, MissionZebra, K.V.V. Rauw, Poutrel, Aurubis en dit portfolio op de projectenpagina."
        : "Explore Skolio, MissionZebra, K.V.V. Rauw, Poutrel, Aurubis and this portfolio on the Work page.";
    return nl
      ? "Ik kan je helpen met info over Seppe, projecten, skills en contact. Voor andere vragen kun je Seppe rechtstreeks mailen."
      : "I can help with information about Seppe, projects, skills and contact. For other questions, email Seppe directly.";
  }
  document
    .querySelector("#chat-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      const btn = e.target.querySelector("button");
      addMessage(question, true);
      input.value = "";
      btn.disabled = true;
      input.disabled = true;
      let reply;
      try {
        const controller = new AbortController(),
          timer = setTimeout(() => controller.abort(), 12000);
        let r;
        try {
          r = await fetch("api/chat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: question,
              lang: language,
              history: history.slice(-8),
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }
        if (!r.ok) throw new Error("api");
        const data = await r.json();
        if (typeof data.reply !== "string" || !data.reply.trim())
          throw new Error("reply");
        reply = data.reply;
      } catch {
        reply = fallback(question);
      }
      addMessage(reply);
      history.push(
        { role: "user", content: question },
        { role: "assistant", content: reply },
      );
      btn.disabled = false;
      input.disabled = false;
      if (!panel.hidden) input.focus();
    });
})();
// Keep the existing production analytics, without sending local preview traffic.
if (["sv-solutions.be", "www.sv-solutions.be"].includes(location.hostname)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-WJSTMZHYVC");
  const analytics = document.createElement("script");
  analytics.async = true;
  analytics.src = "https://www.googletagmanager.com/gtag/js?id=G-WJSTMZHYVC";
  document.head.append(analytics);
}
